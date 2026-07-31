<script setup lang="ts">
import type { PaymentGateway } from '#types/gql'

const route = useRoute()
const { t } = useI18n()
const { query } = route
const { cart, paymentGateways } = useCart()
const { customer, viewer, navigateToLogin } = useAuth()
const { orderInput, isProcessingOrder, processCheckout, checkoutError, resolvePaymentMethodId } = useCheckout()
const { setActiveGateway, isActiveGatewayReady, processActiveGatewayPayment, getActiveGatewayDisabledMessage, resetActiveGateway } = usePaymentGateways()

const buttonText = ref<string>(isProcessingOrder.value ? t('general.processing') : t('shop.checkoutButton'))
const checkoutPaymentGateways = paymentGateways
const selectedPaymentMethodId = computed<string>(() => resolvePaymentMethodId(orderInput.value.paymentMethod))

// --- Validation ---
const isInvalidEmail = ref<boolean>(false)
const isInvalidPhone = ref<boolean>(false)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phoneRegex = /^(?:\+?212|0)[5-7]\d{8}$/

// --- État Local du Formulaire (Isolé du cache GQL) ---
// --- État Local du Formulaire (Isolé du cache GQL) ---
const formData = reactive({
  billing: {
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    country: 'MA' as any, // CORRECTION : Cast en 'any' pour satisfaire CountriesEnum
    postcode: '10000'
  },
  shipping: {
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    country: 'MA' as any, //  CORRECTION : Cast en 'any' pour satisfaire CountriesEnum
    postcode: '10000'
  }
})

// --- Villes du Maroc (Triées pour une meilleure UX) ---
const MOROCCAN_CITIES = [
   'Agadir - أكادير',
  'Al Hoceima - الحسيمة',
  'Azrou - أزرو',
  'Beni Ansar - بني أنصار',
  'Beni Mellal - بني ملال',
  'Berkane - بركان',
  'Berrechid - برشيد',
  'Boujdour - بوجدور',
  'Casablanca - الدار البيضاء',
  'Chefchaouen - شفشاون',
  'Dakhla - الداخلة',
  'El Jadida - الجديدة',
  'Errachidia - الرشيدية',
  'Essaouira - الصويرة',
  'Fès - فاس',
  'Guelmim - كلميم',
  'Ifrane - إفران',
  'Inezgane - إنزكان',
  'Kénitra - القنيطرة',
  'Khemisset - الخميسات',
  'Khenifra - خنيفرة',
  'Khouribga - خريبكة',
  'Laâyoune - العيون',
  'Larache - العرائش',
  'Marrakech - مراكش',
  'Meknès - مكناس',
  'Midelt - ميدلت',
  'Mohammedia - المحمدية',
  'Nador - الناضور',
  'Ouarzazate - ورزازات',
  'Ouezzane - وزان',
  'Oujda - وجدة',
  'Oulad Teima - أولاد تايمة',
  'Rabat - الرباط',
  'Safi - آسفي',
  'Sefrou - صفرو',
  'Settat - سطات',
  'Sidi Ifni - سيدي إفني',
  'Sidi Kacem - سيدي قاسم',
  'Sidi Slimane - سيدي سليمان',
  'Smara - السمارة',
  'Taourirt - تاوريرت',
  'Tanger - طنجة',
  'Taroudant - تارودانت',
  'Taza - تازة',
  'Temsia - تمسية',
  'Tétouan - تطوان',
  'Tinghir - تنغير',
  'Tiznit - تيزنيت',
  'Youssoufia - اليوسفية',
  'Zagora - زاكورة'
].sort((a, b) => a.localeCompare(b, 'fr')) // Tri alphabétique pour faciliter la recherche

// --- Logique de Recherche de Ville ---
const citySearch = ref('')
const showCityDropdown = ref(false)
const cityInputRef = ref<HTMLElement | null>(null)

const shippingCitySearch = ref('')
const showShippingCityDropdown = ref(false)
const shippingCityInputRef = ref<HTMLElement | null>(null)

const filteredCities = computed(() => {
  const q = citySearch.value.toLowerCase().trim()
  if (!q) return MOROCCAN_CITIES
  return MOROCCAN_CITIES.filter((city) => city.toLowerCase().includes(q))
})

const filteredShippingCities = computed(() => {
  const q = shippingCitySearch.value.toLowerCase().trim()
  if (!q) return MOROCCAN_CITIES
  return MOROCCAN_CITIES.filter((city) => city.toLowerCase().includes(q))
})

// ✅ Remplit le champ de recherche ET la donnée du formulaire
const selectCity = (city: string, isShipping = false) => {
  if (isShipping) {
    formData.shipping.city = city
    shippingCitySearch.value = city
    showShippingCityDropdown.value = false
  } else {
    formData.billing.city = city
    citySearch.value = city
    showCityDropdown.value = false
  }
}

// Réinitialise la ville choisie si l'utilisateur modifie le texte manuellement
const handleCityInput = (isShipping = false) => {
  if (isShipping) {
    formData.shipping.city = ''
    showShippingCityDropdown.value = true
  } else {
    formData.billing.city = ''
    showCityDropdown.value = true
  }
}

// --- Viewer Logic ---
type CheckoutViewerSummary = {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  databaseId?: number | null
}
const viewerSummary = computed<CheckoutViewerSummary | null>(() => viewer.value as CheckoutViewerSummary | null)
const viewerEmail = computed<string>(() => customer.value?.billing?.email || viewerSummary.value?.email || '')

// --- Initialisation Sécurisée et Type-Safe ---
onBeforeMount(() => {
  if (query.cancel_order && typeof window !== 'undefined') window.close()
  
  const billing = customer.value?.billing
  if (billing && (billing.email || billing.firstName) && !formData.billing.email) {
    formData.billing.email = billing.email || viewerEmail.value || ''
    formData.billing.phone = billing.phone || ''
    formData.billing.firstName = billing.firstName || ''
    formData.billing.lastName = billing.lastName || ''
    formData.billing.address1 = billing.address1 || ''
    formData.billing.city = billing.city || ''
    
    // Sync des champs de recherche avec les données pré-remplies
    citySearch.value = formData.billing.city
    shippingCitySearch.value = formData.billing.city
  }
  
  if (!formData.shipping.firstName && formData.billing.firstName) {
    formData.shipping = { ...formData.billing }
  }
})

// --- Shipping Logic ---
const shipToDifferentAddress = computed<boolean>({
  get: () => !!orderInput.value.shipToDifferentAddress,
  set: (value) => {
    orderInput.value.shipToDifferentAddress = value
    if (!value) {
      formData.shipping = { ...formData.billing }
      shippingCitySearch.value = formData.billing.city
    }
  },
})

const requiresShipping = computed<boolean>(() => {
  const currentCart = cart.value as any
  if (!currentCart || currentCart.isEmpty) return false
  if (typeof currentCart.needsShippingAddress === 'boolean') {
    if (currentCart.needsShippingAddress) return true
    if ((currentCart.availableShippingMethods?.length ?? 0) > 0) return true
    if ((currentCart.chosenShippingMethods?.length ?? 0) > 0) return true
  }
  const cartNodes = currentCart.contents?.nodes ?? []
  if (!cartNodes.length) return false
  const hasExplicitVirtualFlags = cartNodes.some(
    (item: any) => typeof (item?.product?.node as { virtual?: boolean } | null)?.virtual === 'boolean'
  )
  if (hasExplicitVirtualFlags) {
    return cartNodes.some((item: any) => (item?.product?.node as { virtual?: boolean } | null)?.virtual !== true)
  }
  return true
})

const hasAvailableShippingMethods = computed<boolean>(() => {
  return !!(cart.value as any)?.availableShippingMethods?.[0]?.rates?.length
})

const shouldShowShippingFlow = computed<boolean>(() => {
  if (!cart.value || (cart.value as any).isEmpty) return false
  if (requiresShipping.value) return true
  if (hasAvailableShippingMethods.value) return true
  return ((cart.value as any).chosenShippingMethods?.length ?? 0) > 0
})

// --- Validation ---
const isCheckoutDisabled = computed<boolean>(() => {
  if (isProcessingOrder.value || !selectedPaymentMethodId.value) return true
  const b = formData.billing
  if (!b.email || !b.phone || !b.firstName || !b.address1 || !b.city) return true
  if (isInvalidEmail.value || isInvalidPhone.value) return true

  if (shipToDifferentAddress.value) {
    const s = formData.shipping
    if (!s.firstName || !s.address1 || !s.city) return true
  }
  return !isActiveGatewayReady.value
})

watch(
  selectedPaymentMethodId,
  (gatewayId) => {
    if (gatewayId) void setActiveGateway(gatewayId)
  },
  { immediate: true }
)

const handleGatewaySelect = (gateway: PaymentGateway): void => {
  orderInput.value.paymentMethod = gateway
  void setActiveGateway(gateway)
}

const checkEmailOnBlur = () => {
  isInvalidEmail.value = !emailRegex.test(formData.billing.email)
}
const checkEmailOnInput = () => {
  if (isInvalidEmail.value) isInvalidEmail.value = !emailRegex.test(formData.billing.email)
}
const checkPhoneOnBlur = () => {
  const clean = formData.billing.phone.replace(/\s+/g, '')
  isInvalidPhone.value = !phoneRegex.test(clean)
}
const checkPhoneOnInput = () => {
  if (isInvalidPhone.value) {
    const clean = formData.billing.phone.replace(/\s+/g, '')
    isInvalidPhone.value = !phoneRegex.test(clean)
  }
}

// --- Soumission du Formulaire ---
const payNow = async () => {
  buttonText.value = t('general.processing')
  checkoutError.value = null

  // Injection forcée des données pour contourner les watchers internes de WooNuxt
  if (!orderInput.value) orderInput.value = {} as any
  if (!orderInput.value.billing) orderInput.value.billing = {} as any
  if (!orderInput.value.shipping) orderInput.value.shipping = {} as any
  if (!customer.value) customer.value = {} as any
  if (!customer.value.billing) customer.value.billing = {} as any
  if (!customer.value.shipping) customer.value.shipping = {} as any

  orderInput.value.billing = { ...formData.billing }
  orderInput.value.shipping = { ...formData.shipping }
  customer.value.billing = { ...formData.billing }
  customer.value.shipping = { ...formData.shipping }

  await setActiveGateway(orderInput.value.paymentMethod)
  resetActiveGateway()
  orderInput.value.transactionId = ''

  if (isCheckoutDisabled.value) {
    checkoutError.value = getActiveGatewayDisabledMessage() || 'Veuillez remplir tous les champs obligatoires.'
    buttonText.value = t('shop.checkoutButton')
    return
  }

  let paymentResult
  try {
    paymentResult = await processActiveGatewayPayment()
    if (!paymentResult.success) {
      checkoutError.value = paymentResult.error || 'Le paiement a échoué. Veuillez réessayer.'
      buttonText.value = t('shop.checkoutButton')
      return
    }
  } catch (error) {
    console.error('Checkout error:', error)
    checkoutError.value = error instanceof Error ? error.message : 'Une erreur est survenue'
    buttonText.value = t('shop.checkoutButton')
    return
  }

  // Vérification de dernière seconde
  if (!orderInput.value.billing || !orderInput.value.billing.email) {
    orderInput.value.billing = { ...formData.billing }
    orderInput.value.shipping = { ...formData.shipping }
  }

  await processCheckout(paymentResult.isPaid)
}

// Gestion du clic en dehors des dropdowns
const handleClickOutside = (e: MouseEvent) => {
  if (cityInputRef.value && !cityInputRef.value.contains(e.target as Node)) showCityDropdown.value = false
  if (shippingCityInputRef.value && !shippingCityInputRef.value.contains(e.target as Node)) showShippingCityDropdown.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

useSeoMeta({ title: t('shop.checkout') })
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50/50">
    <template v-if="cart && customer">
      
      <!-- Panier Vide -->
      <div v-if="cart.isEmpty" class="flex flex-col items-center justify-center flex-1 px-4 py-20">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="ion:cart-outline" size="48" class="text-gray-400" />
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-900">{{ $t('shop.cartEmpty') }}</h2>
        <p class="mb-6 text-gray-500 text-center max-w-sm">{{ $t('shop.addProductsInYourCart') }}</p>
        <NuxtLink to="/products" class="px-8 py-3 font-semibold text-white bg-[#ff4f24] rounded-xl hover:bg-[#e64621] transition-all duration-300 shadow-lg shadow-[#ff4f24]/20 hover:shadow-[#ff4f24]/30 hover:-translate-y-0.5">
          {{ $t('shop.browseOurProducts') }}
        </NuxtLink>
      </div>

      <!-- Formulaire de Checkout -->
      <form v-else class="container max-w-6xl mx-auto px-4 py-8 lg:py-12" @submit.prevent="payNow">
        
        <!-- ✅ NOUVEAU : Indicateur d'étapes (Stepper) -->
        <div class="flex items-center justify-center mb-10">
          <div class="flex items-center w-full max-w-2xl">
            <!-- Étape 1 -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-10 h-10 rounded-full bg-[#ff4f24] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#ff4f24]/30">1</div>
              <span class="mt-2 text-sm font-semibold text-[#ff4f24] hidden sm:block">Coordonnées</span>
            </div>
            <!-- Ligne de connexion -->
            <div class="flex-1 h-1 bg-gray-200 mx-2 rounded-full relative">
              <div class="absolute inset-y-0 left-0 w-1/2 bg-[#ff4f24] rounded-full"></div>
            </div>
            <!-- Étape 2 -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-10 h-10 rounded-full bg-[#ff4f24] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#ff4f24]/30">2</div>
              <span class="mt-2 text-sm font-semibold text-[#ff4f24] hidden sm:block">Livraison</span>
            </div>
            <!-- Ligne de connexion -->
            <div class="flex-1 h-1 bg-gray-200 mx-2 rounded-full"></div>
            <!-- Étape 3 -->
            <div class="flex flex-col items-center flex-1">
              <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-lg border-2 border-gray-300">3</div>
              <span class="mt-2 text-sm font-medium text-gray-500 hidden sm:block">Paiement</span>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          <!-- Colonne Gauche : Formulaire -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Section: Bienvenue / Connexion -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div v-if="viewer" class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-[#ff4f24]/10 flex items-center justify-center">
                  <Icon name="ion:person" class="text-[#ff4f24]" size="24" />
                </div>
                <div>
                  <h1 class="text-lg font-bold text-gray-900">Bon retour, {{ viewerSummary?.firstName || 'Client' }}</h1>
                  <p v-if="viewerEmail" class="text-sm text-gray-500 mt-0.5">{{ viewerEmail }}</p>
                </div>
              </div>

              <div v-else class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div>
                  <h1 class="text-base font-semibold text-gray-900">Paiement en tant qu'invité</h1>
                  <p class="text-sm text-gray-600 mt-1">Connectez-vous pour utiliser vos informations enregistrées.</p>
                </div>
                <Button type="button" size="sm" variant="outline" class="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-100" @click="navigateToLogin(route.fullPath)">
                  Se connecter
                </Button>
              </div>
            </div>

            <!-- Section: Détails de facturation -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="ion:receipt" class="text-[#ff4f24]" />
                {{ $t('billing.billingDetails') }}
              </h3>
              
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.email') }} <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.billing.email" type="email" required 
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/10': isInvalidEmail }" 
                    @blur="checkEmailOnBlur" @input="checkEmailOnInput" />
                  <p v-if="isInvalidEmail" class="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <Icon name="ion:alert-circle" size="14" /> Email invalide
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.billing.phone" type="tel" placeholder="06 12 34 56 78" required 
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/10': isInvalidPhone }" 
                    @blur="checkPhoneOnBlur" @input="checkPhoneOnInput" />
                  <p v-if="isInvalidPhone" class="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <Icon name="ion:alert-circle" size="14" /> Numéro invalide
                  </p>
                </div>

                <div class="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.firstName') }} <span class="text-[#ff4f24]">*</span></label>
                    <input v-model="formData.billing.firstName" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.lastName') }} <span class="text-[#ff4f24]">*</span></label>
                    <input v-model="formData.billing.lastName" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.address1') }} <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.billing.address1" type="text" placeholder="Ex: 123 Rue Hassan II" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                </div>
                
                <!-- City Dropdown -->
                <div ref="cityInputRef" class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.city') }} <span class="text-[#ff4f24]">*</span></label>
                  <div class="relative">
                    <input v-model="citySearch" type="text" placeholder="Rechercher votre ville..." 
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white pr-12" 
                      @focus="showCityDropdown = true" @input="handleCityInput(false)" />
                    <Icon v-if="formData.billing.city" name="ion:checkmark-circle" class="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" size="20" />
                    <Icon v-else name="ion:search-outline" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size="20" />

                    <div v-if="showCityDropdown && filteredCities.length > 0" class="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                      <button v-for="city in filteredCities" :key="city" type="button" 
                        class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ff4f24]/5 hover:text-[#ff4f24] transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                        @click="selectCity(city, false)">
                        <span class="font-medium">{{ city }}</span>
                        <Icon v-if="formData.billing.city === city" name="ion:checkmark" class="text-[#ff4f24]" size="16" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
                  <div class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed select-none flex items-center gap-3">
                    <span class="text-2xl">🇲🇦</span> 
                    <span class="font-semibold">Maroc</span>
                  </div>
                </div>
              </div>
              
              <div v-if="shouldShowShippingFlow" class="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <input id="ship-to-different-address" v-model="shipToDifferentAddress" type="checkbox" class="w-5 h-5 text-[#ff4f24] rounded-md focus:ring-[#ff4f24] border-gray-300 cursor-pointer" />
                <label for="ship-to-different-address" class="text-sm font-medium text-gray-700 cursor-pointer select-none">{{ $t('billing.differentAddress') }}</label>
              </div>
            </div>

            <!-- Section: Livraison (Conditionnelle) -->
            <div v-if="shipToDifferentAddress" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="ion:location" class="text-[#ff4f24]" />
                {{ $t('general.shippingAddress') }}
              </h3>
              <div class="space-y-5">
                <div class="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.firstName') }} <span class="text-[#ff4f24]">*</span></label>
                    <input v-model="formData.shipping.firstName" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.lastName') }} <span class="text-[#ff4f24]">*</span></label>
                    <input v-model="formData.shipping.lastName" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.address1') }} <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.shipping.address1" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                </div>
                
                <!-- Shipping City Dropdown -->
                <div ref="shippingCityInputRef" class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ $t('billing.city') }} <span class="text-[#ff4f24]">*</span></label>
                  <div class="relative">
                    <input v-model="shippingCitySearch" type="text" placeholder="Rechercher votre ville..." 
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white pr-12" 
                      @focus="showShippingCityDropdown = true" @input="handleCityInput(true)" />
                    <Icon v-if="formData.shipping.city" name="ion:checkmark-circle" class="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" size="20" />
                    <Icon v-else name="ion:search-outline" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size="20" />

                    <div v-if="showShippingCityDropdown && filteredShippingCities.length > 0" class="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                      <button v-for="city in filteredShippingCities" :key="city" type="button" 
                        class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ff4f24]/5 hover:text-[#ff4f24] transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                        @click="selectCity(city, true)">
                        <span class="font-medium">{{ city }}</span>
                        <Icon v-if="formData.shipping.city === city" name="ion:checkmark" class="text-[#ff4f24]" size="16" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
                  <div class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed select-none flex items-center gap-3">
                    <span class="text-2xl">🇲🇦</span> 
                    <span class="font-semibold">Maroc</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Méthodes de livraison -->
            <div v-if="shouldShowShippingFlow && hasAvailableShippingMethods && (cart as any)?.chosenShippingMethods?.[0]" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="ion:truck" class="text-[#ff4f24]" />
                {{ $t('general.shippingSelect') }}
              </h3>
              <ShippingOptions :options="(cart as any)?.availableShippingMethods?.[0]?.rates ?? []" :active-option="(cart as any).chosenShippingMethods[0]" />
            </div>

            <!-- Section: Paiement -->
            <div v-if="checkoutPaymentGateways?.nodes?.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="ion:card" class="text-[#ff4f24]" />
                {{ $t('billing.paymentOptions') }}
              </h3>
              <PaymentOptions :model-value="orderInput.paymentMethod" class="mb-6 space-y-3" :payment-gateways="checkoutPaymentGateways" @update:model-value="handleGatewaySelect" />
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <PaymentGatewayComponent :gateway="orderInput.paymentMethod" />
              </div>
            </div>

            <!-- Section: Note de commande -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="ion:document-text" class="text-[#ff4f24]" />
                {{ $t('shop.orderNote') }} <span class="text-sm font-normal text-gray-400">({{ $t('general.optional') }})</span>
              </h3>
              <textarea v-model="orderInput.customerNote" rows="3" 
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none" 
                :placeholder="$t('shop.orderNotePlaceholder')"></textarea>
            </div>
          </div>

          <!-- Colonne Droite : Récapitulatif (Sticky) -->
          <div class="lg:col-span-1">
            <div class="sticky top-6 space-y-6">
              <div class="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon name="ion:receipt" class="text-[#ff4f24]" />
                  Récapitulatif
                </h2>
                <OrderSummary />
                
                <div v-if="checkoutError" role="alert" class="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <Icon name="ion:alert-circle" class="text-red-500 mt-0.5 shrink-0" size="20" />
                  <span class="text-sm text-red-700 font-medium">{{ checkoutError }}</span>
                </div>

                <Button :loading="isProcessingOrder" :disabled="isCheckoutDisabled" size="lg" type="submit" 
                  class="mt-6 w-full py-4 text-base font-bold text-white bg-[#ff4f24] rounded-xl hover:bg-[#e64621] transition-all duration-300 shadow-lg shadow-[#ff4f24]/25 hover:shadow-[#ff4f24]/40 disabled:opacity-70 disabled:cursor-not-allowed">
                  {{ buttonText }}
                </Button>
                
                <div class="mt-6 pt-6 border-t border-gray-100">
                  <p class="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                    <Icon name="ion:lock-closed" class="text-green-600" size="16" /> 
                    Paiement 100% sécurisé. En commandant, vous acceptez nos <NuxtLink to="/cgv" class="text-[#ff4f24] hover:underline">CGV</NuxtLink>.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </template>
    
    <!-- Écran de chargement global -->
    <LoadingIcon v-else class="m-auto min-h-screen flex items-center justify-center" />
  </div>
</template>
<style>
@reference "#tailwind";

.checkout-section { 
  @apply bg-white rounded-xl p-6 shadow-sm border border-gray-100; 
}

.checkout-input { 
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 
         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
         transition-all placeholder:text-gray-400; 
}

.checkout-input.has-error { 
  @apply border-red-500 focus:ring-red-500 bg-red-50; 
}

/* Scrollbar personnalisée pour la liste des villes */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>