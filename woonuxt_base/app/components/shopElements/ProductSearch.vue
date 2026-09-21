<script setup>
// ✅ 1. Import du composable de tracking (si l'auto-import ne fonctionne pas, décommentez la ligne)
// import { useTracking } from '~/composables/useTracking';

const { getSearchQuery, setSearchQuery, clearSearchQuery } = useSearching();
const { track } = useTracking(); // ✅ 2. Initialisation

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
  // ✅ 3. Nettoyer la requête (enlever les espaces avant/après)
  const query = searchQuery.value.trim();

  // ✅ 4. Ne tracker que si la recherche fait au moins 2 caractères
  if (query.length > 1) {
    track('search', null, {
      search_term: query
    });
    console.log('🔍 GA4 search tracked:', query);
  }

  // ✅ 5. Déclencher la recherche (même si c'est 1 caractère, on laisse le site gérer)
  setSearchQuery(query);
};
</script>

<template>
  <form class="relative flex items-center w-full max-w-3xl mx-auto lg:mx-0" @submit.prevent="handleSubmit">
    <!-- Champ de saisie -->
    <input
      id="product-search-input"
      v-model="searchQuery"
      type="text"
      placeholder="Chercher parmi plus de 4800 produits"
      class="w-full h-10 pl-5 pr-12 text-base text-gray-700 border-1 border-[#ff4f24] rounded-full bg-gray-50 focus:bg-white focus:outline-none placeholder-text-12 placeholder:text-gray-400 transition-all"
    />
    
    <!-- Bouton de recherche (Intégré à droite) -->
    <button 
      type="submit" 
      class="absolute right-0.5 flex items-center justify-center w-9 h-9 bg-[#ff4f24] text-white rounded-full hover:bg-[#ff4f24]/90 transition-colors shadow-sm"
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