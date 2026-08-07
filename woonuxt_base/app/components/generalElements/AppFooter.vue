<script setup lang="ts">
const { wooNuxtVersionInfo } = useHelpers();
</script>

<template>
  <footer class="bg-white order-last">
    <div class="container flex flex-wrap justify-between gap-12 my-24 md:gap-24">
      <div class="mr-auto">
        <Logo />
        <WebsiteShortDescription />
        <div class="inline-flex gap-2 justify-start mt-8">
          <LangSwitcher />
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900">Géneral vue </div>
         <div class="text-sm text-gray-700">
          <NuxtLink to="/about" class="py-1.5 block">{{ $t('general.information') }}</NuxtLink>
          <NuxtLink to="/faq" class="py-1.5 block">FAQ ?</NuxtLink>
  
        </div>
       
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900">{{ $t('general.products') }}</div>
        <div class="text-sm text-gray-700">
          <NuxtLink to="/products" class="py-1.5 block">{{ $t('shop.newArrivals') }}</NuxtLink>
          <NuxtLink to="/products?filter=sale[true]" class="py-1.5 block">{{ $t('shop.onSale') }}</NuxtLink>
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900">{{ $t('general.customerService') }}</div>
        <div class="text-sm text-gray-700">
          <NuxtLink to="/contact" class="py-1.5 block">{{ $t('general.contactUs') }}</NuxtLink>
          <NuxtLink to="/expedition-retour" class="py-1.5 block">{{ $t('general.shippingReturns') }}</NuxtLink>
          <NuxtLink to="/privacy-policy" class="py-1.5 block">{{ $t('general.privacyPolicy') }}</NuxtLink>
          <NuxtLink to="/politique" class="py-1.5 block">{{ $t('general.termsConditions') }}</NuxtLink>
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900">{{ $t('account.myAccount') }}</div>
        <div class="text-sm text-gray-700">
          <NuxtLink to="/my-account/" class="py-1.5 block">{{ $t('account.myAccount') }}</NuxtLink>
          <NuxtLink to="/my-account/?tab=orders" class="py-1.5 block">{{ $t('shop.orderHistory') }}</NuxtLink>
          <NuxtLink to="/wishlist" class="py-1.5 block">{{ $t('shop.wishlist') }}</NuxtLink>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="border-t border-gray-200 pt-2 flex items-center justify-center mb-6">
        <div class="copywrite">
          <p class="py-4 text-xs text-center text-gray-600">
            <a href="/" :title="`Built with love by much ${wooNuxtVersionInfo}`" target="_blank">Built with love by much {{ wooNuxtVersionInfo }}</a>
          </p>
        </div>
        <SocialIcons class="ml-auto" />
      </div>
    </div>

    <!-- Hook: Bottom of footer -->
    <HookOutlet name="layout.footer.bottom" as="div" />
  </footer>
</template>

<style scoped>
a:hover {
  text-decoration: underline;
}
</style>
