// JavaScript port of Python email spoofing tool
// includes SPF check and remote POST to PHP endpoint

const readline = require('readline');
const chalk = require('chalk');
const ui = require('../includes/banner');
const dns = require('dns');
const axios = require('axios');
const os = require('os');
const db = require('../includes/dbgateway');

// simple prompt helper, supports autotest similar to other modules
let _testQueue = [];

function askQuestion(prompt) {
    if (_testQueue.length) {
        const answer = _testQueue.shift();
        process.stdout.write(prompt + answer + os.EOL);
        return Promise.resolve(answer.trim());
    }
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(prompt, ans => {
            rl.close();
            resolve(ans.trim());
        });
    });
}

function emailBanner() {
    ui.clearScreen();
    ui.printBanner();
    console.log(chalk.red('📧 Fake Email'));
}

function inputInstructions() {
   console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${chalk.red('Instructions')}                                          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ${chalk.white('👉 Enter sender Email Id (e.g. admin@email.com)  ')}     ┃
┃ ${chalk.white('👉 Enter recipient Email Id (e.g. victim@email.com) ')}  ┃
┃ ${chalk.white('👉 Enter subject')}                                      ┃
┃ ${chalk.white('👉 Enter body')}                                         ┃
┃ ${chalk.white('❌ Enter ')}${chalk.red("'x'")}${chalk.white(' to exit anytime')}                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
}

async function getEmail(prompt) {
    while (true) {
        const email = await askQuestion(prompt);
        if (email.toLowerCase() === 'x') { ui.clearScreen(); ui.printBanner(); return 'exit'; }
        if (/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/.test(email)) {
            return email;
        }
        console.log(chalk.red('❌ Invalid email format. Please enter a valid email address.'));
    }
}

function getSubject() {
    return askQuestion('✏️ Enter subject: ');
}

function getBody() {
    return askQuestion('📝 Enter body: ');
}

// SPF check similar to Python version
async function checkSpf(domainOrEmail) {
    let domain = domainOrEmail;
    if (domain.includes('@')) {
        domain = domain.split('@').pop().trim();
    }
    try {
        const records = await dns.promises.resolveTxt(domain);
        for (const rec of records) {
            const txt = rec.join('').toLowerCase();
            if (txt.includes('v=spf1')) {
                console.log(chalk.green(`✅ SPF Record found for ${domain}: ${txt}`));
                if (txt.includes('all') && !txt.includes('~all') && !txt.includes('-all')) {
                    console.log(chalk.yellow(`⚠️ Weak SPF policy found for ${domain}.`));
                    return 'Vulnerable to spoofing';
                }
                return 'Secure';
            }
        }
        console.log(chalk.yellow(`⚠️ No SPF record found in TXT records for ${domain}.`));
        return 'Vulnerable to spoofing';
    } catch (e) {
        if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') {
            console.log(chalk.red(`❌ No TXT records found for ${domain}.`));
            return 'Vulnerable to spoofing';
        }
        console.log(chalk.red(`❌ Error checking SPF for ${domain}: ${e.message}`));
        return 'Error';
    }
}

function getDeviceId() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
                return net.mac;
            }
        }
    }
    return `${Date.now()}`;
}

async function sendSpoofedEmail(fakeFrom, toEmail, subject, body) {
    const url = 'https://cappriciosec.com/api/social-engineer.php';
    try {
        const resp = await axios.post(url, {
            from: fakeFrom,
            to: toEmail,
            subject,
            body
        }, {
            headers: {
                'Content-Type': 'application/json',
                'social-engineer': getDeviceId()
            }
        });
        console.log(chalk.green(`✅ Email sent successfully. Response: ${resp.data.message || 'No message'}`));
        return resp.data;
    } catch (err) {
        console.error('❌ Failed to send request:', err.message);
        return null;
    }
}

async function run() {
    emailBanner();
    inputInstructions();

    const fakeFrom = await getEmail('📧 Enter sender email (type x to exit): ');
    if (fakeFrom === 'exit') { ui.clearScreen(); ui.printBanner(); return; }
    const toEmail = await getEmail('📧 Enter recipient email (type x to exit): ');
    if (toEmail === 'exit') { ui.clearScreen(); ui.printBanner(); return; }
    const subject = await getSubject();
    const body = await getBody();

    // show spf status
    await checkSpf(fakeFrom);

    const result = await sendSpoofedEmail(fakeFrom, toEmail, subject, body);
   

    // log to database
    try {
        db.logEmailSpoof({
            datetime: new Date().toISOString(),
            from: fakeFrom,
            to: toEmail,
            subject,
            status: result ? 'sent' : 'failed'
        });
    } catch (_) {}

    await askQuestion('\n🔙 Enter 0 to return to the main menu: ');
    ui.clearScreen();
    ui.printBanner();
}

module.exports = { run };

if (require.main === module) {
    (async () => {
        await run();
    })();
}
