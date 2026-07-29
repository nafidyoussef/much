<script setup lang="ts">
import type { Product } from '#types/gql';
import { ProductsOrderByEnum } from '#gql/default';
import { useRouter } from 'vue-router';
const hasLoadedOnce = ref(false);

const route = useRoute();
const router = useRouter();
const { storeSettings } = useAppConfig();

const { cache, save, isValid, clear } = useProductCache();

const routeSlug = route.params.slug ?? route.params.categorySlug;
const slug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;

const products = ref<Product[]>([]);
const allFetchedProducts = ref<Product[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasNextPage = ref(true);
const endCursor = ref<string | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);

let currentCategoryId: number | null = null;
let allCategories: any[] = [];

if (slug) {
  const { data: categoryData } = await useAsyncGql('getCategoryWithChildren', { slug });
  currentCategoryId = categoryData.value?.current?.nodes?.[0]?.databaseId || null;
  allCategories = categoryData.value?.all?.nodes || [];
}

const subcategories = computed(() => {
  if (!currentCategoryId) return [];
  return allCategories.filter(
    (cat: any): cat is { 
      databaseId: number; 
      name: string; 
      slug: string; 
      image?: { sourceUrl?: string | null; altText?: string | null } | null; 
    } =>
      cat.parentDatabaseId === currentCategoryId && !!cat.slug
  );
});

const categorySliderRef = ref<HTMLElement | null>(null);
const scrollSubcategories = (direction: 'left' | 'right') => {
  if (!categorySliderRef.value) return;
  const scrollAmount = categorySliderRef.value.clientWidth * 0.8;
  categorySliderRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  });
};

const getProductsQuery = `
  query getProducts(
    $after: String
    $slug: [String]
    $first: Int
    $onSale: Boolean
    $orderby: ProductsOrderByEnum!
    $order: OrderEnum
    $taxonomyFilter: ProductTaxonomyInput
  ) {
    products(
      first: $first
      after: $after
      where: { 
        categoryIn: $slug
        visibility: VISIBLE
        status: "publish"
        onSale: $onSale
        orderby: { field: $orderby, order: $order }
        taxonomyFilter: $taxonomyFilter
      }
    ) {
      pageInfo { hasNextPage endCursor }
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
    regularPrice
    rawRegularPrice: regularPrice(format: RAW)
    salePrice
    rawSalePrice: salePrice(format: RAW)
    onSale
    stockStatus
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: LARGE)
    }
  }

  fragment VariableProduct on VariableProduct {
    __typename
    name
    slug
    type
    price
    regularPrice
    rawRegularPrice: regularPrice(format: RAW)
    salePrice
    rawSalePrice: salePrice(format: RAW)
    onSale
    stockStatus
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: LARGE)
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
      productCardSourceUrl: sourceUrl(size: LARGE)
    }
  }
`;

const buildVariables = (afterCursor: string | null = null, first: number = 50) => {
  const variables: any = {
    slug: slug ? [slug] : undefined,
    orderby: ProductsOrderByEnum.MenuOrder,
    order: 'DESC',
    first,
    after: afterCursor
  };

  if (route.query.orderby) {
    const orderField = String(route.query.orderby).toUpperCase();
    if (orderField === 'DATE') variables.orderby = ProductsOrderByEnum.Date;
    else if (orderField === 'PRICE') variables.orderby = ProductsOrderByEnum.Price;
    else if (orderField === 'RATING') variables.orderby = ProductsOrderByEnum.Rating;
    else if (orderField === 'POPULARITY') variables.orderby = ProductsOrderByEnum.Popularity;
    else variables.orderby = ProductsOrderByEnum.MenuOrder;
  }

  if (route.query.order) {
    variables.order = String(route.query.order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  }

  if (route.query.filter) {
    const filterString = String(route.query.filter);
    const regex = /([a-zA-Z_]+)\[([^\]]+)\]/g;
    let match;
    
    while ((match = regex.exec(filterString)) !== null) {
      const key = match[1] || '';
      const value = match[2] || '';
      
      if (key === 'sale') {
        variables.onSale = value === 'true';
      } else if (key.startsWith('pa_')) {
        const taxonomyName = key.toUpperCase();
        const terms = value.split(',');
        if (!variables.taxonomyFilter) {
          variables.taxonomyFilter = { and: [] };
        }
        variables.taxonomyFilter.and.push({
          taxonomy: taxonomyName,
          terms: terms,
          field: 'SLUG'
        });
      }
    }
  }

  if (route.query.on_sale === 'true') variables.onSale = true;
  return variables;
};

const filterProductsByPrice = (productsList: Product[]) => {
  const filterString = route.query.filter ? String(route.query.filter) : '';
  const priceMatch = /price\[([^\]]+)\]/.exec(filterString);
  
  if (!priceMatch) return productsList;
  
  const priceRange = priceMatch[1] || '';
  const prices = priceRange.includes(',') ? priceRange.split(',') : priceRange.split('-');
  
  if (prices.length < 2) return productsList;
  
  const minPrice = Number(prices[0]);
  const maxPrice = Number(prices[1]);
  
  return productsList.filter(product => {
    const price = Number(product.rawPrice || product.rawSalePrice || 0);
    return price >= minPrice && price <= maxPrice;
  });
};

const fetchProducts = async (append = false) => {
  if (!append && isValid.value) {
    products.value = cache.value.products;
    allFetchedProducts.value = cache.value.products;
    endCursor.value = cache.value.endCursor;
    hasNextPage.value = cache.value.hasNextPage;
    loading.value = false;
    hasLoadedOnce.value = true; // ✅ Marquer comme chargé
    
    await nextTick();
    if (import.meta.client) {
      window.scrollTo({ top: cache.value.scrollY, behavior: 'auto' });
    }
    
    setupObserver();
    return;
  }

  if (loading.value || loadingMore.value) return;
  
  if (append) loadingMore.value = true;
  else loading.value = true;

  try {
    const cursor = append ? endCursor.value : null;
    const variables = buildVariables(cursor, 50);

    const response = await $fetch<any>('https://bazzaria.ma/graphql', {
      method: 'POST',
      body: { query: getProductsQuery, variables }
    });

    const newProducts = response?.data?.products?.nodes || [];
    const pageInfo = response?.data?.products?.pageInfo;

    if (append) {
      allFetchedProducts.value = [...allFetchedProducts.value, ...newProducts];
    } else {
      allFetchedProducts.value = newProducts;
    }
    
    const filteredProducts = filterProductsByPrice(allFetchedProducts.value);
    products.value = filteredProducts;
    
    endCursor.value = pageInfo?.endCursor || null;
    hasNextPage.value = pageInfo?.hasNextPage ?? false;
    hasLoadedOnce.value = true; // ✅ Marquer comme chargé

    save(products.value, endCursor.value, hasNextPage.value);

  } catch (err) {
    console.error('Erreur chargement produits:', err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

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

const checkAndRedirectSearch = () => {
  if (route.query.search) {
    router.replace({
      path: '/products',
      query: { search: route.query.search }
    });
    return true;
  }
  return false;
};

onMounted(async () => {
  if (checkAndRedirectSearch()) return;
  await fetchProducts(false);
  await nextTick();
  setupObserver();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (route.path === '/products') return;
    if (checkAndRedirectSearch()) return;

    if (newPath !== oldPath) {
      clear();
    }

    endCursor.value = null;
    hasNextPage.value = true;
    products.value = [];
    allFetchedProducts.value = [];
    
    await fetchProducts(false);
    await nextTick();
    setupObserver();
  }
);

useHead({
  title: slug ? `${slug} - Produits` : 'Produits',
  meta: [{ name: 'description', content: 'Découvrez nos produits' }],
});
</script>

<template>
  <main>
    <!-- 🔄 1. SPINNER INITIAL (Uniquement au TOUT PREMIER chargement) -->
    <div v-if="loading && !hasLoadedOnce" class="container flex flex-col items-center justify-center min-h-[60vh]">
      <div class="w-12 h-12 border-4 border-[#ff4f24]/20 border-t-[#ff4f24] rounded-full animate-spin mb-4"></div>
      <p class="text-gray-500 font-medium animate-pulse">Chargement des produits...</p>
    </div>

    <!-- ✅ 2. CONTENU PRINCIPAL (Skeleton Loader + Contenu réel) -->
    <div v-else class="container">
      
      <!-- Slider des sous-catégories (Toujours visible) -->
      <div v-if="subcategories.length" class="bg-white/95 backdrop-blur-md border-b border-gray-100 -mx-1 px-2 md:mx-0 md:px-0 py-3 md:py-4 mb-1 group">
        <div class="relative">
          <button
            @click="scrollSubcategories('left')"
            class="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div ref="categorySliderRef" class="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide px-1 md:px-4">
            <NuxtLink
              v-for="cat in subcategories"
              :key="cat.databaseId"
              :to="`/product-category/${cat.slug}`"
              class="flex-shrink-0 flex items-center gap-2 px-1.5 py-1.5 pr-4 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full whitespace-nowrap transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
                <img 
                  v-if="cat.image?.sourceUrl" 
                  :src="cat.image.sourceUrl" 
                  :alt="cat.image?.altText ?? cat.name ?? 'Category'" 
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span>{{ cat.name }}</span>
            </NuxtLink>
          </div>

          <button
            @click="scrollSubcategories('right')"
            class="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-start gap-10">
        <Filters v-if="storeSettings.showFilters" :hide-categories="true" />

        <div class="w-full">
          <div class="flex items-center justify-between w-full gap-4 mt-8 md:gap-8">
            <div class="text-sm text-gray-500">
              <span class="font-semibold text-gray-900">{{ products.length }}</span> produits affichés
            </div>
            <OrderByDropdown v-if="storeSettings.showOrderByDropdown" class="hidden md:inline-flex" />
            <ShowFilterTrigger v-if="storeSettings.showFilters" class="md:hidden" />
          </div>
          
          <!-- ✅ SKELETON LOADER (S'affiche lors des rechargements) -->
          <div v-if="loading && hasLoadedOnce" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            <div v-for="i in 8" :key="`skeleton-${i}`" class="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
              <div class="aspect-[8/9] bg-gray-200 rounded-lg mb-3"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          <!-- Grille de produits réels -->
          <div v-else-if="products.length > 0" class="product-grid mt-6">
            <ProductCard 
              v-for="(node, i) in products" 
              :key="node.id || `product-${i}`" 
              :node 
              :index="i" 
            />
          </div>

          <!-- Sentinel pour le scroll infini -->
          <div ref="sentinelRef" class="flex flex-col items-center justify-center py-12 mt-8">
            <div v-if="loadingMore" class="flex items-center gap-3">
              <div class="w-8 h-8 border-4 border-[#ff4f24]/20 border-t-[#ff4f24] rounded-full animate-spin"></div>
              <span class="text-gray-500 text-sm font-medium">Chargement de plus de produits...</span>
            </div>
            <div v-else-if="!hasNextPage && products.length > 0" class="text-center">
              <p class="text-gray-400 text-sm">Tous les produits ont été chargés</p>
            </div>
          </div>

          <!-- État vide -->
          <div v-if="!loading && hasLoadedOnce && products.length === 0" class="text-center py-16">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-xl text-gray-600 font-medium">Aucun produit trouvé dans cette catégorie.</p>
            <p class="text-gray-400 mt-2">Veuillez ajuster vos filtres ou revenir plus tard.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}
</style>