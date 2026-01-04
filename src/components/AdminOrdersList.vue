<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AdminOrderCard from './AdminOrderCard.vue'

const { t } = useI18n()

defineProps<{
  orders: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'update-status', id: number, status: string): void
}>()
</script>

<template>
  <div class="orders-tab">
    <div class="header-actions">
      <h2>{{ t('admin.orders') }}</h2>
      <button class="refresh-btn" @click="emit('refresh')">🔄</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    
    <div v-else class="orders-list">
      <AdminOrderCard 
        v-for="order in orders" 
        :key="order.id" 
        :order="order" 
        @update-status="(id, status) => emit('update-status', id, status)"
      />
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.refresh-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 800px) {
  .orders-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>

