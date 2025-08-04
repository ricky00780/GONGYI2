import React, { useState } from 'react';
import { Button, Modal, Upload, message } from 'antd';
import { UploadOutlined, ImportOutlined } from '@ant-design/icons';
import type { Product } from '../types';

const { Dragger } = Upload;

interface DataImportProps {
  onImportData: (products: Product[]) => void;
}

const DataImport: React.FC<DataImportProps> = ({ onImportData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [importData, setImportData] = useState<any>(null);

  const showModal = () => {
    setIsModalVisible(true);
    setImportData(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setImportData(null);
  };

  const handleImport = () => {
    if (!importData || !importData.products) {
      message.error('请先选择有效的JSON文件');
      return;
    }

    try {
      // 转换日期字符串为Date对象
      const products: Product[] = importData.products.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      }));

      onImportData(products);
      message.success(`成功导入 ${products.length} 个产品`);
      setIsModalVisible(false);
    } catch (error) {
      message.error('导入失败，请检查文件格式');
      console.error('Import error:', error);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    beforeUpload: (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.products && Array.isArray(data.products)) {
            setImportData(data);
            message.success('文件解析成功，请点击导入按钮确认导入');
          } else {
            message.error('文件格式不正确，请选择有效的导出文件');
          }
        } catch (error) {
          message.error('文件解析失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
      return false; // 阻止自动上传
    },
  };

  return (
    <>
      <Button 
        icon={<ImportOutlined />} 
        onClick={showModal}
        type="default"
      >
        导入数据
      </Button>

      <Modal
        title="导入产品数据"
        open={isModalVisible}
        onOk={handleImport}
        onCancel={handleCancel}
        okText="导入"
        cancelText="取消"
        okButtonProps={{ disabled: !importData }}
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <p>请选择之前导出的JSON文件进行导入：</p>
        </div>

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个JSON文件，文件大小不超过10MB
          </p>
        </Dragger>

        {importData && (
          <div style={{ marginTop: '16px' }}>
            <h4>导入预览：</h4>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <p><strong>导出时间：</strong>{new Date(importData.exportDate).toLocaleString()}</p>
              <p><strong>产品数量：</strong>{importData.totalProducts}</p>
              <p><strong>产品列表：</strong></p>
              <ul>
                {importData.products.map((product: any, index: number) => (
                  <li key={index}>
                    {product.name} - {product.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px', padding: '12px', background: '#fff7e6', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: '#d46b08' }}>
            <strong>注意：</strong>导入数据将覆盖当前所有产品数据，请谨慎操作！
          </p>
        </div>
      </Modal>
    </>
  );
};

export default DataImport;