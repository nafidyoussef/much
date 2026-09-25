import { createResolver } from '@nuxt/kit';
import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

const { resolve } = createResolver(import.meta.url);

const GQL_HOST = process.env.GQL_HOST || 'https://api.much.ma/graphql';
const APP_HOST = process.env.APP_HOST || 'https://much.ma';

const parsedCatalogIsrTtl = Number.parseInt(process.env.CATALOG_ISR_TTL || '3600', 10);
const catalogIsrTtl = Number.isFinite(parsedCatalogIsrTtl) && parsedCatalogIsrTtl > 0 ? parsedCatalogIsrTtl : 3600;

export default defineNuxtConfig({
   image: {
    provider: 'vercel',
    domains: ['i0.wp.com'],
  },
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
      htmlAttrs: { lang: 'fr' }, // ✅ Corrigé en 'fr' puisque defaultLocale est fr_FR
      link: [
        { rel: 'icon', href: '/logo.png', type: 'image/png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
    },
  },

  plugins: [
    resolve('./app/plugins/gql-auth.ts'),
    resolve('./app/plugins/init.ts'),
    resolve('./app/plugins/payment-gateways/stripe.ts'),
    resolve('./app/plugins/payment-gateways/paypal.ts'),
    resolve('./app/plugins/payment-gateways/cod.ts'),
    resolve('./app/plugins/payment-gateways/cheque.ts'),
    resolve('./app/plugins/restore-woo-session.client.ts'),
  ],

  components: [{ path: resolve('./app/components'), pathPrefix: false }],

  modules: [
    resolve('./modules/woonuxt-bridge.ts'),
    '@nuxt/icon',
    ['@nuxt/image', { provider: 'vercel' }],
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap', // ✅ 1. AJOUT DU MODULE SITEMAP
  ],

  css: [resolve('./app/assets/css/main.css')],

  runtimeConfig: {
 public: {
  'graphql-client': {
    clients: {
      default: {
        host: GQL_HOST,
        headers: { Origin: APP_HOST },
        
        tokenStorage: {
          mode: 'cookie',
          cookieOptions: {
            name: 'woocommerce-session',
            domain: '.much.ma',       // Parfait pour partager entre much.ma et api.much.ma
            maxAge: 60 * 60 * 24 * 14, // 14 jours (parfait)
            sameSite: 'none',         // ⚠️ OBLIGATOIRE pour les requêtes fetch cross-sous-domaine sur iOS
            secure: true,             // OBLIGATOIRE quand sameSite est 'none'
            path: '/'                 // Bonne pratique pour s'assurer qu'il est envoyé partout
          }
        },
        
        fetchOptions: {
          mode: 'cors',
          credentials: 'include',     // Parfait, gardez-le
        },
      },
    },
  },
}
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

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: undefined,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.much\.ma\/graphql.*/i, // ✅ Corrigé l'URL (bazzaria -> much)
          handler: 'NetworkOnly', 
        }
      ]
    },
    manifest: {
      name: 'Much.ma', // ✅ Mis à jour
      short_name: 'Much',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ff4f24', // ✅ Ta couleur primaire
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
    ],
    langDir: 'locales',
    defaultLocale: 'fr_FR',
    strategy: 'no_prefix',
  },

   routeRules: {
    '/': { swr: 3600 },
    '/products/**': { swr: 3600 },
    'product-category/**': { swr: 3600 },
    'product/**': { swr: 3600 }
  },

 /*
 sitemap: {
    exclude: [
      '/my-account/**',
      '/wishlist',
      '/cart',
      '/checkout',
      '/order-received',
      '/order-summary/**',
      '/lost-password',
      '/**?*filter=*',
      '/**?*orderby=*',
      '/api/**',
    ],
    async urls() {
      const graphqlUrl = process.env.GQL_HOST || 'https://much.ma';
      
      // Interface intermédiaire pour harmoniser les entrées du Sitemap
      interface SitemapItem {
        loc: string;
        lastmod?: string;
        changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
        priority?: number;
      }

      interface SitemapProduct {
        slug: string;
        modified: string;
      }
     

      try {
     // 1. Requête pour les produits (Filtre "where" supprimé car implicite pour le public)
      const productsQuery = `
          query GetSitemapProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { slug modified }
          }
        }
        `;


        let allProducts: SitemapProduct[] = [];
        let hasNextPage = true;
        let afterCursor: string | null = null;

        while (hasNextPage) {
          const res = await fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: productsQuery,
              variables: { first: 100, after: afterCursor },
            }),
          });

          const data = await res.json() as any;
          const products = data?.data?.products;
          
          if (products?.nodes) {
            allProducts = allProducts.concat(products.nodes);
          }
          
          hasNextPage = products?.pageInfo?.hasNextPage ?? false;
          afterCursor = products?.pageInfo?.endCursor ?? null;
        }


        console.log(` SITEMAP: ${allProducts.length} produits  générés.`);

        // 3. Formatage avec le type strict défini SitemapItem
        const productRoutes: SitemapItem[] = allProducts.map((p: SitemapProduct) => ({
          loc: `/product/${p.slug}`,
          lastmod: p.modified,
          changefreq: 'weekly',
          priority: 0.8,
        }));


        const staticRoutes: SitemapItem[] = [
          { loc: '/', changefreq: 'daily', priority: 1.0 },
          { loc: '/products', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/maison', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/cuisine', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/tech', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/beaute', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/mode', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/auto', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/kids', changefreq: 'daily', priority: 0.9 },
          { loc: '/product-category/sport', changefreq: 'daily', priority: 0.9 },
          { loc: '/about', changefreq: 'monthly', priority: 0.5 },
          { loc: '/faq', changefreq: 'monthly', priority: 0.5 },
          { loc: '/contact', changefreq: 'monthly', priority: 0.5 },
          { loc: '/expedition-retour', changefreq: 'monthly', priority: 0.3 },
          { loc: '/privacy-policy', changefreq: 'monthly', priority: 0.2 },
          { loc: '/cgv', changefreq: 'monthly', priority: 0.2 },
        ];

        // 4. Retour unifié de type SitemapItem[] (qui est compatible avec SitemapUrlInput[])
        return [
          ...staticRoutes,
          ...productRoutes,
        ] as any; // Le 'as any' ou l'unification via SitemapItem[] garantit que TypeScript ne bloque plus sur l'absence de 'lastmod' sur certaines clés.
      } catch (error) {
        console.error('Erreur lors de la génération du sitemap dynamique:', error);
        return [];
      }
    },
  },
*/

});