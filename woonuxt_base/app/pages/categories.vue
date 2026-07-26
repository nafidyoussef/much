<script lang="ts" setup>
// ✅ Réutilise la requête getProductCategories qui fonctionne déjà
const { data } = await useAsyncGql('getProductCategories', { first: 12 });
const categories = data.value?.productCategories?.nodes || [];

useHead({
  title: 'Nos Catégories',
  meta: [{ name: 'description', content: 'Explorez toutes nos catégories de produits' }],
});
</script>

<template>
  <main class="min-h-screen bg-white">
    <div class="container py-8 md:py-12 text-center">
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Explorez nos Univers</h1>
    </div>

    <!-- ✅ Chaque catégorie est un composant indépendant qui charge ses propres produits -->
    <CategorySection
      v-for="(category, index) in categories"
      :key="category.databaseId || category.id"
      :category="category"
      :theme-index="index"
    />

    <div v-if="!categories.length" class="container py-20 text-center text-gray-500">
      <p class="text-lg">Aucune catégorie trouvée.</p>
    </div>
  </main>
</template>