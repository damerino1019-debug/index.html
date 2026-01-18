window.BattleSystem = {
    start: function(sceneKey, callback) {
        const data = window.BattleScenes[sceneKey];
        if (!data) { 
            if (callback) callback(); 
            return; 
        }

        const overlay = document.getElementById('battle-overlay');
        const img = document.getElementById('battle-enemy-img');
        
        if (!overlay || !img) {
            console.error("Battle UI elements not found!");
            if (callback) callback();
            return;
        }

        const proceed = () => {
            overlay.style.display = 'flex';
            overlay.style.opacity = "0"; // 初期状態は透明
            
            setTimeout(() => {
                overlay.style.transition = "opacity 0.8s ease-in"; // 出るときは少しゆっくり
                overlay.style.opacity = "1";
                
                // 1.5秒後に会話へ
                setTimeout(() => {
                    if (callback) callback();
                }, 1500);
            }, 50);
        };

        if (data.image) {
            img.src = data.image;
            img.style.display = 'block';
            proceed();
        } else {
            img.style.display = 'none';
            proceed();
        }
    },

    // マップに戻る時の演出
    end: function() {
        const overlay = document.getElementById('battle-overlay');
        if (overlay) {
            overlay.style.transition = "opacity 0.5s ease-out"; // 戻る時のフェード
            overlay.style.opacity = "0";
            
            // アニメーションが終わってから完全に消す
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
    }
};