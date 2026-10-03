<script setup lang="ts">
import AppToolBar from './components/generalElements/AppToolBar.vue';
import { onMounted } from 'vue';

const route = useRoute();
const { isShowingCart, toggleCart } = useCart();
const { isShowingMobileMenu, toggleMobileMenu, addBodyClass, removeBodyClass } = useHelpers();
const config = useRuntimeConfig();

const primaryColor = computed(() => config.public.PRIMARY_COLOR || '#7f54b2');
const safePrimaryColor = computed(() => {
  const color = String(primaryColor.value).trim();
  return /^#[0-9a-f]{6}$/i.test(color) || /^#[0-9a-f]{3}$/i.test(color) ? color : '#7f54b2';
});

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

// ============================================================
// ✅ ANALYTICS — Loaded AFTER hydration / first interaction
// ============================================================
// GTM (and everything it fires: GA4, Facebook Pixel, etc.)
// is deferred so it never blocks the header render.
// It triggers on the first user interaction OR after 3s idle.
// ============================================================
onMounted(() => {
  // Guard: only run once
  if (typeof window === 'undefined') return;
  if ((window as any).__analyticsLoaded) return;

  const loadAnalytics = () => {
    if ((window as any).__analyticsLoaded) return;
    (window as any).__analyticsLoaded = true;

    // ---- GTM ----
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-PGQNM7T6');`;
    document.head.appendChild(gtmScript);

    // ---- Vercel Speed Insights ----
    const siStub = document.createElement('script');
    siStub.innerHTML =
      'window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };';
    document.head.appendChild(siStub);

    const siScript = document.createElement('script');
    siScript.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.js';
    siScript.defer = true;
    document.head.appendChild(siScript);
  };

  // Trigger on first interaction
  const events = ['scroll', 'click', 'touchstart', 'keydown', 'pointerdown'];
  const triggerLoad = () => {
    events.forEach((e) =>
      window.removeEventListener(e, triggerLoad, { capture: true } as any),
    );
    loadAnalytics();
  };
  events.forEach((e) =>
    window.addEventListener(e, triggerLoad, { once: true, passive: true, capture: true }),
  );

  // Fallback: load after 3s if user does nothing
  setTimeout(triggerLoad, 3000);
});

// ============================================================
// HEAD — only cheap hints + theme color. No blocking scripts.
// ============================================================
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
  // ✅ No scripts here — everything moves to onMounted
  noscript: [
    {
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PGQNM7T6" height="0" width="0" style="display:none;visibility:hidden" loading="lazy"></iframe>`,
      tagPosition: 'bodyOpen',
    },
  ],
});
</script>

<template>
  <NuxtPwaManifest />
  <NuxtLoadingIndicator />
  
  <div class="flex flex-col min-h-screen">
    <!-- ✅ 1. Le Header s'affiche IMMÉDIATEMENT -->
    <AppHeader />

    <Transition name="slide-from-right">
      <Cart v-if="isShowingCart" />
    </Transition>

    <Transition name="slide-from-left">
      <MobileMenu v-if="isShowingMobileMenu" />
    </Transition>

    <!-- ✅ 2. Suspense empêche la page produit de bloquer le Header -->
    <Suspense>
      <template #default>
        <NuxtPage />
      </template>
      <template #fallback>
        <!-- Fallback global optionnel (ton skeleton de page produit peut aussi le gérer) -->
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

    <Transition name="fade">
      <div v-if="isShowingCart || isShowingMobileMenu" class="bg-black opacity-25 inset-0 z-40 fixed" @click="closeCartAndMenu"></div>
    </Transition>
    
    <AppFooter />
    <AppToolBar />
  </div>
</template>
<style>
@reference "#tailwind";

html,
body {
  @apply  text-gray-900;
  scroll-behavior: auto;
}

html {
  scrollbar-gutter: stable both-edges;
}

img {
  image-rendering: crisp-edges;
  image-rendering: -webkit-optimize-contrast;
}

pre {
  @apply rounded-sm bg-gray-800 my-8 text-xs text-white p-4 whitespace-pre-wrap overflow-auto;
}

/* Slide-from-right & Slide-from-left */
.slide-from-right-leave-active,
.slide-from-right-enter-active,
.slide-from-left-leave-active,
.slide-from-left-enter-active {
  transition: transform 300ms ease-in-out;
}

.slide-from-right-enter-from,
.slide-from-right-leave-to {
  transform: translateX(500px);
}

.slide-from-left-enter-from,
.slide-from-left-leave-to {
  transform: translateX(-500px);
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scale Y */
.scale-y-enter-active,
.scale-y-leave-active {
  transition: all 500ms linear;
  will-change: max-height, opacity;
  max-height: 9999px;
  overflow: hidden;
  opacity: 1;
}

.scale-y-enter-from,
.scale-y-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar-track,
.custom-scrollbar::-webkit-scrollbar {
  @apply rounded-sm bg-gray-100 w-1.5;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply rounded-sm bg-gray-400;
}

@keyframes fadeIn {
  0% {
    opacity: 0.001;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fadeDisabledIn {
  0% {
    opacity: 0.001;
  }

  100% {
    opacity: 0.7;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.001;
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 20ms;
}

.page-enter,
.page-leave-to {
  opacity: 0;
}

.page-enter-active {
  animation-duration: 200ms;
  animation-name: fadeIn;
  animation-timing-function: linear;
  backface-visibility: hidden;
}

.page-leave-active {
  animation-name: fadeOut;
  animation-duration: 200ms;
}

@keyframes skelaton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

img.skeleton {
  animation: skelaton 2000ms infinite cubic-bezier(0.4, 0, 0.2, 1);
  background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

input[type='checkbox'],
input[type='radio'] {
  @apply bg-white border rounded-lg cursor-pointer font-sans outline-hidden border-gray-300 w-full p-3 transition-all duration-150 appearance-none hover:border-primary;

  width: 1em;
  height: 1em;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
}

.dark input {
  color-scheme: dark;
}

input[type='radio'] {
  border-radius: 50%;
}

input[type='checkbox']:after,
input[type='radio']:after {
  content: '';
  display: block;
  opacity: 0;
  transition: all 250ms cubic-bezier(0.65, -0.43, 0.4, 1.71);
}

input[type='checkbox']:after {
  width: 5px;
  height: 9px;
  border: 2px solid #fff;
  border-top: 0;
  border-left: 0;
  transform: rotate(0deg) translate(-1px, 1px) scale(0.75);
  position: absolute;
  top: 3px;
  left: 6.5px;
}

input[type='radio']:after {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: scale(0);
  position: absolute;
  background: #fff;
  top: 4px;
  left: 4px;
}

input[type='checkbox']:checked:after,
input[type='checkbox'] + label,
input[type='radio'] + label {
  @apply cursor-pointer text-gray-600  hover:text-primary;
}

input[type='checkbox']:checked + label,
input[type='radio']:checked + label {
  @apply text-gray-800  hover:text-primary-dark;
}

input[type='checkbox']:checked,
input[type='radio']:checked {
  @apply bg-primary border-0;
}

input[type='checkbox']:checked:after {
  opacity: 1;
  transform: rotate(45deg) translate(-1px, 1px) scale(1);
}

input[type='radio']:checked:after {
  opacity: 1;
  transform: scale(1);
}
</style>