import { ComponentSize, EfficiencyConfig, Component, ComponentProcess } from '../types';

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
  switch (complexity) {
    case 'simple': return 1.0;
    case 'medium': return 1.3;
    case 'complex': return 1.8;
    default: return 1.0;
  }
};

// 计算单个工艺的加工时间
export const calculateProcessTime = (
  size: ComponentSize,
  efficiencyConfig: EfficiencyConfig,
  complexity: 'simple' | 'medium' | 'complex'
): number => {
  const area = calculateArea(size);
  const complexityFactor = getComplexityFactor(complexity);
  
  // 基础时间 + 尺寸影响 + 复杂度影响
  let calculatedTime = efficiencyConfig.baseTime;
  
  // 尺寸影响：面积越大，时间越长
  calculatedTime += (area / 10000) * efficiencyConfig.sizeFactor; // 每10000mm²增加的时间
  
  // 复杂度影响
  calculatedTime *= complexityFactor;
  
  // 转换为分钟
  if (efficiencyConfig.unit === 'hour') {
    calculatedTime *= 60;
  }
  
  return Math.round(calculatedTime * 100) / 100; // 保留两位小数
};

// 计算部件总加工时间
export const calculateComponentTotalTime = (component: Component): number => {
  return component.processes.reduce((total, process) => {
    return total + calculateProcessTime(
      component.size,
      process.efficiencyConfig,
      component.complexity
    );
  }, 0);
};

// 计算产品总加工时间
export const calculateProductTotalTime = (components: Component[]): number => {
  return components.reduce((total, component) => {
    return total + (component.totalTime * component.quantity);
  }, 0);
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