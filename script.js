// --- CONFIGURACIÓN DE TIEMPOS (En minutos) ---
const TIMES = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
};

// --- ESTADOS DE LA APLICACIÓN ---
let currentMode = 'pomodoro'; // 'pomodoro', 'shortBreak', 'longBreak'
let timeLeft = TIMES.pomodoro * 60; 
let timerInterval = null;
let completedPomodoros = 0;

// --- ELEMENTOS DEL DOM ---
const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('current-status');
const cycleCountDisplay = document.getElementById('cycle-count');
const body = document.body;

const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const btnResetCycles = document.getElementById('btn-reset-cycles');

const audioUploader = document.getElementById('audio-uploader');
const audioFilename = document.getElementById('audio-filename');
const alarmSound = document.getElementById('alarm-sound');
const btnResetAudio = document.getElementById('btn-reset-audio');

// --- CONFIGURACIÓN VALORES AUDIO POR DEFECTO ---
const DEFAULT_AUDIO_SRC = "alarma.mp3";
const DEFAULT_AUDIO_NAME = "Predeterminada (Re:Zero)";


function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0; // Reinicia el audio al segundo cero
} 

// --- LÓGICA DEL TEMPORIZADOR ---

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Actualiza la pantalla y el título de la pestaña del navegador
    timerDisplay.textContent = formattedTime;
    
    const modeNames = { pomodoro: 'Trabajo', shortBreak: 'Descanso Corto', longBreak: 'Descanso Largo' };
    document.title = `(${formattedTime}) ${modeNames[currentMode]} | Focus`;
}

function changeMode(mode) {
    currentMode = mode;
    timeLeft = TIMES[mode] * 60;
    
    // Actualizar clases estéticas en el body
    body.className = ''; 
    if (mode === 'pomodoro') {
        body.classList.add('mode-pomodoro');
        statusDisplay.textContent = "Tiempo de Enfocar";
    } else if (mode === 'shortBreak') {
        body.classList.add('mode-short-break');
        statusDisplay.textContent = "Descanso Corto";
    } else if (mode === 'longBreak') {
        body.classList.add('mode-long-break');
        statusDisplay.textContent = "Descanso Largo";
    }
    
    updateDisplay();
}

function startTimer() {
    stopAlarm(); // <--- Detiene la alarma al iniciar o reanudar
    if (timerInterval !== null) return;

    btnStart.disabled = true;
    btnPause.disabled = false;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alarmSound.play();
            handleCycleCompletion();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    btnStart.disabled = false;
    btnPause.disabled = true;
}

// Corregido: para asegurar que si reinicias, no se quede sonando
function resetTimer() {
    pauseTimer();
    stopAlarm();
    timeLeft = TIMES[currentMode] * 60;
    updateDisplay();
}

// --- GESTIÓN DE CICLOS STRICT ---

function handleCycleCompletion() {
    btnStart.disabled = false;
    btnPause.disabled = true;

    if (currentMode === 'pomodoro') {
        completedPomodoros++;
        cycleCountDisplay.textContent = completedPomodoros;

        // Determinar qué descanso toca basándose en el conteo actual
        if (completedPomodoros % 4 === 0) {
            changeMode('longBreak');
        } else {
            changeMode('shortBreak');
        }
    } else {
        // Si terminó un descanso, vuelve automáticamente a modo Pomodoro
        changeMode('pomodoro');
    }
}

// Reiniciar historial de pomodoros de forma manual (Botón de la flecha)
btnResetCycles.addEventListener('click', () => {
    stopAlarm();
    completedPomodoros = 0;
    cycleCountDisplay.textContent = completedPomodoros;
    changeMode('pomodoro');
    resetTimer();
});


// --- CONFIGURACIÓN DE AUDIO PERSONALIZADO ---

// Escuchar cuando el usuario sube un archivo propio
audioUploader.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const blobURL = URL.createObjectURL(file);
        alarmSound.src = blobURL;
        alarmSound.load();
        
        let name = file.name;
        if(name.length > 20) name = name.substring(0, 17) + '...';
        audioFilename.textContent = name;
        
        // Mostramos el botón para permitir regresar al sonido por defecto
        btnResetAudio.style.display = 'inline-block';
    }
});

// Evento para regresar al sonido por defecto (alarm.mp3)
btnResetAudio.addEventListener('click', () => {
    stopAlarm();
    
    // Restaurar valores iniciales
    alarmSound.src = DEFAULT_AUDIO_SRC;
    alarmSound.load();
    audioFilename.textContent = DEFAULT_AUDIO_NAME;
    
    // Limpiar el input file para que se pueda volver a subir el mismo archivo si se desea
    audioUploader.value = '';
    
    // Ocultar este botón ya que volvimos al original
    btnResetAudio.style.display = 'none';
});


// --- EVENT LISTENERS DE CONTROLES ---

btnStart.addEventListener('click', startTimer);
btnPause.addEventListener('click', pauseTimer);
btnReset.addEventListener('click', resetTimer);

// Inicializar la interfaz al cargar la app
updateDisplay();
