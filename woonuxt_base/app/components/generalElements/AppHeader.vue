<script setup lang="ts">
// Minimal desktop header
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
    <div class="container">

      <!-- Mobile -->
      <div class="lg:hidden py-3">
        <!-- Row 1 -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <MenuTrigger />
            <Logo class="w-32" />
          </div>

          <div class="flex items-center gap-4">
            <SignInLink />
            <CartTrigger />
          </div>
        </div>

        <!-- Row 2 -->
        <ProductSearch />
      </div>

      <!-- Desktop -->
      <div class="hidden lg:flex h-20 items-center gap-8">

        <!-- Logo -->
        <Logo class="w-40 shrink-0" />

        <!-- Search -->
        <MainMenu class="flex-1" />
        <div class="w-full max-w-xl">
          <ProductSearch />
        </div>

        <!-- Menu -->
       

        <!-- Actions -->
        <div class="flex items-center gap-5 shrink-0">
          <SignInLink />
          <CartTrigger />
        </div>

      </div>

    </div>
  </header>
</template>