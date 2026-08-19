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
  
  // Fusionne l'image principale et la galerie, en supprimant les doublons
  return [mainImg, ...(props.gallery.nodes || [])].filter(
    (img, index, self) => img && index === self.findIndex((t) => t?.databaseId === img?.databaseId)
  );
});
</script>

<template>
  <section class="mt-16 md:mt-24 border-t border-gray-100 pt-1">
    
    
    <!-- Conteneur simple : les images s'empilent naturellement -->
    <div class="max-w-3xl mx-auto flex flex-col gap-6">
      <div
        v-for="(img, index) in galleryImages"
        :key="img.databaseId || index"
        class="relative w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100"
      >
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
        
        <!-- Petit badge indiquant le numéro de l'image (optionnel mais élégant) -->
        <div class="absolute top-4 left-4 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
          {{ index + 1 }} / {{ galleryImages.length }}
        </div>
      </div>
    </div>
  </section>
</template>