export function initNavigation() {
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
