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

// 部件尺寸
export interface ComponentSize {
  length: number; // 长度 (mm)
  width: number;  // 宽度 (mm)
  thickness: number; // 厚度 (mm)
  area: number;   // 面积 (mm²)
  volume: number; // 体积 (mm³)
}

// 部件信息
export interface Component {
  id: string;
  name: string;
  size: ComponentSize;
  material: string;
  quantity: number;
  complexity: 'simple' | 'medium' | 'complex'; // 复杂度
  processes: ComponentProcess[];
  totalTime: number; // 总加工时间（分钟）
}

// 部件工艺
export interface ComponentProcess {
  id: string;
  processName: string;
  efficiencyConfig: EfficiencyConfig;
  calculatedTime: number; // 计算得出的时间
  actualTime?: number; // 实际用时
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
}

// 产品信息
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