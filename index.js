(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/config.js
  var CONFIG, SYS, RUNTIME, ICONS, CONST;
  var init_config = __esm({
    "src/config.js"() {
      CONFIG = {
        NAME: "Claw",
        VERSION: "v4.7.0 (Enterprise Core)",
        THEME: "#7170ff",
        SUCCESS: "#10b981",
        WARN: "#f59e0b",
        ERR: "#ef4444",
        HIDE_ACTIVITY: false,
        GAME_CONCURRENCY: 1,
        VIDEO_CONCURRENCY: 2,
        MAX_LOG_ITEMS: 60
      };
      SYS = Object.freeze({
        MAX_TIME: 25 * 60 * 1e3,
        MAX_TASK_FAILURES: 5,
        MAX_RETRIES: 3,
        IS_DESKTOP: typeof window.DiscordNative !== "undefined"
      });
      RUNTIME = {
        running: true,
        cleanups: /* @__PURE__ */ new Set(),
        selectedQuests: null,
        autoEnroll: true,
        autoClaim: false,
        playSound: false,
        notify: false,
        randomDelay: false
      };
      ICONS = Object.freeze({
        BOLT: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.29-.62L14.5 3h1l-1 7h3.5c.58 0 .57.32.29.62L11 21z"/></svg>`,
        VIDEO: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        GAME: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
        STREAM: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
        ACTIVITY: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
        CHECK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
        CLOCK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
        STOP: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>`,
        GITHUB: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`,
        LINK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
        USER: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
      });
      CONST = Object.freeze({
        ID: "1412491570820812933",
        EVT: Object.freeze({
          HEARTBEAT: "QUESTS_SEND_HEARTBEAT_SUCCESS",
          GAME: "RUNNING_GAMES_CHANGE",
          RPC: "LOCAL_ACTIVITY_UPDATE"
        })
      });
    }
  });

  // src/utils.js
  var sleep, rnd, esc, notExpired, Storage, ErrorHandler;
  var init_utils = __esm({
    "src/utils.js"() {
      sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      notExpired = (q) => {
        const e = new Date(q.config?.expiresAt ?? 0).getTime();
        return Number.isNaN(e) || e > Date.now();
      };
      Storage = {
        save(key, value) {
          try {
            window.localStorage.setItem(`claw_${key}`, JSON.stringify(value));
          } catch (e) {
            console.debug("[Storage] Write failed:", e.message);
          }
        },
        load(key) {
          try {
            const v = window.localStorage.getItem(`claw_${key}`);
            return v ? JSON.parse(v) : null;
          } catch (e) {
            return null;
          }
        }
      };
      ErrorHandler = {
        RETRYABLE: /* @__PURE__ */ new Set([429, 500, 502, 503, 504, 408]),
        CLIENT_ERRORS: /* @__PURE__ */ new Set([400, 403, 404, 409, 410]),
        classify(error) {
          const status = error?.status ?? error?.statusCode;
          return {
            isRetryable: this.RETRYABLE.has(status),
            isClientError: this.CLIENT_ERRORS.has(status),
            status,
            message: error?.message ?? error?.body?.message ?? `HTTP ${status ?? "UNKNOWN"}`
          };
        },
        isSkippableQuest(error) {
          const status = error?.status;
          return status === 404 || status === 403 || status === 410;
        }
      };
    }
  });

  // src/discord.js
  function loadModules() {
    try {
      let findStore = function(storeName) {
        for (const m of modules) {
          try {
            const exp = m?.exports;
            if (!exp || typeof exp !== "object") continue;
            for (const key of Object.keys(exp)) {
              const prop = exp[key];
              if (prop && typeof prop === "object" && prop.__proto__?.constructor?.displayName === storeName) {
                return prop;
              }
            }
          } catch {
          }
        }
        return void 0;
      }, findDispatcher = function() {
        for (const m of modules) {
          try {
            const exp = m?.exports;
            if (!exp || typeof exp !== "object") continue;
            for (const key of Object.keys(exp)) {
              const prop = exp[key];
              if (prop && prop._subscriptions && typeof prop.subscribe === "function" && typeof prop.dispatch === "function" && typeof prop.__proto__?.flushWaitQueue === "function") {
                return prop;
              }
            }
          } catch {
          }
        }
        return void 0;
      }, findAPI = function() {
        for (const m of modules) {
          try {
            const exp = m?.exports;
            if (!exp || typeof exp !== "object") continue;
            for (const key of Object.keys(exp)) {
              const prop = exp[key];
              if (prop && typeof prop.get === "function" && typeof prop.post === "function" && typeof prop.del === "function" && !prop._dispatcher) {
                return prop;
              }
            }
          } catch {
          }
        }
        return void 0;
      }, findRouter = function() {
        for (const m of modules) {
          try {
            const exp = m?.exports;
            if (!exp) continue;
            for (const prop of [exp, exp.default, ...Object.values(exp)]) {
              if (typeof prop === "function" && prop.toString().includes("transitionTo -")) {
                return { transitionTo: prop };
              }
            }
          } catch {
          }
        }
        return void 0;
      };
      if (typeof window.Vencord !== "undefined" && window.Vencord.Webpack) {
        Logger.log("[System] Vencord detected. Using Vencord Webpack API...", "info");
        const W = window.Vencord.Webpack;
        let routerModule;
        try {
          const m = W.findByCode("transitionTo -");
          if (m) {
            for (const prop of [m, m.default, ...Object.values(m)]) {
              if (typeof prop === "function" && prop.toString().includes("transitionTo -")) {
                routerModule = { transitionTo: prop };
                break;
              }
            }
          }
        } catch (e) {
        }
        Mods = {
          QuestStore: W.findStore("QuestStore") || W.findStore("QuestsStore"),
          RunStore: W.findStore("RunningGameStore"),
          StreamStore: W.findStore("ApplicationStreamingStore"),
          ChanStore: W.findStore("ChannelStore"),
          GuildChanStore: W.findStore("GuildChannelStore"),
          Dispatcher: W.Common?.FluxDispatcher || W.findByProps("dispatch", "subscribe", "flushWaitQueue"),
          API: W.Common?.RestAPI || W.findByProps("get", "post", "del"),
          Router: routerModule
        };
        const required2 = ["QuestStore", "API", "Dispatcher", "RunStore"];
        const missing2 = required2.filter((k) => !Mods[k]);
        if (missing2.length === 0) {
          const optional2 = ["StreamStore", "ChanStore", "GuildChanStore", "Router"];
          optional2.forEach((k) => {
            if (!Mods[k]) Logger.log(`[System] Optional module '${k}' not found. Features may be limited.`, "warn");
          });
          Patcher.init(Mods.RunStore);
          return true;
        }
        Logger.log(`[System] Vencord extraction missed: ${missing2.join(", ")}. Falling back to native...`, "warn");
      }
      if (typeof webpackChunkdiscord_app === "undefined") throw new Error("Webpack chunk not found");
      let req;
      webpackChunkdiscord_app.push([[/* @__PURE__ */ Symbol()], {}, (r) => {
        const cur = Object.keys(req?.c || {}).length;
        const incoming = Object.keys(r?.c || {}).length;
        if (incoming > cur) req = r;
      }]);
      webpackChunkdiscord_app.pop();
      if (!req?.c) throw new Error("Module registry not available");
      const modules = Object.values(req.c);
      Mods = {
        QuestStore: findStore("QuestStore"),
        RunStore: findStore("RunningGameStore"),
        StreamStore: findStore("ApplicationStreamingStore"),
        ChanStore: findStore("ChannelStore"),
        GuildChanStore: findStore("GuildChannelStore"),
        Dispatcher: findDispatcher(),
        API: findAPI(),
        Router: findRouter()
      };
      const required = ["QuestStore", "API", "Dispatcher", "RunStore"];
      const missing = required.filter((k) => !Mods[k]);
      if (missing.length > 0) throw new Error(`Core modules not found: ${missing.join(", ")}`);
      const optional = ["StreamStore", "ChanStore", "GuildChanStore", "Router"];
      optional.forEach((k) => {
        if (!Mods[k]) Logger.log(`[System] Optional module '${k}' not found. Features may be limited.`, "warn");
      });
      Patcher.init(Mods.RunStore);
      return true;
    } catch (e) {
      Logger.log(`[System] Module loading error: ${e.message ?? e}`, "err");
      return false;
    }
  }
  var Mods, Patcher;
  var init_discord = __esm({
    "src/discord.js"() {
      init_logger();
      init_config();
      Mods = {};
      Patcher = {
        games: [],
        realGames: null,
        realPID: null,
        active: false,
        init(Store) {
          if (!Store) return;
          this.realGames = Store.getRunningGames;
          this.realPID = Store.getGameForPID;
        },
        toggle(on) {
          if (on && !this.active) {
            Mods.RunStore.getRunningGames = () => [...this.realGames.call(Mods.RunStore), ...this.games];
            Mods.RunStore.getGameForPID = (pid) => this.games.find((g) => g.pid === pid) || this.realPID.call(Mods.RunStore, pid);
            this.active = true;
          } else if (!on && this.active) {
            Mods.RunStore.getRunningGames = this.realGames;
            Mods.RunStore.getGameForPID = this.realPID;
            this.active = false;
          }
        },
        add(g) {
          if (this.games.some((x) => x.pid === g.pid)) return;
          this.games.push(g);
          this.toggle(true);
          this.dispatch([g], []);
          this.rpc(g);
        },
        remove(g) {
          const before = this.games.length;
          this.games = this.games.filter((x) => x.pid !== g.pid);
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
            Logger.log(`[RPC Cleanup] ${e.message}`, "debug");
          }
        },
        clean() {
          this.games = [];
          this.toggle(false);
          this.rpc(null);
        }
      };
    }
  });

  // src/network.js
  var Traffic;
  var init_network = __esm({
    "src/network.js"() {
      init_config();
      init_utils();
      init_logger();
      init_discord();
      Traffic = {
        queue: [],
        processing: false,
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
              this.queue.forEach((req2) => req2.reject(new Error("Shutdown")));
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
                const delay = (e.body?.retry_after ?? Math.pow(2, req.attempts)) * 1e3;
                const isGlobal = e.body?.global === true;
                Logger.log(`[Network] Retry ${req.attempts}/${SYS.MAX_RETRIES} in ${(delay / 1e3).toFixed(1)}s (HTTP ${err.status})`, "warn");
                const retryJitter = rnd(200, 800);
                if (isGlobal) {
                  this.queue.unshift(req);
                  await sleep(delay + retryJitter);
                  if (!RUNTIME.running) break;
                } else {
                  setTimeout(() => {
                    if (RUNTIME.running) {
                      this.queue.push(req);
                      this.process();
                    } else {
                      req.reject(new Error("Shutdown"));
                    }
                  }, delay + retryJitter);
                }
              } else if (err.isClientError) {
                Logger.log(`[Network] HTTP ${err.status}: ${req.url}`, "debug");
                req.reject(e);
              } else {
                Logger.log(`[Network] Request to ${req.url} failed: ${err.message}`, "err");
                req.reject(e);
              }
            }
            await sleep(rnd(1200, 1800));
          }
          this.processing = false;
        }
      };
    }
  });

  // src/sound.js
  var Sound;
  var init_sound = __esm({
    "src/sound.js"() {
      init_config();
      Sound = {
        _ctx: null,
        play(type) {
          if (!RUNTIME.playSound) return;
          try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!this._ctx || this._ctx.state === "closed") this._ctx = new Ctx();
            const ctx = this._ctx;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = "sine";
            const t0 = ctx.currentTime;
            if (type === "done") {
              o.frequency.setValueAtTime(523.25, t0);
              o.frequency.setValueAtTime(659.25, t0 + 0.12);
              o.frequency.setValueAtTime(783.99, t0 + 0.24);
              g.gain.setValueAtTime(0.55, t0);
              g.gain.exponentialRampToValueAtTime(1e-3, t0 + 0.55);
              o.start(t0);
              o.stop(t0 + 0.6);
            } else {
              o.frequency.value = 880;
              g.gain.setValueAtTime(0.45, t0);
              g.gain.exponentialRampToValueAtTime(1e-3, t0 + 0.18);
              o.start(t0);
              o.stop(t0 + 0.2);
            }
          } catch (_) {
          }
        }
      };
    }
  });

  // src/quests.js
  var Consent, Tasks;
  var init_quests = __esm({
    "src/quests.js"() {
      init_logger();
      init_discord();
      init_network();
      init_config();
      init_utils();
      init_sound();
      Consent = {
        _granted: /* @__PURE__ */ new Set(),
        TIMEOUT: 6e4,
        SCOPES: ["identify", "applications.commands", "applications.entitlements"],
        ask(appId, appName) {
          if (this._granted.has(appId)) return Promise.resolve(true);
          return new Promise((resolve) => {
            const ov = document.createElement("div");
            ov.style.cssText = "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:var(--font-primary);";
            const box = document.createElement("div");
            box.style.cssText = "width:420px;max-width:92vw;background:var(--bg-panel,#1a1b1e);border:1px solid var(--border-subtle);border-radius:16px;box-shadow:0 32px 84px rgba(0,0,0,0.65);color:var(--text-primary,#fff);overflow:hidden;";
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
            box.querySelector("#cc-app").textContent = appName ? `${appName} (${appId})` : `App ${appId}`;
            const ul = box.querySelector("#cc-scopes");
            this.SCOPES.forEach((s) => {
              const li = document.createElement("li");
              li.textContent = s;
              ul.appendChild(li);
            });
            let done = false;
            const finish = (v) => {
              if (done) return;
              done = true;
              clearTimeout(timer);
              document.removeEventListener("keydown", onKey);
              if (v && box.querySelector("#cc-remember").checked) this._granted.add(appId);
              ov.remove();
              resolve(v);
            };
            const onKey = (e) => {
              if (e.key === "Escape") finish(false);
            };
            box.querySelector("#cc-yes").addEventListener("click", () => finish(true));
            box.querySelector("#cc-no").addEventListener("click", () => finish(false));
            ov.addEventListener("mousedown", (e) => {
              if (e.target === ov) finish(false);
            });
            document.addEventListener("keydown", onKey);
            const timer = setTimeout(() => finish(false), this.TIMEOUT);
          });
        }
      };
      Tasks = {
        skipped: /* @__PURE__ */ new Set(),
        _relayUrl: "http://127.0.0.1:43210",
        _relayProbe: null,
        sanitize(name) {
          return name.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, " ");
        },
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
            const keyName = taskKeys.find((k) => k.includes(key));
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
            const exeEntry = appData?.executables?.find((x) => x.os === "win32");
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
            Logger.log(`[FetchGame] Fallback for ${appName}: ${e?.message ?? e}`, "debug");
            const cleanName = this.sanitize(appName);
            const safeExe = `${cleanName.replace(/\s+/g, "")}.exe`;
            return {
              name: appName,
              exeName: safeExe,
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
          Logger.log(`[Task] Aborted "${t.name}": ${reason}`, "err");
          Tasks.skipped.add(q.id);
          setTimeout(() => Logger.removeTask(q.id), 2e3);
        },
        /* ── Relay & Bypass ─────────────────────────────────────── */
        _probeRelay() {
          return this._relayProbe ?? (this._relayProbe = (async () => {
            try {
              const r = await Promise.race([
                fetch(`${this._relayUrl}/health`, { method: "GET", redirect: "error" }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("probe timeout")), 800))
              ]);
              if (r.ok) Logger.log("[Bypass] Claw Relay detected on 127.0.0.1:43210.", "info");
              return r.ok;
            } catch (_) {
              return false;
            }
          })());
        },
        async _bypassPost(url, headers, jsonBody) {
          if (await this._probeRelay()) {
            const r = await fetch(`${this._relayUrl}/proxy`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url, headers, body: jsonBody }),
              redirect: "error"
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
              const appId = u.hostname.split(".")[0];
              const questId = headers["X-Discord-Quest-ID"];
              const referrer = headers["Referer"];
              if (u.pathname.endsWith("/acf/authorize")) {
                const { code } = JSON.parse(jsonBody);
                const r = await helper.discordsaysAuthorize({ appId, questId, authCode: code, referrer });
                if (!r.ok) throw { status: r.status, body: r.body };
                return { ok: true, status: r.status, body: r.body };
              }
              if (u.pathname.endsWith("/acf/quest/progress")) {
                const { progress } = JSON.parse(jsonBody);
                const token = headers["X-Auth-Token"];
                const r = await helper.discordsaysProgress({ appId, questId, token, target: progress, referrer });
                if (!r.ok) throw { status: r.status, body: r.body };
                return { ok: true, status: r.status, body: r.body };
              }
            }
          } catch (e) {
            if (e?.status) throw e;
            Logger.log(`[Bypass] VencordNative path errored: ${e?.message ?? e}`, "debug");
          }
          throw new Error("No bypass transport available (relay offline, no Vencord native)");
        },
        async bypassAchievement(q, t) {
          const appId = q.config?.application?.id;
          if (!appId || !/^\d+$/.test(String(appId))) {
            Logger.log(`[Bypass] Invalid or missing appId for "${t.name}". Skipping bypass.`, "warn");
            return false;
          }
          const appName = q.config?.application?.name ?? q.config?.messages?.questName ?? "Unknown App";
          const userApproved = await Consent.ask(appId, appName);
          if (!userApproved) {
            Logger.log(`[Bypass] User declined OAuth authorization for "${appName}". Skipping.`, "info");
            return false;
          }
          let preGrantIds = null;
          try {
            const before = await Mods.API.get({ url: "/oauth2/tokens" });
            preGrantIds = new Set((before?.body || []).map((tk) => tk.id));
          } catch (e) {
            Logger.log(`[Bypass] Could not snapshot existing grants. Aborting bypass to prevent unrevocable authorization.`, "warn");
            return false;
          }
          try {
            Logger.log(`[Bypass] Starting Discord Says bypass for "${t.name}"...`, "info");
            const authRes = await Mods.API.post({
              url: `/oauth2/authorize`,
              body: {
                client_id: appId,
                response_type: "code",
                redirect_uri: `https://${appId}.discordsays.com/`,
                scope: Consent.SCOPES.join(" "),
                permissions: "0",
                authorize: true,
                integration_type: 1,
                location_context: { guild_id: "10000", channel_id: "10000", channel_type: 1e4 }
              }
            });
            const location = authRes?.body?.location;
            if (!location) throw new Error("no location in /oauth2/authorize response");
            const authCode = new URL(location).searchParams.get("code");
            if (!authCode) throw new Error("no code in authorize location");
            const ticketRes = await Mods.API.post({ url: `/applications/${appId}/proxy-tickets`, body: {} });
            const proxyTicket = ticketRes?.body?.ticket;
            if (!proxyTicket) throw new Error("no proxy ticket");
            const referrer = `https://${appId}.discordsays.com/?instance_id=example-cl-instance&platform=desktop&discord_proxy_ticket=${encodeURIComponent(proxyTicket)}`;
            const dsAuthRes = await Tasks._bypassPost(
              `https://${appId}.discordsays.com/.proxy/acf/authorize`,
              { "Content-Type": "application/json", "X-Auth-Token": "", "X-Discord-Quest-ID": q.id, "Referer": referrer },
              JSON.stringify({ code: authCode })
            );
            let dsToken;
            try {
              dsToken = JSON.parse(dsAuthRes.body)?.token;
            } catch {
              throw new Error("discordsays returned non-JSON: " + String(dsAuthRes.body).slice(0, 120));
            }
            if (!dsToken) throw new Error("no discordsays token");
            await Tasks._bypassPost(
              `https://${appId}.discordsays.com/.proxy/acf/quest/progress`,
              { "Content-Type": "application/json", "X-Auth-Token": dsToken, "X-Discord-Quest-ID": q.id, "Referer": referrer },
              JSON.stringify({ progress: t.target })
            );
            Logger.log(`[Bypass] Success \u2014 "${t.name}" completed via Discord Says.`, "success");
            return true;
          } catch (e) {
            if (e instanceof TypeError && /failed to fetch|networkerror/i.test(e.message)) {
              Logger.log(`[Bypass] Discord's CSP blocks the script from reaching discordsays.com. Use the Vencord plugin port for the auto-bypass \u2014 userscript can't bypass CSP. Skipping "${t.name}".`, "warn");
              return false;
            }
            const code = e?.body?.code;
            if (code === 50165) {
              Logger.log(`[Bypass] "${t.name}" can't be launched (age-gated or delisted). Discord blocks the proxy ticket \u2014 nothing we can do.`, "warn");
              return false;
            }
            const parts = [];
            if (e?.status) parts.push(`HTTP ${e.status}`);
            if (code) parts.push(`code ${code}`);
            if (e?.body?.message) parts.push(e.body.message);
            else if (e?.message) parts.push(e.message);
            else if (typeof e === "string") parts.push(e);
            else if (e) {
              try {
                parts.push(JSON.stringify(e).slice(0, 200));
              } catch {
                parts.push(String(e));
              }
            }
            Logger.log(`[Bypass] Failed: ${parts.join(" \u2014 ") || "unknown"}`, "warn");
            return false;
          } finally {
            if (preGrantIds) {
              try {
                const after = await Mods.API.get({ url: "/oauth2/tokens" });
                const ours = (after?.body || []).filter((tk) => tk.application?.id === appId && !preGrantIds.has(tk.id));
                for (const g of ours) await Mods.API.del({ url: `/oauth2/tokens/${g.id}` });
              } catch (e) {
                Logger.log(`[Bypass] Deauthorize cleanup non-fatal: ${e?.message}`, "debug");
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
            cur = 0.2 + Math.random() * 0.05;
            try {
              await Traffic.enqueue(`/quests/${q.id}/video-progress`, { timestamp: Number(cur.toFixed(6)) });
              calls++;
            } catch (e) {
              Logger.log(`[Video] Initial ping failed: ${e.message}`, "debug");
            }
          }
          while (cur < t.target && RUNTIME.running) {
            const delayMs = rnd(3500, 4750);
            await sleep(delayMs);
            const elapsedSec = delayMs / 1e3 + (Math.random() * 0.02 - 0.01);
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
                Logger.log(`[Task] Video quest unavailable (HTTP ${err.status}). Skipping.`, "warn");
                return Tasks.failTask(q, t, `Client Error ${err.status}`);
              }
              if (failCount >= SYS.MAX_TASK_FAILURES) {
                return Tasks.failTask(q, t, "Too many network failures");
              }
              Logger.log(`[Task] VIDEO progress failed (${failCount}/${SYS.MAX_TASK_FAILURES}): ${err.message}`, "debug");
            }
            Logger.updateTask(q.id, { name: t.name, type: "VIDEO", cur, max: t.target, status: "RUNNING" });
            if (Date.now() - startTime > SYS.MAX_TIME) {
              return Tasks.failTask(q, t, "Timeout exceeded");
            }
          }
          if (RUNTIME.running) {
            Logger.log(`[Task] VIDEO "${t.name}" done in ${calls} API calls`, "debug");
            Tasks.finish(q, t);
          }
        },
        GAME(q, t, s) {
          return Tasks.generic(q, t, "GAME", "PLAY_ON_DESKTOP", s);
        },
        STREAM(q, t, s) {
          return Tasks.generic(q, t, "STREAM", "STREAM_ON_DESKTOP", s);
        },
        async generic(q, t, type, key, s) {
          if (!RUNTIME.running) return;
          const gameData = await this.fetchGameData(t.appId, t.name);
          return new Promise((resolve) => {
            const pid = rnd(2500, 12500) * 4;
            const game = {
              id: gameData.id,
              name: gameData.name,
              icon: gameData.icon,
              pid,
              pidPath: [pid],
              processName: gameData.name,
              start: Date.now(),
              exeName: gameData.exeName,
              exePath: gameData.exePath,
              cmdLine: gameData.cmdLine,
              executables: [{ os: "win32", name: gameData.exeName, is_launcher: false }],
              windowHandle: 0,
              fullscreenType: 0,
              overlay: true,
              sandboxed: false,
              hidden: false,
              isLauncher: false
            };
            let cleanupHook;
            let cleaned = false;
            let safetyTimer;
            if (type === "STREAM") {
              const real = Mods.StreamStore?.getStreamerActiveStreamMetadata;
              if (Mods.StreamStore) {
                Mods.StreamStore.getStreamerActiveStreamMetadata = () => ({ id: gameData.id, pid, sourceName: gameData.name });
              }
              cleanupHook = () => {
                if (Mods.StreamStore && real) Mods.StreamStore.getStreamerActiveStreamMetadata = real;
              };
            } else {
              Patcher.add(game);
              cleanupHook = () => Patcher.remove(game);
            }
            Logger.updateTask(q.id, { name: t.name, type, cur: 0, max: t.target, status: "RUNNING" });
            Logger.log(`[Task] Started ${type}: ${gameData.name}`, "info");
            const finish = () => {
              if (cleaned) return;
              cleaned = true;
              clearTimeout(safetyTimer);
              try {
                cleanupHook();
              } catch (e) {
                Logger.log(`[Task] Cleanup: ${e.message}`, "debug");
              }
              try {
                Mods.Dispatcher?.unsubscribe(CONST.EVT.HEARTBEAT, check);
              } catch (e) {
                Logger.log(`[Dispatcher] Unsubscribe failed: ${e.message}`, "debug");
              }
              RUNTIME.cleanups.delete(finish);
            };
            safetyTimer = setTimeout(() => {
              if (RUNTIME.running) Tasks.failTask(q, t, "Timeout exceeded (25m)");
              finish();
              resolve();
            }, SYS.MAX_TIME);
            const check = (d) => {
              if (!RUNTIME.running) {
                finish();
                resolve();
                return;
              }
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
            chan = Mods.ChanStore?.getSortedPrivateChannels()?.[0]?.id ?? Object.values(Mods.GuildChanStore?.getAllGuilds() ?? {}).find((g) => g?.VOCAL?.length)?.VOCAL?.[0]?.channel?.id;
          } catch (e) {
            Logger.log(`[Achievement] Channel lookup: ${e.message}`, "debug");
          }
          if (chan) {
            Logger.log(`[Task] Attempting heartbeat spoofing for "${t.name}"...`, "info");
            const key = `call:${chan}:${rnd(1e3, 9999)}`;
            let cur = 0;
            let failCount = 0;
            while (cur < t.target && RUNTIME.running) {
              try {
                const r = await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: false });
                cur = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.ACHIEVEMENT_IN_ACTIVITY?.value ?? cur;
                Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur, max: t.target, status: "RUNNING" });
                failCount = 0;
                if (cur >= t.target) {
                  try {
                    await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: true });
                  } catch (_) {
                  }
                  break;
                }
              } catch (e) {
                failCount++;
                const err = ErrorHandler.classify(e);
                if (err.isClientError) {
                  Logger.log(`[Achievement] Heartbeat rejected (HTTP ${err.status}). Falling back to bypass mode.`, "warn");
                  break;
                }
                if (failCount >= SYS.MAX_TASK_FAILURES) {
                  Logger.log(`[Achievement] Too many failures. Falling back to bypass mode.`, "warn");
                  break;
                }
              }
              await sleep(rnd(19e3, 22e3));
            }
            if (cur >= t.target && RUNTIME.running) return Tasks.finish(q, t);
          }
          if (!RUNTIME.running) return;
          const bypassed = await Tasks.bypassAchievement(q, t);
          if (bypassed) return Tasks.finish(q, t);
          if (!RUNTIME.running) return;
          Logger.log(`[Task] Skipping "${t.name}" \u2014 no auto-completion path worked (heartbeat rejected, bypass blocked). Likely age-gated/delisted on your account.`, "warn");
          return Tasks.failTask(q, t, "Cannot auto-complete");
        },
        async ACTIVITY(q, t) {
          let chan = null;
          try {
            chan = Mods.ChanStore?.getSortedPrivateChannels()?.[0]?.id ?? Object.values(Mods.GuildChanStore?.getAllGuilds() ?? {}).find((g) => g?.VOCAL?.length)?.VOCAL?.[0]?.channel?.id;
          } catch (e) {
            Logger.log(`[Task] ACTIVITY channel lookup error: ${e.message}`, "debug");
          }
          if (!chan) {
            return Tasks.failTask(q, t, "No voice channel found");
          }
          const key = `call:${chan}:${rnd(1e3, 9999)}`;
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
                try {
                  await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { stream_key: key, terminal: true });
                } catch (e) {
                  Logger.log(`[ACTIVITY] Final heartbeat failed: ${e?.message}`, "debug");
                }
                break;
              }
            } catch (e) {
              failCount++;
              const err = ErrorHandler.classify(e);
              if (err.isClientError) {
                Logger.log(`[Task] Activity quest unavailable (HTTP ${err.status}). Skipping.`, "warn");
                return Tasks.failTask(q, t, `Client Error ${err.status}`);
              }
              if (failCount >= SYS.MAX_TASK_FAILURES) {
                return Tasks.failTask(q, t, "Too many network failures");
              }
              Logger.log(`[Task] ACTIVITY heartbeat failed (${failCount}/${SYS.MAX_TASK_FAILURES}): ${err.message}`, "debug");
            }
            if (Date.now() - startTime > SYS.MAX_TIME) {
              return Tasks.failTask(q, t, "Timeout exceeded");
            }
            await sleep(rnd(19e3, 22e3));
          }
          if (RUNTIME.running && cur >= t.target) Tasks.finish(q, t);
        },
        async finish(q, t) {
          Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "COMPLETED" });
          Logger.log(`[Task] Completed "${t.name}"!`, "success");
          Sound.play("tick");
          try {
            if (typeof Notification !== "undefined") {
              if (Notification.permission === "default") {
                try {
                  await Notification.requestPermission();
                } catch (_) {
                }
              }
              if (Notification.permission === "granted") {
                new Notification("Claw: Quest Completed", { body: t.name, icon: "https://cdn.discordapp.com/emojis/1120042457007792168.webp", tag: `claw-${q.id}` });
              }
            }
          } catch (e) {
            Logger.log(`[Notification] ${e.message}`, "debug");
          }
          if (RUNTIME.autoClaim) {
            try {
              await sleep(rnd(2500, 6e3));
              if (!RUNTIME.running) return;
              const claimRes = await this.claimReward(q.id);
              if (claimRes?.body?.claimed_at) {
                Logger.log(`[Claim] Reward for "${t.name}" claimed automatically!`, "success");
                Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "CLAIMED" });
                setTimeout(() => Logger.removeTask(q.id), 2e3);
                return;
              }
            } catch (e) {
              const needsCaptcha = e?.body?.captcha_key || e?.body?.captcha_sitekey;
              if (needsCaptcha) {
                Logger.log(`[Claim] Captcha required for "${t.name}". Use UI button.`, "warn");
              } else {
                Logger.log(`[Claim] Auto-claim failed for "${t.name}": ${e?.body?.message ?? e?.message}`, "err");
              }
            }
          }
          Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "COMPLETED", claimable: true, questId: q.id });
        }
      };
    }
  });

  // src/logger.js
  var Logger;
  var init_logger = __esm({
    "src/logger.js"() {
      init_config();
      init_utils();
      init_discord();
      init_quests();
      Logger = {
        root: null,
        tasks: /* @__PURE__ */ new Map(),
        tickerId: null,
        animatedTasks: /* @__PURE__ */ new Set(),
        init() {
          const oldUI = document.getElementById("claw-ui");
          if (oldUI) oldUI.remove();
          const oldStyle = document.getElementById("claw-styles");
          if (oldStyle) oldStyle.remove();
          const savedPos = Storage.load("pos") ?? { top: "32px", left: "auto", right: "20px" };
          const style = document.createElement("style");
          style.id = "claw-styles";
          style.innerHTML = `
            @keyframes slideIn { from { transform: translateY(-10px) scale(0.99); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; max-height: 140px; margin-bottom: 12px; } to { opacity: 0; max-height: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; border-width: 0; } }
            @keyframes popIn { 0% { opacity: 0; transform: scale(0.98) translateY(4px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes slideRight { 0% { opacity: 0; transform: translateX(-10px); } 100% { opacity: 1; transform: translateX(0); } }
            @keyframes flipInX { 0% { opacity: 0; transform: perspective(400px) rotateX(6deg) translateY(6px); } 100% { opacity: 1; transform: perspective(400px) rotateX(0deg) translateY(0); } }
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
                --toggle-bg: rgba(255, 255, 255, 0.08);
                --toggle-knob: var(--text-secondary);
                position: fixed; top: ${savedPos.top}; left: ${savedPos.left}; right: ${savedPos.right}; width: 440px;
                background: var(--bg-panel);
                backdrop-filter: blur(32px) saturate(180%); -webkit-backdrop-filter: blur(32px) saturate(180%);
                color: var(--text-secondary); border-radius: 16px;
                font-family: "Inter Variable", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-feature-settings: "cv01", "ss03", "calt", "kern", "liga"; font-weight: 500; letter-spacing: 0.01em;
                z-index: 99999; box-shadow: var(--shadow-panel);
                overflow: hidden; animation: slideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column;
            }
            #claw-ui.claw-light {
                --bg-base: #f8fafc;
                --bg-panel: rgba(255, 255, 255, 0.4);
                backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                --bg-surface: rgba(0, 0, 0, 0.03);
                --bg-surface-hover: rgba(0, 0, 0, 0.06);
                --bg-elevated: rgba(255, 255, 255, 0.95);
                --text-primary: #0f172a;
                --text-secondary: #334155;
                --text-tertiary: #64748b;
                --text-quaternary: #94a3b8;
                --border-subtle: rgba(0, 0, 0, 0.06);
                --border-standard: rgba(0, 0, 0, 0.1);
                --accent: #4f46e5;
                --accent-bright: #6366f1;
                --accent-hover: #4338ca;
                --shadow-panel: 0 0 0 1px rgba(0,0,0,0.05), 0 32px 84px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1);
                --shadow-card: 0 0 0 1px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05);
                --toggle-bg: rgba(0, 0, 0, 0.15);
                --toggle-knob: #ffffff;
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
                box-shadow: var(--shadow-card); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background 0.4s ease, box-shadow 0.4s ease;
                animation: popIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) backwards;
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
                animation: popIn 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .claw-empty-eyebrow { color: var(--text-quaternary); font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 10px; }
            .claw-empty-title { color: var(--text-primary); font-size: 18px; font-weight: 510; line-height: 1.2; letter-spacing: -0.01em; margin-bottom: 8px; }
            .claw-empty-copy { color: var(--text-tertiary); font-size: 13px; line-height: 1.6; max-width: 280px; }

            .task-card {
                display: flex; gap: 14px; padding: 16px; background: rgba(255,255,255,0.02);
                border-radius: 14px; margin-bottom: 12px; border: none;
                transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), background 0.4s ease, box-shadow 0.4s ease;
                box-shadow: var(--shadow-card);
            }
            .task-card.animate-in { animation: flipInX 0.7s cubic-bezier(0.25, 1, 0.5, 1); }
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
            .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); width: 0%; transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1); box-shadow: 0 0 12px rgba(168, 85, 247, 0.5); }
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
            .claw-toggle .slider { position: absolute; inset: 0; background: var(--toggle-bg); border: 1px solid var(--border-standard); border-radius: 10px; transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .claw-toggle .slider::before { content: ''; position: absolute; height: 14px; width: 14px; left: 2px; bottom: 2px; background: var(--toggle-knob); border-radius: 50%; transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
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

            /* \u2500\u2500 Light theme overrides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
            #claw-ui.claw-light {
                --bg-base: #f2f3f5;
                --bg-panel: rgba(255, 255, 255, 0.85);
                --bg-surface: rgba(0, 0, 0, 0.03);
                --bg-surface-hover: rgba(0, 0, 0, 0.06);
                --bg-elevated: rgba(255, 255, 255, 0.9);
                --text-primary: #060607;
                --text-secondary: #2e3338;
                --text-tertiary: #6d6f78;
                --text-quaternary: #8a8c94;
                --border-subtle: rgba(0, 0, 0, 0.06);
                --border-standard: rgba(0, 0, 0, 0.1);
                --shadow-panel: 0 0 0 1px rgba(0,0,0,0.08), 0 32px 84px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
                --shadow-card: 0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06);
            }
            #claw-ui.claw-light .task-card { background: rgba(0,0,0,0.02); }
            #claw-ui.claw-light .task-card:hover { background: rgba(0,0,0,0.04); }
            #claw-ui.claw-light .task-card.active { background: rgba(99,102,241,0.06); }
            #claw-ui.claw-light .task-card.done { background: rgba(16,185,129,0.06); }
            #claw-ui.claw-light .task-card.failed { background: rgba(239,68,68,0.06); }
            #claw-ui.claw-light .task-card.pending { background: rgba(245,158,11,0.06); }
            #claw-ui.claw-light .ctrl-btn { background: rgba(0,0,0,0.03); box-shadow: 0 0 0 1px rgba(0,0,0,0.1); }
            #claw-ui.claw-light .ctrl-btn:hover { background: rgba(0,0,0,0.06); }
            #claw-ui.claw-light .ctrl-stop { box-shadow: 0 0 0 1px rgba(239,68,68,0.3); }
            #claw-ui.claw-light .ctrl-stop:hover { background: rgba(239,68,68,0.08); }
            #claw-ui.claw-light #claw-logs-wrap { background: rgba(0,0,0,0.02); }
            #claw-ui.claw-light .progress-track { background: rgba(0,0,0,0.08); border-color: rgba(0,0,0,0.06); }
            #claw-ui.claw-light .quest-pick-btn.toggle { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); }
            #claw-ui.claw-light .dev-badge { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.08); }
            #claw-ui.claw-light #claw-footer { background: rgba(0,0,0,0.02); }
            #claw-ui.claw-light .summary-item { background: rgba(0,0,0,0.03); }
            #claw-ui.claw-light .summary-item:hover { background: rgba(0,0,0,0.06); }
            #claw-ui.claw-light .claw-empty { background: radial-gradient(ellipse at top right, rgba(113,112,255,0.04), transparent 50%), rgba(255,255,255,0.6); }
        `;
          document.head.appendChild(style);
          this.root = document.createElement("div");
          this.root.id = "claw-ui";
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
            <div id="claw-body">${this.getEmptyStateHTML("System", "Initializing control center", "Scanning Discord modules and preparing quest runners.")}</div>
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
          const applyTheme = () => {
            const html = document.documentElement;
            const isLight = html.classList.contains("theme-light") || html.dataset.theme === "light";
            this.root.classList.toggle("claw-light", isLight);
          };
          applyTheme();
          this._themeObserver = new MutationObserver(applyTheme);
          this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
          const head = document.getElementById("claw-head");
          let isDragging = false, startX, startY, initialLeft, initialTop;
          head.onmousedown = (e) => {
            if (e.target.closest?.(".ctrl-btn")) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.root.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            this.root.style.left = `${initialLeft}px`;
            this.root.style.top = `${initialTop}px`;
            this.root.style.right = "auto";
            e.preventDefault();
          };
          document.onmousemove = (e) => {
            if (!isDragging) return;
            this.root.style.left = `${initialLeft + (e.clientX - startX)}px`;
            this.root.style.top = `${initialTop + (e.clientY - startY)}px`;
          };
          document.onmouseup = () => {
            if (isDragging) {
              isDragging = false;
              Storage.save("pos", { top: this.root.style.top, left: this.root.style.left, right: "auto" });
            }
          };
          const logsWrap = document.getElementById("claw-logs-wrap");
          const logsHead = document.getElementById("claw-logs-head");
          if (logsHead && logsWrap) {
            logsHead.addEventListener("click", () => {
              logsWrap.classList.toggle("collapsed");
            });
          }
          document.getElementById("claw-body").addEventListener("click", async (e) => {
            if (e.target.classList.contains("goto-btn")) {
              if (Mods.Router) Mods.Router.transitionTo("/quest-home");
              return;
            }
            const btn = e.target.closest?.(".claim-btn");
            if (!btn || btn.disabled) return;
            const questId = btn.getAttribute("data-id");
            const taskData = this.tasks.get(questId);
            if (!taskData) return;
            btn.innerText = "WAITING...";
            btn.disabled = true;
            this.updateTask(questId, { ...taskData, claimState: "WAITING" });
            try {
              const claimRes = await Tasks.claimReward(questId);
              if (claimRes?.body?.claimed_at) {
                btn.innerText = "CLAIMED!";
                btn.style.background = CONFIG.SUCCESS;
                this.log(`[Claim] Reward for "${taskData.name}" claimed successfully!`, "success");
                this.updateTask(questId, { ...taskData, status: "CLAIMED", claimable: false, claimState: null });
                setTimeout(() => this.removeTask(questId), 2e3);
              }
            } catch (err) {
              this.log(`[Claim] Action required for "${taskData.name}". Check Discord UI for captcha.`, "warn");
              this.updateTask(questId, { ...taskData, claimState: "FAILED" });
            }
          });
          document.getElementById("claw-close").onclick = () => this.toggle();
          document.getElementById("claw-stop").onclick = () => this.shutdown();
          document.addEventListener("keydown", (e) => (e.key === ">" || e.shiftKey && e.key === ".") && this.toggle());
          this.startTicker();
        },
        toggle() {
          this.root.style.display = this.root.style.display === "none" ? "flex" : "none";
        },
        shutdown() {
          if (!RUNTIME.running) return;
          RUNTIME.running = false;
          this.log("[System] Stopping script & cleaning up...", "warn");
          if (this.tickerId) clearInterval(this.tickerId);
          for (const cleanupFn of RUNTIME.cleanups) {
            try {
              cleanupFn();
            } catch (e) {
              this.log(`[Cleanup] ${e.message}`, "debug");
            }
          }
          RUNTIME.cleanups.clear();
          Patcher.clean();
          if (this._themeObserver) {
            this._themeObserver.disconnect();
            this._themeObserver = null;
          }
          setTimeout(() => {
            const styles = document.getElementById("claw-styles");
            if (styles) styles.remove();
            if (this.root?.parentElement) this.root.remove();
            window.clawLock = false;
          }, 1e3);
        },
        _getPct(t) {
          if (t.done) return 100;
          if (t.pending || t.failed || !t.max) return 0;
          return Math.min(100, t.cur / t.max * 100);
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
          }, 1e3);
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
          const summary = document.getElementById("claw-summary");
          if (!summary) return;
          const counts = this.getTaskSummary();
          if (summary.children.length === 4) {
            summary.children[0].querySelector(".summary-value").textContent = counts.running;
            summary.children[1].querySelector(".summary-value").textContent = counts.queued;
            summary.children[2].querySelector(".summary-value").textContent = counts.done;
            summary.children[3].querySelector(".summary-value").textContent = counts.failed;
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
                <div class="claw-empty-eyebrow">${esc(eyebrow)}</div>
                <div class="claw-empty-title">${esc(title)}</div>
                <div class="claw-empty-copy">${esc(description)}</div>
            </div>
        `;
        },
        getTaskMetaLabel(task) {
          if (task.pending) return "In Queue";
          if (task.failed) return "Aborted";
          const labels = {
            WATCH_VIDEO: "Video quest",
            VIDEO: "Video quest",
            GAME: "Desktop game",
            STREAM: "Desktop stream",
            ACTIVITY: "Voice activity",
            ACHIEVEMENT: "Activity achievement"
          };
          return labels[task.type] ?? "Quest progress";
        },
        updateTask(id, data) {
          const oldData = this.tasks.get(id);
          const isPending = data.status === "PENDING" || data.status === "QUEUE";
          const isDone = data.status === "COMPLETED" || data.status === "CLAIMED";
          const isFailed = data.status === "FAILED";
          const newData = { ...oldData, ...data, done: isDone, pending: isPending, failed: isFailed };
          this.tasks.set(id, newData);
          if (oldData && oldData.status === newData.status && oldData.removing === newData.removing && oldData.claimable === newData.claimable && oldData.claimState === newData.claimState && oldData.actionRequired === newData.actionRequired) {
            const card = document.getElementById(`claw-task-${id}`);
            if (card) {
              const pct = this._getPct(newData).toFixed(1);
              const fill = card.querySelector(".progress-fill");
              if (fill) fill.style.width = `${pct}%`;
              const unit = newData.type === "ACHIEVEMENT" ? "" : "s";
              const progressText = card.querySelector(".progress-text") || card.querySelectorAll(".task-meta span")[1];
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
            setTimeout(() => {
              this.tasks.delete(id);
              this.render();
            }, 500);
          }
        },
        log(msg, type = "info") {
          const colors = { info: "#a5b4fc", success: "#34d399", warn: "#fbbf24", err: "#ef4444", debug: "#62666d" };
          console.log(`%c[CLAW] %c${msg}`, `color: ${CONFIG.THEME}; font-weight: bold;`, `color: ${colors[type] || colors.info}`);
          try {
            const box = document.getElementById("claw-logs");
            if (box && type !== "debug") {
              const el = document.createElement("div");
              const ts = document.createElement("span");
              const text = document.createElement("span");
              el.className = `log-item c-${type}`;
              ts.className = "log-ts";
              text.className = "log-text";
              ts.textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
              text.textContent = msg;
              el.appendChild(ts);
              el.appendChild(text);
              box.appendChild(el);
              box.scrollTop = box.scrollHeight;
              while (box.children.length > CONFIG.MAX_LOG_ITEMS) box.firstChild.remove();
            }
          } catch (e) {
            console.debug("[Logger] DOM error:", e.message);
          }
        },
        render() {
          const body = document.getElementById("claw-body");
          if (!body) return;
          if (body.querySelector("#claw-quest-list")) return;
          this.renderSummary();
          if (!this.tasks.size) {
            body.innerHTML = this.getEmptyStateHTML("Queue", "Waiting for tasks", "Waiting for the next eligible quest or manual reward action.");
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
            else if (t.type === "VIDEO" || t.type === "WATCH_VIDEO") icon = ICONS.VIDEO;
            else if (t.type === "ACHIEVEMENT") icon = ICONS.ACTIVITY;
            else if (t.type?.includes("GAME")) icon = ICONS.GAME;
            else if (t.type?.includes("STREAM")) icon = ICONS.STREAM;
            let statusText = t.status === "CLAIMED" ? "CLAIMED" : t.done ? "DONE" : t.status;
            let progressLabel = this.getTaskMetaLabel(t);
            const unit = t.type === "ACHIEVEMENT" ? "" : "s";
            let actionBtn = "";
            if (t.claimable) {
              if (t.claimState === "WAITING") actionBtn = `<button class="claim-btn" disabled>WAITING...</button>`;
              else if (t.claimState === "FAILED") actionBtn = `<button class="claim-btn failed" disabled>ACTION REQUIRED</button>`;
              else actionBtn = `<button class="claim-btn" data-id="${id}" type="button">CLAIM REWARD</button>`;
            } else if (t.actionRequired === "ENROLL") {
              statusText = "ACTION REQUIRED";
              progressLabel = "Accept quest in Discord";
              actionBtn = `<button class="goto-btn" type="button">GO TO QUESTS</button>`;
            } else if (t.type === "ACHIEVEMENT" && t.status === "RUNNING" && t.actionRequired) {
              statusText = "ACTION REQUIRED";
              progressLabel = "Please, complete manually";
              actionBtn = `<button class="goto-btn" type="button">GO TO QUESTS</button>`;
            }
            const stateClass = t.done ? "done" : t.failed ? "failed" : t.pending ? "pending" : "active";
            const removingClass = t.removing ? "removing" : "";
            let animClass = "";
            if (!this.animatedTasks.has(id)) {
              this.animatedTasks.add(id);
              animClass = "animate-in";
            }
            return `<div id="claw-task-${id}" class="task-card ${stateClass} ${removingClass} ${animClass}"><div class="task-icon">${icon}</div><div class="task-info"><div class="task-top"><div class="task-name" title="${esc(t.name)}">${esc(t.name)}</div><div class="task-status">${statusText}</div></div><div class="task-meta"><span class="task-kind">${progressLabel}</span><span class="progress-text">${Math.floor(t.cur)} / ${t.max}${unit}</span></div><div class="progress-track"><div class="progress-fill" style="width: ${pct}%"></div></div>${actionBtn}</div></div>`;
          }).join("");
        }
      };
    }
  });

  // src/main.js
  var require_main = __commonJS({
    "src/main.js"() {
      init_config();
      init_utils();
      init_logger();
      init_discord();
      init_network();
      init_quests();
      init_sound();
      if (window.clawLock) {
        console.warn("[Claw] Script is already running or didn't shut down properly. Please reload Discord (Ctrl+R).");
      } else {
        let showQuestPicker = function(quests) {
          return new Promise((resolve) => {
            const body = document.getElementById("claw-body");
            const incomplete = quests.filter(
              (q) => !q.userStatus?.completedAt && notExpired(q) && q.id !== CONST.ID && !Tasks.skipped.has(q.id)
            );
            const items = [];
            incomplete.forEach((q) => {
              const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
              const td = cfg?.tasks ? Tasks.detectType(cfg, q.config?.application?.id) : null;
              if (!td) return;
              if (!SYS.IS_DESKTOP && (td.type === "GAME" || td.type === "STREAM")) return;
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
            const rewardTypes = [...new Set(items.map((q) => q.rt))].sort();
            const meta = (rt) => REWARD_META[rt] ?? REWARD_FALLBACK;
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
                            ${rewardTypes.map((rt) => {
                const m = meta(rt);
                return `<button class="reward-filter" data-rt="${rt}" style="border-color:${m.color};color:${m.color};">${m.label} (${items.filter((q) => q.rt === rt).length})</button>`;
              }).join("")}
                        </div>
                        <div id="claw-quest-list" style="max-height: 160px; overflow-y: auto; padding-right: 8px;">
                            ${items.map((q) => {
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
              }).join("")}
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
            const $ = (sel) => body.querySelector(sel);
            const $$ = (sel) => [...body.querySelectorAll(sel)];
            const syncStartBtn = () => {
              if (!items.length) return;
              const n = $$("input[data-qid]:checked").length;
              const btn = $("#claw-start-btn");
              btn.innerHTML = `${ICONS.BOLT} START (${n})`;
              btn.classList.toggle("disabled", items.length > 0 && n === 0);
            };
            const syncToggleLabel = () => {
              if (!items.length) return;
              const visible = $$(".quest-pick:not(.hidden)");
              const allChecked = visible.length > 0 && visible.every((c) => c.querySelector("input").checked);
              $("#claw-toggle-all").textContent = allChecked ? "DESELECT ALL" : "SELECT ALL";
            };
            if (items.length) {
              $$("input[data-qid]").forEach((cb) => cb.addEventListener("change", () => {
                syncStartBtn();
                syncToggleLabel();
              }));
              const filters = Object.fromEntries(rewardTypes.map((rt) => [rt, true]));
              $$(".reward-filter").forEach((btn) => {
                btn.addEventListener("click", () => {
                  const rt = Number(btn.dataset.rt);
                  filters[rt] = !filters[rt];
                  btn.classList.toggle("off", !filters[rt]);
                  $$(`.quest-pick[data-rt="${rt}"]`).forEach((card) => {
                    card.classList.toggle("hidden", !filters[rt]);
                    card.querySelector("input").checked = filters[rt];
                  });
                  syncStartBtn();
                  syncToggleLabel();
                });
              });
              $("#claw-toggle-all").addEventListener("click", () => {
                const visible = $$(".quest-pick:not(.hidden)");
                const allChecked = visible.length > 0 && visible.every((c) => c.querySelector("input").checked);
                visible.forEach((c) => {
                  c.querySelector("input").checked = !allChecked;
                });
                syncToggleLabel();
                syncStartBtn();
              });
            }
            $("#claw-start-btn").addEventListener("click", async () => {
              const selected = /* @__PURE__ */ new Set();
              if (items.length) {
                $$("input[data-qid]:checked").forEach((cb) => selected.add(cb.dataset.qid));
              }
              const options = {
                autoEnroll: $("#opt-enroll").checked,
                autoClaim: $("#opt-claim").checked,
                playSound: $("#opt-sound").checked,
                notify: $("#opt-notify").checked,
                randomDelay: $("#opt-delay")?.checked ?? false
              };
              if (options.notify) {
                try {
                  if (Notification.permission === "default") {
                    await Notification.requestPermission();
                  }
                } catch (e) {
                  Logger.log(`[Notification] Request permission failed: ${e.message}`, "debug");
                }
              }
              const logsWrap = document.getElementById("claw-logs-wrap");
              if (logsWrap) logsWrap.classList.remove("collapsed");
              body.classList.add("fade-out");
              await sleep(250);
              body.innerHTML = Logger.getEmptyStateHTML("System", "Starting up...", "Preparing selected quests.");
              body.classList.remove("fade-out");
              resolve({ selected, options });
            });
          });
        };
        window.clawLock = true;
        async function runConcurrent(tasks, limit) {
          const executing = /* @__PURE__ */ new Set();
          for (const task of tasks) {
            if (!RUNTIME.running) break;
            const p = task().finally(() => executing.delete(p));
            executing.add(p);
            await sleep(rnd(1500, 4e3));
            if (executing.size >= limit) await Promise.race(executing);
          }
          return Promise.allSettled(executing);
        }
        const REWARD_META = { 1: { label: "In-Game Item", color: "var(--warn-bright)" }, 3: { label: "Avatar Decoration", color: "var(--accent-bright)" }, 4: { label: "Orbs", color: "var(--success-bright)" }, 99: { label: "Manual Achievement", color: "var(--danger-bright)" } };
        const REWARD_FALLBACK = { label: "Other", color: "var(--text-tertiary)" };
        async function main() {
          Logger.init();
          if (!loadModules()) return Logger.log("[System] Failed to load Discord modules. Aborting.", "err");
          const getQuests = () => {
            const q = Mods.QuestStore.quests;
            return q instanceof Map ? [...q.values()] : Object.values(q || {});
          };
          let waitAttempts = 0;
          while (getQuests().length === 0 && waitAttempts < 15 && RUNTIME.running) {
            Logger.log("[System] Waiting for Discord to fetch quests...", "debug");
            await sleep(1e3);
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
            Logger.log(`[System] ${selected.size} quest(s) selected. Auto-enroll: ${options.autoEnroll ? "ON" : "OFF"}, Auto-claim: ${options.autoClaim ? "ON" : "OFF"}`, "info");
          } else {
            Logger.log("[System] No quests selected. Shutting down.", "info");
            return Logger.shutdown();
          }
          let loopCount = 1;
          let isIdle = false;
          while (RUNTIME.running) {
            try {
              const quests = getQuests();
              const active = quests.filter(
                (q) => !q.userStatus?.completedAt && notExpired(q) && q.id !== CONST.ID && !Tasks.skipped.has(q.id) && (!RUNTIME.selectedQuests || RUNTIME.selectedQuests.has(q.id))
              );
              const needsAction = [...Logger.tasks.values()].some((t) => t.claimable || t.actionRequired || t.claimState === "WAITING" || t.claimState === "FAILED");
              if (!active.length && !needsAction) {
                if (!isIdle) {
                  Logger.log("[System] All available quests are completed! Waiting for new ones...", "success");
                  Sound.play("done");
                  isIdle = true;
                }
                await sleep(rnd(15e3, 2e4));
                continue;
              }
              isIdle = false;
              Logger.log(`[Cycle] Starting loop #${loopCount}...`, "info");
              const queues = { video: [], game: [] };
              active.forEach((q) => {
                try {
                  const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
                  if (!cfg?.tasks || typeof cfg.tasks !== "object") {
                    Logger.log(`[Quest] ${q.id} has invalid task config. Skipping.`, "warn");
                    return;
                  }
                  const typeData = Tasks.detectType(cfg, q.config?.application?.id);
                  if (!typeData) {
                    Logger.log(`[Quest] "${q.config?.messages?.questName}" has an unknown task type. Skipping.`, "warn");
                    return;
                  }
                  if (!SYS.IS_DESKTOP && (typeData.type === "GAME" || typeData.type === "STREAM")) {
                    Logger.log(`[Quest] "${q.config?.messages?.questName}" requires desktop app. Skipping.`, "warn");
                    return;
                  }
                  const { type, keyName, target } = typeData;
                  if (target <= 0) {
                    Logger.log(`[Quest] "${q.config?.messages?.questName}" has invalid target (${target}). Skipping.`, "warn");
                    return;
                  }
                  const tInfo = { id: q.id, appId: q.config?.application?.id ?? 0, name: q.config?.messages?.questName ?? "Unknown Quest", target, type, keyName };
                  if (!q.userStatus?.enrolledAt && !RUNTIME.autoEnroll) {
                    Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "PENDING", actionRequired: "ENROLL" });
                    return;
                  }
                  if (Logger.tasks.has(q.id) && Logger.tasks.get(q.id).status === "RUNNING") return;
                  Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "QUEUE", actionRequired: null });
                  const taskFunc = async () => {
                    if (!q.userStatus?.enrolledAt) {
                      Logger.log(`[Enroll] Accepting quest: ${tInfo.name}`, "info");
                      try {
                        await Traffic.enqueue(`/quests/${q.id}/enroll`, { location: 11, is_targeted: false });
                        await sleep(rnd(800, 1500));
                      } catch (e) {
                        const err = ErrorHandler.classify(e);
                        if (ErrorHandler.isSkippableQuest(e)) {
                          Tasks.skipped.add(q.id);
                          Logger.log(`[Enroll] ${tInfo.name} unavailable (${err.status}). Skipping.`, "warn");
                        } else {
                          Logger.log(`[Enroll] Failed for ${tInfo.name}: ${err.message}`, "err");
                        }
                        return Tasks.failTask(q, tInfo, `Enrollment failed`);
                      }
                    }
                    if (type === "WATCH_VIDEO") return Tasks.VIDEO(q, tInfo, q.userStatus);
                    if (type === "ACHIEVEMENT") return Tasks.ACHIEVEMENT(q, tInfo);
                    const runner = type === "STREAM" ? Tasks.STREAM : type === "ACTIVITY" ? Tasks.ACTIVITY : Tasks.GAME;
                    return runner(q, tInfo, q.userStatus);
                  };
                  if (type === "WATCH_VIDEO") queues.video.push(taskFunc);
                  else queues.game.push(taskFunc);
                } catch (e) {
                  Logger.log(`[Quest] Error processing ${q.id}: ${e.message}`, "err");
                }
              });
              const totalTasks = queues.video.length + queues.game.length;
              if (totalTasks > 0) {
                Logger.log(`[Cycle] Processing: ${queues.video.length} videos, ${queues.game.length} games.`, "info");
                const pGames = runConcurrent(queues.game, CONFIG.GAME_CONCURRENCY);
                const pVideos = runConcurrent(queues.video, CONFIG.VIDEO_CONCURRENCY);
                await Promise.all([pGames, pVideos]);
              } else {
                if (needsAction) {
                  Logger.log("[System] Waiting for manual reward claim or action...", "warn");
                  await sleep(rnd(5e3, 8e3));
                }
              }
              if (!RUNTIME.running) break;
              Logger.log(`[Cycle] Loop #${loopCount} complete. Waiting before rescan...`, "info");
              await sleep(rnd(2500, 4500));
              loopCount++;
            } catch (cycleError) {
              Logger.log(`[Cycle] Error in loop #${loopCount}: ${cycleError?.message ?? cycleError}`, "err");
              await sleep(3e3);
              loopCount++;
            }
          }
          const unclaimed = [...Logger.tasks.values()].some((t) => t.claimable || t.claimState === "WAITING");
          if (unclaimed) {
            Logger.log("[System] Waiting for pending reward claims before shutdown...", "info");
            while ([...Logger.tasks.values()].some((t) => t.claimable || t.claimState === "WAITING")) {
              await sleep(3e3);
            }
          }
          Logger.shutdown();
        }
        main().catch((e) => {
          const msg = e?.message ?? e?.toString?.() ?? "Unknown fatal error";
          console.error("[Claw Fatal]", e);
          try {
            Logger.log(`[System] FATAL: ${msg}`, "err");
          } catch (_) {
          }
          Logger.shutdown();
          setTimeout(() => {
            window.clawLock = false;
          }, 1500);
        });
      }
    }
  });
  require_main();
})();
