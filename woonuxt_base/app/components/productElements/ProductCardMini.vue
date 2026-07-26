<script setup lang="ts">
import type { Product } from '#types/gql';

const props = defineProps({
  node: { type: Object as PropType<Product>, required: true },
  index: { type: Number, default: 1 },
});

// ✅ Image unique simplifiée
const imageUrl = computed<string>(() => 
  props.node?.image?.productCardSourceUrl || props.node?.image?.sourceUrl || '/images/placeholder.jpg'
);
const imageAlt = computed<string>(() => props.node?.image?.altText || props.node?.name || 'Product image');
const imageTitle = computed<string>(() => props.node?.image?.title || props.node?.name || 'Product image');

const productLink = computed<string>(() => `/product/${decodeURIComponent(props.node.slug || '')}`);

// ✅ GÉNÉRATION ALÉATOIRE DE STOCK POUR MARKETING
const fakeStock = ref<number | null>(null);

onMounted(() => {
  const random = Math.random();
  if (random < 0.05) {
    fakeStock.value = 0;
  } else if (random < 0.85) {
    fakeStock.value = Math.floor(Math.random() * 5) + 1;
  } else {
    fakeStock.value = Math.floor(Math.random() * 5) + 6;
  }
});

const isOutOfStock = computed(() => fakeStock.value === 0);

const stockPercentage = computed(() => {
  if (isOutOfStock.value || fakeStock.value === 0) return 4;
  if (fakeStock.value === null) return null;
  const pct = (fakeStock.value / 10) * 100;
  return Math.min(Math.max(pct, 10), 100);
});

// Message à afficher
const stockMessage = computed(() => {
  if (isOutOfStock.value || fakeStock.value === 0) return 'Vient de se terminer';
  if (fakeStock.value !== null && fakeStock.value <= 5) return `Plus que ${fakeStock.value} en stock`;
  return null;
});
</script>

<template>
  <div class="relative group w-full mt-0 p-2">
    
    <!-- Zone Image -->
    <div class="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-[8/9]">
      
      <SaleBadge :node class="absolute z-20 top-3 right-3" />

      <NuxtLink
        v-if="node.slug"
        class="block w-full h-full"
        :to="productLink"
      >
        <NuxtPicture
          :src="imageUrl"
          :alt="imageAlt"
          :title="imageTitle"
          :loading="index <= 3 ? 'eager' : 'lazy'"
          class="w-full h-full"
          :img-attrs="{ 
            class: 'w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110' 
          }" 
        />
      </NuxtLink>

      <div v-else class="block w-full h-full">
        <NuxtPicture
          :src="imageUrl"
          :alt="imageAlt"
          :title="imageTitle"
          :loading="index <= 3 ? 'eager' : 'lazy'"
          class="w-full h-full"
          :img-attrs="{ 
            class: 'w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110' 
          }" 
        />
      </div>
    </div>

    <!-- Zone Texte -->
    <div class="p-1 mt-1">
      <NuxtLink
        v-if="node.slug"
        :to="productLink"
        :title="node.name || undefined"
        class="block"
      >
        <span
          class="text-[15px] font-normal leading-tight text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-300"
        >
          {{ node.name }}
        </span>
      </NuxtLink>
      
      <ProductPrice class="mt-1.5 text-base font-bold text-gray-900" :sale-price="node.salePrice ?? undefined" :regular-price="node.regularPrice ?? undefined" />

      <!-- ✅ BARRE DE STOCK MARKETING avec message EN DESSOUS -->
      <div v-if="stockMessage && fakeStock !== null" class="mt-2.5">
        <!-- Barre de progression -->
        <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="isOutOfStock ? 'bg-red-500 animate-pulse' : 'bg-orange-500'"
            :style="{ width: stockPercentage + '%' }"
          ></div>
        </div>
        
        <!-- ✅ Message EN DESSOUS, en gris, petite police -->
        <p class="text-[10px] text-gray-500 mt-1 leading-tight">
          {{ stockMessage }}
        </p>
      </div>

    </div>
  </div>
</template>