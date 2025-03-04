import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import TabsDemo from './demo/TabsDemo';
import MultiTabsExample from './examples/MultiTabs';
import reportWebVitals from './reportWebVitals';
import {Tabs} from './components/tabs';

// 示例应用，带有切换功能
const App = () => {
  const [showMultiInstance, setShowMultiInstance] = useState(false);
  
  return (
    <div>
      <div style={{ 
        background: '#f0f2f5', 
        padding: '10px 20px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <button 
          onClick={() => setShowMultiInstance(false)}
          style={{ 
            padding: '8px 16px',
            background: !showMultiInstance ? '#409eff' : '#fff',
            color: !showMultiInstance ? '#fff' : '#333',
            border: '1px solid #dcdfe6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          单实例演示
        </button>
        <button 
          onClick={() => setShowMultiInstance(true)}
          style={{ 
            padding: '8px 16px',
            background: showMultiInstance ? '#409eff' : '#fff',
            color: showMultiInstance ? '#fff' : '#333',
            border: '1px solid #dcdfe6',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          多实例演示
        </button>
      </div>
      
      {showMultiInstance ? <MultiTabsExample /> : <TabsDemo />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// 导出组件
export { Tabs };
export default Tabs;
