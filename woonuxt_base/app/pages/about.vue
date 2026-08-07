<script setup lang="ts">
// ==========================================
// Données des valeurs de Much
// ==========================================
const values = [
  {
    icon: '🎯',
    title: 'Qualité Avant Tout',
    description: 'Chaque produit est rigoureusement sélectionné pour vous offrir le meilleur rapport qualité-prix du marché marocain.'
  },
  {
    icon: '🚀',
    title: 'Livraison Rapide',
    description: 'Nous livrons partout au Maroc en 24 à 72h, avec un suivi en temps réel de votre colis.'
  },
  {
    icon: '💰',
    title: 'Prix Imbattables',
    description: 'Grâce à nos partenariats directs, nous vous proposons des tarifs défiant toute concurrence.'
  },
  {
    icon: '🤝',
    title: 'Support Humain',
    description: 'Une équipe marocaine à votre écoute, du lundi au samedi, par téléphone et WhatsApp.'
  }
];

// ==========================================
// Chiffres clés
// ==========================================
const stats = [
  { value: '50K+', label: 'Clients satisfaits' },
  { value: '10K+', label: 'Produits disponibles' },
  { value: '48h', label: 'Délai moyen de livraison' },
  { value: '4.8/5', label: 'Note moyenne clients' }
];

// ==========================================
// Nos engagements
// ==========================================
const commitments = [
  {
    icon: 'ion:shield-checkmark',
    title: 'Paiement 100% sécurisé',
    description: 'Vos transactions sont protégées par un cryptage SSL de niveau bancaire.'
  },
  {
    icon: 'ion:cash',
    title: 'Paiement à la livraison',
    description: 'Payez en espèces à la réception de votre colis, en toute tranquillité.'
  },
  {
    icon: 'ion:refresh',
    title: 'Retours simplifiés',
    description: '7 jours pour changer d\'avis. Nous gérons tout pour vous.'
  },
  {
    icon: 'ion:headset',
    title: 'Support réactif',
    description: 'Une réponse garantie en moins de 2h via WhatsApp ou téléphone.'
  }
];

useSeoMeta({
  title: 'À propos de Much.ma - Votre shop en ligne au Maroc',
  description: 'Découvrez Much.ma, la référence du e-commerce au Maroc. Maison, Tech, Mode, Beauté et plus encore, livrés rapidement partout au royaume.',
  ogTitle: 'À propos de Much.ma',
  ogDescription: 'Votre univers de shopping en ligne au Maroc. Qualité, rapidité et prix justes.'
});
</script>

<template>
  <main class="min-h-screen bg-white">
    
    <!-- ========================================== -->
    <!-- 🎨 HERO SECTION -->
    <!-- ========================================== -->
    <section class="relative overflow-hidden bg-gradient-to-br from-[#ff4f24] via-[#ff6b47] to-[#ff4f24] text-white py-20 md:py-28">
      <!-- Motifs décoratifs -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="container relative max-w-5xl mx-auto px-4 text-center">
        <span class="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
          🇲🇦 Fièrement marocain
        </span>
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Bienvenue chez <span class="italic">Much</span>
        </h1>
        <p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
          Votre destination shopping tout-en-un au Maroc. De la maison à la tech, en passant par la mode et la beauté, nous vous offrons une expérience d'achat fluide, rapide et 100% sécurisée.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink 
            to="/products" 
            class="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#ff4f24] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Découvrir nos produits
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
          <a 
            href="https://wa.me/212664612098" 
            target="_blank"
            class="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Nous contacter
          </a>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 📖 NOTRE HISTOIRE -->
    <!-- ========================================== -->
    <section class="py-16 md:py-24">
      <div class="container max-w-4xl mx-auto px-4">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 bg-[#ff4f24]/10 text-[#ff4f24] text-xs font-bold rounded-full mb-4 uppercase tracking-wide">
            Notre histoire
          </span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Plus qu'une boutique, une expérience
          </h2>
        </div>
        
        <div class="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4 text-center">
          <p>
            <strong class="text-gray-900">Much</strong> est né d'une idée simple : <strong class="text-[#ff4f24]">rendre le shopping en ligne accessible, agréable et fiable</strong> pour tous les Marocains. 
          </p>
          <p>
            Nous croyons que chaque client mérite le meilleur, c'est pourquoi nous sélectionnons rigoureusement chacun de nos produits pour vous offrir <strong class="text-gray-900">qualité, diversité et prix justes</strong>. De la maison à la tech, en passant par la mode, la beauté et le sport, nous réunissons sous un même toit tout ce dont vous avez besoin au quotidien.
          </p>
          <p>
            Notre équipe passionnée travaille chaque jour pour vous proposer une expérience d'achat fluide, avec une <strong class="text-gray-900">livraison rapide partout au Maroc</strong> et un <strong class="text-gray-900">support client humain et réactif</strong>.
          </p>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 📊 CHIFFRES CLÉS -->
    <!-- ========================================== -->
    <section class="py-16 bg-gray-50/50">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div v-for="(stat, index) in stats" :key="index" class="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div class="text-3xl md:text-4xl font-extrabold text-[#ff4f24] mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm md:text-base text-gray-600 font-medium">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 💎 NOS VALEURS -->
    <!-- ========================================== -->
    <section class="py-16 md:py-24">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 bg-[#ff4f24]/10 text-[#ff4f24] text-xs font-bold rounded-full mb-4 uppercase tracking-wide">
            Ce qui nous guide
          </span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Nos valeurs fondamentales
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Chaque décision que nous prenons est guidée par ces 4 piliers qui définissent l'expérience Much.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(value, index) in values" 
            :key="index"
            class="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#ff4f24]/30 hover:shadow-lg transition-all duration-300"
          >
            <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {{ value.icon }}
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              {{ value.title }}
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ value.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 🛡️ NOS ENGAGEMENTS -->
    <!-- ========================================== -->
    <section class="py-16 md:py-24 bg-gray-50/50">
      <div class="container max-w-6xl mx-auto px-4">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 bg-[#ff4f24]/10 text-[#ff4f24] text-xs font-bold rounded-full mb-4 uppercase tracking-wide">
            Votre tranquillité
          </span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Nos engagements envers vous
          </h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div 
            v-for="(commitment, index) in commitments" 
            :key="index"
            class="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-[#ff4f24]/10 flex items-center justify-center">
              <Icon :name="commitment.icon" class="text-[#ff4f24]" size="24" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">
                {{ commitment.title }}
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                {{ commitment.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- 🚀 CTA FINAL -->
    <!-- ========================================== -->
    <section class="py-16 md:py-24">
      <div class="container max-w-4xl mx-auto px-4">
        <div class="relative overflow-hidden bg-gradient-to-br from-[#ff4f24] to-[#e64621] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl shadow-[#ff4f24]/20">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative">
            <h2 class="text-3xl md:text-4xl font-extrabold mb-4">
              Prêt à découvrir Much ?
            </h2>
            <p class="text-white/90 max-w-xl mx-auto mb-8 text-lg">
              Rejoignez des milliers de clients satisfaits et profitez de nos offres exclusives dès aujourd'hui.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NuxtLink 
                to="/products" 
                class="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#ff4f24] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Commencer mes achats
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
              <NuxtLink 
                to="/faq" 
                class="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
              >
                Voir la FAQ
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>