import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space } from 'antd';
import { DollarOutlined, ClockCircleOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import type { Product, Component } from '../types';

interface ProductSummaryProps {
  product: Product;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ product }) => {
  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const calculateProgress = () => {
    const totalSteps = product.components.reduce((sum, component) => 
      sum + component.processSteps.length, 0
    );
    const completedSteps = product.components.reduce((sum, component) => 
      sum + component.processSteps.filter(step => step.status === 'completed').length, 0
    );
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const componentColumns = [
    {
      title: '部件名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '工序数',
      dataIndex: 'processSteps',
      key: 'processCount',
      render: (processSteps: any[]) => processSteps.length,
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
      key: 'status',
      render: (record: Component) => {
        const completedSteps = record.processSteps.filter(step => step.status === 'completed').length;
        const totalSteps = record.processSteps.length;
        const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
        
        let status = 'pending';
        if (progress === 100) status = 'completed';
        else if (progress > 0) status = 'in-progress';
        
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)} ({progress}%)
          </Tag>
        );
      },
    },
  ];

  const costBreakdown = [
    {
      key: 'material',
      name: '材料成本',
      value: product.components.reduce((sum, component) => {
        const surfaceArea = (component.dimensions.length * component.dimensions.width) / 1000000;
        const materialPrices: { [key: string]: number } = {
          '实木板': 120, '密度板': 45, '刨花板': 35, '多层板': 60,
          '胶合板': 50, '中纤板': 40, '防火板': 80, '生态板': 70
        };
        const materialPrice = materialPrices[component.material] || 50;
        return sum + (surfaceArea * materialPrice);
      }, 0),
    },
    {
      key: 'process',
      name: '工序成本',
      value: product.components.reduce((sum, component) => 
        sum + component.processSteps.reduce((stepSum, step) => stepSum + step.cost, 0), 0
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="产品总成本"
              value={product.totalCost}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="产品总工时"
              value={product.totalDuration}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
              precision={1}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部件数量"
              value={product.components.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总工序数"
              value={product.components.reduce((sum, component) => 
                sum + component.processSteps.length, 0
              )}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="生产进度">
            <Progress
              percent={calculateProgress()}
              status={calculateProgress() === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ marginTop: '16px' }}>
              <Space>
                <Tag color="green">已完成: {product.components.reduce((sum, component) => 
                  sum + component.processSteps.filter(step => step.status === 'completed').length, 0
                )}</Tag>
                <Tag color="blue">进行中: {product.components.reduce((sum, component) => 
                  sum + component.processSteps.filter(step => step.status === 'in-progress').length, 0
                )}</Tag>
                <Tag color="orange">待开始: {product.components.reduce((sum, component) => 
                  sum + component.processSteps.filter(step => step.status === 'pending').length, 0
                )}</Tag>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="成本构成">
            <div style={{ marginBottom: '16px' }}>
              {costBreakdown.map(item => (
                <div key={item.key} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name}</span>
                    <span>¥{item.value.toFixed(2)}</span>
                  </div>
                  <Progress
                    percent={Math.round((item.value / product.totalCost) * 100)}
                    showInfo={false}
                    strokeColor={item.key === 'material' ? '#52c41a' : '#1890ff'}
                    size="small"
                  />
                </div>
              ))}
            </div>
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              paddingTop: '8px', 
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>总成本</span>
              <span>¥{product.totalCost.toFixed(2)}</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="部件详情">
        <Table
          columns={componentColumns}
          dataSource={product.components}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ProductSummary;