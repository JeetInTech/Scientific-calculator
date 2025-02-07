import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Divide, 
  Minus, 
  Plus, 
  X, 
  Equal, 
  Percent, 
  Square, 
  Power, 
  RotateCcw, 
  SwitchCamera, 
  History, 
  FunctionSquare as Function, 
  Pi, 
  Sigma, 
  Infinity, 
  Delete,
  Download 
} from 'lucide-react';

type Operation = '+' | '-' | '*' | '/' | '^' | 'sqrt' | 'square' | '%' | 'sin' | 'cos' | 'tan' | 
                'asin' | 'acos' | 'atan' | 'sinh' | 'cosh' | 'tanh' | 'exp' | 'ln' | 'log' | 
                'cbrt' | 'fact' | 'nPr' | 'nCr' | '1/x' | null;
type Mode = 'normal' | 'scientific';
type AngleUnit = 'deg' | 'rad' | 'grad';

function App() {
  const [input, setInput] = useState('');
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [newNumberStarted, setNewNumberStarted] = useState(true);
  const [mode, setMode] = useState<Mode>('normal');
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState<number>(0);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [showSecondary, setShowSecondary] = useState(false);
  const [bracketCount, setBracketCount] = useState(0);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const PI = Math.PI;
  const E = Math.E;

  const downloadHistory = () => {
    const historyText = history.join('\n');
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toRadians = (value: number): number => {
    switch (angleUnit) {
      case 'deg': return value * (PI / 180);
      case 'grad': return value * (PI / 200);
      default: return value;
    }
  };

  const fromRadians = (value: number): number => {
    switch (angleUnit) {
      case 'deg': return value * (180 / PI);
      case 'grad': return value * (200 / PI);
      default: return value;
    }
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const permutation = (n: number, r: number): number => {
    if (n < r) return NaN;
    return factorial(n) / factorial(n - r);
  };

  const combination = (n: number, r: number): number => {
    if (n < r) return NaN;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };

  const handleBackspace = () => {
    if (display === '0' || display.length === 1) {
      setDisplay('0');
      setNewNumberStarted(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
    
    if (input.endsWith('(')) {
      setBracketCount(prev => prev - 1);
    } else if (input.endsWith(')')) {
      setBracketCount(prev => prev + 1);
    }
    
    setInput(prev => prev.slice(0, -1));
  };

  const handleBracket = (bracket: string) => {
    if (bracket === '(' || bracket === '{' || bracket === '[') {
      setBracketCount(prev => prev + 1);
      setInput(prev => prev + bracket);
      setNewNumberStarted(true);
    } else if (bracket === ')' || bracket === '}' || bracket === ']') {
      if (bracketCount > 0) {
        setBracketCount(prev => prev - 1);
        setInput(prev => prev + bracket);
        setNewNumberStarted(true);
      }
    }
  };

  const calculate = (a: number, b: number, op: Operation): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      case '^': return Math.pow(a, b);
      case 'sqrt': return Math.sqrt(a);
      case 'cbrt': return Math.cbrt(a);
      case 'square': return a * a;
      case '%': return a * (b / 100);
      case 'sin': return Math.sin(toRadians(a));
      case 'cos': return Math.cos(toRadians(a));
      case 'tan': return Math.tan(toRadians(a));
      case 'asin': return fromRadians(Math.asin(a));
      case 'acos': return fromRadians(Math.acos(a));
      case 'atan': return fromRadians(Math.atan(a));
      case 'sinh': return Math.sinh(a);
      case 'cosh': return Math.cosh(a);
      case 'tanh': return Math.tanh(a);
      case 'exp': return Math.exp(a);
      case 'ln': return Math.log(a);
      case 'log': return Math.log10(a);
      case 'fact': return factorial(a);
      case 'nPr': return permutation(a, b);
      case 'nCr': return combination(a, b);
      case '1/x': return 1 / a;
      default: return b;
    }
  };

  const handleNumber = (num: string) => {
    if (newNumberStarted) {
      setDisplay(num);
      setInput(prev => prev + num);
      setNewNumberStarted(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
      setInput(prev => prev + num);
    }
  };

  const handleConstant = (value: number, symbol: string) => {
    setDisplay(value.toString());
    setInput(prev => prev + symbol);
    setNewNumberStarted(true);
  };

  const handleUnaryOperation = (op: Operation, symbol: string) => {
    const currentValue = parseFloat(display);
    const result = calculate(currentValue, 0, op);
    const calculation = `${symbol}(${currentValue}) = ${result}`;
    setDisplay(result.toString());
    setInput(calculation);
    setHistory(prev => [...prev, calculation]);
    setNewNumberStarted(true);
  };

  const handleOperation = (op: Operation) => {
    const currentValue = parseFloat(display);
    let opSymbol = op;
    
    if (firstOperand === null) {
      setFirstOperand(currentValue);
      setInput(prev => `${prev} ${opSymbol} `);
    } else if (operation) {
      const result = calculate(firstOperand, currentValue, operation);
      const calculation = `${firstOperand} ${operation} ${currentValue} = ${result}`;
      setDisplay(result.toString());
      setFirstOperand(result);
      setInput(prev => `${result} ${opSymbol} `);
      setHistory(prev => [...prev, calculation]);
    }
    
    setOperation(op);
    setNewNumberStarted(true);
  };

  const handleMemory = (action: 'M+' | 'M-' | 'MR' | 'MC') => {
    const currentValue = parseFloat(display);
    switch (action) {
      case 'M+':
        setMemory(memory + currentValue);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        break;
      case 'MR':
        setDisplay(memory.toString());
        setInput(`Memory Recall (${memory})`);
        break;
      case 'MC':
        setMemory(0);
        break;
    }
    setNewNumberStarted(true);
  };

  const handleEquals = () => {
    if (firstOperand === null || operation === null) return;
    
    const secondOperand = parseFloat(display);
    const result = calculate(firstOperand, secondOperand, operation);
    const calculation = `${firstOperand} ${operation} ${secondOperand} = ${result}`;
    
    setDisplay(result.toString());
    setHistory(prev => [...prev, calculation]);
    setInput(calculation);
    setFirstOperand(null);
    setOperation(null);
    setNewNumberStarted(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setInput('');
    setFirstOperand(null);
    setOperation(null);
    setNewNumberStarted(true);
    setBracketCount(0);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setInput(prev => prev + '.');
      setNewNumberStarted(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'normal' ? 'scientific' : 'normal');
    setShowSecondary(false);
  };

  const cycleAngleUnit = () => {
    setAngleUnit(prev => {
      switch (prev) {
        case 'deg': return 'rad';
        case 'rad': return 'grad';
        default: return 'deg';
      }
    });
  };

  const handleHistoryClick = (calculation: string) => {
    const result = calculation.split('=')[1].trim();
    setDisplay(result);
    setInput(calculation);
    setFirstOperand(null);
    setOperation(null);
    setNewNumberStarted(true);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '.') handleDecimal();
      if (e.key === '+') handleOperation('+');
      if (e.key === '-') handleOperation('-');
      if (e.key === '*') handleOperation('*');
      if (e.key === '/') handleOperation('/');
      if (e.key === 'Enter') handleEquals();
      if (e.key === 'Escape') handleClear();
      if (e.key === 'Tab') {
        e.preventDefault();
        toggleMode();
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
      if (e.key === '(' || e.key === '{' || e.key === '[') {
        handleBracket(e.key);
      }
      if (e.key === ')' || e.key === '}' || e.key === ']') {
        handleBracket(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, firstOperand, operation, bracketCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-gray-600 opacity-0 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: '100%',
            animationDuration: `${Math.random() * 10 + 5}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        >
          {Math.floor(Math.random() * 10)}
        </div>
      ))}
      
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Calculator className="text-blue-400 w-6 h-6" />
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            {mode === 'normal' ? 'Calculator' : 'Scientific Calculator'}
            {mode === 'scientific' && (
              <span className="text-sm font-normal text-blue-400">
                {angleUnit.toUpperCase()}
              </span>
            )}
          </h1>
          <button 
            onClick={toggleMode} 
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Press Tab to switch mode"
          >
            <SwitchCamera className="w-6 h-6" />
          </button>
        </div>

        <div className="text-yellow-400 text-xs mb-4 text-center">
          Note: Calculator history will be lost when the page is refreshed
        </div>
        
        <div className="bg-gray-900 p-4 rounded-xl mb-6">
          <div className="text-right text-lg font-mono text-gray-400 mb-2 min-h-[1.5rem] overflow-x-auto whitespace-nowrap">
            {input}
          </div>
          <div className="text-right text-3xl font-mono text-white overflow-hidden">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {mode === 'scientific' && (
            <>
              <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                <button onClick={() => handleMemory('MC')} className="btn-mem">MC</button>
                <button onClick={() => handleMemory('MR')} className="btn-mem">MR</button>
                <button onClick={() => handleMemory('M+')} className="btn-mem">M+</button>
                <button onClick={() => handleMemory('M-')} className="btn-mem">M-</button>
                <button onClick={cycleAngleUnit} className="btn-mem">{angleUnit}</button>
              </div>

              <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                <button onClick={() => handleBracket('(')} className="btn-sci">(</button>
                <button onClick={() => handleBracket(')')} className="btn-sci">)</button>
                <button onClick={() => handleBracket('{')} className="btn-sci">{'{'}</button>
                <button onClick={() => handleBracket('}')} className="btn-sci">{'}'}</button>
                <button onClick={handleBackspace} className="btn-sci">
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                <button onClick={() => handleBracket('[')} className="btn-sci">[</button>
                <button onClick={() => handleBracket(']')} className="btn-sci">]</button>
                <button onClick={() => handleConstant(PI, 'π')} className="btn-sci">π</button>
                <button onClick={() => handleConstant(E, 'e')} className="btn-sci">e</button>
                <button onClick={() => setShowSecondary(!showSecondary)} className="btn-sci">
                  {showSecondary ? '1st' : '2nd'}
                </button>
              </div>

              {!showSecondary ? (
                <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                  <button onClick={() => handleUnaryOperation('sin', 'sin')} className="btn-sci">sin</button>
                  <button onClick={() => handleUnaryOperation('cos', 'cos')} className="btn-sci">cos</button>
                  <button onClick={() => handleUnaryOperation('tan', 'tan')} className="btn-sci">tan</button>
                  <button onClick={() => handleOperation('^')} className="btn-sci">xʸ</button>
                  <button onClick={() => handleUnaryOperation('exp', 'exp')} className="btn-sci">eˣ</button>
                </div>
              ) : (
                <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                  <button onClick={() => handleUnaryOperation('asin', 'sin⁻¹')} className="btn-sci">sin⁻¹</button>
                  <button onClick={() => handleUnaryOperation('acos', 'cos⁻¹')} className="btn-sci">cos⁻¹</button>
                  <button onClick={() => handleUnaryOperation('atan', 'tan⁻¹')} className="btn-sci">tan⁻¹</button>
                  <button onClick={() => handleOperation('square')} className="btn-sci">x²</button>
                  <button onClick={() => handleUnaryOperation('1/x', '1/x')} className="btn-sci">1/x</button>
                </div>
              )}

              <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                <button onClick={() => handleUnaryOperation('sinh', 'sinh')} className="btn-sci">sinh</button>
                <button onClick={() => handleUnaryOperation('cosh', 'cosh')} className="btn-sci">cosh</button>
                <button onClick={() => handleUnaryOperation('tanh', 'tanh')} className="btn-sci">tanh</button>
                <button onClick={() => handleOperation('sqrt')} className="btn-sci">√x</button>
                <button onClick={() => handleOperation('cbrt')} className="btn-sci">∛x</button>
              </div>

              <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                <button onClick={() => handleUnaryOperation('ln', 'ln')} className="btn-sci">ln</button>
                <button onClick={() => handleUnaryOperation('log', 'log')} className="btn-sci">log</button>
                <button onClick={() => handleUnaryOperation('fact', 'n!')} className="btn-sci">n!</button>
                <button onClick={() => handleOperation('nPr')} className="btn-sci">nPr</button>
                <button onClick={() => handleOperation('nCr')} className="btn-sci">nCr</button>
              </div>
            </>
          )}

          <button onClick={handleClear} className="btn-danger">C</button>
          <button onClick={() => handleOperation('/')} className="btn-op">
            <Divide className="w-5 h-5" />
          </button>
          <button onClick={() => handleOperation('*')} className="btn-op">
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => handleOperation('-')} className="btn-op">
            <Minus className="w-5 h-5" />
          </button>
          <button onClick={() => handleOperation('+')} className="btn-op">
            <Plus className="w-5 h-5" />
          </button>

          <button onClick={() => handleNumber('7')} className="btn">7</button>
          <button onClick={() => handleNumber('8')} className="btn">8</button>
          <button onClick={() => handleNumber('9')} className="btn">9</button>
          <button onClick={() => handleNumber('4')} className="btn">4</button>
          <button onClick={() => handleNumber('5')} className="btn">5</button>

          <button onClick={() => handleNumber('6')} className="btn">6</button>
          <button onClick={() => handleNumber('1')} className="btn">1</button>
          <button onClick={() => handleNumber('2')} className="btn">2</button>
          <button onClick={() => handleNumber('3')} className="btn">3</button>
          <button onClick={handleEquals} className="btn-equals row-span-2">
            <Equal className="w-5 h-5" />
          </button>

          <button onClick={() => handleNumber('0')} className="btn col-span-2">0</button>
          <button onClick={handleDecimal} className="btn">.</button>
          <button onClick={() => handleOperation('%')} className="btn">
            <Percent className="w-5 h-5" />
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-6 bg-gray-900 p-4 rounded-xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <History className="w-4 h-4" />
                <span className="text-sm">History</span>
              </button>
              <button
                onClick={downloadHistory}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <div className={`text-sm text-gray-400 space-y-1 overflow-y-auto transition-all duration-300 ${showFullHistory ? 'max-h-96' : 'max-h-32'}`}>
              {history.map((calc, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(calc)}
                  className="w-full text-right p-1 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                >
                  {calc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;