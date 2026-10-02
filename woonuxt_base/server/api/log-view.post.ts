export default defineEventHandler(async (event) => {
  try {
    // readBody va maintenant correctement parser le JSON grâce au Blob
    const body = await readBody(event);
    
    // Extraction sécurisée avec des valeurs par défaut
    const slug = body?.slug || 'inconnu';
    const utm_source = body?.utm_source || 'inconnue';

    console.log(`✅ VUE CONFIRMÉE | Source: ${utm_source} | Slug: ${slug}`);
    
    return { status: 204 };
  } catch (error) {
    console.error('❌ Erreur log-view:', error);
    return { status: 500 };
  }
});