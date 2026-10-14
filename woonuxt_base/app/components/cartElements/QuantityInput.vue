<script setup lang="ts">
const { updateItemQuantity, isUpdatingCart, cart } = useCart();
const { debounce } = useHelpers();

const { item } = defineProps({ item: { type: Object, required: true } });

const MAX_QTY_PER_PRODUCT = 5; // ✅ Limite centrale

const productType = computed(() => (item.variation ? item.variation?.node : item.product?.node));
const quantity = ref(item.quantity);
const hasNoMoreStock = computed(() => (productType.value.stockQuantity ? productType.value.stockQuantity <= quantity.value : false));
const isOptimisticItem = computed(() => String(item.key || '').startsWith('optimistic:'));

const incrementQuantity = () => {
  // ✅ Empêche de dépasser 5 via le bouton +
  if (quantity.value >= MAX_QTY_PER_PRODUCT) {
    alert(`Vous ne pouvez pas ajouter plus de ${MAX_QTY_PER_PRODUCT} unités de ce produit.`);
    // 💡 Astuce Pro : Remplacez alert() par votre système de Toast/Notification mobile-first
    return;
  }
  quantity.value++;
};

const decrementQuantity = () => {
  // ✅ Empêche de passer en dessous de 0 (0 déclenchera probablement la suppression)
  if (quantity.value > 0) {
    quantity.value--;
  }
};

const debouncedUpdateQuantity = debounce((qty: unknown) => {
  let finalQty = Number(qty);
  
  // ✅ Correction des saisies manuelles invalides
  if (finalQty < 0) finalQty = 0;
  if (finalQty > MAX_QTY_PER_PRODUCT) {
    alert(`La quantité maximale est de ${MAX_QTY_PER_PRODUCT} unités.`);
    finalQty = MAX_QTY_PER_PRODUCT;
    quantity.value = MAX_QTY_PER_PRODUCT; // ✅ Force la correction visuelle dans l'input
  }

  if (Number.isFinite(finalQty)) {
    updateItemQuantity(item.key, finalQty);
  }
}, 250);

watch(quantity, debouncedUpdateQuantity);

const onFocusOut = () => {
  if (quantity.value === '' || quantity.value === null) {
    const cartItem = cart.value?.contents?.nodes?.find((node) => node.key === item.key);
    if (cartItem) {
      quantity.value = cartItem.quantity;
    }
  }
};
</script>

<template>
  <div class="flex rounded-sm bg-white text-sm leading-none shadow-xs shadow-gray-200 isolate">
    <button
      title="Decrease Quantity"
      aria-label="Decrease Quantity"
      type="button"
      class="focus:outline-hidden border-r w-6 h-6 border rounded-l border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed text-gray-700"
      :disabled="isUpdatingCart || isOptimisticItem || quantity <= 0"
      @click="decrementQuantity">
      <Icon name="ion:remove" size="14" />
    </button>
    
    <input
      v-model.number="quantity"
      type="number"
      min="0"
      :max="MAX_QTY_PER_PRODUCT" 
      :disabled="isOptimisticItem"
      aria-label="Quantity"
      class="flex items-center justify-center w-8 px-2 text-xs focus:outline-hidden border-y border-gray-300 text-center text-gray-900"
      @focusout="onFocusOut" 
    />
    
    <button
      title="Increase Quantity"
      aria-label="Increase Quantity"
      type="button"
      class="focus:outline-hidden border-l w-6 h-6 border rounded-r hover:bg-gray-50 border-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 text-gray-700"
      :disabled="isUpdatingCart || isOptimisticItem || hasNoMoreStock || quantity >= MAX_QTY_PER_PRODUCT"
      @click="incrementQuantity">
      <Icon name="ion:add" size="14" />
    </button>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>