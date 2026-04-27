<template>
  <div class="persona-homepage">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="geometric-shape shape-1"></div>
      <div class="geometric-shape shape-2"></div>
      <div class="geometric-shape shape-3"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 标题区域 -->
      <div class="hero-section">
        <div class="logo-container">
          <img src="../assets/image/logo.png" alt="Logo" class="main-logo">
        </div>
        <h1 class="main-title">
          <span class="title-line-1">权限管理</span>
          <span class="title-line-2">系统</span>
        </h1>
        <p class="subtitle">高效 · 安全 · 智能</p>
        
        <!-- 装饰性引用 -->
        <div class="quote-container">
          <div class="quote-mark">"</div>
          <p class="quote-text">掌控权限，守护安全</p>
        </div>
      </div>

      <!-- 功能卡片区域 -->
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index" 
             :style="{ animationDelay: `${index * 0.2}s` }"
             @click="navigateToFeature(feature.route)">
          <div class="card-header">
            <div class="card-icon">
              <i :class="feature.icon"></i>
            </div>
            <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
          </div>
          <div class="card-arrow">
            <i class="iconfont icon-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stats-container">
          <div class="stat-item" v-for="(stat, index) in stats" :key="index">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边装饰 -->
    <div class="side-decoration">
      <div class="vertical-text">PERMISSION SYSTEM</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 功能模块数据
const features = ref([
  {
    title: '用户管理',
    description: '管理系统用户信息与状态',
    icon: 'iconfont icon-user',
    route: '/user'
  },
  {
    title: '角色管理',
    description: '配置角色权限与职责',
    icon: 'iconfont icon-duoren',
    route: '/role'
  },
  {
    title: '项目管理',
    description: '项目权限分配与控制',
    icon: 'iconfont icon-xiangmu',
    route: '/project'
  },
  {
    title: '令牌管理',
    description: '服务令牌生成与管理',
    icon: 'iconfont icon-quanxianpeizhi1',
    route: '/service_token'
  }
])

// 统计数据
const stats = ref([
  { number: '1,234', label: '活跃用户' },
  { number: '56', label: '角色配置' },
  { number: '89', label: '项目数量' },
  { number: '234', label: '权限节点' }
])

// 导航到功能页面
const navigateToFeature = (route) => {
  router.push(route)
}

// 生成粒子样式
const getParticleStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }
}

onMounted(() => {
  // 页面加载动画
  document.querySelector('.persona-homepage').classList.add('loaded')
})
</script>

<style scoped>
.persona-homepage {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #000 100%);
  color: #ffffff;
  overflow: hidden;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
}

.persona-homepage.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.geometric-shape {
  position: absolute;
  background: linear-gradient(45deg, #ff0040, #ff6b6b);
  opacity: 0.1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  transform: rotate(45deg);
  clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: -100px;
  transform: rotate(-30deg);
  clip-path: polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%);
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 30%;
  right: 10%;
  transform: rotate(60deg);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ff0040;
  border-radius: 50%;
  animation: float 4s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

/* 主要内容 */
.main-content {
  position: relative;
  z-index: 2;
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 标题区域 */
.hero-section {
  text-align: center;
  margin-bottom: 80px;
}

.logo-container {
  margin-bottom: 30px;
}

.main-logo {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 0 20px rgba(255, 0, 64, 0.3));
}

.main-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  line-height: 0.9;
  text-transform: uppercase;
  letter-spacing: -2px;
}

.title-line-1 {
  display: block;
  color: #ffffff;
  transform: skew(-10deg);
  text-shadow: 3px 3px 0 #ff0040;
}

.title-line-2 {
  display: block;
  color: #ff0040;
  transform: skew(-10deg) translateX(20px);
  text-shadow: 3px 3px 0 #000;
}

.subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  margin: 20px 0;
  letter-spacing: 2px;
}

.quote-container {
  margin-top: 40px;
  position: relative;
}

.quote-mark {
  font-size: 4rem;
  color: #ff0040;
  font-family: serif;
  line-height: 1;
}

.quote-text {
  font-size: 1.1rem;
  color: #ffffff;
  font-style: italic;
  margin: 0;
  transform: skew(-5deg);
}

/* 功能卡片 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 2px solid transparent;
  border-radius: 0;
  padding: 30px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform: skew(-5deg);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(50px) skew(-5deg);
}

.feature-card:hover {
  border-color: #ff0040;
  transform: skew(-5deg) translateY(-10px);
  box-shadow: 0 20px 40px rgba(255, 0, 64, 0.2);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 64, 0.1), transparent);
  transition: left 0.5s ease;
}

.feature-card:hover::before {
  left: 100%;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0) skew(-5deg);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #ff0040, #ff6b6b);
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(20% 0%, 100% 0, 80% 100%, 0% 100%);
}

.card-icon i {
  font-size: 24px;
  color: #ffffff;
}

.card-number {
  font-size: 2rem;
  font-weight: 900;
  color: #ff0040;
  font-family: 'Courier New', monospace;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
  transform: skew(5deg);
}

.card-description {
  color: #cccccc;
  margin: 0;
  line-height: 1.6;
  transform: skew(5deg);
}

.card-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #ff0040;
  font-size: 20px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 统计信息 */
.stats-section {
  text-align: center;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 900;
  color: #ff0040;
  font-family: 'Courier New', monospace;
  text-shadow: 2px 2px 0 #000;
}

.stat-label {
  font-size: 1rem;
  color: #cccccc;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

/* 侧边装饰 */
.side-decoration {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 0.9rem;
  color: #666;
  letter-spacing: 3px;
  font-weight: 300;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 40px 20px;
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-container {
    flex-direction: column;
    align-items: center;
  }
  
  .side-decoration {
    display: none;
  }
}
</style>
