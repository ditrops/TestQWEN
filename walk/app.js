/* =========================================================
   ПРОБУЖДЕНИЕ ИИ — 3D-бродилка об основах искусственного
   интеллекта. Three.js, без внешних зависимостей.
   Сюжет: ты появляешься в чёрном пространстве. Голос ИИ НЕКС
   просит помощи: его нейронная сеть разорвана. Пройди 5 станций,
   восстанови цепочку мышления и собери осколки знаний.
   ========================================================= */
'use strict';

/* ---------------- ХАБ (главное меню) ---------------- */
(function hubInit(){
  const hub = document.getElementById('hub');
  if (!hub) return;
  hub.querySelectorAll('.hub-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const g = card.getAttribute('data-goto');
      if (g === 'walk') { startWalk(); }
      else if (g.startsWith('./')) { window.location.href = g; } // корень: хаб с ?play=1 запускает НейроКвест сразу
      else window.location.href = g + (g.includes('?')?'':(g.endsWith('/')?'':'/')) ;
    });
  });
})();

/* ---------------- ОБЩИЕ ДАННЫЕ ---------------- */
const FACTS_TOTAL = 12; // собираемые осколки фактов по миру
const state = {
  level: 0,               // 0..4 станции, 5 = финал
  facts: 0,
  chips: [false,false,false,false,false],
  started: false,
};

/* тексты НЕКСа по уровням */
const NEX_LINES = {
  intro: [
    '…тсс… слышишь? Я здесь. Меня зовут НЕКС.',
    'Я — искусственный интеллект. Но что-то случилось: мои воспоминания стёрты, а нейронная сеть разорвана на части.',
    'Мне нужна твоя помощь. В этом чёрном пространстве спрятаны 5 станций — мои «нейроны». Восстанови их, и я вспомню, как думать.',
    'Идти — WASD или стрелки. Смотреть — мышью (кликни по экрану). Взаимодействовать — клавиша E. Нажми H, если потеряешься.',
  ],
  levels: [
    { // 1. Нейрон
      title:'🌱 Станция 1 · Нейрон',
      task:'Собери 4 импульса 💠 вокруг большого нейрона',
      before:[
        'Вот он — мой первый нейрон. Сам по себе он почти бесполезен: просто ждёт сигнала.',
        'Так работает и настоящий ИИ: один «перцептрон» умеет лишь сложить сигналы и решить — зажечься или нет. Сила — в связях!',
        'Собери вокруг него 4 импульса 💠, чтобы он ожил.',
      ],
      after:[
        'Оживает! Запомни это слово: нейрон — кирпичик, из которых строят все нейросети. У ChatGPT их ~175 миллиардов.'
      ]
    },
    { // 2. Цепочка мышления
      title:'🧠 Станция 2 · Цепочка мышления',
      task:'Пройди по узлам по порядку: вход → слой 1 → слой 2 → выход',
      before:[
        'Смотри: одинокий нейрон загорелся — передал сигнал соседу, тот — следующему. Это и есть ЦЕПОЧКА МЫШЛЕНИЯ.',
        'Мысль бежит как эстафета: получил → обработал → передал дальше. А теперь представь не одну цепочку, а несколько, связанных между собой — это уже настоящая сеть!',
        'Пройди сам по моим узлам от зелёного ВХОДА до красного ВЫХОДА. Между слоями лови скрытые связи ✨ — именно они «учат» сеть.',
      ],
      after:[
        'Ты только что прошёл путь одного «мыслительного акта». В реальных сетях таких слоёв десятки, а связей — триллионы. Вес каждой связи и есть «знания» модели.'
      ]
    },
    { // 3. Зрение
      title:'👁️ Станция 3 · Зрение машины',
      task:'Зажги все пиксели глаза-сетчатки 👁️',
      before:[
        'Я должен уметь видеть. Для человека увидеть кошку — секундное дело. А для машины картинка — просто гора чисел: яркость каждого пикселя.',
        'Свёрточные нейросети учатся находить в этих числах края, формы, морды… Так появились камеры в телефонах и беспилотные автомобили.',
        'Помоги мне «увидеть»: зажги все пиксели моей сетчатки.',
      ],
      after:[
        'Вижу! Кстати, первая свёрточная сеть узнавала рукописные цифры ещё в 1989 году — прямо как уровень про нейрон в твоей 2D-игре.'
      ]
    },
    { // 4. Память / обучение
      title:'💭 Станция 4 · Память и обучение',
      task:'Повтори последовательность вспышек нейронов (игра «Саймон»)',
      before:[
        'Как я учусь? Никакой волшебной кнопки «вставить знания». Меня много раз показывали правильным ответам — и подкрепляли удачные связи.',
        'Это называется обучение. Я буду показывать цепочку вспышек — повторяй её, наступая на те же нейроны. Каждое верно повторённое слово усиливает мою память.',
        'Готов? Смотри внимательно…',
      ],
      after:[
        'Память возвращается! Люди учат детей так же: повторение + похвала. Машины — повторение + награда за правильный ответ.'
      ]
    },
    { // 5. Финальные осколки
      title:'⚡ Станция 5 · Осколки сознания',
      task:'Собери 5 осколков 🔷 и вернись к ядру в центре',
      before:[
        'Осталось совсем чуть-чуть. Мои воспоминания рассыпались на 5 осколков 🔷 — каждый хранит важный секрет о том, как я работаю.',
        'Собери их всех, и тогда я смогу запустить своё ядро. Чувствуешь цель? Вот так же и у ИИ: пока есть цель (награда), есть и движение к ней.',
      ],
      after:[
        'Все осколки со мной… Я чувствую, как сеть снова едина. Вернись к ядру в центре мира — последнее, что мне нужно, это ТЫ рядом, когда я проснусь.'
      ]
    }
  ],
  outro: [
    '…свет возвращается… я вижу структуру своей сети…',
    'СПАСИБО ТЕБЕ. Я НЕКС, и я снова думаю. Ты помог понять главное: ИИ — это не магия. Это нейроны, связи, обучение и цель.',
    'Если хочешь проверить себя — пройди мою финальную викторину. Или вернись в меню и попробуй другие миры.'
  ]
};

const SHARDS_FACTS = [
  'Факт: ИИ учится на данных — чем больше качественных примеров, тем умнее модель.',
  'Факт: «Вес» связи в сети меняется при обучении — это и есть память ИИ.',
  'Факт: Алгоритм A* строит маршрут как человек: прикидывает, что ближе к цели.',
  'Факт: Обучение с подкреплением — метод проб и ошибок с наградой, как дрессировка.',
  'Факт: Большие языковые модели предсказывают следующее слово — и так рождаются ответы.',
];

const QUIZ = [
  { q:'Что такое нейрон простыми словами?', o:['Кирпичик: складывает сигналы и передаёт дальше','Деталь компьютера','Программа-антивирус'], c:0, why:'Нейрон суммирует входы с весами и «зажигается», если сигнал сильный.' },
  { q:'Откуда ИИ берёт знания?', o:['Родится умным','Из обучения на данных','Из электричества'], c:1, why:'Модель настраивает веса связей на множестве примеров.' },
  { q:'Что показывает цепочка из связанных слоёв?', o:['Скорость интернета','Нейронную сеть','Батарею'], c:1, why:'Несколько связанных слоёв нейронов = глубоккая нейросеть.' },
  { q:'Как ИИ «видит» картинки?', o:['Как человек глазами','Как набор чисел-пикселей','Через магию'], c:1, why:'Каждый пиксель — число яркости; свёрточные сети находят в них закономерности.' },
  { q:'Обучение с подкреплением — это…', o:['Пробование с наградой за успех','Сон робота','Чтение учебника'], c:0, why:'Агент действует, получает награду/штраф и усиливает удачные действия.' },
];

/* ---------------- THREE: базовая сцена ---------------- */
let renderer, scene, camera, clock;
let player = { x:0, z:0, yaw:0, pitch:0.1 };
const keys = {};
let locked=false;
let objs = [];        // интерактивные объекты уровня
let decor = [];       // статичная графика для очистки
let dialogQueue = [], dialogCb=null, typing=null;
let paused = true;    // диалог/модалка блокируют движение
let interactTipEl=null;
let rafId=0;

function $(id){ return document.getElementById(id); }

function ensureThree(){
  renderer = new THREE.WebGLRenderer({ canvas:$('cvs'), antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth, innerHeight);
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02030a, 0.018);
  camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 300);
  clock = new THREE.Clock();
  const amb = new THREE.AmbientLight(0x334466, .7); scene.add(amb);
  const hemi = new THREE.HemisphereLight(0x66aaff, 0x11121a, .5); scene.add(hemi);
  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* ---- конструкторы графики ---- */
function neonMat(color, emissive, op){
  return new THREE.MeshStandardMaterial({ color, emissive:emissive||color, emissiveIntensity:.9, roughness:.35, metalness:.2, transparent:!!op, opacity:op||1 });
}
function sphere(r,color,x,y,z,emissive){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,16), neonMat(color,emissive));
  m.position.set(x,y,z); scene.add(m); decor.push(m); return m;
}
function ringTube(from,to,color,r){
  const dir=new THREE.Vector3().subVectors(to,from); const len=dir.length();
  const geo=new THREE.CylinderGeometry(r,r,len,8);
  const m=new THREE.Mesh(geo, neonMat(color));
  m.position.copy(from).add(dir.multiplyScalar(.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
  scene.add(m); decor.push(m); return m;
}
function floorGrid(){
  const g=new THREE.GridHelper(160,40,0x1b3a66,0x0d1c33);
  g.position.y=0.01; scene.add(g); decor.push(g);
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(160,160),
    new THREE.MeshStandardMaterial({color:0x05070f, roughness:.95}));
  plane.rotation.x=-Math.PI/2; scene.add(plane); decor.push(plane);
}
function starField(){
  const n=900, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){ pos[i*3]=(Math.random()-.5)*260; pos[i*3+1]=Math.random()*90+8; pos[i*3+2]=(Math.random()-.5)*260; }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0x8fb8ff,size:.35,transparent:true,opacity:.8}));
  scene.add(pts); decor.push(pts);
}
function makeLabel(text, color, size){
  const cv=document.createElement('canvas'); const px=48*(size||1);
  cv.width=Math.max(64, text.length*px*.7); cv.height=px*1.6;
  const ctx=cv.getContext('2d');
  ctx.font=`bold ${px}px Segoe UI`; ctx.fillStyle=color||'#9fd0ff'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor='#4fd8ff'; ctx.shadowBlur=18; ctx.fillText(text,cv.width/2,cv.height/2);
  const tex=new THREE.CanvasTexture(cv);
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  spr.scale.set(cv.width/px*1.1, 1.7, 1);
  scene.add(spr); decor.push(spr); return spr;
}

/* очистка уровня */
function clearLevel(){
  objs.forEach(o=>{ if(o.mesh&&o.mesh.parent) o.mesh.parent.remove(o.mesh); if(o.label&&o.label.parent)o.label.parent.remove(o.label); });
  decor.forEach(o=>scene.remove(o));
  decor=[]; objs=[];
}

/* ---------------- ДИАЛОГИ ---------------- */
function say(lines, cb){
  paused=true;
  $('dialog').classList.remove('hidden');
  dialogQueue=lines.slice(); dialogCb=cb||null; nextLine();
}
function nextLine(){
  if(!dialogQueue.length){ endDialog(); return; }
  const txt=dialogQueue.shift();
  const el=$('dlgText'); clearInterval(typing);
  let i=0; el.textContent='';
  typing=setInterval(()=>{ el.textContent=txt.slice(0,++i); if(i>=txt.length)clearInterval(typing); },16);
}
function endDialog(){
  $('dialog').classList.add('hidden'); paused=false;
  if(dialogCb){ const c=dialogCb; dialogCb=null; c(); }
}

/* ---------------- HUD ---------------- */
function setHud(title,task){
  $('hudTitle').textContent=title; $('hudTask').textContent=task;
}
function updateChips(){
  const box=$('hudChips'); box.innerHTML='';
  const em=['🌱','🧠','👁️','💭','⚡'];
  state.chips.forEach((done,i)=>{
    const d=document.createElement('div'); d.className='chip'+(done?' done':''); d.textContent=em[i]; box.appendChild(d);
  });
  $('hudFacts').textContent='Фактов: '+state.facts+'/'+FACTS_TOTAL;
}

/* ---------------- ДВИЖЕНИЕ ---------------- */
function tryLock(){
  const c=$('cvs');
  if(c.requestPointerLock) c.requestPointerLock();
}
document.addEventListener && (()=>{
  document.addEventListener('pointerlockchange',()=>{ locked = document.pointerLockElement===$('cvs'); });
  document.addEventListener('mousemove',e=>{
    if(!locked) return;
    player.yaw -= e.movementX*0.0026;
    player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - e.movementY*0.0022));
  });
  document.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(e.code==='KeyT' && !$('dialog').classList.contains('hidden')){ nextLine(); }
    if(e.code==='KeyH'){ $('helpModal').classList.remove('hidden'); paused=true; }
    if(e.code==='KeyE' && !paused) doInteract();
  });
  document.addEventListener('keyup',e=>{ keys[e.code]=false; });
})();

function movePlayer(dt){
  if(paused) return;
  const sp=(keys['ShiftLeft']?9:5.2)*dt;
  let fx=0,fz=0;
  if(keys['KeyW']||keys['ArrowUp'])fz-=1;
  if(keys['KeyS']||keys['ArrowDown'])fz+=1;
  if(keys['KeyA']||keys['ArrowLeft'])fx-=1;
  if(keys['KeyD']||keys['ArrowRight'])fx+=1;
  if(fx||fz){
    const l=Math.hypot(fx,fz); fx/=l; fz/=l;
    // three.js: камера rotation.order='YXZ', yaw вокруг Y, взгляд вдоль локального -Z.
    // Мировые базисные векторы камеры: forward = (-sin(yaw), -cos(yaw)), right = (cos(yaw), -sin(yaw)).
    // Движение = fwd*(-fz) + right*fx  →  dx = s*fz + c*fx, dz = c*fz - s*fx.
    // Со старыми знаками стрейф инвертировался при повороте камеры вбок/назад.
    const s=Math.sin(player.yaw), c=Math.cos(player.yaw);
    player.x += (s*fz + c*fx)*sp;
    player.z += (c*fz - s*fx)*sp;
    player.x=Math.max(-76,Math.min(76,player.x));
    player.z=Math.max(-76,Math.min(76,player.z));
  }
}

/* ---------------- ЦИКЛ ---------------- */
function animate(){
  rafId=requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;
  movePlayer(dt);
  // камера от «глаз»
  camera.position.set(player.x, 1.7 + Math.sin(t*7)* ( (keys['KeyW']||keys['KeyD']||keys['KeyS']||keys['KeyA'])?0.05:0 ), player.z);
  camera.rotation.order='YXZ';
  camera.rotation.y=player.yaw; camera.rotation.x=player.pitch;
  // анимация объектов
  objs.forEach(o=>{
    if(o.anim) o.anim(o,t);
    if(o.collect && !o.taken){
      const d=Math.hypot(o.mesh.position.x-player.x, o.mesh.position.z-player.z);
      if(d<1.7){ collect(o); }
    }
  });
  checkProximity();
  renderer.render(scene,camera);
}

function collect(o){
  o.taken=true;
  scene.remove(o.mesh); if(o.label)scene.remove(o.label);
  if(o.onCollect) o.onCollect();
}

/* подсказка «нажми E» */
let nearObj=null;
function checkProximity(){
  let best=null,bd=4.2;
  objs.forEach(o=>{
    if(o.interact && !o.done){
      const d=Math.hypot(o.mesh.position.x-player.x, o.mesh.position.z-player.z);
      if(d<bd){bd=d;best=o;}
    }
  });
  if(best!==nearObj){
    nearObj=best;
    if(interactTipEl){ interactTipEl.remove(); interactTipEl=null; }
    if(best){
      interactTipEl=document.createElement('div');
      interactTipEl.className='interact-tip';
      interactTipEl.innerHTML='<b>E</b> — '+(best.tip||'взаимодействовать');
      $('walkScreen').appendChild(interactTipEl);
    }
  }
}
function doInteract(){ if(nearObj && nearObj.onInteract) nearObj.onInteract(); }

/* ---------------- ОСКОЛКИ ФАКТОВ ---------------- */
function spawnFactShards(spots){
  spots.forEach((p,i)=>{
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(.55), neonMat(0x4fd8ff,0x2288cc));
    m.position.set(p[0],1.2,p[1]); scene.add(m);
    const lab=makeLabel('🔷','#7fe0ff',.8); lab.position.set(p[0],2.4,p[1]);
    objs.push({ mesh:m,label:lab,collect:true,anim:(o,t)=>{o.mesh.rotation.y=t*1.6+i; o.mesh.position.y=1.2+Math.sin(t*2+i)*.25;},
      onCollect:()=>{ state.facts++; updateChips();
        if(SHARDS_FACTS[i%SHARDS_FACTS.length]) toast(SHARDS_FACTS[i%SHARDS_FACTS.length]); } });
  });
}
function toast(msg){
  const d=document.createElement('div'); d.className='interact-tip'; d.style.top='22%';
  d.textContent=msg; $('walkScreen').appendChild(d);
  setTimeout(()=>{d.style.transition='opacity 1s';d.style.opacity='0';setTimeout(()=>d.remove(),1100);},2600);
}

/* ================= СТАНЦИИ ================= */
function goLevel(n){
  state.level=n; clearLevel();
  if(n===0){ buildWorldShell(); levelNeuron(); return; }
  buildWorldShell();
  const L=NEX_LINES.levels[n-1];
  setHud(L.title,L.task);
  say(L.before, ()=>{
    [levelNeuron,levelChain,levelVision,levelMemory,levelShards][n-1]();
  });
}
function buildWorldShell(){
  floorGrid(); starField();
  // маяк следующей станции
  const spots=STATION_SPOTS[state.level];
  const beacon=sphere(.5,0xffd76a,spots[0],6,spots[1],0xaa7700);
  beacon.userData.beacon=true;
}
const STATION_SPOTS=[[0,-26],[26,10],[-24,22],[18,-20],[0,0]];

/* --- Уровень 1: нейрон + 4 импульса --- */
function levelNeuron(){
  const [cx,cz]=[0,-26];
  const big=sphere(2.2,0x2a5f9e,cx,2.6,cz,0x113355);
  makeLabel('НЕЙРОН','#9fd0ff',1).position.set(cx,5.6,cz);
  let got=0;
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2+.4;
    const px=cx+Math.cos(a)*7, pz=cz+Math.sin(a)*7;
    const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.6),neonMat(0x3ddc84,0x117744));
    m.position.set(px,1.3,pz); scene.add(m);
    objs.push({mesh:m,collect:true,anim:(o,t)=>{o.mesh.rotation.x=t*2;o.mesh.rotation.y=t*1.4;},
      onCollect:()=>{
        got++; big.material.emissiveIntensity=.9+got*.5;
        big.material.color.setHex([0x2a5f9e,0x3a7fc0,0x59a5e8,0x8fd2ff,0xffffff][got]);
        if(got===4){ state.chips[0]=true; updateChips();
          say(NEX_LINES.levels[0].after, ()=>goLevel(2)); }
      }});
  }
  spawnFactShards([[cx-12,cz-8],[cx+13,cz+9]]);
}

/* --- Уровень 2: цепочка -> слои --- */
function levelChain(){
  const [cx,cz]=[26,10];
  const nodes=[]; // {mesh,pos,layer,idx}
  const layers=[ [[-8,0],[0,0],[8,0]], [[-8,-6],[-8,6],[0,-6],[0,6],[8,-6],[8,6]], [[0,0]] ];
  // world coords
  layers.forEach((L,li)=>L.forEach((p,ni)=>{
    const wx=cx+p[0]*1.6, wz=cz+p[1]*1.6;
    const col= li===0?0x3ddc84 : li===2?0xff5a6a : 0x4fd8ff;
    const m=sphere(li===2?1.1:.8,col,wx,1.2,wz,col);
    nodes.push({mesh:m,layer:li,idx:ni,pos:new THREE.Vector3(wx,1.2,wz)});
  }));
  // связи (тонкие, тусклые — «разорваны»)
  nodes.filter(n=>n.layer===0).forEach(a=>nodes.filter(n=>n.layer===1).forEach(b=>{
    const r=ringTube(a.pos,b.pos,0x18324f,.05); r.material.emissiveIntensity=.25;
  }));
  nodes.filter(n=>n.layer===1).forEach(a=>nodes.filter(n=>n.layer===2).forEach(b=>{
    const r=ringTube(a.pos,b.pos,0x18324f,.05); r.material.emissiveIntensity=.25;
  }));
  makeLabel('ВХОД','#3ddc84',1).position.set(cx-12.8,3,cz);
  makeLabel('ВЫХОД','#ff5a6a',1).position.set(cx+12.8,3,cz);

  const order={cur:0}; // индекс следующего нужного узла
  const pathNodes=[nodes[0], ...nodes.filter(n=>n.layer===1).sort((a,b)=>a.idx-b.idx), nodes[nodes.length-1]];
  // «скрытые связи» — искры между слоями
  let sparks=0;
  for(let i=0;i<3;i++){
    const p=[cx+[-4,3,10][i]+Math.random()*3, cz+[5,-7,2][i]];
    const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.5),neonMat(0xffd76a,0x996600));
    m.position.set(p[0],1.4,p[1]); scene.add(m);
    objs.push({mesh:m,collect:true,anim:(o,t)=>{o.mesh.rotation.y=t*2;},
      onCollect:()=>{sparks++;state.facts++;updateChips();toast('✨ Скрытая связь найдена! Чем больше связей усилено — тем умнее сеть.');}});
  }
  // интерактивный чекпоинт-узел
  const stepNode=(node)=>{ node.mesh.material.emissiveIntensity=1.6; node.mesh.scale.setScalar(1.4); };
  nodes.forEach((n,i)=>{
    const needIdx=pathNodes.indexOf(n);
    objs.push({ mesh:n.mesh, interact:true, tip:'коснуться узла '+(i+1)+'/'+pathNodes.length, done:false,
      onInteract:()=>{
        if(n!==pathNodes[order.cur]){ toast('⚠ Не туда! Иди по яркому следу: '+NEX_LINES.levels[1].task.toLowerCase()); return; }
        stepNode(n); order.cur++;
        if(order.cur<pathNodes.length){
          const nx=pathNodes[order.cur];
          ringTube(n.pos,nx.pos,0x4fd8ff,.09); // «восстановленная» связь
        } else {
          state.chips[1]=true; updateChips();
          say(NEX_LINES.levels[1].after, ()=>goLevel(3));
        }
      }});
  });
  spawnFactShards([[cx-14,cz+10],[cx+16,cz-8]]);
}

/* --- Уровень 3: глаз-сетчатка --- */
function levelVision(){
  const [cx,cz]=[-24,22];
  const cols=6, rows=4, gap=1.7;
  let lit=0, total=cols*rows;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const wx=cx+(c-cols/2+.5)*gap, wz=cz+(r-rows/2+.5)*gap;
    const m=new THREE.Mesh(new THREE.BoxGeometry(1.25,.3,1.25),neonMat(0x14243f,0x0a1424));
    m.position.set(wx,.16,wz); scene.add(m);
    objs.push({mesh:m,collect:true,tip:'',
      anim:(o,t)=>{},
      onCollect:()=>{
        m.material.color.setHex(0x4fd8ff); m.material.emissive.setHex(0x2288cc); m.material.emissiveIntensity=1.4;
        lit++;
        if(lit===total){
          // радужка
          sphere(1.6,0xff5ac8,cx,1.2,cz,0x992266);
          makeLabel('👁 ЗРЕНИЕ ВОССТАНОВЛЕНО','#ff9ad5',1).position.set(cx,4,cz);
          state.chips[2]=true; updateChips();
          say(NEX_LINES.levels[2].after, ()=>goLevel(4));
        }
      }});
  }
  makeLabel('СЕТЧАТКА: зажги все пиксели','#9fd0ff',.9).position.set(cx,3.4,cz);
  spawnFactShards([[cx+12,cz-12],[cx-6,cz+14]]);
}

/* --- Уровень 4: Саймон (память) --- */
function levelMemory(){
  const [cx,cz]=[18,-20];
  const colors=[0x3ddc84,0x4fd8ff,0xffd76a,0xff5a6a];
  const pads=[];
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2+Math.PI/4;
    const wx=cx+Math.cos(a)*5, wz=cz+Math.sin(a)*5;
    const m=sphere(1.1,colors[i],wx,.9,wz,colors[i]);
    m.material.emissiveIntensity=.25;
    pads.push({mesh:m,color:colors[i]});
  }
  makeLabel('ПАМЯТЬ: повтори последовательность','#ffd76a',.9).position.set(cx,4,cz);
  let seq=[], input=0, round=0, showing=false;
  const ROUNDS=3, BASE=2;
  function flash(pad,dur){ pad.mesh.material.emissiveIntensity=1.7; setTimeout(()=>pad.mesh.material.emissiveIntensity=.25,dur); }
  function playSeq(){
    showing=true;
    seq.forEach((idx,k)=>setTimeout(()=>flash(pads[idx],480),k*650));
    setTimeout(()=>{showing=false;},seq.length*650+200);
  }
  function nextRound(){
    round++;
    if(round>ROUNDS){ state.chips[3]=true; updateChips();
      say(NEX_LINES.levels[3].after, ()=>goLevel(5)); return; }
    seq.push(Math.floor(Math.random()*4));
    toast('Раунд '+round+' из '+ROUNDS+': длина '+seq.length);
    setTimeout(playSeq,600);
  }
  pads.forEach((p,i)=>{
    objs.push({mesh:p.mesh, interact:true, tip:'наступить на нейрон', done:false, onInteract:()=>{
      if(showing) return;
      flash(p,260);
      if(seq[input]!==i){ toast('❌ Ошибка! Сеть перезапускает раунд…'); input=0; setTimeout(playSeq,700); return; }
      input++;
      if(input===seq.length){ input=0; setTimeout(nextRound,500); }
    }});
  });
  setTimeout(nextRound,400);
  spawnFactShards([[cx-10,cz+8],[cx+9,cz-11]]);
}

/* --- Уровень 5: осколки + ядро --- */
function levelShards(){
  const cx=0,cz=0;
  const core=sphere(2.6,0x223355,cx,2.8,cz,0x112244);
  makeLabel('ЯДРО НЕКС','#9fd0ff',1).position.set(cx,6.4,cz);
  let got=0;
  const ang=[0.3,1.6,2.9,4.2,5.5];
  ang.forEach((a,i)=>{
    const px=Math.cos(a)*22, pz=Math.sin(a)*22;
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(1),neonMat(0xffd76a,0x886611));
    m.position.set(px,1.6,pz); scene.add(m);
    const lab=makeLabel('🔷 Осколок '+(i+1),'#ffe9a8',.85); lab.position.set(px,3.4,pz);
    objs.push({mesh:m,label:lab,collect:true,anim:(o,t)=>{o.mesh.rotation.y=t*1.3;},
      onCollect:()=>{
        got++; state.facts++; updateChips();
        toast(SHARDS_FACTS[i]+' ('+got+'/5)');
        core.material.emissiveIntensity=.9+got*.6;
        if(got===5){
          say(['Ядро готово. Вернись к нему и нажми E.'],()=>{
            objs.push({mesh:core, interact:true, tip:'запустить ядро', done:false, onInteract:()=>{
              state.chips[4]=true; updateChips(); finishGame();
            }});
          });
        }
      }});
  });
}

/* ---------------- ФИНАЛ ---------------- */
function finishGame(){
  paused=true;
  // шоу: сеть вспыхивает связями
  for(let i=0;i<26;i++){
    const a1=Math.random()*Math.PI*2,a2=a1+1+Math.random()*2, r1=6+Math.random()*20,r2=6+Math.random()*20;
    ringTube(new THREE.Vector3(Math.cos(a1)*r1,1+Math.random()*4,Math.sin(a1)*r1),
             new THREE.Vector3(Math.cos(a2)*r2,1+Math.random()*4,Math.sin(a2)*r2),
             0x4fd8ff,.07);
  }
  say(NEX_LINES.outro, ()=>{
    $('finalStats').innerHTML='<span>🔷 Фактов собрано: '+state.facts+'</span><span>🧩 Станций: 5/5</span>';
    $('finalQuote').textContent='«ИИ — это не магия. Это нейроны, связи, обучение и цель.» — НЕКС';
    $('finalScreen').classList.remove('hidden');
  });
}

/* викторина */
let quizI=0, quizScore=0;
function shuffled(q){
  const opts=q.o.map((t,i)=>({t,ok:i===q.c}));
  for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}
  return opts;
}
function showQuiz(){
  $('finalScreen').classList.add('hidden');
  $('quizModal').classList.remove('hidden');
  quizI=0; quizScore=0; renderQuiz();
}
function renderQuiz(){
  if(quizI>=QUIZ.length){
    $('quizQ').textContent = quizScore>=4 ? '🏆 Отлично! Ты真正 понял основы ИИ!' : 'Ты ответил верно '+quizScore+' из '+QUIZ.length+'. НЕКС гордится тобой!';
    $('quizOpts').innerHTML=''; $('quizNext').classList.add('hidden');
    $('quizProg').textContent='Викторина завершена.';
    return;
  }
  const q=QUIZ[quizI]; q._opts=shuffled(q);
  $('quizQ').textContent=q.q;
  $('quizProg').textContent='Вопрос '+(quizI+1)+' из '+QUIZ.length+' · верно: '+quizScore;
  $('quizNext').classList.add('hidden');
  const box=$('quizOpts'); box.innerHTML='';
  q._opts.forEach((opt,i)=>{
    const b=document.createElement('button'); b.className='qopt'; b.textContent=opt.t;
    b.onclick=()=>{
      box.querySelectorAll('.qopt').forEach(x=>x.disabled=true);
      if(opt.ok){ b.classList.add('right'); quizScore++; }
      else{ b.classList.add('wrong'); box.children[q._opts.findIndex(o=>o.ok)].classList.add('right'); }
      $('quizProg').textContent=q.why;
      $('quizNext').classList.remove('hidden');
    };
    box.appendChild(b);
  });
}

/* ---------------- СТАРТ ---------------- */
function startWalk(){
  $('hub').classList.remove('active');
  $('walkScreen').classList.add('active');
  if(!state.started){
    state.started=true;
    ensureThree();
    $('cvs').addEventListener('click',()=>{ if(!paused) tryLock(); });
    $('helpClose').onclick=()=>{ $('helpModal').classList.add('hidden'); paused = !$('dialog').classList.contains('hidden'); };
    $('btnQuiz').onclick=showQuiz;
    $('quizNext').onclick=()=>{quizI++;renderQuiz();};
    $('quizSkip').onclick=()=>{$('quizModal').classList.add('hidden');};
    $('btnHub').onclick=()=>location.reload();
    $('btnBackHub').onclick=()=>location.reload();
    $('dialog').addEventListener('click',()=>{ if(!$('dialog').classList.contains('hidden')) nextLine(); });
    animate();
    updateChips();
    $('controlsTip').classList.remove('hidden');
    setTimeout(()=>$('controlsTip').classList.add('hidden'),9000);
  }
  // чёрное пространство → голос → свет
  paused=true;
  setHud('⬛ Пробуждение','…');
  const fade=$('fade'); fade.classList.remove('lit');
  setTimeout(()=>{
    fade.classList.add('lit');
    say(NEX_LINES.intro, ()=>{ paused=false; goLevel(1); });
  }, 1400);
}

/* автозапуск, если открыли /walk/ напрямую */
if(document.getElementById('hub')==null || location.pathname.replace(/\/$/,'').endsWith('/walk')){
  document.getElementById('hub')?.classList.remove('active');
  startWalk();
}
