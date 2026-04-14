OS.registerApp({
    id: 'taskmgr',
    name: 'Диспетчер задач',
    icon: 'tskmgr.png',
    tpicon: '📊',
    width: '400px',
    height: '450px',
    render: (container, winId) => {
        const renderList = () => {
            let html = `
                <div style="padding:15px; display:flex; flex-direction:column; height:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 style="margin:0;">Активные процессы</h3>
                        <button onclick="OS.killAllProcesses('${winId}')" 
                                style="background:#e81123; color:white; border:none; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">
                            🚩 Завершить всё
                        </button>
                    </div>
                    <div style="flex:1; overflow-y:auto; background:white; border:1px solid #ccc; border-radius:4px;">
            `;
            
            for (let id in OS.apps) {
                const app = OS.apps[id];
                html += `
                    <div style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                        <span>${app.name} <small style="color:#888;">(${id})</small></span>
                        <button onclick="OS.close('${id}')" style="cursor:pointer; background:#eee; border:1px solid #ccc; border-radius:3px; padding:2px 8px;">Убить</button>
                    </div>
                `;
            }
            
            html += `</div></div>`;
            container.innerHTML = html;
        };

        renderList();
        // Автообновление списка каждые 2 секунды, чтобы видеть новые окна
        const timer = setInterval(() => {
            if (!document.getElementById(winId)) return clearInterval(timer);
            renderList();
        }, 2000);
    }
});