import type { Product, Component, ProcessStep } from '../types';

/**
 * 导出数据为JSON格式
 */
export const exportToJSON = (data: any, filename: string = 'data.json'): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出JSON失败:', error);
    throw new Error('导出失败');
  }
};

/**
 * 导出产品数据为CSV格式
 */
export const exportProductsToCSV = (products: Product[], filename: string = 'products.csv'): void => {
  try {
    const headers = [
      '产品ID',
      '产品名称',
      '描述',
      '状态',
      '总成本',
      '总工时',
      '部件数量',
      '创建时间',
      '更新时间'
    ];

    const rows = products.map(product => [
      product.id,
      product.name,
      product.description,
      product.status,
      product.totalCost.toFixed(2),
      product.totalDuration.toFixed(1),
      product.components.length,
      product.createdAt.toLocaleDateString('zh-CN'),
      product.updatedAt.toLocaleDateString('zh-CN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出CSV失败:', error);
    throw new Error('导出失败');
  }
};

/**
 * 导出部件数据为CSV格式
 */
export const exportComponentsToCSV = (components: Component[], filename: string = 'components.csv'): void => {
  try {
    const headers = [
      '部件ID',
      '部件名称',
      '描述',
      '材料',
      '尺寸(长×宽×高)',
      '厚度',
      '开孔次数',
      '封边数量',
      '总成本',
      '总工时',
      '工序数量'
    ];

    const rows = components.map(component => [
      component.id,
      component.name,
      component.description,
      component.material,
      `${component.dimensions.length}×${component.dimensions.width}×${component.dimensions.height}`,
      component.thickness,
      component.holeCount,
      component.edgeCount,
      component.totalCost.toFixed(2),
      component.totalDuration.toFixed(1),
      component.processSteps.length
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出CSV失败:', error);
    throw new Error('导出失败');
  }
};

/**
 * 导出工序数据为CSV格式
 */
export const exportProcessStepsToCSV = (processSteps: ProcessStep[], filename: string = 'process_steps.csv'): void => {
  try {
    const headers = [
      '工序ID',
      '工序名称',
      '描述',
      '设备',
      '材料',
      '预计工时',
      '成本',
      '状态'
    ];

    const rows = processSteps.map(step => [
      step.id,
      step.name,
      step.description,
      step.equipment,
      step.materials.join(';'),
      step.duration.toFixed(1),
      step.cost.toFixed(2),
      step.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出CSV失败:', error);
    throw new Error('导出失败');
  }
};

/**
 * 导出完整项目报告
 */
export const exportProjectReport = (products: Product[], filename: string = 'project_report.html'): void => {
  try {
    const totalProducts = products.length;
    const totalComponents = products.reduce((sum, p) => sum + p.components.length, 0);
    const totalProcessSteps = products.reduce((sum, p) => 
      sum + p.components.reduce((cSum, c) => cSum + c.processSteps.length, 0), 0
    );
    const totalCost = products.reduce((sum, p) => sum + p.totalCost, 0);
    const totalDuration = products.reduce((sum, p) => sum + p.totalDuration, 0);

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>板式家具加工工艺流程设计系统 - 项目报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .product-section { margin-bottom: 40px; }
        .product-header { background: #e6f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .component-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .component-table th, .component-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .component-table th { background: #f5f5f5; }
        .process-table { width: 100%; border-collapse: collapse; }
        .process-table th, .process-table td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px; }
        .process-table th { background: #f5f5f5; }
        .status-completed { color: #52c41a; }
        .status-in-progress { color: #1890ff; }
        .status-pending { color: #fa8c16; }
    </style>
</head>
<body>
    <div class="header">
        <h1>板式家具加工工艺流程设计系统</h1>
        <h2>项目报告</h2>
        <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
    </div>

    <div class="summary">
        <h3>项目概览</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">${totalProducts}</div>
                <div>总产品数</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalComponents}</div>
                <div>总部件数</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalProcessSteps}</div>
                <div>总工序数</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">¥${totalCost.toFixed(2)}</div>
                <div>总成本</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${totalDuration.toFixed(1)}h</div>
                <div>总工时</div>
            </div>
        </div>
    </div>

    ${products.map(product => `
    <div class="product-section">
        <div class="product-header">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>状态：<span class="status-${product.status}">${product.status}</span> | 
               成本：¥${product.totalCost.toFixed(2)} | 
               工时：${product.totalDuration.toFixed(1)}小时</p>
        </div>
        
        <table class="component-table">
            <thead>
                <tr>
                    <th>部件名称</th>
                    <th>材料</th>
                    <th>尺寸</th>
                    <th>成本</th>
                    <th>工时</th>
                    <th>工序数</th>
                </tr>
            </thead>
            <tbody>
                ${product.components.map(component => `
                <tr>
                    <td>${component.name}</td>
                    <td>${component.material}</td>
                    <td>${component.dimensions.length}×${component.dimensions.width}×${component.dimensions.height}mm</td>
                    <td>¥${component.totalCost.toFixed(2)}</td>
                    <td>${component.totalDuration.toFixed(1)}h</td>
                    <td>${component.processSteps.length}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        ${product.components.map(component => `
        <h4>${component.name} - 工序详情</h4>
        <table class="process-table">
            <thead>
                <tr>
                    <th>工序名称</th>
                    <th>设备</th>
                    <th>材料</th>
                    <th>工时</th>
                    <th>成本</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                ${component.processSteps.map(step => `
                <tr>
                    <td>${step.name}</td>
                    <td>${step.equipment}</td>
                    <td>${step.materials.join(', ')}</td>
                    <td>${step.duration.toFixed(1)}h</td>
                    <td>¥${step.cost.toFixed(2)}</td>
                    <td class="status-${step.status}">${step.status}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        `).join('')}
    </div>
    `).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出报告失败:', error);
    throw new Error('导出失败');
  }
};