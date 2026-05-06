const display = document.getElementById('display');
const expression = document.getElementById('expression');

let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetDisplay = false;
let expressionStr = '';

function updateDisplay(value) {
  display.textContent = value;
}

function flashDisplay() {
  display.classList.add('flash');
  setTimeout(() => display.classList.remove('flash'), 200);
}

function clearActiveOperators() {
  document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active'));
}

function handleNumber(value) {
  if (shouldResetDisplay) {
    currentValue = value;
    shouldResetDisplay = false;
  } else {
    if (currentValue === '0') {
      currentValue = value;
    } else {
      if (currentValue.length >= 12) return;
      currentValue += value;
    }
  }
  updateDisplay(currentValue);
}

function handleDecimal() {
  if (shouldResetDisplay) {
    currentValue = '0.';
    shouldResetDisplay = false;
    updateDisplay(currentValue);
    return;
  }
  if (!currentValue.includes('.')) {
    currentValue += '.';
    updateDisplay(currentValue);
  }
}

function handleOperator(op) {
  clearActiveOperators();

  const activeBtn = document.querySelector(`.btn-operator[data-value="${op}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (operator && !shouldResetDisplay) {
    calculate();
  }

  previousValue = currentValue;
  operator = op;
  shouldResetDisplay = true;

  const opSymbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };
  expressionStr = `${previousValue} ${opSymbols[op] || op}`;
  expression.textContent = expressionStr;
}

async function calculate() {
  if (!operator || previousValue === '') return;

  const expr = `${previousValue}${operator}${currentValue}`;
  expressionStr = `${previousValue} ${({'/':"÷",'*':"×",'-':"−",'+':"+"})[operator]} ${currentValue} =`;
  expression.textContent = expressionStr;

  try {
    const response = await fetch('/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: expr })
    });

    const data = await response.json();

    if (data.error) {
      display.textContent = 'Error';
      display.classList.add('error');
      setTimeout(() => {
        display.classList.remove('error');
        updateDisplay('0');
      }, 1500);
    } else {
      currentValue = String(data.result);
      updateDisplay(currentValue);
      flashDisplay();
    }
  } catch (err) {
    display.textContent = 'No Server';
    display.classList.add('error');
    setTimeout(() => {
      display.classList.remove('error');
      updateDisplay('0');
    }, 1500);
  }

  operator = null;
  previousValue = '';
  shouldResetDisplay = true;
  clearActiveOperators();
}

function handleClear() {
  currentValue = '0';
  previousValue = '';
  operator = null;
  shouldResetDisplay = false;
  expressionStr = '';
  expression.textContent = '';
  updateDisplay('0');
  clearActiveOperators();
}

function handleSign() {
  if (currentValue === '0') return;
  currentValue = String(parseFloat(currentValue) * -1);
  updateDisplay(currentValue);
}

function handlePercent() {
  currentValue = String(parseFloat(currentValue) / 100);
  updateDisplay(currentValue);
}

// Click events
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
      case 'number':   handleNumber(value); break;
      case 'decimal':  handleDecimal(); break;
      case 'operator': handleOperator(value); break;
      case 'equals':   calculate(); break;
      case 'clear':    handleClear(); break;
      case 'sign':     handleSign(); break;
      case 'percent':  handlePercent(); break;
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
  else if (e.key === '.') handleDecimal();
  else if (e.key === '+') handleOperator('+');
  else if (e.key === '-') handleOperator('-');
  else if (e.key === '*') handleOperator('*');
  else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Escape') handleClear();
  else if (e.key === '%') handlePercent();
});
