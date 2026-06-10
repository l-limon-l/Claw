import { Logger } from './logger.js';
import { CONST, CONFIG } from './config.js';

export let Mods = {};

export const Patcher = {
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

export function loadModules() {
    try {
        if (typeof window.Vencord !== 'undefined' && window.Vencord.Webpack) {
            Logger.log('[System] Vencord detected. Using Vencord Webpack API...', 'info');
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
                ChanStore: W.findStore('ChannelStore'),
                GuildChanStore: W.findStore('GuildChannelStore'),
                Dispatcher: W.Common?.FluxDispatcher || W.findByProps('dispatch', 'subscribe', 'flushWaitQueue'),
                API: W.Common?.RestAPI || W.findByProps('get', 'post', 'del'),
                Router: routerModule
            };

            const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
            const missing = required.filter(k => !Mods[k]);

            if (missing.length === 0) {
                Patcher.init(Mods.RunStore);
                return true;
            }
            Logger.log(`[System] Vencord extraction missed: ${missing.join(', ')}. Falling back to native...`, 'warn');
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
                        if (prop && typeof prop === 'object' && prop.__proto__?.constructor?.displayName === storeName) {
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
            ChanStore: findStore('ChannelStore'),
            GuildChanStore: findStore('GuildChannelStore'),
            Dispatcher: findDispatcher(),
            API: findAPI(),
            Router: findRouter()
        };

        const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
        const missing = required.filter(k => !Mods[k]);
        if (missing.length > 0) throw new Error(`Core modules not found: ${missing.join(', ')}`);

        Patcher.init(Mods.RunStore);
        return true;
    } catch (e) {
        Logger.log(`[System] Module loading error: ${e.message ?? e}`, 'err');
        return false;
    }
}
