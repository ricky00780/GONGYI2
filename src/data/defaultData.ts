import { 
  EfficiencyConfig, 
  Material, 
  Equipment, 
  ProcessTemplate, 
  CalculationLogic, 
  CalculationVariable,
  Component,
  ComponentFeature,
  ComponentProcess,
  ProductAssembly,
  ProductComponent,
  AssemblyProcess
} from '../types';

// 计算变量定义
export const defaultCalculationVariables: CalculationVariable[] = [
  {
    name: 'length',
    type: 'dimension',
    unit: 'mm',
    description: '部件长度'
  },
  {
    name: 'width',
    type: 'dimension',
    unit: 'mm',
    description: '部件宽度'
  },
  {
    name: 'thickness',
    type: 'dimension',
    unit: 'mm',
    description: '部件厚度'
  },
  {
    name: 'area',
    type: 'area',
    unit: 'mm²',
    description: '部件面积'
  },
  {
    name: 'volume',
    type: 'volume',
    unit: 'mm³',
    description: '部件体积'
  },
  {
    name: 'complexity',
    type: 'complexity',
    unit: '',
    description: '复杂度系数',
    defaultValue: 1.0
  },
  {
    name: 'holeCount',
    type: 'count',
    unit: '个',
    description: '开孔数量',
    defaultValue: 0
  },
  {
    name: 'grooveCount',
    type: 'count',
    unit: '个',
    description: '开槽数量',
    defaultValue: 0
  },
  {
    name: 'chamferCount',
    type: 'count',
    unit: '个',
    description: '倒角数量',
    defaultValue: 0
  },
  {
    name: 'roundingCount',
    type: 'count',
    unit: '个',
    description: '圆角数量',
    defaultValue: 0
  },
  {
    name: 'featureFactor',
    type: 'custom',
    unit: '',
    description: '特征影响系数',
    defaultValue: 1.0
  },
  {
    name: 'quantity',
    type: 'count',
    unit: '个',
    description: '部件数量',
    defaultValue: 1
  }
];

// 计算逻辑定义
export const defaultCalculationLogics: CalculationLogic[] = [
  {
    id: '1',
    name: '基础切割公式',
    formula: '5 + (area / 10000) * 0.5 * complexity * featureFactor',
    variables: defaultCalculationVariables.filter(v => ['area', 'complexity', 'featureFactor'].includes(v.name)),
    description: '基础切割时间 + 面积影响 + 复杂度影响 + 特征影响',
    isDefault: true
  },
  {
    id: '2',
    name: '钻孔公式',
    formula: '2 + holeCount * 0.5 * complexity',
    variables: defaultCalculationVariables.filter(v => ['holeCount', 'complexity'].includes(v.name)),
    description: '基础钻孔时间 + 孔数影响 + 复杂度影响',
    isDefault: false
  },
  {
    id: '3',
    name: '封边公式',
    formula: '3 + (length + width) * 2 / 1000 * complexity',
    variables: defaultCalculationVariables.filter(v => ['length', 'width', 'complexity'].includes(v.name)),
    description: '基础封边时间 + 周长影响 + 复杂度影响',
    isDefault: false
  },
  {
    id: '4',
    name: '开槽公式',
    formula: '4 + grooveCount * 1.5 * complexity',
    variables: defaultCalculationVariables.filter(v => ['grooveCount', 'complexity'].includes(v.name)),
    description: '基础开槽时间 + 槽数影响 + 复杂度影响',
    isDefault: false
  },
  {
    id: '5',
    name: '打磨公式',
    formula: '4 + (area / 10000) * 0.4 * complexity',
    variables: defaultCalculationVariables.filter(v => ['area', 'complexity'].includes(v.name)),
    description: '基础打磨时间 + 面积影响 + 复杂度影响',
    isDefault: false
  },
  {
    id: '6',
    name: '组装公式',
    formula: '8 + (length + width) / 1000 * 0.5 * complexity',
    variables: defaultCalculationVariables.filter(v => ['length', 'width', 'complexity'].includes(v.name)),
    description: '基础组装时间 + 尺寸影响 + 复杂度影响',
    isDefault: false
  },
  {
    id: '7',
    name: '喷漆公式',
    formula: '15 + (area / 10000) * 0.8 * complexity',
    variables: defaultCalculationVariables.filter(v => ['area', 'complexity'].includes(v.name)),
    description: '基础喷漆时间 + 面积影响 + 复杂度影响',
    isDefault: false
  }
];

// 工序模板
export const defaultProcessTemplates: ProcessTemplate[] = [
  {
    id: '1',
    name: '切割',
    code: 'CUT',
    category: 'cutting',
    description: '根据图纸进行精确切割',
    calculationLogic: defaultCalculationLogics[0],
    requiredEquipment: ['数控切割机'],
    requiredMaterials: ['板材'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: '钻孔',
    code: 'DRILL',
    category: 'drilling',
    description: '根据设计要求进行钻孔',
    calculationLogic: defaultCalculationLogics[1],
    requiredEquipment: ['钻孔机'],
    requiredMaterials: ['钻头'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: '封边',
    code: 'EDGE',
    category: 'edging',
    description: '对切割后的板材进行封边',
    calculationLogic: defaultCalculationLogics[2],
    requiredEquipment: ['封边机'],
    requiredMaterials: ['封边条', '胶水'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: '开槽',
    code: 'GROOVE',
    category: 'cutting',
    description: '在板材上开槽',
    calculationLogic: defaultCalculationLogics[3],
    requiredEquipment: ['开槽机'],
    requiredMaterials: ['开槽刀'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: '打磨',
    code: 'SAND',
    category: 'sanding',
    description: '对表面进行打磨处理',
    calculationLogic: defaultCalculationLogics[4],
    requiredEquipment: ['打磨机'],
    requiredMaterials: ['砂纸'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    name: '组装',
    code: 'ASSEMBLE',
    category: 'assembly',
    description: '将各部件进行组装',
    calculationLogic: defaultCalculationLogics[5],
    requiredEquipment: ['组装工具'],
    requiredMaterials: ['螺丝', '连接件'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    name: '喷漆',
    code: 'PAINT',
    category: 'finishing',
    description: '表面喷漆处理',
    calculationLogic: defaultCalculationLogics[6],
    requiredEquipment: ['喷漆设备'],
    requiredMaterials: ['油漆'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    name: '质检',
    code: 'INSPECT',
    category: 'inspection',
    description: '质量检查和测试',
    calculationLogic: {
      id: '8',
      name: '质检公式',
      formula: '3 + (area / 10000) * 0.1',
      variables: defaultCalculationVariables.filter(v => ['area'].includes(v.name)),
      description: '基础质检时间 + 面积影响',
      isDefault: false
    },
    requiredEquipment: ['检测工具'],
    requiredMaterials: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 默认加工效率配置（兼容旧版本）
export const defaultEfficiencyConfigs: EfficiencyConfig[] = [
  {
    id: '1',
    processName: '切割',
    baseTime: 5,
    sizeFactor: 0.5,
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
    price: 45,
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

// 示例部件特征
export const sampleComponentFeatures: ComponentFeature[] = [
  {
    id: '1',
    name: '连接孔',
    type: 'hole',
    count: 4,
    size: 8,
    position: '四角',
    description: '用于连接桌腿的螺丝孔'
  },
  {
    id: '2',
    name: '抽屉滑轨槽',
    type: 'groove',
    count: 2,
    size: 12,
    position: '两侧',
    description: '安装抽屉滑轨的槽'
  }
];

// 示例部件
export const sampleComponents: Component[] = [
  {
    id: '1',
    name: '桌面',
    code: 'TOP-001',
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
    features: [
      {
        id: '1',
        name: '连接孔',
        type: 'hole',
        count: 4,
        size: 8,
        position: '四角',
        description: '用于连接桌腿的螺丝孔'
      }
    ],
    processes: [],
    totalTime: 0,
    notes: '主桌面，需要封边处理'
  },
  {
    id: '2',
    name: '桌腿',
    code: 'LEG-001',
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
    features: [
      {
        id: '2',
        name: '连接孔',
        type: 'hole',
        count: 2,
        size: 8,
        position: '顶部',
        description: '连接桌面的螺丝孔'
      }
    ],
    processes: [],
    totalTime: 0,
    notes: '实木桌腿，需要打磨处理'
  },
  {
    id: '3',
    name: '抽屉',
    code: 'DRAWER-001',
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
    features: [
      {
        id: '3',
        name: '抽屉滑轨槽',
        type: 'groove',
        count: 2,
        size: 12,
        position: '两侧',
        description: '安装抽屉滑轨的槽'
      },
      {
        id: '4',
        name: '拉手孔',
        type: 'hole',
        count: 1,
        size: 25,
        position: '前面板中心',
        description: '安装抽屉拉手的孔'
      }
    ],
    processes: [],
    totalTime: 0,
    notes: '抽屉组件，包含滑轨槽和拉手孔'
  }
];

// 示例组装工艺
export const sampleAssemblyProcesses: AssemblyProcess[] = [
  {
    id: '1',
    name: '桌腿组装',
    description: '将桌腿安装到桌面',
    components: ['1', '2'],
    estimatedTime: 15,
    status: 'pending',
    notes: '使用螺丝固定桌腿'
  },
  {
    id: '2',
    name: '抽屉安装',
    description: '安装抽屉到桌面下方',
    components: ['1', '3'],
    estimatedTime: 20,
    status: 'pending',
    notes: '安装滑轨并调试'
  }
];

// 示例产品组合
export const sampleProductAssembly: ProductAssembly = {
  id: '1',
  name: '现代简约书桌',
  code: 'DESK-001',
  description: '一款现代简约风格的书桌，适合家庭办公使用',
  components: [
    {
      component: sampleComponents[0],
      quantity: 1,
      position: '顶部',
      assemblyOrder: 1
    },
    {
      component: sampleComponents[1],
      quantity: 4,
      position: '四角',
      assemblyOrder: 2
    },
    {
      component: sampleComponents[2],
      quantity: 2,
      position: '下方',
      assemblyOrder: 3
    }
  ],
  assemblyProcesses: sampleAssemblyProcesses,
  totalComponents: 3,
  totalTime: 0,
  estimatedCost: 0,
  status: 'designing',
  createdAt: new Date(),
  updatedAt: new Date()
};

// 示例产品（兼容旧版本）
export const sampleProduct = {
  id: '1',
  name: '现代简约书桌',
  description: '一款现代简约风格的书桌，适合家庭办公使用',
  components: sampleComponents,
  totalComponents: 3,
  totalTime: 0,
  estimatedCost: 0,
  status: 'designing' as const,
  createdAt: new Date(),
  updatedAt: new Date()
};