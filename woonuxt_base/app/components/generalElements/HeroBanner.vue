<script setup lang="ts">
// Precharging the relative asset path directly in the header
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
  <!-- 
    ✅ FIXED: Added 'aspect-[330/150] md:aspect-[1320/600] overflow-hidden bg-gray-100' directly 
    to the parent div element wrapper. This ensures the browser layouts the box layout 
    even if the webp image file takes a few milliseconds to process.
  -->
  <div class="w-full md:max-w-8xl md:mx-auto md:px-4 lg:px-20 aspect-[330/150] md:aspect-[1320/600] overflow-hidden bg-gray-50">
    <img
      src="/Hero-1.webp"
      alt="Collection Nouveau Année"
      width="1320"
      height="600"
      class="w-full h-full md:rounded-xl object-cover"
      loading="eager"
      fetchpriority="high"
      decoding="sync"
    />
  </div>
</template>
