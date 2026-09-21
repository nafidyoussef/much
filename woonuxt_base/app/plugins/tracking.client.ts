// 1. On déclare les nouvelles propriétés sur l'objet Window pour TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    muchTrack: (event: string, ecommerce?: any, extra?: any) => void;
  }
}

// 2. On s'assure que ce fichier est traité comme un module
export {};

export default defineNuxtPlugin(() => {
  // 3. Initialisation sécurisée du dataLayer
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];

    // 4. Fonction helper muchTrack
    window.muchTrack = function (event: string, ecommerce?: any, extra?: any) {
      // Nettoie les données de l'événement précédent pour éviter les fuites
      window.dataLayer.push({ ecommerce: null, search_term: null });
      
      window.dataLayer.push({
        event: event,
        ...(ecommerce ? { ecommerce: { ...ecommerce, currency: 'MAD' } } : {}),
        ...(extra || {})
      });
    };
  }
});