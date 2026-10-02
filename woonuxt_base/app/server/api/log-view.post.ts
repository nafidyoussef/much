export default defineEventHandler(async (event) => {
  try {
    // 1. On récupère les données envoyées par le navigateur du client
    const body = await readBody(event);

    // 2. On les affiche dans la console du serveur (c'est ce que Vercel va enregistrer)
    console.log('✅ VUE DE PAGE CONFIRMÉE (Client a chargé le JS) :', {
      slug: body.slug,
      utm_source: body.utm_source,
      utm_campaign: body.utm_campaign,
      timestamp: new Date(body.timestamp).toISOString()
    });

    // 3. Retourner 204 No Content est la MEILLEURE PRATIQUE pour sendBeacon.
    // Cela dit au navigateur : "C'est reçu, ne réessaie pas, et libère les ressources immédiatement".
    return { status: 204 };
    
  } catch (error) {
    console.error('❌ Erreur lors de la réception du beacon:', error);
    return { status: 500 };
  }
});