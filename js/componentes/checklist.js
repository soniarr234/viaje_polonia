import { datosViaje } from '../data.js';

export function initChecklist() {
    const packList = document.getElementById('pack-list');
    if (!packList) return;

    // Renderizar los elementos
    packList.innerHTML = datosViaje.checklist.map(item => {
        const checked = localStorage.getItem(item.id) === 'true' ? 'checked' : '';
        return `
            <li style="list-style: none; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" id="${item.id}" ${checked} style="transform: scale(1.2);">
                <label for="${item.id}" style="user-select: none;">${item.texto}</label>
            </li>
        `;
    }).join('');

    // Guardar cambios en el almacenamiento local
    packList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            localStorage.setItem(e.target.id, e.target.checked);
        }
    });
}
