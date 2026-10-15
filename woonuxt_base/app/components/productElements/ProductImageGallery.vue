<script setup lang="ts">
import type { ImageFragment, Product, Variation } from '#types/gql';

const { FALLBACK_IMG } = useHelpers();
const { storeSettings } = useAppConfig();

type Gallery = { nodes: ImageFragment[] };
type ThumbnailPosition = 'bottom' | 'left';

const props = defineProps({
  mainImage: { type: Object as PropType<ImageFragment>, required: true },
  gallery: { type: Object as PropType<Gallery>, required: true },
  node: { type: Object as PropType<Product | Variation>, required: true },
  activeVariation: { type: Object as PropType<Variation | null>, default: null },
});

const primaryImage = computed<ImageFragment>(() => ({
  sourceUrl: props.mainImage.sourceUrl || FALLBACK_IMG,
  title: props.mainImage.title,
  altText: props.mainImage.altText,
  databaseId: props.mainImage.databaseId,
}));

const imageToShow = ref<ImageFragment>(primaryImage.value);

const galleryImages = computed<ImageFragment[]>(() => {
  return [primaryImage.value, ...(props.gallery.nodes || [])].filter((img, index, self) => index === self.findIndex((t) => t?.databaseId === img?.databaseId));
});

const changeImage = (image: ImageFragment) => {
  if (image) imageToShow.value = image;
};

const changeImageByOffset = (offset: number) => {
  const images = galleryImages.value;
  if (images.length <= 1) return false;

  const currentIndex = images.findIndex((image) => image.databaseId === imageToShow.value.databaseId);
  const fallbackIndex = offset > 0 ? 0 : images.length - 1;
  const nextIndex = currentIndex === -1 ? fallbackIndex : (currentIndex + offset + images.length) % images.length;
  const nextImage = images[nextIndex];
  if (nextImage) {
    changeImage(nextImage);
    return true;
  }
  return false;
};

// ==========================================
// 🔍 LOGIQUE GALERIE PLEIN ÉCRAN (LIGHTBOX)
// ==========================================
const isGalleryOpen = ref(false);
const activeGalleryIndex = ref(0);
const isImageZoomed = ref(false);

const openGallery = (index: number) => {
  activeGalleryIndex.value = index;
  isGalleryOpen.value = true;
  isImageZoomed.value = false;
  // Empêche le défilement de la page en arrière-plan
  document.body.style.overflow = 'hidden';
};

const closeGallery = () => {
  isGalleryOpen.value = false;
  isImageZoomed.value = false;
  document.body.style.overflow = '';
};

const nextImage = () => {
  isImageZoomed.value = false; // Réinitialise le zoom lors du changement
  activeGalleryIndex.value = (activeGalleryIndex.value + 1) % galleryImages.value.length;
};

const prevImage = () => {
  isImageZoomed.value = false;
  activeGalleryIndex.value = (activeGalleryIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length;
};

const toggleZoom = () => {
  isImageZoomed.value = !isImageZoomed.value;
};
// ==========================================

const mainImageContainer = ref<HTMLElement | null>(null);
const handleImageTap = (event: MouseEvent | TouchEvent) => {
  if (!mainImageContainer.value || galleryImages.value.length <= 1) return;
  
  const rect = mainImageContainer.value.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0]!.clientX : event.clientX;
  const clickX = clientX - rect.left;
  const containerWidth = rect.width;
  
  const leftThreshold = containerWidth * 0.3;
  const rightThreshold = containerWidth * 0.7;
  
  if (clickX < leftThreshold) {
    changeImageByOffset(-1);
  } else if (clickX > rightThreshold) {
    changeImageByOffset(1);
  }
};

watch(
  () => props.activeVariation,
  (newVal) => {
    if (newVal?.image) {
      const foundImage = galleryImages.value.find((img) => img.sourceUrl && img.sourceUrl === newVal.image?.sourceUrl);
      if (foundImage) {
        imageToShow.value = foundImage;
        // Mettre à jour l'index de la galerie si on change de variation
        const newIndex = galleryImages.value.findIndex(img => img.databaseId === foundImage.databaseId);
        if (newIndex !== -1) activeGalleryIndex.value = newIndex;
      }
    }
  },
);

const imgWidth = 1200;

const thumbnailPosition = computed<ThumbnailPosition>(() => (storeSettings.productGalleryThumbnailsPosition === 'left' ? 'left' : 'bottom'));
const showLeftThumbnails = computed(() => thumbnailPosition.value === 'left');

const galleryRootClasses = computed(() => [
  'w-full min-w-0',
  { 'lg:grid lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start lg:gap-4': showLeftThumbnails.value },
]);

const thumbnailListClasses = computed(() => [
  'mt-4 flex gap-3 overflow-auto scrollbar-none p-1 [&::-webkit-scrollbar]:hidden',
  showLeftThumbnails.value ? 'lg:order-first lg:mt-0 lg:max-h-[min(640px,calc(100vh-160px))] lg:w-24 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto' : '',
]);

const thumbnailButtonClasses = (galleryImg: ImageFragment) => [
  'size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-offset-2 transition',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  showLeftThumbnails.value ? 'lg:size-22' : '',
  galleryImg.databaseId === imageToShow.value.databaseId ? 'ring-2 ring-primary' : 'ring-1 ring-gray-200 hover:ring-gray-400',
];
</script>

<template>
  <div :class="galleryRootClasses">
    <!-- Conteneur d'image principal -->
    <div 
      ref="mainImageContainer"
      class="relative group aspect-square w-full min-w-0 overflow-hidden rounded-xl bg-gray-100 select-none cursor-pointer"
      @click="handleImageTap"
    >
      <SaleBadge :node class="absolute text-base top-4 right-4 z-20 pointer-events-none" />
      
      <NuxtPicture
        :width="imgWidth"
        :height="imgWidth"
        sizes="100vw sm:100vw md:50vw lg:50vw xl:800px"
        :alt="imageToShow.altText || node.name"
        :title="imageToShow.title || node.name"
        :src="imageToShow.sourceUrl || FALLBACK_IMG"
        fetchpriority="high" 
        decoding="async"
        loading="eager"
        :img-attrs="{ class: 'h-full w-full object-contain' }" 
      />

      <!-- ✅ BOUTON D'OUVERTURE DE LA GALERIE (Bas droite) -->
      <button
        type="button"
        class="absolute bottom-4 right-4 z-20 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all duration-200"
        aria-label="Ouvrir la galerie d'images en plein écran"
        @click.stop="openGallery(0)"
      >
        <Icon name="ion:expand-outline" size="22" />
      </button>

      <!-- Zones de navigation tactiles (gauche/droite) -->
      <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-black/5 to-transparent"></div>
        <div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-black/5 to-transparent"></div>
      </div>

      <!-- Bouton Précédent (Visible au survol sur desktop) -->
      <button
        v-if="galleryImages.length > 1"
        class="absolute left-2 top-1/2 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md transition-opacity md:opacity-0 md:group-hover:opacity-100 hover:bg-white"
        type="button"
        @click.stop="changeImageByOffset(-1)"
      >
        <Icon name="ion:chevron-back-outline" size="24" />
      </button>

      <!-- Bouton Suivant (Visible au survol sur desktop) -->
      <button
        v-if="galleryImages.length > 1"
        class="absolute right-12 top-1/2 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md transition-opacity md:opacity-0 md:group-hover:opacity-100 hover:bg-white"
        type="button"
        @click.stop="changeImageByOffset(1)"
      >
        <Icon name="ion:chevron-forward-outline" size="24" />
      </button>
    </div>

    <!-- Miniatures sous l'image principale -->
    <div v-if="gallery.nodes.length" :class="thumbnailListClasses">
      <button
        v-for="(galleryImg, index) in galleryImages"
        :key="galleryImg.databaseId"
        :class="thumbnailButtonClasses(galleryImg)"
        type="button"
        :aria-pressed="galleryImg.databaseId === imageToShow.databaseId"
        @click="changeImage(galleryImg); activeGalleryIndex = index;"
      >
        <NuxtPicture
          :width="160"
          :height="160"
          sizes="80px"
          :src="galleryImg.sourceUrl || FALLBACK_IMG"
          :alt="galleryImg.altText || node.name"
          loading="lazy"
          :img-attrs="{ class: 'h-full w-full object-contain' }" 
        />
      </button>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- ✅ VISIONNEUSE PLEIN ÉCRAN (LIGHTBOX) -->
  <!-- ========================================== -->
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isGalleryOpen" 
        class="fixed inset-0 z-[100] bg-black/95 flex flex-col"
        @click="closeGallery"
      >
        <!-- Header : Compteur et Bouton Fermer -->
        <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white">
          <span class="text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {{ activeGalleryIndex + 1 }} / {{ galleryImages.length }}
          </span>
          <button 
            class="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            @click.stop="closeGallery"
            aria-label="Fermer la galerie"
          >
            <Icon name="ion:close-outline" size="28" />
          </button>
        </div>

        <!-- Zone d'image centrale -->
        <div class="flex-1 flex items-center justify-center relative w-full h-full" @click.stop>
          
          <!-- Bouton Précédent -->
          <button 
            v-if="galleryImages.length > 1"
            class="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            @click.stop="prevImage"
          >
            <Icon name="ion:chevron-back-outline" size="32" />
          </button>

          <!-- Image avec Zoom au clic -->
          <img
            :src="galleryImages[activeGalleryIndex]?.sourceUrl || FALLBACK_IMG"
            class="max-w-full max-h-full object-contain transition-transform duration-300 ease-out cursor-zoom-in"
            :class="{ 'scale-150 md:scale-200 cursor-zoom-out': isImageZoomed }"
            @click.stop="toggleZoom"
          />

          <!-- Bouton Suivant -->
          <button 
            v-if="galleryImages.length > 1"
            class="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            @click.stop="nextImage"
          >
            <Icon name="ion:chevron-forward-outline" size="32" />
          </button>
        </div>

        <!-- Bandeau de miniatures en bas -->
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div class="flex gap-3 overflow-x-auto scrollbar-none justify-center md:justify-start px-4">
            <button
              v-for="(img, index) in galleryImages"
              :key="img.databaseId"
              class="relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all"
              :class="index === activeGalleryIndex ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'"
              @click.stop="activeGalleryIndex = index; isImageZoomed = false;"
            >
              <img :src="img.sourceUrl || FALLBACK_IMG" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Animation d'ouverture/fermeture de la lightbox */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>