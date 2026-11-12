// HỆ THỐNG ÂM THANH TỔNG HỢP BẰNG WEB AUDIO API
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playSlash() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
    }

    playCrit() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        [523.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.35);

            gain.gain.setValueAtTime(0.25, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.36);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + 0.38);
        });
    }

    playFireball() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    playHurt() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.25);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
    }

    playDodge() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
    }

    playEnd(isWin) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = isWin ? [523.25, 659.25, 783.99, 1046.5] : [392.0, 349.23, 311.13, 261.63];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = isWin ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);

            gain.gain.setValueAtTime(0.25, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.42);
        });
    }
}

const sfx = new SoundFX();

// BIẾN CHỈ SỐ NHÂN VẬT & RỒNG
const defaultName = "Nguyễn Đặng Anh Thư";
const MSSV = "31241026521";

let hero = {
    name: defaultName,
    level: 5,
    xp: 0,
    skillPoints: 5,
    phancap: "",
    strength: 0,
    agility: 0,
    intel: 0,
    maxHealth: 105,
    health: 105
};

let dragon = {
    maxHealth: 600,
    health: 600,
    str: 100,
    agi: 15,
    int: 80
};

let turnCount = 0;
let isBusy = false;
let autoTimer = null;
let gameContinue = true;

const setupModal = document.getElementById('setup-modal');
const arenaContainer = document.getElementById('arena-container');
const resultModal = document.getElementById('result-modal');
const battleLog = document.getElementById('battle-log');
const battlefield = document.getElementById('battlefield');

const heroImg = document.getElementById('hero-img');
const dragonSvg = document.getElementById('dragon-svg');
const heroEffect = document.getElementById('hero-effect');
const dragonEffect = document.getElementById('dragon-effect');
const heroFloat = document.getElementById('hero-float');
const dragonFloat = document.getElementById('dragon-float');

const btnNextTurn = document.getElementById('btn-next-turn');
const btnAutoBattle = document.getElementById('btn-auto-battle');
const turnIndicator = document.getElementById('turn-indicator');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function addLog(text, type = 'log-system') {
    const div = document.createElement('div');
    div.className = `log-item ${type}`;
    div.innerHTML = text;
    battleLog.appendChild(div);
    battleLog.scrollTop = battleLog.scrollHeight;
}

function showFloatingText(container, text, styleClass) {
    const el = document.createElement('div');
    el.className = `float-dmg ${styleClass}`;
    el.textContent = text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}

function triggerVisualFX(container, fxClass) {
    const fx = document.createElement('div');
    fx.className = fxClass;
    container.appendChild(fx);
    setTimeout(() => fx.remove(), 600);
}

function triggerScreenShake() {
    battlefield.classList.remove('screen-shake');
    void battlefield.offsetWidth;
    battlefield.classList.add('screen-shake');
}

function updateUI() {
    document.getElementById('display-name').textContent = hero.name;
    document.getElementById('display-meta').textContent = `MSSV: ${MSSV} | Phân cấp: ${hero.phancap}`;

    document.getElementById('stat-str').textContent = hero.strength;
    document.getElementById('stat-agi').textContent = hero.agility;
    document.getElementById('stat-int').textContent = hero.intel;

    const currentHeroHp = Math.max(0, hero.health);
    const currentDragonHp = Math.max(0, dragon.health);

    document.getElementById('hero-hp-text').textContent = `${currentHeroHp} / ${hero.maxHealth}`;
    document.getElementById('hero-hp-bar').style.width = `${(currentHeroHp / hero.maxHealth) * 100}%`;

    document.getElementById('dragon-hp-text').textContent = `${currentDragonHp} / ${dragon.maxHealth}`;
    document.getElementById('dragon-hp-bar').style.width = `${(currentDragonHp / dragon.maxHealth) * 100}%`;
}

function initGame() {
    sfx.init();
    const inputName = document.getElementById('input-name').value.trim();
    const chonVai = document.querySelector('input[name="heroClass"]:checked').value;

    let level = 1;
    let xp = 0;
    let skillPoints = 5;
    level++;
    xp = 150 * (level - 1) + 200;
    skillPoints = skillPoints + xp / 10;

    let strength = 0.6 * skillPoints + 0.1 * xp;
    let agility = 0.2 * skillPoints + 0.2 * xp;
    let intel = 0.6 * skillPoints + 10 * level;

    level = 3;
    xp = xp + 300;

    battleLog.innerHTML = '';
    addLog(`Tôi tên là <b>${defaultName}</b> – MSSV: ${MSSV} quyết tâm trở thành Anh Hùng JS!`);

    if (inputName === defaultName) {
        intel = intel + 5;
        addLog(`✅ Chính xác! Bạn nhập đúng tên "${inputName}", trí nhớ rất tốt! (<b>Intel +5</b>)`, 'log-system');
    } else {
        intel = intel - 5;
        addLog(`❌ Tệ thật! Tên "${defaultName}" mà nhập thành "${inputName || 'trống'}"?! (<b>Intel -5</b>)`, 'log-dragon');
    }

    let phancap = "";
    switch (chonVai) {
        case "a":
            phancap = "Chiến Binh";
            strength = strength + 15;
            agility = agility + 10;
            intel = intel - 5;
            break;
        case "b":
            phancap = "Sát Thủ";
            strength = strength - 15;
            agility = agility + 10;
            intel = intel - 5;
            break;
        case "c":
            phancap = "Thợ Săn";
            strength = strength + 15;
            intel = intel + 15;
            break;
    }

    level = 4;
    xp = xp + 700;
    level = 5;
    const health = level + 100;

    hero = {
        name: inputName || defaultName,
        level,
        xp,
        skillPoints,
        phancap,
        strength,
        agility,
        intel,
        maxHealth: health,
        health: health
    };

    dragon = {
        maxHealth: 600,
        health: 600,
        str: 100,
        agi: 15,
        int: 80
    };

    turnCount = 0;
    gameContinue = true;
    isBusy = false;
    stopAutoBattle();

    btnNextTurn.disabled = false;
    btnAutoBattle.disabled = false;
    turnIndicator.textContent = "SẴN SÀNG CHIẾN ĐẤU";

    setupModal.classList.add('hidden');
    resultModal.classList.add('hidden');
    arenaContainer.classList.remove('hidden');

    addLog(`⚔️ Bạn chọn phân cấp <b>${phancap}</b> và đạt <b>Cấp ${level}</b> (HP: ${health}, STR: ${strength}, AGI: ${agility}%, INT: ${intel}%).`);
    addLog(`🐉 Đối thủ xuất hiện: <b>Rồng Già</b> (HP: 600, STR: 100, AGI: 15%, INT: 80%).`);
    updateUI();
}

async function executeTurn() {
    if (!gameContinue || isBusy) return;
    isBusy = true;
    btnNextTurn.disabled = true;
    turnCount++;
    turnIndicator.textContent = `LƯỢT ${turnCount}`;

    // 1. ANH HÙNG TẤN CÔNG
    heroImg.classList.add('hero-attack');
    await sleep(250);

    const heroHit = Math.random() * 100 > dragon.agi;
    if (heroHit) {
        sfx.playSlash();
        triggerVisualFX(dragonEffect, 'slash-fx');
        dragonSvg.classList.add('unit-hurt');
        triggerScreenShake();

        dragon.health -= hero.strength;
        showFloatingText(dragonFloat, `-${hero.strength}`, 'normal');
        addLog(`⚔️ <b>TRẢM LONG!</b> Bạn gây sát thương <b>${hero.strength}</b> điểm cho Rồng!`, 'log-hero');
        updateUI();

        await sleep(350);
        dragonSvg.classList.remove('unit-hurt');

        const heroCritical = Math.random() * 100 < hero.intel;
        if (heroCritical) {
            await sleep(200);
            sfx.playCrit();
            triggerVisualFX(dragonEffect, 'crit-fx');
            dragonSvg.classList.add('unit-hurt');
            triggerScreenShake();

            const critDmg = hero.strength * 2;
            dragon.health -= critDmg;
            showFloatingText(dragonFloat, `CHÍ MẠNG -${critDmg}!`, 'crit');
            addLog(`⚡ <b>CHÍ MẠNG!</b> Bạn tung đòn liên hoàn gây thêm <b>${critDmg}</b> sát thương cho Rồng!`, 'log-crit');
            updateUI();

            await sleep(350);
            dragonSvg.classList.remove('unit-hurt');
        }
    } else {
        sfx.playDodge();
        dragonSvg.classList.add('unit-dodge');
        showFloatingText(dragonFloat, 'XÍ HỤT! (NÉ)', 'miss');
        addLog(`💨 <b>XÍ HỤT!</b> Rồng đã lượn tránh được đòn tấn công của Bạn!`, 'log-miss');
        await sleep(450);
        dragonSvg.classList.remove('unit-dodge');
    }

    heroImg.classList.remove('hero-attack');

    if (dragon.health <= 0) {
        gameContinue = false;
        stopAutoBattle();
        sfx.playEnd(true);
        addLog(`🏆 <b>CHIẾN THẮNG!!!</b> Rồng Già đã bị hạ gục!`, 'log-system');
        await sleep(600);
        showEndModal(true);
        isBusy = false;
        return;
    }

    await sleep(450);

    // 2. RỒNG PHẢN CÔNG
    dragonSvg.classList.add('dragon-attack');
    await sleep(250);

    const dragonHit = Math.random() * 100 > hero.agility;
    if (dragonHit) {
        sfx.playFireball();
        sfx.playHurt();
        triggerVisualFX(heroEffect, 'fire-fx');
        heroImg.classList.add('unit-hurt');
        triggerScreenShake();

        hero.health -= dragon.str;
        showFloatingText(heroFloat, `-${dragon.str}`, 'dragon-hit');
        addLog(`🔥 <b>HỎA CẦU!</b> Rồng phun lửa gây sát thương <b>${dragon.str}</b> điểm cho Bạn!`, 'log-dragon');
        updateUI();

        await sleep(350);
        heroImg.classList.remove('unit-hurt');

        const dragonCritical = Math.random() * 100 < dragon.int;
        if (dragonCritical) {
            await sleep(200);
            sfx.playCrit();
            sfx.playHurt();
            triggerVisualFX(heroEffect, 'crit-fx');
            heroImg.classList.add('unit-hurt');
            triggerScreenShake();

            const dragonCritDmg = dragon.str * 2;
            hero.health -= dragonCritDmg;
            showFloatingText(heroFloat, `CHÍ MẠNG -${dragonCritDmg}!`, 'crit');
            addLog(`💥 <b>CHÍ MẠNG!</b> Ngọn lửa hủy diệt của Rồng gây thêm <b>${dragonCritDmg}</b> sát thương!`, 'log-crit');
            updateUI();

            await sleep(350);
            heroImg.classList.remove('unit-hurt');
        }
    } else {
        sfx.playDodge();
        heroImg.classList.add('unit-dodge');
        showFloatingText(heroFloat, 'NÉ ĐÒN THÀNH CÔNG!', 'miss');
        addLog(`✨ <b>XÍ HỤT!</b> Bạn đã nhanh nhẹn né tránh được Hỏa Cầu từ Rồng!`, 'log-miss');
        await sleep(450);
        heroImg.classList.remove('unit-dodge');
    }

    dragonSvg.classList.remove('dragon-attack');

    if (hero.health <= 0) {
        gameContinue = false;
        stopAutoBattle();
        sfx.playEnd(false);
        addLog(`💀 <b>THẤT BẠI!!!</b> Bạn đã gục ngã trước Rồng Già...`, 'log-dragon');
        await sleep(600);
        showEndModal(false);
        isBusy = false;
        return;
    }

    isBusy = false;
    if (!autoTimer) {
        btnNextTurn.disabled = false;
    }
}

function showEndModal(isWin) {
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');

    if (isWin) {
        icon.textContent = '🏆';
        title.textContent = 'CHIẾN THẮNG!!!';
        title.style.color = '#fbbf24';
        msg.textContent = `Chúc mừng ${hero.name} (${hero.phancap}) đã hạ gục Rồng Già sau ${turnCount} lượt đấu!`;
    } else {
        icon.textContent = '🍖';
        title.textContent = 'THẤT BẠI!!!';
        title.style.color = '#f43f5e';
        msg.textContent = 'Chúc mừng bạn đã có tên trên menu món tối của Rồng: Hiệp sĩ nướng lá lốt!';
    }
    resultModal.classList.remove('hidden');
}

function toggleAutoBattle() {
    if (autoTimer) {
        stopAutoBattle();
    } else {
        btnAutoBattle.textContent = '⏸️ DỪNG TỰ ĐỘNG';
        btnNextTurn.disabled = true;
        executeTurn();
        autoTimer = setInterval(() => {
            if (!isBusy && gameContinue) {
                executeTurn();
            }
        }, 1800);
    }
}

function stopAutoBattle() {
    if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
    }
    btnAutoBattle.textContent = '⚡ TỰ ĐỘNG CHIẾN ĐẤU';
    if (gameContinue && !isBusy) {
        btnNextTurn.disabled = false;
    }
}

document.getElementById('btn-start').addEventListener('click', initGame);
btnNextTurn.addEventListener('click', executeTurn);
btnAutoBattle.addEventListener('click', toggleAutoBattle);

document.getElementById('btn-sound').addEventListener('click', (e) => {
    const state = sfx.toggle();
    e.target.textContent = state ? '🔊 Âm thanh: BẬT' : '🔇 Âm thanh: TẮT';
});

document.getElementById('btn-restart').addEventListener('click', () => {
    stopAutoBattle();
    arenaContainer.classList.add('hidden');
    setupModal.classList.remove('hidden');
});

document.getElementById('btn-play-again').addEventListener('click', () => {
    resultModal.classList.add('hidden');
    arenaContainer.classList.add('hidden');
    setupModal.classList.remove('hidden');
});
