# ГАЙД: An important assignment from Flavortown (Лаборатория механик)

Этот проект — прототип браузерного движка визуальной новеллы, сфокусированный на **тестировании механик** (финального сюжета пока нет).

- [index.html](./index.html): структура UI (сцена, диалог, нижнее меню, оверлеи)
- [styles.css](./styles.css): визуальный стиль, одноразовые эффекты, адаптивная верстка
- [characters.js](./characters.js): библиотека персонажей (профили + позы)
- [story.js](./story.js): сцены + константы истории (ID, ветвления, строки наблюдателя)
- [game.js](./game.js): логика движка, сценарный поток, телеметрия, сохранения, слой давления

## 1. Основные правила дизайна

- Полноэкранный веб‑рантайм, без бэкенда.
- Персонажи **статичны в покое**.
- Движение только по явной одноразовой анимации входа.
- Нижнее быстрое меню всегда показывает ровно 6 кнопок:
  - `Back`, `Auto`, `Skip`, `Save`, `Load`, `Settings`
- `Log`, `Mute`, `Hide UI`, `Restart` находятся в настройках + горячие клавиши.

## 1.1 Локальный запуск (хромакей)

Хромакей (удаление зеленого фона) требует `http://` или `https://`.
Если открыть `index.html` напрямую через `file://`, браузер заблокирует доступ к пикселям и хромакей не сработает.

Быстрые варианты локального сервера:

```bash
# CMD (Windows)
cd /d E:\my_projects\Hey! Click Here!!!
npm run dev

```bash

npm run cmd

```bash

npm run editor

```bash

- Вся «наблюдательская» логика использует только безопасную локальную телеметрию в хранилище браузера.

**Подготовка ассетов под хромакей:**
- фон должен быть ровным `#02fb00` без градиентов и теней;
- лучше PNG, JPG даёт белую бахрому на краях;
- чем чище край, тем меньше артефактов после вырезания;
- хромакей кэшируется локально, поэтому после правки ассетов лучше обновить страницу.

```

## 2. Схема сцены

Сцены живут в `story.js` как `const SCENES` и экспортируются через `window.STORY`.
ID сцен — строковые числа. Ветвления используют точку: `2`, `2.1`, `2.2`.

```js
{
    id: "2.1",
    label: "МОДУЛЬ // ЗАГОЛОВОК",
    speaker: "ЯДРО ЛАБОРАТОРИИ",
    text: "Базовый текст.",
    textVariants: ["Вариант 1", "Вариант 2"],
    glitchRate: 0.55,
    backgroundImageName: "i.webp",

    characterScale: 1.0, // множитель для всей сцены
    characters: [
        {
            id: "observer",
            characterId: "flavy",
            pose: "joy_greet",
            name: "Наблюдатель",
            // предпочтительный масштаб:
            size: 1.2,
            // устаревший алиас (все еще поддерживается):
            // scale: 1.2,
            position: "right", // left | center | right | far-left | far-right
            offsetX: 0,
            enter: "fade" // fade | slide-left | slide-right | zoom
        },
        {
            use: "terminal",
            position: "left",
            size: 0.9
        }
    ],
    activeCharacter: "observer",

    checkpoint: true,
    timeline: [
        { at: 900, type: "toast", message: "Событие таймлайна." },
        { at: 1200, type: "effect", effect: "flicker" },
        { at: 1500, type: "prompt", message: "Фейковое предупреждение." }
    ],

    timeLimitMs: 7000,
    timeoutChoiceText: "Время вышло.",
    timeoutNext: "3.1",

    setFlags: { introSeen: true },
    addVars: { pressureSeed: 1 },

    choices: [
        { text: "Вариант A", next: "3" },
        {
            text: "Заблокированный вариант",
            next: "3.1",
            ifFlags: { gateKey: true },
            showLocked: true,
            lockedText: "Нужен флаг gateKey"
        },
        {
            text: "Действие панели",
            action: { type: "openPanel", panel: "checkpoints" }
        }
    ]
}
```

## 2.2 Теги в тексте (база + хоррор)

Теги используются **в `text` сцены и в `choices.text`** и **не отображаются в логе**.
Синтаксис: `[tag param=value]...[/tag]` или одноразовые теги без закрытия.

Как это работает:
- Парсер **вырезает теги** из текста и строит "чистую" строку.
- Эффекты применяются по диапазонам в чистом тексте.
- `pause`/`lag`/`scramble` влияют **во время печати**.
- `glitch` и `swap` начинают проявляться **когда сегмент появляется** (и продолжаются после печати).
- `[voice]` временно меняет голос в указанном диапазоне и затем возвращается к голосу сцены.
- В `choices` работают **только визуальные** теги (`glitch`/`scramble`/`swap`), аудио/паузы игнорируются.

**База:**
- `[pause=400]` — пауза в наборе (мс). Также можно `pause ms=400`.
- `[lag=120]...[/lag]` — доп. задержка на каждый символ внутри сегмента (мс). Также `lag ms=120`.
- `[voice=voice2.wav volume=0.6]...[/voice]` — другой голос для сегмента.
  - Параметры: `src`/`voice`/`sound`, `volume`/`vol`.
- `[sfx=hit.wav volume=0.8]` — одноразовый звук в момент тега.
  - Параметры: `src`/`sound`/`sfx`, `volume`/`vol`.

**Хоррор:**
- `[glitch rate=0.35 ms=120 glyphs="#%$"]...[/glitch]`
  - После печати заменяет часть символов на заданные `glyphs`.
  - `rate` — доля символов (0..1), `ms` — частота обновления.
- `[scramble ms=100 glyphs="#%$"]...[/scramble]`
  - Во время печати показывает хаотичные символы и перерисовывает каждые `ms`.
- `[swap ms=900]сон|шум|ложь[/swap]`
  - После печати циклически подменяет фрагмент на варианты через `ms`.
  - Внутри — список вариантов через `|`.
  - Параметры цикличности: `loop=false` или `once=true`.

**Подстановка имени игрока:**
- `[playerName]` — итоговое имя: введённое игроком (если валидно) → иначе системное → иначе fallback.
- `[playerInput]` — только введённое игроком; если оно невалидно/пустое → fallback к `[playerName]`.
- Fallback‑строка задаётся в `STORY.audio.playerNameFallback` (по умолчанию `"Друг"`).

Пример:

```js
text: "Я слышу [pause=300]шум... [glitch rate=0.4 ms=120]ошибка[/glitch] [swap ms=900]сон|шум|ложь[/swap]"
```

Пример с голосом и SFX:

```js
text: "Тсс... [sfx=door.wav volume=0.7][voice=voice2.wav volume=0.5]не шуми[/voice]"
```

Мини-примеры по тегам:

```js
text: "Стоп... [pause=500]идём дальше."
```

```js
text: "[lag=80]Медленно, будто тянется время...[/lag]"
```

```js
text: "[scramble ms=80 glyphs=\"#$%\"]шёпот[/scramble]"
```

```js
text: "[glitch rate=0.2 ms=90]искажение[/glitch]"
```

```js
text: "Это [swap ms=700]сон|шум|ложь[/swap]"
```

```js
text: "[voice=voice_horror.wav vol=0.5]шаги[/voice] [sfx=hit.wav vol=0.7]"
```

```js
text: "Привет, [playerName]. Это [playerInput], если ты уже ввёл имя."
```

## 2.3 Аудио в сценах

Глобальные настройки (в `window.STORY.audio`):

```js
audio: {
  voice: "voice.wav", // базовый голос (будет "carry" между сценами)
  music: { src: "bgm.mp3", volume: 0.7, loop: true },
  musicModeDefault: "carry", // carry | pause | stop
  musicFadeMs: 400
}
```

Поля сцены:

```js
voice: "voice.wav",
// или:
voice: { src: "voice.wav", volume: 0.6 },

// или внутри audio:
audio: { voice: "voice.wav" },

music: "bgm.mp3",
// или:
music: { src: "bgm.mp3", volume: 0.7, loop: true, fadeMs: 400, mode: "carry" }
```

Также можно:

```js
audio: { music: { src: "bgm.mp3", volume: 0.7, loop: true } }
```

Аудиофайлы лежат в папке `assets/`.

**Важно про голос и музыку:**
- Голос **играет циклом во время печати** текста.
- Голос **сохраняется между сценами**, пока не указан другой голос.
- Чтобы отключить голос в сцене: `voice: null` или `audio: { voice: null }`.
- Голос стартует **с случайного места** при каждой сцене, чтобы не было одинакового старта.
- Музыка следует режиму `musicModeDefault`:
  - `carry` — продолжает играть, если в сцене нет новой музыки.
  - `pause` — ставится на паузу на переход и автозапускается в новой сцене.
  - `stop` — останавливается, если музыка не задана.
- Из‑за ограничений браузера аудио начинает играть **только после первого клика/клавиши**.

## 2.2 Полный пример сцены (все поля)

```js
{
    id: "1.2",
    label: "ГЛАВА 01 // ПРИМЕР",
    speaker: "НАБЛЮДАТЕЛЬ",
    text: "Основная строка.",
    textVariants: ["Альт строка A", "Альт строка B"],
    glitchRate: 0.5,
    backgroundImageName: "i.webp",

    characterScale: 1.1,
    characters: [
        {
            id: "observer",
            characterId: "flavy",
            pose: "joy_idle",
            name: "Наблюдатель",
            position: "right",
            x: 0.8,
            y: 0.1,
            offsetX: 0,
            offsetY: 120,
            size: 1.05,
            opacity: 1,
            enter: "fade"
        },
        {
            use: "terminal",
            position: "left",
            size: 0.9,
            frameMode: "loop",
            frameMs: 180,
            frames: ["terminal_idle_1.png", "terminal_idle_2.png"]
        }
    ],
    activeCharacter: "observer",

    effects: ["flicker", "shake"],
    checkpoint: true,

    timeline: [
        { at: 500, type: "toast", message: "Тост таймлайна." },
        { at: 900, type: "effect", effect: "flash" },
        { at: 1200, type: "noise" },
        { at: 1500, type: "hint", message: "Замена подсказки." },
        { at: 1800, type: "prompt", message: "Фейковый промпт." },
        { at: 2100, type: "observer" }
    ],

    timeLimitMs: 6000,
    timeoutChoiceText: "Время вышло.",
    timeoutNext: "1.3",

    setFlags: { introSeen: true },
    addVars: { pressureSeed: 1 },

    choices: [
        { text: "Дальше", next: "1.3", effects: ["fade"] },
        {
            text: "Заблокированный выбор",
            next: "1.4",
            ifFlags: { gateKey: true },
            showLocked: true,
            lockedText: "Нужен флаг gateKey"
        },
        { text: "Открыть лог", action: { type: "openPanel", panel: "log" } },
        { text: "Тост", action: { type: "toast", message: "Пользовательское действие." } }
    ]
}
```

Эффекты, поддерживаемые в `effects` и в `timeline.effect`:
`fade`, `flash`, `redflash`, `noise`, `shake`, `flicker`, `zoom`, `invert`, `stutter`, `blurburst`, `vignette`

**Кратко о каждом эффекте:**
- `fade` — сценический переход (короткое затемнение/проявление).
- `flash` — короткая вспышка поверх сцены.
- `redflash` — резкая красная вспышка.
- `noise` — краткий шумовой оверлей.
- `shake` — встряска камеры.
- `flicker` — короткое мерцание яркости.
- `zoom` — резкий "приближенный" толчок.
- `invert` — краткая инверсия цветов.
- `stutter` — резкая дрожь/дёргание.
- `blurburst` — короткий всплеск размытия.
- `vignette` — мгновенное затемнение по краям.

Можно ставить эффекты:
- в сцене: `effects: ["flicker", "shake"]`
- в выборе: `{ text: "...", effects: ["flash"] }`
- в таймлайне: `{ at: 1200, type: "effect", effect: "noise" }`

## 2.1 Библиотека персонажей

Персонажи описываются в `characters.js` и доступны как `window.CHARACTERS`. Каждая запись содержит дефолты и опциональные позы (картинки) с переопределениями.

```js
const CHARACTERS = {
    flavy: {
        name: "Наблюдатель",
        defaultX: 0.78,
        defaultY: 0,
        size: 1.05,
        position: "right",
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
        enter: "fade",
        defaultPose: "joy_greet",
        images: {
            joy_greet: { src: "Flavy_joy_greet.png", enter: "fade" },
            grump_idle: { src: "Flavy_grump_idle.png" },
            glitch_loop: { video: "Observer_glitch.webm", opacity: 0.65 }
        }
    },
    terminal: {
        name: "Терминал",
        emoji: "TERMINAL",
        defaultX: 0.22,
        defaultY: 0
    }
};

window.CHARACTERS = CHARACTERS;
```

Пример анимации кадров (уровень позы):

```js
blink_loop: {
    frames: ["Flavy_idle_1.png", "Flavy_idle_2.png"],
    frameMs: 180,
    frameMode: "loop"
}
```

Использование в сцене (оба синтаксиса поддерживаются и могут смешиваться):

- `{ characterId: "flavy", pose: "joy_greet", ...overrides }`
- `{ use: "flavy", imageKey: "joy_greet", ...overrides }`

Приоритет (сверху вниз):

- overrides сцены (`name`, `x`, `y`, `offsetX`, `offsetY`, `size`, `enter`, `position`, `opacity`, `frames`, `frameMs`, `frameMode`)
- overrides позы (из `characters[id].images[key]`)
- дефолты персонажа (из `characters[id]`)

Заметки:

- `defaultX/defaultY`, `x/y` нормализованы (`-10..10`).
- Если задан `position`, а `x` не задан, используется позиционный X и игнорируется `defaultX`. `defaultY` сохраняется, если `y` не задан.
- Неизвестный `characterId` или `pose` показывает toast‑предупреждение, но сцена продолжает работать.
- Видео‑слой персонажа:
  - используйте `video` (или `videoName`) в позе, чтобы рендерить видео‑слой персонажа;
  - можно также задать `src` с видео‑расширением (`.mp4`, `.webm`, `.ogg`, `.ogv`) или `mediaType: "video"`;
  - `opacity` можно задавать в сцене, позе или дефолтах персонажа (`-10..10`).
- Видео‑оверлей поверх спрайта (например, глаза):
  - используйте `overlayVideo` или `videoOverlay` в позе/персонаже/сцене;
  - координаты по умолчанию — **проценты** от спрайта (`x/y/width/height`), можно задать `xPx/yPx/widthPx/heightPx`;
  - `anchor: "center"` включает центрирование и масштаб `scale`.
- Анимация кадров:
  - используйте `frames`, `frameMs` и `frameMode` (`loop`, `once`, `random`) в позе или overrides сцены;
  - элементы `frames` могут быть файлами ассетов или ключами поз (ключи поз берут свой `src`);
  - если задан `frames`, он переопределяет статический `src`/`imageName` для этой позы.
- Масштабирование по разрешению: масштаб персонажей и смещения автоматически подстраиваются под размер сцены; `size` остается основным контролем.

Пример оверлея:

```js
horror: {
  src: "Флафи хоррор.jpg",
  overlayVideo: {
    videoName: "eye.mp4",
    x: 0.52,
    y: 0.46,
    width: 0.18,
    height: 0.18,
    opacity: 0.8,
    blend: "screen",
    anchor: "center",
    scale: 1
  }
}
```

## 3. API масштабирования персонажей

Движок поддерживает новые и старые поля:

- Новое предпочтительное поле: `size`
- Устаревший алиас: `scale`
- Множители: сцена (`characterScale`), объект в сцене (`size/scale`), поза (`size/scale`), базовый персонаж (`size/scale`)

Формула итогового масштаба:

```txt
finalScale = characterScale * sceneSize * poseSize * baseSize
```

Диапазон клампа:

```txt
-10 <= finalScale <= 10
```

Это защищает верстку от поломки.

## 4. Тайм‑ауты выбора

Тайм‑ауты активны, когда:

- У сцены есть `timeLimitMs`
- Глобальная настройка `timedChoices` включена

При истечении времени:

- `state.flags.timedTimeout = true`
- `state.flags.timedSuccess = false`
- Счетчик тайм‑аутов увеличивается в телеметрии
- Движок использует `timeoutNext`, иначе выбирает первый доступный вариант

## 5. События таймлайна

Каждая сцена может содержать `timeline` с миллисекундами от старта рендера.

Поддерживаемые типы:

- `toast`: уведомление
- `effect`: эффект сцены (`flash`, `flicker`, `zoom`, `invert`, `shake`)
- `noise`: короткий шумовой оверлей
- `hint`: замена строки подсказки
- `prompt`: фейковая панель предупреждения
- `screenText`: полноэкранный хоррор‑текст
- `observer`: принудительное сообщение наблюдателя
- `sfx`: одноразовый звук
- `music`: управление фоновой музыкой

Поля событий:
- `at` — задержка в мс от старта сцены.
- `type` — тип события (из списка выше).
- `group` — группа событий (для редактора, необязательно).
- `label` — подпись клипа (только для редактора).
- `message` — текст для `toast` / `prompt` / `hint`.
- `effect` — название эффекта для `type: "effect"`.
- `text` — текст для `screenText` (если не указан, берётся `message`).
- `durationMs` — длительность показа `screenText`.
- `style` — `red | white | ghost` для `screenText`.
- `sound`, `volume` — звук для `screenText`.
  - Эти поля можно положить и в `payload`.
- `sound`, `volume` — для `sfx`.
- `action` — `play | pause | resume | stop` для `music`.
- `music` — объект `{ src, volume, loop, fadeMs }` для `music`.

Мини‑пример:

```js
timeline: [
  { at: 500, type: "toast", message: "Сигнал получен." },
  { at: 900, type: "effect", effect: "flash" },
  { at: 1100, type: "screenText", text: "НЕ СМОТРИ", durationMs: 900, style: "red", sound: "scream.wav", volume: 0.9 },
  { at: 1200, type: "sfx", sound: "hit.wav", volume: 0.8 },
  { at: 1200, type: "noise" },
  { at: 1500, type: "hint", message: "Нажмите, чтобы продолжить." },
  { at: 1800, type: "music", action: "play", music: { src: "bgm.mp3", volume: 0.5, loop: true, fadeMs: 300 } }
]
```

## 6. Слой давления + телеметрия (безопасно)

Телеметрия локальная, без запросов разрешений:

- время сессии
- время простоя
- количество кликов и средний интервал клика
- количество нажатий клавиш и средний интервал
- количество возвратов, сохранений/загрузок
- количество тайм‑аутов, испорченных вариантов

Скор давления вычисляется из телеметрии + настройки искажения.

Эффекты давления:

- классы искажений на сцене
- строки наблюдателя (toast)
- редкая порча текста выбора
- опциональные фейковые предупреждения

Нет доступа к камере/микрофону/геолокации/файлам системы.

## 7. Сохранения и виртуальные аномалии

- 3 слота (`Ctrl+1..3` сохранить, `Alt+1..3` загрузить)
- Сохранения/загрузки открываются **полноэкранной панелью** со слотами
- В каждом слоте хранится **превью сцены** (canvas‑скрин)
- Сейв включает состояние, настройки, телеметрию, прогресс и метаданные слота
- Метаданные содержат виртуальные поля:
  - `anomaly`
  - `note`
  - `writes`
- Предупреждения об аномалиях — только UI‑симуляция

## 8. Панели и утилиты

Панель настроек теперь с вкладками:

- **Text**: скорость/размер текста, прозрачность (dev‑only).
- **Audio**: музыка, голос, SFX, ambience, голосовой бип.
- **Gameplay**: задержка авто, тайм‑выборы, пропуск непрочитанного.
- **System**: слой давления, глитч‑режим, утилиты.

Панель настроек (утилиты) включает:

- скорость текста
- размер текста
- задержку авто
- интенсивность искажений
- пропуск непрочитанного
- голосовой бип
- слой давления
- глитч‑текст
- тайм‑выборы
- генерируемую атмосферу
- утилиты: лог, мут, скрыть UI, чекпоинты, рестарт, сброс настроек

Панель лога:

- хранит историю реплик
- клик по записи прыгает назад (replay)

Панель чекпоинтов:

- показывает сцены с `checkpoint: true`
- позволяет прыгать напрямую для тестов

## 9. Горячие клавиши

- `Enter` / `Space`: продолжить
- `1..9`: выбрать видимый вариант
- `A`: авто
- `S`: пропуск
- `B`: назад/роллбек
- `O`: настройки
- `L`: лог
- `C`: чекпоинты
- `M`: мут
- `H`: скрыть UI
- `Esc`: закрыть активную панель (или вернуть UI)
- `Ctrl+1..3`: сохранить слот
- `Alt+1..3`: загрузить слот

## 10. Рабочий процесс (mechanic‑lab)

1. Начни с хаба.
2. Запускай по одному модулю механик.
3. Проверяй телеметрию и реакцию давления в настройках.
4. Используй чекпоинты и лог для быстрого повторного теста.
5. Держи модули сюжетно нейтральными до финальной стадии истории.

## 11. Системные механики (Desktop build)

Эти команды работают **только** в десктоп‑сборке (Electron). В браузере они покажут предупреждение.
Запуск: `npm install` → `npm run dev`.

### 11.1. Вызов через `action` или `timeline`

**В вариантах выбора:**

```js
action: {
  type: "system",
  op: "files.write",
  payload: {
    relPath: "Notes/letter.txt",
    content: "Привет.",
    ttlMs: 600000,
    persistent: false
  }
}
```

**В `timeline`:**

```js
timeline: [
  { at: 500, type: "system", op: "terminal.open" },
  { at: 900, type: "system", op: "terminal.print", payload: { text: "HELLO" } }
]
```

### 11.2. Доступные операции

- `terminal.open` / `terminal.close`
- `terminal.print` — `payload.text` или `payload.lines`
- `terminal.choice` — `payload.prompt`, `payload.keys`, `payload.nextOnKey`
- `files.write` — `relPath`, `content`, `ttlMs`, `persistent`
- `files.delete` — `relPath`
- `files.list` — обновить список
- `files.cleanup` — удалить истёкшие файлы
- `files.open` — открыть файл во встроенном viewer
- `files.openFolder` — открыть папку `Documents\\Flavortown`
- `desktop.show` / `desktop.hide`
- `window.fakeClose` / `window.fakeRestart`
- `prompt.fakePermission` — показывает системный alert
- `input.wordReplace` — текстовый ввод с заменой слов
- `input.playername` — ввод имени игрока
- `meta.set` — обновляет мета‑состояние (например `phase`)

### 11.3. `terminal.choice` и переходы

```js
{
  type: "system",
  op: "terminal.choice",
  payload: {
    prompt: "HELP RACC0N? [Y/N]",
    keys: ["Y", "N"],
    nextOnKey: {
      Y: "7.1",
      N: "7.2"
    }
  }
}
```

### 11.4. `input.wordReplace`

```js
{
  type: "system",
  op: "input.wordReplace",
  payload: {
    title: "Последние слова",
    message: "Напиши что‑то от имени Оферус",
    words: ["Безнадёжность", "Печаль", "Сожаление", "Одиночество"],
    file: { relPath: "Notes/Confession.txt", persistent: true },
    next: "9.1"
  }
}
```

### 11.5. `input.playername`

Можно запускать из `choice.action` или из `timeline`:

```js
{
  type: "system",
  op: "input.playername",
  payload: {
    title: "Как тебя зовут?",
    message: "Введи имя. Можно изменить позже.",
    next: "4.1"
  }
}
```

Альтернатива через выбор:

```js
choices: [
  {
    text: "Назваться",
    action: { type: "input.playername", title: "Имя", message: "Как тебя зовут?", next: "4.1" }
  }
]
```

Валидация имени:
- имена с цифрами/подчёркиваниями/псевдонимными символами отклоняются
- длина 2..24
- слова `admin/user/guest/test/player/username/pc/desktop` отсекаются

### 11.6. Мета‑старт после “перезапуска”

В `story.js` можно описать старт по фазе:

```js
window.STORY = {
  startSceneId: "1",
  metaStart: {
    after_reset: "5.1"
  },
  scenes: SCENES
};
```

## 12. Конструктор сцен (editor.html)

Конструктор — это отдельный редактор для `story.js`, который сохраняет черновик в `localStorage`, валидирует сцены и умеет запускать предпросмотр через реальный движок.

**Запуск:**

```bash
# В браузере (рекомендуется через локальный сервер)
cd /d E:\my_projects\Hey! Click Here!!!
npm run dev
```

Открой `http://localhost:3000/editor.html`.

```bash
# В Electron (отдельное окно редактора)
npm run editor
```

**Важно:**
- Предпросмотр в редакторе использует `index.html?preview=1` и берёт данные из `localStorage`.
- В режиме предпросмотра сохранения/мета‑состояния идут в отдельный префикс `preview_`, чтобы не ломать основной прогресс.

### 12.1. Список сцен (левая панель)

- Поиск по `id`, `label` и тексту.
- `+ Новая сцена` — создаёт пустую сцену.
- `Дублировать` — копирует выбранную сцену.
- `Вверх/Вниз` — меняет порядок сцены в списке.
- `Удалить` — удаляет выбранную сцену.
- Шаблон **Диалог** — базовая сцена с текстом.
- Шаблон **Выбор** — сцена с вариантами.
- Шаблон **Пауза** — пустая сцена с `pause`.
- Шаблон **Хоррор** — сцена с эффектами.

### 12.2. Верхняя панель

- **Скачать story.js** — экспорт текущего состояния редактора в файл.
- **Импорт story.js** — загрузка существующего `story.js` (ожидается `window.STORY`).
- **Сохранить черновик** — ручное сохранение черновика (также `Ctrl+S`).
- **Сбросить черновик** — удаляет черновик из `localStorage`.
- Статус справа: показывает сохранения/ошибки.

Черновик сохраняется автоматически при правках и по кнопке.

### 12.3. Вкладка «Сцена»

**Глобальные настройки `story.js`:**
- `startSceneId` — ID стартовой сцены.
- `observerLines` — строки наблюдателя (каждая строка с новой строки).

**Поля сцены:**
- `ID` — строковый ID (`"1"`, `"2.1"` и т.д.).
- `Label` — произвольная метка (для отладки).
- `Speaker` — имя говорящего в окне диалога.
- `Background (backgroundImageName)` — файл фона из `assets/`.
- `Next` — следующий ID при клике, если нет выбора.
- `Timeout Next` — ID для тайм‑аута (если `timeLimitMs`).
- `Fallback Next` — запасной ID (используется, если основной недоступен).
- `Time Limit (ms)` — таймер выбора (мс).
- `Timeout Choice Text` — текст тайм‑аута.
- `Character Scale` — множитель масштаба персонажей в сцене.
- `Active Character` — ID активного персонажа (для подсветки).
- `Text Variants` — варианты текста (по строкам).
- `Glitch Rate` — интенсивность глитча текста (0..1).
- `Effects` — эффекты сцены через запятую (`flash`, `flicker`, `zoom`, `invert`, `shake`, `noise`, `fade`).

**Флаги и переменные (JSON):**
- `ifFlags` / `ifVars` — условия показа сцены.
- `setFlags` — флаги, которые устанавливаются при входе.
- `addVars` — переменные (инкремент/присвоение).

**Текст сцены:**
- Большое поле `text` принимает теги `[pause]`, `[glitch]`, `[swap]` и т.д. (см. раздел 2.2).

### 12.4. Вкладка «Персонажи»

Каждая запись — один персонаж сцены.

**Базовые поля:**
- `Ref Type`: `characterId` или `use`.
- `Character ID` — список из `characters.js`.
- `Pose` — поза выбранного персонажа.
- `Name` — локальное имя (перезаписывает дефолт).
- `Entry ID` — ID для `activeCharacter`.
- `Position` — `left | center | right | far-left | far-right | ""`.
- `X/Y` — нормализованные координаты (`-10..10`).
- `Offset X/Y` — сдвиг в пикселях.
- `Size` — масштаб (`-10..10`, базово `1`).
- `Opacity` — прозрачность (`-10..10`, базово `1`).
- `Enter` — анимация входа (`fade`, `slide-left`, `slide-right`, `zoom`).

**Кадровая анимация:**
- `Frames` — список кадров (по строкам).
- `Frame ms` — длительность кадра.
- `Frame mode` — `loop | once | random`.

**Доп. поля (JSON):**
- Любые дополнительные параметры, которые поддерживает движок: `video`, `overlayVideo`, `blend`, `anchor`, `scale` и т.д.

### 12.5. Вкладка «Анимации»

Вкладка состоит из двух зон: персонажи (слева) и таймлайн (справа). Поля персонажей синхронизируются с вкладкой «Персонажи».

**Персонажи:**
- те же базовые поля, что и в «Персонажи»
- `Enter / Frames / Frame ms / Frame mode`
- `Overlay video`:
  - `Video` — имя файла (mp4/webm) из `assets/`
  - `x/y/width/height` — относительные (0..1)
  - `xPx/yPx/widthPx/heightPx` — пиксели
  - `opacity`, `blend`, `anchor`, `scale`, `playbackRate`
  - `loop / muted / autoplay`

**Таймлайн‑редактор:**
- Группы по `group` (можно сворачивать).
- Клип — событие `timeline`:
  - drag по X меняет `at`
  - resize справа меняет `durationMs`
  - снэп по 100мс
- Инспектор справа: `type`, `at`, `durationMs`, `label`, `group`, `message/text`, `effect`, `sound`, `volume`, `style`, `music`, `action`, `payload`.
- Кнопки: `+ Группа`, `+ Событие`, `Дублировать`, `Удалить`, `Выровнять`, `Сброс масштаб`, `Auto fit`.

### 12.6. Вкладка «Выборы»

**Поля выбора:**
- `Text` — текст варианта.
- `Next` — ID сцены.
- `Timeout Next` — ID на тайм‑ауте.
- `Effects` — эффекты при выборе.
- `showLocked` — показывать заблокированный вариант.
- `Locked Text` — текст для заблокированного варианта.
- `ifFlags` / `ifVars` — условия показа (JSON).
- `Action` — действие вместо перехода (JSON).

### 12.7. Вкладка «Таймлайн»

**Событие:**
- `At (ms)` — задержка от старта сцены.
- `Type` — тип события (`toast`, `effect`, `noise`, `hint`, `prompt`, `observer`, `system`, `screenText`, `sfx`, `music`).
- `Message` — текст события.
- `Effect` — название эффекта (если `type: "effect"`).
- `System op` — операция системных действий.
- `Payload` — данные события (JSON).

### 12.8. Вкладка «Аудио»

**Глобальное аудио (`window.STORY.audio`):**
- `Voice src` / `Voice volume`
- `Music src` / `Music volume`
- `Music loop` — `true/false`
- `Music mode` — `carry | pause | stop`
- `Music fade (ms)`

**Аудио текущей сцены:**
- те же поля, что и глобально.
- пустые поля убирают переопределение.

### 12.9. Вкладка «Теги текста»

Список поддерживаемых тегов и мини‑тест:
- Вставь текст с тегами в поле.
- Снизу увидишь «очищенный» текст и список распознанных тегов.

### 12.10. Валидация

Панель слева снизу показывает ошибки:
- дубликаты `id`
- ссылки `next/timeoutNext/choices` на несуществующие сцены
- неизвестные `characterId` или `pose`
- пустые обязательные поля

### 12.11. Предпросмотр

Панель справа снизу:
- `Обновить` — пересохранить в `localStorage` и перезагрузить предпросмотр.
- `Тест с выбранной` — старт предпросмотра с выбранного `id`.
- Поле `ID сцены` — ручной запуск с любого ID.
- `Открыть отдельно` — предпросмотр в новой вкладке.
- `Звук: Вкл/Выкл` — mute для предпросмотра.

Внизу — «Предпросмотр story.js» (сгенерированный код).
