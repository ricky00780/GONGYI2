#!/bin/bash

echo "🚀 启动板式家具加工工艺流程设计系统..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📍 访问地址: http://localhost:5173"
echo "🛑 按 Ctrl+C 停止服务器"
npm run dev