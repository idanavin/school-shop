<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    modelValue: boolean
    categoryId: number
    itemToEdit?: any
    availableToppings?: any[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit', item: any): void
    (e: 'delete', itemId: number): void
}>()

const newItem = ref({
    id: 0,
    category_id: props.categoryId,
    name_he: '',
    name_en: '',
    price: 0,
    has_toppings: false,
    max_toppings: 0,
    stock: null as number | null,
    is_hidden: false,
    toppings: [] as number[]
})

watch(() => props.categoryId, (newVal) => {
    newItem.value.category_id = newVal
})

// Reset or populate form when modal opens
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        if (props.itemToEdit) {
            newItem.value = { 
                ...props.itemToEdit, 
                category_id: props.categoryId,
                max_toppings: props.itemToEdit.max_toppings || 0,
                stock: props.itemToEdit.stock,
                is_hidden: props.itemToEdit.is_hidden || false,
                toppings: props.itemToEdit.toppings ? props.itemToEdit.toppings.map((t: any) => t.id) : []
            }
        } else {
            newItem.value = {
                id: 0,
                category_id: props.categoryId,
                name_he: '',
                name_en: '',
                price: 0,
                has_toppings: false,
                max_toppings: 0,
                stock: null,
                is_hidden: false,
                toppings: []
            }
        }
    }
})

const submit = () => {
    emit('submit', newItem.value)
}

const deleteItem = () => {
    if (confirm(t('admin.confirmDelete'))) {
        emit('delete', newItem.value.id)
    }
}

const close = () => {
    emit('update:modelValue', false)
}
</script>

<template>
    <div v-if="modelValue" class="modal-overlay">
        <div class="modal">
            <h3>{{ itemToEdit ? t('admin.editItem') : t('admin.newItem') }}</h3>
            <div class="form-group">
                <label>{{ t('admin.nameHe') }}:</label>
                <input v-model="newItem.name_he" type="text">
            </div>
            <div class="form-group">
                <label>{{ t('admin.nameEn') }}:</label>
                <input v-model="newItem.name_en" type="text">
            </div>
            <div class="form-group">
                <label>{{ t('admin.price') }}:</label>
                <input v-model.number="newItem.price" type="number">
            </div>
            <div class="form-group">
                <label>{{ t('admin.stock') }}:</label>
                <input v-model.number="newItem.stock" type="number" placeholder="Unlimited">
            </div>
            <div class="form-group checkbox">
                <label>
                    <input v-model="newItem.is_hidden" type="checkbox">
                    {{ t('admin.isHidden') }}
                </label>
            </div>
            <div class="form-group checkbox">
                <label>
                    <input v-model="newItem.has_toppings" type="checkbox">
                    {{ t('admin.hasToppings') }}
                </label>
            </div>
            
            <div v-if="newItem.has_toppings && availableToppings && availableToppings.length > 0" class="toppings-selection">
                <div class="form-group">
                    <label>{{ t('admin.maxToppings') }}:</label>
                    <input v-model.number="newItem.max_toppings" type="number" min="0">
                </div>
                
                <label>{{ t('admin.selectToppings') }}:</label>
                <div class="toppings-grid">
                    <div v-for="topping in availableToppings" :key="topping.id" class="topping-item">
                        <label>
                            <input type="checkbox" :value="topping.id" v-model="newItem.toppings">
                            {{ topping.name_he }}
                        </label>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button v-if="itemToEdit" class="delete-btn" @click="deleteItem">{{ t('admin.delete') }}</button>
                <div class="right-actions">
                    <button @click="close">{{ t('admin.cancel') }}</button>
                    <button class="primary" @click="submit">{{ t('admin.save') }}</button>
                </div>
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
}

.modal {
    background: var(--color-background);
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    max-height: 90vh;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="number"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-background-soft);
    color: var(--color-text);
}

.form-group.checkbox {
    display: flex;
    align-items: center;
}

.form-group.checkbox label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.toppings-selection {
    margin-top: 1rem;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
}

.toppings-selection label {
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
}

.toppings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
}

.topping-item label {
    font-weight: normal;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0;
}

.modal-actions {
    display: flex;
    justify-content: space-between; /* Changed to space-between to separate delete button */
    margin-top: 2rem;
}

.right-actions {
    display: flex;
    gap: 1rem;
    margin-left: auto; /* Push to right if no delete button or alongside it */
}

.modal-actions button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background: transparent;
    cursor: pointer;
    color: var(--color-text);
}

.modal-actions button.primary {
    background: #00bd7e;
    color: white;
    border: none;
}

.delete-btn {
    border-color: #ff4444 !important;
    color: #ff4444 !important;
}

.delete-btn:hover {
    background-color: #ff4444 !important;
    color: white !important;
}
</style>



