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

const SCENES = [
    'boot', 'title', 'intro', 'encounter', 'choice',
    'bad', 'error', 'gameover', 'restart',
    'encounter2', 'choice2', 'good', 'normal',
    'final', 'end'
];

let currentScene = -1;

function showScene(name) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const scene = document.getElementById('scene-' + name);
    if (scene) {
        scene.classList.add('active');
    }
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

function addTerminalLine(container, text, className = '') {
    const line = document.createElement('div');
    line.className = 'line ' + className;
    line.textContent = text;
    container.appendChild(line);
    playBootSound();
    return line;
}

async function typeTerminalLine(container, text, speed = 30) {
    const line = document.createElement('div');
    line.className = 'line';
    line.style.opacity = '1';
    container.appendChild(line);
    await typeText(line, text, speed);
    return line;
}

// ===== SCENE: BOOT =====
async function sceneBoot() {
    showScene('boot');
    const log = document.getElementById('boot-log');
    log.innerHTML = '';

    await delay(800);
    await typeTerminalLine(log, 'SYSTEM BOOT', 50);
    playBootSound();
    await delay(600);

    await typeTerminalLine(log, 'INITIALIZING...', 40);
    playBootSound();
    await delay(800);

    await typeTerminalLine(log, 'CHECKING SYSTEM...', 40);
    playBootSound();
    await delay(500);

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
        if (i % 4 === 0) playBootSound();
        await delay(80);
    }

    await delay(400);
    await typeTerminalLine(log, 'SYSTEM READY', 50);
    playConfirmSound();
    await delay(600);

    sceneTitle();
}

// ===== SCENE: TITLE =====
async function sceneTitle() {
    showScene('title');
    const main = document.getElementById('title-main');
    const ver = document.getElementById('title-version');
    const prompt = document.getElementById('title-prompt');

    main.innerHTML = '';
    main.style.opacity = '0';

    await delay(300);

    main.style.opacity = '1';
    main.classList.add('fade-in');

    const lines = ['SMOKING', 'PREVENTION', '.EXE'];
    for (const l of lines) {
        const div = document.createElement('div');
        div.textContent = l;
        main.appendChild(div);
    }

    playConfirmSound();
    await delay(1200);

    ver.textContent = 'VERSION 1.0';
    ver.classList.add('fade-in');
    await delay(1000);

    prompt.textContent = 'PRESS ENTER TO START';
    prompt.style.opacity = '1';
    prompt.classList.add('blink-text');

    await waitForInput();
    playButtonSound();
    sceneIntro();
}

function waitForInput() {
    return new Promise(resolve => {
        function onKey(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                document.removeEventListener('keydown', onKey);
                document.removeEventListener('click', onClick);
                resolve();
            }
        }
        function onClick() {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onClick);
            resolve();
        }
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onClick);
    });
}

// ===== SCENE: INTRO =====
async function sceneIntro() {
    showScene('intro');
    const player = document.getElementById('player-character');
    player.classList.add('walking');
    player.style.left = '15%';
    player.style.transition = 'left 8s linear';

    await delay(500);
    player.style.left = '55%';

    await delay(4000);

    const buildings = document.querySelectorAll('#scene-intro .building');
    buildings.forEach(b => {
        b.style.transition = 'transform 6s linear';
        b.style.transform = 'translateX(-200px)';
    });

    await delay(4500);
    player.classList.remove('walking');

    sceneEncounter();
}

// ===== SCENE: ENCOUNTER =====
async function sceneEncounter() {
    showScene('encounter');
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueText = document.getElementById('dialogue-text');
    const npc = document.getElementById('npc-character');

    npc.style.opacity = '0';
    npc.style.transition = 'opacity 0.6s ease';
    dialogueBox.classList.remove('visible');

    await delay(800);
    npc.style.opacity = '1';
    await delay(1000);

    dialogueBox.classList.add('visible');
    await delay(300);
    await typeText(dialogueText, '"야."', 80);
    playButtonSound();

    await delay(1500);

    dialogueText.textContent = '';
    await typeText(dialogueText, '"이거 한 번 해볼래?"', 60);
    playButtonSound();

    await delay(2000);

    sceneChoice(1);
}

// ===== SCENE: CHOICE =====
async function sceneChoice(round) {
    const sceneId = round === 1 ? 'choice' : 'choice2';
    showScene(sceneId);

    const question = document.getElementById(round === 1 ? 'choice-question' : 'choice2-question');
    const options = document.getElementById(round === 1 ? 'choice-options' : 'choice2-options');

    question.textContent = '';
    question.style.opacity = '0';
    options.style.opacity = '0';

    await delay(500);
    question.style.opacity = '1';
    question.classList.add('fade-in');
    await typeText(question, 'WHAT WILL YOU DO?', 50);

    await delay(800);
    options.style.opacity = '1';
    options.classList.add('fade-in');
    playButtonSound();

    if (round === 1) {
        await delay(2500);

        const btn2 = document.getElementById('choice-2');
        btn2.classList.add('selected');
        playButtonSound();
        await delay(300);
        playConfirmSound();
        await delay(700);

        sceneBadChoice();
    } else {
        await delay(2500);

        const btn1 = document.getElementById('choice2-1');
        btn1.classList.add('selected');
        playButtonSound();
        await delay(300);
        playGoodSound();
        await delay(700);

        sceneGoodChoice();
    }
}

// ===== SCENE: BAD CHOICE =====
async function sceneBadChoice() {
    showScene('bad');
    const msg = document.getElementById('bad-message');
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

    await delay(500);

    msg.style.opacity = '1';
    await typeText(msg, 'PROCESSING...', 40);

    await delay(1000);

    playWarningSound();
    msg.textContent = '';
    msg.style.color = 'var(--warning)';
    await typeText(msg, 'WARNING', 60);

    await delay(800);

    msg.textContent = '';
    await typeText(msg, 'PLAYER STATUS UPDATED', 40);

    await delay(600);

    health.style.width = '70%';
    health.classList.add('warning');
    healthText.textContent = '70%';
    playWarningSound();

    await delay(400);

    stamina.style.width = '70%';
    stamina.classList.add('warning');
    staminaText.textContent = '70%';

    await delay(400);

    focus.style.width = '60%';
    focus.classList.add('warning');
    focusText.textContent = '60%';

    await delay(600);

    status.textContent = 'UNSTABLE';
    status.className = 'status-unstable';

    await delay(1200);

    sceneError();
}

// ===== SCENE: ERROR =====
async function sceneError() {
    showScene('error');
    const container = document.getElementById('error-messages');
    const scene = document.getElementById('scene-error');
    container.innerHTML = '';

    const noise = document.createElement('div');
    noise.className = 'noise-overlay';
    scene.appendChild(noise);

    await delay(400);

    addErrorLine(container, 'WARNING: SYSTEM INSTABILITY', 'warning');
    playWarningSound();
    await delay(1000);

    addErrorLine(container, 'WARNING', 'warning');
    await delay(400);

    addErrorLine(container, 'WARNING', 'warning');
    scene.classList.add('screen-shake');
    playWarningSound();
    await delay(300);
    scene.classList.remove('screen-shake');

    await delay(400);

    addErrorLine(container, 'ERROR', 'error');
    scene.classList.add('screen-flash');
    playErrorSound();
    await delay(300);
    scene.classList.remove('screen-flash');

    await delay(600);

    noise.classList.add('visible');
    scene.classList.add('glitch');
    addErrorLine(container, 'PLAYER DATA CORRUPTED', 'error');
    playErrorSound();

    await delay(300);

    addErrorPopup(scene, 'ERROR: MEMORY OVERFLOW', 120, 300);
    await delay(200);
    addErrorPopup(scene, 'WARNING: DATA LOSS', 400, 180);
    await delay(200);
    addErrorPopup(scene, 'FATAL ERROR', 250, 450);
    playErrorSound();

    await delay(800);

    scene.classList.remove('glitch');
    const critLine = addErrorLine(container, 'CRITICAL SYSTEM ERROR', 'critical');
    critLine.classList.add('text-distort');
    playErrorSound();

    await delay(600);

    scene.classList.add('screen-shake');
    playErrorSound();

    await delay(1000);

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

// ===== SCENE: GAME OVER =====
async function sceneGameOver() {
    showScene('gameover');
    const title = document.getElementById('gameover-title');
    const prompt = document.getElementById('gameover-prompt');
    const options = document.getElementById('gameover-options');

    title.style.opacity = '0';
    prompt.style.opacity = '0';
    options.style.opacity = '0';

    await delay(1000);

    title.textContent = 'GAME OVER';
    title.style.opacity = '1';
    title.classList.add('fade-in');
    playGameOverSound();

    await delay(2000);

    prompt.textContent = 'RESTART?';
    prompt.style.opacity = '1';
    prompt.classList.add('fade-in');

    await delay(800);

    options.style.opacity = '1';
    options.classList.add('fade-in');

    await delay(1500);

    const yesBtn = document.getElementById('restart-yes');
    yesBtn.classList.add('selected');
    playButtonSound();

    await delay(500);
    playConfirmSound();
    await delay(500);

    sceneRestart();
}

// ===== SCENE: RESTART =====
async function sceneRestart() {
    showScene('restart');
    const log = document.getElementById('restart-log');
    log.innerHTML = '';

    await delay(600);
    playRestartSound();

    await typeTerminalLine(log, 'RESTARTING...', 40);
    await delay(800);

    await typeTerminalLine(log, 'LOADING PREVIOUS STATE...', 35);
    await delay(1000);

    await typeTerminalLine(log, 'READY', 60);
    playConfirmSound();
    await delay(800);

    sceneEncounter2();
}

// ===== SCENE: ENCOUNTER 2 =====
async function sceneEncounter2() {
    showScene('encounter2');
    const dialogueBox = document.getElementById('dialogue-box-2');
    const dialogueText = document.getElementById('dialogue-text-2');

    dialogueBox.classList.remove('visible');

    await delay(800);

    dialogueBox.classList.add('visible');
    await delay(300);
    await typeText(dialogueText, '"야."', 80);
    playButtonSound();

    await delay(1500);

    dialogueText.textContent = '';
    await typeText(dialogueText, '"이거 한 번 해볼래?"', 60);
    playButtonSound();

    await delay(2000);

    sceneChoice(2);
}

// ===== SCENE: GOOD CHOICE =====
async function sceneGoodChoice() {
    showScene('good');
    const msg = document.getElementById('good-message');
    const status = document.getElementById('good-status');

    status.textContent = '';
    msg.textContent = '';
    msg.style.opacity = '0';

    await delay(1000);

    msg.style.opacity = '1';
    await typeText(msg, 'CHOICE CONFIRMED', 40);
    playConfirmSound();

    await delay(1200);

    msg.textContent = '';
    msg.innerHTML = `
        <div style="margin-bottom: 24px;">PLAYER STATUS</div>
        <div style="font-size: 18px; line-height: 2.2; text-align: left; display: inline-block;">
            <div>HEALTH</div>
            <div style="color: var(--success);">██████████ 100%</div>
            <div style="margin-top: 8px;">STAMINA</div>
            <div style="color: var(--success);">██████████ 100%</div>
            <div style="margin-top: 8px;">FOCUS</div>
            <div style="color: var(--success);">██████████ 100%</div>
        </div>
    `;

    await delay(1500);

    status.textContent = 'NORMAL';
    status.className = 'status-normal';

    const sysLine = document.createElement('div');
    sysLine.style.marginTop = '30px';
    sysLine.style.fontSize = '22px';
    sysLine.style.letterSpacing = '4px';
    sysLine.innerHTML = 'SYSTEM STATUS <span style="color: var(--success);">NORMAL</span>';
    msg.appendChild(sysLine);
    sysLine.classList.add('fade-in');

    playGoodSound();
    await delay(2000);

    sceneNormal();
}

// ===== SCENE: NORMAL =====
async function sceneNormal() {
    showScene('normal');
    const world = document.getElementById('normal-world');
    const sysDisplay = document.getElementById('normal-system');

    const player = world.querySelector('.character');
    player.classList.add('walking');
    player.style.left = '25%';
    player.style.transition = 'left 5s linear';

    await delay(300);
    player.style.left = '65%';

    await delay(3000);

    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-black';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 2s ease';
    document.getElementById('scene-normal').appendChild(overlay);

    await delay(500);
    overlay.style.opacity = '1';

    await delay(2500);

    sceneFinal();
}

// ===== SCENE: FINAL MESSAGE =====
async function sceneFinal() {
    showScene('final');
    const msg1 = document.getElementById('final-msg-1');
    const msg2 = document.getElementById('final-msg-2');

    msg1.style.opacity = '0';
    msg2.style.opacity = '0';
    msg1.textContent = '';
    msg2.textContent = '';

    await delay(2000);

    msg1.textContent = '게임에서는 다시 시작할 수 있습니다.';
    msg1.style.opacity = '1';
    msg1.classList.add('fade-in-slow');

    await delay(3500);

    msg1.classList.remove('fade-in-slow');
    msg1.classList.add('fade-out-slow');

    await delay(2000);
    msg1.style.opacity = '0';
    msg1.style.display = 'none';

    await delay(1000);

    msg2.textContent = '하지만 현실에는 Restart 버튼이 없습니다.';
    msg2.style.opacity = '1';
    msg2.classList.add('fade-in-slow');

    await delay(5000);

    msg2.classList.remove('fade-in-slow');
    msg2.classList.add('fade-out-slow');

    await delay(2500);

    sceneEnd();
}

// ===== SCENE: END =====
async function sceneEnd() {
    showScene('end');
    const title = document.getElementById('end-title');
    const label = document.getElementById('end-label');

    title.style.opacity = '0';
    label.style.opacity = '0';

    await delay(1500);

    title.textContent = 'SMOKING_PREVENTION.EXE';
    title.style.opacity = '1';
    title.classList.add('fade-in-slow');

    await delay(2000);

    label.textContent = 'END';
    label.style.opacity = '1';
    label.classList.add('fade-in-slow');

    await delay(5000);
}

// ===== START =====
function startGame() {
    document.addEventListener('keydown', () => ensureAudio(), { once: true });
    document.addEventListener('click', () => ensureAudio(), { once: true });
    sceneBoot();
}

document.addEventListener('DOMContentLoaded', startGame);
