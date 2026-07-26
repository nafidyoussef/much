<script setup lang="ts">
import type { Product } from '#types/gql';
import { ProductsOrderByEnum } from '#gql/default'; // ✅ 1. Importer l'enum

const { setProducts, updateProductList } = useProducts();
const { isQueryEmpty } = useHelpers();
const { storeSettings } = useAppConfig();
const route = useRoute();

// 1. Récupérer le slug de l'URL
const routeSlug = route.params.slug ?? route.params.categorySlug;
const slug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;

// 2. Récupérer les produits de cette catégorie TRIÉS PAR ORDRE DU MENU
const { data, error, status } = await useAsyncGql('getProducts', {
  slug: slug ? [slug] : undefined,
  // ✅ 2. Utiliser l'enum généré au lieu d'une chaîne de caractères
  orderby: ProductsOrderByEnum.MenuOrder, 
});

const productsInCategory = computed<Product[]>(() => (data.value?.products?.nodes ?? []) as Product[]);
const isLoading = computed<boolean>(() => status.value === 'idle' || status.value === 'pending');
const hasError = computed<boolean>(() => Boolean(error.value));

// 3. Récupérer la catégorie actuelle ET toutes les catégories
let currentCategoryId: number | null = null;
let allCategories: any[] = [];

if (slug) {
  const { data: categoryData } = await useAsyncGql('getCategoryWithChildren', { slug });
  currentCategoryId = categoryData.value?.current?.nodes?.[0]?.databaseId || null;
  allCategories = categoryData.value?.all?.nodes || [];
}

// 4. Filtrer pour trouver les sous-catégories
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

// 5. Gestion du slider de sous-catégories
const categorySliderRef = ref<HTMLElement | null>(null);

const scrollSubcategories = (direction: 'left' | 'right') => {
  if (!categorySliderRef.value) return;
  const scrollAmount = categorySliderRef.value.clientWidth * 0.8;
  categorySliderRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  });
};

// 6. Synchronisation avec le state global de WooNuxt
watchEffect(() => {
  setProducts(productsInCategory.value);
});

onMounted(() => {
  if (!isQueryEmpty.value) updateProductList();
});

watch(
  () => route.query,
  () => {
    if (!['product-category-slug', 'product-category-page', 'product-category-page-pager'].includes(String(route.name))) return;
    updateProductList();
  },
);

useHead({
  title: slug ? `${slug} - Produits` : 'Produits',
  meta: [{ name: 'description', content: 'Découvrez nos produits' }],
});
</script>
<template>
  <!-- État de chargement -->
  
  <div v-if="isLoading" class="container flex items-center justify-center min-h-96">
    <LoadingIcon size="32" stroke="3" />
  </div>

  <!-- Contenu principal : s'affiche s'il y a des produits OU des sous-catégories -->
  <div v-else-if="productsInCategory.length || subcategories.length" class="container">
    
    <!-- 🏷️ Slider des sous-catégories (STICKY sous le header avec images) sticky top-18 z-30  -->
    <div v-if="subcategories.length" class="bg-white/95 backdrop-blur-md border-b border-gray-100 -mx-1 px-2 md:mx-0 md:px-0 py-3 md:py-4 mb-1 group">
      <div class="relative">
        
        <!-- Flèche gauche -->
        <button
          @click="scrollSubcategories('left')"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Liste des sous-catégories avec images -->
        <div
          ref="categorySliderRef"
          class="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide px-1 md:px-4"
        >
          <NuxtLink
            v-for="cat in subcategories"
            :key="cat.databaseId"
            :to="`/product-category/${cat.slug}`"
            class="flex-shrink-0 flex items-center gap-2 px-1.5 py-1.5 pr-4 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full whitespace-nowrap transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5"
          >
            <!-- Petite image ronde de la catégorie -->
            <div class="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
              <img 
                v-if="cat.image?.sourceUrl" 
                :src="cat.image.sourceUrl" 
                :alt="cat.image?.altText ?? cat.name ?? 'Category'" 
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <!-- Fallback SVG si pas d'image -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            
            <!-- Nom de la catégorie -->
            <span>{{ cat.name }}</span>
          </NuxtLink>
        </div>

        <!-- Flèche droite -->
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

    <!-- Section Filtres et Grille de produits -->
    <div class="flex items-start gap-10">
      <Filters v-if="storeSettings.showFilters" :hide-categories="true" />

      <div class="w-full">
        <div class="flex items-center justify-between w-full gap-4 mt-8 md:gap-8">
          <ProductResultCount />
          <OrderByDropdown v-if="storeSettings.showOrderByDropdown" class="hidden md:inline-flex" />
          <ShowFilterTrigger v-if="storeSettings.showFilters" class="md:hidden" />
        </div>
        <ProductGrid />
      </div>
    </div>
  </div>

  <!-- États d'erreur ou vide -->
  <NoProductsFound v-else-if="hasError">Products could not be loaded. Please refresh or try again in a moment.</NoProductsFound>
  <NoProductsFound v-else>No products or subcategories found here. Please try adjusting your filters or check back later.</NoProductsFound>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>