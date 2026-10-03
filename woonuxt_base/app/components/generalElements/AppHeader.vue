<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';


const announcementText = "🚚 Livraison à 19 DH et GRATUITE à partir de 199 DH !" ;

const lastScrollY = ref(0);
const isScrolled = ref(false);
const isHeaderVisible = ref(true);

// Verrou pour empêcher la boucle de vibration pendant l'animation
const isTransitioning = ref(false);
const SCROLL_THRESHOLD = 10;

const handleScroll = () => {
  if (isTransitioning.value) return;

  const currentScrollY = window.scrollY;
  
  if (currentScrollY <= 10) {
    if (!isHeaderVisible.value) {
      isHeaderVisible.value = true;
      activerVerrou();
    }
    isScrolled.value = false;
    lastScrollY.value = currentScrollY;
    return;
  }

  isScrolled.value = true;
  const scrollDifference = currentScrollY - lastScrollY.value;

  if (Math.abs(scrollDifference) < SCROLL_THRESHOLD) {
    return;
  }

  if (scrollDifference > 0) {
    if (isHeaderVisible.value) {
      isHeaderVisible.value = false;
      activerVerrou();
    }
  } else {
    if (!isHeaderVisible.value) {
      isHeaderVisible.value = true;
      activerVerrou();
    }
  }

  lastScrollY.value = currentScrollY;
};

const activerVerrou = () => {
  isTransitioning.value = true;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 350);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header class="sticky top-0 left-0 w-full z-40 bg-white border-b border-gray-100 shadow-sm">
    
    <!-- ✅ 2. BARRE D'ANNONCE (S'affiche uniquement si le texte est défini) -->
    <div v-if="announcementText" class="bg-[#ff4f24] text-white text-xs md:text-sm font-bold text-center py-1 px-6 tracking-wide">
      {{ announcementText }}
    </div>

    <div class="container px-4 md:px-6">

      <!-- ========================================== -->
      <!-- VERSION MOBILE                             -->
      <!-- ========================================== -->
      <div class="lg:hidden">
        
        <!-- Row 1 : Logo et Panier/Compte -->
        <div 
          class="flex items-center justify-between transition-all duration-300 ease-in-out overflow-hidden"
          :class="!isHeaderVisible && isScrolled ? 'max-h-0 opacity-0 py-0 mb-0' : 'max-h-24 opacity-100 py-2 mb-0'"
        >
          <Logo class="w-28" />
          <div class="flex items-center gap-4">
            <SignInLink />
          </div>
        </div>

        <!-- Row 2 : Menu et Recherche -->
        <div class="flex items-center gap-3 py-2">
          <MenuTrigger class="shrink-0" />
          <div class="flex-1">
            <ProductSearch />
          </div>
        </div>
        
      </div>

      <!-- ========================================== -->
      <!-- VERSION DESKTOP                            -->
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