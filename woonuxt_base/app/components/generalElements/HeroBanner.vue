<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentSlide = ref(0);

const slides = [
  {
    image: 'Hero-1.webp',
    alt: 'Collection Nouveau Année'
  },
  {
    image: 'Hero-1.webp',
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
  <div class="relative w-full md:max-w-8xl md:mx-auto md:px-4 lg:px-20">
    
    <!-- Slider Container -->
    <div class="relative w-full overflow-hidden md:rounded-xl" style="aspect-ratio: 330/150;">
      
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        
        <!-- ✅ SLIDE 1 (LCP) : Balise <img> NATIVE -->
        <!-- On retire NuxtPicture pour la première image. Une <img> native est parsée instantanément par le navigateur sans attendre le JS -->
        <img
          v-if="index === 0"
          :src="slide.image"
          :alt="slide.alt"
          width="1320"
          height="600"
          class="object-cover w-full h-full"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />

        <!-- ✅ SLIDES SUIVANTES : NuxtPicture ou img lazy -->
        <!-- Les autres images peuvent utiliser NuxtPicture car elles ne sont pas le LCP -->
        <NuxtPicture
          v-else
          width="1320"
          height="600"
          :src="slide.image"
          :alt="slide.alt"
          :img-attrs="{ class: 'object-cover w-full h-full' }"
          loading="lazy"
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