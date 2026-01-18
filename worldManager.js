window.WorldManager = {
    currentMap: 'village',

    changeMap: function(newMap, x, y, player) {
        this.currentMap = newMap;
        player.x = x;
        player.y = y;
        player.lx = x; 
        player.ly = y;
    },

    checkExits: function(player) {
        const worldData = window.WorldData[this.currentMap];
        if (!worldData || !worldData.exits) return;
        const exit = worldData.exits.find(e => e.x === player.x && e.y === player.y);
        if (exit) {
            this.changeMap(exit.nextWorld, exit.nextX, exit.nextY, player);
        }
    },

    isBlocked: function(x, y) {
        const worldData = window.WorldData[this.currentMap];
        if (!worldData) return true;
        // マップの範囲外
        if (y < 0 || y >= worldData.map.length || x < 0 || x >= worldData.map[0].length) return true;
        // 1(壁) の判定
        if (parseInt(worldData.map[y][x]) === 1) return true;
        // NPCとの接触判定
        const hasNpc = worldData.npcs.some(n => n.x === x && n.y === y);
        return hasNpc;
    },

    getNpcAt: function(x, y) {
        const worldData = window.WorldData[this.currentMap];
        if (!worldData || !worldData.npcs) return null;
        return worldData.npcs.find(n => n.x === x && n.y === y);
    }
};