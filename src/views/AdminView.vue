<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { socket } from '../services/socket'
import { SocketEvents } from '../../shared/socket-events'
import AdminOrdersList from '../components/AdminOrdersList.vue'
import AdminMenuList from '../components/AdminMenuList.vue'
import AdminAddItemModal from '../components/AdminAddItemModal.vue'
import AdminAddToppingModal from '../components/AdminAddToppingModal.vue'
import AdminCategoryModal from '../components/AdminCategoryModal.vue'

const { t } = useI18n()
const orders = ref<any[]>([])
const menu = ref<any>({})
const loading = ref(true)
const activeTab = ref('orders') // 'orders' or 'menu'
const showAddItemModal = ref(false)
const showAddToppingModal = ref(false)
const showCategoryModal = ref(false)
const categoryToEdit = ref<any>(null)
const selectedCategoryId = ref(0)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/orders')
    orders.value = await res.json()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchMenu = async () => {
  try {
    const res = await fetch('/api/menu')
    const data = await res.json()
    menu.value = data
  } catch (e) {
    console.error(e)
  }
}

const updateStatus = async (id: number, status: string) => {
  await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  fetchOrders()
}

const addCategory = () => {
    categoryToEdit.value = null
    showCategoryModal.value = true
}

const editCategory = (category: any) => {
    categoryToEdit.value = category
    showCategoryModal.value = true
}

const submitCategory = async (categoryData: { id?: number; name: string }) => {
    try {
        if (categoryData.id) {
            // Edit existing
            await fetch(`/api/categories/${categoryData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryData.name })
            })
        } else {
            // Create new
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryData.name })
            })
            if (!res.ok) throw new Error('Failed to create category')
        }
        showCategoryModal.value = false
        fetchMenu()
    } catch (e) {
        alert('שגיאה בשמירת קטגוריה')
        console.error(e)
    }
}


const itemToEdit = ref<any>(null)

const openAddItemModal = (categoryId: number) => {
    selectedCategoryId.value = categoryId
    itemToEdit.value = null
    showAddItemModal.value = true
}

const openEditItemModal = (item: any) => {
    selectedCategoryId.value = item.categoryId
    itemToEdit.value = item
    showAddItemModal.value = true
}

const submitAddItem = async (item: any) => {
    if (item.id) {
        // Edit existing item
        await fetch(`/api/items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        })
    } else {
        // Create new item
        await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        })
    }
    showAddItemModal.value = false
    fetchMenu()
}

const deleteItem = async (itemId: number) => {
    const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
    })
    
    if (res.ok) {
        showAddItemModal.value = false
        fetchMenu()
    } else {
        const data = await res.json()
        alert('שגיאה במחיקת הפריט: ' + data.error)
    }
}

const openAddToppingModal = () => {
    showAddToppingModal.value = true
}

const submitAddTopping = async (newTopping: any) => {
    await fetch('/api/toppings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopping)
    })
    showAddToppingModal.value = false
    fetchMenu()
}

const deleteTopping = async (id: number) => {
    if (!confirm(t('admin.confirmDelete'))) {
        return
    }
    const res = await fetch(`/api/toppings/${id}`, {
        method: 'DELETE'
    })
    
    if (res.ok) {
        fetchMenu()
    } else {
        const data = await res.json()
        alert('שגיאה במחיקת התוספת: ' + data.error)
    }
}

const deleteCategory = async (id: number) => {
    // Find category to check if it has items (client side check as first line of defense)
    const category = menu.value.menu.find((c: any) => c.id === id)
    if (category && category.items && category.items.length > 0) {
        alert(t('admin.categoryNotEmpty'))
        return
    }

    if (!confirm(t('admin.confirmDeleteCategory'))) {
        return
    }

    const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
    })
    
    if (res.ok) {
        fetchMenu()
    } else {
        const data = await res.json()
        alert('שגיאה במחיקת הקטגוריה: ' + data.error)
    }
}

onMounted(() => {
    fetchOrders()
    fetchMenu()

    socket.on(SocketEvents.ORDERS_UPDATED, fetchOrders)
    socket.on(SocketEvents.MENU_UPDATED, fetchMenu)
})

onUnmounted(() => {
    socket.off(SocketEvents.ORDERS_UPDATED, fetchOrders)
    socket.off(SocketEvents.MENU_UPDATED, fetchMenu)
})
</script>

<template>
  <div class="admin-container">
    <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
          {{ t('admin.orders') }}
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'menu' }" @click="activeTab = 'menu'">
          {{ t('admin.menu') }}
        </button>
    </div>

    <AdminOrdersList 
        v-if="activeTab === 'orders'"
        :orders="orders"
        :loading="loading"
        @refresh="fetchOrders"
        @update-status="updateStatus"
    />

    <AdminMenuList 
        v-if="activeTab === 'menu'"
        :menu="menu"
        @add-category="addCategory"
        @add-item="openAddItemModal"
        @add-topping="openAddToppingModal"
        @edit-item="openEditItemModal"
        @delete-topping="deleteTopping"
        @edit-category="editCategory"
        @delete-category="deleteCategory"
    />

    <AdminAddItemModal 
        v-model="showAddItemModal"
        :category-id="selectedCategoryId"
        :item-to-edit="itemToEdit"
        :available-toppings="menu.toppings"
        @submit="submitAddItem"
        @delete="deleteItem"
    />

    <AdminAddToppingModal 
        v-model="showAddToppingModal"
        @submit="submitAddTopping"
    />

    <AdminCategoryModal
        v-model="showCategoryModal"
        :category-to-edit="categoryToEdit"
        @submit="submitCategory"
    />
  </div>
</template>

<style scoped>
.admin-container {
  padding-bottom: 2rem;
}

.tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  border-bottom-color: #00bd7e;
  color: #00bd7e;
  font-weight: bold;
}
</style>
