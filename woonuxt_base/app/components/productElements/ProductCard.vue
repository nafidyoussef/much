<script setup lang="ts">
import type { ImageFragment, Product, ProductVariationFragment, VariationAttribute } from '#types/gql';

const route = useRoute();
useAppConfig();
const { addToCart, toggleCart } = useCart(); // 👈 Import du composable panier

const props = defineProps({
  node: { type: Object as PropType<Product>, required: true },
  index: { type: Number, default: 1 },
});

type ProductImage = {
  src: string;
  alt: string;
  title: string;
  key: string;
};

const imgWidth = 280;
const imgHeight = Math.round(imgWidth * 1.125);

const paColor = computed(() => (route.query?.filter as string | undefined)?.split('pa_color[')[1]?.split(']')[0]?.split(',') || []);
const placeholderImage = '/images/placeholder.jpg';

const sliderRef = ref<HTMLElement | null>(null);
const currentSlide = ref(0);
const isAdding = ref(false); // 👈 État de chargement local

const mainImage = computed<string>(() => props.node?.image?.productCardSourceUrl || props.node?.image?.sourceUrl || placeholderImage);

const matchesSelectedColor = (variation: ProductVariationFragment) => {
  if (!paColor.value.length) return false;
  const hasMatchingAttributes = variation.attributes?.nodes?.some((attribute: VariationAttribute) =>
    paColor.value.some((color) => attribute?.value?.includes(color)),
  );
  const hasMatchingSlug = paColor.value.some((color) => variation.slug?.includes(color));
  return hasMatchingAttributes || hasMatchingSlug;
};

const sliderImages = computed<ProductImage[]>(() => {
  const images: ProductImage[] = [];
  const seen = new Set<string>();
  const addImage = (image: ProductImage) => {
    if (!image?.src || seen.has(image.src)) return;
    seen.add(image.src);
    images.push(image);
  };
  const addVariationImage = (variation: ProductVariationFragment) => {
    const src = variation?.image?.productCardSourceUrl || variation?.image?.sourceUrl;
    if (!src) return;
    addImage({
      src,
      alt: variation?.image?.altText || props.node?.name || 'Product image',
      title: variation?.image?.title || props.node?.name || 'Product image',
      key: `variation-${variation?.databaseId || src}`,
    });
  };
  const addGalleryImage = (image: ImageFragment) => {
    if (!image?.sourceUrl) return;
    addImage({
      src: image.sourceUrl,
      alt: image?.altText || props.node?.name || 'Product image',
      title: image?.title || props.node?.name || 'Product image',
      key: `gallery-${image?.databaseId || image?.sourceUrl}`,
    });
  };

  const variations = props.node?.variations?.nodes || [];
  const gallery = props.node?.galleryImages?.nodes || [];
  const main = {
    src: mainImage.value,
    alt: props.node?.image?.altText || props.node?.name || 'Product image',
    title: props.node?.image?.title || props.node?.name || 'Product image',
    key: `main-${props.node?.image?.databaseId || mainImage.value}`,
  };

  if (paColor.value.length) {
    const matching = variations.filter((variation: ProductVariationFragment) => matchesSelectedColor(variation));
    if (matching.length) {
      if (matching.some((variation: ProductVariationFragment) => (variation?.image?.productCardSourceUrl || variation?.image?.sourceUrl) === main.src)) {
        addImage(main);
      }
      matching.forEach(addVariationImage);
      return images;
    }
  }

  if (main.src !== placeholderImage || (!variations.length && !gallery.length)) {
    addImage(main);
  }

  variations.forEach(addVariationImage);
  gallery.forEach(addGalleryImage);

  return images;
});

const activeVariationImageSrc = computed<string | null>(() => {
  if (!paColor.value.length) return null;
  const variations = props.node?.variations?.nodes || [];
  const activeColorImage = variations.filter((variation: ProductVariationFragment) => matchesSelectedColor(variation));
  if (activeColorImage?.length) return activeColorImage[0]?.image?.productCardSourceUrl || activeColorImage[0]?.image?.sourceUrl || null;
  return null;
});

const activeImageIndex = computed<number>(() => {
  if (!activeVariationImageSrc.value) return 0;
  const index = sliderImages.value.findIndex((image) => image.src === activeVariationImageSrc.value);
  return index >= 0 ? index : 0;
});

const productLink = computed<string>(() => {
  const baseUrl = `/product/${decodeURIComponent(props.node.slug || '')}`;
  if (paColor.value.length) {
    return `${baseUrl}?pa_color=${paColor.value[0]}`;
  }
  return baseUrl;
});

// 👇 Fonction d'ajout au panier
// 👇 Fonction d'ajout au panier
const handleAddToCart = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  if (props.node.type === 'VARIABLE' || props.node.type === 'GROUPED') {
    navigateTo(productLink.value);
    return;
  }

  isAdding.value = true;
  try {
    await addToCart({
      productId: props.node.databaseId,
      quantity: 1,
    });
    
    // 👇 C'EST ICI QUE LA MAGIE OPÈRE : On ouvre le panier
    toggleCart(true); 
    
  } catch (error) {
    console.error('Failed to add to cart:', error);
  } finally {
    isAdding.value = false;
  }
};

// 👇 Détermine si le bouton doit être affiché
const showAddButton = computed(() => {
  // Ne pas afficher pour les produits externes ou en rupture
  if (props.node.__typename === 'ExternalProduct') return false;
  if (props.node.__typename === 'SimpleProduct' && props.node.stockStatus === 'OUT_OF_STOCK') return false;
  return true;
});

const updateCurrentSlide = () => {
  const container = sliderRef.value;
  if (!container) return;
  const firstSlide = container.querySelector('.product-card-slide') as HTMLElement | null;
  const slideWidth = firstSlide?.offsetWidth || container.clientWidth;
  const styles = getComputedStyle(container);
  const gap = parseFloat(styles.columnGap || styles.gap || '0');
  const stride = slideWidth + gap;
  const index = stride ? Math.round(container.scrollLeft / stride) : 0;
  currentSlide.value = Math.min(Math.max(index, 0), Math.max(sliderImages.value.length - 1, 0));
};

const scrollToSlide = (index: number) => {
  const container = sliderRef.value;
  if (!container) return;
  const target = container.querySelector(`[data-index="${index}"]`) as HTMLElement | null;
  if (!target) return;
  container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
};

const syncActiveSlide = () => {
  nextTick(() => {
    const container = sliderRef.value;
    if (!container?.children?.length) return;
    const target = container.querySelector(`[data-index="${activeImageIndex.value}"]`) as HTMLElement | null;
    if (target) {
      container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
    currentSlide.value = activeImageIndex.value;
  });
};

onMounted(() => {
  syncActiveSlide();
  watch(
    () => [activeImageIndex.value, sliderImages.value.length],
    syncActiveSlide,
  );
});
</script>

<template>
  <div class="relative group w-full mt-0 px-2">
    
    <!-- Zone Image : Conteneur strict pour les badges et le slider -->
    <div class="relative w-full overflow-hidden rounded-xl bg-gray-100">
      
      <!-- Badge Promo (Z-index élevé pour rester au-dessus) -->
      <SaleBadge :node class="absolute z-20 top-3 right-3" />

      <!-- Slider : Suppression du gap ici pour un contrôle parfait, on gère le padding autrement si besoin -->
      <div
        ref="sliderRef"
        class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x hide-scrollbar"
        @scroll.passive="updateCurrentSlide"
      >
        <template v-for="(image, slideIndex) in sliderImages" :key="image.key">
          
          <!-- ✅ CORRECTION MAJEURE : w-full + shrink-0 + aspect-[8/9] garantissent une taille fixe -->
          <NuxtLink
            v-if="node.slug"
            class="product-card-slide relative block w-full shrink-0 snap-start snap-always overflow-hidden aspect-[8/9]"
            :data-index="slideIndex"
            :to="productLink"
          >
            <NuxtPicture
              :width="imgWidth"
              :height="imgHeight"
              :src="image.src"
              :alt="image.alt"
              :title="image.title"
              :loading="slideIndex === 0 && index <= 3 ? 'eager' : 'lazy'"
              :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
              class="absolute inset-0 w-full h-full"
              :img-attrs="{ 
                class: 'w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110' 
              }" 
            />
          </NuxtLink>

          <!-- Fallback si pas de slug (même structure stricte) -->
          <div
            v-else
            class="product-card-slide relative block w-full shrink-0 snap-start snap-always overflow-hidden aspect-[8/9]"
            :data-index="slideIndex"
          >
            <NuxtPicture
              :width="imgWidth"
              :height="imgHeight"
              :src="image.src"
              :alt="image.alt"
              :title="image.title"
              :loading="slideIndex === 0 && index <= 3 ? 'eager' : 'lazy'"
              :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
              class="absolute inset-0 w-full h-full"
              :img-attrs="{ 
                class: 'w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110' 
              }" 
            />
          </div>
        </template>
      </div>

      <!-- 👇 BOUTON "+" FLOTTANT (Positionné par rapport au conteneur image strict) -->
      <button
        v-if="showAddButton"
        @click="handleAddToCart"
        :disabled="isAdding"
        class="absolute bottom-3 right-3 z-20 flex items-center justify-center w-10 h-10 text-white bg-primary rounded-full shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:scale-110 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        :aria-label="node.type === 'VARIABLE' || node.type === 'GROUPED' ? 'Select options' : 'Add to cart'"
      >
        <svg v-if="isAdding" class="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        
        <svg v-else-if="node.type === 'SIMPLE'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>

        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>

      <!-- Badge Rupture de stock -->
      <div
        v-if="node.__typename === 'SimpleProduct' && node.stockStatus === 'OUT_OF_STOCK'"
        class="absolute bottom-3 right-3 z-20 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900/80 backdrop-blur-sm rounded-full shadow-sm">
        Rupture de stock
      </div>

      <!-- Indicateurs (Dots) du slider -->
      <div v-if="sliderImages.length > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
        <button
          v-for="(image, dotIndex) in sliderImages"
          :key="`dot-${image.key}`"
          class="product-card-dot rounded-full h-1.5 transition-all duration-300 pointer-events-auto"
          :class="dotIndex === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'"
          type="button"
          tabindex="-1"
          :aria-label="`Voir l'image ${dotIndex + 1}`"
          @click="scrollToSlide(dotIndex)"
        ></button>
      </div>
    </div>

    <!-- Zone Texte : Totalement indépendante de la taille de l'image -->
    <div class="p-1 mt-1">
    <!--   <StarRating v-if="storeSettings.showReviews" :rating="node.averageRating ?? undefined" :count="node.reviewCount ?? undefined" class="mb-1.5" /> -->
      
    <NuxtLink
  v-if="node.slug"
  :to="productLink"
  :title="node.name || undefined"
  class="block"
>
  <span
    class="text-[15px] font-normal leading-tight text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-300"
  >
    {{ node.name }}
  </span>
</NuxtLink>
      
      <ProductPrice class="mt-1.5 text-base font-bold text-gray-900" :sale-price="node.salePrice ?? undefined" :regular-price="node.regularPrice ?? undefined" />
    </div>

  </div>
</template>

<style scoped>
/* Masque la barre de défilement du slider tout en gardant le fonctionnement tactile/souris */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.item {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
</style>