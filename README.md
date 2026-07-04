# ⚡ CLAW (Cloud Edition)

[🇬🇧 English](#-english) | [🇷🇺 Русский](#-русский)

---

<a id="-english"></a>
## 🇬🇧 English

**CLAW** is a zero-dependency quest automation engine for Discord Desktop. It auto-completes Game, Video, Stream, Activity, and Achievement quests from a sleek built-in dashboard.

### 🚀 Features
- **One-Click Cloud Injection**: Run the executable once. It restarts Discord in debug mode, downloads the latest Claw payload from GitHub, waits for Discord to finish loading, and injects automatically.
- **Premium Glass UI**: A draggable dashboard with glassmorphism, dynamic animations, and responsive themes that feels close to a native Discord panel.
- **Quest Picker**: Select only the quests you want to run instead of starting everything blindly.
- **Smart Automation**: Toggle auto-enroll, auto-claim, completion sounds, and desktop notifications from the dashboard.
- **Universal Quest Support**: Handles Game, Video, Stream, Activity, and Achievement quest types with queued API calls and exponential backoff.
- **Cloud Release Flow**: The loader always pulls the published `index.js`, so users get the latest release payload without copying scripts around.
- **Improved Loader Reliability**: The C# loader checks DevTools injection errors, waits for `discord.com/channels/...`, supports Stable/PTB/Canary, and reports clear failures.

### 🛠️ Tech Stack
- JavaScript (ES2020)
- esbuild
- C# / .NET Framework 4.8

### 📦 Installation & Usage
1. Download the latest `.exe` from the [Releases page](https://github.com/l-limon-l/Claw/releases/tag/Main).
2. Run the downloaded file.
   *(The app closes the current Discord session, starts Discord with remote debugging enabled, downloads the cloud payload, and injects Claw after Discord finishes loading.)*

### 🎮 Controls
- **Toggle Dashboard (`Shift + .`)**: Show or hide the UI at any time.
- **Start Quests**: Pick your quests, toggle your options, and hit the **Start** button.
- **Claim Rewards**: Click the **Claim** button directly on the quest card when a task finishes.
- **Stop Engine**: Click the red **Stop** icon in the UI to gracefully shut down Claw.

### ☁️ Cloud Release Build
For maintainers:

```powershell
npm run release
dotnet build .\loader-csharp\ClawInjector.csproj -c Release
```

Release executable:

```text
loader-csharp\bin\Release\net48\Claw.exe
```

The release loader targets `.NET Framework 4.8`, embeds the recovered original icon, and downloads the payload from:

```text
https://raw.githubusercontent.com/l-limon-l/Claw/main/index.js
```

Optional cloud loader variables:
- `CLAW_PAYLOAD_URL`: override the cloud payload URL.
- `CLAW_DEBUG_PORT`: override the DevTools port, default `10222`.
- `CLAW_DISCORD_EXE`: use a specific Discord executable path.

*Disclaimer: Automating interactions technically violates Discord's Terms of Service. This tool is provided strictly for educational and research purposes.*

---

<a id="-русский"></a>
## 🇷🇺 Русский

**CLAW** — это движок автоматизации квестов для Discord Desktop без сторонних runtime-скриптов. Он автоматически выполняет игровые, видео, стриминговые, activity и achievement квесты прямо из встроенного красивого дашборда.

### 🚀 Особенности
- **Инъекция из облака в один клик**: Запустите exe-файл один раз. Он перезапустит Discord в режиме отладки, скачает свежий payload Claw с GitHub, дождется полной загрузки Discord и внедрит скрипт автоматически.
- **Премиальный Glass UI**: Перемещаемый дашборд с глассморфизмом, анимациями и адаптивными темами, который ощущается как нативная панель Discord.
- **Выбор квестов**: Можно запускать только нужные квесты, а не все подряд.
- **Умная автоматизация**: Авто-принятие, авто-сбор наград, звук завершения и desktop notifications настраиваются прямо в интерфейсе.
- **Поддержка разных типов квестов**: Game, Video, Stream, Activity и Achievement через очередь API-запросов и exponential backoff.
- **Cloud Release Flow**: Loader всегда берет опубликованный `index.js`, поэтому пользователю не нужно переносить скрипты вручную.
- **Надежный C# Loader**: Проверяет ошибки DevTools injection, ждет `discord.com/channels/...`, поддерживает Stable/PTB/Canary и показывает понятные ошибки.

### 🛠️ Стек технологий
- JavaScript (ES2020)
- esbuild
- C# / .NET Framework 4.8

### 📦 Установка и запуск
1. Скачайте последний `.exe` файл со страницы [Releases](https://github.com/l-limon-l/Claw/releases/tag/Main).
2. Запустите скачанный файл.
   *(Приложение само закроет текущий Discord, запустит его с удаленной отладкой, скачает cloud payload и внедрит Claw после полной загрузки Discord.)*

### 🎮 Управление
- **Показать/Скрыть дашборд (`Shift + .`)**: Открывает или скрывает интерфейс в любой момент.
- **Старт**: Выберите квесты, настройте опции и нажмите **Start**.
- **Сбор наград**: Нажимайте **Claim** прямо на карточке выполненного квеста.
- **Остановить**: Нажмите красную кнопку **Stop** для безопасного отключения Claw.

### ☁️ Cloud Release Build
Для maintainer-сборки:

```powershell
npm run release
dotnet build .\loader-csharp\ClawInjector.csproj -c Release
```

Готовый exe:

```text
loader-csharp\bin\Release\net48\Claw.exe
```

Release loader собирается под `.NET Framework 4.8`, вшивает восстановленную оригинальную иконку и скачивает payload отсюда:

```text
https://raw.githubusercontent.com/l-limon-l/Claw/main/index.js
```

Дополнительные переменные cloud loader:
- `CLAW_PAYLOAD_URL`: переопределить cloud payload URL.
- `CLAW_DEBUG_PORT`: переопределить DevTools port, по умолчанию `10222`.
- `CLAW_DISCORD_EXE`: указать конкретный путь к Discord executable.

*Отказ от ответственности: автоматизация нарушает Terms of Service Discord. Инструмент создан исключительно в образовательных и исследовательских целях.*

---

*Made with ❤️ / Сделано с ❤️*
