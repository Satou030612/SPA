<script setup>
import { ref, computed, onMounted } from 'vue'

// Bug 1 の修正: selectedStore のデフォルト値が stores 配列に存在するようにする
// fetchData から取得するストアに依存するため、初期値は空のままにし、fetchData で初期化する

const apiUrl = ref('https://script.google.com/macros/s/AKfycbzijHcy9531MASML6qEpaYr24eHFsZN2lKTuvtYhRgnXQEtChzMTF7fJdotjoa3Dqj8iw/exec');
const items = ref([])
const stores = ref([])
const newItemName = ref('')
const selectedStore = ref('')
const newStoreName = ref('')
const filterStore = ref('すべて')
const isLoading = ref(true)

const filteredItems = computed(() => {
  if (filterStore.value === 'すべて') {
    return items.value
  } else {
    return items.value.filter(item => item.store === filterStore.value)
  }
})

async function fetchData() {
  isLoading.value = true;
  try {
    const [itemsRes, storesRes] = await Promise.all([
      fetch(`${apiUrl.value}?action=getItems`),
      fetch(`${apiUrl.value}?action=getStores`)
    ]);

    const itemsData = await itemsRes.json();
    const storesData = await storesRes.json();

    items.value = itemsData.items || [];
    stores.value = [...(storesData.stores || []), '新規ストアを追加...'];

    if (stores.value.length > 0) {
      selectedStore.value = stores.value[0];
    }
  } catch (error) {
    console.error('データの取得に失敗しました:', error);
    alert('データの読み込み中にエラーが発生しました。');
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);

async function addItem() {
  if (newItemName.value.trim() === '') {
    alert('新しい品目を入力してください。');
    return;
  }

  let storeToAdd = selectedStore.value;
  if (selectedStore.value === '新規ストアを追加...') {
    if (newStoreName.value.trim() === '') {
      alert('新しいストア名を入力してください。');
      return;
    }
    try {
      const res = await fetch(`${apiUrl.value}?action=addStore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // 'application/json'から変更
        },
        body: JSON.stringify({ storeName: newStoreName.value.trim() })
      });
      const result = await res.json();
      if (result.success) {
        storeToAdd = result.storeName;
        await fetchData();
      } else {
        alert('ストアの追加に失敗しました: ' + result.error);
        return;
      }
    } catch (error) {
      console.error('ストアの追加中にエラーが発生しました:', error);
      alert('ストアの追加中にエラーが発生しました。');
      return;
    }
  }

  // Bug 2 修正: 既存の ID の最大値 + 1 を使用して新しい ID を生成
  const maxId = items.value.reduce((max, item) => Math.max(max, item.id), 0);
  const newId = maxId + 1;

  try {
    const res = await fetch(`${apiUrl.value}?action=addItem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // 'application/json'から変更
      },
      body: JSON.stringify({
        id: newId, // ユニークな ID を使用
        name: newItemName.value.trim(),
        store: storeToAdd
      })
    });
    const result = await res.json();
    if (result.success) {
      newItemName.value = '';
      newStoreName.value = '';
      await fetchData();
    } else {
      alert('品目の追加に失敗しました: ' + result.error);
    }
  } catch (error) {
    console.error('品目の追加中にエラーが発生しました:', error);
    alert('品目の追加中にエラーが発生しました。');
  }
}

async function togglePurchased(id) {
  const item = items.value.find(item => item.id === id);
  if (item) {
    try {
      const res = await fetch(`${apiUrl.value}?action=updateItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // 'application/json'から変更
        },
        body: JSON.stringify({
          id: item.id,
          purchased: !item.purchased
        })
      });
      const resResult = await res;
      const result = await resResult.json();
      if (result.success) {
        await fetchData();
      } else {
        alert('品目の更新に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('品目の更新中にエラーが発生しました:', error);
      alert('品目の更新中にエラーが発生しました。');
    }
  }
}

async function removeItem(id) {
  try {
    const res = await fetch(`${apiUrl.value}?action=deleteItem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // 'application/json'から変更
      },
      body: JSON.stringify({ id: id })
    });
    const result = await res.json();
    if (result.success) {
      await fetchData();
    } else {
      alert('品目の削除に失敗しました: ' + result.error);
    }
  } catch (error) {
    console.error('品目の削除中にエラーが発生しました:', error);
    alert('品目の削除中にエラーが発生しました。');
  }
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

    <p v-if="isLoading">データを読み込み中...</p>
    <ul v-else class="shopping-list">
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