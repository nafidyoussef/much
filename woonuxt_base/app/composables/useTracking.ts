import type { Product, Variation, ProductDetail } from '#types/gql';

// ✅ Union type pour accepter n'importe quelle entité produit de votre API
type TrackableEntity = Product | Variation | ProductDetail | Record<string, any>;

// ✅ Interface stricte pour l'objet envoyé à GA4
export interface GA4Item {
  item_id: string;
  meta_content_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

export const useTracking = () => {
  /**
   * Formate un produit (ou une variante) au format GA4 requis
   * @param product Le produit ou la variante active
   * @param quantity La quantité (défaut: 1)
   */
  const formatProduct = (product: TrackableEntity, quantity: number = 1): GA4Item => {
    // Récupération du prix : on privilégie le prix soldé brut, sinon le prix régulier brut
    const rawPrice = product.rawSalePrice || product.rawRegularPrice || product.price || '0';
    
    // Nettoyage de la chaîne pour s'assurer d'avoir un nombre (ex: "150,00 DH" -> 150)
    const cleanPrice = parseFloat(String(rawPrice).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    return {
      item_id: String(product.databaseId),
      meta_content_id: String(product.databaseId),
      item_name: String(product.name || 'Produit inconnu'), // ✅ Maintenant typé en string
      price: cleanPrice,
      quantity: Number(quantity)
    };
  };

  const track = (event: string, ecommerce?: Record<string, any>, extra?: Record<string, any>) => {
    if (import.meta.client && typeof window !== 'undefined' && window.muchTrack) {
      window.muchTrack(event, ecommerce, extra);
    }
  };

  return { formatProduct, track };
};