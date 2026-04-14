OS.registerApp({
    id: 'settings',
    name: 'Настройки',
    icon: 'settings.png',
    tpicon: '🔧',
    width: '480px',
    height: '610px',
    render: (container) => {
        const deviceType = OS.getDeviceType();
        const platform = navigator.platform;

        container.innerHTML = `
            <div style="padding:25px;">
                <h2 style="margin-bottom:15px;">Параметры системы</h2>
                <div style="background:#f0f0f0; padding:15px; border-radius:8px; line-height: 1.6; font-size: 13px; color: #333;">
                    <p><strong>ОС:</strong> Графическая оболочка OpenTab</p>
                    <p><strong>Пользователь:</strong> OpenTab User</p>
                    <p><strong>Вариант Оболочки:</strong> Default Gray (minimalism)</p>
                    <p><strong>Версия:</strong> 1.3.10</p>
                    <p><strong>Память:</strong> [Значение Отсутствует] (Запущено в браузере)</p>
                    <p><strong>Ядро:</strong> WebKit🔧 </p>
                    <p><strong>Тип устройства:</strong> ${deviceType}</p>
                    <p><strong>Платформа(родственная):</strong> ${platform}</p>
                    <div style="text-align: left; margin-top: 10px;">
                        <img src="watermark.png" 
                            
                             style="width: 100%; max-width: 400px; border-radius: 4px; border: 1px solid #dddddd0c;">
                    </div>

                    <div style="text-align: left; margin-top: 10px;">
                        <img src="watermark2.png" 
                            
                             style="width: 100%; max-width: 100px; border-radius: 4px; border: 1px solid #dddddd0c;">
                    </div>


                    
                    <hr style="margin:10px 0; border:0; border-top:1px solid #ccc;">


                </div>
                <button onclick="location.reload()" style="margin-top:20px; padding:8px 20px; cursor:pointer; background:var(--accent); color:white; border:none; border-radius:4px; font-weight:bold;">Перезагрузка ОС</button>
                <p style="margin-top:15px; font-size:11px; color:#888;">*Внимание, это сбросит всю систему полностью, никакие изменения не сохраняются.</p>
            </div>
        `;
    }
});

//<p style="margin-top:10px;"><strong>(ОТЛАДКА) UserAgent:</strong><br>
                       // <span style="font-size:11px; color:#666; word-break: break-all;">
                       //     ${navigator.userAgent.substring(0, 100)}
                      //  </span>
                   // </p>