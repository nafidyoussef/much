<script lang="ts" setup> 
import { StockStatusEnum, ProductTypesEnum, type AddToCartInput, type ProductAttributeInput } from '#gql/default';
import type { ProductDetail, Variation, VariationAttribute } from '#types/gql';

const route = useRoute();
const { storeSettings } = useAppConfig();
const { addToCart, isUpdatingCart, isAddingToCart, isOptimisticCartMode, toggleCart } = useCart();
const { frontEndUrl, getErrorMessage } = useHelpers();
const { t } = useI18n();
const gql = useWooGraphQL();
const slug = route.params.slug as string;

const { data, error } = await useAsyncGql('getProduct', { slug, frontEndUrl });
const product = ref<ProductDetail | null>(data.value?.product ?? null);
const quantity = ref<number>(1);
const activeVariation = ref<Variation | null>(null);
const variation = ref<VariationAttribute[]>([]);
const attrValues = ref<ProductAttributeInput[]>([]);

const productLoadError = error.value ? getErrorMessage(error.value) || `Unable to load product "${slug}" from WordPress` : t('shop.productNotFound');

// ==========================================
// Logique de gestion des variations
// ==========================================
const normalizeMatchToken = (value?: string | null): string => (value ?? '').toString().trim().toLowerCase().replace(/[\s-_]+/g, '');
const stripPaPrefix = (value?: string | null): string => (value ?? '').toString().replace(/^pa[_-]/i, '');
const normalizeMatchKey = (value?: string | null): string => normalizeMatchToken(stripPaPrefix(value));
const normalizeMatchValue = (value?: string | null): string => normalizeMatchToken(value);
type VariationSelection = Pick<VariationAttribute, 'name' | 'value'>;
const toSelectionName = (name?: string | null): string => { if (!name) return ''; return name.charAt(0).toLowerCase() + name.slice(1); };

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
      if (candidateValue !== value) { matches = false; break; }
      matchedSpecific += 1;
    }
    if (!matches) continue;
    const score = matchedSpecific * 100 + candidate.specificity;
    if (!bestMatch || score > bestMatch.score) { bestMatch = { variation: candidate.variation, score }; }
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
    const isValidValue = attr.scope === 'LOCAL' ? (attr.options ?? []).some((option: string | null) => normalizeMatchValue(option ?? '') === normalizedValue) : 'terms' in attr && (attr.terms?.nodes ?? []).some((term) => normalizeMatchValue(term?.slug ?? '') === normalizedValue);
    if (!isValidValue) continue;
    selections.push({ name: key, value: String(value) });
  }
  return selections;
};

const queryVariationId = queryParams.variationId ?? queryParams.variation;
const variationFromQuery = findVariationById(Array.isArray(queryVariationId) ? queryVariationId[0] : queryVariationId);

if (variationFromQuery?.attributes?.nodes?.length) {
  variation.value = variationFromQuery.attributes.nodes.map((attr: VariationAttribute) => ({ name: attr.name || '', value: attr.value || '', attributeId: attr.attributeId ?? null, label: attr.label ?? attr.name ?? '' }));
  activeVariation.value = variationFromQuery;
} else {
  const initialSelections = buildQuerySelections();
  if (initialSelections.length > 0) {
    const matched = findMatchingVariation(initialSelections);
    if (matched?.attributes?.nodes?.length) {
      variation.value = matched.attributes.nodes.map((attr: VariationAttribute) => ({ name: attr.name || '', value: attr.value || '', attributeId: attr.attributeId ?? null, label: attr.label ?? attr.name ?? '' }));
      activeVariation.value = matched;
    } else {
      variation.value = initialSelections.map((selection) => ({ name: selection.name || '', value: selection.value || '', attributeId: null, label: selection.name || '' }));
    }
  }
}

const defaultAttributes = computed<{ nodes: VariationAttribute[] } | null>(() => {
  if (variation.value.length > 0) return { nodes: variation.value };
  return product.value?.defaultAttributes ? { nodes: product.value.defaultAttributes.nodes ?? [] } : null;
});

const isVariableProduct = computed<boolean>(() => product.value?.type === ProductTypesEnum.Variable);
const isExternalProduct = computed<boolean>(() => product.value?.type === ProductTypesEnum.External);
const shouldSkipStockRefresh = computed<boolean>(() => isExternalProduct.value);

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

const handleAddToCart = async (): Promise<void> => {
  if (!product.value) return;
  await addToCart(selectProductInput.value, { product: product.value, variation: activeVariation.value });
  toggleCart(true);
};

const handleBuyNow = async (): Promise<void> => {
  if (!product.value) return;
  try {
    await addToCart(selectProductInput.value, { product: product.value, variation: activeVariation.value });
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

const mergeLiveStockStatus = (payload: ProductDetail): void => {
  if (product.value) {
    product.value = {
      ...product.value,
      stockStatus: payload.stockStatus ?? product.value.stockStatus,
      variations: product.value.variations ? { ...product.value.variations, nodes: product.value.variations.nodes?.map((node, index) => ({ ...node, stockStatus: payload.variations?.nodes?.[index]?.stockStatus || node.stockStatus })) ?? [] } : undefined,
    };
  }
};

const refreshStockStatus = async (): Promise<void> => {
  try {
    const { product } = await gql.getStockStatus({ slug });
    if (product) mergeLiveStockStatus(product as ProductDetail);
  } catch (error: any) {
    if (error?.gqlErrors?.[0]?.message) console.error(error.gqlErrors[0].message);
  }
};

onMounted(() => {
  if (!shouldSkipStockRefresh.value) void refreshStockStatus();
});

const stockStatus = computed(() => {
  if (isVariableProduct.value) return activeVariation.value?.stockStatus ?? product.value?.stockStatus ?? StockStatusEnum.OutOfStock;
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

// ==========================================
// ✅ CALCUL DE L'ÉCONOMIE (Badge promotion)
// ==========================================
const savingsAmount = computed(() => {
  // On cast en 'any' pour éviter l'erreur TypeScript stricte sur le type Variation
  // qui ne déclare pas toujours explicitement ces champs, bien qu'ils soient 
  // bel et bien renvoyés par le backend GraphQL.
  const target = priceTarget.value as any;
  
  if (!target?.onSale || !target?.rawRegularPrice || !target?.rawSalePrice) {
    return 0;
  }
  
  const regular = parseFloat(String(target.rawRegularPrice).replace(/[^0-9.]/g, '')) || 0;
  const sale = parseFloat(String(target.rawSalePrice).replace(/[^0-9.]/g, '')) || 0;
  
  return Math.max(0, regular - sale);
});

// ==========================================
// Lien WhatsApp
// ==========================================
const whatsappNumber = process.env.WTSP_PHONE || '212664612098';
const currentUrl = import.meta.client ? window.location.href : '';
const whatsappMessage = `Bonjour, je suis intéressé par ce produit : ${product.value?.name} - ${currentUrl}`;
const whatsappLink = computed(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`);
const handleImageChange = (image: any) => {
  // Optionnel : faire quelque chose quand l'image change
  console.log('Image changée:', image);
};
</script>

<template>
  <main class="container relative py-6 xl:max-w-7xl">
    <div v-if="product">
      <SEOHead :info="product" />
      <Breadcrumb v-if="storeSettings.showBreadcrumbOnSingleProduct" :product class="mb-6" />

      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] lg:gap-24">
        
        <!-- ✅ GALERIE D'IMAGES (Swipeable sur mobile) -->
        <div class="relative w-full min-w-0 overflow-x-auto snap-x snap-mandatory flex md:block scrollbar-hide">
          <ProductImageGallery
            v-if="productImage"
            class="relative w-full min-w-0 flex-shrink-0 snap-center md:snap-none md:w-auto"
            :main-image="productImage"
            :gallery="productGallery"
            :node="displayProduct"
            :active-variation="activeVariation" 
          />
          <NuxtImg
            v-else
            class="relative aspect-square w-full min-w-0 flex-shrink-0 snap-center md:snap-none rounded-xl object-contain skeleton"
            src="/images/placeholder.jpg"
            :alt="product?.name || 'Product'" 
          />
          
          <!-- Indicateur visuel de swipe pour mobile -->
          <div class="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            <div class="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          </div>
        </div>

        <!-- Détails du produit -->
        <div class="w-full min-w-0 md:py-2">
          <HookOutlet name="product.summary.beforeTitle" :ctx="{ product: displayProduct }" as="div" />

          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
            <div class="flex-1">
              <h2 class="flex flex-wrap items-center gap-2 mb-2 font-bold text-gray-900">
                {{ displayProduct.name }}
                <LazyWPAdminLink :link="`/wp-admin/post.php?post=${product.databaseId}&action=edit`" class="text-xs text-gray-400 hover:text-primary">Edit</LazyWPAdminLink>
              </h2>
              <StarRating v-if="storeSettings.showReviews" :rating="averageRating" :count="reviewCount" />
            </div>
            
            <!-- ✅ PRIX AGRANDI + BADGE D'ÉCONOMIE -->
          <div class="flex flex-col items-end gap-2">
  <ProductPriceMax
    class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#ff4f24]" 
    :sale-price="priceTarget?.salePrice" 
    :regular-price="priceTarget?.regularPrice" 
  />
  
  <!-- Badge d'économie (s'affiche uniquement si > 0) -->
 <div v-if="savingsAmount > 0" class="inline-flex items-center gap-1 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">
  <svg class="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span class="text-[8px] font-semibold text-green-700 leading-none">
    Economiser -{{ Math.round(savingsAmount) }} DH
  </span>
</div>
</div>
          </div>

          <HookOutlet name="product.summary.afterPrice" :ctx="{ product: displayProduct }" as="div" />

          <div class="grid gap-2 my-6 text-sm empty:hidden">
            <div v-if="!isExternalProduct" class="flex items-center gap-2">
              <span class="text-gray-400">{{ $t('shop.availability') }}: </span>
              <StockStatus :stock-status="stockStatus" />
            </div>
            <div v-if="storeSettings.showSKU && product?.sku" class="flex items-center gap-2">
              <span class="text-gray-400">{{ $t('shop.sku') }}: </span>
              <span>{{ product?.sku || 'N/A' }}</span>
            </div>
          </div>

          <div class="mb-8 text-gray-600 leading-relaxed" v-html="product.shortDescription"></div>

          <hr class="border-gray-200 my-6" />

          <!-- Formulaire d'achat -->
          <form @submit.prevent="handleAddToCart" class="space-y-4">
            <AttributeSelections
              v-if="isVariableProduct && product?.attributes?.nodes?.length && product?.variations"
              class="mt-4 mb-6"
              :attributes="product.attributes.nodes"
              :default-attributes="defaultAttributes"
              :variations="product.variations.nodes"
              @attrs-changed="updateSelectedVariations" />

            <!-- LIGNE : Quantité + Ajouter au panier -->
            <div class="flex flex-row gap-3">
              <div class="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden w-28 md:w-36 flex-shrink-0 focus-within:border-[#ff4f24] transition-colors bg-white">
                <button type="button" @click="quantity > 1 ? quantity-- : null" class="w-9 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium">-</button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  class="w-full h-11 text-center border-none focus:ring-0 p-0 font-bold text-gray-900 bg-transparent"
                />
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

            <!-- Bouton Acheter Maintenant (Vert WhatsApp + Icône Panier) -->
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

      <!-- Onglets et produits similaires -->
      <div v-if="product.description || product.reviews" class="my-8 md:my-12">
        <ProductTabs :product />
        <HookOutlet name="product.tabs.after" :ctx="{ product }" as="div" />
      </div>
      
      <div v-if="product.related && storeSettings.showRelatedProducts" class="my-16 md:my-24">
        <h3 class="mb-6 text-xl font-bold text-gray-900">{{ $t('shop.youMayLike') }}</h3>
        <LazyProductRow :products="product.related.nodes" class="grid-cols-2 md:grid-cols-4 lg:grid-cols-5" />
      </div>
    </div>


    
    <div v-else class="my-24 text-center text-gray-500">
      {{ productLoadError }}
    </div>

    

    <!-- ✅ BOUTON WHATSAPP STICKY (Bas Gauche, Mobile Uniquement) -->
    <a
      :href="whatsappLink"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-24 left-4 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 hover:bg-[#20bd5a] hover:scale-110 active:scale-95 transition-all duration-300 md:hidden"
      aria-label="Commander sur WhatsApp"
    >
      <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>

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

/* ✅ Masque la barre de défilement pour le swipe mobile tout en gardant la fonctionnalité */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>