<script setup lang="ts">
import { ref, watch, computed, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { storeSettings } = useAppConfig();

const products = ref<any[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasSearched = ref(false);
const hasNextPage = ref(false);
const endCursor = ref<string | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);

const currentSearch = computed(() => (route.query.search as string) || '');

// ✅ Requête GraphQL avec support de la pagination (after cursor)
const searchQueryGql = `
  query SearchProducts($search: String, $first: Int, $after: String) {
    products(
      first: $first
      after: $after
      where: { 
        search: $search
        visibility: VISIBLE
      }
    ) {
      pageInfo { 
        hasNextPage 
        endCursor 
      }
      nodes {
        __typename
        name
        slug
        type
        databaseId
        id
        averageRating
        reviewCount
        ...SimpleProduct
        ...VariableProduct
        ...ExternalProduct
      }
    }
  }

  fragment SimpleProduct on SimpleProduct {
    __typename
    name
    slug
    type
    price
    rawPrice: price(format: RAW)
    regularPrice
    rawRegularPrice: regularPrice(format: RAW)
    salePrice
    rawSalePrice: salePrice(format: RAW)
    onSale
    stockStatus
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
    }
  }

  fragment VariableProduct on VariableProduct {
    __typename
    name
    slug
    type
    price
    rawPrice: price(format: RAW)
    regularPrice
    rawRegularPrice: regularPrice(format: RAW)
    salePrice
    rawSalePrice: salePrice(format: RAW)
    onSale
    stockStatus
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
    }
  }

  fragment ExternalProduct on ExternalProduct {
    __typename
    name
    slug
    type
    externalUrl
    buttonText
    price
    regularPrice
    rawRegularPrice: regularPrice(format: RAW)
    salePrice
    rawSalePrice: salePrice(format: RAW)
    onSale
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
    }
  }
`;

// ✅ Fonction de recherche avec pagination
const performBackendSearch = async (searchTerm: string, append = false) => {
  if (!searchTerm) {
    products.value = [];
    hasSearched.value = false;
    return;
  }

  if (append) loadingMore.value = true;
  else loading.value = true;

  try {
    const graphqlEndpoint = 'https://bazzaria.ma/graphql';

    const response = await $fetch<any>(graphqlEndpoint, {
      method: 'POST',
      body: {
        query: searchQueryGql,
        variables: {
          search: searchTerm,
          first: 24, // ✅ 24 produits par "page"
          after: append ? endCursor.value : null
        }
      }
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
  } catch (error) {
    console.error('Erreur de recherche backend:', error);
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
          performBackendSearch(currentSearch.value, true);
        }
      },
      { rootMargin: '500px' }
    );
    observer.observe(sentinelRef.value);
  }
};

// Debounce pour la recherche
let searchTimeout: NodeJS.Timeout;

watch(
  () => currentSearch.value,
  (newSearch) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      // Réinitialiser la pagination quand la recherche change
      endCursor.value = null;
      hasNextPage.value = false;
      products.value = [];
      
      performBackendSearch(newSearch, false).then(() => {
        nextTick(() => setupObserver());
      });
    }, 400);
  },
  { immediate: true }
);

onUnmounted(() => {
  if (observer) observer.disconnect();
});

useHead({
  title: currentSearch.value ? `Recherche : ${currentSearch.value}` : 'Tous les produits',
});
</script>

<template>
  <main class="container py-8">
    <!-- État de chargement initial -->
    <div v-if="loading && products.length === 0" class="flex items-center justify-center min-h-64">
      <div class="w-10 h-10 border-4 border-[#ff4f24]/20 border-t-[#ff4f24] rounded-full animate-spin"></div>
    </div>

    <!-- Résultats de recherche -->
    <div v-else-if="hasSearched && products.length > 0" class="flex items-start gap-16">
      <div class="w-full">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">
            Résultats pour "{{ currentSearch }}"
          </h1>
          <p class="text-gray-500 mt-1">
            {{ products.length }} produit(s) affiché(s)
            <span v-if="hasNextPage" class="text-xs">• Plus de résultats disponibles ↓</span>
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
            <span class="text-gray-500 text-sm font-medium">Chargement de plus de produits...</span>
          </div>
          <div v-else-if="!hasNextPage" class="text-center">
            <p class="text-gray-400 text-sm">Tous les produits correspondants ont été chargés</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucun résultat -->
    <div v-else-if="hasSearched && products.length === 0" class="text-center py-16">
      <p class="text-xl text-gray-600 font-medium">Aucun produit ne correspond à "{{ currentSearch }}"</p>
      <p class="text-gray-400 mt-2">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
    </div>

    <!-- Page produits par défaut -->
    <div v-else class="flex items-start gap-16">
      <Filters v-if="storeSettings.showFilters" />
      <div class="w-full">
        <ProductGrid />
      </div>
    </div>
  </main>
</template>