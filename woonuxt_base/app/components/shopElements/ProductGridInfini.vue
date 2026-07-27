<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const route = useRoute();
const { productsPerPage } = useHelpers();
const { products, setProducts } = useProducts();
//onst { frontEndUrl } = useHelpers();

const loading = ref(false);
const hasMore = ref(true);
const endCursor = ref<string | null>(null);

// Récupérer le slug de la catégorie
const categorySlug = computed(() => {
  const slug = route.params.slug || route.params.categorySlug;
  return Array.isArray(slug) ? slug[0] : slug;
});

// Requête GraphQL allégée pour les listes
const getProductsQuery = `
  query getProducts($after: String, $slug: [String], $first: Int = 24) {
    products(
      first: $first
      after: $after
      where: { categoryIn: $slug, visibility: VISIBLE, status: "publish" }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        slug
        type
        databaseId
        id
        averageRating
        reviewCount
        ...SimpleProduct
        ...VariableProduct
        ...ExternalProduct
      }
    }
  }

  fragment SimpleProduct on SimpleProduct {
    name
    slug
    price
    rawPrice: price(format: RAW)
    regularPrice
    salePrice
    stockStatus
    onSale
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
    }
  }

  fragment VariableProduct on VariableProduct {
    name
    slug
    price
    rawPrice: price(format: RAW)
    regularPrice
    salePrice
    stockStatus
    onSale
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
    }
  }

  fragment ExternalProduct on ExternalProduct {
    externalUrl
    buttonText
    price
    regularPrice
    salePrice
    image {
      sourceUrl
      altText
      productCardSourceUrl: sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
    }
  }
`;

const loadProducts = async (append = false) => {
  if (loading.value || !hasMore.value) return;
  
  loading.value = true;
  
  try {
    const variables: any = {
      first: productsPerPage || 24
    };
    
    if (categorySlug.value) {
      variables.slug = [categorySlug.value];
    }
    
    if (append && endCursor.value) {
      variables.after = endCursor.value;
    }

   // const config = useRuntimeConfig();
   // const graphqlEndpoint = config.public.gqlHost || 'http://localhost:8080/graphql';

    const response = await $fetch('http://bazzaria/graphql', {
      method: 'POST',
      body: {
        query: getProductsQuery,
        variables
      }
    });

    const data = response as any;
    const newProducts = data?.data?.products?.nodes || [];
    const pageInfo = data?.data?.products?.pageInfo;
    
    if (append) {
      setProducts([...products.value, ...newProducts]);
    } else {
      setProducts(newProducts);
    }
    
    endCursor.value = pageInfo?.endCursor || null;
    hasMore.value = pageInfo?.hasNextPage ?? false;
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
  } finally {
    loading.value = false;
  }
};

// Intersection Observer
let observer: IntersectionObserver | null = null;
const sentinelRef = ref<HTMLElement | null>(null);

const setupObserver = () => {
  if (!sentinelRef.value) return;
  
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && !loading.value && hasMore.value) {
        loadProducts(true);
      }
    },
    { rootMargin: '200px' }
  );
  
  observer.observe(sentinelRef.value);
};

onMounted(() => {
  loadProducts(false);
  setTimeout(() => setupObserver(), 100);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

// Recharger quand la catégorie change
watch(() => route.params.slug || route.params.categorySlug, () => {
  endCursor.value = null;
  hasMore.value = true;
  loadProducts(false);
});
</script>

<template>
  <section v-if="products.length" class="relative w-full py-0">
    <div class="product-grid">
      <ProductCard 
        v-for="(node, i) in products" 
        :key="node.id || i" 
        :node 
        :index="i" 
      />
    </div>
    
    <!-- Loader / Sentinel -->
    <div ref="sentinelRef" class="flex flex-col items-center justify-center py-12">
      <div v-if="loading" class="flex items-center gap-3">
        <div class="w-8 h-8 border-4 border-[#ff4f24]/20 border-t-[#ff4f24] rounded-full animate-spin"></div>
        <span class="text-gray-500 text-sm">Chargement...</span>
      </div>
      
      <div v-else-if="!hasMore" class="text-center">
        <p class="text-gray-400 text-sm">Tous les produits ont été chargés</p>
      </div>
    </div>
  </section>
  
  <NoProductsFound v-else-if="!loading" />
</template>

<style scoped>
@reference "#tailwind";

.product-grid {
  @apply grid my-4 min-h-37.5 transition-all gap-8 lg:my-8;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }
}
</style>