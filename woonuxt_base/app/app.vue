<script setup lang="ts">
import AppToolBar from './components/generalElements/AppToolBar.vue';

const route = useRoute();
const { isShowingCart, toggleCart } = useCart();
const { isShowingMobileMenu, toggleMobileMenu, addBodyClass, removeBodyClass } = useHelpers();
const config = useRuntimeConfig();

const primaryColor = computed(() => config.public.PRIMARY_COLOR || '#7f54b2');
const safePrimaryColor = computed(() => {
  const color = String(primaryColor.value).trim();
  return /^#[0-9a-f]{6}$/i.test(color) || /^#[0-9a-f]{3}$/i.test(color) ? color : '#7f54b2';
});

// ⚠️ If this does an async fetch, it blocks the header!
useOrderAttribution();

const closeCartAndMenu = () => {
  toggleCart(false);
  toggleMobileMenu(false);
};

watch([isShowingCart, isShowingMobileMenu], () => {
  isShowingCart.value || isShowingMobileMenu.value
    ? addBodyClass('overflow-hidden')
    : removeBodyClass('overflow-hidden');
});

watch(() => route.path, () => closeCartAndMenu());

useHead({
  link: [
    { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
    { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
    { rel: 'preconnect', href: 'https://connect.facebook.net' },
    { rel: 'dns-prefetch', href: 'https://connect.facebook.net' },
    { rel: 'preconnect', href: 'https://va.vercel-scripts.com' },
  ],
  titleTemplate: `%s`,
  style: [
    {
      innerHTML: `:root { --color-primary: ${safePrimaryColor.value}; }`,
    },
  ],
  // ✅ Move ALL analytics scripts to bodyEnd + defer, so they don't block paint
  script: [
    {
      // GTM init
      innerHTML: `window.dataLayer = window.dataLayer || [];`,
      tagPosition: 'bodyClose',
    },
    {
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PGQNM7T6');`,
      tagPosition: 'bodyClose',
    },
    {
      innerHTML: 'window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };',
      tagPosition: 'bodyClose',
    },
    {
      innerHTML: `
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            var script = document.createElement('script');
            script.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.js';
            script.defer = true;
            document.head.appendChild(script);
          });
        } else {
          setTimeout(() => {
            var script = document.createElement('script');
            script.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.js';
            script.defer = true;
            document.head.appendChild(script);
          }, 2000);
        }
      `,
      tagPosition: 'bodyClose',
    },
  ],
  noscript: [
    {
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PGQNM7T6" height="0" width="0" style="display:none;visibility:hidden" loading="lazy"></iframe>`,
      tagPosition: 'bodyOpen',
    },
  ],
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- ✅ 1. Header renders FIRST, no async wrapper -->
    <AppHeader />

    <!-- ✅ 2. Cart/Menu are lazy — they don't block header -->
    <LazyCart v-if="isShowingCart" />
    <LazyMobileMenu v-if="isShowingMobileMenu" />

    <!-- ✅ 3. Only the PAGE is async-wrapped, not the whole app -->
    <Suspense>
      <template #default>
        <NuxtPage />
      </template>
      <template #fallback>
        <div class="container py-6 flex-1 animate-pulse">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="aspect-square bg-gray-200 rounded-xl"></div>
            <div class="space-y-4">
              <div class="h-8 bg-gray-200 rounded w-3/4"></div>
              <div class="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </template>
    </Suspense>

    <div
      v-if="isShowingCart || isShowingMobileMenu"
      class="bg-black opacity-25 inset-0 z-40 fixed"
      @click="closeCartAndMenu"
    ></div>

    <AppFooter />
    <AppToolBar />
  </div>
</template>