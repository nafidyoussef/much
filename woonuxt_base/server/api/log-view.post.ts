export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // ✅ Indicateur simple et direct dans les logs Vercel
    console.log(`VUE CONFIRMÉE | Source: ${body.utm_source || 'inconnue'} | Slug: ${body.slug || 'inconnu'}`);
    
    // 204 No Content : dit au navigateur "c'est reçu, libère les ressources"
    return { status: 204 };
    
  } catch (error) {
    console.error('Erreur log-view:', error);
    return { status: 500 };
  }
});