<script setup lang="ts">
// Minimal desktop header
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
    <div class="container">

      <!-- ========================================== -->
      <!-- 📱 VERSION MOBILE (Header du haut)         -->
      <!-- ========================================== -->
      <div class="lg:hidden py-3">
        <!-- Row 1 : Logo + Actions rapides -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <MenuTrigger />
            <Logo class="w-32" />
          </div>

          <div class="flex items-center gap-4">
            <!-- On garde un accès rapide au panier en haut aussi, ou on peut le retirer si la barre du bas suffit -->
            <CartTrigger />
          </div>
        </div>

        <!-- Row 2 : Recherche -->
        <ProductSearch />
      </div>

      <!-- ========================================== -->
      <!-- 🖥️ VERSION DESKTOP                         -->
      <!-- ========================================== -->
      <div class="hidden lg:flex h-20 items-center gap-8">
        <!-- Logo -->
        <Logo class="w-40 shrink-0" />

        <!-- Menu Principal -->
        <MainMenu class="flex-1" />
        
        <!-- Recherche centrée -->
        <div class="w-full max-w-xl">
          <ProductSearch />
        </div>

        <!-- Actions Droite -->
        <div class="flex items-center gap-5 shrink-0">
          <SignInLink />
          <CartTrigger />
        </div>
      </div>

    </div>
  </header>

  <!-- ========================================== -->
  <!-- 📱 BARRE DE NAVIGATION MOBILE (Style App)  -->
  <!-- ========================================== -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
    <div class="flex items-center justify-around h-16 max-w-lg mx-auto">
      
      <!-- 1. Menu -->
      <MenuTrigger class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors" />
      <!-- 💡 Si MenuTrigger ne prend pas les classes, remplacez la ligne ci-dessus par :
      <button class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#ff4f24]">
        <Icon name="ion:menu" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Menu</span>
      </button> 
      -->

      <!-- 2. Compte -->
      <NuxtLink to="/my-account" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors">
        <Icon name="ion:person-outline" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Compte</span>
      </NuxtLink>

      <!-- 3. Favoris (Wishlist) -->
      <NuxtLink to="/wishlist" class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors">
        <Icon name="ion:heart-outline" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Favoris</span>
      </NuxtLink>

      <!-- 4. Panier (Cart) -->
      <div class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#ff4f24] active:text-[#ff4f24] transition-colors relative">
        <CartTrigger />
        <!-- 💡 Si CartTrigger est trop gros ou déforme la barre, remplacez-le par :
        <Icon name="ion:cart-outline" class="w-6 h-6" />
        <span class="text-[10px] font-medium mt-0.5">Panier</span>
        <span class="absolute top-2 right-6 w-4 h-4 bg-[#ff4f24] text-white text-[9px] font-bold flex items-center justify-center rounded-full">0</span> 
        -->
      </div>

    </div>
  </nav>

</template>