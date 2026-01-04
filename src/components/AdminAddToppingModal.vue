<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit', topping: any): void
}>()

const newTopping = ref({
    name_he: '',
    name_en: '',
    price: 0
})

// Reset form when modal opens
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        newTopping.value = {
            name_he: '',
            name_en: '',
            price: 0
        }
    }
})

const submit = () => {
    emit('submit', newTopping.value)
}

const close = () => {
    emit('update:modelValue', false)
}
</script>

<template>
    <div v-if="modelValue" class="modal-overlay">
        <div class="modal">
            <h3>{{ t('admin.newTopping') }}</h3>
            <div class="form-group">
                <label>{{ t('admin.nameHe') }}:</label>
                <input v-model="newTopping.name_he" type="text">
            </div>
            <div class="form-group">
                <label>{{ t('admin.nameEn') }}:</label>
                <input v-model="newTopping.name_en" type="text">
            </div>
            <div class="form-group">
                <label>{{ t('admin.price') }}:</label>
                <input v-model.number="newTopping.price" type="number">
            </div>
            <div class="modal-actions">
                <button @click="close">{{ t('admin.cancel') }}</button>
                <button class="primary" @click="submit">{{ t('admin.save') }}</button>
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

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
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
</style>

