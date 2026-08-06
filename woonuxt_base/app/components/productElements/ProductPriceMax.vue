<script setup lang="ts">
interface ProductPriceProps {
  regularPrice?: string | null;
  salePrice?: string | null;
}

defineProps<ProductPriceProps>();
</script>

<template>
  <div v-if="regularPrice" class="flex items-center gap-1 text-[20px] leading-none font-bold">
    <span
      :class="{ 'text-gray-400 line-through text-[16px] font-normal': salePrice }"
      v-html="regularPrice"
    ></span>
    <span
      v-if="salePrice"
      class="font-bold text-primary"
      v-html="salePrice"
    ></span>
  </div>
</template>