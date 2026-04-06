<div align="center">
# Claw

**Auto-complete every Discord Quest in seconds** &mdash; v4.3

[![Version](https://img.shields.io/badge/v4.4-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://github.com/nyxxbit/discord-quest-completer)

Completes all Discord Quests automatically &mdash; game, video, stream, activity, and achievement quests. Paste one script into DevTools, get every reward. No installs, no tokens, no dependencies.

**Works on every Discord update** &mdash; no hardcoded paths, uses `constructor.displayName` for resilient module detection.

[Get Started](#quick-start) &bull; [How It Works](#how-it-works) &bull; [Configuration](#configuration)

</div>

---

## Why Claw?

- **Completes ALL quest types** &mdash; Video, Game, Stream, Activity, and the new Achievement quests
- **Auto-claiming** &mdash; Claim rewards directly from the dashboard. Tries to claim automatically (if enabled), or provides a smart interactive button if captcha is needed
- **Resilient module loader** &mdash; finds Discord stores by class name, not minified paths. Survives Discord updates
- **Smart rate limiting** &mdash; exponential backoff on 429/5xx, skip-list for dead quests, adaptive video speed. Distinguishes between global and endpoint limits, non-blocking retries
- **Fault-tolerant execution** &mdash; One failed quest won't break the queue (`Promise.allSettled`)
- **Zero setup** &mdash; single paste into the console. No Node.js, no npm, no extensions

---

## Quick start

**1.** Open Discord ([Canary](https://canary.discord.com/download) recommended &mdash; console enabled by default)

**2.** Press `Ctrl + Shift + I` &rarr; Console tab

**3.** Paste and hit Enter
```js
fetch('https://raw.githubusercontent.com/l-limon-l/Claw/refs/heads/main/index.js').then(r => r.text()).then(eval);
```


> `Shift + .` toggles the dashboard. Click **STOP** to kill it instantly.

<details>
<summary>Enable console on stable Discord</summary>

Close Discord, edit `%appdata%/discord/settings.json`:

```json
{ "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true }
```

Restart Discord.
</details>

---

## How it works

Claw extracts Discord's internal webpack stores (`QuestStore`, `RunStore`, `Dispatcher`, etc.) and uses them to spoof game processes, send fake video progress, and dispatch heartbeat signals &mdash; all through Discord's own authenticated API client.

```
QuestStore → filter incomplete → auto-enroll → dispatch tasks → poll progress → auto-claim → done
```

| Quest type | What Claw does |
|------------|----------------|
| **Video** | Sends fake `video-progress` timestamps with adaptive speed (6-22 API calls instead of 180) |
| **Game** | Injects a spoofed process into `RunStore` with real metadata from Discord's app registry |
| **Stream** | Patches `StreamStore.getStreamerActiveStreamMetadata` with synthetic stream data |
| **Activity** | Heartbeats against a voice channel to simulate participation |
| **Achievement** | Monitors `ACHIEVEMENT_IN_ACTIVITY` events &mdash; requires joining the Activity manually |

---

## Dashboard

Draggable overlay with persistent position. Live-sorts tasks so you always see what matters:

| Priority | State | Visual |
|----------|-------|--------|
| 1st | **Running** (highest progress first) | Blue accent, animated progress bar |
| 2nd | **Queued** | Orange accent, dimmed |
| 3rd | **Completed** | Green checkmark + Interactive CLAIM button if manual action needed |

Desktop notifications fire on each quest completion.

---

## Auto & In-UI Claiming

You can configure Claw's claiming behavior via the `TRY_TO_CLAIM_REWARD` setting.

- **Automated Claiming:** If enabled, tries to claim instantly upon completion.
- **In-UI Button:** If auto-claim fails due to captcha, or is disabled, a **CLAIM REWARD** button appears directly on the task card.

---

## Configuration

Tweak before pasting. Timing values, intervals, and sensitive limits are now hardcoded internally to prevent accidental breakage.

```js
const CONFIG = {
    TRY_TO_CLAIM_REWARD: false,  // disable auto-claim to avoid captcha popups
    HIDE_ACTIVITY: false,        // suppress "Playing..." from friends list
    GAME_CONCURRENCY: 1,         // >1 risks detection and ban, keep at 1
    VIDEO_CONCURRENCY: 2,        // parallel video tasks
    MAX_LOG_ITEMS: 60,           // UI log limit
};
```

---

## Error handling

| Scenario | Behavior |
|----------|----------|
| **429 / 5xx** | Exponential backoff, re-queued up to `MAX_RETRIES`, distinguishes global vs endpoint limits |
| **404 on enroll** | Quest added to skip-list, script continues |
| **Repeated failures** | Task abandoned after `MAX_TASK_FAILURES` consecutive errors |
| **25 min timeout** | Task force-stopped, cycle advances |
| **Missing modules** | Required modules validated on boot; optional ones log a warning |
| **Claim fails** | Falls back to CLAIM button in dashboard |
| **Fatal crash** | Unconditionally releases `window.ClawLock` so the script can be re-run without refreshing |

---

## Architecture

Single-file IIFE. No build tools, no external deps.

```
index.js
├─ CONFIG / SYS / RUNTIME      tunables, frozen system limits, active cleanups
├─ ErrorHandler                classifies HTTP errors (retry / skip / fatal)
├─ Logger                      DOM dashboard + task state + log output
├─ Traffic                     FIFO request queue with exponential backoff
├─ Patcher                     RunStore / StreamStore monkey-patching
├─ Tasks                       VIDEO, GAME, STREAM, ACTIVITY, ACHIEVEMENT handlers
├─ loadModules()               resilient webpack extraction via constructor.displayName
└─ main()                      enroll → discover → execute → claim → loop
```

### Module detection

Unlike other scripts that break on every Discord update, Claw finds stores by their **class name** (`QuestStore`, `RunningGameStore`, etc.) via `constructor.displayName`. The Dispatcher is found by structural signature (`_subscriptions` + `subscribe` + `dispatch`), and the API client by its unique `.del` method. No hardcoded minified paths.

---
## Disclaimer

This tool is for **educational and research purposes only**. Automating user actions violates Discord's [Terms of Service](https://discord.com/terms). The developer is not responsible for any account suspensions or bans. Use at your own risk.

---

<div align="center">

Built by [**l_limon_l**](https://e-z.bio/l_limon_l)

If this helped you, drop a star &mdash; it keeps the project alive.

</div>
