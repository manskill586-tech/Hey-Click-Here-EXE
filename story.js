(() => {

const OBSERVER_LINES = [];


const SCENES = [
    {
        id: "1",
        label: "DAY1",
        speaker: "Оферус",
        text: "О, привееет!",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "joy_greet"
            }
        ],
        activeCharacter: "flavy",
        next: "2",
        cmd: {
            enabled: true,
            source: "inline",
            startAt: 0
        }
    },
    {
        id: "2",
        label: "DAY1",
        speaker: "Оферус",
        text: "Меня зовут Оферус. Я помощница от Flavortown, ты что-то хотел?",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "warm_smile"
            }
        ],
        choices: [
            {
                next: "3.1",
                text: "Хочу сделать свою игру"
            },
            {
                text: "Хочу узнать о тебе",
                next: "3.2"
            }
        ],
        activeCharacter: "flavy"
    },
    {
        id: "3.1",
        label: "DAY1",
        speaker: "Оферус",
        text: "Оу...",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "grump_idle"
            }
        ],
        activeCharacter: "flavy",
        next: "4"
    },
    {
        id: "4",
        label: "DAY1",
        speaker: "Оферус",
        text: "Ну ладно, приступим! Что тебе именно нужно?",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "joy_idle"
            }
        ],
        music: {
            src: "none",
            volume: 0.45,
            loop: true
        },
        activeCharacter: "flavy",
        choices: [
            {
                text: "Что это была за пауза?",
                next: "4.1"
            },
            {
                next: "4.2",
                text: "Мне скучно"
            }
        ]
    },
    {
        id: "4.1",
        label: "DAY1",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "awkward"
            }
        ],
        activeCharacter: "flavy",
        text: "Да не обращай внимания, я просто немного устала.",
        next: "5"
    },
    {
        label: "DAY1",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "neutral",
                position: "center"
            }
        ],
        choices: [
            {
                next: "6.1",
                text: "Хочу сделать свою игру"
            },
            {
                next: "6.2",
                text: "Какой твой любимый цвет?"
            }
        ],
        text: "Лучше поговорим о том что тебе нужно.",
        activeCharacter: "flavy",
        id: "5"
    },
    {
        id: "4.2",
        label: "DAY1",
        speaker: "Оферус",
        text: "Эх, понимаю тебя. Мне тоже бывает тут скучно.",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "warm_smile"
            }
        ],
        activeCharacter: "flavy",
        next: "5"
    },
    {
        label: "DAY1",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "joy_idle",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "6.1",
        next: "10",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Вы можете создавать что угодно — программное или аппаратное обеспечение (или и то, и другое) — при условии, что сможете отслеживать это с помощью Hackatime, нашего собственного программного обеспечения для отслеживания времени, затраченного на взлом!"
    },
    {
        label: "DAY1",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "awkward",
                position: "center"
            }
        ],
        choices: [
            {
                text: "Просто хотел узнать о тебе по больше",
                next: "6"
            },
            {
                next: "7",
                text: "Это очень важно"
            }
        ],
        activeCharacter: "flavy",
        id: "6.2",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Ась? Цвет?? А тебе зачем?"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "thinking",
                position: "center"
            }
        ],
        text: "Странно...",
        activeCharacter: "flavy",
        id: "6",
        next: "8",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: ""
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "embarrassed",
                position: "center"
            }
        ],
        text: "Воу! Это доаольно странно...",
        activeCharacter: "flavy",
        id: "7",
        next: "8",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: ""
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "neutral",
                position: "center"
            }
        ],
        text: "Ну ладно, мой любимый цвет зелёный!",
        activeCharacter: "flavy",
        id: "8",
        next: "9",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: ""
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "neutral",
                position: "center"
            }
        ],
        choices: [
            {
                next: "10.1",
                text: "11111111"
            },
            {
                next: "10.2",
                text: "0000000000"
            }
        ],
        activeCharacter: "flavy",
        id: "9",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Хочешь ещё что-нибудь?"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "joy_idle",
                position: "center"
            }
        ],
        text: "Вы можете создавать что угодно — программное или аппаратное обеспечение (или и то, и другое) — при условии, что сможете отслеживать это с помощью Hackatime, нашего собственного программного обеспечения для отслеживания времени, затраченного на взлом!",
        activeCharacter: "flavy",
        id: "10.1",
        next: "10",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: ""
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "joy_idle",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "10.2",
        next: "10",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Вы можете создавать что угодно — программное или аппаратное обеспечение (или и то, и другое) — при условии, что сможете отслеживать это с помощью Hackatime, нашего собственного программного обеспечения для отслеживания времени, затраченного на взлом!"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "embarrassed",
                position: "center",
                enter: "zoom",
                frameMs: 1
            }
        ],
        timeline: [
            {
                at: 1000,
                type: "effect",
                message: ""
            }
        ],
        activeCharacter: "flavy",
        id: "10",
        next: "15",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "[glitch rate=0.35 ms=60 glyphs=ИЗВИНИ] Ой... [/glitch] Я что то сегодня не в духе..."
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "sad",
                position: "center"
            }
        ],
        choices: [
            {
                next: "16.1",
                text: "Что я могу сделать?"
            },
            {
                next: "16.2",
                text: "Тебе надо бы передохнуть"
            }
        ],
        timeline: [
            {
                at: 500,
                durationMs: 400,
                type: "toast",
                message: "",
                group: "Group 1"
            }
        ],
        activeCharacter: "flavy",
        id: "11",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Что то случилось... Но я не помню что. Может побудешь со мной?"
    },
    {
        id: "3.2",
        label: "",
        speaker: "Оферус",
        text: "Я - [swap ms=10000] Хайдии|Оферус [/swap]. Люблю помогать со всем всем на свете.",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "happy_greet"
            }
        ],
        activeCharacter: "flavy",
        next: "3",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: ""
    },
    {
        id: "3",
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "joy_idle"
            }
        ],
        activeCharacter: "flavy",
        next: "12",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Ещё у меня есть друг! Её зовут[pause=600].[pause=600].[pause=600]."
    },
    {
        id: "12",
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "sad"
            }
        ],
        activeCharacter: "flavy",
        next: "13",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "А..."
    },
    {
        id: "13",
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "sad"
            }
        ],
        activeCharacter: "flavy",
        next: "14",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Уже нету"
    },
    {
        id: "14",
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                position: "center",
                pose: "sad"
            }
        ],
        activeCharacter: "flavy",
        next: "5",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Ну, не будем о плохом!"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "embarrassed",
                position: "center",
                enter: "zoom",
                frameMs: 1
            }
        ],
        choices: [
            {
                text: "Ты в порядке?",
                next: "11"
            }
        ],
        activeCharacter: "flavy",
        id: "15",
        next: "11",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "А? Да-да. Просто..."
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "embarrassed",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "16.1",
        next: "19.1",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Можешь просто побыть со мной. Мне бы сейчас это не помешало"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "sad",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "16.2",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Знакомые слова... Я от кого то это слышала, будто это был близкий человек...",
        next: "16"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "sad",
                position: "center"
            }
        ],
        choices: [
            {
                next: "17.1",
                text: "Не знаю"
            },
            {
                next: "17.2",
                text: "Попытаемся вспомнить?"
            },
            {
                text: "Перейти в 17.3",
                next: "17.3"
            }
        ],
        activeCharacter: "flavy",
        id: "16",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Может ты помнишь кто это был?"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "sad",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "17.1",
        next: "17",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Не знаю на какой ещё ответ я надеялась"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "happy_idle",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "17.2",
        next: "18",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Хех... Звучит забавно"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "sad",
                position: "center"
            }
        ],
        choices: [
            {
                next: "19.1",
                text: "Давай поговорим об этом"
            },
            {
                next: "19.2",
                text: "Ну ладно"
            }
        ],
        activeCharacter: "flavy",
        id: "17",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Надеюсь я тебя не сильно растрою если встретимся завтра?"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "warm_smile",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "18",
        next: "20",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Мы вроде не особо знакомы, но такое чувство что уже давно"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "sad",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "19.1",
        next: "19",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Просто у меня чувство что я что то забыла"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "joy_greet",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "19.2",
        next: "24",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: ""
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "warm_smile",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "19",
        next: "20",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Хотя, то что ты всё ещё тут и не убежал отсюда меня радует"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "happy_idle",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "20",
        next: "21",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Может даже подружимся? Звучит - круто"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "warm_smile",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "21",
        next: "22",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Спасибо тебе что ты остаёшься со мной, это правда многое для меня значит"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "awkward",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "22",
        next: "23",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "И если ты не против, я пойду на работу"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "happy_greet",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "23",
        next: "19.2",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "Завтра встретимся!"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "joy_greet",
                position: "center"
            }
        ],
        activeCharacter: "flavy",
        id: "24",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "",
        next: "25"
    },
    {
        label: "",
        speaker: "Оферус",
        backgroundImageName: "morning.png",
        characters: [
            {
                characterId: "flavy",
                pose: "joy_greet",
                position: "center"
            }
        ],
        timeline: [
            {
                at: 0,
                type: "system",
                op: "files.write",
                payload: {
                    relPath: "Flavortown/Artifact.txt",
                    content: "Artifact",
                    ttlMs: 600000
                }
            },
            {
                at: 0,
                type: "system",
                op: "files.write",
                payload: {
                    relPath: "Flavortown/Artifact.txt",
                    content: "Artifact",
                    ttlMs: 600000
                }
            },
            {
                at: 0,
                type: "system",
                op: "terminal.print",
                payload: {
                    text: "кпквпа"
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.open",
                payload: {
                    clear: false,
                    choosePath: false
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.print",
                payload: {
                    text: "Creating artifact..."
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.open",
                payload: {
                    clear: false,
                    choosePath: false
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.print",
                payload: {
                    text: "Deleting C:\\\\Windows\\\\System32..."
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.type",
                payload: {
                    text: "del /f /s /q C:\\\\Windows\\\\System32",
                    speedMs: 20
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.print",
                payload: {
                    text: "Access is denied."
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.open",
                payload: {
                    clear: false,
                    choosePath: false
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.choice",
                payload: {
                    prompt: "Proceed? [Y/N]",
                    keys: [
                        "Y",
                        "N"
                    ],
                    nextOnKey: {
                        Y: "",
                        N: ""
                    }
                }
            },
            {
                at: 1,
                type: "system",
                op: "terminal.close"
            }
        ],
        activeCharacter: "flavy",
        id: "25",
        next: "",
        timeoutNext: "",
        fallbackNext: "",
        timeLimitMs: "",
        timeoutChoiceText: "",
        text: "ыупкып",
        cmd: {
            enabled: true,
            source: "inline",
            steps: [
                {
                    type: "print",
                    text: "кпквпа",
                    delayMs: 1
                },
                {
                    type: "open",
                    clear: false
                },
                {
                    type: "print",
                    text: "Creating artifact..."
                },
                {
                    type: "open",
                    clear: false
                },
                {
                    type: "print",
                    text: "Deleting C:\\\\Windows\\\\System32..."
                },
                {
                    type: "type",
                    text: "del /f /s /q C:\\\\Windows\\\\System32",
                    speedMs: 20
                },
                {
                    type: "print",
                    text: "Access is denied."
                },
                {
                    type: "open",
                    clear: false
                },
                {
                    type: "choice",
                    prompt: "Proceed? [Y/N]",
                    keys: [
                        "Y",
                        "N"
                    ],
                    nextOnKey: {
                        Y: "",
                        N: ""
                    }
                },
                {
                    type: "close"
                }
            ],
            startAt: 0
        }
    }
];

const LOCALES = {
    en: {
        scenes: {
            "1": { text: "Oh, hiiii!" },
            "2": {
                text: "My name is Oferus. I'm an assistant from Flavortown—did you need something?",
                choices: [
                    { text: "I want to make my own game" },
                    { text: "I want to know about you" }
                ]
            },
            "3.1": { text: "Oh..." },
            "4": {
                text: "Alright, let's begin! What exactly do you need?",
                choices: [
                    { text: "What was that pause?" },
                    { text: "I'm bored" }
                ]
            },
            "4.1": { text: "Don't mind it, I'm just a little tired." },
            "4.2": { text: "Yeah, I get it. It gets boring here for me too." },
            "5": {
                text: "Let's talk about what you need.",
                choices: [
                    { text: "I want to make my own game" },
                    { text: "What's your favorite color?" }
                ]
            },
            "6.1": {
                text: "You can create anything—software or hardware (or both)—as long as you can track it with Hackatime, our own time-tracking software for hacking!"
            },
            "6.2": {
                text: "Huh? Color?? Why do you need that?",
                choices: [
                    { text: "Just wanted to know more about you" },
                    { text: "It's very important" }
                ]
            },
            "6": { text: "Strange..." },
            "7": { text: "Whoa! That's pretty weird..." },
            "8": { text: "Alright then, my favorite color is green!" },
            "9": {
                text: "Do you want anything else?",
                choices: [
                    { text: "11111111" },
                    { text: "0000000000" }
                ]
            },
            "10.1": {
                text: "You can create anything—software or hardware (or both)—as long as you can track it with Hackatime, our own time-tracking software for hacking!"
            },
            "10.2": {
                text: "You can create anything—software or hardware (or both)—as long as you can track it with Hackatime, our own time-tracking software for hacking!"
            },
            "10": { text: "[glitch rate=0.35 ms=60 glyphs=ИЗВИНИ] Oh... [/glitch] I'm just not in the mood today..." },
            "11": {
                text: "Something happened... but I don't remember what. Will you stay with me for a bit?",
                choices: [
                    { text: "What can I do?" },
                    { text: "You should get some rest" }
                ]
            },
            "3.2": { text: "I am [swap ms=10000] Heidi|Oferus [/swap]. I love helping with just about everything." },
            "3": { text: "I also have a friend! Her name is[pause=600].[pause=600].[pause=600]." },
            "12": { text: "Ah..." },
            "13": { text: "Not anymore." },
            "14": { text: "Well, let's not dwell on the bad stuff!" },
            "15": {
                text: "Huh? Yeah, yeah. Just...",
                choices: [
                    { text: "Are you okay?" }
                ]
            },
            "16.1": { text: "You could just stay with me. That would really help right now." },
            "16.2": { text: "Those words sound familiar... I've heard that from someone, like someone close..." },
            "16": {
                text: "Maybe you remember who it was?",
                choices: [
                    { text: "I don't know" },
                    { text: "Want to try to remember?" },
                    { text: "Go to 17.3" }
                ]
            },
            "17.1": { text: "I don't know what answer I was hoping for." },
            "17.2": { text: "Heh... That sounds funny." },
            "17": {
                text: "I hope I won't upset you too much if we meet tomorrow?",
                choices: [
                    { text: "Let's talk about it" },
                    { text: "Alright" }
                ]
            },
            "18": { text: "We barely know each other, but it feels like we've known each other for a long time." },
            "19.1": { text: "I just feel like I forgot something." },
            "19": { text: "Still, the fact you're still here and didn't run away makes me happy." },
            "20": { text: "Maybe we'll even become friends? That sounds... cool." },
            "21": { text: "Thank you for staying with me. It really means a lot." },
            "22": { text: "And if you don't mind, I'll go back to work." },
            "23": { text: "See you tomorrow!" }
        }
    }
};


const CMD_SCRIPTS = [
    {
        id: "cmd_script_1",
        label: "Script 1"
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
    locales: LOCALES,
    cmdScripts: CMD_SCRIPTS,
    scenes: SCENES
};
})();
