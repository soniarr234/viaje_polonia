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

const infoCiudades = {
    Cracovia: {
        lugares: [
            {
                titulo: "🎄 Rynek Główny y Mercado Navideño",
                historia: "Es la plaza medieval más grande de Europa (siglo XIII). En diciembre se llena de luces, puestos de madera, olor a vino caliente (Grzaniec) y los famosos belenes polacos (Szopki).",
                tip: "Escucha el Hejnał Mariacki (toque de trompeta) desde la torre de la Basílica de Santa María cada hora en punto."
            },
            {
                titulo: "🏰 Castillo de Wawel",
                historia: "Sede de los reyes polacos durante siglos. Mezcla estilos góticos y renacentistas. En la base del acantilado está la estatua del Dragón de Wawel.",
                tip: "¡La estatua del dragón escupe fuego real cada pocos minutos! Solo hay que esperar en la base a que ocurra."
            }
        ],
        restaurantes: [
            { nombre: "Pod Wawelem 🍖", desc: "Al lado del castillo. Raciones gigantescas y baratas de comida tradicional polaca. Ideal para probar el codillo (Golonka) o Schnitzel." },
            { nombre: "Pierogarnia Mandragora 🥟", desc: "El mejor sitio para probar Pierogis artesanales (los hay dulces, salados y horneados). Ambiente acogedor de invierno." }
        ]
    },
    Breslavia: {
        lugares: [
            {
                titulo: "🧝 Caza de los Gnomos (Krasnale)",
                historia: "Hay más de 400 estatuas de bronce de pequeños gnomos escondidas por la ciudad. Nacieron como una protesta pacífica y satírica del movimiento 'Alternativa Naranja' contra el régimen comunista en los años 80.",
                tip: "Descárgate la app gratuita 'Krasnale' en el móvil para ir registrando en el mapa los gnomos que vayas encontrando por el suelo."
            }
        ],
        restaurantes: [
            { nombre: "Piwnica Świdnicka 🍺", desc: "Ubicado en los sótanos del ayuntamiento. Es el restaurante en funcionamiento más antiguo de toda Europa (desde 1273). Sirve cerveza artesanal espectacular." }
        ]
    }
};

let eventosCiudadesAsignados = false;
// =========================================================================
// 2. ORQUESTADOR PRINCIPAL (Ejecución al cargar el archivo)
// =========================================================================
initNavigation();
renderItinerario();
initConversor();
initChecklist();
initCountdown();
initRouteSubNavigation();
initEditableLogistics();
initEditableHotels();

// =========================================================================
// 3. FUNCIONES DE LOS COMPONENTES
// =========================================================================
/* SISTEMA ENRUTADOR PRINCIPAL (Pestañas del Menú Inferior) */
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

/* SUB-ENRUTADOR SUPERIOR DE LA RUTA (Vuelos | Hoteles | Ciudades) */
function initRouteSubNavigation() {
    const subButtons = document.querySelectorAll('.sub-nav-btn');
    const subViews = document.querySelectorAll('.sub-view');

    subButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetSub = e.currentTarget.getAttribute('data-sub');

            subButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            subViews.forEach(view => {
                if (view.id === targetSub) {
                    view.classList.add('active');
                    
                    // ACCIÓN COMPLEMENTARIA: Si abre la sub-vista de ciudades, forzamos el renderizado en caliente
                    if (targetSub === 'sub-ciudades') {
                        renderItinerario();
                    }
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });
}


/* COMPONENTE LOGÍSTICA EDITABLE (Persistencia en memoria de Transportes y Alojamientos) */
/* COMPONENTE LOGÍSTICA EDITABLE CON POPUPS MODALES (Ida y Vuelta) */
function initEditableLogistics() {
    // Selectores de las tarjetas clickables
    const cardGoing = document.getElementById('card-going');
    const cardReturn = document.getElementById('card-return');
    
    // Selectores de los popups (modales)
    const modalGoing = document.getElementById('modal-flight-going');
    const modalReturn = document.getElementById('modal-flight-return');
    const closeBtns = document.querySelectorAll('.close-modal-btn');

    // Selectores de campos editables del popup (Ida)
    const editGoingAirline = document.getElementById('edit-going-airline');
    const editGoingTerminal = document.getElementById('edit-going-terminal');
    const editGoingTime = document.getElementById('edit-going-time');
    const saveGoingBtn = document.getElementById('save-going-btn');

    // Selectores de campos editables del popup (Vuelta)
    const editReturnAirline = document.getElementById('edit-return-airline');
    const editReturnTerminal = document.getElementById('edit-return-terminal');
    const editReturnTime = document.getElementById('edit-return-time');
    const saveReturnBtn = document.getElementById('save-return-btn');

    // Selectores de los textos resumen en la pantalla principal
    const briefGoingAirline = document.getElementById('brief-going-airline');
    const briefGoingTerminal = document.getElementById('brief-going-terminal');
    const briefGoingTime = document.getElementById('brief-going-time');
    
    const briefReturnAirline = document.getElementById('brief-return-airline');
    const briefReturnTerminal = document.getElementById('brief-return-terminal');
    const briefReturnTime = document.getElementById('brief-return-time');

    // 1. Función para cargar datos guardados de LocalStorage y pintar los resúmenes en la tarjeta
    function actualizarResumenVuelos() {
        // Valores por defecto de fábrica si el LocalStorage está vacío
        const dataGoing = {
            airline: localStorage.getItem('v_going_airline') || "Ryanair",
            terminal: localStorage.getItem('v_going_terminal') || "T1",
            time: localStorage.getItem('v_going_time') || "06:15h"
        };
        const dataReturn = {
            airline: localStorage.getItem('v_return_airline') || "Wizz Air",
            terminal: localStorage.getItem('v_return_terminal') || "T2",
            time: localStorage.getItem('v_return_time') || "21:40h"
        };

        // Pintar en los textos estáticos del cuadrado principal
        if (briefGoingAirline) briefGoingAirline.textContent = dataGoing.airline;
        if (briefGoingTerminal) briefGoingTerminal.textContent = dataGoing.terminal;
        if (briefGoingTime) briefGoingTime.textContent = dataGoing.time;

        if (briefReturnAirline) briefReturnAirline.textContent = dataReturn.airline;
        if (briefReturnTerminal) briefReturnTerminal.textContent = dataReturn.terminal;
        if (briefReturnTime) briefReturnTime.textContent = dataReturn.time;

        // Rellenar las cajas de texto internas de los popups para que no salgan vacías al editar
        if (editGoingAirline) editGoingAirline.value = dataGoing.airline;
        if (editGoingTerminal) editGoingTerminal.value = dataGoing.terminal;
        if (editGoingTime) editGoingTime.value = dataGoing.time;

        if (editReturnAirline) editReturnAirline.value = dataReturn.airline;
        if (editReturnTerminal) editReturnTerminal.value = dataReturn.terminal;
        if (editReturnTime) editReturnTime.value = dataReturn.time;
    }

    // 2. Eventos para abrir las ventanas emergentes (Popups) al pulsar en el cuadrado
    if (cardGoing && modalGoing) {
        cardGoing.addEventListener('click', () => {
            modalGoing.classList.add('open');
        });
    }
    if (cardReturn && modalReturn) {
        cardReturn.addEventListener('click', () => {
            modalReturn.classList.add('open');
        });
    }

    // 3. Evento unificado para cerrar cualquier popup al pulsar en la cruz '✕'
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita conflictos de clics encadenados
            const modalId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) targetModal.classList.remove('open');
        });
    });

    // 4. Lógica de guardado del Formulario del Popup de Ida
    if (saveGoingBtn) {
        saveGoingBtn.addEventListener('click', () => {
            localStorage.setItem('v_going_airline', editGoingAirline.value.trim());
            localStorage.setItem('v_going_terminal', editGoingTerminal.value.trim());
            localStorage.setItem('v_going_time', editGoingTime.value.trim());
            
            modalGoing.classList.remove('open'); // Cerrar popup
            actualizarResumenVuelos(); // Actualizar el cuadrado principal
        });
    }

    // 5. Lógica de guardado del Formulario del Popup de Vuelta
    if (saveReturnBtn) {
        saveReturnBtn.addEventListener('click', () => {
            localStorage.setItem('v_return_airline', editReturnAirline.value.trim());
            localStorage.setItem('v_return_terminal', editReturnTerminal.value.trim());
            localStorage.setItem('v_return_time', editReturnTime.value.trim());
            
            modalReturn.classList.remove('open'); // Cerrar popup
            actualizarResumenVuelos(); // Actualizar el cuadrado principal
        });
    }

    // Inicializar los datos del tarjetero al arrancar
    actualizarResumenVuelos();
}

/* COMPONENTE ALOJAMIENTOS EDITABLES URBANO (Cracovia y Breslavia) */
function initEditableHotels() {
    const cardKrk = document.getElementById('card-hotel-krk');
    const cardWro = document.getElementById('card-hotel-wro');
    const modalKrk = document.getElementById('modal-hotel-krk');
    const modalWro = document.getElementById('modal-hotel-wro');
    const closeBtns = document.querySelectorAll('.close-modal-btn');

    // Inputs Cracovia
    const editKrkName = document.getElementById('edit-krk-name');
    const editKrkPrice = document.getElementById('edit-krk-price');
    const editKrkAddress = document.getElementById('edit-krk-address');
    const editKrkCheckin = document.getElementById('edit-krk-checkin');
    const editKrkCheckout = document.getElementById('edit-krk-checkout');
    const editKrkStatus = document.getElementById('edit-krk-status');
    const saveKrkBtn = document.getElementById('save-hotel-krk-btn');

    // Inputs Breslavia
    const editWroName = document.getElementById('edit-wro-name');
    const editWroPrice = document.getElementById('edit-wro-price');
    const editWroAddress = document.getElementById('edit-wro-address');
    const editWroCheckin = document.getElementById('edit-wro-checkin');
    const editWroCheckout = document.getElementById('edit-wro-checkout');
    const editWroClockStatus = document.getElementById('edit-wro-status');
    const saveWroBtn = document.getElementById('save-hotel-wro-btn');

    // Selectores Resumen Pantalla
    const briefKrkName = document.getElementById('brief-krk-name');
    const briefKrkAddress = document.getElementById('brief-krk-address');
    const briefKrkPrice = document.getElementById('brief-krk-price');
    const briefKrkCheckin = document.getElementById('brief-krk-checkin');
    const briefKrkCheckout = document.getElementById('brief-krk-checkout');
    const briefKrkStatus = document.getElementById('brief-krk-status');

    const briefWroName = document.getElementById('brief-wro-name');
    const briefWroAddress = document.getElementById('brief-wro-address');
    const briefWroPrice = document.getElementById('brief-wro-price');
    const briefWroCheckin = document.getElementById('brief-wro-checkin');
    const briefWroCheckout = document.getElementById('brief-wro-checkout');
    const briefWroStatus = document.getElementById('brief-wro-status');

    function cargarDatosHoteles() {
        const hKrk = {
            name: localStorage.getItem('h_krk_name') || "Atlantis Hostel",
            price: localStorage.getItem('h_krk_price') || "80 €",
            address: localStorage.getItem('h_krk_address') || "Westerplatte 16, Old Town",
            checkin: localStorage.getItem('h_krk_checkin') || "14:00h",
            checkout: localStorage.getItem('h_krk_checkout') || "11:00h",
            status: localStorage.getItem('h_krk_status') || "Pagado"
        };
        const hWro = {
            name: localStorage.getItem('h_wro_name') || "Korona Hotel",
            price: localStorage.getItem('h_wro_price') || "340 PLN",
            address: localStorage.getItem('h_wro_address') || "Rynek 29, Casco Antiguo",
            checkin: localStorage.getItem('h_wro_checkin') || "15:00h",
            checkout: localStorage.getItem('h_wro_checkout') || "10:00h",
            status: localStorage.getItem('h_wro_status') || "En destino"
        };

        // Pintar en pantalla principal
        if(briefKrkName) briefKrkName.textContent = hKrk.name;
        if(briefKrkAddress) briefKrkAddress.textContent = hKrk.address;
        if(briefKrkPrice) briefKrkPrice.textContent = hKrk.price;
        if(briefKrkCheckin) briefKrkCheckin.textContent = hKrk.checkin;
        if(briefKrkCheckout) briefKrkCheckout.textContent = hKrk.checkout;
        if(briefKrkStatus) {
            briefKrkStatus.textContent = hKrk.status;
            briefKrkStatus.style.color = hKrk.status.toLowerCase().includes('pagado') ? '#2ed573' : '#f59e0b';
        }

        if(briefWroName) briefWroName.textContent = hWro.name;
        if(briefWroAddress) briefWroAddress.textContent = hWro.address;
        if(briefWroPrice) briefWroPrice.textContent = hWro.price;
        if(briefWroCheckin) briefWroCheckin.textContent = hWro.checkin;
        if(briefWroCheckout) briefWroCheckout.textContent = hWro.checkout;
        if(briefWroStatus) {
            briefWroStatus.textContent = hWro.status;
            briefWroStatus.style.color = hWro.status.toLowerCase().includes('pagado') ? '#2ed573' : '#f59e0b';
        }

        // Rellenar inputs del popup
        if(editKrkName) editKrkName.value = hKrk.name;
        if(editKrkPrice) editKrkPrice.value = hKrk.price;
        if(editKrkAddress) editKrkAddress.value = hKrk.address;
        if(editKrkCheckin) editKrkCheckin.value = hKrk.checkin;
        if(editKrkCheckout) editKrkCheckout.value = hKrk.checkout;
        if(editKrkStatus) editKrkStatus.value = hKrk.status;

        if(editWroName) editWroName.value = hWro.name;
        if(editWroPrice) editWroPrice.value = hWro.price;
        if(editWroAddress) editWroAddress.value = hWro.address;
        if(editWroCheckin) editWroCheckin.value = hWro.checkin;
        if(editWroCheckout) editWroCheckout.value = hWro.checkout;
        if(editWroClockStatus) editWroClockStatus.value = hWro.status;
    }

    if (cardKrk && modalKrk) cardKrk.addEventListener('click', () => modalKrk.classList.add('open'));
    if (cardWro && modalWro) cardWro.addEventListener('click', () => modalWro.classList.add('open'));

    // Reutiliza las directivas de cierre de modales
    if(saveKrkBtn) {
        saveKrkBtn.addEventListener('click', () => {
            localStorage.setItem('h_krk_name', editKrkName.value.trim());
            localStorage.setItem('h_krk_price', editKrkPrice.value.trim());
            localStorage.setItem('h_krk_address', editKrkAddress.value.trim());
            localStorage.setItem('h_krk_checkin', editKrkCheckin.value.trim());
            localStorage.setItem('h_krk_checkout', editKrkCheckout.value.trim());
            localStorage.setItem('h_krk_status', editKrkStatus.value.trim());
            modalKrk.classList.remove('open');
            cargarDatosHoteles();
        });
    }

    if(saveWroBtn) {
        saveWroBtn.addEventListener('click', () => {
            localStorage.setItem('h_wro_name', editWroName.value.trim());
            localStorage.setItem('h_wro_price', editWroPrice.value.trim());
            localStorage.setItem('h_wro_address', editWroAddress.value.trim());
            localStorage.setItem('h_wro_checkin', editWroCheckin.value.trim());
            localStorage.setItem('h_wro_checkout', editWroCheckout.value.trim());
            localStorage.setItem('h_wro_status', editWroClockStatus.value.trim());
            modalWro.classList.remove('open');
            cargarDatosHoteles();
        });
    }

    cargarDatosHoteles();
}

function renderItinerario() {
    const subCiudades = document.getElementById('sub-ciudades');
    const dashboard = document.getElementById('cities-dashboard');
    const detailView = document.getElementById('city-detail-view');
    const container = document.getElementById('timeline-container');

    if (!subCiudades || !dashboard || !detailView || !container) return;

    // Función que arma el contenido detallado de la ciudad elegida
    function mostrarDetalleCiudad(ciudadSeleccionada) {
        const diasFiltrados = datosViaje.itinerario.filter(item => item.ciudad.toLowerCase() === ciudadSeleccionada.toLowerCase());
        const datosExtra = infoCiudades[ciudadSeleccionada] || { lugares: [], restaurantes: [] };

        const itinerarioHTML = diasFiltrados.map(item => `
            <div class="timeline-item" style="margin-bottom: 1.5rem; padding: 1rem; border-left: 3px solid var(--primary-color, #ffa502); background: rgba(0,0,0,0.02); border-radius: 0 8px 8px 0;">
                <div style="font-weight: bold; color: var(--primary-color, #ffa502); font-size: 0.9rem;">Día ${item.dia} - ${item.fecha}</div>
                <h3 style="margin: 0.2rem 0; color: var(--text-color);">${item.ciudad}</h3>
                <p style="margin: 0; font-size: 0.95rem; opacity: 0.8; color: var(--text-color);">${item.actividad}</p>
            </div>
        `).join('');

        const lugaresHTML = datosExtra.lugares.map(lugar => `
            <div class="accordion-item" style="background: var(--card-bg, rgba(255, 255, 255, 0.04)); border-radius: 12px; margin-bottom: 0.8rem; overflow: hidden; border: 1px solid rgba(128, 128, 128, 0.15);">
                <button class="accordion-header" style="width: 100%; background: none; border: none; padding: 1rem; color: var(--text-color); font-weight: bold; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left;">
                    <span>${lugar.titulo}</span>
                    <span class="icon" style="transition: transform 0.3s; font-size: 0.8rem;">▼</span>
                </button>
                <div class="accordion-content" style="max-height: 0; overflow: hidden; padding: 0 1rem; transition: all 0.3s ease; font-size: 0.9rem; line-height: 1.4; opacity: 0.9; color: var(--text-color);">
                    <p style="margin: 8px 0;">📜 <strong>Historia:</strong> ${lugar.historia}</p>
                    <p style="margin: 0 0 8px 0; color: #0284c7;">💡 <strong>Tip Pro:</strong> ${lugar.tip}</p>
                </div>
            </div>
        `).join('');

        const localesHTML = datosExtra.restaurantes.map(rest => `
            <div style="background: rgba(0, 0, 0, 0.02); border-left: 4px solid #2ed573; padding: 12px; border-radius: 8px; margin-bottom: 10px; color: var(--text-color);">
                <h4 style="margin: 0 0 4px 0; color: inherit; font-size: 0.95rem;">${rest.nombre}</h4>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.8; line-height: 1.3;">${rest.desc}</p>
            </div>
        `).join('');

        container.innerHTML = `
            <h2 style="margin: 0 0 1.5rem 0; color: var(--text-color); font-size: 1.4rem;">📍 Explorando ${ciudadSeleccionada}</h2>
            <h4 style="margin: 0 0 1rem 0; opacity: 0.5; font-size: 0.75rem; letter-spacing: 1px; color: var(--text-color);">📅 PLAN DE ITINERARIO</h4>
            ${itinerarioHTML}
            
            <h4 style="margin: 1.8rem 0 1rem 0; opacity: 0.5; font-size: 0.75rem; letter-spacing: 1px; color: var(--text-color);">🗺️ MONUMENTOS E IMPRESCINDIBLES</h4>
            <div class="places-accordion-wrapper">${lugaresHTML}</div>
            
            <h4 style="margin: 1.8rem 0 1rem 0; opacity: 0.5; font-size: 0.75rem; letter-spacing: 1px; color: var(--text-color);">🍲 DÓNDE COMER Y BEBER</h4>
            <div>${localesHTML}</div>
        `;

        dashboard.style.display = "none";
        detailView.style.display = "block";
    }

    // =========================================================================
    // SOLUCIÓN TOTAL: DELEGACIÓN CENTRALIZADA DE CLICS EN EL PADRE PRINCIPAL
    // =========================================================================
    if (!eventosCiudadesAsignados) {
        
        subCiudades.addEventListener('click', (e) => {
            // 1. Manejo del clic en los cuadrados del menú principal
            const card = e.target.closest('.city-dash-card');
            if (card) {
                const ciudadTarget = card.getAttribute('data-target-city');
                mostrarDetalleCiudad(ciudadTarget);
                return;
            }

            // 2. Manejo del clic en el botón de regresar "Volver"
            const backBtn = e.target.closest('#back-to-dashboard-btn');
            if (backBtn) {
                detailView.style.display = "none";
                dashboard.style.display = "grid";
                container.innerHTML = "";
                return;
            }

            // 3. Manejo del clic en las cabeceras de los acordeones desplegables
            const header = e.target.closest('.accordion-header');
            if (header) {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const icon = item.querySelector('.icon');

                if (item.classList.contains('open')) {
                    item.classList.remove('open');
                    content.style.maxHeight = "0";
                    content.style.paddingBottom = "0";
                    icon.style.transform = "rotate(0deg)";
                } else {
                    container.querySelectorAll('.accordion-item').forEach(el => {
                        el.classList.remove('open');
                        const c = el.querySelector('.accordion-content');
                        const i = el.querySelector('.icon');
                        if (c) c.style.maxHeight = "0";
                        if (c) c.style.paddingBottom = "0";
                        if (i) i.style.transform = "rotate(0deg)";
                    });

                    item.classList.add('open');
                    content.style.maxHeight = "350px";
                    content.style.paddingBottom = "1rem";
                    icon.style.transform = "rotate(180deg)";
                }
                return;
            }
        });

        // Marcamos como asignado para que no duplique el hilo de memoria
        eventosCiudadesAsignados = true;
    }
}


/**************************************************************************************************************************************
                                                    Pestaña 3: CONVERSOR Y GASTOS
**************************************************************************************************************************************/
function initConversor() {
    const inputLeft = document.getElementById('input-left');
    const inputRight = document.getElementById('input-right');
    const labelLeft = document.getElementById('label-left');
    const labelRight = document.getElementById('label-right');
    const switchBtn = document.getElementById('switch-currency-btn');
    const budgetSummary = document.getElementById('budget-summary');
    const liveRateText = document.getElementById('live-rate-text');
    
    // Selectores del nuevo formulario de gastos
    const formEl = document.getElementById('add-expense-form');
    const expConcept = document.getElementById('exp-concept');
    const expAmount = document.getElementById('exp-amount');
    const expCurrency = document.getElementById('exp-currency');
    const expCategory = document.getElementById('exp-category');
    const expDay = document.getElementById('exp-day');
    const saveExpenseBtn = document.getElementById('save-expense-btn');
    const expensesContainer = document.getElementById('expenses-timeline-container');

    let tasaCambio = 4.32; 
    let esEuroAIzquierda = true;

    const chips = document.querySelectorAll('.chip-btn');

    // Cargar gastos guardados previamente en LocalStorage (si no hay ninguno, empieza vacío)
    let listaGastos = JSON.parse(localStorage.getItem('gastosViajePolonia')) || [];
    let filtroCategoria = "ALL";

    expensesContainer.addEventListener('click', (e) => {
        if (e.target.textContent === "✕") {

            const item = e.target.closest('.expense-item');
            if (!item) return;

            const id = item.dataset.id;

            item.style.transition = "opacity 0.2s ease, transform 0.2s ease";
            item.style.opacity = "0";
            item.style.transform = "translateX(20px)";

            setTimeout(() => {
                listaGastos = listaGastos.filter(g => g.id !== id);
                localStorage.setItem('gastosViajePolonia', JSON.stringify(listaGastos));
                actualizarPantallaFinanzas();
            }, 200);
        }
    });

    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            // Quitamos la clase activa de todos los botones
            chips.forEach(c => c.classList.remove('active'));
            // Se la añadimos al que acabamos de pulsar
            e.currentTarget.classList.add('active');
            // Guardamos el texto de la categoría seleccionada en la variable
            filtroCategoria = e.currentTarget.getAttribute('data-value');
            actualizarPantallaFinanzas();
        });
    });

    // 1. Llamada inicial a la API para capturar la tasa real
    fetch('https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates && data.rates[0]) {
                tasaCambio = data.rates[0].mid;
                if (liveRateText) liveRateText.textContent = tasaCambio.toFixed(2);
                actualizarPantallaFinanzas();
            }
        })
        .catch(() => {
            console.log("Modo offline: usando tasa fallback");
            actualizarPantallaFinanzas();
        });

        // 2. Función principal que calcula los totales y dibuja los gastos en la pantalla
    function actualizarPantallaFinanzas() {     
        const listaFiltrada = listaGastos.filter(g => {
            if (filtroCategoria === "ALL") return true;
            return g.categoria === filtroCategoria;
        });

        const budgetInitialVal = document.getElementById('budget-initial-val');
        const budgetSpentVal = document.getElementById('budget-spent-val');
        const budgetRestVal = document.getElementById('budget-rest-val');
        const categoryBarChart = document.getElementById('category-bar-chart'); // Selector de la barra
        const projectionBox = document.getElementById('expense-projection-box');

        // 1. Inicializar acumuladores por categoría
        let totalGastadoEUR = 0;
        const totalesPorCategoria = {
            "🍔 Comida": 0,
            "🎭 Ocio": 0,
            "🎟️ Entradas": 0,
            "🚇 Transporte": 0
        };

        // 2. Calcular los gastos totales y desglosarlos por categoría en Euros
        listaGastos.forEach(gasto => {
            let costeEUR = gasto.moneda === 'EUR' ? gasto.precio : gasto.precio / tasaCambio;
            totalGastadoEUR += costeEUR;
            
            if (totalesPorCategoria[gasto.categoria] !== undefined) {
                totalesPorCategoria[gasto.categoria] += costeEUR;
            }
        });

        // 3. Renderizar la barra segmentada dinámicamente
        if (categoryBarChart) {
            if (totalGastadoEUR === 0) {
                // Si no hay gastos, la barra se muestra de un color gris neutro de fondo
                categoryBarChart.innerHTML = `<div style="width: 100%; background: rgba(255,255,255,0.1); height: 100%;"></div>`;
            } else {
                // Calculamos los porcentajes relativos de cada bloque
                const pctComida = (totalesPorCategoria["🍔 Comida"] / totalGastadoEUR) * 100;
                const pctOcio = (totalesPorCategoria["🎭 Ocio"] / totalGastadoEUR) * 100;
                const pctEntradas = (totalesPorCategoria["🎟️ Entradas"] / totalGastadoEUR) * 100;
                const pctTransp = (totalesPorCategoria["🚇 Transporte"] / totalGastadoEUR) * 100;

                categoryBarChart.innerHTML = `
                    <div style="width: ${pctComida}%; background-color: #ff4757; transition: width 0.3s;" title="Comida"></div>
                    <div style="width: ${pctOcio}%; background-color: #ffa502; transition: width 0.3s;" title="Ocio"></div>
                    <div style="width: ${pctEntradas}%; background-color: #2ed573; transition: width 0.3s;" title="Entradas"></div>
                    <div style="width: ${pctTransp}%; background-color: #1e90ff; transition: width 0.3s;" title="Transporte"></div>
                `;
            }
        }

        // CALCULAR PROMEDIO DIARIO Y PROYECCIÓN
        if (projectionBox) {
            if (listaFiltrada.length === 0) {
                // Si está vacío, ocultamos la tarjeta para no ensuciar la pantalla
                projectionBox.style.display = "none";
            } else {
                projectionBox.style.display = "block";

                // Calculamos cuántos días únicos del viaje ya tienen algún gasto apuntado
                const diasConGastos = [...new Set(listaGastos.map(g => g.dia))].length || 1;
                const totalDiasViaje = datosViaje.itinerario.length; // Extraído de tus datos fijos (3 días)
                
                // Cálculo de medias matemáticas
                const promedioDiario = totalGastadoEUR / diasConGastos;
                const proyeccionGastoFinal = promedioDiario * totalDiasViaje;
                const presupuestoInicial = datosViaje.presupuestoTotalEUR;
                const balanceDiferencia = presupuestoInicial - proyeccionGastoFinal;

                // Generar mensaje inteligente personalizado según tu ritmo
                let mensajeInteligente = "";
                let colorAlerta = "";

                if (balanceDiferencia < 0) {
                    colorAlerta = "#ef4444"; // Rojo peligro
                    mensajeInteligente = `⚠️ <strong>¡Cuidado!</strong> A este ritmo gastarás un total de <strong>${proyeccionGastoFinal.toFixed(0)} €</strong>. Te pasarás del presupuesto por <strong>${Math.abs(balanceDiferencia).toFixed(0)} €</strong> al acabar el viaje.`;
                } else {
                    colorAlerta = "#2ed573"; // Verde positivo
                    mensajeInteligente = `🎉 <strong>¡Buen ritmo!</strong> Proyección final estimada en <strong>${proyeccionGastoFinal.toFixed(0)} €</strong>. Si mantienes este control, volverás a casa con un ahorro de <strong>${balanceDiferencia.toFixed(0)} €</strong>.`;
                }

                // Inyectar el HTML limpio estructurado dentro de la tarjeta
                projectionBox.innerHTML = `
                    <div class="projection-row">
                        <span>📈 Promedio diario actual:</span>
                        <strong>${promedioDiario.toFixed(2)} € / día</strong>
                    </div>
                    <div class="projection-status-msg" style="color: ${colorAlerta};">
                        ${mensajeInteligente}
                    </div>
                `;
            }
        }

        // Calcular balances restantes basándonos en los 1200€ estáticos de datosViaje
        const presupuestoTotal = datosViaje.presupuestoTotalEUR;
        const restanteEUR = presupuestoTotal - totalGastadoEUR;
        const restantePLN = restanteEUR * tasaCambio;

        // Inyectar los datos en cada celda por separado sin mutar el presupuesto base
        if (budgetInitialVal) {
            budgetInitialVal.textContent = `${presupuestoTotal.toFixed(0)} €`;
        }
        if (budgetSpentVal) {
            budgetSpentVal.textContent = `${totalGastadoEUR.toFixed(2)} €`;
        }
                if (budgetRestVal) {
            budgetRestVal.textContent = `${restanteEUR.toFixed(2)} €`;
            
            // Calculamos los umbrales basados en el presupuesto total (1200€)
            const umbralAdvertencia = presupuestoTotal * 0.20; // 20% = 240€
            const umbralPeligro = presupuestoTotal * 0.05;     // 5% = 60€

            // Control de color dinámico según el dinero restante
            if (restanteEUR <= umbralPeligro) {
                // Alerta Máxima: Menos de 60€ o números negativos -> Rojo
                budgetRestVal.style.color = '#ef4444'; 
            } else if (restanteEUR <= umbralAdvertencia) {
                // Advertencia: Menos de 240€ pero más de 60€ -> Naranja/Amarillo
                budgetRestVal.style.color = '#f59e0b'; 
            } else {
                // Todo correcto: Más de 240€ -> Tu color amarillo/dorado festivo por defecto
                budgetRestVal.style.color = 'var(--primary-color)';
            }
        }

        // Renderizar el historial agrupado por días
        if (!expensesContainer) return;
        if (listaGastos.length === 0) {
            expensesContainer.innerHTML = `<p style="opacity:0.5; text-align:center; padding:1rem;">No has añadido ningún gasto todavía.</p>`;
            return;
        }

        const gastosAgrupadosPorDia = {};
        listaGastos.forEach(gasto => {
            if (!gastosAgrupadosPorDia[gasto.dia]) {
                gastosAgrupadosPorDia[gasto.dia] = [];
            }
            gastosAgrupadosPorDia[gasto.dia].push(gasto);
        });

        function renderListaGastos() {
            if (!expensesContainer) return;

            const listaFiltrada = listaGastos.filter(g => {
                if (filtroCategoria === "ALL") return true;
                return g.categoria === filtroCategoria;
            });
            
            expensesContainer.innerHTML = ""; // Limpieza controlada

            if (listaGastos.length === 0) {
                expensesContainer.innerHTML = `<p style="text-align:center; opacity:0.5; padding:20px;">No hay gastos registrados todavía.</p>`;
                return;
            }

            // Agrupación reactiva local limpia (eliminada cualquier duplicidad externa)
            const gastosAgrupadosPorDia = {};
            
            listaFiltrada.forEach(gasto => {
                // Código defensivo frente a elementos corruptos o antiguos en localStorage
                if (!gasto || typeof gasto !== 'object') return;
                
                const diaSeguro = gasto.dia || 1;
                if (!gastosAgrupadosPorDia[diaSeguro]) {
                    gastosAgrupadosPorDia[diaSeguro] = [];
                }
                gastosAgrupadosPorDia[diaSeguro].push(gasto);
            });

            const fragment = document.createDocumentFragment();

            // Ordenamos los días en orden descendente (el día más reciente arriba)
            Object.keys(gastosAgrupadosPorDia).sort((a, b) => b - a).forEach(dia => {
                const gastosDelDia = gastosAgrupadosPorDia[dia];

                // Cálculo defensivo del subtotal por día
                let subtotalDiaEUR = gastosDelDia.reduce((sum, g) => {
                    const precio = parseFloat(g.precio) || 0;
                    return sum + (g.moneda === 'EUR' ? precio : precio / tasaCambio);
                }, 0);

                // Bloque contenedor del día
                const dayBlock = document.createElement('div');
                dayBlock.className = "day-expense-block";
                dayBlock.style = "background: var(--card-bg, rgba(255,255,255,0.05)); padding:1rem; border-radius:12px; margin-bottom:1rem; box-shadow:0 2px 5px rgba(0,0,0,0.02);";

                // Encabezado del día
                const header = document.createElement('div');
                header.style = "display:flex; justify-content:space-between; margin-bottom:0.8rem; border-bottom:1px solid rgba(128,128,128,0.2); padding-bottom:4px; font-size:0.85rem; color: var(--text-color, #222);";
                header.innerHTML = `
                    <strong>📅 Día del viaje: ${dia}</strong>
                    <span style="opacity:0.8;">Total día: <strong>${subtotalDiaEUR.toFixed(2)} €</strong></span>
                `;
                dayBlock.appendChild(header);

                // Renderizado de las filas individuales del gasto
                gastosDelDia.forEach(gasto => {
                    // Variables seguras para evitar textos rotos, undefined o NaN
                    const conceptoSeguro = gasto.concepto || "Gasto sin concepto";
                    const precioSeguro = parseFloat(gasto.precio) || 0;
                    const categoriaSegura = gasto.categoria || "❓ Gasto";
                    const monedaSegura = gasto.moneda === 'EUR' ? '€' : 'PLN';

                    const item = document.createElement('div');
                    item.className = "expense-item";
                    item.dataset.id = gasto.id;
                    // Eliminados los colores blancos fijos (#fff) para que hereden el color oscuro del texto de la app o usen un tono neutro visible
                    item.style = "display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.03); padding:0.6rem 0.8rem; border-radius:8px; margin-bottom:0.5rem; font-size:0.9rem; border-left: 3px solid var(--primary-color, #ffa502); color: var(--text-color, #222);";

                    const left = document.createElement('div');
                    left.innerHTML = `
                        <span style="font-size:0.7rem; background: rgba(128,128,128,0.15); padding:2px 6px; border-radius:4px; margin-right:6px; font-weight:500;">${categoriaSegura}</span>
                        <strong style="color: inherit;">${conceptoSeguro}</strong>
                    `;

                    const right = document.createElement('div');
                    right.style = "display:flex; align-items:center; gap:8px;";

                    const amount = document.createElement('span');
                    amount.style = "font-weight:bold; color: inherit;";
                    amount.textContent = `${precioSeguro.toFixed(2)} ${monedaSegura}`;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = "✕";
                    deleteBtn.style = "background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem; padding:4px; font-weight:bold;";


                    right.appendChild(amount);
                    right.appendChild(deleteBtn);
                    item.appendChild(left);
                    item.appendChild(right);
                    dayBlock.appendChild(item);
                });

                fragment.appendChild(dayBlock);
            });

            expensesContainer.appendChild(fragment);
        }

        // Añadir manejadores de evento para borrar
        document.querySelectorAll('.delete-exp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idABorrar = e.currentTarget.getAttribute('data-id');
                listaGastos = listaGastos.filter(g => g.id !== idABorrar);
                localStorage.setItem('gastosViajePolonia', JSON.stringify(listaGastos));
                actualizarPantallaFinanzas();
            });
        });

        renderListaGastos();
    }


    // 3. Lógica para guardar un nuevo gasto introducido en el formulario
    if (saveExpenseBtn) {
        saveExpenseBtn.addEventListener('click', () => {
            const concepto = expConcept.value.trim();
            const precio = parseFloat(expAmount.value);

            if (!concepto || isNaN(precio) || precio <= 0) {
                alert("Introduce un concepto y un precio correcto.");
                return;
            }

            const nuevoGasto = {
                id: 'exp_' + Date.now(),
                concepto: concepto,
                precio: precio,
                moneda: expCurrency.value,
                categoria: expCategory.value, // Volvemos a leer de forma normal el select.value
                dia: expDay.value
            };

            listaGastos.push(nuevoGasto);
            localStorage.setItem('gastosViajePolonia', JSON.stringify(listaGastos));
            expConcept.value = "";
            expAmount.value = "";
            
            // Opcional: Reiniciar al chip por defecto de comida tras guardar
            chips.forEach(c => c.classList.remove('active'));
            if(chips[0]) chips[0].classList.add('active');
            categoriaSeleccionada = "🍔 Comida";

            actualizarPantallaFinanzas();
        });
    }

    // 4. Lógica de cálculo matemático del conversor bidireccional estándar
    function ejecutarConversor() {
        if (esEuroAIzquierda) {
            const euros = parseFloat(inputLeft.value) || 0;
            if (euros === 0) { inputRight.value = ""; return; }
            inputRight.value = (euros * tasaCambio).toFixed(2);
        } else {
            const zlotys = parseFloat(inputLeft.value) || 0;
            if (zlotys === 0) { inputRight.value = ""; return; }
            inputRight.value = (zlotys / tasaCambio).toFixed(2);
        }
    }

    if (inputLeft) inputLeft.addEventListener('input', ejecutarConversor);

    if (switchBtn) {
        switchBtn.addEventListener('click', () => {
            esEuroAIzquierda = !esEuroAIzquierda;
            switchBtn.classList.toggle('rotate');
            if (esEuroAIzquierda) {
                labelLeft.textContent = "Euros (€)";
                labelRight.textContent = "Zlotys (PLN)";
            } else {
                labelLeft.textContent = "Zlotys (PLN)";
                labelRight.textContent = "Euros (€)";
            }
            if (inputLeft) inputLeft.value = "";
            if (inputRight) inputRight.value = "";
        });
    }

    // Dibujar la pantalla por primera vez al entrar
    actualizarPantallaFinanzas();
}














function initChecklist() {
    const container = document.getElementById('checklist-dynamic-container');
    const inputNewItem = document.getElementById('new-pack-item');
    const btnAddNewItem = document.getElementById('add-pack-item-btn');

    // 1. Elementos por defecto que vienen de fábrica si la app se abre por primera vez
    const itemsPredeterminados = [
        { id: "pack_1", texto: "DNI / Pasaporte original", cat: "🪪 Imprescindibles" },
        { id: "pack_2", texto: "Tarjeta Revolut / Billetes de avión", cat: "🪪 Imprescindibles" },
        { id: "pack_3", texto: "Ropa térmica (camisetas y mallas)", cat: "❄️ Ropa de Frío" },
        { id: "pack_4", texto: "Guantes impermeables, gorro y bufanda", cat: "❄️ Ropa de Frío" },
        { id: "pack_5", texto: "Cargadores y Batería externa (Powerbank)", cat: "🔌 Tecnología" },
        { id: "pack_6", texto: "Protector labial (el frío corta los labios)", cat: "💊 Aseo y Botiquín" }
    ];

    // 2. Cargar la base de datos local o crearla usando los datos de fábrica
    let listaMaleta = JSON.parse(localStorage.getItem('maletaViajePolonia')) || itemsPredeterminados;

    // 3. Función principal para dibujar la maleta agrupada por bloques de categorías
    function renderMaleta() {
        if (!container) return;

        // Agrupamos el array plano en un objeto clasificado por categorías
        const agrupado = {};
        listaMaleta.forEach(item => {
            if (!agrupado[item.cat]) agrupado[item.cat] = [];
            agrupado[item.cat].push(item);
        });

        // Generamos el HTML dinámico de las cajas
        container.innerHTML = Object.keys(agrupado).map(categoria => {
            const itemsDeLaCategoria = agrupado[categoria];

            const checkboxesHTML = itemsDeLaCategoria.map(item => {
                // Comprobamos en LocalStorage si este ID específico ya estaba marcado como completado
                const estaMarcado = localStorage.getItem(`status_${item.id}`) === 'true';
                
                return `
                    <label class="check-item-label ${estaMarcado ? 'completed' : ''}" for="${item.id}">
                        <div class="check-item-left">
                            <input type="checkbox" id="${item.id}" ${estaMarcado ? 'checked' : ''}>
                            <span>${item.texto}</span>
                        </div>
                        <button class="delete-pack-btn" data-id="${item.id}">✕</button>
                    </label>
                `;
            }).join('');

            return `
                <div class="pack-category-block">
                    <h3 class="pack-category-title">${categoria}</h3>
                    <div class="pack-items-list">${checkboxesHTML}</div>
                </div>
            `;
        }).join('');

        // Enganchar el evento 'change' a los checkboxes para el guardado automático
        container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const idSeleccionado = e.target.id;
                const valorMarcado = e.target.checked;
                
                // Guardamos el estado individual en LocalStorage
                localStorage.setItem(`status_${idSeleccionado}`, valorMarcado);
                
                // Añadimos o quitamos la clase visual de tachado gris al label padre
                const labelPadre = e.target.closest('.check-item-label');
                if (labelPadre) {
                    labelPadre.classList.toggle('completed', valorMarcado);
                }
            });
        });

        // Enganchar el evento 'click' a los botones de eliminar un objeto de la lista
        container.querySelectorAll('.delete-pack-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idABorrar = e.currentTarget.getAttribute('data-id');
                // Limpiamos su registro de LocalStorage y lo sacamos del array principal
                localStorage.removeItem(`status_${idABorrar}`);
                listaMaleta = listaMaleta.filter(item => item.id !== idABorrar);
                localStorage.setItem('maletaViajePolonia', JSON.stringify(listaMaleta));
                renderMaleta(); // Volver a pintar
            });
        });
    }

    // 4. Lógica del botón para insertar cosas nuevas a la maleta
    if (btnAddNewItem && inputNewItem) {
        btnAddNewItem.addEventListener('click', () => {
            const textoNuevo = inputNewItem.value.trim();
            const selectCat = document.getElementById('new-pack-cat'); // Capturamos el select
            
            if (!textoNuevo) return;

            const nuevoObjeto = {
                id: 'pack_' + Date.now(),
                texto: textoNuevo,
                cat: selectCat ? selectCat.value : "📦 Otros" // Asigna la categoría seleccionada
            };

            listaMaleta.push(nuevoObjeto);
            localStorage.setItem('maletaViajePolonia', JSON.stringify(listaMaleta));
            inputNewItem.value = ""; // Limpiar caja de escritura
            renderMaleta(); // Refrescar interfaz
        });
    }

    // Dibujar la maleta por primera vez al entrar a la web
    renderMaleta();
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




document.addEventListener("DOMContentLoaded", () => {
    const magazineHero = document.querySelector(".magazine-hero");
    const magicContent = document.getElementById("magic-scroll-content");
    const tabItinerary = document.getElementById("tab-itinerary");
    const appHeader = document.querySelector(".app-header"); // Buscamos tu nueva cabecera

    if (magazineHero && magicContent && tabItinerary && appHeader) {
        
        document.body.style.overflow = "hidden";
        tabItinerary.style.overflow = "hidden";

        function activarItinerario() {
            magazineHero.style.opacity = "0";
            magazineHero.style.visibility = "hidden";
            magazineHero.style.transform = "scale(0.95)";
            magicContent.classList.add("fade-in-visible");
            
            // MÁGICO: Hacemos aparecer la cabecera arriba de los botones de vuelos/hoteles
            appHeader.classList.add("show-header");
            
            document.body.style.overflow = "auto";
            tabItinerary.style.overflow = "auto";
        }

        function desactivarItinerario() {
            magazineHero.style.opacity = "1";
            magazineHero.style.visibility = "visible";
            magazineHero.style.transform = "scale(1)";
            magicContent.classList.remove("fade-in-visible");
            
            // MÁGICO: Escondemos de nuevo la cabecera al regresar al póster de la revista
            appHeader.classList.remove("show-header");
            
            document.body.style.overflow = "hidden";
            tabItinerary.style.overflow = "hidden";
            window.scrollTo(0, 0);
        }

        let touchStartY = 0;
        window.addEventListener("touchstart", (event) => {
            touchStartY = event.touches.clientY;
        }, { passive: true });

        window.addEventListener("touchmove", (event) => {
            const touchEndY = event.touches.clientY;
            const diffY = touchStartY - touchEndY;

            if (diffY > 25 && magazineHero.style.opacity !== "0") {
                activarItinerario();
            }
            
            if (diffY < -25 && window.scrollY <= 5 && magazineHero.style.opacity === "0") {
                desactivarItinerario();
            }
        }, { passive: true });

        window.addEventListener("wheel", (event) => {
            if (event.deltaY > 0 && magazineHero.style.opacity !== "0") {
                activarItinerario();
            }
            if (event.deltaY < 0 && window.scrollY <= 5 && magazineHero.style.opacity === "0") {
                desactivarItinerario();
            }
        });
    }
});

