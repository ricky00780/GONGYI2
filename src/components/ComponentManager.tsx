import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Row, 
  Col, 
  Statistic,
  Tag,
  Tooltip,
  Input as AntInput,
  Empty,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { Component } from '../types';

const { Option } = Select;
const { Search } = AntInput;

interface ComponentManagerProps {
  components: Component[];
  onAddComponent: (component: Omit<Component, 'id' | 'totalCost' | 'totalDuration'>) => void;
  onEditComponent: (id: string, component: Partial<Component>) => void;
  onDeleteComponent: (id: string) => void;
  onManageProcessSteps: (componentId: string) => void;
  onViewComponent: (component: Component) => void;
}

const ComponentManager: React.FC<ComponentManagerProps> = ({
  components,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
  onManageProcessSteps,
  onViewComponent,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 过滤部件
  const filteredComponents = useMemo(() => {
    if (!searchText) return components;
    
    return components.filter(component => 
      component.name.toLowerCase().includes(searchText.toLowerCase()) ||
      component.description.toLowerCase().includes(searchText.toLowerCase()) ||
      component.material.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [components, searchText]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const totalComponents = components.length;
    const totalProcessSteps = components.reduce((sum, c) => sum + c.processSteps.length, 0);
    const totalCost = components.reduce((sum, c) => sum + c.totalCost, 0);
    const totalDuration = components.reduce((sum, c) => sum + c.totalDuration, 0);
    const completedSteps = components.reduce((sum, c) => 
      sum + c.processSteps.filter(s => s.status === 'completed').length, 0
    );

    return {
      totalComponents,
      totalProcessSteps,
      totalCost,
      totalDuration,
      completedSteps,
    };
  }, [components]);

  const showModal = () => {
    setEditingComponent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const editComponent = (component: Component) => {
    setEditingComponent(component);
    form.setFieldsValue({
      name: component.name,
      description: component.description,
      material: component.material,
      thickness: component.thickness,
      holeCount: component.holeCount,
      edgeCount: component.edgeCount,
      'dimensions.length': component.dimensions.length,
      'dimensions.width': component.dimensions.width,
      'dimensions.height': component.dimensions.height,
    });
    setIsModalVisible(true);
  };

  const deleteComponent = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个部件吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => onDeleteComponent(id),
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const componentData = {
        name: values.name,
        description: values.description,
        material: values.material,
        thickness: values.thickness,
        holeCount: values.holeCount,
        edgeCount: values.edgeCount,
        dimensions: {
          length: values['dimensions.length'],
          width: values['dimensions.width'],
          height: values['dimensions.height'],
        },
        processSteps: editingComponent?.processSteps || [],
      };

      if (editingComponent) {
        onEditComponent(editingComponent.id, componentData);
      } else {
        onAddComponent(componentData);
      }
      setIsModalVisible(false);
    }).catch((errorInfo) => {
      console.error('表单验证失败:', errorInfo);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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

  const formatDimensions = (dimensions: Component['dimensions']) => {
    return `${dimensions.length}×${dimensions.width}×${dimensions.height}mm`;
  };

  const columns = [
    {
      title: '部件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Component) => (
        <Button 
          type="link" 
          onClick={() => onViewComponent(record)}
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
      title: '尺寸',
      key: 'dimensions',
      render: (record: Component) => (
        <span style={{ fontFamily: 'monospace' }}>
          {formatDimensions(record.dimensions)}
        </span>
      ),
    },
    {
      title: '材料',
      dataIndex: 'material',
      key: 'material',
      render: (material: string) => (
        <Tag color="blue">{material}</Tag>
      ),
    },
    {
      title: '厚度',
      dataIndex: 'thickness',
      key: 'thickness',
      render: (thickness: number) => `${thickness}mm`,
    },
    {
      title: '工序数',
      key: 'processCount',
      render: (record: Component) => (
        <Tag color="purple">{record.processSteps.length}</Tag>
      ),
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost: number) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {formatCurrency(cost)}
        </span>
      ),
    },
    {
      title: '总工时',
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      render: (duration: number) => (
        <span style={{ color: '#1890ff' }}>
          {formatDuration(duration)}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Component) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => onViewComponent(record)}
            />
          </Tooltip>
          <Tooltip title="工序管理">
            <Button 
              size="small" 
              icon={<SettingOutlined />}
              onClick={() => onManageProcessSteps(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => editComponent(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => deleteComponent(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const completionRate = statistics.totalProcessSteps > 0 
    ? (statistics.completedSteps / statistics.totalProcessSteps) * 100 
    : 0;

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总部件数"
              value={statistics.totalComponents}
              prefix={<span style={{ color: '#1890ff' }}>🔧</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总工序数"
              value={statistics.totalProcessSteps}
              prefix={<span style={{ color: '#722ed1' }}>⚙️</span>}
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
              valueStyle={{ color: '#52c41a' }}
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
            {statistics.completedSteps}/{statistics.totalProcessSteps}
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

      {/* 操作栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索部件名称、描述或材料"
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
                添加部件
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 部件表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredComponents}
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
                description="暂无部件数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* 添加/编辑部件模态框 */}
      <Modal
        title={editingComponent ? '编辑部件' : '添加部件'}
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
            material: '密度板',
            thickness: 18,
            holeCount: 0,
            edgeCount: 4,
            'dimensions.length': 1000,
            'dimensions.width': 500,
            'dimensions.height': 18,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="部件名称"
                rules={[
                  { required: true, message: '请输入部件名称' },
                  { max: 50, message: '部件名称不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入部件名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="material"
                label="材料"
                rules={[{ required: true, message: '请选择材料' }]}
              >
                <Select placeholder="请选择材料">
                  <Option value="实木板">实木板</Option>
                  <Option value="密度板">密度板</Option>
                  <Option value="刨花板">刨花板</Option>
                  <Option value="多层板">多层板</Option>
                  <Option value="胶合板">胶合板</Option>
                  <Option value="中纤板">中纤板</Option>
                  <Option value="防火板">防火板</Option>
                  <Option value="生态板">生态板</Option>
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
              placeholder="请输入部件描述" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dimensions.length"
                label="长度 (mm)"
                rules={[
                  { required: true, message: '请输入长度' },
                  { type: 'number', min: 1, message: '长度必须大于0' },
                ]}
              >
                <InputNumber 
                  placeholder="长度" 
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dimensions.width"
                label="宽度 (mm)"
                rules={[
                  { required: true, message: '请输入宽度' },
                  { type: 'number', min: 1, message: '宽度必须大于0' },
                ]}
              >
                <InputNumber 
                  placeholder="宽度" 
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dimensions.height"
                label="高度 (mm)"
                rules={[
                  { required: true, message: '请输入高度' },
                  { type: 'number', min: 1, message: '高度必须大于0' },
                ]}
              >
                <InputNumber 
                  placeholder="高度" 
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="thickness"
                label="厚度 (mm)"
                rules={[
                  { required: true, message: '请输入厚度' },
                  { type: 'number', min: 1, message: '厚度必须大于0' },
                ]}
              >
                <InputNumber 
                  placeholder="厚度" 
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="holeCount"
                label="开孔次数"
                rules={[
                  { required: true, message: '请输入开孔次数' },
                  { type: 'number', min: 0, message: '开孔次数不能为负数' },
                ]}
              >
                <InputNumber 
                  placeholder="开孔次数" 
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="edgeCount"
                label="封边数量"
                rules={[
                  { required: true, message: '请输入封边数量' },
                  { type: 'number', min: 0, message: '封边数量不能为负数' },
                ]}
              >
                <InputNumber 
                  placeholder="封边数量" 
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ComponentManager;