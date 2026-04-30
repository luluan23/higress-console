<template>
  <div class="stat-card" :style="accentStyle">
    <div class="stat-card__top-bar" :style="topBarStyle"></div>
    <div class="stat-card__body">
      <div class="stat-card__label">{{ label }}</div>
      <div class="stat-card__value">
        {{ value }}<span v-if="unit" class="stat-card__unit">{{ unit }}</span>
      </div>
      <div v-if="sub" class="stat-card__sub">{{ sub }}</div>
      <div v-if="trend !== undefined" class="stat-card__trend" :class="trendClass">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </div>
      <div v-if="progress !== undefined" class="stat-card__progress-wrap">
        <div class="stat-card__progress-bar" :style="progressBarStyle"></div>
        <span class="stat-card__progress-label">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    unit: { type: String, default: '' },
    color: { type: String, default: 'var(--color-blue)' },
    sub: { type: String, default: '' },
    trend: { type: Number, default: undefined },
    progress: { type: Number, default: undefined },
  },
  computed: {
    topBarStyle() {
      return { background: `linear-gradient(90deg, ${this.color}, transparent)` }
    },
    accentStyle() {
      return { '--card-accent': this.color }
    },
    trendClass() {
      return this.trend >= 0 ? 'is-up' : 'is-down'
    },
    progressBarStyle() {
      return {
        width: `${Math.min(100, Math.max(0, this.progress))}%`,
        background: this.color,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.stat-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  &__top-bar {
    height: 3px;
    width: 100%;
  }

  &__body {
    padding: 16px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-muted, #8896a9);
    margin-bottom: 8px;
    font-weight: 500;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary, #1a1f2e);
    line-height: 1;
  }

  &__unit {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-secondary, #4a5568);
    margin-left: 4px;
  }

  &__sub {
    font-size: 12px;
    color: var(--text-muted, #8896a9);
    margin-top: 6px;
  }

  &__trend {
    font-size: 12px;
    margin-top: 6px;
    font-weight: 600;

    &.is-up { color: var(--color-green, #00a870); }
    &.is-down { color: var(--color-red, #e34d59); }
  }

  &__progress-wrap {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__progress-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--bg-2, #eef0f6);
    position: relative;
    overflow: hidden;

    &::before {
      display: none;
    }
  }

  &__progress-label {
    font-size: 11px;
    color: var(--text-muted, #8896a9);
    white-space: nowrap;
  }
}
</style>
