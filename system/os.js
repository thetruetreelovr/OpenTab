const VFS = {
    root: {
        'Documents': { type: 'dir', content: {} },
        'Desktop': { type: 'dir', content: {
            //'Документация.txt': { 
             //   type: 'file', 
              //  data: (typeof SYSTEM_DOCS_CONTENT !== 'undefined' ? SYSTEM_DOCS_CONTENT : 'Файл документации не найден.') 
           // }
        } }
    },
    currentPath: []

};

const OS = {
    z: 1000, 
    apps: {}, 
    registry: {}, 
    drag: { target: null, ox: 0, oy: 0 },

    // Универсальная функция для создания HTML иконки
    getIconHTML(icon) {
        if (!icon) return '📄';
        
        // Проверяем: это путь к файлу или просто текст/эмодзи
        const isImg = icon.includes('.') || icon.includes('/') || icon.startsWith('data:');
        
        if (isImg) {
            let finalSrc = icon;
            // Если в имени нет слеша — значит это просто имя файла, добавляем путь пака
            if (!icon.includes('/') && !icon.startsWith('http') && !icon.startsWith('data:')) {
                const packPath = (typeof CONFIG_ICONPACK !== 'undefined') ? CONFIG_ICONPACK : 'icons/';
                finalSrc = packPath + icon;
            }
            return `<img src="${finalSrc}" draggable="false">`;
        }
        
        return icon; // Возвращаем как есть (эмодзи)
    },
    
    init() {
        const pack = (typeof CONFIG_ICONPACK !== 'undefined') ? CONFIG_ICONPACK : 'icons/';
        
        // 1. Установка системных иконок
        const startImg = document.getElementById('start-logo');
        if (startImg) startImg.src = pack + 'start.png';
        
        const homeImg = document.getElementById('home-logo');
        if (homeImg) homeImg.src = pack + 'home.png';
        
        const storeImg = document.getElementById('store-logo');
        if (storeImg) storeImg.src = pack + 'store.png';
        
        // 2. Загрузка окружения
        this.loadWallpaper();
        this.renderDesktop();

        // 3. Живые часы
        setInterval(() => {
            const clockEl = document.getElementById('clock');
            if (clockEl) {
                const now = new Date();
                clockEl.innerText = now.getHours().toString().padStart(2, '0') + ':' + 
                                  now.getMinutes().toString().padStart(2, '0');
            }
        }, 1000);

        // 4. ГЛОБАЛЬНЫЕ СОБЫТИЯ МЫШИ
        window.addEventListener('mouseup', () => {
            this.drag.target = null; 
        });

        window.addEventListener('click', (e) => {
            // ЗДЕСЬ ИСПРАВЛЕНИЕ: Скрываем контекстное меню при любом клике
            this.hideContextMenu();

            // Закрытие пуска при клике вне его области
            const menu = document.getElementById('start-menu');
            if (!e.target.closest('#start-menu') && !e.target.closest('#start-trigger')) {
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                    setTimeout(() => { 
                        if(!menu.classList.contains('show')) menu.style.display = 'none'; 
                    }, 300);
                }
            }
        });

        // Блокировка стандартного контекстного меню
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        // 5. ЕДИНЫЙ ОБРАБОТЧИК MOUSEMOVE (Окна + Таскбар)
        const taskContainer = document.getElementById('active-tasks');
        let currentVelocity = 0; 
        let targetVelocity = 0;  
        let isAnimating = false;

        const updateScroll = () => {
            currentVelocity += (targetVelocity - currentVelocity) * 0.12;
            if (Math.abs(currentVelocity) > 0.01) {
                isAnimating = true;
                taskContainer.scrollLeft += currentVelocity;
                requestAnimationFrame(updateScroll);
            } else {
                isAnimating = false;
                currentVelocity = 0;
            }
        };

        window.addEventListener('mousemove', (e) => {
            this.doDrag(e);

            if (!taskContainer) return;
            const rect = taskContainer.getBoundingClientRect();
            const inBox = (e.clientY >= rect.top - 60 && e.clientY <= rect.bottom + 60) &&
                          (e.clientX >= rect.left && e.clientX <= rect.right);

            if (inBox) {
                const relX = e.clientX - rect.left;
                const triggerWidth = 80; 

                if (relX < triggerWidth) {
                    targetVelocity = -8; 
                } else if (relX > rect.width - triggerWidth) {
                    targetVelocity = 8; 
                } else {
                    targetVelocity = 0;
                }

                if (!isAnimating && targetVelocity !== 0) {
                    updateScroll();
                }
            } else {
                targetVelocity = 0;
            }
        });

        // 6. Проверка переполнения таскбара
        const checkOverflow = () => {
            if (!taskContainer) return;
            if (taskContainer.scrollWidth > taskContainer.clientWidth) {
                taskContainer.classList.add('is-overflowing');
            } else {
                taskContainer.classList.remove('is-overflowing');
            }
        };

        const observer = new MutationObserver(() => {
            setTimeout(checkOverflow, 50);
        });

        if (taskContainer) {
            observer.observe(taskContainer, { childList: true });
            checkOverflow();
        }

        window.addEventListener('resize', () => {
            this.handleResize();
            checkOverflow();
        });
    },
   

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Планшет (Tablet)";
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Настольный ПК (Desktop)";
        return "Настольный ПК (Desktop)";
    },

    loadWallpaper() {
        if (typeof CONFIG_WALLPAPER !== 'undefined' && CONFIG_WALLPAPER.trim() !== '') {
            document.body.style.backgroundImage = `url('${CONFIG_WALLPAPER}')`;
        } else {
            this.setDefaultWallpaper();
        }
    },

    setDefaultWallpaper() {
        document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1920')`;
    },

    clampWindowBounds(win) {
        let currentLeft = parseInt(win.style.left, 10) || 0;
        let currentTop = parseInt(win.style.top, 10) || 0;
        const winWidth = win.offsetWidth;
        const winHeight = win.offsetHeight;
        const minVisibleX = winWidth / 8;
        const minVisibleY = winHeight / 8;
        const minX = -(winWidth - minVisibleX);
        const maxX = window.innerWidth - minVisibleX;
        const minY = 0; 
        const maxY = window.innerHeight - 40 - minVisibleY;
        
        if (currentLeft < minX) currentLeft = minX;
        if (currentLeft > maxX) currentLeft = maxX;
        if (currentTop < minY) currentTop = minY;
        if (currentTop > maxY) currentTop = maxY;
        
        win.style.left = currentLeft + 'px';
        win.style.top = currentTop + 'px';
    },

    handleResize() {
        for (let winId in this.apps) {
            const win = document.getElementById(winId);
            if (win) this.clampWindowBounds(win);
        }
    },

    renderDesktop() {
        const d = document.getElementById('desktop'); 
        if (!d) return;
        d.innerHTML = '';

        // 1. Отрисовка ярлыков приложений
        for (let id in this.registry) {
            const app = this.registry[id];
            const div = document.createElement('div');
            div.className = 'shortcut';
            div.ondblclick = () => this.open(id);
            
            let iconContent = app.icon;
            const isImg = iconContent.includes('.') || iconContent.includes('/');
            
            if (isImg) {
                // Если указано только имя файла без пути, добавляем CONFIG_ICONPACK
                let src = iconContent;
                if (!iconContent.includes('/') && !iconContent.startsWith('http')) {
                    const pack = (typeof CONFIG_ICONPACK !== 'undefined') ? CONFIG_ICONPACK : 'icons/';
                    src = pack + iconContent;
                }
                iconContent = `<img src="${src}" draggable="false">`;
            }
                
            div.innerHTML = `<i>${iconContent}</i><span>${app.name}</span>`;
            d.appendChild(div);
        }

        // 2. Отрисовка файлов на рабочем столе (включая Документацию)
        const desktopFolder = VFS.root['Desktop'];
        if (desktopFolder && desktopFolder.content) {
            const desk = desktopFolder.content;
            for (let name in desk) {
                const item = desk[name];
                const div = document.createElement('div');
                div.className = 'shortcut';
                div.ondblclick = () => this.editFile(name, 'Desktop');
                div.oncontextmenu = (e) => this.showContextMenu(e, name, item.type, 'Desktop');

                const iconPath = this.getFileIcon(name, item.type);
                
                // Для файлов всегда используем <img>, так как getFileIcon теперь возвращает пути к картинкам
                div.innerHTML = `<i><img src="${iconPath}" draggable="false"></i><span>${name}</span>`;
                d.appendChild(div);
            }
        }
    },

  getFileIcon(name, type) {
        // Проверяем наличие переменной из config.js
        const pack = (typeof CONFIG_ICONPACK !== 'undefined') ? CONFIG_ICONPACK : 'icons/';
        const extFolder = pack + 'ext/';

        if (type === 'dir') return pack + 'folder.png';
        if (name === 'Документация.txt') return pack + 'about.png';
        if (name.endsWith('.sys')) return pack + 'sysfiles.png';
        if (name.endsWith('.txt')) return pack + 'txtfile.png';

        const extList = ['pdf', 'ppt', 'css', 'docx', 'epub', 'html', 'xlsx', 'pptx', 'doc', 'eps', 'xls', 'csv'];
        const fileExt = name.split('.').pop().toLowerCase();

        if (extList.includes(fileExt)) {
            return extFolder + fileExt + '.png';
        }

        return pack + 'unknown.png';
    },

    showModal(title, text, onConfirm, showInput = false) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">${title}</div>
                <div class="modal-body">${text}${showInput ? '<br><input id="modal-input" style="width:100%; margin-top:10px; padding:5px; outline:none; border:1px solid #ccc;">' : ''}</div>
                <div class="modal-footer">
                    <button id="modal-cancel" style="padding:5px 10px; cursor:pointer;">Отмена</button>
                    <button id="modal-ok" style="background:var(--accent); color:white; border:none; padding:5px 15px; border-radius:3px; cursor:pointer;">ОК</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        return new Promise((resolve) => {
            document.getElementById('modal-ok').onclick = () => {
                const val = showInput ? document.getElementById('modal-input').value : true;
                overlay.remove();
                if (onConfirm) onConfirm(val);
                resolve(val);
            };
            document.getElementById('modal-cancel').onclick = () => { overlay.remove(); resolve(null); };
        });
    },

    showContextMenu(e, name, type, parentFolder) {
        this.hideContextMenu();
        e.stopPropagation(); e.preventDefault();
        const menu = document.createElement('div');
        menu.className = 'context-menu'; menu.id = 'ctx-menu';
        menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
        menu.innerHTML = `
            <div class="menu-item" onclick="OS.editFile('${name}', '${parentFolder}')">📝 Изменить</div>
            <div class="menu-item" onclick="OS.renamePrompt('${name}', '${parentFolder}')">💬 Переименовать</div>
            <div class="menu-item" onclick="OS.movePrompt('${name}', '${parentFolder}')">📂 Переместить</div>
            <div style="border-top:1px solid #ccc; margin:5px 0;"></div>
            <div class="menu-item" style="color:red;" onclick="OS.deletePrompt('${name}', '${parentFolder}')">❌ Удалить</div>`;
        document.body.appendChild(menu);
    },

    hideContextMenu() {
        const cm = document.getElementById('ctx-menu');
        if (cm) {
            cm.remove();
        }
    },

    deletePrompt(name, parent) {
        this.showModal("Удаление", `Вы уверены, что хотите навсегда удалить "${name}"?`, (confirm) => {
            if(confirm) {
                const folder = parent === 'root' ? VFS.root : this.getFolderByPath(parent);
                const target = folder.content ? folder.content : folder;
                delete target[name]; this.refreshUI(); 
            }
        });
    },

    renamePrompt(name, parent) {
        this.showModal("Переименование", `Введите новое имя для "${name}":`, (newName) => {
            if(newName && newName.trim() !== "") {
                const folder = parent === 'root' ? VFS.root : this.getFolderByPath(parent);
                const target = folder.content ? folder.content : folder;
                target[newName] = target[name]; delete target[name]; this.refreshUI();
            }
        }, true);
    },

    editFile(name, parent) {
        const folder = parent === 'root' ? VFS.root : this.getFolderByPath(parent);
        const file = folder.content ? folder.content[name] : folder[name];
        if (file && file.type === 'file') {
            this.open('notepad', {name: name, data: file.data, parent: parent});
        }
    },

    movePrompt(name, parent) {
        this.showModal("Переместить", "Укажите путь (например: Desktop или Documents):", (dest) => {
            if (dest && VFS.root[dest]) {
                const sourceFolder = parent === 'root' ? VFS.root : this.getFolderByPath(parent);
                const targetFolder = VFS.root[dest].content;
                const sourceContent = sourceFolder.content ? sourceFolder.content : sourceFolder;
                targetFolder[name] = sourceContent[name];
                delete sourceContent[name]; this.refreshUI();
            } else if (dest) {
                alert("Указанная папка не найдена!");
            }
        }, true);
    },

    getFolderByPath(path) {
        if (!path || path === 'root') return VFS.root;
        let current = VFS.root;
        path.split('/').forEach(p => { if(p && current[p]) current = current[p].content; });
        return current;
    },

    refreshUI() {
        this.renderDesktop();
        for (let winId in this.apps) {
            if (this.apps[winId].id === 'explorer') {
                const ctx = document.getElementById(`ctx-${winId}`);
                if(ctx) this.registry['explorer'].render(ctx, winId);
            }
        }
    },

    registerApp(config) { this.registry[config.id] = config; },

    open(id, params = null) {
    const app = this.registry[id];
    if (!app) return;

    const winId = params ? `win-${id}-${Date.now()}` : `win-${id}`;
    
    // ПРОВЕРКА: если окно уже открыто, просто показываем его
    const existing = document.getElementById(winId);
    if (existing) {
        this.z++;
        existing.style.zIndex = this.z;
        existing.style.display = 'flex';
        this.updateTaskbar(); // Обновляем таскбар, чтобы вкладка подсветилась
        return;
    }

    // Создание окна
    const win = document.createElement('div');
    win.id = winId; 
    win.className = 'window';
    win.style.width = app.width || '550px'; 
    win.style.height = app.height || '400px';
    win.style.left = (150 + Object.keys(this.apps).length * 25) + 'px'; 
    win.style.top = (100 + Object.keys(this.apps).length * 25) + 'px'; 
    win.style.zIndex = ++this.z;
    
    const windowTitle = params && params.name ? params.name : (id === 'notepad' ? "Новый документ" : app.name);
    
    win.innerHTML = `
        <div class="win-header" onmousedown="OS.startDrag(event, '${winId}')">
            <span class="win-title" id="title-${winId}">${windowTitle}</span>
            <div class="win-controls">
                <button class="win-btn" onclick="OS.minimize('${winId}')">🟡</button>
                <button class="win-btn close" onclick="OS.close('${winId}')">🔴</button>
            </div>
        </div>
        <div class="win-content" id="ctx-${winId}"></div>`;
        
    document.body.appendChild(win);
    this.clampWindowBounds(win);
    
    // Регистрируем запущенное приложение
    this.apps[winId] = { id: id, name: windowTitle, parentFolder: params && params.parent ? params.parent : 'Desktop' };
    
    // ВАЖНО: вызываем рендер приложения в созданный контейнер
    const container = document.getElementById(`ctx-${winId}`);
    if (app.render) {
        app.render(container, winId, params);
    }

    this.updateTaskbar();
    document.getElementById('start-menu').style.display = 'none';
},

    startDrag(e, winId) {
        this.focus(winId);
        const win = document.getElementById(winId);
        this.drag.target = win;
        this.drag.ox = e.clientX - win.offsetLeft;
        this.drag.oy = e.clientY - win.offsetTop;
    },

    doDrag(e) {
        if (!this.drag.target) return;
        let newX = e.clientX - this.drag.ox;
        let newY = e.clientY - this.drag.oy;
        const win = this.drag.target;
        const winWidth = win.offsetWidth;
        const winHeight = win.offsetHeight;
        const minVisibleX = winWidth / 8;
        const minVisibleY = winHeight / 8;
        const minX = -(winWidth - minVisibleX);
        const maxX = window.innerWidth - minVisibleX;
        const minY = 0; 
        const maxY = window.innerHeight - 40 - minVisibleY;
        if (newX < minX) newX = minX;
        if (newX > maxX) newX = maxX;
        if (newY < minY) newY = minY;
        if (newY > maxY) newY = maxY;
        win.style.left = newX + 'px';
        win.style.top = newY + 'px';
    },

    focus(winId) { 
        const el = document.getElementById(winId); 
        if(el) {
            el.classList.remove('minimized');
            el.style.zIndex = ++this.z; 
        }
    },

    minimize(winId) {
        const win = document.getElementById(winId);
        if (win) {
            win.classList.add('minimized');
            this.updateTaskbar();
        }
    },

    toggleWindow(winId) {
        const win = document.getElementById(winId);
        if (!win) return;
        if (win.classList.contains('minimized')) {
            this.focus(winId);
        } else {
            if (parseInt(win.style.zIndex) === this.z) {
                this.minimize(winId);
            } else {
                this.focus(winId);
            }
        }
        this.updateTaskbar();
    },

    close(winId) { 
        if(document.getElementById(winId)) document.getElementById(winId).remove(); 
        delete this.apps[winId]; this.updateTaskbar(); 
    },

    updateTaskbar() {
        const tb = document.getElementById('active-tasks');
        tb.innerHTML = '';
        for (let winId in this.apps) {
            const win = document.getElementById(winId);
            const isMin = win && win.classList.contains('minimized');
            const tab = document.createElement('div');
            tab.className = 'task-tab' + (isMin ? ' min-tab' : '');
            tab.innerText = this.apps[winId].name;
            tab.onclick = (e) => { e.stopPropagation(); this.toggleWindow(winId); };
            tb.appendChild(tab);
        }
    },

  toggleStart(e) {
        if (e) e.stopPropagation();
        const menu = document.getElementById('start-menu');
        
        if (menu.classList.contains('show')) {
            // Закрываем
            menu.classList.remove('show');
            // Ждем окончания анимации (300ms из CSS) перед тем как скрыть физически
            setTimeout(() => { 
                if(!menu.classList.contains('show')) menu.style.display = 'none'; 
            }, 300);
        } else {
            // Открываем
            this.renderStart(); 
            menu.style.display = 'flex';
            // Небольшой таймаут, чтобы браузер успел применить display: flex
            // иначе анимация transition не сработает
            setTimeout(() => {
                menu.classList.add('show');
            }, 10);
        }
    },

    killAllProcesses(excludeWinId) {
        this.showModal("🗑 Очистка", "Завершить все? Все несохраненные данные приложений будут безвозвратно удалены.", (confirm) => {
            if (confirm) {
                for (let winId in this.apps) {
                    if (winId !== excludeWinId) this.close(winId);
                }
                this.refreshUI();
            }
        });
    },

    rebootPrompt() {
        this.showModal("Перезагрузка", "Вы уверены, что хотите перезагрузить ОС? Все несохраненные данные (окна и созданные файлы) будут утеряны.", (confirm) => {
            if (confirm) location.reload();
        });
    },

    renderStart() {
        const list = document.getElementById('start-list');
        if (!list) return;
        list.innerHTML = '';
        
        // Рендерим приложения из реестра
        for (let id in this.registry) {
            const app = this.registry[id];
            const item = document.createElement('div');
            item.className = 'start-app-item';
            
            item.onclick = () => { 
                this.open(id); 
                this.toggleStart(); // Закрываем меню после открытия приложения
            };
            
            // Логика иконок
            const startIcon = app.tpicon ? app.tpicon : (app.icon || '📦');
            
            item.innerHTML = `
                <span class="start-tpicon" style="font-size:20px; margin-right:15px;">${startIcon}</span> 
                <span>${app.name}</span>
            `;
            list.appendChild(item);
        }

        // Разделительная линия
        const separator = document.createElement('div');
        separator.style.borderTop = '1px solid rgba(0,0,0,0.1)';
        separator.style.margin = '8px 0';
        list.appendChild(separator);

        // КНОПКА ПЕРЕЗАГРУЗКИ С ПОДТВЕРЖДЕНИЕМ
        const rebootBtn = document.createElement('div');
        rebootBtn.className = 'start-app-item';
        rebootBtn.style.color = '#e81123';
        rebootBtn.innerHTML = `<span style="margin-right:15px; font-size:18px;">🔁</span> Перезагрузка`;
        
        rebootBtn.onclick = () => { 
            // Сначала закрываем Пуск, чтобы он не мешал алерту
            this.toggleStart(); 
            
            // Вызываем правильную функцию перезагрузки, которая уже есть в твоем коде
            this.rebootPrompt();
        };
        list.appendChild(rebootBtn);
    },
};