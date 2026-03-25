(() => {
    const STORAGE_INPUT = "player_name_input";
    const STORAGE_RESOLVED = "player_name_resolved";
    const STORAGE_SOURCE = "player_name_source";
    const FALLBACK_NAME = { ru: "Друг", en: "Friend" };
    const BLACKLIST = ["admin", "user", "guest", "test", "player", "username", "pc", "desktop"];
    const cache = {
        inputName: "",
        resolvedName: "",
        source: ""
    };

    function normalizeName(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function normalizeLang(value) {
        const raw = String(value || "").trim().toLowerCase();
        if (!raw) return "";
        if (raw.startsWith("ru")) return "ru";
        if (raw.startsWith("en")) return "en";
        if (raw === "ru" || raw === "en") return raw;
        return "";
    }

    function detectLang() {
        try {
            const stored = localStorage.getItem("preview_flavortown_lang") || localStorage.getItem("flavortown_lang");
            const normalized = normalizeLang(stored);
            if (normalized) return normalized;
        } catch (err) {
            // ignore
        }
        const nav = (navigator && (navigator.languages && navigator.languages[0] || navigator.language)) || "";
        return normalizeLang(nav) || "ru";
    }

    function resolveLocalizedValue(value, lang) {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value;
        if (typeof value === "number" || typeof value === "boolean") return String(value);
        if (typeof value === "object") {
            if (value[lang] !== undefined) return String(value[lang]);
            if (value.ru !== undefined) return String(value.ru);
            if (value.en !== undefined) return String(value.en);
        }
        return String(value);
    }

    function isNameLike(name) {
        const normalized = normalizeName(name);
        if (normalized.length < 2 || normalized.length > 24) {
            return false;
        }
        if (/[_0-9]/.test(normalized)) {
            return false;
        }
        if (/[^A-Za-zА-Яа-яЁё\s\-']/.test(normalized)) {
            return false;
        }
        const lowered = normalized.toLowerCase();
        for (const word of BLACKLIST) {
            if (lowered.includes(word)) {
                return false;
            }
        }
        return true;
    }

    function scoreName(name) {
        const normalized = normalizeName(name);
        const words = normalized.split(" ").filter(Boolean);
        let score = 0;
        if (words.length === 2) {
            score += 2;
        }
        words.forEach((word) => {
            const first = word.charAt(0);
            if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
                score += 1;
            }
        });
        score += Math.min(2, Math.max(0, normalized.length / 12));
        return score;
    }

    function filterCandidates(candidates) {
        const list = Array.isArray(candidates) ? candidates : [];
        return list
            .map((item) => normalizeName(item))
            .filter((item) => item && isNameLike(item))
            .map((item) => ({ name: item, score: scoreName(item) }));
    }

    function pickBest(candidates) {
        if (!candidates.length) {
            return "";
        }
        candidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.name.length - a.name.length;
        });
        return candidates[0].name;
    }

    function readLocal(key) {
        try {
            return localStorage.getItem(key) || "";
        } catch (err) {
            return "";
        }
    }

    function writeLocal(key, value) {
        try {
            if (value === undefined || value === null || value === "") {
                localStorage.removeItem(key);
                return;
            }
            localStorage.setItem(key, String(value));
        } catch (err) {
            // ignore
        }
    }

    async function readMeta() {
        try {
            if (window.system && window.system.meta && typeof window.system.meta.get === "function") {
                const meta = await window.system.meta.get();
                return meta && typeof meta === "object" ? meta : {};
            }
        } catch (err) {
            // ignore
        }
        return {};
    }

    async function writeMeta(patch) {
        if (!patch || typeof patch !== "object") {
            return;
        }
        try {
            if (window.system && window.system.meta && typeof window.system.meta.set === "function") {
                await window.system.meta.set(patch);
            }
        } catch (err) {
            // ignore
        }
    }

    async function detectSystemCandidates() {
        try {
            if (window.system && window.system.user && typeof window.system.user.getProfile === "function") {
                const result = await window.system.user.getProfile();
                if (Array.isArray(result)) {
                    return result;
                }
            }
        } catch (err) {
            // ignore
        }
        return [];
    }

    function getFallbackName() {
        const fromStory = window.STORY && window.STORY.audio && window.STORY.audio.playerNameFallback;
        const lang = detectLang();
        const localized = resolveLocalizedValue(fromStory || FALLBACK_NAME, lang);
        return normalizeName(localized) || normalizeName(resolveLocalizedValue(FALLBACK_NAME, lang));
    }

    function loadCached() {
        cache.inputName = normalizeName(readLocal(STORAGE_INPUT));
        cache.resolvedName = normalizeName(readLocal(STORAGE_RESOLVED));
        cache.source = readLocal(STORAGE_SOURCE) || "";
        return { ...cache };
    }

    async function resolve(options) {
        const config = options && typeof options === "object" ? options : {};
        const preferInput = config.preferInput !== false;
        const cached = loadCached();
        const meta = config.meta && typeof config.meta === "object" ? config.meta : await readMeta();

        const inputName = normalizeName(meta.playerNameInput || cached.inputName);
        const storedResolved = normalizeName(meta.playerNameResolved || cached.resolvedName);
        const storedSource = meta.playerNameSource || cached.source || "";

        let resolvedName = "";
        let source = "";

        if (preferInput && isNameLike(inputName)) {
            resolvedName = inputName;
            source = "input";
        } else if (isNameLike(storedResolved)) {
            resolvedName = storedResolved;
            source = storedSource || "cached";
        } else {
            const candidates = await detectSystemCandidates();
            const filtered = filterCandidates(candidates);
            resolvedName = pickBest(filtered);
            source = resolvedName ? "system" : "fallback";
        }

        if (!resolvedName) {
            resolvedName = getFallbackName();
            source = source || "fallback";
        }

        cache.inputName = inputName;
        cache.resolvedName = resolvedName;
        cache.source = source;

        writeLocal(STORAGE_INPUT, inputName);
        writeLocal(STORAGE_RESOLVED, resolvedName);
        writeLocal(STORAGE_SOURCE, source);
        await writeMeta({
            playerNameInput: inputName,
            playerNameResolved: resolvedName,
            playerNameSource: source
        });

        return { inputName, resolvedName, source };
    }

    async function saveInputName(name) {
        const cleaned = normalizeName(name);
        writeLocal(STORAGE_INPUT, cleaned);
        cache.inputName = cleaned;
        return resolve({ preferInput: true });
    }

    function getName(tag) {
        const key = String(tag || "").toLowerCase();
        if (key === "playerinput") {
            if (isNameLike(cache.inputName)) {
                return cache.inputName;
            }
            return cache.resolvedName || getFallbackName();
        }
        return cache.resolvedName || getFallbackName();
    }

    function replaceTags(text) {
        const source = String(text || "");
        return source.replace(/\[(playername|playerinput)\]/gi, function (match, tag) {
            return getName(tag);
        });
    }

    function previewInput(value) {
        const cleaned = normalizeName(value);
        if (isNameLike(cleaned)) {
            return cleaned;
        }
        return cleaned;
    }

    window.PlayerName = {
        loadCached,
        resolve,
        detectSystemCandidates,
        filterCandidates,
        pickBest,
        isNameLike,
        saveInputName,
        getName,
        replaceTags,
        previewInput,
        getFallbackName
    };
})();
