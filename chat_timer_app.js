// chat_timer_app.js
// Autor: Juan Fernando Araujo Castellanos

const SEQUENCES = {
    normal: [120, 60, 60],      // Segundos: 2min, 1min, 1min
    ghost: [120, 120, 60]       // Segundos: 2min, 2min, 1min
};

const EMOJIS = ["⏰", "🚦", "🔔", "🕑", "👀", "🚗", "💬", "✨", "🙂"];

function playAlertSound() {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(700, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
    }, 600);
}

class ChatTimer {
    constructor(container, chatId) {
        this.container = container;
        this.chatId = chatId;
        this.sequenceType = 'normal';
        this.sequence = SEQUENCES[this.sequenceType];
        this.currentStep = 0;
        this.remaining = 0;
        this.intervalId = null;
        this.alertActive = false;
        this.updateDisplay();
    }

    setSequence(type) {
        this.stop();
        this.sequenceType = type;
        this.sequence = SEQUENCES[type];
        this.currentStep = 0;
        this.updateDisplay();
    }

    start() {
        if (this.intervalId) return;
        this.remaining = this.sequence[this.currentStep];
        this.intervalId = setInterval(() => this.tick(), 1000);
        this.updateDisplay();
    }

    tick() {
        if (this.remaining > 0) {
            this.remaining -= 1;
            this.updateDisplay();
            if (this.remaining === 0) {
                this.triggerAlert();
            }
        }
    }

    nextStep() {
        this.stopAlert();
        if (this.currentStep < this.sequence.length - 1) {
            this.currentStep++;
            this.start();
        } else {
            this.reset();
        }
    }

    triggerAlert() {
        this.alertActive = true;
        this.updateDisplay();
        playAlertSound();
        this.alertLoop = setInterval(playAlertSound, 800);
    }

    stopAlert() {
        if (this.alertActive) {
            clearInterval(this.alertLoop);
            this.alertActive = false;
            this.updateDisplay();
        }
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    reset() {
        this.stop();
        this.stopAlert();
        this.currentStep = 0;
        this.remaining = this.sequence[this.currentStep];
        this.updateDisplay();
    }

    formatTime(s) {
        let m = Math.floor(s / 60);
        let ss = s % 60;
        return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    }

    randomEmoji() {
        return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    }

    updateDisplay() {
        let stepLabels = this.sequence.map((secs, idx) => {
            let label = (idx === 0 ? '1️⃣' : idx === 1 ? '2️⃣' : '3️⃣');
            let warn = idx === this.currentStep ? '🔵' : '';
            return `<span class="step-label">${label} ${this.formatTime(secs)} ${warn}</span>`;
        }).join(" ");

        let timeLeft = this.alertActive
            ? `<span class="alert-text">⌛ ¡Tiempo! Acciona la advertencia.</span>`
            : `<span class="timer">${this.formatTime(this.remaining || this.sequence[this.currentStep])}</span>`;

        let emoji = this.randomEmoji();

        this.container.innerHTML = `
            <div class="chat-header">
                <span class="emoji" title="¡Ánimo!" tabindex="0">${emoji}</span>
                <span class="chat-title">Chat ${this.chatId}</span>
                <select class="sequence-select">
                    <option value="normal" ${this.sequenceType === 'normal' ? 'selected' : ''}>Secuencia estándar</option>
                    <option value="ghost" ${this.sequenceType === 'ghost' ? 'selected' : ''}>Secuencia fantasma</option>
                </select>
            </div>
            <div class="steps">${stepLabels}</div>
            <div class="timer-box">${timeLeft}</div>
            <div class="controls">
                <button class="start-btn">Iniciar</button>
                <button class="next-btn" ${this.alertActive ? "" : "disabled"}>Siguiente advertencia</button>
                <button class="reset-btn">Resetear</button>
                <button class="stop-alert-btn" ${this.alertActive ? "" : "disabled"}>Detener alerta</button>
            </div>
        `;

        // Event bindings
        this.container.querySelector('.start-btn').onclick = () => this.start();
        this.container.querySelector('.next-btn').onclick = () => this.nextStep();
        this.container.querySelector('.reset-btn').onclick = () => this.reset();
        this.container.querySelector('.stop-alert-btn').onclick = () => this.stopAlert();
        this.container.querySelector('.sequence-select').onchange = (e) => this.setSequence(e.target.value);

        // Interactividad emoji: cambia emoji al hacer clic
        this.container.querySelector('.emoji').onclick = () => {
            this.container.querySelector('.emoji').textContent = this.randomEmoji();
        };
    }
}