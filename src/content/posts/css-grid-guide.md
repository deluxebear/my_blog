---
title: "CSS Grid 完全指南"
description: "深入学习CSS Grid布局，从基础概念到高级技巧，让你彻底掌握现代网页布局的强大工具。"
pubDate: 2025-01-26
tags: ["CSS", "布局", "前端", "Grid"]
featured: true
image: "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800"
---

# CSS Grid 完全指南

CSS Grid是现代CSS中最强大的布局系统之一。它允许我们创建复杂的二维布局，而无需使用浮动或定位的hack。

## 基础概念

### Grid Container 和 Grid Item

```css
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
  gap: 20px;
}

.item {
  background-color: #f0f0f0;
  padding: 20px;
  text-align: center;
}
```

### 网格线和网格轨道

Grid的核心概念包括：

- **网格线 (Grid Lines)**: 构成网格结构的分界线
- **网格轨道 (Grid Tracks)**: 两条相邻网格线之间的空间
- **网格单元 (Grid Cell)**: 最小的网格单位
- **网格区域 (Grid Area)**: 由四条网格线围成的区域

## 实用布局示例

### 响应式卡片布局

```css
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
}.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
}
```

### 经典的Holy Grail布局

```css
.layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

## 高级技巧

### 1. 使用 minmax() 函数

```css
.flexible-grid {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 3fr minmax(100px, 200px);
}
```

### 2. 自动放置算法

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  grid-auto-rows: 150px;
  gap: 1rem;
}
```

### 3. 网格对齐

```css
.aligned-grid {
  display: grid;
  place-items: center; /* 等同于 align-items: center; justify-items: center; */
  place-content: center; /* 等同于 align-content: center; justify-content: center; */
}
```

## 实际应用场景

CSS Grid特别适合以下场景：

1. **复杂的页面布局**: 如报纸式的多栏布局
2. **响应式设计**: 轻松调整不同屏幕尺寸下的布局
3. **组件内部布局**: 如卡片组件的内部元素排列
4. **图片画廊**: 创建瀑布流或网格式图片展示

## 浏览器支持

现代浏览器对CSS Grid的支持非常好：

- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

对于不支持的旧浏览器，可以使用 `@supports` 查询来提供降级方案：

```css
.layout {
  /* 降级方案：使用flexbox */
  display: flex;
  flex-wrap: wrap;
}

@supports (display: grid) {
  .layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
```

## 总结

CSS Grid为我们提供了强大而灵活的布局能力。通过理解其核心概念并结合实际项目需求，我们可以创建出既美观又实用的现代网页布局。

记住，Grid和Flexbox并不是竞争关系，而是互补的。Grid适合二维布局，Flexbox适合一维布局。在实际项目中，两者经常会结合使用。