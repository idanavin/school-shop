import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import i18n from '../i18n'

interface Topping {
  id: number
  name_he: string
  name_en: string
  price: number
}

interface CartItem {
  id: number
  item_id: number
  name_he: string
  name_en: string
  price: number
  quantity: number
  toppings: Topping[]
  stock: number | null
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const total = computed(() => {
    return items.value.reduce((acc, item) => {
      const toppingsPrice = item.toppings.reduce((tAcc, t) => tAcc + t.price, 0)
      return acc + (item.price + toppingsPrice) * item.quantity
    }, 0)
  })

  const count = computed(() => items.value.reduce((acc, item) => acc + item.quantity, 0))

  function addItem(item: any, quantity: number = 1, toppings: Topping[] = []) {
    // Check stock
    if (item.stock !== null && item.stock !== undefined) {
      const currentQuantityInCart = items.value
        .filter((i) => i.item_id === item.id)
        .reduce((acc, i) => acc + i.quantity, 0)

      if (currentQuantityInCart + quantity > item.stock) {
        // @ts-ignore
        alert(
          i18n.global.t('menu.outOfStock') +
            ': ' +
            (i18n.global.locale.value === 'he' ? item.name_he : item.name_en),
        )
        return false
      }
    }

    // Check if item with same toppings exists
    // For simplicity, just add as new line item if it has toppings, or merge if exact match
    // Simplified: always add new entry
    items.value.push({
      id: Date.now(), // temp id
      item_id: item.id,
      name_he: item.name_he,
      name_en: item.name_en,
      price: item.price,
      quantity,
      toppings,
      stock: item.stock,
    })
    return true
  }

  function removeItem(index: number) {
    items.value.splice(index, 1)
  }

  function clearCart() {
    items.value = []
  }

  function getItemQuantity(itemId: number) {
    return items.value.filter((i) => i.item_id === itemId).reduce((acc, i) => acc + i.quantity, 0)
  }

  return { items, total, count, addItem, removeItem, clearCart, getItemQuantity }
})
