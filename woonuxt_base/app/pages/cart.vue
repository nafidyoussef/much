<script setup lang="ts">
const { cart, isCartMutating, refreshCartIfNeeded } = useCart();
const { track } = useTracking(); // ✅ Auto-importé par Nuxt

const hasTrackedViewCart = ref(false);

onMounted(refreshCartIfNeeded);

// ✅ TRACKING : view_cart avec version universelle
watch(
  () => cart.value,
  (newCart) => {
    if (newCart && !newCart.isEmpty && !hasTrackedViewCart.value && !isCartMutating.value) {
      
      // ✅ VERSION UNIVERSELLE : Essaie tous les chemins possibles
      const cartItems = (newCart.contents?.nodes || []).map((item: any) => {
        // Essayer tous les chemins possibles pour trouver le produit
        const product = 
          item.product?.node ||           // WooNuxt standard
          item.product ||                  // Produit direct
          item.productData ||              // Autre nom possible
          {};
        
        const variation = 
          item.variation?.node ||          // WooNuxt standard
          item.variation ||                 // Variation directe
          null;
        
        // Privilégie la variante si elle a un ID
        const entity = variation?.databaseId ? variation : product;
        
        // Essayer tous les noms possibles pour l'ID
        const databaseId = 
          entity.databaseId || 
          entity.id || 
          entity.productId || 
          entity.variationId ||
          item.productId ||
          item.variationId ||
          item.product?.databaseId ||
          'unknown';
        
        // Essayer tous les noms possibles pour le nom
        const name = 
          entity.name || 
          entity.productName || 
          item.name || 
          item.product?.name ||
          'Produit inconnu';
        
        // Calcul du prix unitaire
        const lineTotal = parseFloat(String(item.subtotal || item.total || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        const qty = Number(item.quantity) || 1;
        const unitPrice = lineTotal / qty;

        return {
          item_id: String(databaseId),
          meta_content_id: String(databaseId),
          item_name: String(name),
          price: unitPrice,
          quantity: qty
        };
      });

      // Calcul de la valeur totale
      const cartValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Envoi de l'événement
      track('view_cart', {
        value: cartValue,
        items: cartItems
      });

      hasTrackedViewCart.value = true;
      
      // ✅ LOG pour debug
      console.log('🛒 view_cart items:', cartItems);
    }
  },
  { immediate: true }
);

definePageMeta({
  title: 'Cart',
});

useSeoMeta({
  title: 'Shopping Cart',
  description: 'View and manage items in your shopping cart',
});
</script>

<template>
  <main class="container my-16 min-h-150 items-center flex flex-col">
    <ClientOnly>
      <div v-if="cart && !cart.isEmpty" class="grid lg:grid-cols-3 gap-8 lg:gap-12 w-full">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <ul class="flex flex-col gap-4">
            <CartCard v-for="item in cart.contents?.nodes" :key="item.key" :item />
          </ul>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('shop.orderSummary') }}</h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-gray-700">
                <span>{{ $t('shop.subtotal') }}</span>
                <span class="font-medium tabular-nums" v-html="cart.subtotal"></span>
              </div>

              <div v-if="cart.shippingTotal" class="flex justify-between text-gray-700">
                <span>{{ $t('general.shipping') }}</span>
                <span class="font-medium tabular-nums"> {{ parseFloat(cart.shippingTotal) > 0 ? '+' : '' }} <span v-html="cart.shippingTotal"></span> </span>
              </div>

              <div v-if="cart.discountTotal && parseFloat(cart.rawDiscountTotal || '0') > 0" class="flex justify-between text-primary">
                <span>{{ $t('shop.discount') }}</span>
                <span class="font-medium tabular-nums">- <span v-html="cart.discountTotal"></span></span>
              </div>

              <div class="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900">{{ $t('shop.total') }}</span>
                <span class="text-2xl font-bold text-gray-900 tabular-nums" v-html="cart.total"></span>
              </div>
            </div>

            <Button
              :to="isCartMutating ? undefined : '/checkout'"
              :disabled="isCartMutating"
              :loading="isCartMutating"
              class="w-full"
              size="lg"
              variant="primary">
              <span class="mx-2">{{ isCartMutating ? $t('general.updating') : $t('shop.checkout') }}</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty Cart Message -->
      <EmptyCartMessage v-else-if="cart && cart.isEmpty" />

      <!-- Cart Loading -->
      <div v-else class="flex flex-col items-center justify-center min-h-100">
        <LoadingIcon />
      </div>
    </ClientOnly>
  </main>
</template>