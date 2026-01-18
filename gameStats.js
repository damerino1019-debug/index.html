// gameStats.js
const GameStats = {
    // セーブデータに含めるべき情報
    state: {
        switches: {},  // フラグ
        variables: {}, // 数値（所持金など）
        mapId: 'village',
        playerPos: { x: 7, y: 7 }
    },

    // スイッチ操作
    setSwitch: function(id, value) {
        this.state.switches[id] = value;
    },

    getSwitch: function(id) {
        return this.state.switches[id] || false;
    },

    // JSON形式でセーブデータを書き出し（将来のセーブ機能用）
    save: function() {
        return JSON.stringify(this.state);
    },

    // ロード
    load: function(jsonString) {
        this.state = JSON.parse(jsonString);
    }
};