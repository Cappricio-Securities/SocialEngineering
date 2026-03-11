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
