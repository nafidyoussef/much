<script setup>
import { useRouter } from 'vue-router'; // ✅ 1. Importer le routeur

const router = useRouter();
const { getSearchQuery, setSearchQuery, clearSearchQuery } = useSearching();
const searchQuery = ref(getSearchQuery());

const reset = () => {
  clearSearchQuery();
  searchQuery.value = '';
};

watch(
  () => getSearchQuery(),
  (value) => {
    if (!value) reset();
  },
);

const handleSubmit = () => {
  // ✅ 2. Empêcher la recherche si le champ est vide ou ne contient que des espaces
  if (!searchQuery.value.trim()) return;

  // 3. Mettre à jour l'état global (pour la cohérence avec le reste de l'app)
  setSearchQuery(searchQuery.value);

  // ✅ 4. FORCER la redirection vers la page globale des produits
  router.push({
    path: '/products',
    query: { search: searchQuery.value.trim() }
  });
};
</script>

<template>
  <form class="relative flex items-center w-full max-w-3xl mx-auto lg:mx-0" @submit.prevent="handleSubmit">
    <!-- Champ de saisie -->
    <input
      id="product-search-input"
      v-model="searchQuery"
      type="text"
      placeholder="Chercher parmi plus de 1 700 produits"
      class="w-full h-12 pl-5 pr-12 text-base text-gray-700 border-2 border-[#ff4f24] rounded-full bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-400 transition-all"
    />
    
    <!-- Bouton de recherche (Intégré à droite) -->
    <button 
      type="submit" 
      class="absolute right-1.5 flex items-center justify-center w-9 h-9 bg-[#ff4f24] text-white rounded-full hover:bg-[#ff4f24]/90 transition-colors shadow-sm"
      aria-label="Rechercher"
    >
      <Icon name="ion:search" size="20" />
    </button>

    <!-- Bouton pour effacer (apparaît si du texte est saisi) -->
    <button
      v-if="searchQuery"
      type="button"
      class="absolute right-12 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      @click="reset"
      aria-label="Effacer"
    >
      <Icon name="ion:close-circle" size="20" />
    </button>
  </form>
</template>