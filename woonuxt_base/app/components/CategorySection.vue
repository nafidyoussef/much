<script setup lang="ts">
import type { Product, ProductCategory } from '#types/gql';

const props = defineProps<{
  category: ProductCategory;
  themeIndex: number;
}>();

// ✅ Définition explicite du type Theme
type Theme = {
  bg: string;
  border: string;
  text: string;
  btn: string;
  blur: string;
};

const categoryThemes: Theme[] = [
  { bg: 'from-rose-50/60 via-white to-white', border: 'border-rose-100', text: 'text-rose-600', btn: 'text-rose-600 hover:bg-rose-50 hover:border-rose-200', blur: 'bg-rose-100/50' },
  { bg: 'from-blue-50/60 via-white to-white', border: 'border-blue-100', text: 'text-blue-600', btn: 'text-blue-600 hover:bg-blue-50 hover:border-blue-200', blur: 'bg-blue-100/50' },
  { bg: 'from-emerald-50/60 via-white to-white', border: 'border-emerald-100', text: 'text-emerald-600', btn: 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200', blur: 'bg-emerald-100/50' },
  { bg: 'from-violet-50/60 via-white to-white', border: 'border-violet-100', text: 'text-violet-600', btn: 'text-violet-600 hover:bg-violet-50 hover:border-violet-200', blur: 'bg-violet-100/50' },
  { bg: 'from-amber-50/60 via-white to-white', border: 'border-amber-100', text: 'text-amber-600', btn: 'text-amber-600 hover:bg-amber-50 hover:border-amber-200', blur: 'bg-amber-100/50' },
];

// ✅ FORCAGE DU TYPE : On dit explicitement à TypeScript que theme est de type Theme (jamais undefined)
const theme: Theme = (categoryThemes[props.themeIndex % categoryThemes.length] ?? categoryThemes[0]) as Theme;

const { data } = await useAsyncGql('getNewInProducts', {
  category: props.category.slug || '',
});

const products = (data.value?.products?.nodes as Product[] | undefined) ?? [];

const sliderRef = ref<HTMLElement | null>(null);

const scroll = (direction: 'left' | 'right') => {
  if (!sliderRef.value) return;
  const amount = sliderRef.value.clientWidth * 0.8;
  sliderRef.value.scrollBy({
    left: direction === 'left' ? -amount : amount,
    behavior: 'smooth',
  });
};
</script>

<template>
  <section v-if="products.length" class="w-full py-1 md:py-4">
    <div
      class="relative overflow-hidden bg-gradient-to-br border-y md:border md:rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
      :class="[theme.bg, theme.border]"
    >
      <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl pointer-events-none hidden md:block" :class="theme.blur"></div>
      <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-2xl pointer-events-none hidden md:block" :class="theme.blur"></div>

      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 pt-4 md:px-8 md:pt-8 pb-2">
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gray-100">
            <img v-if="category.image?.sourceUrl" :src="category.image.sourceUrl" :alt="category.name || 'Category'" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl">📁</div>
          </div>
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{{ category.name }}</h2>
            <p class="text-xs md:text-sm text-gray-500 mt-1 font-medium">{{ products.length }} produits disponibles</p>
          </div>
        </div>

        <NuxtLink
          :to="`/product-category/${decodeURIComponent(category.slug || '')}`"
          class="inline-flex self-start md:self-auto items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-300 group/link"
          :class="[theme.text, theme.border, theme.btn]"
        >
          Voir toute la catégorie
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>

      <div class="relative group/slider mt-4 md:mt-6">
        <div ref="sliderRef" class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2 px-0 md:px-1 scrollbar-hide">
          <div
            v-for="product in products"
            :key="product.databaseId || product.id"
            class="w-[46%] sm:w-[33.333%] md:w-[25%] lg:w-[20%] flex-shrink-0 snap-start"
          >
            <ProductCard :node="product" />
          </div>
        </div>

        <button @click="scroll('left')" class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-md border transition-all opacity-0 group-hover/slider:opacity-100" :class="[theme.text, theme.border, theme.btn]" aria-label="Scroll left">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button @click="scroll('right')" class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-md border transition-all opacity-0 group-hover/slider:opacity-100" :class="[theme.text, theme.border, theme.btn]" aria-label="Scroll right">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>