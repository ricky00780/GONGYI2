// 工序状态类型
export type ProcessStatus = 'pending' | 'in-progress' | 'completed';

// 工序类型
export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  duration: number; // 预计工时（小时）
  equipment: string;
  materials: string[];
  status: ProcessStatus;
  cost: number; // 工序成本
}

// 部件信息
export interface Component {
  id: string;
  name: string;
  description: string;
  dimensions: {
    length: number; // 长度 (mm)
    width: number;  // 宽度 (mm)
    height: number; // 高度 (mm)
  };
  material: string;
  thickness: number; // 厚度 (mm)
  holeCount: number; // 开孔次数
  edgeCount: number; // 封边数量
  processSteps: ProcessStep[];
  totalCost: number; // 部件总成本
  totalDuration: number; // 部件总工时
}

// 产品信息
export interface Product {
  id: string;
  name: string;
  description: string;
  components: Component[];
  totalCost: number; // 产品总成本
  totalDuration: number; // 产品总工时
  status: ProcessStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 工时计算参数
export interface WorkTimeParams {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  thickness: number;
  holeCount: number;
  edgeCount: number;
  material: string;
}

// 成本计算参数
export interface CostParams {
  material: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  thickness: number;
  processSteps: ProcessStep[];
}