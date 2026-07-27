<script setup lang="ts">
// Minimal desktop header
</script>

<template>

  <!-- ========================================== -->
  <!-- 📱 BARRE DE NAVIGATION MOBILE (Style App)  -->
  <!-- ========================================== -->
  <!-- ✅ Z-INDEX RÉDUIT À 30 : Passera en dessous des sidebars (qui sont généralement en z-50) -->
  <nav class="fixed py-1 bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
    <div class="flex items-center justify-around h-14 max-w-lg mx-auto">
      
      <!-- 1. Menu -->
      <MenuTrigger class="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors" />
      <!-- Fallback si MenuTrigger n'affiche pas d'icône :
      <button class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors">
        <Icon name="ion:menu" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Menu</span>
      </button> 
      -->

      <!-- 2. Accueil (Remplace Favoris) -->
      <NuxtLink to="/" class="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors">
        <Icon name="ion:home-outline" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Accueil</span>
      </NuxtLink>

      <!-- 3. Compte -->
      <NuxtLink to="/my-account" class="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors">
        <Icon name="ion:person-outline" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Compte</span>
      </NuxtLink>

      <!-- 4. Panier -->
      <!-- Utilisation d'un lien direct pour garantir un affichage propre, ou gardez <CartTrigger /> si vous préférez -->
      <div class="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors relative">
       <CartTrigger/>
      </div>

    </div>
  </nav>

</template>