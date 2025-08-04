import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Breadcrumb, Space } from 'antd';
import { HomeOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import ProductList from './components/ProductList';
import ComponentManager from './components/ComponentManager';
import ProcessStepManager from './components/ProcessStepManager';
import ProductSummary from './components/ProductSummary';
import DataExport from './components/DataExport';
import DataImport from './components/DataImport';
import ProductSearch from './components/ProductSearch';
import type { Product, Component, ProcessStep } from './types';
import { 
  calculateComponentTotalCost, 
  calculateComponentTotalDuration,
  calculateProductTotalCost,
  calculateProductTotalDuration
} from './utils/calculations';
// import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [currentView, setCurrentView] = useState<'products' | 'components' | 'process' | 'summary'>('products');

  // 初始化示例数据
  useEffect(() => {
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
                duration: 0.42,
                equipment: '封边机',
                materials: ['封边条', '胶水'],
                status: 'completed',
                cost: 42.0,
              },
            ],
            totalCost: 70.0,
            totalDuration: 0.77,
          },
        ],
        totalCost: 574.0,
        totalDuration: 5.41,
        status: 'in-progress',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '2',
        name: '书柜',
        description: '三层书架',
        components: [
          {
            id: '2-1',
            name: '侧板',
            description: '书柜侧板',
            dimensions: { length: 1800, width: 300, height: 18 },
            material: '刨花板',
            thickness: 18,
            holeCount: 12,
            edgeCount: 4,
            processSteps: [
              {
                id: '2-1-1',
                name: '切割加工',
                description: '切割侧板',
                duration: 0.54,
                equipment: '数控切割机',
                materials: ['板材'],
                status: 'pending',
                cost: 64.8,
              },
            ],
            totalCost: 64.8,
            totalDuration: 0.54,
          },
        ],
        totalCost: 64.8,
        totalDuration: 0.54,
        status: 'pending',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
    ];

    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
  }, []);

  // 添加产品
  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  // 编辑产品
  const handleEditProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id
        ? { ...product, ...productData, updatedAt: new Date() }
        : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  // 删除产品
  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
      setCurrentView('products');
    }
  };

  // 导入数据
  const handleImportData = (importedProducts: Product[]) => {
    setProducts(importedProducts);
    setFilteredProducts(importedProducts);
    setSelectedProduct(null);
    setCurrentView('products');
  };

  // 选择产品
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedComponent(null);
    setCurrentView('summary');
  };

  // 添加部件
  const handleAddComponent = (componentData: Omit<Component, 'id' | 'totalCost' | 'totalDuration'>) => {
    if (!selectedProduct) return;

    const workTimeParams = {
      dimensions: componentData.dimensions,
      thickness: componentData.thickness,
      holeCount: componentData.holeCount,
      edgeCount: componentData.edgeCount,
      material: componentData.material,
    };

    const totalDuration = calculateComponentTotalDuration(componentData.processSteps, workTimeParams);
    const totalCost = calculateComponentTotalCost({
      material: componentData.material,
      dimensions: componentData.dimensions,
      thickness: componentData.thickness,
      processSteps: componentData.processSteps,
    });

    const newComponent: Component = {
      ...componentData,
      id: Date.now().toString(),
      totalCost,
      totalDuration,
    };

    const updatedComponents = [...selectedProduct.components, newComponent];
    const updatedProduct = {
      ...selectedProduct,
      components: updatedComponents,
      totalCost: calculateProductTotalCost(updatedComponents),
      totalDuration: calculateProductTotalDuration(updatedComponents),
      updatedAt: new Date(),
    };

    setSelectedProduct(updatedProduct);
    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
  };

  // 编辑部件
  const handleEditComponent = (id: string, componentData: Partial<Component>) => {
    if (!selectedProduct) return;

    const updatedComponents = selectedProduct.components.map(component =>
      component.id === id
        ? { ...component, ...componentData }
        : component
    );

    // 重新计算成本和工时
    const recalculatedComponents = updatedComponents.map(component => {
      const workTimeParams = {
        dimensions: component.dimensions,
        thickness: component.thickness,
        holeCount: component.holeCount,
        edgeCount: component.edgeCount,
        material: component.material,
      };

      const totalDuration = calculateComponentTotalDuration(component.processSteps, workTimeParams);
      const totalCost = calculateComponentTotalCost({
        material: component.material,
        dimensions: component.dimensions,
        thickness: component.thickness,
        processSteps: component.processSteps,
      });

      return { ...component, totalCost, totalDuration };
    });

    const updatedProduct = {
      ...selectedProduct,
      components: recalculatedComponents,
      totalCost: calculateProductTotalCost(recalculatedComponents),
      totalDuration: calculateProductTotalDuration(recalculatedComponents),
      updatedAt: new Date(),
    };

    setSelectedProduct(updatedProduct);
    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
  };

  // 删除部件
  const handleDeleteComponent = (id: string) => {
    if (!selectedProduct) return;

    const updatedComponents = selectedProduct.components.filter(component => component.id !== id);
    const updatedProduct = {
      ...selectedProduct,
      components: updatedComponents,
      totalCost: calculateProductTotalCost(updatedComponents),
      totalDuration: calculateProductTotalDuration(updatedComponents),
      updatedAt: new Date(),
    };

    setSelectedProduct(updatedProduct);
    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
  };

  // 管理工序
  const handleManageProcessSteps = (componentId: string) => {
    const component = selectedProduct?.components.find(c => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
      setCurrentView('process');
    }
  };

  // 查看部件
  const handleViewComponent = (component: Component) => {
    setSelectedComponent(component);
    setCurrentView('process');
  };

  // 更新工序
  const handleUpdateProcessSteps = (componentId: string, processSteps: ProcessStep[]) => {
    if (!selectedProduct || !selectedComponent) return;

    const updatedComponent = { ...selectedComponent, processSteps };
    const updatedComponents = selectedProduct.components.map(component =>
      component.id === componentId ? updatedComponent : component
    );

    // 重新计算成本和工时
    const workTimeParams = {
      dimensions: updatedComponent.dimensions,
      thickness: updatedComponent.thickness,
      holeCount: updatedComponent.holeCount,
      edgeCount: updatedComponent.edgeCount,
      material: updatedComponent.material,
    };

    const totalDuration = calculateComponentTotalDuration(processSteps, workTimeParams);
    const totalCost = calculateComponentTotalCost({
      material: updatedComponent.material,
      dimensions: updatedComponent.dimensions,
      thickness: updatedComponent.thickness,
      processSteps,
    });

    const recalculatedComponent = { ...updatedComponent, totalCost, totalDuration };
    const recalculatedComponents = updatedComponents.map(component =>
      component.id === componentId ? recalculatedComponent : component
    );

    const updatedProduct = {
      ...selectedProduct,
      components: recalculatedComponents,
      totalCost: calculateProductTotalCost(recalculatedComponents),
      totalDuration: calculateProductTotalDuration(recalculatedComponents),
      updatedAt: new Date(),
    };

    setSelectedProduct(updatedProduct);
    setSelectedComponent(recalculatedComponent);
    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
  };

  // 关闭工序管理
  const handleCloseProcessManager = () => {
    setSelectedComponent(null);
    setCurrentView('components');
  };

  // 返回产品列表
  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setSelectedComponent(null);
    setCurrentView('products');
  };



  // 查看产品汇总
  const handleViewSummary = () => {
    setCurrentView('summary');
  };

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
        title: <Button type="link" icon={<AppstoreOutlined />} onClick={handleViewSummary}>
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
    switch (currentView) {
      case 'products':
        return (
          <div>
            <ProductSearch 
              products={products} 
              onFilterChange={setFilteredProducts} 
            />
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Space>
                <DataImport onImportData={handleImportData} />
                <DataExport products={products} />
              </Space>
            </div>
            <ProductList
              products={filteredProducts}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onSelectProduct={handleSelectProduct}
            />
          </div>
        );
      case 'summary':
        return selectedProduct ? (
          <div>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Button type="primary" onClick={() => setCurrentView('components')}>
                管理部件
              </Button>
            </div>
            <ProductSummary product={selectedProduct} />
          </div>
        ) : null;
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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ margin: '16px 0', color: '#1890ff' }}>
          板式家具加工工艺流程设计系统
        </Title>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        {renderBreadcrumb()}
        {renderContent()}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        板式家具加工工艺流程设计系统 ©2024 - 支持多产品多部件管理
      </Footer>
    </Layout>
  );
};

export default App;