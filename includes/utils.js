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

// miscellaneous utility helpers used across modules

function spinner(text, duration = 5000) {
    return new Promise((resolve) => {
        const frames = ['|', '/', '-', '\\'];
        let i = 0;
        const iv = setInterval(() => {
            process.stdout.write(`\r${text} ${frames[i++ % frames.length]}`);
        }, 100);
        setTimeout(() => {
            clearInterval(iv);
            process.stdout.write('\r');
            resolve();
        }, duration);
    });
}

function clear() {
    process.stdout.write('\x1Bc');
}

module.exports = {
    spinner,
    clear
};
