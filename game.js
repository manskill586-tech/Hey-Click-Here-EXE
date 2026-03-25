const URL_PARAMS = new URLSearchParams(window.location.search);
const PREVIEW_MODE = URL_PARAMS.get("preview") === "1";
const PREVIEW_START_PARAM = URL_PARAMS.get("start");
const PREVIEW_MUTE_PARAM = URL_PARAMS.get("mute");
const PREVIEW_DATA_KEY = "story_preview_data";
const PREVIEW_START_KEY = "story_preview_start";
const PREVIEW_MUTE_KEY = "story_preview_mute";
const PREVIEW_STORAGE_PREFIX = PREVIEW_MODE ? "preview_" : "";

let PREVIEW_START_ID = PREVIEW_START_PARAM || "";
const PREVIEW_MUTED = PREVIEW_MUTE_PARAM === "1" || (!PREVIEW_MUTE_PARAM && localStorage.getItem(PREVIEW_MUTE_KEY) === "1");

if (PREVIEW_MODE) {
    try {
        const raw = localStorage.getItem(PREVIEW_DATA_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.scenes)) {
                window.STORY = parsed;
            }
        }
        if (!PREVIEW_START_ID) {
            PREVIEW_START_ID = localStorage.getItem(PREVIEW_START_KEY) || "";
        }
        if (PREVIEW_START_ID && window.STORY && typeof window.STORY === "object") {
            window.STORY.startSceneId = String(PREVIEW_START_ID);
        }
    } catch (err) {
        console.warn("Preview data load failed", err);
    }
}

const STORAGE_VERSION = "v3";
const STORAGE_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_save_" + STORAGE_VERSION;
const SETTINGS_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_settings_" + STORAGE_VERSION;
const READ_SCENES_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_read_scenes_" + STORAGE_VERSION;
const TELEMETRY_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_telemetry_" + STORAGE_VERSION;
const LAB_PROGRESS_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_lab_progress_" + STORAGE_VERSION;
const SLOT_META_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_slot_meta_" + STORAGE_VERSION;
const AMBIENCE_MIGRATION_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_ambience_default_off_v1";
const FILE_ORIGIN_NOTICE_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_file_origin_notice_" + STORAGE_VERSION;
const AUTOSAVE_KEY = STORAGE_KEY + "_autosave";
const DEV_KEY_VALUE = "5a60de22-ad9d-4ce1-8e5e-7f928b60eba4";
const DEV_KEY_PATH = "dev.key";

const LEGACY_FALLBACK_KEYS = PREVIEW_MODE ? {} : {
    settings: ["noir_file_settings_v2"],
    readScenes: ["noir_file_read_scenes_v2"],
    slot1: ["noir_file_save_v2_slot_1"],
    slot2: ["noir_file_save_v2_slot_2"],
    slot3: ["noir_file_save_v2_slot_3"]
};

const LANG_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_lang";
const DEFAULT_LANG = "ru";
const SUPPORTED_LANGS = ["ru", "en"];

const I18N = {
    ru: {
        ui: {
            system: "SYSTEM",
            scene: "СЦЕНА {id}",
            dialogueHint: "Enter / клик: продолжить",
            branchEnd: "Конец ветки. Открой настройки для действий.",
            selectOption: "Выберите вариант (1-9)",
            back: "Назад",
            auto: "Авто",
            autoOn: "Авто: Вкл",
            skip: "Пропуск",
            skipOn: "Пропуск: Вкл",
            save: "Сохранить",
            load: "Загрузить",
            settings: "Настройки",
            logTitle: "История",
            close: "Закрыть",
            logNote: "Клик по записи — переход к сцене.",
            settingsTitle: "Настройки",
            language: "Язык",
            languageRu: "Русский",
            languageEn: "English",
            tabText: "Текст",
            tabAudio: "Аудио",
            tabGameplay: "Геймплей",
            tabSystem: "Система",
            textSpeed: "Скорость текста",
            textSize: "Размер текста",
            textOpacity: "Прозрачность текста",
            musicVolume: "Громкость музыки",
            voiceVolume: "Громкость голоса",
            sfxVolume: "Громкость эффектов",
            ambienceVolume: "Громкость фона",
            voiceBlip: "Эффект голоса",
            ambience: "Сгенерированная атмосфера",
            autoDelay: "Задержка авто (мс)",
            skipUnread: "Пропуск непрочитанного",
            timedChoices: "Таймер выбора",
            distortion: "Интенсивность искажений",
            pressureLayer: "Давление",
            glitchText: "Глитч текста",
            openLog: "Открыть лог (L)",
            mute: "Звук: Выкл (M)",
            unmute: "Звук: Вкл (M)",
            hideUi: "Скрыть интерфейс (H)",
            showUi: "Показать интерфейс (H)",
            checkpoints: "Чекпоинты",
            devTools: "Dev Tools (F1)",
            restart: "Перезапуск",
            resetSettings: "Сброс настроек",
            telemetryTitle: "Снимок телеметрии",
            telemetryEmpty: "Нет данных.",
            saveTitle: "Сохранить",
            loadTitle: "Загрузить",
            saveMode: "Сохранить",
            loadMode: "Загрузить",
            desktopTitle: "Рабочий стол",
            openFolder: "Открыть папку",
            desktopNote: "Артефакты сюжета появляются здесь.",
            fileViewerTitle: "Просмотр файла",
            inputTitle: "Написать",
            inputNote: "Введите ответ.",
            inputPlaceholder: "Ваше сообщение",
            outputPreview: "Предпросмотр",
            submit: "Отправить",
            cancel: "Отмена",
            checkpointsTitle: "Чекпоинты",
            devTitle: "Dev Tools",
            devJumpPlaceholder: "Переход к ID (например, 2.1)",
            devJump: "Перейти",
            devReload: "Перезагрузить Story",
            devValidate: "Проверить Story",
            promptTitle: "Системное сообщение",
            promptOk: "Ок",
            promptPermissions: "Требуются права.",
            promptSignalAnomaly: "Обнаружена аномалия сигнала.",
            slotAnomalyPrompt: "Слот {slot} сообщает о дрейфе контрольной суммы уровня {level}. Продолжить загрузку?",
            timelineHint: "Подсказка таймлайна",
            promptTimeline: "Сработало событие.",
            autoLabel: "АВТО",
            instant: "мгновенно",
            noPreview: "Нет превью",
            slot: "Слот {id}",
            autosave: "Автосейв",
            historyJump: "Переход по журналу",
            logEmpty: "Лог пуст. Пройди несколько сцен.",
            desktopUnavailable: "Рабочий стол доступен только в desktop-сборке.",
            desktopEmpty: "Пока нет артефактов.",
            artifact: "артефакт",
            fileLoading: "Загрузка...",
            fileUnavailable: "Просмотр файлов доступен только в desktop-сборке.",
            fileNotFound: "Файл не найден.",
            filePath: "Путь: {path}",
            fileFailed: "Не удалось прочитать файл.",
            sceneTagDefault: "ЛАБОРАТОРИЯ // ХАБ",
            inputPlayerTitle: "Имя игрока",
            inputPlayerNote: "Введи своё имя.",
            checkpointSeen: "прочитано",
            checkpointNew: "новое",
            checkpointVisits: "посещений",
            playerFallback: "Друг"
        },
        telemetry: {
            time: "время: {time}",
            session: "сессия: {minutes} мин",
            idle: "простой: {minutes} мин",
            clicks: "клики: {count}",
            keys: "клавиши: {count}",
            avgClickInterval: "ср. интервал кликов: {ms} мс",
            avgKeyInterval: "ср. интервал клавиш: {ms} мс",
            revisits: "повторы: {count}",
            savesLoads: "сейвы / загрузки: {saves} / {loads}",
            timeouts: "таймауты: {count}",
            corruptions: "искажения выбора: {count}",
            pressure: "давление: {score}"
        },
        toast: {
            noReplacementWords: "Слова для замены не заданы.",
            terminalRequiresDesktop: "Терминал доступен только в desktop-сборке.",
            fileRequiresDesktop: "Файловые эффекты доступны только в desktop-сборке.",
            missingFilePath: "Не задан путь к файлу.",
            appClosed: "Приложение закрыто. Обновите страницу.",
            timelineEvent: "Событие таймлайна",
            actionExecuted: "Действие выполнено",
            skipPaused: "Пропуск остановлен: требуется выбор.",
            slotAnomaly: "Слот {slot} помечен аномалией",
            validationIssues: "Проверка story: {count} проблем(ы)",
            validationOk: "Проверка story: OK",
            reloadFailed: "Не удалось перезагрузить story.js",
            reloadOk: "story.js перезагружен",
            storyExecuteFailed: "Не удалось выполнить story.js",
            autosaveEmpty: "Автосейв пуст",
            autosaveParseFailed: "Не удалось прочитать автосейв",
            autosaveLoaded: "Автосейв загружен",
            chromaNotice: "Для хромакея нужен http/https. Запусти локальный сервер (например, npx serve .)",
            sceneNotFound: "Сцена не найдена.",
            noRollback: "Нет сцены для отката.",
            autoOn: "Авто-режим включен",
            autoOff: "Авто-режим выключен",
            skipOn: "Пропуск включен",
            skipOff: "Пропуск выключен",
            muted: "Звук выключен",
            unmuted: "Звук включен",
            settingsReset: "Настройки сброшены",
            savedSlot: "Сохранено в слот {slot} // аномалия: {anomaly} ({note})",
            slotEmpty: "Слот {slot} пуст",
            saveParseFailed: "Не удалось прочитать сохранение",
            loadedSlot: "Загружен слот {slot}",
            labRestarted: "Лаборатория перезапущена",
            replayJump: "Переход по журналу",
            timeoutReached: "Время вышло."
        }
    },
    en: {
        ui: {
            system: "SYSTEM",
            scene: "SCENE {id}",
            dialogueHint: "Enter / click: continue",
            branchEnd: "Branch end reached. Open Settings for utility actions.",
            selectOption: "Select an option (1-9)",
            back: "Back",
            auto: "Auto",
            autoOn: "Auto: On",
            skip: "Skip",
            skipOn: "Skip: On",
            save: "Save",
            load: "Load",
            settings: "Settings",
            logTitle: "History Log",
            close: "Close",
            logNote: "Click an entry to jump back to that scene.",
            settingsTitle: "Settings",
            language: "Language",
            languageRu: "Russian",
            languageEn: "English",
            tabText: "Text",
            tabAudio: "Audio",
            tabGameplay: "Gameplay",
            tabSystem: "System",
            textSpeed: "Text Speed",
            textSize: "Text Size",
            textOpacity: "Text Opacity",
            musicVolume: "Music Volume",
            voiceVolume: "Voice Volume",
            sfxVolume: "SFX Volume",
            ambienceVolume: "Ambience Volume",
            voiceBlip: "Voice blip effect",
            ambience: "Generated ambience",
            autoDelay: "Auto Delay (ms)",
            skipUnread: "Skip unread text",
            timedChoices: "Timed choices",
            distortion: "Distortion Intensity",
            pressureLayer: "Pressure layer",
            glitchText: "Glitch text mode",
            openLog: "Open Log (L)",
            mute: "Mute (M)",
            unmute: "Unmute (M)",
            hideUi: "Hide UI (H)",
            showUi: "Show UI (H)",
            checkpoints: "Checkpoints",
            devTools: "Dev Tools (F1)",
            restart: "Restart",
            resetSettings: "Reset Settings",
            telemetryTitle: "Telemetry Snapshot",
            telemetryEmpty: "No data yet.",
            saveTitle: "Save",
            loadTitle: "Load",
            saveMode: "Save",
            loadMode: "Load",
            desktopTitle: "Desktop",
            openFolder: "Open Folder",
            desktopNote: "Artifacts created by the story appear here.",
            fileViewerTitle: "File Viewer",
            inputTitle: "Write",
            inputNote: "Type your response.",
            inputPlaceholder: "Your message",
            outputPreview: "Output Preview",
            submit: "Submit",
            cancel: "Cancel",
            checkpointsTitle: "Checkpoints",
            devTitle: "Dev Tools",
            devJumpPlaceholder: "Jump to ID (e.g. 2.1)",
            devJump: "Jump",
            devReload: "Reload Story",
            devValidate: "Validate Story",
            promptTitle: "System Alert",
            promptOk: "Acknowledge",
            promptPermissions: "Permissions required.",
            promptSignalAnomaly: "Signal anomaly detected.",
            slotAnomalyPrompt: "Slot {slot} reports virtual checksum drift level {level}. Continue loading?",
            timelineHint: "Timeline hint",
            promptTimeline: "Prompt event fired.",
            autoLabel: "AUTO",
            instant: "instant",
            noPreview: "No preview",
            slot: "Slot {id}",
            autosave: "Autosave",
            historyJump: "Replay jump from log",
            logEmpty: "Log is empty. Run a few scenes first.",
            desktopUnavailable: "Desktop view requires the desktop build.",
            desktopEmpty: "No artifacts yet.",
            artifact: "artifact",
            fileLoading: "Loading...",
            fileUnavailable: "This file viewer requires the desktop build.",
            fileNotFound: "File not found.",
            filePath: "Path: {path}",
            fileFailed: "Failed to read file.",
            sceneTagDefault: "MECHANIC LAB // HUB",
            inputPlayerTitle: "Player name",
            inputPlayerNote: "Enter your name.",
            checkpointSeen: "seen",
            checkpointNew: "new",
            checkpointVisits: "visits",
            playerFallback: "Friend"
        },
        telemetry: {
            time: "time: {time}",
            session: "session: {minutes} min",
            idle: "idle: {minutes} min",
            clicks: "clicks: {count}",
            keys: "keys: {count}",
            avgClickInterval: "avg click interval: {ms} ms",
            avgKeyInterval: "avg key interval: {ms} ms",
            revisits: "revisits: {count}",
            savesLoads: "saves / loads: {saves} / {loads}",
            timeouts: "timeouts: {count}",
            corruptions: "choice corruption events: {count}",
            pressure: "pressure score: {score}"
        },
        toast: {
            noReplacementWords: "No replacement words defined.",
            terminalRequiresDesktop: "Terminal requires desktop build.",
            fileRequiresDesktop: "File effects require desktop build.",
            missingFilePath: "Missing file path.",
            appClosed: "Application closed. Refresh to continue.",
            timelineEvent: "Timeline event",
            actionExecuted: "Action executed",
            skipPaused: "Skip paused: scene requires a choice.",
            slotAnomaly: "Slot {slot} anomaly primed",
            validationIssues: "Story validation: {count} issue(s)",
            validationOk: "Story validation: OK",
            reloadFailed: "Failed to reload story.js",
            reloadOk: "story.js reloaded",
            storyExecuteFailed: "Failed to execute story.js",
            autosaveEmpty: "Autosave is empty",
            autosaveParseFailed: "Failed to parse autosave",
            autosaveLoaded: "Autosave loaded",
            chromaNotice: "Chroma key needs http/https. Run a local server (e.g., npx serve .)",
            sceneNotFound: "Scene not found.",
            noRollback: "No rollback entry available.",
            autoOn: "Auto mode enabled",
            autoOff: "Auto mode disabled",
            skipOn: "Skip mode enabled",
            skipOff: "Skip mode disabled",
            muted: "Muted",
            unmuted: "Unmuted",
            settingsReset: "Settings reset",
            savedSlot: "Saved to slot {slot} // anomaly: {anomaly} ({note})",
            slotEmpty: "Slot {slot} is empty",
            saveParseFailed: "Failed to parse save payload",
            loadedSlot: "Loaded slot {slot}",
            labRestarted: "Mechanic Lab restarted",
            replayJump: "Replay jump from log",
            timeoutReached: "Time limit reached."
        }
    }
};

const TYPE_SPEED_MS = 18;
const AUTO_DELAY_MS = 1800;
const SKIP_DELAY_MS = 70;
const TEMP_EFFECT_DURATION = 700;
const LOG_LIMIT = 220;
const DEFAULT_SLOT = 1;
const SAVE_SLOT_MIN = 1;
const SAVE_SLOT_MAX = 3;
const IDLE_THRESHOLD_MS = 5500;

const DEFAULT_SETTINGS = {
    textSpeedMs: TYPE_SPEED_MS,
    textSizePx: 20,
    textOpacity: 100,
    autoDelayMs: AUTO_DELAY_MS,
    skipUnread: false,
    voiceBlip: false,
    pressureLayer: true,
    glitchText: true,
    timedChoices: true,
    ambience: false,
    musicVolume: 100,
    voiceVolume: 100,
    sfxVolume: 100,
    ambienceVolume: 100,
    distortionIntensity: 35
};

function normalizeLang(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    if (SUPPORTED_LANGS.includes(raw)) return raw;
    if (raw.startsWith("ru")) return "ru";
    if (raw.startsWith("en")) return "en";
    return "";
}

function getNested(source, path) {
    const parts = String(path || "").split(".");
    let current = source;
    for (let i = 0; i < parts.length; i += 1) {
        if (!current || typeof current !== "object") return undefined;
        current = current[parts[i]];
    }
    return current;
}

function t(key, vars) {
    const lang = state && state.language ? state.language : DEFAULT_LANG;
    const bundle = I18N[lang] || I18N[DEFAULT_LANG] || {};
    let template = getNested(bundle, key);
    if (template === undefined) {
        template = getNested(I18N[DEFAULT_LANG] || {}, key);
    }
    if (template === undefined) return key;
    const params = vars && typeof vars === "object" ? vars : {};
    return String(template).replace(/\{(\w+)\}/g, function (_match, name) {
        return params[name] !== undefined ? String(params[name]) : "";
    });
}

function resolveLocalized(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) {
        return value.map(resolveLocalized).join("");
    }
    if (typeof value === "object") {
        const lang = state && state.language ? state.language : DEFAULT_LANG;
        if (value[lang] !== undefined) return String(value[lang]);
        if (value[DEFAULT_LANG] !== undefined) return String(value[DEFAULT_LANG]);
        if (value.en !== undefined) return String(value.en);
        if (value.ru !== undefined) return String(value.ru);
    }
    return String(value);
}

function resolveLocalizedArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(resolveLocalized).map((item) => String(item)).filter(Boolean);
}

function detectPreferredLanguage() {
    const list = (navigator && Array.isArray(navigator.languages) && navigator.languages.length)
        ? navigator.languages
        : [navigator && navigator.language ? navigator.language : ""];
    for (let i = 0; i < list.length; i += 1) {
        const normalized = normalizeLang(list[i]);
        if (normalized) {
            return normalized;
        }
    }
    return DEFAULT_LANG;
}

function getStoredLanguage() {
    try {
        const stored = localStorage.getItem(LANG_KEY);
        const normalized = normalizeLang(stored);
        return normalized || "";
    } catch (err) {
        return "";
    }
}

function applyDocumentLanguage(lang) {
    if (typeof document === "undefined") return;
    if (document.documentElement) {
        document.documentElement.lang = lang;
    }
}

function applyUiTranslations() {
    if (!ui || !ui.root) {
        return;
    }
    const idle = state.sceneIndex < 0;
    if (idle && ui.sceneTag) {
        ui.sceneTag.textContent = t("ui.sceneTagDefault");
    }
    if (idle && ui.speakerName) {
        ui.speakerName.textContent = t("ui.system");
    }
    if (idle && ui.dialogueHint) {
        ui.dialogueHint.textContent = t("ui.dialogueHint");
    }

    if (ui.backBtn) ui.backBtn.textContent = t("ui.back");
    if (ui.autoBtn) ui.autoBtn.textContent = t("ui.auto");
    if (ui.skipBtn) ui.skipBtn.textContent = t("ui.skip");
    if (ui.saveBtn) ui.saveBtn.textContent = t("ui.save");
    if (ui.loadBtn) ui.loadBtn.textContent = t("ui.load");
    if (ui.settingsBtn) ui.settingsBtn.textContent = t("ui.settings");

    if (ui.autoIndicator) {
        const label = ui.autoIndicator.querySelector(".auto-label");
        if (label) label.textContent = t("ui.autoLabel");
    }

    const logTitle = ui.logPanel ? ui.logPanel.querySelector("h2") : null;
    if (logTitle) logTitle.textContent = t("ui.logTitle");
    const logNote = ui.logPanel ? ui.logPanel.querySelector(".overlay-note") : null;
    if (logNote) logNote.textContent = t("ui.logNote");
    if (ui.closeLogBtn) ui.closeLogBtn.textContent = t("ui.close");

    const settingsTitle = ui.settingsPanel ? ui.settingsPanel.querySelector("h2") : null;
    if (settingsTitle) settingsTitle.textContent = t("ui.settingsTitle");
    if (ui.closeSettingsBtn) ui.closeSettingsBtn.textContent = t("ui.close");

    const tabTextBtn = ui.settingsPanel ? ui.settingsPanel.querySelector('.tab-btn[data-tab="text"]') : null;
    const tabAudioBtn = ui.settingsPanel ? ui.settingsPanel.querySelector('.tab-btn[data-tab="audio"]') : null;
    const tabGameplayBtn = ui.settingsPanel ? ui.settingsPanel.querySelector('.tab-btn[data-tab="gameplay"]') : null;
    const tabSystemBtn = ui.settingsPanel ? ui.settingsPanel.querySelector('.tab-btn[data-tab="system"]') : null;
    if (tabTextBtn) tabTextBtn.textContent = t("ui.tabText");
    if (tabAudioBtn) tabAudioBtn.textContent = t("ui.tabAudio");
    if (tabGameplayBtn) tabGameplayBtn.textContent = t("ui.tabGameplay");
    if (tabSystemBtn) tabSystemBtn.textContent = t("ui.tabSystem");

    const labelTextSpeed = document.querySelector('label[for="textSpeedInput"]');
    if (labelTextSpeed) labelTextSpeed.textContent = t("ui.textSpeed");
    const labelTextSize = document.querySelector('label[for="textSizeInput"]');
    if (labelTextSize) labelTextSize.textContent = t("ui.textSize");
    const labelTextOpacity = document.querySelector('label[for="textOpacityInput"]');
    if (labelTextOpacity) labelTextOpacity.textContent = t("ui.textOpacity");
    const labelMusic = document.querySelector('label[for="musicVolumeInput"]');
    if (labelMusic) labelMusic.textContent = t("ui.musicVolume");
    const labelVoice = document.querySelector('label[for="voiceVolumeInput"]');
    if (labelVoice) labelVoice.textContent = t("ui.voiceVolume");
    const labelSfx = document.querySelector('label[for="sfxVolumeInput"]');
    if (labelSfx) labelSfx.textContent = t("ui.sfxVolume");
    const labelAmbience = document.querySelector('label[for="ambienceVolumeInput"]');
    if (labelAmbience) labelAmbience.textContent = t("ui.ambienceVolume");
    const labelVoiceBlip = document.querySelector('label[for="voiceBlipInput"]');
    if (labelVoiceBlip) labelVoiceBlip.textContent = t("ui.voiceBlip");
    const labelAmbienceToggle = document.querySelector('label[for="ambienceInput"]');
    if (labelAmbienceToggle) labelAmbienceToggle.textContent = t("ui.ambience");
    const labelAutoDelay = document.querySelector('label[for="autoDelayInput"]');
    if (labelAutoDelay) labelAutoDelay.textContent = t("ui.autoDelay");
    const labelSkipUnread = document.querySelector('label[for="skipUnreadInput"]');
    if (labelSkipUnread) labelSkipUnread.textContent = t("ui.skipUnread");
    const labelTimed = document.querySelector('label[for="timedChoiceInput"]');
    if (labelTimed) labelTimed.textContent = t("ui.timedChoices");
    const labelLanguage = document.querySelector('label[for="languageSelect"]');
    if (labelLanguage) labelLanguage.textContent = t("ui.language");
    if (ui.languageSelect) {
        const optionRu = ui.languageSelect.querySelector('option[value="ru"]');
        const optionEn = ui.languageSelect.querySelector('option[value="en"]');
        if (optionRu) optionRu.textContent = t("ui.languageRu");
        if (optionEn) optionEn.textContent = t("ui.languageEn");
    }
    const labelDistortion = document.querySelector('label[for="distortionInput"]');
    if (labelDistortion) labelDistortion.textContent = t("ui.distortion");
    const labelPressure = document.querySelector('label[for="pressureLayerInput"]');
    if (labelPressure) labelPressure.textContent = t("ui.pressureLayer");
    const labelGlitch = document.querySelector('label[for="glitchTextInput"]');
    if (labelGlitch) labelGlitch.textContent = t("ui.glitchText");

    if (ui.openLogBtn) ui.openLogBtn.textContent = t("ui.openLog");
    if (ui.toggleMuteBtn) ui.toggleMuteBtn.textContent = state.muted ? t("ui.unmute") : t("ui.mute");
    if (ui.toggleUiBtn) ui.toggleUiBtn.textContent = state.uiHidden ? t("ui.showUi") : t("ui.hideUi");
    if (ui.openCheckpointsBtn) ui.openCheckpointsBtn.textContent = t("ui.checkpoints");
    if (ui.openDevBtn) ui.openDevBtn.textContent = t("ui.devTools");
    if (ui.restartBtn) ui.restartBtn.textContent = t("ui.restart");
    if (ui.resetSettingsBtn) ui.resetSettingsBtn.textContent = t("ui.resetSettings");

    const telemetryTitle = ui.settingsPanel ? ui.settingsPanel.querySelector(".telemetry-box h3") : null;
    if (telemetryTitle) telemetryTitle.textContent = t("ui.telemetryTitle");

    if (ui.savePanelTitle) ui.savePanelTitle.textContent = t(state.savePanelMode === "load" ? "ui.loadTitle" : "ui.saveTitle");
    if (ui.saveModeBtn) ui.saveModeBtn.textContent = t("ui.saveMode");
    if (ui.loadModeBtn) ui.loadModeBtn.textContent = t("ui.loadMode");
    if (ui.closeSaveBtn) ui.closeSaveBtn.textContent = t("ui.close");

    const desktopTitle = ui.desktopPanel ? ui.desktopPanel.querySelector("h2") : null;
    if (desktopTitle) desktopTitle.textContent = t("ui.desktopTitle");
    if (ui.desktopOpenFolderBtn) ui.desktopOpenFolderBtn.textContent = t("ui.openFolder");
    if (ui.desktopCloseBtn) ui.desktopCloseBtn.textContent = t("ui.close");
    const desktopNote = ui.desktopPanel ? ui.desktopPanel.querySelector(".overlay-note") : null;
    if (desktopNote) desktopNote.textContent = t("ui.desktopNote");

    const fileTitle = ui.fileViewerPanel ? ui.fileViewerPanel.querySelector("h2") : null;
    if (fileTitle) fileTitle.textContent = t("ui.fileViewerTitle");
    if (ui.fileViewerOpenFolderBtn) ui.fileViewerOpenFolderBtn.textContent = t("ui.openFolder");
    if (ui.fileViewerCloseBtn) ui.fileViewerCloseBtn.textContent = t("ui.close");

    if (ui.inputPanelTitle) ui.inputPanelTitle.textContent = t("ui.inputTitle");
    if (ui.inputPanelNote) ui.inputPanelNote.textContent = t("ui.inputNote");
    if (ui.inputPanelField) ui.inputPanelField.placeholder = t("ui.inputPlaceholder");
    const previewLabel = ui.inputPanel ? ui.inputPanel.querySelector(".input-panel-preview-label") : null;
    if (previewLabel) previewLabel.textContent = t("ui.outputPreview");
    if (ui.inputPanelSubmitBtn) ui.inputPanelSubmitBtn.textContent = t("ui.submit");
    if (ui.inputPanelCancelBtn) ui.inputPanelCancelBtn.textContent = t("ui.cancel");
    if (ui.inputPanelCloseBtn) ui.inputPanelCloseBtn.textContent = t("ui.close");

    const checkpointsTitle = ui.checkpointsPanel ? ui.checkpointsPanel.querySelector("h2") : null;
    if (checkpointsTitle) checkpointsTitle.textContent = t("ui.checkpointsTitle");
    if (ui.closeCheckpointsBtn) ui.closeCheckpointsBtn.textContent = t("ui.close");

    const devTitle = ui.devPanel ? ui.devPanel.querySelector("h2") : null;
    if (devTitle) devTitle.textContent = t("ui.devTitle");
    if (ui.closeDevBtn) ui.closeDevBtn.textContent = t("ui.close");
    if (ui.devJumpInput) ui.devJumpInput.placeholder = t("ui.devJumpPlaceholder");
    if (ui.devJumpBtn) ui.devJumpBtn.textContent = t("ui.devJump");
    if (ui.devReloadBtn) ui.devReloadBtn.textContent = t("ui.devReload");
    if (ui.devValidateBtn) ui.devValidateBtn.textContent = t("ui.devValidate");

    const promptTitle = ui.fakePromptPanel ? ui.fakePromptPanel.querySelector("h2") : null;
    if (promptTitle) promptTitle.textContent = t("ui.promptTitle");
    if (ui.fakePromptOkBtn) ui.fakePromptOkBtn.textContent = t("ui.promptOk");
}

function setLanguage(lang, persist) {
    const normalized = normalizeLang(lang) || DEFAULT_LANG;
    state.language = normalized;
    if (persist) {
        try {
            localStorage.setItem(LANG_KEY, normalized);
        } catch (err) {
            // ignore
        }
    }
    applyDocumentLanguage(normalized);
    applyUiTranslations();
    updateModeButtons();
    updateSettingsUi();
    renderLogPanel();
    renderCheckpointsPanel();
    updateTelemetrySummary();
}

function hideLanguageSplash() {
    if (!ui.langSplash) return;
    ui.langSplash.hidden = true;
    ui.langSplash.style.display = "none";
}

function showLanguageSplash() {
    if (!ui.langSplash) return;
    ui.langSplash.hidden = false;
    ui.langSplash.style.display = "flex";
}

function ensureLanguageSelected(force) {
    const stored = getStoredLanguage();
    if (stored && !force) {
        setLanguage(stored, false);
        hideLanguageSplash();
        return Promise.resolve(stored);
    }
    const suggested = stored || detectPreferredLanguage();
    if (!ui.langSplash || !ui.langRuBtn || !ui.langEnBtn) {
        setLanguage(suggested, true);
        return Promise.resolve(suggested);
    }
    showLanguageSplash();
    return new Promise((resolve) => {
        ui.langRuBtn.onclick = () => {
            hideLanguageSplash();
            setLanguage("ru", true);
            resolve("ru");
        };
        ui.langEnBtn.onclick = () => {
            hideLanguageSplash();
            setLanguage("en", true);
            resolve("en");
        };
    });
}

function getStoryLocales() {
    const data = (typeof window !== "undefined" && window.STORY) ? window.STORY : STORY_DATA;
    return data && typeof data.locales === "object" ? data.locales : null;
}

function getSceneLocale(scene) {
    if (!scene || scene.id === undefined || scene.id === null) return null;
    const locales = getStoryLocales();
    if (!locales) return null;
    const lang = state && state.language ? state.language : DEFAULT_LANG;
    const langData = locales[lang];
    if (!langData || typeof langData !== "object") return null;
    const map = langData.scenes;
    if (!map || typeof map !== "object") return null;
    const id = String(scene.id);
    return map[id] || null;
}

function resolveSceneField(scene, field, fallback) {
    const locale = getSceneLocale(scene);
    if (locale && Object.prototype.hasOwnProperty.call(locale, field)) {
        return resolveLocalized(locale[field]);
    }
    if (scene && Object.prototype.hasOwnProperty.call(scene, field)) {
        return resolveLocalized(scene[field]);
    }
    return fallback === undefined ? "" : fallback;
}

function resolveChoiceField(scene, choice, index, field) {
    const locale = getSceneLocale(scene);
    let value;
    if (locale && Array.isArray(locale.choices)) {
        const entry = locale.choices[index];
        if (entry && typeof entry === "object") {
            if (Object.prototype.hasOwnProperty.call(entry, field)) {
                value = entry[field];
            }
        } else if (field === "text" && entry !== undefined) {
            value = entry;
        }
    }
    if (value === undefined && choice && Object.prototype.hasOwnProperty.call(choice, field)) {
        value = choice[field];
    }
    return resolveLocalized(value);
}

function resolveSceneLabel(scene, index) {
    const label = resolveSceneField(scene, "label", "");
    if (label) return label;
    const id = scene && scene.id !== undefined && scene.id !== null
        ? String(scene.id)
        : String((index !== undefined ? index : 0) + 1).padStart(2, "0");
    return t("ui.scene", { id: id });
}

const GLITCH_GLYPHS = "#%$@?<>![]{}/*=+-_";

const CHROMA_KEY_TARGET = { r: 2, g: 251, b: 0 };
const CHROMA_KEY_THRESHOLD = 70;
const CHROMA_KEY_SOFTNESS = 18;
const CHROMA_KEY_SPILL = 0.95;
const CHROMA_KEY_EDGE_PREMULTIPLY = true;
const CHROMA_KEY_ALPHA_CUTOFF = 22;
const CHROMA_KEY_EDGE_ERODE_PX = 1;
const CHROMA_CACHE_VERSION = "v3";
const ENABLE_PERSISTENT_CHROMA_CACHE = true;
const CHROMA_CACHE_DB_NAME = "flavortown_chroma_cache_" + CHROMA_CACHE_VERSION;
const CHROMA_CACHE_STORE = "entries";
const PREWARM_CHROMA_ON_START = true;
const PREWARM_CHROMA_START_DELAY_MS = 200;
const PREWARM_CHROMA_SLICE_MS = 12;
const chromaCache = new Map();
const chromaPendingCallbacks = new WeakMap();
let chromaDbPromise = null;
const IS_FILE_ORIGIN = typeof window !== "undefined"
    && window.location
    && (window.location.protocol === "file:" || window.location.origin === "null");
const SYSTEM_API = typeof window !== "undefined" ? window.system : null;
const HAS_SYSTEM = Boolean(SYSTEM_API && SYSTEM_API.isElectron);
const META_STORAGE_KEY = PREVIEW_STORAGE_PREFIX + "flavortown_meta_" + STORAGE_VERSION;
const DEFAULT_META_STATE = {
    phase: "start",
    ending: "",
    seenFakeRestart: false,
    artifactSeed: 0,
    playerNameInput: "",
    playerNameResolved: "",
    playerNameSource: ""
};

const CHARACTER_POSITION_FALLBACK = [
    "left",
    "center",
    "right",
    "far-left",
    "far-right"
];

const STAGE_BACKGROUND_OVERLAYS = [
    "linear-gradient(115deg, rgba(0, 0, 0, 0.33), rgba(0, 0, 0, 0.58))",
    "radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.82) 72%)"
].join(", ");

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogv", ".ogg"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".avif", ".svg"];
const DEFAULT_FRAME_MS = 250;
const DEFAULT_FRAME_MODE = "loop";
const DEFAULT_TAG_LAG_MS = 40;
const DEFAULT_TAG_SCRAMBLE_MS = 100;
const DEFAULT_TAG_GLITCH_MS = 120;
const DEFAULT_TAG_SWAP_MS = 900;
const DEFAULT_VOICE_VOLUME = 0.6;
const DEFAULT_SFX_VOLUME = 0.8;
const DEFAULT_SCREEN_TEXT_MS = 900;
const BASE_AMBIENCE_GAIN = 0.018;
const BASE_STAGE_WIDTH = 1280;
const BASE_STAGE_HEIGHT = 720;
const MIN_STAGE_SCALE = 0.25;
const PREVIEW_MIN_STAGE_SCALE = 0.2;
const MAX_STAGE_SCALE = 1.6;
let stageScaleRaf = 0;

const STORY_DATA = window.STORY || {};
const scenes = Array.isArray(STORY_DATA.scenes) ? STORY_DATA.scenes : [];
let OBSERVER_LINES = Array.isArray(STORY_DATA.observerLines) ? STORY_DATA.observerLines : [];
let START_SCENE_ID = STORY_DATA.startSceneId || "1";
let STORY_AUDIO = STORY_DATA.audio && typeof STORY_DATA.audio === "object" ? STORY_DATA.audio : {};
if (PREVIEW_MODE && PREVIEW_START_ID) {
    START_SCENE_ID = String(PREVIEW_START_ID);
}
const sceneIdToIndex = new Map();
const CHARACTER_DATA = window.CHARACTERS && typeof window.CHARACTERS === "object" ? window.CHARACTERS : {};
const characterWarningCache = new Set();
const audioBufferCache = new Map();
const audioBufferPending = new Map();

function buildSceneIdIndex() {
    sceneIdToIndex.clear();
    scenes.forEach(function (scene, index) {
        if (!scene || scene.id === undefined || scene.id === null) {
            return;
        }
        sceneIdToIndex.set(String(scene.id), index);
    });
}

buildSceneIdIndex();

const state = {
    sceneIndex: -1,
    isTyping: false,
    fullText: "",
    fullTextRaw: "",
    typeTimer: null,
    autoTimer: null,
    timelineTimers: [],
    characterFrameTimers: [],
    choiceTimerId: null,
    choiceFxTimerId: null,
    choiceFxEntries: [],
    textFxTimerId: null,
    screenTextTimerId: null,
    screenTextActive: false,
    pressureTimerId: null,
    telemetryTimerId: null,
    ambienceNodes: null,
    prewarmStarted: false,
    devMode: false,
    devKeyChecked: false,
    devControlsBound: false,
    autoEndsAt: 0,
    autoIndicatorTimer: null,
    autoMode: false,
    skipMode: false,
    muted: PREVIEW_MUTED,
    previewMode: PREVIEW_MODE,
    uiHidden: false,
    language: DEFAULT_LANG,
    afterTyping: null,
    pendingTyping: null,
    waitingForAudio: false,
    textFx: null,
    sceneVoice: null,
    voiceInitialized: false,
    voiceStartRandomize: false,
    bgm: {
        element: null,
        src: "",
        volume: 1,
        baseVolume: 1,
        fadeTimer: null,
        pauseResumeTimer: null,
        pendingPlay: false
    },
    settings: { ...DEFAULT_SETTINGS },
    logEntries: [],
    lastRenderedCharacters: [],
    sceneHistory: [],
    flags: {},
    vars: {},
    readScenes: new Set(),
    activePanel: null,
    meta: { ...DEFAULT_META_STATE },
    artifacts: [],
    desktopVisible: false,
    fileViewer: {
        relPath: "",
        content: "",
        meta: ""
    },
    wordReplace: {
        active: false,
        words: [],
        preview: "",
        next: null,
        file: null
    },
    playerNameInput: {
        active: false,
        next: null
    },
    savePanelMode: "save",
    sceneWasReadBeforeRender: false,
    sceneVisitCount: {},
    pressureScore: 0,
    telemetry: {
        sessionStartedAt: Date.now(),
        sessionMs: 0,
        idleMs: 0,
        lastActivityAt: Date.now(),
        lastTickAt: Date.now(),
        clickCount: 0,
        keyCount: 0,
        avgClickIntervalMs: 0,
        avgKeyIntervalMs: 0,
        lastClickAt: 0,
        lastKeyAt: 0,
        revisitCount: 0,
        saveCount: 0,
        loadCount: 0,
        timeoutCount: 0,
        corruptedChoiceCount: 0,
        settingsOpenCount: 0,
        logOpenCount: 0,
        fakePromptCount: 0
    },
    labProgress: {
        checkpointsVisited: {},
        modulesSeen: {}
    },
    slotMeta: {
        1: { anomaly: 0, note: "stable", writes: 0, preview: "", updatedAt: 0 },
        2: { anomaly: 0, note: "stable", writes: 0, preview: "", updatedAt: 0 },
        3: { anomaly: 0, note: "stable", writes: 0, preview: "", updatedAt: 0 },
        autosave: { anomaly: 0, note: "autosave", writes: 0, preview: "", updatedAt: 0 }
    },
    choiceTimer: {
        active: false,
        startedAt: 0,
        endsAt: 0,
        timeoutNext: null,
        timeoutChoiceText: ""
    },
    choiceCommitted: false,
    prompt: {
        onAcknowledge: null
    },
    appliedSceneMutations: new Set(),
    currentSpeaker: "SYSTEM",
    lastObserverAt: 0,
    lastBlipAt: 0,
    voiceLoop: {
        src: "",
        source: null,
        gain: null,
        volume: 1,
        desiredSrc: "",
        desiredBaseVolume: 1,
        desiredVolume: 1,
        pending: null,
        requestId: 0
    },
    focusEyeHideTimer: null,
    focusReturnTimer: null,
    focusEyeActive: false,
    audioCtx: null,
    audioUnlocked: false
};

const ui = {
    root: document.getElementById("vnRoot"),
    stage: document.getElementById("stage"),
    stageBg: document.getElementById("stageBg"),
    stageFlash: document.getElementById("stageFlash"),
    stageNoise: document.getElementById("stageNoise"),
    sceneTag: document.getElementById("sceneTag"),
    speakerName: document.getElementById("speakerName"),
    dialogueText: document.getElementById("dialogueText"),
    dialogueHint: document.getElementById("dialogueHint"),
    clickBird: document.getElementById("clickBird"),
    autoIndicator: document.getElementById("autoIndicator"),
    autoIndicatorTime: document.getElementById("autoIndicatorTime"),
    timerChip: document.getElementById("timerChip"),
    choices: document.getElementById("choices"),
    charactersLayer: document.getElementById("charactersLayer"),
    backBtn: document.getElementById("backBtn"),
    autoBtn: document.getElementById("autoBtn"),
    skipBtn: document.getElementById("skipBtn"),
    saveBtn: document.getElementById("saveBtn"),
    loadBtn: document.getElementById("loadBtn"),
    settingsBtn: document.getElementById("settingsBtn"),
    toast: document.getElementById("toast"),
    logPanel: document.getElementById("logPanel"),
    logList: document.getElementById("logList"),
    closeLogBtn: document.getElementById("closeLogBtn"),
    settingsPanel: document.getElementById("settingsPanel"),
    closeSettingsBtn: document.getElementById("closeSettingsBtn"),
    settingsTabButtons: Array.from(document.querySelectorAll("#settingsPanel .tab-btn")),
    settingsTabPanels: Array.from(document.querySelectorAll("#settingsPanel .settings-tab")),
    languageSelect: document.getElementById("languageSelect"),
    savePanel: document.getElementById("savePanel"),
    savePanelTitle: document.getElementById("savePanelTitle"),
    saveList: document.getElementById("saveList"),
    saveModeBtn: document.getElementById("saveModeBtn"),
    loadModeBtn: document.getElementById("loadModeBtn"),
    closeSaveBtn: document.getElementById("closeSaveBtn"),
    desktopPanel: document.getElementById("desktopPanel"),
    desktopFiles: document.getElementById("desktopFiles"),
    desktopCloseBtn: document.getElementById("desktopCloseBtn"),
    desktopOpenFolderBtn: document.getElementById("desktopOpenFolderBtn"),
    fileViewerPanel: document.getElementById("fileViewerPanel"),
    fileViewerTitle: document.getElementById("fileViewerTitle"),
    fileViewerMeta: document.getElementById("fileViewerMeta"),
    fileViewerContent: document.getElementById("fileViewerContent"),
    fileViewerCloseBtn: document.getElementById("fileViewerCloseBtn"),
    fileViewerOpenFolderBtn: document.getElementById("fileViewerOpenFolderBtn"),
    inputPanel: document.getElementById("inputPanel"),
    inputPanelTitle: document.getElementById("inputPanelTitle"),
    inputPanelNote: document.getElementById("inputPanelNote"),
    inputPanelField: document.getElementById("inputPanelField"),
    inputPanelPreview: document.getElementById("inputPanelPreview"),
    inputPanelSubmitBtn: document.getElementById("inputPanelSubmitBtn"),
    inputPanelCancelBtn: document.getElementById("inputPanelCancelBtn"),
    inputPanelCloseBtn: document.getElementById("inputPanelCloseBtn"),
    checkpointsPanel: document.getElementById("checkpointsPanel"),
    checkpointsList: document.getElementById("checkpointsList"),
    closeCheckpointsBtn: document.getElementById("closeCheckpointsBtn"),
    devPanel: document.getElementById("devPanel"),
    closeDevBtn: document.getElementById("closeDevBtn"),
    devJumpInput: document.getElementById("devJumpInput"),
    devJumpBtn: document.getElementById("devJumpBtn"),
    devReloadBtn: document.getElementById("devReloadBtn"),
    devValidateBtn: document.getElementById("devValidateBtn"),
    devSaveList: document.getElementById("devSaveList"),
    openDevBtn: document.getElementById("openDevBtn"),
    fakePromptPanel: document.getElementById("fakePromptPanel"),
    fakePromptText: document.getElementById("fakePromptText"),
    fakePromptOkBtn: document.getElementById("fakePromptOkBtn"),
    focusEyeOverlay: document.getElementById("focusEyeOverlay"),
    focusEyeVideo: document.getElementById("focusEyeVideo"),
    screenTextOverlay: document.getElementById("screenTextOverlay"),
    screenTextContent: document.getElementById("screenTextContent"),
    textSpeedInput: document.getElementById("textSpeedInput"),
    textSpeedValue: document.getElementById("textSpeedValue"),
    textSizeInput: document.getElementById("textSizeInput"),
    textSizeValue: document.getElementById("textSizeValue"),
    textOpacityInput: document.getElementById("textOpacityInput"),
    textOpacityValue: document.getElementById("textOpacityValue"),
    autoDelayInput: document.getElementById("autoDelayInput"),
    autoDelayValue: document.getElementById("autoDelayValue"),
    distortionInput: document.getElementById("distortionInput"),
    distortionValue: document.getElementById("distortionValue"),
    musicVolumeInput: document.getElementById("musicVolumeInput"),
    musicVolumeValue: document.getElementById("musicVolumeValue"),
    voiceVolumeInput: document.getElementById("voiceVolumeInput"),
    voiceVolumeValue: document.getElementById("voiceVolumeValue"),
    sfxVolumeInput: document.getElementById("sfxVolumeInput"),
    sfxVolumeValue: document.getElementById("sfxVolumeValue"),
    ambienceVolumeInput: document.getElementById("ambienceVolumeInput"),
    ambienceVolumeValue: document.getElementById("ambienceVolumeValue"),
    skipUnreadInput: document.getElementById("skipUnreadInput"),
    voiceBlipInput: document.getElementById("voiceBlipInput"),
    pressureLayerInput: document.getElementById("pressureLayerInput"),
    glitchTextInput: document.getElementById("glitchTextInput"),
    timedChoiceInput: document.getElementById("timedChoiceInput"),
    ambienceInput: document.getElementById("ambienceInput"),
    openLogBtn: document.getElementById("openLogBtn"),
    toggleMuteBtn: document.getElementById("toggleMuteBtn"),
    toggleUiBtn: document.getElementById("toggleUiBtn"),
    openCheckpointsBtn: document.getElementById("openCheckpointsBtn"),
    restartBtn: document.getElementById("restartBtn"),
    resetSettingsBtn: document.getElementById("resetSettingsBtn"),
    telemetrySummary: document.getElementById("telemetrySummary"),
    langSplash: document.getElementById("langSplash"),
    langRuBtn: document.getElementById("langRuBtn"),
    langEnBtn: document.getElementById("langEnBtn")
};

function clampSceneIndex(index) {
    if (!scenes.length) {
        return 0;
    }
    if (typeof index !== "number" || Number.isNaN(index)) {
        return 0;
    }
    if (index < 0) {
        return 0;
    }
    if (index >= scenes.length) {
        return scenes.length - 1;
    }
    return index;
}

function normalizeSceneId(value) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            return "";
        }
        return String(value);
    }
    if (typeof value === "string") {
        return value.trim();
    }
    return "";
}

function resolveSceneIndex(target) {
    const normalized = normalizeSceneId(target);
    if (!normalized) {
        return null;
    }
    if (sceneIdToIndex.has(normalized)) {
        return sceneIdToIndex.get(normalized);
    }
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
        const asNumber = Number(normalized);
        if (Number.isFinite(asNumber)) {
            const numericId = String(asNumber);
            if (sceneIdToIndex.has(numericId)) {
                return sceneIdToIndex.get(numericId);
            }
            return clampSceneIndex(asNumber);
        }
    }
    return null;
}

function resolveSceneTarget(target) {
    if (target === null || target === undefined) {
        return null;
    }
    if (typeof target === "string") {
        const trimmed = target.trim();
        return trimmed ? trimmed : null;
    }
    if (typeof target === "number" && Number.isFinite(target)) {
        const numericId = String(target);
        if (sceneIdToIndex.has(numericId)) {
            return numericId;
        }
        return getSceneIdByIndex(target);
    }
    return null;
}

function getSceneIdByIndex(index) {
    const safeIndex = clampSceneIndex(index);
    const scene = scenes[safeIndex];
    if (scene && scene.id !== undefined && scene.id !== null) {
        return String(scene.id);
    }
    return String(safeIndex);
}

function clampValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function toNumber(value, fallbackValue) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function toOptionalNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function nowMs() {
    return Date.now();
}

function clampString(value) {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim();
}

function parseTagTokens(source) {
    if (!source) {
        return [];
    }
    const matches = source.match(/(?:[^\s"]+|"[^"]*")+/g);
    if (!matches) {
        return [];
    }
    return matches.map(function (token) {
        if (token.length >= 2 && token.startsWith("\"") && token.endsWith("\"")) {
            return token.slice(1, -1);
        }
        return token;
    });
}

function parseTagDefinition(tagContent) {
    const tokens = parseTagTokens(tagContent);
    if (!tokens.length) {
        return null;
    }
    const first = tokens.shift();
    if (!first) {
        return null;
    }
    let name = first;
    const params = {};
    if (first.includes("=")) {
        const parts = first.split("=");
        name = parts[0];
        params.value = parts.slice(1).join("=");
    }
    name = name.trim().toLowerCase();

    tokens.forEach(function (token) {
        if (!token) {
            return;
        }
        if (token.includes("=")) {
            const parts = token.split("=");
            const key = parts[0].trim().toLowerCase();
            const value = parts.slice(1).join("=");
            if (key) {
                params[key] = value;
            }
            return;
        }
        if (!params.value) {
            params.value = token;
        }
    });

    return { name: name, params: params };
}

function getParamNumber(params, keys, fallbackValue) {
    if (!params) {
        return fallbackValue;
    }
    for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        if (params[key] !== undefined) {
            return toNumber(params[key], fallbackValue);
        }
    }
    if (params.value !== undefined) {
        return toNumber(params.value, fallbackValue);
    }
    return fallbackValue;
}

function getParamString(params, keys, fallbackValue) {
    if (!params) {
        return fallbackValue;
    }
    for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        if (params[key] !== undefined) {
            return String(params[key]);
        }
    }
    if (params.value !== undefined) {
        return String(params.value);
    }
    return fallbackValue;
}

function getParamBoolean(params, keys, fallbackValue) {
    if (!params) {
        return fallbackValue;
    }
    const parseValue = function (value) {
        if (typeof value === "boolean") {
            return value;
        }
        if (value === null || value === undefined) {
            return fallbackValue;
        }
        const normalized = String(value).trim().toLowerCase();
        if (["true", "1", "yes", "y", "on"].includes(normalized)) {
            return true;
        }
        if (["false", "0", "no", "n", "off"].includes(normalized)) {
            return false;
        }
        return fallbackValue;
    };
    for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        if (params[key] !== undefined) {
            return parseValue(params[key]);
        }
    }
    if (params.value !== undefined) {
        return parseValue(params.value);
    }
    return fallbackValue;
}

function buildChromaCacheKey(originalSrc) {
    return [
        CHROMA_CACHE_VERSION,
        CHROMA_KEY_TARGET.r,
        CHROMA_KEY_TARGET.g,
        CHROMA_KEY_TARGET.b,
        CHROMA_KEY_THRESHOLD,
        CHROMA_KEY_SOFTNESS,
        CHROMA_KEY_SPILL,
        originalSrc
    ].join("|");
}

function openChromaCacheDb() {
    if (!ENABLE_PERSISTENT_CHROMA_CACHE || IS_FILE_ORIGIN || typeof indexedDB === "undefined") {
        return null;
    }
    if (chromaDbPromise) {
        return chromaDbPromise;
    }
    chromaDbPromise = new Promise(function (resolve) {
        const request = indexedDB.open(CHROMA_CACHE_DB_NAME, 1);
        request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains(CHROMA_CACHE_STORE)) {
                db.createObjectStore(CHROMA_CACHE_STORE, { keyPath: "key" });
            }
        };
        request.onsuccess = function () {
            resolve(request.result);
        };
        request.onerror = function () {
            resolve(null);
        };
    });
    return chromaDbPromise;
}

function loadPersistentChroma(cacheKey) {
    const dbPromise = openChromaCacheDb();
    if (!dbPromise) {
        return Promise.resolve(null);
    }
    return dbPromise.then(function (db) {
        if (!db) {
            return null;
        }
        return new Promise(function (resolve) {
            const tx = db.transaction(CHROMA_CACHE_STORE, "readonly");
            const store = tx.objectStore(CHROMA_CACHE_STORE);
            const request = store.get(cacheKey);
            request.onsuccess = function () {
                const record = request.result;
                if (record && record.blob instanceof Blob) {
                    try {
                        const url = URL.createObjectURL(record.blob);
                        resolve(url);
                        return;
                    } catch (error) {
                        resolve(null);
                        return;
                    }
                }
                resolve(null);
            };
            request.onerror = function () {
                resolve(null);
            };
        });
    });
}

function storePersistentChroma(cacheKey, blob) {
    const dbPromise = openChromaCacheDb();
    if (!dbPromise) {
        return;
    }
    dbPromise.then(function (db) {
        if (!db) {
            return;
        }
        const tx = db.transaction(CHROMA_CACHE_STORE, "readwrite");
        const store = tx.objectStore(CHROMA_CACHE_STORE);
        store.put({
            key: cacheKey,
            blob: blob,
            updatedAt: nowMs()
        });
    });
}

function applyChromaKey(image, onDone, skipPersistent) {
    const done = typeof onDone === "function" ? onDone : null;
    const ignorePersistent = Boolean(skipPersistent);

    if (!image) {
        if (done) {
            done();
        }
        return;
    }

    if (image.dataset.chromaApplied === "1") {
        if (done) {
            done();
        }
        return;
    }

    if (image.dataset.chromaApplied === "pending") {
        return;
    }

    if (IS_FILE_ORIGIN) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    const originalSrc = image.currentSrc || image.src;
    if (!originalSrc) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    const cacheKey = buildChromaCacheKey(originalSrc);
    if (chromaCache.has(cacheKey)) {
        const cachedUrl = chromaCache.get(cacheKey);
        if (cachedUrl && cachedUrl !== originalSrc) {
            image.dataset.chromaApplied = "pending";
            if (done) {
                chromaPendingCallbacks.set(image, done);
            }
            image.src = cachedUrl;
            return;
        }
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    if (ENABLE_PERSISTENT_CHROMA_CACHE && !IS_FILE_ORIGIN && !ignorePersistent) {
        image.dataset.chromaApplied = "pending";
        if (done) {
            chromaPendingCallbacks.set(image, done);
        }
        loadPersistentChroma(cacheKey).then(function (cachedUrl) {
            if (image.currentSrc !== originalSrc) {
                chromaPendingCallbacks.delete(image);
                return;
            }
            if (cachedUrl) {
                chromaCache.set(cacheKey, cachedUrl);
                image.src = cachedUrl;
                return;
            }
            chromaPendingCallbacks.delete(image);
            image.dataset.chromaApplied = "";
            applyChromaKey(image, done, true);
        });
        return;
    }

    const canvas = document.createElement("canvas");
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0);

    let imageData;
    try {
        imageData = context.getImageData(0, 0, width, height);
    } catch (error) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }
    const data = imageData.data;
    const target = CHROMA_KEY_TARGET;
    const threshold = CHROMA_KEY_THRESHOLD;
    const softness = CHROMA_KEY_SOFTNESS;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        if (a === 0) {
            continue;
        }

        const dr = r - target.r;
        const dg = g - target.g;
        const db = b - target.b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);

        if (distance <= threshold) {
            data[index + 3] = 0;
            continue;
        }

        if (distance < threshold + softness) {
            const ratio = (distance - threshold) / softness;
            const nextAlpha = Math.round(a * ratio);
            data[index + 3] = nextAlpha < CHROMA_KEY_ALPHA_CUTOFF ? 0 : nextAlpha;
            if (g > r && g > b) {
                const maxRB = Math.max(r, b);
                const spill = (1 - ratio) * CHROMA_KEY_SPILL;
                data[index + 1] = Math.round(g - (g - maxRB) * spill);
            }
            continue;
        }

        if (g > r && g > b && g - Math.max(r, b) > 12) {
            data[index + 1] = Math.round(g - (g - Math.max(r, b)) * (CHROMA_KEY_SPILL * 0.25));
        }
    }

    if (CHROMA_KEY_EDGE_ERODE_PX > 0) {
        const pixelCount = width * height;
        const alphaMap = new Uint8ClampedArray(pixelCount);
        for (let i = 0; i < pixelCount; i += 1) {
            alphaMap[i] = data[i * 4 + 3];
        }
        const erode = CHROMA_KEY_EDGE_ERODE_PX;
        const nextAlpha = new Uint8ClampedArray(alphaMap);
        for (let y = 0; y < height; y += 1) {
            const rowOffset = y * width;
            for (let x = 0; x < width; x += 1) {
                const idx = rowOffset + x;
                if (alphaMap[idx] === 0) {
                    continue;
                }
                let shouldErode = false;
                for (let dy = -erode; dy <= erode && !shouldErode; dy += 1) {
                    const ny = y + dy;
                    if (ny < 0 || ny >= height) {
                        shouldErode = true;
                        break;
                    }
                    const nOffset = ny * width;
                    for (let dx = -erode; dx <= erode; dx += 1) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= width) {
                            shouldErode = true;
                            break;
                        }
                        if (alphaMap[nOffset + nx] === 0) {
                            shouldErode = true;
                            break;
                        }
                    }
                }
                if (shouldErode) {
                    nextAlpha[idx] = 0;
                }
            }
        }
        for (let i = 0; i < pixelCount; i += 1) {
            data[i * 4 + 3] = nextAlpha[i];
        }
    }

    for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha <= 0) {
            continue;
        }
        if (CHROMA_KEY_EDGE_PREMULTIPLY && alpha < 255) {
            const factor = alpha / 255;
            data[index] = Math.round(data[index] * factor);
            data[index + 1] = Math.round(data[index + 1] * factor);
            data[index + 2] = Math.round(data[index + 2] * factor);
        }
        const pixelIndex = index / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        if (x < minX) {
            minX = x;
        }
        if (y < minY) {
            minY = y;
        }
        if (x > maxX) {
            maxX = x;
        }
        if (y > maxY) {
            maxY = y;
        }
    }

    if (maxX < minX || maxY < minY) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    const cropCanvas = document.createElement("canvas");
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const cropContext = cropCanvas.getContext("2d");
    if (!cropContext) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    try {
        context.putImageData(imageData, 0, 0);
        cropContext.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    } catch (error) {
        image.dataset.chromaApplied = "1";
        if (done) {
            done();
        }
        return;
    }

    cropCanvas.toBlob(function (blob) {
        if (!blob) {
            image.dataset.chromaApplied = "1";
            if (done) {
                done();
            }
            return;
        }
        const url = URL.createObjectURL(blob);
        chromaCache.set(cacheKey, url);
        if (ENABLE_PERSISTENT_CHROMA_CACHE && !IS_FILE_ORIGIN) {
            storePersistentChroma(cacheKey, blob);
        }
        image.dataset.chromaApplied = "pending";
        if (done) {
            chromaPendingCallbacks.set(image, done);
        }
        image.src = url;
    }, "image/png");
}

function addChromaAsset(set, assetName) {
    const normalized = normalizeAssetName(assetName);
    if (!normalized || !isImageAsset(normalized)) {
        return;
    }
    set.add(normalized);
}

function collectFrameAssets(framesRaw, baseImages, set) {
    if (!Array.isArray(framesRaw)) {
        return;
    }
    framesRaw.forEach(function (frame) {
        if (typeof frame !== "string") {
            return;
        }
        const token = frame.trim();
        if (!token || isVideoAsset(token)) {
            return;
        }
        if (isImageAsset(token)) {
            addChromaAsset(set, token);
            return;
        }
        if (baseImages && Object.prototype.hasOwnProperty.call(baseImages, token)) {
            const pose = baseImages[token];
            const poseImage = pickImageName(pose);
            if (poseImage) {
                addChromaAsset(set, poseImage);
            }
        }
    });
}

function collectChromaAssetsFromCharacters(set) {
    Object.keys(CHARACTER_DATA).forEach(function (id) {
        const character = CHARACTER_DATA[id];
        if (!character || typeof character !== "object") {
            return;
        }
        addChromaAsset(set, pickImageName(character));
        const images = character.images && typeof character.images === "object" ? character.images : null;
        if (images) {
            Object.keys(images).forEach(function (key) {
                const pose = images[key];
                addChromaAsset(set, pickImageName(pose));
                if (pose && Object.prototype.hasOwnProperty.call(pose, "frames")) {
                    collectFrameAssets(pose.frames, images, set);
                }
            });
        }
        if (Object.prototype.hasOwnProperty.call(character, "frames")) {
            collectFrameAssets(character.frames, images, set);
        }
    });
}

function collectChromaAssetsFromScenes(set) {
    scenes.forEach(function (scene) {
        if (!scene || !Array.isArray(scene.characters)) {
            return;
        }
        scene.characters.forEach(function (entry) {
            if (!entry || typeof entry !== "object") {
                return;
            }
            addChromaAsset(set, pickImageName(entry));
            const id = entry.characterId || entry.use;
            const base = id && CHARACTER_DATA[id];
            const images = base && typeof base.images === "object" ? base.images : null;
            const poseKey = typeof entry.pose === "string"
                ? entry.pose
                : (typeof entry.imageKey === "string" ? entry.imageKey : "");
            if (poseKey && images && Object.prototype.hasOwnProperty.call(images, poseKey)) {
                addChromaAsset(set, pickImageName(images[poseKey]));
            }
            if (Object.prototype.hasOwnProperty.call(entry, "frames")) {
                collectFrameAssets(entry.frames, images, set);
            }
        });
    });
}

function prewarmChromaAsset(assetName, holders) {
    if (!assetName || !isImageAsset(assetName)) {
        return;
    }
    const image = new Image();
    if (!IS_FILE_ORIGIN) {
        image.crossOrigin = "anonymous";
        image.referrerPolicy = "no-referrer";
    }
    image.addEventListener("load", function () {
        if (image.dataset.chromaApplied === "pending") {
            image.dataset.chromaApplied = "1";
            const pending = chromaPendingCallbacks.get(image);
            if (pending) {
                chromaPendingCallbacks.delete(image);
                pending();
            }
            return;
        }
        try {
            applyChromaKey(image);
        } catch (error) {
            image.dataset.chromaApplied = "1";
        }
    });
    image.addEventListener("error", function () {
        chromaPendingCallbacks.delete(image);
    });
    if (Array.isArray(holders)) {
        holders.push(image);
    }
    image.src = encodeURI("assets/" + assetName);
}

function prewarmChromaCache() {
    if (!PREWARM_CHROMA_ON_START || IS_FILE_ORIGIN) {
        return;
    }
    const assetSet = new Set();
    collectChromaAssetsFromCharacters(assetSet);
    collectChromaAssetsFromScenes(assetSet);

    const assets = Array.from(assetSet).filter(isImageAsset);
    if (!assets.length) {
        return;
    }

    let index = 0;
    const holders = [];

    function processSlice(deadline) {
        const start = performance.now();
        while (index < assets.length) {
            if (deadline && typeof deadline.timeRemaining === "function") {
                if (deadline.timeRemaining() < 6) {
                    break;
                }
            } else if (performance.now() - start > PREWARM_CHROMA_SLICE_MS) {
                break;
            }
            prewarmChromaAsset(assets[index], holders);
            index += 1;
        }
        if (index < assets.length) {
            schedule();
        } else {
            setTimeout(function () {
                holders.length = 0;
            }, 1000);
        }
    }

    function schedule() {
        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(processSlice, { timeout: 200 });
        } else {
            setTimeout(function () {
                processSlice();
            }, 30);
        }
    }

    schedule();
}

function scheduleChromaPrewarm() {
    if (!PREWARM_CHROMA_ON_START || state.prewarmStarted) {
        return;
    }
    state.prewarmStarted = true;
    setTimeout(prewarmChromaCache, PREWARM_CHROMA_START_DELAY_MS);
}

function normalizeAssetName(value) {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim().replace(/\\/g, "/").replace(/^\/+/, "");
}

function normalizeAudioName(value) {
    if (typeof value !== "string") {
        return "";
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }
    const lowered = trimmed.toLowerCase();
    if (lowered === "none" || lowered === "null" || lowered === "off" || lowered === "stop" || lowered === "silence" || lowered === "silent" || lowered === "mute") {
        return "";
    }
    return normalizeAssetName(trimmed);
}

function getVolumeFactor(value, fallbackValue) {
    return clampValue(toNumber(value, fallbackValue), 0, 100) / 100;
}

function getMusicVolumeFactor() {
    return getVolumeFactor(state.settings.musicVolume, DEFAULT_SETTINGS.musicVolume);
}

function getVoiceVolumeFactor() {
    return getVolumeFactor(state.settings.voiceVolume, DEFAULT_SETTINGS.voiceVolume);
}

function getSfxVolumeFactor() {
    return getVolumeFactor(state.settings.sfxVolume, DEFAULT_SETTINGS.sfxVolume);
}

function getAmbienceVolumeFactor() {
    return getVolumeFactor(state.settings.ambienceVolume, DEFAULT_SETTINGS.ambienceVolume);
}

function isVideoAsset(name) {
    if (typeof name !== "string") {
        return false;
    }
    const lowered = name.trim().toLowerCase();
    return VIDEO_EXTENSIONS.some(function (ext) {
        return lowered.endsWith(ext);
    });
}

function isImageAsset(name) {
    if (typeof name !== "string") {
        return false;
    }
    const lowered = name.trim().toLowerCase();
    return IMAGE_EXTENSIONS.some(function (ext) {
        return lowered.endsWith(ext);
    });
}

function pickImageName(source) {
    if (!source || typeof source !== "object") {
        return "";
    }
    const candidate = source.imageName || source.characterImageName || "";
    if (typeof candidate === "string" && candidate.trim()) {
        return isVideoAsset(candidate) ? "" : candidate.trim();
    }
    if (typeof source.src === "string" && source.src.trim() && !isVideoAsset(source.src)) {
        return source.src.trim();
    }
    return "";
}

function pickVideoName(source) {
    if (!source || typeof source !== "object") {
        return "";
    }
    const candidate = source.videoName || source.video || source.videoSrc || "";
    if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
    }
    const imageCandidate = source.imageName || source.characterImageName || "";
    if (typeof imageCandidate === "string" && imageCandidate.trim() && isVideoAsset(imageCandidate)) {
        return imageCandidate.trim();
    }
    if (typeof source.src === "string" && source.src.trim() && isVideoAsset(source.src)) {
        return source.src.trim();
    }
    if (typeof source.mediaType === "string" && source.mediaType.toLowerCase() === "video") {
        if (typeof source.src === "string" && source.src.trim()) {
            return source.src.trim();
        }
    }
    return "";
}

function normalizeOverlaySpec(source) {
    if (!source || typeof source !== "object") {
        return null;
    }
    const videoName = pickVideoName(source);
    if (!videoName) {
        return null;
    }
    const anchorRaw = typeof source.anchor === "string" ? source.anchor.trim().toLowerCase() : "";
    return {
        videoName: videoName,
        x: toOptionalNumber(source.x),
        y: toOptionalNumber(source.y),
        width: toOptionalNumber(source.width),
        height: toOptionalNumber(source.height),
        xPx: toOptionalNumber(source.xPx),
        yPx: toOptionalNumber(source.yPx),
        widthPx: toOptionalNumber(source.widthPx),
        heightPx: toOptionalNumber(source.heightPx),
        opacity: clampValue(toNumber(source.opacity, 1), 0, 1),
        blend: typeof source.blend === "string" ? source.blend.trim() : "",
        loop: source.loop !== false,
        muted: source.muted !== false,
        autoplay: source.autoplay !== false,
        playbackRate: toNumber(source.playbackRate, 1),
        scale: toNumber(source.scale, 1),
        anchor: anchorRaw === "center" ? "center" : ""
    };
}

function normalizeFrameMode(value) {
    if (typeof value !== "string") {
        return "";
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "loop" || normalized === "once" || normalized === "random") {
        return normalized;
    }
    return "";
}

function resolveFrameList(framesRaw, baseImages, refId) {
    if (!Array.isArray(framesRaw)) {
        return [];
    }
    const resolved = [];
    const label = refId || "character";

    framesRaw.forEach(function (frame) {
        if (typeof frame !== "string") {
            return;
        }
        const token = frame.trim();
        if (!token) {
            return;
        }

        if (isVideoAsset(token)) {
            warnCharacterOnce("frame_video:" + label + ":" + token, "Frame '" + token + "' is a video. Use images.");
            return;
        }
        if (isImageAsset(token)) {
            resolved.push(token);
            return;
        }

        if (baseImages && Object.prototype.hasOwnProperty.call(baseImages, token)) {
            const pose = baseImages[token];
            const poseImage = pickImageName(pose);
            const poseVideo = pickVideoName(pose);
            if (poseVideo) {
                warnCharacterOnce(
                    "frame_pose_video:" + label + ":" + token,
                    "Frame pose '" + token + "' is a video. Use images."
                );
                return;
            }
            if (poseImage) {
                resolved.push(poseImage);
                return;
            }
            warnCharacterOnce(
                "frame_pose_empty:" + label + ":" + token,
                "Frame pose '" + token + "' has no image source."
            );
            return;
        }

        warnCharacterOnce("frame_pose_missing:" + label + ":" + token, "Unknown frame pose '" + token + "' for " + label);
    });

    return resolved;
}

function buildStageBackground(imageName) {
    const normalized = normalizeAssetName(imageName);
    if (!normalized) {
        return "none";
    }

    const assetUrl = encodeURI("assets/" + normalized).replace(/"/g, "%22");
    return STAGE_BACKGROUND_OVERLAYS + ', url("' + assetUrl + '")';
}

function updateStageScale() {
    if (!ui.root || !ui.stage) {
        return;
    }
    const rect = ui.stage.getBoundingClientRect();
    const width = rect && rect.width ? rect.width : window.innerWidth;
    const height = rect && rect.height ? rect.height : window.innerHeight;
    if (!width || !height) {
        return;
    }
    const minScale = PREVIEW_MODE ? PREVIEW_MIN_STAGE_SCALE : MIN_STAGE_SCALE;
    const scale = clampValue(
        Math.min(width / BASE_STAGE_WIDTH, height / BASE_STAGE_HEIGHT),
        minScale,
        MAX_STAGE_SCALE
    );
    ui.root.style.setProperty("--stage-scale", scale.toFixed(3));
    const uiScale = clampValue(scale, PREVIEW_MODE ? 0.3 : 0.4, 1);
    ui.root.style.setProperty("--ui-scale", uiScale.toFixed(3));
}

function bindResizeEvents() {
    window.addEventListener("resize", function () {
        if (stageScaleRaf) {
            cancelAnimationFrame(stageScaleRaf);
        }
        stageScaleRaf = requestAnimationFrame(function () {
            stageScaleRaf = 0;
            updateStageScale();
        });
    });
}

function applyTextSize() {
    if (!ui.root) {
        return;
    }
    const sizePx = clampValue(toNumber(state.settings.textSizePx, DEFAULT_SETTINGS.textSizePx), 12, 40);
    ui.root.style.setProperty("--dialogue-size", sizePx + "px");
}

function applyTextOpacity() {
    if (!ui.root) {
        return;
    }
    const opacity = clampValue(toNumber(state.settings.textOpacity, DEFAULT_SETTINGS.textOpacity), 10, 100) / 100;
    ui.root.style.setProperty("--dialogue-text-opacity", String(opacity));
}

function getAudioContextSafe() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
        return null;
    }

    if (!state.audioCtx) {
        state.audioCtx = new AudioContextCtor();
    }
    return state.audioCtx;
}

function unlockAudioFromGesture() {
    state.audioUnlocked = true;

    const audioCtx = getAudioContextSafe();
    if (!audioCtx) {
        return;
    }

    if (audioCtx.state === "suspended") {
        audioCtx.resume()
            .then(function () {
                refreshAmbienceState();
                if (state.bgm.pendingPlay) {
                    state.bgm.pendingPlay = false;
                    resumeBgm();
                }
                resumeVoiceLoopPending();
            })
            .catch(function () {});
        return;
    }

    refreshAmbienceState();
    if (state.bgm.pendingPlay) {
        state.bgm.pendingPlay = false;
        resumeBgm();
    }
    resumeVoiceLoopPending();
}

function getSlotStorageKey(slot) {
    return STORAGE_KEY + "_slot_" + slot;
}

function readStorageWithFallback(primaryKey, fallbacks) {
    const keys = [primaryKey].concat(Array.isArray(fallbacks) ? fallbacks : []);
    for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        const raw = localStorage.getItem(key);
        if (raw) {
            return raw;
        }
    }
    return "";
}

function parseJsonSafe(rawValue, fallbackValue) {
    try {
        if (!rawValue) {
            return fallbackValue;
        }
        return JSON.parse(rawValue);
    } catch (error) {
        return fallbackValue;
    }
}

function normalizeSettings(value) {
    const src = value && typeof value === "object" ? value : {};
    return {
        textSpeedMs: clampValue(toNumber(src.textSpeedMs, DEFAULT_SETTINGS.textSpeedMs), 0, 70),
        textSizePx: clampValue(toNumber(src.textSizePx, DEFAULT_SETTINGS.textSizePx), 12, 40),
        textOpacity: clampValue(toNumber(src.textOpacity, DEFAULT_SETTINGS.textOpacity), 10, 100),
        autoDelayMs: clampValue(toNumber(src.autoDelayMs, DEFAULT_SETTINGS.autoDelayMs), 300, 6000),
        skipUnread: Boolean(src.skipUnread),
        voiceBlip: Boolean(src.voiceBlip),
        pressureLayer: src.pressureLayer !== false,
        glitchText: src.glitchText !== false,
        timedChoices: src.timedChoices !== false,
        ambience: Object.prototype.hasOwnProperty.call(src, "ambience")
            ? Boolean(src.ambience)
            : DEFAULT_SETTINGS.ambience,
        musicVolume: clampValue(toNumber(src.musicVolume, DEFAULT_SETTINGS.musicVolume), 0, 100),
        voiceVolume: clampValue(toNumber(src.voiceVolume, DEFAULT_SETTINGS.voiceVolume), 0, 100),
        sfxVolume: clampValue(toNumber(src.sfxVolume, DEFAULT_SETTINGS.sfxVolume), 0, 100),
        ambienceVolume: clampValue(toNumber(src.ambienceVolume, DEFAULT_SETTINGS.ambienceVolume), 0, 100),
        distortionIntensity: clampValue(toNumber(src.distortionIntensity, DEFAULT_SETTINGS.distortionIntensity), 0, 100)
    };
}

function applyAmbienceDefaultOffMigration() {
    if (localStorage.getItem(AMBIENCE_MIGRATION_KEY) === "1") {
        return;
    }

    state.settings.ambience = false;
    persistSettings();
    localStorage.setItem(AMBIENCE_MIGRATION_KEY, "1");
}

function persistJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadSettings() {
    const raw = readStorageWithFallback(SETTINGS_KEY, LEGACY_FALLBACK_KEYS.settings);
    state.settings = normalizeSettings(parseJsonSafe(raw, DEFAULT_SETTINGS));
}

function loadReadScenes() {
    const raw = readStorageWithFallback(READ_SCENES_KEY, LEGACY_FALLBACK_KEYS.readScenes);
    const parsed = parseJsonSafe(raw, []);
    if (Array.isArray(parsed)) {
        state.readScenes = new Set(parsed.map(function (index) {
            return clampSceneIndex(Number(index));
        }));
    }
}

function loadTelemetry() {
    const parsed = parseJsonSafe(localStorage.getItem(TELEMETRY_KEY), null);
    if (!parsed || typeof parsed !== "object") {
        return;
    }

    state.telemetry.sessionMs = toNumber(parsed.sessionMs, 0);
    state.telemetry.idleMs = toNumber(parsed.idleMs, 0);
    state.telemetry.clickCount = toNumber(parsed.clickCount, 0);
    state.telemetry.keyCount = toNumber(parsed.keyCount, 0);
    state.telemetry.avgClickIntervalMs = toNumber(parsed.avgClickIntervalMs, 0);
    state.telemetry.avgKeyIntervalMs = toNumber(parsed.avgKeyIntervalMs, 0);
    state.telemetry.revisitCount = toNumber(parsed.revisitCount, 0);
    state.telemetry.saveCount = toNumber(parsed.saveCount, 0);
    state.telemetry.loadCount = toNumber(parsed.loadCount, 0);
    state.telemetry.timeoutCount = toNumber(parsed.timeoutCount, 0);
    state.telemetry.corruptedChoiceCount = toNumber(parsed.corruptedChoiceCount, 0);
    state.telemetry.settingsOpenCount = toNumber(parsed.settingsOpenCount, 0);
    state.telemetry.logOpenCount = toNumber(parsed.logOpenCount, 0);
    state.telemetry.fakePromptCount = toNumber(parsed.fakePromptCount, 0);
}

function loadLabProgress() {
    const parsed = parseJsonSafe(localStorage.getItem(LAB_PROGRESS_KEY), null);
    if (!parsed || typeof parsed !== "object") {
        return;
    }
    state.labProgress.checkpointsVisited = parsed.checkpointsVisited && typeof parsed.checkpointsVisited === "object"
        ? { ...parsed.checkpointsVisited }
        : {};
    state.labProgress.modulesSeen = parsed.modulesSeen && typeof parsed.modulesSeen === "object"
        ? { ...parsed.modulesSeen }
        : {};
}

function loadSlotMeta() {
    const parsed = parseJsonSafe(localStorage.getItem(SLOT_META_KEY), null);
    if (!parsed || typeof parsed !== "object") {
        return;
    }

    [1, 2, 3, "autosave"].forEach(function (slot) {
        if (parsed[slot] && typeof parsed[slot] === "object") {
            state.slotMeta[slot] = {
                anomaly: clampValue(toNumber(parsed[slot].anomaly, 0), 0, 9),
                note: String(parsed[slot].note || "stable"),
                writes: clampValue(toNumber(parsed[slot].writes, 0), 0, 9999),
                preview: typeof parsed[slot].preview === "string" ? parsed[slot].preview : "",
                updatedAt: toNumber(parsed[slot].updatedAt, 0)
            };
        }
    });
}

function loadMetaState() {
    if (HAS_SYSTEM && SYSTEM_API && SYSTEM_API.meta && typeof SYSTEM_API.meta.get === "function") {
        return SYSTEM_API.meta.get()
            .then(function (meta) {
                state.meta = { ...DEFAULT_META_STATE, ...(meta || {}) };
                return state.meta;
            })
            .catch(function () {
                const cached = parseJsonSafe(localStorage.getItem(META_STORAGE_KEY), {});
                state.meta = { ...DEFAULT_META_STATE, ...(cached || {}) };
                return state.meta;
            });
    }

    const parsed = parseJsonSafe(localStorage.getItem(META_STORAGE_KEY), {});
    state.meta = { ...DEFAULT_META_STATE, ...(parsed || {}) };
    return Promise.resolve(state.meta);
}

function persistMetaState() {
    if (HAS_SYSTEM && SYSTEM_API && SYSTEM_API.meta && typeof SYSTEM_API.meta.set === "function") {
        return SYSTEM_API.meta.set(state.meta).catch(function () {});
    }
    persistJson(META_STORAGE_KEY, state.meta);
    return Promise.resolve();
}

function setMetaState(patch) {
    if (!patch || typeof patch !== "object") {
        return;
    }
    state.meta = { ...state.meta, ...patch };
    persistMetaState();
}

function persistSettings() {
    persistJson(SETTINGS_KEY, state.settings);
}

function persistReadScenes() {
    persistJson(READ_SCENES_KEY, Array.from(state.readScenes));
}

function persistTelemetry() {
    persistJson(TELEMETRY_KEY, {
        sessionMs: state.telemetry.sessionMs,
        idleMs: state.telemetry.idleMs,
        clickCount: state.telemetry.clickCount,
        keyCount: state.telemetry.keyCount,
        avgClickIntervalMs: state.telemetry.avgClickIntervalMs,
        avgKeyIntervalMs: state.telemetry.avgKeyIntervalMs,
        revisitCount: state.telemetry.revisitCount,
        saveCount: state.telemetry.saveCount,
        loadCount: state.telemetry.loadCount,
        timeoutCount: state.telemetry.timeoutCount,
        corruptedChoiceCount: state.telemetry.corruptedChoiceCount,
        settingsOpenCount: state.telemetry.settingsOpenCount,
        logOpenCount: state.telemetry.logOpenCount,
        fakePromptCount: state.telemetry.fakePromptCount
    });
}

function persistLabProgress() {
    persistJson(LAB_PROGRESS_KEY, state.labProgress);
}

function persistSlotMeta() {
    persistJson(SLOT_META_KEY, state.slotMeta);
}

function markUserActivity(kind) {
    const now = nowMs();
    const telemetry = state.telemetry;

    if (kind === "click") {
        telemetry.clickCount += 1;
        if (telemetry.lastClickAt > 0) {
            const delta = now - telemetry.lastClickAt;
            const sampleCount = telemetry.clickCount - 1;
            telemetry.avgClickIntervalMs = sampleCount <= 1
                ? delta
                : Math.round((telemetry.avgClickIntervalMs * (sampleCount - 1) + delta) / sampleCount);
        }
        telemetry.lastClickAt = now;
    }

    if (kind === "key") {
        telemetry.keyCount += 1;
        if (telemetry.lastKeyAt > 0) {
            const delta = now - telemetry.lastKeyAt;
            const sampleCount = telemetry.keyCount - 1;
            telemetry.avgKeyIntervalMs = sampleCount <= 1
                ? delta
                : Math.round((telemetry.avgKeyIntervalMs * (sampleCount - 1) + delta) / sampleCount);
        }
        telemetry.lastKeyAt = now;
    }

    telemetry.lastActivityAt = now;
}

function updateTelemetryTick() {
    const telemetry = state.telemetry;
    const now = nowMs();
    const delta = now - telemetry.lastTickAt;
    if (delta <= 0) {
        return;
    }

    telemetry.sessionMs += delta;
    if (now - telemetry.lastActivityAt > IDLE_THRESHOLD_MS) {
        telemetry.idleMs += delta;
    }

    telemetry.lastTickAt = now;
    updateTelemetrySummary();
}

function calculatePressureScore() {
    const telemetry = state.telemetry;
    const settingsFactor = state.settings.distortionIntensity / 100;
    const sessionFactor = clampValue(telemetry.sessionMs / (1000 * 60 * 8), 0, 1) * 22;
    const idleFactor = clampValue(telemetry.idleMs / (1000 * 60 * 4), 0, 1) * 18;
    const revisitFactor = clampValue(telemetry.revisitCount / 20, 0, 1) * 14;
    const loadFactor = clampValue(telemetry.loadCount / 15, 0, 1) * 10;
    const timeoutFactor = clampValue(telemetry.timeoutCount / 8, 0, 1) * 12;
    const corruptionFactor = clampValue(telemetry.corruptedChoiceCount / 10, 0, 1) * 8;
    const base = sessionFactor + idleFactor + revisitFactor + loadFactor + timeoutFactor + corruptionFactor;
    return clampValue(Math.round(base * (0.4 + settingsFactor * 0.6)), 0, 100);
}

function applyPressureVisuals() {
    ui.root.classList.remove("fx-distort-low", "fx-distort-mid", "fx-distort-high");

    if (!state.settings.pressureLayer) {
        return;
    }

    const score = state.pressureScore;
    if (score < 28) {
        return;
    }

    if (score < 55) {
        ui.root.classList.add("fx-distort-low");
        return;
    }

    if (score < 78) {
        ui.root.classList.add("fx-distort-mid");
        return;
    }

    ui.root.classList.add("fx-distort-high");
}

function getDefaultPosition(index, total) {
    if (total <= 1) {
        return "center";
    }
    if (total === 2) {
        return index === 0 ? "left" : "right";
    }
    if (total === 3) {
        return ["left", "center", "right"][index] || "center";
    }
    return CHARACTER_POSITION_FALLBACK[index] || "center";
}

function positionToNormalizedX(position) {
    switch (position) {
        case "far-left":
            return 0.06;
        case "left":
            return 0.22;
        case "right":
            return 0.78;
        case "far-right":
            return 0.94;
        case "center":
        default:
            return 0.5;
    }
}

function warnCharacterOnce(key, message) {
    if (!key || characterWarningCache.has(key)) {
        return;
    }
    characterWarningCache.add(key);
    showToast(message);
}

function resolveSceneCharacters(scene) {
    if (Array.isArray(scene.characters) && scene.characters.length) {
        const sceneScale = toNumber(scene.characterScale, 1);
        return scene.characters.map(function (character, index, all) {
            const entry = character || {};
            const refId = typeof entry.characterId === "string"
                ? entry.characterId.trim()
                : (typeof entry.use === "string" ? entry.use.trim() : "");
            const base = refId && Object.prototype.hasOwnProperty.call(CHARACTER_DATA, refId)
                ? CHARACTER_DATA[refId]
                : null;
            if (refId && !base) {
                warnCharacterOnce("missing_character:" + refId, "Unknown character: " + refId);
            }

            const baseImages = base && typeof base.images === "object" ? base.images : null;
            const requestedPose = typeof entry.pose === "string"
                ? entry.pose.trim()
                : (typeof entry.imageKey === "string" ? entry.imageKey.trim() : "");
            let poseKey = requestedPose;
            if (!poseKey && base && typeof base.defaultPose === "string") {
                poseKey = base.defaultPose.trim();
            }
            if (!poseKey && baseImages) {
                const keys = Object.keys(baseImages);
                poseKey = keys.length ? keys[0] : "";
            }

            const focusOverride = state.focusEyeActive && refId === "flavy" && baseImages && baseImages.horror
                ? baseImages.horror
                : null;
            if (focusOverride) {
                poseKey = "horror";
            }
            const pose = focusOverride || (poseKey && baseImages && baseImages[poseKey] ? baseImages[poseKey] : null);
            if (refId && requestedPose && !pose) {
                warnCharacterOnce(
                    "missing_pose:" + refId + ":" + requestedPose,
                    "Unknown pose '" + requestedPose + "' for " + refId
                );
            }

            const entryVideo = focusOverride ? "" : pickVideoName(entry);
            const entryImage = focusOverride ? "" : pickImageName(entry);
            const poseVideo = pickVideoName(pose);
            const poseImage = pickImageName(pose);
            const baseVideo = pickVideoName(base);
            const baseImage = pickImageName(base);
            const videoName = entryVideo || poseVideo || baseVideo || "";
            const imageName = videoName ? "" : (entryImage || poseImage || baseImage || "");

            const entryHasFrames = !focusOverride && Object.prototype.hasOwnProperty.call(entry, "frames");
            const poseHasFrames = pose && Object.prototype.hasOwnProperty.call(pose, "frames");
            const baseHasFrames = base && Object.prototype.hasOwnProperty.call(base, "frames");
            const rawFrames = focusOverride
                ? null
                : entryHasFrames
                    ? entry.frames
                    : poseHasFrames
                        ? pose.frames
                        : baseHasFrames
                            ? base.frames
                            : null;
            const resolvedFrames = resolveFrameList(rawFrames, baseImages, refId);
            const hasFrames = resolvedFrames.length > 0;

            const entryHasFrameMs = Object.prototype.hasOwnProperty.call(entry, "frameMs");
            const poseHasFrameMs = pose && Object.prototype.hasOwnProperty.call(pose, "frameMs");
            const baseHasFrameMs = base && Object.prototype.hasOwnProperty.call(base, "frameMs");
            const rawFrameMs = entryHasFrameMs
                ? entry.frameMs
                : poseHasFrameMs
                    ? pose.frameMs
                    : baseHasFrameMs
                        ? base.frameMs
                        : null;
            const frameMs = hasFrames ? Math.max(0, toNumber(rawFrameMs, DEFAULT_FRAME_MS)) : 0;

            const entryHasFrameMode = Object.prototype.hasOwnProperty.call(entry, "frameMode");
            const poseHasFrameMode = pose && Object.prototype.hasOwnProperty.call(pose, "frameMode");
            const baseHasFrameMode = base && Object.prototype.hasOwnProperty.call(base, "frameMode");
            const rawFrameMode = entryHasFrameMode
                ? entry.frameMode
                : poseHasFrameMode
                    ? pose.frameMode
                    : baseHasFrameMode
                        ? base.frameMode
                        : "";
            const frameMode = hasFrames ? (normalizeFrameMode(rawFrameMode) || DEFAULT_FRAME_MODE) : "";

            const resolvedVideoName = hasFrames ? "" : videoName;
            const resolvedImageName = hasFrames ? (resolvedFrames[0] || imageName) : imageName;

            const entryOverlay = entry.videoOverlay || entry.overlayVideo;
            const poseOverlay = pose && (pose.videoOverlay || pose.overlayVideo);
            const baseOverlay = base && (base.videoOverlay || base.overlayVideo);
            const overlaySpec = normalizeOverlaySpec(entryOverlay || poseOverlay || baseOverlay);
            if (overlaySpec && !resolvedImageName && !hasFrames) {
                warnCharacterOnce(
                    "overlay_no_base:" + (refId || "scene") + ":" + overlaySpec.videoName,
                    "Overlay video requires an image base for " + (refId || "scene")
                );
            }

            const entryScale = Object.prototype.hasOwnProperty.call(entry, "size")
                ? toNumber(entry.size, 1)
                : Object.prototype.hasOwnProperty.call(entry, "scale")
                    ? toNumber(entry.scale, 1)
                    : 1;
            const poseScale = pose && Object.prototype.hasOwnProperty.call(pose, "size")
                ? toNumber(pose.size, 1)
                : pose && Object.prototype.hasOwnProperty.call(pose, "scale")
                    ? toNumber(pose.scale, 1)
                    : 1;
            const baseScale = base && Object.prototype.hasOwnProperty.call(base, "size")
                ? toNumber(base.size, 1)
                : base && Object.prototype.hasOwnProperty.call(base, "scale")
                    ? toNumber(base.scale, 1)
                    : base && Object.prototype.hasOwnProperty.call(base, "defaultSize")
                        ? toNumber(base.defaultSize, 1)
                        : base && Object.prototype.hasOwnProperty.call(base, "defaultScale")
                            ? toNumber(base.defaultScale, 1)
                            : 1;
            const finalScale = clampValue(sceneScale * entryScale * poseScale * baseScale, -10, 10);

            const entryHasX = Object.prototype.hasOwnProperty.call(entry, "x");
            const entryHasY = Object.prototype.hasOwnProperty.call(entry, "y");
            const positionOverride = Object.prototype.hasOwnProperty.call(entry, "position");
            const entryPositionRaw = positionOverride ? entry.position : null;
            const entryPositionTrimmed = typeof entryPositionRaw === "string" ? entryPositionRaw.trim() : entryPositionRaw;
            const entryPositionIsEmpty = positionOverride
                && typeof entryPositionRaw === "string"
                && entryPositionRaw.trim() === "";

            const rawX = entryHasX
                ? toOptionalNumber(entry.x)
                : positionOverride
                    ? null
                    : pose && Object.prototype.hasOwnProperty.call(pose, "x")
                        ? toOptionalNumber(pose.x)
                        : base && Object.prototype.hasOwnProperty.call(base, "defaultX")
                            ? toOptionalNumber(base.defaultX)
                            : null;
            const rawY = entryHasY
                ? toOptionalNumber(entry.y)
                : pose && Object.prototype.hasOwnProperty.call(pose, "y")
                    ? toOptionalNumber(pose.y)
                    : base && Object.prototype.hasOwnProperty.call(base, "defaultY")
                        ? toOptionalNumber(base.defaultY)
                        : null;

            const finalX = positionOverride && !entryHasX && rawX === null ? null : rawX;
            const finalY = positionOverride && !entryHasY && rawY === null ? null : rawY;
            const resolvedPosition = entryPositionIsEmpty
                ? getDefaultPosition(index, all.length)
                : entryPositionTrimmed
                    ? entryPositionTrimmed
                    : (pose && pose.position) || (base && base.position) || getDefaultPosition(index, all.length);
            const resolvedName = resolveLocalized(entry.name || (base && base.name) || "");

            return {
                refId: refId,
                id: entry.id || refId || resolvedName || "char_" + index,
                name: resolvedName,
                imageName: resolvedImageName,
                videoName: resolvedVideoName,
                frames: resolvedFrames,
                frameMs: frameMs,
                frameMode: frameMode,
                overlayVideo: overlaySpec,
                emoji: entry.emoji || entry.character || (pose && pose.emoji) || (base && base.emoji) || "",
                position: resolvedPosition,
                enter: entry.enter || (pose && pose.enter) || (base && base.enter) || "fade",
                scale: finalScale,
                offsetX: Object.prototype.hasOwnProperty.call(entry, "offsetX")
                    ? toNumber(entry.offsetX, 0)
                    : pose && Object.prototype.hasOwnProperty.call(pose, "offsetX")
                        ? toNumber(pose.offsetX, 0)
                        : base && Object.prototype.hasOwnProperty.call(base, "offsetX")
                            ? toNumber(base.offsetX, 0)
                            : 0,
                offsetY: Object.prototype.hasOwnProperty.call(entry, "offsetY")
                    ? toNumber(entry.offsetY, 0)
                    : pose && Object.prototype.hasOwnProperty.call(pose, "offsetY")
                        ? toNumber(pose.offsetY, 0)
                    : base && Object.prototype.hasOwnProperty.call(base, "offsetY")
                        ? toNumber(base.offsetY, 0)
                        : 0,
                x: finalX,
                y: finalY,
                opacity: Object.prototype.hasOwnProperty.call(entry, "opacity")
                    ? clampValue(toNumber(entry.opacity, 1), -10, 10)
                    : pose && Object.prototype.hasOwnProperty.call(pose, "opacity")
                        ? clampValue(toNumber(pose.opacity, 1), -10, 10)
                        : base && Object.prototype.hasOwnProperty.call(base, "opacity")
                            ? clampValue(toNumber(base.opacity, 1), -10, 10)
                            : 1
            };
        });
    }

    if (!scene.characterImageName && !scene.character) {
        return [];
    }

    const sceneScale = toNumber(scene.characterScale, 1);
    const legacyScale = Object.prototype.hasOwnProperty.call(scene, "size")
        ? toNumber(scene.size, 1)
        : toNumber(scene.scale, 1);

    const legacyVideo = pickVideoName(scene);
    const legacyImage = legacyVideo ? "" : pickImageName(scene);
    const legacyX = Object.prototype.hasOwnProperty.call(scene, "x")
        ? toOptionalNumber(scene.x)
        : null;
    const legacyY = Object.prototype.hasOwnProperty.call(scene, "y")
        ? toOptionalNumber(scene.y)
        : null;

    return [
        {
            id: "legacy_character",
            name: resolveSceneField(scene, "speaker", ""),
            imageName: legacyImage,
            videoName: legacyVideo,
            emoji: scene.character || "",
            position: "center",
            enter: "fade",
            scale: clampValue(sceneScale * legacyScale, -10, 10),
            offsetX: toNumber(scene.offsetX, 0),
            offsetY: toNumber(scene.offsetY, 0),
            x: legacyX,
            y: legacyY,
            opacity: clampValue(toNumber(scene.opacity, 1), -10, 10)
        }
    ];
}

function normalizeSpeakerValue(value) {
    return resolveLocalized(value).trim().toLowerCase();
}

function normalizeSpeakerRaw(value) {
    return String(value || "").trim().toLowerCase();
}

function getSpeakerNameVariants(name) {
    if (!name) return [];
    if (typeof name === "string") return [name];
    if (typeof name === "object") {
        return Object.keys(name).map(function (key) { return name[key]; }).filter(Boolean);
    }
    return [];
}

function matchCharacterBySpeaker(characters, speaker) {
    const target = normalizeSpeakerRaw(speaker);
    if (!target) return null;
    for (let i = 0; i < characters.length; i += 1) {
        const character = characters[i];
        if (!character) continue;
        if (normalizeSpeakerRaw(character.id) === target) return character;
        const variants = getSpeakerNameVariants(character.name);
        for (let j = 0; j < variants.length; j += 1) {
            if (normalizeSpeakerRaw(variants[j]) === target) {
                return character;
            }
        }
    }
    return null;
}

function resolveActiveCharacterId(scene, characters) {
    if (!characters.length) {
        return "";
    }
    if (scene.activeCharacter) {
        return String(scene.activeCharacter);
    }
    if (scene.speaker) {
        const byName = matchCharacterBySpeaker(characters, resolveSceneField(scene, "speaker", ""));
        if (byName) return byName.id;
    }
    return characters.length === 1 ? characters[0].id : "";
}

function resolveSpeakerName(scene, characters, activeId) {
    if (activeId) {
        const activeCharacter = characters.find(function (character) {
            return character.id === activeId && character.name;
        });
        if (activeCharacter && activeCharacter.name) {
            return resolveLocalized(activeCharacter.name);
        }
    }

    const explicitSpeaker = resolveSceneField(scene, "speaker", "").trim();
    if (explicitSpeaker) {
        const matched = matchCharacterBySpeaker(characters, explicitSpeaker);
        if (matched && matched.name) {
            return resolveLocalized(matched.name);
        }
        return explicitSpeaker;
    }

    const firstNamedCharacter = characters.find(function (character) {
        return Boolean(character.name);
    });
    if (firstNamedCharacter && firstNamedCharacter.name) {
        return resolveLocalized(firstNamedCharacter.name);
    }

    return t("ui.system");
}

function isHeidiSpeaker(name) {
    const normalized = String(name || "").trim().toLowerCase();
    if (!normalized) return false;
    return normalized === "хайди"
        || normalized === "heidi"
        || normalized === "раккуни"
        || normalized === "rakkuni";
}

function applySpeakerFontClass(name) {
    if (!ui.root) return;
    ui.root.classList.toggle("speaker-heidi", isHeidiSpeaker(name));
}

function createCharacterNode(character, isActive) {
    const slot = document.createElement("figure");
    slot.className = "character-slot pos-" + character.position + " enter-" + character.enter;
    slot.classList.add(isActive ? "is-active" : "is-passive");
    slot.style.setProperty("--char-scale", String(character.scale));
    slot.style.setProperty("--char-offset", character.offsetX + "px");
    slot.style.setProperty("--char-offset-y", character.offsetY + "px");
    const targetOpacity = typeof character.opacity === "number"
        ? clampValue(character.opacity, -10, 10)
        : 1;
    const frames = Array.isArray(character.frames)
        ? character.frames.map(function (frame) {
            return typeof frame === "string" ? frame.trim() : "";
        }).filter(Boolean)
        : [];
    const hasFrames = frames.length > 0;
    const frameMs = hasFrames ? Math.max(0, toNumber(character.frameMs, 0)) : 0;
    const frameMode = hasFrames ? (normalizeFrameMode(character.frameMode) || DEFAULT_FRAME_MODE) : "";

    const hasAbsX = typeof character.x === "number";
    const hasAbsY = typeof character.y === "number";
    if (hasAbsX || hasAbsY) {
        const normalizedX = clampValue(hasAbsX ? character.x : positionToNormalizedX(character.position), -10, 10);
        const normalizedY = clampValue(hasAbsY ? character.y : 0, -10, 10);
        slot.classList.add("use-abs");
        slot.style.setProperty("--char-abs-x", (normalizedX * 100).toFixed(2) + "%");
        slot.style.setProperty("--char-abs-y", (normalizedY * 100).toFixed(2) + "%");
    }

    if (character.videoName && !hasFrames) {
        const video = document.createElement("video");
        video.className = "character-visual";
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "auto";
        video.src = encodeURI("assets/" + character.videoName);
        video.style.opacity = "0";
        video.addEventListener("loadeddata", function () {
            video.style.opacity = String(targetOpacity);
            try {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            } catch (error) {
                // ignore autoplay issues
            }
        });
        video.addEventListener("error", function () {
            video.remove();
            if (character.emoji) {
                const glyph = document.createElement("div");
                glyph.className = "character-glyph";
                glyph.textContent = character.emoji;
                glyph.style.opacity = String(targetOpacity);
                slot.appendChild(glyph);
            }
        });
        slot.appendChild(video);
    } else {
        const initialIndex = hasFrames && frameMode === "random"
            ? randomInt(frames.length)
            : 0;
        const initialSrc = hasFrames ? frames[initialIndex] : character.imageName;
        if (!initialSrc) {
            if (character.emoji) {
                const glyph = document.createElement("div");
                glyph.className = "character-glyph";
                glyph.textContent = character.emoji;
                glyph.style.opacity = String(targetOpacity);
                slot.appendChild(glyph);
            }
            return slot;
        }

        const mediaWrap = document.createElement("div");
        mediaWrap.className = "character-media";

        const image = document.createElement("img");
        image.className = "character-visual";
        if (!IS_FILE_ORIGIN) {
            image.crossOrigin = "anonymous";
            image.referrerPolicy = "no-referrer";
        }
        image.alt = character.name || "Character";
        image.style.opacity = "0";

        let frameTimerId = null;

        function setImageSource(assetName) {
            if (!assetName) {
                return;
            }
            image.style.opacity = "0";
            if (image.dataset) {
                delete image.dataset.chromaApplied;
            }
            image.src = encodeURI("assets/" + assetName);
        }

        image.addEventListener("load", function () {
            if (image.dataset.chromaApplied === "pending") {
                image.dataset.chromaApplied = "1";
                const pending = chromaPendingCallbacks.get(image);
                if (pending) {
                    chromaPendingCallbacks.delete(image);
                    pending();
                }
                return;
            }
            try {
                applyChromaKey(image, function () {
                    image.style.opacity = String(targetOpacity);
                });
            } catch (error) {
                image.dataset.chromaApplied = "1";
                image.style.opacity = String(targetOpacity);
            }
        });
        image.addEventListener("error", function () {
            image.style.opacity = String(targetOpacity);
            chromaPendingCallbacks.delete(image);
            if (frameTimerId) {
                clearInterval(frameTimerId);
            }
            image.remove();
            if (character.emoji) {
                const glyph = document.createElement("div");
                glyph.className = "character-glyph";
                glyph.textContent = character.emoji;
                glyph.style.opacity = String(targetOpacity);
                slot.appendChild(glyph);
            }
        });

        setImageSource(initialSrc);
        mediaWrap.appendChild(image);

        if (character.overlayVideo && character.overlayVideo.videoName) {
            const overlay = character.overlayVideo;
            const overlayVideo = document.createElement("video");
            overlayVideo.className = "character-overlay";
            overlayVideo.muted = overlay.muted !== false;
            overlayVideo.loop = overlay.loop !== false;
            overlayVideo.autoplay = overlay.autoplay !== false;
            overlayVideo.playsInline = true;
            overlayVideo.preload = "auto";
            overlayVideo.src = encodeURI("assets/" + overlay.videoName);
            overlayVideo.style.opacity = String(clampValue(toNumber(overlay.opacity, 1), 0, 1));
            if (overlay.blend) {
                overlayVideo.style.mixBlendMode = overlay.blend;
            }
            const hasPx = Number.isFinite(overlay.xPx) || Number.isFinite(overlay.yPx)
                || Number.isFinite(overlay.widthPx) || Number.isFinite(overlay.heightPx);
            const widthRatio = Number.isFinite(overlay.width) ? overlay.width : 0.2;
            const heightRatio = Number.isFinite(overlay.height) ? overlay.height : 0.2;
            const xRatio = Number.isFinite(overlay.x) ? overlay.x : 0.5;
            const yRatio = Number.isFinite(overlay.y) ? overlay.y : 0.5;
            if (hasPx) {
                overlayVideo.style.left = (Number.isFinite(overlay.xPx) ? overlay.xPx : 0) + "px";
                overlayVideo.style.top = (Number.isFinite(overlay.yPx) ? overlay.yPx : 0) + "px";
                overlayVideo.style.width = (Number.isFinite(overlay.widthPx) ? overlay.widthPx : 120) + "px";
                overlayVideo.style.height = (Number.isFinite(overlay.heightPx) ? overlay.heightPx : 120) + "px";
            } else {
                overlayVideo.style.left = (xRatio * 100) + "%";
                overlayVideo.style.top = (yRatio * 100) + "%";
                overlayVideo.style.width = (widthRatio * 100) + "%";
                overlayVideo.style.height = (heightRatio * 100) + "%";
            }
            if (overlay.anchor === "center") {
                const scale = Number.isFinite(overlay.scale) ? overlay.scale : 1;
                overlayVideo.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
            } else if (Number.isFinite(overlay.scale) && overlay.scale !== 1) {
                overlayVideo.style.transform = "scale(" + overlay.scale + ")";
            }
            if (Number.isFinite(overlay.playbackRate) && overlay.playbackRate > 0) {
                overlayVideo.playbackRate = overlay.playbackRate;
            }
            overlayVideo.addEventListener("loadeddata", function () {
                try {
                    const playPromise = overlayVideo.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {});
                    }
                } catch (error) {
                    // ignore autoplay issues
                }
            });
            overlayVideo.addEventListener("error", function () {
                overlayVideo.remove();
            });
            mediaWrap.appendChild(overlayVideo);
        }

        slot.appendChild(mediaWrap);

        if (hasFrames && frames.length > 1 && frameMs > 0) {
            let currentIndex = initialIndex;
            frameTimerId = setInterval(function () {
                if (frameMode === "once") {
                    if (currentIndex >= frames.length - 1) {
                        clearInterval(frameTimerId);
                        return;
                    }
                    currentIndex += 1;
                } else if (frameMode === "random") {
                    let nextIndex = randomInt(frames.length);
                    if (frames.length > 1 && nextIndex === currentIndex) {
                        nextIndex = (nextIndex + 1) % frames.length;
                    }
                    currentIndex = nextIndex;
                } else {
                    currentIndex = (currentIndex + 1) % frames.length;
                }
                setImageSource(frames[currentIndex]);
            }, frameMs);
            state.characterFrameTimers.push(frameTimerId);
        }
    }

    return slot;
}

function setBackground(imageName) {
    const normalized = normalizeAssetName(imageName);
    if (!normalized) {
        ui.stageBg.classList.add("is-empty");
        ui.stageBg.style.backgroundImage = "none";
        return;
    }

    ui.stageBg.classList.remove("is-empty");
    ui.stageBg.style.backgroundImage = buildStageBackground(normalized);
}

function setCharacters(scene, preparedCharacters, preparedActiveId) {
    ui.charactersLayer.innerHTML = "";
    const characters = Array.isArray(preparedCharacters)
        ? preparedCharacters
        : resolveSceneCharacters(scene);
    const activeId = typeof preparedActiveId === "string"
        ? preparedActiveId
        : resolveActiveCharacterId(scene, characters);

    characters.forEach(function (character) {
        const isActive = !activeId || activeId === character.id;
        ui.charactersLayer.appendChild(createCharacterNode(character, isActive));
    });
}
function clearTyping() {
    if (state.typeTimer) {
        clearTimeout(state.typeTimer);
        state.typeTimer = null;
    }
    stopVoiceLoop();
    state.isTyping = false;
    ui.dialogueText.classList.remove("is-typing");
}

function clearPendingTyping() {
    state.pendingTyping = null;
    state.waitingForAudio = false;
}

function clearAutoTimer() {
    if (state.autoTimer) {
        clearTimeout(state.autoTimer);
        state.autoTimer = null;
    }
    stopAutoIndicator();
}

function clearTimelineTimers() {
    state.timelineTimers.forEach(function (timerId) {
        clearTimeout(timerId);
    });
    state.timelineTimers = [];
}

function clearCharacterFrameTimers() {
    state.characterFrameTimers.forEach(function (timerId) {
        clearInterval(timerId);
    });
    state.characterFrameTimers = [];
}

function clearChoiceTimer() {
    if (state.choiceTimerId) {
        clearInterval(state.choiceTimerId);
        state.choiceTimerId = null;
    }

    state.choiceTimer.active = false;
    state.choiceTimer.startedAt = 0;
    state.choiceTimer.endsAt = 0;
    state.choiceTimer.timeoutNext = null;
    state.choiceTimer.timeoutChoiceText = "";
    ui.timerChip.hidden = true;
    ui.timerChip.classList.remove("is-critical");
}

function clearChoiceFxTimers() {
    if (state.choiceFxTimerId) {
        clearInterval(state.choiceFxTimerId);
        state.choiceFxTimerId = null;
    }
    state.choiceFxEntries = [];
}

function canSkipCurrentScene() {
    if (!state.skipMode) {
        return false;
    }
    if (state.settings.skipUnread) {
        return true;
    }
    return state.sceneWasReadBeforeRender;
}

function randomInt(max) {
    return Math.floor(Math.random() * Math.max(1, max));
}

function glitchifyText(sourceText, ratio) {
    if (!sourceText) {
        return "";
    }

    const chars = sourceText.split("");
    const count = Math.max(1, Math.floor(chars.length * ratio));

    for (let index = 0; index < count; index += 1) {
        const targetIndex = randomInt(chars.length);
        if (/\s/.test(chars[targetIndex])) {
            continue;
        }
        chars[targetIndex] = GLITCH_GLYPHS.charAt(randomInt(GLITCH_GLYPHS.length));
    }

    return chars.join("");
}

function buildRandomGlyphString(length, glyphs) {
    const source = glyphs && glyphs.length ? glyphs : GLITCH_GLYPHS;
    let output = "";
    for (let index = 0; index < length; index += 1) {
        output += source.charAt(randomInt(source.length));
    }
    return output;
}

function buildGlitchedSegment(text, rate, glyphs) {
    if (!text) {
        return "";
    }
    const chars = text.split("");
    const count = Math.max(1, Math.floor(chars.length * clampValue(rate, 0, 1)));
    const source = glyphs && glyphs.length ? glyphs : GLITCH_GLYPHS;
    for (let index = 0; index < count; index += 1) {
        const targetIndex = randomInt(chars.length);
        if (/\s/.test(chars[targetIndex])) {
            continue;
        }
        chars[targetIndex] = source.charAt(randomInt(source.length));
    }
    return chars.join("");
}

function getPlayerNameTagValue(tagName) {
    const key = String(tagName || "").toLowerCase();
    const api = typeof window !== "undefined" ? window.PlayerName : null;
    if (api && typeof api.getName === "function") {
        return api.getName(key);
    }
    const fallback = resolveLocalized(window.STORY && window.STORY.audio && window.STORY.audio.playerNameFallback) || t("ui.playerFallback");
    return fallback;
}

function replacePlayerNameTags(text) {
    const source = String(text || "");
    return source.replace(/\[(playername|playerinput)\]/gi, function (_match, tag) {
        return getPlayerNameTagValue(tag);
    });
}

function parseTaggedText(rawText) {
    const source = resolveLocalized(rawText);
    const effects = {
        lags: [],
        scrambles: [],
        glitches: [],
        swaps: [],
        voices: [],
        pauses: [],
        sfx: []
    };
    let output = "";
    const openTags = [];
    const lowerSource = source.toLowerCase();
    let index = 0;

    while (index < source.length) {
        const char = source.charAt(index);
        if (char !== "[") {
            output += char;
            index += 1;
            continue;
        }

        if (lowerSource.startsWith("[swap", index)) {
            const openEnd = source.indexOf("]", index);
            if (openEnd !== -1) {
                const closeIndex = lowerSource.indexOf("[/swap]", openEnd);
                if (closeIndex !== -1) {
                    const tagContent = source.slice(index + 1, openEnd);
                    const parsed = parseTagDefinition(tagContent);
                    const params = parsed && parsed.params ? parsed.params : {};
                    const rawSegment = replacePlayerNameTags(source.slice(openEnd + 1, closeIndex));
                    const options = rawSegment.split("|").map(function (option) {
                        return option.trim();
                    }).filter(Boolean);
                    const baseOption = options.length ? options[0] : "";
                    const loopParam = getParamBoolean(params, ["loop"], true);
                    const onceParam = getParamBoolean(params, ["once"], false);
                    const shouldLoop = onceParam ? false : loopParam;
                    const start = output.length;
                    output += baseOption;
                    if (baseOption.length > 0) {
                        effects.swaps.push({
                            start: start,
                            end: start + baseOption.length,
                            baseLength: baseOption.length,
                            options: options.length ? options : [baseOption],
                            ms: Math.max(40, getParamNumber(params, ["ms", "time"], DEFAULT_TAG_SWAP_MS)),
                            loop: shouldLoop,
                            lastUpdate: 0,
                            currentIndex: 0
                        });
                    }
                    index = closeIndex + "[/swap]".length;
                    continue;
                }
            }
        }

        if (lowerSource.startsWith("[playername", index) || lowerSource.startsWith("[playerinput", index)) {
            const closeIndex = source.indexOf("]", index);
            if (closeIndex !== -1) {
                const tagContent = source.slice(index + 1, closeIndex).trim().toLowerCase();
                const isInput = tagContent.startsWith("playerinput");
                output += getPlayerNameTagValue(isInput ? "playerinput" : "playername");
                index = closeIndex + 1;
                continue;
            }
        }

        const closeBracket = source.indexOf("]", index);
        if (closeBracket === -1) {
            output += char;
            index += 1;
            continue;
        }

        const tagContent = source.slice(index + 1, closeBracket).trim();
        if (!tagContent) {
            output += char;
            index += 1;
            continue;
        }

        if (tagContent.startsWith("/")) {
            const name = tagContent.slice(1).trim().toLowerCase();
            for (let openIndex = openTags.length - 1; openIndex >= 0; openIndex -= 1) {
                if (openTags[openIndex].name === name) {
                    const tag = openTags.splice(openIndex, 1)[0];
                    const start = tag.start;
                    const end = output.length;
                    if (end > start) {
                        if (name === "lag") {
                            effects.lags.push({
                                start: start,
                                end: end,
                                ms: Math.max(0, getParamNumber(tag.params, ["ms", "lag"], DEFAULT_TAG_LAG_MS))
                            });
                        } else if (name === "scramble") {
                            effects.scrambles.push({
                                start: start,
                                end: end,
                                ms: Math.max(40, getParamNumber(tag.params, ["ms", "time"], DEFAULT_TAG_SCRAMBLE_MS)),
                                glyphs: getParamString(tag.params, ["glyphs", "chars"], GLITCH_GLYPHS),
                                cache: "",
                                lastUpdate: 0
                            });
                        } else if (name === "glitch") {
                            effects.glitches.push({
                                start: start,
                                end: end,
                                ms: Math.max(40, getParamNumber(tag.params, ["ms", "time"], DEFAULT_TAG_GLITCH_MS)),
                                rate: clampValue(getParamNumber(tag.params, ["rate", "ratio"], 0.35), 0, 1),
                                glyphs: getParamString(tag.params, ["glyphs", "chars"], GLITCH_GLYPHS),
                                cache: "",
                                lastUpdate: 0
                            });
                        } else if (name === "voice") {
                            const src = normalizeAudioName(getParamString(tag.params, ["src", "voice", "sound"], ""));
                            if (src) {
                                effects.voices.push({
                                    start: start,
                                    end: end,
                                    src: src,
                                    volume: clampValue(getParamNumber(tag.params, ["volume", "vol"], DEFAULT_VOICE_VOLUME), 0, 1)
                                });
                            }
                        }
                    }
                    break;
                }
            }
            index = closeBracket + 1;
            continue;
        }

        const parsed = parseTagDefinition(tagContent);
        if (!parsed) {
            output += char;
            index += 1;
            continue;
        }

        if (parsed.name === "pause") {
            effects.pauses.push({
                index: output.length,
                ms: Math.max(0, getParamNumber(parsed.params, ["ms", "pause"], 0))
            });
            index = closeBracket + 1;
            continue;
        }
        if (parsed.name === "sfx") {
            const src = normalizeAudioName(getParamString(parsed.params, ["src", "sound", "sfx"], ""));
            if (src) {
                effects.sfx.push({
                    index: output.length,
                    src: src,
                    volume: clampValue(getParamNumber(parsed.params, ["volume", "vol"], DEFAULT_SFX_VOLUME), 0, 1)
                });
            }
            index = closeBracket + 1;
            continue;
        }

        if (parsed.name === "lag" || parsed.name === "scramble" || parsed.name === "glitch" || parsed.name === "voice") {
            openTags.push({
                name: parsed.name,
                start: output.length,
                params: parsed.params || {}
            });
            index = closeBracket + 1;
            continue;
        }

        output += source.slice(index, closeBracket + 1);
        index = closeBracket + 1;
    }

    effects.pauses.sort(function (a, b) { return a.index - b.index; });
    effects.sfx.sort(function (a, b) { return a.index - b.index; });
    effects.voices.sort(function (a, b) { return a.start - b.start; });

    effects.glitches.forEach(function (segment) {
        segment.baseText = output.slice(segment.start, segment.end);
    });
    effects.swaps.forEach(function (segment) {
        segment.baseText = output.slice(segment.start, segment.end);
        if (!segment.options || !segment.options.length) {
            segment.options = [segment.baseText];
        }
    });

    return {
        rawText: source,
        plainText: output,
        effects: effects
    };
}

function normalizeVoiceDef(value) {
    if (!value) {
        return null;
    }
    if (typeof value === "string") {
        const src = normalizeAudioName(value);
        return src ? { src: src, volume: DEFAULT_VOICE_VOLUME } : null;
    }
    if (typeof value === "object") {
        const src = normalizeAudioName(value.src || value.voice || value.sound || "");
        if (!src) {
            return null;
        }
        const volume = clampValue(toNumber(value.volume, DEFAULT_VOICE_VOLUME), 0, 1);
        return { src: src, volume: volume };
    }
    return null;
}

function normalizeMusicDef(value) {
    if (!value) {
        return null;
    }
    if (typeof value === "string") {
        const src = normalizeAudioName(value);
        return src ? { src: src } : null;
    }
    if (typeof value === "object") {
        const src = normalizeAudioName(value.src || value.music || "");
        const volume = clampValue(toNumber(value.volume, 1), 0, 1);
        const fadeMs = Math.max(0, toNumber(value.fadeMs, toNumber(STORY_AUDIO.musicFadeMs, 0)));
        const loop = value.loop !== false;
        const mode = typeof value.mode === "string" ? value.mode.trim().toLowerCase() : "";
        if (!src && !mode) {
            return null;
        }
        return {
            src: src,
            volume: volume,
            fadeMs: fadeMs,
            loop: loop,
            mode: mode
        };
    }
    return null;
}

function prepareTextFx(rawText) {
    const parsed = parseTaggedText(rawText);
    const effects = parsed.effects;
    effects.lags.sort(function (a, b) { return a.start - b.start; });
    effects.scrambles.sort(function (a, b) { return a.start - b.start; });
    effects.glitches.sort(function (a, b) { return a.start - b.start; });
    effects.swaps.sort(function (a, b) { return a.start - b.start; });
    return {
        rawText: parsed.rawText,
        plainText: parsed.plainText,
        effects: effects
    };
}

function clearTextFxTimers() {
    if (state.textFxTimerId) {
        clearInterval(state.textFxTimerId);
        state.textFxTimerId = null;
    }
}

function getLagMsForIndex(index, segments) {
    let extra = 0;
    segments.forEach(function (segment) {
        if (index >= segment.start && index < segment.end) {
            extra += Math.max(0, toNumber(segment.ms, 0));
        }
    });
    return extra;
}

function getVoiceOverrideForIndex(index, segments) {
    for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        if (index >= segment.start && index < segment.end) {
            return { src: segment.src, volume: segment.volume };
        }
    }
    return null;
}

function updateSwapSegments(now, segments) {
    segments.forEach(function (segment) {
        if (!segment.options || segment.options.length <= 1) {
            return;
        }
        const intervalMs = Math.max(40, toNumber(segment.ms, DEFAULT_TAG_SWAP_MS));
        if (!segment.lastUpdate || now - segment.lastUpdate >= intervalMs) {
            if (segment.loop === false && segment.currentIndex >= segment.options.length - 1) {
                return;
            }
            const nextIndex = segment.currentIndex + 1;
            segment.currentIndex = segment.loop === false
                ? Math.min(nextIndex, segment.options.length - 1)
                : (nextIndex % segment.options.length);
            segment.lastUpdate = now;
        }
    });
}

function updateScrambleSegments(now, segments) {
    segments.forEach(function (segment) {
        const intervalMs = Math.max(40, toNumber(segment.ms, DEFAULT_TAG_SCRAMBLE_MS));
        if (!segment.lastUpdate || now - segment.lastUpdate >= intervalMs || !segment.cache) {
            segment.cache = buildRandomGlyphString(segment.end - segment.start, segment.glyphs);
            segment.lastUpdate = now;
        }
    });
}

function updateGlitchSegments(now, segments) {
    segments.forEach(function (segment) {
        const intervalMs = Math.max(40, toNumber(segment.ms, DEFAULT_TAG_GLITCH_MS));
        if (!segment.lastUpdate || now - segment.lastUpdate >= intervalMs || !segment.cache) {
            segment.cache = buildGlitchedSegment(segment.baseText || "", segment.rate, segment.glyphs);
            segment.lastUpdate = now;
        }
    });
}

function applySwapSegments(chars, visibleLength, segments) {
    segments.forEach(function (segment) {
        if (segment.start >= visibleLength) {
            return;
        }
        const segVisible = Math.min(visibleLength, segment.end) - segment.start;
        if (segVisible <= 0) {
            return;
        }
        const option = segment.options && segment.options.length
            ? segment.options[segment.currentIndex] || segment.options[0]
            : segment.baseText;
        const baseLength = segment.baseLength || segment.end - segment.start;
        let padded = option;
        if (padded.length < baseLength) {
            padded = padded + " ".repeat(baseLength - padded.length);
        } else if (padded.length > baseLength) {
            padded = padded.slice(0, baseLength);
        }
        const slice = padded.slice(0, segVisible);
        for (let i = 0; i < slice.length; i += 1) {
            chars[segment.start + i] = slice.charAt(i);
        }
    });
}

function applyCacheSegments(chars, visibleLength, segments) {
    segments.forEach(function (segment) {
        if (segment.start >= visibleLength) {
            return;
        }
        const segVisible = Math.min(visibleLength, segment.end) - segment.start;
        if (segVisible <= 0) {
            return;
        }
        const cache = segment.cache || "";
        const slice = cache.slice(0, segVisible);
        for (let i = 0; i < slice.length; i += 1) {
            chars[segment.start + i] = slice.charAt(i);
        }
    });
}

function renderTextWithEffects(fx, typedIndex, applyPostEffects, applyDuringTyping) {
    if (!fx) {
        return "";
    }
    const baseText = fx.plainText || "";
    const visibleLength = Math.min(Math.max(0, typedIndex), baseText.length);
    const chars = baseText.slice(0, visibleLength).split("");

    if (fx.effects && fx.effects.swaps.length) {
        applySwapSegments(chars, visibleLength, fx.effects.swaps);
    }

    if (fx.effects && fx.effects.scrambles.length && !applyPostEffects) {
        applyCacheSegments(chars, visibleLength, fx.effects.scrambles);
    }

    if (fx.effects && fx.effects.glitches.length && (applyPostEffects || applyDuringTyping)) {
        applyCacheSegments(chars, visibleLength, fx.effects.glitches);
    }

    let output = chars.join("");
    if (applyPostEffects && state.settings.glitchText && state.settings.pressureLayer && state.pressureScore >= 68) {
        if (Math.random() < 0.18) {
            output = glitchifyText(output, 0.1);
        }
    }
    return output;
}

function renderChoiceFxLabel(fx) {
    if (!fx) {
        return "";
    }
    const now = nowMs();
    updateSwapSegments(now, fx.effects.swaps || []);
    updateScrambleSegments(now, fx.effects.scrambles || []);
    updateGlitchSegments(now, fx.effects.glitches || []);
    return renderTextWithEffects(fx, fx.plainText.length, false, true);
}

function startChoiceFxTicker(entries) {
    clearChoiceFxTimers();
    if (!entries || !entries.length) {
        return;
    }
    state.choiceFxEntries = entries;

    const intervals = [];
    entries.forEach(function (entry) {
        const fx = entry && entry.fx;
        if (!fx || !fx.effects) {
            return;
        }
        (fx.effects.swaps || []).forEach(function (segment) {
            if (segment.ms) {
                intervals.push(segment.ms);
            }
        });
        (fx.effects.scrambles || []).forEach(function (segment) {
            if (segment.ms) {
                intervals.push(segment.ms);
            }
        });
        (fx.effects.glitches || []).forEach(function (segment) {
            if (segment.ms) {
                intervals.push(segment.ms);
            }
        });
    });

    if (!intervals.length) {
        return;
    }

    const tickMs = clampValue(Math.min.apply(null, intervals), 60, 1200);
    state.choiceFxTimerId = setInterval(function () {
        if (!state.choiceFxEntries || !state.choiceFxEntries.length) {
            return;
        }
        state.choiceFxEntries.forEach(function (entry) {
            if (!entry || !entry.label || !entry.fx) {
                return;
            }
            entry.label.textContent = renderChoiceFxLabel(entry.fx);
        });
    }, tickMs);
}

function maybePlayBlip(character) {
    if (!state.settings.voiceBlip || state.muted || !state.audioUnlocked) {
        return;
    }
    if (!character || /\s/.test(character)) {
        return;
    }

    const now = nowMs();
    if (now - state.lastBlipAt < 42) {
        return;
    }
    state.lastBlipAt = now;

    try {
        const audioCtx = getAudioContextSafe();
        if (!audioCtx || audioCtx.state !== "running") {
            return;
        }

        const voiceFactor = getVoiceVolumeFactor();
        if (voiceFactor <= 0) {
            return;
        }

        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = 510 + Math.random() * 110;
        gain.gain.value = 0.008 * voiceFactor;
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.02);
    } catch (error) {
        // ignore
    }
}

function loadAudioBuffer(src) {
    const normalized = normalizeAudioName(src);
    if (!normalized) {
        return Promise.resolve(null);
    }
    if (audioBufferCache.has(normalized)) {
        return Promise.resolve(audioBufferCache.get(normalized));
    }
    if (audioBufferPending.has(normalized)) {
        return audioBufferPending.get(normalized);
    }
    const audioCtx = getAudioContextSafe();
    if (!audioCtx) {
        return Promise.resolve(null);
    }
    const url = encodeURI("assets/" + normalized);
    const promise = fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Audio fetch failed");
            }
            return response.arrayBuffer();
        })
        .then(function (buffer) {
            return audioCtx.decodeAudioData(buffer);
        })
        .then(function (decoded) {
            audioBufferCache.set(normalized, decoded);
            audioBufferPending.delete(normalized);
            return decoded;
        })
        .catch(function () {
            audioBufferPending.delete(normalized);
            return null;
        });
    audioBufferPending.set(normalized, promise);
    return promise;
}

function playAudioSample(src, volume) {
    if (state.muted || !state.audioUnlocked) {
        return;
    }
    const audioCtx = getAudioContextSafe();
    if (!audioCtx || audioCtx.state !== "running") {
        return;
    }
    const normalized = normalizeAudioName(src);
    if (!normalized) {
        return;
    }
    const gainValue = clampValue(toNumber(volume, 1), 0, 1) * getSfxVolumeFactor();
    if (gainValue <= 0) {
        return;
    }
    loadAudioBuffer(normalized).then(function (buffer) {
        if (!buffer) {
            return;
        }
        try {
            const source = audioCtx.createBufferSource();
            const gain = audioCtx.createGain();
            gain.gain.value = gainValue;
            source.buffer = buffer;
            source.connect(gain);
            gain.connect(audioCtx.destination);
            source.start();
        } catch (error) {
            // ignore
        }
    });
}

function stopVoiceLoop(resetDesired) {
    const loop = state.voiceLoop;
    if (!loop) {
        return;
    }
    loop.requestId += 1;
    if (loop.source) {
        try {
            loop.source.stop();
        } catch (error) {
            // ignore
        }
        try {
            loop.source.disconnect();
        } catch (error) {
            // ignore
        }
    }
    if (loop.gain) {
        try {
            loop.gain.disconnect();
        } catch (error) {
            // ignore
        }
    }
    loop.source = null;
    loop.gain = null;
    loop.src = "";
    loop.volume = 1;
    loop.pending = null;
    if (resetDesired !== false) {
        loop.desiredSrc = "";
        loop.desiredBaseVolume = 1;
        loop.desiredVolume = 1;
    }
}

function startVoiceLoop(src, volume, options) {
    const loop = state.voiceLoop;
    if (!loop) {
        return;
    }
    stopVoiceLoop(false);

    if (state.muted) {
        return;
    }
    const audioCtx = getAudioContextSafe();
    if (!audioCtx) {
        return;
    }

    const normalized = normalizeAudioName(src);
    if (!normalized) {
        return;
    }
    const gainValue = clampValue(toNumber(volume, DEFAULT_VOICE_VOLUME), 0, 1);
    const randomStart = options && options.randomStart;

    if (!state.audioUnlocked || audioCtx.state !== "running") {
        loop.pending = { src: normalized, volume: gainValue, randomStart: randomStart };
        return;
    }

    const requestId = (loop.requestId += 1);
    loadAudioBuffer(normalized).then(function (buffer) {
        if (!buffer) {
            return;
        }
        if (!state.audioUnlocked || state.muted) {
            loop.pending = { src: normalized, volume: gainValue, randomStart: randomStart };
            return;
        }
        if (loop.requestId !== requestId) {
            return;
        }
        const ctx = getAudioContextSafe();
        if (!ctx || ctx.state !== "running") {
            loop.pending = { src: normalized, volume: gainValue, randomStart: randomStart };
            return;
        }
        try {
            const source = ctx.createBufferSource();
            const gain = ctx.createGain();
            gain.gain.value = gainValue;
            source.buffer = buffer;
            source.loop = true;
            source.connect(gain);
            gain.connect(ctx.destination);
            let offset = 0;
            if (randomStart && buffer.duration > 0) {
                offset = Math.random() * buffer.duration;
            }
            source.start(0, offset);
            loop.source = source;
            loop.gain = gain;
            loop.src = normalized;
            loop.volume = gainValue;
            loop.pending = null;
        } catch (error) {
            // ignore
        }
    });
}

function ensureVoiceLoop(voiceDef, options) {
    if (!voiceDef || !voiceDef.src) {
        stopVoiceLoop();
        return;
    }
    const normalized = normalizeAudioName(voiceDef.src);
    if (!normalized) {
        stopVoiceLoop();
        return;
    }
    const forceRestart = options && options.forceRestart;
    const randomStart = options && options.randomStart;
    const baseVolume = clampValue(toNumber(voiceDef.volume, DEFAULT_VOICE_VOLUME), 0, 1);
    const targetVolume = baseVolume * getVoiceVolumeFactor();
    const loop = state.voiceLoop;
    if (!forceRestart && loop.desiredSrc === normalized && loop.desiredVolume === targetVolume) {
        if (loop.source && loop.src === normalized && loop.gain && loop.volume !== targetVolume) {
            loop.gain.gain.value = targetVolume;
            loop.volume = targetVolume;
        }
        return;
    }

    loop.desiredSrc = normalized;
    loop.desiredBaseVolume = baseVolume;
    loop.desiredVolume = targetVolume;

    if (!forceRestart && loop.pending && loop.pending.src === normalized && loop.pending.volume === targetVolume) {
        return;
    }
    if (!forceRestart && loop.source && loop.src === normalized) {
        if (loop.gain && loop.volume !== targetVolume) {
            loop.gain.gain.value = targetVolume;
            loop.volume = targetVolume;
        }
        return;
    }
    startVoiceLoop(normalized, targetVolume, { randomStart: randomStart });
}

function resumeVoiceLoopPending() {
    const pending = state.voiceLoop && state.voiceLoop.pending;
    if (!pending) {
        return;
    }
    startVoiceLoop(pending.src, pending.volume, { randomStart: pending.randomStart });
}

function prewarmVoiceBuffers(fx) {
    const sources = [];
    if (state.sceneVoice && state.sceneVoice.src) {
        sources.push(state.sceneVoice.src);
    }
    if (fx && fx.effects && Array.isArray(fx.effects.voices)) {
        fx.effects.voices.forEach(function (segment) {
            if (segment && segment.src) {
                sources.push(segment.src);
            }
        });
    }
    sources.forEach(function (src) {
        loadAudioBuffer(src);
    });
}

function updateVoiceLoopVolume() {
    const loop = state.voiceLoop;
    if (!loop || !loop.desiredSrc) {
        return;
    }
    const base = clampValue(toNumber(loop.desiredBaseVolume, DEFAULT_VOICE_VOLUME), 0, 1);
    const target = base * getVoiceVolumeFactor();
    loop.desiredVolume = target;
    if (loop.pending && loop.pending.src === loop.desiredSrc) {
        loop.pending.volume = target;
    }
    if (loop.gain) {
        loop.gain.gain.value = target;
        loop.volume = target;
    }
}

function applyAudioMix() {
    updateBgmVolume();
    updateAmbienceVolume();
    updateVoiceLoopVolume();
}

function resolveSceneText(scene) {
    let text = resolveSceneField(scene, "text", "");
    const locale = getSceneLocale(scene);
    const variantsSource = locale && Object.prototype.hasOwnProperty.call(locale, "textVariants")
        ? locale.textVariants
        : scene.textVariants;

    const variants = resolveLocalizedArray(variantsSource);
    if (state.settings.glitchText && variants.length) {
        const chance = clampValue(toNumber(scene.glitchRate, 0.4), 0, 1);
        if (Math.random() < chance) {
            text = variants[randomInt(variants.length)];
        }
    }

    return text;
}

function resolveSceneVoiceDefinition(scene) {
    const sceneAudio = scene && typeof scene.audio === "object" ? scene.audio : null;
    const hasSceneVoice = scene && Object.prototype.hasOwnProperty.call(scene, "voice");
    const hasAudioVoice = sceneAudio && Object.prototype.hasOwnProperty.call(sceneAudio, "voice");
    if (hasSceneVoice) {
        return { defined: true, value: normalizeVoiceDef(scene.voice) };
    }
    if (hasAudioVoice) {
        return { defined: true, value: normalizeVoiceDef(sceneAudio.voice) };
    }
    return { defined: false, value: null };
}

function shouldDeferTypingForAudio(textFx) {
    if (state.audioUnlocked || state.muted) {
        return false;
    }
    const hasSceneVoice = state.sceneVoice && state.sceneVoice.src;
    const hasVoiceTags = textFx && textFx.effects && Array.isArray(textFx.effects.voices) && textFx.effects.voices.length > 0;
    return Boolean(hasSceneVoice || hasVoiceTags);
}

function deferTyping(textFx, onDone) {
    state.pendingTyping = {
        sceneIndex: state.sceneIndex,
        textFx: textFx,
        onDone: typeof onDone === "function" ? onDone : null
    };
    state.waitingForAudio = true;
    ui.dialogueText.textContent = "";
    setClickBirdVisible(true);
}

function maybeStartPendingTyping() {
    if (!state.pendingTyping) {
        return false;
    }
    if (!state.audioUnlocked || state.muted) {
        return false;
    }
    if (state.pendingTyping.sceneIndex !== state.sceneIndex) {
        clearPendingTyping();
        return false;
    }
    const pending = state.pendingTyping;
    clearPendingTyping();
    typeText(pending.textFx, pending.onDone);
    return true;
}

function typeText(textPayload, onDone) {
    clearTyping();
    clearTextFxTimers();
    setClickBirdVisible(false);

    const fx = textPayload && typeof textPayload === "object" && textPayload.plainText !== undefined
        ? textPayload
        : prepareTextFx(String(textPayload || ""));
    state.textFx = fx;
    state.fullText = fx.plainText || "";
    state.fullTextRaw = fx.rawText || state.fullText;
    state.afterTyping = typeof onDone === "function" ? onDone : null;
    prewarmVoiceBuffers(fx);

    if (state.fullText.length === 0) {
        ui.dialogueText.textContent = "";
        if (state.afterTyping) {
            const callback = state.afterTyping;
            state.afterTyping = null;
            callback();
        }
        return;
    }

    if (state.settings.textSpeedMs === 0 || canSkipCurrentScene()) {
        const now = nowMs();
        updateSwapSegments(now, fx.effects.swaps);
        updateGlitchSegments(now, fx.effects.glitches);
        ui.dialogueText.textContent = renderTextWithEffects(fx, fx.plainText.length, true, false);
        startPostFxTicker();
        if (state.afterTyping) {
            const callback = state.afterTyping;
            state.afterTyping = null;
            callback();
        }
        return;
    }

    state.isTyping = true;
    ui.dialogueText.textContent = "";
    ui.dialogueText.classList.add("is-typing");

    let index = 0;
    let pauseCursor = 0;
    let sfxCursor = 0;

    const pauses = fx.effects.pauses || [];
    const sfxEvents = fx.effects.sfx || [];
    const shouldRandomize = Boolean(state.voiceStartRandomize);
    if (shouldRandomize) {
        state.voiceStartRandomize = false;
    }
    ensureVoiceLoop(getVoiceOverrideForIndex(0, fx.effects.voices || []) || state.sceneVoice, {
        forceRestart: shouldRandomize,
        randomStart: shouldRandomize
    });

    function step() {
        if (!state.isTyping) {
            return;
        }

        let pauseDelay = 0;
        while (pauseCursor < pauses.length && pauses[pauseCursor].index === index) {
            pauseDelay += Math.max(0, toNumber(pauses[pauseCursor].ms, 0));
            pauseCursor += 1;
        }
        if (pauseDelay > 0) {
            state.typeTimer = setTimeout(step, pauseDelay);
            return;
        }

        while (sfxCursor < sfxEvents.length && sfxEvents[sfxCursor].index === index) {
            playAudioSample(sfxEvents[sfxCursor].src, sfxEvents[sfxCursor].volume);
            sfxCursor += 1;
        }

        const nextCharacter = state.fullText.charAt(index);
        const voiceOverride = getVoiceOverrideForIndex(index, fx.effects.voices || []);
        const voiceDef = voiceOverride || state.sceneVoice;
        ensureVoiceLoop(voiceDef);
        if (!voiceDef || !voiceDef.src) {
            maybePlayBlip(nextCharacter);
        }

        index += 1;
        const now = nowMs();
        updateSwapSegments(now, fx.effects.swaps);
        updateScrambleSegments(now, fx.effects.scrambles);
        updateGlitchSegments(now, fx.effects.glitches);
        ui.dialogueText.textContent = renderTextWithEffects(fx, index, false, true);

        if (index >= state.fullText.length) {
            finishTyping();
            return;
        }

        const lagMs = getLagMsForIndex(index - 1, fx.effects.lags || []);
        const delay = Math.max(0, toNumber(state.settings.textSpeedMs, TYPE_SPEED_MS)) + lagMs;
        state.typeTimer = setTimeout(step, delay);
    }

    step();
}

function startPostFxTicker() {
    clearTextFxTimers();
    if (!state.textFx) {
        return;
    }
    const fx = state.textFx;
    const intervals = [];
    (fx.effects.swaps || []).forEach(function (segment) {
        if (segment.ms) {
            intervals.push(segment.ms);
        }
    });
    (fx.effects.glitches || []).forEach(function (segment) {
        if (segment.ms) {
            intervals.push(segment.ms);
        }
    });
    if (!intervals.length) {
        return;
    }
    const tickMs = clampValue(Math.min.apply(null, intervals), 60, 1200);
    state.textFxTimerId = setInterval(function () {
        if (!state.textFx) {
            return;
        }
        const now = nowMs();
        updateSwapSegments(now, fx.effects.swaps);
        updateGlitchSegments(now, fx.effects.glitches);
        ui.dialogueText.textContent = renderTextWithEffects(fx, fx.plainText.length, true, false);
    }, tickMs);
}

function finishTyping() {
    if (!state.isTyping) {
        return false;
    }

    clearTyping();

    if (state.textFx) {
        const now = nowMs();
        updateSwapSegments(now, state.textFx.effects.swaps);
        updateGlitchSegments(now, state.textFx.effects.glitches);
        ui.dialogueText.textContent = renderTextWithEffects(state.textFx, state.textFx.plainText.length, true, false);
        startPostFxTicker();
    } else {
        ui.dialogueText.textContent = state.fullText;
    }

    if (state.afterTyping) {
        const callback = state.afterTyping;
        state.afterTyping = null;
        callback();
    }

    return true;
}

function compareFlags(expectedFlags) {
    if (!expectedFlags || typeof expectedFlags !== "object") {
        return true;
    }
    return Object.keys(expectedFlags).every(function (key) {
        return state.flags[key] === expectedFlags[key];
    });
}

function compareMinVars(expectedVars) {
    if (!expectedVars || typeof expectedVars !== "object") {
        return true;
    }
    return Object.keys(expectedVars).every(function (key) {
        return Number(state.vars[key] || 0) >= Number(expectedVars[key]);
    });
}

function compareMaxVars(unlessVars) {
    if (!unlessVars || typeof unlessVars !== "object") {
        return true;
    }
    return Object.keys(unlessVars).every(function (key) {
        return Number(state.vars[key] || 0) < Number(unlessVars[key]);
    });
}

function compareReadScenes(requiredScenes) {
    if (!Array.isArray(requiredScenes) || requiredScenes.length === 0) {
        return true;
    }
    return requiredScenes.every(function (index) {
        return state.readScenes.has(clampSceneIndex(Number(index)));
    });
}

function compareUnreadScenes(unreadScenes) {
    if (!Array.isArray(unreadScenes) || unreadScenes.length === 0) {
        return true;
    }
    return unreadScenes.every(function (index) {
        return !state.readScenes.has(clampSceneIndex(Number(index)));
    });
}

function checkConditions(definition) {
    if (!definition || typeof definition !== "object") {
        return true;
    }

    if (!compareFlags(definition.ifFlags)) {
        return false;
    }
    if (!compareMinVars(definition.ifVars)) {
        return false;
    }
    if (!compareReadScenes(definition.ifReadScenes)) {
        return false;
    }
    if (!compareUnreadScenes(definition.unlessReadScenes)) {
        return false;
    }

    if (definition.unlessFlags && typeof definition.unlessFlags === "object") {
        const blocked = Object.keys(definition.unlessFlags).some(function (key) {
            return state.flags[key] === definition.unlessFlags[key];
        });
        if (blocked) {
            return false;
        }
    }

    if (!compareMaxVars(definition.unlessVars)) {
        return false;
    }

    return true;
}

function applyMutations(definition) {
    if (!definition || typeof definition !== "object") {
        return;
    }

    if (definition.setFlags && typeof definition.setFlags === "object") {
        Object.keys(definition.setFlags).forEach(function (key) {
            state.flags[key] = definition.setFlags[key];
        });
    }

    if (definition.setVars && typeof definition.setVars === "object") {
        Object.keys(definition.setVars).forEach(function (key) {
            state.vars[key] = Number(definition.setVars[key]);
        });
    }

    if (definition.addVars && typeof definition.addVars === "object") {
        Object.keys(definition.addVars).forEach(function (key) {
            const current = Number(state.vars[key] || 0);
            state.vars[key] = current + Number(definition.addVars[key]);
        });
    }
}

function resolveNext(nextValue) {
    const direct = resolveSceneTarget(nextValue);
    if (direct !== null) {
        return direct;
    }

    if (Array.isArray(nextValue)) {
        for (let index = 0; index < nextValue.length; index += 1) {
            const rule = nextValue[index];
            if (checkConditions(rule) && rule && rule.next !== undefined) {
                const resolved = resolveSceneTarget(rule.next);
                if (resolved !== null) {
                    return resolved;
                }
            }
        }
    }

    return null;
}

function appendLogEntry(scene, textShown, speakerName) {
    state.logEntries.push({
        label: resolveSceneField(scene, "label", ""),
        speaker: speakerName || resolveSceneField(scene, "speaker", t("ui.system")) || t("ui.system"),
        text: textShown || resolveSceneText(scene),
        sceneIndex: state.sceneIndex,
        sceneId: scene && scene.id !== undefined && scene.id !== null ? String(scene.id) : getSceneIdByIndex(state.sceneIndex),
        timestamp: nowMs()
    });

    if (state.logEntries.length > LOG_LIMIT) {
        state.logEntries = state.logEntries.slice(-LOG_LIMIT);
    }

    renderLogPanel();
}

function renderLogPanel() {
    ui.logList.innerHTML = "";

    if (!state.logEntries.length) {
        const empty = document.createElement("div");
        empty.className = "log-entry";
        empty.textContent = t("ui.logEmpty");
        ui.logList.appendChild(empty);
        return;
    }

    state.logEntries.slice().reverse().forEach(function (entry) {
        const row = document.createElement("article");
        row.className = "log-entry";

        const head = document.createElement("div");
        head.className = "log-entry-head";

        const speaker = document.createElement("div");
        speaker.className = "log-entry-speaker";
        speaker.textContent = entry.speaker;

        const tag = document.createElement("div");
        tag.className = "log-entry-tag";
        const entrySceneId = entry.sceneId || getSceneIdByIndex(entry.sceneIndex);
        tag.textContent = entry.label
            || (entrySceneId ? t("ui.scene", { id: entrySceneId }) : t("ui.scene", { id: String(entry.sceneIndex + 1).padStart(2, "0") }));

        const text = document.createElement("div");
        text.className = "log-entry-text";
        text.textContent = entry.text;

        head.appendChild(speaker);
        head.appendChild(tag);
        row.appendChild(head);
        row.appendChild(text);
        row.addEventListener("click", function () {
            closePanels();
            const target = entry.sceneId || getSceneIdByIndex(entry.sceneIndex);
            goToScene(target, { pushHistory: false });
            showToast(t("toast.replayJump"));
        });
        ui.logList.appendChild(row);
    });
}

function renderCheckpointsPanel() {
    ui.checkpointsList.innerHTML = "";

    scenes.forEach(function (scene, index) {
        if (!scene.checkpoint) {
            return;
        }

        const button = document.createElement("button");
        button.className = "checkpoint-btn";
        button.type = "button";

        const seen = state.readScenes.has(index);
        const visits = Number(state.sceneVisitCount[index] || 0);
        const sceneLabel = resolveSceneLabel(scene, index);
        const status = seen ? t("ui.checkpointSeen") : t("ui.checkpointNew");
        button.textContent =
            sceneLabel +
            "  //  " +
            status +
            ", " + t("ui.checkpointVisits") + ": " + visits;

        button.addEventListener("click", function () {
            closePanels();
            const target = scene.id !== undefined && scene.id !== null ? String(scene.id) : index;
            goToScene(target);
        });

        ui.checkpointsList.appendChild(button);
    });
}

function openPanel(panelName) {
    if (panelName === "dev" && !state.devMode) {
        return;
    }
    state.activePanel = panelName;

    ui.logPanel.hidden = panelName !== "log";
    ui.settingsPanel.hidden = panelName !== "settings";
    if (ui.savePanel) {
        ui.savePanel.hidden = panelName !== "save" && panelName !== "load";
    }
    if (ui.desktopPanel) {
        ui.desktopPanel.hidden = panelName !== "desktop";
    }
    if (ui.fileViewerPanel) {
        ui.fileViewerPanel.hidden = panelName !== "file";
    }
    if (ui.inputPanel) {
        ui.inputPanel.hidden = panelName !== "input";
    }
    ui.checkpointsPanel.hidden = panelName !== "checkpoints";
    if (ui.devPanel) {
        ui.devPanel.hidden = panelName !== "dev";
    }

    ui.settingsBtn.classList.toggle("is-active", panelName === "settings");
    if (ui.openDevBtn) {
        ui.openDevBtn.classList.toggle("is-active", panelName === "dev");
    }

    if (panelName === "log") {
        state.telemetry.logOpenCount += 1;
        renderLogPanel();
    }
    if (panelName === "settings") {
        state.telemetry.settingsOpenCount += 1;
        updateSettingsUi();
    }
    if (panelName === "save" || panelName === "load") {
        setSavePanelMode(panelName);
    }
    if (panelName === "checkpoints") {
        renderCheckpointsPanel();
    }
    if (panelName === "dev") {
        renderDevSavePanel();
    }
    if (panelName === "desktop") {
        refreshArtifacts().then(function () {
            renderDesktopPanel();
        });
    }

    updateTelemetrySummary();
}

function closePanels() {
    if (state.activePanel === "input" && state.wordReplace.active) {
        closeWordReplacePanel();
        return;
    }
    openPanel(null);
}

function togglePanel(panelName) {
    if (state.activePanel === panelName) {
        closePanels();
        return;
    }
    openPanel(panelName);
}

function resolveMetaStartSceneId(meta) {
    if (PREVIEW_MODE) {
        return START_SCENE_ID;
    }
    const map = STORY_DATA.metaStart && typeof STORY_DATA.metaStart === "object" ? STORY_DATA.metaStart : {};
    if (meta && meta.phase && Object.prototype.hasOwnProperty.call(map, meta.phase)) {
        return map[meta.phase];
    }
    if (meta && meta.startSceneId) {
        return meta.startSceneId;
    }
    return START_SCENE_ID;
}

function normalizeSystemRelPath(payload) {
    if (typeof payload === "string") {
        return payload;
    }
    if (!payload || typeof payload !== "object") {
        return "";
    }
    return String(payload.relPath || payload.path || payload.name || "");
}

function refreshArtifacts() {
    if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.fs || typeof SYSTEM_API.fs.list !== "function") {
        state.artifacts = [];
        return Promise.resolve([]);
    }
    return SYSTEM_API.fs.list()
        .then(function (result) {
            state.artifacts = Array.isArray(result && result.items) ? result.items : [];
            return state.artifacts;
        })
        .catch(function () {
            state.artifacts = [];
            return state.artifacts;
        });
}

function renderDesktopPanel() {
    if (!ui.desktopFiles) {
        return;
    }
    ui.desktopFiles.innerHTML = "";
    if (!state.artifacts.length) {
        const empty = document.createElement("div");
        empty.className = "overlay-note";
        empty.textContent = HAS_SYSTEM
            ? t("ui.desktopEmpty")
            : t("ui.desktopUnavailable");
        ui.desktopFiles.appendChild(empty);
        return;
    }
    state.artifacts.forEach(function (file) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "desktop-item";

        const icon = document.createElement("div");
        icon.className = "desktop-icon";

        const label = document.createElement("div");
        label.className = "desktop-label";
        label.textContent = file.relPath || file.name || t("ui.artifact");

        button.appendChild(icon);
        button.appendChild(label);

        button.addEventListener("click", function () {
            openFileViewer(file.relPath || file.name || "");
        });

        ui.desktopFiles.appendChild(button);
    });
}

function openDesktopPanel() {
    openPanel("desktop");
    refreshArtifacts().then(function () {
        renderDesktopPanel();
    });
}

function openFileViewer(relPath) {
    const target = String(relPath || "");
    if (!target) {
        return;
    }
    if (!ui.fileViewerContent || !ui.fileViewerTitle) {
        return;
    }
    ui.fileViewerTitle.textContent = target;
    if (ui.fileViewerMeta) {
        ui.fileViewerMeta.textContent = "";
    }
    ui.fileViewerContent.textContent = t("ui.fileLoading");
    openPanel("file");

    if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.fs || typeof SYSTEM_API.fs.readText !== "function") {
        ui.fileViewerContent.textContent = t("ui.fileUnavailable");
        return;
    }

    SYSTEM_API.fs.readText({ relPath: target })
        .then(function (result) {
            if (!result || !result.ok) {
                ui.fileViewerContent.textContent = t("ui.fileNotFound");
                return;
            }
            if (ui.fileViewerMeta) {
                ui.fileViewerMeta.textContent = t("ui.filePath", { path: result.relPath || target });
            }
            ui.fileViewerContent.textContent = result.content || "";
        })
        .catch(function () {
            ui.fileViewerContent.textContent = t("ui.fileFailed");
        });
}

function replaceWords(text, words) {
    const dictionary = Array.isArray(words) ? words.filter(Boolean) : [];
    if (!dictionary.length) {
        return text;
    }
    return String(text || "").split(/(\s+)/).map(function (token) {
        if (!token.trim()) {
            return token;
        }
        const pick = dictionary[randomInt(dictionary.length)];
        return pick;
    }).join("");
}

function updateWordReplacePreview() {
    if (!ui.inputPanelField || !ui.inputPanelPreview) {
        return;
    }
    state.wordReplace.preview = replaceWords(ui.inputPanelField.value, state.wordReplace.words);
    ui.inputPanelPreview.textContent = state.wordReplace.preview;
}

function updatePlayerNamePreview() {
    if (!ui.inputPanelField || !ui.inputPanelPreview) {
        return;
    }
    const api = typeof window !== "undefined" ? window.PlayerName : null;
    const preview = api && typeof api.previewInput === "function"
        ? api.previewInput(ui.inputPanelField.value)
        : String(ui.inputPanelField.value || "").trim();
    ui.inputPanelPreview.textContent = preview;
}

function updateInputPanelPreview() {
    if (state.wordReplace.active) {
        updateWordReplacePreview();
        return;
    }
    if (state.playerNameInput.active) {
        updatePlayerNamePreview();
    }
}

function closeWordReplacePanel() {
    state.wordReplace.active = false;
    state.wordReplace.words = [];
    state.wordReplace.preview = "";
    state.wordReplace.next = null;
    state.wordReplace.file = null;
    if (ui.inputPanelField) {
        ui.inputPanelField.value = "";
    }
    if (ui.inputPanelPreview) {
        ui.inputPanelPreview.textContent = "";
    }
    openPanel(null);
}

function closePlayerNamePanel() {
    state.playerNameInput.active = false;
    state.playerNameInput.next = null;
    if (ui.inputPanelField) {
        ui.inputPanelField.value = "";
    }
    if (ui.inputPanelPreview) {
        ui.inputPanelPreview.textContent = "";
    }
    openPanel(null);
}

function startWordReplaceInput(payload) {
    if (!payload || typeof payload !== "object") {
        return;
    }
    const words = Array.isArray(payload.words) ? payload.words : [];
    if (!words.length) {
        showToast(t("toast.noReplacementWords"));
        return;
    }
    state.playerNameInput.active = false;
    state.wordReplace.active = true;
    state.wordReplace.words = words;
    state.wordReplace.next = payload.next || null;
    state.wordReplace.file = payload.file || null;

    if (ui.inputPanelTitle) {
        const title = resolveLocalized(payload.title);
        ui.inputPanelTitle.textContent = title || t("ui.inputTitle");
    }
    if (ui.inputPanelNote) {
        const message = resolveLocalized(payload.message);
        ui.inputPanelNote.textContent = message || t("ui.inputNote");
    }
    if (ui.inputPanelField) {
        ui.inputPanelField.value = "";
        ui.inputPanelField.focus();
    }
    updateWordReplacePreview();
    openPanel("input");
}

function startPlayerNameInput(payload) {
    const config = payload && typeof payload === "object" ? payload : {};
    state.wordReplace.active = false;
    state.playerNameInput.active = true;
    state.playerNameInput.next = config.next || null;

    if (ui.inputPanelTitle) {
        const title = resolveLocalized(config.title);
        ui.inputPanelTitle.textContent = title || t("ui.inputPlayerTitle");
    }
    if (ui.inputPanelNote) {
        const message = resolveLocalized(config.message);
        ui.inputPanelNote.textContent = message || t("ui.inputPlayerNote");
    }
    if (ui.inputPanelField) {
        const api = typeof window !== "undefined" ? window.PlayerName : null;
        const current = api && typeof api.getName === "function" ? api.getName("playerinput") : "";
        ui.inputPanelField.value = current || "";
        ui.inputPanelField.focus();
    }
    updatePlayerNamePreview();
    openPanel("input");
}

function finishWordReplaceInput(submitted) {
    if (!state.wordReplace.active) {
        return;
    }
    const output = submitted ? state.wordReplace.preview : "";
    const file = state.wordReplace.file;
    const next = state.wordReplace.next;
    closeWordReplacePanel();

    if (submitted && file && typeof file === "object") {
        const relPath = normalizeSystemRelPath(file);
        const ttlMs = toNumber(file.ttlMs || file.ttl || 0, 0);
        const persistent = Boolean(file.persistent);
        if (relPath) {
            runSystemAction("files.write", {
                relPath: relPath,
                content: output,
                ttlMs: ttlMs,
                persistent: persistent
            });
        }
    }

    if (submitted && next) {
        goToScene(next);
    }
}

function finishPlayerNameInput(submitted) {
    if (!state.playerNameInput.active) {
        return;
    }
    const next = state.playerNameInput.next;
    const raw = ui.inputPanelField ? ui.inputPanelField.value : "";
    closePlayerNamePanel();

    if (submitted) {
        const api = typeof window !== "undefined" ? window.PlayerName : null;
        if (api && typeof api.saveInputName === "function") {
            api.saveInputName(raw).then(function (info) {
                if (info && typeof info === "object") {
                    setMetaState({
                        playerNameInput: info.inputName || "",
                        playerNameResolved: info.resolvedName || "",
                        playerNameSource: info.source || ""
                    });
                }
            }).catch(function () {});
        }
    }

    if (submitted && next) {
        goToScene(next);
    }
}

function finishInputPanel(submitted) {
    if (state.wordReplace.active) {
        finishWordReplaceInput(submitted);
        return;
    }
    if (state.playerNameInput.active) {
        finishPlayerNameInput(submitted);
        return;
    }
    openPanel(null);
}

function runSystemAction(op, payload) {
    const action = String(op || "").trim().toLowerCase();
    if (!action) {
        return;
    }

    if (action === "terminal.open") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.terminal) {
            showToast(t("toast.terminalRequiresDesktop"));
            return;
        }
        SYSTEM_API.terminal.open(payload || {});
        return;
    }

    if (action === "terminal.print") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.terminal) {
            showToast(t("toast.terminalRequiresDesktop"));
            return;
        }
      const text = payload && (payload.text !== undefined ? payload.text : payload.line);
      const lines = Array.isArray(payload && payload.lines) ? payload.lines : (text !== undefined ? [text] : []);
      SYSTEM_API.terminal.print({
          lines: lines.map(resolveLocalized),
          clear: Boolean(payload && payload.clear),
          asCommand: payload && payload.asCommand !== undefined ? Boolean(payload.asCommand) : undefined
      });
      return;
  }

    if (action === "terminal.type") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.terminal) {
            showToast(t("toast.terminalRequiresDesktop"));
            return;
        }
        const text = payload && (payload.text !== undefined ? payload.text : payload.line);
        const nextPayload = payload && typeof payload === "object" ? { ...payload } : {};
        if (text !== undefined) {
            nextPayload.text = resolveLocalized(text);
        }
        SYSTEM_API.terminal.type(nextPayload);
        return;
    }

    if (action === "terminal.choice") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.terminal) {
            showToast(t("toast.terminalRequiresDesktop"));
            return;
        }
        const prompt = payload && payload.prompt ? resolveLocalized(payload.prompt) : "Select";
        const keys = Array.isArray(payload && payload.keys) && payload.keys.length ? payload.keys : ["Y", "N"];
        const mapping = payload && payload.nextOnKey && typeof payload.nextOnKey === "object" ? payload.nextOnKey : {};
        SYSTEM_API.terminal.choice({ prompt: prompt, keys: keys, clear: Boolean(payload && payload.clear) })
            .then(function (result) {
                const key = result && result.key ? String(result.key).toUpperCase() : "";
                const next = mapping[key] || mapping[key.toLowerCase()] || null;
                if (next) {
                    goToScene(next);
                }
            })
            .catch(function () {});
        return;
    }

    if (action === "terminal.title") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.terminal) {
            showToast(t("toast.terminalRequiresDesktop"));
            return;
        }
        const title = payload && (payload.title !== undefined ? payload.title : payload);
        SYSTEM_API.terminal.title({ title: resolveLocalized(title) });
        return;
    }

    if (action === "terminal.close") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.terminal) {
            return;
        }
        SYSTEM_API.terminal.close();
        return;
    }

    if (action === "files.write") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.fs) {
            showToast(t("toast.fileRequiresDesktop"));
            return;
        }
        const relPath = normalizeSystemRelPath(payload);
        if (!relPath) {
            showToast(t("toast.missingFilePath"));
            return;
        }
        const content = payload && (payload.content !== undefined ? payload.content : payload.text);
        const resolvedContent = resolveLocalized(content);
        const ttlMs = toNumber(payload && (payload.ttlMs || payload.ttl || 0), 0);
        const persistent = Boolean(payload && payload.persistent);
        SYSTEM_API.fs.writeText({ relPath: relPath, content: resolvedContent, ttlMs: ttlMs, persistent: persistent })
            .then(function () { return refreshArtifacts(); })
            .then(function () { if (state.activePanel === "desktop") { renderDesktopPanel(); } });
        return;
    }

    if (action === "files.delete") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.fs) {
            return;
        }
        const relPath = normalizeSystemRelPath(payload);
        if (!relPath) {
            return;
        }
        SYSTEM_API.fs.delete({ relPath: relPath })
            .then(function () { return refreshArtifacts(); })
            .then(function () { if (state.activePanel === "desktop") { renderDesktopPanel(); } });
        return;
    }

    if (action === "files.list") {
        refreshArtifacts().then(function () {
            if (state.activePanel === "desktop") {
                renderDesktopPanel();
            }
        });
        return;
    }

    if (action === "files.cleanup") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.fs) {
            return;
        }
        SYSTEM_API.fs.cleanup()
            .then(function () { return refreshArtifacts(); })
            .then(function () { if (state.activePanel === "desktop") { renderDesktopPanel(); } });
        return;
    }

    if (action === "files.open") {
        const relPath = normalizeSystemRelPath(payload);
        if (!relPath) {
            return;
        }
        openFileViewer(relPath);
        return;
    }

    if (action === "files.openfolder") {
        if (!HAS_SYSTEM || !SYSTEM_API || !SYSTEM_API.fs) {
            return;
        }
        SYSTEM_API.fs.openFolder();
        return;
    }

    if (action === "desktop.show") {
        openDesktopPanel();
        return;
    }

    if (action === "desktop.hide") {
        closePanels();
        return;
    }

    if (action === "window.fakeclose") {
        const meta = payload && payload.meta
            ? payload.meta
            : (payload && (payload.phase || payload.startSceneId)
                ? { phase: payload.phase, startSceneId: payload.startSceneId }
                : null);
        if (meta) {
            setMetaState(meta);
        }
        if (HAS_SYSTEM && SYSTEM_API && SYSTEM_API.window) {
            SYSTEM_API.window.fakeClose({ meta: meta || undefined });
        } else {
            showToast(t("toast.appClosed"));
        }
        return;
    }

    if (action === "window.fakerestart") {
        const meta = payload && payload.meta
            ? payload.meta
            : (payload && (payload.phase || payload.startSceneId)
                ? { phase: payload.phase, startSceneId: payload.startSceneId }
                : null);
        if (meta) {
            setMetaState(meta);
        }
        if (HAS_SYSTEM && SYSTEM_API && SYSTEM_API.window) {
            SYSTEM_API.window.fakeRestart({ meta: meta || undefined });
        } else {
            window.location.reload();
        }
        return;
    }

    if (action === "prompt.fakepermission") {
        showFakePrompt(payload && payload.message ? resolveLocalized(payload.message) : t("ui.promptPermissions"));
        return;
    }

    if (action === "input.wordreplace") {
        startWordReplaceInput(payload || {});
        return;
    }

    if (action === "meta.set") {
        setMetaState(payload || {});
    }
}

function triggerFlash() {
    ui.stageFlash.classList.remove("is-active");
    void ui.stageFlash.offsetWidth;
    ui.stageFlash.classList.add("is-active");
}

function triggerRedFlash() {
    if (!ui.stageFlash) {
        return;
    }
    ui.stageFlash.classList.add("is-red");
    triggerFlash();
    setTimeout(function () {
        ui.stageFlash.classList.remove("is-red");
    }, 480);
}

function triggerNoiseBurst() {
    ui.stageNoise.classList.remove("is-active");
    void ui.stageNoise.offsetWidth;
    ui.stageNoise.classList.add("is-active");
}

function applyEffects(effects) {
    const classes = ["fx-shake", "fx-flicker", "fx-zoom", "fx-invert", "fx-stutter", "fx-blurburst", "fx-vignette"];
    ui.root.classList.remove(...classes);

    if (!Array.isArray(effects)) {
        return;
    }

    effects.forEach(function (effect) {
        if (effect === "fade") {
            animateTransition();
            return;
        }
        if (effect === "flash") {
            triggerFlash();
            return;
        }
        if (effect === "redflash") {
            triggerRedFlash();
            return;
        }
        if (effect === "noise") {
            triggerNoiseBurst();
            return;
        }

        const className = "fx-" + effect;
        if (!classes.includes(className)) {
            return;
        }

        ui.root.classList.add(className);
        setTimeout(function () {
            ui.root.classList.remove(className);
        }, TEMP_EFFECT_DURATION);
    });
}

function animateTransition() {
    ui.root.classList.remove("stage-fade");
    void ui.root.offsetWidth;
    ui.root.classList.add("stage-fade");
    setTimeout(function () {
        ui.root.classList.remove("stage-fade");
    }, 420);
}

function showFakePrompt(message, callback) {
    ui.fakePromptText.textContent = message || t("ui.promptSignalAnomaly");
    ui.fakePromptPanel.hidden = false;
    state.prompt.onAcknowledge = typeof callback === "function" ? callback : null;
    state.telemetry.fakePromptCount += 1;
}

function hideFakePrompt() {
    ui.fakePromptPanel.hidden = true;
    state.prompt.onAcknowledge = null;
}

function clearScreenTextTimer() {
    if (state.screenTextTimerId) {
        clearTimeout(state.screenTextTimerId);
        state.screenTextTimerId = null;
    }
}

function hideScreenText() {
    if (!ui.screenTextOverlay) {
        return;
    }
    clearScreenTextTimer();
    state.screenTextActive = false;
    ui.screenTextOverlay.classList.remove("is-active");
    const overlay = ui.screenTextOverlay;
    setTimeout(function () {
        if (!state.screenTextActive) {
            overlay.hidden = true;
        }
    }, 220);
}

function showScreenText(payload) {
    if (!ui.screenTextOverlay || !ui.screenTextContent) {
        return;
    }
    const message = payload && payload.text !== undefined ? String(payload.text) : "";
    if (!message) {
        return;
    }

    clearScreenTextTimer();
    ui.screenTextContent.textContent = message;
    ui.screenTextOverlay.classList.remove("screen-text--red", "screen-text--ghost");
    const style = payload && typeof payload.style === "string" ? payload.style.trim().toLowerCase() : "white";
    if (style === "red") {
        ui.screenTextOverlay.classList.add("screen-text--red");
    } else if (style === "ghost") {
        ui.screenTextOverlay.classList.add("screen-text--ghost");
    }

    ui.screenTextOverlay.hidden = false;
    void ui.screenTextOverlay.offsetWidth;
    ui.screenTextOverlay.classList.add("is-active");
    state.screenTextActive = true;

    const soundName = payload && typeof payload.sound === "string" ? payload.sound : "";
    if (soundName) {
        const normalized = normalizeAudioName(soundName);
        if (normalized) {
            playAudioSample(normalized, clampValue(toNumber(payload.volume, 1), 0, 1));
        }
    }

    const duration = Math.max(80, toNumber(payload && payload.durationMs, DEFAULT_SCREEN_TEXT_MS));
    state.screenTextTimerId = setTimeout(hideScreenText, duration);
}

function sceneHasTerminalEvents(scene) {
    const timeline = Array.isArray(scene && scene.timeline) ? scene.timeline : [];
    return timeline.some(function (eventDef) {
        const type = typeof eventDef.type === "string" ? eventDef.type.toLowerCase() : "";
        if (type === "system") {
            const op = eventDef.op || eventDef.action || eventDef.name || "";
            return typeof op === "string" && op.toLowerCase().startsWith("terminal.");
        }
        return false;
    });
}

function getCmdScriptById(scriptId) {
    const list = window.STORY && Array.isArray(window.STORY.cmdScripts) ? window.STORY.cmdScripts : [];
    const target = String(scriptId || "").trim();
    if (!target) {
        return null;
    }
    return list.find(function (script) {
        return String(script.id || "").trim() === target;
    }) || null;
}

function buildCmdTimeline(scene) {
    if (!scene || !scene.cmd || !scene.cmd.enabled) {
        return [];
    }
    const cmd = scene.cmd || {};
    let steps = [];
    if (cmd.source === "script") {
        const script = getCmdScriptById(cmd.scriptId);
        steps = script && Array.isArray(script.steps) ? script.steps : [];
    } else {
        steps = Array.isArray(cmd.steps) ? cmd.steps : [];
    }
    if (!steps.length) {
        return [];
    }
    let cursor = Math.max(0, toNumber(cmd.startAt, 0));
    const events = [];
    steps.forEach(function (step) {
        const type = String(step.type || "").toLowerCase();
        if (type === "wait") {
            cursor += Math.max(0, toNumber(step.delayMs, 0));
            return;
        }
        let event = null;
          if (type === "open") {
              event = {
                  at: cursor,
                  type: "system",
                  op: "terminal.open",
                  payload: {
                      path: step.path || step.prefix,
                      title: step.title,
                      hint: step.hint,
                      clear: Boolean(step.clear),
                      choosePath: Boolean(step.choosePath)
                  }
              };
        } else if (type === "print") {
            const text = step.text !== undefined ? step.text : step.line;
            let lines = Array.isArray(step.lines) ? step.lines : null;
            if (!lines && typeof text === "string" && text.includes("\n")) {
                lines = text.split(/\r?\n/);
            }
            const payload = lines && lines.length ? { lines: lines } : { text: text };
            if (step.asCommand !== undefined) {
                payload.asCommand = Boolean(step.asCommand);
            }
            event = { at: cursor, type: "system", op: "terminal.print", payload: payload };
        } else if (type === "type") {
            event = {
                at: cursor,
                type: "system",
                op: "terminal.type",
                payload: { text: step.text || "", speedMs: step.speedMs }
            };
        } else if (type === "choice") {
            event = {
                at: cursor,
                type: "system",
                op: "terminal.choice",
                payload: {
                    prompt: step.prompt,
                    keys: step.keys,
                    nextOnKey: step.nextOnKey,
                    autoSubmit: step.autoSubmit,
                    path: step.path || step.prefix
                }
            };
        } else if (type === "clear") {
            event = { at: cursor, type: "system", op: "terminal.print", payload: { clear: true } };
        } else if (type === "close") {
            event = { at: cursor, type: "system", op: "terminal.close" };
        } else if (type === "title") {
            event = { at: cursor, type: "system", op: "terminal.title", payload: { title: step.title } };
        }

        if (event) {
            events.push(event);
        }
        cursor += Math.max(0, toNumber(step.delayMs, 0));
    });
    return events;
}

function scheduleTimeline(scene) {
    clearTimelineTimers();

    const baseTimeline = Array.isArray(scene.timeline) ? scene.timeline.slice() : [];
    const cmdEvents = !sceneHasTerminalEvents(scene) ? buildCmdTimeline(scene) : [];
    const events = baseTimeline.concat(cmdEvents);
    if (!events.length) {
        return;
    }

    events.sort(function (a, b) {
        return toNumber(a.at, 0) - toNumber(b.at, 0);
    });

    events.forEach(function (eventDef) {
        const timerId = setTimeout(function () {
            const type = typeof eventDef.type === "string" ? eventDef.type.toLowerCase() : eventDef.type;
            if (type === "toast") {
                const message = resolveLocalized(eventDef.message);
                showToast(message || t("toast.timelineEvent"));
                return;
            }
            if (type === "effect") {
                applyEffects([eventDef.effect || "flicker"]);
                return;
            }
            if (type === "noise") {
                triggerNoiseBurst();
                return;
            }
            if (type === "hint") {
                const message = resolveLocalized(eventDef.message);
                ui.dialogueHint.textContent = message || t("ui.timelineHint");
                return;
            }
            if (type === "prompt") {
                const message = resolveLocalized(eventDef.message);
                showFakePrompt(message || t("ui.promptTimeline"));
                return;
            }
            if (type === "screenText") {
                const payload = eventDef.payload && typeof eventDef.payload === "object" ? eventDef.payload : {};
                showScreenText({
                    text: resolveLocalized(eventDef.text !== undefined
                        ? eventDef.text
                        : (eventDef.message !== undefined ? eventDef.message : payload.text || payload.message)),
                    durationMs: eventDef.durationMs !== undefined ? eventDef.durationMs : payload.durationMs,
                    style: eventDef.style !== undefined ? eventDef.style : payload.style,
                    sound: eventDef.sound !== undefined ? eventDef.sound : payload.sound,
                    volume: eventDef.volume !== undefined ? eventDef.volume : payload.volume
                });
                return;
            }
            if (type === "sfx") {
                const sound = eventDef.sound || eventDef.src || (eventDef.payload && eventDef.payload.sound) || "";
                const normalized = normalizeAudioName(sound);
                if (normalized) {
                    playAudioSample(normalized, clampValue(toNumber(eventDef.volume, 1), 0, 1));
                }
                return;
            }
            if (type === "music") {
                const action = typeof eventDef.action === "string"
                    ? eventDef.action.trim().toLowerCase()
                    : "play";
                const musicDef = eventDef.music && typeof eventDef.music === "object"
                    ? eventDef.music
                    : eventDef;
                if (action === "pause") {
                    pauseBgm();
                    return;
                }
                if (action === "resume") {
                    resumeBgm();
                    return;
                }
                if (action === "stop") {
                    stopBgm(toNumber(musicDef.fadeMs, toNumber(STORY_AUDIO.musicFadeMs, 0)));
                    return;
                }
                const musicSrc = musicDef.src || musicDef.music || "";
                if (musicSrc) {
                    playBgm({
                        src: musicSrc,
                        volume: musicDef.volume,
                        loop: musicDef.loop !== false,
                        fadeMs: musicDef.fadeMs
                    });
                }
                return;
            }
            if (type === "system") {
                runSystemAction(eventDef.op || eventDef.action || eventDef.name, eventDef.payload || eventDef);
                return;
            }
            if (type === "input.playername") {
                startPlayerNameInput(eventDef);
                return;
            }
            if (type === "observer") {
                maybeEmitObserverMessage(true);
            }
        }, Math.max(0, toNumber(eventDef.at, 0)));

        state.timelineTimers.push(timerId);
    });
}

function startTimedChoice(scene) {
    clearChoiceTimer();

    if (!state.settings.timedChoices) {
        return;
    }
    if (!toNumber(scene.timeLimitMs, 0)) {
        return;
    }

    state.choiceTimer.active = true;
    state.choiceTimer.startedAt = nowMs();
    state.choiceTimer.endsAt = state.choiceTimer.startedAt + toNumber(scene.timeLimitMs, 0);
    state.choiceTimer.timeoutNext = resolveNext(scene.timeoutNext);
    state.choiceTimer.timeoutChoiceText = resolveSceneField(scene, "timeoutChoiceText", "") || t("toast.timeoutReached");

    ui.timerChip.hidden = false;

    function tickTimer() {
        const remaining = state.choiceTimer.endsAt - nowMs();
        const seconds = Math.max(0, remaining) / 1000;
        ui.timerChip.textContent = seconds.toFixed(1) + "s";
        ui.timerChip.classList.toggle("is-critical", seconds < 2.5);

        if (remaining > 0) {
            return;
        }

        const timeoutNext = state.choiceTimer.timeoutNext;
        const timeoutText = state.choiceTimer.timeoutChoiceText;
        clearChoiceTimer();
        state.flags.timedTimeout = true;
        state.flags.timedSuccess = false;
        state.telemetry.timeoutCount += 1;

        if (timeoutText) {
            showToast(resolveLocalized(timeoutText) || t("toast.timeoutReached"));
        }

        if (timeoutNext !== null) {
            goToScene(timeoutNext);
            return;
        }

        const firstChoice = ui.choices.querySelector(".choice-btn:not(.is-locked)");
        if (firstChoice) {
            firstChoice.click();
        }
    }

    tickTimer();
    state.choiceTimerId = setInterval(tickTimer, 100);
}
function maybeCorruptChoiceLabels(buttons) {
    if (!state.settings.pressureLayer || !state.settings.glitchText) {
        return;
    }
    if (state.pressureScore < 62) {
        return;
    }
    if (!buttons.length || Math.random() > 0.42) {
        return;
    }

    const target = buttons[randomInt(buttons.length)];
    const label = target.querySelector(".choice-label");
    const raw = target.getAttribute("data-raw-text")
        || (label && label.getAttribute("data-raw-text"))
        || (label && label.textContent)
        || target.textContent
        || "";
    const mutated = glitchifyText(raw, 0.16);
    if (label) {
        label.textContent = mutated;
        label.setAttribute("data-raw-text", mutated);
    } else if (target.childNodes[0]) {
        target.childNodes[0].nodeValue = mutated;
    }
    target.setAttribute("data-raw-text", mutated);
    state.telemetry.corruptedChoiceCount += 1;
}

function lockChoiceSelection(selectedButton) {
    const buttons = Array.from(ui.choices.querySelectorAll(".choice-btn"));
    buttons.forEach(function (button) {
        button.disabled = true;
        button.classList.add("is-hidden");
    });
}

function handleChoiceAction(action) {
    if (!action || typeof action !== "object") {
        return false;
    }

    const actionType = String(action.type || "").toLowerCase();

    if (actionType === "system") {
        runSystemAction(action.op || action.action || action.name, action.payload || action);
        return false;
    }

    if (actionType === "openpanel") {
        openPanel(action.panel || "settings");
        return false;
    }

    if (actionType === "primeanomaly") {
        const slot = clampValue(toNumber(action.slot, 1), 1, 3);
        primeVirtualAnomaly(slot);
        return false;
    }

    if (actionType === "toast") {
        const message = resolveLocalized(action.message);
        showToast(message || t("toast.actionExecuted"));
        return false;
    }

    if (actionType === "input.playername") {
        startPlayerNameInput(action);
        return true;
    }

    return false;
}

function setClickBirdVisible(visible) {
    if (!ui.clickBird) {
        return;
    }
    ui.clickBird.classList.toggle("is-visible", Boolean(visible));
}

function renderChoices(scene) {
    ui.choices.innerHTML = "";
    state.choiceCommitted = false;
    clearChoiceFxTimers();
    const choices = Array.isArray(scene.choices) ? scene.choices : [];

    if (!choices.length) {
        const nextIndex = resolveNext(scene.next);
        const canContinue = nextIndex !== null;
        ui.dialogueHint.textContent = nextIndex !== null
            ? t("ui.dialogueHint")
            : t("ui.branchEnd");
        setClickBirdVisible(canContinue && !state.isTyping);
        scheduleAutoAdvance(scene);
        return;
    }

    setClickBirdVisible(false);
    if (state.skipMode) {
        toggleSkip(false);
        showToast(t("toast.skipPaused"));
    }

    ui.dialogueHint.textContent = t("ui.selectOption");
    const renderedButtons = [];
    const choiceFxEntries = [];

    choices.forEach(function (choice, index) {
        const unlocked = checkConditions(choice);
        if (!unlocked && !choice.showLocked) {
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-btn";

        const choiceText = resolveChoiceField(scene, choice, index, "text");
        const rawText = (index + 1) + ". " + (choiceText || "");
        const fx = prepareTextFx(rawText);
        const label = document.createElement("span");
        label.className = "choice-label";
        label.textContent = renderChoiceFxLabel(fx);
        label.setAttribute("data-raw-text", fx.plainText || "");
        button.appendChild(label);
        button.setAttribute("data-raw-text", fx.plainText || "");

        if (fx && fx.effects && (
            (fx.effects.swaps && fx.effects.swaps.length)
            || (fx.effects.scrambles && fx.effects.scrambles.length)
            || (fx.effects.glitches && fx.effects.glitches.length)
        )) {
            choiceFxEntries.push({ button: button, label: label, fx: fx });
        }

        if (!unlocked) {
            button.classList.add("is-locked");
            button.disabled = true;
            const lockedText = resolveChoiceField(scene, choice, index, "lockedText");
            if (lockedText) {
                const reason = document.createElement("span");
                reason.className = "choice-meta";
                reason.textContent = lockedText;
                button.appendChild(reason);
            }
        } else {
            button.addEventListener("click", function () {
                if (state.choiceCommitted) {
                    return;
                }

                state.choiceCommitted = true;
                lockChoiceSelection(button);
                clearChoiceTimer();
                state.flags.timedTimeout = false;
                applyMutations(choice);
                const preventNext = handleChoiceAction(choice.action);

                if (Array.isArray(choice.effects)) {
                    applyEffects(choice.effects);
                }

                const nextIndex = resolveNext(choice.next);
                if (!preventNext && nextIndex !== null) {
                    goToScene(nextIndex);
                }
            });
        }

        renderedButtons.push(button);
        ui.choices.appendChild(button);
    });

    maybeCorruptChoiceLabels(renderedButtons.filter(function (button) {
        return !button.classList.contains("is-locked");
    }));

    startChoiceFxTicker(choiceFxEntries);
    startTimedChoice(scene);
}

function updateAutoIndicator() {
    if (!state.devMode || !ui.autoIndicator || !ui.autoIndicatorTime) {
        return;
    }
    if (!state.autoEndsAt || !state.autoMode || state.choiceTimer.active || state.isTyping) {
        ui.autoIndicator.hidden = true;
        return;
    }
    const remainingMs = Math.max(0, state.autoEndsAt - nowMs());
    ui.autoIndicator.hidden = false;
    ui.autoIndicatorTime.textContent = (remainingMs / 1000).toFixed(1) + "s";
}

function startAutoIndicator(delayMs) {
    if (!state.devMode || !ui.autoIndicator || !state.autoMode) {
        return;
    }
    state.autoEndsAt = nowMs() + Math.max(0, delayMs);
    updateAutoIndicator();
    if (!state.autoIndicatorTimer) {
        state.autoIndicatorTimer = setInterval(updateAutoIndicator, 120);
    }
}

function stopAutoIndicator() {
    state.autoEndsAt = 0;
    if (state.autoIndicatorTimer) {
        clearInterval(state.autoIndicatorTimer);
        state.autoIndicatorTimer = null;
    }
    if (ui.autoIndicator) {
        ui.autoIndicator.hidden = true;
    }
}

function scheduleAutoAdvance(scene) {
    clearAutoTimer();

    if (state.isTyping) {
        return;
    }
    if (state.choiceTimer.active) {
        return;
    }
    if (Array.isArray(scene.choices) && scene.choices.length > 0) {
        return;
    }

    const nextIndex = resolveNext(scene.next);
    if (nextIndex === null) {
        return;
    }

    const skipActive = canSkipCurrentScene();
    if (!state.autoMode && !skipActive) {
        return;
    }

    const delay = skipActive ? SKIP_DELAY_MS : state.settings.autoDelayMs;
    state.autoTimer = setTimeout(function () {
        goToScene(nextIndex);
    }, delay);
    startAutoIndicator(delay);
}

function maybeEmitObserverMessage(force) {
    if (!state.settings.pressureLayer) {
        return;
    }
    if (!OBSERVER_LINES.length) {
        return;
    }

    const now = nowMs();
    if (!force && now - state.lastObserverAt < 8500) {
        return;
    }

    const score = state.pressureScore;
    const probability = force ? 1 : (score >= 62 ? 0.52 : score >= 40 ? 0.28 : 0.12);
    if (!force && Math.random() > probability) {
        return;
    }

    state.lastObserverAt = now;
    showToast(resolveLocalized(OBSERVER_LINES[randomInt(OBSERVER_LINES.length)]));
}

function updateTelemetrySummary() {
    const telemetry = state.telemetry;
    const sessionMinutes = (telemetry.sessionMs / 60000).toFixed(1);
    const idleMinutes = (telemetry.idleMs / 60000).toFixed(1);
    const hour = new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0");

    const summary = [
        t("telemetry.time", { time: hour }),
        t("telemetry.session", { minutes: sessionMinutes }),
        t("telemetry.idle", { minutes: idleMinutes }),
        t("telemetry.clicks", { count: telemetry.clickCount }),
        t("telemetry.keys", { count: telemetry.keyCount }),
        t("telemetry.avgClickInterval", { ms: Math.round(telemetry.avgClickIntervalMs || 0) }),
        t("telemetry.avgKeyInterval", { ms: Math.round(telemetry.avgKeyIntervalMs || 0) }),
        t("telemetry.revisits", { count: telemetry.revisitCount }),
        t("telemetry.savesLoads", { saves: telemetry.saveCount, loads: telemetry.loadCount }),
        t("telemetry.timeouts", { count: telemetry.timeoutCount }),
        t("telemetry.corruptions", { count: telemetry.corruptedChoiceCount }),
        t("telemetry.pressure", { score: state.pressureScore })
    ];

    ui.telemetrySummary.textContent = summary.join("\n");
}

function updatePressureState() {
    state.pressureScore = calculatePressureScore();
    applyPressureVisuals();
    updateTelemetrySummary();
}

function applySceneMutations(scene, sceneIndex) {
    if (scene.once === true) {
        if (state.appliedSceneMutations.has(sceneIndex)) {
            return;
        }
        state.appliedSceneMutations.add(sceneIndex);
    }

    applyMutations(scene);
}

function primeVirtualAnomaly(slot) {
    const meta = normalizeSlotMeta(slot);
    meta.anomaly = clampValue(meta.anomaly + 2, 0, 9);
    meta.note = "primed by module";
    persistSlotMeta();
    showToast(t("toast.slotAnomaly", { slot: slot }));
}

function mutateSlotMetaOnSave(slot) {
    const meta = normalizeSlotMeta(slot);
    meta.writes += 1;

    if (!state.settings.pressureLayer) {
        meta.anomaly = Math.max(0, meta.anomaly - 1);
        meta.note = "stable";
        return;
    }

    const pressure = state.pressureScore;
    const chance = clampValue(pressure / 140, 0, 0.75);
    if (Math.random() < chance) {
        meta.anomaly = clampValue(meta.anomaly + 1, 0, 9);
        meta.note = "checksum drift " + randomInt(97);
    } else {
        meta.anomaly = Math.max(0, meta.anomaly - 1);
        meta.note = "stable";
    }
}

function maybeWarnSlotAnomaly(slot) {
    const meta = normalizeSlotMeta(slot);
    if (meta.anomaly < 4) {
        return;
    }
    showFakePrompt(
        t("ui.slotAnomalyPrompt", { slot: slot, level: meta.anomaly })
    );
}

function getSavePayload() {
    return {
        sceneIndex: state.sceneIndex,
        sceneId: getSceneIdByIndex(state.sceneIndex),
        autoMode: state.autoMode,
        skipMode: state.skipMode,
        muted: state.muted,
        uiHidden: state.uiHidden,
        sceneHistory: state.sceneHistory.slice(-260),
        flags: { ...state.flags },
        vars: { ...state.vars },
        settings: { ...state.settings },
        readScenes: Array.from(state.readScenes),
        logEntries: state.logEntries.slice(-LOG_LIMIT),
        labProgress: state.labProgress,
        telemetry: state.telemetry,
        slotMeta: state.slotMeta,
        appliedSceneMutations: Array.from(state.appliedSceneMutations),
        savedAt: new Date().toISOString(),
        version: STORAGE_VERSION
    };
}

function applyLoadedPayload(payload) {
    state.autoMode = Boolean(payload.autoMode);
    state.skipMode = Boolean(payload.skipMode);
    state.muted = Boolean(payload.muted);
    state.uiHidden = Boolean(payload.uiHidden);

    state.sceneHistory = Array.isArray(payload.sceneHistory)
        ? payload.sceneHistory.map(function (entry) {
            if (typeof entry === "string") {
                return entry;
            }
            if (typeof entry === "number") {
                return getSceneIdByIndex(entry);
            }
            return "";
        }).filter(Boolean)
        : [];

    state.flags = payload.flags && typeof payload.flags === "object" ? { ...payload.flags } : {};
    state.vars = payload.vars && typeof payload.vars === "object" ? { ...payload.vars } : {};
    state.settings = normalizeSettings(payload.settings);

    state.readScenes = new Set(Array.isArray(payload.readScenes)
        ? payload.readScenes.map(function (index) { return clampSceneIndex(Number(index)); })
        : []);

    state.logEntries = Array.isArray(payload.logEntries)
        ? payload.logEntries.slice(-LOG_LIMIT).map(function (entry) {
            if (!entry || typeof entry !== "object") {
                return null;
            }
            const index = clampSceneIndex(Number(entry.sceneIndex));
            return {
                label: entry.label || "",
                speaker: entry.speaker || "SYSTEM",
                text: entry.text || "",
                sceneIndex: index,
                sceneId: entry.sceneId || getSceneIdByIndex(index),
                timestamp: toNumber(entry.timestamp, nowMs())
            };
        }).filter(Boolean)
        : [];

    if (payload.labProgress && typeof payload.labProgress === "object") {
        state.labProgress = {
            checkpointsVisited: payload.labProgress.checkpointsVisited && typeof payload.labProgress.checkpointsVisited === "object"
                ? { ...payload.labProgress.checkpointsVisited }
                : {},
            modulesSeen: payload.labProgress.modulesSeen && typeof payload.labProgress.modulesSeen === "object"
                ? { ...payload.labProgress.modulesSeen }
                : {}
        };
    }

    if (payload.telemetry && typeof payload.telemetry === "object") {
        Object.assign(state.telemetry, payload.telemetry);
    }

    if (payload.slotMeta && typeof payload.slotMeta === "object") {
        [1, 2, 3].forEach(function (slot) {
            if (payload.slotMeta[slot]) {
                state.slotMeta[slot] = {
                    anomaly: clampValue(toNumber(payload.slotMeta[slot].anomaly, 0), 0, 9),
                    note: String(payload.slotMeta[slot].note || "stable"),
                    writes: clampValue(toNumber(payload.slotMeta[slot].writes, 0), 0, 9999),
                    preview: typeof payload.slotMeta[slot].preview === "string" ? payload.slotMeta[slot].preview : "",
                    updatedAt: toNumber(payload.slotMeta[slot].updatedAt, 0)
                };
            }
        });
    }

    state.appliedSceneMutations = new Set(Array.isArray(payload.appliedSceneMutations)
        ? payload.appliedSceneMutations.map(function (index) { return clampSceneIndex(Number(index)); })
        : []);

    updateSettingsUi();
    updateModeButtons();
    toggleUI(state.uiHidden);
    renderLogPanel();
    renderCheckpointsPanel();
    updateTelemetrySummary();
    renderDevSavePanel();

    persistSettings();
    persistReadScenes();
    persistTelemetry();
    persistLabProgress();
    persistSlotMeta();
}

function startAmbienceIfNeeded() {
    if (!state.settings.ambience || state.muted) {
        stopAmbience();
        return;
    }
    if (!state.audioUnlocked) {
        return;
    }

    try {
        const audioCtx = getAudioContextSafe();
        if (!audioCtx || audioCtx.state !== "running") {
            return;
        }

        if (state.ambienceNodes) {
            return;
        }

        const master = audioCtx.createGain();
        master.gain.value = BASE_AMBIENCE_GAIN * getAmbienceVolumeFactor();

        const drone = audioCtx.createOscillator();
        drone.type = "sawtooth";
        drone.frequency.value = 52;

        const high = audioCtx.createOscillator();
        high.type = "triangle";
        high.frequency.value = 213;

        const wobble = audioCtx.createOscillator();
        wobble.type = "sine";
        wobble.frequency.value = 0.16;

        const wobbleGain = audioCtx.createGain();
        wobbleGain.gain.value = 9;

        wobble.connect(wobbleGain);
        wobbleGain.connect(high.frequency);

        drone.connect(master);
        high.connect(master);
        master.connect(audioCtx.destination);

        drone.start();
        high.start();
        wobble.start();

        state.ambienceNodes = { master: master, drone: drone, high: high, wobble: wobble, wobbleGain: wobbleGain };
    } catch (error) {
        // ignore audio setup errors
    }
}

function stopAmbience() {
    const nodes = state.ambienceNodes;
    if (!nodes) {
        return;
    }

    try {
        nodes.drone.stop();
        nodes.high.stop();
        nodes.wobble.stop();
    } catch (error) {
        // ignore
    }

    try {
        nodes.master.disconnect();
    } catch (error) {
        // ignore
    }

    state.ambienceNodes = null;
}

function refreshAmbienceState() {
    if (state.settings.ambience && !state.muted) {
        startAmbienceIfNeeded();
    } else {
        stopAmbience();
    }
}

function updateAmbienceVolume() {
    const nodes = state.ambienceNodes;
    if (!nodes || !nodes.master) {
        return;
    }
    nodes.master.gain.value = BASE_AMBIENCE_GAIN * getAmbienceVolumeFactor();
}

function checkDevKey() {
    if (state.devKeyChecked) {
        return Promise.resolve(state.devMode);
    }
    state.devKeyChecked = true;
    if (IS_FILE_ORIGIN) {
        return Promise.resolve(false);
    }
    return fetch(DEV_KEY_PATH + "?ts=" + nowMs(), { cache: "no-store" })
        .then(function (response) {
            if (!response.ok) {
                return "";
            }
            return response.text();
        })
        .then(function (text) {
            const normalized = String(text || "").trim();
            return normalized === DEV_KEY_VALUE;
        })
        .catch(function () {
            return false;
        })
        .then(function (isValid) {
            setDevMode(isValid);
            return isValid;
        });
}

function setDevMode(enabled) {
    state.devMode = Boolean(enabled);
    if (ui.root) {
        ui.root.classList.toggle("dev-enabled", state.devMode);
    }
    if (!state.devMode) {
        return;
    }
    bindDevControls();
    renderDevSavePanel();
    validateStoryData();
}

function bindDevControls() {
    if (state.devControlsBound) {
        return;
    }
    state.devControlsBound = true;
    if (ui.devJumpBtn && ui.devJumpInput) {
        ui.devJumpBtn.addEventListener("click", function () {
            const target = String(ui.devJumpInput.value || "").trim();
            if (!target) {
                return;
            }
            goToScene(target);
        });
    }
    if (ui.devReloadBtn) {
        ui.devReloadBtn.addEventListener("click", function () {
            reloadStoryData();
        });
    }
    if (ui.devValidateBtn) {
        ui.devValidateBtn.addEventListener("click", function () {
            validateStoryData();
        });
    }
}

function validateStoryData() {
    if (!state.devMode) {
        return;
    }
    const issues = [];
    const idSet = new Set();

    scenes.forEach(function (scene, index) {
        if (!scene || typeof scene !== "object") {
            issues.push("Scene at index " + index + " is not an object");
            return;
        }
        if (scene.id === undefined || scene.id === null || String(scene.id).trim() === "") {
            issues.push("Scene at index " + index + " is missing id");
        } else {
            const id = String(scene.id).trim();
            if (idSet.has(id)) {
                issues.push("Duplicate scene id: " + id);
            } else {
                idSet.add(id);
            }
        }

        const targetList = [
            { key: "next", value: scene.next },
            { key: "fallbackNext", value: scene.fallbackNext },
            { key: "timeoutNext", value: scene.timeoutNext }
        ];
        targetList.forEach(function (entry) {
            if (entry.value === undefined || entry.value === null || entry.value === "") {
                return;
            }
            const normalized = normalizeSceneId(entry.value);
            if (!normalized) {
                return;
            }
            if (!sceneIdToIndex.has(normalized)) {
                const numeric = Number(normalized);
                if (!Number.isFinite(numeric) || numeric < 0 || numeric >= scenes.length) {
                    issues.push("Scene " + (scene.id || index) + " has invalid " + entry.key + ": " + normalized);
                }
            }
        });

        if (Array.isArray(scene.choices)) {
            scene.choices.forEach(function (choice, choiceIndex) {
                if (!choice || typeof choice !== "object") {
                    issues.push("Choice at " + (scene.id || index) + ":" + choiceIndex + " is not object");
                    return;
                }
                if (choice.next !== undefined && choice.next !== null && choice.next !== "") {
                    const normalized = normalizeSceneId(choice.next);
                    if (normalized && !sceneIdToIndex.has(normalized)) {
                        const numeric = Number(normalized);
                        if (!Number.isFinite(numeric) || numeric < 0 || numeric >= scenes.length) {
                            issues.push("Choice next invalid at " + (scene.id || index) + ":" + choiceIndex + " -> " + normalized);
                        }
                    }
                }
                if (choice.timeoutNext !== undefined && choice.timeoutNext !== null && choice.timeoutNext !== "") {
                    const normalized = normalizeSceneId(choice.timeoutNext);
                    if (normalized && !sceneIdToIndex.has(normalized)) {
                        const numeric = Number(normalized);
                        if (!Number.isFinite(numeric) || numeric < 0 || numeric >= scenes.length) {
                            issues.push("Choice timeoutNext invalid at " + (scene.id || index) + ":" + choiceIndex + " -> " + normalized);
                        }
                    }
                }
            });
        }

        if (Array.isArray(scene.characters)) {
            scene.characters.forEach(function (entry, entryIndex) {
                if (!entry || typeof entry !== "object") {
                    return;
                }
                const refId = typeof entry.characterId === "string"
                    ? entry.characterId.trim()
                    : (typeof entry.use === "string" ? entry.use.trim() : "");
                if (refId && !CHARACTER_DATA[refId]) {
                    issues.push("Unknown characterId '" + refId + "' at scene " + (scene.id || index) + ":" + entryIndex);
                    return;
                }
                const pose = typeof entry.pose === "string"
                    ? entry.pose.trim()
                    : (typeof entry.imageKey === "string" ? entry.imageKey.trim() : "");
                if (refId && pose) {
                    const base = CHARACTER_DATA[refId];
                    if (base && base.images && !Object.prototype.hasOwnProperty.call(base.images, pose)) {
                        issues.push("Unknown pose '" + pose + "' for " + refId + " at scene " + (scene.id || index));
                    }
                }
            });
        }
    });

    if (issues.length) {
        showToast(t("toast.validationIssues", { count: issues.length }));
        console.group("Story validation issues");
        issues.forEach(function (issue) { console.warn(issue); });
        console.groupEnd();
    } else {
        showToast(t("toast.validationOk"));
    }
}

function refreshStoryFromWindow() {
    const data = window.STORY || {};
    const newScenes = Array.isArray(data.scenes) ? data.scenes : [];
    scenes.length = 0;
    newScenes.forEach(function (scene) { scenes.push(scene); });

    OBSERVER_LINES = Array.isArray(data.observerLines) ? data.observerLines : [];
    START_SCENE_ID = data.startSceneId || START_SCENE_ID || "1";
    STORY_AUDIO = data.audio && typeof data.audio === "object" ? data.audio : {};
    buildSceneIdIndex();
}

function reloadStoryData() {
    if (!state.devMode) {
        return;
    }
    fetch("story.js?ts=" + nowMs(), { cache: "no-store" })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Failed to fetch story.js");
            }
            return response.text();
        })
        .then(function (text) {
            try {
                new Function(text)();
            } catch (error) {
                console.error(error);
                showToast(t("toast.storyExecuteFailed"));
                return;
            }
            refreshStoryFromWindow();
            const currentId = getSceneIdByIndex(state.sceneIndex);
            if (currentId && sceneIdToIndex.has(currentId)) {
                goToScene(currentId, { pushHistory: false });
            } else {
                goToScene(START_SCENE_ID, { pushHistory: false });
            }
            validateStoryData();
            showToast(t("toast.reloadOk"));
        })
        .catch(function () {
            showToast(t("toast.reloadFailed"));
        });
}

function loadImageForPreview(url) {
    return new Promise(function (resolve) {
        if (!url) {
            resolve(null);
            return;
        }
        const image = new Image();
        if (!IS_FILE_ORIGIN) {
            image.crossOrigin = "anonymous";
            image.referrerPolicy = "no-referrer";
        }
        image.onload = function () { resolve(image); };
        image.onerror = function () { resolve(null); };
        image.src = url;
    });
}

function drawCover(ctx, image, width, height) {
    if (!image) {
        return;
    }
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function getPositionOffsetX(position, stageWidth) {
    const map = {
        "far-left": -0.44,
        "left": -0.28,
        "center": 0,
        "right": 0.28,
        "far-right": 0.44
    };
    return (map[position] || 0) * stageWidth;
}

function getPreviewImageUrl(imageName) {
    const normalized = normalizeAssetName(imageName);
    if (!normalized) {
        return "";
    }
    const baseUrl = encodeURI("assets/" + normalized);
    const absoluteUrl = new URL(baseUrl, window.location.href).toString();
    const cacheKey = buildChromaCacheKey(absoluteUrl);
    if (chromaCache.has(cacheKey)) {
        return chromaCache.get(cacheKey);
    }
    return baseUrl;
}

function captureScenePreview(scene, characters) {
    if (!scene || IS_FILE_ORIGIN) {
        return Promise.resolve("");
    }
    const width = 320;
    const height = 180;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return Promise.resolve("");
    }

    const previewScale = width / BASE_STAGE_WIDTH;
    const bgName = normalizeAssetName(scene.backgroundImageName);
    const bgPromise = bgName
        ? loadImageForPreview(encodeURI("assets/" + bgName)).then(function (img) {
            drawCover(ctx, img, width, height);
        })
        : Promise.resolve();

    const draws = (Array.isArray(characters) ? characters : []).map(function (character) {
        if (!character || !character.imageName) {
            return Promise.resolve();
        }
        const url = getPreviewImageUrl(character.imageName);
        return loadImageForPreview(url).then(function (img) {
            if (!img) {
                return;
            }
            const fitScale = Math.min(1, (height * 0.9) / img.height);
            const charScale = Math.max(0.05, Math.abs(toNumber(character.scale, 1)));
            const finalScale = fitScale * charScale;
            const drawWidth = img.width * finalScale;
            const drawHeight = img.height * finalScale;
            const offsetX = toNumber(character.offsetX, 0) * previewScale;
            const offsetY = toNumber(character.offsetY, 0) * previewScale;

            let left = width / 2 + getPositionOffsetX(character.position, width);
            let bottom = offsetY;
            if (typeof character.x === "number") {
                left = character.x * width;
            }
            if (typeof character.y === "number") {
                bottom = character.y * height + offsetY;
            }
            const drawX = left - drawWidth / 2 + offsetX;
            const drawY = height - bottom - drawHeight;
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        });
    });

    return Promise.all([bgPromise].concat(draws))
        .then(function () {
            try {
                return canvas.toDataURL("image/jpeg", 0.72);
            } catch (error) {
                return "";
            }
        });
}

function normalizeSlotMeta(slot) {
    if (!state.slotMeta[slot]) {
        state.slotMeta[slot] = { anomaly: 0, note: "stable", writes: 0, preview: "", updatedAt: 0 };
    } else {
        const meta = state.slotMeta[slot];
        if (!Object.prototype.hasOwnProperty.call(meta, "preview")) {
            meta.preview = "";
        }
        if (!Object.prototype.hasOwnProperty.call(meta, "updatedAt")) {
            meta.updatedAt = 0;
        }
    }
    return state.slotMeta[slot];
}

function updateSlotPreview(slot, scene, characters) {
    if (!state.devMode) {
        return;
    }
    captureScenePreview(scene, characters).then(function (dataUrl) {
        const meta = normalizeSlotMeta(slot);
        if (dataUrl) {
            meta.preview = dataUrl;
        }
        meta.updatedAt = nowMs();
        persistSlotMeta();
        renderDevSavePanel();
    });
}

function saveAutosave(scene, characters) {
    if (!state.devMode) {
        return;
    }
    const payload = getSavePayload();
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    const meta = normalizeSlotMeta("autosave");
    meta.note = "autosave";
    updateSlotPreview("autosave", scene, characters);
}

function loadAutosave() {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) {
        showToast(t("toast.autosaveEmpty"));
        return;
    }
    const payload = parseJsonSafe(raw, null);
    if (!payload) {
        showToast(t("toast.autosaveParseFailed"));
        return;
    }
    applyLoadedPayload(payload);
    closePanels();
    if (payload.sceneId !== undefined) {
        goToScene(payload.sceneId, { pushHistory: false });
    } else {
        renderScene(clampSceneIndex(payload.sceneIndex));
    }
    showToast(t("toast.autosaveLoaded"));
}

function renderDevSavePanel() {
    if (!state.devMode || !ui.devSaveList) {
        return;
    }
    ui.devSaveList.innerHTML = "";

    function renderSlot(slotKey, label, allowSave) {
        const meta = normalizeSlotMeta(slotKey);
        const row = document.createElement("div");
        row.className = "dev-save-row";

        const preview = document.createElement("div");
        preview.className = "dev-save-preview";
        if (meta.preview) {
            const img = document.createElement("img");
            img.src = meta.preview;
            img.alt = label + " " + t("ui.noPreview");
            preview.appendChild(img);
        } else {
            preview.textContent = t("ui.noPreview");
        }

        const info = document.createElement("div");
        info.className = "dev-save-info";
        const title = document.createElement("div");
        title.className = "dev-save-title";
        title.textContent = label;
        const metaLine = document.createElement("div");
        metaLine.className = "dev-save-meta";
        if (meta.updatedAt) {
            metaLine.textContent = new Date(meta.updatedAt).toLocaleString();
        } else {
            metaLine.textContent = "—";
        }
        info.appendChild(title);
        info.appendChild(metaLine);

        const actions = document.createElement("div");
        actions.className = "dev-save-actions";
        if (allowSave) {
            const saveBtn = document.createElement("button");
            saveBtn.type = "button";
            saveBtn.className = "menu-btn mini-btn";
            saveBtn.textContent = t("ui.save");
            saveBtn.addEventListener("click", function () {
                saveProgress(slotKey);
            });
            actions.appendChild(saveBtn);
        }
        const loadBtn = document.createElement("button");
        loadBtn.type = "button";
        loadBtn.className = "menu-btn mini-btn";
        loadBtn.textContent = t("ui.load");
        loadBtn.addEventListener("click", function () {
            if (slotKey === "autosave") {
                loadAutosave();
            } else {
                loadProgress(slotKey);
            }
        });
        actions.appendChild(loadBtn);

        row.appendChild(preview);
        row.appendChild(info);
        row.appendChild(actions);
        ui.devSaveList.appendChild(row);
    }

    renderSlot(1, t("ui.slot", { id: 1 }), true);
    renderSlot(2, t("ui.slot", { id: 2 }), true);
    renderSlot(3, t("ui.slot", { id: 3 }), true);
    renderSlot("autosave", t("ui.autosave"), false);
}

function formatSlotTimestamp(timestamp) {
    if (!timestamp) {
        return "—";
    }
    try {
        return new Date(timestamp).toLocaleString();
    } catch (error) {
        return "—";
    }
}

function setSavePanelMode(mode) {
    const resolved = mode === "load" ? "load" : "save";
    state.savePanelMode = resolved;
    if (ui.savePanelTitle) {
        ui.savePanelTitle.textContent = resolved === "save" ? t("ui.saveTitle") : t("ui.loadTitle");
    }
    if (ui.saveModeBtn) {
        ui.saveModeBtn.classList.toggle("is-active", resolved === "save");
    }
    if (ui.loadModeBtn) {
        ui.loadModeBtn.classList.toggle("is-active", resolved === "load");
    }
    renderSavePanel();
}

function renderSavePanel() {
    if (!ui.saveList) {
        return;
    }
    ui.saveList.innerHTML = "";
    const mode = state.savePanelMode === "load" ? "load" : "save";

    function slotHasSave(slot) {
        const raw = readStorageWithFallback(getSlotStorageKey(slot), LEGACY_FALLBACK_KEYS["slot" + slot]);
        return Boolean(raw);
    }

    function renderSlot(slotKey, label) {
        const meta = normalizeSlotMeta(slotKey);
        const row = document.createElement("div");
        row.className = "save-row";

        const preview = document.createElement("div");
        preview.className = "save-preview";
        if (meta.preview) {
            const img = document.createElement("img");
            img.src = meta.preview;
            img.alt = label + " " + t("ui.noPreview");
            preview.appendChild(img);
        } else {
            preview.textContent = t("ui.noPreview");
        }

        const info = document.createElement("div");
        info.className = "dev-save-info";
        const title = document.createElement("div");
        title.className = "dev-save-title";
        title.textContent = label;
        const metaLine = document.createElement("div");
        metaLine.className = "save-meta";
        metaLine.textContent = formatSlotTimestamp(meta.updatedAt);
        info.appendChild(title);
        info.appendChild(metaLine);

        const actions = document.createElement("div");
        actions.className = "save-actions";
        const actionBtn = document.createElement("button");
        actionBtn.type = "button";
        actionBtn.className = "menu-btn mini-btn";
        const exists = slotHasSave(slotKey);
        if (mode === "save") {
            actionBtn.textContent = t("ui.save");
            actionBtn.addEventListener("click", function () {
                saveProgress(slotKey);
                renderSavePanel();
            });
        } else {
            actionBtn.textContent = t("ui.load");
            actionBtn.disabled = !exists;
            actionBtn.addEventListener("click", function () {
                if (!exists) {
                    return;
                }
                loadProgress(slotKey);
            });
        }
        actions.appendChild(actionBtn);

        row.appendChild(preview);
        row.appendChild(info);
        row.appendChild(actions);
        ui.saveList.appendChild(row);
    }

    renderSlot(1, t("ui.slot", { id: 1 }));
    renderSlot(2, t("ui.slot", { id: 2 }));
    renderSlot(3, t("ui.slot", { id: 3 }));
}

function ensureBgmElement() {
    if (state.bgm.element) {
        return state.bgm.element;
    }
    const element = new Audio();
    element.preload = "auto";
    element.loop = true;
    element.volume = 0;
    element.muted = state.muted;
    state.bgm.element = element;
    return element;
}

function setBgmVolume(volume, fadeMs) {
    state.bgm.volume = clampValue(toNumber(volume, 1), 0, 1);
    const element = ensureBgmElement();
    const target = state.muted ? 0 : state.bgm.volume;
    if (state.bgm.fadeTimer) {
        clearInterval(state.bgm.fadeTimer);
        state.bgm.fadeTimer = null;
    }
    if (!fadeMs || fadeMs <= 0) {
        element.volume = target;
        return;
    }
    const startVolume = element.volume;
    const startTime = nowMs();
    state.bgm.fadeTimer = setInterval(function () {
        const elapsed = nowMs() - startTime;
        const ratio = Math.min(1, elapsed / fadeMs);
        element.volume = startVolume + (target - startVolume) * ratio;
        if (ratio >= 1) {
            clearInterval(state.bgm.fadeTimer);
            state.bgm.fadeTimer = null;
        }
    }, 30);
}

function updateBgmVolume() {
    const base = clampValue(toNumber(state.bgm.baseVolume, 1), 0, 1);
    const target = base * getMusicVolumeFactor();
    setBgmVolume(target, 0);
}

function attemptPlayAudio(element) {
    if (!element) {
        return;
    }
    state.bgm.pendingPlay = false;
    try {
        const playPromise = element.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                state.bgm.pendingPlay = true;
            });
        }
    } catch (error) {
        state.bgm.pendingPlay = true;
    }
}

function playBgm(config) {
    const normalizedSrc = normalizeAudioName(config && config.src ? config.src : "");
    if (!normalizedSrc) {
        return;
    }
    const element = ensureBgmElement();
    const url = encodeURI("assets/" + normalizedSrc);
    const fadeMs = Math.max(0, toNumber(config.fadeMs, toNumber(STORY_AUDIO.musicFadeMs, 0)));
    const loop = config.loop !== false;
    const baseVolume = clampValue(toNumber(config.volume, 1), 0, 1);
    const volume = baseVolume * getMusicVolumeFactor();
    state.bgm.baseVolume = baseVolume;

    if (state.bgm.pauseResumeTimer) {
        clearTimeout(state.bgm.pauseResumeTimer);
        state.bgm.pauseResumeTimer = null;
    }

    if (state.bgm.src !== url) {
        if (fadeMs > 0 && !element.paused && state.bgm.src) {
            setBgmVolume(0, fadeMs);
            setTimeout(function () {
                element.src = url;
                element.loop = loop;
                state.bgm.src = url;
                attemptPlayAudio(element);
                element.currentTime = 0;
                element.volume = 0;
                setBgmVolume(volume, fadeMs);
            }, fadeMs);
        } else {
            element.src = url;
            element.loop = loop;
            state.bgm.src = url;
            element.currentTime = 0;
            attemptPlayAudio(element);
            setBgmVolume(volume, fadeMs);
        }
    } else {
        element.loop = loop;
        attemptPlayAudio(element);
        setBgmVolume(volume, fadeMs);
    }
}

function pauseBgm() {
    const element = state.bgm.element;
    if (!element) {
        return;
    }
    try {
        element.pause();
    } catch (error) {
        // ignore
    }
}

function resumeBgm() {
    const element = state.bgm.element;
    if (!element) {
        return;
    }
    attemptPlayAudio(element);
}

function stopBgm(fadeMs) {
    const element = state.bgm.element;
    if (!element) {
        return;
    }
    state.bgm.pendingPlay = false;
    if (fadeMs && fadeMs > 0) {
        setBgmVolume(0, fadeMs);
        setTimeout(function () {
            pauseBgm();
            element.currentTime = 0;
        }, fadeMs);
        return;
    }
    pauseBgm();
    element.currentTime = 0;
}

function applySceneMusic(scene) {
    const sceneAudio = scene && typeof scene.audio === "object" ? scene.audio : null;
    const musicDef = normalizeMusicDef((scene && scene.music) || (sceneAudio && sceneAudio.music));
    const defaultMusic = normalizeMusicDef(STORY_AUDIO.music);
    const modeDefault = typeof STORY_AUDIO.musicModeDefault === "string"
        ? STORY_AUDIO.musicModeDefault.trim().toLowerCase()
        : "carry";
    const mode = musicDef && musicDef.mode ? musicDef.mode : modeDefault;

    if (musicDef && musicDef.src) {
        playBgm(musicDef);
        return;
    }

    if (!state.bgm.src && defaultMusic && defaultMusic.src) {
        playBgm(defaultMusic);
        return;
    }

    if (mode === "stop") {
        stopBgm(toNumber(STORY_AUDIO.musicFadeMs, 0));
        return;
    }

    if (mode === "pause") {
        pauseBgm();
        if (state.bgm.pauseResumeTimer) {
            clearTimeout(state.bgm.pauseResumeTimer);
        }
        state.bgm.pauseResumeTimer = setTimeout(function () {
            state.bgm.pauseResumeTimer = null;
            resumeBgm();
        }, Math.max(0, toNumber(STORY_AUDIO.musicFadeMs, 200)));
        return;
    }
}

function applySettingsTab(tabId) {
    const buttons = ui.settingsTabButtons || [];
    const panels = ui.settingsTabPanels || [];
    if (!buttons.length || !panels.length) {
        return;
    }
    const resolved = tabId && String(tabId).trim() ? String(tabId).trim() : "text";
    buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.dataset.tab === resolved);
    });
    panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.dataset.tab === resolved);
    });
    state.settingsTab = resolved;
}

function updateSettingsUi() {
    ui.textSpeedInput.value = String(state.settings.textSpeedMs);
    ui.textSpeedValue.textContent = state.settings.textSpeedMs === 0 ? t("ui.instant") : String(state.settings.textSpeedMs);
    ui.textSizeInput.value = String(state.settings.textSizePx);
    ui.textSizeValue.textContent = String(state.settings.textSizePx);
    if (ui.textOpacityInput) {
        ui.textOpacityInput.value = String(state.settings.textOpacity);
    }
    if (ui.textOpacityValue) {
        ui.textOpacityValue.textContent = String(state.settings.textOpacity);
    }
    ui.autoDelayInput.value = String(state.settings.autoDelayMs);
    ui.autoDelayValue.textContent = String(state.settings.autoDelayMs);
    ui.distortionInput.value = String(state.settings.distortionIntensity);
    ui.distortionValue.textContent = String(state.settings.distortionIntensity);
    if (ui.languageSelect) {
        ui.languageSelect.value = state.language || DEFAULT_LANG;
    }
    if (ui.musicVolumeInput) {
        ui.musicVolumeInput.value = String(state.settings.musicVolume);
    }
    if (ui.musicVolumeValue) {
        ui.musicVolumeValue.textContent = String(state.settings.musicVolume);
    }
    if (ui.voiceVolumeInput) {
        ui.voiceVolumeInput.value = String(state.settings.voiceVolume);
    }
    if (ui.voiceVolumeValue) {
        ui.voiceVolumeValue.textContent = String(state.settings.voiceVolume);
    }
    if (ui.sfxVolumeInput) {
        ui.sfxVolumeInput.value = String(state.settings.sfxVolume);
    }
    if (ui.sfxVolumeValue) {
        ui.sfxVolumeValue.textContent = String(state.settings.sfxVolume);
    }
    if (ui.ambienceVolumeInput) {
        ui.ambienceVolumeInput.value = String(state.settings.ambienceVolume);
    }
    if (ui.ambienceVolumeValue) {
        ui.ambienceVolumeValue.textContent = String(state.settings.ambienceVolume);
    }

    ui.skipUnreadInput.checked = state.settings.skipUnread;
    ui.voiceBlipInput.checked = state.settings.voiceBlip;
    ui.pressureLayerInput.checked = state.settings.pressureLayer;
    ui.glitchTextInput.checked = state.settings.glitchText;
    ui.timedChoiceInput.checked = state.settings.timedChoices;
    ui.ambienceInput.checked = state.settings.ambience;

    ui.toggleMuteBtn.classList.toggle("is-attention", state.muted);
    ui.toggleMuteBtn.textContent = state.muted ? t("ui.unmute") : t("ui.mute");
    ui.toggleUiBtn.textContent = state.uiHidden ? t("ui.showUi") : t("ui.hideUi");

    applyTextSize();
    applyTextOpacity();
    applyAudioMix();
    applySettingsTab(state.settingsTab || "text");
}

function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("is-visible");
    clearTimeout(showToast.timerId);
    showToast.timerId = setTimeout(function () {
        ui.toast.classList.remove("is-visible");
    }, 1650);
}

function maybeWarnFileOrigin() {
    if (!IS_FILE_ORIGIN) {
        return;
    }
    if (localStorage.getItem(FILE_ORIGIN_NOTICE_KEY) === "1") {
        return;
    }
    localStorage.setItem(FILE_ORIGIN_NOTICE_KEY, "1");
    showToast(t("toast.chromaNotice"));
}

function markSceneRead(sceneIndex) {
    state.readScenes.add(sceneIndex);
    persistReadScenes();
}

function updateLabProgress(scene) {
    if (!scene || !scene.id) {
        return;
    }
    state.labProgress.modulesSeen[scene.id] = true;
    if (scene.checkpoint) {
        state.labProgress.checkpointsVisited[scene.id] = true;
    }
    persistLabProgress();
}

function renderScene(index) {
    const safeIndex = clampSceneIndex(index);
    const scene = scenes[safeIndex];

    if (!checkConditions(scene) && scene.fallbackNext !== undefined) {
        const fallback = resolveSceneTarget(scene.fallbackNext);
        if (fallback !== null) {
            goToScene(fallback, { pushHistory: false });
            return;
        }
    }

    state.sceneIndex = safeIndex;
    state.sceneWasReadBeforeRender = state.readScenes.has(safeIndex);
    state.sceneVisitCount[safeIndex] = Number(state.sceneVisitCount[safeIndex] || 0) + 1;
    clearPendingTyping();

    if (state.sceneVisitCount[safeIndex] > 1) {
        state.telemetry.revisitCount += 1;
    }

    clearAutoTimer();
    clearChoiceTimer();
    clearChoiceFxTimers();
    clearTimelineTimers();
    clearCharacterFrameTimers();
    clearTextFxTimers();
    hideScreenText();
    state.textFx = null;

    applySceneMutations(scene, safeIndex);

    const characters = resolveSceneCharacters(scene);
    const activeCharacterId = resolveActiveCharacterId(scene, characters);
    const speakerName = resolveSpeakerName(scene, characters, activeCharacterId);
    state.currentSpeaker = speakerName;
    applySpeakerFontClass(speakerName);
    state.lastRenderedCharacters = characters;

    const sceneTagLabel = resolveSceneLabel(scene, safeIndex);
    ui.sceneTag.textContent = sceneTagLabel;
    ui.speakerName.textContent = speakerName;
    const sceneVoiceDef = resolveSceneVoiceDefinition(scene);
    if (sceneVoiceDef.defined) {
        state.sceneVoice = sceneVoiceDef.value;
        state.voiceInitialized = true;
    } else if (!state.voiceInitialized) {
        state.sceneVoice = normalizeVoiceDef(STORY_AUDIO.voice);
        state.voiceInitialized = true;
    }
    state.voiceStartRandomize = Boolean(state.sceneVoice && state.sceneVoice.src);

    setBackground(scene.backgroundImageName);
    applySceneMusic(scene);
    setCharacters(scene, characters, activeCharacterId);
    applyEffects(scene.effects);
    scheduleTimeline(scene);
    if (state.devMode) {
        saveAutosave(scene, characters);
    }

    const renderedText = resolveSceneText(scene);
    const textFx = prepareTextFx(renderedText);
    const onDone = function () {
        markSceneRead(safeIndex);
        updateLabProgress(scene);
        appendLogEntry(scene, textFx.plainText, speakerName);
        renderChoices(scene);
        scheduleAutoAdvance(scene);
    };
    if (shouldDeferTypingForAudio(textFx)) {
        deferTyping(textFx, onDone);
    } else {
        typeText(textFx, onDone);
    }

    updatePressureState();
    renderCheckpointsPanel();
}

function goToScene(index, options) {
    const nextIndex = resolveSceneIndex(index);
    if (nextIndex === null) {
        showToast(t("toast.sceneNotFound"));
        return;
    }
    const shouldPushHistory = !options || options.pushHistory !== false;

    if (shouldPushHistory && state.sceneIndex >= 0 && state.sceneIndex !== nextIndex) {
        const currentId = getSceneIdByIndex(state.sceneIndex);
        const nextId = getSceneIdByIndex(nextIndex);
        if (currentId && currentId !== nextId) {
            state.sceneHistory.push(currentId);
        }
    }

    closePanels();
    renderScene(nextIndex);
}

function goBackScene() {
    if (!state.sceneHistory.length) {
        showToast(t("toast.noRollback"));
        return;
    }
    const previous = state.sceneHistory.pop();
    goToScene(previous, { pushHistory: false });
}

function continueScene() {
    if (state.activePanel) {
        return;
    }
    if (!ui.fakePromptPanel.hidden) {
        return;
    }
    if (state.waitingForAudio) {
        return;
    }

    const scene = scenes[state.sceneIndex];
    if (!scene) {
        return;
    }

    if (state.isTyping) {
        finishTyping();
        return;
    }

    if (Array.isArray(scene.choices) && scene.choices.length > 0) {
        return;
    }

    const nextIndex = resolveNext(scene.next);
    if (nextIndex !== null) {
        goToScene(nextIndex);
    }
}

function updateModeButtons() {
    ui.autoBtn.classList.toggle("is-active", state.autoMode);
    ui.autoBtn.textContent = state.autoMode ? t("ui.autoOn") : t("ui.auto");

    ui.skipBtn.classList.toggle("is-active", state.skipMode);
    ui.skipBtn.textContent = state.skipMode ? t("ui.skipOn") : t("ui.skip");

    ui.backBtn.classList.toggle("is-attention", state.sceneHistory.length > 0);

}

function toggleAuto(forceValue) {
    state.autoMode = typeof forceValue === "boolean" ? forceValue : !state.autoMode;
    updateModeButtons();
    showToast(state.autoMode ? t("toast.autoOn") : t("toast.autoOff"));
    scheduleAutoAdvance(scenes[state.sceneIndex] || {});
}

function toggleSkip(forceValue) {
    state.skipMode = typeof forceValue === "boolean" ? forceValue : !state.skipMode;
    updateModeButtons();
    showToast(state.skipMode ? t("toast.skipOn") : t("toast.skipOff"));
    scheduleAutoAdvance(scenes[state.sceneIndex] || {});
}

function toggleMute(forceValue) {
    state.muted = typeof forceValue === "boolean" ? forceValue : !state.muted;
    refreshAmbienceState();
    if (state.muted) {
        stopVoiceLoop();
        if (state.pendingTyping) {
            const pending = state.pendingTyping;
            clearPendingTyping();
            typeText(pending.textFx, pending.onDone);
        }
    }
    if (state.bgm.element) {
        state.bgm.element.muted = state.muted;
        setBgmVolume(state.bgm.volume, 0);
    }
    updateSettingsUi();
    showToast(state.muted ? t("toast.muted") : t("toast.unmuted"));
}

function toggleUI(forceValue) {
    state.uiHidden = typeof forceValue === "boolean" ? forceValue : !state.uiHidden;
    ui.root.classList.toggle("hide-ui", state.uiHidden);
    updateSettingsUi();
}

function resetSettings() {
    state.settings = { ...DEFAULT_SETTINGS };
    persistSettings();
    updateSettingsUi();
    refreshAmbienceState();
    updatePressureState();
    showToast(t("toast.settingsReset"));
}

function saveProgress(slot) {
    const saveSlot = clampValue(toNumber(slot, DEFAULT_SLOT), SAVE_SLOT_MIN, SAVE_SLOT_MAX);
    mutateSlotMetaOnSave(saveSlot);
    persistSlotMeta();

    state.telemetry.saveCount += 1;
    const payload = getSavePayload();
    localStorage.setItem(getSlotStorageKey(saveSlot), JSON.stringify(payload));

    const meta = normalizeSlotMeta(saveSlot);
    showToast(t("toast.savedSlot", { slot: saveSlot, anomaly: meta.anomaly, note: meta.note }));
    updatePressureState();
    persistTelemetry();
    const scene = scenes[state.sceneIndex];
    const characters = state.lastRenderedCharacters && state.lastRenderedCharacters.length
        ? state.lastRenderedCharacters
        : resolveSceneCharacters(scene || {});
    updateSlotPreview(saveSlot, scene, characters);
}

function loadProgress(slot) {
    const saveSlot = clampValue(toNumber(slot, DEFAULT_SLOT), SAVE_SLOT_MIN, SAVE_SLOT_MAX);
    const raw = readStorageWithFallback(getSlotStorageKey(saveSlot), LEGACY_FALLBACK_KEYS["slot" + saveSlot]);

    if (!raw) {
        showToast(t("toast.slotEmpty", { slot: saveSlot }));
        return;
    }

    const payload = parseJsonSafe(raw, null);
    if (!payload) {
        showToast(t("toast.saveParseFailed"));
        return;
    }

    state.telemetry.loadCount += 1;
    maybeWarnSlotAnomaly(saveSlot);

    applyLoadedPayload(payload);
    closePanels();
    if (payload.sceneId !== undefined) {
        goToScene(payload.sceneId, { pushHistory: false });
    } else {
        renderScene(clampSceneIndex(payload.sceneIndex));
    }
    showToast(t("toast.loadedSlot", { slot: saveSlot }));

    updatePressureState();
    persistTelemetry();
}

function selectChoiceByNumber(number) {
    const buttons = ui.choices.querySelectorAll(".choice-btn:not(.is-locked)");
    const button = buttons[number - 1];
    if (button) {
        button.click();
    }
}

function bindControlEvents() {
    ui.backBtn.addEventListener("click", function () {
        markUserActivity("click");
        goBackScene();
    });

    ui.autoBtn.addEventListener("click", function () {
        markUserActivity("click");
        toggleAuto();
    });

    ui.skipBtn.addEventListener("click", function () {
        markUserActivity("click");
        toggleSkip();
    });

    ui.saveBtn.addEventListener("click", function () {
        markUserActivity("click");
        openPanel("save");
    });

    ui.loadBtn.addEventListener("click", function () {
        markUserActivity("click");
        openPanel("load");
    });

    ui.settingsBtn.addEventListener("click", function () {
        markUserActivity("click");
        togglePanel("settings");
    });

    ui.closeSettingsBtn.addEventListener("click", function () {
        closePanels();
    });

    if (ui.closeSaveBtn) {
        ui.closeSaveBtn.addEventListener("click", function () {
            closePanels();
        });
    }

    if (ui.desktopCloseBtn) {
        ui.desktopCloseBtn.addEventListener("click", function () {
            closePanels();
        });
    }

    if (ui.desktopOpenFolderBtn) {
        ui.desktopOpenFolderBtn.addEventListener("click", function () {
            runSystemAction("files.openFolder");
        });
    }

    if (ui.fileViewerCloseBtn) {
        ui.fileViewerCloseBtn.addEventListener("click", function () {
            closePanels();
        });
    }

    if (ui.fileViewerOpenFolderBtn) {
        ui.fileViewerOpenFolderBtn.addEventListener("click", function () {
            runSystemAction("files.openFolder");
        });
    }

    if (ui.inputPanelCloseBtn) {
        ui.inputPanelCloseBtn.addEventListener("click", function () {
            finishInputPanel(false);
        });
    }

    if (ui.inputPanelCancelBtn) {
        ui.inputPanelCancelBtn.addEventListener("click", function () {
            finishInputPanel(false);
        });
    }

    if (ui.inputPanelSubmitBtn) {
        ui.inputPanelSubmitBtn.addEventListener("click", function () {
            finishInputPanel(true);
        });
    }

    if (ui.inputPanelField) {
        ui.inputPanelField.addEventListener("input", function () {
            updateInputPanelPreview();
        });
    }

    ui.closeLogBtn.addEventListener("click", function () {
        closePanels();
    });

    ui.closeCheckpointsBtn.addEventListener("click", function () {
        closePanels();
    });

    if (ui.closeDevBtn) {
        ui.closeDevBtn.addEventListener("click", function () {
            closePanels();
        });
    }

    ui.openLogBtn.addEventListener("click", function () {
        openPanel("log");
    });

    ui.openCheckpointsBtn.addEventListener("click", function () {
        openPanel("checkpoints");
    });

    if (ui.openDevBtn) {
        ui.openDevBtn.addEventListener("click", function () {
            openPanel("dev");
        });
    }

    if (ui.saveModeBtn) {
        ui.saveModeBtn.addEventListener("click", function () {
            setSavePanelMode("save");
        });
    }

    if (ui.loadModeBtn) {
        ui.loadModeBtn.addEventListener("click", function () {
            setSavePanelMode("load");
        });
    }

    ui.toggleMuteBtn.addEventListener("click", function () {
        toggleMute();
    });

    ui.toggleUiBtn.addEventListener("click", function () {
        toggleUI();
    });

    ui.restartBtn.addEventListener("click", function () {
        goToScene(START_SCENE_ID, { pushHistory: false });
        showToast(t("toast.labRestarted"));
    });

    ui.resetSettingsBtn.addEventListener("click", function () {
        resetSettings();
    });

    ui.fakePromptOkBtn.addEventListener("click", function () {
        const callback = state.prompt.onAcknowledge;
        hideFakePrompt();
        if (callback) {
            callback();
        }
    });

    ui.textSpeedInput.addEventListener("input", function () {
        state.settings.textSpeedMs = clampValue(toNumber(ui.textSpeedInput.value, TYPE_SPEED_MS), 0, 70);
        persistSettings();
        updateSettingsUi();
    });

    ui.textSizeInput.addEventListener("input", function () {
        state.settings.textSizePx = clampValue(toNumber(ui.textSizeInput.value, DEFAULT_SETTINGS.textSizePx), 12, 40);
        persistSettings();
        updateSettingsUi();
    });

    if (ui.textOpacityInput) {
        ui.textOpacityInput.addEventListener("input", function () {
            state.settings.textOpacity = clampValue(toNumber(ui.textOpacityInput.value, DEFAULT_SETTINGS.textOpacity), 10, 100);
            persistSettings();
            updateSettingsUi();
        });
    }

    ui.autoDelayInput.addEventListener("input", function () {
        state.settings.autoDelayMs = clampValue(toNumber(ui.autoDelayInput.value, AUTO_DELAY_MS), 300, 6000);
        persistSettings();
        updateSettingsUi();
    });

    ui.distortionInput.addEventListener("input", function () {
        state.settings.distortionIntensity = clampValue(toNumber(ui.distortionInput.value, 35), 0, 100);
        persistSettings();
        updateSettingsUi();
        updatePressureState();
    });

    if (ui.languageSelect) {
        ui.languageSelect.addEventListener("change", function () {
            const selected = normalizeLang(ui.languageSelect.value) || DEFAULT_LANG;
            if (selected === state.language) {
                return;
            }
            setLanguage(selected, true);
            renderScene(state.sceneIndex);
        });
    }

    if (ui.musicVolumeInput) {
        ui.musicVolumeInput.addEventListener("input", function () {
            state.settings.musicVolume = clampValue(toNumber(ui.musicVolumeInput.value, DEFAULT_SETTINGS.musicVolume), 0, 100);
            persistSettings();
            updateSettingsUi();
        });
    }

    if (ui.voiceVolumeInput) {
        ui.voiceVolumeInput.addEventListener("input", function () {
            state.settings.voiceVolume = clampValue(toNumber(ui.voiceVolumeInput.value, DEFAULT_SETTINGS.voiceVolume), 0, 100);
            persistSettings();
            updateSettingsUi();
        });
    }

    if (ui.sfxVolumeInput) {
        ui.sfxVolumeInput.addEventListener("input", function () {
            state.settings.sfxVolume = clampValue(toNumber(ui.sfxVolumeInput.value, DEFAULT_SETTINGS.sfxVolume), 0, 100);
            persistSettings();
            updateSettingsUi();
        });
    }

    if (ui.ambienceVolumeInput) {
        ui.ambienceVolumeInput.addEventListener("input", function () {
            state.settings.ambienceVolume = clampValue(toNumber(ui.ambienceVolumeInput.value, DEFAULT_SETTINGS.ambienceVolume), 0, 100);
            persistSettings();
            updateSettingsUi();
        });
    }

    ui.skipUnreadInput.addEventListener("change", function () {
        state.settings.skipUnread = Boolean(ui.skipUnreadInput.checked);
        persistSettings();
    });

    ui.voiceBlipInput.addEventListener("change", function () {
        state.settings.voiceBlip = Boolean(ui.voiceBlipInput.checked);
        persistSettings();
    });

    ui.pressureLayerInput.addEventListener("change", function () {
        state.settings.pressureLayer = Boolean(ui.pressureLayerInput.checked);
        persistSettings();
        updatePressureState();
    });

    ui.glitchTextInput.addEventListener("change", function () {
        state.settings.glitchText = Boolean(ui.glitchTextInput.checked);
        persistSettings();
    });

    ui.timedChoiceInput.addEventListener("change", function () {
        state.settings.timedChoices = Boolean(ui.timedChoiceInput.checked);
        persistSettings();
    });

    ui.ambienceInput.addEventListener("change", function () {
        state.settings.ambience = Boolean(ui.ambienceInput.checked);
        persistSettings();
        refreshAmbienceState();
    });

    if (ui.settingsTabButtons && ui.settingsTabButtons.length) {
        ui.settingsTabButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                applySettingsTab(button.dataset.tab);
            });
        });
    }
}

function bindGlobalInputEvents() {
    document.addEventListener("click", function (event) {
        unlockAudioFromGesture();
        markUserActivity("click");
        if (state.screenTextActive) {
            return;
        }

        const target = event.target;
        if (
            target.closest(".menu-btn") ||
            target.closest(".choice-btn") ||
            target.closest(".overlay-panel")
        ) {
            return;
        }
        if (maybeStartPendingTyping()) {
            return;
        }
        continueScene();
    });

    document.addEventListener("keydown", function (event) {
        unlockAudioFromGesture();
        markUserActivity("key");
        if (state.screenTextActive) {
            return;
        }
        const key = event.key.toLowerCase();
        const target = event.target;
        const isField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (isField) {
            if (event.key === "Escape" && state.activePanel) {
                closePanels();
            }
            return;
        }

        if ((event.key === "Enter" || event.key === " ") && maybeStartPendingTyping()) {
            event.preventDefault();
            return;
        }

        if (event.ctrlKey && /^[1-3]$/.test(key)) {
            event.preventDefault();
            saveProgress(Number(key));
            return;
        }

        if (event.altKey && /^[1-3]$/.test(key)) {
            event.preventDefault();
            loadProgress(Number(key));
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            continueScene();
            return;
        }

        if (state.devMode && event.key === "F1") {
            event.preventDefault();
            togglePanel("dev");
            return;
        }

        if (key === "h") {
            toggleUI();
            return;
        }
        if (key === "l") {
            togglePanel("log");
            return;
        }
        if (key === "m") {
            toggleMute();
            return;
        }
        if (key === "a") {
            toggleAuto();
            return;
        }
        if (key === "s") {
            toggleSkip();
            return;
        }
        if (key === "b") {
            goBackScene();
            return;
        }
        if (key === "o") {
            togglePanel("settings");
            return;
        }
        if (key === "c") {
            togglePanel("checkpoints");
            return;
        }

        if (event.key === "Escape") {
            if (!ui.fakePromptPanel.hidden) {
                hideFakePrompt();
                return;
            }

            if (state.activePanel) {
                closePanels();
                return;
            }

            if (state.uiHidden) {
                toggleUI(false);
            }
            return;
        }

        if (/^[1-9]$/.test(key)) {
            selectChoiceByNumber(Number(key));
        }
    });
}

function setFocusEyeVisible(visible) {
    if (!ui.focusEyeOverlay) {
        return;
    }
    const overlay = ui.focusEyeOverlay;
    const video = ui.focusEyeVideo;
    if (visible) {
        if (state.focusEyeHideTimer) {
            clearTimeout(state.focusEyeHideTimer);
            state.focusEyeHideTimer = null;
        }
        if (state.focusReturnTimer) {
            clearTimeout(state.focusReturnTimer);
            state.focusReturnTimer = null;
        }
        state.focusEyeActive = true;
        refreshCharactersForFocus();
        if (ui.root) {
            ui.root.style.setProperty("--focus-char-scale", "1");
            ui.root.style.setProperty("--focus-char-shift", "0px");
            ui.root.classList.remove("focus-return");
        }
        overlay.hidden = false;
        overlay.classList.add("is-active");
        if (video) {
            video.muted = true;
            try {
                if (video.readyState < 2) {
                    video.load();
                }
            } catch (error) {}
            try {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            } catch (error) {}
        }
        return;
    }

    if (state.focusEyeHideTimer) {
        clearTimeout(state.focusEyeHideTimer);
    }
    state.focusEyeHideTimer = setTimeout(function () {
        overlay.classList.remove("is-active");
        if (video) {
            try {
                video.pause();
            } catch (error) {}
        }
        setTimeout(function () {
            state.focusEyeActive = false;
            refreshCharactersForFocus();
        }, 200);
        setTimeout(function () {
            if (overlay && !overlay.classList.contains("is-active")) {
                overlay.hidden = true;
            }
        }, 260);
        state.focusEyeHideTimer = null;
    }, 500);
}

function refreshCharactersForFocus() {
    if (!ui.charactersLayer) {
        return;
    }
    if (state.sceneIndex < 0 || state.sceneIndex >= scenes.length) {
        return;
    }
    const scene = scenes[state.sceneIndex];
    if (!scene) {
        return;
    }
    clearCharacterFrameTimers();
    const characters = resolveSceneCharacters(scene);
    const activeId = resolveActiveCharacterId(scene, characters);
    setCharacters(scene, characters, activeId);
}

function triggerFocusReturnEffect() {
    if (!ui.root) {
        return;
    }
    if (state.focusReturnTimer) {
        clearTimeout(state.focusReturnTimer);
    }
    ui.root.classList.add("focus-return");
    ui.root.style.setProperty("--focus-char-scale", "1.28");
    ui.root.style.setProperty("--focus-char-shift", "28px");
    state.focusReturnTimer = setTimeout(function () {
        ui.root.style.setProperty("--focus-char-scale", "1");
        ui.root.style.setProperty("--focus-char-shift", "0px");
        state.focusReturnTimer = setTimeout(function () {
            ui.root.classList.remove("focus-return");
            state.focusReturnTimer = null;
        }, 700);
    }, 40);
}

function bindFocusEyeOverlay() {
    if (!ui.focusEyeOverlay) {
        return;
    }
    if (PREVIEW_MODE) {
        if (state.focusEyeHideTimer) {
            clearTimeout(state.focusEyeHideTimer);
            state.focusEyeHideTimer = null;
        }
        if (state.focusReturnTimer) {
            clearTimeout(state.focusReturnTimer);
            state.focusReturnTimer = null;
        }
        state.focusEyeActive = false;
        ui.focusEyeOverlay.classList.remove("is-active");
        ui.focusEyeOverlay.hidden = true;
        if (ui.root) {
            ui.root.style.setProperty("--focus-char-scale", "1");
            ui.root.style.setProperty("--focus-char-shift", "0px");
            ui.root.classList.remove("focus-return");
        }
        return;
    }
    let lastVisible = null;
    function update() {
        const shouldShow = document.hidden || !document.hasFocus();
        if (shouldShow === lastVisible) {
            return;
        }
        lastVisible = shouldShow;
        setFocusEyeVisible(shouldShow);
        if (!shouldShow) {
            if (state.focusReturnTimer) {
                clearTimeout(state.focusReturnTimer);
            }
            state.focusReturnTimer = setTimeout(function () {
                triggerFocusReturnEffect();
            }, 500);
        }
    }
    window.addEventListener("blur", update);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    update();
}

function initializeTelemetryLoop() {
    if (state.telemetryTimerId) {
        clearInterval(state.telemetryTimerId);
    }

    state.telemetry.lastTickAt = nowMs();
    state.telemetry.lastActivityAt = nowMs();

    state.telemetryTimerId = setInterval(function () {
        updateTelemetryTick();
        updatePressureState();
        persistTelemetry();
    }, 1000);
}

async function initializeApp() {
    loadSettings();
    applyAmbienceDefaultOffMigration();
    loadReadScenes();
    loadTelemetry();
    loadLabProgress();
    loadSlotMeta();

    await ensureLanguageSelected(true);

    updateSettingsUi();
    updateModeButtons();
    renderLogPanel();
    renderCheckpointsPanel();
    updateTelemetrySummary();
    refreshAmbienceState();

    bindControlEvents();
    bindGlobalInputEvents();
    bindResizeEvents();
    bindFocusEyeOverlay();
    initializeTelemetryLoop();
    maybeWarnFileOrigin();

    await Promise.all([checkDevKey(), loadMetaState()]);

    if (typeof window !== "undefined" && window.PlayerName && typeof window.PlayerName.resolve === "function") {
        try {
            const info = await window.PlayerName.resolve({ preferInput: true, meta: state.meta });
            if (info && typeof info === "object") {
                state.meta = {
                    ...state.meta,
                    playerNameInput: info.inputName || "",
                    playerNameResolved: info.resolvedName || "",
                    playerNameSource: info.source || ""
                };
                persistMetaState();
            }
        } catch (err) {
            // ignore
        }
    }

    updateStageScale();
    toggleUI(false);
    const startId = resolveMetaStartSceneId(state.meta);
    goToScene(startId, { pushHistory: false });
    scheduleChromaPrewarm();
}

initializeApp();

