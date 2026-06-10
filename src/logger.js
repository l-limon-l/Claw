import { CONFIG, SYS, RUNTIME, ICONS } from './config.js';
import { Storage } from './utils.js';
import { Patcher, Mods } from './discord.js';
import { Tasks } from './quests.js';

export const Logger = {
    root: null, tasks: new Map(), tickerId: null, animatedTasks: new Set(),

    init() {
        const oldUI = document.getElementById('claw-ui'); if (oldUI) oldUI.remove();
        const oldStyle = document.getElementById('claw-styles'); if (oldStyle) oldStyle.remove();

        const savedPos = Storage.load('pos') ?? { top: '32px', left: 'auto', right: '20px' };

        const style = document.createElement('style');
        style.id = 'claw-styles';
        style.innerHTML = `
            @keyframes slideIn { from { transform: translateY(-20px) scale(0.985); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; max-height: 140px; margin-bottom: 12px; } to { opacity: 0; max-height: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; border-width: 0; } }
            @keyframes popIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes slideRight { 0% { opacity: 0; transform: translateX(-10px); } 100% { opacity: 1; transform: translateX(0); } }
            @keyframes flipInX { 0% { opacity: 0; transform: perspective(400px) rotateX(15deg) translateY(10px); } 100% { opacity: 1; transform: perspective(400px) rotateX(0deg) translateY(0); } }
            #claw-ui {
                --bg-base: #08090a;
                --bg-panel: rgba(10, 11, 14, 0.65);
                --bg-surface: rgba(255, 255, 255, 0.03);
                --bg-surface-hover: rgba(255, 255, 255, 0.06);
                --bg-elevated: rgba(25, 26, 27, 0.8);
                --text-primary: #ffffff;
                --text-secondary: #e2e8f0;
                --text-tertiary: #94a3b8;
                --text-quaternary: #64748b;
                --border-subtle: rgba(255, 255, 255, 0.05);
                --border-standard: rgba(255, 255, 255, 0.08);
                --accent: #6366f1;
                --accent-bright: #818cf8;
                --accent-hover: #a5b4fc;
                --accent-red: #ef4444;
                --success: #10b981;
                --success-bright: #34d399;
                --warn: #f59e0b;
                --warn-bright: #fbbf24;
                --danger: #ef4444;
                --danger-bright: #f87171;
                --radius-sm: 8px;
                --radius-md: 12px;
                --radius-pill: 100px;
                --shadow-panel: 0 0 0 1px rgba(255,255,255,0.05), 0 32px 84px rgba(0,0,0,0.65), 0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
                --shadow-card: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.2);
                position: fixed; top: ${savedPos.top}; left: ${savedPos.left}; right: ${savedPos.right}; width: 440px;
                background: var(--bg-panel);
                backdrop-filter: blur(32px) saturate(180%); -webkit-backdrop-filter: blur(32px) saturate(180%);
                color: var(--text-secondary); border-radius: 16px;
                font-family: "Inter Variable", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-feature-settings: "cv01", "ss03", "calt", "kern", "liga"; font-weight: 500; letter-spacing: 0.01em;
                z-index: 99999; box-shadow: var(--shadow-panel);
                overflow: hidden; animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column;
            }
            #claw-head {
                padding: 18px 20px 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 14px;
                border-bottom: 1px solid var(--border-subtle); background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%); cursor: grab; user-select: none;
            }
            #claw-head:active { cursor: grabbing; }
            #claw-brand { display: flex; align-items: flex-start; gap: 14px; min-width: 0; }
            #claw-brandmark {
                width: 42px; height: 42px; flex: 0 0 42px; display: flex; align-items: center; justify-content: center;
                border-radius: 12px; color: #fff;
                background: linear-gradient(135deg, #6366f1, #a855f7);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255,255,255,0.1);
            }
            #claw-brandmark svg { width: 20px; height: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
            #claw-title-wrap { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
            #claw-title-row { display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap; }
            #claw-title { color: var(--text-primary); font-size: 16px; font-weight: 600; letter-spacing: 0.01em; line-height: 1.1; text-shadow: 0 2px 8px rgba(255,255,255,0.15); }
            #claw-version { color: var(--accent-bright); background: rgba(99, 102, 241, 0.15); padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; border: 1px solid rgba(99, 102, 241, 0.3); }
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
                display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
                padding: 14px 20px 16px; border-bottom: 1px solid var(--border-subtle); background: transparent;
            }
            .summary-item {
                padding: 12px 10px; border-radius: 10px; border: none;
                background: var(--bg-surface); display: flex; flex-direction: column; gap: 6px; min-width: 0;
                box-shadow: var(--shadow-card); transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.25s ease, box-shadow 0.25s ease;
                animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
            }
            .summary-item:nth-child(1) { animation-delay: 0.05s; }
            .summary-item:nth-child(2) { animation-delay: 0.1s; }
            .summary-item:nth-child(3) { animation-delay: 0.15s; }
            .summary-item:nth-child(4) { animation-delay: 0.2s; }
            .summary-item:hover {
                transform: translateY(-2px) scale(1.02); background: var(--bg-surface-hover);
                box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.3);
            }
            .summary-label { color: var(--text-tertiary); font-size: 10px; font-weight: 600; line-height: 1; letter-spacing: 0.5px; text-transform: uppercase; }
            .summary-value { color: var(--text-primary); font-size: 18px; font-weight: 600; line-height: 1; letter-spacing: -0.01em; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
            .summary-item.running .summary-value { color: var(--accent-bright); text-shadow: 0 2px 12px rgba(129, 140, 248, 0.4); }
            .summary-item.queued .summary-value { color: var(--warn-bright); text-shadow: 0 2px 12px rgba(251, 191, 36, 0.4); }
            .summary-item.done .summary-value { color: var(--success-bright); text-shadow: 0 2px 12px rgba(52, 211, 153, 0.4); }
            .summary-item.failed .summary-value { color: var(--danger-bright); text-shadow: 0 2px 12px rgba(248, 113, 113, 0.4); }
            #claw-body { padding: 14px 12px 14px 14px; max-height: 388px; overflow-y: auto; flex-grow: 1; scrollbar-gutter: stable; transition: opacity 0.3s ease, transform 0.3s ease; }
            #claw-body.fade-out { opacity: 0; transform: scale(0.97); }
            #claw-ui ::-webkit-scrollbar { width: 5px; height: 5px; }
            #claw-ui ::-webkit-scrollbar-track { background: transparent; }
            #claw-ui ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.07); border-radius: 999px; }
            #claw-ui ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.13); }

            .claw-empty {
                min-height: 184px; border: none; border-radius: 10px;
                background: radial-gradient(ellipse at top right, rgba(113, 112, 255, 0.04), transparent 50%), var(--bg-panel);
                display: flex; flex-direction: column; justify-content: center; padding: 24px 22px;
                box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
                animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .claw-empty-eyebrow { color: var(--text-quaternary); font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 10px; }
            .claw-empty-title { color: var(--text-primary); font-size: 18px; font-weight: 510; line-height: 1.2; letter-spacing: -0.01em; margin-bottom: 8px; }
            .claw-empty-copy { color: var(--text-tertiary); font-size: 13px; line-height: 1.6; max-width: 280px; }

            .task-card {
                display: flex; gap: 14px; padding: 16px; background: rgba(255,255,255,0.02);
                border-radius: 14px; margin-bottom: 12px; border: none;
                transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease, box-shadow 0.3s ease;
                box-shadow: var(--shadow-card);
            }
            .task-card.animate-in { animation: flipInX 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .task-card:hover { background: rgba(255,255,255,0.04); transform: translateX(3px); box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.25); }
            .task-card.active { box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(99, 102, 241, 0.15); background: rgba(99, 102, 241, 0.05); }
            .task-card.done { background: rgba(16, 185, 129, 0.03); box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.16); }
            .task-card.failed { background: rgba(239, 68, 68, 0.03); box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.16); }
            .task-card.pending { background: rgba(245, 158, 11, 0.03); box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.14); }
            .task-card.removing { overflow: hidden; animation: fadeOut 0.45s forwards; }
            .task-icon {
                width: 44px; height: 44px; min-width: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
                color: #fff; background: linear-gradient(135deg, #6366f1, #a855f7);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(99, 102, 241, 0.35);
            }
            .task-icon svg { width: 20px; height: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
            .task-card.done .task-icon { background: linear-gradient(135deg, #10b981, #059669); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(16, 185, 129, 0.35); }
            .task-card.failed .task-icon { background: linear-gradient(135deg, #ef4444, #b91c1c); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(239, 68, 68, 0.35); }
            .task-card.pending .task-icon { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(245, 158, 11, 0.35); }
            .task-info { flex: 1; overflow: hidden; min-width: 0; }
            .task-top { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
            .task-name {
                font-size: 14px; font-weight: 600; line-height: 1.35; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; color: var(--text-primary); letter-spacing: 0.01em; min-width: 0;
            }
            .task-status {
                flex: 0 0 auto; color: var(--text-tertiary); font-size: 10px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.3px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.05);
                padding: 4px 8px; border-radius: 6px; line-height: 1;
            }
            .task-card.active .task-status { color: #a5b4fc; background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.25); }
            .task-card.done .task-status { color: #a7f3d0; background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.25); }
            .task-card.failed .task-status { color: #fecaca; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.25); }
            .task-card.pending .task-status { color: #fde68a; background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.25); }
            .task-meta { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px; line-height: 1.4; font-weight: 500; }
            .task-kind { color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .progress-text { color: var(--text-secondary); font-weight: 600; font-variant-numeric: tabular-nums; }
            .progress-track {
                height: 8px; background: rgba(0, 0, 0, 0.4); border-radius: 999px; overflow: hidden;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.04);
            }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); width: 0%; transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 0 12px rgba(168, 85, 247, 0.5); }
            .task-card.done .progress-fill { background: linear-gradient(90deg, #10b981, #059669); box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
            .task-card.failed .progress-fill { background: linear-gradient(90deg, rgba(239, 68, 68, 0.85), rgba(239, 68, 68, 0.50)); box-shadow: none; }
            .task-card.pending .progress-fill { background: linear-gradient(90deg, rgba(245, 158, 11, 0.60), rgba(245, 158, 11, 0.30)); box-shadow: none; }

            .claim-btn {
                width: 100%; margin-top: 10px; padding: 8px 14px; border-radius: var(--radius-pill);
                border: none; background: rgba(16, 185, 129, 0.12); color: #d1fae5; font-size: 11px; font-weight: 510;
                letter-spacing: 0.3px; cursor: pointer; transition: background 0.15s ease;
                box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.28); text-transform: uppercase;
            }
            .claim-btn:hover:not(:disabled) { background: rgba(16, 185, 129, 0.18); }
            .claim-btn:active:not(:disabled) { background: rgba(16, 185, 129, 0.22); }
            .claim-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .claim-btn.failed { background: rgba(239, 68, 68, 0.12); color: #fecaca; box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.28); }

            .goto-btn {
                width: 100%; margin-top: 10px; padding: 8px 14px; border-radius: var(--radius-pill);
                border: none; background: rgba(113, 112, 255, 0.15); color: var(--accent-bright); font-size: 11px;
                font-weight: 510; letter-spacing: 0.3px; cursor: pointer; transition: background 0.15s ease;
                box-shadow: 0 0 0 1px rgba(113, 112, 255, 0.25); text-transform: uppercase;
            }
            .goto-btn:hover { background: rgba(113, 112, 255, 0.25); }

            .quest-pick {
                display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-surface);
                border-radius: var(--radius-md); margin-bottom: 8px; cursor: pointer; transition: background 0.15s ease, box-shadow 0.15s ease;
                box-shadow: var(--shadow-card); border-left: 4px solid var(--accent-bright);
                animation: popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards;
            }
            .quest-pick:nth-child(1) { animation-delay: 0.05s; }
            .quest-pick:nth-child(2) { animation-delay: 0.10s; }
            .quest-pick:nth-child(3) { animation-delay: 0.15s; }
            .quest-pick:nth-child(4) { animation-delay: 0.20s; }
            .quest-pick:nth-child(5) { animation-delay: 0.25s; }
            .quest-pick:nth-child(n+6) { animation-delay: 0.30s; }
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
                flex: 1; padding: 12px; border: none; border-radius: 12px; color: #fff; font-size: 12px;
                font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;
                transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, opacity 0.2s ease;
                display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .quest-pick-btn:hover:not(.disabled) { transform: translateY(-2px); }
            .quest-pick-btn:active:not(.disabled) { transform: translateY(1px); }
            .quest-pick-btn.start {
                background: linear-gradient(135deg, #10b981, #059669);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(16, 185, 129, 0.35);
            }
            .quest-pick-btn.start:hover:not(.disabled) { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 20px rgba(16, 185, 129, 0.45); }
            .quest-pick-btn.start.disabled { opacity: 0.4; pointer-events: none; }
            .quest-pick-btn.toggle { background: rgba(255, 255, 255, 0.04); color: var(--text-secondary); border: 1px solid rgba(255, 255, 255, 0.08); }
            .quest-pick-btn.toggle:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); }

            .claw-option { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); }
            .claw-option:last-child { border: none; }
            .claw-option-label { font-size: 12px; color: var(--text-secondary); }
            .claw-toggle { position: relative; width: 36px; height: 20px; cursor: pointer; }
            .claw-toggle input { opacity: 0; width: 0; height: 0; }
            .claw-toggle .slider { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-standard); border-radius: 10px; transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .claw-toggle .slider::before { content: ''; position: absolute; height: 14px; width: 14px; left: 2px; bottom: 2px; background: var(--text-secondary); border-radius: 50%; transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .claw-toggle input:checked + .slider { background: linear-gradient(135deg, var(--accent), var(--accent-bright)); border-color: transparent; }
            .claw-toggle input:checked + .slider::before { transform: translateX(16px); background: #fff; box-shadow: 0 0 8px rgba(255, 255, 255, 0.4); }

            #claw-logs-wrap { border-top: 1px solid var(--border-subtle); background: rgba(0, 0, 0, 0.12); }
            #claw-logs-head {
                display: flex; justify-content: space-between; align-items: center; gap: 10px;
                padding: 12px 14px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); color: var(--text-secondary);
                font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.22px; cursor: pointer; user-select: none; transition: background 0.2s ease;
            }
            #claw-logs-head:hover { background: rgba(255, 255, 255, 0.02); }
            .log-chevron { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            #claw-logs-wrap.collapsed .log-chevron { transform: rotate(-90deg); }
            #claw-logs-wrap.collapsed #claw-logs { height: 0; padding-top: 0; padding-bottom: 0; opacity: 0; }
            #claw-log-meta {
                color: var(--text-quaternary); font-family: "Berkeley Mono", ui-monospace, monospace;
                text-transform: none; letter-spacing: 0; font-size: 10px;
            }
            #claw-logs {
                padding: 10px 14px 12px; font-family: "Berkeley Mono", ui-monospace, monospace;
                font-size: 11px; color: var(--text-tertiary); height: 148px; overflow-y: auto; scroll-behavior: smooth;
                transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease, opacity 0.3s ease;
            }
            .log-item {
                display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 10px; line-height: 1.55;
                padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                animation: slideRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
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
                padding: 12px 14px; border-top: 1px solid rgba(255, 255, 255, 0.04); background: rgba(0, 0, 0, 0.15);
                display: flex; justify-content: center; align-items: center; gap: 12px;
            }
            .dev-badge-wrapper { position: relative; display: inline-block; }
            .dev-badge {
                display: flex; align-items: center; gap: 6px; padding: 4px 10px; cursor: pointer;
                background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px; color: var(--text-tertiary); font-size: 11px; font-weight: 500;
                text-decoration: none; transition: all 0.2s ease;
            }
            .dev-badge:hover, .dev-badge-wrapper:hover .dev-badge {
                background: rgba(113, 112, 255, 0.1); border-color: rgba(113, 112, 255, 0.3);
                color: var(--accent-bright); transform: translateY(-1px);
            }
            .dev-badge svg { width: 14px; height: 14px; fill: currentColor; opacity: 0.8; }
            .dev-badge strong { color: var(--text-secondary); font-weight: 600; }
            
            .dev-dropdown {
                position: absolute; bottom: calc(100% + 8px); right: 0; width: max-content;
                background: var(--bg-panel); border: 1px solid var(--border-subtle);
                border-radius: 12px; padding: 6px; box-shadow: var(--shadow-panel);
                opacity: 0; visibility: hidden; transform: translateY(10px) scale(0.95);
                transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                transform-origin: bottom right; backdrop-filter: blur(32px) saturate(180%); -webkit-backdrop-filter: blur(32px) saturate(180%); z-index: 100;
            }
            .dev-badge-wrapper:hover .dev-dropdown {
                opacity: 1; visibility: visible; transform: translateY(0) scale(1);
            }
            .dev-dropdown-item {
                display: flex; align-items: center; gap: 8px; padding: 8px 12px;
                color: var(--text-secondary); text-decoration: none; font-size: 11px; font-weight: 500;
                border-radius: 8px; transition: all 0.2s ease;
            }
            .dev-dropdown-item svg { width: 14px; height: 14px; fill: currentColor; opacity: 0.7; transition: all 0.2s ease; }
            .dev-dropdown-item:hover {
                background: rgba(113, 112, 255, 0.15); color: var(--text-primary); transform: translateX(3px);
            }
            .dev-dropdown-item:hover svg { opacity: 1; color: var(--accent-bright); transform: scale(1.1); }
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
            <div id="claw-logs-wrap" class="collapsed">
                <div id="claw-logs-head">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg class="log-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        <span>Activity Log</span>
                    </div>
                    <span id="claw-log-meta">live console</span>
                </div>
                <div id="claw-logs"></div>
            </div>
            <div id="claw-footer">
                <a href="https://github.com/l-limon-l/Claw" target="_blank" class="dev-badge">
                    ${ICONS.GITHUB}
                    <span>GitHub <strong>Repository</strong></span>
                </a>
                <div class="dev-badge-wrapper">
                    <div class="dev-badge">
                        ${ICONS.USER}
                        <span>About <strong>Developer</strong></span>
                    </div>
                    <div class="dev-dropdown">
                        <a href="https://fakecrime.bio/l_limon_l" target="_blank" class="dev-dropdown-item">
                            ${ICONS.LINK}
                            Fakecrime Bio
                        </a>
                        <a href="https://e-z.bio/l_limon_l" target="_blank" class="dev-dropdown-item">
                            ${ICONS.LINK}
                            E-Z Bio
                        </a>
                    </div>
                </div>
            </div>
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

        const logsWrap = document.getElementById('claw-logs-wrap');
        const logsHead = document.getElementById('claw-logs-head');
        if (logsHead && logsWrap) {
            logsHead.addEventListener('click', () => {
                logsWrap.classList.toggle('collapsed');
            });
        }

        document.getElementById('claw-body').addEventListener('click', async (e) => {
            if (e.target.classList.contains('goto-btn')) {
                if (Mods.Router) Mods.Router.transitionTo('/quest-home');
                return;
            }

            const btn = e.target.closest?.('.claim-btn');
            if (!btn || btn.disabled) return;

            const questId = btn.getAttribute('data-id');
            const taskData = this.tasks.get(questId);
            if (!taskData) return;

            btn.innerText = "WAITING...";
            btn.disabled = true;

            this.updateTask(questId, { ...taskData, claimState: 'WAITING' });

            try {
                const claimRes = await Tasks.claimReward(questId);

                if (claimRes?.body?.claimed_at) {
                    btn.innerText = "CLAIMED!";
                    btn.style.background = CONFIG.SUCCESS;
                    this.log(`[Claim] Reward for "${taskData.name}" claimed successfully!`, 'success');

                    this.updateTask(questId, { ...taskData, status: "CLAIMED", claimable: false, claimState: null });
                    setTimeout(() => this.removeTask(questId), 2000);
                }
            } catch (err) {
                this.log(`[Claim] Action required for "${taskData.name}". Check Discord UI for captcha.`, 'warn');
                this.updateTask(questId, { ...taskData, claimState: 'FAILED' });
            }
        });

        document.getElementById('claw-close').onclick = () => this.toggle();
        document.getElementById('claw-stop').onclick = () => this.shutdown();
        document.addEventListener('keydown', e => (e.key === '>' || (e.shiftKey && e.key === '.')) && this.toggle());

        try { if (Notification.permission === "default") Notification.requestPermission(); } catch (e) {
            this.log(`[Notification] Request permission failed: ${e.message}`, 'debug');
        }

        this.startTicker();
    },

    toggle() { this.root.style.display = this.root.style.display === 'none' ? 'flex' : 'none'; },

    shutdown() {
        if (!RUNTIME.running) return;
        RUNTIME.running = false;
        this.log("[System] Stopping script & cleaning up...", "warn");

        if (this.tickerId) clearInterval(this.tickerId);

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

    _getPct(t) {
        if (t.done) return 100;
        if (t.pending || t.failed || !t.max) return 0;
        return Math.min(100, (t.cur / t.max) * 100);
    },

    startTicker() {
        if (this.tickerId) clearInterval(this.tickerId);
        this.tickerId = setInterval(() => {
            if (!RUNTIME.running) return clearInterval(this.tickerId);
            for (const [id, task] of this.tasks.entries()) {
                if (task.status === "RUNNING" && task.type !== "ACHIEVEMENT") {
                    let cur = Math.min(task.cur + 1, task.max);
                    this.updateTask(id, { cur });
                }
            }
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
        
        if (summary.children.length === 4) {
            summary.children[0].querySelector('.summary-value').textContent = counts.running;
            summary.children[1].querySelector('.summary-value').textContent = counts.queued;
            summary.children[2].querySelector('.summary-value').textContent = counts.done;
            summary.children[3].querySelector('.summary-value').textContent = counts.failed;
            return;
        }

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

        if (oldData && oldData.status === newData.status && oldData.removing === newData.removing &&
            oldData.claimable === newData.claimable && oldData.claimState === newData.claimState &&
            oldData.actionRequired === newData.actionRequired) {
            const card = document.getElementById(`claw-task-${id}`);
            if (card) {
                const pct = this._getPct(newData).toFixed(1);

                const fill = card.querySelector('.progress-fill');
                if (fill) fill.style.width = `${pct}%`;

                const unit = newData.type === 'ACHIEVEMENT' ? '' : 's';
                const progressText = card.querySelector('.progress-text') || card.querySelectorAll('.task-meta span')[1];
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

                ts.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
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
            const pct = this._getPct(t).toFixed(1);
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
                if (t.claimState === 'WAITING') actionBtn = `<button class="claim-btn" disabled>WAITING...</button>`;
                else if (t.claimState === 'FAILED') actionBtn = `<button class="claim-btn failed" disabled>ACTION REQUIRED</button>`;
                else actionBtn = `<button class="claim-btn" data-id="${id}" type="button">CLAIM REWARD</button>`;
            } else if (t.actionRequired === 'ENROLL') {
                statusText = 'ACTION REQUIRED';
                progressLabel = 'Accept quest in Discord';
                actionBtn = `<button class="goto-btn" type="button">GO TO QUESTS</button>`;
            } else if (t.type === 'ACHIEVEMENT' && t.status === 'RUNNING' && t.actionRequired) {
                statusText = 'ACTION REQUIRED';
                progressLabel = 'Please, complete manually';
                actionBtn = `<button class="goto-btn" type="button">GO TO QUESTS</button>`;
            }

            const stateClass = t.done ? 'done' : t.failed ? 'failed' : t.pending ? 'pending' : 'active';
            const removingClass = t.removing ? 'removing' : '';
            
            let animClass = '';
            if (!this.animatedTasks.has(id)) {
                this.animatedTasks.add(id);
                animClass = 'animate-in';
            }

            return `<div id="claw-task-${id}" class="task-card ${stateClass} ${removingClass} ${animClass}"><div class="task-icon">${icon}</div><div class="task-info"><div class="task-top"><div class="task-name" title="${t.name}">${t.name}</div><div class="task-status">${statusText}</div></div><div class="task-meta"><span class="task-kind">${progressLabel}</span><span class="progress-text">${Math.floor(t.cur)} / ${t.max}${unit}</span></div><div class="progress-track"><div class="progress-fill" style="width: ${pct}%"></div></div>${actionBtn}</div></div>`;
        }).join('');
    }
};
