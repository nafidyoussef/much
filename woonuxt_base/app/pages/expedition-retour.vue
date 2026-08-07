<script setup lang="ts">
useSeoMeta({
  title: 'Expédition et Retours - Much.ma',
  description: 'Toutes les informations sur la livraison, les délais d\'expédition et notre politique de retour sur Much.ma.'
});

const shippingZones = [
  { zone: 'Casablanca, Rabat, Salé', delay: '24 - 48h', fee: 'Gratuit dès 300 DH' },
  { zone: 'Tanger, Marrakech, Fès, Meknès, Agadir', delay: '24 - 48h', fee: 'Gratuit dès 300 DH' },
  { zone: 'Autres grandes villes', delay: '48 - 72h', fee: '30 DH' },
  { zone: 'Zones rurales et éloignées', delay: '72 - 96h', fee: '45 DH' }
];

const returnSteps = [
  {
    step: '1',
    title: 'Contactez-nous',
    description: 'Envoyez-nous un message sur WhatsApp au +212 6 64 61 20 98 dans les 7 jours suivant la réception.',
    icon: 'ion:chatbubbles'
  },
  {
    step: '2',
    title: 'Préparez le colis',
    description: 'Remballez le produit dans son emballage d\'origine, non utilisé et avec tous ses accessoires.',
    icon: 'ion:cube'
  },
  {
    step: '3',
    title: 'Expédiez-nous le produit',
    description: 'Nous vous fournirons l\'adresse de retour et les instructions détaillées par WhatsApp.',
    icon: 'ion:send'
  },
  {
    step: '4',
    title: 'Recevez votre remboursement',
    description: 'Sous 3 à 5 jours ouvrables après réception et vérification du produit retourné.',
    icon: 'ion:cash'
  }
];
</script>

<template>
  <main class="min-h-screen bg-gray-50/50 py-12 md:py-16">
    <div class="container max-w-4xl mx-auto px-4">
      
      <!-- ========================================== -->
      <!-- 📦 EN-TÊTE -->
      <!-- ========================================== -->
      <div class="text-center mb-12">
        <span class="inline-block px-4 py-1.5 bg-[#ff4f24]/10 text-[#ff4f24] text-sm font-bold rounded-full mb-4">
          📦 Livraison & Retours
        </span>
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Expédition et Retours
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Tout ce que vous devez savoir sur la livraison de vos commandes et notre politique de retour.
        </p>
      </div>

      <!-- ========================================== -->
      <!-- 🚚 SECTION EXPÉDITION -->
      <!-- ========================================== -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-xl bg-[#ff4f24]/10 flex items-center justify-center">
            <Icon name="ion:truck" class="text-[#ff4f24]" size="24" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Délais de livraison</h2>
        </div>

        <p class="text-gray-600 mb-6 leading-relaxed">
          Nous livrons <strong class="text-gray-900">partout au Maroc</strong> via nos partenaires de confiance. Les délais varient selon votre zone géographique.
        </p>

        <!-- Tableau des zones -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-gray-100">
                <th class="text-left py-3 px-2 font-semibold text-gray-700">Zone</th>
                <th class="text-left py-3 px-2 font-semibold text-gray-700">Délai</th>
                <th class="text-left py-3 px-2 font-semibold text-gray-700">Frais</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(zone, index) in shippingZones" :key="index" class="hover:bg-gray-50/50 transition-colors">
                <td class="py-4 px-2 text-gray-800 font-medium">{{ zone.zone }}</td>
                <td class="py-4 px-2 text-gray-600">{{ zone.delay }}</td>
                <td class="py-4 px-2">
                  <span 
                    class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="zone.fee.includes('Gratuit') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'"
                  >
                    {{ zone.fee }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Info importante -->
        <div class="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
          <Icon name="ion:information-circle" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p class="text-sm text-gray-700">
            <strong>Important :</strong> Un numéro de suivi vous sera envoyé par SMS et WhatsApp dès que votre colis sera expédié.
          </p>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 💰 PAIEMENT À LA LIVRAISON -->
      <!-- ========================================== -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <Icon name="ion:cash" class="text-green-600" size="24" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Paiement à la livraison</h2>
        </div>
        <p class="text-gray-600 leading-relaxed">
          Vous pouvez régler votre commande <strong class="text-gray-900">en espèces à la réception</strong> de votre colis. Aucun paiement en ligne n'est nécessaire. Vous inspectez le produit avant de payer.
        </p>
      </section>

      <!-- ========================================== -->
      <!-- 🔄 POLITIQUE DE RETOUR -->
      <!-- ========================================== -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-xl bg-[#ff4f24]/10 flex items-center justify-center">
            <Icon name="ion:refresh" class="text-[#ff4f24]" size="24" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Politique de retour</h2>
        </div>

        <div class="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Chez Much, votre satisfaction est notre priorité. Vous disposez d'un <strong class="text-gray-900">délai de 7 jours</strong> après la réception de votre commande pour demander un retour ou un échange.
          </p>

          <div class="p-4 bg-[#ff4f24]/5 border border-[#ff4f24]/20 rounded-xl">
            <h3 class="font-bold text-gray-900 mb-2">⚠️ Conditions pour un retour accepté :</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start gap-2">
                <Icon name="ion:checkmark-circle" class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Le produit doit être <strong>non utilisé</strong> et dans son état d'origine.</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="ion:checkmark-circle" class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>L'<strong>emballage d'origine</strong> doit être intact.</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="ion:checkmark-circle" class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Tous les <strong>accessoires et documents</strong> doivent être inclus.</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="ion:checkmark-circle" class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>La demande doit être faite dans les <strong>7 jours</strong> suivant la réception.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 📋 PROCÉDURE DE RETOUR -->
      <!-- ========================================== -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-xl bg-[#ff4f24]/10 flex items-center justify-center">
            <Icon name="ion:clipboard" class="text-[#ff4f24]" size="24" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Comment retourner un produit ?</h2>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div 
            v-for="(step, index) in returnSteps" 
            :key="index"
            class="relative bg-gray-50/50 rounded-xl p-5 border border-gray-100"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff4f24] text-white flex items-center justify-center font-bold text-lg">
                {{ step.step }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon :name="step.icon" class="text-[#ff4f24]" size="18" />
                  <h3 class="font-bold text-gray-900">{{ step.title }}</h3>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 💳 REMBOURSEMENT -->
      <!-- ========================================== -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <Icon name="ion:wallet" class="text-green-600" size="24" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Remboursement</h2>
        </div>
        <div class="space-y-3 text-gray-600 leading-relaxed">
          <p>
            Une fois votre retour reçu et vérifié, nous procédons au remboursement sous <strong class="text-gray-900">3 à 5 jours ouvrables</strong>.
          </p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <Icon name="ion:checkmark-circle" class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Paiement à la livraison : remboursement en espèces ou par virement bancaire.</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="ion:checkmark-circle" class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Paiement par carte : remboursement sur la carte utilisée.</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 📞 CTA WHATSAPP -->
      <!-- ========================================== -->
      <section class="bg-gradient-to-br from-[#ff4f24] to-[#e64621] rounded-2xl p-8 text-center text-white shadow-lg shadow-[#ff4f24]/20">
        <h3 class="text-2xl font-bold mb-3">Une question ?</h3>
        <p class="text-white/90 mb-6 max-w-lg mx-auto">
          Notre équipe est disponible du lundi au samedi, de 9h à 18h, pour vous aider avec vos commandes et retours.
        </p>
        <a 
          href="https://wa.me/212664612098?text=Bonjour%2C%20j%27ai%20une%20question%20concernant%20une%20livraison%20ou%20un%20retour"
          target="_blank"
          class="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#ff4f24] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Nous contacter sur WhatsApp
        </a>
      </section>

    </div>
  </main>
</template>