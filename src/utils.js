export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const Storage = {
    save(key, value) {
        try { window.localStorage.setItem(`claw_${key}`, JSON.stringify(value)); }
        catch (e) { console.debug('[Storage] Write failed:', e.message); }
    },
    load(key) {
        try { const v = window.localStorage.getItem(`claw_${key}`); return v ? JSON.parse(v) : null; }
        catch (e) { return null; }
    }
};

export const ErrorHandler = {
    RETRYABLE: new Set([429, 500, 502, 503, 504, 408]),
    CLIENT_ERRORS: new Set([400, 403, 404, 409, 410]),

    classify(error) {
        const status = error?.status ?? error?.statusCode;
        return {
            isRetryable: this.RETRYABLE.has(status),
            isClientError: this.CLIENT_ERRORS.has(status),
            status,
            message: error?.message ?? error?.body?.message ?? `HTTP ${status ?? 'UNKNOWN'}`
        };
    },

    isSkippableQuest(error) {
        const status = error?.status;
        return status === 404 || status === 403 || status === 410;
    }
};
