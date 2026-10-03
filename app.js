/* ============================================================
   НейроКвест — образовательная игра об основах ИИ
   Проект по информатике. Чистый JavaScript, без библиотек.
   ============================================================ */

// ---------- Хранилище прогресса ----------
const Store = {
  key: 'neuroquest-progress-v1',
  load() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { stars: {} }; }
    catch { return { stars: {} }; }
  },
  save(p) { localStorage.setItem(this.key, JSON.stringify(p)); }
};

// ---------- UI ----------
const UI = {
  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    const inGame = id.startsWith('screen-level');
    document.getElementById('topbar').classList.toggle('hidden', !inGame);
    window.scrollTo(0, 0);
  },
  stars(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); },
  updateTopbar(level) {
    const names = {1:'🤖 Что такое ИИ?',2:'🌳 Дерево решений',3:'🔍 Поиск A*',4:'👁️ Нейросеть',5:'🎮 Обучение агента'};
    document.getElementById('topbar-level').textContent = `Уровень ${level}: ${names[level]}`;
    const p = Store.load();
    const total = Object.values(p.stars).reduce((a,b)=>a+b,0);
    document.getElementById('topbar-score').textContent = `⭐ ${total}/15`;
  },
  showResult({ level, stars, title, text }) {
    const ov = document.getElementById('result-overlay');
    document.getElementById('result-icon').textContent = stars === 3 ? '🏆' : stars >= 1 ? '🎉' : '😅';
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-stars').textContent = UI.stars(stars);
    document.getElementById('result-text').textContent = text;
    document.getElementById('btn-retry').setAttribute('onclick', `Game.startLevel(${level})`);
    const nextBtn = document.getElementById('btn-next');
    if (level < 5) {
      nextBtn.style.display = '';
      nextBtn.setAttribute('onclick', `Game.nextLevel(${level})`);
    } else {
      nextBtn.textContent = '🏁 Итоги';
      nextBtn.setAttribute('onclick', `Game.showFinal()`);
    }
    ov.classList.remove('hidden');
  },
  hideResult() { document.getElementById('result-overlay').classList.add('hidden'); }
};

// ---------- Игра / навигация ----------
const Game = {
  startLevel(n) {
    UI.hideResult();
    UI.updateTopbar(n);
    if (!this._unlocked(n)) { alert('Сначала пройди предыдущий уровень!'); return; }
    switch (n) {
      case 1: Quiz.init(); break;
      case 2: DecisionTreeGame.init(); break;
      case 3: AstarGame.init(); break;
      case 4: NNGame.init(); break;
      case 5: RLGame.init(); break;
    }
    UI.show('screen-level' + n);
  },
  _unlocked(n) {
    if (n === 1) return true;
    const p = Store.load();
    return (p.stars[n - 1] || 0) > 0; // для прохода достаточно ≥1 звезды
  },
  complete(level, stars) {
    const p = Store.load();
    p.stars[level] = Math.max(p.stars[level] || 0, stars);
    Store.save(p);
    UI.updateTopbar(level);
    const texts = {
      1: 'Ты разобрался, чем ИИ отличается от обычного программирования!',
      2: 'Ты сам построил классификатор — именно так работают простые модели ML.',
      3: 'Ты нашёл оптимальный путь — так думают поисковые алгоритмы в играх и навигаторах.',
      4: 'Ты понял, как машины «видят» изображения через пиксели и признаки.',
      5: 'Ты обучил агента наградами — принцип, на котором учатся AlphaGo и роботы.'
    };
    UI.showResult({
      level, stars,
      title: stars >= 1 ? `Уровень ${level} пройден!` : 'Почти! Попробуй ещё раз',
      text: texts[level]
    });
    if (stars >= 1 && level === 5) Menu.render();
  },
  nextLevel(cur) { UI.hideResult(); this.startLevel(cur + 1); },
  goMenu() { UI.hideResult(); Menu.render(); UI.show('screen-menu'); },
  showFinal() {
    UI.hideResult();
    const p = Store.load();
    const total = Object.values(p.stars).reduce((a,b)=>a+b,0);
    document.getElementById('final-stats').innerHTML =
      `<div class="stat-chip">⭐ Звёзд: <b>${total}/15</b></div>` +
      `<div class="stat-chip">🧠 Званий: <b>${total>=14?'Архитектор ИИ':total>=10?'Инженер данных':total>=5?'Любознательный хакер':'Начинающий исследователь'}</b></div>`;
    const facts = [
      'Алан Тьюринг предложил свой тест ещё в 1950 году — за 4 года до появления самого термина «искусственный интеллект»!',
      'Первая нейросеть-перцептрон (1958) умела различать всего пару форм — а современные сети пишут тексты и рисуют картины.',
      'AlphaZero научилась играть в шахматы за 4 часа — без единой подсказки человека, только самоиграя!',
      'Навигаторы в телефоне используют тот же принцип поиска кратчайшего пути, который ты применил на уровне 3.'
    ];
    document.getElementById('final-fact').textContent = '💡 ' + facts[Math.floor(Math.random()*facts.length)];
    UI.show('screen-final');
  },
  resetAll() {
    if (confirm('Сбросить весь прогресс?')) {
      localStorage.removeItem(Store.key);
      Menu.render();
      UI.show('screen-menu');
    }
  }
};

// ---------- Меню ----------
const Menu = {
  render() {
    const p = Store.load();
    const levels = [
      { icon: '🤖', name: 'Что такое ИИ?' },
      { icon: '🌳', name: 'Дерево решений' },
      { icon: '🔍', name: 'Поиск A*' },
      { icon: '👁️', name: 'Нейросеть' },
      { icon: '🎮', name: 'Обучение агента' }
    ];
    document.getElementById('menu-progress').innerHTML = levels.map((l, i) => {
      const n = i + 1;
      const unlocked = Game._unlocked(n);
      const st = p.stars[n] || 0;
      return `<div class="level-card ${unlocked ? '' : 'locked'}" onclick="${unlocked ? `Game.startLevel(${n})` : ''}">
        <div class="lvl-icon">${unlocked ? l.icon : '🔒'}</div>
        <div class="lvl-name">${n}. ${l.name}</div>
        <div class="lvl-stars">${st ? UI.stars(st) : '—'}</div>
      </div>`;
    }).join('');
  }
};

// ============================================================
// УРОВЕНЬ 1 — викторина «Что такое ИИ?»
// ============================================================
const Quiz = {
  questions: [
    {
      q: '1. Кто предложил знаменитый «тест» на интеллектуальность машины — игру, где судья общается с человеком и машиной по переписке?',
      opts: ['Стив Джобс', 'Алан Тьюринг', 'Илон Маск', 'Билл Гейтс'],
      correct: 1,
      explain: 'В 1950 году Алан Тьюринг задал вопрос «Могут ли машины думать?» и предложил тест: если человек в переписке не отличает машину от человека — говорят, что машина прошла тест Тьюринга.'
    },
    {
      q: '2. ChatGPT, голосовые помощники и шаховые движки — это пример какого ИИ?',
      opts: ['Сильный ИИ (AGI), который разумнее человека во всём',
            'Слабого (узкого) ИИ — он силён только в одной задаче',
            'Обычной программы без элементов ИИ',
            'Биологического ИИ'],
      correct: 1,
      explain: 'Весь современный ИИ — узкий (слабый). Шахматный движок гениально играет в шахматы, но не умеет даже поздороваться. Сильный ИИ (AGI) — пока только цель исследований.'
    },
    {
      q: '3. Чем машинное обучение отличается от классического программирования?',
      opts: ['Программист пишет больше точных правил «если… то…»',
            'Компьютер сам находит закономерности в данных вместо готовых правил',
            'Машинное обучение работает только на игровых приставках',
            'Ничем не отличается'],
      correct: 1,
      explain: 'В классической программе правила пишет человек. В машинном обучении мы даём компьютеру примеры (данные), а правила он выводит сам — этот процесс и называется обучением модели.'
    },
    {
      q: '4. Что такое «обучающие данные» для нейросети, которая распознаёт кошек на фото?',
      opts: ['Инструкция по сборке компьютера',
            'Тысячи фотографий с пометками «кошка» / «не кошка»',
            'Корм для котов',
            'Один очень большой файл с кодом'],
      correct: 1,
      explain: 'Это обучение с учителем: модель получает пары «фото → правильный ответ» и учится связывать пиксели с ответом. Без данных нет и обучения!'
    },
    {
      q: '5. Что из перечисленного НЕ является признаком того, что систему можно назвать ИИ?',
      opts: ['Система адаптируется к новым данным',
            'Система учится находить закономерности сама',
            'Система просто пересчитывает сумму по фиксированной формуле',
            'Система принимает решения в неопределённости'],
      correct: 2,
      explain: 'Калькулятор считает строго по формуле — в нём нет обучения и адаптации. Это просто алгоритм. Признаки ИИ: обучение, адаптация, работа с неопределённостью.'
    }
  ],
  init() {
    this.firstTryCorrect = 0;
    this.answered = new Set();
    const box = document.getElementById('quiz-box');
    box.innerHTML = this.questions.map((q, qi) => `
      <div class="quiz-q" id="qq-${qi}">
        <div class="q-text">${q.q}</div>
        ${q.opts.map((o, oi) => `
          <button class="quiz-opt" data-q="${qi}" data-o="${oi}" onclick="Quiz.answer(this)">${o}</button>`).join('')}
        <div class="quiz-explain" id="ex-${qi}">💡 ${q.explain}</div>
      </div>`).join('') +
      `<button class="btn btn-success" id="quiz-finish" disabled onclick="Quiz.finish()">✅ Завершить уровень</button>`;
  },
  answer(btn) {
    const qi = +btn.dataset.q, oi = +btn.dataset.o;
    if (this.answered.has(qi)) return;
    const q = this.questions[qi];
    const opts = document.querySelectorAll(`.quiz-opt[data-q="${qi}"]`);
    if (oi === q.correct) {
      btn.classList.add('correct');
      this.firstTryCorrect++;
      this.answered.add(qi);
      opts.forEach(o => o.disabled = true);
      document.getElementById('ex-' + qi).classList.add('show');
      if (this.answered.size === this.questions.length)
        document.getElementById('quiz-finish').disabled = false;
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
    }
  },
  finish() {
    const ratio = this.firstTryCorrect / this.questions.length;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    Game.complete(1, stars);
  }
};

// ============================================================
// УРОВЕНЬ 2 — дерево решений («Machine Learning», м/ф)
// ============================================================
const DecisionTreeGame = {
  robots: [
    { e:'🤖', size:'маленький', weather:'солнечно', owner:'да',  label:true  },
    { e:'🦾', size:'маленький', weather:'дождь',    owner:'нет', label:false },
    { e:'🤖', size:'большой',   weather:'снег',     owner:'нет', label:false },
    { e:'🦿', size:'маленький', weather:'снег',     owner:'да',  label:true  },
    { e:'🤖', size:'средний',   weather:'солнечно', owner:'да',  label:true  },
    { e:'🦾', size:'средний',   weather:'дождь',    owner:'нет', label:false },
    { e:'🤖', size:'большой',   weather:'солнечно', owner:'нет', label:true  },
    { e:'🦿', size:'средний',   weather:'снег',     owner:'да',  label:true  },
  ],
  features: [
    { key:'size',    name:'Размер',    test:(r,v)=> v==='маленький' ? r.size==='маленький' : r.size===v },
    { key:'weather', name:'Погода',    test:(r,v)=> v==='плохая' ? (r.weather==='дождь'||r.weather==='снег') : r.weather===v },
    { key:'owner',   name:'Есть хозяин', test:(r,v)=> r.owner===v },
  ],
  values: { size:['маленький','средний','большой'], weather:['солнечно','плохая'], owner:['да','нет'] },
  init() {
    this.rules = [];
    this.render();
  },
  addRule() {
    if (this.rules.length >= 3) return;
    this.rules.push({ feature: 'size', value: 'маленький', result: 'yes' });
    this.render();
  },
  setRule(i, field, val) {
    this.rules[i][field] = val;
    this.render();
  },
  delRule(i) { this.rules.splice(i, 1); this.render(); },
  predict(r) {
    for (const rule of this.rules) {
      const f = this.features.find(x => x.key === rule.feature);
      if (f.test(r, rule.value)) return rule.result === 'yes';
    }
    return null; // нет решения
  },
  render() {
    const area = document.getElementById('tree-area');
    const preds = this.robots.map(r => this.predict(r));
    const decided = preds.filter(p => p !== null).length;
    const correct = this.robots.filter((r,i)=>preds[i]===r.label).length;

    const rulesHtml = this.rules.map((rule, i) => {
      const feats = this.features.map(f=>`<option value="${f.key}" ${rule.feature===f.key?'selected':''}>${f.name}</option>`).join('');
      const vals  = this.values[rule.feature].map(v=>`<option value="${v}" ${rule.value===v?'selected':''}>${v}</option>`).join('');
      return `<div class="tree-controls">
        <b>ЕСЛИ</b>
        <select class="btn btn-small" onchange="DecisionTreeGame.setRule(${i},'feature',this.value)">${feats}</select>
        <select class="btn btn-small" onchange="DecisionTreeGame.setRule(${i},'value',this.value)">${vals}</select>
        <b>ТО гулять:</b>
        <select class="btn btn-small" onchange="DecisionTreeGame.setRule(${i},'result',this.value)">
          <option value="yes" ${rule.result==='yes'?'selected':''}>ДА ✅</option>
          <option value="no"  ${rule.result==='no' ?'selected':''}>НЕТ ❌</option>
        </select>
        <button class="btn btn-small btn-danger" onclick="DecisionTreeGame.delRule(${i})">✕</button>
      </div>`;
    }).join('');

    const codeLines = [];
    this.rules.forEach((rule,i)=>{
      const f = this.features.find(x=>x.key===rule.feature);
      codeLines.push(`${'if'.padStart(1+i*2,' ')} <span class="hl">${f.name}</span> == "${rule.value}":  →  "${rule.result==='yes'?'гулять ДА':'гулять НЕТ'}"`);
    });
    codeLines.push(`${'else'.padStart(1+this.rules.length*2,' ')}:  →  "нет решения 🤷"`);

    const robotsHtml = this.robots.map((r,i)=>{
      const p = preds[i];
      let cls = '';
      if (p === true) cls = 'pred-yes';
      if (p === false) cls = 'pred-no';
      const verdict = p === null ? '❓' : (p === r.label ? '✔ верно' : '✘ ошибка');
      return `<div class="robot-card ${cls} ${p!==null&&p!==r.label?'mistake':''}">
        <div class="r-emoji">${r.e}</div>
        <div><span class="tag">${r.size}</span></div>
        <div><span class="tag">${r.weather}</span></div>
        <div><span class="tag">хозяин: ${r.owner}</span></div>
        <div style="margin-top:4px"><span class="tag ${r.label?'label-yes':'label-no'}">правильно: ${r.label?'ГУЛЯТЬ':'ДОМОЙ'}</span></div>
        <div style="margin-top:4px;font-weight:700">${verdict}</div>
      </div>`;
    }).join('');

    area.innerHTML = `
      <div class="tree-controls">
        <button class="btn btn-primary btn-small" onclick="DecisionTreeGame.addRule()" ${this.rules.length>=3?'disabled':''}>➕ Добавить условие (${this.rules.length}/3)</button>
        <span>Решений найдено: <b>${decided}/${this.robots.length}</b>, верных: <b class="${correct===this.robots.length&&decided===this.robots.length?'cost-ok':'cost-bad'}">${correct}/${this.robots.length}</b></span>
      </div>
      ${rulesHtml || '<p style="color:var(--muted)">Добавь первое условие «ЕСЛИ … ТО …» — это корень твоего дерева решений.</p>'}
      <div class="tree-code">${codeLines.join('\n') || '// дерево пусто'}</div>
      <div class="robot-grid">${robotsHtml}</div>
      <button class="btn btn-success" ${decided===this.robots.length&&correct===this.robots.length?'':'disabled'} onclick="DecisionTreeGame.check()">🎯 Проверить дерево и завершить</button>
    `;
  },
  check() {
    const tries = this.rules.length;
    const stars = tries <= 2 ? 3 : tries === 3 ? 2 : 1;
    Game.complete(2, stars);
  }
};

// ============================================================
// УРОВЕНЬ 3 — поиск пути (эвристика как в A*)
// ============================================================
const AstarGame = {
  // 0 = обычная клетка (цена 1), 1 = стена, цифры 2.. = цена
  map: [
    [0,0,2,1,0,0,0],
    [0,1,2,1,0,1,0],
    [0,1,3,0,0,1,0],
    [0,1,1,1,2,1,0],
    [0,0,0,0,2,0,0],
    [1,1,0,1,3,1,2],
    [0,0,0,0,0,0,0],
  ],
  start:[6,0], goal:[0,6], budget: 16,
  init() {
    this.path = [this.start.slice()];
    this.render();
  },
  price(r,c){ return this.map[r][c] === 0 ? 1 : this.map[r][c]; },
  heuristic(r,c){ return Math.abs(r-this.goal[0]) + Math.abs(c-this.goal[1]); }, // манхэттенское расстояние
  cost() {
    let s = 0;
    for (let i=1;i<this.path.length;i++) s += this.price(this.path[i][0], this.path[i][1]);
    return s;
  },
  clickCell(r,c) {
    const last = this.path[this.path.length-1];
    if (this.map[r][c] === 1) return;
    // клик по предыдущей клетке — шаг назад
    if (this.path.length > 1 && this.path[this.path.length-2][0]===r && this.path[this.path.length-2][1]===c) {
      this.path.pop(); this.render(); return;
    }
    // уже в пути?
    if (this.path.some(p=>p[0]===r&&p[1]===c)) return;
    const dr = Math.abs(last[0]-r), dc = Math.abs(last[1]-c);
    if (dr + dc === 1) { this.path.push([r,c]); this.render(); }
  },
  render() {
    const area = document.getElementById('astar-area');
    const cost = this.cost();
    const atEnd = this.path[this.path.length-1];
    const arrived = atEnd[0]===this.goal[0] && atEnd[1]===this.goal[1];
    const okBudget = cost <= this.budget;
    let html = `<div class="astar-info">
      <div>Стоимость пути: <span class="${okBudget?'cost-ok':'cost-bad'}">${cost}</span> / лимит ${this.budget}</div>
      <div>Шагов: ${this.path.length-1}</div>
      <div>${arrived ? (okBudget?'✅ Дошёл и уложился!':'⚠️ Дошёл, но слишком дорого') : '🚧 Ещё не дошёл до 🏁'}</div>
    </div><div class="grid" style="grid-template-columns:repeat(7,46px)">`;
    for (let r=0;r<7;r++) for (let c=0;c<7;c++) {
      const wall = this.map[r][c]===1;
      const inPath = this.path.some(p=>p[0]===r&&p[1]===c);
      const isS = r===this.start[0]&&c===this.start[1];
      const isG = r===this.goal[0]&&c===this.goal[1];
      const content = isS ? '🤖' : isG ? '🏁' : wall ? '🪨' : '';
      html += `<div class="cell ${wall?'wall':''} ${inPath&&!isS&&!isG?'path':''} ${isS?'start':''} ${isG?'goal':''}"
        onclick="AstarGame.clickCell(${r},${c})">
        ${!wall && !isS && !isG ? `<span class="heur" title="эвристика h=${this.heuristic(r,c)}"></span><span class="price">${this.price(r,c)}</span>`:''}
        ${content}</div>`;
    }
    html += `</div>
      <div class="tree-controls">
        <button class="btn btn-ghost btn-small" onclick="AstarGame.init()">↩ Сбросить путь</button>
        <button class="btn btn-success" ${arrived&&okBudget?'':'disabled'} onclick="AstarGame.check()">🎯 Готово!</button>
      </div>
      <p class="nn-hint">Каждая клетка имеет цену (цифра внизу справа). Жёлтая точка слева сверху — эвристика h: «насколько близко к цели» (манхэттенское расстояние). Настоящий A* выбирает клетку с минимальной суммой g + h — попробуй и ты найти путь подешевле!</p>`;
    area.innerHTML = html;
  },
  check() {
    const cost = this.cost();
    const stars = cost <= 13 ? 3 : cost <= 15 ? 2 : 1;
    Game.complete(3, stars);
  }
};

// ============================================================
// УРОВЕНЬ 4 — рисуем цифру, «нейросеть» угадывает
// ============================================================
const NNGame = {
  targets: [1, 0, 8],
  targetIdx: 0,
  grid: Array(64).fill(0),
  drawing: false,
  strokes: 0,
  correctGuessed: 0,
  init() {
    this.targetIdx = 0;
    this.strokes = 0;
    this.correctGuessed = 0;
    this.newTarget();
  },
  newTarget() {
    this.grid = Array(64).fill(0);
    document.getElementById('target-digit').textContent = this.targets[this.targetIdx];
    this.render();
  },
  toggle(i, forceOn) {
    this.grid[i] = forceOn ? 1 : (this.grid[i] ? 0 : 1);
    this.renderCanvas();
  },
  clear() { this.grid = Array(64).fill(0); this.renderCanvas(); },
  // «нейросеть»: вектор признаков + softmax-подобные вероятности
  recognize() {
    const g = this.grid;
    const colSum = c => g.slice(c*8,(c+1)*8).reduce((a,b)=>a+b,0);
    const total = g.reduce((a,b)=>a+b,0);
    if (total < 4) return null;
    const centerMass = (colSum(3)+colSum(4))/total;
    const leftMass = (colSum(0)+colSum(1)+colSum(2)+colSum(3))/total;
    const width = [0,1,2,3,4,5,6,7].filter(c=>colSum(c)>0).length;
    const height = [0,1,2,3,4,5,6,7].filter(r=>g.slice(r*8,r*8+8).some(v=>v)).length;
    const row0full = g.slice(0,8).reduce((a,b)=>a+b,0) >= 5;
    let upperRight = 0; for (let r=0;r<4;r++) upperRight += g.slice(r*8+4,r*8+8).reduce((a,b)=>a+b,0);
    upperRight /= total;
    const holes = this.countHoles(g);
    const scores = {};
    scores[1] = (width<=3&&height>=5?1.6:0) + (width<=4&&height>=6?1.0:0) + centerMass*0.4 + (row0full&&centerMass>0.5?0.9:0);
    scores[0] = holes===1 ? 1.3 : 0;
    scores[8] = holes>=2 ? 1.9 : (holes>=1 && total>=18 ? 0.9 : 0);
    scores[7] = (row0full && holes===0 && height>=4 && upperRight>0.35) ? 1.4 : 0;
    scores[4] = (holes>=1 && leftMass>0.55) ? 0.8 : 0;
    const keys = Object.keys(scores);
    const exps = keys.map(k=>Math.exp(scores[k]*3));
    const sum = exps.reduce((a,b)=>a+b,0);
    const probs = keys.map((k,i)=>({digit:+k, p: exps[i]/sum}));
    probs.sort((a,b)=>b.p-a.p);
    return { best: probs[0], probs, features:{total, centerMass:+centerMass.toFixed(2), holes} };
  },
  countHoles(g) {
    // грубо считаем «дырки» — замкнутые области фона
    const seen = Array(64).fill(false);
    const bgId = (i)=>g[i]===0;
    // flood fill фона с границы
    const stack = [];
    for (let i=0;i<64;i++){
      const r=Math.floor(i/8), c=i%8;
      if ((r===0||c===0||r===7||c===7) && bgId(i) && !seen[i]) {
        seen[i]=true; stack.push(i);
        while(stack.length){
          const cur=stack.pop(), cr=Math.floor(cur/8), cc=cur%8;
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
            const nr=cr+dr, nc=cc+dc;
            if(nr>=0&&nr<8&&nc>=0&&nc<8){
              const ni=nr*8+nc;
              if(bgId(ni)&&!seen[ni]){seen[ni]=true;stack.push(ni);}
            }
          });
        }
      }
    }
    let holes=0;
    for(let i=0;i<64;i++) if(bgId(i)&&!seen[i]){holes++; // нашли внутренний фон — flood его
      const st=[i]; seen[i]=true;
      while(st.length){const cur=st.pop(),cr=Math.floor(cur/8),cc=cur%8;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{const nr=cr+dr,nc=cc+dc;
          if(nr>=0&&nr<8&&nc>=0&&nc<8){const ni=nr*8+nc; if(bgId(ni)&&!seen[ni]){seen[ni]=true;st.push(ni);}}});}
    }
    return Math.min(holes,3);
  },
  guess() {
    this.strokes++;
    const res = this.recognize();
    const out = document.getElementById('nn-out');
    const bars = document.getElementById('nn-bars');
    if (!res) {
      out.textContent = '🤔';
      bars.innerHTML = '<p class="nn-hint">Нарисуй побольше пикселей — сети нужны данные!</p>';
      return;
    }
    const target = this.targets[this.targetIdx];
    const right = res.best.digit === target;
    if (right) this.correctGuessed++;
    out.textContent = `${right?'✅':'❌'} ${res.best.digit}`;
    bars.innerHTML = res.probs.slice(0,4).map(pr=>
      `<div class="nn-bar-row"><span>${pr.digit}</span><div class="nn-bar" style="width:${Math.round(pr.p*180)}px"></div><span>${Math.round(pr.p*100)}%</span></div>`).join('') +
      `<p class="nn-hint">Вектор признаков: пикселей=${res.features.total}, «масса в центре»=${res.features.centerMass}, замкнутых областей=${res.features.holes}</p>`;
    if (right) {
      setTimeout(()=>{
        if (this.targetIdx < this.targets.length-1) {
          this.targetIdx++; this.newTarget();
          document.getElementById('nn-msg').textContent = `Новая цифра: ${this.targets[this.targetIdx]}!`;
        } else {
          const stars = this.strokes <= this.targets.length+1 ? 3 : this.strokes <= this.targets.length+3 ? 2 : 1;
          Game.complete(4, stars);
        }
      }, 900);
    }
  },
  renderCanvas() {
    const cv = document.getElementById('nn-canvas');
    if (!cv) return;
    cv.innerHTML = this.grid.map((v,i)=>`<div class="px ${v?'on':''}"
      onmousedown="NNGame.drawing=true;NNGame.toggle(${i},true)"
      onmouseenter="if(NNGame.drawing)NNGame.toggle(${i},true)"
      onclick="NNGame.toggle(${i})"></div>`).join('');
  },
  render() {
    const area = document.getElementById('nn-area');
    area.innerHTML = `
      <div class="nn-wrap">
        <div class="nn-canvas" id="nn-canvas" onmouseup="NNGame.drawing=false" onmouseleave="NNGame.drawing=false"></div>
        <div class="nn-side">
          <p>Раунд <b id="nn-round">${this.targetIdx+1}</b> из ${this.targets.length}. Цепляйся за мышку и рисуй!</p>
          <div class="tree-controls">
            <button class="btn btn-success" onclick="NNGame.guess()">🧠 Угадать</button>
            <button class="btn btn-ghost btn-small" onclick="NNGame.clear()">🗑 Очистить</button>
          </div>
          <div class="nn-result" id="nn-out">❔</div>
          <div class="nn-bars" id="nn-bars"></div>
          <p class="nn-hint" id="nn-msg">Так работают свёрточные сети: картинка → признаки → вероятности классов.</p>
        </div>
      </div>`;
    this.renderCanvas();
    document.addEventListener('mouseup', ()=>this.drawing=false);
  }
};

// ============================================================
// УРОВЕНЬ 5 — обучение с подкреплением (мини-игра)
// ============================================================
const RLGame = {
  size: 5,
  roundsNeeded: 5,
  roundStars: 3,
  init() {
    this.reward = 0;
    this.round = 0;
    this.finished = false;
    this.log = [];
    this.placeEntities();
    this.render();
  },
  placeEntities() {
    const cells = [];
    for (let i=0;i<this.size*this.size;i++) if(i!==0) cells.push(i);
    cells.sort(()=>Math.random()-0.5);
    this.agent = 0;
    this.star = cells[0];
    this.hole = cells[1];
    this.steps = 0;
  },
  move(dr, dc, name) {
    if (this.finished) return;
    const r = Math.floor(this.agent/this.size), c = this.agent%this.size;
    const nr = Math.min(this.size-1, Math.max(0, r+dr));
    const nc = Math.min(this.size-1, Math.max(0, c+dc));
    this.agent = nr*this.size+nc;
    let msg = '';
    if (this.agent === this.star) {
      this.reward += 10; msg = `🎯 ${name}: собрал звезду! +10`;
      this.endRound(true, msg); return;
    }
    if (this.agent === this.hole) {
      this.reward -= 5; msg = `🕳 ${name}: упал в яму! -5`;
      this.endRound(false, msg); return;
    }
    this.reward -= 1; msg = `👣 ${name}: шаг, -1 за каждый ход`;
    this.log.unshift(msg); this.render();
    this.steps++;
    if (this.steps > 15) { this.endRound(false,'⌛ Раунд: слишком много шагов!'); }
  },
  endRound(success, msg) {
    this.log.unshift(msg);
    if (success) this.round++;
    this.steps = 0;
    this.placeEntities();
    this.render(msg);
    if (this.round >= this.roundsNeeded) {
      this.finished = true;
      const stars = this.reward >= 40 ? 3 : this.reward >= 25 ? 2 : 1;
      setTimeout(()=>Game.complete(5, stars), 400);
    }
  },
  render(msg) {
    const area = document.getElementById('rl-area');
    let grid = '<div class="rl-grid" style="grid-template-columns:repeat(5,64px)">';
    for (let i=0;i<this.size*this.size;i++) {
      const isA = i===this.agent, isS = i===this.star, isH = i===this.hole;
      grid += `<div class="rl-cell ${isA?'agent':''} ${isS?'star':''} ${isH?'hole':''}">${isA?'🤖':isS?'⭐':isH?'🕳️':''}</div>`;
    }
    grid += '</div>';
    area.innerHTML = `
      <div class="rl-stats">
        <div>🏅 Награда: <b class="${this.reward>=0?'cost-ok':'cost-bad'}">${this.reward}</b></div>
        <div>⭐ Раундов собрано: <b>${this.round}/${this.roundsNeeded}</b></div>
      </div>
      ${grid}
      <div class="tree-controls" style="justify-content:center">
        <button class="btn btn-primary policy-btn" onclick="RLGame.move(-1,0,'Вверх')">⬆️ Вверх</button>
        <button class="btn btn-primary policy-btn" onclick="RLGame.move(1,0,'Вниз')">⬇️ Вниз</button>
        <button class="btn btn-primary policy-btn" onclick="RLGame.move(0,-1,'Влево')">⬅️ Влево</button>
        <button class="btn btn-primary policy-btn" onclick="RLGame.move(0,1,'Вправо')">➡️ Вправо</button>
      </div>
      <p class="nn-hint">Звезда приносит +10, яма −5, каждый лишний шаг −1. Агент «учится», запоминая, какие действия ведут к награде (policy gradient в миниатюре!). Собери звёзды 5 раундов подряд.</p>
      <div class="rl-log">${this.log.slice(0,8).map(l=>`<div>${l}</div>`).join('')}</div>
      ${msg?`<p style="text-align:center;font-weight:700;margin-top:6px">${msg}</p>`:''}
    `;
  }
};

// ---------- старт ----------
Menu.render();
if (location.search.includes('play=1')) {
  // быстрый запуск НейроКвеста из хаба на странице /walk/
  Game.startLevel(1);
} else {
  UI.show('screen-hub');
}
