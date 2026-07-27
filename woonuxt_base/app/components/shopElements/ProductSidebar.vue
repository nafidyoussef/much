<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Filtres de prix
const minPrice = ref(Number(route.query.min_price) || 0);
const maxPrice = ref(Number(route.query.max_price) || 10000);
const onSale = ref(route.query.on_sale === 'true');

// Appliquer les filtres
const applyFilters = () => {
  const query: any = { ...route.query };
  
  if (minPrice.value > 0) query.min_price = minPrice.value;
  else delete query.min_price;
  
  if (maxPrice.value < 10000) query.max_price = maxPrice.value;
  else delete query.max_price;
  
  if (onSale.value) query.on_sale = 'true';
  else delete query.on_sale;
  
  router.push({ query });
};

// Réinitialiser les filtres
const resetFilters = () => {
  minPrice.value = 0;
  maxPrice.value = 10000;
  onSale.value = false;
  router.push({ path: route.path });
};
</script>

<template>
  <aside class="bg-white p-4 rounded-xl border border-gray-200">
    <h3 class="font-semibold text-gray-900 mb-4">Filtres</h3>
    
    <!-- Filtre Prix -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Prix (DH)</h4>
      <div class="flex gap-2">
        <input 
          v-model.number="minPrice" 
          type="number" 
          placeholder="Min"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4f24]/20 focus:border-[#ff4f24] outline-none"
        />
        <input 
          v-model.number="maxPrice" 
          type="number" 
          placeholder="Max"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4f24]/20 focus:border-[#ff4f24] outline-none"
        />
      </div>
    </div>
    
    <!-- Filtre Promo -->
    <div class="mb-6">
      <label class="flex items-center gap-2 cursor-pointer">
        <input 
          v-model="onSale" 
          type="checkbox"
          class="w-4 h-4 text-[#ff4f24] border-gray-300 rounded focus:ring-[#ff4f24]"
        />
        <span class="text-sm text-gray-700">En promotion uniquement</span>
      </label>
    </div>
    
    <!-- Boutons -->
    <div class="flex gap-2">
      <button 
        @click="applyFilters"
        class="flex-1 px-4 py-2 bg-[#ff4f24] text-white text-sm font-medium rounded-lg hover:bg-[#ff4f24]/90 transition-colors"
      >
        Appliquer
      </button>
      <button 
        @click="resetFilters"
        class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        Reset
      </button>
    </div>
  </aside>
</template>