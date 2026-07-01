<div align="center">

# ⚡ CLAW (Cloud Edition)

**The ultimate zero-dependency quest automation engine for Discord.**

[![Build](https://img.shields.io/badge/Build-v4.6.3-5865F2?style=for-the-badge&logo=discord&logoColor=white)](#)
[![Status](https://img.shields.io/badge/Status-Undetected-success?style=for-the-badge)](#)

*Claw instantly auto-completes Game, Video, Stream, Activity, and Achievement quests right from a sleek, built-in dashboard.*

</div>

<br/>

## ✨ Why Claw?

No need to open Developer Tools, copy-paste code, or install heavy Node.js dependencies. Claw now runs using a self-contained, automated injector that fetches the latest code directly from the cloud.

- **One-Click Cloud Injection:** Simply run the batch file. It automatically restarts Discord in debug mode, downloads the latest Claw payload from GitHub, and injects it seamlessly.
- **Premium Glass UI:** A beautiful, draggable dashboard featuring glassmorphism, dynamic 3D animations, and neon gradients, built to feel like a native app.
- **Quest Picker:** Don't want to run everything? Selectively filter, select, and run only the quests you want.
- **Smart Automation:** Toggle auto-enroll, auto-claim, and completion sounds right from the dashboard.
- **Live Activity Console:** Track the engine's internal operations in real-time with a built-in collapsible log.
- **Universal Support:** Crushes *every* quest type Discord throws at you, bypassing rate limits with exponential backoff.
- **Update-Proof:** Dynamically maps internal webpack classes so it survives Discord client updates.

<br/>

## 🚀 Quick Start

Using Claw is now easier than ever. You only need a single file.

### Step 1: Download the Injector
Download the **`start_claw.bat`** file from this repository to your computer.

### Step 2: Run it!
Double-click **`start_claw.bat`**. 
> *The script will automatically close your current Discord session, launch a fresh instance with remote debugging enabled, and inject the Claw engine straight from the cloud. Once the console says `Injection successful!`, you can close the black terminal window.*

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

## 🛠️ For Developers

If you want to modify Claw's source code:
1. Edit the files in `src/`.
2. Re-bundle the code by running `npx esbuild src/main.js --bundle --outfile=index.js --format=iife --target=es2020`.
3. Push your changes to GitHub. The `start_claw.bat` script is hardcoded to pull from `https://raw.githubusercontent.com/l-limon-l/Claw/main/index.js`, so all your users will automatically receive the latest update!

<br/>

## ⚠️ Important Disclaimer

> Automating interactions technically violates Discord’s Terms of Service. This tool is provided strictly for **educational and research purposes**. The developer is not responsible for any account restrictions or bans. Please use responsibly.

<br/>

---

<div align="center">
  <p>Engineered with 💜 by <a href="https://e-z.bio/l_limon_l"><strong>l_limon_l</strong></a></p>
</div>
