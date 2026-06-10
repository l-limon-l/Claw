import { Logger } from './logger.js';
import { Mods, Patcher } from './discord.js';
import { Traffic } from './network.js';
import { RUNTIME, SYS, CONST } from './config.js';
import { ErrorHandler, sleep, rnd } from './utils.js';
import { Sound } from './sound.js';

export const Tasks = {
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
                cmdLine: `C:\\Program Files\${cleanName}\${rawExe}`,
                exePath: `c:/program files/${cleanName.toLowerCase()}/${rawExe}`,
                id: appId
            };
        } catch (e) {
            Logger.log(`[FetchGame] Fallback for ${appName}: ${e?.message ?? e}`, 'debug');
            const cleanName = this.sanitize(appName);
            const safeExe = `${cleanName.replace(/\s+/g, "")}.exe`;
            return {
                name: appName, exeName: safeExe,
                cmdLine: `C:\\Program Files\${cleanName}\${safeExe}`,
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
            } catch (e) { Logger.log(`[Video] Initial ping failed: ${e.message}`, 'debug'); }
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
        Sound.play('tick');

        try {
            if (RUNTIME.notify && typeof Notification !== 'undefined' && Notification.permission === "granted") {
                new Notification("Claw: Quest Completed", { body: t.name, icon: "https://cdn.discordapp.com/emojis/1120042457007792168.webp", tag: `claw-${q.id}` });
            }
        } catch (e) { Logger.log(`[Notification] ${e.message}`, 'debug'); }

        if (RUNTIME.autoClaim) {
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
