<script setup lang="ts">
const currentSlide = ref(0);

const slides = [
  {
    image: '/images/MS.gif',
    alt: 'Collection Nouveau Année'
  },
  {
    image: '/images/MS-1.gif',
    alt: 'Collection Nouveau Année'
  },
  {
    image: '/images/MS-2.gif',
    alt: 'Collection Nouveau Année'
  }
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

let slideInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  if (slides.length > 1) {
    slideInterval = setInterval(nextSlide, 5000);
  }
});

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval);
});
</script>

<template>
  <!-- ✅ Mobile : w-full (100% largeur). Desktop (md) : max-w-7xl mx-auto (centré) + px-4 (marges) -->
  <div class="relative w-full md:max-w-8xl md:mx-auto md:px-4 lg:px-20">

    <!-- ✅ Slider Container optimisé -->
    <!-- Ajout de overflow-hidden et md:rounded-xl pour un rendu propre sur desktop -->
    <div class="relative w-full overflow-hidden md:rounded-xl" style="aspect-ratio: 330/150;">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        <NuxtPicture
          width="1320"
          height="600"
          :src="slide.image"
          :alt="slide.alt"
          :img-attrs="{ class: 'object-cover w-full h-full' }"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :preload="index === 0 ? { fetchPriority: 'high' } : undefined"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-container {
  width: 100%;
  overflow: hidden;
  contain: strict;
}

.marquee-content {
  display: flex;
  will-change: transform;
  animation: marquee 25s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-container:hover .marquee-content {
  animation-play-state: paused;
}
</style>