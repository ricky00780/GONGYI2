import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Tabs,
  Divider,
  Descriptions
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalculatorOutlined, EyeOutlined } from '@ant-design/icons';
import { Component, ComponentSize, EfficiencyConfig, ComponentProcess } from '../types';
import { calculateArea, calculateVolume, calculateProcessTime, formatTime, formatCost } from '../utils/calculations';

const { Option } = Select;
const { TabPane } = Tabs;

interface ProductDesignerProps {
  components: Component[];
  efficiencyConfigs: EfficiencyConfig[];
  materials: { [key: string]: { price: number; unit: string } };
  onUpdate: (components: Component[]) => void;
}

const ProductDesigner: React.FC<ProductDesignerProps> = ({
  components,
  efficiencyConfigs,
  materials,
  onUpdate
}) => {
  const [isComponentModalVisible, setIsComponentModalVisible] = useState(false);
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [editingProcess, setEditingProcess] = useState<ComponentProcess | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [componentForm] = Form.useForm();
  const [processForm] = Form.useForm();

  // 计算组件总时间
  const calculateComponentTime = (component: Component): number => {
    return component.processes.reduce((total, process) => {
      return total + calculateProcessTime(
        component.size,
        process.efficiencyConfig,
        component.complexity
      );
    }, 0);
  };

  // 更新组件时间
  const updateComponentTime = (componentId: string) => {
    const updatedComponents = components.map(comp => {
      if (comp.id === componentId) {
        return {
          ...comp,
          totalTime: calculateComponentTime(comp)
        };
      }
      return comp;
    });
    onUpdate(updatedComponents);
  };

  // 计算材料成本
  const calculateMaterialCost = (component: Component): number => {
    const material = materials[component.material];
    if (!material) return 0;
    
    const area = calculateArea(component.size);
    const areaInSquareMeters = area / 1000000;
    
    let cost = 0;
    switch (material.unit) {
      case 'piece':
        cost = material.price * component.quantity;
        break;
      case 'meter':
        cost = material.price * areaInSquareMeters * component.quantity;
        break;
      default:
        cost = material.price * component.quantity;
    }
    
    return cost;
  };

  const componentColumns = [
    {
      title: '部件名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '尺寸 (mm)',
      key: 'size',
      width: 150,
      render: (_, record: Component) => (
        <span>
          {record.size.length}×{record.size.width}×{record.size.thickness}
        </span>
      ),
    },
    {
      title: '面积/体积',
      key: 'areaVolume',
      width: 120,
      render: (_, record: Component) => (
        <div>
          <div>面积: {(calculateArea(record.size) / 1000000).toFixed(2)}m²</div>
          <div>体积: {(calculateVolume(record.size) / 1000000000).toFixed(3)}m³</div>
        </div>
      ),
    },
    {
      title: '材料',
      dataIndex: 'material',
      key: 'material',
      width: 120,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '复杂度',
      dataIndex: 'complexity',
      key: 'complexity',
      width: 100,
      render: (complexity: string) => {
        const color = complexity === 'complex' ? 'red' : complexity === 'medium' ? 'orange' : 'green';
        const text = complexity === 'complex' ? '复杂' : complexity === 'medium' ? '中等' : '简单';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '工艺数',
      key: 'processCount',
      width: 80,
      render: (_, record: Component) => record.processes.length,
    },
    {
      title: '总时间',
      key: 'totalTime',
      width: 100,
      render: (_, record: Component) => formatTime(record.totalTime),
    },
    {
      title: '材料成本',
      key: 'materialCost',
      width: 100,
      render: (_, record: Component) => formatCost(calculateMaterialCost(record)),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Component) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelectedComponent(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => editComponent(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => setSelectedComponent(record)}
          >
            工艺
          </Button>
          <Popconfirm
            title="确定要删除这个部件吗？"
            onConfirm={() => deleteComponent(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const processColumns = [
    {
      title: '工艺名称',
      dataIndex: 'processName',
      key: 'processName',
      width: 120,
    },
    {
      title: '基础时间',
      key: 'baseTime',
      width: 100,
      render: (_, record: ComponentProcess) => (
        <span>{record.efficiencyConfig.baseTime} {record.efficiencyConfig.unit === 'minute' ? '分钟' : '小时'}</span>
      ),
    },
    {
      title: '计算时间',
      key: 'calculatedTime',
      width: 100,
      render: (_, record: ComponentProcess) => formatTime(record.calculatedTime),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status === 'completed' ? 'green' : status === 'in-progress' ? 'blue' : 'default';
        const text = status === 'completed' ? '已完成' : status === 'in-progress' ? '进行中' : '待开始';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ComponentProcess) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => editProcess(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个工艺吗？"
            onConfirm={() => deleteProcess(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showComponentModal = () => {
    setEditingComponent(null);
    componentForm.resetFields();
    setIsComponentModalVisible(true);
  };

  const editComponent = (component: Component) => {
    setEditingComponent(component);
    componentForm.setFieldsValue({
      ...component,
      length: component.size.length,
      width: component.size.width,
      thickness: component.size.thickness,
    });
    setIsComponentModalVisible(true);
  };

  const deleteComponent = (id: string) => {
    const updatedComponents = components.filter(comp => comp.id !== id);
    onUpdate(updatedComponents);
    message.success('部件已删除');
  };

  const handleComponentOk = () => {
    componentForm.validateFields().then(values => {
      const { length, width, thickness, ...rest } = values;
      const size: ComponentSize = {
        length,
        width,
        thickness,
        area: length * width,
        volume: length * width * thickness,
      };

      if (editingComponent) {
        // 编辑现有部件
        const updatedComponents = components.map(comp =>
          comp.id === editingComponent.id
            ? { ...comp, ...rest, size, totalTime: calculateComponentTime({ ...comp, ...rest, size }) }
            : comp
        );
        onUpdate(updatedComponents);
        message.success('部件已更新');
      } else {
        // 添加新部件
        const newComponent: Component = {
          id: Date.now().toString(),
          ...rest,
          size,
          processes: [],
          totalTime: 0,
        };
        onUpdate([...components, newComponent]);
        message.success('部件已添加');
      }
      setIsComponentModalVisible(false);
      componentForm.resetFields();
    });
  };

  const handleComponentCancel = () => {
    setIsComponentModalVisible(false);
    componentForm.resetFields();
  };

  const showProcessModal = () => {
    if (!selectedComponent) {
      message.warning('请先选择一个部件');
      return;
    }
    setEditingProcess(null);
    processForm.resetFields();
    setIsProcessModalVisible(true);
  };

  const editProcess = (process: ComponentProcess) => {
    setEditingProcess(process);
    processForm.setFieldsValue(process);
    setIsProcessModalVisible(true);
  };

  const deleteProcess = (processId: string) => {
    if (!selectedComponent) return;
    
    const updatedProcesses = selectedComponent.processes.filter(p => p.id !== processId);
    const updatedComponent = { ...selectedComponent, processes: updatedProcesses };
    
    const updatedComponents = components.map(comp =>
      comp.id === selectedComponent.id ? updatedComponent : comp
    );
    
    onUpdate(updatedComponents);
    updateComponentTime(selectedComponent.id);
    message.success('工艺已删除');
  };

  const handleProcessOk = () => {
    processForm.validateFields().then(values => {
      if (!selectedComponent) return;

      const efficiencyConfig = efficiencyConfigs.find(ec => ec.processName === values.processName);
      if (!efficiencyConfig) {
        message.error('未找到对应的效率配置');
        return;
      }

      const calculatedTime = calculateProcessTime(
        selectedComponent.size,
        efficiencyConfig,
        selectedComponent.complexity
      );

      if (editingProcess) {
        // 编辑现有工艺
        const updatedProcesses = selectedComponent.processes.map(proc =>
          proc.id === editingProcess.id
            ? { ...proc, ...values, efficiencyConfig, calculatedTime }
            : proc
        );
        const updatedComponent = { ...selectedComponent, processes: updatedProcesses };
        
        const updatedComponents = components.map(comp =>
          comp.id === selectedComponent.id ? updatedComponent : comp
        );
        
        onUpdate(updatedComponents);
        updateComponentTime(selectedComponent.id);
        message.success('工艺已更新');
      } else {
        // 添加新工艺
        const newProcess: ComponentProcess = {
          id: Date.now().toString(),
          processName: values.processName,
          efficiencyConfig,
          calculatedTime,
          status: 'pending',
          notes: values.notes,
        };
        
        const updatedProcesses = [...selectedComponent.processes, newProcess];
        const updatedComponent = { ...selectedComponent, processes: updatedProcesses };
        
        const updatedComponents = components.map(comp =>
          comp.id === selectedComponent.id ? updatedComponent : comp
        );
        
        onUpdate(updatedComponents);
        updateComponentTime(selectedComponent.id);
        message.success('工艺已添加');
      }
      
      setIsProcessModalVisible(false);
      processForm.resetFields();
    });
  };

  const handleProcessCancel = () => {
    setIsProcessModalVisible(false);
    processForm.resetFields();
  };

  // 计算总统计信息
  const totalComponents = components.length;
  const totalProcesses = components.reduce((sum, comp) => sum + comp.processes.length, 0);
  const totalTime = components.reduce((sum, comp) => sum + (comp.totalTime * comp.quantity), 0);
  const totalMaterialCost = components.reduce((sum, comp) => sum + calculateMaterialCost(comp), 0);

  return (
    <div>
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic
            title="部件总数"
            value={totalComponents}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="工艺总数"
            value={totalProcesses}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="总加工时间"
            value={formatTime(totalTime)}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="材料成本"
            value={formatCost(totalMaterialCost)}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
      </Row>

      <Tabs defaultActiveKey="components">
        <TabPane tab="部件管理" key="components">
          <Card
            title="产品部件列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={showComponentModal}>
                添加部件
              </Button>
            }
          >
            <Table
              columns={componentColumns}
              dataSource={components}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="工艺配置" key="processes">
          <Card
            title={
              <Space>
                工艺配置
                {selectedComponent && (
                  <Tag color="blue">当前部件: {selectedComponent.name}</Tag>
                )}
              </Space>
            }
            extra={
              <Space>
                <Select
                  placeholder="选择部件"
                  style={{ width: 200 }}
                  value={selectedComponent?.id}
                  onChange={(value) => {
                    const component = components.find(c => c.id === value);
                    setSelectedComponent(component || null);
                  }}
                >
                  {components.map(comp => (
                    <Option key={comp.id} value={comp.id}>{comp.name}</Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showProcessModal}
                  disabled={!selectedComponent}
                >
                  添加工艺
                </Button>
              </Space>
            }
          >
            {selectedComponent ? (
              <div>
                <Descriptions title="部件信息" bordered size="small" style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="部件名称">{selectedComponent.name}</Descriptions.Item>
                  <Descriptions.Item label="尺寸">
                    {selectedComponent.size.length}×{selectedComponent.size.width}×{selectedComponent.size.thickness} mm
                  </Descriptions.Item>
                  <Descriptions.Item label="材料">{selectedComponent.material}</Descriptions.Item>
                  <Descriptions.Item label="数量">{selectedComponent.quantity}</Descriptions.Item>
                  <Descriptions.Item label="复杂度">
                    <Tag color={selectedComponent.complexity === 'complex' ? 'red' : selectedComponent.complexity === 'medium' ? 'orange' : 'green'}>
                      {selectedComponent.complexity === 'complex' ? '复杂' : selectedComponent.complexity === 'medium' ? '中等' : '简单'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="总加工时间">{formatTime(selectedComponent.totalTime)}</Descriptions.Item>
                </Descriptions>

                <Table
                  columns={processColumns}
                  dataSource={selectedComponent.processes}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                请选择一个部件来配置工艺
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* 部件添加/编辑模态框 */}
      <Modal
        title={editingComponent ? '编辑部件' : '添加部件'}
        open={isComponentModalVisible}
        onOk={handleComponentOk}
        onCancel={handleComponentCancel}
        width={600}
      >
        <Form
          form={componentForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="部件名称"
            rules={[{ required: true, message: '请输入部件名称' }]}
          >
            <Input placeholder="如：桌面、桌腿、抽屉等" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="length"
                label="长度 (mm)"
                rules={[{ required: true, message: '请输入长度' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="width"
                label="宽度 (mm)"
                rules={[{ required: true, message: '请输入宽度' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="thickness"
                label="厚度 (mm)"
                rules={[{ required: true, message: '请输入厚度' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="material"
                label="材料"
                rules={[{ required: true, message: '请选择材料' }]}
              >
                <Select placeholder="选择材料">
                  {Object.keys(materials).map(material => (
                    <Option key={material} value={material}>{material}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="complexity"
            label="复杂度"
            rules={[{ required: true, message: '请选择复杂度' }]}
          >
            <Select placeholder="选择复杂度">
              <Option value="simple">简单</Option>
              <Option value="medium">中等</Option>
              <Option value="complex">复杂</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工艺添加/编辑模态框 */}
      <Modal
        title={editingProcess ? '编辑工艺' : '添加工艺'}
        open={isProcessModalVisible}
        onOk={handleProcessOk}
        onCancel={handleProcessCancel}
        width={500}
      >
        <Form
          form={processForm}
          layout="vertical"
        >
          <Form.Item
            name="processName"
            label="工艺名称"
            rules={[{ required: true, message: '请选择工艺' }]}
          >
            <Select placeholder="选择工艺">
              {efficiencyConfigs.map(config => (
                <Option key={config.id} value={config.processName}>
                  {config.processName} - {config.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="工艺特殊要求或备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductDesigner;