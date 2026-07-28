<script setup lang="ts">
import type { Product } from '#types/gql';
import { ProductsOrderByEnum } from '#gql/default';

const route = useRoute();
const { setProducts } = useProducts();
const { storeSettings } = useAppConfig();

const loading = ref(false);
const products = ref<Product[]>([]);

// ✅ Fonction qui interroge le BACKEND avec le terme de recherche
const fetchProducts = async () => {
  loading.value = true;
  try {
    // On construit les variables en fonction de l'URL
       const variables = {
      search: route.query.search ? String(route.query.search) : undefined,
      first: 24,
      // ✅ CORRECTION : Utilisation de 'Date' au lieu de 'Relevance' pour éviter l'erreur TS
      orderby: route.query.search ? ProductsOrderByEnum.Date : ProductsOrderByEnum.MenuOrder,
      order: 'DESC'
    };

    // Appel GraphQL avec les variables
    const { data, error } = await useAsyncGql('getProducts', variables);

    if (!error.value && data.value?.products?.nodes) {
      products.value = data.value.products.nodes as Product[];
      setProducts(products.value); // Synchronise avec l'état global pour les autres composants
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('Erreur de recherche backend:', err);
  } finally {
    loading.value = false;
  }
};

// ✅ Déclenche la recherche à chaque fois que l'URL (et donc le terme de recherche) change
watch(
  () => route.query.search,
  () => {
    fetchProducts();
  },
  { immediate: true } // Exécute au premier chargement de la page
);

useHead({
  title: route.query.search ? `Recherche : ${route.query.search}` : 'Produits',
  meta: [{ name: 'description', content: 'Découvrez nos produits' }],
});
</script>

<template>
  <main>
    <div v-if="loading" class="container flex items-center justify-center min-h-96">
      <LoadingIcon size="32" stroke="3" />
    </div>
    
    <div v-else-if="products.length > 0" class="container flex items-start gap-16">
      <Filters v-if="storeSettings.showFilters" />

      <div class="w-full">
        <div class="flex items-center justify-between w-full gap-4 mt-8 md:gap-8">
          <!-- Affiche le terme de recherche s'il y en a un -->
          <div v-if="route.query.search" class="text-lg font-semibold text-gray-800">
            Résultats pour "{{ route.query.search }}" <span class="text-gray-500 font-normal">({{ products.length }} produits)</span>
          </div>
          <ProductResultCount v-else />
          
          <OrderByDropdown v-if="storeSettings.showOrderByDropdown" class="hidden md:inline-flex" />
          <ShowFilterTrigger v-if="storeSettings.showFilters" class="md:hidden" />
        </div>
        
        <!-- Utilise la grille native de WooNuxt qui lira l'état global mis à jour par setProducts() -->
        <ProductGrid />
      </div>
    </div>
    
    <NoProductsFound v-else>
      <p class="text-xl text-gray-600 mb-2">
        {{ route.query.search ? `Aucun produit ne correspond à "${route.query.search}".` : 'Aucun produit trouvé.' }}
      </p>
      <p class="text-gray-400">
        {{ route.query.search ? 'Essayez avec d\'autres mots-clés ou vérifiez l\'orthographe.' : 'Veuillez ajuster vos filtres ou revenir plus tard.' }}
      </p>
    </NoProductsFound>
  </main>
</template>