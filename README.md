<div align="center">

# ⚡ CLAW

**The ultimate zero-dependency quest automation engine for Discord.**

[![Build](https://img.shields.io/badge/Build-v4.6.3-5865F2?style=for-the-badge&logo=discord&logoColor=white)](#)
[![Status](https://img.shields.io/badge/Status-Undetected-success?style=for-the-badge)](#)

*Claw instantly auto-completes Game, Video, Stream, Activity, and Achievement quests right from a sleek, built-in dashboard.*

</div>

<br/>

## ✨ Why Claw?

Unlike heavy desktop applications or sketchy executables, Claw runs entirely within Discord's own Developer Console. 

- **Premium Glass UI:** A beautiful, draggable dashboard featuring glassmorphism, dynamic 3D animations, and neon gradients, built to feel like a native app.
- **Quest Picker:** Don't want to run everything? Selectively filter, select, and run only the quests you want.
- **Smart Automation:** Toggle auto-enroll, auto-claim, and completion sounds right from the dashboard.
- **Live Activity Console:** Track the engine's internal operations in real-time with a built-in collapsible log.
- **Universal Support:** Crushes *every* quest type Discord throws at you, bypassing rate limits with exponential backoff.
- **Update-Proof:** Dynamically maps internal webpack classes so it survives Discord client updates.

<br/>

## 🚀 Quick Start

Standard Discord locks the Developer Console by default. We've included a streamlined script to safely unlock it.

### Step 1: Unlock the Console
Locate and double-click the **`enable-devtools.bat`** (or `.reg`) file included in this repository. 
> *This automatically enables the developer tools (on Stable, PTB, and Canary) and restarts the app for you.*

### Step 2: Inject the Engine
Open the **[`index.js`](https://raw.githubusercontent.com/l-limon-l/Claw/refs/heads/main/index.js)** file in your browser, select all the text (`Ctrl + A`), and copy it (`Ctrl + C`).

### Step 3: Launch
1. Inside Discord, press `Ctrl + Shift + I` to open the Developer Tools.
2. Click on the **Console** tab at the top.
3. Paste the code and hit **Enter**.

<br/>

## 🕹️ Controls

Once injected, Claw runs quietly in the background. A beautiful, draggable dashboard will appear to give you full control.

| Action | Shortcut / Behavior |
| :--- | :--- |
| **Toggle Dashboard** | Press `Shift + .` to show or hide the UI at any time. |
| **Start Quests** | Pick your quests, toggle your options, and hit the **Start** button. |
| **Live Logs** | Click on **Activity Log** to expand/collapse the live console. |
| **Claim Rewards** | Click the **Claim** button directly on the quest card when a task finishes. |
| **Stop Engine** | Click the red **Stop** icon in the UI to gracefully shut down Claw. |

<br/>

## ⚠️ Important Disclaimer

> Automating interactions technically violates Discord’s Terms of Service. This tool is provided strictly for **educational and research purposes**. The developer is not responsible for any account restrictions or bans. Please use responsibly.

<br/>

---

<div align="center">
  <p>Engineered with 💜 by <a href="https://e-z.bio/l_limon_l"><strong>l_limon_l</strong></a></p>
</div>
