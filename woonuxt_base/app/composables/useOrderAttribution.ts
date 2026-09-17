// composables/useOrderAttribution.ts
export const useOrderAttribution = () => {
  const route = useRoute();
  
  // Cookies (30 jours de persistance)
  const utmSource = useCookie<string | null>('utm_source', { maxAge: 60 * 60 * 24 * 30 });
  const utmMedium = useCookie<string | null>('utm_medium', { maxAge: 60 * 60 * 24 * 30 });
  const utmCampaign = useCookie<string | null>('utm_campaign', { maxAge: 60 * 60 * 24 * 30 });
  const utmContent = useCookie<string | null>('utm_content', { maxAge: 60 * 60 * 24 * 30 });
  const utmTerm = useCookie<string | null>('utm_term', { maxAge: 60 * 60 * 24 * 30 });
  const fbclid = useCookie<string | null>('fbclid', { maxAge: 60 * 60 * 24 * 30 });
  const gclid = useCookie<string | null>('gclid', { maxAge: 60 * 60 * 24 * 30 });
  const pageCount = useCookie<number>('page_view_count', { maxAge: 60 * 60 * 24 * 1 }); // Reset quotidien
  const deviceType = useCookie<string>('device_type', { maxAge: 60 * 60 * 24 * 30 });

  // Détecter le type d'appareil
  const detectDeviceType = (): string => {
    if (typeof window === 'undefined') return 'Desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  // Incrémenter le compteur de pages vues
  const incrementPageCount = () => {
    const current = pageCount.value || 0;
    pageCount.value = current + 1;
  };

  // Capturer les paramètres UTM depuis l'URL
  const captureUTMParams = () => {
    const params = route.query;
    
    // Ne mettre à jour que si les paramètres sont présents dans l'URL
    if (params.utm_source) utmSource.value = params.utm_source as string;
    if (params.utm_medium) utmMedium.value = params.utm_medium as string;
    if (params.utm_campaign) utmCampaign.value = params.utm_campaign as string;
    if (params.utm_content) utmContent.value = params.utm_content as string;
    if (params.utm_term) utmTerm.value = params.utm_term as string;
    if (params.fbclid) fbclid.value = params.fbclid as string;
    if (params.gclid) gclid.value = params.gclid as string;
    
    // Sauvegarder le type d'appareil
    deviceType.value = detectDeviceType();
    
    // Incrémenter le compteur
    incrementPageCount();
  };

  // Générer les métadonnées pour WooCommerce
  const getOrderMetaData = () => {
    const metaData: Array<{ key: string; value: string }> = [];

    // Ajouter les UTM s'ils existent dans les cookies
    if (utmSource.value) metaData.push({ key: 'utm_source', value: utmSource.value });
    if (utmMedium.value) metaData.push({ key: 'utm_medium', value: utmMedium.value });
    if (utmCampaign.value) metaData.push({ key: 'utm_campaign', value: utmCampaign.value });
    if (utmContent.value) metaData.push({ key: 'utm_content', value: utmContent.value });
    if (utmTerm.value) metaData.push({ key: 'utm_term', value: utmTerm.value });
    if (fbclid.value) metaData.push({ key: 'fbclid', value: fbclid.value });
    if (gclid.value) metaData.push({ key: 'gclid', value: gclid.value });

    // Type d'appareil
    metaData.push({ 
      key: '_wc_order_attribution_device_type', 
      value: deviceType.value || detectDeviceType() 
    });

    // Nombre de pages vues
    metaData.push({ 
      key: '_wc_order_attribution_page_view_count', 
      value: String(pageCount.value || 1) 
    });

    // Origine (calculée à partir des UTM)
    let origin = 'Direct';
    if (utmSource.value) {
      origin = utmSource.value;
    } else if (fbclid.value) {
      origin = 'Meta';
    } else if (gclid.value) {
      origin = 'Google';
    }
    metaData.push({ key: '_wc_order_attribution_origin', value: origin });

    return metaData;
  };

  // Exécuter à chaque changement de route
  watch(() => route.fullPath, () => {
    captureUTMParams();
  }, { immediate: true });

  return {
    getOrderMetaData,
    utmSource,
    utmMedium,
    utmCampaign,
    fbclid,
    gclid,
    pageCount
  };
};