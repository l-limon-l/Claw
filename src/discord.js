import { Logger } from './logger.js';
import { CONST, CONFIG } from './config.js';

export let Mods = {};

export const Patcher = {
    games: [], real: {}, active: false,

    init(Store) {
        if (!Store) return;
        const methods = [
            "getRunningGames", "getGameForPID", "getVisibleGame",
            "getVisibleRunningGames", "getRunningDiscordApplicationIds", "getCandidateGames"
        ];
        this.real = {};
        for (const m of methods) {
            if (typeof Store[m] === "function") {
                this.real[m] = Store[m];
            }
        }
    },

    toggle(on) {
        if (!Mods.RunStore) return;
        if (on && !this.active) {
            if (this.real.getRunningGames) {
                Mods.RunStore.getRunningGames = () => [...(this.real.getRunningGames.call(Mods.RunStore) || []), ...this.games];
            }
            if (this.real.getGameForPID) {
                Mods.RunStore.getGameForPID = (pid) => this.games.find(g => g.pid === pid) || this.real.getGameForPID.call(Mods.RunStore, pid);
            }
            if (this.real.getVisibleGame) {
                Mods.RunStore.getVisibleGame = () => this.games[0] || (this.real.getVisibleGame ? this.real.getVisibleGame.call(Mods.RunStore) : null);
            }
            if (this.real.getVisibleRunningGames) {
                Mods.RunStore.getVisibleRunningGames = () => [...(this.real.getVisibleRunningGames.call(Mods.RunStore) || []), ...this.games];
            }
            if (this.real.getRunningDiscordApplicationIds) {
                Mods.RunStore.getRunningDiscordApplicationIds = () => [
                    ...(this.real.getRunningDiscordApplicationIds.call(Mods.RunStore) || []),
                    ...this.games.map(g => g.id).filter(Boolean)
                ];
            }
            if (this.real.getCandidateGames) {
                Mods.RunStore.getCandidateGames = () => [...(this.real.getCandidateGames.call(Mods.RunStore) || []), ...this.games];
            }
            this.active = true;
        } else if (!on && this.active) {
            for (const [m, fn] of Object.entries(this.real)) {
                Mods.RunStore[m] = fn;
            }
            this.active = false;
        }
    },

    add(g) {
        if (this.games.some(x => x.pid === g.pid)) return;
        this.games.push(g);
        this.toggle(true);
        this.dispatch([g], []);
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
            added,
            removed,
            games: Mods.RunStore?.getRunningGames ? Mods.RunStore.getRunningGames() : []
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

export function loadModules(options = {}) {
    const quiet = options.quiet === true;
    try {
        if (typeof window.Vencord !== 'undefined' && window.Vencord.Webpack) {
            if (!quiet) Logger.log('[System] Vencord detected. Using Vencord Webpack API...', 'info');
            const W = window.Vencord.Webpack;

            let routerModule;
            try {
                const m = W.findByCode('transitionTo -');
                if (m) {
                    for (const prop of [m, m.default, ...Object.values(m)]) {
                        if (typeof prop === 'function' && prop.toString().includes('transitionTo -')) {
                            routerModule = { transitionTo: prop };
                            break;
                        }
                    }
                }
            } catch (e) { }

            Mods = {
                QuestStore: W.findStore('QuestStore') || W.findStore('QuestsStore'),
                RunStore: W.findStore('RunningGameStore'),
                StreamStore: W.findStore('ApplicationStreamingStore'),
                UserStore: W.findStore('UserStore'),
                ChanStore: W.findStore('ChannelStore'),
                GuildChanStore: W.findStore('GuildChannelStore'),
                Dispatcher: W.Common?.FluxDispatcher || W.findByProps('dispatch', 'subscribe', 'flushWaitQueue'),
                API: W.Common?.RestAPI || W.findByProps('get', 'post', 'del'),
                Router: routerModule
            };

            const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
            const missing = required.filter(k => !Mods[k]);

            if (missing.length === 0) {
                const optional = ['StreamStore', 'UserStore', 'ChanStore', 'GuildChanStore', 'Router'];
                optional.forEach(k => { if (!quiet && !Mods[k]) Logger.log(`[System] Optional module '${k}' not found. Features may be limited.`, 'warn'); });
                Patcher.init(Mods.RunStore);
                return true;
            }
            if (!quiet) Logger.log(`[System] Vencord extraction missed: ${missing.join(', ')}. Falling back to native...`, 'warn');
        }

        if (typeof webpackChunkdiscord_app === 'undefined') throw new Error("Webpack chunk not found");

        let req;
        webpackChunkdiscord_app.push([[Symbol()], {}, (r) => {
            const cur = Object.keys(req?.c || {}).length;
            const incoming = Object.keys(r?.c || {}).length;
            if (incoming > cur) req = r;
        }]);
        webpackChunkdiscord_app.pop();

        if (!req?.c) throw new Error("Module registry not available");

        const modules = Object.values(req.c);

        function findStore(storeName) {
            for (const m of modules) {
                try {
                    const exp = m?.exports;
                    if (!exp || typeof exp !== 'object') continue;
                    for (const key of Object.keys(exp)) {
                        const prop = exp[key];
                        if (prop && typeof prop === 'object') {
                            const name = prop.__proto__?.constructor?.displayName || prop.constructor?.displayName;
                            if (name === storeName || (storeName === 'QuestStore' && name === 'QuestsStore')) {
                                return prop;
                            }
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
                        if (prop && prop._subscriptions && typeof prop.subscribe === 'function' && typeof prop.dispatch === 'function' && typeof prop.__proto__?.flushWaitQueue === 'function') {
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
                        if (prop && typeof prop.get === 'function' && typeof prop.post === 'function' && typeof prop.del === 'function' && !prop._dispatcher) {
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

                    for (const prop of [exp, exp.default, ...Object.values(exp)]) {
                        if (typeof prop === 'function' && prop.toString().includes('transitionTo -')) {
                            return { transitionTo: prop };
                        }
                    }
                } catch { }
            }
            return undefined;
        }

        Mods = {
            QuestStore: findStore('QuestStore'),
            RunStore: findStore('RunningGameStore'),
            StreamStore: findStore('ApplicationStreamingStore'),
            UserStore: findStore('UserStore'),
            ChanStore: findStore('ChannelStore'),
            GuildChanStore: findStore('GuildChannelStore'),
            Dispatcher: findDispatcher(),
            API: findAPI(),
            Router: findRouter()
        };

        const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
        const missing = required.filter(k => !Mods[k]);
        if (missing.length > 0) throw new Error(`Core modules not found: ${missing.join(', ')}`);

        const optional = ['StreamStore', 'ChanStore', 'GuildChanStore', 'Router'];
        optional.forEach(k => { if (!quiet && !Mods[k]) Logger.log(`[System] Optional module '${k}' not found. Features may be limited.`, 'warn'); });

        Patcher.init(Mods.RunStore);
        return true;
    } catch (e) {
        if (!quiet) Logger.log(`[System] Module loading error: ${e.message ?? e}`, 'err');
        return false;
    }
}
