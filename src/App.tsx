import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Modal, Form, Input, Select, Space, Table, Tag, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  duration: number;
  equipment: string;
  materials: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

const App: React.FC = () => {
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      id: '1',
      name: '材料准备',
      description: '准备所需的板材、五金件等材料',
      duration: 2,
      equipment: '切割机',
      materials: ['板材', '五金件'],
      status: 'completed'
    },
    {
      id: '2',
      name: '切割加工',
      description: '根据图纸进行精确切割',
      duration: 4,
      equipment: '数控切割机',
      materials: ['板材'],
      status: 'in-progress'
    },
    {
      id: '3',
      name: '封边处理',
      description: '对切割后的板材进行封边',
      duration: 3,
      equipment: '封边机',
      materials: ['封边条', '胶水'],
      status: 'pending'
    },
    {
      id: '4',
      name: '钻孔加工',
      description: '根据设计要求进行钻孔',
      duration: 2,
      equipment: '钻孔机',
      materials: ['钻头'],
      status: 'pending'
    },
    {
      id: '5',
      name: '组装调试',
      description: '将各部件进行组装并调试',
      duration: 5,
      equipment: '组装工具',
      materials: ['螺丝', '连接件'],
      status: 'pending'
    }
  ]);

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
      description: step.description 
    },
    style: {
      background: step.status === 'completed' ? '#52c41a' : 
                  step.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
      color: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '120px'
    }
  }));

  const initialEdges: Edge[] = processSteps.slice(0, -1).map((step, index) => ({
    id: `e${step.id}-${processSteps[index + 1].id}`,
    source: step.id,
    target: processSteps[index + 1].id,
    type: 'smoothstep',
    style: { stroke: '#1890ff', strokeWidth: 2 }
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 更新节点和边当工序状态改变时
  React.useEffect(() => {
    const updatedNodes: Node[] = processSteps.map((step, index) => ({
      id: step.id,
      type: 'default',
      position: { x: 250 * index, y: 100 },
      data: { 
        label: step.name,
        status: step.status,
        description: step.description 
      },
      style: {
        background: step.status === 'completed' ? '#52c41a' : 
                    step.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
        color: 'white',
        border: '2px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '120px'
      }
    }));

    const updatedEdges: Edge[] = processSteps.slice(0, -1).map((step, index) => ({
      id: `e${step.id}-${processSteps[index + 1].id}`,
      source: step.id,
      target: processSteps[index + 1].id,
      type: 'smoothstep',
      style: { stroke: '#1890ff', strokeWidth: 2 }
    }));

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [processSteps, setNodes, setEdges]);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  const columns = [
    {
      title: '工序名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '预计工时(小时)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '设备',
      dataIndex: 'equipment',
      key: 'equipment',
    },
    {
      title: '材料',
      dataIndex: 'materials',
      key: 'materials',
      render: (materials: string[]) => (
        <>
          {materials.map(material => (
            <Tag key={material} color="blue">{material}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ProcessStep) => {
        const color = status === 'completed' ? 'green' : 
                     status === 'in-progress' ? 'blue' : 'default';
        const text = status === 'completed' ? '已完成' : 
                    status === 'in-progress' ? '进行中' : '待开始';
        return (
          <Select
            value={status}
            style={{ width: 100 }}
            onChange={(value) => updateStepStatus(record.id, value)}
          >
            <Option value="pending">待开始</Option>
            <Option value="in-progress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ProcessStep) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewStep(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => editStep(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteStep(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setEditingStep(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const editStep = (step: ProcessStep) => {
    setEditingStep(step);
    form.setFieldsValue(step);
    setIsModalVisible(true);
  };

  const viewStep = (step: ProcessStep) => {
    Modal.info({
      title: step.name,
      content: (
        <div>
          <p><strong>描述：</strong>{step.description}</p>
          <p><strong>预计工时：</strong>{step.duration}小时</p>
          <p><strong>设备：</strong>{step.equipment}</p>
          <p><strong>材料：</strong>{step.materials.join(', ')}</p>
          <p><strong>状态：</strong>
            <Tag color={step.status === 'completed' ? 'green' : 
                       step.status === 'in-progress' ? 'blue' : 'default'}>
              {step.status === 'completed' ? '已完成' : 
               step.status === 'in-progress' ? '进行中' : '待开始'}
            </Tag>
          </p>
        </div>
      ),
    });
  };

  const deleteStep = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个工序吗？',
      onOk: () => {
        setProcessSteps(steps => steps.filter(step => step.id !== id));
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingStep) {
        // 编辑现有工序
        setProcessSteps(steps => 
          steps.map(step => 
            step.id === editingStep.id ? { ...step, ...values } : step
          )
        );
      } else {
        // 添加新工序
        const newStep: ProcessStep = {
          id: Date.now().toString(),
          ...values,
          status: 'pending'
        };
        setProcessSteps(steps => [...steps, newStep]);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const updateStepStatus = (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    setProcessSteps(steps => 
      steps.map(step => 
        step.id === id ? { ...step, status } : step
      )
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ margin: '16px 0', color: '#1890ff' }}>
          板式家具加工工艺流程设计
        </Title>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总工序数"
                    value={processSteps.length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="已完成"
                    value={processSteps.filter(s => s.status === 'completed').length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="进行中"
                    value={processSteps.filter(s => s.status === 'in-progress').length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总工时"
                    value={processSteps.reduce((sum, step) => sum + step.duration, 0)}
                    suffix="小时"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
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
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        板式家具加工工艺流程设计系统 ©2024
      </Footer>

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
                name="duration"
                label="预计工时(小时)"
                rules={[{ required: true, message: '请输入预计工时' }]}
              >
                <Input type="number" placeholder="请输入工时" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="所需设备"
                rules={[{ required: true, message: '请输入所需设备' }]}
              >
                <Input placeholder="请输入所需设备" />
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
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default App;