import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Typography, Button, Breadcrumb, Spin, Alert, ConfigProvider } from 'antd';
import { HomeOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import ProductList from './components/ProductList';
import ComponentManager from './components/ComponentManager';
import ProcessStepManager from './components/ProcessStepManager';
import ErrorBoundary from './components/ErrorBoundary';
import type { Product, Component, ProcessStep } from './types';
import { 
  calculateComponentTotalCost, 
  calculateComponentTotalDuration,
  calculateProductTotalCost,
  calculateProductTotalDuration
} from './utils/calculations';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [currentView, setCurrentView] = useState<'products' | 'components' | 'process'>('products');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 尝试从本地存储加载数据
        const savedProducts = loadFromLocalStorage<Product[]>('products');
        if (savedProducts && Array.isArray(savedProducts) && savedProducts.length > 0) {
          setProducts(savedProducts);
        } else {
          // 加载示例数据
          const sampleProducts: Product[] = [
            {
              id: '1',
              name: '办公桌',
              description: '现代简约风格办公桌',
              components: [
                {
                  id: '1-1',
                  name: '桌面',
                  description: '主桌面板',
                  dimensions: { length: 1200, width: 600, height: 25 },
                  material: '密度板',
                  thickness: 25,
                  holeCount: 8,
                  edgeCount: 4,
                  processSteps: [
                    {
                      id: '1-1-1',
                      name: '切割加工',
                      description: '根据图纸进行精确切割',
                      duration: 2.4,
                      equipment: '数控切割机',
                      materials: ['板材'],
                      status: 'completed',
                      cost: 288.0,
                    },
                    {
                      id: '1-1-2',
                      name: '封边处理',
                      description: '对切割后的板材进行封边',
                      duration: 1.44,
                      equipment: '封边机',
                      materials: ['封边条', '胶水'],
                      status: 'in-progress',
                      cost: 144.0,
                    },
                    {
                      id: '1-1-3',
                      name: '钻孔加工',
                      description: '根据设计要求进行钻孔',
                      duration: 0.8,
                      equipment: '钻孔机',
                      materials: ['钻头'],
                      status: 'pending',
                      cost: 72.0,
                    },
                  ],
                  totalCost: 504.0,
                  totalDuration: 4.64,
                },
                {
                  id: '1-2',
                  name: '桌腿',
                  description: '金属桌腿',
                  dimensions: { length: 700, width: 50, height: 50 },
                  material: '实木板',
                  thickness: 25,
                  holeCount: 4,
                  edgeCount: 4,
                  processSteps: [
                    {
                      id: '1-2-1',
                      name: '切割加工',
                      description: '切割桌腿材料',
                      duration: 0.35,
                      equipment: '切割机',
                      materials: ['板材'],
                      status: 'completed',
                      cost: 28.0,
                    },
                    {
                      id: '1-2-2',
                      name: '封边处理',
                      description: '桌腿封边',
                      duration: 0.28,
                      equipment: '封边机',
                      materials: ['封边条', '胶水'],
                      status: 'completed',
                      cost: 28.0,
                    },
                  ],
                  totalCost: 56.0,
                  totalDuration: 0.63,
                },
              ],
              totalCost: 560.0,
              totalDuration: 5.27,
              status: 'in-progress',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-20'),
            },
            {
              id: '2',
              name: '书架',
              description: '多层书架',
              components: [
                {
                  id: '2-1',
                  name: '层板',
                  description: '书架层板',
                  dimensions: { length: 800, width: 300, height: 18 },
                  material: '密度板',
                  thickness: 18,
                  holeCount: 6,
                  edgeCount: 4,
                  processSteps: [
                    {
                      id: '2-1-1',
                      name: '切割加工',
                      description: '切割层板材料',
                      duration: 1.2,
                      equipment: '数控切割机',
                      materials: ['板材'],
                      status: 'completed',
                      cost: 144.0,
                    },
                  ],
                  totalCost: 144.0,
                  totalDuration: 1.2,
                },
              ],
              totalCost: 144.0,
              totalDuration: 1.2,
              status: 'pending',
              createdAt: new Date('2024-01-18'),
              updatedAt: new Date('2024-01-18'),
            },
          ];
          setProducts(sampleProducts);
        }
      } catch (err) {
        setError('初始化数据失败，请刷新页面重试');
        console.error('初始化数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (products.length > 0) {
      try {
        saveToLocalStorage('products', products);
      } catch (err) {
        console.error('保存数据失败:', err);
      }
    }
  }, [products]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const totalProducts = products.length;
    const completedProducts = products.filter(p => p.status === 'completed').length;
    const inProgressProducts = products.filter(p => p.status === 'in-progress').length;
    const totalCost = products.reduce((sum, p) => sum + p.totalCost, 0);
    const totalDuration = products.reduce((sum, p) => sum + p.totalDuration, 0);

    return {
      totalProducts,
      completedProducts,
      inProgressProducts,
      totalCost,
      totalDuration,
    };
  }, [products]);

  // 添加产品
  const handleAddProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError('添加产品失败');
      console.error('添加产品失败:', err);
    }
  }, []);

  // 编辑产品
  const handleEditProduct = useCallback((id: string, productData: Partial<Product>) => {
    try {
      setProducts(prev => prev.map(p => 
        p.id === id 
          ? { ...p, ...productData, updatedAt: new Date() }
          : p
      ));
    } catch (err) {
      setError('编辑产品失败');
      console.error('编辑产品失败:', err);
    }
  }, []);

  // 删除产品
  const handleDeleteProduct = useCallback((id: string) => {
    try {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
        setCurrentView('products');
      }
    } catch (err) {
      setError('删除产品失败');
      console.error('删除产品失败:', err);
    }
  }, [selectedProduct]);

  // 选择产品
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentView('components');
  }, []);

  // 添加部件
  const handleAddComponent = useCallback((componentData: Omit<Component, 'id' | 'totalCost' | 'totalDuration'>) => {
    if (!selectedProduct) return;

    try {
      const newComponent: Component = {
        ...componentData,
        id: `${selectedProduct.id}-${Date.now()}`,
        totalCost: 0,
        totalDuration: 0,
      };

      const updatedProduct = {
        ...selectedProduct,
        components: [...selectedProduct.components, newComponent],
        updatedAt: new Date(),
      };

      setSelectedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    } catch (err) {
      setError('添加部件失败');
      console.error('添加部件失败:', err);
    }
  }, [selectedProduct]);

  // 编辑部件
  const handleEditComponent = useCallback((id: string, componentData: Partial<Component>) => {
    if (!selectedProduct) return;

    try {
      const updatedComponents = selectedProduct.components.map(c => 
        c.id === id ? { ...c, ...componentData } : c
      );

      // 重新计算部件成本
      const recalculatedComponents = updatedComponents.map(c => {
        const params = {
          material: c.material,
          dimensions: c.dimensions,
          thickness: c.thickness,
          processSteps: c.processSteps,
        };
        
        const totalCost = calculateComponentTotalCost(params);
        const totalDuration = calculateComponentTotalDuration(c.processSteps, {
          dimensions: c.dimensions,
          thickness: c.thickness,
          holeCount: c.holeCount,
          edgeCount: c.edgeCount,
          material: c.material,
        });

        return { ...c, totalCost, totalDuration };
      });

      const updatedProduct = {
        ...selectedProduct,
        components: recalculatedComponents,
        totalCost: calculateProductTotalCost(recalculatedComponents),
        totalDuration: calculateProductTotalDuration(recalculatedComponents),
        updatedAt: new Date(),
      };

      setSelectedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    } catch (err) {
      setError('编辑部件失败');
      console.error('编辑部件失败:', err);
    }
  }, [selectedProduct]);

  // 删除部件
  const handleDeleteComponent = useCallback((id: string) => {
    if (!selectedProduct) return;

    try {
      const updatedComponents = selectedProduct.components.filter(c => c.id !== id);
      const updatedProduct = {
        ...selectedProduct,
        components: updatedComponents,
        totalCost: calculateProductTotalCost(updatedComponents),
        totalDuration: calculateProductTotalDuration(updatedComponents),
        updatedAt: new Date(),
      };

      setSelectedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    } catch (err) {
      setError('删除部件失败');
      console.error('删除部件失败:', err);
    }
  }, [selectedProduct]);

  // 管理工序
  const handleManageProcessSteps = useCallback((componentId: string) => {
    if (!selectedProduct) return;

    const component = selectedProduct.components.find(c => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
      setCurrentView('process');
    }
  }, [selectedProduct]);

  // 查看部件
  const handleViewComponent = useCallback((component: Component) => {
    setSelectedComponent(component);
    setCurrentView('process');
  }, []);

  // 更新工序
  const handleUpdateProcessSteps = useCallback((componentId: string, processSteps: ProcessStep[]) => {
    if (!selectedProduct) return;

    try {
      const updatedComponents = selectedProduct.components.map(c => {
        if (c.id === componentId) {
          // 重新计算工序成本
          const recalculatedSteps = processSteps.map(step => {
            const cost = step.cost; // 保持原有成本，或者重新计算
            return { ...step, cost };
          });

          const totalCost = calculateComponentTotalCost({
            material: c.material,
            dimensions: c.dimensions,
            thickness: c.thickness,
            processSteps: recalculatedSteps,
          });

          const totalDuration = calculateComponentTotalDuration(recalculatedSteps, {
            dimensions: c.dimensions,
            thickness: c.thickness,
            holeCount: c.holeCount,
            edgeCount: c.edgeCount,
            material: c.material,
          });

          return { ...c, processSteps: recalculatedSteps, totalCost, totalDuration };
        }
        return c;
      });

      const updatedProduct = {
        ...selectedProduct,
        components: updatedComponents,
        totalCost: calculateProductTotalCost(updatedComponents),
        totalDuration: calculateProductTotalDuration(updatedComponents),
        updatedAt: new Date(),
      };

      setSelectedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      
      // 更新选中的部件
      const recalculatedComponent = updatedComponents.find(c => c.id === componentId);
      if (recalculatedComponent) {
        setSelectedComponent(recalculatedComponent);
      }
    } catch (err) {
      setError('更新工序失败');
      console.error('更新工序失败:', err);
    }
  }, [selectedProduct]);

  // 关闭工序管理
  const handleCloseProcessManager = useCallback(() => {
    setSelectedComponent(null);
    setCurrentView('components');
  }, []);

  // 返回产品列表
  const handleBackToProducts = useCallback(() => {
    setSelectedProduct(null);
    setSelectedComponent(null);
    setCurrentView('products');
    setError(null);
  }, []);

  // 返回部件列表
  const handleBackToComponents = useCallback(() => {
    setSelectedComponent(null);
    setCurrentView('components');
    setError(null);
  }, []);

  // 清除错误
  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  const renderBreadcrumb = () => {
    const items = [
      {
        title: <Button type="link" icon={<HomeOutlined />} onClick={handleBackToProducts}>
          产品列表
        </Button>,
      },
    ];

    if (selectedProduct) {
      items.push({
        title: <Button type="link" icon={<AppstoreOutlined />} onClick={handleBackToComponents}>
          {selectedProduct.name}
        </Button>,
      });
    }

    if (selectedComponent) {
      items.push({
        title: <span><SettingOutlined /> {selectedComponent.name} - 工序管理</span>,
      });
    }

    return <Breadcrumb items={items} style={{ marginBottom: '16px' }} />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>加载中...</div>
        </div>
      );
    }

    switch (currentView) {
      case 'products':
        return (
          <ProductList
            products={products}
            statistics={statistics}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onSelectProduct={handleSelectProduct}
          />
        );
      case 'components':
        return selectedProduct ? (
          <ComponentManager
            components={selectedProduct.components}
            onAddComponent={handleAddComponent}
            onEditComponent={handleEditComponent}
            onDeleteComponent={handleDeleteComponent}
            onManageProcessSteps={handleManageProcessSteps}
            onViewComponent={handleViewComponent}
          />
        ) : null;
      case 'process':
        return selectedComponent ? (
          <ProcessStepManager
            component={selectedComponent}
            onUpdateProcessSteps={handleUpdateProcessSteps}
            onClose={handleCloseProcessManager}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title level={2} style={{ margin: '16px 0', color: '#1890ff' }}>
            板式家具加工工艺流程设计系统
          </Title>
        </Header>
        
        <Content style={{ padding: '24px' }}>
          {error && (
            <Alert
              message="错误"
              description={error}
              type="error"
              showIcon
              closable
              onClose={handleClearError}
              style={{ marginBottom: '16px' }}
            />
          )}
          
          {renderBreadcrumb()}
          
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </Content>

        <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
          板式家具加工工艺流程设计系统 ©2024 - 支持多产品多部件管理
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;