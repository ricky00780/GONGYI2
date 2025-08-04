import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  Statistic,
  Tag,
  Tooltip,
  Input as AntInput,
  Empty,
  Progress,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  CloseOutlined
} from '@ant-design/icons';
import ReactFlow, { 
  Controls, 
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import type { ProcessStep, ProcessStatus, Component } from '../types';
import { calculateProcessDuration, calculateProcessCost } from '../utils/calculations';

const { Option } = Select;
const { Search } = AntInput;

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
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 过滤工序
  const filteredProcessSteps = useMemo(() => {
    if (!searchText) return processSteps;
    
    return processSteps.filter(step => 
      step.name.toLowerCase().includes(searchText.toLowerCase()) ||
      step.description.toLowerCase().includes(searchText.toLowerCase()) ||
      step.equipment.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [processSteps, searchText]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const totalSteps = processSteps.length;
    const completedSteps = processSteps.filter(s => s.status === 'completed').length;
    const inProgressSteps = processSteps.filter(s => s.status === 'in-progress').length;
    const pendingSteps = processSteps.filter(s => s.status === 'pending').length;
    const totalCost = processSteps.reduce((sum, s) => sum + s.cost, 0);
    const totalDuration = processSteps.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSteps,
      completedSteps,
      inProgressSteps,
      pendingSteps,
      totalCost,
      totalDuration,
    };
  }, [processSteps]);

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
      fontWeight: 'bold',
    },
  }));

  const initialEdges: Edge[] = processSteps.slice(0, -1).map((_, index) => ({
    id: `e${index}`,
    source: processSteps[index].id,
    target: processSteps[index + 1].id,
    type: 'smoothstep',
    style: { stroke: '#1890ff', strokeWidth: 2 },
    animated: processSteps[index].status === 'completed' && processSteps[index + 1].status === 'in-progress',
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
        fontWeight: 'bold',
      },
    }));

    const newEdges: Edge[] = processSteps.slice(0, -1).map((_, index) => ({
      id: `e${index}`,
      source: processSteps[index].id,
      target: processSteps[index + 1].id,
      type: 'smoothstep',
      style: { stroke: '#1890ff', strokeWidth: 2 },
      animated: processSteps[index].status === 'completed' && processSteps[index + 1].status === 'in-progress',
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
      status: step.status,
    });
    setIsModalVisible(true);
  };

  const viewStep = (step: ProcessStep) => {
    Modal.info({
      title: step.name,
      content: (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="描述">{step.description}</Descriptions.Item>
          <Descriptions.Item label="设备">{step.equipment}</Descriptions.Item>
          <Descriptions.Item label="材料">{step.materials.join(', ')}</Descriptions.Item>
          <Descriptions.Item label="预计工时">{step.duration}小时</Descriptions.Item>
          <Descriptions.Item label="成本">¥{step.cost.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={
              step.status === 'completed' ? 'green' : 
              step.status === 'in-progress' ? 'blue' : 'orange'
            }>
              {getStatusText(step.status)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      ),
      width: 600,
    });
  };

  const deleteStep = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个工序吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        const updatedSteps = processSteps.filter(step => step.id !== id);
        setProcessSteps(updatedSteps);
        onUpdateProcessSteps(component.id, updatedSteps);
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

      const duration = calculateProcessDuration(values.name, workTimeParams);
      const cost = calculateProcessCost(
        { ...values, duration, cost: 0 },
        workTimeParams
      );

      const stepData = {
        name: values.name,
        description: values.description,
        equipment: values.equipment,
        materials: values.materials,
        status: values.status,
        duration,
        cost,
      };

      if (editingStep) {
        const updatedSteps = processSteps.map(step =>
          step.id === editingStep.id ? { ...step, ...stepData } : step
        );
        setProcessSteps(updatedSteps);
        onUpdateProcessSteps(component.id, updatedSteps);
      } else {
        const newStep: ProcessStep = {
          id: Date.now().toString(),
          ...stepData,
        };
        const updatedSteps = [...processSteps, newStep];
        setProcessSteps(updatedSteps);
        onUpdateProcessSteps(component.id, updatedSteps);
      }
      setIsModalVisible(false);
    }).catch((errorInfo) => {
      console.error('表单验证失败:', errorInfo);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const updateStepStatus = (id: string, status: ProcessStatus) => {
    const updatedSteps = processSteps.map(step =>
      step.id === id ? { ...step, status } : step
    );
    setProcessSteps(updatedSteps);
    onUpdateProcessSteps(component.id, updatedSteps);
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



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDuration = (hours: number) => {
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;
    
    if (days > 0) {
      return `${days}天${remainingHours > 0 ? remainingHours + '小时' : ''}`;
    }
    return `${hours}小时`;
  };

  const columns = [
    {
      title: '工序名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProcessStep) => (
        <Button 
          type="link" 
          onClick={() => viewStep(record)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
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
      render: (equipment: string) => (
        <Tag color="purple">{equipment}</Tag>
      ),
    },
    {
      title: '材料',
      dataIndex: 'materials',
      key: 'materials',
             render: (materials: string[]) => (
         <Space size={[0, 4]} wrap>
           {materials.map((material, index) => (
             <Tag key={index} color="blue">
               {material}
             </Tag>
           ))}
         </Space>
       ),
    },
    {
      title: '预计工时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        <span style={{ color: '#1890ff' }}>
          {formatDuration(duration)}
        </span>
      ),
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {formatCurrency(cost)}
        </span>
      ),
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
      render: (record: ProcessStep) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => viewStep(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => editStep(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => deleteStep(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const completionRate = statistics.totalSteps > 0 
    ? (statistics.completedSteps / statistics.totalSteps) * 100 
    : 0;

  return (
    <div>
      {/* 部件信息 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <h3 style={{ margin: 0 }}>部件：{component.name}</h3>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              {component.description}
            </p>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Button 
              icon={<CloseOutlined />}
              onClick={onClose}
            >
              关闭
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总工序数"
              value={statistics.totalSteps}
              prefix={<span style={{ color: '#1890ff' }}>⚙️</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={statistics.completedSteps}
              valueStyle={{ color: '#52c41a' }}
              prefix={<span style={{ color: '#52c41a' }}>✅</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总成本"
              value={statistics.totalCost}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总工时"
              value={statistics.totalDuration}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              suffix="小时"
            />
          </Card>
        </Col>
      </Row>

      {/* 进度条 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <span>工序完成进度：</span>
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
            {statistics.completedSteps}/{statistics.totalSteps}
          </span>
        </div>
        <Progress 
          percent={completionRate} 
          status={completionRate === 100 ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#52c41a',
          }}
        />
      </Card>

      {/* 流程图 */}
      <Card title="工艺流程" style={{ marginBottom: '24px' }}>
        <div style={{ height: '300px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>
      </Card>

      {/* 操作栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索工序名称、描述或设备"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => setSearchText('')}
              >
                重置
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={showModal}
              >
                添加工序
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 工序表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProcessSteps}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
          }}
          locale={{
            emptyText: (
              <Empty
                description="暂无工序数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* 添加/编辑工序模态框 */}
      <Modal
        title={editingStep ? '编辑工序' : '添加工序'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            description: '',
            equipment: '切割机',
            materials: [],
            status: 'pending',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="工序名称"
                rules={[
                  { required: true, message: '请输入工序名称' },
                  { max: 50, message: '工序名称不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入工序名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="设备"
                rules={[{ required: true, message: '请选择设备' }]}
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
            name="description"
            label="描述"
            rules={[
              { max: 200, message: '描述不能超过200个字符' },
            ]}
          >
            <Input.TextArea 
              placeholder="请输入工序描述" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="materials"
            label="材料"
            rules={[{ required: true, message: '请选择材料' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入材料"
              style={{ width: '100%' }}
            >
              <Option value="板材">板材</Option>
              <Option value="封边条">封边条</Option>
              <Option value="胶水">胶水</Option>
              <Option value="钻头">钻头</Option>
              <Option value="螺丝">螺丝</Option>
              <Option value="油漆">油漆</Option>
              <Option value="包装材料">包装材料</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="pending">待开始</Option>
              <Option value="in-progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcessStepManager;