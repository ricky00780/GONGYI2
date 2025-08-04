import React, { useState, useMemo } from 'react';
import { Input, Select, Card, Space, Tag, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { Product } from '../types';

const { Option } = Select;

interface ProductSearchProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ products, onFilterChange }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [materialFilter, setMaterialFilter] = useState<string>('all');

  // 获取所有材料类型
  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(product => {
      product.components.forEach(component => {
        materials.add(component.material);
      });
    });
    return Array.from(materials);
  }, [products]);

  // 筛选逻辑
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 文本搜索
      const matchesSearch = searchText === '' || 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase()) ||
        product.components.some(component => 
          component.name.toLowerCase().includes(searchText.toLowerCase()) ||
          component.description.toLowerCase().includes(searchText.toLowerCase())
        );

      // 状态筛选
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

      // 材料筛选
      const matchesMaterial = materialFilter === 'all' || 
        product.components.some(component => component.material === materialFilter);

      return matchesSearch && matchesStatus && matchesMaterial;
    });
  }, [products, searchText, statusFilter, materialFilter]);

  // 更新筛选结果
  React.useEffect(() => {
    onFilterChange(filteredProducts);
  }, [filteredProducts, onFilterChange]);

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setMaterialFilter('all');
  };

  const hasActiveFilters = searchText !== '' || statusFilter !== 'all' || materialFilter !== 'all';

  return (
    <Card size="small" style={{ marginBottom: '16px' }}>
      <Space wrap style={{ width: '100%' }}>
        <Input
          placeholder="搜索产品名称、描述或部件..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
        />
        
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          placeholder="状态"
        >
          <Option value="all">全部状态</Option>
          <Option value="pending">待开始</Option>
          <Option value="in-progress">进行中</Option>
          <Option value="completed">已完成</Option>
        </Select>

        <Select
          value={materialFilter}
          onChange={setMaterialFilter}
          style={{ width: 120 }}
          placeholder="材料"
        >
          <Option value="all">全部材料</Option>
          {allMaterials.map(material => (
            <Option key={material} value={material}>{material}</Option>
          ))}
        </Select>

        {hasActiveFilters && (
          <Button 
            icon={<ClearOutlined />} 
            onClick={clearFilters}
            size="small"
          >
            清除筛选
          </Button>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <Tag color="blue">
            共 {filteredProducts.length} 个产品
          </Tag>
          {hasActiveFilters && (
            <Tag color="orange">
              已筛选
            </Tag>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default ProductSearch;