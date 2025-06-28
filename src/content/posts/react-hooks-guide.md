---
title: "React Hooks 实用指南"
description: "深入探索React Hooks的使用方法和最佳实践，从useState到自定义Hook，让你的React开发更高效。"
pubDate: 2025-01-24
tags: ["React", "Hooks", "前端", "JavaScript"]
image: "https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=800"
---

# React Hooks 实用指南

React Hooks改变了我们编写React组件的方式，让函数组件拥有了类组件的功能，同时提供了更简洁和可复用的代码结构。

## 基础Hooks

### useState - 状态管理

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
      
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入姓名"
      />
      <p>你好, {name}!</p>
    </div>
  );
}
```

### useEffect - 副作用处理

```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 组件挂载时执行
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // 依赖数组，userId变化时重新执行

  // 清理副作用
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('定时器执行');
    }, 1000);

    return () => {
      clearInterval(timer); // 组件卸载时清理
    };
  }, []);

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## 进阶Hooks

### useContext - 上下文共享

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建上下文
const ThemeContext = createContext();

// 主题提供者组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用上下文的组件
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      当前主题: {theme}
    </button>
  );
}

// 根组件
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}
```

### useReducer - 复杂状态管理

```jsx
import React, { useReducer } from 'react';

// 定义状态和动作类型
const initialState = {
  todos: [],
  filter: 'all' // all, completed, active
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    
    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputValue });
      setInputValue('');
    }
  };

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'completed') return todo.completed;
    if (state.filter === 'active') return !todo.completed;
    return true;
  });

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        placeholder="添加待办事项"
      />
      <button onClick={addTodo}>添加</button>

      <div>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
          全部
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>
          未完成
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>
          已完成
        </button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 自定义Hooks

自定义Hook是复用逻辑的强大工具：

### useFetch - 数据获取Hook

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error };
}

// 使用自定义Hook
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### useLocalStorage - 本地存储Hook

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 从localStorage获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('从localStorage读取数据失败:', error);
      return initialValue;
    }
  });

  // 更新localStorage的函数
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('保存到localStorage失败:', error);
    }
  };

  return [storedValue, setValue];
}

// 使用示例
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  );
}
```

## 性能优化Hooks

### useMemo - 缓存计算结果

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveComponent({ items, filter }) {
  const [count, setCount] = useState(0);

  // 缓存昂贵的计算
  const filteredItems = useMemo(() => {
    console.log('过滤数据...'); // 只在items或filter变化时执行
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  const expensiveValue = useMemo(() => {
    console.log('执行复杂计算...');
    return filteredItems.reduce((sum, item) => sum + item.price, 0);
  }, [filteredItems]);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加计数</button>
      
      <p>筛选结果: {filteredItems.length} 项</p>
      <p>总价: ¥{expensiveValue}</p>
      
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name} - ¥{item.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useCallback - 缓存函数

```jsx
import React, { useState, useCallback, memo } from 'react';

// 子组件使用memo优化
const TodoItem = memo(({ todo, onToggle, onDelete }) => {
  console.log('TodoItem渲染:', todo.text);
  
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </li>
  );
});

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  // 使用useCallback缓存函数，避免子组件不必要的重渲染
  const handleToggle = useCallback((id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  const addTodo = useCallback(() => {
    if (newTodo.trim()) {
      setTodos(prevTodos => [...prevTodos, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  }, [newTodo]);

  return (
    <div>
      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="添加新任务"
      />
      <button onClick={addTodo}>添加</button>
      
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
```

## Hook使用规则和最佳实践

### 规则
1. **只在函数组件或自定义Hook中使用**
2. **只在顶层调用Hook**，不要在循环、条件或嵌套函数中调用
3. **自定义Hook必须以"use"开头**

### 最佳实践
1. **合理使用依赖数组**，避免无限循环
2. **将相关逻辑提取到自定义Hook**中
3. **使用TypeScript**获得更好的类型支持
4. **避免过度优化**，先保证功能正确再考虑性能

```jsx
// 错误示例 ❌
function BadComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 违反Hook规则
  }
  
  return <div>Bad Component</div>;
}

// 正确示例 ✅
function GoodComponent({ condition }) {
  const [state, setState] = useState(0);
  
  if (condition) {
    // 在这里使用state
  }
  
  return <div>Good Component</div>;
}
```

React Hooks为我们提供了更简洁、更可复用的方式来管理组件状态和副作用。通过掌握这些模式和最佳实践，我们可以编写出更优雅和高效的React应用。