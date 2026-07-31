import { createResolver } from '@nuxt/kit';
import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

const { resolve } = createResolver(import.meta.url);

// ✅ 1. Point directly to your backend
const GQL_HOST = process.env.GQL_HOST || 'https://api.bazzaria.ma/graphql';
const APP_HOST = process.env.APP_HOST || 'https://bazzaria.ma';

const parsedCatalogIsrTtl = Number.parseInt(process.env.CATALOG_ISR_TTL || '3600', 10);
const catalogIsrTtl = Number.isFinite(parsedCatalogIsrTtl) && parsedCatalogIsrTtl > 0 ? parsedCatalogIsrTtl : 3600;

export default defineNuxtConfig({
  compatibilityDate: '2026-07-10',
  experimental: { appManifest: false, asyncContext: true },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@stripe/stripe-js/pure', '@vue/devtools-core', '@vue/devtools-kit', '@vueuse/core', 'graphql-request', 'graphql-tag', 'reka-ui', 'tailwind-merge', 'workbox-window'],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
    },
    //pageTransition: { name: 'page', mode: 'default' },
  },

  plugins: [
    resolve('./app/plugins/gql-auth.ts'),
    resolve('./app/plugins/init.ts'),
    resolve('./app/plugins/payment-gateways/stripe.ts'),
    resolve('./app/plugins/payment-gateways/paypal.ts'),
    resolve('./app/plugins/payment-gateways/cod.ts'),
    resolve('./app/plugins/payment-gateways/cheque.ts'),
  ],

  components: [{ path: resolve('./app/components'), pathPrefix: false }],

  modules: [
    resolve('./modules/woonuxt-bridge.ts'),
    '@nuxt/icon',
    ['@nuxt/image', { provider: 'vercel' }],
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
  ],

  css: [resolve('./app/assets/css/main.css')],

  runtimeConfig: {
    public: {
      'graphql-client': {
        clients: {
          default: {
            host: GQL_HOST,
            headers: { Origin: APP_HOST },
            tokenStorage: false,
            fetchOptions: {
              mode: 'cors',
              // ✅ 2. MUST be 'include' for cross-origin cookies to work
              credentials: 'include', 
            },
          },
        },
      },
    },
  },

  alias: {
    '#constants': resolve('./app/constants'),
    '#types': resolve('./app/types'),
    '#gql': resolve('./app/gql'),
    '#gql/default': resolve('./app/gql/default.ts'),
  },

  hooks: {
    'pages:extend'(pages) {
      const addPage = (name: string, path: string, file: string) => {
        pages.push({ name, path, file: resolve(`./app/pages/${file}`) });
      };
      addPage('product-page-pager', '/products/page/:pageNumber', 'products.vue');
      addPage('product-category-page', '/product-category/:categorySlug', 'product-category/[slug].vue');
      addPage('product-category-page-pager', '/product-category/:categorySlug/page/:pageNumber', 'product-category/[slug].vue');
      addPage('order-received', '/checkout/order-received/:orderId', 'order-summary.vue');
      addPage('order-summary', '/order-summary/:orderId', 'order-summary.vue');
    },
  },

  // ✅ 3. FIX THE WORKBOX ERROR (Disable navigation fallback)
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: undefined, // Prevents "non-precached-url" crash
      runtimeCaching: [
        {
          // ✅ NEVER cache GraphQL requests
          urlPattern: /^https:\/\/api\.bazzaria\.ma\/graphql.*/i,
          handler: 'NetworkOnly', 
        }
      ]
    },
    manifest: {
      name: 'Bazzaria',
      short_name: 'Bazzaria',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ff0000',
    }
  },

  nitro: {
    prerender: { ignore: ['/.netlify/images'] },
    routeRules: {
      '/checkout/order-received/**': { prerender: false },
      '/order-summary/**': { prerender: false },
      '/product/**': { isr: catalogIsrTtl },
      '/product-category/**': { isr: catalogIsrTtl },
      '/products': { isr: catalogIsrTtl },
      '/products/**': { isr: catalogIsrTtl },
    },
  },

  i18n: {
    locales: [
      { code: 'en_US', file: 'en-US.json', name: 'English 🇺🇸' },
      { code: 'fr_FR', file: 'fr-FR.json', name: 'Français 🇫🇷' },
      // ... add your other locales back here
    ],
    langDir: 'locales',
    defaultLocale: 'fr_FR',
    strategy: 'no_prefix',
  },
  
});