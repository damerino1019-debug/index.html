/**
 * input.js - 入力監視専用
 */
(function() {
    const keys = {};
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    window.isPressed = function(type) {
        if (type === 'up') return keys['ArrowUp'];
        if (type === 'down') return keys['ArrowDown'];
        if (type === 'left') return keys['ArrowLeft'];
        if (type === 'right') return keys['ArrowRight'];
        return false;
    };

    // main.jsでのエラーを防ぐための空関数
    window.Input = { init: function() {} };
})();