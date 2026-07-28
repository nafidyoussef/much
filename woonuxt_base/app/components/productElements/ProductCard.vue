<script setup lang="ts">
import type { Product } from '#types/gql';

useAppConfig();
const { addToCart, toggleCart } = useCart();

const props = defineProps({
  node: { type: Object as PropType<Product>, required: true },
  index: { type: Number, default: 1 },
});

// ✅ Dimensions et qualité d'image conservées à l'identique
const imgWidth = 280;
const imgHeight = Math.round(imgWidth * 1.125); // 315px
const placeholderImage = '/images/placeholder.jpg';

const isAdding = ref(false);

// ✅ Logique d'image simplifiée : une seule image (principale ou variation si filtrée)
const productImage = computed(() => {
  return props.node?.image?.productCardSourceUrl || props.node?.image?.sourceUrl || placeholderImage;
});

const productAlt = computed(() => props.node?.image?.altText || props.node?.name || 'Product image');
const productLink = computed(() => `/product/${decodeURIComponent(props.node.slug || '')}`);

// ✅ Fonction d'ajout au panier (inchangée)
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

// ✅ Affichage conditionnel du bouton
const showAddButton = computed(() => {
  if (props.node.__typename === 'ExternalProduct') return false;
  if (props.node.__typename === 'SimpleProduct' && props.node.stockStatus === 'OUT_OF_STOCK') return false;
  return true;
});
</script>

<template>
  <div class="relative group w-full mt-0 px-2">
    
    <!-- Zone Image : Conteneur strict avec les mêmes proportions (aspect-[8/9]) -->
    <div class="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-[8/9]">
      
      <!-- Badge Promo -->
      <SaleBadge :node class="absolute z-20 top-3 right-3" />

      <!-- ✅ Image Unique (Lien vers le produit) avec les EXACTS mêmes attributs de qualité -->
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

      <!-- Fallback si pas de slug (mêmes attributs) -->
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

      <!-- Bouton "+" Flottant -->
      <button
        v-if="showAddButton"
        @click="handleAddToCart"
        :disabled="isAdding"
        class="absolute bottom-3 right-3 z-20 flex items-center justify-center w-10 h-10 text-white bg-primary rounded-full shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:scale-110 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        :aria-label="node.type === 'VARIABLE' || node.type === 'GROUPED' ? 'Voir les options' : 'Ajouter au panier'"
      >
        <svg v-if="isAdding" class="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        
        <svg v-else-if="node.type === 'SIMPLE'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>

        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>

      <!-- Badge Rupture de stock -->
      <div
        v-if="node.__typename === 'SimpleProduct' && node.stockStatus === 'OUT_OF_STOCK'"
        class="absolute bottom-3 right-3 z-20 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900/80 backdrop-blur-sm rounded-full shadow-sm">
        Rupture de stock
      </div>

    </div>

    <!-- Zone Texte : Nom et Prix -->
    <div class="p-1 mt-1">
      <NuxtLink
        v-if="node.slug"
        :to="productLink"
        :title="node.name || undefined"
        class="block"
      >
        <span class="text-[15px] font-normal leading-tight text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {{ node.name }}
        </span>
      </NuxtLink>
      
      <ProductPrice class="mt-1.5 text-base font-bold text-gray-900" :sale-price="node.salePrice ?? undefined" :regular-price="node.regularPrice ?? undefined" />
    </div>

  </div>
</template>