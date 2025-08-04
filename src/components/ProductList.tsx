import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Statistic, 
  Row, 
  Col,
  Input as AntInput,
  Tooltip,
  Progress,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { Product, ProcessStatus } from '../types';
import { exportProductsToCSV, exportProjectReport } from '../utils/export';

interface Statistics {
  totalProducts: number;
  completedProducts: number;
  inProgressProducts: number;
  totalCost: number;
  totalDuration: number;
}

interface ProductListProps {
  products: Product[];
  statistics: Statistics;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

const { Search } = AntInput;

const ProductList: React.FC<ProductListProps> = ({
  products,
  statistics,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSelectProduct,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 过滤产品
  const filteredProducts = useMemo(() => {
    if (!searchText) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [products, searchText]);

  const showModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
    });
    setIsModalVisible(true);
  };

  const deleteProduct = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个产品吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => onDeleteProduct(id),
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingProduct) {
        onEditProduct(editingProduct.id, values);
      } else {
        onAddProduct({
          ...values,
          components: [],
          totalCost: 0,
          totalDuration: 0,
          status: 'pending',
        });
      }
      setIsModalVisible(false);
    }).catch((errorInfo) => {
      console.error('表单验证失败:', errorInfo);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleExportCSV = () => {
    try {
      exportProductsToCSV(products, `products_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('导出CSV失败:', error);
    }
  };

  const handleExportReport = () => {
    try {
      exportProjectReport(products, `project_report_${new Date().toISOString().split('T')[0]}.html`);
    } catch (error) {
      console.error('导出报告失败:', error);
    }
  };

  const getStatusColor = (status: ProcessStatus) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'blue';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <Button 
          type="link" 
          onClick={() => onSelectProduct(record)}
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
      title: '部件数量',
      key: 'componentCount',
      render: (record: Product) => (
        <Tag color="blue">{record.components.length}</Tag>
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProcessStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Product) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => onSelectProduct(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => editProduct(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => deleteProduct(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const completionRate = statistics.totalProducts > 0 
    ? (statistics.completedProducts / statistics.totalProducts) * 100 
    : 0;

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总产品数"
              value={statistics.totalProducts}
              prefix={<span style={{ color: '#1890ff' }}>📦</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={statistics.completedProducts}
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
          <span>完成进度：</span>
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
            {statistics.completedProducts}/{statistics.totalProducts}
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
              placeholder="搜索产品名称或描述"
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
                icon={<ExportOutlined />}
                onClick={handleExportCSV}
              >
                导出CSV
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExportReport}
              >
                导出报告
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={showModal}
              >
                添加产品
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 产品表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
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
                description="暂无产品数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* 添加/编辑产品模态框 */}
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            description: '',
          }}
        >
          <Form.Item
            name="name"
            label="产品名称"
            rules={[
              { required: true, message: '请输入产品名称' },
              { max: 50, message: '产品名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="产品描述"
            rules={[
              { max: 200, message: '产品描述不能超过200个字符' },
            ]}
          >
            <Input.TextArea 
              placeholder="请输入产品描述" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;