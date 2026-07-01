import { CONFIG, SYS, RUNTIME, CONST, ICONS } from './config.js';
import { sleep, rnd, ErrorHandler, esc, notExpired } from './utils.js';
import { Logger } from './logger.js';
import { loadModules, Mods } from './discord.js';
import { Traffic } from './network.js';
import { Tasks } from './quests.js';
import { Sound } from './sound.js';

if (window.clawLock) {
    console.warn("[Claw] Script is already running or didn't shut down properly. Please reload Discord (Ctrl+R).");
} else {
    window.clawLock = true;
    
    async function runConcurrent(tasks, limit) {
        const executing = new Set();
        for (const task of tasks) {
            if (!RUNTIME.running) break;
            const p = task().finally(() => executing.delete(p));
            executing.add(p);
            await sleep(rnd(1500, 4000));
            if (executing.size >= limit) await Promise.race(executing);
        }
        return Promise.allSettled(executing);
    }

    const REWARD_META = { 1: { label: "In-Game Item", color: "var(--warn-bright)" }, 3: { label: "Avatar Decoration", color: "var(--accent-bright)" }, 4: { label: "Orbs", color: "var(--success-bright)" }, 99: { label: "Manual Achievement", color: "var(--danger-bright)" } };
    const REWARD_FALLBACK = { label: "Other", color: "var(--text-tertiary)" };

    function showQuestPicker(quests) {
        return new Promise(resolve => {
            const body = document.getElementById('claw-body');
            const incomplete = quests.filter(q =>
                !q.userStatus?.completedAt
                && notExpired(q)
                && q.id !== CONST.ID
                && !Tasks.skipped.has(q.id)
            );

            const items = [];
            incomplete.forEach(q => {
                const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
                const td = cfg?.tasks ? Tasks.detectType(cfg, q.config?.application?.id) : null;

                if (!td) return;
                
                if (!SYS.IS_DESKTOP && (td.type === 'GAME' || td.type === 'STREAM')) return;

                const rw = q.config?.rewardsConfig?.rewards?.[0];
                let rewardType = rw?.type ?? 0;
                if (td.type === "ACHIEVEMENT") rewardType = 99;

                items.push({
                    id: q.id,
                    name: q.config?.messages?.questName ?? "Unknown Quest",
                    type: td.type === "WATCH_VIDEO" ? "VIDEO" : td.type,
                    rt: rewardType,
                    reward: rw?.messages?.name ?? "Unknown"
                });
            });

            const rewardTypes = [...new Set(items.map(q => q.rt))].sort();
            const meta = rt => REWARD_META[rt] ?? REWARD_FALLBACK;

            if (!items.length) {

                body.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: var(--text-tertiary); font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 24px;">
                        <div style="margin-bottom: 12px; opacity: 0.7;">${ICONS.CHECK}</div>
                        <div>You have completed all available quests!</div>
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
                        <div class="claw-option">
                            <span class="claw-option-label">Sound on completion</span>
                            <label class="claw-toggle"><input type="checkbox" id="opt-sound" checked><span class="slider"></span></label>
                        </div>
                        <div class="claw-option">
                            <span class="claw-option-label">Desktop notifications</span>
                            <label class="claw-toggle"><input type="checkbox" id="opt-notify"><span class="slider"></span></label>
                        </div>
                        <div class="claw-option">
                            <span class="claw-option-label">Random delay (anti-detect)</span>
                            <label class="claw-toggle"><input type="checkbox" id="opt-delay"><span class="slider"></span></label>
                        </div>
                    </div>
                    <div class="quest-pick-actions">
                        <button class="quest-pick-btn toggle disabled" id="claw-toggle-all">DESELECT ALL</button>
                        <button class="quest-pick-btn start" id="claw-start-btn">${ICONS.BOLT} CONTINUE</button>
                    </div>
                `;
            } else {
                body.innerHTML = `
                    <div style="padding: 6px 4px 0;">
                        <div class="quest-pick-section">Filter by reward</div>
                        <div class="quest-pick-filters">
                            ${rewardTypes.map(rt => {
                                const m = meta(rt);
                                return `<button class="reward-filter" data-rt="${rt}" style="border-color:${m.color};color:${m.color};">${m.label} (${items.filter(q => q.rt === rt).length})</button>`;
                            }).join('')}
                        </div>
                        <div id="claw-quest-list" style="max-height: 160px; overflow-y: auto; padding-right: 8px;">
                            ${items.map(q => {
                                const c = meta(q.rt).color;
                                return `<label class="quest-pick" style="border-left-color:${c};" data-rt="${q.rt}">
                                    <input type="checkbox" checked data-qid="${q.id}">
                                    <div class="quest-pick-info">
                                        <div class="quest-pick-name">${esc(q.name)}</div>
                                        <div class="quest-pick-meta">
                                            <span class="quest-pick-type">${esc(q.type)}</span>
                                            <span class="quest-pick-reward" style="color:${c};">${esc(q.reward)}</span>
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
                            <div class="claw-option">
                                <span class="claw-option-label">Sound on completion</span>
                                <label class="claw-toggle"><input type="checkbox" id="opt-sound" checked><span class="slider"></span></label>
                            </div>
                            <div class="claw-option">
                                <span class="claw-option-label">Desktop notifications</span>
                                <label class="claw-toggle"><input type="checkbox" id="opt-notify"><span class="slider"></span></label>
                            </div>
                            <div class="claw-option">
                                <span class="claw-option-label">Random delay (anti-detect)</span>
                                <label class="claw-toggle"><input type="checkbox" id="opt-delay"><span class="slider"></span></label>
                            </div>
                        </div>
                        <div class="quest-pick-actions">
                            <button class="quest-pick-btn toggle" id="claw-toggle-all">DESELECT ALL</button>
                            <button class="quest-pick-btn start" id="claw-start-btn">${ICONS.BOLT} START (${items.length})</button>
                        </div>
                    </div>
                `;
            }

            const $ = sel => body.querySelector(sel);
            const $$ = sel => [...body.querySelectorAll(sel)];

            const syncStartBtn = () => {
                if (!items.length) return;
                const n = $$('input[data-qid]:checked').length;
                const btn = $('#claw-start-btn');
                btn.innerHTML = `${ICONS.BOLT} START (${n})`;
                btn.classList.toggle('disabled', items.length > 0 && n === 0);
            };

            const syncToggleLabel = () => {
                if (!items.length) return;
                const visible = $$('.quest-pick:not(.hidden)');
                const allChecked = visible.length > 0 && visible.every(c => c.querySelector('input').checked);
                $('#claw-toggle-all').textContent = allChecked ? 'DESELECT ALL' : 'SELECT ALL';
            };

            if (items.length) {
                $$('input[data-qid]').forEach(cb => cb.addEventListener('change', () => { syncStartBtn(); syncToggleLabel(); }));

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
                        syncToggleLabel();
                    });
                });

                $('#claw-toggle-all').addEventListener('click', () => {
                    const visible = $$('.quest-pick:not(.hidden)');
                    const allChecked = visible.length > 0 && visible.every(c => c.querySelector('input').checked);
                    visible.forEach(c => { c.querySelector('input').checked = !allChecked; });
                    syncToggleLabel();
                    syncStartBtn();
                });
            }

            $('#claw-start-btn').addEventListener('click', async () => {
                const selected = new Set();
                if (items.length) {
                    $$('input[data-qid]:checked').forEach(cb => selected.add(cb.dataset.qid));
                }
                
                const options = {
                    autoEnroll: $('#opt-enroll').checked,
                    autoClaim: $('#opt-claim').checked,
                    playSound: $('#opt-sound').checked,
                    notify: $('#opt-notify').checked,
                    randomDelay: $('#opt-delay')?.checked ?? false
                };

                if (options.notify) {
                    try {
                        if (Notification.permission === 'default') {
                            await Notification.requestPermission();
                        }
                    } catch (e) {
                        Logger.log(`[Notification] Request permission failed: ${e.message}`, 'debug');
                    }
                }

                const logsWrap = document.getElementById('claw-logs-wrap');
                if (logsWrap) logsWrap.classList.remove('collapsed');

                body.classList.add('fade-out');
                await sleep(250);
                body.innerHTML = Logger.getEmptyStateHTML('System', 'Starting up...', 'Preparing selected quests.');
                body.classList.remove('fade-out');
                
                resolve({ selected, options });
            });
        });
    }

    async function main() {
        Logger.init();
        if (!loadModules()) return Logger.log('[System] Failed to load Discord modules. Aborting.', 'err');

        const getQuests = () => {
            const q = Mods.QuestStore.quests;
            return q instanceof Map ? [...q.values()] : Object.values(q || {});
        };

        let waitAttempts = 0;
        while (getQuests().length === 0 && waitAttempts < 15 && RUNTIME.running) {
            Logger.log('[System] Waiting for Discord to fetch quests...', 'debug');
            await sleep(1000);
            waitAttempts++;
        }

        const { selected, options } = await showQuestPicker(getQuests());
        if (!RUNTIME.running) return;

        if (selected !== null) {
            RUNTIME.selectedQuests = selected;
            RUNTIME.autoEnroll = options.autoEnroll;
            RUNTIME.autoClaim = options.autoClaim;
            RUNTIME.playSound = options.playSound;
            RUNTIME.notify = options.notify;
            RUNTIME.randomDelay = options.randomDelay;
            Logger.log(`[System] ${selected.size} quest(s) selected. Auto-enroll: ${options.autoEnroll ? 'ON' : 'OFF'}, Auto-claim: ${options.autoClaim ? 'ON' : 'OFF'}`, 'info');
        } else {
            Logger.log('[System] No quests selected. Shutting down.', 'info');
            return Logger.shutdown();
        }

        let loopCount = 1;
        let isIdle = false;

        while (RUNTIME.running) {
            try {
                const quests = getQuests();

                const active = quests.filter(q =>
                    !q.userStatus?.completedAt
                    && notExpired(q)
                    && q.id !== CONST.ID
                    && !Tasks.skipped.has(q.id)
                    && (!RUNTIME.selectedQuests || RUNTIME.selectedQuests.has(q.id))
                );

                const needsAction = [...Logger.tasks.values()].some(t => t.claimable || t.actionRequired || t.claimState === 'WAITING' || t.claimState === 'FAILED');

                if (!active.length && !needsAction) { 
                    if (!isIdle) {
                        Logger.log('[System] All available quests are completed! Waiting for new ones...', 'success'); 
                        Sound.play('done'); 
                        isIdle = true;
                    }
                    await sleep(rnd(15000, 20000));
                    continue;
                }

                isIdle = false;
                Logger.log(`[Cycle] Starting loop #${loopCount}...`, 'info');

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
                            Logger.log(`[Quest] "${q.config?.messages?.questName}" has an unknown task type. Skipping.`, 'warn');
                            return;
                        }

                        if (!SYS.IS_DESKTOP && (typeData.type === 'GAME' || typeData.type === 'STREAM')) {
                            Logger.log(`[Quest] "${q.config?.messages?.questName}" requires desktop app. Skipping.`, 'warn');
                            return;
                        }

                        const { type, keyName, target } = typeData;
                        if (target <= 0) {
                            Logger.log(`[Quest] "${q.config?.messages?.questName}" has invalid target (${target}). Skipping.`, 'warn');
                            return;
                        }

                        const tInfo = { id: q.id, appId: q.config?.application?.id ?? 0, name: q.config?.messages?.questName ?? "Unknown Quest", target, type, keyName };

                        if (!q.userStatus?.enrolledAt && !RUNTIME.autoEnroll) {
                            Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "PENDING", actionRequired: 'ENROLL' });
                            return;
                        }

                        if (Logger.tasks.has(q.id) && Logger.tasks.get(q.id).status === "RUNNING") return;

                        Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "QUEUE", actionRequired: null });

                        const taskFunc = async () => {
                            if (!q.userStatus?.enrolledAt) {
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
                    if (needsAction) {
                        Logger.log('[System] Waiting for manual reward claim or action...', 'warn');
                        await sleep(rnd(5000, 8000));
                    }
                }

                if (!RUNTIME.running) break;
                Logger.log(`[Cycle] Loop #${loopCount} complete. Waiting before rescan...`, 'info');
                await sleep(rnd(2500, 4500));
                loopCount++;

            } catch (cycleError) {
                Logger.log(`[Cycle] Error in loop #${loopCount}: ${cycleError?.message ?? cycleError}`, 'err');
                await sleep(3000);
                loopCount++;
            }
        }

        // Wait for any unclaimed rewards before shutting down
        const unclaimed = [...Logger.tasks.values()].some(t => t.claimable || t.claimState === 'WAITING');
        if (unclaimed) {
            Logger.log('[System] Waiting for pending reward claims before shutdown...', 'info');
            while ([...Logger.tasks.values()].some(t => t.claimable || t.claimState === 'WAITING')) {
                await sleep(3000);
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
}
