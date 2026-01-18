// input.js
const Input = {
    // キーの現在の状態を保持
    keys: {},
    
    // キー名とゲーム内アクションの紐付け（カスタマイズしやすくする）
    map: {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        ' ': 'action',
        'Enter': 'action'
    },

    init: function() {
        window.addEventListener('keydown', (e) => {
            const action = this.map[e.key];
            if (action) {
                this.keys[action] = true;
                // ブラウザのスクロール防止
                if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const action = this.map[e.key];
            if (action) {
                this.keys[action] = false;
            }
        });
    },

    // 指定したアクション（'up', 'action' など）が押されているか
    isPressed: function(action) {
        return this.keys[action] || false;
    }
};

// 初期化を実行
Input.init();