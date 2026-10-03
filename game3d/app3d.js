/* =========================================================
   НЕЙРОГОНКА 3D — экшен-игра об основах ИИ (Three.js)
   Проект по информатике. Автор: ditrops
   Уровни: ML-гонка, Дерево решений, A*-поиск, CV-патруль, RL-арена
   ========================================================= */
"use strict";

/* ---------------- Данные уровней ---------------- */
const LEVELS = [
  {
    id: "ml", name: "🚗 ML-гонка", emoji: "📊",
    desc: "Машинное обучение: модель учится на данных. Собирай датасеты 📊, уворачивайся от шума 🐛 и переобучения 🧠.",
    topic: "ML-гонка · обучение на данных",
    distance: 600, timeLimit: 0, target: 25, ability: null, hazards: ["noise", "overfit"],
    quiz: [
      { e: "🤖", q: "Что делает модель машинного обучения?", a: ["Учится закономерности в данных", "Хранит правила, написанные человеком", "Просто считает быстрее"], c: 0,
        f: "<b>Классический код</b> — человек пишет правила. <b>ML</b> — программа сама находит правила из примеров (данных)." },
      { e: "🐛", q: "Ты врезался в «шум». Что это в ML?", a: ["Ошибочные или нерелевантные данные", "Быстрый интернет", "Звук обучения модели"], c: 0,
        f: "<b>Шум в данных</b> — ошибки измерения и мусор. Модель, обученная на шуме, принимает худшие решения." },
      { e: "🧠", q: "«Переобучение» — это когда модель…", a: ["Запоминает шум вместо сути и плохо работает на новых данных", "Слишком быстро думает", "Недостаточно натренирована"], c: 0,
        f: "<b>Overfitting</b>: модель выучила каждый пример наизусть, как зубрёжка без понимания, и проваливается на тесте." }
    ],
    facts: [
      "Компания Tesla обучает автопилот на видео миллионов километров реальных дорог — это и есть «сбор данных» как в игре.",
      "Чем больше качественных данных, тем умнее модель — поэтому датасеты называют «новой нефтью»."
    ]
  },
  {
    id: "tree", name: "🌳 Лабиринт решений", emoji: "🌳",
    desc: "Дерево решений: на развилках выбирай верное правило ЕСЛИ… ТО…, чтобы провести робота к данным.",
    topic: "Дерево решений · классификация признаками",
    distance: 540, timeLimit: 75, target: 18, ability: null, hazards: ["noise"],
    quiz: [
      { e: "❓", q: "Развилка! Какой признак лучше всего делит объекты на кошек и собак?", a: ["Наличие характерного мява 🐱", "Цвет глаз хозяина", "Любимая еда владельца"], c: 0,
        f: "Дерево решений выбирает <b>самые информативные признаки</b>: те, что лучше всего разделяют классы (критерии — энтропия, Джини)." },
      { e: "🌲", q: "Что такое «лист» дерева решений?", a: ["Итоговый ответ/класс", "Самый красивый узел", "Первый вопрос"], c: 0,
        f: "Внутри — вопросы-признаки, а <b>листы</b> — финальные ответы. Путь от корня до листа = одно правило." },
      { e: "✂️", q: "Зачем дерево решений «обрезают»?", a: ["Чтобы не переучилось и было проще", "Для красоты", "Чтобы росло быстрее"], c: 0,
        f: "<b>Прунинг</b> (обрезка) убирает лишние ветви — проще модель ⇒ надёжнее на новых данных." }
    ],
    facts: [
      "Ансамбли деревьев — Random Forest и градиентный бустинг — до сих пор выигрывают соревнования на табличных данных.",
      "Каждое «ЕСЛИ…ТО…» в игре — это реальная проверка признака в алгоритме ID3/C4.5."
    ]
  },
  {
    id: "astar", name: "🔍 Трасса A*", emoji: "🔍",
    desc: "Поисковый интеллект: включай сканер 🔍 (эвристику), находи зелёные узлы поиска ✅ и объезжаешь блокировки ❌.",
    topic: "A* поиск · эвристика и стоимость пути",
    distance: 640, timeLimit: 80, target: 16, ability: "scan", hazards: ["block"],
    quiz: [
      { e: "🧮", q: "Какую оценку использует алгоритм A* для выбора пути?", a: ["f = g + h (пройдено + остаток)", "Только h — догадку", "Случайное число"], c: 0,
        f: "<b>A*</b> складывает уже пройденную стоимость g и эвристическую оценку h. Если h оптимистична — путь гарантированно кратчайший." },
      { e: "📏", q: "Манхэттенское расстояние — это…", a: ["Сумма шагов по горизонтали и вертикали", "Прямая линия сквозь стены", "Расстояние по окружности"], c: 0,
        f: "|x₁−x₂| + |y₁−y₂| — отличная <b>допустимая эвристика</b> для сетки: никогда не переоценивает реальный путь." },
      { e: "🗺️", q: "Навигатор ровера Curiosity строит маршрут именно поиском по карте. Это…", a: ["Поисковый интеллект без обучения", "Нейросеть с миллиардом весов", "Обычный if-else"], c: 0,
        f: "Ранний ИИ — это <b>поиск в пространстве состояний</b>: планировщики GPS, шахматные движки, роботы-маршрутизаторы." }
    ],
    facts: [
      "A* водит нами навигаторы в машинах и играх (StarCraft) с 1968 года — алгоритму почти 60 лет!",
      "Google Maps ежедневно выполняет миллиарды A*‑подобных запросов."
    ]
  },
  {
    id: "vision", name: "👁️ Патруль зрения", emoji: "👁️",
    desc: "Компьютерное зрение: распознавай объекты по форме и цвету — стреляй по настоящим объектам 💽 и щитом отражай шумы 🐛.",
    topic: "CV · распознавание объектов",
    distance: 700, timeLimit: 90, target: 20, ability: "shield", hazards: ["noise", "decoy"],
    quiz: [
      { e: "🟥", q: "Объект: КРУГ, КРАСНЫЙ, БОЛЬШОЙ. Как его опишет система распознавания?", a: ["Вектором признаков: [форма=круг, цвет=красный, размер=большой]", "Одною буквой", "Запах"], c: 0,
        f: "Любая картинка для сети — это <b>числовой вектор признаков</b>: форма, цвет, границы, текстура…" },
      { e: "🔲", q: "Что делает слой свёртки (convolution) в нейросети?", a: ["Выделяет локальные признаки: грани, углы, текстуры", "Удаляет картинку", "Меняет её размер экрана"], c: 0,
        f: "Свёрточные сети (CNN) скользят фильтром по изображению: первые слои видят <b>грани</b>, глубокие — <b>целые объекты</b>." },
      { e: "🎯", q: "Если сеть выдала «кошка: 0.92, собака: 0.08», что означает 0.92?", a: ["Вероятность класса (softmax-вывод)", "Скорость сети", "Яркость пикселя"], c: 0,
        f: "<b>Softmax</b> превращает сырые числа в вероятности, сумма которых = 1. Класс с максимумом — ответ модели." }
    ],
    facts: [
      "Распознавание лиц в телефоне и фильтр «увеличь глаза» — одна база: CNN, обученная на миллионах фото.",
      "Автономные камеры следят за трафиком, считывая тысячи машин в минуту — тот же принцип «объект найден → класс определён»."
    ]
  },
  {
    id: "rl", name: "⚡ RL-арена", emoji: "⚡",
    desc: "Обучение с подкреплением: собирай награду ⭐ (+10), избегай штрафов 💀 (−5). За 25 секунд научись максиму!",
    topic: "Reinforcement Learning · агент, среда, награда",
    distance: 0, timeLimit: 25, target: 0, ability: "boost", hazards: ["penalty", "noise"], arena: true,
    quiz: [
      { e: "🕹️", q: "Что получает агент в обучении с подкреплением?", a: ["Награду или штраф за действие", "Готовые правильные ответы", "Инструкцию от программиста"], c: 0,
        f: "RL-агент учится <b>методом проб и ошибок</b>:好 действие ⇒ награда ⇒ закрепляем; плохое ⇒ штраф ⇒ избегаем." },
      { e: "⚖️", q: "«Explore vs exploit» — это дилемма…", a: ["Между исследованием нового и использованием известного", "Между скоростью и памятью", "Между train и test"], c: 0,
        f: "Агент обязан балансировать: только пользоваться лучшим ⇒ пропустить ещё лучший вариант (как игрок в казино с несколькими автоматами)." },
      { e: "🏆", q: "AlphaGo Zero победила чемпионов мира именно потому что…", a: ["Самообучалась игрой против себя с нуля", "Ей показали все партии humans", "Её написал лучший программист"], c: 0,
        f: "Без единой человеческой подсказки, millions самоигр ⇒ суперчеловеческая стратегия. Чистый RL!" }
    ],
    facts: [
      "RL учит роботов ходить (DeepMind Atlas), крутить кубик Рубика руками-манипуляторами и управлять дата-центрами Google (−40% энергии на охлаждение).",
      "ChatGPT тоже доращивают через RLHF: Reinforcement Learning from Human Feedback — люди голосуют, модель получает «награду»."
    ]
  }
];

/* ---------------- Хранилище прогресса ---------------- */
const SAVE_KEY = "neurorace3d_v1";
let save = loadSave();
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { stars: {} }; }
  catch (e) { return { stars: {} }; }
}
function storeStars(levelId, n) {
  const cur = save.stars[levelId] || 0;
  if (n > cur) save.stars[levelId] = n;
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

/* ---------------- DOM shortcuts ---------------- */
const $ = (id) => document.getElementById(id);
const screens = { menu: $("menu"), game: $("game"), result: $("result") };
function showScreen(name) {
  for (const k in screens) screens[k].classList.toggle("active", k === name);
}

/* ---------------- Меню ---------------- */
function buildMenu() {
  const list = $("levelList");
  list.innerHTML = "";
  let unlockedUpTo = 0;
  // следующий незакрытый уровень = разблокированный
  while (unlockedUpTo < LEVELS.length - 1 && (save.stars[LEVELS[unlockedUpTo].id] || 0) >= 1) unlockedUpTo++;
  LEVELS.forEach((lv, i) => {
    const b = document.createElement("button");
    b.className = "level-btn";
    const st = save.stars[lv.id] || 0;
    b.disabled = i > unlockedUpTo;
    b.innerHTML = `
      <div class="num">${i > unlockedUpTo ? "🔒" : lv.emoji}</div>
      <div class="info"><div class="t">${i + 1}. ${lv.name}</div><div class="d">${lv.desc}</div></div>
      <div class="stars">${st ? "⭐".repeat(st) : "—"}</div>`;
    b.onclick = () => startLevel(i);
    list.appendChild(b);
  });
}
$("btnQuick").onclick = () => startLevel(0);
$("btnReset").onclick = () => { if (confirm("Сб весь прогресс?")) { save = { stars: {} }; localStorage.removeItem(SAVE_KEY); buildMenu(); } };
$("btnRetry").onclick = () => startLevel(currentLevelIndex);
$("btnMenu").onclick = () => { stopEngine(); buildMenu(); showScreen("menu"); };
$("btnNext").onclick = () => startLevel(Math.min(currentLevelIndex + 1, LEVELS.length - 1));
$("btnPause").onclick = () => togglePause();

/* =========================================================
   THREE.JS ДВИЖОК
   ========================================================= */
let renderer, scene, camera, clock;
let playerMesh, trailPoints = [];
let groundSegments = [], sideObjects = [];
let entities = [];          // активные объекты на трассе
let timers = [];            // отложенные действия в игровом времени
let rafId = null;
let running = false, paused = false;
let currentLevelIndex = 0, level = null;

// состояние игры
const S = {};
function resetState() {
  Object.assign(S, {
    dist: 0, speed: 26, baseSpeed: 26, maxSpeed: 46,
    score: 0, lives: 3, combo: 0, boostCount: 0,
    abilityMax: { scan: 2, shield: 2, boost: 3 }[level && level.ability] || 0,
    abilityUses: 0, abilityCd: 0,
    laneX: 0, steer: 0,
    timeLeft: level ? level.timeLimit : 0,
    spawnTimer: 0, quizPlan: null, quizGate: false,
    scanActive: 0, shieldActive: 0, boostActive: 0,
    scanMarks: [],
    over: false, won: false, shake: 0, wallCool: 0,
    entityZGap: 26, hitsTaken: 0
  });
}

/* --- геометрия дороги и мира --- */
const ROAD_HALF = 6.2;
function makeLaneTex() {
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#1a1f33"; x.fillRect(0, 0, 64, 256);
  x.fillStyle = "#252c48"; x.fillRect(0, 0, 6, 256); x.fillRect(58, 0, 6, 256);
  x.strokeStyle = "rgba(124,92,255,.85)"; x.lineWidth = 3;
  x.setLineDash([26, 22]);
  x.beginPath(); x.moveTo(21.5, 0); x.lineTo(21.5, 256); x.stroke();
  x.beginPath(); x.moveTo(42.5, 0); x.lineTo(42.5, 256); x.stroke();
  x.setLineDash([]); x.strokeStyle = "#ffd166"; x.lineWidth = 4;
  x.beginPath(); x.moveTo(0, 4); x.lineTo(64, 4); x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function buildWorld() {
  clearWorld();
  scene.fog = new THREE.FogExp2(0x0b0f1e, 0.011);
  scene.add(new THREE.HemisphereLight(0x8899ff, 0x0b0f1e, 0.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(8, 20, 10); scene.add(dl);

  // звёзды
  const starGeo = new THREE.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 350; i++) sp.push((Math.random() - .5) * 400, Math.random() * 120 + 20, (Math.random() - .5) * 400);
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbfd0ff, size: 0.7, sizeAttenuation: true })));

  // сегменты дороги (бесконечная лента)
  const tex = makeLaneTex();
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.PlaneGeometry(ROAD_HALF * 2, 60);
    const mat = new THREE.MeshBasicMaterial({ map: tex.clone(), side: THREE.DoubleSide });
    mat.map.repeat.set(1, 6);
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.z = -i * 60 + 30;
    scene.add(m); groundSegments.push(m);
  }
  // стены-неон
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x7c5cff });
  [-1, 1].forEach(sgn => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 400), wallMat);
    w.position.set(sgn * (ROAD_HALF + 0.4), 0.55, -170);
    scene.add(w); sideObjects.push(w);
  });

  // декор по бокам
  const decoColors = [0x00e5ff, 0xff7ad9, 0x3ddc84, 0xffd166];
  for (let i = 0; i < 26; i++) {
    const sgn = i % 2 ? 1 : -1;
    const h = 3 + Math.random() * 9;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, h, 2.4),
      new THREE.MeshLambertMaterial({ color: 0x121730, emissive: 0x05070f })
    );
    box.position.set(sgn * (ROAD_HALF + 4 + Math.random() * 9), h / 2, -i * 24 + 10);
    scene.add(box); sideObjects.push(box);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 2.5),
      new THREE.MeshBasicMaterial({ color: decoColors[i % 4], transparent: true, opacity: .8 }));
    glow.position.set(box.position.x, h + 0.25, box.position.z);
    scene.add(glow); sideObjects.push(glow);
  }

  // машина игрока
  playerMesh = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 3),
    new THREE.MeshPhongMaterial({ color: 0x00e5ff, emissive: 0x003a44, shininess: 80 }));
  body.position.y = 0.55;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.4),
    new THREE.MeshPhongMaterial({ color: 0x7c5cff, emissive: 0x1a1040 }));
  cabin.position.set(0, 1.05, -0.1);
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.7),
    new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  chip.position.set(0, 1.36, -0.1); chip.name = "chip";
  const wGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 12);
  wGeo.rotateZ(Math.PI / 2);
  [[-0.85, -1.05], [0.85, -1.05], [-0.85, 1.05], [0.85, 1.05]].forEach(([x, z]) => {
    const w = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0x111318 }));
    w.position.set(x, 0.36, z); playerMesh.add(w);
  });
  playerMesh.add(body, cabin, chip);
  playerMesh.position.set(0, 0, 0);
  scene.add(playerMesh);

  ensureParticles();
}

function clearWorld() {
  [groundSegments, sideObjects, entities].forEach(arr => {
    arr.forEach(o => { scene.remove(o); disposeObj(o); });
    arr.length = 0;
  });
  PARTICLE_POOL.forEach(P => { P.alive = false; P.mesh.visible = false; });
  timers.forEach(T => T.fn && T.fn());
  timers.length = 0;
  if (S.ring) { S.ring = null; }
  clearScanMarks();
  if (playerMesh) { scene.remove(playerMesh); disposeObj(playerMesh); playerMesh = null; }
  while (scene.children.length) { const o = scene.children[0]; scene.remove(o); disposeObj(o); }
}
function disposeObj(o) {
  o.traverse && o.traverse(ch => {
    if (ch.geometry) ch.geometry.dispose();
    if (ch.material) [].concat(ch.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
  });
}

/* --- фабрика объектов на трассе --- */
function spriteText(text, color = "#ffffff", px = 64) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const x = c.getContext("2d");
  x.font = `${px}px serif`; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, 64, 70);
  const t = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
  s.scale.set(1.8, 1.8, 1);
  return s;
}

function spawnEntity(z, forcedX) {
  const kind = pickKind();
  const lanes = [-4.2, -1.4, 1.4, 4.2];
  const lx = forcedX !== undefined ? forcedX : lanes[(Math.random() * lanes.length) | 0];
  let mesh;
  const E = { kind, x: lx, z, dead: false, spin: 0 };

  if (kind === "data") {                       // 📊 данные — собирать
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.85),
      new THREE.MeshPhongMaterial({ color: 0x3ddc84, emissive: 0x0c3a22 }));
    mesh.position.set(lx, 1.1, z);
    E.points = 1; E.good = true;
  } else if (kind === "star") {                 // ⭐ награда RL
    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8),
      new THREE.MeshPhongMaterial({ color: 0xffd166, emissive: 0x4a3600 }));
    mesh.position.set(lx, 1.1, z);
    E.points = 10; E.good = true;
  } else if (kind === "node") {                 // ✅ узел поиска A*
    mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.95),
      new THREE.MeshPhongMaterial({ color: 0x00e5ff, emissive: 0x003944 }));
    mesh.position.set(lx, 1.1, z);
    E.points = 2; E.good = true;
  } else if (kind === "obj") {                  // 💽 объект CV — стрелять по нему
    const shapes = [new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.SphereGeometry(0.9, 14, 12), new THREE.ConeGeometry(0.95, 1.7, 12)];
    const colors = [0xff5470, 0xffd166, 0x7c5cff];
    const i = (Math.random() * 3) | 0;
    mesh = new THREE.Mesh(shapes[i], new THREE.MeshPhongMaterial({ color: colors[i], emissive: 0x1a0510 }));
    mesh.position.set(lx, 1.15, z);
    E.points = 3; E.good = true; E.label = ["КУБ", "ШАР", "КУПОЛ"][i];
  } else if (kind === "decoy") {                // 🎭 обманка CV
    mesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.28, 10, 18),
      new THREE.MeshPhongMaterial({ color: 0x667, emissive: 0x112 }));
    mesh.position.set(lx, 1.15, z);
    E.good = false; E.harm = "decoy";
  } else if (kind === "noise") {                // 🐛 шум — избегать
    mesh = new THREE.Group();
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8),
      new THREE.MeshPhongMaterial({ color: 0x8892aa, emissive: 0x1a1d28 }));
    core.position.y = 1.1;
    const ic = spriteText("🐛", "#fff", 84); ic.position.y = 2.35; ic.scale.set(1.5, 1.5, 1);
    mesh.add(core, ic); mesh.position.set(lx, 0, z);
    E.good = false; E.harm = "noise";
  } else if (kind === "overfit") {              // 🧠 переобучение
    mesh = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 10),
      new THREE.MeshPhongMaterial({ color: 0xff5470, emissive: 0x4a0f1d }));
    core.position.y = 1.25;
    const ic = spriteText("🧠", "#fff", 84); ic.position.y = 2.7; ic.scale.set(1.7, 1.7, 1);
    mesh.add(core, ic); mesh.position.set(lx, 0, z);
    E.good = false; E.harm = "overfit";
  } else if (kind === "block") {                // ❌ блокировка пути
    mesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 1),
      new THREE.MeshPhongMaterial({ color: 0x3a3f55, emissive: 0x14161f }));
    mesh.position.set(lx, 0.8, z);
    const ic = spriteText("❌", "#fff", 84); ic.position.set(0, 2.1, 0);
    mesh.add(ic);
    E.good = false; E.harm = "block";
  } else {                                      // 💀 штраф RL
    mesh = new THREE.Group();
    const core = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5),
      new THREE.MeshPhongMaterial({ color: 0x22000a, emissive: 0x550011 }));
    core.position.y = 0.2;
    const ic = spriteText("💀", "#fff", 84); ic.position.y = 1.5;
    mesh.add(core, ic); mesh.position.set(lx, 0, z);
    E.good = false; E.harm = "penalty";
  }
  if (!mesh) return null;
  scene.add(mesh);
  E.mesh = mesh;
  entities.push(E);
  return E;
}

/* принудительный спавн «добравого» объекта в конкретной полосе (гарант проходимости) */
function spawnEntityAt(z, x) {
  let kind;
  if (level.arena) kind = "star";
  else if (level.id === "astar") kind = Math.random() < 0.6 ? "node" : "data";
  else if (level.id === "vision") kind = Math.random() < 0.6 ? "obj" : "data";
  else if (level.id === "tree") kind = Math.random() < 0.4 ? "node" : "data";
  else kind = Math.random() < 0.7 ? "data" : "star";
  return spawnEntityAs(kind, z, x);
}

function spawnEntityAs(kind, z, lx) {
  let mesh;
  const E = { kind, x: lx, z, dead: false, spin: 0 };
  if (kind === "data") {
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.85),
      new THREE.MeshPhongMaterial({ color: 0x3ddc84, emissive: 0x0c3a22 }));
    mesh.position.set(lx, 1.1, z); E.points = 1; E.good = true;
  } else if (kind === "star") {
    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8),
      new THREE.MeshPhongMaterial({ color: 0xffd166, emissive: 0x4a3600 }));
    mesh.position.set(lx, 1.1, z); E.points = 10; E.good = true;
  } else if (kind === "node") {
    mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.95),
      new THREE.MeshPhongMaterial({ color: 0x00e5ff, emissive: 0x003944 }));
    mesh.position.set(lx, 1.1, z); E.points = 2; E.good = true;
  } else if (kind === "obj") {
    const shapes = [new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.SphereGeometry(0.9, 14, 12), new THREE.ConeGeometry(0.95, 1.7, 12)];
    const colors = [0xff5470, 0xffd166, 0x7c5cff];
    const i = (Math.random() * 3) | 0;
    mesh = new THREE.Mesh(shapes[i], new THREE.MeshPhongMaterial({ color: colors[i], emissive: 0x1a0510 }));
    mesh.position.set(lx, 1.15, z); E.points = 3; E.good = true;
  } else if (kind === "quizgate") {              // 🎓 чекпоинт вопроса — стоит на трассе заранее
    mesh = new THREE.Group();
    const archL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x7c5cff }));
    archL.position.set(-2.4, 1.7, 0);
    const archR = archL.clone(); archR.position.x = 2.4;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    beam.position.y = 3.6;
    const ic = spriteText("🎓", "#fff", 84); ic.position.y = 4.7; ic.scale.set(2, 2, 1);
    mesh.add(archL, archR, beam, ic);
    mesh.position.set(lx, 0, z);
    E.good = false; E.harm = "quizgate"; E.isGate = true;
  }
  if (!mesh) return null;
  scene.add(mesh);
  E.mesh = mesh;
  entities.push(E);
  return E;
}

function pickKind() {
  const L = level;
  const r = Math.random();
  if (L.arena) return r < 0.55 ? "star" : (r < 0.8 ? "penalty" : "noise");
  if (L.id === "tree") return r < 0.5 ? "data" : (r < 0.75 ? "noise" : (r < 0.9 ? "node" : "overfit"));
  if (L.id === "astar") return r < 0.42 ? "node" : (r < 0.62 ? "data" : "block");
  if (L.id === "vision") return r < 0.4 ? "obj" : (r < 0.62 ? "decoy" : (r < 0.82 ? "data" : "noise"));
  // ml
  return r < 0.5 ? "data" : (r < 0.75 ? "noise" : (r < 0.92 ? "star" : "overfit"));
}

/* =========================================================
   ЦИКЛ
   ========================================================= */
function initEngine() {
  if (renderer) return;
  const canvas = $("c3d");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f1e);
  camera = new THREE.PerspectiveCamera(72, 1, 0.1, 500);
  clock = new THREE.Clock();
  window.addEventListener("resize", onResize);
  onResize();
}
function onResize() {
  if (!renderer) return;
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

let lastT = 0;
function loop() {
  rafId = requestAnimationFrame(loop);
  const now = performance.now();
  let dt = (now - lastT) / 1000; lastT = now;
  if (dt > 0.2) dt = 0.05;            // вкладка была неактивна — маленький шаг
  else if (dt > 0.05) dt = 0.05;      // слабый FPS: замедляем время, не телепортируем
  if (!running || paused) { if (renderer) renderer.render(scene, camera); return; }
  update(dt, now);
  renderer.render(scene, camera);
}

function update(dt, now) {
  const L = level;
  // таймер уровня
  if (L.timeLimit) {
    S.timeLeft -= dt;
    setBar(S.timeLeft / L.timeLimit);
    if (S.timeLeft <= 0) { finish(false); return; }
  }
  // скорость и дистанция (на время вопроса машина стоит — квиз вписан в маршрут)
  const sc = S.quizGate ? 0 : 1;
  if (!S.quizGate) {
    S.speed += dt * (S.boostActive > 0 ? 14 : 3.2);
    if (S.speed > S.maxSpeed) S.speed = S.maxSpeed;
  }
  if (S.boostActive > 0) S.boostActive -= dt;
  updateScan(dt);
  if (S.shieldActive > 0) S.shieldActive -= dt;
  if (S.wallCool > 0) S.wallCool -= dt;
  if (S.abilityCd > 0) {
    S.abilityCd -= dt;
    if (S.abilityCd <= 0) updateHud();   // обновляем счётчик зарядов после отката КД
  }
  const moved = S.speed * dt * sc;
  if (!L.arena) S.dist += moved;

  // руление
  const targetSteer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0) + touchDir;
  S.steer += (targetSteer - S.steer) * Math.min(1, dt * 10);
  S.laneX += S.steer * 13 * dt;
  const lim = ROAD_HALF - 1.1;
  if (S.laneX > lim) { S.laneX = lim; bumpWall(); }
  if (S.laneX < -lim) { S.laneX = -lim; bumpWall(); }
  playerMesh.position.x = S.laneX;
  playerMesh.rotation.y = -S.steer * 0.35;
  playerMesh.rotation.z = S.steer * 0.08;
  const chip = playerMesh.getObjectByName("chip");
  if (chip) chip.rotation.y += dt * 6;

  // камера
  camera.position.set(S.laneX * 0.45, 4.6 + Math.sin(now * 0.001) * 0.05, 8.6);
  if (S.shake > 0) {
    S.shake -= dt * 2.2;
    camera.position.x += (Math.random() - .5) * S.shake * 0.9;
    camera.position.y += (Math.random() - .5) * S.shake * 0.5;
  }
  camera.lookAt(S.laneX * 0.6, 1.2, -18);

  // дорога скроллится
  groundSegments.forEach(m => {
    m.position.z += moved;
    if (m.position.z > 90) m.position.z -= 360;
    if (m.material && m.material.map) m.material.map.offset.y -= moved / 60 * -1; // движение разметки
  });
  sideObjects.forEach(o => {
    o.position.z += moved;
    if (o.position.z > 60) o.position.z -= 400;
  });

  // спавн сущностей (гарант: не перекрываем все полосы harmful-объектами)
  S.spawnTimer -= moved;
  if (S.spawnTimer <= 0) {
    const lanes = [-4.2, -1.4, 1.4, 4.2];
    const first = spawnEntity(-110);
    if (first && !first.good && !first.isGate) {
      // рядом ставим добрый объект в другую полосу — проход всегда возможен
      const alt = lanes.filter(x => x !== first.x);
      spawnEntityAt(-110, alt[(Math.random() * alt.length) | 0]);
    }
    if (Math.random() < 0.5) spawnEntity(-110 - 18 - Math.random() * 20);
    S.spawnTimer = L.arena ? 9 : 13;
  }

  // квиз «вписан» в маршрут: за 60 м до вопроса — предупреждение,
  // затем на дороге появляется чекпоинт-арка 🎓, которую видно заранее
  if (!L.arena && S.quizPlan) {
    for (const slot of S.quizPlan) {
      if (slot.asked) continue;
      const ahead = slot.d - S.dist;
      if (!slot.warned && ahead <= 60) {
        slot.warned = true;
        popMsg("🎓 ВПЕРЕДИ ЧЕКПОИНТ ЗНАНИЙ", "#7c5cff");
      }
      if (!slot.spawned && ahead <= 105) {
        slot.spawned = true;
        const G = spawnEntityAs("quizgate", -(slot.d - S.dist), 0);
        if (G) { G.slot = slot; slot.asked = true; }   // вопрос гарантированно будет задан один раз
      }
    }
  }

  // обновление сущностей
  for (const E of entities) {
    E.z += moved;
    E.spin += dt * 3;
    E.mesh.position.z = E.z;
    if (E.kind !== "penalty") E.mesh.rotation.y = E.spin;
    if (E.kind === "data" || E.kind === "star" || E.kind === "node") E.mesh.position.y = 1.1 + Math.sin(now * 0.004 + E.x) * 0.25;
    // столкновение с игроком (z около 0..2, x близко)
    if (!E.dead && E.z > -1.6 && E.z < 2.4 && Math.abs(E.x - S.laneX) < 1.7) {
      collide(E);
    }
    if (E.z > 14) { E.dead = true; }
  }
  // чистка
  for (let i = entities.length - 1; i >= 0; i--) {
    if (entities[i].dead) { scene.remove(entities[i].mesh); disposeObj(entities[i].mesh); entities.splice(i, 1); }
  }

  // таймеры и частицы
  updateParticles(dt);
  for (let i = timers.length - 1; i >= 0; i--) {
    timers[i].t -= dt;
    if (timers[i].t <= 0) { timers[i].fn(); timers.splice(i, 1); }
  }
  if (S.ring) {
    S.ring.position.x = playerMesh.position.x;
    S.ring.position.z = playerMesh.position.z;
    S.ring.rotation.z += dt * 4;
    if (S.shieldActive <= 0) { scene.remove(S.ring); disposeObj(S.ring); S.ring = null; }
  }

  // условия победы
  if (L.arena) { /* в арене конец по таймеру: стартанули => прошли раунд */ }
  else if (S.dist >= L.distance) { finish(true); return; }

  updateHud();
}

function bumpWall() {
  if (S.shieldActive > 0) return;
  if (S.wallCool > 0) return;
  S.wallCool = 1.2;
  S.combo = 0; S.hitsTaken++;
  S.score = Math.max(0, S.score - 1);
  popMsg("СТЕНА! −1 🧱", "#ffd166");
  S.shake = 0.5;
  if (navigator.vibrate) navigator.vibrate(40);
}

/* ---------- столкновения ---------- */
function collide(E) {
  if (E.isGate) {                        // чекпоинт вопроса: остановка → квиз → проезд
    E.dead = true;                       // арка исчезает, вопрос уже задан
    const qi = S.quizPlan.indexOf(E.slot);
    openQuiz(qi >= 0 ? qi : 0);
    return;
  }
  if (E.good) {
    E.dead = true;
    S.combo++;
    if (S.combo > (S.bestCombo || 0)) S.bestCombo = S.combo;
    const pts = E.points * (1 + Math.floor(S.combo / 5));
    S.score += pts;
    popMsg(`+${pts}${E.kind === "star" ? " ⭐" : ""}`, "#3ddc84");
    burst(E.mesh.position.clone(), E.kind === "star" ? 0xffd166 : 0x3ddc84);
    if (navigator.vibrate) navigator.vibrate(18);
  } else {
    E.dead = true;
    if (S.shieldActive > 0) { popMsg("ЩИТ ПОГЛОТИЛ 🛡️", "#00e5ff"); return; }
    S.combo = 0;
    if (E.harm === "penalty") { S.score = Math.max(0, S.score - 5); popMsg("−5 ШТРАФ 💀", "#ff5470"); }
    else if (E.harm === "noise") { S.score = Math.max(0, S.score - 2); popMsg("−2 ШУМ 🐛", "#ff5470"); }
    else if (E.harm === "overfit") { S.lives--; S.hitsTaken++; popMsg("ПЕРЕОБУЧЕНИЕ! −❤️", "#ff5470"); }
    else if (E.harm === "block") { S.speed = Math.max(14, S.speed - 10); S.hitsTaken++; popMsg("ПУТЬ ЗАБЛОКИРОВАН ❌", "#ffd166"); }
    else if (E.harm === "decoy") { S.score = Math.max(0, S.score - 3); popMsg("ОБМАНКА В МОДЕЛЬ! −3 🎭", "#ff5470"); }
    burst(E.mesh.position.clone(), 0xff5470);
    S.shake = 1;
    if (navigator.vibrate) navigator.vibrate(60);
    if (S.lives <= 0) { finish(false); return; }
  }
}

/* ---------- частицы (пул, внутриигровое время) ---------- */
const PARTICLE_POOL = [];   // {mesh, alive, v, t}
function ensureParticles() {
  while (PARTICLE_POOL.length < 120) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    m.visible = false;
    scene.add(m);
    PARTICLE_POOL.push({ mesh: m, alive: false, v: null, t: 0 });
  }
}
function burst(pos, color) {
  let n = 10;
  for (const P of PARTICLE_POOL) {
    if (n <= 0) break;
    if (!P.alive) {
      P.alive = true; P.t = 0.55;
      P.mesh.position.copy(pos);
      P.mesh.material.color = color;
      P.v = { x: (Math.random() - .5) * 8, y: Math.random() * 8, z: (Math.random() - .5) * 8 };
      P.mesh.visible = true;
      n--;
    }
  }
}
function updateParticles(dt) {
  for (const P of PARTICLE_POOL) {
    if (!P.alive) continue;
    P.t -= dt;
    if (P.t <= 0) { P.alive = false; P.mesh.visible = false; continue; }
    P.mesh.position.x += P.v.x * dt;
    P.mesh.position.y += P.v.y * dt;
    P.mesh.position.z += P.v.z * dt;
    P.v.y -= 22 * dt;
  }
}

/* ---------- HUD ---------- */
function updateHud() {
  $("hudScore").textContent = S.score;
  $("hudTarget").textContent = level.arena ? "∞" : level.target;
  $("hudLives").textContent = "❤️".repeat(Math.max(0, S.lives)) || "0";
  if (level.ability) {
    const left = Math.max(0, S.abilityMax - S.abilityUses);
    let extra = "";
    if (S.scanActive > 0) extra = ` ⏳${Math.ceil(S.scanActive)}с`;
    else if (S.shieldActive > 0) extra = " 🛡️";
    else if (S.abilityCd > 0) extra = " ⏳";
    $("hudBoost").textContent = `${ABILITY_INFO[level.ability].icon}${"🔋".repeat(left) || "✖"}${extra}`;
  } else {
    $("hudBoost").textContent = "×" + S.combo;
  }
  $("hudDist").textContent = level.arena ? `⏱ ${Math.ceil(S.timeLeft)}с` : `${Math.floor(S.dist)}/${level.distance} м`;
}
function setBar(frac) {
  $("hudTimerWrap").classList.toggle("hidden", !level.timeLimit);
  $("hudTimerBar").style.width = Math.max(0, frac * 100) + "%";
}
let msgTO = null;
function popMsg(t, color) {
  const el = $("msgCenter");
  el.textContent = t; el.style.color = color || "#ffd166";
  el.classList.add("show");
  clearTimeout(msgTO);
  msgTO = setTimeout(() => el.classList.remove("show"), 900);
}

/* ---------- суперсилы (ограниченными зарядами) ---------- */
const ABILITY_INFO = {
  scan:   { icon: "📡", name: "СКАНЕР ДАННЫХ", cd: 5 },
  shield: { icon: "🛡️", name: "ЩИТ",            cd: 6 },
  boost:  { icon: "⏱️", name: "ЭПОХА ОБУЧЕНИЯ", cd: 4 }
};
function useAbility() {
  if (!running || paused || S.over || S.quizGate) return;
  const a = level.ability;
  if (!a) return;
  const info = ABILITY_INFO[a];
  // Ограничения: заряды + перезарядка
  if (S.abilityCd > 0) { popMsg(`⏳ ПЕРЕЗАРЯДКА ${S.abilityCd.toFixed(1)}с`, "#9aa3c0"); return; }
  if (S.abilityUses >= S.abilityMax) {
    popMsg("🔋 ЗАРЯДЫ ИСЧЕРПАНЫ", "#ff5370");
    showAbility(`${info.icon} ${info.name}: заряды кончились!`);
    return;
  }
  S.abilityUses++;
  S.abilityCd = info.cd;
  updateHud();
  if (a === "scan") {
    S.scanActive = 8;
    showAbility(`📡 СКАНЕР ДАННЫХ АКТИВЕН (${chargesText()})`);
    popMsg("📡 Сканирую трассу впереди…", "#00e5ff");
    refreshScanMarks();
  } else if (a === "shield") {
    S.shieldActive = 5;
    showAbility(`🛡️ СВЁРТОЧНЫЙ ЩИТ (${chargesText()})`);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.09, 8, 30),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 }));
    ring.position.copy(playerMesh.position); ring.position.y = 1;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    S.ring = ring;
  } else if (a === "boost") {
    S.boostActive = 3; S.speed = Math.min(S.maxSpeed, S.speed + 12);
    S.boostCount++;
    showAbility(`⏱ ЭПОХА ОБУЧЕНИЯ ×${S.boostCount} (${chargesText()})`);
  }
}
function chargesText() {
  return `${S.abilityMax - S.abilityUses}/${S.abilityMax} 🔋`;
}
function showAbility(t) {
  const el = $("abilityName");
  el.textContent = t; el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 1200);
}
/* ---------- СКАНЕР ДАННЫХ: радар сквозь стены ---------- */
const SCAN_KIND = {
  data:   { icon: "💾", color: "#3ddc84", label: E => `+${E.points}` },
  star:   { icon: "🔋", color: "#ffd166", label: E => `×${E.points}` },
  node:   { icon: "✅", color: "#00e5ff", label: () => "+2" },
  obj:    { icon: "💽", color: "#7c5cff", label: () => "+3" },
  noise:  { icon: "☣", color: "#ff5470", label: () => "Шум!" },
  overfit:{ icon: "🧠", color: "#ff5470", label: () => "Опасно!" },
  block:  { icon: "⚠️", color: "#ffd166", label: () => "Блок" },
  decoy:  { icon: "🎭", color: "#ff5470", label: () => "Обманка" },
  penalty:{ icon: "💀", color: "#ff5470", label: () => "Штраф" }
};
function clearScanMarks() {
  if (!S.scanMarks) return;
  S.scanMarks.forEach(m => { scene.remove(m.sprite); disposeObj(m.sprite); });
  S.scanMarks.length = 0;
}
function refreshScanMarks() {
  clearScanMarks();
  const px = playerMesh ? playerMesh.position.x : 0;
  entities.forEach(E => {
    if (E.dead || E.isGate) return;
    const ahead = -E.mesh.position.z - 9;      // расстояние впереди машины
    if (ahead < 15 || ahead > 260) return;
    const info = SCAN_KIND[E.kind]; if (!info) return;
    const dangerOnLane = !E.good && Math.abs(E.x - px) < 2.0;
    if (!E.good && !dangerOnLane) return;      // показываем все бонусы, но только опасности на нашей полосе
    const s = spriteText(`${info.icon} ${info.label(E)}`, info.color, 60);
    s.scale.set(3.2, 3.2, 1);
    s.material.depthTest = false;              // видно «сквозь» объекты и туман
    s.renderOrder = 999;
    s.position.set(E.x, 3.1, E.mesh.position.z + 0.5);
    scene.add(s);
    S.scanMarks.push({ sprite: s, E });
  });
}
function updateScan(dt) {
  if (S.scanActive > 0) {
    S.scanActive -= dt;
    if (S.scanActive <= 0) { clearScanMarks(); updateHud(); }
    else for (const m of S.scanMarks) {        // метки «дышат» и живут вместе с объектами
      if (m.E.dead) { m.sprite.visible = false; continue; }
      m.sprite.position.z = m.E.mesh.position.z + 0.5;
      m.sprite.position.y = 3.1 + Math.sin(performance.now() * 0.005 + m.E.x) * 0.15;
    }
  }
}

/* маркер финиша/пути (уровень A*) */
function markPath(on) {
  if (on && level.id === "astar") {
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: .8 }));
      m.rotation.x = -Math.PI / 2;
      m.position.set((Math.random() - .5) * 8, 0.05, -40 - i * 22);
      scene.add(m);
      timers.push({ t: 4, fn: () => { scene.remove(m); disposeObj(m); } });
    }
  }
}

/* ---------- квиз ---------- */
let quizLock = false;

/* Перемешиваем варианты: правильный больше НЕ всегда первый */
function shuffledOptions(q) {
  const opts = q.a.map((txt, idx) => ({ txt, ok: idx === q.c }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

/* План квиза: вопросы «вписаны» в маршрут — между сбором датасетов,
   с разведкой впереди (чтобы игрок видел приближение вопроса) */
function buildQuizPlan(L) {
  const n = L.quiz.length;
  const plan = [];
  for (let i = 0; i < n; i++) {
    // слот на 2-й трети маршрута между обязательными чекпоинтами
    const base = (i + 1) * (L.distance / (n + 1));
    const jitter = (Math.random() - 0.5) * 2 * (L.distance / (n + 1)) * 0.3;
    let d = Math.round(base + jitter);
    if (plan.length && d < plan[plan.length - 1].d + 60) d = plan[plan.length - 1].d + 60;
    d = Math.max(70, Math.min(d, L.distance - 80));
    plan.push({ d, asked: false, warned: false });
  }
  return plan;
}

function openQuiz(i) {
  const q = level.quiz[i];
  if (!window.SIM) paused = true;
  S.quizGate = true;          // машина останавливается перед вопросом
  quizLock = true;
  $("quizEmoji").textContent = q.e;
  $("quizText").textContent = q.q;
  const ans = $("quizAnswers"); ans.innerHTML = "";
  shuffledOptions(q).forEach((opt) => {
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = opt.txt;
    b.onclick = () => {
      if (opt.ok) {
        b.classList.add("right");
        showFact(q.f);
        S.score += 5;
        popMsg("+5 ЗА ЗНАНИЕ 🎓", "#3ddc84");
      } else {
        b.classList.add("wrong");
        [...ans.children].find(x => x._ok)?.classList.add("right");
        showFact("Ответ был: «" + q.a[q.c] + "». " + q.f);
      }
      [...ans.children].forEach(x => x.disabled = true);
      const closeQuiz = () => { hideQuiz(); paused = false; quizLock = false; S.quizGate = false; };
      if (window.SIM) closeQuiz();
      else setTimeout(closeQuiz, 2600);
    };
    b._ok = opt.ok;
    ans.appendChild(b);
  });
  $("quizModal").classList.remove("hidden");
}
function hideQuiz() { $("quizModal").classList.add("hidden"); $("factBox").classList.add("hidden"); }
function showFact(html) {
  const fb = $("factBox");
  fb.innerHTML = "💡 " + html;
  fb.classList.remove("hidden");
}

/* ---------- управление ---------- */
const keys = { left: false, right: false };
window.addEventListener("keydown", e => {
  if (!$("codexModal").classList.contains("hidden")) {   // книга открыта: Esc/K закрывают её
    if (e.code === "Escape" || e.code === "KeyK") closeCodex();
    return;
  }
  if (["ArrowLeft", "KeyA"].includes(e.code)) keys.left = true;
  if (["ArrowRight", "KeyD"].includes(e.code)) keys.right = true;
  if (e.code === "Space") { e.preventDefault(); useAbility(); }
  if (e.code === "KeyK") openCodex();
  if (e.code === "KeyP" || e.code === "Escape") togglePause();
});
window.addEventListener("keyup", e => {
  if (["ArrowLeft", "KeyA"].includes(e.code)) keys.left = false;
  if (["ArrowRight", "KeyD"].includes(e.code)) keys.right = false;
});
let touchDir = 0;
window.addEventListener("touchstart", handleTouch, { passive: true });
window.addEventListener("touchmove", handleTouch, { passive: true });
window.addEventListener("touchend", () => { touchDir = 0; });
function handleTouch(e) {
  if (!screens.game.classList.contains("active")) return;
  const t = e.touches[0];
  touchDir = t.clientX < innerWidth / 2 ? -1 : 1;
}
$("c3d").addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse") useAbility();
});

function togglePause(forceOff) {
  if (!running || S.over) return;
  if (quizLock) return;                 // во время вопроса пауза недоступна
  paused = forceOff ? false : !paused;
  $("btnPause").textContent = paused ? "▶ Пауза" : "⏸ Пауза";
  $("pauseModal").classList.toggle("hidden", !paused);
  if (paused && level.ability) {
    popMsg(`${ABILITY_INFO[level.ability].icon} ПРОБЕЛ — ${ABILITY_INFO[level.ability].name}, зарядов: ${Math.max(0, S.abilityMax - S.abilityUses)}`, "#9aa3c0");
  } else if (paused) {
    popMsg("ПАУЗА", "#9aa3c0");
  }
}
$("btnResume").onclick = () => togglePause(true);
$("btnRestart").onclick = () => { $("pauseModal").classList.add("hidden"); startLevel(currentLevelIndex); };
$("btnQuit").onclick = () => { $("pauseModal").classList.add("hidden"); stopEngine(); buildMenu(); showScreen("menu"); };

/* =========================================================
   КОДЕКС АГЕНТА — книжка-бестиарий в углу экрана
   ========================================================= */
const CODEX = [
  { h: "⚡ СПОСОБНОСТИ (Пробел или клик)", items: [
    { t: "📡 Сканер данных", d: "Радар на 8 секунд: показывает сквозь стены и туман все 💾 данные, ⭐ награды, ✅ узлы A* и 💽 объекты впереди (до 260 м), а красными метками — опасности прямо на твоей полосе. Так модель компьютерного зрения «видит» объекты раньше, чем ты их замечаешь.", tip: "Копи заряды на плотные участки: скан покажет, где лежит больше всего данных." },
    { t: "🛡️ Сверточный щит", d: "5 секунд неуязвимости: шум 🐛, переобучение 🧠, обманки 🎭 и стены поглощаются без последствий. Аналог свёрточного слоя нейросети, который фильтрует полезное и отсекает помехи.", tip: "Ставь щит перед участком, где сканер показал красную метку на твоей полосе." },
    { t: "⏱️ Эпоха обучения", d: "Рывок скорости на 3 секунды — проезжаешь больше трассы за то же время. «Эпоха» в машинном обучении — один полный проход по всем данным: больше эпох — быстрее обучение.", tip: "Активируй, когда впереди длинная цепочка бонусов, а время на таймере тает." }
  ]},
  { h: "☠️ ОПАСНОСТИ", items: [
    { t: "🐛 Шум данных (−2 очка)", d: "Мусор в датасете: ошибочные или нерелевантные примеры. Модель, наученная на шуме, принимает худшие решения.", tip: "Легко объехать по соседней полосе." },
    { t: "🧠 Переобучение (−1 жизнь)", d: "Модель выучила тренировочные данные наизусть и ошибается на новых. Самый дорогой враг в игре.", tip: "Не тарань; если уворачиваться поздно — спасёт щит, а сканер предупредит заранее." },
    { t: "❌ Блокировка пути (тормоз −10)", d: "Тупик в графе поиска: алгоритму A* приходится перепланировать маршрут. В игре — резкая потеря скорости.", tip: "Сканирование видно блокировки издалека — смени полосу заранее." },
    { t: "🎭 Обманка (−3 очка)", d: "Фальшивый объект для модели компьютерного зрения: выглядит похоже, но классифицируется неверно.", tip: "На уровне «зрение» стреляй только по кубам, шарам и куполам с подписями." },
    { t: "💀 Штраф среды (−5 очков)", d: "Отрицательная награда в обучении с подкреплением: агент запоминает, что в яму лучше не попадать.", tip: "В арене запомни расположение ям — RL-агент так и делает." }
  ]},
  { h: "🎁 БОНУСЫ", items: [
    { t: "💾 Данные (+1…+N)", d: "Топливо машинного обучения: без данных нет обучения. Каждые 5 подряд собранных — комбо-множитель ×2, ×3…", tip: "Собирай цепочками в одной полосе — комбо решает всё." },
    { t: "⭐ Награда (+10)", d: "Положительная награда из обучения с подкреплением: сигнал «делай так чаще».", tip: "Ради одной звезды не тарань переобучение — игра стоит свеч только без потерь." },
    { t: "✅ Узел A* (+2)", d: "Шаг оптимального пути: алгоритм расширяет узлы графа от старта к цели.", tip: "Цепочки узлов обычно ведут через чистые полосы." },
    { t: "💽 Объект CV (+3)", d: "Распознанный класс: куб, шар или купол. Модель компютера зрения предсказывает метку объекта.", tip: "Читай подпись над объектом до столкновения." },
    { t: "🎓 Чекпоинт знаний", d: "Арка на трассе: машина останавливается, открывается вопрос по теме уровня. Правильный ответ даёт +5 очков и буст, ошибка — штраф.", tip: "Перед аркой появляется предупреждение — успей собрать комбо." }
  ]},
  { h: "🧠 МУДРОСТЬ ИИ", items: [
    { t: "Обучение ≠ программирование", d: "Классическая программа — правила от человека. ML — правила, которые модель выводит из данных сама.", tip: "Каждый уровень игры — про один из этих принципов." },
    { t: "A* — умный поиск", d: "Эвристика (приблизительная оценка расстояния) направляет поиск к цели вместо слепого перебора всех вариантов.", tip: "Как в level 3: жёлтые точки подсказывают верное направление." },
    { t: "Больше — не значит умнее", d: "ChatGPT содержит 175 млрд параметров, AlphaStar обыграл профессионалов в StarCraft II — но обе модели обучались на огромных датасетах месяцами.", tip: "Хочешь продолжить тему? Загляни в 2D-версию «НейроКвест» в корне сайта." }
  ]}
];

function openCodex() {
  if (!running || paused || quizLock) return;
  const body = $("codexBody");
  body.innerHTML = CODEX.map(sec =>
    `<div class="codex-h3">${sec.h}</div>` + sec.items.map(it =>
      `<div class="codex-entry${sec.h.includes("МУДРОСТЬ") ? " codex-fact" : ""}"><b>${it.t}</b><p>${it.d}</p><p class="codex-tip">💡 ${it.tip}</p></div>`
    ).join("")
  ).join("");
  togglePause(true);            // гарантируем паузу перед книгой
  $("pauseModal").classList.add("hidden");   // окно паузы не нужно поверх кодекса
  $("codexModal").classList.remove("hidden");
}
function closeCodex() {
  $("codexModal").classList.add("hidden");
  paused = false;               // книга закрыта — гонка продолжается
  $("btnPause").textContent = "⏸ Пауза";
}
$("btnCodex").onclick = openCodex;
$("btnCodexClose").onclick = closeCodex;
function startLevel(i) {
  currentLevelIndex = i;
  level = LEVELS[i];
  initEngine();
  resetState();
  if (!level.arena) S.quizPlan = buildQuizPlan(level);   // вопросы вписаны в маршрут
  buildWorld();
  $("hudTopic").textContent = level.topic;
  $("btnPause").textContent = "⏸ Пауза";
  $("pauseModal").classList.add("hidden");
  hideQuiz();
  showScreen("game");
  running = true; paused = false;
  if (level.arena) S.won = true;   // раунд считается пройденным: цель — максимизировать награду
  updateHud(); setBar(1);
  popMsg(getStartHint(), "#00e5ff");
  lastT = performance.now();
  if (!rafId) loop();
}
function getStartHint() {
  if (level.ability === "scan") return "ПРОБЕЛ/КЛИК = СКАН A* 🔍 · 2 заряда 🔋";
  if (level.ability === "shield") return "ПРОБЕЛ/КЛИК = СВЁРТОЧНЫЙ ЩИТ 🛡️ · 2 заряда 🔋";
  if (level.ability === "boost") return "ПРОБЕЛ/КЛИК = ЭПОХА ОБУЧЕНИЯ ⏱️ · 3 заряда 🔋";
  return "ПОЕХАЛИ! 🏁";
}
function stopEngine() {
  running = false; paused = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

function finish(won) {
  if (S.over) return;
  S.over = true; running = false;
  S.won = won || S.won;
  const stars = calcStars(S.won);
  storeStars(level.id, stars);
  // экран итога
  $("resTitle").textContent = won ? "🏁 УРОВЕНЬ ПРОЙДЕН!" : "💥 ИГРА ОКОНЧЕНА";
  $("resStars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  const stats = [
    { v: S.score, k: level.arena ? "очков награды" : "собрано данных" },
    { v: level.arena ? "⏱" : Math.floor(S.dist) + " м", k: "дистанция" },
    { v: "×" + (S.bestCombo || S.combo || 1), k: "макс комбо" },
    { v: stars ? "⭐".repeat(stars) : "—", k: "звёзды" }
  ];
  $("resStats").innerHTML = stats.map(s => `<div class="res-stat"><div class="v">${s.v}</div><div class="k">${s.k}</div></div>`).join("");
  $("resFact").innerHTML = "💡 " + level.facts[Math.floor(Math.random() * level.facts.length)];
  const hasNext = won && currentLevelIndex < LEVELS.length - 1;
  $("btnNext").classList.toggle("hidden", !hasNext);
  showScreen("result");
}

function calcStars(won) {
  if (!won) return 0;
  if (level.arena) {
    return S.score >= 60 ? 3 : S.score >= 35 ? 2 : 1;
  }
  const perfect = S.lives === 3 && S.hitsTaken === 0;
  if (perfect) return 3;
  if (S.lives >= 2) return 2;
  return 1;
}

/* -------- старт -------- */
buildMenu();
showScreen("menu");
