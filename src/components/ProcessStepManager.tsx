import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CalculatorOutlined } from '@ant-design/icons';
import ReactFlow, { 
  Controls, 
  Background,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
// import 'reactflow/dist/style.css';
import type { ProcessStep, ProcessStatus, Component } from '../types';
import { calculateProcessDuration, calculateProcessCost } from '../utils/calculations';

const { Option } = Select;

interface ProcessStepManagerProps {
  component: Component;
  onUpdateProcessSteps: (componentId: string, processSteps: ProcessStep[]) => void;
  onClose: () => void;
}

const ProcessStepManager: React.FC<ProcessStepManagerProps> = ({
  component,
  onUpdateProcessSteps,
  onClose,
}) => {
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(component.processSteps);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [form] = Form.useForm();

  // ReactFlow nodes and edges
  const initialNodes: Node[] = processSteps.map((step, index) => ({
    id: step.id,
    type: 'default',
    position: { x: 250 * index, y: 100 },
    data: { 
      label: step.name,
      status: step.status,
      description: step.description,
      duration: step.duration,
      cost: step.cost,
    },
    style: {
      background: step.status === 'completed' ? '#52c41a' : 
                  step.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
      color: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      width: 200,
      textAlign: 'center',
    },
  }));

  const initialEdges: Edge[] = processSteps.slice(0, -1).map((_, index) => ({
    id: `e${index}`,
    source: processSteps[index].id,
    target: processSteps[index + 1].id,
    type: 'smoothstep',
    style: { stroke: '#1890ff', strokeWidth: 2 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 更新流程图
  useEffect(() => {
    const newNodes: Node[] = processSteps.map((step, index) => ({
      id: step.id,
      type: 'default',
      position: { x: 250 * index, y: 100 },
      data: { 
        label: step.name,
        status: step.status,
        description: step.description,
        duration: step.duration,
        cost: step.cost,
      },
      style: {
        background: step.status === 'completed' ? '#52c41a' : 
                    step.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
        color: 'white',
        border: '2px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        width: 200,
        textAlign: 'center',
      },
    }));

    const newEdges: Edge[] = processSteps.slice(0, -1).map((_, index) => ({
      id: `e${index}`,
      source: processSteps[index].id,
      target: processSteps[index + 1].id,
      type: 'smoothstep',
      style: { stroke: '#1890ff', strokeWidth: 2 },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [processSteps, setNodes, setEdges]);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  const showModal = () => {
    setEditingStep(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const editStep = (step: ProcessStep) => {
    setEditingStep(step);
    form.setFieldsValue({
      name: step.name,
      description: step.description,
      equipment: step.equipment,
      materials: step.materials,
    });
    setIsModalVisible(true);
  };

  const viewStep = (step: ProcessStep) => {
    Modal.info({
      title: step.name,
      content: (
        <div>
          <p><strong>描述：</strong>{step.description}</p>
          <p><strong>设备：</strong>{step.equipment}</p>
          <p><strong>材料：</strong>{step.materials.join(', ')}</p>
          <p><strong>预计工时：</strong>{step.duration}小时</p>
          <p><strong>工序成本：</strong>¥{step.cost.toFixed(2)}</p>
          <p><strong>状态：</strong>{getStatusText(step.status)}</p>
        </div>
      ),
      width: 500,
    });
  };

  const deleteStep = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个工序吗？此操作不可恢复。',
      onOk: () => {
        const newSteps = processSteps.filter(step => step.id !== id);
        setProcessSteps(newSteps);
        onUpdateProcessSteps(component.id, newSteps);
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const workTimeParams = {
        dimensions: component.dimensions,
        thickness: component.thickness,
        holeCount: component.holeCount,
        edgeCount: component.edgeCount,
        material: component.material,
      };

      const calculatedDuration = calculateProcessDuration(values.name, workTimeParams);
      const calculatedCost = calculateProcessCost(
        { ...values, duration: calculatedDuration, status: 'pending', cost: 0 },
        workTimeParams
      );

      const stepData: ProcessStep = {
        id: editingStep?.id || Date.now().toString(),
        name: values.name,
        description: values.description,
        duration: calculatedDuration,
        equipment: values.equipment,
        materials: values.materials,
        status: editingStep?.status || 'pending',
        cost: calculatedCost,
      };

      let newSteps: ProcessStep[];
      if (editingStep) {
        newSteps = processSteps.map(step => 
          step.id === editingStep.id ? stepData : step
        );
      } else {
        newSteps = [...processSteps, stepData];
      }

      setProcessSteps(newSteps);
      onUpdateProcessSteps(component.id, newSteps);
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const updateStepStatus = (id: string, status: ProcessStatus) => {
    const newSteps = processSteps.map(step =>
      step.id === id ? { ...step, status } : step
    );
    setProcessSteps(newSteps);
    onUpdateProcessSteps(component.id, newSteps);
  };



  const getStatusText = (status: ProcessStatus) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '进行中';
      case 'pending':
        return '待开始';
      default:
        return '未知';
    }
  };

  const columns = [
    {
      title: '工序名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProcessStep) => (
        <a onClick={() => viewStep(record)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '设备',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: '预计工时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration.toFixed(1)}小时`,
    },
    {
      title: '工序成本',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `¥${cost.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProcessStatus, record: ProcessStep) => (
        <Select
          value={status}
          style={{ width: 100 }}
          onChange={(value) => updateStepStatus(record.id, value)}
        >
          <Option value="pending">待开始</Option>
          <Option value="in-progress">进行中</Option>
          <Option value="completed">已完成</Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ProcessStep) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewStep(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => editStep(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteStep(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const totalSteps = processSteps.length;
  const completedSteps = processSteps.filter(s => s.status === 'completed').length;
  const inProgressSteps = processSteps.filter(s => s.status === 'in-progress').length;
  const totalDuration = processSteps.reduce((sum, step) => sum + step.duration, 0);
  const totalCost = processSteps.reduce((sum, step) => sum + step.cost, 0);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总工序数"
              value={totalSteps}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedSteps}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={inProgressSteps}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总工时"
              value={totalDuration}
              suffix="小时"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="工艺流程概览" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              添加工序
            </Button>
          }>
            <div style={{ height: '400px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="工序详情列表">
            <Table 
              columns={columns} 
              dataSource={processSteps} 
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="部件总成本"
                  value={totalCost}
                  prefix="¥"
                  precision={2}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="部件总工时"
                  value={totalDuration}
                  suffix="小时"
                  precision={1}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={8}>
                <Button type="primary" onClick={onClose}>
                  完成编辑
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingStep ? '编辑工序' : '添加工序'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="工序名称"
            rules={[{ required: true, message: '请输入工序名称' }]}
          >
            <Input placeholder="请输入工序名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="工序描述"
            rules={[{ required: true, message: '请输入工序描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入工序描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="所需设备"
                rules={[{ required: true, message: '请输入所需设备' }]}
              >
                <Select placeholder="请选择设备">
                  <Option value="切割机">切割机</Option>
                  <Option value="数控切割机">数控切割机</Option>
                  <Option value="封边机">封边机</Option>
                  <Option value="钻孔机">钻孔机</Option>
                  <Option value="组装工具">组装工具</Option>
                  <Option value="打磨机">打磨机</Option>
                  <Option value="喷漆设备">喷漆设备</Option>
                  <Option value="包装设备">包装设备</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="materials"
            label="所需材料"
            rules={[{ required: true, message: '请选择所需材料' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入所需材料"
              style={{ width: '100%' }}
            >
              <Option value="板材">板材</Option>
              <Option value="五金件">五金件</Option>
              <Option value="封边条">封边条</Option>
              <Option value="胶水">胶水</Option>
              <Option value="螺丝">螺丝</Option>
              <Option value="连接件">连接件</Option>
              <Option value="钻头">钻头</Option>
              <Option value="砂纸">砂纸</Option>
              <Option value="油漆">油漆</Option>
            </Select>
          </Form.Item>

          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
            <p style={{ margin: 0, color: '#666' }}>
              <CalculatorOutlined /> 工时和成本将根据部件信息（尺寸、材料、开孔次数等）自动计算
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcessStepManager;