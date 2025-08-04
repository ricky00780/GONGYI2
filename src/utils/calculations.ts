import { 
  ComponentSize, 
  Component, 
  ComponentProcess, 
  ProcessTemplate,
  ComponentFeature,
  ProductAssembly,
  ProductComponent
} from '../types';
import { ExpressionParser } from './expressionParser';

const expressionParser = new ExpressionParser();

// 计算部件面积
export const calculateArea = (size: ComponentSize): number => {
  return size.length * size.width;
};

// 计算部件体积
export const calculateVolume = (size: ComponentSize): number => {
  return size.length * size.width * size.thickness;
};

// 获取复杂度系数
export const getComplexityFactor = (complexity: 'simple' | 'medium' | 'complex'): number => {
  return expressionParser.calculateComplexityFactor(complexity);
};

// 计算特征影响系数
export const getFeatureFactor = (features: ComponentFeature[]): number => {
  return expressionParser.calculateFeatureFactor(features);
};

// 计算单个工艺的加工时间（新版本）
export const calculateProcessTime = (
  component: Component,
  processTemplate: ProcessTemplate
): number => {
  try {
    // 准备变量
    const variables: { [key: string]: number } = {
      // 基础尺寸变量
      length: component.size.length,
      width: component.size.width,
      thickness: component.size.thickness,
      area: calculateArea(component.size),
      volume: calculateVolume(component.size),
      
      // 复杂度变量
      complexity: getComplexityFactor(component.complexity),
      
      // 特征变量
      holeCount: component.features.filter(f => f.type === 'hole').reduce((sum, f) => sum + f.count, 0),
      grooveCount: component.features.filter(f => f.type === 'groove').reduce((sum, f) => sum + f.count, 0),
      chamferCount: component.features.filter(f => f.type === 'chamfer').reduce((sum, f) => sum + f.count, 0),
      roundingCount: component.features.filter(f => f.type === 'rounding').reduce((sum, f) => sum + f.count, 0),
      
      // 特征影响系数
      featureFactor: getFeatureFactor(component.features),
      
      // 数量
      quantity: component.quantity
    };

    // 使用表达式解析器计算时间
    const calculatedTime = expressionParser.parse(processTemplate.calculationLogic.formula, variables);
    
    return Math.round(calculatedTime * 100) / 100; // 保留两位小数
  } catch (error) {
    console.error('Process time calculation error:', error);
    return 0;
  }
};

// 计算部件总加工时间
export const calculateComponentTotalTime = (component: Component): number => {
  return component.processes.reduce((total, process) => {
    return total + calculateProcessTime(component, process.processTemplate);
  }, 0);
};

// 计算产品总加工时间
export const calculateProductTotalTime = (components: Component[]): number => {
  return components.reduce((total, component) => {
    return total + (component.totalTime * component.quantity);
  }, 0);
};

// 计算产品组合总时间
export const calculateAssemblyTotalTime = (assembly: ProductAssembly): number => {
  const componentTime = assembly.components.reduce((total, pc) => {
    return total + (pc.component.totalTime * pc.quantity);
  }, 0);
  
  const assemblyTime = assembly.assemblyProcesses.reduce((total, ap) => {
    return total + ap.estimatedTime;
  }, 0);
  
  return componentTime + assemblyTime;
};

// 计算材料成本
export const calculateMaterialCost = (
  components: Component[],
  materials: { [key: string]: { price: number; unit: string } }
): number => {
  return components.reduce((total, component) => {
    const material = materials[component.material];
    if (!material) return total;
    
    const area = calculateArea(component.size);
    const areaInSquareMeters = area / 1000000; // 转换为平方米
    
    let cost = 0;
    switch (material.unit) {
      case 'piece':
        cost = material.price * component.quantity;
        break;
      case 'meter':
        cost = material.price * areaInSquareMeters * component.quantity;
        break;
      case 'kg':
        const volume = calculateVolume(component.size);
        const weightInKg = volume / 1000000000; // 转换为立方米，假设密度为1
        cost = material.price * weightInKg * component.quantity;
        break;
      default:
        cost = material.price * component.quantity;
    }
    
    return total + cost;
  }, 0);
};

// 计算人工成本
export const calculateLaborCost = (totalTime: number, hourlyRate: number = 50): number => {
  const hours = totalTime / 60; // 转换为小时
  return hours * hourlyRate;
};

// 计算总成本
export const calculateTotalCost = (
  materialCost: number,
  laborCost: number,
  overheadRate: number = 0.2 // 20%的管理费用
): number => {
  const subtotal = materialCost + laborCost;
  const overhead = subtotal * overheadRate;
  return subtotal + overhead;
};

// 格式化时间显示
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

// 格式化成本显示
export const formatCost = (cost: number): string => {
  return `¥${cost.toFixed(2)}`;
};

// 计算效率指标
export const calculateEfficiencyMetrics = (components: Component[]) => {
  const totalComponents = components.length;
  const totalProcesses = components.reduce((sum, comp) => sum + comp.processes.length, 0);
  const avgTimePerComponent = components.reduce((sum, comp) => sum + comp.totalTime, 0) / totalComponents;
  
  return {
    totalComponents,
    totalProcesses,
    avgTimePerComponent: Math.round(avgTimePerComponent * 100) / 100,
    totalTime: calculateProductTotalTime(components)
  };
};

// 验证公式语法
export const validateFormula = (formula: string): boolean => {
  return expressionParser.validate(formula);
};

// 获取公式中的变量
export const getFormulaVariables = (formula: string): string[] => {
  return expressionParser.getVariables(formula);
};

// 格式化公式显示
export const formatFormula = (formula: string, variables: { [key: string]: number }): string => {
  return expressionParser.formatFormula(formula, variables);
};

// 计算特征统计
export const calculateFeatureStats = (components: Component[]) => {
  const stats = {
    totalHoles: 0,
    totalGrooves: 0,
    totalChamfers: 0,
    totalRoundings: 0,
    totalFeatures: 0
  };

  components.forEach(component => {
    component.features.forEach(feature => {
      const count = feature.count * component.quantity;
      switch (feature.type) {
        case 'hole':
          stats.totalHoles += count;
          break;
        case 'groove':
          stats.totalGrooves += count;
          break;
        case 'chamfer':
          stats.totalChamfers += count;
          break;
        case 'rounding':
          stats.totalRoundings += count;
          break;
      }
      stats.totalFeatures += count;
    });
  });

  return stats;
};