/**
 * renderer.js - 修正版
 */
window.Renderer = {
    render: function(ctx, cvs, worldData, p, assetData, talkingNpc, logic, T, mode, titleText) {
        // 背景を真っ黒に塗る（これが動いていれば「真っ暗」ではなくなります）
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        // --- タイトル画面 ---
        if (mode === 'title') {
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "bold 30px sans-serif";
            ctx.fillText("RPG QUEST", cvs.width / 2, 150);
            
            ctx.font = "18px sans-serif";
            ctx.fillStyle = "#aaa";
            ctx.fillText(titleText || "第一章：運命の旅立ち", cvs.width / 2, 200);

            if (Math.floor(Date.now() / 500) % 2 === 0) {
                ctx.fillStyle = "white";
                ctx.fillText("PRESS ACTION TO START", cvs.width / 2, 300);
            }
            return;
        }

        // --- マップ描画 ---
        if (!worldData || !worldData.map) return;
        const map = worldData.map;
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                ctx.fillStyle = map[y][x] === 1 ? "#333" : "#0d0d0d";
                ctx.fillRect(x * T, y * T, T - 1, T - 1);
            }
        }

        // --- NPC描画 ---
        if (worldData.npcs) {
            worldData.npcs.forEach(n => {
                const asset = assetData[n.type] || assetData["default"];
                this.drawEntity(ctx, n.x * T + T/2, n.y * T + T/2, T, asset, n.d);
            });
        }

        // --- プレイヤー描画 ---
        this.drawEntity(ctx, p.lx * T + T/2, p.ly * T + T/2, T, assetData["default"], p.d);
    },

    drawEntity: function(ctx, cx, cy, T, asset, dir) {
        ctx.save();
        ctx.translate(cx, cy);
        const time = Date.now() / 1000;
        let sX = 1.0, sY = 1.0, offY = 0;

        if (asset.animType === "bounce") { offY = -Math.abs(Math.sin(time * 10)) * 6; sX = 1.1; }
        if (asset.animType === "stretch") { sY = 1 + Math.sin(time * 5) * 0.1; }
        if (asset.animType === "float") { offY = Math.sin(time * 4) * 4; }

        ctx.translate(0, offY);
        ctx.scale(sX * (asset.scale || 1.0), sY * (asset.scale || 1.0));
        ctx.fillStyle = asset.color;
        const r = T/2 - 4;

        if (asset.shape === "spike") {
            ctx.beginPath();
            for(let i=0; i<16; i++){
                let a = (i/16)*Math.PI*2;
                let d = i%2===0 ? r : r*0.5;
                ctx.lineTo(Math.cos(a)*d, Math.sin(a)*d);
            }
            ctx.fill();
        } else {
            ctx.fillRect(-r, -r, r * 2, r * 2);
        }

        // 目の描画（前を向いている時だけ）
        if (dir !== 'up') {
            ctx.fillStyle = "white";
            let ex = (dir === 'left') ? -5 : (dir === 'right') ? 5 : 0;
            if (dir === 'down') {
                ctx.fillRect(-6, -4, 4, 4); ctx.fillRect(2, -4, 4, 4);
            } else {
                ctx.fillRect(ex-2, -4, 4, 4);
            }
        }
        ctx.restore();
    }
};