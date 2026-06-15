import { datosViaje } from '../data.js';

export function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    const fechaDestino = new Date(datosViaje.fechaInicio).getTime();

    function actualizarContador() {
        const ahora = new Date().getTime();
        const diferencia = fechaDestino - ahora;

        if (diferencia <= 0) {
            countdownEl.textContent = "¡Buen viaje! ✈️";
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        countdownEl.textContent = `Faltan ${dias} días 🇵🇱`;
    }

    actualizarContador();
    setInterval(actualizarContador, 60000); // Se actualiza cada minuto
}
