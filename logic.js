(function() {
    const START_X = 7;
    const START_Y = 6; 

    window.mode = 'title'; 
    let p = { x: START_X, y: START_Y, lx: START_X, ly: START_Y, d: 'down' }; 
    let talkData = null;
    let currentPage = 0;
    let talkingNpc = null; 

    function mainLoop() {
        if (!window.Renderer || !window.WorldManager || !window.WorldData) {
            requestAnimationFrame(mainLoop);
            return;
        }
        const canvas = window.cvs || document.getElementById('g');
        const context = window.ctx || (canvas ? canvas.getContext('2d') : null);
        if (!context) return requestAnimationFrame(mainLoop);

        const currentMapKey = window.WorldManager.currentMap || 'village';
        const worldData = window.WorldData[currentMapKey];

        p.lx += (p.x - p.lx) * 0.2;
        p.ly += (p.y - p.ly) * 0.2;

        window.Renderer.render(
            context, canvas, worldData, p, 
            window.AssetData || {}, 
            talkingNpc, {}, 
            window.T || 32, window.mode, "PRESS ACTION"
        );

        if (window.mode === 'walk') handleMove();
        requestAnimationFrame(mainLoop);
    }

    function handleMove() {
        if (Math.abs(p.x - p.lx) > 0.05 || Math.abs(p.y - p.ly) > 0.05) return;
        let dx = 0, dy = 0;
        if (typeof window.isPressed === 'function') {
            if (window.isPressed('up')) { dy = -1; p.d = 'up'; }
            else if (window.isPressed('down')) { dy = 1; p.d = 'down'; }
            else if (window.isPressed('left')) { dx = -1; p.d = 'left'; }
            else if (window.isPressed('right')) { dx = 1; p.d = 'right'; }
        }
        if (dx !== 0 || dy !== 0) {
            if (window.WorldManager && !window.WorldManager.isBlocked(p.x + dx, p.y + dy)) {
                p.x += dx; p.y += dy;
                window.WorldManager.checkExits(p);
            }
        }
    }

    function startTalk(data, npc) {
        talkData = data;
        talkingNpc = npc;
        currentPage = 0;
        window.mode = 'talk';
        if (window.msgUI) {
            window.msgUI.innerText = talkData.pages[0];
            window.msgUI.style.display = 'block';
        }
    }

    window.handleAction = function() {
        if (window.mode === 'title') { 
            p.x = START_X; p.y = START_Y; p.lx = START_X; p.ly = START_Y;
            window.mode = 'walk'; 
            return; 
        }
        
        if (window.mode === 'talk') {
            currentPage++;
            if (!talkData || currentPage >= talkData.pages.length) {
                if (window.msgUI) window.msgUI.style.display = 'none';
                window.mode = 'walk';
                talkingNpc = null;
                if (window.BattleSystem) window.BattleSystem.end();
            } else if (window.msgUI) {
                // 正しく UI に次のページを表示
                window.msgUI.innerText = talkData.pages[currentPage];
            }
            return;
        }
        
        if (window.mode === 'walk') {
            let tx = p.x + (p.d==='left'?-1:p.d==='right'?1:0);
            let ty = p.y + (p.d==='up'?-1:p.d==='down'?1:0);
            const n = window.WorldManager ? window.WorldManager.getNpcAt(tx, ty) : null;
            
            if (n && window.ScenarioData[n.sceneKey]) {
                const scenario = window.ScenarioData[n.sceneKey];
                if (scenario.battleScene && window.BattleSystem) {
                    window.mode = 'wait'; 
                    window.BattleSystem.start(scenario.battleScene, () => {
                        startTalk(scenario, n);
                    });
                } else {
                    startTalk(scenario, n);
                }
            }
        }
    };

    mainLoop();
})();