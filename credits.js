const overlay = document.getElementById("startOverlay");
const audio = document.getElementById("creditsAudio");
const body = document.body;
const chatMessages = Array.from(document.querySelectorAll(".chat-message"));
const chatWindow = document.getElementById("chatWindow");
const chatTyping = document.getElementById("chatTyping");
const chatTypingName = chatTyping ? chatTyping.querySelector(".chat-typing-name") : null;
const chatEnd = document.getElementById("chatEnd");
const chatClear = document.getElementById("chatClear");
const chatFinalOverlay = document.getElementById("chatFinalOverlay");
const chatFinalText = document.getElementById("chatFinalText");
const slideshowImage = document.getElementById("slideshowImage");
const finalLineMoving = document.getElementById("finalLineMoving");
const finalLinePinned = document.getElementById("finalLinePinned");

const TEXT_SIZES = {
    startTitle: "26px",
    startSubtitle: "16px",
    sectionTitle: "12px",
    creditsTitle: "clamp(22px, 2.4vw, 30px)",
    creditsText: "clamp(15px, 1.4vw, 18px)",
    creditsFinal: "clamp(16px, 1.6vw, 20px)",
    chatTyping: "12px",
    chatName: "12px",
    chatBubble: "clamp(15px, 1.5vw, 18px)",
    chatMeta: "11px",
    chatEnd: "14px",
    chatFinal: "clamp(16px, 1.7vw, 20px)"
};

function normalizeSize(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "number") return `${value}px`;
    return String(value);
}

function applyTextSizes() {
    const root = document.documentElement;
    const map = {
        "--credits-start-title-size": TEXT_SIZES.startTitle,
        "--credits-start-subtitle-size": TEXT_SIZES.startSubtitle,
        "--credits-section-title-size": TEXT_SIZES.sectionTitle,
        "--credits-title-size": TEXT_SIZES.creditsTitle,
        "--credits-text-size": TEXT_SIZES.creditsText,
        "--credits-final-size": TEXT_SIZES.creditsFinal,
        "--credits-chat-typing-size": TEXT_SIZES.chatTyping,
        "--credits-chat-name-size": TEXT_SIZES.chatName,
        "--credits-chat-bubble-size": TEXT_SIZES.chatBubble,
        "--credits-chat-meta-size": TEXT_SIZES.chatMeta,
        "--credits-chat-end-size": TEXT_SIZES.chatEnd,
        "--credits-chat-final-size": TEXT_SIZES.chatFinal
    };
    Object.entries(map).forEach(([key, value]) => {
        root.style.setProperty(key, normalizeSize(value, ""));
    });
}

applyTextSizes();

const playerNameReady = (window.PlayerName && typeof window.PlayerName.resolve === "function")
    ? window.PlayerName.resolve({ preferInput: true })
    : Promise.resolve();
let creditsStarted = false;

function replacePlayerTagsInCredits() {
    if (!window.PlayerName || typeof window.PlayerName.replaceTags !== "function") {
        return;
    }
    const replaceTags = window.PlayerName.replaceTags;
    const nodes = document.querySelectorAll(
        ".chat-bubble, .chat-name, .credits-track h1, .credits-track p, .final-line, " +
        ".credits-final, .section-title, .start-title, .start-subtitle, .chat-end-line, " +
        ".chat-final-text"
    );
    nodes.forEach((node) => {
        if (!node || !node.textContent) {
            return;
        }
        node.textContent = replaceTags(node.textContent);
    });
}

const slides = [
    "assets/Памятное фото 1.jpg"
];

const musicPlaylist = [
    "assets/Музыка для титров.mp3",
    "assets/Музыка для титров 2.mp3"
];
let musicIndex = 0;
let crossfadeStarted = false;
let finalMessageText = "";

function isNearBottom(container, threshold) {
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distance <= threshold;
}

function revealMessage(message) {
    if (!message || message.classList.contains("is-visible")) {
        return;
    }
    const shouldStick = chatWindow ? isNearBottom(chatWindow, 80) : false;
    message.classList.add("is-visible");
    if (chatWindow && shouldStick) {
        requestAnimationFrame(() => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    }
}

function getTypingDelay(text) {
    const length = Math.max(1, text.length);
    const base = Math.min(2.6, Math.max(0.55, length / 28));
    const jitter = 0.15 + Math.random() * 0.35;
    return base + jitter;
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function resolveReadState(value) {
    const raw = String(value || "").toLowerCase();
    if (!raw) {
        return "read";
    }
    if (raw === "unread" || raw === "sent") {
        return "sent";
    }
    if (raw === "none" || raw === "hidden") {
        return "hidden";
    }
    return "read";
}

function ensureMeta(message, timeText, readState, edited) {
    if (message.querySelector(".chat-meta")) {
        return;
    }
    const meta = document.createElement("div");
    meta.className = "chat-meta";

    const time = document.createElement("span");
    time.className = "chat-time";
    time.textContent = timeText;
    meta.appendChild(time);

    if (edited) {
        const editedTag = document.createElement("span");
        editedTag.className = "chat-edited";
        editedTag.textContent = "��������";
        meta.appendChild(editedTag);
    }

    const status = document.createElement("span");
    status.className = "chat-status";

    const state = resolveReadState(readState);
    if (state === "hidden" || message.classList.contains("service") || message.classList.contains("from-rakkuni")) {
        status.classList.add("hidden");
    } else if (state === "sent") {
        status.classList.add("sent");
    } else {
        status.classList.add("read");
    }

    meta.appendChild(status);
    message.appendChild(meta);
}

function scheduleMessages() {
    let timeline = 0;
    const baseMinutes = 21 * 60 + 34;
    let lastRevealAt = 0;

    chatMessages.forEach((message) => {
        const bubble = message.querySelector(".chat-bubble");
        const text = bubble ? bubble.textContent.trim() : "";
        if (message.dataset.final === "true") {
            finalMessageText = text;
            return;
        }
        const extra = Number(message.dataset.delay || 0);
        const typing = getTypingDelay(text);
        const pause = 0.25 + Math.random() * 0.45;
        timeline += typing + pause + extra * 0.05;

        const timeStamp = formatTime(baseMinutes + Math.floor(timeline / 60));
        const readState = message.dataset.read;
        const edited = message.dataset.edited === "true";
        ensureMeta(message, timeStamp, readState, edited);

        const sender = message.querySelector(".chat-name");
        const senderName = sender ? sender.textContent.trim() : "";
        const isService = message.classList.contains("service");
        const revealAt = timeline * 1000;
        if (revealAt > lastRevealAt) {
            lastRevealAt = revealAt;
        }
        const typingStart = Math.max(0, revealAt - typing * 1000);
        if (!isService && chatTyping && chatTypingName && senderName) {
            setTimeout(() => {
                chatTypingName.textContent = senderName;
                chatTyping.classList.add("is-visible");
            }, typingStart);
            setTimeout(() => {
                chatTyping.classList.remove("is-visible");
            }, revealAt);
        }

        setTimeout(() => revealMessage(message), revealAt);
    });

    return lastRevealAt;
}

function startSlideshow() {
    if (!slideshowImage || slides.length <= 1) {
        return;
    }
    let index = 0;
    setInterval(() => {
        index = (index + 1) % slides.length;
        slideshowImage.style.opacity = "0";
        setTimeout(() => {
            slideshowImage.src = slides[index];
            slideshowImage.style.opacity = "1";
        }, 500);
    }, 6000);
}

function startFinalLineWatcher() {
    if (!finalLineMoving || !finalLinePinned) {
        return;
    }
    let pinned = false;
    const tick = () => {
        if (pinned) {
            return;
        }
        const movingRect = finalLineMoving.getBoundingClientRect();
        const windowRect = finalLineMoving.closest(".credits-window")?.getBoundingClientRect();
        if (!windowRect) {
            return;
        }
        const targetTop = windowRect.top + windowRect.height / 2 - movingRect.height / 2;
        if (movingRect.top <= targetTop) {
            pinned = true;
            finalLineMoving.classList.add("is-hidden");
            finalLinePinned.classList.add("is-visible");
            return;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function startMusic() {
    if (!audio) {
        return;
    }
    musicIndex = 0;
    crossfadeStarted = false;
    audio.src = musicPlaylist[musicIndex];
    audio.currentTime = 0;
    audio.play().catch(() => {});
    audio.onended = () => {
        if (crossfadeStarted) {
            return;
        }
        musicIndex += 1;
        if (musicIndex < musicPlaylist.length) {
            audio.src = musicPlaylist[musicIndex];
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    };
}

function crossfadeToSecondTrack(durationMs) {
    if (!audio || musicPlaylist.length < 2) {
        return;
    }
    crossfadeStarted = true;
    audio.onended = null;
    const next = new Audio(musicPlaylist[1]);
    next.volume = 0;
    next.play().catch(() => {});
    const start = performance.now();
    const fromVolume = audio.volume !== undefined ? audio.volume : 1;

    const step = (now) => {
        const progress = Math.min(1, (now - start) / durationMs);
        audio.volume = fromVolume * (1 - progress);
        next.volume = progress;
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            audio.pause();
            audio.src = musicPlaylist[1];
            audio.currentTime = next.currentTime;
            audio.volume = 1;
            next.pause();
        }
    };
    requestAnimationFrame(step);
}

function startClearSequence(delayMs) {
    if (!chatWindow) {
        return;
    }
    const baseDelay = Math.max(0, delayMs || 0);
    const jitterBase = 80;
    const finalMessages = chatMessages.filter((message) => message.dataset.final === "true");
    const clearMessages = chatMessages.filter((message) => message.dataset.final !== "true");
    const noticeDuration = 1300;
    const crossfadeDuration = 1300;

    if (chatTyping) {
        chatTyping.classList.add("is-hidden");
    }

    setTimeout(() => {
        finalMessages.forEach((message) => {
            message.classList.add("is-final-hidden");
        });
        clearMessages.forEach((message, index) => {
            const delay = index * 60 + Math.random() * jitterBase;
            setTimeout(() => {
                message.classList.add("is-visible");
                message.classList.add("is-clearing");
            }, delay);
        });
    }, baseDelay);

    const total = baseDelay + clearMessages.length * 60 + jitterBase + 800;
    if (chatEnd) {
        setTimeout(() => {
            chatEnd.classList.add("is-visible");
            if (chatClear) {
                chatClear.classList.add("is-visible");
            }
        }, total);
        setTimeout(() => {
            chatEnd.classList.remove("is-visible");
            if (chatWindow) {
                chatWindow.classList.add("chat-hidden");
            }
            if (chatTyping) {
                chatTyping.classList.add("chat-hidden");
            }
            finalMessages.forEach((message) => {
                message.classList.add("is-final-hidden");
            });
            if (chatFinalOverlay && chatFinalText) {
                chatFinalText.textContent = finalMessageText || "";
                chatFinalOverlay.classList.add("is-visible");
            }
            crossfadeToSecondTrack(crossfadeDuration);
        }, total + noticeDuration);
    }
}

function startCredits() {
    if (creditsStarted) {
        return;
    }
    creditsStarted = true;
    playerNameReady.then(() => {
        replacePlayerTagsInCredits();
        body.classList.add("is-running");
        const lastRevealAt = scheduleMessages();
        startSlideshow();
        startFinalLineWatcher();
        startMusic();
        startClearSequence(lastRevealAt + 2500);
    });
}

if (overlay) {
    overlay.addEventListener("click", startCredits);
    overlay.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            startCredits();
        }
    });
}




