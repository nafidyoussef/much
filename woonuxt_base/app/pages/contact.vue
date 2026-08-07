<script setup lang="ts">
import { ref, computed } from 'vue';

// ==========================================
// 1. Données de contact
// ==========================================
const contactInfo = [
  {
    icon: 'ion:logo-whatsapp',
    title: 'WhatsApp',
    value: '+212 6 64 61 20 98',
    link: 'https://wa.me/212664612098',
    description: 'Réponse en moins de 2h',
    color: 'bg-[#25D366]/10 text-[#25D366]'
  },
  {
    icon: 'ion:call',
    title: 'Téléphone',
    value: '+212 6 64 61 20 98',
    link: 'tel:+212664612098',
    description: 'Lun - Sam, 9h - 18h',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: 'ion:mail',
    title: 'Email',
    value: 'contact@much.ma',
    link: 'mailto:contact@much.ma',
    description: 'Réponse sous 24h',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: 'ion:location',
    title: 'Adresse',
    value: 'Casablanca, Maroc',
    link: null,
    description: 'Livraison nationale',
    color: 'bg-[#ff4f24]/10 text-[#ff4f24]'
  }
];

// ==========================================
// 2. Formulaire de contact
// ==========================================
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const formError = ref('');

const isFormValid = computed(() => {
  return formData.name.trim() && formData.email.trim() && formData.message.trim();
});

const submitForm = async () => {
  if (!isFormValid.value) {
    formError.value = 'Veuillez remplir tous les champs obligatoires.';
    return;
  }

  formError.value = '';
  isSubmitting.value = true;

  
    // Simuler l'envoi (remplacez par votre vraie logique d'envoi)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ✅ Option 1 : Envoyer via WhatsApp
    const whatsappMessage = `Bonjour Much,\n\nNom: ${formData.name}\nEmail: ${formData.email}\nTéléphone: ${formData.phone}\nSujet: ${formData.subject}\n\nMessage:\n${formData.message}`;
    window.open(`https://wa.me/212664612098?text=${encodeURIComponent(whatsappMessage)}`, '_blank');

    isSubmitted.value = true;

    // Réinitialiser le formulaire
    formData.name = '';
    formData.email = '';
    formData.phone = '';
    formData.subject = '';
    formData.message = '';

  
};

// ==========================================
// 3. FAQ rapides
// ==========================================
const quickFaq = [
  { q: 'Quel est le délai de livraison ?', a: '24 à 48h pour les grandes villes, 48 à 72h pour le reste du Maroc.' },
  { q: 'Puis-je payer à la livraison ?', a: 'Oui, nous acceptons le paiement en espèces à la livraison partout au Maroc.' },
  { q: 'Comment retourner un produit ?', a: 'Contactez-nous via WhatsApp dans les 7 jours suivant la réception.' }
];

useSeoMeta({
  title: 'Contactez-nous - Much.ma',
  description: 'Contactez l\'équipe Much.ma par WhatsApp, téléphone ou email. Nous sommes à votre écoute du lundi au samedi.',
  ogTitle: 'Contact - Much.ma',
  ogDescription: 'Une question ? Notre équipe marocaine vous répond en moins de 2h.'
});
</script>

<template>
  <main class="min-h-screen bg-gray-50/50">
    
    <!-- ========================================== -->
    <!-- 🎨 HERO SECTION -->
    <!-- ========================================== -->
    <section class="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-20">
      <div class="absolute top-0 right-0 w-96 h-96 bg-[#ff4f24]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-[#ff4f24]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="container relative max-w-4xl mx-auto px-4 text-center">
        <span class="inline-block px-4 py-1.5 bg-[#ff4f24]/20 backdrop-blur-sm rounded-full text-sm font-semibold text-[#ff4f24] mb-6">
          💬 Nous sommes là pour vous
        </span>
        <h1 class="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          Contactez-nous
        </h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          Une question, une suggestion ou un problème ? Notre équipe marocaine vous répond rapidement, du lundi au samedi.
        </p>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 📞 CARTES DE CONTACT RAPIDE -->
    <!-- ========================================== -->
    <section class="py-12 md:py-16 -mt-8 relative z-10">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <component 
            v-for="(info, index) in contactInfo" 
            :key="index"
            :is="info.link ? 'a' : 'div'"
            :href="info.link || undefined"
            :target="info.link ? '_blank' : undefined"
            :rel="info.link ? 'noopener noreferrer' : undefined"
            class="group bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
          >
            <div :class="info.color" class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Icon :name="info.icon" size="24" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 mb-1">
              {{ info.title }}
            </h3>
            <p class="text-xs md:text-sm text-[#ff4f24] font-semibold mb-1">
              {{ info.value }}
            </p>
            <p class="text-[10px] md:text-xs text-gray-400">
              {{ info.description }}
            </p>
          </component>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 📝 FORMULAIRE + INFOS -->
    <!-- ========================================== -->
    <section class="py-8 md:py-12">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-8 lg:gap-12">
          
          <!-- Colonne Gauche : Formulaire (3/5) -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 class="text-2xl font-extrabold text-gray-900 mb-2">
                Envoyez-nous un message
              </h2>
              <p class="text-gray-500 text-sm mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>

              <!-- ✅ Message de succès -->
              <div v-if="isSubmitted" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <Icon name="ion:checkmark-circle" class="text-green-500 mt-0.5 shrink-0" size="24" />
                <div>
                  <p class="text-green-800 font-semibold">Message envoyé avec succès !</p>
                  <p class="text-green-600 text-sm mt-1">Nous vous répondrons très bientôt. Vous pouvez aussi nous joindre directement via WhatsApp.</p>
                </div>
              </div>

              <!-- ✅ Message d'erreur -->
              <div v-if="formError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <Icon name="ion:alert-circle" class="text-red-500 mt-0.5 shrink-0" size="24" />
                <p class="text-red-700 font-medium text-sm">{{ formError }}</p>
              </div>

              <!-- Formulaire -->
              <form @submit.prevent="submitForm" class="space-y-5">
                <div class="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      Nom complet <span class="text-[#ff4f24]">*</span>
                    </label>
                    <input 
                      v-model="formData.name" 
                      type="text" 
                      placeholder="Ex: Ahmed Alami" 
                      required
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span class="text-[#ff4f24]">*</span>
                    </label>
                    <input 
                      v-model="formData.email" 
                      type="email" 
                      placeholder="votre@email.com" 
                      required
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    />
                  </div>
                </div>

                <div class="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      Téléphone
                    </label>
                    <input 
                      v-model="formData.phone" 
                      type="tel" 
                      placeholder="06 12 34 56 78" 
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      Sujet
                    </label>
                    <select 
                      v-model="formData.subject"
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white text-gray-700"
                    >
                      <option value="">Choisir un sujet...</option>
                      <option value="commande">Question sur une commande</option>
                      <option value="livraison">Problème de livraison</option>
                      <option value="retour">Retour / Échange</option>
                      <option value="produit">Question sur un produit</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span class="text-[#ff4f24]">*</span>
                  </label>
                  <textarea 
                    v-model="formData.message" 
                    rows="5" 
                    placeholder="Décrivez votre demande en détail..." 
                    required
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  :disabled="isSubmitting || !isFormValid"
                  class="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ff4f24] text-white font-bold rounded-xl hover:bg-[#e64621] transition-all duration-300 shadow-lg shadow-[#ff4f24]/20 hover:shadow-[#ff4f24]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isSubmitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
                </button>

                <p class="text-xs text-gray-400 text-center">
                  En envoyant ce message, vous acceptez notre 
                  <NuxtLink to="/privacy" class="text-[#ff4f24] hover:underline">politique de confidentialité</NuxtLink>.
                </p>
              </form>
            </div>
          </div>

          <!-- Colonne Droite : Infos + FAQ (2/5) -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Horaires -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="ion:time" class="text-[#ff4f24]" size="20" />
                Horaires de disponibilité
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-700 font-medium">Lundi - Vendredi</span>
                  <span class="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">9h - 18h</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-700 font-medium">Samedi</span>
                  <span class="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">9h - 14h</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-700 font-medium">Dimanche</span>
                  <span class="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Fermé</span>
                </div>
              </div>
            </div>

            <!-- FAQ Rapides -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="ion:help-circle" class="text-[#ff4f24]" size="20" />
                Questions fréquentes
              </h3>
              <div class="space-y-4">
                <div v-for="(faq, index) in quickFaq" :key="index" class="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <p class="text-sm font-semibold text-gray-800 mb-1">
                    {{ faq.q }}
                  </p>
                  <p class="text-xs text-gray-500 leading-relaxed">
                    {{ faq.a }}
                  </p>
                </div>
              </div>
              <NuxtLink 
                to="/faq" 
                class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#ff4f24] hover:underline"
              >
                Voir toutes les FAQ
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
            </div>

            <!-- CTA WhatsApp -->
            <a 
              href="https://wa.me/212664612098" 
              target="_blank"
              rel="noopener noreferrer"
              class="block bg-[#25D366] rounded-2xl p-6 text-white text-center hover:bg-[#20bd5a] transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 hover:-translate-y-0.5"
            >
              <svg class="w-10 h-10 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <p class="font-bold text-lg mb-1">Besoin d'aide rapide ?</p>
              <p class="text-sm text-white/80">Écrivez-nous sur WhatsApp, réponse en moins de 2h !</p>
            </a>

          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 🗺️ CARTE / LOCALISATION (Optionnel) -->
    <!-- ========================================== -->
    <section class="py-12 md:py-16 bg-gray-50/50">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="text-center mb-8">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Nous livrons partout au Maroc 🇲🇦
          </h2>
          <p class="text-gray-500">
            De Tanger à Dakhla, en passant par Casablanca, Rabat, Marrakech et Fès.
          </p>
        </div>
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106376.72691747498!2d-7.66957745!3d33.57249465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma" 
            width="100%" 
            height="350" 
            style="border:0;" 
           
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="w-full"
          ></iframe>
        </div>
      </div>
    </section>

  </main>
</template>