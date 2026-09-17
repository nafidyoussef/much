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
const currentIndex = ref(0);

const galleryImages = computed<ImageFragment[]>(() => {
  return [primaryImage.value, ...(props.gallery.nodes || [])].filter(
    (img, index, self) => index === self.findIndex((t) => t?.databaseId === img?.databaseId)
  );
});

const changeImage = (image: ImageFragment) => {
  if (image) {
    imageToShow.value = image;
    currentIndex.value = galleryImages.value.findIndex((img) => img.databaseId === image.databaseId);
    updateTrackPosition();
  }
};

const goToIndex = (index: number) => {
  const images = galleryImages.value;
  if (index < 0 || index >= images.length) return;
  currentIndex.value = index;
  imageToShow.value = images[index]!;
  updateTrackPosition();
};

const changeImageByOffset = (offset: number) => {
  const images = galleryImages.value;
  if (images.length <= 1) return false;
  const nextIndex = (currentIndex.value + offset + images.length) % images.length;
  goToIndex(nextIndex);
  return true;
};

// --- Swipe Logic Optimized for Performance ---
const trackRef = ref<HTMLElement | null>(null);
let startX = 0;
let currentX = 0;
let isDragging = false;
const SWIPE_THRESHOLD = 40; // Slightly lower for faster response
const GAP = 4; // 4px gap (gap-1)

const getSlideWidth = () => {
  if (!trackRef.value || !trackRef.value.children[0]) return 0;
  return (trackRef.value.children[0] as HTMLElement).offsetWidth;
};

const updateTrackPosition = (extraOffset = 0) => {
  if (!trackRef.value) return;
  const slideWidth = getSlideWidth();
  const offset = -(currentIndex.value * (slideWidth + GAP)) + extraOffset;
  trackRef.value.style.transform = `translateX(${offset}px)`;
};

const onTouchStart = (e: TouchEvent) => {
  startX = e.touches[0]!.clientX;
  isDragging = true;
  // Remove transition for instant 1:1 finger tracking
  if (trackRef.value) {
    trackRef.value.style.transition = 'none';
    trackRef.value.style.willChange = 'transform';
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging) return;
  currentX = e.touches[0]!.clientX - startX;
  // Direct DOM manipulation for maximum smoothness
  updateTrackPosition(currentX);
};

const onTouchEnd = () => {
  if (!isDragging) return;
  isDragging = false;
  
  if (trackRef.value) {
    // Restore transition for smooth snapping
    trackRef.value.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    trackRef.value.style.willChange = 'auto';
  }

  if (Math.abs(currentX) > SWIPE_THRESHOLD) {
    if (currentX > 0) {
      changeImageByOffset(-1);
    } else {
      changeImageByOffset(1);
    }
  } else {
    // Snap back to current image
    updateTrackPosition();
  }
  
  currentX = 0;
};

watch(
  () => props.activeVariation,
  (newVal) => {
    if (newVal?.image) {
      const foundImage = galleryImages.value.find(
        (img) => img.sourceUrl && img.sourceUrl === newVal.image?.sourceUrl
      );
      if (foundImage) {
        changeImage(foundImage as ImageFragment);
      }
    }
  }
);

// Handle window resize to recalculate positions


const imgWidth = 640;

const thumbnailPosition = computed<ThumbnailPosition>(() =>
  storeSettings.productGalleryThumbnailsPosition === 'left' ? 'left' : 'bottom'
);
const showLeftThumbnails = computed(() => thumbnailPosition.value === 'left');

const galleryRootClasses = computed(() => [
  'w-full min-w-0',
  { 'lg:grid lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start lg:gap-4': showLeftThumbnails.value },
]);

const thumbnailListClasses = computed(() => [
  'mt-4 flex gap-3 overflow-auto scrollbar-none p-1 [&::-webkit-scrollbar]:hidden',
  showLeftThumbnails.value
    ? 'lg:order-first lg:mt-0 lg:max-h-[min(640px,calc(100vh-160px))] lg:w-24 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto'
    : '',
]);

const thumbnailButtonClasses = (galleryImg: ImageFragment) => [
  'size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-offset-2 transition',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  showLeftThumbnails.value ? 'lg:size-22' : '',
  galleryImg.databaseId === imageToShow.value.databaseId
    ? 'ring-2 ring-primary'
    : 'ring-1 ring-gray-200 hover:ring-gray-400',
];

const dotClasses = (index: number) => [
  'h-2 rounded-full transition-all duration-300',
  index === currentIndex.value ? 'w-6 bg-primary' : 'w-2 bg-gray-300',
];
</script>

<template>
  <div :class="galleryRootClasses">
    <!-- Mobile version with swipe -->
    <div class="lg:hidden w-full">
      <div class="relative w-full">
        <!-- Swipeable image container -->
        <div class="relative w-full overflow-hidden rounded-xl bg-gray-100">
          <div
            ref="trackRef"
            class="flex h-full gap-1 transition-transform duration-300 ease-out"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div
              v-for="(galleryImg, idx) in galleryImages"
              :key="galleryImg.databaseId"
              class="relative h-full w-[calc(100%-12px)] flex-shrink-0"
            >
              <SaleBadge v-if="idx === 0" :node class="absolute text-base top-4 right-4 z-10" />
              <NuxtPicture
                :width="imgWidth"
                :height="imgWidth"
                sizes="100vw"
                :alt="galleryImg.altText || node.name"
                :title="galleryImg.title || node.name"
                :src="galleryImg.sourceUrl || FALLBACK_IMG"
                :preload="idx === 0 ? { fetchPriority: 'high' } : undefined"
                loading="lazy"
                :img-attrs="{ class: 'h-full w-full object-contain rounded-xl' }"
              />
            </div>
          </div>
        </div>

        <!-- Swipe indicators (dots) -->
        <div
          v-if="galleryImages.length > 1"
          class="mt-3 flex items-center justify-center gap-1.5"
        >
          <button
            v-for="(galleryImg, idx) in galleryImages"
            :key="galleryImg.databaseId"
            :class="dotClasses(idx)"
            type="button"
            :aria-label="`Go to image ${idx + 1}`"
            :aria-pressed="idx === currentIndex"
            @click="goToIndex(idx)"
          ></button>
        </div>
      </div>
    </div>

    <!-- Desktop version (original) -->
    <div class="hidden lg:block">
      <div class="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl bg-gray-100">
        <SaleBadge :node class="absolute text-base top-4 right-4" />
        <NuxtPicture
          :width="imgWidth"
          :height="imgWidth"
          sizes="412px:100vw sm:100vw md:50vw lg:50vw xl:640px"
          :alt="imageToShow.altText || node.name"
          :title="imageToShow.title || node.name"
          :src="imageToShow.sourceUrl || FALLBACK_IMG"
          :preload="{ fetchPriority: 'high' }"
          :img-attrs="{ class: 'h-full w-full object-contain' }"
        />

        <button
          v-if="galleryImages.length > 1"
          class="absolute left-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 text-gray-900 shadow-md transition-[background-color,box-shadow] ease-in hover:bg-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="button"
          :aria-label="`Previous image for ${node.name}`"
          @click="changeImageByOffset(-1)"
        >
          <Icon name="ion:chevron-back-outline" size="24" />
        </button>

        <button
          v-if="galleryImages.length > 1"
          class="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 text-gray-900 shadow-md transition-[background-color,box-shadow] ease-in hover:bg-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="button"
          :aria-label="`Next image for ${node.name}`"
          @click="changeImageByOffset(1)"
        >
          <Icon name="ion:chevron-forward-outline" size="24" />
        </button>
      </div>

      <!-- Thumbnails for desktop only -->
      <div v-if="gallery.nodes.length" :class="thumbnailListClasses">
        <button
          v-for="galleryImg in galleryImages"
          :key="galleryImg.databaseId"
          :class="thumbnailButtonClasses(galleryImg)"
          type="button"
          :aria-label="`Show image for ${node.name}`"
          :aria-pressed="galleryImg.databaseId === imageToShow.databaseId"
          @click="changeImage(galleryImg)"
        >
          <NuxtPicture
            :width="160"
            :height="160"
            :src="galleryImg.sourceUrl || FALLBACK_IMG"
            :alt="galleryImg.altText || node.name"
            loading="lazy"
            :img-attrs="{ class: 'h-full w-full object-contain' }"
          />
        </button>
      </div>
    </div>
  </div>
</template>