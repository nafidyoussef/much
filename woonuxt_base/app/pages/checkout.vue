<script setup lang="ts">
import type { PaymentGateway } from '#types/gql'

const route = useRoute()
const { t } = useI18n()
const { query } = route
const { cart, paymentGateways } = useCart()
const { customer, viewer } = useAuth()
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

// --- État Local du Formulaire (Modifié : Nom complet au lieu de prénom/nom) ---
const formData = reactive({
  billing: {
    email: '',
    phone: '',
    fullName: '', // ✅ Remplace firstName et lastName
    address1: '',
    city: '',
    country: 'MA' as any,
    postcode: '10000'
  },
  shipping: {
    fullName: '', // ✅ Remplace firstName et lastName
    address1: '',
    city: '',
    country: 'MA' as any,
    postcode: '10000'
  }
})

// --- Villes du Maroc ---
const MOROCCAN_CITIES = [
  'Agadir - أكادير', 'Al Hoceima - الحسيمة', 'Azrou - أزرو', 'Beni Ansar - بني أنصار',
  'Beni Mellal - بني ملال', 'Berkane - بركان', 'Berrechid - برشيد', 'Boujdour - بوجدور',
  'Casablanca - الدار البيضاء', 'Chefchaouen - شفشاون', 'Dakhla - الداخلة', 'El Jadida - الجديدة',
  'Errachidia - الرشيدية', 'Essaouira - الصويرة', 'Fès - فاس', 'Guelmim - كلميم',
  'Ifrane - إفران', 'Inezgane - إنزكان', 'Kénitra - القنيطرة', 'Khemisset - الخميسات',
  'Khenifra - خنيفرة', 'Khouribga - خريبكة', 'Laâyoune - العيون', 'Larache - العرائش',
  'Marrakech - مراكش', 'Meknès - مكناس', 'Midelt - ميدلت', 'Mohammedia - المحمدية',
  'Nador - الناضور', 'Ouarzazate - ورزازات', 'Ouezzane - وزان', 'Oujda - وجدة',
  'Oulad Teima - أولاد تايمة', 'Rabat - الرباط', 'Safi - آسفي', 'Sefrou - صفرو',
  'Settat - سطات', 'Sidi Ifni - سيدي إفني', 'Sidi Kacem - سيدي قاسم', 'Sidi Slimane - سيدي سليمان',
  'Smara - السمارة', 'Taourirt - تاوريرت', 'Tanger - طنجة', 'Taroudant - تارودانت',
  'Taza - تازة', 'Temsia - تمسية', 'Tétouan - تطوان', 'Tinghir - تنغير', 'Tiznit - تيزنيت',
  'Youssoufia - اليوسفية', 'Zagora - زاكورة'
].sort((a, b) => a.localeCompare(b, 'fr'))

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

// --- Initialisation ---
onBeforeMount(() => {
  if (query.cancel_order && typeof window !== 'undefined') window.close()
  
  const billing = customer.value?.billing
  if (billing && !formData.billing.fullName) {
    formData.billing.email = billing.email || viewerEmail.value || ''
    formData.billing.phone = billing.phone || ''
    // ✅ Combine prénom et nom en un seul champ
    formData.billing.fullName = `${billing.firstName || ''} ${billing.lastName || ''}`.trim()
    formData.billing.address1 = billing.address1 || ''
    formData.billing.city = billing.city || ''
    
    citySearch.value = formData.billing.city
    shippingCitySearch.value = formData.billing.city
  }
  
  if (!formData.shipping.fullName && formData.billing.fullName) {
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



// --- Validation (Modifiée : Email retiré des champs obligatoires) ---
const isCheckoutDisabled = computed<boolean>(() => {
  if (isProcessingOrder.value || !selectedPaymentMethodId.value) return true
  const b = formData.billing
  // ✅ Email retiré, fullName ajouté
  if (!b.phone || !b.fullName || !b.address1 || !b.city) return true
  if (isInvalidEmail.value || isInvalidPhone.value) return true

  if (shipToDifferentAddress.value) {
    const s = formData.shipping
    if (!s.fullName || !s.address1 || !s.city) return true
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

// ✅ Validation Email modifiée pour autoriser le champ vide
const checkEmailOnBlur = () => {
  isInvalidEmail.value = formData.billing.email !== '' && !emailRegex.test(formData.billing.email)
}
const checkEmailOnInput = () => {
  if (isInvalidEmail.value) {
    isInvalidEmail.value = formData.billing.email !== '' && !emailRegex.test(formData.billing.email)
  }
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
// --- Soumission du Formulaire ---
const payNow = async () => {
  buttonText.value = t('general.processing')
  checkoutError.value = null

  if (!orderInput.value) orderInput.value = {} as any
  if (!orderInput.value.billing) orderInput.value.billing = {} as any
  if (!orderInput.value.shipping) orderInput.value.shipping = {} as any
  if (!customer.value) customer.value = {} as any
  if (!customer.value.billing) customer.value.billing = {} as any
  if (!customer.value.shipping) customer.value.shipping = {} as any

  // ✅ CORRECTION CRUCIALE : 
  // On extrait 'fullName' de l'objet pour qu'il ne soit PAS envoyé à GraphQL.
  // 'validBillingData' ne contiendra QUE les champs autorisés (email, phone, address1, city, etc.)
  const { fullName: billingFullName, ...validBillingData } = formData.billing
  const { fullName: shippingFullName, ...validShippingData } = formData.shipping

  // On reconstruit l'objet pour l'API avec firstName = nom complet, et lastName vide
  const billingPayload = {
    ...validBillingData,
    firstName: billingFullName,
    lastName: '' // Chaîne vide (plus propre qu'un espace pour WooCommerce)
  }

  const shippingPayload = {
    ...validShippingData,
    firstName: shippingFullName,
    lastName: ''
  }

  orderInput.value.billing = billingPayload
  orderInput.value.shipping = shippingPayload
  customer.value.billing = billingPayload
  customer.value.shipping = shippingPayload

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
    orderInput.value.billing = billingPayload
    orderInput.value.shipping = shippingPayload
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
      <form v-else class="container max-w-6xl mx-auto px-1 py-4 lg:py-12" @submit.prevent="payNow">
        
        <!-- Indicateur d'étapes (Stepper) -->
        <div class="flex items-center justify-center mb-10">
          <div class="flex items-center w-full max-w-2xl">
            <div class="flex flex-col items-center flex-1">
              <div class="w-10 h-10 rounded-full bg-[#ff4f24] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#ff4f24]/30">1</div>
              <span class="mt-2 text-sm font-semibold text-[#ff4f24] hidden sm:block">Coordonnées</span>
            </div>
            <div class="flex-1 h-1 bg-gray-200 mx-2 rounded-full relative">
              <div class="absolute inset-y-0 left-0 w-1/2 bg-[#ff4f24] rounded-full"></div>
            </div>
            <div class="flex flex-col items-center flex-1">
              <div class="w-10 h-10 rounded-full bg-[#ff4f24] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#ff4f24]/30">2</div>
              <span class="mt-2 text-sm font-semibold text-[#ff4f24] hidden sm:block">Livraison</span>
            </div>
            <div class="flex-1 h-1 bg-gray-200 mx-2 rounded-full"></div>
            <div class="flex flex-col items-center flex-1">
              <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-lg border-2 border-gray-300">3</div>
              <span class="mt-2 text-sm font-medium text-gray-500 hidden sm:block">Paiement</span>
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6 lg:gap-12">
          
          <!-- Colonne Gauche : Formulaire -->
          <div class="lg:col-span-1 space-y-2">
            
            <!-- ✅ NOUVEAU : Message d'accueil simplifié (Remplace le bloc de connexion) 
            <div class="bg-blue-50/50 rounded-2xl border border-blue-100 p-2 flex items-start gap-1">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Icon name="ion:checkmark-circle" class="text-blue-600" size="24" />
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900">Finaliser votre commande</h3>
                <span class="text-[10px] text-gray-600">Aucun compte nécessaire. Nous confirmerons votre commande par téléphone.</span>
              </div>
            </div>-->

            <!-- Section: Détails de facturation -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="ion:receipt" class="text-[#ff4f24]" />
                {{ $t('billing.billingDetails') }}
              </h3>
              
              <div class="space-y-5">
                  <!-- ✅ Champ unique "Nom complet" -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom complet <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.billing.fullName" type="text"  required 
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
                </div>

                  <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.billing.phone" type="tel" required 
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/10': isInvalidPhone }" 
                    @blur="checkPhoneOnBlur" @input="checkPhoneOnInput" />
                  <p v-if="isInvalidPhone" class="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <Icon name="ion:alert-circle" size="14" /> Numéro invalide
                  </p>
                </div>

                <!-- ✅ Email rendu facultatif -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('billing.email') }} <span class="text-gray-400 text-xs font-normal">(Facultatif)</span>
                  </label>
                  <input v-model="formData.billing.email" type="email" 
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" 
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/10': isInvalidEmail }" 
                    @blur="checkEmailOnBlur" @input="checkEmailOnInput" />
                  <p v-if="isInvalidEmail" class="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <Icon name="ion:alert-circle" size="14" /> Email invalide
                  </p>
                </div>

             
              <!-- City Dropdown -->
                <div ref="cityInputRef" class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Ville <span class="text-[#ff4f24]">*</span></label>
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

                <!-- ✅ "Adresse 1" renommé en "Quartier" -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Quartier <span class="text-[#ff4f24]">*</span></label>
                  <input v-model="formData.billing.address1" type="text" placeholder="Ex: Hay Riad ..." required 
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white" />
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
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="ion:document-text" class="text-[#ff4f24]" />
                {{ $t('shop.orderNote') }} <span class="text-sm font-normal text-gray-400">({{ $t('general.optional') }})</span>
              </h3>
              <textarea v-model="orderInput.customerNote" rows="3" 
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff4f24] focus:ring-4 focus:ring-[#ff4f24]/10 outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white resize-none" 
                ></textarea>
            </div>
          </div>

          <!-- Colonne Droite : Récapitulatif (Sticky) -->
          <div class="lg:col-span-1">
            <div class="sticky top-6 space-y-6">
              <div class="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-2">
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