// composables/useCategorySEO.ts

export interface CategorySEO {
  metaTitle: string;
  metaDescription: string;
  h2Title: string;
  h3Sections: Array<{ title: string; content: string }>;
  faq: Array<{ question: string; answer: string }>;
}

export const categorySEOConfig: Record<string, CategorySEO> = {
  'maison': {
    metaTitle: 'Maison – Meubles, Déco & Rangement | Much.ma',
    metaDescription: 'Meubles, décoration, rangement et accessoires pour la maison sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Maison — Tout pour votre intérieur',
    h3Sections: [
      {
        title: 'Une sélection pensée pour votre quotidien',
        content: 'Retrouvez sur Much.ma une large <strong>sélection maison</strong> : décoration, rangement, accessoires pratiques et objets du quotidien pour équiper votre intérieur. Notre catalogue s\'agrandit chaque semaine avec de nouveaux articles.'
      },
      {
        title: 'Achat en ligne et livraison partout au Maroc',
        content: 'Tous les articles de la catégorie Maison sont disponibles en <strong>achat en ligne</strong>, avec <strong>paiement à la livraison</strong> et une <strong>livraison partout au Maroc</strong>. Vous réglez votre commande directement à la réception, en toute simplicité.'
      },
      {
        title: 'Complétez votre intérieur',
        content: 'Envie d\'équiper aussi votre cuisine ou de trouver des accessoires pour toute la famille ? Découvrez également nos univers <a href="https://www.much.ma/product-category/cuisine" class="text-[#ff4f24] hover:underline">Cuisine</a>, <a href="https://www.much.ma/product-category/kids" class="text-[#ff4f24] hover:underline">Kids</a> et <a href="https://www.much.ma/product-category/tech" class="text-[#ff4f24] hover:underline">Tech</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tous nos produits</a>.'
      }
    ],
    faq: [
      {
        question: 'Quels produits maison trouve-t-on sur Much.ma ?',
        answer: 'Notre catégorie Maison regroupe des articles de décoration, de rangement et des accessoires pratiques pour équiper votre intérieur au quotidien.'
      },
      {
        question: 'Le paiement à la livraison est-il disponible sur les articles maison ?',
        answer: 'Oui, comme sur l\'ensemble du site, vous pouvez régler vos articles maison directement au livreur à la réception.'
      },
      {
        question: 'Livrez-vous les articles maison partout au Maroc ?',
        answer: 'Oui, la livraison est assurée dans l\'ensemble du territoire marocain.'
      }
    ]
  },
  'cuisine': {
    metaTitle: 'Cuisine – étensiles & Électroménager | Much.ma',
    metaDescription: 'Ustensiles de cuisine, électroménager et accessoires à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Cuisine — Des essentiels pour cuisiner mieux',
    h3Sections: [
      {
        title: 'Du petit électroménager aux ustensiles du quotidien',
        content: 'Une bonne cuisine commence par les bons outils. Sur Much.ma, retrouvez du <strong>petit électroménager</strong>, des ustensiles pratiques, de la vaisselle et des accessoires de rangement, à <strong>petits prix</strong>, pour gagner du temps derrière les fourneaux comme à table.'
      },
      {
        title: 'Simple, rapide, et payé à la réception',
        content: 'Pas besoin de sortir votre carte bancaire tout de suite : commandez, et réglez uniquement au moment où votre colis arrive, où que vous soyez au Maroc. C\'est ce qu\'on appelle le <strong>paiement à la livraison</strong>, disponible sur tout notre catalogue cuisine.'
      },
      {
        title: 'Envie des meilleurs prix ?',
        content: 'Retrouvez régulièrement des articles cuisine à <strong>meilleurs prix</strong> dans nos <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Ventes Flash</a>, le temps d\'une offre limitée.'
      },
      {
        title: 'Une cuisine bien équipée, une maison encore mieux',
        content: 'Après la cuisine, pensez au reste de votre intérieur : notre univers <a href="https://www.much.ma/product-category/maison" class="text-[#ff4f24] hover:underline">Maison</a> complète parfaitement votre sélection, tout comme <a href="https://www.much.ma/product-category/tech" class="text-[#ff4f24] hover:underline">Tech</a> pour vos appareils connectés. Retrouvez l\'ensemble sur <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">notre catalogue complet</a>.'
      }
    ],
    faq: [
      {
        question: 'Proposez-vous du petit électroménager de cuisine ?',
        answer: 'Oui, notre catégorie Cuisine inclut du petit électroménager en plus des ustensiles et accessoires de rangement.'
      },
      {
        question: 'Puis-je régler ma commande à la livraison ?',
        answer: 'Oui, le paiement se fait directement auprès du livreur, à la réception de votre colis.'
      },
      {
        question: 'Ma ville est-elle desservie ?',
        answer: 'Much.ma livre dans l\'ensemble du territoire marocain.'
      }
    ]
  },
  'tech': {
    metaTitle: 'Tech – Gadgets, Audio & Accessoires | Much.ma',
    metaDescription: 'Gadgets, accessoires audio et high-tech à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Tech — Les dernières trouvailles high-tech',
    h3Sections: [
      {
        title: 'Gadgets, audio et accessoires connectés',
        content: 'Enceintes portables, écouteurs, accessoires de charge, gadgets pratiques... Notre sélection <strong>Tech</strong> s\'agrandit chaque semaine avec de nouvelles trouvailles, à <strong>petits prix</strong>, pour rester connecté sans se ruiner.'
      },
      {
        title: 'Testez avant d\'adopter',
        content: 'Beaucoup de nos articles tech deviennent vite indispensables — un accessoire audio, un gadget malin pour la maison ou le bureau. Réglez au moment de la réception grâce au <strong>paiement à la livraison</strong>, partout au Maroc.'
      },
      {
        title: 'Ne manquez pas les meilleures affaires',
        content: 'Les articles tech partent vite en <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Vente Flash</a> — de quoi profiter des <strong>meilleurs prix</strong> sur une sélection limitée dans le temps.'
      },
      {
        title: 'Complétez votre univers connecté',
        content: 'Un accessoire tech pour la cuisine, ou une trouvaille pour toute la famille ? Explorez aussi nos univers <a href="https://www.much.ma/product-category/maison" class="text-[#ff4f24] hover:underline">Maison</a> et <a href="https://www.much.ma/product-category/kids" class="text-[#ff4f24] hover:underline">Kids</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tout le catalogue</a>.'
      }
    ],
    faq: [
      {
        question: 'Quel type de produits tech trouve-t-on sur Much.ma ?',
        answer: 'Enceintes portables, accessoires audio, gadgets connectés et accessoires pratiques pour le quotidien.'
      },
      {
        question: 'Les articles tech sont-ils garantis ?',
        answer: 'Pour toute question sur un produit spécifique, notre service client basé au Maroc reste disponible pour vous répondre.'
      },
      {
        question: 'Puis-je payer à la réception pour un article tech ?',
        answer: 'Oui, le paiement à la livraison s\'applique à l\'ensemble de notre catalogue tech, partout au Maroc.'
      }
    ]
  },
  'beaute': {
    metaTitle: 'Beauté – Soin, Maquillage & Parfums | Much.ma',
    metaDescription: 'Produits de soin, maquillage et parfums à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Beauté — Prenez soin de vous, sans vous ruiner',
    h3Sections: [
      {
        title: 'Soin, maquillage et parfums au quotidien',
        content: 'Une routine beauté ne devrait pas coûter cher. Sur Much.ma, retrouvez des produits de <strong>soin</strong>, du <strong>maquillage</strong> et des <strong>parfums</strong> à <strong>petits prix</strong>, pour prendre soin de vous sans faire de compromis.'
      },
      {
        title: 'Craquez, sans avancer un centime',
        content: 'Envie de tester un nouveau produit sans engagement ? Avec le <strong>paiement à la livraison</strong>, vous réglez uniquement une fois votre commande entre les mains, partout au Maroc.'
      },
      {
        title: 'Les coups de cœur à ne pas rater',
        content: 'Nos articles beauté figurent régulièrement parmi les <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Ventes Flash</a> — l\'occasion de dénicher les <strong>meilleurs prix</strong> sur une sélection limitée.'
      },
      {
        title: 'Complétez votre look',
        content: 'Après la beauté, pensez à votre garde-robe : découvrez notre univers <a href="https://www.much.ma/product-category/mode" class="text-[#ff4f24] hover:underline">Mode</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tout le catalogue</a> Much.ma.'
      }
    ],
    faq: [
      {
        question: 'Les produits beauté sont-ils adaptés à tous types de peau ?',
        answer: 'Chaque fiche produit précise les caractéristiques et l\'utilisation recommandée — pensez à bien la consulter avant d\'ajouter au panier.'
      },
      {
        question: 'Proposez-vous des produits pour hommes et femmes ?',
        answer: 'Oui, notre catégorie Beauté regroupe des soins, du maquillage et des parfums adaptés à tous.'
      },
      {
        question: 'Le paiement à la livraison fonctionne-t-il sur les produits beauté ?',
        answer: 'Oui, comme sur l\'ensemble du catalogue, vous réglez directement au livreur à la réception.'
      }
    ]
  },
  'mode': {
    metaTitle: 'Mode – Vêtements & Accessoires | Much.ma',
    metaDescription: 'Vêtements, chaussures et accessoires de mode à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Mode — Renouvelez votre garde-robe',
    h3Sections: [
      {
        title: 'Vêtements, chaussures et accessoires pour tous les styles',
        content: 'Sacs, chaussures, vêtements du quotidien et accessoires tendance : notre catégorie <strong>Mode</strong> propose un large choix à <strong>petits prix</strong>, pour renouveler votre garde-robe sans attendre les soldes.'
      },
      {
        title: 'Un style qui vous ressemble, sans risque',
        content: 'Pas convaincue avant de voir l\'article en vrai ? Avec le <strong>paiement à la livraison</strong>, vous réglez uniquement une fois la commande entre vos mains, partout au Maroc.'
      },
      {
        title: 'Les meilleures pièces au meilleur prix',
        content: 'Sacs, chaussures ou accessoires du moment : retrouvez régulièrement une sélection mode dans nos <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Ventes Flash</a>, pour dénicher les <strong>meilleurs prix</strong> avant qu\'ils ne partent.'
      },
      {
        title: 'Complétez votre tenue',
        content: 'Un accessoire beauté pour parfaire votre look ? Découvrez aussi notre univers <a href="https://www.much.ma/product-category/beaute" class="text-[#ff4f24] hover:underline">Beauté</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tout le catalogue</a> Much.ma.'
      }
    ],
    faq: [
      {
        question: 'Les tailles indiquées sont-elles fiables ?',
        answer: 'Chaque fiche produit précise les mensurations disponibles — pensez à vérifier le guide des tailles avant de commander.'
      },
      {
        question: 'Proposez-vous des articles pour hommes et femmes ?',
        answer: 'Oui, notre catégorie Mode regroupe des vêtements, chaussures et accessoires pour toute la famille.'
      },
      {
        question: 'Puis-je payer à la réception pour un article mode ?',
        answer: 'Oui, le paiement à la livraison s\'applique à l\'ensemble de notre catalogue mode, partout au Maroc.'
      }
    ]
  },
  'auto': {
    metaTitle: 'Auto – Accessoires & Entretien | Much.ma',
    metaDescription: 'Accessoires auto, entretien et équipements à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Auto — Équipez et entretenez votre véhicule',
    h3Sections: [
      {
        title: 'Accessoires, entretien et petits équipements',
        content: 'Supports, accessoires d\'entretien, gadgets pratiques pour l\'habitacle : notre catégorie <strong>Auto</strong> réunit l\'essentiel pour prendre soin de votre véhicule, à <strong>petits prix</strong>.'
      },
      {
        title: 'Commandez sans avancer d\'argent',
        content: 'Testez un nouvel accessoire pour votre voiture sans risque : grâce au <strong>paiement à la livraison</strong>, vous réglez uniquement à réception de votre commande, partout au Maroc.'
      },
      {
        title: 'Ne passez pas à côté des bonnes affaires',
        content: 'Les accessoires auto figurent régulièrement dans nos <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Ventes Flash</a> — l\'occasion de profiter des <strong>meilleurs prix</strong> sur une sélection limitée.'
      },
      {
        title: 'Explorez d\'autres univers',
        content: 'Un gadget tech pour votre voiture ou un accessoire pour toute la famille ? Découvrez aussi <a href="https://www.much.ma/product-category/tech" class="text-[#ff4f24] hover:underline">Tech</a> et <a href="https://www.much.ma/product-category/kids" class="text-[#ff4f24] hover:underline">Kids</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tout le catalogue</a>.'
      }
    ],
    faq: [
      {
        question: 'Les accessoires sont-ils compatibles avec tous les véhicules ?',
        answer: 'Chaque fiche produit précise les compatibilités et dimensions — vérifiez-les avant de commander.'
      },
      {
        question: 'Proposez-vous des produits d\'entretien pour l\'intérieur du véhicule ?',
        answer: 'Oui, notre catégorie Auto inclut des accessoires d\'entretien en plus des équipements pratiques pour l\'habitacle.'
      },
      {
        question: 'Puis-je payer à la réception pour un article auto ?',
        answer: 'Oui, le paiement à la livraison s\'applique à l\'ensemble de notre catalogue auto, partout au Maroc.'
      }
    ]
  },
  'kids': {
    metaTitle: 'Kids – Jouets, Vêtements & Accessoires | Much.ma',
    metaDescription: 'Jouets, vêtements et accessoires pour enfants à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Kids — Pour le bonheur des petits',
    h3Sections: [
      {
        title: 'Jouets, vêtements et accessoires pour toute la famille',
        content: 'Trousses, sacs, jouets, vêtements pratiques : notre catégorie <strong>Kids</strong> rassemble tout ce qu\'il faut pour les enfants, à <strong>petits prix</strong>, de la rentrée aux sorties du quotidien.'
      },
      {
        title: 'Réglez seulement à la réception',
        content: 'Envie d\'un nouvel article pour votre enfant sans avancer d\'argent ? Avec le <strong>paiement à la livraison</strong>, vous payez uniquement une fois la commande reçue, partout au Maroc.'
      },
      {
        title: 'Les indispensables au meilleur prix',
        content: 'Retrouvez régulièrement une sélection d\'articles enfants dans nos <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Ventes Flash</a> — de quoi profiter des <strong>meilleurs prix</strong> avant qu\'ils ne partent.'
      },
      {
        title: 'Complétez avec d\'autres univers',
        content: 'Un accessoire pratique pour la maison ou un gadget pour toute la famille ? Découvrez aussi <a href="https://www.much.ma/product-category/maison" class="text-[#ff4f24] hover:underline">Maison</a> et <a href="https://www.much.ma/product-category/tech" class="text-[#ff4f24] hover:underline">Tech</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tout le catalogue</a>.'
      }
    ],
    faq: [
      {
        question: 'À partir de quel âge les articles sont-ils adaptés ?',
        answer: 'Chaque fiche produit précise la tranche d\'âge recommandée — pensez à la vérifier avant de commander.'
      },
      {
        question: 'Proposez-vous des vêtements en plus des jouets ?',
        answer: 'Oui, notre catégorie Kids regroupe des jouets, vêtements et accessoires pour enfants.'
      },
      {
        question: 'Puis-je payer à la réception pour un article enfant ?',
        answer: 'Oui, le paiement à la livraison s\'applique à l\'ensemble de notre catalogue Kids, partout au Maroc.'
      }
    ]
  },
  'sport': {
    metaTitle: 'Sport – Fitness, Plein Air & Accessoires | Much.ma',
    metaDescription: 'Équipements fitness, plein air et accessoires sport à petits prix sur Much.ma. Livraison partout au Maroc, paiement à la livraison.',
    h2Title: 'Sport — Restez actif au quotidien',
    h3Sections: [
      {
        title: 'Fitness, plein air et accessoires pratiques',
        content: 'Que vous vous entraîniez à la maison ou en extérieur, notre catégorie <strong>Sport</strong> propose des équipements fitness et des accessoires pratiques à <strong>petits prix</strong>, pour rester actif sans se ruiner.'
      },
      {
        title: 'Testez sans engagement',
        content: 'Envie d\'essayer un nouvel accessoire sportif ? Avec le <strong>paiement à la livraison</strong>, vous réglez uniquement une fois la commande reçue, partout au Maroc.'
      },
      {
        title: 'Le bon équipement au meilleur prix',
        content: 'Nos articles sport reviennent régulièrement dans les <a href="https://www.much.ma/product-category/vente-flash" class="text-[#ff4f24] hover:underline">Ventes Flash</a> — l\'occasion de profiter des <strong>meilleurs prix</strong> sur une sélection limitée.'
      },
      {
        title: 'Explorez d\'autres univers',
        content: 'Un accessoire tech pour suivre vos performances, ou une trouvaille pour toute la famille ? Découvrez aussi <a href="https://www.much.ma/product-category/tech" class="text-[#ff4f24] hover:underline">Tech</a> et <a href="https://www.much.ma/product-category/kids" class="text-[#ff4f24] hover:underline">Kids</a>, ou parcourez <a href="https://www.much.ma/products" class="text-[#ff4f24] hover:underline">tout le catalogue</a>.'
      }
    ],
    faq: [
      {
        question: 'Proposez-vous du matériel pour le fitness à la maison ?',
        answer: 'Oui, notre catégorie Sport regroupe des équipements fitness ainsi que des accessoires pour les activités en extérieur.'
      },
      {
        question: 'Les accessoires sont-ils adaptés aux débutants ?',
        answer: 'Chaque fiche produit précise l\'usage recommandé — n\'hésitez pas à la consulter avant de commander.'
      },
      {
        question: 'Puis-je payer à la réception pour un article sport ?',
        answer: 'Oui, le paiement à la livraison s\'applique à l\'ensemble de notre catalogue sport, partout au Maroc.'
      }
    ]
  }
};


export function useCategorySEO(slug: string | undefined) {
  const currentSEO = computed(() => {
    if (!slug) return null;
    return categorySEOConfig[slug] || null;
  });

  useHead(() => {
    const seo = currentSEO.value;
    const currentSlug = slug || "catalogue";
    
    return {
      title: seo?.metaTitle || `${currentSlug} - Produits | Much.ma`,
      meta: [
        { name: "description", content: seo?.metaDescription || "Découvrez nos produits sur Much.ma" },
        { property: "og:title", content: seo?.metaTitle || undefined },
        { property: "og:description", content: seo?.metaDescription || undefined }
      ],
      script: seo ? [{
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: seo.faq.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer
            }
          }))
        })
      }] : []
    };
  });

  return { currentSEO };
}