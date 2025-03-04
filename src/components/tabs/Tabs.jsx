import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Tabs.css';

/**
 * Tabs 组件
 * 
 * 一个模仿ElementUI风格的标签页组件，具有以下特性：
 * - 标签页切换功能
 * - 标签拖拽排序
 * - 自动检测并显示左右滚动按钮
 * - 标签过多时支持左右滚动
 * - 长按滚动按钮实现连续滚动
 * - 拖拽标签到容器边缘时自动滚动
 * - 标签可关闭功能
 * - 可以隐藏内容区域作为纯导航栏使用
 * 
 * 所有CSS类名都添加了前缀my-tabs-，确保与其他组件样式不冲突。
 * CSS变量被限定在组件容器内部，不会影响全局样式。
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件，应当是TabPane组件
 * @param {string} props.defaultActiveKey - 默认激活的标签key
 * @param {Function} props.onChange - 标签切换时的回调函数
 * @param {Function} props.onReorder - 标签重新排序时的回调函数
 * @param {Function} props.onClose - 关闭标签时的回调函数
 * @param {boolean} props.closable - 是否默认允许标签可关闭（可被TabPane的closable属性覆盖）
 * @param {number} props.scrollSpeed - 长按滚动速度，数值越小滚动越快，默认25
 * @param {Object} props.theme - 主题配置对象，用于设置组件颜色
 * @param {boolean} props.showContent - 是否显示标签内容区域，默认为true
 * @returns {React.ReactElement} Tabs组件
 */
const Tabs = ({ children, defaultActiveKey, onChange, onReorder, onClose, closable = false, scrollSpeed = 25, theme = {}, showContent = true }) => {
  // ========== 状态管理 ==========
  // 当前激活的标签key
  const [activeKey, setActiveKey] = useState(defaultActiveKey || (children[0]?.key || '1'));
  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTabId, setDraggedTabId] = useState(null);
  const [dragStartIndex, setDragStartIndex] = useState(-1);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  // 滚动相关状态
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  
  // 用于管理标签排序的内部状态
  const [orderedTabs, setOrderedTabs] = useState([]);

  // ========== Refs 声明 ==========
  // 标签导航和容器的引用
  const tabsNavRef = useRef(null);
  const tabsNavWrapRef = useRef(null);
  // 自动滚动和连续滚动的定时器引用
  const autoScrollIntervalRef = useRef(null);
  const continuousScrollIntervalRef = useRef(null);
  // 维护当前translateX值的引用，避免闭包陷阱
  const currentTranslateXRef = useRef(currentTranslateX);
  // 组件容器ref
  const containerRef = useRef(null);
  // 滚动按钮ref
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  /**
   * 同步translateX的状态到ref
   * 这是为了避免在异步操作中使用陈旧的状态值
   */
  useEffect(() => {
    currentTranslateXRef.current = currentTranslateX;
  }, [currentTranslateX]);

  /**
   * 处理子元素，提取标签和内容
   * 将React子组件转换为内部数据结构
   * @returns {Array} 处理后的标签数组
   */
  const processChildren = useCallback(() => {
    const processedTabs = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      return {
        key: child.key,
        tab: child.props.tab,
        content: child.props.children,
        closable: child.props.closable
      };
    }).filter(Boolean);
    
    // 初始化有序标签列表
    if (orderedTabs.length === 0 && processedTabs.length > 0) {
      setOrderedTabs(processedTabs);
    }
    
    return processedTabs;
  }, [children, orderedTabs.length]);
  
  // 初始化标签
  const initialTabs = processChildren();
  
  // 使用内部状态的有序标签
  const tabs = orderedTabs.length > 0 ? orderedTabs : initialTabs;

  /**
   * 停止自动滚动（拖拽时触发的滚动）
   * 清除自动滚动定时器
   */
  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  /**
   * 停止连续滚动（长按按钮时触发的滚动）
   * 清除连续滚动定时器
   */
  const stopContinuousScroll = useCallback(() => {
    if (continuousScrollIntervalRef.current) {
      clearInterval(continuousScrollIntervalRef.current);
      continuousScrollIntervalRef.current = null;
    }
  }, []);

  /**
   * 检查是否需要显示滚动按钮以及按钮的禁用状态
   * 根据标签总宽度和容器宽度的对比决定是否显示滚动按钮
   * @returns {Object} 返回标签导航宽度和容器宽度
   */
  const checkScrollable = useCallback(() => {
    if (!tabsNavRef.current || !tabsNavWrapRef.current) return;
    
    // 获取标签导航总宽度和容器宽度
    const navWidth = tabsNavRef.current.scrollWidth;
    const wrapWidth = tabsNavWrapRef.current.clientWidth;
    
    // 使用ref引用而不是querySelector
    const prevButton = prevButtonRef.current;
    const nextButton = nextButtonRef.current;
    
    let showLeft = false;
    let showRight = false;
    
    if (navWidth > wrapWidth) {
      // 当标签总宽度大于容器宽度时，需要显示滚动按钮
      if (prevButton) prevButton.style.display = 'block';
      if (nextButton) nextButton.style.display = 'block';
      
      // 默认清除所有按钮的禁用状态
      if (prevButton) prevButton.classList.remove('my-tabs-nav-disabled');
      if (nextButton) nextButton.classList.remove('my-tabs-nav-disabled');
      
      // 判断是否可以向左滚动：当前位置已经是最左侧时禁用左滚动按钮
      if (currentTranslateXRef.current >= 0) {
        showLeft = false;
        if (prevButton) prevButton.classList.add('my-tabs-nav-disabled');
      } else {
        showLeft = true;
      }
      
      // 判断是否可以向右滚动：当前位置已经是最右侧时禁用右滚动按钮
      if (Math.abs(currentTranslateXRef.current) >= navWidth - wrapWidth) {
        showRight = false;
        if (nextButton) nextButton.classList.add('my-tabs-nav-disabled');
      } else {
        showRight = true;
      }
    } else {
      // 标签总宽度小于容器宽度，不需要显示滚动按钮
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      
      // 重置位置
      if (currentTranslateXRef.current !== 0) {
        setCurrentTranslateX(0);
      }
    }
    
    // 只有当值发生变化时才更新状态，避免不必要的渲染
    if (showLeft !== showLeftArrow) {
      setShowLeftArrow(showLeft);
    }
    
    if (showRight !== showRightArrow) {
      setShowRightArrow(showRight);
    }
    
    return { navWidth, wrapWidth };
  }, [showLeftArrow, showRightArrow]);

  /**
   * 向左滚动标签
   * 每次滚动固定距离，并确保不超出最左侧边界
   */
  const scrollPrev = useCallback(() => {
    if (currentTranslateXRef.current < 0) {
      // 增加每次滚动的距离
      const newTranslateX = Math.min(currentTranslateXRef.current + 25, 0);
      setCurrentTranslateX(newTranslateX);
      checkScrollable();
    }
  }, [checkScrollable]);

  /**
   * 向右滚动标签
   * 每次滚动固定距离，并确保不超出最右侧边界
   */
  const scrollNext = useCallback(() => {
    if (!tabsNavRef.current || !tabsNavWrapRef.current) return;
    
    const navWidth = tabsNavRef.current.scrollWidth;
    const wrapWidth = tabsNavWrapRef.current.clientWidth;
    
    if (Math.abs(currentTranslateXRef.current) < navWidth - wrapWidth) {
      // 增加每次滚动的距离
      const newTranslateX = Math.max(currentTranslateXRef.current - 25, -(navWidth - wrapWidth));
      setCurrentTranslateX(newTranslateX);
      checkScrollable();
    }
  }, [checkScrollable]);

  /**
   * 开始连续滚动（长按滚动按钮）
   * 设置一个定时器，按指定方向连续滚动
   * @param {string} direction - 滚动方向，'prev'为向左，'next'为向右
   */
  const startContinuousScroll = useCallback((direction) => {
    // 先清除可能存在的定时器
    stopContinuousScroll();
    
    // 定义滚动函数
    const doScroll = () => {
      if (direction === 'prev') {
        // 只在当前可以向左滚动时执行
        if (currentTranslateXRef.current < 0) {
          scrollPrev();
        } else {
          stopContinuousScroll();
        }
      } else {
        if (!tabsNavRef.current || !tabsNavWrapRef.current) return;
        
        const navWidth = tabsNavRef.current.scrollWidth;
        const wrapWidth = tabsNavWrapRef.current.clientWidth;
        
        // 只在当前可以向右滚动时执行
        if (Math.abs(currentTranslateXRef.current) < navWidth - wrapWidth) {
          scrollNext();
        } else {
          stopContinuousScroll();
        }
      }
    };
    
    // 立即执行一次滚动
    doScroll();
    
    // 设置连续滚动间隔
    continuousScrollIntervalRef.current = setInterval(doScroll, scrollSpeed);
  }, [scrollPrev, scrollNext, stopContinuousScroll, scrollSpeed]);

  /**
   * 开始自动滚动（拖拽到边缘）
   * 当拖拽标签到容器边缘时自动滚动
   * @param {string} direction - 滚动方向，'left'为向左，'right'为向右
   */
  const startAutoScroll = useCallback((direction) => {
    if (autoScrollIntervalRef.current) return;
    
    autoScrollIntervalRef.current = setInterval(() => {
      if (direction === 'left') {
        scrollPrev();
        if (currentTranslateXRef.current >= 0) {
          stopAutoScroll();
        }
      } else {
        scrollNext();
        if (!tabsNavRef.current || !tabsNavWrapRef.current) return;
        
        const navWidth = tabsNavRef.current.scrollWidth;
        const wrapWidth = tabsNavWrapRef.current.clientWidth;
        
        if (Math.abs(currentTranslateXRef.current) >= navWidth - wrapWidth) {
          stopAutoScroll();
        }
      }
    }, scrollSpeed * 2); // 拖拽滚动使用长按滚动速度的2倍，更平滑
  }, [scrollPrev, scrollNext, stopAutoScroll, scrollSpeed]);

  /**
   * 检查是否需要自动滚动
   * 根据鼠标位置判断是否需要在拖拽时自动滚动
   */
  const checkAutoScroll = useCallback(() => {
    if (!isDragging || !tabsNavWrapRef.current) return;
    
    const wrapRect = tabsNavWrapRef.current.getBoundingClientRect();
    const scrollThreshold = 50; // 边缘区域宽度
    
    // 鼠标相对于容器的位置
    const relativeX = mouseX - wrapRect.left;
    
    // 检查是否靠近左边缘
    if (relativeX < scrollThreshold) {
      if (currentTranslateXRef.current < 0) {
        startAutoScroll('left');
        return;
      }
    }
    
    // 检查是否靠近右边缘
    if (relativeX > wrapRect.width - scrollThreshold) {
      if (!tabsNavRef.current) return;
      const navWidth = tabsNavRef.current.scrollWidth;
      const wrapWidth = wrapRect.width;
      
      if (Math.abs(currentTranslateXRef.current) < navWidth - wrapWidth) {
        startAutoScroll('right');
        return;
      }
    }
    
    // 不在边缘，停止自动滚动
    stopAutoScroll();
  }, [isDragging, mouseX, startAutoScroll, stopAutoScroll]);

  /**
   * 处理标签点击
   * 切换到被点击的标签
   * @param {string} tabId - 被点击的标签ID
   */
  const handleTabClick = (tabId) => {
    setActiveKey(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  /**
   * 处理拖拽开始事件
   * 初始化拖拽状态和数据
   * @param {DragEvent} e - 拖拽事件对象
   * @param {string} tabId - 被拖拽的标签ID
   * @param {number} index - 被拖拽的标签索引
   */
  const handleDragStart = (e, tabId, index) => {
    setIsDragging(true);
    setDraggedTabId(tabId);
    setDragStartIndex(index);
    setMouseX(e.clientX);
    
    e.dataTransfer.setData('text/plain', tabId);
    e.dataTransfer.effectAllowed = 'move';
    
    // 设置拖拽图像为透明（默认拖拽图像影响用户体验）
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  /**
   * 处理拖拽经过事件
   * 更新当前拖拽经过的标签索引和鼠标位置
   * @param {DragEvent} e - 拖拽事件对象
   * @param {number} index - 拖拽经过的标签索引
   */
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setMouseX(e.clientX);
    setDragOverIndex(index);
    
    // 检查是否需要自动滚动
    checkAutoScroll();
  };

  /**
   * 处理拖拽离开事件
   * @param {DragEvent} e - 拖拽事件对象
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  /**
   * 处理放置事件
   * 执行标签重新排序操作
   * @param {DragEvent} e - 拖拽事件对象
   * @param {number} index - 放置的目标索引
   */
  const handleDrop = (e, index) => {
    e.preventDefault();
    stopAutoScroll();
    
    if (dragStartIndex === -1 || dragStartIndex === index) return;
    
    reorderTabs(dragStartIndex, index);
  };

  /**
   * 处理拖拽结束事件
   * 重置所有拖拽相关状态
   * @param {DragEvent} e - 拖拽事件对象
   */
  const handleDragEnd = (e) => {
    setIsDragging(false);
    stopAutoScroll();
    setDraggedTabId(null);
    setDragStartIndex(-1);
    setDragOverIndex(-1);
  };

  /**
   * 重新排序标签
   * 将标签从一个位置移动到另一个位置
   * @param {number} fromIndex - 源标签索引
   * @param {number} toIndex - 目标标签索引
   */
  const reorderTabs = (fromIndex, toIndex) => {
    // 创建一个新的标签数组副本
    const newTabs = [...tabs];
    
    // 移除源位置的标签
    const [movedTab] = newTabs.splice(fromIndex, 1);
    
    // 将标签插入到新位置
    newTabs.splice(toIndex, 0, movedTab);
    
    // 更新内部状态
    setOrderedTabs(newTabs);
    
    // 激活被拖拽的标签
    setActiveKey(draggedTabId);
    
    // 通知父组件
    if (onChange) onChange(draggedTabId);
    if (onReorder) onReorder(newTabs.map(tab => tab.key));
  };

  /**
   * 处理标签关闭
   * 当用户点击标签上的关闭按钮时触发
   * @param {Event} e - 事件对象
   * @param {string} tabId - 要关闭的标签ID
   */
  const handleTabClose = (e, tabId) => {
    // 阻止事件冒泡，避免触发标签点击事件
    e.stopPropagation();
    
    // 获取要关闭的标签的索引
    const tabIndex = tabs.findIndex(tab => tab.key === tabId);
    if (tabIndex === -1) return;
    
    // 获取新的标签数组（排除要关闭的标签）
    const newTabs = tabs.filter(tab => tab.key !== tabId);
    
    // 如果没有标签了，不进行任何操作
    if (newTabs.length === 0) return;
    
    // 更新内部状态
    setOrderedTabs(newTabs);
    
    // 如果关闭的是当前激活的标签，则需要激活另一个标签
    if (activeKey === tabId) {
      // 找到下一个激活的标签：优先激活右侧标签，如果没有则激活左侧标签
      const nextActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      const nextActiveKey = newTabs[nextActiveIndex].key;
      setActiveKey(nextActiveKey);
      
      // 通知父组件激活标签变化
      if (onChange) {
        onChange(nextActiveKey);
      }
    }
    
    // 通知父组件标签已关闭
    if (onClose) {
      onClose(tabId, newTabs.map(tab => tab.key));
    }
  };

  // ========== Effect Hooks ==========

  /**
   * 初始化和监听窗口大小变化
   * 组件挂载时和窗口大小变化时检查滚动状态
   */
  useEffect(() => {
    const checkScrollableAndResize = () => {
      // 直接调用checkScrollable
      checkScrollable();
    };
    
    checkScrollableAndResize();
    window.addEventListener('resize', checkScrollableAndResize);
    
    return () => {
      window.removeEventListener('resize', checkScrollableAndResize);
      stopAutoScroll();
      stopContinuousScroll();
    };
  }, [checkScrollable, stopAutoScroll, stopContinuousScroll]);

  /**
   * 监听鼠标移动，用于自动滚动
   * 在拖拽过程中跟踪鼠标位置
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setMouseX(e.clientX);
        checkAutoScroll();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, checkAutoScroll]);

  /**
   * 当标签数量变化时重新检查滚动状态
   */
  useEffect(() => {
    // 只在初始加载和tabs.length变化时检查滚动状态
    checkScrollable();
  }, [tabs.length, checkScrollable]);

  /**
   * 当活动标签改变时，确保它在可视区域内
   * 自动滚动到当前活动的标签
   */
  useEffect(() => {
    if (!tabsNavRef.current || !tabsNavWrapRef.current) return;
    
    const activeTab = tabsNavRef.current.querySelector(`.tabs-item[data-id="${activeKey}"]`);
    if (!activeTab) return;
    
    const tabRect = activeTab.getBoundingClientRect();
    const wrapRect = tabsNavWrapRef.current.getBoundingClientRect();
    
    if (tabRect.left < wrapRect.left) {
      // 标签在左侧不可见区域
      const diff = tabRect.left - wrapRect.left;
      setCurrentTranslateX(prev => prev - diff - 10); // 额外偏移10px，提供更好的视觉体验
    } else if (tabRect.right > wrapRect.right) {
      // 标签在右侧不可见区域
      const diff = tabRect.right - wrapRect.right;
      setCurrentTranslateX(prev => prev - diff - 10);
    }
  }, [activeKey]); // 移除currentTranslateX依赖

  /**
   * 当子组件变化时重新处理标签
   */
  useEffect(() => {
    const newTabs = processChildren();
    // 只有当子组件变化且当前没有自定义排序时，才更新标签
    if (initialTabs.length !== orderedTabs.length && newTabs.length > 0) {
      setOrderedTabs(newTabs);
    }
  }, [children, processChildren, initialTabs.length, orderedTabs.length]);

  /**
   * 应用主题配置
   * 将传入的theme对象中的颜色值应用到CSS变量
   */
  useEffect(() => {
    if (!theme || Object.keys(theme).length === 0 || !containerRef.current) return;
    
    // 获取容器元素
    const container = containerRef.current;
    
    // 遍历主题配置，设置CSS变量
    Object.entries(theme).forEach(([key, value]) => {
      container.style.setProperty(`--tabs-${key}`, value);
    });
    
    // 组件卸载时恢复默认主题
    return () => {
      // 只清除我们设置过的变量
      if (container) {
        Object.keys(theme).forEach(key => {
          container.style.removeProperty(`--tabs-${key}`);
        });
      }
    };
  }, [theme, containerRef.current]);
  
  /**
   * 设置默认的CSS变量，确保组件在没有指定theme时也能正常工作
   */
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const defaultTheme = {
      'primary-color': '#409eff',
      'primary-light': 'rgba(64, 158, 255, 0.1)',
      'primary-glow': 'rgba(64, 158, 255, 0.15)',
      'text-color': '#303133',
      'text-light': '#606266',
      'text-lighter': '#909399',
      'border-color': '#e4e7ed',
      'bg-color': '#fff',
      'bg-light': '#f5f7fa',
      'shadow-color': 'rgba(0, 0, 0, 0.05)',
      'danger-color': '#f56c6c',
      'disabled-color': '#c0c4cc'
    };
    
    // 仅设置未被自定义主题覆盖的默认值
    Object.entries(defaultTheme).forEach(([key, value]) => {
      const varName = `--tabs-${key}`;
      const computedStyle = getComputedStyle(container);
      const currentValue = computedStyle.getPropertyValue(varName);
      
      // 如果变量未设置或者为空，则设置默认值
      if (!currentValue || currentValue.trim() === '') {
        container.style.setProperty(varName, value);
      }
    });
    
  }, [containerRef.current]);

  // ========== 组件渲染 ==========
  return (
    <div className="my-tabs-container" ref={containerRef}>
      <div>
        {/* 左滑动按钮 */}
        <div className="my-tabs-nav-prev" ref={prevButtonRef}>
          <span 
            className="my-tabs-nav-button"
            onMouseDown={() => startContinuousScroll('prev')}
            onMouseUp={stopContinuousScroll}
            onMouseLeave={stopContinuousScroll}
            onTouchStart={() => startContinuousScroll('prev')}
            onTouchEnd={stopContinuousScroll}
            onDoubleClick={(e) => e.preventDefault()}
          >
            ◀
          </span>
        </div>
        
        {/* 标签页标签容器 */}
        <div className="my-tabs-nav-wrap" ref={tabsNavWrapRef}>
          <div 
            className="my-tabs-nav" 
            ref={tabsNavRef}
            style={{ transform: `translateX(${currentTranslateX}px)` }}
          >
            {tabs.map((tab, index) => (
              <div
                key={tab.key}
                className={`my-tabs-item ${activeKey === tab.key ? 'active' : ''} ${dragStartIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                draggable="true"
                data-id={tab.key}
                onClick={() => handleTabClick(tab.key)}
                onDragStart={(e) => handleDragStart(e, tab.key, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {tab.tab}
                {/* 标签关闭按钮 - 只有在设置closable时显示 */}
                {(tab.closable !== undefined ? tab.closable : closable) && (
                  <span 
                    className="my-tabs-close-icon"
                    onClick={(e) => handleTabClose(e, tab.key)}
                  >
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 右滑动按钮 */}
        <div className="my-tabs-nav-next" ref={nextButtonRef}>
          <span 
            className="my-tabs-nav-button"
            onMouseDown={() => startContinuousScroll('next')}
            onMouseUp={stopContinuousScroll}
            onMouseLeave={stopContinuousScroll}
            onTouchStart={() => startContinuousScroll('next')}
            onTouchEnd={stopContinuousScroll}
            onDoubleClick={(e) => e.preventDefault()}
          >
            ▶
          </span>
        </div>
      </div>
      
      {/* 标签页内容区域 - 只有在showContent为true时才渲染 */}
      {showContent && (
        <div className="my-tabs-content">
          {tabs.map(tab => (
            <div 
              key={tab.key} 
              className={`my-tabs-pane ${activeKey === tab.key ? 'active' : ''}`}
              id={tab.key}
            >
              {tab.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * TabPane 组件 - Tabs的子组件
 * 用于定义单个标签页的内容
 * 
 * 此组件配合Tabs组件使用，样式已经进行了命名空间隔离，
 * 所有CSS类名都添加了前缀my-tabs-，确保与其他组件样式不冲突。
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 标签页内容
 * @param {string} props.tab - 标签页标题
 * @param {boolean} props.closable - 是否可关闭，覆盖Tabs的全局设置
 * @returns {React.ReactNode} 子组件内容
 */
Tabs.TabPane = ({ children, tab, closable }) => {
  return children;
};

export default Tabs; 