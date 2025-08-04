import React, { useState } from 'react';
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
  Statistic
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { EfficiencyConfig } from '../types';

const { Option } = Select;

interface EfficiencyConfigManagerProps {
  efficiencyConfigs: EfficiencyConfig[];
  onUpdate: (configs: EfficiencyConfig[]) => void;
}

const EfficiencyConfigManager: React.FC<EfficiencyConfigManagerProps> = ({
  efficiencyConfigs,
  onUpdate
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EfficiencyConfig | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '工艺名称',
      dataIndex: 'processName',
      key: 'processName',
      width: 120,
    },
    {
      title: '基础时间',
      dataIndex: 'baseTime',
      key: 'baseTime',
      width: 100,
      render: (value: number, record: EfficiencyConfig) => (
        <span>{value} {record.unit === 'minute' ? '分钟' : '小时'}</span>
      ),
    },
    {
      title: '尺寸系数',
      dataIndex: 'sizeFactor',
      key: 'sizeFactor',
      width: 100,
      render: (value: number) => (
        <span>{value} 分钟/10000mm²</span>
      ),
    },
    {
      title: '复杂度系数',
      dataIndex: 'complexityFactor',
      key: 'complexityFactor',
      width: 100,
      render: (value: number) => (
        <Tag color={value > 1.5 ? 'red' : value > 1.2 ? 'orange' : 'green'}>
          {value}x
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: EfficiencyConfig) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => editConfig(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个效率配置吗？"
            onConfirm={() => deleteConfig(record.id)}
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

  const showModal = () => {
    setEditingConfig(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const editConfig = (config: EfficiencyConfig) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setIsModalVisible(true);
  };

  const deleteConfig = (id: string) => {
    const updatedConfigs = efficiencyConfigs.filter(config => config.id !== id);
    onUpdate(updatedConfigs);
    message.success('效率配置已删除');
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingConfig) {
        // 编辑现有配置
        const updatedConfigs = efficiencyConfigs.map(config =>
          config.id === editingConfig.id ? { ...config, ...values } : config
        );
        onUpdate(updatedConfigs);
        message.success('效率配置已更新');
      } else {
        // 添加新配置
        const newConfig: EfficiencyConfig = {
          id: Date.now().toString(),
          ...values,
        };
        onUpdate([...efficiencyConfigs, newConfig]);
        message.success('效率配置已添加');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 计算统计信息
  const avgBaseTime = efficiencyConfigs.reduce((sum, config) => sum + config.baseTime, 0) / efficiencyConfigs.length;
  const avgSizeFactor = efficiencyConfigs.reduce((sum, config) => sum + config.sizeFactor, 0) / efficiencyConfigs.length;

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          加工效率配置管理
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          添加配置
        </Button>
      }
    >
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic
            title="配置总数"
            value={efficiencyConfigs.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="平均基础时间"
            value={Math.round(avgBaseTime * 100) / 100}
            suffix="分钟"
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="平均尺寸系数"
            value={Math.round(avgSizeFactor * 100) / 100}
            suffix="分钟/10000mm²"
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="复杂度范围"
            value={`${Math.min(...efficiencyConfigs.map(c => c.complexityFactor))} - ${Math.max(...efficiencyConfigs.map(c => c.complexityFactor))}`}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
      </Row>

      {/* 配置表格 */}
      <Table
        columns={columns}
        dataSource={efficiencyConfigs}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingConfig ? '编辑效率配置' : '添加效率配置'}
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
            name="processName"
            label="工艺名称"
            rules={[{ required: true, message: '请输入工艺名称' }]}
          >
            <Input placeholder="如：切割、封边、钻孔等" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="baseTime"
                label="基础时间"
                rules={[{ required: true, message: '请输入基础时间' }]}
              >
                <InputNumber
                  min={0}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="基础加工时间"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="时间单位"
                rules={[{ required: true, message: '请选择时间单位' }]}
              >
                <Select placeholder="选择时间单位">
                  <Option value="minute">分钟</Option>
                  <Option value="hour">小时</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sizeFactor"
                label="尺寸系数"
                rules={[{ required: true, message: '请输入尺寸系数' }]}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="每10000mm²增加的时间"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="complexityFactor"
                label="复杂度系数"
                rules={[{ required: true, message: '请输入复杂度系数' }]}
              >
                <InputNumber
                  min={0.5}
                  max={3}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="复杂度影响系数"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入工艺描述' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="详细描述该工艺的特点和要求"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default EfficiencyConfigManager;