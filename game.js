const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, duration, type = 'square', volume = 0.08) {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playBootSound() { playTone(800, 0.08, 'square', 0.05); }
function playConfirmSound() { playTone(1200, 0.1, 'sine', 0.06); }
function playButtonSound() { playTone(600, 0.06, 'square', 0.04); }
function playScanSound() { playTone(900, 0.5, 'sine', 0.035); }
function playWarningSound() {
    playTone(300, 0.3, 'sawtooth', 0.08);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.06), 150);
}
function playDamageSound() {
    playTone(180, 0.35, 'square', 0.09);
    setTimeout(() => playTone(120, 0.45, 'square', 0.07), 180);
}
function playGameOverSound() {
    playTone(400, 0.6, 'sine', 0.06);
    setTimeout(() => playTone(300, 0.6, 'sine', 0.05), 300);
    setTimeout(() => playTone(200, 0.8, 'sine', 0.04), 600);
}
function playRestartSound() {
    playTone(400, 0.1, 'sine', 0.05);
    setTimeout(() => playTone(600, 0.1, 'sine', 0.05), 100);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.06), 200);
}
function playGoodSound() {
    playTone(523, 0.15, 'sine', 0.06);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.06), 150);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.07), 300);
}

function showScene(name) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const scene = document.getElementById('scene-' + name);
    if (scene) scene.classList.add('active');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function typeText(container, text, speed = 40) {
    return new Promise(resolve => {
        let i = 0;
        container.textContent = '';
        const interval = setInterval(() => {
            container.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

async function typeTerminalLine(container, text, speed = 30) {
    const line = document.createElement('div');
    line.className = 'line';
    line.style.opacity = '1';
    container.appendChild(line);
    await typeText(line, text, speed);
    return line;
}

function animateNumber(el, from, to, duration, suffix = '%') {
    return new Promise(resolve => {
        const start = performance.now();
        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(from + (to - from) * t) + suffix;
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
        }
        requestAnimationFrame(tick);
    });
}

// ===== SCENE: HOOK =====
async function sceneHook() {
    showScene('hook');
    const text = document.getElementById('hook-text');
    text.style.opacity = '0';
    text.classList.remove('fade-out');

    await delay(600);

    text.style.opacity = '1';
    text.classList.add('fade-in-slow');
    await typeText(text, '담배 한 대가 몸에 무슨 일을 할까요?', 55);

    await delay(1800);

    text.classList.remove('fade-in-slow');
    text.classList.add('fade-out');

    await delay(800);

    sceneBoot();
}

// ===== SCENE: BOOT =====
async function sceneBoot() {
    showScene('boot');
    const log = document.getElementById('boot-log');
    log.innerHTML = '';

    await delay(250);
    await typeTerminalLine(log, 'SYSTEM BOOT', 35);
    playBootSound();
    await delay(180);

    await typeTerminalLine(log, 'LOADING: SMOKING_PREVENTION.EXE', 18);
    playBootSound();
    await delay(180);

    await typeTerminalLine(log, 'MODULE: 흡연예방 시뮬레이션 v1.0', 18);
    playBootSound();
    await delay(180);

    const progressLine = document.createElement('div');
    progressLine.className = 'line boot-progress';
    progressLine.style.opacity = '1';
    log.appendChild(progressLine);

    const total = 20;
    for (let i = 0; i <= total; i++) {
        progressLine.textContent = `[${'█'.repeat(i)}${'░'.repeat(total - i)}] ${Math.round((i / total) * 100)}%`;
        if (i % 5 === 0) playBootSound();
        await delay(25);
    }

    await delay(150);
    await typeTerminalLine(log, 'SYSTEM READY', 35);
    playConfirmSound();
    await delay(250);

    const titleLine = document.createElement('div');
    titleLine.className = 'line boot-title';
    titleLine.style.opacity = '1';
    titleLine.textContent = '— 흡연예방 시뮬레이션 —';
    log.appendChild(titleLine);
    playConfirmSound();

    await delay(900);

    sceneEncounter();
}

// ===== SCENE: ENCOUNTER =====
async function sceneEncounter() {
    showScene('encounter');
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueText = document.getElementById('dialogue-text');
    const npc = document.getElementById('npc-character');
    const alert = document.getElementById('system-alert');
    const smoke = document.getElementById('smoke-particles');

    npc.style.opacity = '0';
    npc.style.transition = 'opacity 0.5s ease';
    dialogueBox.classList.remove('visible');
    alert.className = 'system-alert';
    alert.textContent = '';
    smoke.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const p = document.createElement('div');
        p.className = 'smoke-particle';
        smoke.appendChild(p);
    }

    await delay(400);
    npc.style.opacity = '1';
    await delay(300);
    smoke.classList.add('visible');
    await delay(250);

    dialogueBox.classList.add('visible');
    await delay(150);
    await typeText(dialogueText, '"야, 한 대 피워볼래?"', 45);
    playButtonSound();

    await delay(600);

    alert.textContent = '⚠ 흡연 권유 감지';
    alert.classList.add('warning-alert');
    playWarningSound();

    await delay(1100);

    sceneChoice(1);
}

// ===== SCENE: CHOICE =====
async function sceneChoice(round) {
    showScene(round === 1 ? 'choice' : 'choice2');

    const p = round === 1 ? 'choice' : 'choice2';
    const ctx = document.getElementById(p + '-context');
    const question = document.getElementById(p + '-question');
    const options = document.getElementById(p + '-options');

    ctx.textContent = '';
    ctx.style.opacity = '0';
    question.textContent = '';
    question.style.opacity = '0';
    options.style.opacity = '0';

    await delay(250);
    ctx.textContent = round === 1
        ? 'NPC가 담배를 권유하고 있습니다'
        : '같은 상황, 다시 한 번';
    ctx.style.opacity = '1';
    ctx.classList.add('fade-in');

    await delay(350);
    question.style.opacity = '1';
    question.classList.add('fade-in');
    await typeText(question, 'WHAT WILL YOU DO?', 35);

    await delay(400);
    options.style.opacity = '1';
    options.classList.add('fade-in');
    playButtonSound();

    await delay(round === 1 ? 1500 : 1300);

    if (round === 1) {
        const btn = document.getElementById('choice-2');
        btn.classList.add('selected');
        playButtonSound();
        await delay(250);
        playWarningSound();
        await delay(500);
        sceneDamage();
    } else {
        const btn = document.getElementById('choice2-1');
        btn.classList.add('selected');
        playButtonSound();
        await delay(250);
        playGoodSound();
        await delay(500);
        sceneGoodChoice();
    }
}

// ===== BODY DAMAGE DATA =====
const DAMAGE_STEPS = [
    {
        organ: 'organ-lungs',
        name: '폐',
        sub: 'LUNGS',
        facts: [
            '담배 연기 속 타르가 폐에 쌓입니다',
            '산소를 교환하는 폐포가 파괴됩니다',
            '폐암 위험 — 비흡연자의 최대 15배'
        ],
        meterLabel: '폐 기능',
        meterTo: 32,
        tar: true
    },
    {
        organ: 'organ-brain',
        name: '뇌',
        sub: 'BRAIN',
        facts: [
            '청소년의 뇌는 25세까지 자랍니다',
            '니코틴이 그 발달을 방해합니다',
            '기억력 · 집중력 · 판단력 저하'
        ],
        meterLabel: '뇌 발달',
        meterTo: 71
    },
    {
        organ: 'organ-heart',
        name: '심장과 혈관',
        sub: 'HEART & VESSELS',
        facts: [
            '혈관이 좁아지고 딱딱해집니다',
            '심근경색 · 뇌졸중 위험 2~4배'
        ],
        meterLabel: '혈관 건강',
        meterTo: 45
    }
];

// ===== SCENE: BODY DAMAGE SCAN =====
async function sceneDamage() {
    showScene('damage');
    const scene = document.getElementById('scene-damage');
    const stepLabel = document.getElementById('damage-step');
    const organName = document.getElementById('damage-organ');
    const facts = document.getElementById('damage-facts');
    const meters = document.getElementById('damage-meters');
    const summary = document.getElementById('damage-summary');
    const status = document.getElementById('damage-status');
    const scanLine = document.getElementById('scan-line');
    const nicotineFill = document.getElementById('nicotine-fill');
    const nicotineText = document.getElementById('nicotine-text');

    // reset
    stepLabel.textContent = '';
    organName.textContent = '';
    facts.innerHTML = '';
    meters.innerHTML = '';
    summary.textContent = '';
    summary.classList.remove('visible');
    status.textContent = 'NORMAL';
    status.className = 'status-normal';
    nicotineFill.style.width = '0%';
    nicotineText.textContent = '0%';
    document.querySelectorAll('#body-svg .organ').forEach(o => o.classList.remove('active', 'damaged'));
    document.getElementById('tar-blobs').classList.remove('visible');

    await delay(300);

    stepLabel.textContent = 'WARNING: 흡연 감지';
    stepLabel.className = 'damage-step-label warn';
    playWarningSound();

    await delay(700);

    stepLabel.textContent = 'SCANNING BODY...';
    stepLabel.className = 'damage-step-label';
    scanLine.classList.add('scanning');
    playScanSound();

    await delay(1600);
    scanLine.classList.remove('scanning');

    status.textContent = 'DAMAGE DETECTED';
    status.className = 'status-unstable';

    // run each organ step
    for (let i = 0; i < DAMAGE_STEPS.length; i++) {
        await runDamageStep(DAMAGE_STEPS[i], i, scene, stepLabel, organName, facts, meters);
    }

    // nicotine dependency
    stepLabel.textContent = 'ADDICTION';
    organName.textContent = '니코틴 의존';
    organName.setAttribute('data-sub', 'NICOTINE DEPENDENCE');
    facts.innerHTML = '';
    addFact(facts, '스스로 멈추기 어려워집니다');
    nicotineFill.style.width = '78%';
    animateNumber(nicotineText, 0, 78, 1200);
    playDamageSound();
    status.textContent = 'CRITICAL';
    status.className = 'status-critical';

    await delay(1500);

    summary.textContent = '기대 수명 평균 10년 감소';
    summary.classList.add('visible');
    playDamageSound();
    scene.classList.add('screen-shake');
    await delay(400);
    scene.classList.remove('screen-shake');

    await delay(1600);

    sceneGameOver();
}

async function runDamageStep(step, index, scene, stepLabel, organName, facts, meters) {
    const organ = document.getElementById(step.organ);

    stepLabel.textContent = 'PLAYER STATUS UPDATED';
    stepLabel.className = 'damage-step-label';

    organ.classList.add('active');
    organName.textContent = step.name;
    organName.setAttribute('data-sub', step.sub);
    facts.innerHTML = '';
    playScanSound();

    await delay(500);

    for (const fact of step.facts) {
        addFact(facts, fact);
        playButtonSound();
        await delay(1000);
    }

    // apply damage
    organ.classList.add('damaged');
    if (step.tar) document.getElementById('tar-blobs').classList.add('visible');
    playDamageSound();
    scene.classList.add('screen-shake');
    await delay(300);
    scene.classList.remove('screen-shake');

    // meter
    const meter = document.createElement('div');
    meter.className = 'dmg-meter';
    meter.innerHTML = `
        <div class="dmg-meter-head">
            <span>${step.meterLabel}</span>
            <span class="dmg-meter-val">100%</span>
        </div>
        <div class="dmg-meter-bar"><div class="dmg-meter-fill"></div></div>
    `;
    meters.appendChild(meter);
    await delay(60);
    meter.classList.add('visible');
    const fill = meter.querySelector('.dmg-meter-fill');
    const val = meter.querySelector('.dmg-meter-val');
    fill.style.width = step.meterTo + '%';
    await animateNumber(val, 100, step.meterTo, 1100);

    await delay(700);

    organ.classList.remove('active');
}

function addFact(container, text) {
    const line = document.createElement('div');
    line.className = 'damage-fact';
    line.textContent = text;
    container.appendChild(line);
    requestAnimationFrame(() => line.classList.add('visible'));
    return line;
}

// ===== SCENE: GAME OVER =====
async function sceneGameOver() {
    showScene('gameover');
    const title = document.getElementById('gameover-title');
    const cause = document.getElementById('gameover-cause');
    const prompt = document.getElementById('gameover-prompt');
    const options = document.getElementById('gameover-options');

    title.style.opacity = '0';
    cause.style.opacity = '0';
    prompt.style.opacity = '0';
    options.style.opacity = '0';
    document.getElementById('restart-yes').classList.remove('selected');

    await delay(500);

    title.textContent = 'GAME OVER';
    title.style.opacity = '1';
    title.classList.add('fade-in');
    playGameOverSound();

    await delay(1100);

    cause.textContent = '원인: 흡연 — 폐 · 뇌 · 혈관 손상';
    cause.style.opacity = '1';
    cause.classList.add('fade-in');

    await delay(900);

    prompt.textContent = 'RESTART?';
    prompt.style.opacity = '1';
    prompt.classList.add('fade-in');

    await delay(400);

    options.style.opacity = '1';
    options.classList.add('fade-in');

    await delay(900);

    document.getElementById('restart-yes').classList.add('selected');
    playButtonSound();
    await delay(250);
    playConfirmSound();
    await delay(350);

    sceneRestart();
}

// ===== SCENE: RESTART =====
async function sceneRestart() {
    showScene('restart');
    const log = document.getElementById('restart-log');
    log.innerHTML = '';

    await delay(300);
    playRestartSound();

    await typeTerminalLine(log, 'RESTARTING...', 30);
    await delay(250);

    await typeTerminalLine(log, '손상 데이터 초기화', 25);
    await delay(250);

    await typeTerminalLine(log, '플레이어 상태 복구 완료', 25);
    await delay(250);

    await typeTerminalLine(log, 'READY', 45);
    playConfirmSound();
    await delay(500);

    sceneEncounter2();
}

// ===== SCENE: ENCOUNTER 2 =====
async function sceneEncounter2() {
    showScene('encounter2');
    const dialogueBox = document.getElementById('dialogue-box-2');
    const dialogueText = document.getElementById('dialogue-text-2');
    const alert = document.getElementById('system-alert-2');

    dialogueBox.classList.remove('visible');
    alert.className = 'system-alert';
    alert.textContent = '';

    await delay(400);

    dialogueBox.classList.add('visible');
    await delay(150);
    await typeText(dialogueText, '"야, 한 대 피워볼래?"', 45);
    playButtonSound();

    await delay(500);

    alert.textContent = '⚠ 흡연 권유 감지';
    alert.classList.add('warning-alert');
    playWarningSound();

    await delay(900);

    sceneChoice(2);
}

// ===== SCENE: GOOD CHOICE =====
async function sceneGoodChoice() {
    showScene('good');
    const msg = document.getElementById('good-message');
    const stats = document.getElementById('good-stats');
    const status = document.getElementById('good-status');

    status.textContent = 'NORMAL';
    status.className = 'status-normal';
    msg.textContent = '';
    msg.style.opacity = '0';
    stats.innerHTML = '';

    await delay(350);

    msg.style.opacity = '1';
    await typeText(msg, '흡연 거절 완료', 35);
    playConfirmSound();

    await delay(500);

    const rows = [
        ['폐 기능', '100%'],
        ['뇌 발달', '100%'],
        ['혈관 건강', '100%'],
        ['니코틴 의존', '0%']
    ];

    for (const [label, value] of rows) {
        const row = document.createElement('div');
        row.className = 'good-stat-row';
        row.innerHTML = `<span class="good-stat-label">${label}</span><span class="good-stat-value">${value}</span>`;
        stats.appendChild(row);
        requestAnimationFrame(() => row.classList.add('visible'));
        playButtonSound();
        await delay(280);
    }

    await delay(400);
    playGoodSound();

    await delay(1200);

    sceneFinal();
}

// ===== SCENE: GAME VS REALITY =====
async function sceneFinal() {
    showScene('final');
    const msg1 = document.getElementById('final-msg-1');
    const msg2 = document.getElementById('final-msg-2');

    msg1.style.opacity = '0';
    msg2.style.opacity = '0';
    msg1.textContent = '';
    msg2.textContent = '';
    msg1.className = 'final-message';
    msg2.className = 'final-message final-message-strong';

    await delay(900);

    msg1.textContent = '게임에서는 다시 선택할 수 있습니다.';
    msg1.style.opacity = '1';
    msg1.classList.add('fade-in-slow');

    await delay(2600);

    msg1.classList.add('fade-out');
    await delay(900);
    msg1.style.opacity = '0';

    await delay(600);

    msg2.textContent = '하지만 망가진 폐와 뇌는 되돌릴 수 없습니다.';
    msg2.style.opacity = '1';
    msg2.classList.add('fade-in-slow');

    await delay(3000);

    msg2.classList.add('fade-out');
    await delay(900);

    sceneEnd();
}

// ===== SCENE: END =====
async function sceneEnd() {
    showScene('end');
    const msg = document.getElementById('end-msg');
    const label = document.getElementById('end-label');

    msg.style.opacity = '0';
    label.style.opacity = '0';
    msg.textContent = '';
    label.textContent = '';

    await delay(500);

    msg.textContent = '담배 대신, 건강한 내일을 선택하세요.';
    msg.style.opacity = '1';
    msg.classList.add('fade-in-slow');

    await delay(2200);

    label.textContent = '흡연예방';
    label.style.opacity = '1';
    label.classList.add('fade-in-slow');

    await delay(3500);
}

// ===== START =====
function startGame() {
    document.addEventListener('keydown', () => ensureAudio(), { once: true });
    document.addEventListener('click', () => ensureAudio(), { once: true });
    sceneHook();
}

document.addEventListener('DOMContentLoaded', startGame);
