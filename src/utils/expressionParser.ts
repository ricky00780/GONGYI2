// 表达式解析器 - 用于解析工序时间计算公式
export class ExpressionParser {
  private operators: { [key: string]: number } = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
    '(': 0,
    ')': 0
  };

  // 解析公式并计算结果
  parse(formula: string, variables: { [key: string]: number }): number {
    try {
      // 替换变量为数值
      let processedFormula = formula;
      for (const [varName, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
      }

      // 验证公式
      if (!this.validate(processedFormula)) {
        throw new Error('Invalid formula');
      }

      // 转换为后缀表达式并计算
      const postfix = this.infixToPostfix(processedFormula);
      return this.evaluatePostfix(postfix);
    } catch (error) {
      console.error('Formula parsing error:', error);
      return 0;
    }
  }

  // 验证公式语法
  validate(formula: string): boolean {
    const stack: string[] = [];
    const tokens = this.tokenize(formula);

    for (const token of tokens) {
      if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        if (stack.length === 0 || stack.pop() !== '(') {
          return false;
        }
      }
    }

    return stack.length === 0;
  }

  // 获取公式中的变量
  getVariables(formula: string): string[] {
    const variables: string[] = [];
    const tokens = this.tokenize(formula);

    for (const token of tokens) {
      if (this.isVariable(token)) {
        if (!variables.includes(token)) {
          variables.push(token);
        }
      }
    }

    return variables;
  }

  // 将中缀表达式转换为后缀表达式
  private infixToPostfix(expression: string): string[] {
    const output: string[] = [];
    const stack: string[] = [];
    const tokens = this.tokenize(expression);

    for (const token of tokens) {
      if (this.isNumber(token)) {
        output.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          output.push(stack.pop()!);
        }
        if (stack.length > 0 && stack[stack.length - 1] === '(') {
          stack.pop();
        }
      } else if (this.isOperator(token)) {
        while (
          stack.length > 0 &&
          this.operators[stack[stack.length - 1]] >= this.operators[token]
        ) {
          output.push(stack.pop()!);
        }
        stack.push(token);
      }
    }

    while (stack.length > 0) {
      output.push(stack.pop()!);
    }

    return output;
  }

  // 计算后缀表达式
  private evaluatePostfix(postfix: string[]): number {
    const stack: number[] = [];

    for (const token of postfix) {
      if (this.isNumber(token)) {
        stack.push(parseFloat(token));
      } else if (this.isOperator(token)) {
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(this.applyOperator(token, a, b));
      }
    }

    return stack[0] || 0;
  }

  // 应用运算符
  private applyOperator(operator: string, a: number, b: number): number {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      case '^': return Math.pow(a, b);
      default: return 0;
    }
  }

  // 分词
  private tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let current = '';

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (char === ' ') {
        continue;
      }

      if (this.isOperator(char) || char === '(' || char === ')') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  // 判断是否为数字
  private isNumber(token: string): boolean {
    return !isNaN(parseFloat(token)) && isFinite(parseFloat(token));
  }

  // 判断是否为运算符
  private isOperator(token: string): boolean {
    return token in this.operators && token !== '(' && token !== ')';
  }

  // 判断是否为变量
  private isVariable(token: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token) && !this.isOperator(token);
  }

  // 格式化公式显示
  formatFormula(formula: string, variables: { [key: string]: number }): string {
    let formatted = formula;
    for (const [varName, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      formatted = formatted.replace(regex, `${varName}(${value})`);
    }
    return formatted;
  }

  // 计算复杂度系数
  calculateComplexityFactor(complexity: 'simple' | 'medium' | 'complex'): number {
    switch (complexity) {
      case 'simple': return 1.0;
      case 'medium': return 1.3;
      case 'complex': return 1.8;
      default: return 1.0;
    }
  }

  // 计算特征影响系数
  calculateFeatureFactor(features: any[]): number {
    let factor = 1.0;
    
    for (const feature of features) {
      switch (feature.type) {
        case 'hole':
          factor += feature.count * 0.1; // 每个孔增加10%时间
          break;
        case 'groove':
          factor += feature.count * 0.2; // 每个槽增加20%时间
          break;
        case 'chamfer':
          factor += feature.count * 0.15; // 每个倒角增加15%时间
          break;
        case 'rounding':
          factor += feature.count * 0.25; // 每个圆角增加25%时间
          break;
      }
    }
    
    return factor;
  }
}