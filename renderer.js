window.Renderer = {
    render: function(ctx, cvs, worldData, p, assetData, talkingNpc, logic, T, mode, titleText) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        if (mode === 'title') {
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "bold 24px sans-serif";
            ctx.fillText("RPG QUEST", cvs.width / 2, 150);
            return;
        }

        if (!worldData) return;
        const offsetX = cvs.width / 2 - (p.lx * T + T / 2);
        const offsetY = cvs.height / 2 - (p.ly * T + T / 2);
        ctx.save();
        ctx.translate(offsetX, offsetY);

        // マップ描画（境界線なし）
        worldData.map.forEach((row, y) => {
            row.forEach((cell, x) => {
                ctx.fillStyle = cell === 1 ? "#333" : "#1a1a1a";
                ctx.fillRect(x * T, y * T, T, T);
            });
        });

        // NPC描画
        if (worldData.npcs) {
            worldData.npcs.forEach(n => {
                // assets.jsからデータを取得。見つからない場合はdefaultを使用
                const asset = assetData[n.type] || assetData["default"];
                const isTalking = talkingNpc && n.x === talkingNpc.x && n.y === talkingNpc.y;
                this.drawEntity(ctx, n.x * T + T / 2, n.y * T + T / 2, T, asset, n.d || 'down', false, isTalking);
            });
        }
        
        // プレイヤー描画
        const isMoving = Math.abs(p.x - p.lx) > 0.01 || Math.abs(p.y - p.ly) > 0.01;
        const pAsset = assetData["default"]; // プレイヤーはdefault固定
        this.drawEntity(ctx, p.lx * T + T / 2, p.ly * T + T / 2, T, pAsset, p.d, isMoving, false);
        
        ctx.restore();
    },

    drawEntity: function(ctx, cx, cy, T, asset, dir, isMoving, isTalking) {
        ctx.save();
        ctx.translate(cx, cy);
        
        const time = Date.now() / 1000;
        let offY = 0;
        let sY = 1.0;
        const anim = asset.animType; // stretch, float, bounce など

        // --- モーション判定 ---
        if (isTalking) {
            offY = -Math.abs(Math.sin(time * 15)) * 8; // 会話中のジャンプ
        } else if (isMoving) {
            offY = -Math.abs(Math.sin(time * 12)) * 4; // 歩行アニメ
        } else {
            // 待機中：assets.jsの設定に従う
            if (anim === "bounce") {
                offY = -Math.abs(Math.sin(time * 8 + cx)) * 5;
            } else if (anim === "float") {
                offY = Math.sin(time * 4 + cx) * 4;
            } else if (anim === "stretch") {
                sY = 1 + Math.sin(time * 4 + cx) * 0.05;
            }
        }

        ctx.translate(0, offY);
        ctx.scale(asset.scale || 1.0, sY * (asset.scale || 1.0));

        // 色の反映
        ctx.fillStyle = asset.color || "#f0a";
        const shape = asset.shape || "human";

        // 形状の描画
        if (shape === "girl") {
            ctx.beginPath();
            if(ctx.roundRect) ctx.roundRect(-T/4.5, -T/10, T/2.2, T/2.2, [4, 4, 10, 10]);
            else ctx.fillRect(-T/4.5, -T/10, T/2.2, T/2.2);
            ctx.fill();
            ctx.beginPath(); ctx.arc(0, -T/4.5, T/5.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "red"; ctx.fillRect(-5, -T/2.2, 10, 4); // リボン
        } else if (shape === "human") {
            ctx.beginPath();
            if(ctx.roundRect) ctx.roundRect(-T/4.5, -T/10, T/2.2, T/2.3, 8);
            else ctx.fillRect(-T/4.5, -T/10, T/2.2, T/2.3);
            ctx.fill();
            ctx.beginPath(); ctx.arc(0, -T/4.5, T/5.2, 0, Math.PI * 2); ctx.fill();
        } else if (shape === "box") {
            ctx.beginPath();
            if(ctx.roundRect) ctx.roundRect(-T/3.5, -T/3.5, T/1.75, T/1.75, 4);
            else ctx.fillRect(-T/3.5, -T/3.5, T/1.75, T/1.75);
            ctx.fill();
        } else {
            ctx.beginPath(); ctx.arc(0, 0, T/2.5, 0, Math.PI * 2); ctx.fill();
        }

        // 目の描画
        if (dir !== 'up') {
            ctx.fillStyle = "black";
            let look = (dir === 'left' ? -1.2 : (dir === 'right' ? 1.2 : 0));
            let eyeY = (shape === "circle" || shape === "box") ? 0 : -T/4.5;
            this.drawEye(ctx, look - 2.2, eyeY); 
            this.drawEye(ctx, look + 2.2, eyeY);
        }
        ctx.restore();
    },
    drawEye: function(ctx, x, y) {
        ctx.beginPath(); ctx.ellipse(x, y, 1.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    }
};