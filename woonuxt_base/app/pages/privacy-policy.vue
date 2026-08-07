<script setup lang="ts">
useSeoMeta({
  title: 'Politique de Confidentialité - Much.ma',
  description: 'Découvrez comment Much.ma protège vos données personnelles. Nous respectons votre vie privée et la loi marocaine 09-08 sur la protection des données.',
  ogTitle: 'Politique de Confidentialité | Much.ma',
  ogDescription: 'Vos données sont protégées. Découvrez notre engagement pour votre vie privée.'
});

const sections = [
  {
    id: 'introduction',
    icon: 'ion:document-text',
    title: 'Introduction',
    content: `Chez <strong>Much.ma</strong>, nous accordons une grande importance à la protection de votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles lorsque vous naviguez sur notre site ou passez commande.

Nous nous engageons à respecter la <strong>loi marocaine n° 09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.`
  },
  {
    id: 'collecte',
    icon: 'ion:cloud-download',
    title: 'Quelles données collectons-nous ?',
    content: `Nous collectons uniquement les données nécessaires au bon traitement de vos commandes :`,
    list: [
      '<strong>Informations d\'identité</strong> : nom, prénom, numéro de téléphone',
      '<strong>Adresse de livraison</strong> : quartier, ville, code postal',
      '<strong>Adresse email</strong> : pour les communications et le suivi de commande',
      '<strong>Données de navigation</strong> : adresse IP, type d\'appareil, pages visitées',
      '<strong>Historique de commandes</strong> : produits achetés, montants, dates'
    ]
  },
  {
    id: 'utilisation',
    icon: 'ion:settings',
    title: 'Comment utilisons-nous vos données ?',
    content: `Vos données sont utilisées uniquement pour :`,
    list: [
      'Traiter et livrer vos commandes',
      'Vous contacter pour le suivi de votre commande',
      'Vous envoyer des offres promotionnelles (avec votre consentement uniquement)',
      'Améliorer notre site et notre service client',
      'Respecter nos obligations légales et fiscales'
    ]
  },
  {
    id: 'partage',
    icon: 'ion:share-social',
    title: 'Partageons-nous vos données ?',
    content: `Nous ne vendons <strong>jamais</strong> vos données personnelles à des tiers. Elles peuvent uniquement être partagées avec :`,
    list: [
      '<strong>Nos partenaires de livraison</strong> : pour acheminer votre colis',
      '<strong>Nos prestataires de paiement</strong> : pour sécuriser vos transactions',
      '<strong>Les autorités légales</strong> : uniquement sur demande officielle'
    ],
    warning: 'Aucune autre utilisation n\'est autorisée sans votre consentement explicite.'
  },
  {
    id: 'cookies',
    icon: 'ion:analytics',
    title: 'Cookies et traceurs',
    content: `Notre site utilise des cookies pour améliorer votre expérience :`,
    list: [
      '<strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site (panier, session)',
      '<strong>Cookies analytiques</strong> : pour comprendre comment vous utilisez le site',
      '<strong>Cookies marketing</strong> : uniquement avec votre accord'
    ]
  },
  {
    id: 'securite',
    icon: 'ion:shield-checkmark',
    title: 'Sécurité de vos données',
    content: `Nous mettons en œuvre des mesures de sécurité strictes pour protéger vos données :`,
    list: [
      'Chiffrement SSL/TLS pour toutes les transactions',
      'Accès restreint aux données personnelles',
      'Sauvegardes régulières et sécurisées',
      'Surveillance continue contre les tentatives d\'intrusion'
    ]
  },
  {
    id: 'droits',
    icon: 'ion:person',
    title: 'Vos droits',
    content: `Conformément à la loi 09-08, vous disposez des droits suivants :`,
    list: [
      '<strong>Droit d\'accès</strong> : consulter vos données personnelles',
      '<strong>Droit de rectification</strong> : corriger des données inexactes',
      '<strong>Droit de suppression</strong> : demander l\'effacement de vos données',
      '<strong>Droit d\'opposition</strong> : vous opposer au traitement de vos données',
      '<strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré'
    ],
    info: 'Pour exercer ces droits, contactez-nous à tout moment via WhatsApp ou par email.'
  },
  {
    id: 'conservation',
    icon: 'ion:time',
    title: 'Durée de conservation',
    content: `Nous conservons vos données uniquement le temps nécessaire :`,
    list: [
      '<strong>Données de commande</strong> : 3 ans (obligation légale fiscale)',
      '<strong>Données de compte</strong> : jusqu\'à suppression de votre compte',
      '<strong>Données marketing</strong> : jusqu\'à retrait de votre consentement',
      '<strong>Données de navigation</strong> : 13 mois maximum'
    ]
  },
  {
    id: 'modifications',
    icon: 'ion:create',
    title: 'Modifications de cette politique',
    content: `Nous nous réservons le droit de modifier cette politique à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour. Nous vous encourageons à la consulter régulièrement.`
  }
];

const lastUpdated = '7 août 2026';
</script>

<template>
  <main class="min-h-screen bg-gray-50/50 py-12 md:py-16">
    <div class="container max-w-4xl mx-auto px-4">
      
      <!-- ========================================== -->
      <!-- 📜 EN-TÊTE -->
      <!-- ========================================== -->
      <div class="text-center mb-12">
        <span class="inline-block px-4 py-1.5 bg-[#ff4f24]/10 text-[#ff4f24] text-sm font-bold rounded-full mb-4">
          🔒 Vos données protégées
        </span>
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Politique de Confidentialité
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Découvrez comment nous protégeons vos données personnelles et respectons votre vie privée.
        </p>
        <p class="text-sm text-gray-400 mt-4">
          Dernière mise à jour : <strong class="text-gray-600">{{ lastUpdated }}</strong>
        </p>
      </div>

      <!-- ========================================== -->
      <!-- 📋 TABLE DES MATIÈRES -->
      <!-- ========================================== -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="ion:list" class="text-[#ff4f24]" size="20" />
          Sommaire
        </h2>
        <nav class="grid sm:grid-cols-2 gap-2">
          <a 
            v-for="(section, index) in sections" 
            :key="section.id"
            :href="`#${section.id}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#ff4f24]/5 hover:text-[#ff4f24] transition-colors"
          >
            <span class="w-6 h-6 rounded-full bg-[#ff4f24]/10 text-[#ff4f24] flex items-center justify-center text-xs font-bold flex-shrink-0">
              {{ index + 1 }}
            </span>
            <span class="font-medium">{{ section.title }}</span>
          </a>
        </nav>
      </div>

      <!-- ========================================== -->
      <!-- 📖 CONTENU DES SECTIONS -->
      <!-- ========================================== -->
      <div class="space-y-6">
        <section 
          v-for="section in sections" 
          :key="section.id"
          :id="section.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-24"
        >
          <div class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 rounded-xl bg-[#ff4f24]/10 flex items-center justify-center flex-shrink-0">
              <Icon :name="section.icon" class="text-[#ff4f24]" size="24" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">
              {{ section.title }}
            </h2>
          </div>

          <div class="text-gray-600 leading-relaxed space-y-3">
            <p v-html="section.content"></p>

            <!-- Liste à puces -->
            <ul v-if="section.list" class="space-y-2 mt-3">
              <li 
                v-for="(item, i) in section.list" 
                :key="i"
                class="flex items-start gap-2"
              >
                <Icon name="ion:checkmark-circle" class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span v-html="item"></span>
              </li>
            </ul>

            <!-- Alerte warning -->
            <div v-if="section.warning" class="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-3">
              <Icon name="ion:alert-circle" class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p class="text-sm text-gray-700" v-html="section.warning"></p>
            </div>

            <!-- Alerte info -->
            <div v-if="section.info" class="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Icon name="ion:information-circle" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p class="text-sm text-gray-700" v-html="section.info"></p>
            </div>
          </div>
        </section>
      </div>

      <!-- ========================================== -->
      <!-- 📞 CTA CONTACT -->
      <!-- ========================================== -->
      <section class="mt-12 bg-gradient-to-br from-[#ff4f24] to-[#e64621] rounded-2xl p-8 text-center text-white shadow-lg shadow-[#ff4f24]/20">
        <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ion:chatbubbles" class="text-white" size="28" />
        </div>
        <h3 class="text-2xl font-bold mb-3">Une question sur vos données ?</h3>
        <p class="text-white/90 mb-6 max-w-lg mx-auto">
          Notre équipe est à votre disposition pour répondre à toutes vos questions concernant la protection de vos données personnelles.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a 
            href="https://wa.me/212664612098?text=Bonjour%2C%20j%27ai%20une%20question%20concernant%20la%20politique%20de%20confidentialit%C3%A9"
            target="_blank"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#ff4f24] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a 
            href="mailto:contact@much.ma"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
          >
            <Icon name="ion:mail" class="w-5 h-5" />
            Email
          </a>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 🏛️ CONFORMITÉ LÉGALE -->
      <!-- ========================================== -->
      <div class="mt-8 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
        <p class="text-sm text-gray-600">
          <Icon name="ion:shield-checkmark" class="w-4 h-4 text-blue-600 inline mr-1" />
          Cette politique est conforme à la <strong class="text-gray-900">loi marocaine n° 09-08</strong> relative à la protection des données personnelles.
        </p>
      </div>

    </div>
  </main>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>