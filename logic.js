/**
 * logic.js - 完全復旧版
 */
const cvs = document.getElementById('g');
const ctx = cvs.getContext('2d');
const msgUI = document.getElementById('msg-ui');
const T = 32; 

// 初期状態の設定
window.mode = 'title'; 
let titleSubText = "第一章：運命の旅立ち"; 
let p = { x: 7, y: 4, lx: 7, ly: 4, d: 'down', isMoving: false }; 

let talkData = null;
let currentPage = 0;
let talkingNpc = null; 

/**
 * メインループ（描画と更新）
 */
function mainLoop() {
    // データが揃っていない場合は待機
    if (!window.WorldData || !window.Renderer || !window.WorldManager) {
        requestAnimationFrame(mainLoop);
        return;
    }

    const currentMapKey = window.WorldManager.currentMap || 'castle';
    const worldData = window.WorldData[currentMapKey];

    // プレイヤーの座標を滑らかに動かす
    p.lx += (p.x - p.lx) * 0.2;
    p.ly += (p.y - p.ly) * 0.2;

    // 描画を Renderer に依頼
    window.Renderer.render(
        ctx, cvs, worldData, p, 
        window.AssetData || {}, 
        talkingNpc, 
        {}, 
        T, window.mode, titleSubText
    );

    // 移動の処理
    handleMove();

    requestAnimationFrame(mainLoop);
}

/**
 * キャラクターの移動処理
 */
function handleMove() {
    if (window.mode !== 'walk') return;
    // 移動中は入力を無視
    if (Math.abs(p.x - p.lx) > 0.05 || Math.abs(p.y - p.ly) > 0.05) return;

    let dx = 0, dy = 0;
    if (Input.isPressed('up')) { dy = -1; p.d = 'up'; }
    else if (Input.isPressed('down')) { dy = 1; p.d = 'down'; }
    else if (Input.isPressed('left')) { dx = -1; p.d = 'left'; }
    else if (Input.isPressed('right')) { dx = 1; p.d = 'right'; }

    if (dx !== 0 || dy !== 0) {
        const nx = p.x + dx, ny = p.y + dy;
        if (window.WorldManager && !window.WorldManager.isBlocked(nx, ny)) {
            p.x = nx; p.y = ny;
            window.WorldManager.checkExits(p);
        }
    }
}

/**
 * 決定キー（アクション）の処理
 */
function handleAction() {
    if (window.mode === 'title') {
        window.mode = 'walk';
        return;
    }
    if (window.mode !== 'walk') return;

    let tx = p.x + (p.d === 'left' ? -1 : p.d === 'right' ? 1 : 0);
    let ty = p.y + (p.d === 'up' ? -1 : p.d === 'down' ? 1 : 0);
    
    const n = window.WorldManager.getNpcAt(tx, ty);
    if (n && window.ScenarioData[n.sceneKey]) {
        talkData = window.ScenarioData[n.sceneKey];
        talkingNpc = n;
        currentPage = 0;

        const startDialogue = () => {
            window.mode = 'talk';
            msgUI.style.display = 'block';
            msgUI.innerText = talkData.pages[0];
        };

        // バトル設定がある場合は、バトルを挟んでから会話
        if (talkData.battleScene && window.BattleSystem) {
            window.BattleSystem.start(talkData.battleScene, startDialogue);
        } else {
            startDialogue();
        }
    }
}

/**
 * 会話を進める処理
 */
function handleTalk() {
    if (!talkData) return;
    currentPage++;

    if (currentPage >= talkData.pages.length) {
        msgUI.style.display = 'none';
        window.mode = 'walk';
        talkingNpc = null;
        if (window.BattleSystem) window.BattleSystem.end();
        return;
    }
    msgUI.innerText = talkData.pages[currentPage];
}

// キーボードイベントの登録
window.addEventListener('keydown', (e) => {
    if (e.key === " " || e.key === "Enter") {
        if (window.mode === 'title' || window.mode === 'walk') handleAction();
        else if (window.mode === 'talk') handleTalk();
    }
});

// ゲーム開始
mainLoop();