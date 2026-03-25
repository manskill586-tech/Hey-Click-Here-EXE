const CHARACTERS = {
    flavy: {
        name: { ru: "Оферус", en: "Oferus" },
        defaultX: 0.78,
        defaultY: -0.1,
        size: 0.7,
        defaultPose: "joy_greet",
        images: {
            grump_greet: { src: "Флафи недовольство приветствие.jpg" },
            grump_idle: { src: "Флафи недовольство бездействие.jpg" },
            joy_greet: { src: "Флафи радость приветствие.jpg" },
            joy_idle: { src: "Флафи радость бездействие.jpg" },
            happy_greet: { src: "Флафи счастье приветствие.jpg" },
            happy_idle: { src: "Флафи счастье бездействие.jpg" },
            warm_smile: { src: "Флафи тёплая улыбка.jpg" },
            thinking: { src: "Флафи задумалась.jpg" },
            tired: { src: "Флафи усталость.jpg" },
            horror: {
                src: "Флафи хоррор.jpg",
                overlayVideo: {
                    src: "eye.mp4",
                    x: 0.46,
                    y: 0.51,
                    width: 0.31,
                    height: 0.10,
                    opacity: 0.9,
                    scale: 0.3,
                    anchor: "center"
                }
            },
            evil: { src: "Флафи раздражение.jpg" },
            awkward: { src: "Флафи неловкость.jpg" },
            embarrassed: { src: "Флафи конфуз.jpg" },
            neutral: { src: "Флафи нейтральность.jpg" },
            sad: { src: "Флафи грусть.jpg" },
            sad_very: { src: "Флафи сильная грусть.jpg" }
        }
    },
    Heidi: {
        name: { ru: "Хайди", en: "Heidi" },
        defaultX: 0.22,
        defaultY: -0.1,
        size: 0.7,
        defaultPose: "horror",
        images: {
            horror: { src: "Раккуни.jpg" },
        }
    },
    Player: {
        name: { ru: "Ты", en: "You" },
        defaultX: 0.5,
        defaultY: 0,
        size: 0.7,
        defaultPose: "neutral",
    }
};

window.CHARACTERS = CHARACTERS;
