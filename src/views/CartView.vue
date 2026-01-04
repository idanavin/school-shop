<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const cart = useCartStore()
const router = useRouter()

const form = ref({
  name: '',
  class: '',
  phone: ''
})

const submitting = ref(false)

const submitOrder = async () => {
  if (!form.value.name || !form.value.class || !form.value.phone) {
    alert('Please fill all fields')
    return
  }
  
  submitting.value = true
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: form.value.name,
        student_class: form.value.class,
        student_phone: form.value.phone,
        items: cart.items.map(i => ({
          item_id: i.item_id,
          quantity: i.quantity,
          toppings: i.toppings
        }))
      })
    })
    
    if (res.ok) {
      cart.clearCart()
      alert('Order placed successfully!')
      router.push('/')
    } else {
      alert('Error placing order')
    }
  } catch (e) {
    console.error(e)
    alert('Network error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="cart-container">
    <h2 class="page-title">{{ t('cart.title') }}</h2>
    
    <div v-if="cart.items.length === 0" class="empty-cart">
      <p>{{ t('cart.empty') }}</p>
      <router-link to="/" class="back-link">Go to Menu</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="(item, index) in cart.items" :key="index" class="cart-item">
          <div class="item-details">
            <span class="item-name">{{ locale === 'he' ? item.name_he : item.name_en }}</span>
            <div v-if="item.toppings && item.toppings.length > 0" class="item-toppings">
              <span v-for="(topping, tIndex) in item.toppings" :key="tIndex" class="topping-tag">
                + {{ locale === 'he' ? topping.name_he : topping.name_en }}
              </span>
            </div>
            <span class="item-qty">x{{ item.quantity }}</span>
          </div>
          <div class="item-actions">
            <span class="item-price">₪{{ (item.price + (item.toppings?.reduce((acc, t) => acc + t.price, 0) || 0)) * item.quantity }}</span>
            <button class="remove-btn" @click="cart.removeItem(index)" aria-label="Remove">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="cart-total">
          <span>{{ t('cart.total') }}</span>
          <span class="total-amount">₪{{ cart.total }}</span>
        </div>
      </div>

      <div class="checkout-form">
        <h3>{{ t('cart.checkout') }}</h3>
        
        <div class="form-group">
          <label>{{ t('form.name') }}</label>
          <input v-model="form.name" type="text" required placeholder="Ex: Israel Israeli" />
        </div>
        
        <div class="form-group">
          <label>{{ t('form.class') }}</label>
          <input v-model="form.class" type="text" required placeholder="Ex: YUD-2" />
        </div>
        
        <div class="form-group">
          <label>{{ t('form.phone') }}</label>
          <input v-model="form.phone" type="tel" required placeholder="050-0000000" />
        </div>
        
        <button class="submit-btn" @click="submitOrder" :disabled="submitting">
          {{ submitting ? 'Sending...' : t('form.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  padding-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--vt-c-indigo);
  text-decoration: underline;
}

.cart-items {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
}

.item-toppings {
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topping-tag {
  background: var(--color-background);
  padding: 0 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.item-qty {
  font-size: 0.85rem;
  color: #666;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-price {
  font-weight: bold;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  opacity: 0.7;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--color-border);
  font-size: 1.2rem;
  font-weight: bold;
}

.total-amount {
  color: #00bd7e;
}

.checkout-form {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem;
}

.checkout-form h3 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background);
}

.form-group input:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: #00bd7e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
