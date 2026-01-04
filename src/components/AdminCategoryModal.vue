<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  categoryToEdit?: any // If null, we are adding a new category
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', category: { id?: number; name: string }): void
}>()

const name = ref('')

// Initialize form when opening
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      name.value = props.categoryToEdit?.name || ''
    }
  }
)

const submit = () => {
  if (!name.value.trim()) return
  
  emit('submit', {
    id: props.categoryToEdit?.id,
    name: name.value
  })
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>{{ categoryToEdit ? t('admin.editCategory') : t('admin.menu') }}</h2>
      
      <div class="form-group">
        <label>{{ t('admin.nameHe') }}</label>
        <input v-model="name" type="text" required @keyup.enter="submit" />
      </div>

      <div class="actions">
        <button class="cancel-btn" @click="close">{{ t('admin.cancel') }}</button>
        <button class="save-btn" @click="submit">{{ t('admin.save') }}</button>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-mute);
  color: var(--color-text);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-btn {
  background: #666;
  color: white;
}

.save-btn {
  background: #00bd7e;
  color: white;
}
</style>

