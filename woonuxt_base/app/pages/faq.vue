<script setup lang="ts">
import { ref, computed } from 'vue';

// ==========================================
// 1. Données de la FAQ (Personnalisables)
// ==========================================
const faqData = [
  {
    category: '📦 Commandes & Livraison',
    items: [
      {
        id: 'c1-q1',
        question: 'Comment passer une commande sur Much.ma ?',
        answer: 'C\'est très simple ! Parcourez nos catégories, ajoutez les produits qui vous plaisent à votre panier, puis cliquez sur "Acheter maintenant" ou "Passer au paiement". Remplissez vos informations de livraison et confirmez.'
      },
      {
        id: 'c1-q2',
        question: 'Quels sont les délais de livraison au Maroc ?',
        answer: 'Nous livrons partout au Maroc. Les délais sont généralement de 24 à 48h pour les grandes villes (Casablanca, Rabat, Marrakech, Tanger, etc.) et de 48 à 72h pour les autres régions.'
      },
      {
        id: 'c1-q3',
        question: 'Puis-je modifier ou annuler ma commande ?',
        answer: 'Oui, vous pouvez nous contacter immédiatement via WhatsApp ou par téléphone après avoir passé votre commande. Si elle n\'a pas encore été expédiée, nous pourrons la modifier ou l\'annuler sans frais.'
      }
    ]
  },
  {
    category: '💳 Paiement',
    items: [
      {
        id: 'c2-q1',
        question: 'Quels modes de paiement acceptez-vous ?',
        answer: 'Nous acceptons le paiement à la livraison (en espèces) pour votre tranquillité d\'esprit, ainsi que le paiement sécurisé par carte bancaire via notre plateforme de paiement en ligne.'
      },
      {
        id: 'c2-q2',
        question: 'Le paiement en ligne est-il sécurisé ?',
        answer: 'Absolument. Toutes les transactions par carte bancaire sont cryptées et sécurisées via des protocoles SSL. Nous ne stockons jamais vos informations bancaires.'
      }
    ]
  },
  {
    category: '🔄 Retours & Échanges',
    items: [
      {
        id: 'c3-q1',
        question: 'Quelle est votre politique de retour ?',
        answer: 'Vous disposez d\'un délai de 7 jours après la réception de votre colis pour demander un retour ou un échange. Le produit doit être dans son état d\'origine, non utilisé et avec son emballage intact.'
      },
      {
        id: 'c3-q2',
        question: 'Comment obtenir un remboursement ?',
        answer: 'Si votre demande de retour est approuvée, le remboursement sera effectué par le même moyen de paiement que celui utilisé lors de l\'achat, sous un délai de 3 à 5 jours ouvrables.'
      }
    ]
  },
  {
    category: '👤 Compte & Promotions',
    items: [
      {
        id: 'c4-q1',
        question: 'Est-il obligatoire de créer un compte pour commander ?',
        answer: 'Non, vous pouvez passer une commande en tant qu\'invité. Cependant, créer un compte vous permet de suivre vos commandes plus facilement et de bénéficier d\'offres exclusives.'
      },
      {
        id: 'c4-q2',
        question: 'Comment utiliser un code promo ?',
        answer: 'Lors de la finalisation de votre commande (page Checkout), vous trouverez un champ "Code promo". Saisissez votre code et cliquez sur "Appliquer". La réduction sera immédiatement déduite de votre total.'
      }
    ]
  }
];

// ==========================================
// 2. Logique de Recherche et d'Accordéon
// ==========================================
const searchQuery = ref('');
const openItemId = ref<string | null>(null);

// Filtrer les catégories et questions en fonction de la recherche
const filteredFaqData = computed(() => {
  if (!searchQuery.value.trim()) return faqData;

  const query = searchQuery.value.toLowerCase();
  return faqData.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    )
  })).filter(cat => cat.items.length > 0);
});

const toggleItem = (id: string) => {
  openItemId.value = openItemId.value === id ? null : id;
};

useSeoMeta({
  title: 'Foire Aux Questions (FAQ) - Much.ma',
  description: 'Retrouvez les réponses à toutes vos questions sur les commandes, la livraison, les paiements et les retours sur Much.ma.'
});
</script>

<template>
  <main class="min-h-screen bg-gray-50/50 py-12 md:py-16">
    <div class="container max-w-4xl mx-auto px-4">
      
      <!-- En-tête de la page -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Comment pouvons-nous vous aider ?
        </h1>
        <p class="text-gray-600 max-w-2xl mx-auto mb-8">
          Retrouvez ci-dessous les réponses aux questions les plus fréquemment posées par nos clients.
        </p>

        <!-- Barre de recherche -->
        <div class="relative max-w-xl mx-auto">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher une question (ex: livraison, retour, paiement...)" 
            class="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Contenu de la FAQ -->
      <div v-if="filteredFaqData.length > 0" class="space-y-8">
        <div v-for="(category, catIndex) in filteredFaqData" :key="catIndex" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <!-- Titre de la catégorie -->
          <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              {{ category.category }}
            </h2>
          </div>

          <!-- Liste des questions (Accordéon) -->
          <div class="divide-y divide-gray-100">
            <div v-for="item in category.items" :key="item.id" class="group">
              <button 
                @click="toggleItem(item.id)"
                class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/80 transition-colors duration-200 focus:outline-none"
              >
                <span class="text-base font-semibold text-gray-800 group-hover:text-[#ff4f24] transition-colors pr-4">
                  {{ item.question }}
                </span>
                <!-- Icône Chevron animée -->
                <svg 
                  class="w-5 h-5 text-gray-400 group-hover:text-[#ff4f24] transition-all duration-300 flex-shrink-0"
                  :class="{ 'rotate-180 text-[#ff4f24]': openItemId === item.id }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Réponse (avec transition fluide) -->
              <div 
                v-if="openItemId === item.id" 
                class="px-6 pb-5 text-gray-600 leading-relaxed animate-fade-in"
              >
                <div class="pl-4 border-l-2 border-[#ff4f24]/30">
                  {{ item.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide si aucune recherche ne correspond -->
      <div v-else class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-500 font-medium">Aucune réponse trouvée pour "{{ searchQuery }}".</p>
        <button @click="searchQuery = ''" class="mt-4 text-[#ff4f24] font-semibold hover:underline">
          Effacer la recherche
        </button>
      </div>

      <!-- Section d'aide supplémentaire (CTA) -->
      <div class="mt-16 text-center bg-[#ff4f24]/5 border border-[#ff4f24]/20 rounded-2xl p-8 md:p-12">
        <h3 class="text-xl font-bold text-gray-900 mb-3">Vous n'avez pas trouvé votre réponse ?</h3>
        <p class="text-gray-600 mb-6 max-w-lg mx-auto">
          Notre équipe de support est disponible pour vous aider du lundi au samedi, de 9h à 18h.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://wa.me/212664612098" 
            target="_blank"
            class="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-all shadow-sm shadow-[#25D366]/20"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Nous contacter sur WhatsApp
          </a>
          <NuxtLink 
            to="/contact" 
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Envoyer un e-mail
          </NuxtLink>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
/* Animation fluide pour l'ouverture de l'accordéon */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>