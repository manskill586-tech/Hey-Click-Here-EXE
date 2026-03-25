(() => {

const OBSERVER_LINES = [];


const SCENES = [
    {
        id: "1",
        label: "DAY1-01",
        speaker: "Оферус",
        text: "О, привееет!",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "warm_smile" }
        ],
        activeCharacter: "flavy",
        next: "2"
    },
    {
        id: "2",
        label: "DAY1-02",
        speaker: "Оферус",
        text: "Меня зовут Оферус. Я помощница от Flavortown, ты что-то хотел?",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "warm_smile" }
        ],
        choices: [
            { text: "Мне нужна помощь", next: "3.1" },
            { text: "Хочу узнать о тебе", next: "3.2" }
        ],
        activeCharacter: "flavy"
    },
    {
        id: "3.1",
        label: "DAY1-03",
        speaker: "Оферус",
        text: "Конечно, я всегда готова помочь! Что ты хочешь?",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "warm_smile" }
        ],
        choices: [
            { text: "Я хочу сделать свою игру", next: "3.1.1" },
            { text: "Мне скучно", next: "3.1.2" }
        ],
        activeCharacter: "flavy"
    },
    {
        id: "3.1.1",
        label: "DAY1-03-1",
        speaker: "Оферус",
        text: "Оу...",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "grump_idle" }
        ],
        music: {
            src: "none",
            volume: 0.45,
            loop: true
        },
        activeCharacter: "flavy",
        next: "3.1.3"
    },
    {
        id: "3.1.3",
        label: "DAY1-03-2",
        speaker: "Оферус",
        text: "Ну ладно, приступим! Что тебе именно нужно?",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "joy_idle" }
        ],
        choices: [
            { text: "Хочу сделать свою ОС", next: "3.1.1" },
            { text: "Что это была за пауза?", next: "3.1.2" }
        ],
        activeCharacter: "flavy"
    },
    {
        id: "3.1.2",
        label: "DAY1-03-2",
        speaker: "Оферус",
        text: "Эх, понимаю тебя. Мне тоже бывает тут скучно",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "awkward" }
        ],
        activeCharacter: "flavy",
        next: "3.2"
    },
    {
        id: "3.2",
        label: "DAY1-04",
        speaker: "Оферус",
        text: "Я - Оферус. Люблю помогать людям и быть рядом, когда им плохо. Я всегда стараюсь поддержать своих друзей и сделать их день лучше.",
        backgroundImageName: "morning.png",
        characters: [
            { characterId: "flavy", position: "center", pose: "warm_smile" }
        ],
        activeCharacter: "flavy",
        next: null
    }
];

window.STORY = {
    startSceneId: "1",
    observerLines: OBSERVER_LINES,
    audio: {
        voice: "voice.wav",
        music: {
            src: "фоновая музыка обычная.mp3",
            volume: 0.45,
            loop: true
        },
        musicModeDefault: "carry",
        musicFadeMs: 400
    },
    scenes: SCENES
};
})();
