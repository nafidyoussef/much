<script setup lang="ts">
import { ref, watch, computed, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ProductsOrderByEnum } from '#gql/default';

const route = useRoute();
const { storeSettings } = useAppConfig();

// ✅ 1. Initialisation du Cache Intelligent
const { cache, save, isValid } = useProductCache();

const products = ref<any[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasNextPage = ref(false);
const endCursor = ref<string | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);
const hasSearched = ref(false);

const currentSearch = computed(() => (route.query.search as string) || '');
const isSearchMode = computed(() => !!currentSearch.value);

// ✅ REQUÊTE GRAPHQL OPTIMISÉE ET CORRIGÉE (Avec les prix RAW pour le badge promo)
const productsQuery = `
  query getProducts($search: String, $first: Int, $after: String, $orderby: ProductsOrderByEnum!, $order: OrderEnum) {
    products(
      first: $first
      after: $after
      where: { 
        search: $search
        visibility: VISIBLE
        orderby: { field: $orderby, order: $order }
      }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        __typename
        databaseId
        id
        name
        slug
        type
        onSale
        image {
          sourceUrl
          altText
          productCardSourceUrl: sourceUrl(size: LARGE)
        }
        ... on InventoriedProduct {
          stockStatus
        }
        ... on ProductWithPricing {
          price
          regularPrice
          rawRegularPrice: regularPrice(format: RAW) # ✅ AJOUTÉ pour le calcul du badge
          salePrice
          rawSalePrice: salePrice(format: RAW)       # ✅ AJOUTÉ pour le calcul du badge
        }
      }
    }
  }
`;
// ✅ 2. Fonction de chargement avec Gestion du Cache
const fetchProducts = async (append = false) => {
  // Si on a un cache valide pour cette URL exacte et qu'on ne fait pas un scroll infini
  if (!append && isValid.value) {
    products.value = cache.value.products;
    endCursor.value = cache.value.endCursor;
    hasNextPage.value = cache.value.hasNextPage;
    hasSearched.value = true;
    loading.value = false;
    
    // ✅ Restauration instantanée de la position du scroll (uniquement côté client)
    await nextTick();
    if (import.meta.client) {
      window.scrollTo({ top: cache.value.scrollY, behavior: 'auto' });
    }
    
    setupObserver();
    return; // On arrête ici, PAS de requête réseau !
  }

  if (loading.value || loadingMore.value) return;

  if (append) loadingMore.value = true;
  else loading.value = true;

  try {
    const GQL_HOST = process.env.GQL_HOST || 'https://api.much.ma/graphql';

    const response = await $fetch<any>(GQL_HOST, {
      method: 'POST',
      body: {
        query: productsQuery,
        variables: {
          search: isSearchMode.value ? currentSearch.value : undefined,
          first: 24,
          after: append ? endCursor.value : null,
          orderby: ProductsOrderByEnum.MenuOrder,
          order: 'DESC'
        }
      },
      cache: 'no-store'
    });

    const newProducts = response?.data?.products?.nodes || [];
    const pageInfo = response?.data?.products?.pageInfo;

    if (append) {
      products.value = [...products.value, ...newProducts];
    } else {
      products.value = newProducts;
    }

    endCursor.value = pageInfo?.endCursor || null;
    hasNextPage.value = pageInfo?.hasNextPage ?? false;
    hasSearched.value = true;

    // Sauvegarder l'état dans le cache après un chargement réussi
    save(products.value, endCursor.value, hasNextPage.value);

  } catch (error) {
    console.error('Erreur chargement produits:', error);
    if (!append) products.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// ✅ Intersection Observer pour le scroll infini
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (import.meta.client && sentinelRef.value) {
    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore.value && hasNextPage.value && !loading.value) {
          fetchProducts(true);
        }
      },
      { rootMargin: '500px' }
    );
    observer.observe(sentinelRef.value);
  }
};

// ✅ Watcher PROTÉGÉ : Ne s'exécute QUE si on est sur la page /products
watch(
  () => route.fullPath,
  async () => {
    // ✅ IMPORTANT : Si on a quitté la page /products, on ne fait RIEN
    if (route.name !== 'products') return;
    
    await fetchProducts(false);
    await nextTick();
    setupObserver();
  },
  { immediate: true }
);

onUnmounted(() => {
  if (observer) observer.disconnect();
});

useHead({
  title: isSearchMode.value ? `Recherche : ${currentSearch.value}` : 'Tous les produits',
});
</script>
<template>
  <main>
    <!-- État de chargement initial -->
    <div v-if="loading && products.length === 0" class="container flex items-center justify-center min-h-96">
      <div class="w-10 h-10 border-4 border-[#ff4f24]/20 border-t-[#ff4f24] rounded-full animate-spin"></div>
    </div>

    <!-- ✅ Contenu principal (recherche OU liste normale) -->
    <div v-else-if="products.length > 0" class="container flex items-start gap-10">
      
      <!-- Filtres (uniquement en mode liste, pas en mode recherche) -->
      <Filters v-if="!isSearchMode && storeSettings.showFilters" />

      <div class="w-full">
        <!-- En-tête -->
        <div class="flex items-center justify-between w-full gap-4 mt-8 md:gap-8">
          <div v-if="isSearchMode" class="text-lg font-semibold text-gray-800">
            Résultats pour "{{ currentSearch }}" 
            
          </div>
          
        </div>

        <!-- ✅ Grille de produits (ProductCard DIRECT) -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
          <ProductCard 
            v-for="node in products" 
            :key="node.id" 
            :node="node" 
          />
        </div>

        <!-- ✅ Sentinel pour le scroll infini -->
        <div ref="sentinelRef" class="flex flex-col items-center justify-center py-12 mt-8">
          <div v-if="loadingMore" class="flex items-center gap-3">
            <div class="w-8 h-8 border-4 border-[#ff4f24]/20 border-t-[#ff4f24] rounded-full animate-spin"></div>
            <span class="text-gray-500 text-sm font-medium">Chargement...</span>
          </div>
          <div v-else-if="!hasNextPage && products.length > 0" class="text-center">
            <p class="text-gray-400 text-sm">Tous les produits ont été chargés</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucun résultat de recherche -->
    <div v-else-if="hasSearched && isSearchMode && products.length === 0" class="container text-center py-16">
      <p class="text-xl text-gray-600 font-medium">Aucun produit ne correspond à "{{ currentSearch }}"</p>
      <p class="text-gray-400 mt-2">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
    </div>

    <!-- Aucun produit (liste normale) -->
    <NoProductsFound v-else-if="!loading && !isSearchMode">
      Aucun produit trouvé. Veuillez ajuster vos filtres ou revenir plus tard.
    </NoProductsFound>
  </main>
</template>