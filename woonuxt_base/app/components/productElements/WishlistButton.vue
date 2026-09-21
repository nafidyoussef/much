<script setup lang="ts">
import type { Product } from '#types/gql';

const { addToWishlist, removeFromWishlist, isInList } = useWishlist();
const { formatProduct, track } = useTracking(); // ✅ AJOUT DU TRACKING

const { product } = defineProps<{ product: Product }>();

const isMounted = ref(false);
const isWishlisted = computed(() => (isMounted.value && product.databaseId ? isInList(product.databaseId) : false));

// ✅ TRACKING : Logique séparée pour tracker uniquement l'AJOUT
const toggleWishlist = () => {
  if (!product.databaseId) return;

  if (isWishlisted.value) {
    // Action : Suppression des favoris (Pas de tracking requis)
    removeFromWishlist(product.databaseId);
  } else {
    // Action : Ajout aux favoris
    addToWishlist(product);
    
    // ✅ TRACKING GA4 : add_to_wishlist
    const item = formatProduct(product, 1);
    track('add_to_wishlist', {
      value: item.price,
      items: [item]
    });
  }
};

onMounted(() => {
  isMounted.value = true;
});
</script>

<template>
  <button 
    type="button" 
    class="cursor-pointer flex mt-4 text-sm text-gray-400 gap-2 items-center hover:text-[#ff4f24] transition-colors" 
    @click="toggleWishlist"
  >
    <Icon v-if="isWishlisted" name="ion:heart" size="18" class="text-red-400" />
    <Icon v-else name="ion:heart-outline" size="18" />
    <span>{{ isWishlisted ? $t('shop.wishlistRemove') : $t('shop.wishlistAdd') }}</span>
  </button>
</template>