OS.registerApp({
    id: 'timemachine',
    name: 'Джампер',
    icon: 'jumper.png',
    tpicon: '⏳',
    width: '560px',
    height: '380px',
    render: (container, winId) => {
        // Данные точек восстановления
        const updates = [
            { ver: "Суфикс", date: "26.03.2026", desc: "<i>[Обновление дизайна]</i><br>Список изменений:<br><b>Основные</b><br>⏺ Таскбар*<br>- Переработано его оформление и функционал.<br>⏺ Системные* кнопки<br>- Пуск, заготовки (Хаб,Магазин)<br>⏺ Анимации взаимодействия<br>- С кнопками таскбара*, появлением самого окна таскбара и меню пуск<br>⏺ Исправление ошибки отображения свернутых вкладок<br> - Добавлен тригер на прокручивание строки активных приложений таскбара, добавлен градиент на краях <br> <br><b>Минорные:</b><br>- Обновленны обои, и их пак<br>- Нарисованны новые иконки, включая меню пуск<br>- Изменен эфект глассморфизма* для всей системы (увеличена прозрачность,изменен блюр*, некоторые иконки)", fileId: "1KXcPhu4fLgIoULYnk3NA_NTovjKaUHpG" },
            { ver: "v0.8 (Фрешбар)", date: "22.03.2026", desc: "Изменения:<br><b>Основные</b><br>⏺ Дизайн:<br>- Нарисованны иконки для всего и вся, включая расширения файлов.<br>⏺ AbsorbVFS Services*<br>- Теперь следит за расширением файла.", fileId: "1wtoetY4ILRQEyhq8FuJ742LhUqF80DGl" },
            { ver: "v0.7 (Дискавери)", date: "20.03.2026", desc: "Изменения:<br><b>Основные</b><br>⏺ Проводник<br>- Опять получил масштабное обновление, появилась рабочая адресная строка, возможность создания объектов прямо внутри проводника, контекстное меню теперь доступно и внутри проводника.<br>⏺ AbsorbVFS Services*<br>- Изменен подход к виртуальному хранилищу, появилась возможность создавать папки (из проводника), которые так же могут отображаться на рабочем столе.(На папки контекстное меню так же распростроняется)<br>⏺ Оформление<br>- Дизайн окон теперь смещен в сторону MacOS<br> <br><b>Минорные:</b><br>⏺ Оптимизация кода*", fileId: "1esKsO7k8OPIxkE4BFjM5gCw6yoI31Jz9" },
            { ver: "Пинатбаттер", date: "19.03.2026", desc: "Изменения:<br><b>Основные</b><br>⏺ Проводник<br>- Один из главных компонентов любой системы теперь по настоящему работает. Возможность отслеживания файлов внутри VFS* в режиме реального времени.<br>⏺ AbsorbVFS Services*<br>- При создании файла с помощью обновленного приложения 'Блокнот' файл теперь не просто существует но и отображается на рабочем столе, и в папке проводника в реальном времени.<br>⏺ Контекстное меню<br>- Теперь как и в реальных ОС нажатие правой кнопкой в браузере заблокированно, и при нажатии на файл вызывает полностью рабочее контекстное меню*(изменить/переместить/удалить<br><b>Особенности*</b><br>- Добавленны <b>пасхальные обои</b> в честь версии!)", fileId: "1aBdV1svit6so5pu44s4rZ-0yH8KkSaCr" },
            { ver: "v0.1 (Ядро)", date: "11.03.2026", desc: "<i>[Первая сборка Absorb UI]</i>", fileId: "11Ju2jbbDqvqklox9UoaP5Ae2aGg4dI5X" }
        ];

        // Основная разметка
        container.style.display = 'flex';
        container.style.height = '100%';
        container.style.background = '#fff';

        container.innerHTML = `
            <div style="width:160px; background:#f0f0f0; border-right:1px solid #ccc; overflow-y:auto;" id="tm-sidebar-${winId}">
                ${updates.map((u, i) => `
                    <div class="tm-item" data-index="${i}" style="padding:12px; border-bottom:1px solid #ddd; cursor:pointer; transition:0.2s;">
                        <b style="font-size:13px;">${u.ver}</b><br>
                        <small style="color:#666;">${u.date}</small>
                    </div>
                `).join('')}
            </div>
            <div style="flex:1; padding:20px; display:flex; flex-direction:column; overflow-y:auto; max-height:100%;" id="tm-main-${winId}">
                <div style="text-align:center; margin-top:60px; color:#999;">
                    <div style="font-size:40px;">⏳</div>
                    <p>Выберите версию слева</p>
                </div>
            </div>
        `;

        const sidebar = container.querySelector(`#tm-sidebar-${winId}`);
        const main = container.querySelector(`#tm-main-${winId}`);

        // Обработка кликов
        sidebar.querySelectorAll('.tm-item').forEach(item => {
            item.onclick = () => {
                const data = updates[item.dataset.index];
                sidebar.querySelectorAll('.tm-item').forEach(i => i.style.background = 'none');
                item.style.background = '#e0e0e0';

                // Очищаем и заполняем контент
                main.innerHTML = `
                    <h2 style="color:var(--accent); margin-top:0; flex-shrink:0;">${data.ver}</h2>
                    <div style="font-size:14px; color:#444; line-height:1.5; margin-bottom:20px;">
                        ${data.desc}
                    </div>
                    <div style="margin-top:auto; padding-top:10px; flex-shrink:0;">
                        <button onclick="window.open('https://drive.google.com/uc?export=download&id=${data.fileId}')" 
                                style="width:100%; background:#107c41; color:white; border:none; padding:12px; border-radius:4px; cursor:pointer; font-weight:bold;">
                            📥 Скачать выбранную версию (.zip)
                        </button>
                    </div>
                `;
                
                // Сбрасываем прокрутку вверх при смене версии
                main.scrollTop = 0;
            };
        });
    }
});