import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Tabs, Space, Statistic, message } from 'antd';
import { 
  PlusOutlined, 
  SettingOutlined, 
  CalculatorOutlined, 
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
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

// 导入类型和工具
import { 
  EfficiencyConfig, 
  Component, 
  Material, 
  Equipment,
  Product 
} from './types';
import { 
  calculateProductTotalTime, 
  calculateMaterialCost, 
  calculateLaborCost, 
  calculateTotalCost,
  formatTime, 
  formatCost,
  calculateEfficiencyMetrics 
} from './utils/calculations';

// 导入默认数据
import { 
  defaultEfficiencyConfigs, 
  defaultMaterials, 
  defaultEquipment,
  sampleProduct 
} from './data/defaultData';

// 导入组件
import EfficiencyConfigManager from './components/EfficiencyConfigManager';
import ProductDesigner from './components/ProductDesigner';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const App: React.FC = () => {
  // 状态管理
  const [efficiencyConfigs, setEfficiencyConfigs] = useState<EfficiencyConfig[]>(defaultEfficiencyConfigs);
  const [materials, setMaterials] = useState<Material[]>(defaultMaterials);
  const [equipment, setEquipment] = useState<Equipment[]>(defaultEquipment);
  const [currentProduct, setCurrentProduct] = useState<Product>(sampleProduct);
  const [activeTab, setActiveTab] = useState('overview');

  // ReactFlow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 更新产品组件
  const updateProductComponents = (components: Component[]) => {
    const updatedProduct = {
      ...currentProduct,
      components,
      totalComponents: components.length,
      totalTime: calculateProductTotalTime(components),
      updatedAt: new Date()
    };
    setCurrentProduct(updatedProduct);
  };

  // 更新效率配置
  const updateEfficiencyConfigs = (configs: EfficiencyConfig[]) => {
    setEfficiencyConfigs(configs);
    message.success('效率配置已更新');
  };

  // 计算成本
  const materialCost = calculateMaterialCost(
    currentProduct.components,
    Object.fromEntries(materials.map(m => [m.name, { price: m.price, unit: m.unit }]))
  );
  const laborCost = calculateLaborCost(currentProduct.totalTime);
  const totalCost = calculateTotalCost(materialCost, laborCost);

  // 计算效率指标
  const efficiencyMetrics = calculateEfficiencyMetrics(currentProduct.components);

  // 更新流程图
  useEffect(() => {
    const processNodes: Node[] = [];
    const processEdges: Edge[] = [];
    
    // 为每个部件创建节点
    currentProduct.components.forEach((component, componentIndex) => {
      const componentNode: Node = {
        id: `component-${component.id}`,
        type: 'default',
        position: { x: 300 * componentIndex, y: 50 },
        data: { 
          label: component.name,
          type: 'component',
          component
        },
        style: {
          background: '#1890ff',
          color: 'white',
          border: '2px solid #096dd9',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '120px',
          fontWeight: 'bold'
        }
      };
      processNodes.push(componentNode);

      // 为每个工艺创建节点
      component.processes.forEach((process, processIndex) => {
        const processNode: Node = {
          id: `process-${process.id}`,
          type: 'default',
          position: { 
            x: 300 * componentIndex + 150 * processIndex, 
            y: 150 + 80 * processIndex 
          },
          data: { 
            label: process.processName,
            type: 'process',
            process,
            component
          },
          style: {
            background: process.status === 'completed' ? '#52c41a' : 
                        process.status === 'in-progress' ? '#1890ff' : '#d9d9d9',
            color: 'white',
            border: '2px solid #ccc',
            borderRadius: '6px',
            padding: '8px',
            minWidth: '100px',
            fontSize: '12px'
          }
        };
        processNodes.push(processNode);

        // 连接部件到工艺
        if (processIndex === 0) {
          processEdges.push({
            id: `edge-${component.id}-${process.id}`,
            source: `component-${component.id}`,
            target: `process-${process.id}`,
            type: 'smoothstep',
            style: { stroke: '#1890ff', strokeWidth: 2 }
          });
        }

        // 连接工艺到工艺
        if (processIndex > 0) {
          processEdges.push({
            id: `edge-${component.processes[processIndex - 1].id}-${process.id}`,
            source: `process-${component.processes[processIndex - 1].id}`,
            target: `process-${process.id}`,
            type: 'smoothstep',
            style: { stroke: '#1890ff', strokeWidth: 2 }
          });
        }
      });
    });

    setNodes(processNodes);
    setEdges(processEdges);
  }, [currentProduct.components, setNodes, setEdges]);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ margin: '16px 0', color: '#1890ff' }}>
          板式家具加工工艺流程设计系统
        </Title>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane 
            tab={
              <Space>
                <BarChartOutlined />
                概览
              </Space>
            } 
            key="overview"
          >
            <Row gutter={[24, 24]}>
              {/* 统计信息 */}
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="产品部件数"
                        value={currentProduct.totalComponents}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="总工艺数"
                        value={efficiencyMetrics.totalProcesses}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="总加工时间"
                        value={formatTime(currentProduct.totalTime)}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="预估成本"
                        value={formatCost(totalCost)}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* 成本分析 */}
              <Col span={12}>
                <Card title="成本分析" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="材料成本"
                        value={formatCost(materialCost)}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="人工成本"
                        value={formatCost(laborCost)}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="管理费用"
                        value={formatCost(totalCost - materialCost - laborCost)}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="平均部件时间"
                        value={formatTime(efficiencyMetrics.avgTimePerComponent)}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* 效率指标 */}
              <Col span={12}>
                <Card title="效率指标" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="配置工艺数"
                        value={efficiencyConfigs.length}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="可用材料数"
                        value={materials.length}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="设备数量"
                        value={equipment.length}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="平均复杂度"
                        value={currentProduct.components.reduce((sum, comp) => {
                          const factor = comp.complexity === 'complex' ? 3 : comp.complexity === 'medium' ? 2 : 1;
                          return sum + factor;
                        }, 0) / currentProduct.components.length}
                        precision={1}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* 工艺流程图 */}
              <Col span={24}>
                <Card title="工艺流程概览">
                  <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
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
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <CalculatorOutlined />
                产品设计
              </Space>
            } 
            key="design"
          >
            <ProductDesigner
              components={currentProduct.components}
              efficiencyConfigs={efficiencyConfigs}
              materials={Object.fromEntries(materials.map(m => [m.name, { price: m.price, unit: m.unit }]))}
              onUpdate={updateProductComponents}
            />
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <SettingOutlined />
                效率配置
              </Space>
            } 
            key="efficiency"
          >
            <EfficiencyConfigManager
              efficiencyConfigs={efficiencyConfigs}
              onUpdate={updateEfficiencyConfigs}
            />
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <FileTextOutlined />
                材料管理
              </Space>
            } 
            key="materials"
          >
            <Card title="材料管理">
              <p>材料管理功能开发中...</p>
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <TeamOutlined />
                设备管理
              </Space>
            } 
            key="equipment"
          >
            <Card title="设备管理">
              <p>设备管理功能开发中...</p>
            </Card>
          </TabPane>
        </Tabs>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        板式家具加工工艺流程设计系统 ©2024 - 支持多部件尺寸计算和统一效率管理
      </Footer>
    </Layout>
  );
};

export default App;