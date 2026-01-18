// worldManager.js
const WorldManager = {
    // 現在のマップ名
    currentMap: 'village',

    // マップを切り替える
    changeMap: function(newMap, x, y, player) {
        this.currentMap = newMap;
        player.x = x;
        player.y = y;
        player.lx = x; // 補間アニメーションをリセット
        player.ly = y;
        console.log(`Map changed to: ${newMap}`);
    },

    // 出口（ワープ）をチェックする
    checkExits: function(player) {
        const worldData = window.WorldData[this.currentMap];
        if (!worldData || !worldData.exits) return;

        const exit = worldData.exits.find(e => e.x === player.x && e.y === player.y);
        if (exit) {
            this.changeMap(exit.nextWorld, exit.nextX, exit.nextY, player);
        }
    },

    // 通行可能か判定する（world.jsから引っ越し）
    isBlocked: function(x, y) {
        const worldData = window.WorldData[this.currentMap];
        if (!worldData) return true;

        // 1. マップ範囲外
        if (y < 0 || y >= worldData.map.length || x < 0 || x >= worldData.map[0].length) return true;
        
        // 2. 壁タイル
        if (parseInt(worldData.map[y][x]) === 1) return true;

        // 3. NPC（Logicを使って存在チェック）
        const hasNpc = worldData.npcs.some(n => {
            return n.x === x && n.y === y && Logic.canShowNPC(n);
        });
        
        return hasNpc;
    },

    // 目の前のNPCを探す（world.jsから引っ越し）
    getNpcAt: function(x, y) {
        const worldData = window.WorldData[this.currentMap];
        if (!worldData || !worldData.npcs) return null;
        return worldData.npcs.find(n => n.x === x && n.y === y && Logic.canShowNPC(n));
    }
};