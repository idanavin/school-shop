import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    app: {
      title: 'High School Cafeteria',
    },
    nav: {
      menu: 'Menu',
      admin: 'Admin Panel',
      orders: 'My Order',
    },
    menu: {
      addToCart: 'Add to Cart',
      toppings: 'Toppings',
      selectToppings: 'Select your toppings',
      maxToppings: 'Choose up to {count} toppings',
      noToppings: 'No toppings available for this item',
      outOfStock: 'Out of Stock',
    },
    common: {
      cancel: 'Cancel',
      addToCart: 'Add to Cart',
    },
    cart: {
      title: 'Your Cart',
      empty: 'Cart is empty',
      checkout: 'Checkout',
      total: 'Total',
    },
    form: {
      name: 'Full Name',
      class: 'Class (e.g. YUD-2)',
      phone: 'Phone Number',
      submit: 'Place Order',
    },
    admin: {
      orders: 'Orders',
      menu: 'Menu Management',
      pending: 'Pending',
      completed: 'Completed',
      newItem: 'New Item',
      editItem: 'Edit Item',
      newTopping: 'New Topping',
      nameHe: 'Name (Hebrew)',
      nameEn: 'Name (English)',
      price: 'Price',
      hasToppings: 'Has Toppings?',
      maxToppings: 'Max Toppings (0 = Unlimited)',
      selectToppings: 'Select Toppings',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this item?',
      confirmDeleteCategory: 'Are you sure you want to delete this category?',
      categoryNotEmpty: 'Cannot delete category that contains items',
      stock: 'Stock (Leave empty for unlimited)',
      stockLabel: 'Stock',
      editCategory: 'Edit Category',
      isHidden: 'Hide from menu',
    },
  },
  he: {
    app: {
      title: 'קפיטריית התיכון',
    },
    nav: {
      menu: 'תפריט',
      admin: 'פאנל ניהול',
      orders: 'ההזמנה שלי',
    },
    menu: {
      addToCart: 'הוסף לעגלה',
      toppings: 'תוספות',
      selectToppings: 'בחר את התוספות שלך',
      maxToppings: 'בחר עד {count} תוספות',
      noToppings: 'אין תוספות זמינות לפריט זה',
      outOfStock: 'אזל מהמלאי',
    },
    common: {
      cancel: 'ביטול',
      addToCart: 'הוסף לעגלה',
    },
    cart: {
      title: 'העגלה שלך',
      empty: 'העגלה ריקה',
      checkout: 'סיום הזמנה',
      total: 'סה"כ',
    },
    form: {
      name: 'שם מלא',
      class: 'כיתה (לדוגמה: יב-2)',
      phone: 'מספר טלפון',
      submit: 'שלח הזמנה',
    },
    admin: {
      orders: 'הזמנות',
      menu: 'ניהול תפריט',
      pending: 'ממתין',
      completed: 'הושלם',
      newItem: 'הוספת פריט חדש',
      editItem: 'עריכת פריט',
      newTopping: 'הוספת תוספת חדשה',
      nameHe: 'שם (עברית)',
      nameEn: 'שם (אנגלית)',
      price: 'מחיר',
      hasToppings: 'יש תוספות?',
      maxToppings: 'מקסימום תוספות (0 = ללא הגבלה)',
      selectToppings: 'בחר תוספות',
      cancel: 'ביטול',
      save: 'שמור',
      delete: 'מחיקה',
      confirmDelete: 'האם אתה בטוח שברצונך למחוק פריט זה?',
      confirmDeleteCategory: 'האם אתה בטוח שברצונך למחוק קטגוריה זו?',
      categoryNotEmpty: 'לא ניתן למחוק קטגוריה המכילה פריטים',
      stock: 'מלאי (השאר ריק ללא הגבלה)',
      stockLabel: 'מלאי',
      editCategory: 'ערוך קטגוריה',
      isHidden: 'הסתר מהתפריט',
    },
  },
}

const i18n = createI18n({
  legacy: false, // use Composition API
  locale: 'he', // default locale
  fallbackLocale: 'en',
  messages,
})

export default i18n
