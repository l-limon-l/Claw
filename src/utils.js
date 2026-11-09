export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const notExpired = q => { const e = new Date(q.config?.expiresAt ?? 0).getTime(); return Number.isNaN(e) || e > Date.now(); };

export function gaussRnd(min, max) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const mid = (min + max) / 2;
    const spread = (max - min) / 6;
    return Math.floor(Math.min(max, Math.max(min, mid + z * spread)));
}

export function humanDelay(baseMin, baseMax, distractChance = 0.12, distractMin = 4000, distractMax = 25000) {
    let delay = gaussRnd(baseMin, baseMax);
    if (Math.random() < distractChance) {
        delay += gaussRnd(distractMin, distractMax);
    }
    return delay;
}

export const sessionDrift = () => 0.8 + Math.random() * 0.6;

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
