(function() {
    const trigger = (e) => {
        if (e && e.cancelable) e.preventDefault();
        // logic.js で定義した関数を呼び出す
        if (typeof window.handleAction === 'function') window.handleAction();
    };

    const btn = document.getElementById('btn-action');
    if (btn) {
        btn.addEventListener('click', trigger);
        btn.addEventListener('touchstart', trigger, {passive: false});
    }

    window.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') trigger();
    });
})();