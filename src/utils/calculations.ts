import type { WorkTimeParams, CostParams, ProcessStep } from '../types';

// 材料单价表 (元/平方米)
const MATERIAL_PRICES = {
  '实木板': 120,
  '密度板': 45,
  '刨花板': 35,
  '多层板': 60,
  '胶合板': 50,
  '中纤板': 40,
  '防火板': 80,
  '生态板': 70,
};

// 设备工时费率 (元/小时)
const EQUIPMENT_RATES = {
  '切割机': 80,
  '数控切割机': 120,
  '封边机': 100,
  '钻孔机': 90,
  '组装工具': 60,
  '打磨机': 70,
  '喷漆设备': 150,
  '包装设备': 50,
};

// 基础工时系数
const BASE_TIME_FACTORS = {
  '切割': 0.5, // 每平方米基础工时
  '封边': 0.3, // 每米封边工时
  '钻孔': 0.1, // 每个孔工时
  '组装': 0.8, // 每平方米组装工时
  '打磨': 0.4, // 每平方米打磨工时
  '喷漆': 1.2, // 每平方米喷漆工时
};

/**
 * 计算部件表面积 (平方米)
 */
export const calculateSurfaceArea = (dimensions: WorkTimeParams['dimensions']): number => {
  const { length, width } = dimensions;
  // 假设是板材，主要计算长宽面积
  return (length * width) / 1000000; // 转换为平方米
};

/**
 * 计算封边长度 (米)
 */
export const calculateEdgeLength = (dimensions: WorkTimeParams['dimensions']): number => {
  const { length, width } = dimensions;
  return (2 * (length + width)) / 1000; // 转换为米
};

/**
 * 根据工序名称计算工时
 */
export const calculateProcessDuration = (
  processName: string,
  params: WorkTimeParams
): number => {
  const { dimensions, holeCount, edgeCount } = params;
  const surfaceArea = calculateSurfaceArea(dimensions);
  const edgeLength = calculateEdgeLength(dimensions);

  let duration = 0;

  // 根据工序类型计算工时
  if (processName.includes('切割') || processName.includes('下料')) {
    duration = surfaceArea * BASE_TIME_FACTORS['切割'];
  } else if (processName.includes('封边')) {
    duration = edgeLength * BASE_TIME_FACTORS['封边'] * edgeCount;
  } else if (processName.includes('钻孔') || processName.includes('打孔')) {
    duration = holeCount * BASE_TIME_FACTORS['钻孔'];
  } else if (processName.includes('组装') || processName.includes('装配')) {
    duration = surfaceArea * BASE_TIME_FACTORS['组装'];
  } else if (processName.includes('打磨') || processName.includes('抛光')) {
    duration = surfaceArea * BASE_TIME_FACTORS['打磨'];
  } else if (processName.includes('喷漆') || processName.includes('涂装')) {
    duration = surfaceArea * BASE_TIME_FACTORS['喷漆'];
  } else {
    // 默认工时
    duration = 0.5;
  }

  // 根据厚度调整工时
  if (params.thickness > 25) {
    duration *= 1.2; // 厚板增加20%工时
  }

  // 根据材料调整工时
  if (params.material === '实木板') {
    duration *= 1.3; // 实木板增加30%工时
  } else if (params.material === '防火板') {
    duration *= 1.1; // 防火板增加10%工时
  }

  return Math.round(duration * 100) / 100; // 保留两位小数
};

/**
 * 计算材料成本
 */
export const calculateMaterialCost = (params: CostParams): number => {
  const { material, dimensions, thickness } = params;
  const surfaceArea = calculateSurfaceArea(dimensions);
  const materialPrice = MATERIAL_PRICES[material as keyof typeof MATERIAL_PRICES] || 50;
  
  // 基础材料成本
  let cost = surfaceArea * materialPrice;
  
  // 根据厚度调整成本
  if (thickness > 25) {
    cost *= 1.5; // 厚板增加50%成本
  }
  
  return Math.round(cost * 100) / 100;
};

/**
 * 计算工序成本
 */
export const calculateProcessCost = (processStep: ProcessStep, params: WorkTimeParams): number => {
  const equipmentRate = EQUIPMENT_RATES[processStep.equipment as keyof typeof EQUIPMENT_RATES] || 80;
  const duration = calculateProcessDuration(processStep.name, params);
  
  // 工序成本 = 设备工时费率 × 工时
  return Math.round(equipmentRate * duration * 100) / 100;
};

/**
 * 计算部件总成本
 */
export const calculateComponentTotalCost = (params: CostParams): number => {
  const materialCost = calculateMaterialCost(params);
  const processCosts = params.processSteps.reduce((total, step) => {
    return total + step.cost;
  }, 0);
  
  return Math.round((materialCost + processCosts) * 100) / 100;
};

/**
 * 计算部件总工时
 */
export const calculateComponentTotalDuration = (
  processSteps: ProcessStep[],
  params: WorkTimeParams
): number => {
  return processSteps.reduce((total, step) => {
    return total + calculateProcessDuration(step.name, params);
  }, 0);
};

/**
 * 计算产品总成本
 */
export const calculateProductTotalCost = (components: any[]): number => {
  return components.reduce((total, component) => {
    return total + component.totalCost;
  }, 0);
};

/**
 * 计算产品总工时
 */
export const calculateProductTotalDuration = (components: any[]): number => {
  return components.reduce((total, component) => {
    return total + component.totalDuration;
  }, 0);
};