// =========================================================================
// 1. DATOS DEL VIAJE (Antes en data.js)
// =========================================================================
const datosViaje = {
    fechaInicio: "2026-12-05T00:00:00", 
    presupuestoTotalEUR: 1200,
    itinerario: [
        {
            dia: 1,
            fecha: "05 Dic",
            ciudad: "Cracovia",
            actividad: "Llegada al hotel y paseo nocturno por Rynek Główny."
        },
        {
            dia: 2,
            fecha: "06 Dic",
            ciudad: "Cracovia",
            actividad: "Día de San Nicolás (Mikołajki). Ver el reparto de dulces en el Mercado de Navidad y visitar los belenes tradicionales (Szopki)."
        },
        {
            dia: 3,
            fecha: "07 Dic",
            ciudad: "Breslavia",
            actividad: "Viaje en tren a Breslavia. Recorrer el centro buscando los gnomos de bronce y ver el gran mercado navideño."
        }
    ],
    checklist: [
        { id: "item1", texto: "Pasaporte / DNI" },
        { id: "item2", texto: "Ropa térmica e impermeable" },
        { id: "item3", texto: "Billetes de avión cargados en el móvil" },
        { id: "item4", texto: "Seguro de viaje médico" },
        { id: "item5", texto: "Guantes, gorro y bufanda" }
    ]
};

// =========================================================================
// 2. ORQUESTADOR PRINCIPAL (Ejecución al cargar el archivo)
// =========================================================================
initNavigation();
renderItinerario();
initConversor();
initChecklist();
initCountdown();

// =========================================================================
// 3. FUNCIONES DE LOS COMPONENTES
// =========================================================================

function initNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentBtn = e.currentTarget;
            const target = currentBtn.getAttribute('data-target');

            buttons.forEach(b => b.classList.remove('active'));
            currentBtn.classList.add('active');

            views.forEach(view => {
                if (view.id === target) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
            
            window.scrollTo(0, 0);
        });
    });
}

function renderItinerario() {
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

function initConversor() {
    const eurInput = document.getElementById('eur-input');
    const plnOutput = document.getElementById('pln-output');
    const budgetSummary = document.getElementById('budget-summary');
    let tasaCambio = 4.30; 

    if (budgetSummary) {
        budgetSummary.innerHTML = `<p style="margin-top: 1rem; opacity: 0.7;">Presupuesto fijado: <strong>${datosViaje.presupuestoTotalEUR} EUR</strong></p>`;
    }

    fetch('https://nbp.pl')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates && data.rates[0] && data.rates[0].mid) {
                tasaCambio = data.rates[0].mid;
            }
        })
        .catch(err => console.log("Usando tasa estática offline:", err));

    if (eurInput && plnOutput) {
        eurInput.addEventListener('input', () => {
            const euros = parseFloat(eurInput.value) || 0;
            const zlotys = (euros * tasaCambio).toFixed(2);
            plnOutput.textContent = `${zlotys} PLN`;
        });
    }
}

function initChecklist() {
    const packList = document.getElementById('pack-list');
    if (!packList) return;

    packList.innerHTML = datosViaje.checklist.map(item => {
        const checked = localStorage.getItem(item.id) === 'true' ? 'checked' : '';
        return `
            <li style="list-style: none; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" id="${item.id}" ${checked} style="transform: scale(1.2);">
                <label for="${item.id}" style="user-select: none;">${item.texto}</label>
            </li>
        `;
    }).join('');

    packList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            localStorage.setItem(e.target.id, e.target.checked);
        }
    });
}

function initCountdown() {
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
        countdownEl.textContent = `Faltan ${dias} días`;
    }

    actualizarContador();
    setInterval(actualizarContador, 60000);
}
