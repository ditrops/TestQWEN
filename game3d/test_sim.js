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
global.requestAnimationFrame = (cb) => { rafCb = cb; return 1; };
global.cancelAnimationFrame = () => { rafCb = null; };
global.confirm = () => false;
global.navigator = {};
global.SIM = true;

// ---- мок THREE ----
class V3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;} set(x,y,z){if(typeof x==="number"){this.x=x;this.y=y;this.z=z}else{this.x=x.x;this.y=x.y;this.z=x.z}return this;} setScalar(s){this.x=this.y=this.z=s;return this;} clone(){return new V3(this.x,this.y,this.z);} }
function mkMesh(extra={}) {
  const m = { position: new V3(), rotation: new V3(), scale: new V3(1,1,1), visible: true, children: [],
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
code = code.replace(/^(?:let|const)\s+((?:S|entities|running|paused|level|currentLevelIndex)(?= =))/gm, "globalThis.$1");
code = code.replace(/\b(?:let|const)\s+(LEVELS|buildQuizPlan|shuffledOptions|quizLock)\b/g, "var $1");
code = code.replace(/^(buildMenu\(\);\nshowScreen\("menu"\);)/m, "/*test: no auto-start*/");
(0,eval)(code);

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
  S.dist = 0; S.speed = 26;
  let quizOpened = 0, gateSeen = 0, warned = 0;
  const origOpen = openQuiz;
  window.openQuiz = undefined; // eval-скоуп: перехват через monkey на функции нельзя — считаем по факту модалки
  let lastModalShown = false;
  let frames = 0;
  while (!S.over && frames < 20000) {
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

console.log("\nALL TESTS PASSED ✅");
