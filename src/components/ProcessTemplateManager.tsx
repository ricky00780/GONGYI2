import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Tabs,
  InputNumber,
  Switch,
  Divider,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  CodeOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { 
  ProcessTemplate, 
  CalculationLogic, 
  CalculationVariable 
} from '../types';
import { validateFormula, getFormulaVariables } from '../utils/calculations';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface ProcessTemplateManagerProps {
  processTemplates: ProcessTemplate[];
  calculationLogics: CalculationLogic[];
  calculationVariables: CalculationVariable[];
  onUpdate: (templates: ProcessTemplate[]) => void;
  onUpdateLogics: (logics: CalculationLogic[]) => void;
}

const ProcessTemplateManager: React.FC<ProcessTemplateManagerProps> = ({
  processTemplates,
  calculationLogics,
  calculationVariables,
  onUpdate,
  onUpdateLogics
}) => {
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isLogicModalVisible, setIsLogicModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProcessTemplate | null>(null);
  const [editingLogic, setEditingLogic] = useState<CalculationLogic | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [templateForm] = Form.useForm();
  const [logicForm] = Form.useForm();

  const categoryColors = {
    cutting: 'red',
    drilling: 'blue',
    edging: 'green',
    sanding: 'orange',
    assembly: 'purple',
    finishing: 'cyan',
    inspection: 'magenta'
  };

  const templateColumns = [
    {
      title: '工序代码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => (
        <Tag color="blue" icon={<CodeOutlined />}>
          {code}
        </Tag>
      ),
    },
    {
      title: '工序名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color={categoryColors[category as keyof typeof categoryColors]}>
          {category}
        </Tag>
      ),
    },
    {
      title: '计算逻辑',
      key: 'calculationLogic',
      width: 150,
      render: (_: any, record: ProcessTemplate) => (
        <div>
          <div>{record.calculationLogic.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.calculationLogic.formula}
          </div>
        </div>
      ),
    },
    {
      title: '所需设备',
      dataIndex: 'requiredEquipment',
      key: 'requiredEquipment',
      width: 120,
      render: (equipment: string[]) => (
        <div>
          {equipment.map(item => (
            <Tag key={item} size="small">{item}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ProcessTemplate) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => editTemplate(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个工序模板吗？"
            onConfirm={() => deleteTemplate(record.id)}
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

  const logicColumns = [
    {
      title: '逻辑名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '计算公式',
      dataIndex: 'formula',
      key: 'formula',
      width: 200,
      render: (formula: string) => (
        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {formula}
        </div>
      ),
    },
    {
      title: '变量',
      key: 'variables',
      width: 150,
      render: (_: any, record: CalculationLogic) => (
        <div>
          {record.variables.map(v => (
            <Tag key={v.name} size="small">{v.name}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? 'green' : 'default'}>
          {isDefault ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: CalculationLogic) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => editLogic(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个计算逻辑吗？"
            onConfirm={() => deleteLogic(record.id)}
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

  const showTemplateModal = () => {
    setEditingTemplate(null);
    templateForm.resetFields();
    setIsTemplateModalVisible(true);
  };

  const editTemplate = (template: ProcessTemplate) => {
    setEditingTemplate(template);
    templateForm.setFieldsValue({
      ...template,
      equipment: template.requiredEquipment.join(','),
      materials: template.requiredMaterials.join(',')
    });
    setIsTemplateModalVisible(true);
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = processTemplates.filter(template => template.id !== id);
    onUpdate(updatedTemplates);
    message.success('工序模板已删除');
  };

  const handleTemplateOk = () => {
    templateForm.validateFields().then(values => {
      const { equipment, materials, ...rest } = values;
      
      if (editingTemplate) {
        // 编辑现有模板
        const updatedTemplates = processTemplates.map(template =>
          template.id === editingTemplate.id ? {
            ...template,
            ...rest,
            requiredEquipment: equipment.split(',').map(e => e.trim()).filter(e => e),
            requiredMaterials: materials.split(',').map(m => m.trim()).filter(m => m),
            updatedAt: new Date()
          } : template
        );
        onUpdate(updatedTemplates);
        message.success('工序模板已更新');
      } else {
        // 添加新模板
        const newTemplate: ProcessTemplate = {
          id: Date.now().toString(),
          ...rest,
          requiredEquipment: equipment.split(',').map(e => e.trim()).filter(e => e),
          requiredMaterials: materials.split(',').map(m => m.trim()).filter(m => m),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        onUpdate([...processTemplates, newTemplate]);
        message.success('工序模板已添加');
      }
      setIsTemplateModalVisible(false);
      templateForm.resetFields();
    });
  };

  const showLogicModal = () => {
    setEditingLogic(null);
    logicForm.resetFields();
    setIsLogicModalVisible(true);
  };

  const editLogic = (logic: CalculationLogic) => {
    setEditingLogic(logic);
    logicForm.setFieldsValue(logic);
    setIsLogicModalVisible(true);
  };

  const deleteLogic = (id: string) => {
    const updatedLogics = calculationLogics.filter(logic => logic.id !== id);
    onUpdateLogics(updatedLogics);
    message.success('计算逻辑已删除');
  };

  const handleLogicOk = () => {
    logicForm.validateFields().then(values => {
      const { formula, ...rest } = values;
      
      // 验证公式
      if (!validateFormula(formula)) {
        message.error('公式语法错误，请检查');
        return;
      }

      if (editingLogic) {
        // 编辑现有逻辑
        const updatedLogics = calculationLogics.map(logic =>
          logic.id === editingLogic.id ? {
            ...logic,
            ...rest,
            formula
          } : logic
        );
        onUpdateLogics(updatedLogics);
        message.success('计算逻辑已更新');
      } else {
        // 添加新逻辑
        const newLogic: CalculationLogic = {
          id: Date.now().toString(),
          ...rest,
          formula
        };
        onUpdateLogics([...calculationLogics, newLogic]);
        message.success('计算逻辑已添加');
      }
      setIsLogicModalVisible(false);
      logicForm.resetFields();
    });
  };

  // 统计信息
  const activeTemplates = processTemplates.filter(t => t.isActive);
  const totalLogics = calculationLogics.length;
  const avgVariables = calculationLogics.reduce((sum, logic) => sum + logic.variables.length, 0) / totalLogics;

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <Space>
              <SettingOutlined />
              工序模板管理
            </Space>
          } 
          key="templates"
        >
          <Card
            title="工序模板列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={showTemplateModal}>
                添加模板
              </Button>
            }
          >
            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="模板总数"
                  value={processTemplates.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="启用模板"
                  value={activeTemplates.length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="分类数量"
                  value={new Set(processTemplates.map(t => t.category)).size}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均设备数"
                  value={processTemplates.reduce((sum, t) => sum + t.requiredEquipment.length, 0) / processTemplates.length}
                  precision={1}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>

            <Table
              columns={templateColumns}
              dataSource={processTemplates}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <CalculatorOutlined />
              计算逻辑管理
            </Space>
          } 
          key="logics"
        >
          <Card
            title="计算逻辑列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={showLogicModal}>
                添加逻辑
              </Button>
            }
          >
            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="逻辑总数"
                  value={totalLogics}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="默认逻辑"
                  value={calculationLogics.filter(l => l.isDefault).length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均变量数"
                  value={Math.round(avgVariables * 10) / 10}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="可用变量"
                  value={calculationVariables.length}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>

            <Table
              columns={logicColumns}
              dataSource={calculationLogics}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 工序模板模态框 */}
      <Modal
        title={editingTemplate ? '编辑工序模板' : '添加工序模板'}
        open={isTemplateModalVisible}
        onOk={handleTemplateOk}
        onCancel={() => setIsTemplateModalVisible(false)}
        width={700}
      >
        <Form
          form={templateForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="工序代码"
                rules={[{ required: true, message: '请输入工序代码' }]}
              >
                <Input placeholder="如：CUT、DRILL等" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="工序名称"
                rules={[{ required: true, message: '请输入工序名称' }]}
              >
                <Input placeholder="如：切割、钻孔等" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="工序分类"
                rules={[{ required: true, message: '请选择工序分类' }]}
              >
                <Select placeholder="选择分类">
                  <Option value="cutting">切割</Option>
                  <Option value="drilling">钻孔</Option>
                  <Option value="edging">封边</Option>
                  <Option value="sanding">打磨</Option>
                  <Option value="assembly">组装</Option>
                  <Option value="finishing">表面处理</Option>
                  <Option value="inspection">质检</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="calculationLogic"
                label="计算逻辑"
                rules={[{ required: true, message: '请选择计算逻辑' }]}
              >
                <Select placeholder="选择计算逻辑">
                  {calculationLogics.map(logic => (
                    <Option key={logic.id} value={logic.id}>
                      {logic.name} - {logic.formula}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="所需设备"
                rules={[{ required: true, message: '请输入所需设备' }]}
              >
                <Input placeholder="用逗号分隔，如：数控切割机,切割刀" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="materials"
                label="所需材料"
              >
                <Input placeholder="用逗号分隔，如：板材,胶水" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="工序描述"
            rules={[{ required: true, message: '请输入工序描述' }]}
          >
            <TextArea rows={3} placeholder="详细描述该工序的特点和要求" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 计算逻辑模态框 */}
      <Modal
        title={editingLogic ? '编辑计算逻辑' : '添加计算逻辑'}
        open={isLogicModalVisible}
        onOk={handleLogicOk}
        onCancel={() => setIsLogicModalVisible(false)}
        width={800}
      >
        <Form
          form={logicForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="逻辑名称"
                rules={[{ required: true, message: '请输入逻辑名称' }]}
              >
                <Input placeholder="如：基础切割公式" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isDefault"
                label="设为默认"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="formula"
            label="计算公式"
            rules={[{ required: true, message: '请输入计算公式' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="如：5 + (area / 10000) * 0.5 * complexity * featureFactor"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Alert
            message="可用变量"
            description={
              <div>
                {calculationVariables.map(variable => (
                  <Tag key={variable.name} style={{ margin: '2px' }}>
                    {variable.name} ({variable.unit}) - {variable.description}
                  </Tag>
                ))}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="description"
            label="逻辑描述"
            rules={[{ required: true, message: '请输入逻辑描述' }]}
          >
            <TextArea rows={3} placeholder="描述该计算逻辑的用途和原理" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcessTemplateManager;