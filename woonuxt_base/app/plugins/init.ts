export default defineNuxtPlugin((nuxtApp) => {
  // On exécute ce plugin uniquement côté client (navigateur)
  if (import.meta.server) return;

  const { clearAllCookies, getDomain, getErrorContext } = useHelpers();
  const { clearActiveAuthToken, refreshAuthToken } = useAuthTokens();
  const { refreshCart } = useCart();

  // 1. Récupérer et appliquer le token de session existant
  const sessionToken = useCookie('woocommerce-session', { domain: getDomain(window.location.href), path: '/' });
  const fallbackSessionToken = useCookie('woocommerce-session', { path: '/' });
  const wooSessionToken = sessionToken.value || fallbackSessionToken.value;
  
  if (wooSessionToken) {
    useGqlHeaders({ 'woocommerce-session': `Session ${wooSessionToken}` });
  }

  // 2. Nettoyage du Service Worker en mode développement (optionnel mais recommandé)
  if (import.meta.dev && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (!registrations.length) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if (navigator.serviceWorker.controller && sessionStorage.getItem('woonuxt:dev-sw-cleared') !== '1') {
        sessionStorage.setItem('woonuxt:dev-sw-cleared', '1');
        window.location.reload();
      }
    });
  }

  // 3. Gestionnaire d'erreurs d'authentification
  let authErrorHandlerRegistered = false;
  const registerAuthErrorHandler = (): void => {
    if (authErrorHandlerRegistered) return;
    authErrorHandlerRegistered = true;

    useGqlError((err: unknown) => {
      const { isAuthError, message } = getErrorContext(err);
      if (!isAuthError) return;

      void nuxtApp.runWithContext(async () => {
        const refreshed = await refreshAuthToken(true);
        if (refreshed) {
          await refreshCart();
          return;
        }

        const normalizedMessage = message?.toLowerCase() || '';
        const fatalAuthErrors = ['the iss do not match with this server', 'invalid-secret-key'];
        if (fatalAuthErrors.some((fatal) => normalizedMessage.includes(fatal))) {
          clearAllCookies();
          window.location.reload();
          return;
        }

        clearActiveAuthToken();
        useGqlHeaders({ Authorization: '' });
        await refreshCart();
      });
    });
  };

  registerAuthErrorHandler();

  // ✅ 4. EXÉCUTION INCONDITIONNELLE DE GETCART (Plus de conditions isDev ou hasKnownSession)
  async function forceInitFullCart(): Promise<void> {
    // On force l'appel à refreshCart (qui contient getCart) à chaque chargement de page
    const success: boolean = await refreshCart();

    // Si ça échoue (ex: session invalide), on nettoie l'en-tête et on réessaie une fois
    if (!success) {
      nuxtApp.runWithContext(() => useGqlHeaders({ 'woocommerce-session': '' }));
      await refreshCart();
    }
  }

  // On lance l'exécution immédiatement, sans attendre de clic utilisateur
  void forceInitFullCart();
});