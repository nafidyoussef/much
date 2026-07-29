<script setup lang="ts">
import type { Product } from '#types/gql';

useAppConfig();
const { addToCart, toggleCart } = useCart();

const props = defineProps({
  node: { type: Object as PropType<Product>, required: true },
  index: { type: Number, default: 1 },
});

const imgWidth = 280;
const imgHeight = Math.round(imgWidth * 1.125);
const placeholderImage = '/images/placeholder.jpg';

const isAdding = ref(false);

const productImage = computed(() => {
  return props.node?.image?.productCardSourceUrl || props.node?.image?.sourceUrl || placeholderImage;
});

const productAlt = computed(() => props.node?.image?.altText || props.node?.name || 'Product image');
const productLink = computed(() => `/product/${decodeURIComponent(props.node.slug || '')}`);

const discountPercentage = computed(() => {
  if (props.node.onSale && props.node.rawRegularPrice && props.node.rawSalePrice) {
    const regularPrice = Number(props.node.rawRegularPrice);
    const salePrice = Number(props.node.rawSalePrice);
    
    if (regularPrice > 0) {
      const discount = ((regularPrice - salePrice) / regularPrice) * 100;
      return Math.round(discount);
    }
  }
  return null;
});

const salesCount = computed(() => {
  const baseSales = Math.floor(Math.random() * 3000) + 100;
  if (baseSales >= 1000) {
    return (baseSales / 1000).toFixed(1) + 'k';
  }
  return baseSales.toString();
});

const handleAddToCart = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  if (props.node.type === 'VARIABLE' || props.node.type === 'GROUPED') {
    navigateTo(productLink.value);
    return;
  }

  isAdding.value = true;
  try {
    await addToCart({ productId: props.node.databaseId, quantity: 1 });
    toggleCart(true); 
  } catch (error) {
    console.error('Failed to add to cart:', error);
  } finally {
    isAdding.value = false;
  }
};

// ✅ Texte du bouton dynamique
const buttonText = computed(() => {
  if (props.node.__typename === 'SimpleProduct' && props.node.stockStatus === 'OUT_OF_STOCK') {
    return 'Voir';
  }
  if (props.node.type === 'VARIABLE' || props.node.type === 'GROUPED') {
    return 'Choix';
  }
  return 'Ajouter';
});

// ✅ Désactiver le bouton seulement si produit simple en rupture
const isButtonDisabled = computed(() => {
  return props.node.__typename === 'SimpleProduct' && props.node.stockStatus === 'OUT_OF_STOCK';
});
</script>

<template>
  <div class="relative group w-full mt-0 px-2 border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-shadow duration-300">
    
    <!-- Zone Image -->
    <div class="relative w-full overflow-hidden rounded-t-xl bg-gray-100 aspect-[8/9]">
      
      <!-- ✅ Badge Promo déplacé à DROITE -->
      <div v-if="discountPercentage" class="absolute top-2 right-2 z-20 bg-[#ff4f24] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
        -{{ discountPercentage }}%
      </div>

      <!-- Image du produit -->
      <NuxtLink
        v-if="node.slug"
        :to="productLink"
        class="relative block w-full h-full overflow-hidden"
      >
        <NuxtPicture
          :width="imgWidth"
          :height="imgHeight"
          :src="productImage"
          :alt="productAlt"
          :title="productAlt"
          :loading="index <= 3 ? 'eager' : 'lazy'"
          :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
          class="absolute inset-0 w-full h-full"
          :img-attrs="{ 
            class: 'w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110' 
          }" 
        />
      </NuxtLink>

      <div v-else class="relative block w-full h-full overflow-hidden">
        <NuxtPicture
          :width="imgWidth"
          :height="imgHeight"
          :src="productImage"
          :alt="productAlt"
          :title="productAlt"
          :loading="index <= 3 ? 'eager' : 'lazy'"
          :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
          class="absolute inset-0 w-full h-full"
          :img-attrs="{ 
            class: 'w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110' 
          }" 
        />
      </div>
    </div>

    <!-- Zone Texte -->
    <div class="p-3">
      <!-- Nom du produit -->
      <NuxtLink
        v-if="node.slug"
        :to="productLink"
        :title="node.name || undefined"
        class="block mb-2"
      >
        <span class="text-[13px] font-medium text-gray-900 line-clamp-2 hover:text-[#ff4f24] transition-colors duration-300">
          {{ node.name }}
        </span>
      </NuxtLink>
      
      <!-- Prix -->
      <div class="flex items-baseline gap-2 mb-2">
        <span v-if="node.onSale && node.salePrice" class="text-base font-bold text-[#ff4f24]">
          {{ node.salePrice }}
        </span>
        <span v-else-if="node.price" class="text-base font-bold text-[#ff4f24]">
          {{ node.price }}
        </span>
        
        <span v-if="node.onSale && node.regularPrice" class="text-xs text-gray-400 line-through">
          {{ node.regularPrice }}
        </span>
      </div>

      <!-- Compteur de ventes -->
      <div v-if="salesCount" class="mb-3">
        <span class="text-[11px] text-gray-600 bg-[#ff4f24]/10 px-2 py-0.5 rounded-full">
          {{ salesCount }} vendus
        </span>
      </div>

      <!-- ✅ Bouton dynamique -->
      <button
        v-if="node.__typename !== 'ExternalProduct'"
        @click="handleAddToCart"
        :disabled="isButtonDisabled"
        class="w-full py-2 border-2 text-sm font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
        :class="{
          'border-[#ff4f24] text-[#ff4f24] hover:bg-[#ff4f24] hover:text-white': !isButtonDisabled,
          'border-gray-300 text-gray-400 bg-gray-50': isButtonDisabled
        }"
      >
        <span v-if="isAdding">Ajout...</span>
        <span v-else>{{ buttonText }}</span>
      </button>
    </div>
  </div>
</template>