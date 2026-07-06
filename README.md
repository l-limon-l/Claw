# ⚡ CLAW (Cloud Edition)

[🇬🇧 English](#-english) | [🇷🇺 Русский](#-русский)

---

<a id="-english"></a>
## 🇬🇧 English

**CLAW** is a zero-dependency quest automation engine for Discord Desktop. It auto-completes Game, Video, Stream, Activity, and Achievement quests from a sleek built-in dashboard.

### 🚀 Features
- **One-Click Injection**: Run the executable once. It restarts Discord in debug mode, injects the payload baked into the executable, waits for Discord to finish loading, and runs automatically.
- **Premium Glass UI**: A draggable dashboard with glassmorphism, dynamic animations, and responsive themes that feels close to a native Discord panel.
- **Quest Picker**: Select only the quests you want to run instead of starting everything blindly.
- **Smart Automation**: Toggle auto-enroll, auto-claim, completion sounds, and desktop notifications from the dashboard.
- **Universal Quest Support**: Handles Game, Video, Stream, Activity, and Achievement quest types with queued API calls and exponential backoff.
- **Self-Contained Payload**: `index.js` is baked into the executable, so there is no runtime download. A startup version check tells you when a newer loader is available.
- **Improved Loader Reliability**: The C# loader checks DevTools injection errors, waits for `discord.com/channels/...`, supports Stable/PTB/Canary, and reports clear failures.

### 🛠️ Tech Stack
- JavaScript (ES2020)
- esbuild
- C# / .NET Framework 4.8

### 📦 Installation & Usage
1. Download the latest `.exe` from the [Releases page](https://github.com/l-limon-l/Claw/releases/tag/Main).
2. Run the downloaded file.
   *(The app closes the current Discord session, starts Discord with remote debugging enabled, and injects its baked-in payload after Discord finishes loading.)*

### 🎮 Controls
- **Toggle Dashboard (`Shift + .`)**: Show or hide the UI at any time.
- **Start Quests**: Pick your quests, toggle your options, and hit the **Start** button.
- **Claim Rewards**: Click the **Claim** button directly on the quest card when a task finishes.
- **Stop Engine**: Click the red **Stop** icon in the UI to gracefully shut down Claw.

### 🏗️ Build & Updates
The quest engine (`index.js`) is **baked into the executable** — the loader runs the exact payload it was built with, with no runtime download. Two ways to stay current:

- **Download a ready build**: grab the latest `Claw.exe` from the [Releases page](https://github.com/l-limon-l/Claw/releases/tag/Main). The payload is already inside it.
- **Build it yourself**: `npm run release` builds `index.js` and compiles it into `Claw.exe`.

**To update, update the loader.** Because the payload lives inside the exe, a new payload means a new exe. On startup the loader compares its embedded payload and its own file against the published `latest.json`; if they differ it reports that a new version is available and opens the download page.

For maintainers cutting a release:

```powershell
npm run release       # builds index.js, then Claw.exe with the payload embedded
npm run gen:version   # writes latest.json from the built exe
```

Then commit `latest.json` and upload the same `Claw.exe` to the release. Output exe:

```text
loader-csharp\bin\Release\net48\Claw.exe
```

Optional loader variables:
- `CLAW_DEBUG_PORT`: override the DevTools port, default `10222`.
- `CLAW_DISCORD_EXE`: use a specific Discord executable path.
- `CLAW_SKIP_VERSION_CHECK=1`: skip the startup update check.

*Disclaimer: Automating interactions technically violates Discord's Terms of Service. This tool is provided strictly for educational and research purposes.*

---

<a id="-русский"></a>
## 🇷🇺 Русский

**CLAW** — это движок автоматизации квестов для Discord Desktop без сторонних runtime-скриптов. Он автоматически выполняет игровые, видео, стриминговые, activity и achievement квесты прямо из встроенного красивого дашборда.

### 🚀 Особенности
- **Инъекция в один клик**: Запустите exe-файл один раз. Он перезапустит Discord в режиме отладки, внедрит payload, вшитый в сам exe, дождется полной загрузки Discord и запустится автоматически.
- **Премиальный Glass UI**: Перемещаемый дашборд с глассморфизмом, анимациями и адаптивными темами, который ощущается как нативная панель Discord.
- **Выбор квестов**: Можно запускать только нужные квесты, а не все подряд.
- **Умная автоматизация**: Авто-принятие, авто-сбор наград, звук завершения и desktop notifications настраиваются прямо в интерфейсе.
- **Поддержка разных типов квестов**: Game, Video, Stream, Activity и Achievement через очередь API-запросов и exponential backoff.
- **Payload внутри exe**: `index.js` вшит в исполняемый файл, скачивания в рантайме нет. При старте лоадер проверяет версию и сообщает, если вышел новый.
- **Надежный C# Loader**: Проверяет ошибки DevTools injection, ждет `discord.com/channels/...`, поддерживает Stable/PTB/Canary и показывает понятные ошибки.

### 🛠️ Стек технологий
- JavaScript (ES2020)
- esbuild
- C# / .NET Framework 4.8

### 📦 Установка и запуск
1. Скачайте последний `.exe` файл со страницы [Releases](https://github.com/l-limon-l/Claw/releases/tag/Main).
2. Запустите скачанный файл.
   *(Приложение само закроет текущий Discord, запустит его с удаленной отладкой и внедрит вшитый payload после полной загрузки Discord.)*

### 🎮 Управление
- **Показать/Скрыть дашборд (`Shift + .`)**: Открывает или скрывает интерфейс в любой момент.
- **Старт**: Выберите квесты, настройте опции и нажмите **Start**.
- **Сбор наград**: Нажимайте **Claim** прямо на карточке выполненного квеста.
- **Остановить**: Нажмите красную кнопку **Stop** для безопасного отключения Claw.

### 🏗️ Сборка и обновления
Движок квестов (`index.js`) **вшит в exe** — лоадер запускает ровно тот payload, с которым собран, без скачивания в рантайме. Держать актуальным можно двумя способами:

- **Скачать готовую сборку**: возьмите свежий `Claw.exe` со страницы [Releases](https://github.com/l-limon-l/Claw/releases/tag/Main). Payload уже внутри.
- **Собрать самому**: `npm run release` соберёт `index.js` и вкомпилит его в `Claw.exe`.

**Чтобы обновиться — обновляйте лоадер.** Раз payload лежит внутри exe, новый payload = новый exe. При старте лоадер сравнивает вшитый payload и сам файл с опубликованным `latest.json`; если отличаются — сообщает о новой версии и открывает страницу загрузки.

Для maintainer-сборки релиза:

```powershell
npm run release       # собирает index.js, затем Claw.exe с вшитым payload
npm run gen:version   # пишет latest.json из собранного exe
```

Затем закоммитьте `latest.json` и загрузите этот же `Claw.exe` в релиз. Готовый exe:

```text
loader-csharp\bin\Release\net48\Claw.exe
```

Дополнительные переменные loader:
- `CLAW_DEBUG_PORT`: переопределить DevTools port, по умолчанию `10222`.
- `CLAW_DISCORD_EXE`: указать конкретный путь к Discord executable.
- `CLAW_SKIP_VERSION_CHECK=1`: пропустить проверку обновления при старте.

*Отказ от ответственности: автоматизация нарушает Terms of Service Discord. Инструмент создан исключительно в образовательных и исследовательских целях.*

---

*Made with ❤️ / Сделано с ❤️*
