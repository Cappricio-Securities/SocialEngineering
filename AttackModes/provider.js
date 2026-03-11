// APIProvider ported from Python version
// handles selection of SMS/OTP API endpoints from apidata.json or remote source

const fs = require('fs');
const axios = require('axios');

class APIProvider {
    static apiProviders = [];
    static delay = 0;
    static status = true;

    constructor(cc, target, mode, delay = 0) {
        this.cc = cc;
        this.target = target;
        this.mode = mode;
        this.index = -1;
        this.lock = false;     // simple mutex flag

        APIProvider.delay = delay;
        let PROVIDERS;
        try {
            const data = fs.readFileSync('apidata.json', 'utf8');
            PROVIDERS = JSON.parse(data);
        } catch (err) {
            // fall back to remote fetch
            // note: synchronous fetch is not possible so we'll make caller await init
            PROVIDERS = null;
        }

        this._initPromise = (async () => {
            if (!PROVIDERS) {
                try {
                    const resp = await axios.get(
                        'https://github.com/TheSpeedX/TBomb/raw/master/apidata.json',
                        {timeout: 15000}
                    );
                    PROVIDERS = resp.data;
                } catch (err2) {
                    PROVIDERS = {};
                }
            }

            const version = PROVIDERS.version || '2';
            const providers = (PROVIDERS[mode.toLowerCase()] || {});
            APIProvider.apiProviders = providers[cc] ? [...providers[cc]] : [];
            if (APIProvider.apiProviders.length < 10) {
                APIProvider.apiProviders = APIProvider.apiProviders.concat(providers.multi || []);
            }
        })();
    }

    async _ready() {
        return this._initPromise;
    }

    format() {
        let config_dump = JSON.stringify(this.config);
        config_dump = config_dump.replace(/\{target\}/g, this.target);
        config_dump = config_dump.replace(/\{cc\}/g, this.cc);
        this.config = JSON.parse(config_dump);
    }

    selectApi() {
        if (!Array.isArray(APIProvider.apiProviders) || APIProvider.apiProviders.length === 0) {
            this.index = -1;
            return;
        }
        this.index += 1;
        if (this.index >= APIProvider.apiProviders.length) {
            this.index = 0;
        }
        this.config = JSON.parse(JSON.stringify(APIProvider.apiProviders[this.index]));
        const perma_headers = {
            'User-Agent':
                'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0'
        };
        if (this.config.headers) {
            Object.assign(this.config.headers, perma_headers);
        } else {
            this.config.headers = perma_headers;
        }
        this.format();
    }

    remove() {
        if (this.index >= 0 && this.index < APIProvider.apiProviders.length) {
            APIProvider.apiProviders.splice(this.index, 1);
            return true;
        }
        return false;
    }

    async request() {
        this.selectApi();
        if (!this.config || this.index === -1) {
            return null;
        }
        const identifier = (this.config.identifier || '').toLowerCase();
        delete this.config.name;
        this.config.timeout = 30000;
        try {
            const response = await axios(this.config);
            const text = (response.data || '').toString().toLowerCase();
            return text.includes(identifier);
        } catch (err) {
            return false;
        }
    }

    async hit() {
        await this._ready();
        if (!APIProvider.status) return;
        if (APIProvider.delay) {
            await new Promise(r => setTimeout(r, APIProvider.delay));
        }
        // acquire simple lock
        while (this.lock) {
            await new Promise(r => setTimeout(r, 10));
        }
        this.lock = true;
        let response;
        try {
            response = await this.request();
            if (response === false) {
                this.remove();
            } else if (response === null) {
                APIProvider.status = false;
            }
        } catch (err) {
            response = false;
        } finally {
            this.lock = false;
            return response;
        }
    }
}

module.exports = APIProvider;
