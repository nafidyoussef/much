<script setup lang="ts">
import type { ImageFragment, Product, Variation } from '#types/gql';

const { FALLBACK_IMG } = useHelpers();

type Gallery = { nodes: ImageFragment[] };

const props = defineProps({
  mainImage: { type: Object as PropType<ImageFragment>, required: true },
  gallery: { type: Object as PropType<Gallery>, required: true },
  node: { type: Object as PropType<Product | Variation>, required: true },
  activeVariation: { type: Object as PropType<Variation | null>, default: null },
});

const galleryImages = computed<ImageFragment[]>(() => {
  const mainImg = {
    sourceUrl: props.mainImage.sourceUrl || FALLBACK_IMG,
    title: props.mainImage.title,
    altText: props.mainImage.altText,
    databaseId: props.mainImage.databaseId,
  };
  
  return [mainImg, ...(props.gallery.nodes || [])].filter(
    (img, index, self) => img && index === self.findIndex((t) => t?.databaseId === img?.databaseId)
  );
});

// Synchroniser avec la variation active (optionnel)
watch(
  () => props.activeVariation,
  (newVal) => {
    if (newVal?.image) {
      // Scroll automatique vers l'image de la variation si elle existe
      const index = galleryImages.value.findIndex((img) => img.sourceUrl === newVal.image?.sourceUrl);
      if (index > 0 && import.meta.client) {
        const container = document.querySelector('.vertical-gallery-container');
        if (container) {
          container.scrollTo({
            top: index * 400, // Ajuster selon la hauteur de chaque image
            behavior: 'smooth'
          });
        }
      }
    }
  },
);
</script>

<template>
  <section class="mt-16 md:mt-24 border-t border-gray-100 pt-1">
    
    <!-- Galerie verticale scrollable -->
    <div class="vertical-gallery-container max-w-3xl mx-auto flex flex-col gap-6 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
      <div
        v-for="img in galleryImages"
        :key="img.databaseId"
        class="shrink-0"
      >
        <div class="relative group aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
          <NuxtPicture
            :width="800"
            :height="800"
            sizes="sm:100vw md:50vw lg:50vw xl:800px"
            :alt="img.altText || node.name"
            :title="img.title || node.name"
            :src="img.sourceUrl || FALLBACK_IMG"
            loading="lazy"
            :img-attrs="{ class: 'h-full w-full object-contain' }"
          />
          
          <!-- Numéro de l'image -->
          <div class="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
            {{ galleryImages.indexOf(img) + 1 }} / {{ galleryImages.length }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Indicateur de scroll -->
    <div class="max-w-3xl mx-auto mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
      <Icon name="ion:arrow-down-outline" size="16" />
      <span>Faites défiler pour voir plus d'images</span>
    </div>
  </section>
</template>

<style scoped>
/* Scrollbar personnalisée */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}
</style>