<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// ==========================================
// 📜 Logique de détection du scroll (Mobile)
// ==========================================
const lastScrollY = ref(0);
const isScrollingDown = ref(false);
const isScrolled = ref(false);

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  // On active l'effet seulement après 50px de scroll pour éviter les clignotements
  if (currentScrollY > 50) {
    isScrolled.value = true;
    isScrollingDown.value = currentScrollY > lastScrollY.value;
  } else {
    isScrolled.value = false;
    isScrollingDown.value = false;
  }
  
  lastScrollY.value = currentScrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-shadow duration-300">
    <div class="container">

      <!-- ========================================== -->
      <!-- 📱 VERSION MOBILE                           -->
      <!-- ========================================== -->
      <div class="lg:hidden py-3">
        
        <!-- Row 1 : Logo, Menu, Compte, Panier (Se rétracte au scroll vers le bas) -->
        <div 
          class="flex items-center justify-between transition-all duration-300 ease-in-out overflow-hidden"
          :class="isScrollingDown && isScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-24 opacity-100 mb-3'"
        >
          <div class="flex items-center gap-3">
            <MenuTrigger />
            <Logo class="w-32" />
          </div>

          <div class="flex items-center gap-4">
            <SignInLink />
            <CartTrigger />
          </div>
        </div>

        <!-- Row 2 : Recherche (Toujours visible, devient le seul élément en haut) -->
        <ProductSearch />
        
      </div>

      <!-- ========================================== -->
      <!-- 🖥️ VERSION DESKTOP (Inchangée)             -->
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