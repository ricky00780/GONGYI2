import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { Product, ProcessStatus } from '../types';

interface ProductListProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSelectProduct,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

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
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <a onClick={() => onSelectProduct(record)}>{text}</a>
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
      dataIndex: 'components',
      key: 'componentCount',
      render: (components: any[]) => components.length,
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProcessStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onSelectProduct(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => editProduct(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteProduct(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const totalProducts = products.length;
  const completedProducts = products.filter(p => p.status === 'completed').length;
  const inProgressProducts = products.filter(p => p.status === 'in-progress').length;
  const totalCost = products.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总产品数"
              value={totalProducts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedProducts}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={inProgressProducts}
              valueStyle={{ color: '#1890ff' }}
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
      </Row>

      <Card
        title="产品列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            添加产品
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={products}
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
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="产品描述"
            rules={[{ required: true, message: '请输入产品描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入产品描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;