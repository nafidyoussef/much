// composables/useOrderAttribution.ts
export const useOrderAttribution = () => {
  const route = useRoute();
  
  // Cookies pour persister les données (30 jours)
  const utmSource = useCookie('utm_source', { maxAge: 60 * 60 * 24 * 30 });
  const utmMedium = useCookie('utm_medium', { maxAge: 60 * 60 * 24 * 30 });
  const utmCampaign = useCookie('utm_campaign', { maxAge: 60 * 60 * 24 * 30 });
  const utmContent = useCookie('utm_content', { maxAge: 60 * 60 * 24 * 30 });
  const utmTerm = useCookie('utm_term', { maxAge: 60 * 60 * 24 * 30 });
  const fbclid = useCookie('fbclid', { maxAge: 60 * 60 * 24 * 30 });
  const gclid = useCookie('gclid', { maxAge: 60 * 60 * 24 * 30 });
  const sessionCount = useCookie('session_count', { maxAge: 60 * 60 * 24 * 30 });
  const deviceType = useCookie('device_type', { maxAge: 60 * 60 * 24 * 30 });

  // Incrémenter le compteur de sessions
  const incrementSessionCount = () => {
    const current = sessionCount.value ? parseInt(sessionCount.value as string) : 0;
    sessionCount.value = (current + 1).toString();
  };

  // Détecter le type d'appareil
  const detectDeviceType = () => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  // Capturer les paramètres UTM depuis l'URL
  const captureUTMParams = () => {
    const params = route.query;
    
    if (params.utm_source) utmSource.value = params.utm_source as string;
    if (params.utm_medium) utmMedium.value = params.utm_medium as string;
    if (params.utm_campaign) utmCampaign.value = params.utm_campaign as string;
    if (params.utm_content) utmContent.value = params.utm_content as string;
    if (params.utm_term) utmTerm.value = params.utm_term as string;
    if (params.fbclid) fbclid.value = params.fbclid as string;
    if (params.gclid) gclid.value = params.gclid as string;
    
    // Sauvegarder le type d'appareil
    deviceType.value = detectDeviceType();
    
    // Incrémenter le compteur de pages vues
    incrementSessionCount();
  };

  // Générer les métadonnées pour WooCommerce
  const getOrderMetaData = () => {
    const metaData: Array<{ key: string; value: string }> = [];

    // Ajouter les paramètres UTM s'ils existent
    if (utmSource.value) {
      metaData.push({ key: 'utm_source', value: utmSource.value as string });
    }
    if (utmMedium.value) {
      metaData.push({ key: 'utm_medium', value: utmMedium.value as string });
    }
    if (utmCampaign.value) {
      metaData.push({ key: 'utm_campaign', value: utmCampaign.value as string });
    }
    if (utmContent.value) {
      metaData.push({ key: 'utm_content', value: utmContent.value as string });
    }
    if (utmTerm.value) {
      metaData.push({ key: 'utm_term', value: utmTerm.value as string });
    }
    if (fbclid.value) {
      metaData.push({ key: 'fbclid', value: fbclid.value as string });
    }
    if (gclid.value) {
      metaData.push({ key: 'gclid', value: gclid.value as string });
    }

    // Ajouter le type d'appareil
    if (deviceType.value) {
      metaData.push({ key: '_wc_order_attribution_device_type', value: deviceType.value as string });
    }

    // Ajouter le nombre de pages vues
    if (sessionCount.value) {
      metaData.push({ 
        key: '_wc_order_attribution_session_count', 
        value: sessionCount.value as string 
      });
    }

    // Déterminer la source d'origine
    let originSource = 'Direct';
    if (utmSource.value) {
      originSource = utmSource.value as string;
    } else if (fbclid.value) {
      originSource = 'Meta';
    } else if (gclid.value) {
      originSource = 'Google';
    }
    
    metaData.push({ key: '_wc_order_attribution_origin', value: originSource });

    return metaData;
  };

  // Exécuter au montage
  onMounted(() => {
    captureUTMParams();
  });

  return {
    getOrderMetaData,
    utmSource,
    utmMedium,
    utmCampaign,
    fbclid,
    gclid
  };
};