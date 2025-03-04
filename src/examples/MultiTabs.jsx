import React, { useState } from 'react';
import {Tabs} from '../components/tabs';
import '../components/tabs/Tabs.css';

/**
 * 多Tabs实例示例
 * 展示如何在同一页面上使用多个Tabs组件实例
 */
const MultiTabsExample = () => {
  // 为每个Tabs实例创建独立的状态
  const [basicTabs, setBasicTabs] = useState(['1', '2', '3']);
  const [blueTabs, setBlueTabs] = useState(['1', '2', '3']);
  const [redTabs, setRedTabs] = useState(['1', '2', '3', '4']);
  const [greenTabs, setGreenTabs] = useState(['1', '2']);

  // 每个Tabs实例的关闭处理函数
  const handleBasicTabClose = (tabKey, remainingTabs) => {
    console.log('关闭基本标签:', tabKey, '剩余标签:', remainingTabs);
    setBasicTabs(remainingTabs);
  };

  const handleBlueTabClose = (tabKey, remainingTabs) => {
    console.log('关闭蓝色标签:', tabKey, '剩余标签:', remainingTabs);
    setBlueTabs(remainingTabs);
  };

  const handleRedTabClose = (tabKey, remainingTabs) => {
    console.log('关闭红色标签:', tabKey, '剩余标签:', remainingTabs);
    setRedTabs(remainingTabs);
  };

  const handleGreenTabClose = (tabKey, remainingTabs) => {
    console.log('关闭绿色标签:', tabKey, '剩余标签:', remainingTabs);
    setGreenTabs(remainingTabs);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>多Tabs实例示例</h1>
      
      <div style={{ marginBottom: '50px' }}>
        <h2>基本标签组</h2>
        <Tabs 
          defaultActiveKey="1"
          closable={true}
          onClose={handleBasicTabClose}
        >
          {basicTabs.includes('1') && (
            <Tabs.TabPane key="1" tab="首页" closable={false}>
              <h3>欢迎使用Tabs组件</h3>
              <p>这是第一个Tabs实例的内容区域。它可以包含任何React元素。</p>
            </Tabs.TabPane>
          )}
          {basicTabs.includes('2') && (
            <Tabs.TabPane key="2" tab="文档">
              <h3>文档</h3>
              <p>在这里可以放置组件的使用文档。</p>
            </Tabs.TabPane>
          )}
          {basicTabs.includes('3') && (
            <Tabs.TabPane key="3" tab="示例">
              <h3>示例</h3>
              <p>各种使用示例可以放在这里。</p>
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
      
      <div style={{ marginBottom: '50px' }}>
        <h2>自定义主题标签组（蓝色）</h2>
        <Tabs 
          defaultActiveKey="1" 
          theme={{
            'primary-color': '#1890ff',
            'primary-light': 'rgba(24, 144, 255, 0.1)',
            'primary-glow': 'rgba(24, 144, 255, 0.15)',
          }}
          closable={true}
          onClose={handleBlueTabClose}
        >
          {blueTabs.includes('1') && (
            <Tabs.TabPane key="1" tab="进行中" closable={false}>
              <p>进行中的任务列表...</p>
            </Tabs.TabPane>
          )}
          {blueTabs.includes('2') && (
            <Tabs.TabPane key="2" tab="已完成">
              <p>已完成的任务列表...</p>
            </Tabs.TabPane>
          )}
          {blueTabs.includes('3') && (
            <Tabs.TabPane key="3" tab="已取消">
              <p>已取消的任务列表...</p>
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
      
      <div style={{ marginBottom: '50px' }}>
        <h2>导航栏模式（红色主题）</h2>
        <Tabs 
          defaultActiveKey="1" 
          theme={{
            'primary-color': '#f56c6c',
            'primary-light': 'rgba(245, 108, 108, 0.1)',
            'primary-glow': 'rgba(245, 108, 108, 0.15)',
          }}
          showContent={false}
          closable={true}
          onClose={handleRedTabClose}
        >
          {redTabs.includes('1') && <Tabs.TabPane key="1" tab="首页" />}
          {redTabs.includes('2') && <Tabs.TabPane key="2" tab="产品" />}
          {redTabs.includes('3') && <Tabs.TabPane key="3" tab="关于我们" />}
          {redTabs.includes('4') && <Tabs.TabPane key="4" tab="联系方式" />}
        </Tabs>
      </div>
      
      <div>
        <h2>绿色主题标签</h2>
        <Tabs 
          defaultActiveKey="1" 
          theme={{
            'primary-color': '#67c23a',
            'primary-light': 'rgba(103, 194, 58, 0.1)',
            'primary-glow': 'rgba(103, 194, 58, 0.15)',
          }}
          closable={true}
          onClose={handleGreenTabClose}
        >
          {greenTabs.includes('1') && (
            <Tabs.TabPane key="1" tab="选项A">
              <p>绿色主题的内容区域A。</p>
            </Tabs.TabPane>
          )}
          {greenTabs.includes('2') && (
            <Tabs.TabPane key="2" tab="选项B">
              <p>绿色主题的内容区域B。</p>
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default MultiTabsExample; 