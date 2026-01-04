<script setup lang="ts">
interface Topping {
  id: number
  name_he: string
  name_en: string
  price: number
}

interface OrderItem {
  id: number
  name_he: string
  name_en: string
  quantity: number
  price: number
  toppings: string | null
}

interface Order {
  id: number
  status: string
  student_name: string
  student_class: string
  student_phone: string
  items: OrderItem[]
  total_price: number
}

defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  (e: 'update-status', id: number, status: string): void
}>()

const getToppings = (json: string | null): Topping[] => {
  if (!json) return []
  try {
    return JSON.parse(json)
  } catch (e) {
    return []
  }
}
</script>

<template>
  <div class="order-card" :class="order.status">
    <div class="order-header">
      <span class="order-id">#{{ order.id }}</span>
      <span class="order-status">{{ order.status }}</span>
    </div>

    <div class="student-info">
      <strong>{{ order.student_name }}</strong> ({{ order.student_class }})<br>
      <a :href="'tel:' + order.student_phone">{{ order.student_phone }}</a>
    </div>

    <div class="order-items">
      <ul>
        <li v-for="item in order.items" :key="item.id">
          <div class="item-main">
            {{ item.name_he }} <span class="qty">x{{ item.quantity }}</span>
          </div>
          <div v-if="item.toppings" class="item-toppings">
            <span v-for="t in getToppings(item.toppings)" :key="t.id" class="topping-tag">
              + {{ t.name_he }}
            </span>
          </div>
        </li>
      </ul>
    </div>

    <div class="order-total">
      Total: ₪{{ order.total_price }}
    </div>

    <div class="order-actions">
      <button v-if="order.status !== 'completed'" class="action-btn complete" @click="emit('update-status', order.id, 'completed')">✅ Complete</button>
      <button v-if="order.status !== 'cancelled'" class="action-btn cancel" @click="emit('update-status', order.id, 'cancelled')">❌ Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.order-card {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1rem;
  border-left: 5px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.order-card.completed { border-left-color: #00bd7e; }
.order-card.cancelled { border-left-color: #ff4444; }
.order-card.pending { border-left-color: #ffbb33; }

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.student-info {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.order-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-items li {
  padding: 0.25rem 0;
}

.qty {
  font-weight: bold;
  background: #eee;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.item-toppings {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.2rem;
  padding-right: 0.5rem; /* Indent slightly for visual hierarchy in RTL/LTR */
}

.topping-tag {
  display: inline-block;
  margin-left: 0.5rem;
}

.order-total {
  text-align: end;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #00bd7e;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  color: white;
}

.action-btn.complete { background-color: #00bd7e; }
.action-btn.cancel { background-color: #ff4444; }
</style>

