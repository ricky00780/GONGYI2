import { EfficiencyConfig, Material, Equipment } from '../types';

// 默认加工效率配置
export const defaultEfficiencyConfigs: EfficiencyConfig[] = [
  {
    id: '1',
    processName: '切割',
    baseTime: 5, // 基础时间5分钟
    sizeFactor: 0.5, // 每10000mm²增加0.5分钟
    complexityFactor: 1.0,
    unit: 'minute',
    description: '根据图纸进行精确切割'
  },
  {
    id: '2',
    processName: '封边',
    baseTime: 3,
    sizeFactor: 0.3,
    complexityFactor: 1.0,
    unit: 'minute',
    description: '对切割后的板材进行封边处理'
  },
  {
    id: '3',
    processName: '钻孔',
    baseTime: 2,
    sizeFactor: 0.1,
    complexityFactor: 1.0,
    unit: 'minute',
    description: '根据设计要求进行钻孔'
  },
  {
    id: '4',
    processName: '打磨',
    baseTime: 4,
    sizeFactor: 0.4,
    complexityFactor: 1.0,
    unit: 'minute',
    description: '对表面进行打磨处理'
  },
  {
    id: '5',
    processName: '组装',
    baseTime: 8,
    sizeFactor: 0.2,
    complexityFactor: 1.0,
    unit: 'minute',
    description: '将各部件进行组装'
  },
  {
    id: '6',
    processName: '喷漆',
    baseTime: 15,
    sizeFactor: 0.8,
    complexityFactor: 1.0,
    unit: 'minute',
    description: '表面喷漆处理'
  },
  {
    id: '7',
    processName: '质检',
    baseTime: 3,
    sizeFactor: 0.1,
    complexityFactor: 1.0,
    unit: 'minute',
    description: '质量检查和测试'
  }
];

// 默认材料配置
export const defaultMaterials: Material[] = [
  {
    id: '1',
    name: '中密度纤维板',
    type: 'board',
    unit: 'meter',
    price: 45, // 45元/平方米
    stock: 1000
  },
  {
    id: '2',
    name: '实木板',
    type: 'board',
    unit: 'meter',
    price: 120,
    stock: 500
  },
  {
    id: '3',
    name: '封边条',
    type: 'finishing',
    unit: 'meter',
    price: 8,
    stock: 2000
  },
  {
    id: '4',
    name: '螺丝',
    type: 'hardware',
    unit: 'piece',
    price: 0.5,
    stock: 10000
  },
  {
    id: '5',
    name: '胶水',
    type: 'adhesive',
    unit: 'liter',
    price: 25,
    stock: 100
  },
  {
    id: '6',
    name: '油漆',
    type: 'finishing',
    unit: 'liter',
    price: 80,
    stock: 50
  }
];

// 默认设备配置
export const defaultEquipment: Equipment[] = [
  {
    id: '1',
    name: '数控切割机',
    type: 'cutting',
    efficiency: 0.95,
    maintenanceStatus: 'normal',
    hourlyCost: 80
  },
  {
    id: '2',
    name: '封边机',
    type: 'edging',
    efficiency: 0.90,
    maintenanceStatus: 'normal',
    hourlyCost: 60
  },
  {
    id: '3',
    name: '钻孔机',
    type: 'drilling',
    efficiency: 0.85,
    maintenanceStatus: 'normal',
    hourlyCost: 50
  },
  {
    id: '4',
    name: '打磨机',
    type: 'sanding',
    efficiency: 0.88,
    maintenanceStatus: 'normal',
    hourlyCost: 45
  },
  {
    id: '5',
    name: '组装工作台',
    type: 'assembly',
    efficiency: 0.92,
    maintenanceStatus: 'normal',
    hourlyCost: 30
  },
  {
    id: '6',
    name: '喷漆设备',
    type: 'painting',
    efficiency: 0.80,
    maintenanceStatus: 'normal',
    hourlyCost: 100
  }
];

// 示例产品数据
export const sampleProduct = {
  id: '1',
  name: '现代简约书桌',
  description: '一款现代简约风格的书桌，适合家庭办公使用',
  components: [
    {
      id: '1',
      name: '桌面',
      size: {
        length: 1200,
        width: 600,
        thickness: 18,
        area: 720000,
        volume: 12960000
      },
      material: '中密度纤维板',
      quantity: 1,
      complexity: 'medium',
      processes: [],
      totalTime: 0
    },
    {
      id: '2',
      name: '桌腿',
      size: {
        length: 700,
        width: 50,
        thickness: 50,
        area: 35000,
        volume: 1750000
      },
      material: '实木板',
      quantity: 4,
      complexity: 'simple',
      processes: [],
      totalTime: 0
    },
    {
      id: '3',
      name: '抽屉',
      size: {
        length: 400,
        width: 300,
        thickness: 15,
        area: 120000,
        volume: 1800000
      },
      material: '中密度纤维板',
      quantity: 2,
      complexity: 'complex',
      processes: [],
      totalTime: 0
    }
  ],
  totalComponents: 3,
  totalTime: 0,
  estimatedCost: 0,
  status: 'designing' as const,
  createdAt: new Date(),
  updatedAt: new Date()
};