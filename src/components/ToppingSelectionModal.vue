<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

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
  max_toppings: number;
}

const props = defineProps<{
    modelValue: boolean;
    item: Item | null;
    availableToppings: Topping[];
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'confirm', toppings: Topping[]): void
}>()

const selectedToppings = ref<number[]>([])

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        selectedToppings.value = []
    }
})

const currentToppingsCount = computed(() => selectedToppings.value.length)
const isMaxReached = computed(() => {
    if (!props.item?.max_toppings) return false
    return currentToppingsCount.value >= props.item.max_toppings
})

const toggleTopping = (toppingId: number) => {
    const index = selectedToppings.value.indexOf(toppingId)
    if (index === -1) {
        if (!isMaxReached.value) {
            selectedToppings.value.push(toppingId)
        }
    } else {
        selectedToppings.value.splice(index, 1)
    }
}

const confirm = () => {
    const toppings = props.availableToppings.filter(t => selectedToppings.value.includes(t.id))
    emit('confirm', toppings)
    emit('update:modelValue', false)
}

const close = () => {
    emit('update:modelValue', false)
}
</script>

<template>
    <div v-if="modelValue && item" class="modal-overlay" @click.self="close">
        <div class="modal">
            <h3>{{ locale === 'he' ? item.name_he : item.name_en }}</h3>
            <p class="subtitle">{{ t('menu.selectToppings') }}</p>
            
            <div v-if="item.max_toppings > 0" class="limit-info">
                {{ t('menu.maxToppings', { count: item.max_toppings }) }}
                ({{ currentToppingsCount }}/{{ item.max_toppings }})
            </div>

            <div v-if="availableToppings.length === 0" class="no-toppings">
                {{ t('menu.noToppings') }}
            </div>

            <div v-else class="toppings-list">
                <div 
                    v-for="topping in availableToppings" 
                    :key="topping.id"
                    class="topping-item"
                    :class="{ 'selected': selectedToppings.includes(topping.id), 'disabled': !selectedToppings.includes(topping.id) && isMaxReached }"
                    @click="toggleTopping(topping.id)"
                >
                    <div class="topping-info">
                        <span class="checkbox">
                            <span v-if="selectedToppings.includes(topping.id)">✓</span>
                        </span>
                        <span class="name">{{ locale === 'he' ? topping.name_he : topping.name_en }}</span>
                    </div>
                    <span class="price" v-if="topping.price > 0">+₪{{ topping.price }}</span>
                </div>
            </div>

            <div class="modal-actions">
                <button class="cancel-btn" @click="close">{{ t('common.cancel') }}</button>
                <button class="confirm-btn" @click="confirm">{{ t('common.addToCart') }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
}

.modal {
    background: var(--color-background);
    padding: 1.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}

h3 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--color-heading);
}

.subtitle {
    margin: 0.5rem 0 1rem 0;
    color: var(--color-text);
    opacity: 0.8;
}

.limit-info {
    background: var(--color-background-soft);
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    text-align: center;
}

.no-toppings {
    text-align: center;
    padding: 2rem;
    color: var(--color-text);
    opacity: 0.7;
    font-style: italic;
}

.toppings-list {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.topping-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.topping-item:hover {
    background: var(--color-background-soft);
}

.topping-item.selected {
    border-color: #00bd7e;
    background: rgba(0, 189, 126, 0.1);
}

.topping-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.topping-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid #ccc;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
    background: white;
}

.selected .checkbox {
    background: #00bd7e;
    border-color: #00bd7e;
}

.price {
    font-weight: bold;
    color: #00bd7e;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    border: none;
}

.cancel-btn {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.confirm-btn {
    background: #00bd7e;
    color: white;
    font-weight: 600;
}
</style>

