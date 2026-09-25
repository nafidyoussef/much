export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  // 1. Vérifier l'état actuel du cookie
  const sessionCookie = useCookie<string | null>('woocommerce-session', { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 14, 
    sameSite: 'lax', 
    secure: true 
  });
  
  // 2. Si le cookie est vide (Safari iOS l'a peut-être bloqué ou supprimé), on tente de le restaurer
  if (!sessionCookie.value) {
    try {
      const fallbackToken = localStorage.getItem('woocommerce-session-fallback');
      if (fallbackToken) {
        // On restaure le cookie
        sessionCookie.value = fallbackToken;
        // On force la mise à jour des headers GraphQL pour que la première requête soit authentifiée
        useGqlHeaders({ 'woocommerce-session': `Session ${fallbackToken}` });
        console.log('🛒 Session WooCommerce restaurée depuis le fallback iOS');
      }
    } catch (e) {
      console.warn('Impossible de lire le localStorage pour la session', e);
    }
  } else {
    // Même si le cookie existe, on s'assure que les headers sont bien injectés au chargement de la page
    useGqlHeaders({ 'woocommerce-session': `Session ${sessionCookie.value}` });
  }
});