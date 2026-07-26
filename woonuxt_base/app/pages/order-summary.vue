<script setup lang="ts">
const route = useRoute();
// ✅ Utilisation des bonnes méthodes de votre composable useCart
const { emptyCart, refreshCart } = useCart();

const orderNumber = computed(() => {
  const id = route.params.orderId;
  return Array.isArray(id) ? id[0] : id || '';
});

const hasClearedCart = ref<boolean>(false);

const clearCartIfNeeded = async () => {
  // Évite de vider le panier plusieurs fois ou si on n'a pas de numéro de commande
  if (hasClearedCart.value || !orderNumber.value) return;
  
  hasClearedCart.value = true;
  
  try {
    await emptyCart();
    await refreshCart();
    console.log('✅ Panier vidé et rafraîchi avec succès pour la commande #' + orderNumber.value);
  } catch (error) {
    console.error('⚠️ Erreur lors du vidage du panier:', error);
  }
};

// Protection : si pas d'orderId, rediriger vers l'accueil
if (!orderNumber.value) {
  navigateTo('/');
}

onMounted(async () => {
  // Vider le panier une fois la page de remerciement chargée
  await clearCartIfNeeded();
});

useHead({
  title: 'Merci pour votre commande',
});
</script>

<template>
  <main class="container mx-auto px-4 py-16">
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-10 text-center">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            class="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Merci pour votre commande !
      </h1>

      <p class="text-gray-600 text-lg mb-6">
        Nous avons bien reçu votre commande.
      </p>

      <div class="bg-gray-100 rounded-lg p-5 mb-8">
        <p class="text-gray-500 text-sm">
          Votre numéro de commande
        </p>

        <p class="text-2xl font-bold text-primary mt-2">
          #{{ orderNumber }}
        </p>
      </div>

      <p class="text-gray-500 mb-8">
        Un e-mail de confirmation vous sera envoyé avec les détails de votre commande.
      </p>

      <NuxtLink
        to="/"
        class="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
      >
        Retour à l'accueil
      </NuxtLink>
    </div>
  </main>
</template>