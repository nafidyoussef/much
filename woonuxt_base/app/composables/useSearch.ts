export function useSearching() {
  const route = useRoute();
  const router = useRouter();

  const isShowingSearch = useState<boolean>('isShowingSearch', () => false);
  const searchQuery = useState<string>('searchQuery', () => (route.query.search as string) || '');
  const isSearchActive = computed<boolean>(() => !!searchQuery.value);

  // Synchronise l'état local avec l'URL
  watch(
    () => route.query.search,
    (newVal) => {
      searchQuery.value = (newVal as string) || '';
    }
  );

  function getSearchQuery(): string {
    return (route.query.search as string) || '';
  }

  async function setSearchQuery(search: string): Promise<void> {
    searchQuery.value = search;
    // Force la redirection vers la page /products avec le paramètre de recherche
    await router.push({ 
      path: '/products', 
      query: { search: search || undefined } 
    });
  }

  function clearSearchQuery(): void {
    searchQuery.value = '';
    const currentQuery = { ...route.query };
    delete currentQuery.search;
    router.push({ path: route.path, query: currentQuery });
  }

  const toggleSearch = (): void => {
    isShowingSearch.value = !isShowingSearch.value;
  };

  // ❌ SUPPRIMÉ : productMatchesSearch et searchProducts
  // La recherche est maintenant 100% gérée par le backend via le $fetch dynamique.

  return { 
    getSearchQuery, 
    setSearchQuery, 
    clearSearchQuery, 
    isSearchActive, 
    isShowingSearch, 
    toggleSearch 
  };
}