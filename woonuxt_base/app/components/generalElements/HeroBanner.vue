<script setup lang="ts">
// Préchargement : l'image part avant même que le HTML soit parsé
useHead({
  link: [{
    rel: 'preload',
    as: 'image',
    href: '/Hero-1.webp',
    fetchpriority: 'high'
  }]
});
</script>

<template>
  <div class="w-full md:max-w-8xl md:mx-auto md:px-4 lg:px-20">
    <img
      src="/Hero-1.webp"
      alt="Collection Nouveau Année"
      width="1320"
      height="600"
      class="w-full md:rounded-xl aspect-[330/150] md:aspect-[1320/600] object-cover"
      loading="eager"
      fetchpriority="high"
      decoding="sync"
    />
  </div>
</template>