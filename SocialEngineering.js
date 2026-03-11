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

const { printBanner ,clearScreen } = require('./includes/banner');
const menu = require('./includes/menu');
const phishing = require('./includes/phishing');
const otpBombing = require('./AttackModes/otpBombing');
const emailBombing = require('./AttackModes/emailBombing');
const emailSpoofing = require('./AttackModes/emailSpoofing');

async function main() {
    // show the banner once at startup
    clearScreen();
    printBanner();

    // main loop: display menu and react to choices
    while (true) {
        try {
            const choice = await menu.showMenu();
            switch (choice) {
                case '0':
                    console.log('Goodbye!');
                    process.exit(0);
                    break;
                case '1':
                    await phishing.start();
                    break;
                case '2':
                    await otpBombing.run();
                    break;
                case '3':
                    await emailBombing.run();
                    break;
                case '4':
                    await emailSpoofing.run();
                    break;
                default:
                    console.log('[+] Module not implemented yet');
                    break;
            }
        } catch (err) {
            console.error('Error reading selection:', err);
            process.exit(1);
        }
    }
}

main();
