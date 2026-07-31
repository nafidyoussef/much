/**
 * App configuration.
 * This file is used to configure the app settings.
 * Below are the default values.
 */
export default defineAppConfig({
  siteName: 'Much',
  shortDescription: '',
  description: `Much, c'est bien plus qu'une boutique en ligne. C'est votre nouvel univers de découvertes quotidiennes. Nous réunissons le meilleur de la maison, du high-tech, de la mode et du sport pour simplifier votre vie. Navigation intuitive, prix justes et livraison fiable : tout est pensé pour votre satisfaction. Vivez le shopping moderne`,
  baseUrl: 'https://much.ma/',
  siteImage: '',
  storeSettings: {
    autoOpenCart: false,
    // cartMode: 'optimistic' updates UI immediately; 'safe' waits for the server response.
    cartMode: 'optimistic',
    showReviews: false,
    showFilters: true,
    showOrderByDropdown: true,
    showSKU: true,
    showRelatedProducts: false,
    showProductCategoriesOnSingleProduct: true,
    showBreadcrumbOnSingleProduct: true,
    showMoveToWishlist: true,
    hideBillingAddressForVirtualProducts: false,
    initStoreOnUserActionToReduceServerLoad: true,
    productGalleryThumbnailsPosition: 'bottom', // 'bottom' or 'left'
    saleBadge: 'percent', // 'percent', 'onSale' or 'hidden'
    socialLoginsDisplay: 'buttons', // 'buttons' or 'icons'
  },
});
