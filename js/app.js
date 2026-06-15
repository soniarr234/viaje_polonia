initNavigation();


function initNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            // Cambiar estado activo en botones
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Cambiar estado activo en secciones/vistas
            views.forEach(view => {
                if (view.id === target) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
            
            // Hacer scroll hacia arriba al cambiar de sección
            window.scrollTo(0, 0);
        });
    });
}
