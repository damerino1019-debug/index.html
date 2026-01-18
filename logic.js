// logic.js
const Logic = {
    canShowNPC: function(npc) {
        if (!npc || !npc.appearSwitch) return true;
        let id = npc.appearSwitch;
        let targetValue = true;
        if (id.startsWith('!')) { id = id.substring(1); targetValue = false; }
        return GameStats.getSwitch(id) === targetValue;
    }
};

const cvs = document.getElementById('g');
const ctx = cvs.getContext('2d');
const msgUI = document.getElementById('msg-ui');
const T = 32; 

window.mode = 'title'; 
WorldManager.currentMap = 'castle'; 

let titleSubText = "第一章：運命の旅立ち"; 
let p = { x: 7, y: 4, lx: 7, ly: 4, d: 'down', isMoving: false }; 
let talkData = null;
let currentPage = 0;
let talkingNpc = null; 

function update() {
    const worldData = window.WorldData[WorldManager.currentMap];
    if (!worldData) return;
    
    // プレイヤーの座標補間
    p.lx += (p.x - p.lx) * 0.2;
    p.ly += (p.y - p.ly) * 0.2;

    // 完全に目標座標に近づいたら停止とみなす
    const isActuallyMoving = Math.abs(p.x - p.lx) > 0.05 || Math.abs(p.y - p.ly) > 0.05;
    if (!isActuallyMoving) p.isMoving = false;

    Renderer.render(ctx, cvs, worldData, p, window.AssetData, talkingNpc, Logic, T, window.mode, titleSubText);
}

document.addEventListener('keydown', (e) => {
    if (window.mode === 'title') {
        if (e.key === " " || e.key === "Enter") {
            window.mode = 'walk';
            Renderer.resetTitle(); 
        }
        e.preventDefault();
        return;
    }
    if (window.mode === 'talk') {
        if (e.key === " " || e.key === "Enter") {
            handleTalk();
        }
        e.preventDefault();
        return;
    }
    if (window.mode === 'walk') {
        if (e.key === " " || e.key === "Enter") {
            handleAction();
            e.preventDefault();
        }
    }
});

function handleTalk() {
    if (UI.isTyping) {
        UI.finishNow(msgUI, (talkingNpc.type ? talkingNpc.type + "「" : "") + talkData.pages[currentPage] + (talkingNpc.type ? "」" : ""));
        return;
    }
    currentPage++;
    if (currentPage < talkData.pages.length) {
        UI.showText(msgUI, talkData.pages[currentPage], talkingNpc.type, window.AssetData);
    } else {
        UI.hide(msgUI);
        if (window.BattleSystem) window.BattleSystem.end(); 
        window.mode = 'walk';
        talkingNpc = null;
    }
}

function handleAction() {
    let tx = p.x + (p.d === 'left' ? -1 : p.d === 'right' ? 1 : 0);
    let ty = p.y + (p.d === 'up' ? -1 : p.d === 'down' ? 1 : 0);
    
    const n = WorldManager.getNpcAt(tx, ty);
    if (n) {
        const data = window.ScenarioData[n.sceneKey];
        if (data) {
            p.isMoving = false;
            talkData = data;
            talkingNpc = n;
            currentPage = 0;

            const executeTalk = () => {
                window.mode = 'talk';
                UI.showText(msgUI, talkData.pages[0], n.type, window.AssetData);
            };

            if (data.battleScene && window.BattleSystem) {
                window.BattleSystem.start(data.battleScene, executeTalk);
            } else {
                executeTalk();
            }
        }
    }
}

function handleMove() {
    if (window.mode !== 'walk') return;
    
    // 移動中は次の入力を受け付けない
    if (Math.abs(p.x - p.lx) > 0.05 || Math.abs(p.y - p.ly) > 0.05) return;

    let dx = 0, dy = 0;
    if (Input.isPressed('up')) { dy = -1; p.d = 'up'; }
    else if (Input.isPressed('down')) { dy = 1; p.d = 'down'; }
    else if (Input.isPressed('left')) { dx = -1; p.d = 'left'; }
    else if (Input.isPressed('right')) { dx = 1; p.d = 'right'; }

    if (dx !== 0 || dy !== 0) {
        const nx = p.x + dx, ny = p.y + dy;
        if (!WorldManager.isBlocked(nx, ny)) {
            p.x = nx; p.y = ny;
            p.isMoving = true;
            WorldManager.checkExits(p); 
        } else {
            p.isMoving = false;
        }
    }
}

setInterval(() => {
    update();
    handleMove();
}, 1000/60);