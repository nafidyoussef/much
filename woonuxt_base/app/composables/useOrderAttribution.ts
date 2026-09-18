// composables/useOrderAttribution.ts

export const useOrderAttribution = () => {
  const route = useRoute();
  
  // ==========================================
  // 1. DÉFINITION DES COOKIES (30 jours de persistance)
  // ==========================================
  const utmSource = useCookie<string | null>('utm_source', { maxAge: 60 * 60 * 24 * 30 });
  const utmMedium = useCookie<string | null>('utm_medium', { maxAge: 60 * 60 * 24 * 30 });
  const utmCampaign = useCookie<string | null>('utm_campaign', { maxAge: 60 * 60 * 24 * 30 });
  const utmContent = useCookie<string | null>('utm_content', { maxAge: 60 * 60 * 24 * 30 });
  const utmTerm = useCookie<string | null>('utm_term', { maxAge: 60 * 60 * 24 * 30 });
  const utmId = useCookie<string | null>('utm_id', { maxAge: 60 * 60 * 24 * 30 });
  const fbclid = useCookie<string | null>('fbclid', { maxAge: 60 * 60 * 24 * 30 });
  const gclid = useCookie<string | null>('gclid', { maxAge: 60 * 60 * 24 * 30 });
  const referrer = useCookie<string | null>('wc_attribution_referrer', { maxAge: 60 * 60 * 24 * 30 });
  
  // Compteur de pages vues et type d'appareil
  const pageCount = useCookie<number>('page_view_count', { maxAge: 60 * 60 * 24 * 1 }); 
  const deviceType = useCookie<string>('device_type', { maxAge: 60 * 60 * 24 * 30 });
  const sessionStartTime = useCookie<string | null>('session_start_time', { maxAge: 60 * 60 * 24 * 1 });
  const userAgent = useCookie<string | null>('user_agent', { maxAge: 60 * 60 * 24 * 30 });

  // ==========================================
  // 2. FONCTIONS UTILITAIRES
  // ==========================================
  
  const detectDeviceType = (): string => {
    if (typeof window === 'undefined') return 'Desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  const incrementPageCount = () => {
    const current = pageCount.value || 0;
    pageCount.value = current + 1;
  };

  const getSessionStartTime = (): string => {
    if (!sessionStartTime.value) {
      sessionStartTime.value = new Date().toISOString();
    }
    return sessionStartTime.value;
  };

  const getUserAgent = (): string => {
    if (typeof window === 'undefined') return '';
    return navigator.userAgent;
  };

  // ==========================================
  // 3. CAPTURE DES PARAMÈTRES UTM / FB / GOOGLE
  // ==========================================
  const captureUTMParams = () => {
    const params = route.query;
    let hasNewParams = false;
    
    const updateCookie = (cookie: any, paramValue: any) => {
      if (paramValue && paramValue !== cookie.value) {
        cookie.value = String(paramValue);
        hasNewParams = true;
      }
    };

    updateCookie(utmSource, params.utm_source);
    updateCookie(utmMedium, params.utm_medium);
    updateCookie(utmCampaign, params.utm_campaign);
    updateCookie(utmContent, params.utm_content);
    updateCookie(utmTerm, params.utm_term);
    updateCookie(utmId, params.utm_id);
    updateCookie(fbclid, params.fbclid);
    updateCookie(gclid, params.gclid);

    // Capturer le referrer (document.referrer) pour l'origine
    if (typeof window !== 'undefined' && document.referrer && !referrer.value) {
      referrer.value = document.referrer;
      hasNewParams = true;
    }

    // Sauvegarder le type d'appareil et user agent
    deviceType.value = detectDeviceType();
    userAgent.value = getUserAgent();
    getSessionStartTime();
    incrementPageCount();
    
    if (hasNewParams) {
      console.log('✅ [Attribution] Paramètres capturés :', {
        source: utmSource.value,
        medium: utmMedium.value,
        campaign: utmCampaign.value,
        utm_id: utmId.value,
        fbclid: fbclid.value,
        referrer: referrer.value
      });
    }
  };

  // ==========================================
  // 4. GÉNÉRATION DES MÉTADONNÉES POUR WOOCOMMERCE
  // ==========================================
  const getOrderMetaData = () => {
    const metaData: Array<{ key: string; value: string }> = [];

    // ==========================================
    // A. CLÉS SIMPLES (pour compatibilité générale)
    // ==========================================
    if (utmSource.value) metaData.push({ key: 'utm_source', value: utmSource.value });
    if (utmMedium.value) metaData.push({ key: 'utm_medium', value: utmMedium.value });
    if (utmCampaign.value) metaData.push({ key: 'utm_campaign', value: utmCampaign.value });
    if (utmContent.value) metaData.push({ key: 'utm_content', value: utmContent.value });
    if (utmTerm.value) metaData.push({ key: 'utm_term', value: utmTerm.value });
    if (utmId.value) metaData.push({ key: 'utm_id', value: utmId.value });
    if (fbclid.value) metaData.push({ key: 'fbclid', value: fbclid.value });
    if (gclid.value) metaData.push({ key: 'gclid', value: gclid.value });

    // ==========================================
    // B. CLÉS AVEC PRÉFIXE _wc_order_attribution_ (pour le plugin WooCommerce Order Attribution)
    // ==========================================
    
    // Type de source : "utm" si UTM présent, "social" si fbclid, "direct" sinon
    let sourceType = 'direct';
    if (utmSource.value || utmMedium.value) {
      sourceType = 'utm';
    } else if (fbclid.value) {
      sourceType = 'social';
    } else if (gclid.value) {
      sourceType = 'paid';
    } else if (referrer.value) {
      sourceType = 'referral';
    }
    metaData.push({ key: '_wc_order_attribution_source_type', value: sourceType });

    // Référent / Origine
    const origin = utmSource.value || (fbclid.value ? 'Meta' : '') || (gclid.value ? 'Google' : '') || referrer.value || 'Direct';
    metaData.push({ key: '_wc_order_attribution_referrer', value: origin });

    // UTM avec préfixe (le plugin lit ces clés)
    if (utmSource.value) metaData.push({ key: '_wc_order_attribution_utm_source', value: utmSource.value });
    if (utmMedium.value) metaData.push({ key: '_wc_order_attribution_utm_medium', value: utmMedium.value });
    if (utmCampaign.value) metaData.push({ key: '_wc_order_attribution_utm_campaign', value: utmCampaign.value });
    if (utmContent.value) metaData.push({ key: '_wc_order_attribution_utm_content', value: utmContent.value });
    if (utmTerm.value) metaData.push({ key: '_wc_order_attribution_utm_term', value: utmTerm.value });
    if (utmId.value) metaData.push({ key: '_wc_order_attribution_utm_id', value: utmId.value });

    // Device type
    metaData.push({ 
      key: '_wc_order_attribution_device_type', 
      value: deviceType.value || detectDeviceType() 
    });

    // Session info
    metaData.push({ 
      key: '_wc_order_attribution_session_count', 
      value: String(pageCount.value || 1) 
    });
    metaData.push({ 
      key: '_wc_order_attribution_session_pages', 
      value: String(pageCount.value || 1) 
    });
    metaData.push({ 
      key: '_wc_order_attribution_session_start_time', 
      value: getSessionStartTime() 
    });
    metaData.push({ 
      key: '_wc_order_attribution_session_entry', 
      value: typeof window !== 'undefined' ? window.location.href : '' 
    });

    // User Agent
    if (userAgent.value) {
      metaData.push({ key: '_wc_order_attribution_user_agent', value: userAgent.value });
    }

    // Nouveau client (à calculer selon l'historique)
    metaData.push({ key: '_wc_order_attribution_is_new_customer', value: 'true' });

    return metaData;
  };

  // ==========================================
  // 5. EXÉCUTION AUTOMATIQUE
  // ==========================================
  watch(() => route.fullPath, () => {
    captureUTMParams();
  }, { immediate: true });

  onMounted(() => {
    captureUTMParams();
  });

  // ==========================================
  // 6. RETOUR DES DONNÉES
  // ==========================================
  return {
    getOrderMetaData,
    utmSource,
    utmMedium,
    utmCampaign,
    utmId,
    fbclid,
    gclid,
    pageCount
  };
};