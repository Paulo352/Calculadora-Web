(function(){
  'use strict';

  const output = document.getElementById('output');
  const historyEl = document.getElementById('history');
  const keys = document.querySelector('.keys');

  // Estado da calculadora
  const state = {
    a: null,           // primeiro operando (number)
    b: null,           // segundo operando (number)
    op: null,          // operação: 'add' | 'subtract' | 'multiply' | 'divide'
    justEvaluated: false, // se a última ação foi '='
    typingB: false,    // se estamos digitando o segundo operando
  };

  // Utilidades
  const fmt = (n) => {
    if (!isFinite(n)) return 'Não definido';
    // limitar precisão evitando erros de ponto flutuante
    const s = (+n).toPrecision(12);
    // remover zeros e ponto extra
    return parseFloat(s).toString().replace('.', ',');
  };

  const parseDisplay = () => parseFloat(output.textContent.replace(/\./g, '').replace(',', '.')) || 0;

  const setDisplay = (text) => {
    output.textContent = text;
  };

  const appendDigit = (d) => {
    if (state.justEvaluated) {
      // iniciar novo cálculo
      state.a = null; state.b = null; state.op = null;
      state.justEvaluated = false; state.typingB = false;
      setDisplay('0');
      historyEl.textContent = '';
    }
    let cur = output.textContent;
    if (cur === '0') cur = '';
    setDisplay(cur + d);
  };

  const appendDecimal = () => {
    if (state.justEvaluated) {
      state.a = null; state.b = null; state.op = null;
      state.justEvaluated = false; state.typingB = false;
      setDisplay('0');
      historyEl.textContent = '';
    }
    if (!output.textContent.includes(',')) {
      setDisplay(output.textContent + (output.textContent === '' ? '0,' : ','));
    }
  };

  const applyOp = () => {
    if (state.op == null || state.a == null) return;
    const b = parseDisplay();
    state.b = b;
    let res;
    switch (state.op) {
      case 'add': res = state.a + b; break;
      case 'subtract': res = state.a - b; break;
      case 'multiply': res = state.a * b; break;
      case 'divide':
        if (b === 0) { setDisplay('Não definido'); state.a=null; state.op=null; historyEl.textContent='Divisão por zero'; return; }
        res = state.a / b; break;
    }
    setDisplay(fmt(res));
    historyEl.textContent = '';
    state.a = res;
    state.justEvaluated = true;
    state.typingB = false;
  };

  const chooseOp = (op) => {
    const cur = parseDisplay();
    if (state.op && state.typingB) {
      // troca de operação: calcula antes
      applyOp();
    }
    state.a = parseDisplay();
    state.op = op;
    state.typingB = true;
    state.justEvaluated = false;
    setDisplay('0');
    const symbol = {add: '+', subtract: '−', multiply: '×', divide: '÷'}[op];
    historyEl.textContent = fmt(state.a).replace(',', '.') + ' ' + symbol;
  };

  const clearAll = () => {
    state.a = state.b = null;
    state.op = null;
    state.justEvaluated = false;
    state.typingB = false;
    setDisplay('0');
    historyEl.textContent = '';
  };

  const backspace = () => {
    if (state.justEvaluated) return; // não apaga resultado final
    const cur = output.textContent;
    if (cur.length <= 1) setDisplay('0');
    else setDisplay(cur.slice(0, -1));
  };

  const toggleSign = () => {
    if (output.textContent === '0') return;
    if (output.textContent.startsWith('-')) {
      setDisplay(output.textContent.slice(1));
    } else {
      setDisplay('-' + output.textContent);
    }
  };

  const percent = () => {
    // Percentual aplicado ao primeiro operando quando há operação, senão % do número atual
    const cur = parseDisplay();
    let val;
    if (state.op && state.a != null) {
      val = state.a * (cur / 100);
    } else {
      val = cur / 100;
    }
    setDisplay(fmt(val));
  };

  // Clicks
  keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;
    const num = btn.getAttribute('data-num');
    const op = btn.getAttribute('data-op');
    const action = btn.getAttribute('data-action');

    if (num !== null) appendDigit(num);
    else if (op) chooseOp(op);
    else if (action === 'decimal') appendDecimal();
    else if (action === 'equals') applyOp();
    else if (action === 'clear') clearAll();
    else if (action === 'backspace') backspace();
    else if (action === 'sign') toggleSign();
    else if (action === 'percent') percent();
  });

  // Teclado
  window.addEventListener('keydown', (e) => {
    const k = e.key;

    if (/^[0-9]$/.test(k)) { appendDigit(k); return; }
    if (k === ',' || k === '.') { appendDecimal(); e.preventDefault(); return; }

    if (k === '+' ) { chooseOp('add'); return; }
    if (k === '-') { chooseOp('subtract'); return; }
    if (k === '*' || k === 'x' || k === 'X') { chooseOp('multiply'); return; }
    if (k === '/' ) { chooseOp('divide'); return; }

    if (k === 'Enter' || k === '=') { applyOp(); e.preventDefault(); return; }
    if (k === 'Backspace') { backspace(); return; }
    if (k === 'Escape') { clearAll(); return; }
  });

  // Inicializa
  clearAll();
})();