// server/middleware/strip-tracking.ts
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  
  // Seulement pour les pages produit
  if (!event.path.startsWith('/product/')) return
  
  const trackingParams = [
    'fbclid', 'gclid', 'utm_source', 'utm_medium', 
    'utm_campaign', 'utm_content', 'utm_term'
  ]
  
  const hasTracking = trackingParams.some(p => url.searchParams.has(p))
  if (!hasTracking) return
  
  // Sauvegarde les params dans un cookie pour l'attribution plus tard
  const trackingData = Object.fromEntries(url.searchParams)
  setCookie(event, 'tracking', JSON.stringify(trackingData), {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
    httpOnly: false // Pour que ton JS puisse le lire
  })
  
  // Redirige vers l'URL propre (celle qui est en cache)
  const cleanUrl = new URL(url)
  trackingParams.forEach(p => cleanUrl.searchParams.delete(p))
  
  return sendRedirect(event, cleanUrl.pathname + cleanUrl.search, 302)
})