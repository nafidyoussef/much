export function useSearching() {
  const route = useRoute();
  const router = useRouter();

  const isShowingSearch = useState<boolean>('isShowingSearch', () => false);
  
  // Synchronise l'état avec l'URL au chargement
  const searchQuery = useState<string>('searchQuery', () => (route.query.search as string) || '');
  const isSearchActive = computed<boolean>(() => !!searchQuery.value);

  // Garde le state synchronisé si l'URL change (ex: via les filtres)
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
    // Force la redirection vers la page globale des produits pour une recherche backend complète
    await router.push({ 
      path: '/products', 
      query: { search: search || undefined } 
    });
  }

  function clearSearchQuery(): void {
    searchQuery.value = '';
    // Retire le paramètre search de l'URL sans changer de page
    const currentQuery = { ...route.query };
    delete currentQuery.search;
    router.push({ path: route.path, query: currentQuery });
  }

  const toggleSearch = (): void => {
    isShowingSearch.value = !isShowingSearch.value;
  };

  return { 
    getSearchQuery, 
    setSearchQuery, 
    clearSearchQuery, 
    isSearchActive, 
    isShowingSearch, 
    toggleSearch 
  };
}