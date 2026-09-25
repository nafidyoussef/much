<script setup lang="ts">
const currentSlide = ref(0); // 0 = slide statique visible par défaut

const nextSlides = [
  // Vos futures slides ici
];

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  if (nextSlides.length) {
    timer = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % (nextSlides.length + 1);
    }, 5000);
  }
});

onUnmounted(() => { 
  if (timer) clearInterval(timer); 
});
</script>

<template>
  <div class="relative w-full md:max-w-8xl md:mx-auto md:px-4 lg:px-20">
    <div class="relative w-full overflow-hidden md:rounded-xl aspect-[330/150] md:aspect-[1320/600]">

      <!-- ✅ LCP Optimisé avec NuxtImg -->
      <NuxtImg
        src="/Hero-1.webp"
        alt="Collection Nouveau Année"
        width="1320"
        height="600"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        :class="{ 'opacity-0': currentSlide !== 0 }"
        loading="eager"
        fetchpriority="high"
        preload
        format="webp"
      />

      <!-- Slides JS uniquement (votre code futur ici) -->
     
    </div>
  </div>
</template>