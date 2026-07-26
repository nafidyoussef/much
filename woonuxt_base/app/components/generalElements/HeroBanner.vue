<script setup lang="ts">
const currentSlide = ref(0);

// Vous pouvez ajouter d'autres images ici si besoin
const slides = [
  {
    image: '/images/hero-4.jpg',
    alt: 'Collection Nouveau Année'
  },
  {
    image: '/images/hero-4.jpg',
    alt: 'Collection Nouveau Année'
  },
  {
    image: '/images/hero-4.jpg',
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
  <div class="relative mx-auto w-full">
    <!-- Slider Container optimisé -->
    <div class="relative w-full" style="aspect-ratio: 330/150;">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        <!-- ✅ REMPLACEMENT : <img> native pour contourner le bug IPX de Vercel -->
        <!-- C'est aussi MEILLEUR pour le SEO (LCP) d'utiliser une img native avec fetchpriority -->
        <img
          :src="slide.image"
          :alt="slide.alt"
          class="object-cover w-full h-full"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          :loading="index === 0 ? 'eager' : 'lazy'"
          width="1320"
          height="600"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Votre animation marquee (si vous l'utilisez ailleurs dans ce composant) */
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