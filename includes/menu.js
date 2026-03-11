// displays the main menu and prompts user for a numeric selection

const readline = require('readline');
const ui = require('./banner');

function askQuestion(prompt) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(prompt, (ans) => {
            rl.close();
            resolve(ans.trim());
        });
    });
}

function showMenu() {
    ui.showMainMenu();
    return askQuestion('👉 Select an option: ');
}

module.exports = { showMenu };
