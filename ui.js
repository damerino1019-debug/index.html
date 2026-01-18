window.UI = {
    isTyping: false,
    timer: null,

    showText: function(el, text, name, assets) {
        el.style.display = 'block';
        
        // 名前がある場合は「名前 + 改行」を頭につける。なければ空文字。
        const header = (name && name !== "none") ? name + "\n" : "";
        const fullContent = header + text;
        
        el.innerText = ""; 
        this.isTyping = true;
        let i = 0;
        clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (i < fullContent.length) {
                el.innerText += fullContent[i];
                i++;
            } else {
                this.finishNow(el, fullContent);
            }
        }, 30);
    },

    finishNow: function(el, text) {
        clearInterval(this.timer);
        el.innerText = text;
        this.isTyping = false;
    },

    hide: function(el) {
        el.style.display = 'none';
    }
};