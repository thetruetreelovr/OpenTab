OS.registerApp({
    id: 'explorer',
    name: 'Проводник',
    icon: 'explorer.png',
    tpicon: '📂',
    render: function(container, winId) {
        let pathStr = VFS.currentPath.join('/');
        let current = OS.getFolderByPath(pathStr);
        let fullPathDisplay = 'root' + (pathStr ? '/' + pathStr : '');

        let html = `
            <div class="explorer-address-bar">
                <button class="exp-btn" onclick="OS.explorer_back('${winId}')" ${VFS.currentPath.length === 0 ? 'disabled' : ''}>⬅️</button>
                <input type="text" class="address-input" id="addr-${winId}" value="${fullPathDisplay}" 
                       onkeydown="if(event.key==='Enter') OS.explorer_navigate('${winId}', this.value)">
            </div>
            
            <div class="explorer-toolbar">
                <button class="exp-btn" onclick="OS.explorer_create('${winId}', 'file')">📄 +Файл</button>
                <button class="exp-btn" onclick="OS.explorer_create('${winId}', 'dir')">📁 +Папка</button>
                <div style="width:1px; height:20px; background:#ccc; margin:0 5px;"></div>
                <button class="exp-btn" id="copy-btn-${winId}" style="display:none;" onclick="OS.explorer_copy_selected('${winId}')">✂️ Коп.</button>
                <button class="exp-btn" onclick="OS.explorer_paste('${winId}')">📋 Вставить</button>
            </div>

            <div style="display:flex; flex-direction:column; overflow-y:auto; flex:1;">`;
        
        const items = current.content || current;
        
        // Если папка пуста
        if (Object.keys(items).length === 0 && VFS.currentPath.length === 0) {
            html += `<div style="padding:20px; color:#888; text-align:center;">Папка пуста</div>`;
        }

        for (let name in items) {
            const item = items[name];
            html += `
                <div class="file-row" 
                     onclick="OS.explorer_select('${winId}', '${name}')"
                     ondblclick="OS.explorer_click('${name}', '${item.type}', '${winId}')"
                     oncontextmenu="OS.showContextMenu(event, '${name}', '${item.type}', '${pathStr || 'root'}')">
                    <i>${item.type === 'dir' ? '📁' : '📄'}</i> <span>${name}</span>
                </div>`;
        }
        
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.innerHTML = html + `</div>`;
    }
});

// Навигация через адресную строку
OS.explorer_navigate = function(winId, rawPath) {
    let path = rawPath.replace(/^root\/?/, ''); // Убираем 'root' из начала
    if (path === "") {
        VFS.currentPath = [];
    } else {
        let parts = path.split('/').filter(p => p.length > 0);
        let current = VFS.root;
        let success = true;
        
        // Проверка существования пути
        for (let part of parts) {
            if (current[part] && current[part].type === 'dir') {
                current = current[part].content;
            } else {
                success = false; break;
            }
        }
        
        if (success) {
            VFS.currentPath = parts;
        } else {
            this.showModal("Ошибка пути", `Указанный путь "${rawPath}" не найден.`);
        }
    }
    this.registry['explorer'].render(document.getElementById(`ctx-${winId}`), winId);
};

// Создание файлов и папок
OS.explorer_create = function(winId, type) {
    let typeName = type === 'dir' ? 'папки' : 'файла';
    this.showModal(`Создание ${typeName}`, `Введите имя ${typeName}:`, (name) => {
        if (name && name.trim() !== "") {
            let pathStr = VFS.currentPath.join('/');
            let folder = this.getFolderByPath(pathStr);
            let target = folder.content || folder;
            
            if (target[name]) {
                alert("Объект с таким именем уже существует!");
            } else {
                target[name] = type === 'dir' ? { type: 'dir', content: {} } : { type: 'file', data: "" };
                this.refreshUI();
            }
        }
    }, true);
};

// Выбор файла (для появления кнопки Копировать)
OS.explorer_select = function(winId, name) {
    // Снимаем выделение со всех
    document.querySelectorAll(`#ctx-${winId} .file-row`).forEach(el => el.style.background = '');
    // Выделяем текущий (визуально)
    event.currentTarget.style.background = '#e5f3ff';
    // Показываем кнопку копирования и запоминаем выбранный файл
    let copyBtn = document.getElementById(`copy-btn-${winId}`);
    copyBtn.style.display = 'inline-flex';
    copyBtn.dataset.selectedName = name;
};

// Копирование в буфер
OS.explorer_copy_selected = function(winId) {
    let name = document.getElementById(`copy-btn-${winId}`).dataset.selectedName;
    let pathStr = VFS.currentPath.join('/');
    let folder = this.getFolderByPath(pathStr);
    let items = folder.content || folder;
    let item = items[name];

    OS.clipboard = {
        name: name,
        type: item.type,
        data: item.type === 'dir' ? JSON.parse(JSON.stringify(item.content)) : item.data,
        isCopying: true
    };
    console.log("Скопировано в буфер:", OS.clipboard.name);
};

// Вставка из буфера
OS.explorer_paste = function(winId) {
    if (!OS.clipboard.isCopying) return;

    let pathStr = (winId === 'desktop') ? 'Desktop' : VFS.currentPath.join('/');
    let folder = this.getFolderByPath(pathStr);
    let target = folder.content || folder;

    let newName = OS.clipboard.name;
    // Если файл с таким именем уже есть, добавляем суффикс
    if (target[newName]) {
        newName = "Копия_" + newName;
    }

    if (OS.clipboard.type === 'dir') {
        target[newName] = { type: 'dir', content: JSON.parse(JSON.stringify(OS.clipboard.data)) };
    } else {
        target[newName] = { type: 'file', data: OS.clipboard.data };
    }

    this.refreshUI();
};

// Обновление стандартных функций клика
OS.explorer_click = function(name, type, winId) {
    if (type === 'dir') {
        VFS.currentPath.push(name);
        OS.registry['explorer'].render(document.getElementById(`ctx-${winId}`), winId);
    } else {
        let pathStr = VFS.currentPath.join('/');
        OS.editFile(name, pathStr || 'root');
    }
};

OS.explorer_back = function(winId) {
    VFS.currentPath.pop();
    OS.registry['explorer'].render(document.getElementById(`ctx-${winId}`), winId);
};