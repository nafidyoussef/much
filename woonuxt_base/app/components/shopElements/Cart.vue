<script setup lang="ts">
const { cart, toggleCart, isCartMutating } = useCart();
const config = useRuntimeConfig();

// Récupérer le seuil depuis .env (défaut 500)
const freeShippingThreshold = Number(config.public.freeShippingThreshold) || 500;

// Extraire le montant numérique du subtotal (qui est souvent une chaîne HTML comme "450.00 DH")
const currentSubtotal = computed(() => {
  if (!cart.value?.subtotal) return 0;
  // Nettoie la chaîne pour ne garder que les chiffres et les points/virgules
  const cleanString = String(cart.value.subtotal).replace(/[^0-9,.]/g, '').replace(',', '.');
  return parseFloat(cleanString) || 0;
});

// Calculer le montant restant
const remainingAmount = computed(() => {
  const diff = freeShippingThreshold - currentSubtotal.value;
  return diff > 0 ? Math.ceil(diff) : 0;
});

// Calculer le pourcentage de progression (max 100%)
const progressPercentage = computed(() => {
  const pct = (currentSubtotal.value / freeShippingThreshold) * 100;
  return Math.min(pct, 100);
});

// Vérifier si la livraison gratuite est atteinte
const hasFreeShipping = computed(() => currentSubtotal.value >= freeShippingThreshold);
</script>

<template>
  <div class="fixed top-0 bottom-0 right-0 z-50 flex flex-col w-11/12 max-w-lg overflow-x-hidden bg-white shadow-2xl">
    
    <!-- Header avec bouton fermer -->
    <div class="relative flex items-center justify-center p-6 border-b border-gray-100">
      <h2 class="text-lg font-bold text-gray-900">
        {{ $t('shop.cart') }}
        <span v-if="cart?.contents?.productCount" class="text-sm font-normal text-gray-500">
          ({{ cart.contents.productCount }})
        </span>
      </h2>
      <Icon
        name="ion:close-outline"
        class="absolute right-6 cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
        size="28"
        @click="toggleCart(false)" />
    </div>

    <ClientOnly>
      <template v-if="cart && !cart.isEmpty">
        
        <!-- 🚀 BARRE DE PROGRESSION LIVRAISON GRATUITE 🚀 -->
        <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold" :class="hasFreeShipping ? 'text-green-600' : 'text-gray-700'">
              {{ hasFreeShipping ? '🎉 Livraison gratuite débloquée !' : `Plus que ${remainingAmount} DH pour la livraison gratuite 🚚` }}
            </span>
            <span class="text-[10px] font-medium text-gray-400">
              {{ Math.round(progressPercentage) }}%
            </span>
          </div>
          
          <!-- Barre de progression -->
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-700 ease-out rounded-full"
              :class="hasFreeShipping ? 'bg-green-500' : 'bg-[#ff4f24]'"
              :style="{ width: `${progressPercentage}%` }">
            </div>
          </div>
        </div>

        <!-- Liste des produits -->
        <ul class="flex flex-col flex-1 gap-4 p-6 overflow-y-auto custom-scrollbar">
          <CartCard v-for="item in cart.contents?.nodes" :key="item.key" :item />
        </ul>

        <!-- Récapitulatif et Boutons -->
        <div class="px-6 pb-6 mb-safe md:px-8 space-y-4 bg-white border-t border-gray-100 pt-4">
          <div class="grid gap-2 text-sm font-medium text-gray-500 tabular-nums">
            <div class="flex justify-between">
              <span>{{ $t('shop.subtotal') }}</span>
              <span class="text-gray-900 font-semibold" v-html="cart.subtotal"></span>
            </div>
            <div v-if="cart.shippingTotal" class="flex justify-between">
              <span>{{ $t('general.shipping') }}</span>
              <span class="text-gray-900"> 
                {{ parseFloat(cart.shippingTotal) > 0 ? '+ ' : '' }} 
                <span v-html="cart.shippingTotal"></span> 
              </span>
            </div>
            <div v-if="cart.discountTotal && parseFloat(cart.rawDiscountTotal || '0') > 0" class="flex justify-between">
              <span>{{ $t('shop.discount') }}</span>
              <span class="text-green-600 font-semibold">- <span v-html="cart.discountTotal"></span></span>
            </div>
            
            <!-- Message Livraison Gratuite dans le récapitulatif -->
            <div v-if="hasFreeShipping" class="flex justify-between pt-2 border-t border-dashed border-gray-200">
              <span class="text-green-600 font-semibold">Livraison</span>
              <span class="text-green-600 font-bold">Gratuite</span>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex gap-3 pt-2">
            <Button to="/cart" variant="outline" @click="toggleCart(false)" class="flex-1">
              {{ $t('shop.viewCart') }}
            </Button>
            <Button
              :to="isCartMutating ? undefined : '/checkout'"
              class="flex-[2] bg-[#ff4f24] hover:bg-[#e64621] text-white font-bold"
              :disabled="isCartMutating"
              @click="!isCartMutating && toggleCart(false)">
              {{ $t('shop.checkout') }} <span v-html="cart.total" class="ml-1"></span>
            </Button>
          </div>
        </div>
      </template>

      <!-- Panier vide -->
      <EmptyCartMessage v-else-if="cart && cart.isEmpty" />
      
      <!-- Chargement initial -->
      <div v-else class="flex flex-col items-center justify-center flex-1 min-h-[300px]">
        <LoadingIcon />
      </div>
    </ClientOnly>

    <!-- Overlay de chargement lors des mutations -->
    <div v-if="cart && isCartMutating" class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
      <LoadingIcon />
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar personnalisée pour la liste des produits */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>