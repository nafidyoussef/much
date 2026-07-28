// composables/useProductCache.ts
export const useProductCache = () => {
  const route = useRoute();
  
  const cache = useState('product-list-cache', () => ({
    path: '',
    products: [] as any[],
    endCursor: null as string | null,
    hasNextPage: true,
    scrollY: 0
  }));

  // Sauvegarder l'état actuel
  const save = (products: any[], endCursor: string | null, hasNextPage: boolean) => {
    cache.value = {
      path: route.fullPath,
      products: products,
      endCursor: endCursor,
      hasNextPage: hasNextPage,
      // ✅ CORRECTION : Vérifier qu'on est bien dans le navigateur avant de lire scrollY
      scrollY: import.meta.client ? window.scrollY : 0
    };
  };

  // Vérifier si on a un cache valide pour l'URL actuelle
  const isValid = computed(() => {
    return cache.value.path === route.fullPath && cache.value.products.length > 0;
  });

  // Vider le cache
  const clear = () => {
    cache.value = {
      path: '',
      products: [],
      endCursor: null,
      hasNextPage: true,
      scrollY: 0
    };
  };

  return { cache, save, isValid, clear };
};