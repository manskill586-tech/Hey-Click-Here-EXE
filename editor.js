(() => {
  const DRAFT_KEY = "story_editor_draft_v1";
  const DRAFT_FILE = "_drafts/editor_draft.json";
  const GRAPH_POS_FILE = "_drafts/graph_positions.json";
  const STATUS_IDLE = "Готово";
  const FOCUS_BOUNCE_MS = 120000;
  const DEFAULT_STORY = {
    startSceneId: "1",
    observerLines: [],
    audio: {
      voice: "",
      music: { src: "", volume: 0.7, loop: true },
      musicModeDefault: "carry",
      musicFadeMs: 400
    },
    cmdScripts: [],
    scenes: []
  };

  const PREVIEW_DATA_KEY = "story_preview_data";
  const PREVIEW_START_KEY = "story_preview_start";
  const PREVIEW_MUTE_KEY = "story_preview_mute";

  const characters = typeof window.CHARACTERS === "object" && window.CHARACTERS ? window.CHARACTERS : {};
  const characterIds = Object.keys(characters);
  let initialDraftLoaded = false;


  const GRAPH_NODE_WIDTH = 180;
  const GRAPH_NODE_HEIGHT = 110;
  const GRAPH_COL_GAP = 240;
  const GRAPH_ROW_GAP = 130;
  const GRAPH_MARGIN_X = 40;
  const GRAPH_MARGIN_Y = 40;
  const GRAPH_BOUND_PADDING = 160;
  const GRAPH_ZOOM_KEY = "editor_graph_zoom_v1";
  const GRAPH_PAN_KEY = "editor_graph_pan_v1";
  const GRAPH_ZOOM_MIN = 0.01;
  const GRAPH_ZOOM_MAX = 2.0;
  const GRAPH_ZOOM_SENSITIVITY = 0.0012;
  const TIMELINE_ZOOM_KEY = "editor_timeline_zoom_v1";
  const TIMELINE_GROUPS_KEY = "editor_timeline_groups_v1";
  const TIMELINE_ZOOM_MIN = 2;
  const TIMELINE_ZOOM_MAX = 200;
  const TIMELINE_ZOOM_DEFAULT = 10;
  const TIMELINE_SNAP_MS = 100;
  const TIMELINE_DEFAULT_DURATION = 400;

  const ui = {
    sceneList: document.getElementById("sceneList"),
    sceneSearch: document.getElementById("sceneSearch"),
    addSceneBtn: document.getElementById("addSceneBtn"),
    duplicateSceneBtn: document.getElementById("duplicateSceneBtn"),
    deleteSceneBtn: document.getElementById("deleteSceneBtn"),
    moveUpBtn: document.getElementById("moveUpBtn"),
    moveDownBtn: document.getElementById("moveDownBtn"),
    undoBtn: document.getElementById("undoBtn"),
    exportBtn: document.getElementById("exportBtn"),
    importInput: document.getElementById("importInput"),
    saveDraftBtn: document.getElementById("saveDraftBtn"),
    resetDraftBtn: document.getElementById("resetDraftBtn"),
    statusText: document.getElementById("statusText"),
    tabs: Array.from(document.querySelectorAll(".tab-btn")),
    tabPanes: {
      scene: document.getElementById("tab-scene"),
      characters: document.getElementById("tab-characters"),
      choices: document.getElementById("tab-choices"),
      timeline: document.getElementById("tab-timeline"),
      cmd: document.getElementById("tab-cmd"),
      audio: document.getElementById("tab-audio"),
      animations: document.getElementById("tab-animations"),
      tags: document.getElementById("tab-tags")
    },
    graphCanvas: document.getElementById("graphCanvas"),
    graphSurface: document.getElementById("graphSurface"),
    graphSvg: document.getElementById("graphSvg"),
    graphNodes: document.getElementById("graphNodes"),
    graphTooltip: document.getElementById("graphTooltip"),
    graphLayoutBtn: document.getElementById("graphLayoutBtn"),
    graphResetBtn: document.getElementById("graphResetBtn"),
    graphSaveBtn: document.getElementById("graphSaveBtn"),
    graphErrorCount: document.getElementById("graphErrorCount"),
    storyPreview: document.getElementById("storyPreview"),
    templateButtons: Array.from(document.querySelectorAll(".template-btn")),
    previewFrame: document.getElementById("previewFrame"),
    previewRefreshBtn: document.getElementById("previewRefreshBtn"),
    previewTestBtn: document.getElementById("previewTestBtn"),
    previewOpenBtn: document.getElementById("previewOpenBtn"),
    previewSceneId: document.getElementById("previewSceneId"),
    previewMuteBtn: document.getElementById("previewMuteBtn"),
    previewActiveId: document.getElementById("previewActiveId")
  };

  const state = {
    story: normalizeStory(loadStory()),
    selectedIndex: 0,
    filter: "",
    activeTab: "scene",
    jsonCache: {},
    jsonErrors: {},
    saveTimer: null,
    statusTimer: null,
    history: {
      stack: [],
      lastAt: 0,
      lastType: ""
    },
    restoringHistory: false,
    groupCollapsed: loadGroupCollapsed(),
    graphPositions: loadGraphPositions(),
    graphIssues: { ids: new Set(), indices: new Set(), count: 0 },
    graphDrag: null,
    graphLink: null,
    graphZoom: loadGraphZoom(),
    graphPan: loadGraphPan(),
    timelineZoom: loadTimelineZoom(),
    timelineSelected: null,
    timelineDrag: null,
    timelineGroupsCollapsed: loadTimelineGroupsCollapsed(),
    previewMuted: loadPreviewMute(),
    previewIdTouched: false,
    previewSceneId: "",
    cmdScriptSelected: null,
    lastFocusedEl: null,
    lastFocusedId: "",
    focusBounceTimer: null
  };

  function loadStory() {
    const draft = loadDraft();
    if (draft) {
      initialDraftLoaded = true;
      return draft;
    }
    if (window.STORY && Array.isArray(window.STORY.scenes)) {
      return deepClone(window.STORY);
    }
    return deepClone(DEFAULT_STORY);
  }

  function deepClone(value) {
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value);
      } catch (err) {
        return JSON.parse(JSON.stringify(value));
      }
    }
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeStory(story) {
    const normalized = story && typeof story === "object" ? story : deepClone(DEFAULT_STORY);
    normalized.startSceneId = normalized.startSceneId ? String(normalized.startSceneId) : "1";
    normalized.observerLines = Array.isArray(normalized.observerLines) ? normalized.observerLines : [];
    normalized.audio = normalized.audio && typeof normalized.audio === "object" ? normalized.audio : deepClone(DEFAULT_STORY.audio);
    normalized.cmdScripts = Array.isArray(normalized.cmdScripts) ? normalized.cmdScripts : [];
    normalized.cmdScripts.forEach((script) => {
      if (!script || typeof script !== "object") return;
      if (!Array.isArray(script.steps)) {
        script.steps = [];
      }
    });
    normalized.scenes = Array.isArray(normalized.scenes) ? normalized.scenes : [];
    normalized.scenes.forEach((scene) => {
      scene.characters = Array.isArray(scene.characters) ? scene.characters : [];
      scene.choices = Array.isArray(scene.choices) ? scene.choices : [];
      scene.timeline = Array.isArray(scene.timeline) ? scene.timeline : [];
    });
    return normalized;
  }

  function setStatus(message) {
    ui.statusText.textContent = message || STATUS_IDLE;
    if (message && message !== STATUS_IDLE) {
      clearTimeout(state.statusTimer);
      state.statusTimer = setTimeout(() => setStatus(STATUS_IDLE), 2000);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  async function loadDraftFromDisk() {
    try {
      if (!window.system || !window.system.project || typeof window.system.project.readText !== "function") {
        return null;
      }
      const result = await window.system.project.readText({ relPath: DRAFT_FILE });
      if (!result || !result.ok || !result.content) {
        return null;
      }
      return JSON.parse(result.content);
    } catch (err) {
      return null;
    }
  }

  function saveDraftToDisk(payload) {
    try {
      if (!window.system || !window.system.project || typeof window.system.project.writeText !== "function") {
        return;
      }
      window.system.project.writeText({ relPath: DRAFT_FILE, content: payload }).catch(function () {});
    } catch (err) {
      // ignore
    }
  }

  function clearDraftFromDisk() {
    try {
      if (!window.system || !window.system.project || typeof window.system.project.deleteText !== "function") {
        return;
      }
      window.system.project.deleteText({ relPath: DRAFT_FILE }).catch(function () {});
    } catch (err) {
      // ignore
    }
  }

  function loadPreviewMute() {
    try {
      return localStorage.getItem(PREVIEW_MUTE_KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  const GROUPS_KEY = "editor_scene_groups_v1";
  const GRAPH_POS_KEY = "editor_graph_positions_v1";

  function loadGroupCollapsed() {
    try {
      const raw = localStorage.getItem(GROUPS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (err) {
      return {};
    }
  }

  function saveGroupCollapsed() {
    try {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(state.groupCollapsed || {}));
    } catch (err) {}
  }

  function loadGraphPositions() {
    try {
      const raw = localStorage.getItem(GRAPH_POS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (err) {
      return {};
    }
  }

  function saveGraphPositions() {
    try {
      localStorage.setItem(GRAPH_POS_KEY, JSON.stringify(state.graphPositions || {}));
    } catch (err) {}
  }

  async function loadGraphPositionsFromDisk() {
    try {
      if (!window.system || !window.system.project || typeof window.system.project.readText !== "function") {
        return null;
      }
      const result = await window.system.project.readText({ relPath: GRAPH_POS_FILE });
      if (!result || !result.ok || !result.content) {
        return null;
      }
      const parsed = JSON.parse(result.content);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function saveGraphPositionsToDisk() {
    try {
      if (!window.system || !window.system.project || typeof window.system.project.writeText !== "function") {
        return;
      }
      const payload = JSON.stringify(state.graphPositions || {});
      window.system.project.writeText({ relPath: GRAPH_POS_FILE, content: payload }).catch(function () {});
    } catch (err) {
      // ignore
    }
  }

  const HISTORY_MAX = 21;
  const HISTORY_INPUT_DEBOUNCE_MS = 800;

  function saveDraft() {
    try {
      const payload = JSON.stringify(state.story);
      localStorage.setItem(DRAFT_KEY, payload);
      saveDraftToDisk(payload);
      setStatus("Черновик сохранён");
    } catch (err) {
      console.warn("Не удалось сохранить черновик", err);
    }
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(saveDraft, 30000);
  }

  function softRefresh() {
    renderSceneList();
    renderValidation();
    renderPreview();
    syncPreviewSceneId(false);
    refreshTimelineTracks();
    refreshTimelineInspector(true);
  }

  function refreshCmdTab(forceSceneTab) {
    const scene = getScene();
    updateCmdTabVisibility(scene);
    if (ui.tabPanes.cmd) {
      ui.tabPanes.cmd.innerHTML = renderCmdTab(scene);
    }
    if (forceSceneTab && ui.tabPanes.scene && state.activeTab === "scene") {
      ui.tabPanes.scene.innerHTML = renderSceneTab(scene);
    }
  }

  function supportsFocusBounce() {
    return (
      window.system &&
      window.system.isElectron &&
      window.system.window &&
      typeof window.system.window.minimize === "function"
    );
  }

  function rememberFocusedElement(target) {
    if (!target) return;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
      state.lastFocusedEl = target;
      state.lastFocusedId = target.id || "";
    }
  }

  function restoreEditorFocus() {
    if (state.lastFocusedEl && document.contains(state.lastFocusedEl)) {
      state.lastFocusedEl.focus();
      return;
    }
    if (state.lastFocusedId) {
      const next = document.getElementById(state.lastFocusedId);
      if (next) {
        next.focus();
      }
    }
  }

  function scheduleFocusBounce() {
    clearTimeout(state.focusBounceTimer);
    if (!supportsFocusBounce()) return;
    if (!document.hasFocus()) return;
    state.focusBounceTimer = setTimeout(function () {
      if (document.hasFocus()) {
        window.system.window.minimize();
      }
    }, FOCUS_BOUNCE_MS);
  }

  function initFocusBounce() {
    if (!supportsFocusBounce()) return;
    document.addEventListener("focusin", function (event) {
      rememberFocusedElement(event.target);
    });
    window.addEventListener("focus", function () {
      restoreEditorFocus();
      scheduleFocusBounce();
    });
    window.addEventListener("blur", function () {
      rememberFocusedElement(document.activeElement);
      clearTimeout(state.focusBounceTimer);
    });
    scheduleFocusBounce();
  }

  function createSnapshot() {
    return {
      story: deepClone(state.story),
      selectedIndex: state.selectedIndex,
      jsonCache: deepClone(state.jsonCache),
      jsonErrors: deepClone(state.jsonErrors)
    };
  }

  function resetHistory() {
    state.history.stack = [createSnapshot()];
    state.history.lastAt = 0;
    state.history.lastType = "";
    updateUndoUi();
  }

  function updateUndoUi() {
    if (!ui.undoBtn) return;
    ui.undoBtn.disabled = state.history.stack.length <= 1;
  }

  function recordHistory(type) {
    if (state.restoringHistory) return;
    const history = state.history;
    const now = Date.now();
    const snapshot = createSnapshot();
    const canReplace =
      type === "input" &&
      history.lastType === "input" &&
      now - history.lastAt < HISTORY_INPUT_DEBOUNCE_MS &&
      history.stack.length;
    if (canReplace) {
      history.stack[history.stack.length - 1] = snapshot;
    } else {
      history.stack.push(snapshot);
      if (history.stack.length > HISTORY_MAX) {
        history.stack.shift();
      }
    }
    history.lastAt = now;
    history.lastType = type;
    updateUndoUi();
  }

  function undoLastChange() {
    if (state.history.stack.length <= 1) return;
    state.restoringHistory = true;
    state.history.stack.pop();
    const prev = state.history.stack[state.history.stack.length - 1];
    state.story = normalizeStory(deepClone(prev.story));
    state.selectedIndex = Math.max(0, Math.min(prev.selectedIndex, state.story.scenes.length - 1));
    state.jsonCache = deepClone(prev.jsonCache || {});
    state.jsonErrors = deepClone(prev.jsonErrors || {});
    state.restoringHistory = false;
    renderAll();
    scheduleSave();
    updateUndoUi();
  }

  function getScene() {
    return state.story.scenes[state.selectedIndex] || null;
  }

  function selectScene(index) {
    const safeIndex = Math.max(0, Math.min(index, state.story.scenes.length - 1));
    state.selectedIndex = safeIndex;
    state.timelineSelected = null;
    renderAll();
  }

  function addScene(scene) {
    const newScene = scene ? deepClone(scene) : createDefaultScene();
    newScene.id = suggestNewId();
    state.story.scenes.push(newScene);
    selectScene(state.story.scenes.length - 1);
    recordHistory("structure");
    scheduleSave();
  }

  function createDefaultScene() {
    return {
      id: "",
      label: "",
      speaker: "",
      text: "",
      backgroundImageName: "",
      characters: [],
      choices: [],
      timeline: []
    };
  }

  function suggestNewId() {
    const ids = state.story.scenes
      .map((scene) => parseInt(String(scene.id).split(".")[0], 10))
      .filter((value) => Number.isFinite(value));
    const next = ids.length ? Math.max(...ids) + 1 : 1;
    let candidate = String(next);
    const used = new Set(state.story.scenes.map((scene) => String(scene.id)));
    let counter = 1;
    while (used.has(candidate)) {
      candidate = String(next) + "-" + counter;
      counter += 1;
    }
    return candidate;
  }

  function getAllSceneIds() {
    const set = new Set();
    state.story.scenes.forEach((scene) => {
      const id = scene.id ? String(scene.id).trim() : "";
      if (id) set.add(id);
    });
    return set;
  }

  function getNextFreeNumericId(usedIds) {
    const used = usedIds || getAllSceneIds();
    let value = 1;
    while (used.has(String(value))) {
      value += 1;
    }
    return String(value);
  }

  function parseNumericId(id) {
    const match = /^(\d+)(?:\.(\d+))?$/.exec(String(id || "").trim());
    if (!match) return null;
    return {
      base: match[1],
      suffix: match[2] ? parseInt(match[2], 10) : null
    };
  }

  function getNextBranchId(base, usedIds, startSuffix) {
    const used = usedIds || getAllSceneIds();
    let suffix = Math.max(1, startSuffix || 1);
    let candidate = `${base}.${suffix}`;
    while (used.has(candidate)) {
      suffix += 1;
      candidate = `${base}.${suffix}`;
    }
    return candidate;
  }

  function findSceneIndexById(targetId) {
    const target = String(targetId || "").trim();
    if (!target) return -1;
    return state.story.scenes.findIndex((scene) => String(scene.id || "").trim() === target);
  }

  function collectOutgoingTargets(scene) {
    const targets = [];
    if (scene.next) {
      targets.push(String(scene.next).trim());
    }
    if (Array.isArray(scene.choices)) {
      scene.choices.forEach((choice) => {
        if (choice && choice.next) {
          targets.push(String(choice.next).trim());
        }
      });
    }
    return Array.from(new Set(targets.filter(Boolean)));
  }

  function ensureChoices(scene) {
    if (!Array.isArray(scene.choices)) {
      scene.choices = [];
    }
  }

  function hasChoiceTarget(scene, targetId) {
    if (!Array.isArray(scene.choices)) return false;
    const target = String(targetId || "").trim();
    if (!target) return false;
    return scene.choices.some((choice) => String(choice.next || "").trim() === target);
  }

  function addChoice(scene, text, targetId) {
    const target = String(targetId || "").trim();
    if (!target) return;
    ensureChoices(scene);
    if (hasChoiceTarget(scene, target)) return;
    scene.choices.push({ text: text || "", next: target });
  }

  function convertNextToChoice(scene, label) {
    if (!scene || !scene.next) return;
    const target = String(scene.next).trim();
    if (!target) return;
    delete scene.next;
    ensureChoices(scene);
    if (!hasChoiceTarget(scene, target)) {
      scene.choices.unshift({ text: label || "Продолжить", next: target });
    }
  }

  function renameSceneId(oldId, newId) {
    const from = String(oldId || "").trim();
    const to = String(newId || "").trim();
    if (!from || !to || from === to) return false;
    let changed = false;
    state.story.scenes.forEach((scene) => {
      if (String(scene.id || "").trim() === from) {
        scene.id = to;
        changed = true;
      }
      ["next", "timeoutNext", "fallbackNext"].forEach((field) => {
        if (scene[field] && String(scene[field]).trim() === from) {
          scene[field] = to;
          changed = true;
        }
      });
      if (Array.isArray(scene.choices)) {
        scene.choices.forEach((choice) => {
          if (choice.next && String(choice.next).trim() === from) {
            choice.next = to;
            changed = true;
          }
          if (choice.timeoutNext && String(choice.timeoutNext).trim() === from) {
            choice.timeoutNext = to;
            changed = true;
          }
        });
      }
    });
    if (state.story.startSceneId && String(state.story.startSceneId).trim() === from) {
      state.story.startSceneId = to;
      changed = true;
    }
    const keyFrom = `id:${from}`;
    const keyTo = `id:${to}`;
    if (state.graphPositions && state.graphPositions[keyFrom]) {
      if (!state.graphPositions[keyTo]) {
        state.graphPositions[keyTo] = state.graphPositions[keyFrom];
      }
      delete state.graphPositions[keyFrom];
      saveGraphPositions();
      changed = true;
    }
    return changed;
  }

  function cloneForChild(parent) {
    const source = parent ? deepClone(parent) : createDefaultScene();
    source.id = "";
    source.label = "";
    source.text = "";
    source.textVariants = [];
    source.next = "";
    source.timeoutNext = "";
    source.fallbackNext = "";
    source.choices = [];
    source.timeline = [];
    source.timeLimitMs = "";
    source.timeoutChoiceText = "";
    delete source.checkpoint;
    delete source.once;
    return source;
  }

  function getScenePosition(index) {
    const scene = state.story.scenes[index];
    if (!scene) return { x: 0, y: 0 };
    const key = getSceneKey(scene, index);
    const stored = state.graphPositions && state.graphPositions[key];
    if (stored) return stored;
    const data = state.graphData || buildGraphData();
    const defaults = computeDefaultPositions(data.nodes);
    return defaults[key] || { x: 0, y: 0 };
  }

  function addSceneWithId(sceneTemplate, id, position) {
    const newScene = sceneTemplate ? deepClone(sceneTemplate) : createDefaultScene();
    newScene.id = String(id || "").trim();
    state.story.scenes.push(newScene);
    const index = state.story.scenes.length - 1;
    if (position && newScene.id) {
      state.graphPositions[`id:${newScene.id}`] = position;
      saveGraphPositions();
    }
    return index;
  }

  function finalizeGraphAction(selectIndex) {
    if (Number.isFinite(selectIndex)) {
      state.selectedIndex = Math.max(0, Math.min(selectIndex, state.story.scenes.length - 1));
    }
    recordHistory("structure");
    scheduleSave();
    renderAll();
  }

  function duplicateScene() {
    duplicateSceneAt(state.selectedIndex);
  }

  function duplicateSceneAt(index) {
    const scene = state.story.scenes[index];
    if (!scene) return;
    const copy = deepClone(scene);
    copy.id = getNextFreeNumericId();
    state.story.scenes.splice(index + 1, 0, copy);
    const sourcePos = getScenePosition(index);
    if (copy.id) {
      state.graphPositions[`id:${copy.id}`] = {
        x: sourcePos.x + Math.round(GRAPH_COL_GAP * 0.2),
        y: sourcePos.y + Math.round(GRAPH_ROW_GAP * 0.4)
      };
      saveGraphPositions();
    }
    selectScene(index + 1);
    recordHistory("structure");
    scheduleSave();
  }

  function deleteScene() {
    if (!state.story.scenes.length) return;
    state.story.scenes.splice(state.selectedIndex, 1);
    selectScene(Math.max(0, state.selectedIndex - 1));
    recordHistory("structure");
    scheduleSave();
  }

  function moveScene(direction) {
    const index = state.selectedIndex;
    const target = index + direction;
    if (target < 0 || target >= state.story.scenes.length) return;
    const scenes = state.story.scenes;
    const [scene] = scenes.splice(index, 1);
    scenes.splice(target, 0, scene);
    selectScene(target);
    recordHistory("structure");
    scheduleSave();
  }

  function applyTemplate(kind) {
    const template = createTemplate(kind);
    addScene(template);
  }

  function createTemplate(kind) {
    const base = createDefaultScene();
    if (kind === "dialog") {
      return {
        ...base,
        speaker: "Оферус",
        text: "Пример диалога.",
        backgroundImageName: "morning.png",
        characters: [{ characterId: "flavy", pose: "joy_greet", position: "center" }],
        next: ""
      };
    }
    if (kind === "choice") {
      return {
        ...base,
        speaker: "Оферус",
        text: "Сделай выбор:",
        choices: [
          { text: "Вариант 1", next: "" },
          { text: "Вариант 2", next: "" }
        ]
      };
    }
    if (kind === "pause") {
      return {
        ...base,
        speaker: "SYSTEM",
        text: "Пауза... [pause=600] продолжаем."
      };
    }
    if (kind === "horror") {
      return {
        ...base,
        speaker: "Оферус",
        text: "Я слышу [glitch rate=0.4 ms=120]шёпот[/glitch] вокруг.",
        effects: ["flicker", "noise"],
        timeline: [{ at: 800, type: "effect", effect: "flash" }]
      };
    }
    return base;
  }

  function renderAll() {
    renderSceneList();
    renderTabs();
    renderValidation();
    renderPreview();
    syncPreviewSceneId(false);
    updatePreviewMuteUi();
  }

  function getSceneGroupPath(scene) {
    const folder = scene.folder ? String(scene.folder).trim() : "";
    if (folder) {
      const segments = folder.split("/").map((seg) => seg.trim()).filter(Boolean);
      return { prefix: "f", segments: segments.length ? segments : ["(без папки)"] };
    }
    const id = scene.id ? String(scene.id).trim() : "";
    if (id) {
      const segments = id.split(".").map((seg) => seg.trim()).filter(Boolean);
      return { prefix: "i", segments: segments.length ? segments : ["(без ID)"] };
    }
    return { prefix: "i", segments: ["(без ID)"] };
  }

  function buildSceneTree() {
    const root = { key: "", label: "", children: new Map(), scenes: [], count: 0, hasMatch: false };
    state.story.scenes.forEach((scene, index) => {
      const { prefix, segments } = getSceneGroupPath(scene);
      let node = root;
      let path = "";
      segments.forEach((seg) => {
        path = path ? path + "/" + seg : seg;
        const key = `${prefix}:${path}`;
        let child = node.children.get(key);
        if (!child) {
          child = { key, label: seg, children: new Map(), scenes: [], count: 0, hasMatch: false };
          node.children.set(key, child);
        }
        node = child;
      });
      node.scenes.push({ scene, index });
    });
    return root;
  }

  function computeNodeMeta(node, sceneMatches) {
    let count = 0;
    let hasMatch = false;
    node.scenes.forEach((entry) => {
      count += 1;
      if (sceneMatches.get(entry.index)) {
        hasMatch = true;
      }
    });
    node.children.forEach((child) => {
      const childMeta = computeNodeMeta(child, sceneMatches);
      count += childMeta.count;
      if (childMeta.hasMatch) {
        hasMatch = true;
      }
    });
    node.count = count;
    node.hasMatch = hasMatch;
    return { count, hasMatch };
  }

  function renderGroup(node, depth, container, sceneMatches, filterActive) {
    let childrenContainer = container;
    if (node.key) {
      if (filterActive && !node.hasMatch) {
        return;
      }
      const collapsed = !filterActive && state.groupCollapsed[node.key];
      const groupItem = document.createElement("li");
      groupItem.className = "scene-group" + (collapsed ? " collapsed" : "");
      groupItem.dataset.groupKey = node.key;
      const header = document.createElement("div");
      header.className = "scene-group-header";
      header.dataset.groupKey = node.key;
      header.style.setProperty("--depth", depth);
      header.innerHTML = `
        <span class="caret"></span>
        <span class="group-title">${escapeHtml(node.label)}</span>
        <span class="group-count">${node.count}</span>
      `;
      const children = document.createElement("ul");
      children.className = "scene-children";
      groupItem.appendChild(header);
      groupItem.appendChild(children);
      container.appendChild(groupItem);
      childrenContainer = children;
      depth += 1;
    }

    node.scenes.forEach((entry) => {
      if (filterActive && !sceneMatches.get(entry.index)) {
        return;
      }
      const scene = entry.scene;
      const index = entry.index;
      const id = scene.id ? String(scene.id) : "(без ID)";
      const text = scene.text ? String(scene.text) : "";
      const label = scene.label ? String(scene.label) : "";
      const item = document.createElement("li");
      item.className = "scene-item" + (index === state.selectedIndex ? " active" : "");
      item.dataset.index = String(index);
      item.style.setProperty("--depth", depth);
      item.innerHTML = `
        <div class="scene-id">${id}${label ? " • " + escapeHtml(label) : ""}</div>
        <div class="scene-text">${escapeHtml(text).slice(0, 140)}</div>
      `;
      childrenContainer.appendChild(item);
    });

    node.children.forEach((child) => {
      renderGroup(child, depth, childrenContainer, sceneMatches, filterActive);
    });
  }

  function renderSceneList() {
    const filter = state.filter.trim().toLowerCase();
    ui.sceneList.innerHTML = "";
    const sceneMatches = new Map();
    state.story.scenes.forEach((scene, index) => {
      const id = scene.id ? String(scene.id) : "";
      const text = scene.text ? String(scene.text) : "";
      const label = scene.label ? String(scene.label) : "";
      const folder = scene.folder ? String(scene.folder) : "";
      const searchable = (id + " " + text + " " + label + " " + folder).toLowerCase();
      sceneMatches.set(index, !filter || searchable.includes(filter));
    });

    const tree = buildSceneTree();
    computeNodeMeta(tree, sceneMatches);
    tree.children.forEach((child) => {
      renderGroup(child, 0, ui.sceneList, sceneMatches, Boolean(filter));
    });
  }

  function renderTabs() {
    const scene = getScene();
    updateCmdTabVisibility(scene);
    ui.tabPanes.scene.innerHTML = renderSceneTab(scene);
    ui.tabPanes.characters.innerHTML = renderCharactersTab(scene);
    ui.tabPanes.choices.innerHTML = renderChoicesTab(scene);
    ui.tabPanes.timeline.innerHTML = renderTimelineTab(scene);
    ui.tabPanes.cmd.innerHTML = renderCmdTab(scene);
    ui.tabPanes.audio.innerHTML = renderAudioTab(scene);
    ui.tabPanes.animations.innerHTML = renderAnimationsTab(scene);
    ui.tabPanes.tags.innerHTML = renderTagsTab();
  }

  function updateCmdTabVisibility(scene) {
    const enabled = Boolean(scene && scene.cmd && scene.cmd.enabled);
    const cmdTabBtn = ui.tabs.find((btn) => btn.dataset.tab === "cmd");
    if (cmdTabBtn) {
      cmdTabBtn.hidden = !enabled;
    }
    if (ui.tabPanes.cmd) {
      ui.tabPanes.cmd.hidden = !enabled;
    }
    if (!enabled && state.activeTab === "cmd") {
      state.activeTab = "scene";
      ui.tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === "scene"));
      Object.entries(ui.tabPanes).forEach(([key, pane]) => {
        if (pane) pane.classList.toggle("active", key === "scene");
      });
    }
  }

  function renderSceneTab(scene) {
    if (!scene) return `<div class="section"><div class="section-title">Нет сцен</div></div>`;
    const cmdEnabled = Boolean(scene.cmd && scene.cmd.enabled);
    const cmdSource = scene.cmd && scene.cmd.source ? scene.cmd.source : "inline";
    const textVariants = Array.isArray(scene.textVariants) ? scene.textVariants.join("\n") : "";
    const effects = Array.isArray(scene.effects) ? scene.effects.join(", ") : "";
    const observerLines = Array.isArray(state.story.observerLines) ? state.story.observerLines.join("\n") : "";
    const setFlags = getJsonValue("scene", state.selectedIndex, "setFlags", scene.setFlags);
    const addVars = getJsonValue("scene", state.selectedIndex, "addVars", scene.addVars);
    const ifFlags = getJsonValue("scene", state.selectedIndex, "ifFlags", scene.ifFlags);
    const ifVars = getJsonValue("scene", state.selectedIndex, "ifVars", scene.ifVars);
    const cmdSummary = cmdEnabled ? renderCmdSummary(scene) : "";
    let cmdQuickTextSource = "";
    if (cmdEnabled && cmdSource === "script") {
      const script = getCmdScriptById(scene.cmd ? scene.cmd.scriptId : "");
      cmdQuickTextSource = script ? getCmdQuickText({ cmd: { steps: script.steps || [] } }) : "";
    } else if (cmdEnabled) {
      cmdQuickTextSource = getCmdQuickText(scene);
    }
    const cmdQuickText = cmdEnabled ? escapeHtml(cmdQuickTextSource) : "";
    return `
      <div class="section">
        <div class="section-title">Глобальные настройки story.js</div>
        <div class="fields">
          <div class="field">
            <label>startSceneId</label>
            <input class="input" data-scope="story" data-field="startSceneId" value="${escapeAttr(state.story.startSceneId)}" />
          </div>
          <div class="field">
            <label>observerLines (по строкам)</label>
            <textarea class="input" data-scope="story" data-field="observerLines" data-kind="lines">${escapeHtml(observerLines)}</textarea>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Поля сцены</div>
        <div class="fields">
          <div class="field">
            <label>ID</label>
            <input class="input" data-scope="scene" data-field="id" value="${escapeAttr(scene.id || "")}" />
          </div>
          <div class="field">
            <label>Label</label>
            <input class="input" data-scope="scene" data-field="label" value="${escapeAttr(scene.label || "")}" />
          </div>
          <div class="field">
            <label>Folder</label>
            <input class="input" data-scope="scene" data-field="folder" value="${escapeAttr(scene.folder || "")}" />
          </div>
          <div class="field">
            <label>Speaker</label>
            <input class="input" data-scope="scene" data-field="speaker" value="${escapeAttr(scene.speaker || "")}" />
          </div>
          <div class="field">
            <label>Background (backgroundImageName)</label>
            <input class="input" data-scope="scene" data-field="backgroundImageName" value="${escapeAttr(scene.backgroundImageName || "")}" />
          </div>
          <div class="field">
            <label>Next</label>
            <input class="input" data-scope="scene" data-field="next" value="${escapeAttr(scene.next || "")}" />
          </div>
          <div class="field">
            <label>Timeout Next</label>
            <input class="input" data-scope="scene" data-field="timeoutNext" value="${escapeAttr(scene.timeoutNext || "")}" />
          </div>
          <div class="field">
            <label>Fallback Next</label>
            <input class="input" data-scope="scene" data-field="fallbackNext" value="${escapeAttr(scene.fallbackNext || "")}" />
          </div>
          <div class="field">
            <label>Time Limit (ms)</label>
            <input class="input" data-scope="scene" data-field="timeLimitMs" data-kind="number" value="${escapeAttr(scene.timeLimitMs ?? "")}" />
          </div>
          <div class="field">
            <label>Timeout Choice Text</label>
            <input class="input" data-scope="scene" data-field="timeoutChoiceText" value="${escapeAttr(scene.timeoutChoiceText || "")}" />
          </div>
          <div class="field">
            <label>Character Scale</label>
            <input class="input" data-scope="scene" data-field="characterScale" data-kind="number" value="${escapeAttr(scene.characterScale ?? "")}" />
          </div>
          <div class="field">
            <label>Active Character</label>
            <input class="input" data-scope="scene" data-field="activeCharacter" value="${escapeAttr(scene.activeCharacter || "")}" />
          </div>
          <div class="field">
            <label>Text Variants (по строкам)</label>
            <textarea class="input" data-scope="scene" data-field="textVariants" data-kind="lines">${escapeHtml(textVariants)}</textarea>
          </div>
          <div class="field">
            <label>Glitch Rate</label>
            <input class="input" data-scope="scene" data-field="glitchRate" data-kind="number" value="${escapeAttr(scene.glitchRate ?? "")}" />
          </div>
          <div class="field">
            <label>Effects (через запятую)</label>
            <input class="input" data-scope="scene" data-field="effects" data-kind="comma" value="${escapeAttr(effects)}" />
          </div>
          <div class="field">
            <label><input type="checkbox" data-scope="scene" data-field="cmd.enabled" data-kind="boolean" ${cmdEnabled ? "checked" : ""} /> CMD для сцены</label>
          </div>
        </div>

        <div class="fields">
          <div class="field">
            <label><input type="checkbox" data-scope="scene" data-field="checkpoint" data-kind="boolean" ${scene.checkpoint ? "checked" : ""} /> checkpoint</label>
          </div>
          <div class="field">
            <label><input type="checkbox" data-scope="scene" data-field="once" data-kind="boolean" ${scene.once ? "checked" : ""} /> once (одноразовая сцена)</label>
          </div>
        </div>

        <div class="fields">
          <div class="field">
            <label>ifFlags (JSON)</label>
            <textarea class="input ${jsonErrorClass("scene", state.selectedIndex, "ifFlags")}" data-scope="scene" data-field="ifFlags" data-kind="json">${escapeHtml(ifFlags)}</textarea>
          </div>
          <div class="field">
            <label>ifVars (JSON)</label>
            <textarea class="input ${jsonErrorClass("scene", state.selectedIndex, "ifVars")}" data-scope="scene" data-field="ifVars" data-kind="json">${escapeHtml(ifVars)}</textarea>
          </div>
          <div class="field">
            <label>setFlags (JSON)</label>
            <textarea class="input ${jsonErrorClass("scene", state.selectedIndex, "setFlags")}" data-scope="scene" data-field="setFlags" data-kind="json">${escapeHtml(setFlags)}</textarea>
          </div>
          <div class="field">
            <label>addVars (JSON)</label>
            <textarea class="input ${jsonErrorClass("scene", state.selectedIndex, "addVars")}" data-scope="scene" data-field="addVars" data-kind="json">${escapeHtml(addVars)}</textarea>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Текст сцены</div>
        <div class="cmd-text-grid ${cmdEnabled ? "cmd-enabled" : ""}">
          <div class="field">
            <label>Текст сцены</label>
            <textarea class="input" data-scope="scene" data-field="text">${escapeHtml(scene.text || "")}</textarea>
          </div>
          ${cmdEnabled ? `
          <div class="field">
            <label>CMD‑текст (быстро)</label>
            <textarea class="input" data-scope="scene" data-field="cmd.quickText" data-kind="cmdLines" placeholder="Каждая строка — print в CMD." ${cmdSource !== "inline" ? "readonly" : ""}>${cmdQuickText}</textarea>
            ${cmdSource !== "inline" ? `<div class="muted">Inline‑редактирование недоступно при source=script.</div>` : ""}
            ${cmdSummary}
          </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  function ensureSceneCmd(scene) {
    if (!scene.cmd || typeof scene.cmd !== "object") {
      scene.cmd = { enabled: true, source: "inline", startAt: 0, steps: [] };
      return scene.cmd;
    }
    if (!scene.cmd.source) scene.cmd.source = "inline";
    if (!Array.isArray(scene.cmd.steps)) scene.cmd.steps = [];
    if (scene.cmd.startAt === undefined || scene.cmd.startAt === null) {
      scene.cmd.startAt = 0;
    }
    return scene.cmd;
  }

  function getCmdQuickText(scene) {
    if (!scene || !scene.cmd || !Array.isArray(scene.cmd.steps)) {
      return "";
    }
    const lines = [];
    scene.cmd.steps.forEach((step) => {
      const type = String(step.type || "").toLowerCase();
      if (type !== "print" && type !== "type") return;
      if (Array.isArray(step.lines)) {
        step.lines.forEach((line) => lines.push(String(line)));
        return;
      }
      if (step.text !== undefined && step.text !== null) {
        String(step.text).split(/\r?\n/).forEach((line) => lines.push(line));
      }
    });
    return lines.join("\n");
  }

  function applyCmdQuickText(scene, value) {
    const cmd = ensureSceneCmd(scene);
    cmd.enabled = true;
    cmd.source = "inline";
    const lines = String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    cmd.steps = lines.map((line) => ({ type: "print", text: line }));
  }

  function renderCmdSummary(scene) {
    if (!scene || !scene.cmd) return "";
    let previewSource = "";
    if (scene.cmd.source === "script") {
      const script = getCmdScriptById(scene.cmd.scriptId || "");
      if (script && Array.isArray(script.steps)) {
        const tempScene = { cmd: { steps: script.steps } };
        previewSource = getCmdQuickText(tempScene);
      }
    } else {
      previewSource = getCmdQuickText(scene);
    }
    const preview = previewSource.split(/\r?\n/).filter(Boolean).slice(0, 3);
    if (!preview.length) {
      return `<div class="muted cmd-summary">CMD: нет строк</div>`;
    }
    return `<div class="muted cmd-summary">CMD: ${escapeHtml(preview.join(" / "))}${preview.length >= 3 ? "…" : ""}</div>`;
  }

  function renderOverlayFields(overlay, index) {
    const data = overlay || {};
    const videoName = data.videoName || data.src || "";
    const hasOverlay = Boolean(videoName);
    const anchor = data.anchor || "";
    return `
      <div class="field-group">
        <div class="field-group-title">Overlay video</div>
        <div class="field">
          <label>Video</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.videoName" value="${escapeAttr(videoName)}" />
        </div>
        <div class="field">
          <label>X</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.x" data-kind="number" value="${escapeAttr(data.x ?? "")}" />
        </div>
        <div class="field">
          <label>Y</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.y" data-kind="number" value="${escapeAttr(data.y ?? "")}" />
        </div>
        <div class="field">
          <label>Width</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.width" data-kind="number" value="${escapeAttr(data.width ?? "")}" />
        </div>
        <div class="field">
          <label>Height</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.height" data-kind="number" value="${escapeAttr(data.height ?? "")}" />
        </div>
        <div class="field">
          <label>X px</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.xPx" data-kind="number" value="${escapeAttr(data.xPx ?? "")}" />
        </div>
        <div class="field">
          <label>Y px</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.yPx" data-kind="number" value="${escapeAttr(data.yPx ?? "")}" />
        </div>
        <div class="field">
          <label>Width px</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.widthPx" data-kind="number" value="${escapeAttr(data.widthPx ?? "")}" />
        </div>
        <div class="field">
          <label>Height px</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.heightPx" data-kind="number" value="${escapeAttr(data.heightPx ?? "")}" />
        </div>
        <div class="field">
          <label>Opacity</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.opacity" data-kind="number" value="${escapeAttr(data.opacity ?? "")}" />
        </div>
        <div class="field">
          <label>Blend</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.blend" value="${escapeAttr(data.blend || "")}" />
        </div>
        <div class="field">
          <label>Anchor</label>
          <select class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.anchor">
            <option value="" ${!anchor ? "selected" : ""}>—</option>
            <option value="center" ${anchor === "center" ? "selected" : ""}>center</option>
          </select>
        </div>
        <div class="field">
          <label>Scale</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.scale" data-kind="number" value="${escapeAttr(data.scale ?? "")}" />
        </div>
        <div class="field">
          <label>Playback rate</label>
          <input class="input" data-collection="characters" data-index="${index}" data-field="overlayVideo.playbackRate" data-kind="number" value="${escapeAttr(data.playbackRate ?? "")}" />
        </div>
        <div class="field">
          <label><input type="checkbox" data-collection="characters" data-index="${index}" data-field="overlayVideo.loop" data-kind="boolean" ${hasOverlay && data.loop !== false ? "checked" : ""} /> loop</label>
        </div>
        <div class="field">
          <label><input type="checkbox" data-collection="characters" data-index="${index}" data-field="overlayVideo.muted" data-kind="boolean" ${hasOverlay && data.muted !== false ? "checked" : ""} /> muted</label>
        </div>
        <div class="field">
          <label><input type="checkbox" data-collection="characters" data-index="${index}" data-field="overlayVideo.autoplay" data-kind="boolean" ${hasOverlay && data.autoplay !== false ? "checked" : ""} /> autoplay</label>
        </div>
      </div>
    `;
  }

  function renderCharactersTab(scene) {
    if (!scene) return `<div class="section"><div class="section-title">Нет сцен</div></div>`;
    const list = Array.isArray(scene.characters) ? scene.characters : [];
    const items = list
      .map((entry, index) => {
        const refType = entry.characterId ? "characterId" : (entry.use ? "use" : "characterId");
        const refId = entry.characterId || entry.use || "";
        const pose = entry.pose || entry.imageKey || "";
        const extraJson = getExtraJson(entry);
        const poseOptions = getPoseOptions(refId, pose);
        const overlay = entry.overlayVideo || entry.videoOverlay || {};
        return `
          <div class="list-item" data-index="${index}">
            <div class="list-item-header">
              <div class="list-item-title">Персонаж #${index + 1}</div>
              <button class="btn danger" data-action="remove-character" data-index="${index}">Удалить</button>
            </div>
            <div class="fields">
              <div class="field">
                <label>Ref Type</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="refType">
                  <option value="characterId" ${refType === "characterId" ? "selected" : ""}>characterId</option>
                  <option value="use" ${refType === "use" ? "selected" : ""}>use</option>
                </select>
              </div>
              <div class="field">
                <label>Character ID</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="characterId">
                  <option value=""></option>
                  ${characterIds.map((id) => `<option value="${escapeAttr(id)}" ${id === refId ? "selected" : ""}>${escapeHtml(id)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label>Pose</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="pose">
                  <option value=""></option>
                  ${poseOptions}
                </select>
              </div>
              <div class="field">
                <label>Name</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="name" value="${escapeAttr(entry.name || "")}" />
              </div>
              <div class="field">
                <label>Entry ID</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="id" value="${escapeAttr(entry.id || "")}" />
              </div>
              <div class="field">
                <label>Name</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="name" value="${escapeAttr(entry.name || "")}" />
              </div>
              <div class="field">
                <label>Entry ID</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="id" value="${escapeAttr(entry.id || "")}" />
              </div>
              <div class="field">
                <label>Position</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="position">
                  ${renderPositionOptions(entry.position)}
                </select>
              </div>
              <div class="field">
                <label>X</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="x" data-kind="number" value="${escapeAttr(entry.x ?? "")}" />
              </div>
              <div class="field">
                <label>Y</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="y" data-kind="number" value="${escapeAttr(entry.y ?? "")}" />
              </div>
              <div class="field">
                <label>Offset X</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="offsetX" data-kind="number" value="${escapeAttr(entry.offsetX ?? "")}" />
              </div>
              <div class="field">
                <label>Offset Y</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="offsetY" data-kind="number" value="${escapeAttr(entry.offsetY ?? "")}" />
              </div>
              <div class="field">
                <label>Size</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="size" data-kind="number" value="${escapeAttr(entry.size ?? "")}" />
              </div>
              <div class="field">
                <label>Opacity</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="opacity" data-kind="number" value="${escapeAttr(entry.opacity ?? "")}" />
              </div>
              <div class="field">
                <label>Enter</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="enter">
                  ${renderEnterOptions(entry.enter)}
                </select>
              </div>
              <div class="field">
                <label>Frames (по строкам)</label>
                <textarea class="input" data-collection="characters" data-index="${index}" data-field="frames" data-kind="lines">${escapeHtml(Array.isArray(entry.frames) ? entry.frames.join("\n") : "")}</textarea>
              </div>
              <div class="field">
                <label>Frame ms</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="frameMs" data-kind="number" value="${escapeAttr(entry.frameMs ?? "")}" />
              </div>
              <div class="field">
                <label>Frame mode</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="frameMode">
                  ${renderFrameModeOptions(entry.frameMode)}
                </select>
              </div>
              ${renderOverlayFields(overlay, index)}
              <div class="field">
                <label>Доп. поля (JSON)</label>
                <textarea class="input ${jsonErrorClass("characters", index, "extra")}" data-collection="characters" data-index="${index}" data-field="extra" data-kind="json">${escapeHtml(extraJson)}</textarea>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <div class="section-title">Персонажи сцены</div>
        <div class="inline">
          <button class="btn primary" data-action="add-character">+ Добавить персонажа</button>
        </div>
        <div class="stack">
          ${items || "<div class='muted'>Пока нет персонажей.</div>"}
        </div>
      </div>
    `;
  }

  function renderChoicesTab(scene) {
    if (!scene) return `<div class="section"><div class="section-title">Нет сцен</div></div>`;
    const list = Array.isArray(scene.choices) ? scene.choices : [];
    const items = list
      .map((choice, index) => {
        const ifFlags = getJsonValue("choices", index, "ifFlags", choice.ifFlags);
        const ifVars = getJsonValue("choices", index, "ifVars", choice.ifVars);
        const action = getJsonValue("choices", index, "action", choice.action);
        const effects = Array.isArray(choice.effects) ? choice.effects.join(", ") : "";
        return `
          <div class="list-item" data-index="${index}">
            <div class="list-item-header">
              <div class="list-item-title">Выбор #${index + 1}</div>
              <button class="btn danger" data-action="remove-choice" data-index="${index}">Удалить</button>
            </div>
            <div class="fields">
              <div class="field">
                <label>Text</label>
                <input class="input" data-collection="choices" data-index="${index}" data-field="text" value="${escapeAttr(choice.text || "")}" />
              </div>
              <div class="field">
                <label>Next</label>
                <input class="input" data-collection="choices" data-index="${index}" data-field="next" value="${escapeAttr(choice.next || "")}" />
              </div>
              <div class="field">
                <label>Timeout Next</label>
                <input class="input" data-collection="choices" data-index="${index}" data-field="timeoutNext" value="${escapeAttr(choice.timeoutNext || "")}" />
              </div>
              <div class="field">
                <label>Effects (через запятую)</label>
                <input class="input" data-collection="choices" data-index="${index}" data-field="effects" data-kind="comma" value="${escapeAttr(effects)}" />
              </div>
              <div class="field">
                <label><input type="checkbox" data-collection="choices" data-index="${index}" data-field="showLocked" data-kind="boolean" ${choice.showLocked ? "checked" : ""} /> showLocked</label>
              </div>
              <div class="field">
                <label>Locked Text</label>
                <input class="input" data-collection="choices" data-index="${index}" data-field="lockedText" value="${escapeAttr(choice.lockedText || "")}" />
              </div>
              <div class="field">
                <label>ifFlags (JSON)</label>
                <textarea class="input ${jsonErrorClass("choices", index, "ifFlags")}" data-collection="choices" data-index="${index}" data-field="ifFlags" data-kind="json">${escapeHtml(ifFlags)}</textarea>
              </div>
              <div class="field">
                <label>ifVars (JSON)</label>
                <textarea class="input ${jsonErrorClass("choices", index, "ifVars")}" data-collection="choices" data-index="${index}" data-field="ifVars" data-kind="json">${escapeHtml(ifVars)}</textarea>
              </div>
              <div class="field">
                <label>Action (JSON)</label>
                <textarea class="input ${jsonErrorClass("choices", index, "action")}" data-collection="choices" data-index="${index}" data-field="action" data-kind="json">${escapeHtml(action)}</textarea>
                <div class="muted">Пример: {"type":"input.playername","title":"Имя","message":"Как тебя зовут?","next":"4.1"}</div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <div class="section-title">Выборы</div>
        <div class="inline">
          <button class="btn primary" data-action="add-choice">+ Добавить выбор</button>
        </div>
        <div class="stack">
          ${items || "<div class='muted'>Пока нет выборов.</div>"}
        </div>
      </div>
    `;
  }

  function renderTimelineTab(scene) {
    if (!scene) return `<div class="section"><div class="section-title">Нет сцен</div></div>`;
    const list = Array.isArray(scene.timeline) ? scene.timeline : [];
    const items = list
      .map((entry, index) => {
        const payload = getJsonValue("timeline", index, "payload", entry.payload);
        return `
          <div class="list-item" data-index="${index}">
            <div class="list-item-header">
              <div class="list-item-title">Событие #${index + 1}</div>
              <button class="btn danger" data-action="remove-timeline" data-index="${index}">Удалить</button>
            </div>
            <div class="fields">
              <div class="field">
                <label>At (ms)</label>
                <input class="input" data-collection="timeline" data-index="${index}" data-field="at" data-kind="number" value="${escapeAttr(entry.at ?? "")}" />
              </div>
              <div class="field">
                <label>Type</label>
                <select class="input" data-collection="timeline" data-index="${index}" data-field="type">
                  ${renderTimelineTypeOptions(entry.type)}
                </select>
              </div>
              <div class="field">
                <label>Message</label>
                <input class="input" data-collection="timeline" data-index="${index}" data-field="message" value="${escapeAttr(entry.message || "")}" />
              </div>
              <div class="field">
                <label>Title</label>
                <input class="input" data-collection="timeline" data-index="${index}" data-field="title" value="${escapeAttr(entry.title || "")}" />
              </div>
              <div class="field">
                <label>Effect</label>
                <input class="input" data-collection="timeline" data-index="${index}" data-field="effect" value="${escapeAttr(entry.effect || "")}" />
              </div>
              <div class="field">
                <label>Next</label>
                <input class="input" data-collection="timeline" data-index="${index}" data-field="next" value="${escapeAttr(entry.next || "")}" />
              </div>
              <div class="field">
                <label>System op</label>
                <input class="input" data-collection="timeline" data-index="${index}" data-field="op" value="${escapeAttr(entry.op || "")}" />
              </div>
              <div class="field">
                <label>Payload (JSON)</label>
                <textarea class="input ${jsonErrorClass("timeline", index, "payload")}" data-collection="timeline" data-index="${index}" data-field="payload" data-kind="json">${escapeHtml(payload)}</textarea>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="section">
        <div class="section-title">Таймлайн</div>
        <div class="inline">
          <button class="btn primary" data-action="add-timeline">+ Добавить событие</button>
        </div>
        <div class="stack">
          ${items || "<div class='muted'>Пока нет событий.</div>"}
        </div>
      </div>
    `;
  }

  function getCmdScripts() {
    return Array.isArray(state.story.cmdScripts) ? state.story.cmdScripts : [];
  }

  function getCmdScriptIndexById(id) {
    const scripts = getCmdScripts();
    const target = String(id || "");
    return scripts.findIndex((script) => String(script.id || "") === target);
  }

  function getCmdScriptById(id) {
    const scripts = getCmdScripts();
    const index = getCmdScriptIndexById(id);
    return index >= 0 ? scripts[index] : null;
  }

  function ensureCmdStepsArray(target) {
    if (!target.steps || !Array.isArray(target.steps)) {
      target.steps = [];
    }
    return target.steps;
  }

  function renderCmdTab(scene) {
    if (!scene) {
      return `<div class="section"><div class="section-title">CMD</div><div class="muted">Нет сцен.</div></div>`;
    }
    if (!scene.cmd || !scene.cmd.enabled) {
      return `<div class="section"><div class="section-title">CMD</div><div class="muted">Включи «CMD для сцены» во вкладке «Сцена».</div></div>`;
    }

    const cmd = scene.cmd || {};
    const source = cmd.source || "inline";
    const startAt = cmd.startAt ?? 0;
    const scripts = getCmdScripts();
    const scriptId = cmd.scriptId || "";
    let scriptIndex = Number.isFinite(state.cmdScriptSelected) ? state.cmdScriptSelected : -1;
    if (source === "script" && scriptId) {
      scriptIndex = getCmdScriptIndexById(scriptId);
    } else if (scriptIndex < 0 && scriptId) {
      scriptIndex = getCmdScriptIndexById(scriptId);
    }
    if (scriptIndex < 0 && scripts.length) {
      scriptIndex = 0;
    }
    const selectedScript = Number.isFinite(scriptIndex) && scripts[scriptIndex] ? scripts[scriptIndex] : null;

    const inlineSteps = Array.isArray(cmd.steps) ? cmd.steps : [];
    const scriptSteps = selectedScript ? (Array.isArray(selectedScript.steps) ? selectedScript.steps : []) : [];

    return `
      <div class="section">
        <div class="section-title">CMD для сцены</div>
        <div class="fields">
          <div class="field">
            <label>Источник</label>
            <select class="input" data-scope="scene" data-field="cmd.source">
              <option value="inline" ${source === "inline" ? "selected" : ""}>inline</option>
              <option value="script" ${source === "script" ? "selected" : ""}>script</option>
            </select>
          </div>
          <div class="field">
            <label>Старт (ms)</label>
            <input class="input" data-scope="scene" data-field="cmd.startAt" data-kind="number" value="${escapeAttr(startAt)}" />
          </div>
          ${source === "script" ? `
          <div class="field">
            <label>Скрипт сцены</label>
            <select class="input" data-scope="scene" data-field="cmd.scriptId">
              <option value="">—</option>
              ${scripts.map((scr) => {
                const sid = String(scr.id || "");
                return `<option value="${escapeAttr(sid)}" ${sid === scriptId ? "selected" : ""}>${escapeHtml(sid || "(no-id)")}</option>`;
              }).join("")}
            </select>
          </div>
          ` : ""}
        </div>
        <div class="inline cmd-toolbar">
          <button class="btn ghost" data-action="cmd-open-window">Открыть CMD</button>
          <button class="btn ghost" data-action="cmd-clear-window">Очистить CMD</button>
        </div>
      </div>

      ${source === "inline"
        ? renderCmdStepsPanel("inline", inlineSteps)
        : renderCmdScriptsPanel(selectedScript, scripts, scriptIndex)}
    `;
  }

  function getCmdRuntimeSteps(scene) {
    if (!scene || !scene.cmd || !scene.cmd.enabled) return [];
    if (scene.cmd.source === "script") {
      const script = getCmdScriptById(scene.cmd.scriptId || "");
      return script && Array.isArray(script.steps) ? script.steps : [];
    }
    return Array.isArray(scene.cmd.steps) ? scene.cmd.steps : [];
  }

  function getCmdOpenPayload(scene) {
    const steps = getCmdRuntimeSteps(scene);
    const openStep = steps.find((step) => String(step.type || "").toLowerCase() === "open");
    if (!openStep) return {};
    return {
      path: openStep.path || openStep.prefix,
      title: openStep.title,
      hint: openStep.hint,
      clear: Boolean(openStep.clear),
      choosePath: Boolean(openStep.choosePath)
    };
  }

  function renderCmdStepsPanel(scope, steps, scriptIndex) {
    const title = scope === "inline" ? "Inline‑шаги" : "Шаги скрипта";
    return `
      <div class="section cmd-steps-panel" data-cmd-scope="${scope}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>
        <div class="section-title">${title}</div>
        <div class="inline cmd-toolbar">
          <select class="input cmd-add-type" data-cmd-add-type>
            ${renderCmdStepTypeOptions("print")}
          </select>
          <button class="btn ghost" data-action="cmd-add-step" data-cmd-scope="${scope}">+ Шаг</button>
          <button class="btn ghost" data-action="cmd-template-choice" data-cmd-scope="${scope}">Y/N выбор</button>
          <button class="btn ghost" data-action="cmd-template-system32" data-cmd-scope="${scope}">Удаление System32</button>
          <button class="btn ghost" data-action="cmd-template-artifact" data-cmd-scope="${scope}">Создать артефакт</button>
          <button class="btn ghost" data-action="cmd-template-error" data-cmd-scope="${scope}">Ошибка удаления</button>
        </div>
        <div class="cmd-steps">
          ${renderCmdSteps(steps, scope, scriptIndex) || "<div class='muted'>Пока нет шагов.</div>"}
        </div>
      </div>
    `;
  }

  function renderCmdScriptsPanel(selectedScript, scripts, scriptIndex) {
    return `
      <div class="section">
        <div class="section-title">Библиотека CMD‑скриптов</div>
        <div class="inline cmd-toolbar">
          <select class="input" data-cmd-script-select>
            ${scripts.map((scr, index) => {
              const sid = String(scr.id || "");
              return `<option value="${index}" ${index === scriptIndex ? "selected" : ""}>${escapeHtml(sid || "(no-id)")}</option>`;
            }).join("")}
          </select>
          <button class="btn ghost" data-action="cmd-script-add">+ Скрипт</button>
          <button class="btn ghost" data-action="cmd-script-duplicate">Дублировать</button>
          <button class="btn ghost danger" data-action="cmd-script-remove">Удалить</button>
        </div>
        ${selectedScript ? `
          <div class="fields">
            <div class="field">
              <label>ID</label>
              <input class="input" data-cmd-script-field="id" data-script-index="${scriptIndex}" value="${escapeAttr(selectedScript.id || "")}" />
            </div>
            <div class="field">
              <label>Label</label>
              <input class="input" data-cmd-script-field="label" data-script-index="${scriptIndex}" value="${escapeAttr(selectedScript.label || "")}" />
            </div>
          </div>
          ${renderCmdStepsPanel("script", Array.isArray(selectedScript.steps) ? selectedScript.steps : [], scriptIndex)}
        ` : `<div class="muted">Скриптов нет.</div>`}
      </div>
    `;
  }

  function renderCmdSteps(steps, scope, scriptIndex) {
    return (steps || []).map((step, index) => {
      const type = String(step.type || "print");
      const delayMs = step.delayMs ?? "";
      const speedMs = step.speedMs ?? "";
      const keys = Array.isArray(step.keys) ? step.keys.join(", ") : "";
      const nextOnKey = getJsonValue(`cmd:${scope}`, index, "nextOnKey", step.nextOnKey);
      return `
        <div class="cmd-step" data-cmd-scope="${scope}" data-step-index="${index}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>
          <div class="cmd-step-header">
            <div class="cmd-step-title">#${index + 1}</div>
            <div class="cmd-step-actions">
              <button class="btn ghost tiny" data-action="cmd-step-up" data-cmd-scope="${scope}" data-index="${index}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>↑</button>
              <button class="btn ghost tiny" data-action="cmd-step-down" data-cmd-scope="${scope}" data-index="${index}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>↓</button>
              <button class="btn ghost danger tiny" data-action="cmd-remove-step" data-cmd-scope="${scope}" data-index="${index}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>Удалить</button>
            </div>
          </div>
          <div class="fields">
            <div class="field">
              <label>Type</label>
              <select class="input" data-cmd-scope="${scope}" data-step-index="${index}" data-field="type" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>
                ${renderCmdStepTypeOptions(type)}
              </select>
            </div>
            <div class="field">
              <label>Delay after (ms)</label>
              <input class="input" data-cmd-scope="${scope}" data-step-index="${index}" data-field="delayMs" data-kind="number" value="${escapeAttr(delayMs)}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""} />
            </div>
            ${renderCmdStepFields(type, step, scope, index, scriptIndex, keys, nextOnKey, speedMs)}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderCmdStepFields(type, step, scope, index, scriptIndex, keys, nextOnKey, speedMs) {
    const common = (field, value, kind = "string") => `
      <input class="input" data-cmd-scope="${scope}" data-step-index="${index}" data-field="${field}" data-kind="${kind}" value="${escapeAttr(value ?? "")}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""} />`;
    const textarea = (field, value) => `
      <textarea class="input" data-cmd-scope="${scope}" data-step-index="${index}" data-field="${field}" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>${escapeHtml(value ?? "")}</textarea>`;

      if (type === "open") {
        return `
          <div class="field"><label>Path</label>${common("path", step.path || "")}</div>
          <div class="field"><label>Title</label>${common("title", step.title || "")}</div>
          <div class="field"><label>Hint</label>${common("hint", step.hint || "")}</div>
          <div class="field"><label><input type="checkbox" data-cmd-scope="${scope}" data-step-index="${index}" data-field="clear" data-kind="boolean" ${step.clear ? "checked" : ""} ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}/> clear</label></div>
          <div class="field"><label><input type="checkbox" data-cmd-scope="${scope}" data-step-index="${index}" data-field="choosePath" data-kind="boolean" ${step.choosePath ? "checked" : ""} ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}/> choosePath</label></div>
        `;
      }
      if (type === "print") {
        return `
          <div class="field"><label>Text</label>${textarea("text", step.text || "")}</div>
          <div class="field"><label><input type="checkbox" data-cmd-scope="${scope}" data-step-index="${index}" data-field="asCommand" data-kind="boolean" ${step.asCommand ? "checked" : ""} ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}/> asCommand</label></div>
        `;
      }
    if (type === "type") {
      return `
        <div class="field"><label>Text</label>${textarea("text", step.text || "")}</div>
        <div class="field"><label>Speed (ms)</label>${common("speedMs", speedMs, "number")}</div>
      `;
    }
    if (type === "choice") {
      return `
        <div class="field"><label>Prompt</label>${common("prompt", step.prompt || "")}</div>
        <div class="field"><label>Keys (через запятую)</label>${common("keys", keys || "")}</div>
        <div class="field"><label>autoSubmit</label><input type="checkbox" data-cmd-scope="${scope}" data-step-index="${index}" data-field="autoSubmit" data-kind="boolean" ${step.autoSubmit ? "checked" : ""} ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}/></div>
        <div class="field"><label>nextOnKey (JSON)</label><textarea class="input ${jsonErrorClass(`cmd:${scope}`, index, "nextOnKey")}" data-cmd-scope="${scope}" data-step-index="${index}" data-field="nextOnKey" data-kind="json" ${Number.isFinite(scriptIndex) ? `data-script-index="${scriptIndex}"` : ""}>${escapeHtml(nextOnKey)}</textarea></div>
      `;
    }
    if (type === "title") {
      return `<div class="field"><label>Title</label>${common("title", step.title || "")}</div>`;
    }
    return "";
  }

  function renderCmdStepTypeOptions(current) {
    const options = ["open", "print", "type", "choice", "clear", "close", "wait", "title"];
    return options.map((value) => `<option value="${value}" ${value === current ? "selected" : ""}>${value}</option>`).join("");
  }

  function renderAudioTab(scene) {
    const audio = state.story.audio || {};
    const globalVoice = normalizeVoice(audio.voice);
    const globalMusic = normalizeMusic(audio.music);
    const sceneVoice = scene ? normalizeVoice(scene.voice) : normalizeVoice(null);
    const sceneMusic = scene ? normalizeMusic(scene.music) : normalizeMusic(null);
    return `
      <div class="section">
        <div class="section-title">Глобальное аудио (window.STORY.audio)</div>
        <div class="fields">
          <div class="field">
            <label>Voice src</label>
            <input class="input" data-scope="storyAudio" data-field="voiceSrc" value="${escapeAttr(globalVoice.src)}" />
          </div>
          <div class="field">
            <label>Voice volume</label>
            <input class="input" data-scope="storyAudio" data-field="voiceVolume" data-kind="number" value="${escapeAttr(globalVoice.volume ?? "")}" />
          </div>
          <div class="field">
            <label>Music src</label>
            <input class="input" data-scope="storyAudio" data-field="musicSrc" value="${escapeAttr(globalMusic.src)}" />
          </div>
          <div class="field">
            <label>Music volume</label>
            <input class="input" data-scope="storyAudio" data-field="musicVolume" data-kind="number" value="${escapeAttr(globalMusic.volume ?? "")}" />
          </div>
          <div class="field">
            <label>Music loop</label>
            <select class="input" data-scope="storyAudio" data-field="musicLoop">
              <option value="true" ${globalMusic.loop ? "selected" : ""}>true</option>
              <option value="false" ${!globalMusic.loop ? "selected" : ""}>false</option>
            </select>
          </div>
          <div class="field">
            <label>Music mode</label>
            <select class="input" data-scope="storyAudio" data-field="musicModeDefault">
              ${renderMusicModeOptions(audio.musicModeDefault)}
            </select>
          </div>
          <div class="field">
            <label>Music fade (ms)</label>
            <input class="input" data-scope="storyAudio" data-field="musicFadeMs" data-kind="number" value="${escapeAttr(audio.musicFadeMs ?? "")}" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Аудио текущей сцены</div>
        <div class="fields">
          <div class="field">
            <label>Voice src</label>
            <input class="input" data-scope="sceneAudio" data-field="voiceSrc" value="${escapeAttr(sceneVoice.src)}" />
          </div>
          <div class="field">
            <label>Voice volume</label>
            <input class="input" data-scope="sceneAudio" data-field="voiceVolume" data-kind="number" value="${escapeAttr(sceneVoice.volume ?? "")}" />
          </div>
          <div class="field">
            <label>Music src</label>
            <input class="input" data-scope="sceneAudio" data-field="musicSrc" value="${escapeAttr(sceneMusic.src)}" />
          </div>
          <div class="field">
            <label>Music volume</label>
            <input class="input" data-scope="sceneAudio" data-field="musicVolume" data-kind="number" value="${escapeAttr(sceneMusic.volume ?? "")}" />
          </div>
          <div class="field">
            <label>Music loop</label>
            <select class="input" data-scope="sceneAudio" data-field="musicLoop">
              <option value="true" ${sceneMusic.loop ? "selected" : ""}>true</option>
              <option value="false" ${!sceneMusic.loop ? "selected" : ""}>false</option>
            </select>
          </div>
          <div class="field">
            <label>Music mode</label>
            <select class="input" data-scope="sceneAudio" data-field="musicMode">
              ${renderMusicModeOptions(sceneMusic.mode)}
            </select>
          </div>
          <div class="field">
            <label>Music fade (ms)</label>
            <input class="input" data-scope="sceneAudio" data-field="musicFadeMs" data-kind="number" value="${escapeAttr(sceneMusic.fadeMs ?? "")}" />
          </div>
        </div>
        <div class="muted">Пустые поля снимают переопределение сцены.</div>
      </div>
    `;
  }

  function getTimelineGroupName(entry) {
    const raw = entry && entry.group !== undefined ? String(entry.group).trim() : "";
    return raw || "Основная";
  }

  function buildTimelineGroups(scene) {
    const list = Array.isArray(scene.timeline) ? scene.timeline : [];
    const map = new Map();
    list.forEach((entry, index) => {
      const name = getTimelineGroupName(entry);
      if (!map.has(name)) {
        map.set(name, []);
      }
      map.get(name).push({ entry, index });
    });
    return Array.from(map.entries()).map(([name, events]) => ({ name, events }));
  }

  function getTimelineEntryDuration(entry) {
    const duration = toNumber(entry.durationMs, TIMELINE_DEFAULT_DURATION);
    return duration > 0 ? duration : TIMELINE_DEFAULT_DURATION;
  }

  function getTimelineMaxTime(groups) {
    let max = 0;
    groups.forEach((group) => {
      group.events.forEach(({ entry }) => {
        const at = Math.max(0, toNumber(entry.at, 0));
        const duration = getTimelineEntryDuration(entry);
        max = Math.max(max, at + duration);
      });
    });
    return max;
  }

  function renderTimelineTracks(scene) {
    if (!scene) return "<div class='muted'>Нет сцен.</div>";
    const groups = buildTimelineGroups(scene);
    const msPerPx = clampValue(state.timelineZoom, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
    const pxPerMs = 1 / msPerPx;
    const maxTime = getTimelineMaxTime(groups);
    const trackWidth = Math.max(600, Math.ceil(maxTime * pxPerMs) + 200);

    if (!groups.length) {
      return "<div class='muted'>Пока нет событий таймлайна.</div>";
    }

    return groups
      .map((group) => {
        const collapsed = state.timelineGroupsCollapsed[group.name];
        const clips = group.events
          .map(({ entry, index }) => {
            const at = Math.max(0, toNumber(entry.at, 0));
            const duration = getTimelineEntryDuration(entry);
            const width = Math.max(60, duration * pxPerMs);
            const left = Math.max(0, at * pxPerMs);
            const label = entry.label || entry.type || "event";
            const isSelected = Number.isFinite(state.timelineSelected) && state.timelineSelected === index;
            return `
              <div class="timeline-clip${isSelected ? " is-selected" : ""}" data-index="${index}" style="left:${left}px;width:${width}px">
                <div class="timeline-clip-title">${escapeHtml(label)}</div>
                <div class="timeline-clip-meta">${escapeHtml(entry.type || "")}</div>
                <span class="timeline-resize-handle" data-handle="resize"></span>
              </div>
            `;
          })
          .join("");

        return `
          <div class="timeline-group ${collapsed ? "is-collapsed" : ""}" data-group="${escapeAttr(group.name)}">
            <div class="timeline-group-header">
              <button class="btn ghost tiny" data-action="toggle-timeline-group" data-group="${escapeAttr(group.name)}">
                ${collapsed ? "▶" : "▼"}
              </button>
              <div class="timeline-group-title">${escapeHtml(group.name)}</div>
              <div class="timeline-group-count">${group.events.length}</div>
            </div>
            ${collapsed
              ? `<div class="timeline-collapsed">Событий: ${group.events.length}</div>`
              : `<div class="timeline-track"><div class="timeline-track-inner" style="width:${trackWidth}px">${clips}</div></div>`}
          </div>
        `;
      })
      .join("");
  }

  function renderTimelineInspector(scene) {
    if (!scene) return "<div class='muted'>Нет сцен.</div>";
    const list = Array.isArray(scene.timeline) ? scene.timeline : [];
    if (!Number.isFinite(state.timelineSelected) || !list[state.timelineSelected]) {
      return "<div class='muted'>Выберите событие на таймлайне.</div>";
    }
    const entry = list[state.timelineSelected];
    const payload = getJsonValue("timeline", state.timelineSelected, "payload", entry.payload);
    const music = entry.music && typeof entry.music === "object" ? entry.music : {};
    const actionValue = entry.action || "";
    return `
      <div class="section">
        <div class="section-title">Событие #${state.timelineSelected + 1}</div>
        <div class="fields">
          <div class="field">
            <label>Type</label>
            <select class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="type">
              ${renderTimelineTypeOptions(entry.type)}
            </select>
          </div>
          <div class="field">
            <label>At (ms)</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="at" data-kind="number" value="${escapeAttr(entry.at ?? "")}" />
          </div>
          <div class="field">
            <label>Duration (ms)</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="durationMs" data-kind="number" value="${escapeAttr(entry.durationMs ?? "")}" />
          </div>
          <div class="field">
            <label>Label</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="label" value="${escapeAttr(entry.label || "")}" />
          </div>
          <div class="field">
            <label>Group</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="group" value="${escapeAttr(entry.group || "")}" />
          </div>
          <div class="field">
            <label>Message</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="message" value="${escapeAttr(entry.message || "")}" />
          </div>
          <div class="field">
            <label>Title</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="title" value="${escapeAttr(entry.title || "")}" />
          </div>
          <div class="field">
            <label>Text</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="text" value="${escapeAttr(entry.text || "")}" />
          </div>
          <div class="field">
            <label>Effect</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="effect" value="${escapeAttr(entry.effect || "")}" />
          </div>
          <div class="field">
            <label>Next</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="next" value="${escapeAttr(entry.next || "")}" />
          </div>
          <div class="field">
            <label>Sound/src</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="sound" value="${escapeAttr(entry.sound || "")}" />
          </div>
          <div class="field">
            <label>Volume</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="volume" data-kind="number" value="${escapeAttr(entry.volume ?? "")}" />
          </div>
          <div class="field">
            <label>Style</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="style" value="${escapeAttr(entry.style || "")}" />
          </div>
          <div class="field">
            <label>System op</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="op" value="${escapeAttr(entry.op || "")}" />
          </div>
          <div class="field">
            <label>Music action</label>
            <select class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="action">
              <option value="" ${!actionValue ? "selected" : ""}>—</option>
              <option value="play" ${actionValue === "play" ? "selected" : ""}>play</option>
              <option value="pause" ${actionValue === "pause" ? "selected" : ""}>pause</option>
              <option value="resume" ${actionValue === "resume" ? "selected" : ""}>resume</option>
              <option value="stop" ${actionValue === "stop" ? "selected" : ""}>stop</option>
            </select>
          </div>
          <div class="field">
            <label>Music src</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="music.src" value="${escapeAttr(music.src || "")}" />
          </div>
          <div class="field">
            <label>Music volume</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="music.volume" data-kind="number" value="${escapeAttr(music.volume ?? "")}" />
          </div>
          <div class="field">
            <label><input type="checkbox" data-collection="timeline" data-index="${state.timelineSelected}" data-field="music.loop" data-kind="boolean" ${music.loop !== false ? "checked" : ""} /> music loop</label>
          </div>
          <div class="field">
            <label>Music fade (ms)</label>
            <input class="input" data-collection="timeline" data-index="${state.timelineSelected}" data-field="music.fadeMs" data-kind="number" value="${escapeAttr(music.fadeMs ?? "")}" />
          </div>
          <div class="field">
            <label>Payload (JSON)</label>
            <textarea class="input ${jsonErrorClass("timeline", state.timelineSelected, "payload")}" data-collection="timeline" data-index="${state.timelineSelected}" data-field="payload" data-kind="json">${escapeHtml(payload)}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  function renderAnimationsCharactersSection(scene) {
    const list = Array.isArray(scene.characters) ? scene.characters : [];
    const items = list
      .map((entry, index) => {
        const refType = entry.characterId ? "characterId" : (entry.use ? "use" : "characterId");
        const refId = entry.characterId || entry.use || "";
        const pose = entry.pose || entry.imageKey || "";
        const label = [refId, pose].filter(Boolean).join(":");
        const poseOptions = getPoseOptions(refId, pose);
        const overlay = entry.overlayVideo || entry.videoOverlay || {};
        return `
          <details class="anim-card" open>
            <summary>Персонаж #${index + 1}${label ? " — " + escapeHtml(label) : ""}</summary>
            <div class="fields">
              <div class="field">
                <label>Ref Type</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="refType">
                  <option value="characterId" ${refType === "characterId" ? "selected" : ""}>characterId</option>
                  <option value="use" ${refType === "use" ? "selected" : ""}>use</option>
                </select>
              </div>
              <div class="field">
                <label>Character ID</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="characterId">
                  <option value=""></option>
                  ${characterIds.map((id) => `<option value="${escapeAttr(id)}" ${id === refId ? "selected" : ""}>${escapeHtml(id)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label>Pose</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="pose">
                  <option value=""></option>
                  ${poseOptions}
                </select>
              </div>
              <div class="field">
                <label>Position</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="position">
                  ${renderPositionOptions(entry.position)}
                </select>
              </div>
              <div class="field">
                <label>X</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="x" data-kind="number" value="${escapeAttr(entry.x ?? "")}" />
              </div>
              <div class="field">
                <label>Y</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="y" data-kind="number" value="${escapeAttr(entry.y ?? "")}" />
              </div>
              <div class="field">
                <label>Offset X</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="offsetX" data-kind="number" value="${escapeAttr(entry.offsetX ?? "")}" />
              </div>
              <div class="field">
                <label>Offset Y</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="offsetY" data-kind="number" value="${escapeAttr(entry.offsetY ?? "")}" />
              </div>
              <div class="field">
                <label>Size</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="size" data-kind="number" value="${escapeAttr(entry.size ?? "")}" />
              </div>
              <div class="field">
                <label>Opacity</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="opacity" data-kind="number" value="${escapeAttr(entry.opacity ?? "")}" />
              </div>
              <div class="field">
                <label>Enter</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="enter">
                  ${renderEnterOptions(entry.enter)}
                </select>
              </div>
              <div class="field">
                <label>Frames (по строкам)</label>
                <textarea class="input" data-collection="characters" data-index="${index}" data-field="frames" data-kind="lines">${escapeHtml(Array.isArray(entry.frames) ? entry.frames.join("\n") : "")}</textarea>
              </div>
              <div class="field">
                <label>Frame ms</label>
                <input class="input" data-collection="characters" data-index="${index}" data-field="frameMs" data-kind="number" value="${escapeAttr(entry.frameMs ?? "")}" />
              </div>
              <div class="field">
                <label>Frame mode</label>
                <select class="input" data-collection="characters" data-index="${index}" data-field="frameMode">
                  ${renderFrameModeOptions(entry.frameMode)}
                </select>
              </div>
              ${renderOverlayFields(overlay, index)}
            </div>
          </details>
        `;
      })
      .join("");

    return `
      <div class="section">
        <div class="section-title">Анимации персонажей</div>
        <div class="inline">
          <button class="btn primary" data-action="add-character">+ Добавить персонажа</button>
        </div>
        <div class="stack">
          ${items || "<div class='muted'>Пока нет персонажей.</div>"}
        </div>
        <div class="muted">Поля синхронизируются с вкладкой «Персонажи». Frames можно задавать именами файлов или ключами поз.</div>
      </div>
    `;
  }

  function renderTimelineEditor(scene) {
    const zoomValue = clampValue(state.timelineZoom, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
    return `
      <div class="section">
        <div class="section-title">Таймлайн</div>
        <div class="timeline-toolbar">
          <button class="btn ghost" data-action="timeline-add-group">+ Группа</button>
          <button class="btn ghost" data-action="timeline-add-event">+ Событие</button>
          <button class="btn ghost" data-action="timeline-duplicate-event">Дублировать</button>
          <button class="btn ghost danger" data-action="timeline-delete-event">Удалить</button>
          <button class="btn ghost" data-action="timeline-align-events">Выровнять</button>
          <button class="btn ghost" data-action="timeline-reset-zoom">Сброс масштаб</button>
          <button class="btn ghost" data-action="timeline-auto-fit">Auto fit</button>
          <label class="timeline-zoom">
            <span>ms/px</span>
            <input id="timelineZoomInput" class="input" type="range" min="${TIMELINE_ZOOM_MIN}" max="${TIMELINE_ZOOM_MAX}" step="1" value="${zoomValue}" data-timeline-control="zoom" />
            <span class="value">${Math.round(zoomValue)}</span>
          </label>
        </div>
        <div class="timeline-body">
          <div class="timeline-scroll" id="timelineScroll">
            <div id="timelineTracks" class="timeline-tracks">
              ${renderTimelineTracks(scene)}
            </div>
          </div>
          <div class="timeline-inspector" id="timelineInspector">
            ${renderTimelineInspector(scene)}
          </div>
        </div>
      </div>
    `;
  }

  function renderAnimationsTab(scene) {
    if (!scene) return `<div class="section"><div class="section-title">Нет сцен</div></div>`;
    return `
      <div class="animations-layout">
        <div class="animations-panel">
          ${renderAnimationsCharactersSection(scene)}
        </div>
        <div class="animations-panel">
          ${renderTimelineEditor(scene)}
        </div>
      </div>
    `;
  }

  function updateTimelineZoomUi() {
    const input = document.getElementById("timelineZoomInput");
    if (!input) return;
    input.value = String(clampValue(state.timelineZoom, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX));
    const valueEl = input.closest(".timeline-zoom")?.querySelector(".value");
    if (valueEl) {
      valueEl.textContent = String(Math.round(state.timelineZoom));
    }
  }

  function refreshTimelineTracks() {
    const container = document.getElementById("timelineTracks");
    if (!container) return;
    const scene = getScene();
    container.innerHTML = renderTimelineTracks(scene);
    updateTimelineZoomUi();
    updateTimelineClipSelection();
  }

  function refreshTimelineInspector(preserveFocus) {
    const inspector = document.getElementById("timelineInspector");
    if (!inspector) return;
    if (preserveFocus && inspector.contains(document.activeElement)) {
      return;
    }
    const scene = getScene();
    if (scene && Array.isArray(scene.timeline)) {
      if (!Number.isFinite(state.timelineSelected) || !scene.timeline[state.timelineSelected]) {
        state.timelineSelected = null;
      }
    }
    inspector.innerHTML = renderTimelineInspector(scene);
  }

  function updateTimelineClipSelection() {
    const clips = document.querySelectorAll(".timeline-clip");
    clips.forEach((clip) => {
      const index = parseInt(clip.dataset.index, 10);
      const selected = Number.isFinite(state.timelineSelected) && index === state.timelineSelected;
      clip.classList.toggle("is-selected", selected);
    });
  }

  function setTimelineSelected(index) {
    state.timelineSelected = Number.isFinite(index) ? index : null;
    updateTimelineClipSelection();
    refreshTimelineInspector();
  }

  function autoFitTimeline() {
    const scene = getScene();
    if (!scene) return;
    const groups = buildTimelineGroups(scene);
    const maxTime = getTimelineMaxTime(groups) || 1000;
    const scroll = document.getElementById("timelineScroll");
    const available = scroll ? Math.max(200, scroll.clientWidth - 40) : 600;
    const msPerPx = clampValue(maxTime / available, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
    state.timelineZoom = msPerPx;
    saveTimelineZoom(msPerPx);
    refreshTimelineTracks();
  }

  function updateTimelineInspectorField(index, field, value) {
    const input = document.querySelector(
      `.timeline-inspector [data-collection="timeline"][data-index="${index}"][data-field="${CSS.escape(field)}"]`
    );
    if (!input || input === document.activeElement) return;
    if (input.type === "checkbox") {
      input.checked = Boolean(value);
    } else {
      input.value = value === undefined || value === null ? "" : String(value);
    }
  }

  function handleTimelinePointerDown(event) {
    const clip = event.target.closest(".timeline-clip");
    if (!clip) return;
    const index = parseInt(clip.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const scene = getScene();
    if (!scene || !Array.isArray(scene.timeline) || !scene.timeline[index]) return;
    const scroll = event.target.closest(".timeline-scroll");
    if (!scroll) return;
    const handle = event.target.closest(".timeline-resize-handle");
    const entry = scene.timeline[index];
    const startAt = Math.max(0, toNumber(entry.at, 0));
    const startDuration = getTimelineEntryDuration(entry);
    state.timelineDrag = {
      index,
      type: handle ? "resize" : "move",
      startX: event.clientX,
      startAt,
      startDuration,
      clipEl: clip,
      msPerPx: clampValue(state.timelineZoom, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX)
    };
    setTimelineSelected(index);
    event.preventDefault();
  }

  function handleTimelinePointerMove(event) {
    const drag = state.timelineDrag;
    if (!drag) return;
    event.preventDefault();
    const scene = getScene();
    if (!scene || !Array.isArray(scene.timeline)) return;
    const entry = scene.timeline[drag.index];
    if (!entry) return;
    const deltaPx = event.clientX - drag.startX;
    const deltaMs = deltaPx * drag.msPerPx;
    const snapped = (value) => Math.round(value / TIMELINE_SNAP_MS) * TIMELINE_SNAP_MS;
    const pxPerMs = 1 / drag.msPerPx;

    if (drag.type === "move") {
      let nextAt = Math.max(0, drag.startAt + deltaMs);
      nextAt = snapped(nextAt);
      entry.at = nextAt;
      if (drag.clipEl) {
        drag.clipEl.style.left = `${Math.max(0, nextAt * pxPerMs)}px`;
      }
      updateTimelineInspectorField(drag.index, "at", nextAt);
    } else {
      let nextDuration = Math.max(TIMELINE_SNAP_MS, drag.startDuration + deltaMs);
      nextDuration = Math.max(TIMELINE_SNAP_MS, snapped(nextDuration));
      entry.durationMs = nextDuration;
      if (drag.clipEl) {
        drag.clipEl.style.width = `${Math.max(60, nextDuration * pxPerMs)}px`;
      }
      updateTimelineInspectorField(drag.index, "durationMs", nextDuration);
    }
  }

  function handleTimelinePointerUp() {
    if (!state.timelineDrag) return;
    state.timelineDrag = null;
    recordHistory("input");
    scheduleSave();
    refreshTimelineTracks();
    refreshTimelineInspector();
  }

  function renderTagsTab() {
    return `
      <div class="section">
        <div class="section-title">Теги в тексте</div>
        <div class="tag-list">
          <div class="tag-card"><strong>[pause=400]</strong>Пауза в печати (мс).</div>
          <div class="tag-card"><strong>[lag=120]...[/lag]</strong>Замедление набора для сегмента.</div>
          <div class="tag-card"><strong>[voice=voice.wav volume=0.6]...[/voice]</strong>Другой голос внутри сегмента.</div>
          <div class="tag-card"><strong>[sfx=hit.wav volume=0.8]</strong>Одноразовый звук.</div>
          <div class="tag-card"><strong>[glitch rate=0.35 ms=120]...[/glitch]</strong>Пост‑искажение символов.</div>
          <div class="tag-card"><strong>[scramble ms=100]...[/scramble]</strong>Хаос символов во время печати.</div>
          <div class="tag-card"><strong>[swap ms=900]сон|шум|ложь[/swap]</strong>Циклическая подмена текста.</div>
          <div class="tag-card"><strong>[playerName]</strong>Итоговое имя игрока (введённое/системное).</div>
          <div class="tag-card"><strong>[playerInput]</strong>Только введённое имя (иначе fallback к playerName).</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Быстрый предпросмотр</div>
        <div class="field">
          <label>Текст с тегами</label>
          <textarea id="tagTestInput" class="input">Я слышу [pause=300]шум... [glitch rate=0.4 ms=120]ошибка[/glitch]. Привет, [playerName].</textarea>
        </div>
        <div class="field">
          <label>Очищенный текст</label>
          <textarea id="tagPreviewOutput" class="input" readonly></textarea>
        </div>
        <div class="field">
          <label>Найденные теги</label>
          <textarea id="tagPreviewTags" class="input" readonly></textarea>
        </div>
      </div>
    `;
  }

  function renderValidation() {
    const issues = validateStory();
    const ids = new Set();
    const indices = new Set();
    issues.forEach((issue) => {
      if (issue.sceneId) ids.add(String(issue.sceneId));
      if (Number.isFinite(issue.sceneIndex)) indices.add(issue.sceneIndex);
    });
    state.graphIssues = { ids, indices, count: issues.length };
    if (ui.graphErrorCount) {
      ui.graphErrorCount.textContent = String(issues.length);
    }
    renderGraph();
  }

  function renderPreview() {
    ui.storyPreview.textContent = generateStoryJs();
  }

  function loadGraphZoom() {
    try {
      const raw = localStorage.getItem(GRAPH_ZOOM_KEY);
      const value = parseFloat(raw);
      if (Number.isFinite(value)) return clampValue(value, GRAPH_ZOOM_MIN, GRAPH_ZOOM_MAX);
    } catch (err) {}
    return 1;
  }

  function saveGraphZoom(value) {
    try {
      localStorage.setItem(GRAPH_ZOOM_KEY, String(value));
    } catch (err) {}
  }

  function loadTimelineZoom() {
    try {
      const raw = localStorage.getItem(TIMELINE_ZOOM_KEY);
      const value = parseFloat(raw);
      if (Number.isFinite(value)) {
        return clampValue(value, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
      }
    } catch (err) {}
    return TIMELINE_ZOOM_DEFAULT;
  }

  function saveTimelineZoom(value) {
    try {
      localStorage.setItem(TIMELINE_ZOOM_KEY, String(value));
    } catch (err) {}
  }

  function loadTimelineGroupsCollapsed() {
    try {
      const raw = localStorage.getItem(TIMELINE_GROUPS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (err) {
      return {};
    }
  }

  function saveTimelineGroupsCollapsed() {
    try {
      localStorage.setItem(TIMELINE_GROUPS_KEY, JSON.stringify(state.timelineGroupsCollapsed || {}));
    } catch (err) {}
  }

  function loadGraphPan() {
    try {
      const raw = localStorage.getItem(GRAPH_PAN_KEY);
      if (!raw) return { x: 0, y: 0 };
      const parsed = JSON.parse(raw);
      const x = Number(parsed.x);
      const y = Number(parsed.y);
      return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
    } catch (err) {
      return { x: 0, y: 0 };
    }
  }

  function saveGraphPan(value) {
    try {
      localStorage.setItem(GRAPH_PAN_KEY, JSON.stringify(value));
    } catch (err) {}
  }

  function clampValue(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  function toNumber(value, fallback) {
    if (Number.isFinite(value)) return value;
    const parsed = typeof value === "string" && value.trim() !== "" ? parseFloat(value) : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getSceneKey(scene, index) {
    const id = scene.id ? String(scene.id).trim() : "";
    return id ? `id:${id}` : `idx:${index}`;
  }

  function buildGraphData() {
    const nodes = [];
    const idToKey = new Map();
    state.story.scenes.forEach((scene, index) => {
      const id = scene.id ? String(scene.id).trim() : "";
      const label = scene.label || scene.text || "";
      const { segments } = getSceneGroupPath(scene);
      const depth = Math.max(0, segments.length - 1);
      const key = getSceneKey(scene, index);
      if (id) {
        idToKey.set(id, key);
      }
      nodes.push({
        key,
        id,
        index,
        label: String(label),
        depth
      });
    });

    const edges = [];
    nodes.forEach((node) => {
      const scene = state.story.scenes[node.index];
      if (!scene) return;
      const targets = [];
      if (scene.next) {
        targets.push({ id: String(scene.next).trim(), type: "next" });
      }
      if (Array.isArray(scene.choices)) {
        scene.choices.forEach((choice) => {
          if (choice.next) {
            targets.push({ id: String(choice.next).trim(), type: "choice" });
          }
        });
      }
      targets.forEach((target) => {
        const toKey = idToKey.get(target.id);
        if (toKey) {
          edges.push({ from: node.key, to: toKey, type: target.type });
        }
      });
    });

    return { nodes, edges };
  }

  function computeDefaultPositions(nodes) {
    const positions = {};
    const depthCounters = {};
    nodes.forEach((node) => {
      const depth = node.depth;
      const row = depthCounters[depth] || 0;
      depthCounters[depth] = row + 1;
      positions[node.key] = {
        x: GRAPH_MARGIN_X + depth * GRAPH_COL_GAP,
        y: GRAPH_MARGIN_Y + row * GRAPH_ROW_GAP
      };
    });
    return positions;
  }

  function applyGraphLayout(reset) {
    const data = buildGraphData();
    const defaults = computeDefaultPositions(data.nodes);
    if (reset) {
      state.graphPositions = defaults;
    } else {
      const next = { ...(state.graphPositions || {}) };
      data.nodes.forEach((node) => {
        if (!next[node.key]) {
          next[node.key] = defaults[node.key];
        }
      });
      state.graphPositions = next;
    }
    saveGraphPositions();
    renderGraph();
  }

  function drawGraphEdges(data, bounds) {
    if (!ui.graphSvg) return;
    const edges = data.edges || [];
    const positions = state.graphPositions || {};
    const resolvedBounds = bounds || state.graphBounds || {};
    const minX = resolvedBounds.minX || 0;
    const minY = resolvedBounds.minY || 0;
    const width = resolvedBounds.width || 0;
    const height = resolvedBounds.height || 0;
    const offsetX = resolvedBounds.offsetX || 0;
    const offsetY = resolvedBounds.offsetY || 0;
    let paths = `
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="rgba(123, 215, 200, 0.7)"></path>
        </marker>
      </defs>
    `;
    edges.forEach((edge) => {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) return;
      const x1 = from.x + offsetX + GRAPH_NODE_WIDTH;
      const y1 = from.y + offsetY + GRAPH_NODE_HEIGHT / 2;
      const x2 = to.x + offsetX;
      const y2 = to.y + offsetY + GRAPH_NODE_HEIGHT / 2;
      const dx = Math.max(40, Math.abs(x2 - x1) * 0.35);
      const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      const klass = edge.type === "choice" ? "graph-edge choice" : "graph-edge";
      paths += `<path class="${klass}" d="${path}" marker-end="url(#arrow)"></path>`;
    });
    if (state.graphLink && state.graphLink.path) {
      paths += state.graphLink.path;
    }
    ui.graphSvg.innerHTML = paths;
    if (width && height) {
      ui.graphSvg.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
    }
  }

  function renderGraph() {
    if (!ui.graphCanvas || !ui.graphNodes || !ui.graphSvg || !ui.graphSurface) return;
    const data = buildGraphData();
    state.graphData = data;
    const defaultPositions = computeDefaultPositions(data.nodes);
    const positions = { ...(state.graphPositions || {}) };
    data.nodes.forEach((node) => {
      if (!positions[node.key]) {
        positions[node.key] = defaultPositions[node.key];
      }
    });
    state.graphPositions = positions;

    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;
    ui.graphNodes.innerHTML = "";
    data.nodes.forEach((node) => {
      const pos = positions[node.key];
      maxX = Math.max(maxX, pos.x + GRAPH_NODE_WIDTH + GRAPH_MARGIN_X);
      maxY = Math.max(maxY, pos.y + GRAPH_NODE_HEIGHT + GRAPH_MARGIN_Y);
      minX = Math.min(minX, pos.x - GRAPH_MARGIN_X);
      minY = Math.min(minY, pos.y - GRAPH_MARGIN_Y);
    });

    if (!Number.isFinite(minX)) minX = 0;
    if (!Number.isFinite(minY)) minY = 0;
    if (!Number.isFinite(maxX)) maxX = ui.graphCanvas.clientWidth;
    if (!Number.isFinite(maxY)) maxY = ui.graphCanvas.clientHeight;
    const offsetX = -minX;
    const offsetY = -minY;
    const prevOffset = state.graphOffset || { x: 0, y: 0 };
    const zoom = state.graphZoom || 1;
    if (prevOffset.x !== offsetX || prevOffset.y !== offsetY) {
      state.graphPan.x += (offsetX - prevOffset.x) * zoom;
      state.graphPan.y += (offsetY - prevOffset.y) * zoom;
    }
    state.graphOffset = { x: offsetX, y: offsetY };
    const canvasWidth = Math.max(ui.graphCanvas.clientWidth, maxX - minX);
    const canvasHeight = Math.max(ui.graphCanvas.clientHeight, maxY - minY);
    ui.graphNodes.innerHTML = "";
    data.nodes.forEach((node) => {
      const pos = positions[node.key];
      const scene = state.story.scenes[node.index];
      const text = node.label ? String(node.label) : "";
      const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0;
      const hasNext = !!scene.next;
      const hasOutgoing = hasChoices || hasNext;
      const error = state.graphIssues.ids.has(node.id) || state.graphIssues.indices.has(node.index);

      const nodeEl = document.createElement("div");
      nodeEl.className = "graph-node" + (error ? " error" : "");
      nodeEl.dataset.key = node.key;
      nodeEl.dataset.index = String(node.index);
      nodeEl.dataset.id = node.id;
      nodeEl.style.left = `${pos.x + offsetX}px`;
      nodeEl.style.top = `${pos.y + offsetY}px`;
      nodeEl.innerHTML = `
        <div class="node-id">${escapeHtml(node.id || "(без ID)")}</div>
        <div class="node-label">${escapeHtml(text).slice(0, 80)}</div>
        <div class="node-badges">
          ${hasChoices ? `<span class="node-badge">C</span>` : ""}
          ${!hasOutgoing ? `<span class="node-badge end">END</span>` : ""}
        </div>
        <div class="node-actions">
          <button class="node-action-btn" data-node-action="child" title="Добавить потомка">+</button>
          <button class="node-action-btn" data-node-action="sibling" title="Создать соседнюю сцену">⇢</button>
          <button class="node-action-btn" data-node-action="duplicate" title="Дублировать сцену">⧉</button>
          <button class="node-action-btn" data-node-action="split" title="Вставить сцену между">⤴</button>
          <button class="node-action-btn danger" data-node-action="unlink" title="Удалить связи">✕</button>
        </div>
        <div class="node-connector" title="Перетащите для связи"></div>
      `;
      ui.graphNodes.appendChild(nodeEl);
    });
    ui.graphSvg.setAttribute("width", canvasWidth);
    ui.graphSvg.setAttribute("height", canvasHeight);
    ui.graphNodes.style.width = `${canvasWidth}px`;
    ui.graphNodes.style.height = `${canvasHeight}px`;
    ui.graphSurface.style.width = `${canvasWidth}px`;
    ui.graphSurface.style.height = `${canvasHeight}px`;
    ui.graphSurface.style.transform = `translate(${state.graphPan.x}px, ${state.graphPan.y}px) scale(${state.graphZoom || 1})`;
    state.graphBounds = { minX: 0, minY: 0, width: canvasWidth, height: canvasHeight, offsetX, offsetY };
    drawGraphEdges(data, state.graphBounds);
  }

  function ensureGraphSurfaceBounds(surfaceX, surfaceY) {
    if (!ui.graphSurface || !ui.graphSvg || !ui.graphNodes || !ui.graphCanvas) return;
    const baseWidth = ui.graphCanvas.clientWidth || 0;
    const baseHeight = ui.graphCanvas.clientHeight || 0;
    const bounds = state.graphBounds || { width: baseWidth, height: baseHeight };
    const nextWidth = Math.max(
      baseWidth,
      bounds.width || 0,
      surfaceX + GRAPH_NODE_WIDTH + GRAPH_BOUND_PADDING
    );
    const nextHeight = Math.max(
      baseHeight,
      bounds.height || 0,
      surfaceY + GRAPH_NODE_HEIGHT + GRAPH_BOUND_PADDING
    );
    if (nextWidth !== bounds.width || nextHeight !== bounds.height) {
      state.graphBounds = {
        minX: 0,
        minY: 0,
        width: nextWidth,
        height: nextHeight,
        offsetX: state.graphOffset ? state.graphOffset.x : 0,
        offsetY: state.graphOffset ? state.graphOffset.y : 0
      };
      ui.graphSvg.setAttribute("width", nextWidth);
      ui.graphSvg.setAttribute("height", nextHeight);
      ui.graphNodes.style.width = `${nextWidth}px`;
      ui.graphNodes.style.height = `${nextHeight}px`;
      ui.graphSurface.style.width = `${nextWidth}px`;
      ui.graphSurface.style.height = `${nextHeight}px`;
    }
  }

  function getGraphPoint(event) {
    const rect = ui.graphCanvas.getBoundingClientRect();
    return {
      x:
        (event.clientX - rect.left - state.graphPan.x) / (state.graphZoom || 1) -
        (state.graphOffset ? state.graphOffset.x : 0),
      y:
        (event.clientY - rect.top - state.graphPan.y) / (state.graphZoom || 1) -
        (state.graphOffset ? state.graphOffset.y : 0)
    };
  }

  function showGraphTooltip(nodeEl, event) {
    if (!ui.graphTooltip || state.graphDrag || state.graphLink) return;
    const index = parseInt(nodeEl.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const scene = state.story.scenes[index];
    if (!scene) return;
    const id = scene.id ? String(scene.id) : "(без ID)";
    const label = scene.label ? String(scene.label) : "—";
    const speaker = scene.speaker ? String(scene.speaker) : "—";
    const background = scene.backgroundImageName ? String(scene.backgroundImageName) : "—";
    const next = scene.next ? String(scene.next) : "—";
    const choicesCount = Array.isArray(scene.choices) ? scene.choices.length : 0;
    const choiceHints = getIncomingChoiceHints(scene.id);
    ui.graphTooltip.innerHTML = `
      <div class="tooltip-title">${escapeHtml(id)}</div>
      <div class="tooltip-row">Label: <span>${escapeHtml(label)}</span></div>
      <div class="tooltip-row">Speaker: <span>${escapeHtml(speaker)}</span></div>
      <div class="tooltip-row">Background: <span>${escapeHtml(background)}</span></div>
      <div class="tooltip-row">Next: <span>${escapeHtml(next)}</span></div>
      <div class="tooltip-row">Choices: <span>${choicesCount}</span></div>
      ${choiceHints}
    `;
    ui.graphTooltip.hidden = false;
    state.graphHover = { nodeEl };
    moveGraphTooltip(event);
  }

  function moveGraphTooltip(event) {
    if (!ui.graphTooltip || ui.graphTooltip.hidden) return;
    const rect = ui.graphCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left + 16;
    const y = event.clientY - rect.top + 16;
    const maxX = rect.width - ui.graphTooltip.offsetWidth - 12;
    const maxY = rect.height - ui.graphTooltip.offsetHeight - 12;
    ui.graphTooltip.style.left = `${Math.min(x, maxX)}px`;
    ui.graphTooltip.style.top = `${Math.min(y, maxY)}px`;
  }

  function hideGraphTooltip() {
    if (!ui.graphTooltip) return;
    ui.graphTooltip.hidden = true;
    state.graphHover = null;
  }

  function getIncomingChoiceHints(targetId) {
    const id = targetId ? String(targetId).trim() : "";
    if (!id) return "";
    const hints = [];
    state.story.scenes.forEach((scene) => {
      const parentId = scene.id ? String(scene.id) : "";
      if (!Array.isArray(scene.choices)) return;
      scene.choices.forEach((choice) => {
        if (!choice || !choice.next) return;
        if (String(choice.next).trim() !== id) return;
        const text = choice.text ? String(choice.text).trim() : "";
        if (text) {
          hints.push({ parentId, text });
        }
      });
    });
    if (!hints.length) return "";
    return hints
      .map((hint, index) => {
        const prefix = hints.length > 1 && hint.parentId ? `${hint.parentId}: ` : "";
        return `<div class="tooltip-row">Choice: <span>${escapeHtml(prefix + hint.text)}</span></div>`;
      })
      .join("");
  }

  function updateDragLine(fromPoint, toPoint) {
    const dx = Math.max(40, Math.abs(toPoint.x - fromPoint.x) * 0.35);
    const offsetX = state.graphOffset ? state.graphOffset.x : 0;
    const offsetY = state.graphOffset ? state.graphOffset.y : 0;
    const x1 = fromPoint.x + offsetX;
    const y1 = fromPoint.y + offsetY;
    const x2 = toPoint.x + offsetX;
    const y2 = toPoint.y + offsetY;
    const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    state.graphLink.path = `<path class="graph-edge drag" d="${path}"></path>`;
    drawGraphEdges(state.graphData || { edges: [] });
  }

  function getNodeGraphPosition(nodeEl) {
    if (!ui.graphCanvas) return null;
    const rect = nodeEl.getBoundingClientRect();
    const canvasRect = ui.graphCanvas.getBoundingClientRect();
    const zoom = state.graphZoom || 1;
    const offsetX = state.graphOffset ? state.graphOffset.x : 0;
    const offsetY = state.graphOffset ? state.graphOffset.y : 0;
    return {
      x: (rect.left - canvasRect.left - state.graphPan.x) / zoom - offsetX,
      y: (rect.top - canvasRect.top - state.graphPan.y) / zoom - offsetY
    };
  }

  function startNodeDrag(nodeEl, event) {
    const key = nodeEl.dataset.key;
    const index = parseInt(nodeEl.dataset.index, 10);
    if (!key || !Number.isFinite(index)) return;
    hideGraphTooltip();
    const domPos = getNodeGraphPosition(nodeEl);
    const pos = domPos || state.graphPositions[key] || { x: 0, y: 0 };
    if (domPos) {
      state.graphPositions[key] = { x: domPos.x, y: domPos.y };
    }
    const point = getGraphPoint(event);
    state.graphDrag = {
      key,
      index,
      startX: point.x,
      startY: point.y,
      offsetX: point.x - pos.x,
      offsetY: point.y - pos.y,
      moved: false
    };
  }

  function startLinkDrag(nodeEl, event) {
    const index = parseInt(nodeEl.dataset.index, 10);
    const fromKey = nodeEl.dataset.key;
    if (!Number.isFinite(index) || !fromKey) return;
    hideGraphTooltip();
    const pos = state.graphPositions[fromKey];
    if (!pos) return;
    const fromPoint = {
      x: pos.x + GRAPH_NODE_WIDTH,
      y: pos.y + GRAPH_NODE_HEIGHT / 2
    };
    state.graphLink = {
      fromIndex: index,
      fromKey,
      fromPoint,
      path: ""
    };
    updateDragLine(fromPoint, getGraphPoint(event));
  }

  function finishNodeDrag(event) {
    const drag = state.graphDrag;
    if (!drag) return;
    if (!drag.moved) {
      selectScene(drag.index);
    } else {
      saveGraphPositions();
    }
    state.graphDrag = null;
  }

  function finishLinkDrag(event) {
    const link = state.graphLink;
    if (!link) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const nodeEl = target ? target.closest(".graph-node") : null;
    if (nodeEl) {
      const targetId = nodeEl.dataset.id;
      const targetIndex = parseInt(nodeEl.dataset.index, 10);
      if (targetId && String(targetId).trim() && targetIndex !== link.fromIndex) {
        applyGraphLink(link.fromIndex, String(targetId).trim());
      }
    }
    state.graphLink = null;
    drawGraphEdges(state.graphData || { edges: [] });
  }

  function applyGraphLink(fromIndex, targetId) {
    const scene = state.story.scenes[fromIndex];
    if (!scene) return;
    const target = String(targetId).trim();
    if (!target) return;
    const existingTargets = new Set();
    if (scene.next) {
      existingTargets.add(String(scene.next).trim());
    }
    if (Array.isArray(scene.choices)) {
      scene.choices.forEach((choice) => {
        if (choice.next) existingTargets.add(String(choice.next).trim());
      });
    }
    if (existingTargets.has(target)) {
      return;
    }

    const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0;
    if (!hasChoices) {
      if (!scene.next) {
        scene.next = target;
      } else {
        const oldNext = scene.next;
        delete scene.next;
        scene.choices = [
          { text: "Продолжить", next: oldNext },
          { text: `Перейти в ${target}`, next: target }
        ];
      }
    } else {
      scene.choices.push({ text: `Перейти в ${target}`, next: target });
    }
    recordHistory("structure");
    scheduleSave();
    renderAll();
  }

  function positionForChild(parentIndex, branchOffset) {
    const parentPos = getScenePosition(parentIndex);
    const offsetY = Math.round(GRAPH_ROW_GAP * 0.7) * (branchOffset || 0);
    return {
      x: parentPos.x + GRAPH_COL_GAP,
      y: parentPos.y + offsetY
    };
  }

  function getBranchOffset(newId, base) {
    if (!base) return 0;
    const match = new RegExp(`^${base}\\.(\\d+)$`).exec(String(newId || "").trim());
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    return Number.isFinite(value) ? Math.max(0, value - 1) : 0;
  }

  function createChildWithNewBase(sceneIndex, scene, usedIds) {
    const newId = getNextFreeNumericId(usedIds);
    const child = cloneForChild(scene);
    const childIndex = addSceneWithId(child, newId, positionForChild(sceneIndex, 0));
    if (Array.isArray(scene.choices) && scene.choices.length > 0) {
      addChoice(scene, `Перейти в ${newId}`, newId);
    } else if (scene.next) {
      convertNextToChoice(scene, "Продолжить");
      addChoice(scene, `Перейти в ${newId}`, newId);
    } else {
      scene.next = newId;
    }
    finalizeGraphAction(childIndex);
  }

  function addChildFromScene(sceneIndex) {
    const scene = state.story.scenes[sceneIndex];
    if (!scene) return;
    const usedIds = getAllSceneIds();
    const outgoing = collectOutgoingTargets(scene);
    if (!outgoing.length) {
      createChildWithNewBase(sceneIndex, scene, usedIds);
      return;
    }

    const parsed = outgoing.map(parseNumericId);
    const allNumeric = parsed.every(Boolean);
    if (!allNumeric) {
      createChildWithNewBase(sceneIndex, scene, usedIds);
      return;
    }

    const base = parsed[0].base;
    const allShareBase = parsed.every((info) => info.base === base);
    if (!allShareBase) {
      createChildWithNewBase(sceneIndex, scene, usedIds);
      return;
    }

    const hasBaseOnly = parsed.some((info) => info.suffix === null);
    let maxSuffix = 0;
    parsed.forEach((info) => {
      if (info.suffix) {
        maxSuffix = Math.max(maxSuffix, info.suffix);
      }
    });

    const renameTarget = `${base}.1`;
    if (hasBaseOnly) {
      if (usedIds.has(renameTarget)) {
        createChildWithNewBase(sceneIndex, scene, usedIds);
        return;
      }
      renameSceneId(base, renameTarget);
      usedIds.delete(base);
      usedIds.add(renameTarget);
    }

    const startSuffix = hasBaseOnly ? Math.max(2, maxSuffix + 1) : Math.max(1, maxSuffix + 1);
    const newId = getNextBranchId(base, usedIds, startSuffix);
    const child = cloneForChild(scene);
    const branchOffset = getBranchOffset(newId, base);
    const childIndex = addSceneWithId(child, newId, positionForChild(sceneIndex, branchOffset));

    if (scene.next) {
      convertNextToChoice(scene, "Продолжить");
    }
    addChoice(scene, `Перейти в ${newId}`, newId);
    finalizeGraphAction(childIndex);
  }

  function findParentIndices(targetId) {
    const target = String(targetId || "").trim();
    if (!target) return [];
    const parents = [];
    state.story.scenes.forEach((scene, index) => {
      const targets = collectOutgoingTargets(scene);
      if (targets.includes(target)) {
        parents.push(index);
      }
    });
    return parents;
  }

  function addSiblingFromScene(sceneIndex) {
    const scene = state.story.scenes[sceneIndex];
    if (!scene) return;
    const id = scene.id ? String(scene.id).trim() : "";
    if (id) {
      const parents = findParentIndices(id);
      if (parents.length === 1) {
        addChildFromScene(parents[0]);
        return;
      }
    }
    const usedIds = getAllSceneIds();
    const newId = getNextFreeNumericId(usedIds);
    const sibling = cloneForChild(scene);
    const sourcePos = getScenePosition(sceneIndex);
    const childIndex = addSceneWithId(sibling, newId, {
      x: sourcePos.x,
      y: sourcePos.y + GRAPH_ROW_GAP
    });
    finalizeGraphAction(childIndex);
  }

  function splitSceneAt(sceneIndex) {
    const scene = state.story.scenes[sceneIndex];
    if (!scene) return;
    if (!scene.next || (Array.isArray(scene.choices) && scene.choices.length > 0)) {
      setStatus("Split доступен только если есть next и нет choices");
      return;
    }
    const oldNext = String(scene.next).trim();
    if (!oldNext) return;
    const usedIds = getAllSceneIds();
    const newId = getNextFreeNumericId(usedIds);
    const inserted = cloneForChild(scene);
    inserted.next = oldNext;
    const sourcePos = getScenePosition(sceneIndex);
    const childIndex = addSceneWithId(inserted, newId, {
      x: sourcePos.x + Math.round(GRAPH_COL_GAP * 0.6),
      y: sourcePos.y + Math.round(GRAPH_ROW_GAP * 0.1)
    });
    scene.next = newId;
    finalizeGraphAction(childIndex);
  }

  function unlinkScene(sceneIndex) {
    const scene = state.story.scenes[sceneIndex];
    if (!scene) return;
    delete scene.next;
    delete scene.timeoutNext;
    delete scene.fallbackNext;
    scene.choices = [];
    finalizeGraphAction(sceneIndex);
  }

  function handleGraphNodeAction(nodeEl, action) {
    const index = parseInt(nodeEl.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    if (action === "child") {
      addChildFromScene(index);
      return;
    }
    if (action === "sibling") {
      addSiblingFromScene(index);
      return;
    }
    if (action === "duplicate") {
      duplicateSceneAt(index);
      return;
    }
    if (action === "split") {
      splitSceneAt(index);
      return;
    }
    if (action === "unlink") {
      unlinkScene(index);
    }
  }

  function bindGraphEvents() {
    if (!ui.graphNodes || !ui.graphCanvas) return;
    ui.graphCanvas.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      const nodeEl = event.target.closest(".graph-node");
      if (nodeEl) return;
      hideGraphTooltip();
      state.graphPanDrag = {
        startX: event.clientX,
        startY: event.clientY,
        originX: state.graphPan.x,
        originY: state.graphPan.y
      };
    });

    ui.graphCanvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const prevZoom = state.graphZoom || 1;
        const zoomFactor = Math.exp(-event.deltaY * GRAPH_ZOOM_SENSITIVITY);
        const next = clampValue(prevZoom * zoomFactor, GRAPH_ZOOM_MIN, GRAPH_ZOOM_MAX);
        if (next === prevZoom) return;
        const rect = ui.graphCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const offsetX = state.graphOffset ? state.graphOffset.x : 0;
        const offsetY = state.graphOffset ? state.graphOffset.y : 0;
        const graphX = (mouseX - state.graphPan.x) / prevZoom - offsetX;
        const graphY = (mouseY - state.graphPan.y) / prevZoom - offsetY;
        state.graphZoom = next;
        state.graphPan.x = mouseX - (graphX + offsetX) * next;
        state.graphPan.y = mouseY - (graphY + offsetY) * next;
        saveGraphZoom(next);
        saveGraphPan(state.graphPan);
        renderGraph();
      },
      { passive: false }
    );

    ui.graphNodes.addEventListener("mousedown", (event) => {
      const actionBtn = event.target.closest("[data-node-action]");
      if (actionBtn) return;
      const connector = event.target.closest(".node-connector");
      const nodeEl = event.target.closest(".graph-node");
      if (!nodeEl) return;
      event.preventDefault();
      if (connector) {
        startLinkDrag(nodeEl, event);
        return;
      }
      startNodeDrag(nodeEl, event);
    });

    ui.graphNodes.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-node-action]");
      if (!actionBtn) return;
      const nodeEl = actionBtn.closest(".graph-node");
      if (!nodeEl) return;
      event.preventDefault();
      event.stopPropagation();
      handleGraphNodeAction(nodeEl, actionBtn.dataset.nodeAction);
    });

    document.addEventListener("mousemove", (event) => {
      if (state.graphPanDrag) {
        const dx = event.clientX - state.graphPanDrag.startX;
        const dy = event.clientY - state.graphPanDrag.startY;
        state.graphPan.x = state.graphPanDrag.originX + dx;
        state.graphPan.y = state.graphPanDrag.originY + dy;
        renderGraph();
        return;
      }
      if (state.graphDrag) {
        const point = getGraphPoint(event);
        const x = point.x - state.graphDrag.offsetX;
        const y = point.y - state.graphDrag.offsetY;
        const key = state.graphDrag.key;
        state.graphDrag.moved = Math.abs(point.x - state.graphDrag.startX) > 2 || Math.abs(point.y - state.graphDrag.startY) > 2;
        state.graphPositions[key] = { x, y };
        const offsetX = state.graphOffset ? state.graphOffset.x : 0;
        const offsetY = state.graphOffset ? state.graphOffset.y : 0;
        const nodeEl = ui.graphNodes.querySelector(`.graph-node[data-key="${CSS.escape(key)}"]`);
        if (nodeEl) {
          nodeEl.style.left = `${x + offsetX}px`;
          nodeEl.style.top = `${y + offsetY}px`;
        }
        ensureGraphSurfaceBounds(x + offsetX, y + offsetY);
        drawGraphEdges(state.graphData || { edges: [] });
      } else if (state.graphLink) {
        updateDragLine(state.graphLink.fromPoint, getGraphPoint(event));
      }
      if (state.graphHover) {
        moveGraphTooltip(event);
      }
    });

    document.addEventListener("mouseup", (event) => {
      if (state.graphPanDrag) {
        saveGraphPan(state.graphPan);
        state.graphPanDrag = null;
        return;
      }
      if (state.graphLink) {
        finishLinkDrag(event);
        return;
      }
      if (state.graphDrag) {
        finishNodeDrag(event);
      }
    });

    ui.graphNodes.addEventListener("mousemove", (event) => {
      if (state.graphDrag || state.graphLink || state.graphPanDrag) return;
      const nodeEl = event.target.closest(".graph-node");
      if (!nodeEl) {
        if (state.graphHover) {
          hideGraphTooltip();
        }
        return;
      }
      if (!state.graphHover || state.graphHover.nodeEl !== nodeEl) {
        showGraphTooltip(nodeEl, event);
        return;
      }
      moveGraphTooltip(event);
    });

    ui.graphNodes.addEventListener("mouseleave", () => {
      hideGraphTooltip();
    });

    ui.graphCanvas.addEventListener("mouseleave", () => {
      hideGraphTooltip();
    });
  }

  function getSelectedSceneId() {
    const scene = getScene();
    return scene && scene.id ? String(scene.id) : "";
  }

  function syncPreviewSceneId(force) {
    if (!ui.previewSceneId) return;
    if (state.previewIdTouched && !force) return;
    const selectedId = getSelectedSceneId();
    state.previewSceneId = selectedId;
    ui.previewSceneId.value = selectedId;
  }

  function getPreviewSceneId() {
    if (ui.previewSceneId) {
      return ui.previewSceneId.value.trim();
    }
    return state.previewSceneId || "";
  }

  function updatePreviewMuteUi() {
    if (ui.previewMuteBtn) {
      ui.previewMuteBtn.textContent = state.previewMuted ? "Звук: Выкл" : "Звук: Вкл";
    }
  }

  function storePreviewData(startId) {
    try {
      const compiled = compileCmdToTimeline(state.story);
      localStorage.setItem(PREVIEW_DATA_KEY, JSON.stringify(compiled));
      localStorage.setItem(PREVIEW_START_KEY, startId || "");
      localStorage.setItem(PREVIEW_MUTE_KEY, state.previewMuted ? "1" : "0");
    } catch (err) {
      console.warn("Не удалось сохранить данные предпросмотра", err);
    }
  }

  function buildPreviewUrl(startId) {
    const params = new URLSearchParams();
    params.set("preview", "1");
    if (startId) params.set("start", startId);
    params.set("mute", state.previewMuted ? "1" : "0");
    params.set("ts", String(Date.now()));
    return `index.html?${params.toString()}`;
  }

  function refreshPreview(startId) {
    const fallbackId = state.story.startSceneId || getSelectedSceneId() || "1";
    const targetId = startId || getPreviewSceneId() || fallbackId;
    storePreviewData(targetId);
    if (ui.previewFrame) {
      ui.previewFrame.src = buildPreviewUrl(targetId);
    }
    if (ui.previewActiveId) {
      ui.previewActiveId.textContent = targetId || "—";
    }
  }

  function openPreviewWindow(startId) {
    const fallbackId = state.story.startSceneId || getSelectedSceneId() || "1";
    const targetId = startId || getPreviewSceneId() || fallbackId;
    storePreviewData(targetId);
    window.open(buildPreviewUrl(targetId), "_blank");
  }

  function validateStory() {
    const issues = [];
    const idMap = new Map();
    const cmdScripts = Array.isArray(state.story.cmdScripts) ? state.story.cmdScripts : [];
    const cmdScriptIdCounts = new Map();
    cmdScripts.forEach((script) => {
      const sid = String(script.id || "").trim();
      if (!sid) return;
      cmdScriptIdCounts.set(sid, (cmdScriptIdCounts.get(sid) || 0) + 1);
    });
    const cmdScriptIds = new Set(cmdScripts.map((scr) => String(scr.id || "")).filter(Boolean));
    cmdScripts.forEach((script, index) => {
      const sid = String(script.id || "").trim();
      if (!sid) {
        issues.push({ level: "warn", message: `CMD скрипт #${index + 1}: пустой id.` });
      } else if (cmdScriptIdCounts.get(sid) > 1) {
        issues.push({ level: "warn", message: `CMD скрипт: дубликат id "${sid}".` });
      }
    });
    state.story.scenes.forEach((scene, index) => {
      const id = scene.id !== undefined && scene.id !== null ? String(scene.id).trim() : "";
      if (!id) {
        issues.push({ level: "error", message: `Сцена #${index + 1}: пустой id.`, sceneIndex: index });
      } else if (idMap.has(id)) {
        issues.push({ level: "error", message: `Дубликат id "${id}".`, sceneId: id, sceneIndex: index });
      } else {
        idMap.set(id, index);
      }
      if (!scene.text || !String(scene.text).trim()) {
        issues.push({ level: "warn", message: `Сцена ${id || index + 1}: пустой текст.`, sceneId: id || undefined, sceneIndex: index });
      }
      if (Array.isArray(scene.characters)) {
        scene.characters.forEach((entry) => {
          const refId = entry.characterId || entry.use;
          if (refId && !characters[refId]) {
            issues.push({ level: "warn", message: `Сцена ${id || index + 1}: неизвестный characterId "${refId}".`, sceneId: id || undefined, sceneIndex: index });
          } else if (refId && (entry.pose || entry.imageKey)) {
            const pose = entry.pose || entry.imageKey;
            const images = characters[refId] && characters[refId].images ? characters[refId].images : {};
            if (pose && !images[pose]) {
              issues.push({ level: "warn", message: `Сцена ${id || index + 1}: неизвестная поза "${pose}" для ${refId}.`, sceneId: id || undefined, sceneIndex: index });
            }
          }
        });
      }
      const linkFields = [
        { value: scene.next, label: "next" },
        { value: scene.timeoutNext, label: "timeoutNext" },
        { value: scene.fallbackNext, label: "fallbackNext" }
      ];
      linkFields.forEach((field) => {
        if (field.value !== undefined && field.value !== null && field.value !== "") {
          const target = String(field.value).trim();
          if (target && !idMap.has(target)) {
            issues.push({ level: "warn", message: `Сцена ${id || index + 1}: ${field.label} -> "${target}" не найден.`, sceneId: id || undefined, sceneIndex: index });
          }
        }
      });
      if (Array.isArray(scene.choices)) {
        scene.choices.forEach((choice, choiceIndex) => {
          if (choice.next !== undefined && choice.next !== null && choice.next !== "") {
            const target = String(choice.next).trim();
            if (target && !idMap.has(target)) {
              issues.push({ level: "warn", message: `Выбор ${id || index + 1}.${choiceIndex + 1}: next -> "${target}" не найден.`, sceneId: id || undefined, sceneIndex: index });
            }
          }
        });
      }
      if (scene.cmd && scene.cmd.enabled && scene.cmd.source === "script") {
        const sid = String(scene.cmd.scriptId || "").trim();
        if (sid && !cmdScriptIds.has(sid)) {
          issues.push({ level: "warn", message: `Сцена ${id || index + 1}: cmd.scriptId "${sid}" не найден.`, sceneId: id || undefined, sceneIndex: index });
        }
      }
      const cmdSteps = [];
      if (scene.cmd && scene.cmd.enabled) {
        if (scene.cmd.source === "inline") {
          if (Array.isArray(scene.cmd.steps)) cmdSteps.push(...scene.cmd.steps);
        } else if (scene.cmd.source === "script") {
          const sid = String(scene.cmd.scriptId || "").trim();
          const script = sid ? cmdScripts.find((scr) => String(scr.id || "") === sid) : null;
          if (script && Array.isArray(script.steps)) cmdSteps.push(...script.steps);
        }
      }
      cmdSteps.forEach((step, stepIndex) => {
        const type = String(step.type || "").toLowerCase();
        if (type === "choice" && step.nextOnKey && typeof step.nextOnKey === "object") {
          Object.values(step.nextOnKey).forEach((targetValue) => {
            const target = String(targetValue || "").trim();
            if (target && !idMap.has(target)) {
              issues.push({ level: "warn", message: `CMD choice ${id || index + 1}.${stepIndex + 1}: nextOnKey -> "${target}" не найден.`, sceneId: id || undefined, sceneIndex: index });
            }
          });
        }
      });
    });
    const previewId = getPreviewSceneId();
    if (previewId && !idMap.has(previewId)) {
      issues.push({ level: "warn", message: `Предпросмотр: сцена "${previewId}" не найдена.` });
    }
    return issues;
  }

  function generateStoryJs() {
    const story = cleanObject(compileCmdToTimeline(state.story));
    const scenes = Array.isArray(story.scenes) ? story.scenes : [];
    const prunedScenes = scenes
      .map((scene) => pruneEmpty(scene))
      .filter((scene) => scene !== undefined);
    const observerLines = Array.isArray(story.observerLines) ? story.observerLines : [];
    const cmdScripts = Array.isArray(story.cmdScripts) ? story.cmdScripts : [];
    const prunedCmdScripts = cmdScripts
      .map((script) => pruneEmpty(script))
      .filter((script) => script !== undefined);
    const audio = pruneEmpty(story.audio) || {};
    const startId = story.startSceneId ? String(story.startSceneId) : "1";

    const observerLinesText = stringifyJs(observerLines, 0);
    const scenesText = stringifyJs(prunedScenes, 0);
    const audioText = stringifyJs(audio, 0);
    const cmdScriptsText = stringifyJs(prunedCmdScripts, 0);
    const startIdText = stringifyJs(startId, 0);
    const audioInline = indentAfterFirstLine(audioText, 4);

    return [
      "(() => {",
      "",
      `const OBSERVER_LINES = ${observerLinesText};`,
      "",
      "",
      `const SCENES = ${scenesText};`,
      "",
      "",
      `const CMD_SCRIPTS = ${cmdScriptsText};`,
      "",
      "",
      "window.STORY = {",
      `    startSceneId: ${startIdText},`,
      "    observerLines: OBSERVER_LINES,",
      `    audio: ${audioInline},`,
      "    cmdScripts: CMD_SCRIPTS,",
      "    scenes: SCENES",
      "};",
      "})();",
      ""
    ].join("\n");
  }

  function compileCmdToTimeline(story) {
    const compiled = deepClone(story || {});
    const scripts = Array.isArray(compiled.cmdScripts) ? compiled.cmdScripts : [];
    const scriptMap = new Map();
    scripts.forEach((script) => {
      const id = String(script.id || "").trim();
      if (id) scriptMap.set(id, script);
    });

    const scenes = Array.isArray(compiled.scenes) ? compiled.scenes : [];
    scenes.forEach((scene) => {
      if (!scene || !scene.cmd || !scene.cmd.enabled) {
        return;
      }
      const cmd = scene.cmd;
      const source = cmd.source || "inline";
      let steps = [];
      if (source === "script") {
        const scriptId = String(cmd.scriptId || "").trim();
        const script = scriptMap.get(scriptId);
        steps = script && Array.isArray(script.steps) ? script.steps : [];
      } else {
        steps = Array.isArray(cmd.steps) ? cmd.steps : [];
      }
      if (!steps.length) {
        return;
      }
      const startAt = toNumber(cmd.startAt, 0);
      let cursor = Math.max(0, startAt);
      const timeline = Array.isArray(scene.timeline) ? scene.timeline.slice() : [];

      steps.forEach((step) => {
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
            const payload = lines && lines.length ? { lines } : { text };
            if (step.asCommand !== undefined) {
              payload.asCommand = Boolean(step.asCommand);
            }
            event = { at: cursor, type: "system", op: "terminal.print", payload };
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
              autoSubmit: step.autoSubmit
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
          timeline.push(event);
        }
        cursor += Math.max(0, toNumber(step.delayMs, 0));
      });

      scene.timeline = timeline;
    });
    return compiled;
  }

  function cleanObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject);
    }
    if (obj && typeof obj === "object") {
      const result = {};
      Object.keys(obj).forEach((key) => {
        const value = cleanObject(obj[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      });
      return result;
    }
    if (obj === undefined) return undefined;
    return obj;
  }

  function pruneEmpty(value) {
    if (Array.isArray(value)) {
      const cleaned = value
        .map(pruneEmpty)
        .filter((entry) => entry !== undefined);
      return cleaned.length ? cleaned : undefined;
    }
    if (value && typeof value === "object") {
      const result = {};
      Object.keys(value).forEach((key) => {
        const cleaned = pruneEmpty(value[key]);
        if (cleaned !== undefined) {
          result[key] = cleaned;
        }
      });
      return Object.keys(result).length ? result : undefined;
    }
    if (value === undefined) return undefined;
    return value;
  }

  function isValidIdentifier(key) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
  }

  function stringifyJs(value, indentLevel) {
    const level = indentLevel || 0;
    const indent = "    ".repeat(level);
    const nextIndent = "    ".repeat(level + 1);

    if (value === null) return "null";
    const type = typeof value;
    if (type === "string") return JSON.stringify(value);
    if (type === "number" || type === "boolean") return String(value);
    if (Array.isArray(value)) {
      if (!value.length) return "[]";
      const items = value.map((item) => `${nextIndent}${stringifyJs(item, level + 1)}`);
      return `[\n${items.join(",\n")}\n${indent}]`;
    }
    if (value && type === "object") {
      const keys = Object.keys(value);
      if (!keys.length) return "{}";
      const lines = keys.map((key) => {
        const safeKey = isValidIdentifier(key) ? key : JSON.stringify(key);
        return `${nextIndent}${safeKey}: ${stringifyJs(value[key], level + 1)}`;
      });
      return `{\n${lines.join(",\n")}\n${indent}}`;
    }
    return "null";
  }

  function indentAfterFirstLine(text, spaces) {
    const pad = " ".repeat(spaces);
    return String(text)
      .split("\n")
      .map((line, index) => (index === 0 ? line : pad + line))
      .join("\n");
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(text) {
    return String(text).replace(/"/g, "&quot;");
  }

  function renderPositionOptions(current) {
    const options = ["", "left", "center", "right", "far-left", "far-right"];
    return options
      .map((value) => `<option value="${value}" ${value === (current || "") ? "selected" : ""}>${value || "—"}</option>`)
      .join("");
  }

  function renderEnterOptions(current) {
    const options = ["", "fade", "slide-left", "slide-right", "zoom"];
    return options
      .map((value) => `<option value="${value}" ${value === (current || "") ? "selected" : ""}>${value || "—"}</option>`)
      .join("");
  }

  function renderFrameModeOptions(current) {
    const options = ["", "loop", "once", "random"];
    return options
      .map((value) => `<option value="${value}" ${value === (current || "") ? "selected" : ""}>${value || "—"}</option>`)
      .join("");
  }

  function renderTimelineTypeOptions(current) {
    const options = ["toast", "effect", "noise", "hint", "prompt", "screenText", "observer", "system", "sfx", "music", "input.playername"];
    return ["", ...options]
      .map((value) => `<option value="${value}" ${value === (current || "") ? "selected" : ""}>${value || "—"}</option>`)
      .join("");
  }

  function renderMusicModeOptions(current) {
    const options = ["carry", "pause", "stop"];
    return options
      .map((value) => `<option value="${value}" ${value === (current || "") ? "selected" : ""}>${value}</option>`)
      .join("");
  }

  function getPoseOptions(refId, selected) {
    if (!refId || !characters[refId] || !characters[refId].images) return "";
    return Object.keys(characters[refId].images)
      .map((key) => `<option value="${escapeAttr(key)}" ${key === selected ? "selected" : ""}>${escapeHtml(key)}</option>`)
      .join("");
  }

  function getJsonKey(scope, index, field) {
    return `${scope}:${index}:${field}`;
  }

  function getJsonValue(scope, index, field, value) {
    const key = getJsonKey(scope, index, field);
    if (state.jsonCache[key] !== undefined) {
      return state.jsonCache[key];
    }
    if (value === undefined) return "";
    try {
      return JSON.stringify(value, null, 2);
    } catch (err) {
      return "";
    }
  }

  function jsonErrorClass(scope, index, field) {
    const key = getJsonKey(scope, index, field);
    return state.jsonErrors[key] ? "invalid" : "";
  }

  function getExtraJson(entry) {
    const extra = {};
    const known = new Set([
      "characterId", "use", "pose", "imageKey", "name", "id", "position",
      "x", "y", "offsetX", "offsetY", "size", "opacity", "enter",
      "frames", "frameMs", "frameMode", "overlayVideo", "videoOverlay"
    ]);
    Object.keys(entry || {}).forEach((key) => {
      if (!known.has(key)) {
        extra[key] = entry[key];
      }
    });
    if (!Object.keys(extra).length) return "";
    try {
      return JSON.stringify(extra, null, 2);
    } catch (err) {
      return "";
    }
  }

  function normalizeVoice(def) {
    if (!def) return { src: "", volume: "" };
    if (typeof def === "string") return { src: def, volume: "" };
    return { src: def.src || "", volume: def.volume ?? "" };
  }

  function normalizeMusic(def) {
    if (!def) return { src: "", volume: "", loop: true, mode: "", fadeMs: "" };
    if (typeof def === "string") return { src: def, volume: "", loop: true, mode: "", fadeMs: "" };
    return {
      src: def.src || "",
      volume: def.volume ?? "",
      loop: def.loop !== undefined ? def.loop : true,
      mode: def.mode || "",
      fadeMs: def.fadeMs ?? ""
    };
  }

  function applyInputChange(target) {
    const scope = target.dataset.scope;
    const field = target.dataset.field;
    const kind = target.dataset.kind || "string";
    if (scope === "scene") {
      updateSceneField(field, kind, target.value, target.checked);
    } else if (scope === "story") {
      updateStoryField(field, kind, target.value);
    } else if (scope === "storyAudio") {
      updateStoryAudio(field, kind, target.value);
    } else if (scope === "sceneAudio") {
      updateSceneAudio(field, kind, target.value);
    }
  }

  function updateSceneField(field, kind, value, checked) {
    const scene = getScene();
    if (!scene) return;
    if (field && field.includes(".")) {
      const parts = field.split(".");
      const last = parts.pop();
      let target = scene;
      parts.forEach((key) => {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        target = target[key];
      });
      let nextValue = undefined;
      if (kind === "boolean") {
        nextValue = Boolean(checked);
      } else if (kind === "number") {
        const num = parseFloat(value);
        if (Number.isFinite(num)) {
          nextValue = num;
        }
      } else if (kind === "cmdLines" && last === "quickText") {
        applyCmdQuickText(scene, value);
        recordHistory("input");
        scheduleSave();
        softRefresh();
        return;
      } else {
        const trimmed = String(value || "").trim();
        if (trimmed) {
          nextValue = trimmed;
        }
      }

      if (nextValue === undefined) {
        delete target[last];
      } else {
        target[last] = nextValue;
      }

      if (parts[0] === "cmd" && last === "enabled") {
        if (scene.cmd && scene.cmd.enabled) {
          if (!scene.cmd.source) scene.cmd.source = "inline";
          if (!Array.isArray(scene.cmd.steps)) scene.cmd.steps = [];
        }
      }
      if (parts[0] === "cmd" && last === "scriptId") {
        const idx = getCmdScriptIndexById(nextValue);
        if (idx >= 0) {
          state.cmdScriptSelected = idx;
        }
      }

      recordHistory("input");
      scheduleSave();
      if (parts[0] === "cmd") {
        renderTabs();
      } else {
        softRefresh();
      }
      return;
    }
    if (field === "id") {
      const oldId = scene.id ? String(scene.id).trim() : "";
      const newId = String(value || "").trim();
      if (oldId === newId) {
        return;
      }
      const oldKey = oldId ? `id:${oldId}` : `idx:${state.selectedIndex}`;
      if (!newId) {
        if (oldId) {
          delete scene.id;
          const nextKey = `idx:${state.selectedIndex}`;
          if (state.graphPositions && state.graphPositions[oldKey]) {
            if (!state.graphPositions[nextKey]) {
              state.graphPositions[nextKey] = state.graphPositions[oldKey];
            }
            delete state.graphPositions[oldKey];
            saveGraphPositions();
          }
        } else {
          delete scene.id;
        }
      } else if (oldId) {
        renameSceneId(oldId, newId);
      } else {
        scene.id = newId;
        const nextKey = `id:${newId}`;
        if (state.graphPositions && state.graphPositions[oldKey]) {
          if (!state.graphPositions[nextKey]) {
            state.graphPositions[nextKey] = state.graphPositions[oldKey];
          }
          delete state.graphPositions[oldKey];
          saveGraphPositions();
        }
      }
      recordHistory("input");
      scheduleSave();
      softRefresh();
      return;
    }
    if (kind === "boolean") {
      scene[field] = checked;
    } else if (kind === "number") {
      const num = parseFloat(value);
      if (Number.isFinite(num)) {
        scene[field] = num;
      } else {
        delete scene[field];
      }
    } else if (kind === "lines") {
      const list = value.split("\n").map((line) => line.trim()).filter(Boolean);
      if (list.length) {
        scene[field] = list;
      } else {
        delete scene[field];
      }
    } else if (kind === "comma") {
      const list = value.split(",").map((item) => item.trim()).filter(Boolean);
      if (list.length) {
        scene[field] = list;
      } else {
        delete scene[field];
      }
    } else if (kind === "json") {
      const key = getJsonKey("scene", state.selectedIndex, field);
      state.jsonCache[key] = value;
      if (!value.trim()) {
        delete scene[field];
        delete state.jsonErrors[key];
      } else {
        try {
          scene[field] = JSON.parse(value);
          delete state.jsonErrors[key];
        } catch (err) {
          state.jsonErrors[key] = err.message;
        }
      }
    } else {
      const trimmed = value.trim();
      if (trimmed) {
        scene[field] = trimmed;
      } else {
        delete scene[field];
      }
    }
    recordHistory("input");
    scheduleSave();
    softRefresh();
    if (field === "type") {
      refreshCmdTab(false);
    }
  }

  function updateStoryField(field, kind, value) {
    if (field === "observerLines") {
      const list = value.split("\n").map((line) => line.trim()).filter(Boolean);
      state.story.observerLines = list;
    } else if (kind === "lines") {
      const list = value.split("\n").map((line) => line.trim()).filter(Boolean);
      state.story[field] = list;
    } else {
      state.story[field] = value.trim() || "1";
    }
    recordHistory("input");
    scheduleSave();
    softRefresh();
  }

  function updateStoryAudio(field, kind, value) {
    if (!state.story.audio || typeof state.story.audio !== "object") {
      state.story.audio = {};
    }
    const audio = state.story.audio;
    if (field === "voiceSrc" || field === "voiceVolume") {
      const voice = normalizeVoice(audio.voice);
      if (field === "voiceSrc") voice.src = value.trim();
      if (field === "voiceVolume") {
        const num = parseFloat(value);
        voice.volume = Number.isFinite(num) ? num : "";
      }
      audio.voice = voice.src ? (voice.volume === "" ? voice.src : { src: voice.src, volume: voice.volume }) : "";
    }
    if (field === "musicSrc" || field === "musicVolume" || field === "musicLoop") {
      const music = normalizeMusic(audio.music);
      if (field === "musicSrc") music.src = value.trim();
      if (field === "musicVolume") {
        const num = parseFloat(value);
        music.volume = Number.isFinite(num) ? num : "";
      }
      if (field === "musicLoop") music.loop = value === "true";
      audio.music = music.src ? { src: music.src, volume: music.volume === "" ? undefined : music.volume, loop: music.loop } : "";
    }
    if (field === "musicModeDefault") {
      audio.musicModeDefault = value;
    }
    if (field === "musicFadeMs") {
      const num = parseFloat(value);
      if (Number.isFinite(num)) {
        audio.musicFadeMs = num;
      } else {
        delete audio.musicFadeMs;
      }
    }
    recordHistory("input");
    scheduleSave();
    softRefresh();
  }

  function updateSceneAudio(field, kind, value) {
    const scene = getScene();
    if (!scene) return;
    if (field === "voiceSrc" || field === "voiceVolume") {
      const voice = normalizeVoice(scene.voice);
      if (field === "voiceSrc") voice.src = value.trim();
      if (field === "voiceVolume") {
        const num = parseFloat(value);
        voice.volume = Number.isFinite(num) ? num : "";
      }
      scene.voice = voice.src ? (voice.volume === "" ? voice.src : { src: voice.src, volume: voice.volume }) : undefined;
    }
    if (field === "musicSrc" || field === "musicVolume" || field === "musicLoop") {
      const music = normalizeMusic(scene.music);
      if (field === "musicSrc") music.src = value.trim();
      if (field === "musicVolume") {
        const num = parseFloat(value);
        music.volume = Number.isFinite(num) ? num : "";
      }
      if (field === "musicLoop") music.loop = value === "true";
      scene.music = music.src ? { src: music.src, volume: music.volume === "" ? undefined : music.volume, loop: music.loop } : undefined;
    }
    if (field === "musicMode") {
      const music = normalizeMusic(scene.music);
      music.mode = value;
      if (music.src) {
        scene.music = { ...scene.music, mode: music.mode };
      }
    }
    if (field === "musicFadeMs") {
      const num = parseFloat(value);
      if (Number.isFinite(num)) {
        scene.music = { ...(scene.music || {}), fadeMs: num };
      } else if (scene.music && typeof scene.music === "object") {
        delete scene.music.fadeMs;
      }
    }
    recordHistory("input");
    scheduleSave();
    softRefresh();
  }

  const MIRRORED_CHARACTER_FIELDS = new Set([
    "enter",
    "frames",
    "frameMs",
    "frameMode",
    "position",
    "x",
    "y",
    "offsetX",
    "offsetY",
    "size",
    "opacity",
    "overlayVideo.videoName",
    "overlayVideo.x",
    "overlayVideo.y",
    "overlayVideo.width",
    "overlayVideo.height",
    "overlayVideo.xPx",
    "overlayVideo.yPx",
    "overlayVideo.widthPx",
    "overlayVideo.heightPx",
    "overlayVideo.opacity",
    "overlayVideo.blend",
    "overlayVideo.anchor",
    "overlayVideo.scale",
    "overlayVideo.playbackRate",
    "overlayVideo.loop",
    "overlayVideo.muted",
    "overlayVideo.autoplay"
  ]);

  function getNestedValue(source, path) {
    if (!source || !path) return undefined;
    const parts = String(path).split(".");
    let current = source;
    for (let i = 0; i < parts.length; i += 1) {
      const key = parts[i];
      if (!current || typeof current !== "object" || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    return current;
  }

  function syncMirroredInputs(collection, index, field, sourceEl) {
    if (collection !== "characters" || !MIRRORED_CHARACTER_FIELDS.has(field)) {
      return;
    }
    const scene = getScene();
    if (!scene || !Array.isArray(scene.characters)) {
      return;
    }
    const entry = scene.characters[index];
    if (!entry) {
      return;
    }

    let nextValue = "";
    let nextChecked = null;
    if (field === "frames") {
      nextValue = Array.isArray(entry.frames) ? entry.frames.join("\n") : "";
    } else if (field === "frameMs") {
      nextValue = entry.frameMs === undefined || entry.frameMs === null ? "" : String(entry.frameMs);
    } else if (field === "frameMode") {
      nextValue = entry.frameMode ? String(entry.frameMode) : "";
    } else if (field === "enter") {
      nextValue = entry.enter ? String(entry.enter) : "";
    } else if (field === "overlayVideo.loop" || field === "overlayVideo.muted" || field === "overlayVideo.autoplay") {
      const value = getNestedValue(entry, field);
      nextChecked = value === undefined ? false : Boolean(value);
    } else if (field.includes(".")) {
      const value = getNestedValue(entry, field);
      nextValue = value === undefined || value === null ? "" : String(value);
    } else {
      const value = entry[field];
      nextValue = value === undefined || value === null ? "" : String(value);
    }

    const inputs = document.querySelectorAll(
      `[data-collection="characters"][data-index="${index}"][data-field="${CSS.escape(field)}"]`
    );
    inputs.forEach((el) => {
      if (el === sourceEl) return;
      if (el.type === "checkbox") {
        if (nextChecked === null) return;
        if (el.checked !== nextChecked) {
          el.checked = nextChecked;
        }
      } else if (el.value !== nextValue) {
        el.value = nextValue;
      }
    });
  }

  function updateCollectionField(collection, index, field, kind, value, checked, sourceEl) {
    const scene = getScene();
    if (!scene) return;
    const list = Array.isArray(scene[collection]) ? scene[collection] : [];
    const entry = list[index];
    if (!entry) return;
    if (field && field.includes(".")) {
      const parts = field.split(".");
      const last = parts.pop();
      let target = entry;
      parts.forEach((key) => {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        target = target[key];
      });

      let nextValue = undefined;
      if (kind === "boolean") {
        nextValue = Boolean(checked);
      } else if (kind === "number") {
        const num = parseFloat(value);
        if (Number.isFinite(num)) {
          nextValue = num;
        }
      } else {
        const trimmed = value.trim();
        if (trimmed) {
          nextValue = trimmed;
        }
      }

      if (nextValue === undefined) {
        delete target[last];
      } else {
        target[last] = nextValue;
      }

      for (let i = parts.length; i > 0; i -= 1) {
        const parentPath = parts.slice(0, i - 1);
        const key = parts[i - 1];
        let parent = entry;
        parentPath.forEach((seg) => {
          if (parent && typeof parent === "object") {
            parent = parent[seg];
          }
        });
        if (!parent || typeof parent !== "object") break;
        const obj = parent[key];
        if (obj && typeof obj === "object" && !Object.keys(obj).length) {
          delete parent[key];
        }
      }

      syncMirroredInputs(collection, index, field, sourceEl);
      recordHistory("input");
      scheduleSave();
      softRefresh();
      return;
    }
    if (collection === "characters" && field === "refType") {
      if (value === "use") {
        entry.use = entry.characterId || "";
        delete entry.characterId;
      } else {
        entry.characterId = entry.use || "";
        delete entry.use;
      }
    } else if (collection === "characters" && field === "characterId") {
      if (entry.use !== undefined) {
        entry.use = value;
      } else {
        entry.characterId = value;
      }
      entry.pose = "";
      entry.imageKey = undefined;
    } else if (collection === "characters" && field === "pose") {
      if (entry.imageKey !== undefined && entry.pose === undefined) {
        entry.imageKey = value;
      } else {
        entry.pose = value;
      }
    } else if (kind === "boolean") {
      entry[field] = checked;
    } else if (kind === "number") {
      const num = parseFloat(value);
      if (Number.isFinite(num)) {
        entry[field] = num;
      } else {
        delete entry[field];
      }
    } else if (kind === "lines") {
      const listValue = value.split("\n").map((line) => line.trim()).filter(Boolean);
      if (listValue.length) {
        entry[field] = listValue;
      } else {
        delete entry[field];
      }
    } else if (kind === "comma") {
      const listValue = value.split(",").map((line) => line.trim()).filter(Boolean);
      if (listValue.length) {
        entry[field] = listValue;
      } else {
        delete entry[field];
      }
    } else if (kind === "json") {
      const key = getJsonKey(collection, index, field);
      state.jsonCache[key] = value;
      if (!value.trim()) {
        if (field === "extra") {
          // remove extra fields by ignoring
        } else {
          delete entry[field];
        }
        delete state.jsonErrors[key];
      } else {
        try {
          const parsed = JSON.parse(value);
          if (field === "extra") {
            Object.keys(parsed).forEach((extraKey) => {
              entry[extraKey] = parsed[extraKey];
            });
          } else {
            entry[field] = parsed;
          }
          delete state.jsonErrors[key];
        } catch (err) {
          state.jsonErrors[key] = err.message;
        }
      }
    } else {
      const trimmed = value.trim();
      if (trimmed) {
        entry[field] = trimmed;
      } else {
        delete entry[field];
      }
    }
    syncMirroredInputs(collection, index, field, sourceEl);
    recordHistory("input");
    scheduleSave();
    softRefresh();
  }

  function getCmdStepList(scope, scriptIndex) {
    const scene = getScene();
    if (!scene) return null;
    if (scope === "inline") {
      const cmd = ensureSceneCmd(scene);
      return cmd.steps;
    }
    if (scope === "script") {
      const scripts = getCmdScripts();
      if (!Number.isFinite(scriptIndex) || !scripts[scriptIndex]) return null;
      return ensureCmdStepsArray(scripts[scriptIndex]);
    }
    return null;
  }

  function updateCmdStepField(scope, index, field, kind, value, checked, scriptIndex) {
    const list = getCmdStepList(scope, scriptIndex);
    if (!list || !list[index]) return;
    const step = list[index];

    if (kind === "boolean") {
      step[field] = Boolean(checked);
    } else if (kind === "number") {
      const num = parseFloat(value);
      if (Number.isFinite(num)) {
        step[field] = num;
      } else {
        delete step[field];
      }
    } else if (kind === "json") {
      const key = getJsonKey(`cmd:${scope}`, index, field);
      if (!value.trim()) {
        delete step[field];
        delete state.jsonErrors[key];
        state.jsonCache[key] = "";
      } else {
        try {
          step[field] = JSON.parse(value);
          delete state.jsonErrors[key];
          state.jsonCache[key] = value;
        } catch (err) {
          state.jsonErrors[key] = true;
          state.jsonCache[key] = value;
        }
      }
    } else if (field === "keys") {
      const listValue = String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (listValue.length) {
        step.keys = listValue;
      } else {
        delete step.keys;
      }
    } else {
      const trimmed = String(value || "").trim();
      if (trimmed) {
        step[field] = trimmed;
      } else {
        delete step[field];
      }
    }

    recordHistory("input");
    scheduleSave();
    softRefresh();
  }

  function updateCmdScriptField(index, field, value) {
    const scripts = getCmdScripts();
    if (!Number.isFinite(index) || !scripts[index]) return;
    const script = scripts[index];
    if (field === "id") {
      const oldId = String(script.id || "");
      const nextId = String(value || "").trim();
      if (!nextId || nextId === oldId) return;
      script.id = nextId;
      state.story.scenes.forEach((scene) => {
        if (scene.cmd && scene.cmd.scriptId === oldId) {
          scene.cmd.scriptId = nextId;
        }
      });
    } else {
      const trimmed = String(value || "").trim();
      if (trimmed) {
        script[field] = trimmed;
      } else {
        delete script[field];
      }
    }
    recordHistory("input");
    scheduleSave();
    softRefresh();
  }

  function createCmdStep(type) {
    const base = { type };
    if (type === "choice") {
      base.keys = ["Y", "N"];
      base.nextOnKey = { Y: "", N: "" };
    }
    return base;
  }

  function addCmdStep(scope, scriptIndex, type) {
    const list = getCmdStepList(scope, scriptIndex);
    if (!list) return;
    list.push(createCmdStep(type || "print"));
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function removeCmdStep(scope, scriptIndex, index) {
    const list = getCmdStepList(scope, scriptIndex);
    if (!list || !list[index]) return;
    list.splice(index, 1);
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function moveCmdStep(scope, scriptIndex, index, delta) {
    const list = getCmdStepList(scope, scriptIndex);
    if (!list || !list[index]) return;
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const item = list.splice(index, 1)[0];
    list.splice(nextIndex, 0, item);
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function createCmdScript() {
    const scripts = getCmdScripts();
    let counter = scripts.length + 1;
    let id = `cmd_script_${counter}`;
    while (scripts.some((scr) => String(scr.id || "") === id)) {
      counter += 1;
      id = `cmd_script_${counter}`;
    }
    const script = { id, label: `Script ${counter}`, steps: [] };
    scripts.push(script);
    state.cmdScriptSelected = scripts.length - 1;
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function duplicateCmdScript() {
    const scripts = getCmdScripts();
    if (!Number.isFinite(state.cmdScriptSelected) || !scripts[state.cmdScriptSelected]) return;
    const source = scripts[state.cmdScriptSelected];
    let counter = scripts.length + 1;
    let id = `${String(source.id || "cmd_script")}_${counter}`;
    while (scripts.some((scr) => String(scr.id || "") === id)) {
      counter += 1;
      id = `${String(source.id || "cmd_script")}_${counter}`;
    }
    const clone = deepClone(source);
    clone.id = id;
    clone.label = `${source.label || source.id || "Script"} (copy)`;
    scripts.push(clone);
    state.cmdScriptSelected = scripts.length - 1;
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function removeCmdScript() {
    const scripts = getCmdScripts();
    if (!Number.isFinite(state.cmdScriptSelected) || !scripts[state.cmdScriptSelected]) return;
    const removed = scripts.splice(state.cmdScriptSelected, 1)[0];
    if (removed && removed.id) {
      state.story.scenes.forEach((scene) => {
        if (scene.cmd && scene.cmd.scriptId === removed.id) {
          scene.cmd.scriptId = "";
        }
      });
    }
    state.cmdScriptSelected = Math.min(state.cmdScriptSelected, scripts.length - 1);
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function applyCmdTemplate(scope, scriptIndex, template) {
    const list = getCmdStepList(scope, scriptIndex);
    if (!list) return;
    if (template === "choice") {
      list.push({ type: "open", clear: false });
      list.push({ type: "choice", prompt: "Proceed? [Y/N]", keys: ["Y", "N"], nextOnKey: { Y: "", N: "" } });
      list.push({ type: "close" });
    } else if (template === "system32") {
      list.push({ type: "open", clear: false });
      list.push({ type: "print", text: "Deleting C:\\\\Windows\\\\System32..." });
      list.push({ type: "type", text: "del /f /s /q C:\\\\Windows\\\\System32", speedMs: 20 });
      list.push({ type: "print", text: "Access is denied." });
    } else if (template === "artifact") {
      list.push({ type: "open", clear: false });
      list.push({ type: "print", text: "Creating artifact..." });
      const scene = getScene();
      if (scene) {
        scene.timeline = Array.isArray(scene.timeline) ? scene.timeline : [];
        scene.timeline.push({
          at: toNumber(scene.cmd && scene.cmd.startAt, 0) || 0,
          type: "system",
          op: "files.write",
          payload: { relPath: "Flavortown/Artifact.txt", content: "Artifact", ttlMs: 600000 }
        });
      }
    } else if (template === "error") {
      list.push({ type: "print", text: "The system cannot find the file specified." });
      list.push({ type: "print", text: "Access is denied." });
    }
    recordHistory("structure");
    scheduleSave();
    softRefresh();
    refreshCmdTab(false);
  }

  function handleAction(action, index, sourceEl) {
    const scene = getScene();
    if (!scene) return;
    if (action === "cmd-add-step") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      const container = sourceEl.closest(".cmd-steps-panel");
      const typeSelect = container ? container.querySelector("[data-cmd-add-type]") : null;
      const stepType = typeSelect ? typeSelect.value : "print";
      addCmdStep(scope, scriptIndex, stepType);
      return;
    }
    if (action === "cmd-remove-step") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      removeCmdStep(scope, scriptIndex, index);
      return;
    }
    if (action === "cmd-step-up") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      moveCmdStep(scope, scriptIndex, index, -1);
      return;
    }
    if (action === "cmd-step-down") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      moveCmdStep(scope, scriptIndex, index, 1);
      return;
    }
    if (action === "cmd-template-choice") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      applyCmdTemplate(scope, scriptIndex, "choice");
      return;
    }
    if (action === "cmd-template-system32") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      applyCmdTemplate(scope, scriptIndex, "system32");
      return;
    }
    if (action === "cmd-template-artifact") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      applyCmdTemplate(scope, scriptIndex, "artifact");
      return;
    }
    if (action === "cmd-template-error") {
      const scope = sourceEl && sourceEl.dataset.cmdScope ? sourceEl.dataset.cmdScope : "inline";
      const scriptIndex = sourceEl && sourceEl.dataset.scriptIndex ? parseInt(sourceEl.dataset.scriptIndex, 10) : null;
      applyCmdTemplate(scope, scriptIndex, "error");
      return;
    }
    if (action === "cmd-script-add") {
      createCmdScript();
      return;
    }
    if (action === "cmd-script-duplicate") {
      duplicateCmdScript();
      return;
    }
    if (action === "cmd-script-remove") {
      removeCmdScript();
      return;
    }
    if (action === "cmd-open-window") {
      if (!window.system || !window.system.terminal || typeof window.system.terminal.open !== "function") {
        setStatus("CMD доступен только в Electron");
        return;
      }
      const payload = getCmdOpenPayload(scene);
      Promise.resolve(window.system.terminal.open(payload)).then(() => {
        if (window.system.terminal.print) {
          window.system.terminal.print({ lines: ["[CMD] Ready."] });
        }
      }).catch(() => {});
      return;
    }
    if (action === "cmd-clear-window") {
      if (!window.system || !window.system.terminal || typeof window.system.terminal.print !== "function") {
        setStatus("CMD доступен только в Electron");
        return;
      }
      window.system.terminal.print({ clear: true });
      return;
    }
    if (action === "add-character") {
      scene.characters = Array.isArray(scene.characters) ? scene.characters : [];
      scene.characters.push({ characterId: "", pose: "" });
    }
    if (action === "remove-character") {
      scene.characters.splice(index, 1);
    }
    if (action === "add-choice") {
      scene.choices = Array.isArray(scene.choices) ? scene.choices : [];
      scene.choices.push({ text: "", next: "" });
    }
    if (action === "remove-choice") {
      scene.choices.splice(index, 1);
    }
    if (action === "add-timeline") {
      scene.timeline = Array.isArray(scene.timeline) ? scene.timeline : [];
      scene.timeline.push({ at: 500, type: "toast", message: "", durationMs: TIMELINE_DEFAULT_DURATION });
    }
    if (action === "remove-timeline") {
      scene.timeline.splice(index, 1);
    }
    if (action === "timeline-add-group") {
      scene.timeline = Array.isArray(scene.timeline) ? scene.timeline : [];
      const groups = new Set(
        (scene.timeline || []).map((entry) => getTimelineGroupName(entry))
      );
      let counter = 1;
      let name = `Group ${counter}`;
      while (groups.has(name)) {
        counter += 1;
        name = `Group ${counter}`;
      }
      scene.timeline.push({
        at: 500,
        durationMs: TIMELINE_DEFAULT_DURATION,
        type: "toast",
        message: "",
        group: name
      });
      state.timelineGroupsCollapsed[name] = false;
      saveTimelineGroupsCollapsed();
      state.timelineSelected = scene.timeline.length - 1;
      recordHistory("structure");
      scheduleSave();
      refreshTimelineTracks();
      refreshTimelineInspector();
      return;
    }
    if (action === "timeline-add-event") {
      scene.timeline = Array.isArray(scene.timeline) ? scene.timeline : [];
      const selectedEntry = Number.isFinite(state.timelineSelected) ? scene.timeline[state.timelineSelected] : null;
      const groupName = selectedEntry ? getTimelineGroupName(selectedEntry) : "Основная";
      scene.timeline.push({
        at: 500,
        durationMs: TIMELINE_DEFAULT_DURATION,
        type: "toast",
        message: "",
        group: groupName
      });
      state.timelineSelected = scene.timeline.length - 1;
      recordHistory("structure");
      scheduleSave();
      refreshTimelineTracks();
      refreshTimelineInspector();
      return;
    }
    if (action === "timeline-duplicate-event") {
      if (!Number.isFinite(state.timelineSelected)) return;
      const entry = scene.timeline[state.timelineSelected];
      if (!entry) return;
      scene.timeline.push(deepClone(entry));
      state.timelineSelected = scene.timeline.length - 1;
      recordHistory("structure");
      scheduleSave();
      refreshTimelineTracks();
      refreshTimelineInspector();
      return;
    }
    if (action === "timeline-delete-event") {
      if (!Number.isFinite(state.timelineSelected)) return;
      const idx = state.timelineSelected;
      if (!scene.timeline[idx]) return;
      scene.timeline.splice(idx, 1);
      state.timelineSelected = null;
      recordHistory("structure");
      scheduleSave();
      refreshTimelineTracks();
      refreshTimelineInspector();
      return;
    }
    if (action === "timeline-align-events") {
      (scene.timeline || []).forEach((entry) => {
        const at = toNumber(entry.at, 0);
        entry.at = Math.max(0, Math.round(at / TIMELINE_SNAP_MS) * TIMELINE_SNAP_MS);
        if (entry.durationMs !== undefined) {
          const dur = Math.max(0, toNumber(entry.durationMs, TIMELINE_DEFAULT_DURATION));
          entry.durationMs = Math.max(TIMELINE_SNAP_MS, Math.round(dur / TIMELINE_SNAP_MS) * TIMELINE_SNAP_MS);
        }
      });
      recordHistory("input");
      scheduleSave();
      refreshTimelineTracks();
      refreshTimelineInspector();
      return;
    }
    if (action === "timeline-reset-zoom") {
      state.timelineZoom = TIMELINE_ZOOM_DEFAULT;
      saveTimelineZoom(state.timelineZoom);
      refreshTimelineTracks();
      return;
    }
    if (action === "timeline-auto-fit") {
      autoFitTimeline();
      return;
    }
    if (action === "toggle-timeline-group") {
      const group = sourceEl && sourceEl.dataset.group ? sourceEl.dataset.group : "";
      if (!group) return;
      state.timelineGroupsCollapsed[group] = !state.timelineGroupsCollapsed[group];
      saveTimelineGroupsCollapsed();
      refreshTimelineTracks();
      return;
    }
    recordHistory("structure");
    scheduleSave();
    renderAll();
  }

  function exportStory() {
    const content = "\uFEFF" + generateStoryJs();
    const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "story.js";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("story.js скачан");
  }

  function importStory(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const code = reader.result;
        const backup = window.STORY;
        window.STORY = undefined;
        new Function(code)();
        const imported = window.STORY;
        window.STORY = backup;
        if (!imported || !Array.isArray(imported.scenes)) {
          throw new Error("story.js не содержит window.STORY.scenes");
        }
        state.story = normalizeStory(deepClone(imported));
        state.selectedIndex = 0;
        state.timelineSelected = null;
        state.cmdScriptSelected = null;
        state.jsonCache = {};
        state.jsonErrors = {};
        resetHistory();
        scheduleSave();
        renderAll();
        setStatus("Импортировано");
      } catch (err) {
        console.error(err);
        setStatus("Ошибка импорта");
      }
    };
    reader.readAsText(file);
  }

  function handleTagPreview() {
    const input = document.getElementById("tagTestInput");
    const output = document.getElementById("tagPreviewOutput");
    const tagsOutput = document.getElementById("tagPreviewTags");
    if (!input || !output || !tagsOutput) return;
    const text = input.value || "";
    const withPlayer = text.replace(/\[(playername|playerinput)\]/gi, "Имя игрока");
    output.value = withPlayer.replace(/\[\/?\w+[^\]]*\]/g, "");
    const tags = [];
    const regex = /\[\/?(\w+)([^\]]*)\]/g;
    let match = null;
    while ((match = regex.exec(text))) {
      tags.push(match[0]);
    }
    tagsOutput.value = tags.join("\n");
  }

  ui.sceneSearch.addEventListener("input", (e) => {
    state.filter = e.target.value || "";
    renderSceneList();
  });

  ui.sceneList.addEventListener("click", (e) => {
    const header = e.target.closest(".scene-group-header");
    if (header) {
      const key = header.dataset.groupKey;
      if (key) {
        state.groupCollapsed[key] = !state.groupCollapsed[key];
        saveGroupCollapsed();
        renderSceneList();
      }
      return;
    }
    const item = e.target.closest(".scene-item");
    if (!item) return;
    const index = parseInt(item.dataset.index, 10);
    if (Number.isFinite(index)) {
      selectScene(index);
    }
  });

  ui.addSceneBtn.addEventListener("click", () => addScene());
  ui.duplicateSceneBtn.addEventListener("click", duplicateScene);
  ui.deleteSceneBtn.addEventListener("click", deleteScene);
  ui.moveUpBtn.addEventListener("click", () => moveScene(-1));
  ui.moveDownBtn.addEventListener("click", () => moveScene(1));
  if (ui.undoBtn) {
    ui.undoBtn.addEventListener("click", () => undoLastChange());
  }
  if (ui.saveDraftBtn) {
    ui.saveDraftBtn.addEventListener("click", () => saveDraft());
  }
  ui.exportBtn.addEventListener("click", exportStory);
  ui.resetDraftBtn.addEventListener("click", () => {
    localStorage.removeItem(DRAFT_KEY);
    clearDraftFromDisk();
    state.story = normalizeStory(window.STORY ? deepClone(window.STORY) : deepClone(DEFAULT_STORY));
    state.selectedIndex = 0;
    state.timelineSelected = null;
    state.cmdScriptSelected = null;
    state.jsonCache = {};
    state.jsonErrors = {};
    resetHistory();
    renderAll();
    setStatus("Черновик сброшен");
  });

  ui.importInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importStory(file);
  });

  ui.templateButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyTemplate(btn.dataset.template));
  });

  if (ui.previewSceneId) {
    ui.previewSceneId.addEventListener("input", () => {
      state.previewIdTouched = true;
      state.previewSceneId = ui.previewSceneId.value;
      renderValidation();
    });
  }

  if (ui.previewRefreshBtn) {
    ui.previewRefreshBtn.addEventListener("click", () => {
      refreshPreview();
    });
  }

  if (ui.previewTestBtn) {
    ui.previewTestBtn.addEventListener("click", () => {
      const selectedId = getSelectedSceneId();
      state.previewIdTouched = false;
      if (ui.previewSceneId) {
        ui.previewSceneId.value = selectedId;
      }
      refreshPreview(selectedId);
    });
  }

  if (ui.previewOpenBtn) {
    ui.previewOpenBtn.addEventListener("click", () => {
      openPreviewWindow();
    });
  }

  if (ui.previewMuteBtn) {
    ui.previewMuteBtn.addEventListener("click", () => {
      state.previewMuted = !state.previewMuted;
      updatePreviewMuteUi();
      refreshPreview();
    });
  }

  if (ui.graphLayoutBtn) {
    ui.graphLayoutBtn.addEventListener("click", () => {
      applyGraphLayout(true);
    });
  }

  if (ui.graphResetBtn) {
    ui.graphResetBtn.addEventListener("click", () => {
      state.graphPositions = {};
      saveGraphPositions();
      state.graphPan = { x: 0, y: 0 };
      saveGraphPan(state.graphPan);
      applyGraphLayout(true);
    });
  }

  if (ui.graphSaveBtn) {
    ui.graphSaveBtn.addEventListener("click", () => {
      saveGraphPositions();
      saveGraphPositionsToDisk();
      setStatus("Позиции графа сохранены");
    });
  }

  bindGraphEvents();
  if (ui.tabPanes.animations) {
    ui.tabPanes.animations.addEventListener("pointerdown", handleTimelinePointerDown);
  }
  window.addEventListener("pointermove", handleTimelinePointerMove);
  window.addEventListener("pointerup", handleTimelinePointerUp);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveDraft();
    }
  });

  window.addEventListener("beforeunload", () => {
    saveDraft();
    saveGraphPositionsToDisk();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveDraft();
      saveGraphPositionsToDisk();
    }
  });

  ui.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      ui.tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      const name = tab.dataset.tab;
      Object.entries(ui.tabPanes).forEach(([key, pane]) => {
        pane.classList.toggle("active", key === name);
      });
      state.activeTab = name;
      if (name === "tags") {
        setTimeout(handleTagPreview, 0);
      }
    });
  });

  Object.values(ui.tabPanes).forEach((pane) => {
    pane.addEventListener("input", (e) => {
      const target = e.target;
      if (target.dataset.timelineControl === "zoom") {
        const num = parseFloat(target.value);
        if (Number.isFinite(num)) {
          state.timelineZoom = clampValue(num, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
          saveTimelineZoom(state.timelineZoom);
          updateTimelineZoomUi();
          refreshTimelineTracks();
        }
        return;
      }
      if (target.dataset.cmdScriptSelect !== undefined) {
        const index = parseInt(target.value, 10);
        if (Number.isFinite(index)) {
          state.cmdScriptSelected = index;
          renderTabs();
        }
        return;
      }
      if (target.dataset.scope) {
        applyInputChange(target);
      } else if (target.dataset.cmdScope) {
        const scope = target.dataset.cmdScope;
        const index = parseInt(target.dataset.stepIndex || target.dataset.index, 10);
        const scriptIndex = target.dataset.scriptIndex ? parseInt(target.dataset.scriptIndex, 10) : null;
        if (!Number.isFinite(index)) return;
        updateCmdStepField(scope, index, target.dataset.field, target.dataset.kind || "string", target.value, target.checked, scriptIndex);
      } else if (target.dataset.cmdScriptField) {
        const scriptIndex = parseInt(target.dataset.scriptIndex, 10);
        if (!Number.isFinite(scriptIndex)) return;
        updateCmdScriptField(scriptIndex, target.dataset.cmdScriptField, target.value);
      } else if (target.dataset.collection) {
        const collection = target.dataset.collection;
        const index = parseInt(target.dataset.index, 10);
        if (!Number.isFinite(index)) return;
        updateCollectionField(collection, index, target.dataset.field, target.dataset.kind || "string", target.value, target.checked, target);
      }
      if (target.id === "tagTestInput") {
        handleTagPreview();
      }
    });
    pane.addEventListener("change", (e) => {
      const target = e.target;
      if (target.dataset.timelineControl === "zoom") {
        const num = parseFloat(target.value);
        if (Number.isFinite(num)) {
          state.timelineZoom = clampValue(num, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
          saveTimelineZoom(state.timelineZoom);
          updateTimelineZoomUi();
          refreshTimelineTracks();
        }
        return;
      }
      if (target.dataset.scope) {
        applyInputChange(target);
      } else if (target.dataset.cmdScope) {
        const scope = target.dataset.cmdScope;
        const index = parseInt(target.dataset.stepIndex || target.dataset.index, 10);
        const scriptIndex = target.dataset.scriptIndex ? parseInt(target.dataset.scriptIndex, 10) : null;
        if (!Number.isFinite(index)) return;
        updateCmdStepField(scope, index, target.dataset.field, target.dataset.kind || "string", target.value, target.checked, scriptIndex);
      } else if (target.dataset.cmdScriptField) {
        const scriptIndex = parseInt(target.dataset.scriptIndex, 10);
        if (!Number.isFinite(scriptIndex)) return;
        updateCmdScriptField(scriptIndex, target.dataset.cmdScriptField, target.value);
      } else if (target.dataset.collection) {
        const collection = target.dataset.collection;
        const index = parseInt(target.dataset.index, 10);
        if (!Number.isFinite(index)) return;
        updateCollectionField(collection, index, target.dataset.field, target.dataset.kind || "string", target.value, target.checked, target);
      }
    });
    pane.addEventListener("click", (e) => {
      const button = e.target.closest("[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      const index = button.dataset.index ? parseInt(button.dataset.index, 10) : null;
      handleAction(action, Number.isFinite(index) ? index : undefined, button);
    });
  });

  async function bootstrap() {
    const diskDraft = await loadDraftFromDisk();
    const diskPositions = await loadGraphPositionsFromDisk();
    if (diskPositions) {
      state.graphPositions = diskPositions;
      saveGraphPositions();
    }

    if (diskDraft && !initialDraftLoaded) {
      state.story = normalizeStory(diskDraft);
      state.selectedIndex = 0;
      state.jsonCache = {};
      state.jsonErrors = {};
      initialDraftLoaded = true;
    }
    resetHistory();
    setStatus(initialDraftLoaded ? "Загружен черновик" : STATUS_IDLE);
    renderAll();
    syncPreviewSceneId(true);
    updatePreviewMuteUi();
    initFocusBounce();
  }

  bootstrap();
})();
