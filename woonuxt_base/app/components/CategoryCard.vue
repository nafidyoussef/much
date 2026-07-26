<script setup lang="ts">
const { FALLBACK_IMG } = useHelpers();

defineProps({
  node: { type: Object, required: true },
  imageLoading: { type: String as PropType<'lazy' | 'eager'>, default: 'lazy' },
});

const imgWidth = 220;
const imgHeight = Math.round(imgWidth * 1.125);
</script>

<template>
  <NuxtLink
    v-if="node"
    :to="`/product-category/${decodeURIComponent(node.slug)}`"
    class="group relative block overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 snap-mandatory snap-x item">
    
    <!-- Image avec effet de zoom fluide au survol -->
    <NuxtPicture
      :width="imgWidth"
      :height="imgHeight"
      :src="node.image?.sourceUrl || FALLBACK_IMG"
      :alt="node.image?.altText || node.name"
      :title="node.image?.title || node.name"
      :loading="imageLoading"
      :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />

    <!-- Dégradé élégant qui s'intensifie au survol pour garantir la lisibilité du texte -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

    <!-- Contenu texte et icône -->
    <div class="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
      <div class="space-y-1">
        <span class="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
          Catégorie
        </span>
        <span 
          class="block text-lg font-bold text-white drop-shadow-md line-clamp-2 leading-tight group-hover:text-primary-50 transition-colors duration-300" 
          v-html="node.name"
        />
      </div>

      <!-- Icône "Explorer" qui apparaît avec une animation fluide -->
      <div class="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full translate-x-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-white group-hover:text-gray-900">
        <Icon name="ion:arrow-forward" size="20" />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  aspect-ratio: 4 / 5;
}

/* Optionnel : Masquer la scrollbar si ce composant est dans un conteneur défilant horizontal */
/* .snap-x::-webkit-scrollbar { display: none; } */
</style>