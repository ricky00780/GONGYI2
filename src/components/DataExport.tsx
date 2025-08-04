import React from 'react';
import { Button, Modal, message, Space } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Product } from '../types';

interface DataExportProps {
  products: Product[];
}

const DataExport: React.FC<DataExportProps> = ({ products }) => {
  const exportToJSON = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        totalProducts: products.length,
        products: products.map(product => ({
          ...product,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        })),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `furniture-workflow-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('数据导出成功！');
    } catch (error) {
      message.error('数据导出失败，请重试');
      console.error('Export error:', error);
    }
  };

  const showExportPreview = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        totalCost: product.totalCost,
        totalDuration: product.totalDuration,
        status: product.status,
        componentCount: product.components.length,
        totalProcessSteps: product.components.reduce((sum, component) => 
          sum + component.processSteps.length, 0
        ),
      })),
    };

    Modal.info({
      title: '导出数据预览',
      width: 800,
      content: (
        <div>
          <p><strong>导出时间：</strong>{new Date().toLocaleString()}</p>
          <p><strong>产品总数：</strong>{products.length}</p>
          <p><strong>总成本：</strong>¥{products.reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}</p>
          <p><strong>总工时：</strong>{products.reduce((sum, p) => sum + p.totalDuration, 0).toFixed(1)}小时</p>
          <div style={{ marginTop: '16px' }}>
            <h4>产品列表：</h4>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      ),
      onOk() {
        exportToJSON();
      },
    });
  };

  const generateReport = () => {
    const totalCost = products.reduce((sum, p) => sum + p.totalCost, 0);
    const totalDuration = products.reduce((sum, p) => sum + p.totalDuration, 0);
    const totalComponents = products.reduce((sum, p) => sum + p.components.length, 0);
    const totalProcessSteps = products.reduce((sum, p) => 
      sum + p.components.reduce((cSum, c) => cSum + c.processSteps.length, 0), 0
    );

    const completedProducts = products.filter(p => p.status === 'completed').length;
    const inProgressProducts = products.filter(p => p.status === 'in-progress').length;
    const pendingProducts = products.filter(p => p.status === 'pending').length;

    const report = `
板式家具加工工艺流程设计系统 - 生产报告

生成时间：${new Date().toLocaleString()}

=== 总体统计 ===
产品总数：${products.length}
部件总数：${totalComponents}
工序总数：${totalProcessSteps}
总成本：¥${totalCost.toFixed(2)}
总工时：${totalDuration.toFixed(1)}小时

=== 状态分布 ===
已完成：${completedProducts}个产品
进行中：${inProgressProducts}个产品
待开始：${pendingProducts}个产品

=== 产品详情 ===
${products.map(product => `
产品：${product.name}
- 描述：${product.description}
- 状态：${product.status === 'completed' ? '已完成' : product.status === 'in-progress' ? '进行中' : '待开始'}
- 部件数：${product.components.length}
- 工序数：${product.components.reduce((sum, c) => sum + c.processSteps.length, 0)}
- 总成本：¥${product.totalCost.toFixed(2)}
- 总工时：${product.totalDuration.toFixed(1)}小时
`).join('')}

=== 成本分析 ===
平均产品成本：¥${(totalCost / products.length).toFixed(2)}
平均产品工时：${(totalDuration / products.length).toFixed(1)}小时
平均部件成本：¥${(totalCost / totalComponents).toFixed(2)}
平均工序成本：¥${(totalCost / totalProcessSteps).toFixed(2)}

=== 材料使用统计 ===
${(() => {
  const materialStats: { [key: string]: number } = {};
  products.forEach(product => {
    product.components.forEach(component => {
      materialStats[component.material] = (materialStats[component.material] || 0) + 1;
    });
  });
  return Object.entries(materialStats)
    .map(([material, count]) => `${material}：${count}个部件`)
    .join('\n');
})()}

=== 设备使用统计 ===
${(() => {
  const equipmentStats: { [key: string]: number } = {};
  products.forEach(product => {
    product.components.forEach(component => {
      component.processSteps.forEach(step => {
        equipmentStats[step.equipment] = (equipmentStats[step.equipment] || 0) + 1;
      });
    });
  });
  return Object.entries(equipmentStats)
    .map(([equipment, count]) => `${equipment}：${count}次使用`)
    .join('\n');
})()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `furniture-workflow-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('报告生成成功！');
  };

  return (
    <Space>
      <Button 
        icon={<FileTextOutlined />} 
        onClick={showExportPreview}
        type="default"
      >
        预览导出
      </Button>
      <Button 
        icon={<DownloadOutlined />} 
        onClick={exportToJSON}
        type="primary"
      >
        导出JSON
      </Button>
      <Button 
        icon={<DownloadOutlined />} 
        onClick={generateReport}
        type="default"
      >
        生成报告
      </Button>
    </Space>
  );
};

export default DataExport;