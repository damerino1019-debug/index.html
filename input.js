window.Input = {
    keys: {},
    isPressed: function(dir) { return !!this.keys[dir]; },
    
    setPressed: function(dir, state) {
        this.keys[dir] = state;
    },

    init: function() {
        // --- PCキーボードの設定 ---
        window.addEventListener('keydown', e => {
            if(e.key === "ArrowUp" || e.key === "w") this.keys['up'] = true;
            if(e.key === "ArrowDown" || e.key === "s") this.keys['down'] = true;
            if(e.key === "ArrowLeft" || e.key === "a") this.keys['left'] = true;
            if(e.key === "ArrowRight" || e.key === "d") this.keys['right'] = true;
        });
        window.addEventListener('keyup', e => {
            if(e.key === "ArrowUp" || e.key === "w") this.keys['up'] = false;
            if(e.key === "ArrowDown" || e.key === "s") this.keys['down'] = false;
            if(e.key === "ArrowLeft" || e.key === "a") this.keys['left'] = false;
            if(e.key === "ArrowRight" || e.key === "d") this.keys['right'] = false;
        });

        // --- スマホ用タッチボタンの設定 (要素がある場合のみ) ---
        const setupBtn = (id, dir) => {
            const el = document.getElementById(id);
            if (!el) return; // 要素がなければ何もしない（これでエラーを防ぐ）
            
            el.addEventListener('touchstart', (e) => { 
                this.keys[dir] = true; 
                if(e.cancelable) e.preventDefault(); 
            }, {passive: false});
            
            el.addEventListener('touchend', (e) => { 
                this.keys[dir] = false; 
                if(e.cancelable) e.preventDefault(); 
            }, {passive: false});
        };

        setupBtn('btn-up', 'up');
        setupBtn('btn-down', 'down');
        setupBtn('btn-left', 'left');
        setupBtn('btn-right', 'right');

        // アクションボタン (ACTIONボタンがある場合のみ)
        const actionBtn = document.getElementById('btn-action');
        if (actionBtn) {
            actionBtn.addEventListener('touchstart', (e) => {
                // Enterキーが押されたというイベントを偽造して飛ばす
                const ev = new KeyboardEvent('keydown', { key: 'Enter' });
                document.dispatchEvent(ev);
                if(e.cancelable) e.preventDefault();
            }, {passive: false});
        }
    }
};

// 即座に初期化
Input.init();