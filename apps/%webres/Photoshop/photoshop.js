OS.registerApp({
    id: 'photoshop [webres]',
    name: 'Photoshop',
    icon: 'ps.png',
    tpicon: '📷',
    width: '950px',
    height: '650px',
    render: (container) => {
        const styles = `
            <style>
                .app-wrapper { 
                    display: flex; 
                    flex-direction: column; 
                    height: 100%; 
                    background: #21252b; 
                    overflow: hidden; 
                }
                .app-content { 
                    flex-grow: 1; 
                    width: 100%; 
                    height: 100%; 
                    border: none; 
                }
                .app-loader { 
                    position: absolute; 
                    top: 0; left: 0; right: 0; 
                    height: 3px; 
                    background: #3e90ff; 
                    z-index: 10;
                    display: block;
                }
            </style>
        `;

        container.innerHTML = `
            ${styles}
            <div class="app-wrapper">
                <div id="bb-loader" class="app-loader"></div>
                <iframe 
                    id="bb-frame" 
                    class="app-content" 
                    src="https://www.photopea.com/"
                    allow="fullscreen; accelerometer; gyro; microphone; camera"
                ></iframe>
            </div>
        `;

        const frame = container.querySelector('#bb-frame');
        const loader = container.querySelector('#bb-loader');

        // Убираем полоску загрузки, когда сайт прогрузился
        frame.onload = () => {
            loader.style.display = 'none';
        };
    }
});