<script setup lang="ts">
const slides = [
 
  { image: '/Hero-2.webp', alt: 'Collection Nouveau Année' },
  { image: '/Hero-3.webp', alt: 'Collection Nouveau Année' }
];

const currentSlide = ref(0);

// ✅ Précharger l'URL EXACTE que le navigateur va réellement fetcher
// Vérifie dans DevTools > Network l'URL générée par ton <img> et mets-la ici
useHead({
  link: [{
    rel: 'preload',
    as: 'image',
    href: slides[0]!.image,
    fetchpriority: 'high'
  }]
});

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

let slideInterval: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  if (slides.length > 1) slideInterval = setInterval(nextSlide, 5000);
});
onUnmounted(() => { if (slideInterval) clearInterval(slideInterval); });
</script>

<template>
  <div class="relative w-full md:max-w-8xl md:mx-auto md:px-4 lg:px-20">
    <div class="relative w-full overflow-hidden md:rounded-xl aspect-[330/150] md:aspect-[1320/600]">

      <!-- ✅ Slide 1 : TOUJOURS visible, jamais conditionnée par le JS -->
      <img
        src="/Hero-1.webp"
        alt="Collection Nouveau Année"
        width="1320"
        height="600"
        class="absolute inset-0 object-cover w-full h-full"
        loading="eager"
        fetchpriority="high"
        decoding="sync"
      />

      <!-- Slides suivantes : superposées au-dessus quand actives -->
      <div
        v-for="(slide, index) in slides"
        :key="slide.image"
        class="absolute inset-0 transition-opacity duration-700"
        :class="currentSlide === index + 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
      >
        <img
          :src="slide.image"
          :alt="slide.alt"
          width="1320"
          height="600"
          class="object-cover w-full h-full"
          loading="lazy"
          decoding="async"
        />
      </div>

    </div>
  </div>
</template>