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
  <div class="relative group w-full mt-0 px-0 border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
    
    <!-- Zone Image -->
    <div class="relative w-full overflow-hidden rounded-t-xl bg-gray-100 aspect-[8/9]">
      
      <!-- Badge Promo -->
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

    <!-- Zone Texte (flex-col pour pousser le prix/bouton en bas) -->
    <div class="p-3 flex flex-col flex-grow">
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
      
      <!-- Compteur de ventes -->
     
      <!-- ✅ Ligne Prix + Bouton (alignés en bas) -->
      <div class="flex items-center justify-between mt-auto pt-2">
        
        <!-- Prix (Gauche) -->
        <div class="flex items-baseline gap-2">
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

        <!-- ✅ Bouton "+" (Droite) -->
              <!-- ✅ Bouton Cercle Plein (Droite) -->
        <button
          v-if="node.__typename !== 'ExternalProduct'"
          @click="handleAddToCart"
          :disabled="isButtonDisabled"
          class="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 disabled:cursor-not-allowed shrink-0 shadow-sm"
          :class="{
            'bg-[#ff4f24] text-white hover:bg-[#e64621] hover:shadow-md hover:scale-105': !isButtonDisabled,
            'bg-gray-200 text-gray-400': isButtonDisabled
          }"
          :aria-label="buttonText"
        >
          <!-- Icône de chargement -->
          <svg v-if="isAdding" class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          
          <!-- Icône "+" (SVG pour un centrage parfait) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>