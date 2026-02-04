<script setup>
import { ref, computed } from 'vue'
import myset from './assets/myset.json'

const defaultStores = myset.store || []
const items = ref([
  { id: 1, name: '牛乳', store: defaultStores[0] || 'ストアA', purchased: false },
  { id: 2, name: 'パン', store: defaultStores[1] || 'ストアB', purchased: true },
  { id: 3, name: '卵', store: defaultStores[0] || 'ストアA', purchased: false }
])

const stores = ref([...defaultStores, '新規ストアを追加...'])
const newItemName = ref('')
const selectedStore = ref(defaultStores[0] || 'ストアA')
const newStoreName = ref('')
const filterStore = ref('すべて')

const filteredItems = computed(() => {
  if (filterStore.value === 'すべて') {
    return items.value
  } else {
    return items.value.filter(item => item.store === filterStore.value)
  }
})

function addItem() {
  if (newItemName.value.trim() === '') return

  let storeToAdd = selectedStore.value
  if (selectedStore.value === '新規ストアを追加...') {
    if (newStoreName.value.trim() === '') {
      alert('新しいストア名を入力してください。')
      return
    }
    storeToAdd = newStoreName.value.trim()
    if (!stores.value.includes(storeToAdd)) {
      stores.value.splice(stores.value.length - 1, 0, storeToAdd)
    }
  }

  items.value.push({
    id: items.value.length + 1,
    name: newItemName.value.trim(),
    store: storeToAdd,
    purchased: false
  })
  newItemName.value = ''
  newStoreName.value = ''
}

function togglePurchased(id) {
  const item = items.value.find(item => item.id === id)
  if (item) {
    item.purchased = !item.purchased
  }
}

function removeItem(id) {
  items.value = items.value.filter(item => item.id !== id)
}
</script>

<template>
  <div class="container">
    <h1>買い物リスト</h1>

    <div class="add-item">
      <input
        type="text"
        v-model="newItemName"
        placeholder="新しい品目を追加"
        @keyup.enter="addItem"
      />
      <select v-model="selectedStore">
        <option v-for="store in stores" :key="store" :value="store">{{ store }}</option>
      </select>
      <input
        type="text"
        v-if="selectedStore === '新規ストアを追加...'"
        v-model="newStoreName"
        placeholder="新しいストア名"
      />
      <button @click="addItem">追加</button>
    </div>

    <div class="filter-store">
      <label for="filter">ストアでフィルタ:</label>
      <select id="filter" v-model="filterStore">
        <option value="すべて">すべて</option>
        <option v-for="store in stores.filter(s => s !== '新規ストアを追加...')" :key="store" :value="store">{{ store }}</option>
      </select>
    </div>

    <ul class="shopping-list">
      <li v-for="item in filteredItems" :key="item.id" :class="{ purchased: item.purchased }">
        <input
          type="checkbox"
          :checked="item.purchased"
          @change="togglePurchased(item.id)"
        />
        <span>{{ item.name }} ({{ item.store }})</span>
        <button @click="removeItem(item.id)" class="delete-button">削除</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

.add-item,
.filter-store {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.add-item input[type="text"],
.add-item select,
.filter-store select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
}

.add-item button {
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-item button:hover {
  background-color: #45a049;
}

.shopping-list {
  list-style: none;
  padding: 0;
}

.shopping-list li {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
}

.shopping-list li.purchased span {
  text-decoration: line-through;
  color: #888;
}

.shopping-list input[type="checkbox"] {
  transform: scale(1.2);
}

.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto; /* ボタンを右寄せにする */
}

.delete-button:hover {
  background-color: #da190b;
}
</style>