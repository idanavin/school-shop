<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../stores/cart'
import ToppingSelectionModal from '../components/ToppingSelectionModal.vue'
import { socket } from '../services/socket'
import { SocketEvents } from '../../shared/socket-events'

const { t, locale } = useI18n()
const cart = useCartStore()

interface Topping {
  id: number;
  name_he: string;
  name_en: string;
  price: number;
}

interface Item {
  id: number;
  name_he: string;
  name_en: string;
  price: number;
  has_toppings: boolean;
  max_toppings: number;
  category_id: number;
  stock: number | null;
  is_hidden: boolean;
  toppings: Topping[];
}

interface Category {
  id: number;
  name: string;
  items: Item[];
}

const menu = ref<Category[]>([])
const loading = ref(true)
const showToppingsModal = ref(false)
const selectedItem = ref<Item | null>(null)

// Fetch menu
const fetchMenu = async () => {
  try {
    const res = await fetch('/api/menu')
    const data = await res.json()
    // Filter out hidden items
    menu.value = data.menu.map((cat: Category) => ({
      ...cat,
      items: cat.items.filter((item: Item) => !item.is_hidden)
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMenu()
  socket.on(SocketEvents.MENU_UPDATED, fetchMenu)
})

onUnmounted(() => {
  socket.off(SocketEvents.MENU_UPDATED, fetchMenu)
})

const addToCart = (item: Item) => {
  if (item.has_toppings) {
    selectedItem.value = item
    showToppingsModal.value = true
  } else {
    cart.addItem(item)
  }
}

const onToppingsConfirmed = (toppings: Topping[]) => {
  if (selectedItem.value) {
    cart.addItem(selectedItem.value, 1, toppings)
    selectedItem.value = null
  }
}
</script>

<template>
  <div class="home">
    <div v-if="loading" class="loading">Loading menu...</div>
    <div v-else>
      <div v-for="cat in menu" :key="cat.id" class="category-section">
        <h2 class="category-title">{{ cat.name }}</h2>
        <div class="items-list">
          <div v-for="item in cat.items" :key="item.id" class="item-card" :class="{ 'disabled-card': item.stock !== null && (item.stock <= 0 || cart.getItemQuantity(item.id) >= item.stock) }">
            <div class="item-info">
              <h3 class="item-name">{{ locale === 'he' ? item.name_he : item.name_en }}</h3>
              <p class="item-price">₪{{ item.price }}</p>
              <p v-if="item.stock !== null && (item.stock <= 0 || cart.getItemQuantity(item.id) >= item.stock)" class="out-of-stock">{{ t('menu.outOfStock') }}</p>
            </div>
            <button class="add-btn" @click="addToCart(item)" :disabled="(item.stock !== null && item.stock <= 0) || (item.stock !== null && cart.getItemQuantity(item.id) >= item.stock)">
              <span v-if="(item.stock === null || item.stock > 0) && (item.stock === null || cart.getItemQuantity(item.id) < item.stock)" class="plus-icon">+</span>
              {{ (item.stock !== null && (item.stock <= 0 || cart.getItemQuantity(item.id) >= item.stock)) ? t('menu.outOfStock') : t('menu.addToCart') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ToppingSelectionModal
      v-model="showToppingsModal"
      :item="selectedItem"
      :available-toppings="selectedItem?.toppings || []"
      @confirm="onToppingsConfirmed"
    />
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: #666;
}

.category-section {
  margin-bottom: 2rem;
}

.category-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
  color: var(--color-heading);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-background-soft);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.item-card.disabled-card {
    opacity: 0.6;
    pointer-events: none; /* Optional: prevents clicks on the whole card */
    background-color: #f0f0f0;
}

.item-card:active {
  transform: scale(0.98);
}

.out-of-stock {
    color: #ff4444;
    font-weight: bold;
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.item-price {
  color: #00bd7e;
  font-weight: bold;
  margin: 0;
}

.add-btn {
  background-color: var(--vt-c-indigo);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.plus-icon {
  font-size: 1.2em;
  line-height: 1;
}

/* Tablet/Desktop Tweaks */
@media (min-width: 600px) {
  .items-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .item-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
