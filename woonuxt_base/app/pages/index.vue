<script lang="ts" setup>
import type { Product } from '#types/gql';

const { siteName, description, shortDescription, siteImage } = useAppConfig();

// ==========================================
// 0. OPTIMISATION FCP : Preconnect à l'API
// ==========================================
useHead({
  link: [
    { rel: 'preconnect', href: 'https://api.much.ma' },
    // Si vous utilisez le reverse proxy Nuxt, remplacez par : { rel: 'preconnect', href: window.location.origin }
  ]
});

// ==========================================
// 1. Récupération des données initiales
// ==========================================
// On garde useAsyncGql car il est bon pour le SSR, mais on s'assure qu'il est rapide
const { data: newInData } = await useAsyncGql('getNewInProducts', { 
  category: 'mode' 
});
const newInProducts = computed<Product[]>(() => 
  (newInData.value?.products?.nodes as Product[] | undefined) ?? []
);

// ==========================================
// 2. Logique des onglets de catégories
// ==========================================
const categories = [
  { slug: 'all', name: 'Tout' },
  { slug: 'maison', name: 'Maison' },
  { slug: 'cuisine', name: 'Cuisine' },
  { slug: 'tech', name: 'Tech' },
  { slug: 'beaute', name: 'Beauté' },
  { slug: 'mode', name: 'Mode' },
  { slug: 'auto', name: 'Auto' },
  { slug: 'kids', name: 'Kids' },
  { slug: 'sport', name: 'Sport' },
];

const activeCategory = ref('all');

// ==========================================
// 3. Variables pour le chargement
// ==========================================
const productsPerPage = 12;
const loading = ref(false);
const hasMore = ref(true);
const allProducts = ref<Product[]>([]);
const endCursor = ref<string | null>(null);

// ==========================================
// 4. Fonction de chargement OPTIMISÉE
// ==========================================
const fetchProducts = async (categoryId: string, append = false) => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const variables: any = {
      first: productsPerPage,
      orderby: 'MENU_ORDER' 
    };
    
    if (categoryId !== 'all') {
      variables.slug = [categoryId]; 
    }
    
    if (append && endCursor.value) {
      variables.after = endCursor.value;
    }

    // ✅ REQUÊTE GRAPHQL CORRIGÉE AVEC FRAGMENTS EN LIGNE
 // ✅ REQUÊTE GRAPHQL CORRIGÉE
// ✅ REQUÊTE GRAPHQL CORRIGÉE - VERSION FINALE
const query = `query getProducts($after: String, $slug: [String], $first: Int = 10, $orderby: ProductsOrderByEnum = MENU_ORDER, $order: OrderEnum = DESC, $onSale: Boolean, $minPrice: Float, $maxPrice: Float, $taxonomyFilter: ProductTaxonomyInput) {
  products(
    first: $first
    after: $after
    where: {
      categoryIn: $slug
      visibility: VISIBLE
      status: "publish"
      onSale: $onSale
      minPrice: $minPrice
      maxPrice: $maxPrice
      orderby: { field: $orderby, order: $order }
      taxonomyFilter: $taxonomyFilter
    }
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
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
        rawRegularPrice: regularPrice(format: RAW) # ✅ ICI
        salePrice
        rawSalePrice: salePrice(format: RAW)       # ✅ ICI
      }
    }
  }
}`;

    const GQL_HOST = process.env.GQL_HOST || 'https://api.much.ma/graphql';

    const response = await $fetch(GQL_HOST, {
      method: 'POST',
      body: { query, variables, operationName: 'getProducts' },
      cache: 'no-store' 
    });

    const data = response as any;
    const newProducts = data?.data?.products?.nodes || [];
    const pageInfo = data?.data?.products?.pageInfo;
    
    if (append) {
      allProducts.value = [...allProducts.value, ...newProducts];
    } else {
      allProducts.value = newProducts;
    }
    
    endCursor.value = pageInfo?.endCursor || null;
    hasMore.value = pageInfo?.hasNextPage ?? (newProducts.length === productsPerPage);
    
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
  } finally {
    loading.value = false;
  }
};
const loadInitialProducts = () => {
  endCursor.value = null;
  hasMore.value = true;
  fetchProducts(activeCategory.value, false);
};

const loadMoreProducts = () => {
  fetchProducts(activeCategory.value, true);
};

const selectCategory = (slug: string) => {
  activeCategory.value = slug;
  loadInitialProducts();
};

// ==========================================
// 5. SEO
// ==========================================
useSeoMeta({
  title: `Accueil`,
  ogTitle: siteName,
  description: description,
  ogDescription: shortDescription,
  ogImage: siteImage,
  twitterCard: `summary_large_image`,
});

// ==========================================
// 6. Logique du slider Vente Flash
// ==========================================
const newInSliderRef = ref<HTMLElement | null>(null);
const scrollNewIn = (direction: 'left' | 'right') => {
  if (!newInSliderRef.value) return;
  const scrollAmount = newInSliderRef.value.clientWidth * 0.8;
  newInSliderRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  });
};

// ==========================================
// 7. Chargement initial
// ==========================================
onMounted(() => {
  loadInitialProducts();
});
</script>

<template>
  <main class="min-h-screen mb-10">
    <!-- 💡 ASSUREZ-VOUS QUE VOTRE COMPOSANT HeroBanner utilise loading="eager" et fetchpriority="high" sur son image principale -->
    <HeroBanner />
    
    <!-- Section Confiance -->
    <section class="container py-6 mb-2">
      <!-- ... (Votre code HTML de la section confiance reste inchangé) ... -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="grid grid-cols-2">
          <div class="flex items-center gap-3 p-2 md:p-5 border-b border-r border-gray-200">
            <div class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ff4f24]/10 flex items-center justify-center">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-[#ff4f24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="text-xs md:text-sm font-semibold text-gray-700 leading-tight whitespace-nowrap">Payez à la livraison</h3>
              <p class="text-[10px] md:text-xs text-gray-400 mt-0.5 whitespace-nowrap">Payez à la réception</p>
            </div>
          </div>
          <!-- ... (Gardez le reste de votre template exactement comme il est) ... -->
          <div class="flex items-center gap-3 p-2 md:p-3 border-b border-gray-200">
            <div class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ff4f24]/10 flex items-center justify-center">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-[#ff4f24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l8 9-8 9-8-9z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xs md:text-sm font-semibold text-gray-700 leading-tight whitespace-nowrap">Livraison nationale</h3>
              <p class="text-[10px] md:text-xs text-gray-400 mt-0.5 whitespace-nowrap">Partout au Maroc</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-2 md:p-3 border-r border-gray-200">
            <div class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ff4f24]/10 flex items-center justify-center">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-[#ff4f24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 class="text-xs md:text-sm font-semibold text-gray-700 leading-tight whitespace-nowrap">Retours simplifiés</h3>
              <p class="text-[10px] md:text-xs text-gray-400 mt-0.5 whitespace-nowrap">Assistance réactive</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-2 md:p-3">
            <div class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ff4f24]/10 flex items-center justify-center">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-[#ff4f24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xs md:text-sm font-semibold text-gray-700 leading-tight whitespace-nowrap">Support local</h3>
              <p class="text-[10px] md:text-xs text-gray-400 mt-0.5 whitespace-nowrap">Une équipe à votre écoute</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 1 : Explorez nos univers -->
    <section class="container py-4 md:py-6">
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h2 class="text-xl md:text-2xl font-medium text-gray-900">Explorez nos univers</h2>
      </div>
      <!-- ... (Gardez votre grille de catégories exacte ici) ... -->
      <div class="grid grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 lg:gap-3">
        <NuxtLink to="/product-category/maison" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#e8e6f7] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Maison</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 19 DH</small>
          </div>
        </NuxtLink>
        <!-- ... (Copiez-collez le reste de vos NuxtLink de catégories ici sans changement) ... -->
         <NuxtLink to="/product-category/cuisine" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#f5f0e1] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 11c0-2 1-4 2-5s2-2 3-2 2 1 3 2 2 3 2 5M5 11h14M7 11v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Cuisine</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 39 DH</small>
          </div>
        </NuxtLink>
        <NuxtLink to="/product-category/tech" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#dbe9f7] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Tech</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 29 DH</small>
          </div>
        </NuxtLink>
        <NuxtLink to="/product-category/beaute" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#f7e6ee] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Beauté</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 29 DH</small>
          </div>
        </NuxtLink>
        <NuxtLink to="/product-category/mode" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#ede6f7] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l8 9-8 9-8-9z" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Mode</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 29 DH</small>
          </div>
        </NuxtLink>
        <NuxtLink to="/product-category/auto" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#e1f0e8] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Auto</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 19 DH</small>
          </div>
        </NuxtLink>
        <NuxtLink to="/product-category/kids" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#f7f0d6] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <path stroke-linecap="round" d="M8 14s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="10" r="1" fill="currentColor" />
              <circle cx="15" cy="10" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Kids</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 29 DH</small>
          </div>
        </NuxtLink>
        <NuxtLink to="/product-category/sport" class="group flex flex-col items-center text-center gap-2">
          <div class="w-16 h-16 rounded-full bg-[#e6eef2] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
            </svg>
          </div>
          <div>
            <strong class="block text-[10px] md:text-xs lg:text-[11px] font-medium text-gray-800 leading-tight whitespace-nowrap">Sport</strong>
            <small class="text-[9px] md:text-[10px] lg:text-[10px] text-gray-500 whitespace-nowrap">Dès 39 DH</small>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- SECTION 2 : Vente Flash -->
    <section v-if="newInProducts.length" class="container py-4 md:py-10">
      <!-- ... (Gardez votre code de section Vente Flash exact ici) ... -->
      <div class="relative overflow-hidden bg-gradient-to-br from-[#ff4f24]/5 via-white to-white border border-[#ff4f24] rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-[#ff4f24]/10 rounded-full blur-2xl pointer-events-none hidden md:block"></div>
        <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-[#ff4f24]/15 rounded-full blur-2xl pointer-events-none hidden md:block"></div>

        <div class="relative flex flex-row justify-between items-start md:items-center mb-2 md:mb-4 gap-3 px-4 pt-4 md:px-6 md:pt-6 bg-[#ff4f24]/10">
          <div class="flex items-center gap-2">
            <div class="flex-shrink-0 w-7 h-7 mb-2 bg-[#ff4f24] rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm md:text-base font-bold text-gray-900 mb-2">Vente flash</h3>
              <div class="flex mb-2 gap-1">
                <span class="bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">02</span>
                <span class="bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">18</span>
                <span class="bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">44</span>
              </div>
            </div>
          </div>
          
          <NuxtLink class="flex-shrink-0 ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#ff4f24] hover:text-[#ff4f24]/80 transition-colors group/link" to="/product-category/new">
            Voir les offres
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <div class="relative group/slider">
          <div ref="newInSliderRef" class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2 px-4 md:px-6 scrollbar-hide">
            <div v-for="(product, index) in newInProducts" :key="product.databaseId || product.id" class="w-[38%] sm:w-[33.333%] md:w-[25%] lg:w-[20%] flex-shrink-0 snap-start">
              <!-- 💡 ASTUCE FCP : Assurez-vous que ProductCardMini a loading="eager" pour les 2-3 premiers éléments -->
              <ProductCardMini :node="product" :index="index" />
            </div>
          </div>

          <button @click="scrollNewIn('left')" class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-7 h-7 bg-white border border-[#ff4f24]/20 text-[#ff4f24] rounded-full shadow-sm hover:bg-[#ff4f24]/5 hover:border-[#ff4f24]/30 transition-all opacity-0 group-hover/slider:opacity-100" aria-label="Scroll left">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button @click="scrollNewIn('right')" class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-7 h-7 bg-white border border-[#ff4f24]/20 text-[#ff4f24] rounded-full shadow-sm hover:bg-[#ff4f24]/5 hover:border-[#ff4f24]/30 transition-all opacity-0 group-hover/slider:opacity-100" aria-label="Scroll right">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- SECTION 3 : Recommandé (ONGLETS + LOAD MORE) -->
    <section class="container py-4 bg-gray-50/50 rounded-2xl px-4 md:px-6 mb-8">
      <div class="mb-6">
        <p class="text-xs font-bold text-[#ff4f24] uppercase tracking-wide mb-2">RECOMMANDÉ POUR VOUS</p>
        <h2 class="text-2xl md:text-3xl font-medium text-gray-900 mb-2">Encore plus de bons plans</h2>
      </div>

      <!-- Onglets de catégories -->
      <div class="flex flex-wrap justify-end gap-2 md:gap-2 mb-8">
        <button
          v-for="category in categories"
          :key="category.slug"
          @click="selectCategory(category.slug)"
          :disabled="loading"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border disabled:opacity-50 disabled:cursor-wait"
          :class="activeCategory === category.slug 
            ? 'bg-[#ff4f24] text-white border-[#ff4f24] shadow-sm shadow-[#ff4f24]/20' 
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff4f24]/30 hover:bg-[#ff4f24]/5'"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- SKELETON LOADER -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div v-for="i in 8" :key="`skeleton-${i}`" class="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
          <div class="aspect-[8/9] bg-gray-200 rounded-lg mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Grille de produits -->
      <div v-else-if="allProducts.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <ProductCard 
          v-for="product in allProducts" 
          :key="product.databaseId || product.id"
          :node="product"
        />
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
        <p class="text-gray-500">Aucun produit trouvé dans cette catégorie pour le moment.</p>
      </div>

      <!-- BOUTON LOAD MORE -->
      <div v-if="hasMore && allProducts.length > 0" class="flex justify-center mt-10">
        <button
          @click="loadMoreProducts"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-8 py-3 bg-[#ff4f24] text-white font-semibold rounded-full shadow-lg shadow-[#ff4f24]/20 hover:bg-[#ff4f24]/90 hover:shadow-xl hover:shadow-[#ff4f24]/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          
          <span v-if="loading">Chargement...</span>
          
          <template v-else>
            <span>Charger plus de produits</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </template>
        </button>
      </div>

      <!-- Message "Tous les produits chargés" -->
      <div v-else-if="!hasMore && allProducts.length > 0" class="text-center mt-8">
        <p class="text-sm text-gray-400">Tous les produits ont été chargés</p>
      </div>
    </section>
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

:deep(.hero-overlay),
:deep(.hero-banner::after),
:deep([class*="hero"] .overlay),
:deep([class*="hero"] .gradient) {
  background: transparent !important;
  background-image: none !important;
  display: none !important;
}
</style>