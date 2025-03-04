# React Tabs 组件复用指南

本指南将帮助你理解如何在不使用npm包的情况下复用React Tabs组件。

## 组件概述

React Tabs是一个功能丰富的标签页组件，提供以下特性：

- 支持标签页切换、拖拽排序
- 内置标签滚动功能，处理过多标签的情况
- 支持标签关闭功能
- 可自定义主题
- 可隐藏内容区域作为纯导航栏使用
- **支持多实例使用**（从v1.1.0开始）

## 复用方法

### 创建本地组件库

为了更好的组织多个可复用组件：

1. 在你的项目中创建一个`components`目录
2. 复制tabs组件到该目录
3. 创建一个index.js文件集中导出所有组件
4. 在你的组件中导入：

```jsx
import { Tabs } from 'components/tabs';
import 'components/tabs/Tabs.css';
```

## 多实例支持

### 基本使用

从v1.1.0版本开始，Tabs组件进行了重大改进，支持在同一个页面上使用多个实例，而不会互相干扰。这是通过以下改进实现的：

1. 使用React Refs代替全局DOM查询
2. 为每个Tabs实例维护独立的状态
3. 每个实例使用唯一标识符

### 标签删除功能在多实例中的正确使用

在使用多个Tabs实例并需要支持标签删除功能时，**必须**为每个实例提供：

1. **独立的状态管理**：为每个Tabs实例创建独立的状态变量
2. **onClose回调**：实现对应的回调函数来更新状态
3. **条件渲染**：使用条件渲染来控制标签的显示与隐藏

示例代码：

```jsx
import React, { useState } from 'react';
import { Tabs } from '../components/tabs';

const MultiTabsExample = () => {
  // 为每个Tabs实例创建独立的状态
  const [firstTabsSet, setFirstTabsSet] = useState(['1', '2', '3']);
  const [secondTabsSet, setSecondTabsSet] = useState(['1', '2', '3']);
  
  // 每个实例的关闭处理函数
  const handleFirstTabsClose = (tabKey, remainingTabs) => {
    setFirstTabsSet(remainingTabs);
  };
  
  const handleSecondTabsClose = (tabKey, remainingTabs) => {
    setSecondTabsSet(remainingTabs);
  };
  
  return (
    <div>
      {/* 第一个Tabs实例 */}
      <Tabs 
        defaultActiveKey="1" 
        closable={true}
        onClose={handleFirstTabsClose}
      >
        {firstTabsSet.includes('1') && (
          <Tabs.TabPane key="1" tab="Tab 1">
            <p>内容1</p>
          </Tabs.TabPane>
        )}
        {firstTabsSet.includes('2') && (
          <Tabs.TabPane key="2" tab="Tab 2">
            <p>内容2</p>
          </Tabs.TabPane>
        )}
        {firstTabsSet.includes('3') && (
          <Tabs.TabPane key="3" tab="Tab 3">
            <p>内容3</p>
          </Tabs.TabPane>
        )}
      </Tabs>
      
      {/* 第二个Tabs实例 */}
      <Tabs 
        defaultActiveKey="1" 
        closable={true}
        onClose={handleSecondTabsClose}
        theme={{ 'primary-color': '#f56c6c' }}
      >
        {secondTabsSet.includes('1') && (
          <Tabs.TabPane key="1" tab="Tab A">
            <p>内容A</p>
          </Tabs.TabPane>
        )}
        {secondTabsSet.includes('2') && (
          <Tabs.TabPane key="2" tab="Tab B">
            <p>内容B</p>
          </Tabs.TabPane>
        )}
        {secondTabsSet.includes('3') && (
          <Tabs.TabPane key="3" tab="Tab C">
            <p>内容C</p>
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
};
```

### 常见问题

在使用多实例时，可能遇到以下问题：

#### 1. 标签无法删除

**问题**: 点击关闭图标，但标签没有从界面上移除。  
**解决方案**: 确保为每个Tabs实例提供了:
- 独立的状态管理（如上例中的`firstTabsSet`和`secondTabsSet`）
- 正确实现了`onClose`回调函数
- 使用条件渲染（通过`includes`检查）来控制标签的显示与隐藏

#### 2. CSS类名冲突

**问题**: 多个实例的样式相互干扰。  
**解决方案**: Tabs组件已经采用`my-tabs-`前缀命名空间，避免了类名冲突问题。所有样式都被隔离在各自的组件容器中。

#### 3. 全局DOM查询问题

**问题**: 使用`document.querySelector`等全局DOM查询方法导致只能操作到第一个实例的元素。  
**解决方案**: 最新版的Tabs组件已经使用React Refs替代了全局DOM查询，每个实例都有自己的引用，确保了正确的DOM操作。

## 总结

通过上述方法，你可以在不发布npm包的情况下方便地复用React Tabs组件。根据你的项目需求，选择最适合的复用方法。同时，正确实现状态管理和回调函数，可以确保在多实例环境中标签删除功能正常工作。