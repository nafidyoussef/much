<script lang="ts" setup>
import { StockStatusEnum, ProductTypesEnum, type AddToCartInput, type ProductAttributeInput } from '#gql/default';
import type { ProductDetail, Variation, VariationAttribute } from '#types/gql';
import { useRoute } from 'vue-router'

const route = useRoute();
const { storeSettings } = useAppConfig();
const { addToCart, isUpdatingCart, isAddingToCart, isOptimisticCartMode, toggleCart } = useCart();
const { frontEndUrl, getErrorMessage } = useHelpers();
const { t } = useI18n();
const { formatProduct, track } = useTracking();

const slug = route.params.slug as string;

// ✅ 1. PAS DE 'AWAIT' ICI : Cela permet au composant de rendre le Skeleton immédiatement
const { data, error, pending } = useAsyncGql('getProduct', { slug, frontEndUrl });

// On utilise un computed pour que 'product' soit réactif dès que 'data' arrive
const product = computed<ProductDetail | null>(() => data.value?.product ?? null);

const productLoadError = computed(() => 
  error.value 
    ? getErrorMessage(error.value) || `Unable to load product "${slug}" from WordPress`
    : t('shop.productNotFound')
);

const quantity = ref<number>(1);
const activeVariation = ref<Variation | null>(null);
const variation = ref<VariationAttribute[]>([]);
const attrValues = ref<ProductAttributeInput[]>([]);

// ==========================================
// Logique de gestion des variations
// ==========================================
const normalizeMatchToken = (value?: string | null): string => (value ?? '').toString().trim().toLowerCase().replace(/[\s-_]+/g, '');
const stripPaPrefix = (value?: string | null): string => (value ?? '').toString().replace(/^pa[_-]/i, '');
const normalizeMatchKey = (value?: string | null): string => normalizeMatchToken(stripPaPrefix(value));
const normalizeMatchValue = (value?: string | null): string => normalizeMatchToken(value);

type VariationSelection = Pick<VariationAttribute, 'name' | 'value'>;
const toSelectionName = (name?: string | null): string => {
  if (!name) return '';
  return name.charAt(0).toLowerCase() + name.slice(1);
};

const normalizedVariations = computed(() => {
  const nodes = product.value?.variations?.nodes ?? [];
  return nodes.map((node: Variation) => {
    const attrs: Record<string, string> = {};
    node.attributes?.nodes?.forEach((attr) => {
      const key = normalizeMatchKey(attr.name);
      if (!key) return;
      attrs[key] = normalizeMatchValue(attr.value);
    });
    const specificity = Object.values(attrs).filter(Boolean).length;
    return { variation: node, attrs, specificity };
  });
});

const findMatchingVariation = (selected: VariationSelection[]): Variation | null => {
  if (!selected?.length) return null;
  const selectedMap: Record<string, string> = {};
  selected.forEach((attr) => {
    const key = normalizeMatchKey(attr.name);
    if (!key) return;
    const value = normalizeMatchValue(attr.value);
    if (!value) return;
    selectedMap[key] = value;
  });
  if (Object.keys(selectedMap).length === 0) return null;

  let bestMatch: { variation: Variation; score: number } | null = null;
  for (const candidate of normalizedVariations.value) {
    let matches = true;
    let matchedSpecific = 0;
    for (const [key, value] of Object.entries(selectedMap)) {
      const candidateValue = candidate.attrs[key];
      if (!candidateValue) continue;
      if (candidateValue !== value) {
        matches = false;
        break;
      }
      matchedSpecific += 1;
    }
    if (!matches) continue;
    const score = matchedSpecific * 100 + candidate.specificity;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { variation: candidate.variation, score };
    }
  }
  return bestMatch?.variation ?? null;
};

const queryParams = route.query;

const findVariationById = (value?: string | number | null): Variation | null => {
  if (!value || !product.value?.variations?.nodes?.length) return null;
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (!parsed || Number.isNaN(parsed)) return null;
  return product.value?.variations?.nodes?.find((node: Variation) => node.databaseId === parsed) ?? null;
};

const buildQuerySelections = (): VariationSelection[] => {
  if (!product.value?.attributes?.nodes?.length) return [];
  const selections: VariationSelection[] = [];
  for (const attr of product.value.attributes.nodes) {
    const key = toSelectionName(attr?.name);
    if (!key) continue;
    const rawQueryValue = queryParams[key];
    if (!rawQueryValue) continue;
    const value = Array.isArray(rawQueryValue) ? rawQueryValue[0] : rawQueryValue;
    const normalizedValue = normalizeMatchValue(value);
    if (!normalizedValue) continue;
    const isValidValue = attr.scope === 'LOCAL'
      ? (attr.options ?? []).some((option: string | null) => normalizeMatchValue(option ?? '') === normalizedValue)
      : 'terms' in attr && (attr.terms?.nodes ?? []).some((term) => normalizeMatchValue(term?.slug ?? '') === normalizedValue);
    if (!isValidValue) continue;
    selections.push({ name: key, value: String(value) });
  }
  return selections;
};

const queryVariationId = queryParams.variationId ?? queryParams.variation;
const variationFromQuery = findVariationById(Array.isArray(queryVariationId) ? queryVariationId[0] : queryVariationId);

if (variationFromQuery?.attributes?.nodes?.length) {
  variation.value = variationFromQuery.attributes.nodes.map((attr: VariationAttribute) => ({
    name: attr.name || '',
    value: attr.value || '',
    attributeId: attr.attributeId ?? null,
    label: attr.label ?? attr.name ?? ''
  }));
  activeVariation.value = variationFromQuery;
} else {
  const initialSelections = buildQuerySelections();
  if (initialSelections.length > 0) {
    const matched = findMatchingVariation(initialSelections);
    if (matched?.attributes?.nodes?.length) {
      variation.value = matched.attributes.nodes.map((attr: VariationAttribute) => ({
        name: attr.name || '',
        value: attr.value || '',
        attributeId: attr.attributeId ?? null,
        label: attr.label ?? attr.name ?? ''
      }));
      activeVariation.value = matched;
    } else {
      variation.value = initialSelections.map((selection) => ({
        name: selection.name || '',
        value: selection.value || '',
        attributeId: null,
        label: selection.name || ''
      }));
    }
  }
}

const defaultAttributes = computed<{ nodes: VariationAttribute[] } | null>(() => {
  if (variation.value.length > 0) return { nodes: variation.value };
  return product.value?.defaultAttributes ? { nodes: product.value.defaultAttributes.nodes ?? [] } : null;
});

const isVariableProduct = computed<boolean>(() => product.value?.type === ProductTypesEnum.Variable);
const isExternalProduct = computed<boolean>(() => product.value?.type === ProductTypesEnum.External);

// ==========================================
// COMPUTED PROPERTIES
// ==========================================
const displayProduct = computed<ProductDetail | Variation>(() => activeVariation.value || product.value!);
const priceTarget = computed<ProductDetail | Variation>(() => activeVariation.value || product.value!);
const productImage = computed(() => product.value?.image || null);
const productGallery = computed(() => ({ nodes: product.value?.galleryImages?.nodes ?? [] }));
const averageRating = computed(() => product.value?.averageRating ?? 0);
const reviewCount = computed(() => product.value?.reviewCount ?? 0);

const selectProductInput = computed<AddToCartInput>(() => {
  const input: AddToCartInput = { productId: displayProduct.value.databaseId, quantity: quantity.value };
  if (activeVariation.value) input.variationId = activeVariation.value.databaseId;
  else if (attrValues.value.length) input.variation = attrValues.value;
  return input;
});

const stockStatus = computed(() => {
  if (isVariableProduct.value) {
    return activeVariation.value?.stockStatus ?? product.value?.stockStatus ?? StockStatusEnum.OutOfStock;
  }
  return product.value?.stockStatus ?? StockStatusEnum.OutOfStock;
});

const disabledAddToCart = computed(() => {
  const canPurchaseWithCurrentStock = stockStatus.value === StockStatusEnum.InStock || stockStatus.value === StockStatusEnum.OnBackorder;
  const isInvalidType = !displayProduct.value;
  const isCartUpdating = isOptimisticCartMode.value ? false : isUpdatingCart.value || isAddingToCart.value;
  const hasValidVariation = !isVariableProduct.value || !!activeVariation.value;
  return !canPurchaseWithCurrentStock || isCartUpdating || !hasValidVariation || isInvalidType;
});

const addToCartLoading = computed(() => (isOptimisticCartMode.value ? false : isUpdatingCart.value));

const savingsAmount = computed(() => {
  const target = priceTarget.value as any;
  if (!target?.onSale || !target?.rawRegularPrice || !target?.rawSalePrice) return 0;
  const regular = parseFloat(String(target.rawRegularPrice).replace(/[^0-9.]/g, '')) || 0;
  const sale = parseFloat(String(target.rawSalePrice).replace(/[^0-9.]/g, '')) || 0;
  return Math.max(0, regular - sale);
});

// ==========================================
// 🔥 LOGIQUE VENTE FLASH & COMPTE À REBOURS
// ==========================================
const isFlashSale = computed(() => {
  const categories = product.value?.productCategories?.nodes || [];
  return categories.some(cat => 
    cat.slug?.toLowerCase().includes('vente-flash') || 
    cat.name?.toLowerCase().includes('vente flash')
  );
});

const timeLeft = ref({ hours: 16, minutes: 50, seconds: 56 });
let timerInterval: ReturnType<typeof setInterval> | null = null;

const startFlashSaleCountdown = () => {
  let totalSeconds = (timeLeft.value.hours * 3600) + (timeLeft.value.minutes * 60) + timeLeft.value.seconds;
  
  timerInterval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      timeLeft.value.hours = Math.floor(totalSeconds / 3600);
      timeLeft.value.minutes = Math.floor((totalSeconds % 3600) / 60);
      timeLeft.value.seconds = totalSeconds % 60;
    } else {
      if (timerInterval) clearInterval(timerInterval);
    }
  }, 1000);
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
// ==========================================


// ==========================================
// TRACKING GA4
// ==========================================
let hasTrackedViewItem = false;

watch(() => displayProduct.value?.databaseId, (newId) => {
  if (newId && !hasTrackedViewItem && !pending.value) {
    const item = formatProduct(displayProduct.value!, 1);
    track('view_item', { value: item.price, items: [item] });
    hasTrackedViewItem = true;
  }
}, { immediate: true });

watch(() => route.fullPath, () => { hasTrackedViewItem = false; });

// ==========================================
// ACTIONS
// ==========================================
const handleAddToCart = async (): Promise<void> => {
  if (!product.value) return;
  const item = formatProduct(displayProduct.value, quantity.value);
  try {
    await addToCart(selectProductInput.value, { product: product.value, variation: activeVariation.value });
    track('add_to_cart', { value: item.price * quantity.value, items: [item] });
    toggleCart(true);
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
  }
};

const handleBuyNow = async (): Promise<void> => {
  if (!product.value) return;
  const item = formatProduct(displayProduct.value, quantity.value);
  try {
    await addToCart(selectProductInput.value, { product: product.value, variation: activeVariation.value });
    track('add_to_cart', { value: item.price * quantity.value, items: [item] });
    await navigateTo('/checkout');
  } catch (error) {
    console.error('Erreur lors de l\'achat immédiat:', error);
  }
};

const updateSelectedVariations = (variations: VariationAttribute[]): void => {
  if (!product.value?.variations) return;
  attrValues.value = variations.map((el) => ({ attributeName: el.name || '', attributeValue: el.value }));
  activeVariation.value = findMatchingVariation(variations);
  variation.value = variations;

  if (import.meta.client) {
    const query: Record<string, string> = {};
    variations.forEach((v) => { if (v.name && v.value) query[v.name] = v.value; });
    if (activeVariation.value?.databaseId) query.variationId = String(activeVariation.value.databaseId);
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(query).toString();
    window.history.replaceState({ ...window.history.state }, '', url.toString());
  }
};

// ==========================================
// SEO OPTIMISÉ
// ==========================================
const siteName = 'Much.ma';
const canonicalUrl = computed(() => `https://www.much.ma/product/${route.params.slug}`);
const seoTitle = computed(() => `${product.value?.name || 'Chargement...'} | Much.ma`);
const seoDescription = computed(() => `${product.value?.name || 'Découvrez nos produits'} – Much.ma : paiement à la livraison, livraison partout au Maroc`);
const seoImage = computed(() => displayProduct.value?.image?.sourceUrl || 'https://www.much.ma/images/placeholder.jpg');

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogType: 'product',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
});

const jsonLdSchema = computed(() => {
  if (!displayProduct.value || pending.value) return '';
  const rawPrice = String(displayProduct.value.price || '0').replace(/[^0-9.]/g, '');
  const price = parseFloat(rawPrice) || 0;
  const isAvailable = displayProduct.value.stockStatus === StockStatusEnum.InStock || displayProduct.value.stockStatus === StockStatusEnum.OnBackorder;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": displayProduct.value.name,
    "image": seoImage.value,
    "description": seoDescription.value,
    "sku": product.value?.sku || String(route.params.slug),
    "brand": { "@type": "Brand", "name": siteName },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl.value,
      "priceCurrency": "MAD",
      "price": price,
      "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  });
});

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
    { rel: 'dns-prefetch', href: 'https://api.much.ma' },
  ],
  script: [{ type: 'application/ld+json', innerHTML: jsonLdSchema }]
});

onMounted(() => {
  setTimeout(() => {
    const payloadData = {
      slug: route.params.slug,
      utm_source: route.query.utm_source,
      utm_campaign: route.query.utm_campaign
    };

    const blob = new Blob([JSON.stringify(payloadData)], { type: 'application/json' });
    navigator.sendBeacon('/api/log-view', blob);
  }, 500);

  // 🔥 Démarrer le compte à rebours si c'est une vente flash
  if (isFlashSale.value) {
    startFlashSaleCountdown();
  }
});
</script>

<template>
  <main class="container relative py-6 xl:max-w-7xl">
    
    <!-- ✅ 2. SKELETON LOADER : S'affiche INSTANTANÉMENT pendant le chargement -->
    <div v-if="pending" class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] lg:gap-24 animate-pulse">
      <!-- Skeleton Image -->
      <div class="relative w-full min-w-0">
        <div class="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          <div class="h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        </div>
        <div class="flex gap-2 mt-4">
          <div class="aspect-square w-20 shrink-0 rounded-lg bg-gray-100 animate-pulse"></div>
          <div class="aspect-square w-20 shrink-0 rounded-lg bg-gray-100 animate-pulse"></div>
          <div class="aspect-square w-20 shrink-0 rounded-lg bg-gray-100 animate-pulse"></div>
          <div class="aspect-square w-20 shrink-0 rounded-lg bg-gray-100 animate-pulse"></div>
        </div>
      </div>

      <!-- Skeleton Détails -->
      <div class="w-full min-w-0 md:py-2 space-y-6">
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div class="flex justify-between items-start">
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
            <div class="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div class="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div class="space-y-2 pt-4">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <hr class="border-gray-200" />
        <div class="space-y-4 pt-2">
          <div class="h-10 bg-gray-200 rounded w-full"></div>
          <div class="flex gap-3">
            <div class="h-11 bg-gray-200 rounded w-28"></div>
            <div class="h-11 bg-gray-200 rounded flex-1"></div>
          </div>
          <div class="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>

    <!-- ✅ 3. CONTENU RÉEL : S'affiche dès que les données sont prêtes -->
    <div v-else-if="product">
      <Breadcrumb v-if="storeSettings.showBreadcrumbOnSingleProduct" :product class="mb-2" />

      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] lg:gap-24">
        <div class="relative w-full min-w-0 overflow-x-auto snap-x snap-mandatory flex md:block scrollbar-hide">
          <ProductImageGallery
            v-if="productImage"
            class="relative w-full min-w-0 flex-shrink-0 snap-center md:snap-none md:w-auto"
            :main-image="productImage"
            :gallery="productGallery"
            :node="displayProduct"
            :active-variation="activeVariation"
            fetchpriority="high"
          />
          <NuxtImg
            v-else
            class="relative aspect-square w-full min-w-0 flex-shrink-0 snap-center md:snap-none rounded-xl object-contain skeleton"
            src="/images/placeholder.jpg"
            :alt="product?.name || 'Product'"
            fetchpriority="high"
          />
          <div class="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            <div class="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          </div>
        </div>

        <div class="w-full min-w-0 md:py-2">
          <HookOutlet name="product.summary.beforeTitle" :ctx="{ product: displayProduct }" as="div" />
          
          <div class="mb-6">
           

            <div class="mb-4">
              <span class="flex flex-wrap items-center gap-2 font-bold text-gray-900 leading-tight text-2xl md:text-3xl">
                {{ displayProduct.name }}
                <LazyWPAdminLink :link="`/wp-admin/post.php?post=${product.databaseId}&action=edit`" class="text-xs text-gray-400 hover:text-primary">Edit</LazyWPAdminLink>
              </span>
              <StarRating v-if="storeSettings.showReviews" :rating="averageRating" :count="reviewCount" class="mt-1.5" />
            </div>
 <!-- ✅ NOUVEAU : Badge et Compte à rebours Vente Flash -->
            <div v-if="isFlashSale" class="flex flex-wrap items-center gap-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span class="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm animate-pulse">
                🔥 Vente Flash
              </span>
              <div class="flex items-center gap-1.5 text-red-700 font-bold font-mono text-lg md:text-xl">
                <span class="bg-white px-2.5 py-1 rounded-md shadow-sm border border-red-100 min-w-[2.5rem] text-center">
                  {{ String(timeLeft.hours).padStart(2, '0') }}
                </span>
                <span class="text-red-400">:</span>
                <span class="bg-white px-2.5 py-1 rounded-md shadow-sm border border-red-100 min-w-[2.5rem] text-center">
                  {{ String(timeLeft.minutes).padStart(2, '0') }}
                </span>
                <span class="text-red-400">:</span>
                <span class="bg-white px-2.5 py-1 rounded-md shadow-sm border border-red-100 min-w-[2.5rem] text-center text-red-600">
                  {{ String(timeLeft.seconds).padStart(2, '0') }}
                </span>
              </div>
              <span class="text-xs text-red-600 font-medium ml-auto hidden sm:block">
                Offre limitée dans le temps !
              </span>
            </div>
            <!-- ✅ FIN VENTE FLASH -->
            <div class="flex flex-row justify-between items-start">
              <div class="flex flex-col gap-1.5 text-sm">
                <div v-if="!isExternalProduct" class="flex items-center gap-2">
                  <span class="text-gray-400">{{ $t('shop.availability') }}:</span>
                  <StockStatus :stock-status="stockStatus" />
                </div>
                <div v-if="storeSettings.showSKU && product?.sku" class="flex items-center gap-2">
                  <span class="text-gray-400">{{ $t('shop.sku') }}:</span>
                  <span class="font-medium text-gray-700">{{ product?.sku || 'N/A' }}</span>
                </div>
              </div>

              <div class="flex flex-col items-end gap-2">
                <ProductPriceMax
                  class="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#ff4f24] leading-none"
                  :sale-price="priceTarget?.salePrice"
                  :regular-price="priceTarget?.regularPrice"
                />
                <div v-if="savingsAmount > 0" class="inline-flex items-center gap-1 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                  <svg class="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-[10px] md:text-xs font-semibold text-green-700 leading-none">
                    Économiser {{ Math.round(savingsAmount) }} DH
                  </span>
                </div>
              </div>
            </div>
          </div>

          <HookOutlet name="product.summary.afterPrice" :ctx="{ product: displayProduct }" as="div" />
          <div class="mb-8 text-gray-600 leading-relaxed" v-html="product.shortDescription"></div>
          <hr class="border-gray-200 my-6" />

          <form @submit.prevent="handleAddToCart" class="space-y-4">
            <AttributeSelections
              v-if="isVariableProduct && product?.attributes?.nodes?.length && product?.variations"
              class="mt-4 mb-6"
              :attributes="product.attributes.nodes"
              :default-attributes="defaultAttributes"
              :variations="product.variations.nodes"
              @attrs-changed="updateSelectedVariations"
            />

            <div class="flex flex-row gap-3">
              <div class="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden w-28 md:w-36 flex-shrink-0 focus-within:border-[#ff4f24] transition-colors bg-white">
                <button type="button" @click="quantity > 1 ? quantity-- : null" class="w-9 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium">-</button>
                <input v-model.number="quantity" type="number" min="1" class="w-full h-11 text-center border-none focus:ring-0 p-0 font-bold text-gray-900 bg-transparent" />
                <button type="button" @click="quantity++" class="w-9 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium">+</button>
              </div>

              <button
                type="submit"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ff4f24] text-white font-bold rounded-lg hover:bg-[#ff4f24]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#ff4f24]/20"
                :disabled="disabledAddToCart"
              >
                <span v-if="addToCartLoading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                {{ $t('shop.addToCart') }}
              </button>
            </div>

            <button
              type="button"
              @click.prevent="handleBuyNow"
              :disabled="disabledAddToCart"
              class="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#20bd5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#25D366]/30"
            >
              <span v-if="addToCartLoading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ $t('shop.buyNow') || 'Acheter maintenant' }}
            </button>
          </form>

          <div v-if="storeSettings.showProductCategoriesOnSingleProduct && product.productCategories" class="mt-8">
            <div class="grid gap-2 text-sm">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-gray-400">{{ $t('shop.category', 2) }}:</span>
                <div class="flex flex-wrap gap-1">
                  <NuxtLink
                    v-for="(category, index) in product.productCategories.nodes"
                    :key="category.databaseId"
                    :to="`/product-category/${decodeURIComponent(category?.slug || '')}`"
                    class="text-[#ff4f24] hover:underline"
                  >
                    {{ category.name }}<span v-if="index < product.productCategories.nodes.length - 1">,</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
            <hr class="border-gray-200 mt-6" />
          </div>

          <div class="flex flex-wrap gap-4 mt-6">
            <WishlistButton :product />
          </div>
        </div>
      </div>

      <div v-if="product.description || product.reviews" class="my-8 md:my-12">
        <ProductTabs :product />
        <HookOutlet name="product.tabs.after" :ctx="{ product }" as="div" />
      </div>

      <div v-if="product.related && storeSettings.showRelatedProducts" class="my-16 md:my-24">
        <h3 class="mb-6 text-xl font-bold text-gray-900">{{ $t('shop.youMayLike') }}</h3>
        <LazyProductRow :products="product.related.nodes" class="grid-cols-2 md:grid-cols-4 lg:grid-cols-5" />
      </div>
    </div>

    <!-- ✅ 4. GESTION D'ERREUR -->
    <div v-else-if="!pending && error" class="my-24 text-center text-gray-500">
      {{ productLoadError }}
    </div>
  </main>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>