import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, InputNumber, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import type { Component, ProcessStep } from '../types';

const { Option } = Select;

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
  const [form] = Form.useForm();

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
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };



  const columns = [
    {
      title: '部件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Component) => (
        <a onClick={() => onViewComponent(record)}>{text}</a>
      ),
    },
    {
      title: '材料',
      dataIndex: 'material',
      key: 'material',
    },
    {
      title: '尺寸 (mm)',
      key: 'dimensions',
      render: (record: Component) => (
        <span>
          {record.dimensions.length} × {record.dimensions.width} × {record.dimensions.height}
        </span>
      ),
    },
    {
      title: '厚度 (mm)',
      dataIndex: 'thickness',
      key: 'thickness',
    },
    {
      title: '开孔数',
      dataIndex: 'holeCount',
      key: 'holeCount',
    },
    {
      title: '封边数',
      dataIndex: 'edgeCount',
      key: 'edgeCount',
    },
    {
      title: '工序数',
      dataIndex: 'processSteps',
      key: 'processCount',
      render: (processSteps: ProcessStep[]) => processSteps.length,
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost: number) => `¥${cost.toFixed(2)}`,
    },
    {
      title: '总工时',
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      render: (duration: number) => `${duration.toFixed(1)}小时`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Component) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewComponent(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => onManageProcessSteps(record.id)}
          >
            工序
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => editComponent(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteComponent(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const totalComponents = components.length;
  const totalCost = components.reduce((sum, c) => sum + c.totalCost, 0);
  const totalDuration = components.reduce((sum, c) => sum + c.totalDuration, 0);
  const totalProcessSteps = components.reduce((sum, c) => sum + c.processSteps.length, 0);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="部件数量"
              value={totalComponents}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总工序数"
              value={totalProcessSteps}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总成本"
              value={totalCost}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
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
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="部件列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            添加部件
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={components}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingComponent ? '编辑部件' : '添加部件'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="部件名称"
                rules={[{ required: true, message: '请输入部件名称' }]}
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
            label="部件描述"
            rules={[{ required: true, message: '请输入部件描述' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入部件描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['dimensions', 'length']}
                label="长度 (mm)"
                rules={[{ required: true, message: '请输入长度' }]}
              >
                <InputNumber
                  min={1}
                  max={10000}
                  style={{ width: '100%' }}
                  placeholder="长度"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['dimensions', 'width']}
                label="宽度 (mm)"
                rules={[{ required: true, message: '请输入宽度' }]}
              >
                <InputNumber
                  min={1}
                  max={10000}
                  style={{ width: '100%' }}
                  placeholder="宽度"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['dimensions', 'height']}
                label="高度 (mm)"
                rules={[{ required: true, message: '请输入高度' }]}
              >
                <InputNumber
                  min={1}
                  max={10000}
                  style={{ width: '100%' }}
                  placeholder="高度"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="thickness"
                label="厚度 (mm)"
                rules={[{ required: true, message: '请输入厚度' }]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="厚度"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="holeCount"
                label="开孔次数"
                rules={[{ required: true, message: '请输入开孔次数' }]}
              >
                <InputNumber
                  min={0}
                  max={1000}
                  style={{ width: '100%' }}
                  placeholder="开孔次数"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="edgeCount"
                label="封边数量"
                rules={[{ required: true, message: '请输入封边数量' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="封边数量"
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