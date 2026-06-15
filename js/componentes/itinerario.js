import { datosViaje } from '../data.js';

export function renderItinerario() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = datosViaje.itinerario.map(item => `
        <div class="timeline-item" style="margin-bottom: 1.5rem; padding: 1rem; border-left: 3px solid var(--primary-color); background: rgba(0,0,0,0.02); border-radius: 0 8px 8px 0;">
            <div style="font-weight: bold; color: var(--primary-color); font-size: 0.9rem;">Día ${item.dia} - ${item.fecha}</div>
            <h3 style="margin: 0.2rem 0;">${item.ciudad}</h3>
            <p style="margin: 0; font-size: 0.95rem; opacity: 0.8;">${item.actividad}</p>
        </div>
    `).join('');
}
