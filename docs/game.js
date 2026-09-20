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
function playWarningSound() {
    playTone(300, 0.3, 'sawtooth', 0.08);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.06), 150);
}
function playErrorSound() {
    playTone(150, 0.4, 'square', 0.1);
    setTimeout(() => playTone(100, 0.5, 'square', 0.08), 200);
}
function playGameOverSound() {
    playTone(400, 0.6, 'sine', 0.06);
    setTimeout(() => playTone(300, 0.6, 'sine', 0.05), 300);
    setTimeout(() => playTone(200, 0.8, 'sine', 0.04), 600);
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

function addTerminalLine(container, text, className = '') {
    const line = document.createElement('div');
    line.className = 'line ' + className;
    line.textContent = text;
    container.appendChild(line);
    playBootSound();
    return line;
}

// ===== SCENE: HOOK (0:00~0:05) =====
async function sceneHook() {
    showScene('hook');
    const text = document.getElementById('hook-text');
    text.style.opacity = '0';

    await delay(800);

    text.style.opacity = '1';
    text.classList.add('fade-in-slow');
    await typeText(text, '당신에게 선택권이 주어진다면?', 70);

    await delay(2500);

    text.classList.remove('fade-in-slow');
    text.classList.add('fade-out');

    await delay(1000);

    sceneBoot();
}

// ===== SCENE: BOOT (0:05~0:12) =====
async function sceneBoot() {
    showScene('boot');
    const log = document.getElementById('boot-log');
    log.innerHTML = '';

    await delay(300);
    await typeTerminalLine(log, 'SYSTEM BOOT', 40);
    playBootSound();
    await delay(300);

    await typeTerminalLine(log, 'LOADING: SMOKING_PREVENTION.EXE', 25);
    playBootSound();
    await delay(300);

    await typeTerminalLine(log, 'MODULE: 흡연예방 시뮬레이션 v1.0', 25);
    playBootSound();
    await delay(300);

    const progressLine = document.createElement('div');
    progressLine.className = 'line boot-progress';
    progressLine.style.opacity = '1';
    log.appendChild(progressLine);

    const total = 20;
    for (let i = 0; i <= total; i++) {
        const filled = '█'.repeat(i);
        const empty = '░'.repeat(total - i);
        const pct = Math.round((i / total) * 100);
        progressLine.textContent = `[${filled}${empty}] ${pct}%`;
        if (i % 5 === 0) playBootSound();
        await delay(40);
    }

    await delay(200);
    await typeTerminalLine(log, 'SYSTEM READY', 40);
    playConfirmSound();
    await delay(400);

    // Title flash (no wait for input)
    await typeTerminalLine(log, '', 0);
    const titleLine = document.createElement('div');
    titleLine.className = 'line boot-title';
    titleLine.style.opacity = '1';
    titleLine.style.fontSize = '28px';
    titleLine.style.letterSpacing = '6px';
    titleLine.style.marginTop = '20px';
    titleLine.style.color = 'var(--highlight)';
    titleLine.textContent = '— 흡연예방 시뮬레이션 —';
    log.appendChild(titleLine);
    playConfirmSound();

    await delay(1500);

    sceneEncounter();
}

// ===== SCENE: ENCOUNTER (0:12~0:35) =====
async function sceneEncounter() {
    showScene('encounter');
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueText = document.getElementById('dialogue-text');
    const npc = document.getElementById('npc-character');
    const alert = document.getElementById('system-alert');
    const smoke = document.getElementById('smoke-particles');

    npc.style.opacity = '0';
    npc.style.transition = 'opacity 0.6s ease';
    dialogueBox.classList.remove('visible');
    alert.className = 'system-alert';
    alert.textContent = '';

    for (let i = 0; i < 4; i++) {
        const p = document.createElement('div');
        p.className = 'smoke-particle';
        smoke.appendChild(p);
    }

    await delay(600);
    npc.style.opacity = '1';
    await delay(400);

    smoke.classList.add('visible');
    await delay(400);

    dialogueBox.classList.add('visible');
    await delay(200);
    await typeText(dialogueText, '"야."', 80);
    playButtonSound();

    await delay(1000);

    dialogueText.textContent = '';
    await typeText(dialogueText, '"담배 한 대 피워볼래?"', 50);
    playButtonSound();

    await delay(600);

    alert.textContent = '⚠ 흡연 권유 감지';
    alert.classList.add('warning-alert');
    playWarningSound();

    await delay(1500);

    sceneChoice();
}

// ===== SCENE: CHOICE =====
async function sceneChoice() {
    showScene('choice');

    const ctx = document.getElementById('choice-context');
    const question = document.getElementById('choice-question');
    const options = document.getElementById('choice-options');

    ctx.textContent = '';
    ctx.style.opacity = '0';
    question.textContent = '';
    question.style.opacity = '0';
    options.style.opacity = '0';

    await delay(300);
    ctx.textContent = 'NPC가 담배를 권유하고 있습니다';
    ctx.style.opacity = '1';
    ctx.classList.add('fade-in');

    await delay(500);
    question.style.opacity = '1';
    question.classList.add('fade-in');
    await typeText(question, 'WHAT WILL YOU DO?', 45);

    await delay(600);
    options.style.opacity = '1';
    options.classList.add('fade-in');
    playButtonSound();

    await delay(2000);
    const btn2 = document.getElementById('choice-2');
    btn2.classList.add('selected');
    playButtonSound();
    await delay(300);
    playConfirmSound();
    await delay(500);
    sceneBadChoice();
}

// ===== SCENE: BAD CHOICE (0:35~0:50) =====
async function sceneBadChoice() {
    showScene('bad');
    const msg = document.getElementById('bad-message');
    const sub = document.getElementById('bad-submessage');
    const status = document.getElementById('bad-status');
    const health = document.getElementById('bad-health');
    const stamina = document.getElementById('bad-stamina');
    const focus = document.getElementById('bad-focus');
    const healthText = document.getElementById('bad-health-text');
    const staminaText = document.getElementById('bad-stamina-text');
    const focusText = document.getElementById('bad-focus-text');

    status.textContent = 'NORMAL';
    status.className = 'status-normal';
    msg.textContent = '';
    msg.style.opacity = '0';
    sub.textContent = '';
    sub.classList.remove('visible');

    await delay(400);
    msg.style.opacity = '1';
    await typeText(msg, 'PROCESSING...', 35);

    await delay(500);

    playWarningSound();
    msg.textContent = '';
    msg.style.color = 'var(--warning)';
    await typeText(msg, 'WARNING: 흡연 감지', 45);

    await delay(400);

    sub.textContent = '플레이어가 담배를 피웠습니다';
    sub.classList.add('visible');

    await delay(500);

    msg.textContent = '';
    await typeText(msg, 'PLAYER STATUS UPDATED', 35);

    await delay(400);

    health.style.width = '65%';
    health.classList.add('warning');
    healthText.textContent = '65%';
    playWarningSound();

    await delay(300);

    stamina.style.width = '70%';
    stamina.classList.add('warning');
    staminaText.textContent = '70%';

    await delay(300);

    focus.style.width = '55%';
    focus.classList.add('warning');
    focusText.textContent = '55%';

    await delay(300);

    const hud = document.getElementById('bad-hud');
    const meter = document.createElement('div');
    meter.className = 'addiction-meter';
    meter.innerHTML = '<span class="addiction-label">니코틴 의존도</span><div class="addiction-bar"><div class="addiction-fill"></div></div>';
    hud.querySelector('.hud-right').appendChild(meter);
    await delay(100);
    meter.classList.add('visible');
    await delay(100);
    meter.querySelector('.addiction-fill').style.width = '40%';

    await delay(400);

    status.textContent = 'UNSTABLE';
    status.className = 'status-unstable';

    await delay(800);

    sceneError();
}

// ===== SCENE: ERROR (0:50~0:59) =====
async function sceneError() {
    showScene('error');
    const container = document.getElementById('error-messages');
    const scene = document.getElementById('scene-error');
    container.innerHTML = '';

    const noise = document.createElement('div');
    noise.className = 'noise-overlay';
    scene.appendChild(noise);

    await delay(300);

    addErrorLine(container, 'WARNING: 흡연으로 인한 시스템 불안정', 'warning');
    playWarningSound();
    await delay(500);

    addErrorLine(container, '▶ 폐 기능 저하 감지', 'smoking-warning');
    await delay(400);

    addErrorLine(container, '▶ 니코틴 중독 진행 중...', 'smoking-warning');
    scene.classList.add('screen-shake');
    playWarningSound();
    await delay(200);
    scene.classList.remove('screen-shake');

    await delay(400);

    addErrorLine(container, 'ERROR: 체력 데이터 손상', 'error');
    scene.classList.add('screen-flash');
    playErrorSound();
    await delay(200);
    scene.classList.remove('screen-flash');

    await delay(300);

    addErrorLine(container, '▶ 집중력 급격히 저하', 'smoking-warning');
    await delay(300);

    noise.classList.add('visible');
    scene.classList.add('glitch');
    addErrorLine(container, 'ERROR: PLAYER DATA CORRUPTED', 'error');
    playErrorSound();

    await delay(200);

    addErrorPopup(scene, '⚠ 폐활량 30% 이하', 100, 320);
    await delay(150);
    addErrorPopup(scene, '⚠ 니코틴 의존도 상승', 420, 200);
    await delay(150);
    addErrorPopup(scene, 'FATAL: 건강 시스템 붕괴', 260, 460);
    playErrorSound();

    await delay(500);

    scene.classList.remove('glitch');
    const critLine = addErrorLine(container, 'CRITICAL: 흡연으로 인한 시스템 완전 손상', 'critical');
    critLine.classList.add('text-distort');
    playErrorSound();

    await delay(400);

    scene.classList.add('screen-shake');
    playErrorSound();

    await delay(600);

    scene.classList.remove('screen-shake');
    noise.classList.remove('visible');

    sceneGameOver();
}

function addErrorLine(container, text, className) {
    const line = document.createElement('div');
    line.className = 'error-line ' + className;
    line.textContent = text;
    container.appendChild(line);
    return line;
}

function addErrorPopup(parent, text, x, y) {
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.textContent = text;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    parent.appendChild(popup);
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.3s';
        setTimeout(() => popup.remove(), 300);
    }, 1500);
}

// ===== SCENE: GAME OVER (0:59~1:05) =====
async function sceneGameOver() {
    showScene('gameover');
    const title = document.getElementById('gameover-title');
    const cause = document.getElementById('gameover-cause');

    title.style.opacity = '0';
    cause.style.opacity = '0';

    await delay(800);

    title.textContent = 'GAME OVER';
    title.style.opacity = '1';
    title.classList.add('fade-in');
    playGameOverSound();

    await delay(1500);

    cause.textContent = '흡연으로 인한 시스템 손상';
    cause.style.opacity = '1';
    cause.classList.add('fade-in');

    await delay(2500);

    sceneReality();
}

// ===== SCENE: REALITY (1:05~1:12) =====
async function sceneReality() {
    showScene('reality');
    const msg1 = document.getElementById('reality-msg-1');
    const msg2 = document.getElementById('reality-msg-2');

    msg1.style.opacity = '0';
    msg2.style.opacity = '0';
    msg1.textContent = '';
    msg2.textContent = '';

    await delay(1200);

    msg1.textContent = '하지만 현실에서는';
    msg1.style.opacity = '1';
    msg1.classList.add('fade-in-slow');

    await delay(2500);

    msg1.classList.add('fade-out');
    await delay(800);
    msg1.style.opacity = '0';

    await delay(500);

    msg2.textContent = 'GAME OVER 후 다시 시작할 수 없습니다.';
    msg2.style.opacity = '1';
    msg2.classList.add('fade-in-slow');

    await delay(3000);

    msg2.classList.add('fade-out');
    await delay(800);

    sceneFinal();
}

// ===== SCENE: FINAL (1:12~1:19) =====
async function sceneFinal() {
    showScene('final');
    const msg = document.getElementById('final-msg');
    const label = document.getElementById('final-label');

    msg.style.opacity = '0';
    label.style.opacity = '0';
    msg.textContent = '';
    label.textContent = '';

    await delay(800);

    msg.textContent = '담배 대신, 건강한 내일을 선택하세요.';
    msg.style.opacity = '1';
    msg.classList.add('fade-in-slow');

    await delay(3000);

    label.textContent = '흡연예방';
    label.style.opacity = '1';
    label.classList.add('fade-in-slow');

    await delay(4000);
}

// ===== START =====
function startGame() {
    document.addEventListener('keydown', () => ensureAudio(), { once: true });
    document.addEventListener('click', () => ensureAudio(), { once: true });
    sceneHook();
}

document.addEventListener('DOMContentLoaded', startGame);
