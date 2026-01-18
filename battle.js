window.BattleSystem = {
    start: function(sceneKey, callback) {
        const data = window.BattleScenes[sceneKey];
        // データ自体がない場合は、即座に会話（callback）を再開させる
        if (!data) { 
            if (callback) callback(); 
            return; 
        }

        const overlay = document.getElementById('battle-overlay');
        const img = document.getElementById('battle-enemy-img');
        
        // 演出を開始する共通処理
        const proceed = () => {
            overlay.style.display = 'flex';
            overlay.classList.remove('active');

            setTimeout(() => {
                overlay.classList.add('active');
                // 演出時間として2秒待機してから会話（callback）を呼ぶ
                if (callback) setTimeout(callback, 2000); 
            }, 50);
        };

        // 画像の存在チェック
        if (data.image) {
            const testImg = new Image();
            testImg.onload = () => {
                // 画像が読み込めた場合
                img.src = data.image;
                img.style.display = 'block';
                proceed();
            };
            testImg.onerror = () => {
                // 画像が読み込めなかった場合（暗転のみ継続）
                console.warn("Battle image not found: " + data.image);
                img.style.display = 'none';
                proceed();
            };
            testImg.src = data.image;
        } else {
            // 最初から画像指定がない場合（暗転のみ）
            img.style.display = 'none';
            proceed();
        }
    },

    end: function() {
        const overlay = document.getElementById('battle-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            // フェードアウトを待ってから非表示にする
            setTimeout(() => { 
                overlay.style.display = 'none'; 
            }, 800);
        }
    }
};