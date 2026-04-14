OS.registerApp({
    id: 'notepad',
    name: 'Блокнот',
    icon: 'notes.png',
    tpicon: '📝',
    render: (container, winId, params) => {
        let fileData = params && params.data ? params.data : "";
        
        container.innerHTML = `
            <div class="nt-menu">
                <button class="nt-btn" onclick="OS.notepad_new('${winId}')">➕ Новый</button>
                <button class="nt-btn" onclick="OS.notepad_saveAs('${winId}')">💾 Сохранить как</button>
                <button class="nt-btn" style="opacity:0.5; cursor:default;">📥 Вставка</button>
            </div>
            <textarea id="area-${winId}" style="width:100%; height:calc(100% - 30px); border:none; outline:none; padding:10px; resize:none;">${fileData}</textarea>
        `;
    }
});

OS.notepad_saveAs = async function(winId) {
    const name = await OS.showModal("Сохранить как", "Введите имя файла с расширением (напр. note.txt):", null, true);
    if (name && name.trim() !== "") {
        const text = document.getElementById(`area-${winId}`).value;
        
        // Умное сохранение: определяем папку, за которой закреплено это окно
        const parentFolder = OS.apps[winId].parentFolder || 'Desktop';
        const folder = parentFolder === 'root' ? VFS.root : OS.getFolderByPath(parentFolder);
        const target = folder.content ? folder.content : folder;
        
        // Записываем файл в нужную директорию
        target[name] = { type: 'file', data: text };
        
        // Обновляем заголовок и вкладку
        OS.apps[winId].name = name;
        OS.apps[winId].parentFolder = parentFolder;
        document.getElementById(`title-${winId}`).innerText = `${name} - Блокнот`;
        
        OS.updateTaskbar();
        OS.refreshUI(); // Мгновенно обновляет Рабочий стол и Проводник
    }
};

OS.notepad_new = async function(winId) {
    const text = document.getElementById(`area-${winId}`).value;
    if (text.length > 0) {
        const confirm = await OS.showModal("Блокнот", "Сохранить изменения в текущем документе?");
        if (confirm) {
            await OS.notepad_saveAs(winId);
        }
    }
    document.getElementById(`area-${winId}`).value = "";
    OS.apps[winId].name = "Новый документ";
    document.getElementById(`title-${winId}`).innerText = "Новый документ - Блокнот";
    OS.updateTaskbar();
};