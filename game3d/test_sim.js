/* Смоук-тест НейроГонки 3D: мок DOM + mock three.js, прогон уровня ML */
"use strict";
const fs = require("fs");
const path = require("path");

// ---- мок DOM ----
function makeEl() {
  const el = {
    _cls: new Set(["hidden"]), textContent: "", innerHTML: "", disabled: false, style: {}, children: [],
    appendChild(ch) { this.children.push(ch); return ch; },
    addEventListener() {}, onclick: null,
  };
  el.classList = {
    add: (c) => el._cls.add(c), remove: (c) => el._cls.delete(c),
    toggle: (c, f) => { f ? el._cls.add(c) : el._cls.delete(c); },
    contains: (c) => el._cls.has(c),
  };
  return el;
}
const els = {};
global.document = {
  getElementById(id) { return els[id] || (els[id] = makeEl()); },
  createElement(tag) { const e = makeEl(); if (tag === "canvas") e.getContext = () => ({ fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fillText(){}, setLineDash(){}, }); return e; },
};
global.window = global;
global.addEventListener = () => {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.innerWidth = 800; global.innerHeight = 600; global.devicePixelRatio = 1;
let rafCb = null;
global.requestAnimationFrame = (cb) => { if (!rafCb) rafCb = cb; return 1; };   // не затираем «первый» колбэк: loop() переподписывается сам
global.cancelAnimationFrame = () => { rafCb = null; };
global.confirm = () => false;
global.navigator = {};
global.SIM = true;

// ---- мок THREE ----
class V3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;} set(x,y,z){if(typeof x==="number"){this.x=x;this.y=y;this.z=z}else{this.x=x.x;this.y=x.y;this.z=x.z}return this;} setScalar(s){this.x=this.y=this.z=s;return this;} clone(){return new V3(this.x,this.y,this.z);} }
function mkMesh(extra={}) {
  const m = { position: new V3(), rotation: new V3(), scale: new V3(1,1,1), visible: true, children: [],
    material: { color: { set(){}, getHex(){return 0} }, map: null, dispose(){}, clone(){ return this; } },   // заглушки THREE для burst()/disposeObj()
    add(...c){ c.forEach(x=>this.children.push(x)); }, clone(){ return mkMesh(extra); },
    getObjectByName(n){ return this.children.find(c=>c.name===n) || null; },
    traverse(f){ f(this); this.children.forEach(ch=>ch.traverse&&ch.traverse(f)); } };
  Object.assign(m, extra); return m;
}
global.THREE = {
  Scene: class { constructor(){ this.children=[]; } add(o){this.children.push(o);} remove(o){const i=this.children.indexOf(o); if(i>=0)this.children.splice(i,1);} },
  WebGLRenderer: class { constructor(){ this.setSize=()=>{}; this.setPixelRatio=()=>{}; this.render=()=>{}; } },
  PerspectiveCamera: class { constructor(){ this.position=new V3(); this.lookAt=()=>{}; this.updateProjectionMatrix=()=>{}; } },
  Clock: class { },
  Color: class { constructor(c){this.c=c;} },
  FogExp2: class { constructor(c,d){} },
  HemisphereLight: class { constructor(){ this.position=new V3(); } },
  DirectionalLight: class { constructor(){ this.position=new V3(); } },
  BufferGeometry: class { constructor(){ this.setAttribute=()=>{}; } },
  Float32BufferAttribute: class { constructor(a,b){} },
  Points: class { constructor(g,m){ this.position=new V3(); } },
  PointsMaterial: class { constructor(o){ Object.assign(this,o); } },
  PlaneGeometry: class { constructor(w,h){} },
  BoxGeometry: class { constructor(){ this.rotateZ=()=>{}; } },
  CylinderGeometry: class { constructor(){ this.rotateZ=()=>{}; } },
  OctahedronGeometry: class {}, IcosahedronGeometry: class {}, TetrahedronGeometry: class {},
  SphereGeometry: class {}, DodecahedronGeometry: class {}, ConeGeometry: class {},
  TorusGeometry: class {}, RingGeometry: class {}, CircleGeometry: class {},
  MeshBasicMaterial: class { constructor(o){ Object.assign(this,o||{}); if(!this.map) this.map=null; if(!this.color) this.color={set(){},getHex(){return 0}}; } clone(){ return new THREE.MeshBasicMaterial({map:this.map}); } },
  MeshLambertMaterial: class { constructor(o){ Object.assign(this,o); } },
  MeshPhongMaterial: class { constructor(o){ Object.assign(this,o); } },
  SpriteMaterial: class { constructor(o){ Object.assign(this,o); } },
  Sprite: class { constructor(m){ this.position=new V3(); this.scale=new V3(1,1,1); this.material=m; } },
  Mesh: class extends Function { constructor(g,m){ super(); return mkMesh({ geometry:g, material:m }); } },
  Group: class { constructor(){ return mkMesh(); } },
  CanvasTexture: class { constructor(c){ this.repeat={set(){}}; this.offset={y:0}; this.dispose=()=>{}; this.clone=()=>({repeat:{set(){}},offset:{y:0},dispose(){}}); } },
  RepeatWrapping: 1, DoubleSide: 2,
};
// Group/Sprite/Mesh — классы выше упрощённо; приводим все к фабрике объектов:
global.THREE.Group = function(){ return mkMesh(); };
global.THREE.Mesh = function(){ return mkMesh(); };
global.THREE.Sprite = function(){ return mkMesh(); };

// ---- загрузка игры ----
let code = fs.readFileSync(path.join(__dirname, "app3d.js"), "utf8");
code = code.replace(/^"use strict";/m, "")                       // let/const в eval → глобальные для теста
// let/const в indirect eval не попадают в globalThis — переносим их в var для скоупа теста
code = code.replace(/^(?:let|const)\s+((?:S|entities|running|paused|level|currentLevelIndex|lastT|rafId)(?= =))/gm, "globalThis.$1");
code = code.replace(/\b(?:let|const)\s+(LEVELS|buildQuizPlan|shuffledOptions|quizLock)\b/g, "var $1");
code = code.replace(/\b(?:let|const)\s+(codexOpen|codexPausedByBook)\b/g, "globalThis.$1 = false; var $1");
code = code.replace(/^(buildMenu\(\);\nshowScreen\("menu"\);)/m, "/*test: no auto-start*/");
(0,eval)(code);

// цикл как в браузере: loop() сам проверяет running/paused — используем его для проверки остановок
let _ms = 100000;
global.performance = { now: () => _ms };   // управляемое время: кадры по +20 мс
function loopCall(ms) { _ms += (ms || 20); lastT = _ms - (ms || 20); const c = rafCb; rafCb = null; if (c) c(); }   // один кадр цикла

// ---- проверка 1: перемешивание ответов ----
{
  let firstCorrectCount = 0, trials = 200;
  const q = LEVELS[0].quiz[0]; // правильный — индекс 0 в данных
  for (let t = 0; t < trials; t++) {
    const opts = shuffledOptions(q);
    if (opts[0].ok) firstCorrectCount++;
  }
  console.log(`[1] Правильный ответ первым: ${firstCorrectCount}/${trials} (ожидаем ~${trials/3})`);
  if (firstCorrectCount > trials * 0.5) throw new Error("Ответы не перемешиваются!");
}

// ---- проверка 2: план квиза вписан в маршрут, с разнесением ----
{
  const plan = buildQuizPlan(LEVELS[0]);
  console.log("[2] План квиза (дистанции):", plan.map(p => p.d).join(", "), "| дистанция уровня:", LEVELS[0].distance);
  if (plan.length !== 3) throw new Error("Неверное число слотов");
  for (const p of plan) if (p.d <= 70 || p.d >= LEVELS[0].distance - 79) throw new Error("Чекпоинт вне маршрута");
  for (let i = 1; i < plan.length; i++) if (plan[i].d - plan[i-1].d < 59) throw new Error("Чекпоинты слишком близко");
}

// ---- проверка 3: полный прогон уровня ML (как игрок) ----
{
  startLevel(0);
  // level уже установлен startLevel(0)
  S.dist = 0; S.speed = 26; S.lives = 99;   // неуязвимый бот: цель теста — все 3 квиза, а не симуляция крашей
  let quizOpened = 0, gateSeen = 0, warned = 0;
  // eval-скоуп: перехват функций невозможен — считаем по факту показа модалки квиза
  let lastModalShown = false;
  let frames = 0;
  while (!S.over && S.dist < LEVELS[0].distance && frames < 20000) {   // не считаем краш-рестарты
    running = true; paused = false;
    // рулим к ближайшему доброму объекту или держим центр
    update(0.05, performance.now());
    frames++;
    const modalShown = !els["quizModal"]._cls.has("hidden");
    if (modalShown && !lastModalShown) {
      quizOpened++;
      // отвечаем: кликаем по кнопке с _ok
      const btn = els["quizAnswers"].children.find(b => b._ok);
      if (!btn) throw new Error("Кнопка правильного ответа не найдена (перемешивание сломано?)");
      btn.onclick();
      // SIM-режим закрывает сразу
    }
    lastModalShown = modalShown;
    gateSeen += entities.filter(e => e.isGate).length > 0 ? 1 : 0;
  }
  console.log(`[3] Фреймов: ${frames}, финал: won=${S.won}, over=${S.over}, dist=${Math.floor(S.dist)}, квизов открыто: ${quizOpened}, арка на трассе видна была: ${gateSeen > 0}`);
  if (quizOpened !== 3) throw new Error(`Ожидали 3 квиза, получили ${quizOpened}`);
  if (!gateSeen) throw new Error("Арки-чекпоинты не появлялись на трассе!");
  if (!S.over) throw new Error("Уровень не завершился");
}

// ---- проверка 4: во время вопроса машина стоит ----
{
  startLevel(0);
  S.dist = 100; S.quizGate = true;
  const d0 = S.dist;
  update(0.05, performance.now());
  if (S.dist !== d0) throw new Error("Машина едет во время вопроса!");
  console.log("[4] Во время квиза машина стоит — OK");
}

// ---- проверка 5: бестиарий ставит гонку на паузу и корректно закрывается ----
{
  startLevel(0);
  S.lives = 99; S.speed = Math.max(S.speed, 26);   // бот неуязвим, машина «разогрета»
  running = true; paused = false;
  loopCall(20);   // кадр по текущему paused
  const distAtOpen = S.dist;
  // 5a: открытие из игры -> книга видна, окно паузы скрыто, машина стоит
  openCodex();
  if (els["codexModal"]._cls.has("hidden")) throw new Error("Кодекс не открылся");
  if (!paused) throw new Error("Открытие кодекса НЕ поставило игру на паузу!");
  if (!els["pauseModal"]._cls.has("hidden")) throw new Error("Окно паузы показано поверх кодекса");
  loopCall();
  if (S.dist !== distAtOpen) throw new Error("Машина едет при открытом кодексе!");
  // 5b: закрытие кнопки -> игра продолжается без окна паузы
  closeCodex();
  if (!els["codexModal"]._cls.has("hidden")) throw new Error("Кодекс не закрылся");
  if (paused) throw new Error("После закрытия книги игра осталась на паузе");
  if (!els["pauseModal"]._cls.has("hidden")) throw new Error("Окно паузы выскочило после книги");
  loopCall(20);
  const d1 = S.dist;
  if (!(S.dist > distAtOpen)) throw new Error(`Игра не поехала после закрытия кодекса (dist ${Math.floor(distAtOpen)} -> ${Math.floor(S.dist)})`);
  // 5c: путь через меню паузы: P -> пауза -> кнопка «Кодекс» -> книга -> закрыть -> меню паузы снова
  togglePause();
  if (!paused || els["pauseModal"]._cls.has("hidden")) throw new Error("Меню паузы не открылось");
  els["btnCodexFromPause"].onclick();
  if (els["codexModal"]._cls.has("hidden")) throw new Error("Кнопка в меню паузы не открыла кодекс");
  if (!els["pauseModal"]._cls.has("hidden")) throw new Error("Меню паузы не спряталось под кодексом");
  loopCall();
  if (S.dist !== d1) throw new Error("Машина едет при кодеке из меню паузы!");
  closeCodex();
  if (!paused) throw new Error("После возврата из кодекса потеряна пауза");
  if (els["pauseModal"]._cls.has("hidden")) throw new Error("Меню паузы не вернулось после книги");
  togglePause(true);   // продолжить
  if (paused) throw new Error("Не удалось продолжить после пути через кодекс");
  // 5d: двойное открытие игнорируется; квиз-лок блокирует книгу
  openCodex(); const wasOpen = !els["codexModal"]._cls.has("hidden");
  openCodex();
  if ((codexOpen) !== wasOpen) throw new Error("Повторный вызов openCodex сломал состояние");
  closeCodex();
  quizLock = true; openCodex();
  if (!els["codexModal"]._cls.has("hidden")) throw new Error("Кодекс открылся во время вопроса!");
  quizLock = false;
  console.log("[5] Бестиарий: пауза при открытии, возврат в меню паузы, блокировки — OK");
}

console.log("\nALL TESTS PASSED ✅");
