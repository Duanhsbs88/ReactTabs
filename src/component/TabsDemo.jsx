import React, { useState } from 'react';
import Tabs from './Tabs';
import './Tabs.css';

/**
 * TabsDemo 组件
 * 
 * 这是一个演示Tabs组件功能的示例组件。它展示了Tabs组件的基本用法、
 * 事件处理和配置选项。该组件实现了标签页切换、标签重排序等功能。
 */
const TabsDemo = () => {
  // 使用useState钩子管理当前活动标签的key
  const [activeKey, setActiveKey] = useState('1');
  // 添加状态来跟踪当前存在的标签
  const [existingTabs, setExistingTabs] = useState([
    '1', '2', '3', '4', '5', '6', '7', '8'
  ]);
  
  // 添加自定义主题配置和滚动速度的状态
  const [customTheme, setCustomTheme] = useState(null);
  const [activeThemeName, setActiveThemeName] = useState('default');
  const [scrollSpeed, setScrollSpeed] = useState(25);
  const [showContent, setShowContent] = useState(true); // 是否显示标签内容
  
  // 预设的主题
  const themes = {
    default: null,
    blue: {
      'primary-color': '#1890ff',
      'primary-light': 'rgba(24, 144, 255, 0.1)',
      'primary-glow': 'rgba(24, 144, 255, 0.15)'
    },
    green: {
      'primary-color': '#52c41a',
      'primary-light': 'rgba(82, 196, 26, 0.1)',
      'primary-glow': 'rgba(82, 196, 26, 0.15)'
    },
    red: {
      'primary-color': '#f5222d',
      'primary-light': 'rgba(245, 34, 45, 0.1)',
      'primary-glow': 'rgba(245, 34, 45, 0.15)'
    },
    purple: {
      'primary-color': '#722ed1',
      'primary-light': 'rgba(114, 46, 209, 0.1)',
      'primary-glow': 'rgba(114, 46, 209, 0.15)'
    }
  };
  
  /**
   * 处理标签切换事件
   * 当用户点击不同标签时触发此函数
   * @param {string} key - 被点击标签的唯一标识符
   */
  const handleChange = (key) => {
    console.log('标签切换为:', key);
    setActiveKey(key); // 更新当前活动标签状态
  };
  
  /**
   * 处理标签重新排序事件
   * 当用户拖拽重新排序标签时触发此函数
   * @param {Array} newOrder - 重新排序后的标签键数组
   */
  const handleReorder = (newOrder) => {
    console.log('标签新顺序:', newOrder);
    // 这里可以处理新的顺序，例如保存到后端或本地存储
  };
  
  /**
   * 处理标签关闭事件
   * 当用户点击标签关闭按钮时触发此函数
   * @param {string} tabKey - 被关闭的标签键
   * @param {Array} remainingTabs - 剩余标签的键数组 
   */
  const handleClose = (tabKey, remainingTabs) => {
    console.log('关闭标签:', tabKey, '剩余标签:', remainingTabs);
    setExistingTabs(remainingTabs);
  };
  
  /**
   * 处理主题变更
   * @param {string} themeName - 主题名称
   */
  const handleThemeChange = (themeName) => {
    setCustomTheme(themes[themeName]);
    setActiveThemeName(themeName);
  };
  
  /**
   * 处理滚动速度变更
   * @param {Event} e - 输入事件
   */
  const handleSpeedChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setScrollSpeed(value);
    }
  };
  
  /**
   * 处理显示内容切换
   */
  const toggleShowContent = () => {
    setShowContent(!showContent);
  };
  
  /**
   * 添加全局样式
   * 使用useEffect在组件挂载时动态添加样式，卸载时移除
   */
  React.useEffect(() => {
    // 创建并添加全局样式元素
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
        color: #333;
        line-height: 1.5;
        padding: 20px;
      }
      
      .container {
        max-width: 1000px;
        margin: 0 auto;
      }
      
      h1 {
        text-align: center;
        margin-bottom: 30px;
        color: #409eff;
      }
      
      .control-panel {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;
      }
      
      .theme-button {
        padding: 6px 12px;
        background: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
      }
      
      .theme-button:hover {
        border-color: #c0c4cc;
      }
      
      .theme-button.active {
        background: #ecf5ff;
        color: #409eff;
        border-color: #409eff;
      }
      
      .speed-control {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .speed-control input {
        width: 60px;
        padding: 6px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
      }
      
      /* 内容显示开关样式 */
      .content-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 22px;
      }
      
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 22px;
      }
      
      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .toggle-slider {
        background-color: #409eff;
      }
      
      input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }
    `;
    document.head.appendChild(style);
    
    // 清理函数，组件卸载时移除样式
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="container">
      <h1>React Tabs 组件演示</h1>
      
      {/* 控制面板 */}
      <div className="control-panel">
        <div>
          <strong>主题：</strong>
          {Object.keys(themes).map(theme => {
            // 获取当前主题的主色调
            const themeColor = theme !== 'default' 
              ? themes[theme]['primary-color'] 
              : '#409eff'; // 默认主题使用蓝色
              
            // 设置选中按钮的样式
            const activeStyle = activeThemeName === theme ? {
              backgroundColor: `${themeColor}15`, // 使用主题颜色的浅色背景（15为透明度）
              color: themeColor,
              borderColor: themeColor
            } : {};
            
            return (
              <button 
                key={theme}
                className={`theme-button ${activeThemeName === theme ? 'active' : ''}`}
                style={activeStyle}
                onClick={() => handleThemeChange(theme)}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            );
          })}
        </div>
        
        <div className="speed-control">
          <strong>滚动速度：</strong>
          <input 
            type="number" 
            value={scrollSpeed} 
            onChange={handleSpeedChange} 
            min="5" 
            max="100"
          />
          <span>(越小越快)</span>
        </div>
        
        <div className="content-toggle">
          <strong>内容区域：</strong>
          <label className="toggle-switch">
            <input 
              type="checkbox"
              checked={showContent}
              onChange={toggleShowContent}
            />
            <span className="toggle-slider"></span>
          </label>
          <span>{showContent ? '显示' : '隐藏'}</span>
        </div>
      </div>
      
      {/* 
        Tabs组件实例
        defaultActiveKey: 指定初始活动标签
        onChange: 标签切换时的回调函数
        onReorder: 标签重新排序时的回调函数
        onClose: 标签关闭时的回调函数
        closable: 设置标签默认可关闭
        scrollSpeed: 设置滚动速度
        theme: 设置主题
        showContent: 控制是否显示内容区域
      */}
      <Tabs 
        defaultActiveKey={activeKey} 
        onChange={handleChange}
        onReorder={handleReorder}
        onClose={handleClose}
        closable={true}
        scrollSpeed={scrollSpeed}
        theme={customTheme}
        showContent={showContent}
      >
        {/* 标签1 - 每个TabPane代表一个标签页，不可关闭 */}
        {existingTabs.includes('1') && (
          <Tabs.TabPane key="1" tab="标签1" closable={false}>
            <div>
              <h3>标签1内容</h3>
              <p>这是标签1的内容区域。此标签设置为不可关闭，注意观察它没有关闭图标。</p>
              <div style={{ padding: '10px', backgroundColor: '#f5f7fa', borderRadius: '4px' }}>
                <p>甚至可以包含样式化的块级元素和组件。</p>
              </div>
            </div>
          </Tabs.TabPane>
        )}
        
        {/* 标签2 - 可关闭 */}
        {existingTabs.includes('2') && (
          <Tabs.TabPane key="2" tab="标签2">
            <div>
              <h3>标签2内容</h3>
              <p>这是标签2的内容区域，它是独立的。点击标签上的 × 按钮可以关闭此标签。</p>
            </div>
          </Tabs.TabPane>
        )}
        
        {/* 标签3 - 可关闭 */}
        {existingTabs.includes('3') && (
          <Tabs.TabPane key="3" tab="标签3">
            <div>
              <h3>标签3内容</h3>
              <p>这是标签3的内容区域。点击标签上的 × 按钮可以关闭此标签。</p>
              <div style={{ padding: '10px', backgroundColor: '#f5f7fa', borderRadius: '4px', marginTop: '10px' }}>
                <p>甚至可以包含样式化的块级元素和组件。</p>
              </div>
            </div>
          </Tabs.TabPane>
        )}
        
        {/* 其他标签 - 可关闭 */}
        {existingTabs.includes('4') && (
          <Tabs.TabPane key="4" tab="标签4">
            <div>
              <h3>标签4内容</h3>
              <p>这是一个较长的标签名示例，用于测试滚动行为。</p>
              <button 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#409eff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                示例按钮
              </button>
            </div>
          </Tabs.TabPane>
        )}
        
        {existingTabs.includes('5') && (
          <Tabs.TabPane key="5" tab="标签5">
            <div>
              <h3>标签5内容</h3>
              <p>多个标签用于测试滚动行为。</p>
            </div>
          </Tabs.TabPane>
        )}
        
        {existingTabs.includes('6') && (
          <Tabs.TabPane key="6" tab="标签6">
            <div>
              <h3>标签6内容</h3>
              <p>多个标签用于测试滚动行为。</p>
            </div>
          </Tabs.TabPane>
        )}
        
        {existingTabs.includes('7') && (
          <Tabs.TabPane key="7" tab="标签7">
            <div>
              <h3>标签7内容</h3>
              <p>多个标签用于测试滚动行为。</p>
            </div>
          </Tabs.TabPane>
        )}
        
        {existingTabs.includes('8') && (
          <Tabs.TabPane key="8" tab="标签8">
            <div>
              <h3>标签8内容</h3>
              <p>多个标签用于测试滚动行为。</p>
            </div>
          </Tabs.TabPane>
        )}
      </Tabs>
      
      {/* 使用说明区域 */}
      <div style={{ marginTop: '50px' }}>
        <h2>使用说明</h2>
        <ul>
          <li>点击标签可以切换内容</li>
          <li>拖拽标签可以重新排序</li>
          <li>如果标签太多，会出现左右滚动按钮</li>
          <li>拖拽后会自动选中被拖拽的标签</li>
          <li>点击标签上的 × 按钮可以关闭标签（除标签1外）</li>
          <li>可以通过顶部控制面板切换不同主题</li>
          <li>可以调整长按滚动的速度（数值越小，滚动越快）</li>
          <li><strong>新功能：</strong> 可以隐藏内容区域，使组件作为纯导航栏使用</li>
        </ul>
        
        <h2 style={{ marginTop: '20px' }}>开发者用法</h2>
        <div style={{ backgroundColor: '#f5f7fa', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
          <p><strong>设置主题：</strong></p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
{`<Tabs
  theme={{
    'primary-color': '#1890ff',    // 主色调
    'primary-light': 'rgba(24, 144, 255, 0.1)', // 淡色背景
    'text-color': '#333333'        // 文字颜色
    // 更多颜色变量...
  }}
  // 其他属性...
/>`}
          </pre>
          
          <p style={{ marginTop: '15px' }}><strong>设置滚动速度：</strong></p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
{`<Tabs
  scrollSpeed={25}  // 默认值，数值越小滚动越快
  // 其他属性...
/>`}
          </pre>
          
          <p style={{ marginTop: '15px' }}><strong>隐藏内容区域（作为导航栏使用）：</strong></p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
{`<Tabs
  showContent={false}  // 设置为false时不显示内容区域
  // 其他属性...
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TabsDemo; 