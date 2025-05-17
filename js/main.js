// Variables globales
let lastResult = '';
let isNewCalculation = true;

// Función para agregar valores a la pantalla de la calculadora
function appendValue(value) {
    const result = document.getElementById('result');
    const expression = document.getElementById('expression');
    
    if (isNewCalculation && !'+-*/.'.includes(value)) {
        result.value = '';
        isNewCalculation = false;
    }
    
    const currentValue = result.value;
    const lastChar = currentValue[currentValue.length - 1];
    const operators = ['+', '-', '*', '/', '.'];
    
    // Evitar múltiples operadores consecutivos
    if (operators.includes(lastChar) && operators.includes(value)) {
        return;
    }
    
    // Si es el primer carácter y es un operador, no permitir (excepto el signo negativo y paréntesis)
    if (currentValue === '' && ['*', '/', '+', '.'].includes(value)) {
        if (value === '-') result.value = value;
        return;
    }
    
    // Si es un punto decimal, verificar que no haya ya un punto en el número actual
    if (value === '.') {
        const parts = currentValue.split(/[+\-*/()]/);
        if (parts[parts.length - 1].includes('.')) {
            return;
        }
    }
    
    result.value += value;
    updateExpression();
}

// Función para operaciones científicas
function scientificFunction(func, needsSecondParam = false) {
    const result = document.getElementById('result');
    let currentValue = result.value;
    
    // Manejar el caso especial de la raíz cuadrada
    if (func === 'Math.sqrt') {
        if (!currentValue) {
            showError('Ingresa un número primero');
            return;
        }
        
        const value = parseFloat(currentValue);
        if (isNaN(value)) {
            showError('Valor no válido');
            return;
        }
        
        if (value < 0) {
            showError('No se puede calcular raíz de número negativo');
            return;
        }
        
        const sqrt = Math.sqrt(value);
        result.value = sqrt.toString();
        updateExpression(`√${value} = ${sqrt}`);
        isNewCalculation = true;
        return;
    }
    
    // Manejar factorial
    if (func === 'factorial') {
        try {
            const num = parseInt(currentValue, 10);
            if (isNaN(num)) throw new Error('No es un número');
            if (num < 0) throw new Error('Número negativo');
            if (num > 20) throw new Error('Número demasiado grande');
            
            let fact = 1;
            for (let i = 2; i <= num; i++) {
                fact *= i;
            }
            result.value = fact.toString();
            updateExpression(`${num}! = ${fact}`);
            isNewCalculation = true;
        } catch (e) {
            showError(e.message);
        }
        return;
    }
    
    // Manejar constantes
    if (func === 'Math.PI' || func === 'Math.E') {
        const constant = func === 'Math.PI' ? Math.PI : Math.E;
        result.value = constant.toString();
        updateExpression(`${func.replace('Math.', '')} = ${constant}`);
        isNewCalculation = true;
        return;
    }
    
    // Para funciones que necesitan un parámetro
    if (needsSecondParam) {
        const value = parseFloat(currentValue);
        if (isNaN(value)) {
            result.value = func;
        } else {
            result.value = `${func}${value},`;
        }
        isNewCalculation = false;
        return;
    }
    
    // Para funciones trigonométricas y logarítmicas
    if (currentValue === '') {
        showError('Ingresa un valor primero');
        return;
    }
    
    const value = parseFloat(currentValue);
    if (isNaN(value)) {
        showError('Valor no válido');
        return;
    }
    
    try {
        let calculated;
        const funcName = func.replace('Math.', '');
        
        switch(func) {
            case 'Math.sin':
                calculated = Math.sin(value * (Math.PI / 180));
                break;
            case 'Math.cos':
                calculated = Math.cos(value * (Math.PI / 180));
                break;
            case 'Math.tan':
                calculated = Math.tan(value * (Math.PI / 180));
                break;
            case 'Math.log':
                if (value <= 0) throw new Error('Log de número no positivo');
                calculated = Math.log(value);
                break;
            case 'Math.log10':
                if (value <= 0) throw new Error('Log de número no positivo');
                calculated = Math.log10(value);
                break;
            default:
                showError('Función no soportada');
                return;
        }
        
        result.value = calculated.toString();
        updateExpression(`${funcName}(${value}) = ${calculated}`);
        isNewCalculation = true;
    } catch (e) {
        showError(e.message);
    }
}

// Función para actualizar la expresión mostrada
function updateExpression(expr) {
    const expression = document.getElementById('expression');
    if (expr) {
        expression.textContent = expr;
    } else {
        expression.textContent = '';
    }
}

// Función para limpiar la pantalla
function clearDisplay() {
    document.getElementById('result').value = '';
    updateExpression('');
    isNewCalculation = true;
}

// Función para mostrar error
function showError() {
    const result = document.getElementById('result');
    result.value = 'Error';
    updateExpression('Error en el cálculo');
    isNewCalculation = true;
    
    setTimeout(() => {
        clearDisplay();
    }, 1500);
}

// Función para calcular el resultado
function calculate() {
    const result = document.getElementById('result');
    const expression = result.value;
    
    if (!expression) return;
    
    try {
        // Reemplazar símbolos y funciones especiales
        let expr = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
        
        // Validar paréntesis
        const stack = [];
        for (const char of expr) {
            if (char === '(') stack.push(char);
            else if (char === ')') {
                if (stack.length === 0) throw new Error('Paréntesis desbalanceados');
                stack.pop();
            }
        }
        if (stack.length > 0) throw new Error('Paréntesis desbalanceados');
        
        // Evaluar la expresión de forma segura
        const calculated = new Function('return ' + expr)();
        
        // Mostrar el resultado con un máximo de 10 decimales
        lastResult = calculated.toString();
        result.value = parseFloat(calculated.toFixed(10)).toString();
        updateExpression(`${expression} = ${result.value}`);
        isNewCalculation = true;
    } catch (error) {
        showError();
    }
}

// Agregar soporte para teclado
document.addEventListener('keydown', (e) => {
    const key = e.key;
    const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
                      '+', '-', '*', '/', '.', '=', 'Enter', 'Backspace', 
                      'Delete', 'Escape', '(', ')', 'p', 'e', '!'];
    
    if (!validKeys.includes(key) && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
    }
    
    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        e.preventDefault();
        clearDisplay();
    } else if (key === 'Backspace' || key === 'Delete') {
        const result = document.getElementById('result');
        result.value = result.value.slice(0, -1);
        updateExpression('');
    } else if (key === 'p' && e.shiftKey) {
        e.preventDefault();
        appendValue('Math.PI');
    } else if (key === 'e' && !e.shiftKey) {
        e.preventDefault();
        appendValue('Math.E');
    } else if (key === '!') {
        e.preventDefault();
        scientificFunction('factorial');
    } else if (validKeys.includes(key)) {
        appendValue(key);
    }
});

// Inicializar la calculadora científica
document.addEventListener('DOMContentLoaded', () => {
    console.log('Calculadora científica lista para usar!');
    isNewCalculation = true;
    
    // Inicializar la calculadora de inflación
    initInflationCalculator();
    // Inicializar la calculadora de porcentaje de incremento
    initPercentageCalculator();
});

// ===== CALCULADORA DE INFLACIÓN SIMPLIFICADA =====
function initInflationCalculator() {
    const monthlyInflationInput = document.getElementById('monthly-inflation');
    
    // Configurar evento de tecla Enter
    monthlyInflationInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === 'Enter' || e.keyCode === 13) {
            calculateInflation();
        }
    });
    
    // Calcular automáticamente al cambiar el valor
    monthlyInflationInput.addEventListener('input', () => {
        calculateInflation();
    });
    
    // Enfocar el input al cargar
    monthlyInflationInput.focus();
}

function calculateInflation() {
    const monthlyRate = parseFloat(document.getElementById('monthly-inflation').value);
    
    if (isNaN(monthlyRate) || monthlyRate <= 0) {
        document.getElementById('annual-inflation').textContent = '-';
        return;
    }
    
    // Calcular inflación anual compuesta
    const monthlyRateDecimal = monthlyRate / 100;
    const annualInflation = (Math.pow(1 + monthlyRateDecimal, 12) - 1) * 100;
    
    // Actualizar la UI
    document.getElementById('annual-inflation').textContent = `${annualInflation.toFixed(2)}%`;
}

// ===== CALCULADORA DE PORCENTAJE DE INCREMENTO =====
function initPercentageCalculator() {
    const initialInput = document.getElementById('initial-price');
    const newInput = document.getElementById('new-price');
    const resultSpan = document.getElementById('percentage-result');

    function calculatePercentage() {
        const initial = parseFloat(initialInput.value);
        const current = parseFloat(newInput.value);
        if (isNaN(initial) || isNaN(current) || initial <= 0) {
            resultSpan.textContent = '-';
            return;
        }
        const percent = ((current - initial) / initial) * 100;
        resultSpan.textContent = percent.toFixed(2) + '%';
    }

    initialInput.addEventListener('input', calculatePercentage);
    newInput.addEventListener('input', calculatePercentage);
}
