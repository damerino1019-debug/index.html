const cvs = document.getElementById('g');
const ctx = cvs.getContext('2d');
const msgUI = document.getElementById('msg-ui');
const T = 32; 

// --- 初期設定エリア ---
let mode = 'title'; // 最初はタイトル画面
WorldManager.currentMap = 'castle'; // 最初のマップ

// ★タイトル画面で言わせたいセリフ（ここを書き換えると反映されます）
let titleSubText = "第一章：運命の旅立ち"; 

// プレイヤーの初期設定（お城の 7, 4 座標から）
let p = { x: 7, y: 4, lx: 7, ly: 4, d: 'down', isMoving: false }; 
// --------------------

let talkData = null;
let currentPage = 0;
let talkingNpc = null; 

/**
 * ゲームのメイン更新ループ
 */
function update() {
    const worldData = window.WorldData[WorldManager.currentMap];
    
    // プレイヤーの滑らかな移動（座標補間）
    p.lx += (p.x - p.lx) * 0.2;
    p.ly += (p.y - p.ly) * 0.2;

    // 描画実行
    // 引数：(ctx, キャンバス, マップデータ, プレイヤー, アセット, 話しているNPC, 論理クラス, タイルサイズ, モード, サブタイトル)
    Renderer.render(ctx, cvs, worldData, p, window.AssetData, talkingNpc, Logic, T, mode, titleSubText);
}

/**
 * キー入力イベント
 */
document.addEventListener('keydown', (e) => {
    // 1. タイトル画面
    if (mode === 'title') {
        if (e.key === " " || e.key === "Enter") {
            mode = 'walk';
            Renderer.resetTitle(); // 演出用タイマーをリセット
        }
        e.preventDefault();
        return;
    }

    // 2. 会話中
    if (mode === 'talk') {
        if (e.key === " " || e.key === "Enter") {
            handleTalk();
        }
        e.preventDefault();
        return;
    }

    // 3. 通常移動中
    if (mode === 'walk') {
        if (e.key === " " || e.key === "Enter") {
            handleAction();
            e.preventDefault();
        }
    }
});

/**
 * 会話の進行処理
 */
function handleTalk() {
    if (UI.isTyping) {
        UI.finishNow(msgUI, talkData.pages[currentPage]);
        return;
    }
    currentPage++;
    if (currentPage < talkData.pages.length) {
        UI.showText(msgUI, talkData.pages[currentPage], talkingNpc.type, window.AssetData);
    } else {
        UI.hide(msgUI);
        mode = 'walk';
        talkingNpc = null;
    }
}

/**
 * 目の前のNPCや看板を調べる処理
 */
function handleAction() {
    let tx = p.x + (p.d === 'left' ? -1 : p.d === 'right' ? 1 : 0);
    let ty = p.y + (p.d === 'up' ? -1 : p.d === 'down' ? 1 : 0);
    
    const n = WorldManager.getNpcAt(tx, ty);
    if (n) {
        talkData = window.ScenarioData[n.sceneKey];
        if (talkData) {
            currentPage = 0;
            mode = 'talk';
            p.isMoving = false;
            talkingNpc = n; 
            UI.showText(msgUI, talkData.pages[0], n.type, window.AssetData);
        }
    }
}

/**
 * キャラクター移動制御
 */
function handleMove() {
    if (mode !== 'walk') return;
    // 移動中は次の入力を受け付けない
    if (Math.abs(p.x - p.lx) > 0.1 || Math.abs(p.y - p.ly) > 0.1) return;

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
            WorldManager.checkExits(p); // マップ移動の確認
        } else {
            p.isMoving = false;
        }
    } else {
        p.isMoving = false;
    }
}

// 60FPSでループを回す
setInterval(() => {
    update();
    handleMove();
}, 1000/60);