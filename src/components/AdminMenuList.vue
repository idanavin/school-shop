<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  menu: any
}>()

const emit = defineEmits<{
  (e: 'add-category'): void
  (e: 'add-item', categoryId: number): void
  (e: 'add-topping'): void
  (e: 'edit-item', item: any): void
  (e: 'delete-topping', id: number): void
  (e: 'edit-category', category: any): void
  (e: 'delete-category', id: number): void
}>()
</script>

<template>
  <div class="menu-tab">
    <div class="header-actions">
        <h2>{{ t('admin.menu') }}</h2>
        <button class="add-btn" @click="emit('add-category')">+ קטגוריה</button>
    </div>
    <div v-if="menu.menu" class="menu-list">
        <div v-for="cat in menu.menu" :key="cat.id" class="menu-category">
            <div class="category-header">
                <div class="category-title">
                    <h3>{{ cat.name }}</h3>
                    <div class="category-actions">
                        <button class="edit-btn small" @click="emit('edit-category', cat)">✏️</button>
                        <button class="delete-btn small" @click="emit('delete-category', cat.id)">🗑️</button>
                    </div>
                </div>
                <button class="add-small-btn" @click="emit('add-item', cat.id)">+ פריט</button>
            </div>
            <div class="menu-items">
                <div v-for="item in cat.items" :key="item.id" class="menu-item" :class="{ 'hidden-item': item.is_hidden }">
                    <div class="info">
                      <span class="name">
                          {{ item.name_he }}
                          <span v-if="item.is_hidden" class="hidden-badge">👁️‍🗨️</span>
                      </span>
                      <span class="sub">{{ item.name_en }}</span>
                      <span v-if="item.stock !== null" class="stock">
                        {{ t('admin.stockLabel') }}: {{ item.stock }}
                      </span>
                    </div>
                    <div class="price-action">
                      <span class="price">₪{{ item.price }}</span>
                      <button class="edit-btn" @click="emit('edit-item', item)">✏️</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toppings Section -->
        <div class="menu-category">
            <div class="category-header">
                <h3>{{ t('menu.toppings') }}</h3>
                <button class="add-small-btn" @click="emit('add-topping')">+ תוספת</button>
            </div>
            <div v-if="menu.toppings" class="menu-items">
                <div v-for="top in menu.toppings" :key="top.id" class="menu-item">
                    <div class="info">
                        <span class="name">{{ top.name_he }}</span>
                        <span class="sub">{{ top.name_en }}</span>
                    </div>
                    <div class="price-action">
                        <span class="price">₪{{ top.price }}</span>
                        <button class="delete-btn" @click="emit('delete-topping', top.id)">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
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

.add-btn {
    background-color: #00bd7e;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
}

.menu-category {
  margin-bottom: 2rem;
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
}

.category-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.category-actions {
    display: flex;
    gap: 0.5rem;
}

.category-header h3 {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.add-small-btn {
    background: none;
    border: 1px solid #00bd7e;
    color: #00bd7e;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-background-soft);
  padding: 0.75rem;
  border-radius: 8px;
}

.menu-item .info {
  display: flex;
  flex-direction: column;
}

.menu-item .sub {
  font-size: 0.8rem;
  color: #666;
}

.menu-item .stock {
  font-size: 0.8rem;
  color: #00bd7e;
  font-weight: bold;
}

.price-action {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price {
  font-weight: bold;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #ff4444;
}

.edit-btn.small, .delete-btn.small {
    font-size: 1rem;
    padding: 2px;
}

.hidden-item {
    opacity: 0.7;
    background: #f0f0f0;
    border: 1px dashed #ccc;
}

.hidden-badge {
    font-size: 0.8em;
    margin-right: 0.5rem;
}
</style>

