const Renderer = {
    titleStart: null,

    resetTitle: function() { this.titleStart = null; },

    /**
     * 顔（目）の描画
     */
    _drawFace: function(ctx, x, y, dir, isNone) {
        if (dir === 'up' || isNone) return; 
        const s = 4, ps = 2;
        let eyes = (dir === 'left') ? [{dx: -5, dy: -2}] : 
                   (dir === 'right') ? [{dx: 5, dy: -2}] : 
                   [{dx: -3, dy: -2}, {dx: 3, dy: -2}];
        eyes.forEach(e => {
            ctx.fillStyle = "#fff"; ctx.fillRect(x + e.dx - s/2, y + e.dy - s/2, s, s);
            ctx.fillStyle = "#000"; ctx.fillRect(x + e.dx - ps/2, y + e.dy - ps/2, ps, ps);
        });
    },

    /**
     * メイン描画メソッド
     */
    render: function(ctx, cvs, worldData, p, assetData, talkingNpc, Logic, T, mode, subText) {
        // --- 1. タイトル画面の描画 ---
        if (mode === 'title') {
            if (!this.titleStart) this.titleStart = Date.now();
            const t = (Date.now() - this.titleStart) / 1000;
            Renderer.drawCoolTitle(ctx, cvs, t, subText || "スタート！");
            return;
        }

        // --- 2. 背景とカメラオフセットの計算 ---
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        const offsetX = cvs.width / 2 - p.lx * T - T / 2;
        const offsetY = cvs.height / 2 - p.ly * T - T / 2;
        if (!worldData) return;

        // --- 3. マップ（床・壁）の描画 ---
        worldData.map.forEach((row, y) => {
            row.forEach((tile, x) => {
                ctx.fillStyle = (tile === 1) ? "#1a1a1a" : "#050505";
                ctx.fillRect(Math.floor(x * T + offsetX), Math.floor(y * T + offsetY), T - 1, T - 1);
            });
        });

        const time = Date.now();

        // --- 4. NPCの描画（AssetDataをフル反映） ---
        worldData.npcs.forEach(n => {
            if (!Logic.canShowNPC(n)) return;
            
            // AssetDataの取得（なければデフォルト）
            const asset = assetData[n.type] || assetData["default"] || { color: "#f0f", shape: "circle", scale: 1.0 };
            
            const isTalking = (talkingNpc === n);
            const isNone = (asset.animType === "none");
            let jump = 0, sx = 1.0, sy = 1.0;

            // アニメーション計算
            if (isNone) { 
                jump = 0; 
            } else if (isTalking) { 
                jump = Math.abs(Math.sin(time * 0.02)) * 12; 
            } else {
                if (asset.animType === "float") { 
                    jump = Math.sin(time * 0.002 + (n.x * n.y)) * 5 + 5; 
                } else if (asset.animType === "stretch") {
                    sy = 1.0 + Math.sin(time * 0.005) * 0.1;
                    sx = 1.0 - Math.sin(time * 0.005) * 0.1;
                } else if (asset.animType === "bounce") { 
                    jump = Math.abs(Math.sin(time * 0.005 + (n.x * n.y))) * 4; 
                }
            }
            
            const cx = n.x * T + T/2 + offsetX;
            const cy = n.y * T + T/2 + offsetY - jump;
            const r = (T/2 - 5) * (asset.scale || 1.0); // スケールの適用

            // ★ 色の設定
            ctx.fillStyle = asset.color; 
            
            ctx.beginPath();
            // ★ 形の描き分け
            if (asset.shape === "box") {
                // 四角形
                ctx.rect(cx - r * sx, cy - r * sy, r * 2 * sx, r * 2 * sy);
            } 
            else if (asset.shape === "spike") {
                // トゲトゲ（spike）の描画ロジック
                const points = 8; 
                for (let i = 0; i < points * 2; i++) {
                    const radius = (i % 2 === 0) ? r : r * 0.5;
                    const angle = (Math.PI * i) / points;
                    const tx = cx + Math.cos(angle) * radius * sx;
                    const ty = cy + Math.sin(angle) * radius * sy;
                    if (i === 0) ctx.moveTo(tx, ty);
                    else ctx.lineTo(tx, ty);
                }
                ctx.closePath();
            } 
            else {
                // デフォルト：円（楕円）
                ctx.ellipse(cx, cy, r * sx, r * sy, 0, 0, Math.PI * 2);
            }
            ctx.fill();

            // 顔の描画
            Renderer._drawFace(ctx, cx, cy, n.d || 'down', isNone);
        });

        // --- 5. プレイヤーの描画 ---
        const pJump = p.isMoving ? Math.abs(Math.sin(time * 0.015)) * 6 : 0;
        const pcx = p.lx * T + T/2 + offsetX;
        const pcy = p.ly * T + T/2 + offsetY - pJump;
        
        ctx.fillStyle = "#0f0"; // プレイヤーは緑固定
        ctx.fillRect(pcx - (T-14)/2, pcy - (T-14)/2, T-14, T-14);
        Renderer._drawFace(ctx, pcx, pcy, p.d, false);
    },

    /**
     * タイトル画面の演出
     */
    drawCoolTitle: function(ctx, cvs, t, subText) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        const centerX = cvs.width / 2;
        const bottomY = cvs.height - 100;
        const targetX = centerX - 80;
        
        let charX = cvs.width + 50 - (t * 180); 
        if (charX < targetX) charX = targetX;

        let charY = bottomY;
        let charDir = 'left';

        if (charX > targetX) {
            charY -= Math.abs(Math.sin(t * 12)) * 14; 
        }

        if (t > 1.8) {
            charDir = 'down';
            if (t > 2.2 && t < 2.7) {
                const jT = (t - 2.2) * 2;
                charY -= Math.sin(jT * Math.PI) * 25;
            }
        }

        ctx.fillStyle = "#0f0";
        ctx.fillRect(charX - 12, charY - 12, 24, 24);
        Renderer._drawFace(ctx, charX, charY, charDir, false);

        const alpha = Math.max(0, Math.min(1, t - 2.5));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "bold 36px 'Arial Black', sans-serif";
        ctx.fillText("CASTLE QUEST", centerX, 180);
        ctx.globalAlpha = 1.0;

        if (t > 3.5) {
            Renderer.drawBubble(ctx, charX + 20, charY, subText);
        }

        if (t > 5.0 && Math.floor(t * 2) % 2 === 0) {
            ctx.textAlign = "center";
            ctx.font = "bold 16px sans-serif";
            ctx.fillStyle = "#aaa";
            ctx.fillText("PRESS SPACE TO START", centerX, 300);
        }
    },

    /**
     * 吹き出しの描画
     */
    drawBubble: function(ctx, x, y, text) {
        ctx.font = "bold 16px sans-serif";
        const metrics = ctx.measureText(text);
        const w = metrics.width + 24;
        const h = 38;
        const bubbleY = y - h / 2;

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, bubbleY, w, h, 8);
        } else {
            ctx.rect(x, bubbleY, w, h);
        }
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x - 12, y);
        ctx.lineTo(x, y + 6);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + 12, y);
        ctx.textBaseline = "alphabetic";
    }
};