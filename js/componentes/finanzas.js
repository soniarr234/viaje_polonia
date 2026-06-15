// js/componentes/finanzas.js
import { datosViaje } from '../data.js';

export function initConversor() {
    const eurInput = document.getElementById('eur-input');
    const plnOutput = document.getElementById('pln-output');
    const budgetSummary = document.getElementById('budget-summary');
    let tasaCambio = 4.30; // Valor por defecto offline

    if (budgetSummary) {
        budgetSummary.innerHTML = `<p style="margin-top: 1rem; opacity: 0.7;">Presupuesto fijado: <strong>${datosViaje.presupuestoTotalEUR} EUR</strong></p>`;
    }

    // API pública del Banco de Polonia (Corregido el error de sintaxis aquí abajo)
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
