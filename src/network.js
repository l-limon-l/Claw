import { RUNTIME, SYS } from './config.js';
import { ErrorHandler, sleep, rnd } from './utils.js';
import { Logger } from './logger.js';
import { Mods } from './discord.js';

export const Traffic = {
    queue: [], processing: false,

    async enqueue(url, body) {
        if (!RUNTIME.running) return Promise.reject(new Error("Stopped"));
        return new Promise((resolve, reject) => {
            this.queue.push({ url, body, resolve, reject, attempts: 0 });
            this.process();
        });
    },

    async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            if (!RUNTIME.running) {
                this.queue.forEach(req => req.reject(new Error("Shutdown")));
                this.queue = [];
                this.processing = false;
                return;
            }

            const req = this.queue.shift();
            try {
                const res = await Mods.API.post({ url: req.url, body: req.body });
                req.resolve(res);
            } catch (e) {
                const err = ErrorHandler.classify(e);

                if (err.isRetryable && req.attempts < SYS.MAX_RETRIES) {
                    req.attempts++;
                    const delay = (e.body?.retry_after ?? Math.pow(2, req.attempts)) * 1000;
                    const isGlobal = e.body?.global === true;

                    Logger.log(`[Network] Retry ${req.attempts}/${SYS.MAX_RETRIES} in ${(delay / 1000).toFixed(1)}s (HTTP ${err.status})`, 'warn');

                    const retryJitter = rnd(200, 800);

                    if (isGlobal) {
                        this.queue.unshift(req);
                        await sleep(delay + retryJitter);
                    } else {
                        setTimeout(() => {
                            if (RUNTIME.running) {
                                this.queue.push(req);
                                this.process();
                            }
                        }, delay + retryJitter);
                    }
                } else if (err.isClientError) {
                    Logger.log(`[Network] HTTP ${err.status}: ${req.url}`, 'debug');
                    req.reject(e);
                } else {
                    Logger.log(`[Network] Request to ${req.url} failed: ${err.message}`, 'err');
                    req.reject(e);
                }
            }

            await sleep(rnd(1200, 1800));
        }
        this.processing = false;
    }
};
