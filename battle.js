window.BattleSystem = {
    start: function(sceneKey, callback) {
        const data = window.BattleScenes[sceneKey];
        if (!data) { 
            if (callback) callback(); 
            return; 
        }

        const overlay = document.getElementById('battle-overlay');
        const img = document.getElementById('battle-enemy-img');
        
        // 要素が見つからない場合のエラー回避
        if (!overlay || !img) {
            console.error("Battle UI elements not found!");
            if (callback) callback();
            return;
        }

        const proceed = () => {
            overlay.style.display = 'flex';
            // 暗転演出（簡易版）
            overlay.style.opacity = "0";
            setTimeout(() => {
                overlay.style.transition = "opacity 0.5s";
                overlay.style.opacity = "1";
                // 1.5秒後に会話へ
                setTimeout(() => {
                    if (callback) callback();
                }, 1500);
            }, 50);
        };

        if (data.image) {
            img.src = data.image; // ここでのエラーを回避
            img.style.display = 'block';
            proceed();
        } else {
            img.style.display = 'none';
            proceed();
        }
    },

    end: function() {
        const overlay = document.getElementById('battle-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
};