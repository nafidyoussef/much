<script setup lang="ts">
const { navigateToLogin } = useAuth();
const route = useRoute();

// ✅ Les 8 catégories mères avec les icônes de l'image
const categories = [
  { name: 'Maison', slug: 'maison', icon: 'ion:home-outline' },
  { name: 'Cuisine', slug: 'cuisine', icon: 'ion:flame-outline' },
  { name: 'Tech', slug: 'tech', icon: 'ion:disc-outline' },
  { name: 'Beauté', slug: 'beaute', icon: 'ion:star-outline' },
  { name: 'Mode', slug: 'mode', icon: 'ion:diamond-outline' },
  { name: 'Auto', slug: 'auto', icon: 'ion:flash-outline' },
  { name: 'Kids', slug: 'kids', icon: 'ion:happy-outline' },
  { name: 'Sport', slug: 'sports-loisirs', icon: 'ion:ellipse-outline' },
];
</script>

<template>
  <nav class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 text-sm font-medium">
    
    <!-- Liens principaux -->
    <NuxtLink to="/" class="hover:text-[#ff4f24] transition-colors">{{ $t('general.home') }}</NuxtLink>
    <NuxtLink to="/products" class="hover:text-[#ff4f24] transition-colors">{{ $t('general.products') }}</NuxtLink>

    <!-- 📱 VERSION MOBILE (Sidebar) -->
    <div class="md:hidden w-full mt-2 border-t border-gray-100 pt-4">
      <div class="flex items-center gap-2 mb-3 text-gray-900 font-semibold uppercase tracking-wide text-xs">
        <Icon name="ion:grid" class="w-4 h-4 text-[#ff4f24]" />
        <span>{{ $t('shop.category', 2) }}</span>
      </div>
      
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/product-category/${cat.slug}`"
          class="flex items-center gap-3 px-2 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#ff4f24] transition-colors"
        >
          <Icon :name="cat.icon" class="w-5 h-5 text-gray-400" />
          <span class="text-sm font-medium">{{ cat.name }}</span>
        </NuxtLink>
        
        <NuxtLink 
          to="/categories" 
          class="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-semibold text-[#ff4f24] hover:bg-[#ff4f24]/5 transition-colors mt-2 border-t border-gray-100 pt-3"
        >
          <span>Voir toutes les catégories</span>
          <Icon name="ion:arrow-forward" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- 🖥️ VERSION DESKTOP : Dropdown au survol -->
    <div class="hidden md:block relative group w-auto">
      <button class="w-auto flex items-center justify-start gap-1 py-2 hover:text-[#ff4f24] transition-colors">
        <span>{{ $t('shop.category', 2) }}</span>
        <Icon name="ion:chevron-down" class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
      </button>

      <div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
        <div class="p-2 max-h-80 overflow-y-auto scrollbar-hide">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/product-category/${cat.slug}`"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#ff4f24] transition-colors group/item"
          >
            <Icon :name="cat.icon" class="w-5 h-5 text-gray-400 group-hover/item:text-[#ff4f24] transition-colors" />
            <span class="text-sm">{{ cat.name }}</span>
          </NuxtLink>
          
          <div class="mt-2 border-t border-gray-100 pt-2">
            <NuxtLink 
              to="/categories" 
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-[#ff4f24] hover:bg-[#ff4f24]/5 transition-colors"
            >
              <span>Voir toutes les catégories</span>
              <Icon name="ion:arrow-forward" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Liens de fin -->
    <NuxtLink to="/contact" class="hover:text-[#ff4f24] transition-colors">{{ $t('general.contact') }}</NuxtLink>
    
    <!-- Liens spécifiques Mobile -->
    <NuxtLink class="md:hidden hover:text-[#ff4f24] transition-colors mt-4 border-t border-gray-100 pt-4 w-full" to="/wishlist" :prefetch="false">Favoris</NuxtLink>
    <NuxtLink class="md:hidden hover:text-[#ff4f24] transition-colors w-full" to="/my-account" :prefetch="false" @click="navigateToLogin(route.fullPath)">Mon Compte</NuxtLink>
  </nav>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>