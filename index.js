(async () => {
    "use strict";

    const CONFIG = {
        NAME: "Claw",
        VERSION: "v4.6",
        THEME: "#7170ff",
        SUCCESS: "#10b981",
        WARN: "#f59e0b",
        ERR: "#ef4444",
        TRY_TO_CLAIM_REWARD: false,
        HIDE_ACTIVITY: false,
        GAME_CONCURRENCY: 1,
        VIDEO_CONCURRENCY: 2,
        MAX_LOG_ITEMS: 60
    };

    const SYS = Object.freeze({
        MAX_TIME: 25 * 60 * 1000,
        MAX_TASK_FAILURES: 5,
        MAX_RETRIES: 3
    });

    const RUNTIME = {
        running: true,
        cleanups: new Set(),
        selectedQuests: null,
        autoEnroll: true
    };

    const ICONS = Object.freeze({
        BOLT: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.29-.62L14.5 3h1l-1 7h3.5c.58 0 .57.32.29.62L11 21z"/></svg>`,
        VIDEO: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        GAME: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
        STREAM: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
        ACTIVITY: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
        CHECK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
        CLOCK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
        STOP: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>`
    });

    const CONST = Object.freeze({
        ID: "1412491570820812933",
        EVT: Object.freeze({
            HEARTBEAT: "QUESTS_SEND_HEARTBEAT_SUCCESS",
            GAME: "RUNNING_GAMES_CHANGE",
            RPC: "LOCAL_ACTIVITY_UPDATE"
        })
    });

    if (window.clawLock) {
        const existingUI = document.getElementById('claw-ui');
        if (existingUI) existingUI.style.display = 'flex';
        return console.warn(`[${CONFIG.NAME}] Already running.`);
    }
    window.clawLock = true;

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const Storage = {
        save(key, value) {
            try { window.localStorage.setItem(`claw_${key}`, JSON.stringify(value)); }
            catch (e) { console.debug('[Storage] Write failed:', e.message); }
        },
        load(key) {
            try { const v = window.localStorage.getItem(`claw_${key}`); return v ? JSON.parse(v) : null; }
            catch (e) { return null; }
        }
    };

    const ErrorHandler = {
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

    const Logger = {
        root: null, tasks: new Map(),

        init() {
            const oldUI = document.getElementById('claw-ui'); if (oldUI) oldUI.remove();
            const oldStyle = document.getElementById('claw-styles'); if (oldStyle) oldStyle.remove();

            const savedPos = Storage.load('pos') ?? { top: '32px', left: 'auto', right: '20px' };

            const style = document.createElement('style');
            style.id = 'claw-styles';
            style.innerHTML = `
                @keyframes slideIn { from { transform: translateY(-20px) scale(0.985); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; max-height: 140px; margin-bottom: 12px; } to { opacity: 0; max-height: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; border-width: 0; } }
                #claw-ui {
                    --bg-base: #08090a;
                    --bg-panel: #0f1011;
                    --bg-surface: rgba(255, 255, 255, 0.02);
                    --bg-surface-hover: rgba(255, 255, 255, 0.05);
                    --bg-elevated: #191a1b;
                    --text-primary: #f7f8f8;
                    --text-secondary: #d0d6e0;
                    --text-tertiary: #8a8f98;
                    --text-quaternary: #62666d;
                    --border-subtle: rgba(255, 255, 255, 0.05);
                    --border-standard: rgba(255, 255, 255, 0.08);
                    --accent: #5e6ad2;
                    --accent-bright: #7170ff;
                    --accent-hover: #828fff;
                    --accent-red: #ef4444;
                    --success: #10b981;
                    --success-bright: #34d399;
                    --warn: #f59e0b;
                    --warn-bright: #fbbf24;
                    --danger: #ef4444;
                    --danger-bright: #f87171;
                    --radius-sm: 6px;
                    --radius-md: 10px;
                    --radius-pill: 100px;
                    --shadow-panel: 0 0 0 1px rgba(255,255,255,0.06), 0 24px 68px rgba(0,0,0,0.55), 0 8px 22px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04);
                    --shadow-card: 0 0 0 1px rgba(255,255,255,0.05);
                    position: fixed; top: ${savedPos.top}; left: ${savedPos.left}; right: ${savedPos.right}; width: 432px;
                    background: var(--bg-panel);
                    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
                    color: var(--text-secondary); border-radius: 14px;
                    font-family: "Inter Variable", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-feature-settings: "cv01", "ss03", "calt", "kern", "liga"; font-weight: 500; letter-spacing: 0.01em;
                    z-index: 99999; box-shadow: var(--shadow-panel);
                    overflow: hidden; animation: slideIn 0.32s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column;
                }
                #claw-head {
                    padding: 16px 18px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px;
                    border-bottom: 1px solid var(--border-subtle); background: transparent; cursor: grab; user-select: none;
                }
                #claw-head:active { cursor: grabbing; }
                #claw-brand { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
                #claw-brandmark {
                    width: 38px; height: 38px; flex: 0 0 38px; display: flex; align-items: center; justify-content: center;
                    border-radius: 10px; color: var(--accent-bright);
                    background: linear-gradient(180deg, rgba(113, 112, 255, 0.18), rgba(94, 106, 210, 0.06));
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(113, 112, 255, 0.16);
                }
                #claw-brandmark svg { width: 17px; height: 17px; }
                #claw-title-wrap { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
                #claw-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
                #claw-title { color: var(--text-primary); font-size: 15px; font-weight: 510; letter-spacing: 0.01em; line-height: 1.1; }
                #claw-version { color: var(--text-tertiary); font-size: 10px; font-weight: 500; letter-spacing: 0.22px; text-transform: uppercase; }
                #claw-subtitle { color: var(--text-tertiary); font-size: 12px; font-weight: 500; line-height: 1.5; }
                #claw-controls { display: flex; gap: 8px; align-items: center; }
                .ctrl-btn {
                    appearance: none; border: none; background: rgba(255, 255, 255, 0.03);
                    color: var(--text-secondary); border-radius: var(--radius-sm); padding: 7px 10px;
                    display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font: inherit;
                    font-size: 11px; font-weight: 500; line-height: 1; transition: background 0.15s ease, opacity 0.15s ease;
                    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
                }
                .ctrl-btn:hover { background: rgba(255, 255, 255, 0.06); }
                .ctrl-btn svg { width: 13px; height: 13px; }
                .ctrl-stop { color: var(--danger-bright); box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.25); }
                .ctrl-stop:hover { background: rgba(239, 68, 68, 0.08); }
                .ctrl-hide kbd {
                    padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.06);
                    background: rgba(255, 255, 255, 0.04); color: var(--text-quaternary);
                    font-family: "Berkeley Mono", ui-monospace, monospace; font-size: 10px;
                }
                #claw-summary {
                    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px;
                    padding: 12px 16px 14px; border-bottom: 1px solid var(--border-subtle); background: transparent;
                }
                .summary-item {
                    padding: 10px 10px 9px; border-radius: 8px; border: none;
                    background: var(--bg-surface); display: flex; flex-direction: column; gap: 5px; min-width: 0;
                    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
                }
                .summary-label { color: var(--text-quaternary); font-size: 10px; font-weight: 500; line-height: 1; letter-spacing: 0.2px; text-transform: uppercase; }
                .summary-value { color: var(--text-primary); font-size: 16px; font-weight: 510; line-height: 1; letter-spacing: -0.01em; }
                .summary-item.running .summary-value { color: var(--accent-bright); }
                .summary-item.queued .summary-value { color: var(--warn-bright); }
                .summary-item.done .summary-value { color: var(--success-bright); }
                .summary-item.failed .summary-value { color: var(--danger-bright); }
                #claw-body { padding: 14px 12px 14px 14px; max-height: 388px; overflow-y: auto; flex-grow: 1; scrollbar-gutter: stable; }
                #claw-ui ::-webkit-scrollbar { width: 5px; height: 5px; }
                #claw-ui ::-webkit-scrollbar-track { background: transparent; }
                #claw-ui ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.07); border-radius: 999px; }
                #claw-ui ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.13); }

                /* Empty states */
                .claw-empty {
                    min-height: 184px; border: none; border-radius: 10px;
                    background: radial-gradient(ellipse at top right, rgba(113, 112, 255, 0.04), transparent 50%), var(--bg-panel);
                    display: flex; flex-direction: column; justify-content: center; padding: 24px 22px;
                    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
                }
                .claw-empty-eyebrow { color: var(--text-quaternary); font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 10px; }
                .claw-empty-title { color: var(--text-primary); font-size: 18px; font-weight: 510; line-height: 1.2; letter-spacing: -0.01em; margin-bottom: 8px; }
                .claw-empty-copy { color: var(--text-tertiary); font-size: 13px; line-height: 1.6; max-width: 280px; }

                /* Task Cards */
                .task-card {
                    display: flex; gap: 12px; padding: 14px; background: var(--bg-panel);
                    border-radius: 10px; margin-bottom: 10px; border: none;
                    transition: background 0.18s ease, box-shadow 0.18s ease;
                    box-shadow: var(--shadow-card);
                }
                .task-card:hover { background: rgba(255, 255, 255, 0.03); }
                .task-card.active { box-shadow: 0 0 0 1px rgba(113, 112, 255, 0.18); }
                .task-card.done { background: rgba(16, 185, 129, 0.03); box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.16); }
                .task-card.failed { background: rgba(239, 68, 68, 0.03); box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.16); }
                .task-card.pending { background: rgba(245, 158, 11, 0.03); box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.14); }
                .task-card.removing { overflow: hidden; animation: fadeOut 0.45s forwards; }
                .task-icon {
                    width: 42px; height: 42px; min-width: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
                    color: var(--accent-hover); background: linear-gradient(180deg, rgba(113, 112, 255, 0.15), rgba(94, 106, 210, 0.05));
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(113, 112, 255, 0.12);
                }
                .task-icon svg { width: 19px; height: 19px; }
                .task-card.done .task-icon { color: #6ee7b7; background: linear-gradient(180deg, rgba(16, 185, 129, 0.20), rgba(16, 185, 129, 0.06)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(16, 185, 129, 0.16); }
                .task-card.failed .task-icon { color: #fca5a5; background: linear-gradient(180deg, rgba(239, 68, 68, 0.18), rgba(239, 68, 68, 0.06)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(239, 68, 68, 0.14); }
                .task-card.pending .task-icon { color: #fcd34d; background: linear-gradient(180deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.06)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(245, 158, 11, 0.12); }
                .task-info { flex: 1; overflow: hidden; min-width: 0; }
                .task-top { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
                .task-name {
                    font-size: 13px; font-weight: 510; line-height: 1.35; white-space: nowrap; overflow: hidden;
                    text-overflow: ellipsis; color: var(--text-primary); letter-spacing: 0.01em; min-width: 0;
                }
                .task-status {
                    flex: 0 0 auto; color: var(--text-tertiary); font-size: 10px; font-weight: 500; text-transform: uppercase;
                    letter-spacing: 0.2px; background: rgba(255, 255, 255, 0.04); border: none;
                    padding: 4px 7px; border-radius: 6px; line-height: 1;
                }
                .task-card.active .task-status { color: #a5b4fc; background: rgba(113, 112, 255, 0.10); }
                .task-card.done .task-status { color: #a7f3d0; background: rgba(16, 185, 129, 0.10); }
                .task-card.failed .task-status { color: #fecaca; background: rgba(239, 68, 68, 0.10); }
                .task-card.pending .task-status { color: #fde68a; background: rgba(245, 158, 11, 0.10); }
                .task-meta { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; color: var(--text-tertiary); margin-bottom: 10px; line-height: 1.4; }
                .task-kind { color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .progress-text { color: var(--text-secondary); font-weight: 500; font-variant-numeric: tabular-nums; }
                .progress-track {
                    height: 6px; background: rgba(0, 0, 0, 0.35); border-radius: 999px; overflow: hidden;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.03);
                }
                .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-bright)); width: 0%; transition: width 0.32s ease-out; box-shadow: 0 0 10px rgba(113, 112, 255, 0.20); }
                .task-card.done .progress-fill { background: linear-gradient(90deg, #10b981, #34d399); box-shadow: 0 0 8px rgba(16, 185, 129, 0.18); }
                .task-card.failed .progress-fill { background: linear-gradient(90deg, rgba(239, 68, 68, 0.85), rgba(239, 68, 68, 0.50)); box-shadow: none; }
                .task-card.pending .progress-fill { background: linear-gradient(90deg, rgba(245, 158, 11, 0.60), rgba(245, 158, 11, 0.30)); box-shadow: none; }

                /* Buttons */
                .claim-btn {
                    width: 100%; margin-top: 10px; padding: 8px 14px; border-radius: var(--radius-pill);
                    border: none; background: rgba(16, 185, 129, 0.12); color: #d1fae5; font-size: 11px; font-weight: 510;
                    letter-spacing: 0.3px; cursor: pointer; transition: background 0.15s ease;
                    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.28); text-transform: uppercase;
                }
                .claim-btn:hover { background: rgba(16, 185, 129, 0.18); }
                .claim-btn:active { background: rgba(16, 185, 129, 0.22); }

                .goto-btn {
                    width: 100%; margin-top: 10px; padding: 8px 14px; border-radius: var(--radius-pill);
                    border: none; background: rgba(113, 112, 255, 0.15); color: var(--accent-bright); font-size: 11px;
                    font-weight: 510; letter-spacing: 0.3px; cursor: pointer; transition: background 0.15s ease;
                    box-shadow: 0 0 0 1px rgba(113, 112, 255, 0.25); text-transform: uppercase;
                }
                .goto-btn:hover { background: rgba(113, 112, 255, 0.25); }

                /* Quest Picker Menu */
                .quest-pick {
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-surface);
                    border-radius: var(--radius-md); margin-bottom: 8px; cursor: pointer; transition: background 0.15s ease, box-shadow 0.15s ease;
                    box-shadow: var(--shadow-card); border-left: 4px solid var(--accent-bright);
                }
                .quest-pick:hover { background: var(--bg-surface-hover); }
                .quest-pick.hidden { display: none; }
                .quest-pick input[type="checkbox"] { accent-color: var(--accent-bright); width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
                .quest-pick-info { flex: 1; overflow: hidden; }
                .quest-pick-name { font-size: 13px; font-weight: 510; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .quest-pick-meta { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
                .quest-pick-type { font-size: 10px; font-weight: 500; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
                .quest-pick-reward { font-size: 10px; font-weight: 500; }
                .quest-pick-section { font-size: 11px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; margin-top: 4px; }
                .quest-pick-filters { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
                .reward-filter {
                    padding: 6px 12px; border-radius: var(--radius-pill); font-size: 10px; font-weight: 510; cursor: pointer;
                    transition: all 0.15s ease; text-transform: uppercase; letter-spacing: 0.3px; border-width: 1px; border-style: solid;
                    background: transparent; color: var(--text-secondary);
                }
                .reward-filter:not(.off) { background: rgba(255,255,255,0.05); }
                .reward-filter.off { opacity: 0.4; border-color: var(--border-standard) !important; color: var(--text-quaternary) !important; }
                .quest-pick-actions { display: flex; gap: 8px; padding: 12px 0 4px; }
                .quest-pick-btn {
                    flex: 1; padding: 10px; border: none; border-radius: var(--radius-md); color: #fff; font-size: 12px;
                    font-weight: 510; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: opacity 0.2s;
                }
                .quest-pick-btn:hover { opacity: 0.9; }
                .quest-pick-btn.start { background: var(--success); box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.4); }
                .quest-pick-btn.start.disabled { opacity: 0.4; pointer-events: none; }
                .quest-pick-btn.toggle { background: var(--bg-surface); color: var(--text-secondary); border: 1px solid var(--border-standard); }

                .claw-option { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); }
                .claw-option:last-child { border: none; }
                .claw-option-label { font-size: 12px; color: var(--text-secondary); }
                .claw-toggle { position: relative; width: 36px; height: 20px; cursor: pointer; }
                .claw-toggle input { opacity: 0; width: 0; height: 0; }
                .claw-toggle .slider { position: absolute; inset: 0; background: var(--bg-elevated); border: 1px solid var(--border-standard); border-radius: 10px; transition: 0.2s; }
                .claw-toggle .slider::before { content: ''; position: absolute; height: 14px; width: 14px; left: 2px; bottom: 2px; background: var(--text-secondary); border-radius: 50%; transition: 0.2s; }
                .claw-toggle input:checked + .slider { background: var(--success); border-color: var(--success); }
                .claw-toggle input:checked + .slider::before { transform: translateX(16px); background: #fff; }

                /* Logs */
                #claw-logs-wrap { border-top: 1px solid var(--border-subtle); background: rgba(0, 0, 0, 0.12); }
                #claw-logs-head {
                    display: flex; justify-content: space-between; align-items: center; gap: 10px;
                    padding: 12px 14px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); color: var(--text-secondary);
                    font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.22px;
                }
                #claw-log-meta {
                    color: var(--text-quaternary); font-family: "Berkeley Mono", ui-monospace, monospace;
                    text-transform: none; letter-spacing: 0; font-size: 10px;
                }
                #claw-logs {
                    padding: 10px 14px 12px; font-family: "Berkeley Mono", ui-monospace, monospace;
                    font-size: 11px; color: var(--text-tertiary); height: 148px; overflow-y: auto; scroll-behavior: smooth;
                }
                .log-item {
                    display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 10px; line-height: 1.55;
                    padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }
                .log-item:last-of-type { border-bottom: none; }
                .log-ts { color: var(--text-quaternary); font-size: 10px; font-weight: 500; white-space: nowrap; }
                .log-text { min-width: 0; word-break: break-word; }
                .c-info .log-text { color: #a5b4fc; }
                .c-success .log-text { color: #6ee7b7; }
                .c-err .log-text { color: #fca5a5; }
                .c-warn .log-text { color: #fcd34d; }
                .c-debug .log-text { color: var(--text-quaternary); }

                #claw-footer {
                    padding: 10px 14px 12px; border-top: 1px solid rgba(255, 255, 255, 0.04); background: transparent;
                    color: var(--text-quaternary); font-size: 10px; line-height: 1.4; text-align: center;
                }
                #claw-footer strong { color: var(--text-tertiary); font-weight: 500; }
                .dev-btn { color: var(--accent-bright); text-decoration: none; transition: color 0.15s ease, text-shadow 0.15s ease; text-shadow: 0 0 8px rgba(113, 112, 255, 0.25); }
                .dev-btn:hover { color: var(--accent-hover); text-shadow: 0 0 12px rgba(130, 143, 255, 0.4); }
            `;
            document.head.appendChild(style);

            this.root = document.createElement('div');
            this.root.id = 'claw-ui';
            this.root.innerHTML = `
                <div id="claw-head">
                    <div id="claw-brand">
                        <div id="claw-brandmark">${ICONS.BOLT}</div>
                        <div id="claw-title-wrap">
                            <div id="claw-title-row">
                                <span id="claw-title">${CONFIG.NAME}</span>
                                <span id="claw-version">${CONFIG.VERSION}</span>
                            </div>
                            <div id="claw-subtitle">Quest control center</div>
                        </div>
                    </div>
                    <div id="claw-controls">
                        <button class="ctrl-btn ctrl-stop" id="claw-stop" title="Stop script & cleanup" type="button">${ICONS.STOP}<span>Stop</span></button>
                        <button class="ctrl-btn ctrl-hide" id="claw-close" title="Shift + ." type="button"><span>Hide</span><kbd>Shift+.</kbd></button>
                    </div>
                </div>
                <div id="claw-summary"></div>
                <div id="claw-body">${this.getEmptyStateHTML('System', 'Initializing control center', 'Scanning Discord modules and preparing quest runners.')}</div>
                <div id="claw-logs-wrap">
                    <div id="claw-logs-head"><span>Activity Log</span><span id="claw-log-meta">live console</span></div>
                    <div id="claw-logs"></div>
                </div>
                <div id="claw-footer"><strong>Built by</strong> <a href="https://e-z.bio/l_limon_l" target="_blank" class="dev-btn">l_limon_l</a> | <a href="https://fakecrime.bio/l_limon_l" target="_blank" class="dev-btn">More info</a></div>
            `;
            document.body.appendChild(this.root);

            const head = document.getElementById('claw-head');
            let isDragging = false, startX, startY, initialLeft, initialTop;

            head.onmousedown = e => {
                if (e.target.closest?.('.ctrl-btn')) return;
                isDragging = true;
                startX = e.clientX; startY = e.clientY;
                const rect = this.root.getBoundingClientRect();
                initialLeft = rect.left; initialTop = rect.top;
                this.root.style.left = `${initialLeft}px`;
                this.root.style.top = `${initialTop}px`;
                this.root.style.right = 'auto';
                e.preventDefault();
            };

            document.onmousemove = e => {
                if (!isDragging) return;
                this.root.style.left = `${initialLeft + (e.clientX - startX)}px`;
                this.root.style.top = `${initialTop + (e.clientY - startY)}px`;
            };

            document.onmouseup = () => {
                if (isDragging) {
                    isDragging = false;
                    Storage.save('pos', { top: this.root.style.top, left: this.root.style.left, right: 'auto' });
                }
            };

            document.getElementById('claw-body').addEventListener('click', async (e) => {
                if (e.target.classList.contains('goto-btn')) {
                    if (Mods.Router) {
                        Mods.Router.transitionTo('/quest-home');
                    }
                    return;
                }

                const btn = e.target.closest?.('.claim-btn');
                if (!btn) return;

                const questId = btn.getAttribute('data-id');
                const taskData = this.tasks.get(questId);

                btn.innerText = "WAITING...";
                btn.style.opacity = "0.5";
                btn.style.pointerEvents = "none";

                try {
                    const claimRes = await Tasks.claimReward(questId);

                    if (claimRes?.body?.claimed_at) {
                        btn.innerText = "CLAIMED!";
                        btn.style.background = CONFIG.SUCCESS;
                        this.log(`[Claim] Reward for "${taskData?.name || 'Quest'}" claimed successfully!`, 'success');

                        this.updateTask(questId, { ...taskData, status: "CLAIMED", claimable: false });
                        setTimeout(() => this.removeTask(questId), 2000);
                    }
                } catch (err) {
                    btn.innerText = "CLAIM REWARD";
                    btn.style.opacity = "1";
                    btn.style.pointerEvents = "auto";
                    this.log(`[Claim] Action required for "${taskData?.name || 'Quest'}". Check Discord UI for captcha.`, 'warn');
                }
            });

            document.getElementById('claw-close').onclick = () => this.toggle();
            document.getElementById('claw-stop').onclick = () => this.shutdown();
            document.addEventListener('keydown', e => (e.key === '>' || (e.shiftKey && e.key === '.')) && this.toggle());

            try { if (Notification.permission === "default") Notification.requestPermission(); } catch (e) {
                this.log(`[Notification] Request permission failed: ${e.message}`, 'debug');
            }
        },

        toggle() { this.root.style.display = this.root.style.display === 'none' ? 'flex' : 'none'; },

        shutdown() {
            if (!RUNTIME.running) return;
            RUNTIME.running = false;
            this.log("[System] Stopping script & cleaning up...", "warn");

            for (const cleanupFn of RUNTIME.cleanups) {
                try { cleanupFn(); } catch (e) { this.log(`[Cleanup] ${e.message}`, 'debug'); }
            }
            RUNTIME.cleanups.clear();

            Patcher.clean();
            setTimeout(() => {
                const styles = document.getElementById('claw-styles');
                if (styles) styles.remove();
                if (this.root?.parentElement) this.root.remove();
                window.clawLock = false;
            }, 1000);
        },

        getTaskSummary() {
            const counts = { running: 0, queued: 0, done: 0, failed: 0 };
            for (const task of this.tasks.values()) {
                if (task?.failed) counts.failed++;
                else if (task?.done) counts.done++;
                else if (task?.pending) counts.queued++;
                else counts.running++;
            }
            return counts;
        },

        renderSummary() {
            const summary = document.getElementById('claw-summary');
            if (!summary) return;

            const counts = this.getTaskSummary();
            summary.innerHTML = `
                <div class="summary-item running"><span class="summary-label">Running</span><span class="summary-value">${counts.running}</span></div>
                <div class="summary-item queued"><span class="summary-label">Queued</span><span class="summary-value">${counts.queued}</span></div>
                <div class="summary-item done"><span class="summary-label">Done</span><span class="summary-value">${counts.done}</span></div>
                <div class="summary-item failed"><span class="summary-label">Failed</span><span class="summary-value">${counts.failed}</span></div>
            `;
        },

        getEmptyStateHTML(eyebrow, title, description) {
            return `
                <div class="claw-empty">
                    <div class="claw-empty-eyebrow">${eyebrow}</div>
                    <div class="claw-empty-title">${title}</div>
                    <div class="claw-empty-copy">${description}</div>
                </div>
            `;
        },

        getTaskMetaLabel(task) {
            if (task.pending) return 'In Queue';
            if (task.failed) return 'Aborted';

            const labels = {
                WATCH_VIDEO: 'Video quest',
                VIDEO: 'Video quest',
                GAME: 'Desktop game',
                STREAM: 'Desktop stream',
                ACTIVITY: 'Voice activity',
                ACHIEVEMENT: 'Activity achievement'
            };
            return labels[task.type] ?? 'Quest progress';
        },

        updateTask(id, data) {
            const oldData = this.tasks.get(id);
            const isPending = data.status === "PENDING" || data.status === "QUEUE";
            const isDone = data.status === "COMPLETED" || data.status === "CLAIMED";
            const isFailed = data.status === "FAILED";

            const newData = { ...oldData, ...data, done: isDone, pending: isPending, failed: isFailed };
            this.tasks.set(id, newData);

            if (oldData && oldData.status === newData.status && oldData.removing === newData.removing && oldData.claimable === newData.claimable) {
                const card = document.getElementById(`claw-task-${id}`);
                if (card) {
                    const pct = newData.pending || newData.failed ? 0 : Math.min(100, (newData.cur / newData.max) * 100).toFixed(1);

                    const fill = card.querySelector('.progress-fill');
                    if (fill) fill.style.width = `${pct}%`;

                    const unit = newData.type === 'ACHIEVEMENT' ? '' : 's';
                    const progressText = card.querySelector('.progress-text');
                    if (progressText) progressText.textContent = `${Math.floor(newData.cur)} / ${newData.max}${unit}`;

                    return;
                }
            }

            this.render();
        },

        removeTask(id) {
            if (this.tasks.has(id)) {
                this.tasks.get(id).removing = true;
                this.render();
                setTimeout(() => { this.tasks.delete(id); this.render(); }, 500);
            }
        },

        log(msg, type = 'info') {
            const colors = { info: "#a5b4fc", success: "#34d399", warn: "#fbbf24", err: "#ef4444", debug: "#62666d" };
            console.log(`%c[CLAW] %c${msg}`, `color: ${CONFIG.THEME}; font-weight: bold;`, `color: ${colors[type] || colors.info}`);
            try {
                const box = document.getElementById('claw-logs');
                if (box && type !== 'debug') {
                    const el = document.createElement('div');
                    const ts = document.createElement('span');
                    const text = document.createElement('span');

                    el.className = `log-item c-${type}`;
                    ts.className = 'log-ts';
                    text.className = 'log-text';

                    ts.textContent = new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    text.textContent = msg;

                    el.appendChild(ts);
                    el.appendChild(text);
                    box.appendChild(el);
                    box.scrollTop = box.scrollHeight;
                    while (box.children.length > CONFIG.MAX_LOG_ITEMS) box.firstChild.remove();
                }
            } catch (e) { console.debug('[Logger] DOM error:', e.message); }
        },

        render() {
            const body = document.getElementById('claw-body');
            if (!body) return;

            // Только если это не процесс выбора квестов
            if (body.querySelector('#claw-quest-list')) return;

            this.renderSummary();
            if (!this.tasks.size) {
                body.innerHTML = this.getEmptyStateHTML('Queue', 'Waiting for tasks', 'Waiting for the next eligible quest or manual reward action.');
                return;
            }

            const sorted = [...this.tasks.entries()].sort((a, b) => {
                const ta = a[1], tb = b[1];
                if (ta.done !== tb.done) return ta.done ? 1 : -1;
                if (ta.failed !== tb.failed) return ta.failed ? 1 : -1;
                if (ta.pending !== tb.pending) return ta.pending ? 1 : -1;
                if (!ta.done && !ta.pending && !tb.done && !tb.pending) {
                    const pctA = ta.max ? ta.cur / ta.max : 0;
                    const pctB = tb.max ? tb.cur / tb.max : 0;
                    return pctB - pctA;
                }
                return 0;
            });

            body.innerHTML = sorted.map(([id, t]) => {
                const pct = t.pending || t.failed ? 0 : Math.min(100, (t.cur / t.max) * 100).toFixed(1);
                let icon = ICONS.BOLT;
                if (t.done) icon = ICONS.CHECK;
                else if (t.failed) icon = ICONS.STOP;
                else if (t.pending) icon = ICONS.CLOCK;
                else if (t.type === 'VIDEO' || t.type === 'WATCH_VIDEO') icon = ICONS.VIDEO;
                else if (t.type === 'ACHIEVEMENT') icon = ICONS.ACTIVITY;
                else if (t.type?.includes('GAME')) icon = ICONS.GAME;
                else if (t.type?.includes('STREAM')) icon = ICONS.STREAM;

                let statusText = t.status === 'CLAIMED' ? 'CLAIMED' : t.done ? 'DONE' : t.status;
                let progressLabel = this.getTaskMetaLabel(t);
                const unit = t.type === 'ACHIEVEMENT' ? '' : 's';

                let actionBtn = '';

                if (t.claimable) {
                    actionBtn = `<button class="claim-btn" data-id="${id}" type="button">CLAIM REWARD</button>`;
                } else if (t.type === 'ACHIEVEMENT' && t.status === 'RUNNING' && t.actionRequired) {
                    statusText = 'ACTION REQUIRED';
                    progressLabel = 'Please, complete manually';
                    actionBtn = `<button class="goto-btn" type="button">GO TO QUESTS</button>`;
                }

                const stateClass = t.done ? 'done' : t.failed ? 'failed' : t.pending ? 'pending' : 'active';
                const removingClass = t.removing ? 'removing' : '';

                return `<div id="claw-task-${id}" class="task-card ${stateClass} ${removingClass}"><div class="task-icon">${icon}</div><div class="task-info"><div class="task-top"><div class="task-name" title="${t.name}">${t.name}</div><div class="task-status">${statusText}</div></div><div class="task-meta"><span class="task-kind">${progressLabel}</span><span class="progress-text">${Math.floor(t.cur)} / ${t.max}${unit}</span></div><div class="progress-track"><div class="progress-fill" style="width: ${pct}%"></div></div>${actionBtn}</div></div>`;
            }).join('');
        }
    };

    const Traffic = {
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

    let Mods = {};

    const Patcher = {
        games: [], realGames: null, realPID: null, active: false,

        init(Store) {
            if (!Store) return;
            this.realGames = Store.getRunningGames;
            this.realPID = Store.getGameForPID;
        },

        toggle(on) {
            if (on && !this.active) {
                Mods.RunStore.getRunningGames = () => [...this.realGames.call(Mods.RunStore), ...this.games];
                Mods.RunStore.getGameForPID = (pid) => this.games.find(g => g.pid === pid) || this.realPID.call(Mods.RunStore, pid);
                this.active = true;
            } else if (!on && this.active) {
                Mods.RunStore.getRunningGames = this.realGames;
                Mods.RunStore.getGameForPID = this.realPID;
                this.active = false;
            }
        },

        add(g) {
            if (this.games.some(x => x.pid === g.pid)) return;
            this.games.push(g);
            this.toggle(true);
            this.dispatch(g, []);
            this.rpc(g);
        },

        remove(g) {
            const before = this.games.length;
            this.games = this.games.filter(x => x.pid !== g.pid);
            if (this.games.length === before) return;

            this.dispatch([], [g]);
            if (!this.games.length) {
                this.toggle(false);
                this.rpc(null);
            } else {
                this.rpc(this.games[0]);
            }
        },

        dispatch(added, removed) {
            Mods.Dispatcher?.dispatch({
                type: CONST.EVT.GAME,
                added: added ? [added] : [],
                removed: removed ? [removed] : [],
                games: Mods.RunStore.getRunningGames()
            });
        },

        rpc(g) {
            if (CONFIG.HIDE_ACTIVITY && g) return;
            try {
                Mods.Dispatcher?.dispatch({
                    type: CONST.EVT.RPC,
                    socketId: null,
                    pid: g ? g.pid : 9999,
                    activity: g ? {
                        application_id: g.id,
                        name: g.name,
                        type: 0,
                        details: null,
                        state: null,
                        timestamps: { start: g.start },
                        icon: g.icon,
                        assets: null
                    } : null
                });
            } catch (e) {
                Logger.log(`[RPC Cleanup] ${e.message}`, 'debug');
            }
        },

        clean() {
            this.games = [];
            this.toggle(false);
            this.rpc(null);
        }
    };

    const Tasks = {
        skipped: new Set(),

        sanitize(name) { return name.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, " "); },

        detectType(cfg, applicationId) {
            const taskKeys = Object.keys(cfg.tasks);
            const typeMap = [
                { key: "PLAY", type: "GAME" },
                { key: "STREAM", type: "STREAM" },
                { key: "VIDEO", type: "WATCH_VIDEO" },
                { key: "ACHIEVEMENT_IN_ACTIVITY", type: "ACHIEVEMENT" },
                { key: "ACTIVITY", type: "ACTIVITY" }
            ];

            for (const { key, type } of typeMap) {
                const keyName = taskKeys.find(k => k.includes(key));
                if (keyName) return { type, keyName, target: cfg.tasks[keyName]?.target ?? 0 };
            }

            if (applicationId) {
                return { type: "GAME", keyName: "PLAY_ON_DESKTOP", target: cfg.tasks[taskKeys[0]]?.target ?? 0 };
            }

            return null;
        },

        async fetchGameData(appId, appName) {
            try {
                const res = await Mods.API.get({ url: `/applications/public?application_ids=${appId}` });
                const appData = res?.body?.[0];
                const exeEntry = appData?.executables?.find(x => x.os === "win32");
                const rawExe = exeEntry ? exeEntry.name.replace(">", "") : `${this.sanitize(appName)}.exe`;
                const cleanName = this.sanitize(appData?.name || appName);

                return {
                    name: appData?.name || appName,
                    icon: appData?.icon,
                    exeName: rawExe,
                    cmdLine: `C:\\Program Files\\${cleanName}\\${rawExe}`,
                    exePath: `c:/program files/${cleanName.toLowerCase()}/${rawExe}`,
                    id: appId
                };
            } catch (e) {
                Logger.log(`[FetchGame] Fallback for ${appName}: ${e?.message ?? e}`, 'debug');
                const cleanName = this.sanitize(appName);
                const safeExe = `${cleanName.replace(/\s+/g, "")}.exe`;
                return {
                    name: appName, exeName: safeExe,
                    cmdLine: `C:\\Program Files\\${cleanName}\\${safeExe}`,
                    exePath: `c:/program files/${cleanName.toLowerCase()}/${safeExe}`,
                    id: appId
                };
            }
        },

        async claimReward(questId) {
            return await Mods.API.post({
                url: `/quests/${questId}/claim-reward`,
                body: { platform: 0, location: 11, is_targeted: false, metadata_raw: null, metadata_sealed: null, traffic_metadata_raw: null, traffic_metadata_sealed: null }
            });
        },

        failTask(q, t, reason) {
            const currentProgress = Logger.tasks.get(q.id)?.cur ?? 0;
            Logger.updateTask(q.id, { name: t.name, type: t.type, cur: currentProgress, max: t.target, status: "FAILED" });
            Logger.log(`[Task] Aborted "${t.name}": ${reason}`, 'err');
            Tasks.skipped.add(q.id);
            setTimeout(() => Logger.removeTask(q.id), 2000);
        },

        async VIDEO(q, t, s) {
            let cur = s?.progress?.[t.keyName]?.value ?? s?.progress?.[t.type]?.value ?? 0;
            let failCount = 0;

            Logger.updateTask(q.id, { name: t.name, type: "VIDEO", cur, max: t.target, status: "RUNNING" });

            const startTime = Date.now();
            let calls = 0;

            if (cur === 0) {
                await sleep(rnd(200, 350));
                cur = 0.2 + (Math.random() * 0.05);
                try {
                    await Traffic.enqueue(`/quests/${q.id}/video-progress`, { timestamp: Number(cur.toFixed(6)) });
                    calls++;
                } catch(e) {Logger.log(`[Video] Initial ping failed: ${e.message}`, 'debug');}
            }

            while (cur < t.target && RUNTIME.running) {
                const delayMs = rnd(7000, 9500);
                await sleep(delayMs);

                const elapsedSec = (delayMs / 1000) + (Math.random() * 0.02 - 0.01);
                cur += elapsedSec;

                const payloadTs = Number(Math.min(t.target, cur).toFixed(6));

                try {
                    const r = await Traffic.enqueue(`/quests/${q.id}/video-progress`, { timestamp: payloadTs });
                    calls++;
                    const serverVal = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.WATCH_VIDEO?.value;
                    if (serverVal > cur) cur = Math.min(t.target, serverVal);
                    if (r?.body?.completed_at) break;
                    failCount = 0;
                } catch (e) {
                    failCount++;
                    const err = ErrorHandler.classify(e);
                    if (err.isClientError) {
                        Logger.log(`[Task] Video quest unavailable (HTTP ${err.status}). Skipping.`, 'warn');
                        return Tasks.failTask(q, t, `Client Error ${err.status}`);
                    }
                    if (failCount >= SYS.MAX_TASK_FAILURES) {
                        return Tasks.failTask(q, t, 'Too many network failures');
                    }
                    Logger.log(`[Task] VIDEO progress failed (${failCount}/${SYS.MAX_TASK_FAILURES}): ${err.message}`, 'debug');
                }

                Logger.updateTask(q.id, { name: t.name, type: "VIDEO", cur, max: t.target, status: "RUNNING" });

                if (Date.now() - startTime > SYS.MAX_TIME) {
                    return Tasks.failTask(q, t, 'Timeout exceeded');
                }
            }
            if (RUNTIME.running) {
                Logger.log(`[Task] VIDEO "${t.name}" done in ${calls} API calls`, 'debug');
                Tasks.finish(q, t);
            }
        },

        GAME(q, t, s) { return Tasks.generic(q, t, "GAME", "PLAY_ON_DESKTOP", s); },
        STREAM(q, t, s) { return Tasks.generic(q, t, "STREAM", "STREAM_ON_DESKTOP", s); },

        async generic(q, t, type, key, s) {
            if (!RUNTIME.running) return;
            const gameData = await this.fetchGameData(t.appId, t.name);

            return new Promise(resolve => {
                const pid = rnd(2500, 12500) * 4;
                const game = {
                    id: gameData.id, name: gameData.name, icon: gameData.icon,
                    pid, pidPath: [pid], processName: gameData.name, start: Date.now(),
                    exeName: gameData.exeName, exePath: gameData.exePath, cmdLine: gameData.cmdLine,
                    executables: [{ os: 'win32', name: gameData.exeName, is_launcher: false }],
                    windowHandle: 0, fullscreenType: 0, overlay: true, sandboxed: false,
                    hidden: false, isLauncher: false
                };

                let cleanupHook;
                let cleaned = false;
                let safetyTimer;

                if (type === "STREAM") {
                    const real = Mods.StreamStore?.getStreamerActiveStreamMetadata;
                    if (Mods.StreamStore) {
                        Mods.StreamStore.getStreamerActiveStreamMetadata = () => ({ id: gameData.id, pid, sourceName: gameData.name });
                    }
                    cleanupHook = () => { if (Mods.StreamStore && real) Mods.StreamStore.getStreamerActiveStreamMetadata = real; };
                } else {
                    Patcher.add(game);
                    cleanupHook = () => Patcher.remove(game);
                }

                Logger.updateTask(q.id, { name: t.name, type, cur: 0, max: t.target, status: "RUNNING" });
                Logger.log(`[Task] Started ${type}: ${gameData.name}`, 'info');

                const finish = () => {
                    if (cleaned) return;
                    cleaned = true;
                    clearTimeout(safetyTimer);
                    try { cleanupHook(); } catch (e) { Logger.log(`[Task] Cleanup: ${e.message}`, 'debug'); }
                    try { Mods.Dispatcher?.unsubscribe(CONST.EVT.HEARTBEAT, check); } catch (e) {
                        Logger.log(`[Dispatcher] Unsubscribe failed: ${e.message}`, 'debug');
                    }
                    RUNTIME.cleanups.delete(finish);
                };

                safetyTimer = setTimeout(() => {
                    if (RUNTIME.running) Tasks.failTask(q, t, 'Timeout exceeded (25m)');
                    finish();
                    resolve();
                }, SYS.MAX_TIME);

                const check = (d) => {
                    if (!RUNTIME.running) { finish(); resolve(); return; }
                    if (d?.questId !== q.id) return;

                    const prog = d.userStatus?.progress?.[key]?.value ?? d.userStatus?.streamProgressSeconds ?? 0;
                    Logger.updateTask(q.id, { name: t.name, type, cur: prog, max: t.target, status: "RUNNING" });

                    if (prog >= t.target) {
                        finish();
                        Tasks.finish(q, t);
                        resolve();
                    }
                };

                Mods.Dispatcher?.subscribe(CONST.EVT.HEARTBEAT, check);
                RUNTIME.cleanups.add(finish);
            });
        },

        async ACHIEVEMENT(q, t) {
            Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur: 0, max: t.target, status: "RUNNING" });

            let chan = null;
            try {
                chan = Mods.ChanStore?.getSortedPrivateChannels()?.[0]?.id
                    ?? Object.values(Mods.GuildChanStore?.getAllGuilds() ?? {}).find(g => g?.VOCAL?.length)?.VOCAL?.[0]?.channel?.id;
            } catch (e) { Logger.log(`[Achievement] Channel lookup: ${e.message}`, 'debug'); }

            if (chan) {
                Logger.log(`[Task] Attempting heartbeat spoofing for "${t.name}"...`, 'info');
                const key = `call:${chan}:${rnd(1000, 9999)}`;
                let cur = 0;
                let failCount = 0;

                while (cur < t.target && RUNTIME.running) {
                    try {
                        const r = await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: false });
                        cur = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.ACHIEVEMENT_IN_ACTIVITY?.value ?? cur;
                        Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur, max: t.target, status: "RUNNING" });
                        failCount = 0;

                        if (cur >= t.target) {
                            try { await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: true }); }
                            catch (_) { }
                            break;
                        }
                    } catch (e) {
                        failCount++;
                        const err = ErrorHandler.classify(e);
                        if (err.isClientError) {
                            Logger.log(`[Achievement] Heartbeat rejected (HTTP ${err.status}). Falling back to passive mode.`, 'warn');
                            break;
                        }
                        if (failCount >= SYS.MAX_TASK_FAILURES) {
                            Logger.log(`[Achievement] Too many failures. Falling back to passive mode.`, 'warn');
                            break;
                        }
                    }
                    await sleep(rnd(19000, 22000));
                }

                if (cur >= t.target && RUNTIME.running) return Tasks.finish(q, t);
            }

            if (!RUNTIME.running) return;
            Logger.log(`[Task] Action required: Join Activity to earn "${t.name}"`, 'warn');
            Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur: 0, max: t.target, status: "RUNNING", actionRequired: true });

            return new Promise(resolve => {
                let cleaned = false;
                let safetyTimer;

                const finish = () => {
                    if (cleaned) return;
                    cleaned = true;
                    clearTimeout(safetyTimer);
                    try { Mods.Dispatcher?.unsubscribe(CONST.EVT.HEARTBEAT, check); } catch (e) { }
                    RUNTIME.cleanups.delete(finish);
                };

                safetyTimer = setTimeout(() => {
                    if (RUNTIME.running) Tasks.failTask(q, t, 'Timeout - achievement not earned');
                    finish();
                    resolve();
                }, SYS.MAX_TIME);

                const check = (d) => {
                    if (!RUNTIME.running) { finish(); resolve(); return; }
                    if (d?.questId !== q.id) return;

                    const prog = d.userStatus?.progress?.ACHIEVEMENT_IN_ACTIVITY?.value ?? 0;
                    Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur: prog, max: t.target, status: "RUNNING" });

                    if (prog >= t.target) {
                        finish();
                        Tasks.finish(q, t);
                        resolve();
                    }
                };

                Mods.Dispatcher?.subscribe(CONST.EVT.HEARTBEAT, check);
                RUNTIME.cleanups.add(finish);
            });
        },

        async ACTIVITY(q, t) {
            let chan = null;
            try {
                chan = Mods.ChanStore?.getSortedPrivateChannels()?.[0]?.id
                    ?? Object.values(Mods.GuildChanStore?.getAllGuilds() ?? {}).find(g => g?.VOCAL?.length)?.VOCAL?.[0]?.channel?.id;
            } catch (e) {
                Logger.log(`[Task] ACTIVITY channel lookup error: ${e.message}`, 'debug');
            }

            if (!chan) {
                return Tasks.failTask(q, t, 'No voice channel found');
            }

            const key = `call:${chan}:${rnd(1000, 9999)}`;
            let cur = 0;
            let failCount = 0;
            Logger.updateTask(q.id, { name: t.name, type: "ACTIVITY", cur, max: t.target, status: "RUNNING" });

            const startTime = Date.now();

            while (cur < t.target && RUNTIME.running) {
                try {
                    const r = await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: false });
                    cur = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.PLAY_ACTIVITY?.value ?? cur + 20;
                    Logger.updateTask(q.id, { name: t.name, type: "ACTIVITY", cur, max: t.target, status: "RUNNING" });
                    failCount = 0;
                    if (cur >= t.target) {
                        try { await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: true }); }
                        catch (e) { Logger.log(`[ACTIVITY] Final heartbeat failed: ${e?.message}`, 'debug'); }
                        break;
                    }
                } catch (e) {
                    failCount++;
                    const err = ErrorHandler.classify(e);
                    if (err.isClientError) {
                        Logger.log(`[Task] Activity quest unavailable (HTTP ${err.status}). Skipping.`, 'warn');
                        return Tasks.failTask(q, t, `Client Error ${err.status}`);
                    }
                    if (failCount >= SYS.MAX_TASK_FAILURES) {
                        return Tasks.failTask(q, t, 'Too many network failures');
                    }
                    Logger.log(`[Task] ACTIVITY heartbeat failed (${failCount}/${SYS.MAX_TASK_FAILURES}): ${err.message}`, 'debug');
                }

                if (Date.now() - startTime > SYS.MAX_TIME) {
                    return Tasks.failTask(q, t, 'Timeout exceeded');
                }
                await sleep(rnd(19000, 22000));
            }
            if (RUNTIME.running && cur >= t.target) Tasks.finish(q, t);
        },

        async finish(q, t) {
            Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "COMPLETED" });
            Logger.log(`[Task] Completed "${t.name}"!`, 'success');

            try {
                if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
                    new Notification("Claw: Quest Completed", { body: t.name, icon: "https://cdn.discordapp.com/emojis/1120042457007792168.webp", tag: `claw-${q.id}` });
                }
            } catch (e) { Logger.log(`[Notification] ${e.message}`, 'debug'); }

            if (CONFIG.TRY_TO_CLAIM_REWARD) {
                try {
                    await sleep(rnd(2500, 6000));
                    if (!RUNTIME.running) return;

                    const claimRes = await this.claimReward(q.id);

                    if (claimRes?.body?.claimed_at) {
                        Logger.log(`[Claim] Reward for "${t.name}" claimed automatically!`, 'success');
                        Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "CLAIMED" });
                        setTimeout(() => Logger.removeTask(q.id), 2000);
                        return;
                    }
                } catch (e) {
                    const needsCaptcha = e?.body?.captcha_key || e?.body?.captcha_sitekey;
                    if (needsCaptcha) {
                        Logger.log(`[Claim] Captcha required for "${t.name}". Use UI button.`, 'warn');
                    } else {
                        Logger.log(`[Claim] Auto-claim failed for "${t.name}": ${e?.body?.message ?? e?.message}`, 'err');
                    }
                }
            }

            Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "COMPLETED", claimable: true, questId: q.id });
        }
    };

    function loadModules() {
        try {
            if (typeof webpackChunkdiscord_app === 'undefined') {
                throw new Error("Webpack chunk not found - is this running inside Discord?");
            }

            const req = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]); webpackChunkdiscord_app.pop();
            const modules = Object.values(req.c);

            function findStore(storeName) {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp || typeof exp !== 'object') continue;
                        for (const key of Object.keys(exp)) {
                            const prop = exp[key];
                            if (prop && typeof prop === 'object'
                                && prop.__proto__?.constructor?.displayName === storeName) {
                                return prop;
                            }
                        }
                    } catch { }
                }
                return undefined;
            }

            function findDispatcher() {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp || typeof exp !== 'object') continue;
                        for (const key of Object.keys(exp)) {
                            const prop = exp[key];
                            if (prop && prop._subscriptions
                                && typeof prop.subscribe === 'function'
                                && typeof prop.dispatch === 'function'
                                && typeof prop.__proto__?.flushWaitQueue === 'function') {
                                return prop;
                            }
                        }
                    } catch { }
                }
                return undefined;
            }

            function findAPI() {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp || typeof exp !== 'object') continue;
                        for (const key of Object.keys(exp)) {
                            const prop = exp[key];
                            if (prop && typeof prop.get === 'function'
                                && typeof prop.post === 'function'
                                && typeof prop.del === 'function'
                                && !prop._dispatcher) {
                                return prop;
                            }
                        }
                    } catch { }
                }
                return undefined;
            }

            function findRouter() {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp) continue;

                        for (const prop of Object.values(exp)) {
                            if (typeof prop === 'function' && prop.toString().includes('transitionTo -')) {
                                return { transitionTo: prop };
                            }
                        }
                    } catch { }
                }
                return undefined;
            }

            const found = {
                QuestStore:     findStore('QuestStore'),
                RunStore:       findStore('RunningGameStore'),
                StreamStore:    findStore('ApplicationStreamingStore'),
                ChanStore:      findStore('ChannelStore'),
                GuildChanStore: findStore('GuildChannelStore'),
                Dispatcher:     findDispatcher(),
                API:            findAPI(),
                Router:         findRouter()
            };

            const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
            const missing = required.filter(k => !found[k]);
            if (missing.length > 0) throw new Error(`Core modules not found: ${missing.join(', ')}`);

            const optional = ['StreamStore', 'ChanStore', 'GuildChanStore', 'Router'];
            optional.forEach(k => { if (!found[k]) Logger.log(`[System] Optional module '${k}' not found. Features may be limited.`, 'warn'); });

            Mods = found;
            Patcher.init(Mods.RunStore);
            return true;
        } catch (e) {
            Logger.log(`[System] Module loading error: ${e.message ?? e}`, 'err');
            console.error(e);
            return false;
        }
    }

    async function runConcurrent(tasks, limit) {
        const executing = new Set();

        for (const task of tasks) {
            if (!RUNTIME.running) break;

            const p = task().finally(() => executing.delete(p));
            executing.add(p);

            await sleep(rnd(1500, 4000));

            if (executing.size >= limit) {
                await Promise.race(executing);
            }
        }

        return Promise.allSettled(executing);
    }

    const REWARD_META = { 1: { label: "In-Game Item", color: "var(--warn-bright)" }, 3: { label: "Avatar Decoration", color: "var(--accent-bright)" }, 4: { label: "Orbs", color: "var(--success-bright)" } };
    const REWARD_FALLBACK = { label: "Other", color: "var(--text-tertiary)" };

    function showQuestPicker(quests) {
        return new Promise(resolve => {
            const body = document.getElementById('claw-body');
            const incomplete = quests.filter(q =>
                !q.userStatus?.completedAt
                && new Date(q.config?.expiresAt).getTime() > Date.now()
                && q.id !== CONST.ID
            );

            if (!incomplete.length) return resolve({ selected: null, options: {} });

            const items = incomplete.map(q => {
                const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
                const td = cfg?.tasks ? Tasks.detectType(cfg, q.config?.application?.id) : null;
                const rw = q.config?.rewardsConfig?.rewards?.[0];
                return {
                    id: q.id,
                    name: q.config?.messages?.questName ?? "Unknown Quest",
                    type: td ? (td.type === "WATCH_VIDEO" ? "VIDEO" : td.type) : "UNKNOWN",
                    rt: rw?.type ?? 0,
                    reward: rw?.messages?.name ?? "Unknown"
                };
            });

            const rewardTypes = [...new Set(items.map(q => q.rt))].sort();
            const meta = rt => REWARD_META[rt] ?? REWARD_FALLBACK;

            body.innerHTML = `
                <div style="padding: 6px 4px 0;">
                    <div class="quest-pick-section">Filter by reward</div>
                    <div class="quest-pick-filters">
                        ${rewardTypes.map(rt => {
                            const m = meta(rt);
                            return `<button class="reward-filter" data-rt="${rt}" style="border-color:${m.color};color:${m.color};">${m.label} (${items.filter(q => q.rt === rt).length})</button>`;
                        }).join('')}
                    </div>
                    <div id="claw-quest-list" style="max-height: 180px; overflow-y: auto; padding-right: 8px;">
                        ${items.map(q => {
                            const c = meta(q.rt).color;
                            return `<label class="quest-pick" style="border-left-color:${c};" data-rt="${q.rt}">
                                <input type="checkbox" checked data-qid="${q.id}">
                                <div class="quest-pick-info">
                                    <div class="quest-pick-name">${q.name}</div>
                                    <div class="quest-pick-meta">
                                        <span class="quest-pick-type">${q.type}</span>
                                        <span class="quest-pick-reward" style="color:${c};">${q.reward}</span>
                                    </div>
                                </div>
                            </label>`;
                        }).join('')}
                    </div>
                    <div style="padding: 8px 0 2px;">
                        <div class="quest-pick-section">Options</div>
                        <div class="claw-option">
                            <span class="claw-option-label">Auto-enroll in quests</span>
                            <label class="claw-toggle"><input type="checkbox" id="opt-enroll" checked><span class="slider"></span></label>
                        </div>
                        <div class="claw-option">
                            <span class="claw-option-label">Auto-claim rewards</span>
                            <label class="claw-toggle"><input type="checkbox" id="opt-claim"><span class="slider"></span></label>
                        </div>
                    </div>
                    <div class="quest-pick-actions">
                        <button class="quest-pick-btn toggle" id="claw-toggle-all">DESELECT ALL</button>
                        <button class="quest-pick-btn start" id="claw-start-btn">${ICONS.BOLT} START (${items.length})</button>
                    </div>
                </div>
            `;

            const $ = sel => body.querySelector(sel);
            const $$ = sel => body.querySelectorAll(sel);

            const syncStartBtn = () => {
                const n = $$('input[data-qid]:checked').length;
                const btn = $('#claw-start-btn');
                btn.innerHTML = `${ICONS.BOLT} START (${n})`;
                btn.classList.toggle('disabled', n === 0);
            };

            $$('input[data-qid]').forEach(cb => cb.addEventListener('change', syncStartBtn));

            const filters = Object.fromEntries(rewardTypes.map(rt => [rt, true]));
            $$('.reward-filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    const rt = Number(btn.dataset.rt);
                    filters[rt] = !filters[rt];
                    btn.classList.toggle('off', !filters[rt]);
                    $$(`.quest-pick[data-rt="${rt}"]`).forEach(card => {
                        card.classList.toggle('hidden', !filters[rt]);
                        card.querySelector('input').checked = filters[rt];
                    });
                    syncStartBtn();
                });
            });

            let allOn = true;
            $('#claw-toggle-all').addEventListener('click', () => {
                allOn = !allOn;
                $$('.quest-pick').forEach(c => { c.classList.toggle('hidden', !allOn); c.querySelector('input').checked = allOn; });
                $$('.reward-filter').forEach(b => { filters[Number(b.dataset.rt)] = allOn; b.classList.toggle('off', !allOn); });
                $('#claw-toggle-all').textContent = allOn ? 'DESELECT ALL' : 'SELECT ALL';
                syncStartBtn();
            });

            $('#claw-start-btn').addEventListener('click', () => {
                const selected = new Set();
                $$('input[data-qid]:checked').forEach(cb => selected.add(cb.dataset.qid));
                const options = {
                    autoEnroll: $('#opt-enroll').checked,
                    autoClaim: $('#opt-claim').checked
                };
                body.innerHTML = Logger.getEmptyStateHTML('System', 'Starting up...', 'Preparing selected quests.');
                resolve({ selected, options });
            });
        });
    }

    async function main() {
        Logger.init();
        if (!loadModules()) return Logger.log('[System] Failed to load Discord modules. Aborting.', 'err');

        const getQuests = () => {
            const q = Mods.QuestStore.quests;
            return q instanceof Map ? [...q.values()] : Object.values(q);
        };

        const { selected, options } = await showQuestPicker(getQuests());
        if (!RUNTIME.running) return;

        if (selected !== null) {
            RUNTIME.selectedQuests = selected;
            CONFIG.TRY_TO_CLAIM_REWARD = options.autoClaim;
            RUNTIME.autoEnroll = options.autoEnroll;
            Logger.log(`[System] ${selected.size} quest(s) selected. Auto-enroll: ${options.autoEnroll ? 'ON' : 'OFF'}, Auto-claim: ${options.autoClaim ? 'ON' : 'OFF'}`, 'info');
        }

        let loopCount = 1;

        while (RUNTIME.running) {
            try {
                Logger.log(`[Cycle] Starting loop #${loopCount}...`, 'info');

                const quests = getQuests();

                const active = quests.filter(q =>
                    !q.userStatus?.completedAt
                    && new Date(q.config?.expiresAt).getTime() > Date.now()
                    && q.id !== CONST.ID
                    && !Tasks.skipped.has(q.id)
                    && (!RUNTIME.selectedQuests || RUNTIME.selectedQuests.has(q.id))
                );

                if (!active.length) { Logger.log('[System] All available quests are completed!', 'success'); break; }

                const queues = { video: [], game: [] };

                active.forEach(q => {
                    try {
                        const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
                        if (!cfg?.tasks || typeof cfg.tasks !== 'object') {
                            Logger.log(`[Quest] ${q.id} has invalid task config. Skipping.`, 'warn');
                            return;
                        }

                        const typeData = Tasks.detectType(cfg, q.config?.application?.id);
                        if (!typeData) {
                            Logger.log(`[Quest] Unknown task type: ${q.config?.messages?.questName ?? q.id}`, 'warn');
                            return;
                        }

                        const { type, keyName, target } = typeData;
                        if (target <= 0) {
                            Logger.log(`[Quest] Invalid target (${target}) for ${q.id}. Skipping.`, 'warn');
                            return;
                        }

                        const tInfo = {
                            id: q.id,
                            appId: q.config?.application?.id ?? 0,
                            name: q.config?.messages?.questName ?? "Unknown Quest",
                            target,
                            type,
                            keyName
                        };

                        if (Logger.tasks.has(q.id) && Logger.tasks.get(q.id).status === "RUNNING") return;

                        Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "QUEUE" });

                        const taskFunc = async () => {
                            if (!q.userStatus?.enrolledAt) {
                                if (RUNTIME.autoEnroll === false) {
                                    Logger.log(`[Enroll] Skipped "${tInfo.name}" (auto-enroll disabled).`, 'debug');
                                    return;
                                }
                                Logger.log(`[Enroll] Accepting quest: ${tInfo.name}`, 'info');
                                try {
                                    await Traffic.enqueue(`/quests/${q.id}/enroll`, { location: 11, is_targeted: false });
                                    await sleep(rnd(800, 1500));
                                } catch (e) {
                                    const err = ErrorHandler.classify(e);
                                    if (ErrorHandler.isSkippableQuest(e)) {
                                        Tasks.skipped.add(q.id);
                                        Logger.log(`[Enroll] ${tInfo.name} unavailable (${err.status}). Skipping.`, 'warn');
                                    } else {
                                        Logger.log(`[Enroll] Failed for ${tInfo.name}: ${err.message}`, 'err');
                                    }
                                    return Tasks.failTask(q, tInfo, `Enrollment failed`);
                                }
                            }

                            if (type === "WATCH_VIDEO") return Tasks.VIDEO(q, tInfo, q.userStatus);
                            if (type === "ACHIEVEMENT") return Tasks.ACHIEVEMENT(q, tInfo);
                            const runner = type === "STREAM" ? Tasks.STREAM : (type === "ACTIVITY" ? Tasks.ACTIVITY : Tasks.GAME);
                            return runner(q, tInfo, q.userStatus);
                        };

                        if (type === "WATCH_VIDEO") queues.video.push(taskFunc);
                        else queues.game.push(taskFunc);
                    } catch (e) {
                        Logger.log(`[Quest] Error processing ${q.id}: ${e.message}`, 'err');
                    }
                });

                const totalTasks = queues.video.length + queues.game.length;

                if (totalTasks > 0) {
                    Logger.log(`[Cycle] Processing: ${queues.video.length} videos, ${queues.game.length} games.`, 'info');
                    const pGames = runConcurrent(queues.game, CONFIG.GAME_CONCURRENCY);
                    const pVideos = runConcurrent(queues.video, CONFIG.VIDEO_CONCURRENCY);
                    await Promise.all([pGames, pVideos]);
                } else {
                    if (active.length === 0) { Logger.log('[System] All available quests are completed!', 'success'); break; }
                    else await sleep(rnd(4000, 6000));
                }

                if (!RUNTIME.running) break;
                Logger.log(`[Cycle] Loop #${loopCount} complete. Waiting before rescan...`, 'info');
                await sleep(rnd(2500, 4500));
                loopCount++;

            } catch (cycleError) {
                Logger.log(`[Cycle] Error in loop #${loopCount}: ${cycleError?.message ?? cycleError}`, 'err');
                console.error(cycleError);
                await sleep(3000);
                loopCount++;
            }
        }

        Logger.shutdown();
    }

    main().catch(e => {
        const msg = e?.message ?? e?.toString?.() ?? "Unknown fatal error";
        console.error('[Claw Fatal]', e);
        try { Logger.log(`[System] FATAL: ${msg}`, 'err'); } catch (_) { }
        Logger.shutdown();

        setTimeout(() => { window.clawLock = false; }, 1500);
    });
})();
