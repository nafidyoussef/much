<script setup lang="ts">
useSeoMeta({
  title: 'Conditions Générales de Vente - Much.ma',
  description: 'Consultez les Conditions Générales de Vente (CGV) de Much.ma. Informations sur les commandes, livraisons, paiements et retours au Maroc.',
  ogTitle: 'CGV | Much.ma',
  ogDescription: 'Conditions Générales de Vente de Much.ma - E-commerce au Maroc.'
});

const sections = [
  {
    id: 'article-1',
    icon: 'ion:document-text',
    title: 'Article 1 - Objet et acceptation des conditions',
    content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>Much.ma</strong> (ci-après « le Vendeur ») et ses clients (ci-après « le Client »), personnes physiques ou morales, passant commande sur le site <strong>www.much.ma</strong>.

Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV. Le Vendeur se réserve le droit de modifier ces conditions à tout moment, les CGV applicables étant celles en vigueur à la date de la commande.`
  },
  {
    id: 'article-2',
    icon: 'ion:information-circle',
    
    title: 'Article 2 - Informations légales',
    content: `Le présent site est édité par <strong>Much.ma</strong>, entreprise enregistrée au Maroc.`,
    list: [
      '<strong>Activité</strong> : Commerce en ligne de produits divers (Maison, Tech, Mode, Beauté, etc.)',
      '<strong>Site web</strong> : www.much.ma',
      '<strong>Contact</strong> : +212 6 64 61 20 98 / contact@much.ma',
      '<strong>Horaires</strong> : Du lundi au samedi, de 9h00 à 18h00'
    ]
  },
  {
    id: 'article-3',
    icon: 'ion:cube',
    title: 'Article 3 - Produits et prix',
    content: `Les produits proposés à la vente sont ceux qui figurent sur le site au moment de la consultation. Le Vendeur s'efforce de présenter les caractéristiques essentielles des produits conformément à l'article 49 de la loi n° 31-08.`,
    list: [
      'Les <strong>photographies</strong> et descriptions sont fournies à titre indicatif',
      'Les <strong>prix</strong> sont affichés en Dirhams marocains (DH), toutes taxes comprises (TTC)',
      'Le Vendeur se réserve le droit de modifier ses prix à tout moment',
      'Les <strong>promotions</strong> et réductions sont limitées aux stocks disponibles'
    ]
  },
  {
    id: 'article-4',
    icon: 'ion:cart',
    title: 'Article 4 - Commandes',
    content: `Le processus de commande se déroule en plusieurs étapes :`,
    list: [
      'Sélection des produits et ajout au panier',
      'Validation du panier et choix du mode de livraison',
      'Saisie des informations de livraison (nom, téléphone, adresse, ville)',
      'Choix du mode de paiement',
      'Confirmation finale de la commande',
      'Réception d\'un accusé de réception par WhatsApp ou SMS'
    ],
    info: 'Toute commande validée constitue un engagement ferme du Client. Une confirmation vous sera envoyée dans les plus brefs délais.'
  },
  {
    id: 'article-5',
    icon: 'ion:cash',
    title: 'Article 5 - Modalités de paiement',
    content: `Les paiements s'effectuent selon les modalités suivantes :`,
    list: [
      '<strong>Paiement à la livraison</strong> : en espèces lors de la réception du colis (mode privilégié)',
      '<strong>Paiement par carte bancaire</strong> : via notre plateforme sécurisée (cryptage SSL)',
      '<strong>Virement bancaire</strong> : sur demande préalable'
    ],
    warning: 'Le Vendeur se réserve le droit de refuser toute commande en cas de motif légitime, notamment en cas de litige antérieur ou de suspicion de fraude.'
  },
  {
    id: 'article-6',
    icon: 'ion:truck',
    title: 'Article 6 - Livraison',
    content: `Les livraisons sont effectuées <strong>partout au Maroc</strong> via nos partenaires de confiance. Les délais varient selon la zone géographique :`,
    list: [
      '<strong>Casablanca, Rabat, Tanger, Marrakech, Fès</strong> : 24 à 48h',
      '<strong>Autres grandes villes</strong> : 48 à 72h',
      '<strong>Zones rurales</strong> : 72 à 96h'
    ],
    info: 'Un numéro de suivi vous sera communiqué par SMS/WhatsApp dès l\'expédition de votre colis. En cas de retard, contactez-nous immédiatement.'
  },
  {
    id: 'article-7',
    icon: 'ion:refresh',
    title: 'Article 7 - Droit de rétractation et retours',
    content: `Conformément à la législation marocaine en vigueur, le Client dispose d'un <strong>délai de 7 jours</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalité.`,
    list: [
      'Le produit doit être <strong>retourné dans son état d\'origine</strong>, non utilisé',
      'L\'<strong>emballage d\'origine</strong> doit être intact',
      'Tous les <strong>accessoires et documents</strong> doivent être inclus',
      'Les <strong>frais de retour</strong> sont à la charge du Client',
      'Le <strong>remboursement</strong> est effectué sous 3 à 5 jours ouvrables après vérification'
    ]
  },
  {
    id: 'article-8',
    icon: 'ion:shield-checkmark',
    title: 'Article 8 - Garanties',
    content: `Tous les produits bénéficient de la <strong>garantie légale de conformité</strong> et de la garantie contre les vices cachés, conformément aux articles 449 et suivants du Code des Obligations et des Contrats (DOC) marocain.`,
    list: [
      'Produits <strong>neufs et authentiques</strong>',
      'Garantie <strong>constructeur</strong> applicable le cas échéant',
      'SAV assuré par notre équipe via WhatsApp'
    ]
  },
  {
    id: 'article-9',
    icon: 'ion:alert-circle',
    title: 'Article 9 - Responsabilité',
    content: `La responsabilité du Vendeur ne saurait être engagée dans les cas suivants :`,
    list: [
      'Mauvaise utilisation du produit par le Client',
      'Non-respect des conseils d\'utilisation',
      'Utilisation non conforme aux spécifications du produit',
      'Dommages résultant d\'un cas de force majeure',
      'Intervention d\'un tiers non autorisé sur le produit'
    ]
  },
  {
    id: 'article-10',
    icon: 'ion:lock-closed',
    title: 'Article 10 - Propriété intellectuelle',
    content: `L'ensemble du contenu du site Much.ma (textes, images, logos, marques, vidéos, etc.) est la propriété exclusive du Vendeur ou de ses partenaires. Toute reproduction, représentation ou diffusion, totale ou partielle, est strictement interdite sans autorisation écrite préalable.

Toute exploitation non autorisée constitue une contrefaçon sanctionnée par les articles 180 et suivants de la loi n° 2-00 relative aux droits d'auteur et droits voisins.`
  },
  {
    id: 'article-11',
    icon: 'ion:person',
    title: 'Article 11 - Données personnelles',
    content: `Les données personnelles collectées dans le cadre des commandes sont traitées conformément à notre <strong>Politique de Confidentialité</strong> et à la <strong>loi n° 09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.

Le Client dispose d'un droit d'accès, de rectification et de suppression de ses données, qu'il peut exercer à tout moment en nous contactant.`,
    info: 'Pour plus d\'informations, consultez notre <a href="/privacy-policy" class="text-[#ff4f24] hover:underline font-semibold">Politique de Confidentialité</a>.'
  },
  {
    id: 'article-12',
    icon: 'ion:gavel',
    title: 'Article 12 - Droit applicable et juridiction',
    content: `Les présentes CGV sont soumises au <strong>droit marocain</strong>. En cas de litige, et après échec de toute tentative de recherche d'une solution amiable, les tribunaux compétents du <strong>Royaume du Maroc</strong> seront seuls compétents.

Le Client peut également recourir à la plateforme de résolution des litiges en ligne mise en place par la CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel).`
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
          📋 Conditions Générales
        </span>
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Conditions Générales de Vente
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Veuillez lire attentivement les présentes conditions avant toute commande sur Much.ma.
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
          Sommaire des articles
        </h2>
        <nav class="grid sm:grid-cols-2 gap-2">
          <a 
            v-for="(section, index) in sections" 
            :key="section.id"
            :href="`#${section.id}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#ff4f24]/5 hover:text-[#ff4f24] transition-colors"
          >
            <span class="w-7 h-7 rounded-full bg-[#ff4f24]/10 text-[#ff4f24] flex items-center justify-center text-xs font-bold flex-shrink-0">
              {{ index + 1 }}
            </span>
            <span class="font-medium line-clamp-1">{{ section.title }}</span>
          </a>
        </nav>
      </div>

      <!-- ========================================== -->
      <!-- 📖 CONTENU DES ARTICLES -->
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
        <h3 class="text-2xl font-bold mb-3">Une question sur nos conditions ?</h3>
        <p class="text-white/90 mb-6 max-w-lg mx-auto">
          Notre équipe est à votre disposition pour vous expliquer en détail nos conditions de vente et répondre à toutes vos interrogations.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a 
            href="https://wa.me/212664612098?text=Bonjour%2C%20j%27ai%20une%20question%20concernant%20vos%20conditions%20g%C3%A9n%C3%A9rales%20de%20vente"
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
          Ces CGV sont conformes au <strong class="text-gray-900">Code du Commerce</strong>, au <strong class="text-gray-900">Code des Obligations et des Contrats (DOC)</strong> et à la <strong class="text-gray-900">loi n° 31-08</strong> du Royaume du Maroc.
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