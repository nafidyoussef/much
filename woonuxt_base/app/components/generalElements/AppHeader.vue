<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// ✅ 1. État par défaut à TRUE. 
// Grâce au SSR de Nuxt, le HTML généré aura déjà la classe "visible".
// Le navigateur l'affichera instantanément, avant même l'hydratation JS.
const isHeaderVisible = ref(true);
const isScrolled = ref(false);
const lastScrollY = ref(0);

// ✅ 2. Utilisation de requestAnimationFrame pour des performances maximales
// et éviter la "vibration" du scroll sur mobile.
let ticking = false;
const SCROLL_THRESHOLD = 10;

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      
      // Si on est tout en haut de la page
      if (currentScrollY <= 10) {
        isHeaderVisible.value = true;
        isScrolled.value = false;
      } else {
        isScrolled.value = true;
        const scrollDifference = currentScrollY - lastScrollY.value;

        // Ignorer les micro-mouvements
        if (Math.abs(scrollDifference) > SCROLL_THRESHOLD) {
          if (scrollDifference > 0) {
            // Scroll vers le BAS -> Cacher
            isHeaderVisible.value = false;
          } else {
            // Scroll vers le HAUT -> Afficher
            isHeaderVisible.value = true;
          }
          lastScrollY.value = currentScrollY;
        }
      }
      ticking = false;
    });
    ticking = true;
  }
};

onMounted(() => {
  // Initialiser la position de départ au montage (côté client uniquement)
  lastScrollY.value = window.scrollY;
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <!-- sticky top-0 garantit qu'il reste en haut, z-40 pour passer au-dessus du contenu -->
  <header class="sticky top-0 left-0 w-full z-40 bg-white border-b border-gray-100 shadow-sm">
    <div class="container px-4 md:px-6">

      <!-- ========================================== -->
      <!-- VERSION MOBILE                           -->
      <!-- ========================================== -->
      <div class="lg:hidden">
        
        <!-- Row 1 : Logo et Panier/Compte -->
        <!-- ✅ Utilisation de translate-y au lieu de max-h-0 pour une animation fluide et sans saut de layout -->
        <div 
          class="flex items-center justify-between transition-transform duration-300 ease-in-out"
          :class="(!isHeaderVisible && isScrolled) ? '-translate-y-full' : 'translate-y-0'"
        >
          <Logo class="w-28" />
          <div class="flex items-center gap-4">
            <SignInLink />
          </div>
        </div>

        <!-- Row 2 : Menu et Recherche (Toujours visible ou ajustable selon tes besoins) -->
        <div class="flex items-center gap-3 py-2">
          <MenuTrigger class="shrink-0" />
          <div class="flex-1">
            <ProductSearch />
          </div>
        </div>
        
      </div>

      <!-- ========================================== -->
      <!-- VERSION DESKTOP (Toujours visible)         -->
      <!-- ========================================== -->
      <div class="hidden lg:flex h-20 items-center gap-8">
        <Logo class="w-40 shrink-0" />
        <MainMenu class="flex-1" />
        <div class="w-full max-w-xl">
          <ProductSearch />
        </div>
        <div class="flex items-center gap-5 shrink-0">
          <SignInLink />
          <CartTrigger />
        </div>
      </div>

    </div>
  </header>
</template>