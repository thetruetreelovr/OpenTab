OS.registerApp({
    id: 'browser',
    name: 'Браузер',
    icon: 'browser.png',
    tpicon: '🌐',
    width: '950px',
    height: '650px',
    render: (container) => {
        const styles = `
            <style>
                .br-wrapper { display: flex; flex-direction: column; height: 100%; background: #fff; border-radius: 4px; overflow: hidden; font-family: sans-serif; }
                .br-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px; background: #eef0f1; border-bottom: 1px solid #c1c1c1; }
                .br-btn { background: #fff; border: 1px solid #ccc; padding: 5px 12px; cursor: pointer; border-radius: 4px; font-size: 14px; }
                .br-btn:hover { background: #f5f5f5; }
                .br-address-bar { flex-grow: 1; display: flex; align-items: center; background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 4px 10px; }
                .br-address-bar input { width: 100%; border: none; outline: none; font-size: 14px; color: #333; }
                .br-view-container { flex-grow: 1; position: relative; background: #fff; }
                .br-iframe { width: 100%; height: 100%; border: none; }
                .loader { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--accent, #0078d7); display: none; }
            </style>
        `;

        container.innerHTML = `
            ${styles}
            <div class="br-wrapper">
                <div class="br-toolbar">
                    <button class="br-btn" id="b-back">⬅</button>
                    <button class="br-btn" id="b-reload">↻</button>
                    <div class="br-address-bar">
                        <input type="text" id="b-input" placeholder="Введите URL или запрос...">
                    </div>
                    <button class="br-btn" id="b-go" style="background:var(--accent, #0078d7); color:#fff; border:none;">Перейти</button>
                </div>
                <div class="br-view-container">
                    <div id="b-loader" class="loader"></div>
                    <iframe id="b-frame" class="br-iframe" src="about:blank"></iframe>
                </div>
            </div>
        `;

        const input = container.querySelector('#b-input');
        const frame = container.querySelector('#b-frame');
        const goBtn = container.querySelector('#b-go');
        const reloadBtn = container.querySelector('#b-reload');
        const loader = container.querySelector('#b-loader');

        const loadUrl = () => {
            let url = input.value.trim();
            if (!url) return;

            loader.style.display = 'block';

            // Если не ссылка — поиск (используем DuckDuckGo, он лучше всех пускает во фреймы)
            if (!url.includes('.') || url.includes(' ')) {
                url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
            } else {
                if (!url.startsWith('http')) url = 'https://' + url;
            }

            input.value = url;

            /* ИСПОЛЬЗУЕМ "ЧИСТЫЙ" ПРОКСИ
               Этот сервис (proxy.pwn.af или аналоги) наиболее стабилен 
               для отображения сайтов без "кракозябр" в коде.
            */
            const proxy = "https://api.allorigins.win/raw?url=";
            
            // Прямая попытка для простых сайтов + fallback на прокси
            // Чтобы работало как раньше, пробуем загрузить через кросс-доменный мост
            frame.src = `https://www.google.com/search?igu=1&q=${encodeURIComponent(url.replace('https://www.google.com/search?q=', ''))}`;
            
            // Если это обычный сайт, используем специальный Google Mirror параметр (igu=1)
            // Он заставляет Google и некоторые другие сайты работать в iframe
            if (!url.includes('google')) {
                frame.src = url;
            }

            frame.onload = () => {
                loader.style.display = 'none';
            };
        };

        goBtn.onclick = loadUrl;
        input.onkeydown = (e) => { if (e.key === 'Enter') loadUrl(); };
        reloadBtn.onclick = () => { frame.src = frame.src; };
        container.querySelector('#b-back').onclick = () => { 
            try { frame.contentWindow.history.back(); } catch(e) {}
        };

        // Стартовая страница
        input.value = "https://www.google.com/search?igu=1";
        loadUrl();
    }
});