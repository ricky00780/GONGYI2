// 加工效率配置
export interface EfficiencyConfig {
  id: string;
  processName: string;
  baseTime: number; // 基础时间（分钟）
  sizeFactor: number; // 尺寸系数
  complexityFactor: number; // 复杂度系数
  unit: 'minute' | 'hour';
  description: string;
}

// 工序模板
export interface ProcessTemplate {
  id: string;
  name: string;
  code: string; // 工序代码
  category: 'cutting' | 'drilling' | 'edging' | 'sanding' | 'assembly' | 'finishing' | 'inspection';
  description: string;
  calculationLogic: CalculationLogic;
  requiredEquipment: string[];
  requiredMaterials: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 计算逻辑
export interface CalculationLogic {
  id: string;
  name: string;
  formula: string; // 计算公式，支持变量
  variables: CalculationVariable[];
  description: string;
  isDefault: boolean;
}

// 计算变量
export interface CalculationVariable {
  name: string;
  type: 'dimension' | 'count' | 'area' | 'volume' | 'complexity' | 'custom';
  unit: string;
  description: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
}

// 部件尺寸
export interface ComponentSize {
  length: number; // 长度 (mm)
  width: number;  // 宽度 (mm)
  thickness: number; // 厚度 (mm)
  area: number;   // 面积 (mm²)
  volume: number; // 体积 (mm³)
}

// 部件特征
export interface ComponentFeature {
  id: string;
  name: string;
  type: 'hole' | 'groove' | 'chamfer' | 'rounding' | 'custom';
  count: number; // 数量
  size?: number; // 尺寸（如孔径、槽宽等）
  position?: string; // 位置描述
  description?: string;
}

// 部件信息
export interface Component {
  id: string;
  name: string;
  code: string; // 部件代码
  size: ComponentSize;
  material: string;
  quantity: number;
  complexity: 'simple' | 'medium' | 'complex';
  features: ComponentFeature[]; // 部件特征（开孔、开槽等）
  processes: ComponentProcess[];
  totalTime: number; // 总加工时间（分钟）
  notes?: string;
}

// 部件工艺
export interface ComponentProcess {
  id: string;
  processTemplate: ProcessTemplate;
  calculatedTime: number; // 计算得出的时间
  actualTime?: number; // 实际用时
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
  parameters: ProcessParameter[]; // 工艺参数
}

// 工艺参数
export interface ProcessParameter {
  name: string;
  value: number | string;
  unit?: string;
  description?: string;
}

// 产品组合
export interface ProductAssembly {
  id: string;
  name: string;
  code: string; // 产品代码
  description: string;
  components: ProductComponent[];
  assemblyProcesses: AssemblyProcess[];
  totalComponents: number;
  totalTime: number; // 总加工时间（分钟）
  estimatedCost: number; // 预估成本
  status: 'designing' | 'in-production' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// 产品中的部件
export interface ProductComponent {
  component: Component;
  quantity: number;
  position?: string; // 在产品中的位置
  assemblyOrder: number; // 组装顺序
}

// 组装工艺
export interface AssemblyProcess {
  id: string;
  name: string;
  description: string;
  components: string[]; // 涉及的部件ID
  estimatedTime: number;
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
}

// 产品信息（兼容旧版本）
export interface Product {
  id: string;
  name: string;
  description: string;
  components: Component[];
  totalComponents: number;
  totalTime: number; // 总加工时间（分钟）
  estimatedCost: number; // 预估成本
  status: 'designing' | 'in-production' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// 材料信息
export interface Material {
  id: string;
  name: string;
  type: 'board' | 'hardware' | 'adhesive' | 'finishing';
  unit: 'piece' | 'meter' | 'kg' | 'liter';
  price: number; // 单价
  stock: number; // 库存
}

// 设备信息
export interface Equipment {
  id: string;
  name: string;
  type: string;
  efficiency: number; // 设备效率系数 (0-1)
  maintenanceStatus: 'normal' | 'maintenance' | 'repair';
  hourlyCost: number; // 每小时成本
}

// 计算表达式解析器
export interface ExpressionParser {
  parse(formula: string, variables: { [key: string]: number }): number;
  validate(formula: string): boolean;
  getVariables(formula: string): string[];
}