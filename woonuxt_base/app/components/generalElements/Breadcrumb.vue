<script setup lang="ts">
import type { Product } from '#types/gql';

const runtimeConfig = useRuntimeConfig();
const { product } = defineProps<{ product: Product }>();

// TODO fetch perma link from WP API
const productCategoryPermallink = runtimeConfig?.public?.PRODUCT_CATEGORY_PERMALINK || '/product-category/';
const primaryCategory = computed(() => product.productCategories?.nodes[0]);

// ✅ Fonction pour tronquer à 2 mots + "..."
const truncateToTwoWords = (text: string | null | undefined): string => {
  if (!text) return '';
  const words = text.trim().split(/\s+/); // Sépare par les espaces
  if (words.length <= 3) return text;     // Si 2 mots ou moins, on garde le texte entier
  return `${words[0]} ${words[1]} ${words[2]} ...`;    // Sinon, on prend les 2 premiers mots + "..."
};

const format = computed(() => [
  { name: 'Products', slug: '/products' },
  {
    name: primaryCategory.value?.name,
    slug: `${String(productCategoryPermallink)}${primaryCategory.value?.slug}`,
  },
  // ✅ Application de la troncation uniquement sur le nom du produit
  { name: truncateToTwoWords(product.name) }, 
]);
</script>

<template>
  <div class="flex flex-wrap text-sm leading-none text-gray-400 gap-1 items-center">
    <span>
      <NuxtLink to="/" class="hover:text-primary">{{ $t('general.home') }}</NuxtLink>
      <span> /</span>
    </span>
    <span v-for="(link, i) in format" :key="link.name || i">
      <NuxtLink 
        v-if="link.slug" 
        :to="decodeURIComponent(link.slug)" 
        class="hover:text-primary transition-colors"
      >
        {{ link.name }}
      </NuxtLink>
      <span v-else class="text-gray-800 font-medium">{{ link.name }}</span>
      <span v-if="i + 1 < format.length"> /</span>
    </span>
  </div>
</template>