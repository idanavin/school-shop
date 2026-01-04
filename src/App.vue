<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { watchEffect, ref } from 'vue'
import { useCartStore } from './stores/cart'

const { t, locale } = useI18n()
const cart = useCartStore()

watchEffect(() => {
  document.documentElement.dir = locale.value === 'he' ? 'rtl' : 'ltr'
  document.documentElement.lang = locale.value
})

const toggleLang = () => {
  locale.value = locale.value === 'he' ? 'en' : 'he'
}
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-content">
        <h1>{{ t('app.title') }}</h1>
        <button class="lang-btn" @click="toggleLang">
          {{ locale === 'he' ? 'EN' : 'עב' }}
        </button>
      </div>
      
      <nav class="main-nav">
        <RouterLink to="/" class="nav-link">
          <span class="icon">🏠</span>
          <span class="label">{{ t('nav.menu') }}</span>
        </RouterLink>
        <RouterLink to="/cart" class="nav-link">
          <span class="icon">🛒</span>
          <span class="label">{{ t('nav.orders') }}</span>
          <span v-if="cart.count > 0" class="badge">{{ cart.count }}</span>
        </RouterLink>
        <RouterLink to="/admin" class="nav-link">
          <span class="icon">⚙️</span>
          <span class="label">{{ t('nav.admin') }}</span>
        </RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 600px; /* Limit width on larger screens for better UX */
  margin: 0 auto;
  padding-bottom: 80px; /* Space for fixed nav if we decide to move it down, or just spacing */
}

.main-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  line-height: 1.2;
}

.lang-btn {
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.main-nav {
  display: flex;
  justify-content: space-around;
  background-color: var(--color-background-soft);
  padding: 0.5rem;
  border-radius: 8px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  padding: 0.5rem;
  flex: 1;
  position: relative;
}

.nav-link .icon {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.nav-link .label {
  font-size: 0.8rem;
}

.nav-link.router-link-active {
  color: var(--vt-c-indigo);
  font-weight: bold;
  background-color: var(--color-background-mute);
  border-radius: 4px;
}

.badge {
  position: absolute;
  top: 0;
  right: 25%; /* Center-ish depending on width */
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 600px) {
  .app-container {
    padding: 2rem;
  }
}
</style>
