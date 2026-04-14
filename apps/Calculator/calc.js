OS.registerApp({
    id: 'calc',
    name: 'Калькулятор',
    icon: 'calc.png',
    tpicon: '📠',
    width: '320px',
    height: '460px',
    render: (container, winId) => {
        container.classList.add('calc-glass-container');
        container.innerHTML = `
            <div class="calc-wrapper">
                <input id="calc-res-${winId}" class="calc-screen-glass" readonly value="0">
                <div class="calc-grid-glass">
                    ${['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].map(v => {
                        let extraClass = '';
                        if (v === 'C') extraClass = 'calc-btn-clear';
                        if (['/', '*', '-', '+', '='].includes(v)) extraClass = 'calc-btn-op';
                        return `<button class="calc-btn-glass ${extraClass}" onclick="OS.calc_input('${v}', '${winId}')">${v}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
});

OS.calc_input = function(v, winId) {
    const s = document.getElementById(`calc-res-${winId}`);
    if (v === '=') {
        try { 
            let res = eval(s.value.replace(/[^-()\d/*+.]/g, '')); 
            s.value = Number.isInteger(res) ? res : res.toFixed(2);
        } catch { s.value = "Ошибка"; }
    } else if (v === 'C') {
        s.value = "0";
    } else {
        if (s.value === "0" || s.value === "Ошибка") s.value = v;
        else s.value += v;
    }
};