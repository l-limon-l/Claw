import { Logger } from './logger.js';
import { Mods, Patcher } from './discord.js';
import { Traffic } from './network.js';
import { RUNTIME, SYS, CONST } from './config.js';
import { ErrorHandler, sleep, rnd } from './utils.js';
import { Sound } from './sound.js';

/* ── OAuth consent gate ──────────────────────────────────────
   Shown before the ACHIEVEMENT bypass OAuth-authorizes a quest's
   app on the user's account. Per-app, per-run, in-memory only.
   Default decline: Cancel / Esc / backdrop / 60s idle all resolve false.
── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── */
const Consent = {
    _granted: new Set(),
    TIMEOUT: 60000,
    SCOPES: ['identify', 'applications.commands', 'applications.entitlements'],
    ask(appId, appName) {
        if (this._granted.has(appId)) return Promise.resolve(true);
        return new Promise(resolve => {
            const ov = document.createElement('div');
            ov.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:var(--font-primary);';
            const box = document.createElement('div');
            box.style.cssText = 'width:420px;max-width:92vw;background:var(--bg-panel,#1a1b1e);border:1px solid var(--border-subtle);border-radius:16px;box-shadow:0 32px 84px rgba(0,0,0,0.65);color:var(--text-primary,#fff);overflow:hidden;';
            box.innerHTML = `
                <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);font-weight:700;">Authorize application?</div>
                <div style="padding:16px;font-size:13px;line-height:1.5;">
                    <div>To complete this achievement quest, Claw needs to OAuth-authorize this app on your Discord account:</div>
                    <div id="cc-app" style="font-weight:700;margin:6px 0;"></div>
                    <div style="color:var(--text-tertiary);">Scopes requested:</div>
                    <ul id="cc-scopes" style="margin:4px 0 10px;padding-left:18px;color:var(--text-tertiary);"></ul>
                    <div style="color:var(--warn,#f59e0b);">The app's backend receives a real authorization code. Claw revokes the grant immediately after the quest is marked complete.</div>
                    <label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:12px;color:var(--text-tertiary);">
                        <input type="checkbox" id="cc-remember"> Don't ask again for this app this session</label>
                </div>
                <div style="display:flex;gap:10px;padding:12px 16px;border-top:1px solid var(--border-subtle);">
                    <button id="cc-no" style="flex:1;padding:10px;border:1px solid var(--border-subtle);border-radius:12px;background:rgba(255,255,255,0.04);color:var(--text-secondary,#e2e8f0);cursor:pointer;font:inherit;font-weight:600;">Cancel</button>
                    <button id="cc-yes" style="flex:1;padding:10px;border:none;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;font:inherit;font-weight:600;">Authorize</button>
                </div>`;
            ov.appendChild(box);
            document.body.appendChild(ov);
            box.querySelector('#cc-app').textContent = appName ? `${appName} (${appId})` : `App ${appId}`;
            const ul = box.querySelector('#cc-scopes');
            this.SCOPES.forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
            let done = false;
            const finish = v => {
                if (done) return; done = true;
                clearTimeout(timer); document.removeEventListener('keydown', onKey);
                if (v && box.querySelector('#cc-remember').checked) this._granted.add(appId);
                ov.remove(); resolve(v);
            };
            const onKey = e => { if (e.key === 'Escape') finish(false); };
            box.querySelector('#cc-yes').addEventListener('click', () => finish(true));
            box.querySelector('#cc-no').addEventListener('click', () => finish(false));
            ov.addEventListener('mousedown', e => { if (e.target === ov) finish(false); });
            document.addEventListener('keydown', onKey);
            const timer = setTimeout(() => finish(false), this.TIMEOUT);
        });
    }
};

export const Tasks = {
    skipped: new Set(),
    _relayUrl: 'http://127.0.0.1:43210',
    _relayProbe: null,

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

    /* ── Relay & Bypass ─────────────────────────────────────── */

    _probeRelay() {
        return this._relayProbe ??= (async () => {
            try {
                const r = await Promise.race([
                    fetch(`${this._relayUrl}/health`, { method: 'GET', redirect: 'error' }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('probe timeout')), 800))
                ]);
                if (r.ok) Logger.log('[Bypass] Claw Relay detected on 127.0.0.1:43210.', 'info');
                return r.ok;
            } catch (_) {
                return false;
            }
        })();
    },

    async _bypassPost(url, headers, jsonBody) {
        if (await this._probeRelay()) {
            const r = await fetch(`${this._relayUrl}/proxy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, headers, body: jsonBody }),
                redirect: 'error'
            });
            if (!r.ok) throw { status: r.status, body: await r.text() };
            const result = await r.json();
            if (!result.ok) throw { status: result.status, body: result.body };
            return result;
        }

        try {
            const helper = window.VencordNative?.pluginHelpers?.OrionQuests;
            if (helper) {
                const u = new URL(url);
                const appId = u.hostname.split('.')[0];
                const questId = headers['X-Discord-Quest-ID'];
                const referrer = headers['Referer'];
                if (u.pathname.endsWith('/acf/authorize')) {
                    const { code } = JSON.parse(jsonBody);
                    const r = await helper.discordsaysAuthorize({ appId, questId, authCode: code, referrer });
                    if (!r.ok) throw { status: r.status, body: r.body };
                    return { ok: true, status: r.status, body: r.body };
                }
                if (u.pathname.endsWith('/acf/quest/progress')) {
                    const { progress } = JSON.parse(jsonBody);
                    const token = headers['X-Auth-Token'];
                    const r = await helper.discordsaysProgress({ appId, questId, token, target: progress, referrer });
                    if (!r.ok) throw { status: r.status, body: r.body };
                    return { ok: true, status: r.status, body: r.body };
                }
            }
        } catch (e) {
            if (e?.status) throw e;
            Logger.log(`[Bypass] VencordNative path errored: ${e?.message ?? e}`, 'debug');
        }

        throw new Error('No bypass transport available (relay offline, no Vencord native)');
    },

    async bypassAchievement(q, t) {
        const appId = q.config?.application?.id;
        if (!appId || !/^\d+$/.test(String(appId))) {
            Logger.log(`[Bypass] Invalid or missing appId for "${t.name}". Skipping bypass.`, 'warn');
            return false;
        }

        const appName = q.config?.application?.name ?? q.config?.messages?.questName ?? 'Unknown App';
        const userApproved = await Consent.ask(appId, appName);
        if (!userApproved) {
            Logger.log(`[Bypass] User declined OAuth authorization for "${appName}". Skipping.`, 'info');
            return false;
        }

        let preGrantIds = null;
        try {
            const before = await Mods.API.get({ url: '/oauth2/tokens' });
            preGrantIds = new Set((before?.body || []).map(tk => tk.id));
        } catch (e) {
            Logger.log(`[Bypass] Could not snapshot existing grants. Aborting bypass to prevent unrevocable authorization.`, 'warn');
            return false;
        }

        try {
            Logger.log(`[Bypass] Starting Discord Says bypass for "${t.name}"...`, 'info');

            const authRes = await Mods.API.post({
                url: `/oauth2/authorize`,
                body: {
                    client_id: appId,
                    response_type: 'code',
                    redirect_uri: `https://${appId}.discordsays.com/`,
                    scope: Consent.SCOPES.join(' '),
                    permissions: '0',
                    authorize: true,
                    integration_type: 1,
                    location_context: { guild_id: '10000', channel_id: '10000', channel_type: 10000 }
                }
            });
            const location = authRes?.body?.location;
            if (!location) throw new Error('no location in /oauth2/authorize response');
            const authCode = new URL(location).searchParams.get('code');
            if (!authCode) throw new Error('no code in authorize location');

            const ticketRes = await Mods.API.post({ url: `/applications/${appId}/proxy-tickets`, body: {} });
            const proxyTicket = ticketRes?.body?.ticket;
            if (!proxyTicket) throw new Error('no proxy ticket');

            const referrer = `https://${appId}.discordsays.com/?instance_id=example-cl-instance&platform=desktop&discord_proxy_ticket=${encodeURIComponent(proxyTicket)}`;

            const dsAuthRes = await Tasks._bypassPost(
                `https://${appId}.discordsays.com/.proxy/acf/authorize`,
                { 'Content-Type': 'application/json', 'X-Auth-Token': '', 'X-Discord-Quest-ID': q.id, 'Referer': referrer },
                JSON.stringify({ code: authCode })
            );
            let dsToken;
            try { dsToken = JSON.parse(dsAuthRes.body)?.token; }
            catch { throw new Error('discordsays returned non-JSON: ' + String(dsAuthRes.body).slice(0, 120)); }
            if (!dsToken) throw new Error('no discordsays token');

            await Tasks._bypassPost(
                `https://${appId}.discordsays.com/.proxy/acf/quest/progress`,
                { 'Content-Type': 'application/json', 'X-Auth-Token': dsToken, 'X-Discord-Quest-ID': q.id, 'Referer': referrer },
                JSON.stringify({ progress: t.target })
            );

            Logger.log(`[Bypass] Success — "${t.name}" completed via Discord Says.`, 'success');
            return true;
        } catch (e) {
            if (e instanceof TypeError && /failed to fetch|networkerror/i.test(e.message)) {
                Logger.log(`[Bypass] Discord's CSP blocks the script from reaching discordsays.com. Use the Vencord plugin port for the auto-bypass — userscript can't bypass CSP. Skipping "${t.name}".`, 'warn');
                return false;
            }
            const code = e?.body?.code;
            if (code === 50165) {
                Logger.log(`[Bypass] "${t.name}" can't be launched (age-gated or delisted). Discord blocks the proxy ticket — nothing we can do.`, 'warn');
                return false;
            }
            const parts = [];
            if (e?.status) parts.push(`HTTP ${e.status}`);
            if (code) parts.push(`code ${code}`);
            if (e?.body?.message) parts.push(e.body.message);
            else if (e?.message) parts.push(e.message);
            else if (typeof e === 'string') parts.push(e);
            else if (e) { try { parts.push(JSON.stringify(e).slice(0, 200)); } catch { parts.push(String(e)); } }
            Logger.log(`[Bypass] Failed: ${parts.join(' — ') || 'unknown'}`, 'warn');
            return false;
        } finally {
            if (preGrantIds) {
                try {
                    const after = await Mods.API.get({ url: '/oauth2/tokens' });
                    const ours = (after?.body || []).filter(tk => tk.application?.id === appId && !preGrantIds.has(tk.id));
                    for (const g of ours) await Mods.API.del({ url: `/oauth2/tokens/${g.id}` });
                } catch (e) {
                    Logger.log(`[Bypass] Deauthorize cleanup non-fatal: ${e?.message}`, 'debug');
                }
            }
        }
    },

    /* ── Task Runners ───────────────────────────────────────── */

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
            const delayMs = rnd(3500, 4750);
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
                        Logger.log(`[Achievement] Heartbeat rejected (HTTP ${err.status}). Falling back to bypass mode.`, 'warn');
                        break;
                    }
                    if (failCount >= SYS.MAX_TASK_FAILURES) {
                        Logger.log(`[Achievement] Too many failures. Falling back to bypass mode.`, 'warn');
                        break;
                    }
                }
                await sleep(rnd(19000, 22000));
            }

            if (cur >= t.target && RUNTIME.running) return Tasks.finish(q, t);
        }

        if (!RUNTIME.running) return;
        const bypassed = await Tasks.bypassAchievement(q, t);
        if (bypassed) return Tasks.finish(q, t);

        if (!RUNTIME.running) return;
        Logger.log(`[Task] Skipping "${t.name}" — no auto-completion path worked (heartbeat rejected, bypass blocked). Likely age-gated/delisted on your account.`, 'warn');
        return Tasks.failTask(q, t, 'Cannot auto-complete');
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
            if (typeof Notification !== 'undefined') {
                if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (_) { } }
                if (Notification.permission === 'granted') {
                    new Notification("Claw: Quest Completed", { body: t.name, icon: "https://cdn.discordapp.com/emojis/1120042457007792168.webp", tag: `claw-${q.id}` });
                }
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
