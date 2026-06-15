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

    // Cargar gastos guardados previamente en LocalStorage (si no hay ninguno, empieza vacío)
    let listaGastos = JSON.parse(localStorage.getItem('gastosViajePolonia')) || [];

    // 1. Llamada inicial a la API para capturar la tasa real
    fetch('https://nbp.pl')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates && data.rates[0] && data.rates[0].mid) {
                tasaCambio = data.rates[0].mid;
                if (liveRateText) liveRateText.textContent = tasaCambio.toFixed(2);
                actualizarPantallaFinanzas();
            }
        })
        .catch(err => {
            console.log("Modo offline: Usando tasa estática 4.32", err);
            actualizarPantallaFinanzas();
        });

        // 2. Función principal que calcula los totales y dibuja los gastos en la pantalla
    function actualizarPantallaFinanzas() {
        const budgetInitialVal = document.getElementById('budget-initial-val');
        const budgetSpentVal = document.getElementById('budget-spent-val');
        const budgetRestVal = document.getElementById('budget-rest-val');
        const categoryBarChart = document.getElementById('category-bar-chart'); // Selector de la barra
        const projectionBox = document.getElementById('expense-projection-box');

        // 1. Inicializar acumuladores por categoría
        let totalGastadoEUR = 0;
        const totalesPorCategoria = {
            "🍕 Comida": 0,
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
                const pctComida = (totalesPorCategoria["🍕 Comida"] / totalGastadoEUR) * 100;
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
            if (listaGastos.length === 0) {
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

        expensesContainer.innerHTML = Object.keys(gastosAgrupadosPorDia).sort().map(dia => {
            const gastosDelDia = gastosAgrupadosPorDia[dia];
            let subtotalDiaEUR = gastosDelDia.reduce((sum, g) => sum + (g.moneda === 'EUR' ? g.precio : g.precio / tasaCambio), 0);

            const itemsHTML = gastosDelDia.map(gasto => `
                <div class="expense-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-color); padding:0.6rem 0.8rem; border-radius:8px; margin-bottom:0.5rem; font-size:0.9rem; border-left: 3px solid var(--primary-color);">
                    <div>
                        <span style="font-size:0.7rem; background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px; margin-right:4px;">${gasto.categoria}</span>
                        <strong>${gasto.concepto}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${gasto.precio.toFixed(2)} ${gasto.moneda === 'EUR' ? '€' : 'PLN'}</span>
                        <button class="delete-exp-btn" data-id="${gasto.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem; padding:4px;">✕</button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="day-expense-block" style="background: var(--card-bg); padding:1rem; border-radius:12px; margin-bottom:1rem; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.8rem; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:4px; font-size:0.85rem;">
                        <strong>📅 Día del viaje: ${dia}</strong>
                        <span style="opacity:0.7;">Total día: <strong>${subtotalDiaEUR.toFixed(1)} €</strong></span>
                    </div>
                    ${itemsHTML}
                </div>
            `;
        }).join('');

        // Añadir manejadores de evento para borrar
        document.querySelectorAll('.delete-exp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idABorrar = e.currentTarget.getAttribute('data-id');
                listaGastos = listaGastos.filter(g => g.id !== idABorrar);
                localStorage.setItem('gastosViajePolonia', JSON.stringify(listaGastos));
                actualizarPantallaFinanzas();
            });
        });
    }


    // 3. Lógica para guardar un nuevo gasto introducido en el formulario
    if (saveExpenseBtn) {
        saveExpenseBtn.addEventListener('click', () => {
            const concepto = expConcept.value.trim();
            const precio = parseFloat(expAmount.value);

            if (!concepto || isNaN(precio) || precio <= 0) {
                alert("Por favor, introduce un concepto válido y un precio mayor que cero.");
                return;
            }

            // Crear objeto de gasto indexable con marcas únicas
            const nuevoGasto = {
                id: 'exp_' + Date.now() + Math.random().toString(36).substr(2, 4),
                concepto: concepto,
                precio: precio,
                moneda: expCurrency.value,
                categoria: expCategory.value,
                dia: expDay.value
            };

            // Insertar a nuestra base de datos, guardar en memoria local y limpiar inputs
            listaGastos.push(nuevoGasto);
            localStorage.setItem('gastosViajePolonia', JSON.stringify(listaGastos));
            
            expConcept.value = "";
            expAmount.value = "";

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
