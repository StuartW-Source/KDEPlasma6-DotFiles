const merchantCfg={
	name:'gog',
	// merchantId:20,
	productNameSelector:'.productcard-basics__title',
	priceSelector:'.product-actions-price__base-amount',
	insertAt:'.product-actions',
	insertMode:'afterbegin',
	currencySelector:'.footer-microservice-currency__item--selected',
	currencySymbolSelector:()=>window.getComputedStyle(document.querySelector('.product-actions-price__final-amount'),':before').content.replace(/("|\s)*/g,''),
	langSelector:()=>{
		const userJson=localStorage.getItem('ngStorage-user');
		if (userJson)
			return merchantCfg.isoLangToLang(JSON.parse(userJson).language.code);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=> {
		document.querySelector('head').insertAdjacentHTML('beforeend','<style type="text/css" class="akInjected">.product-actions-price__final-amount._price.naaa::before{content:none;}</style>');
		return `
		<div class="product-actions-price product-actions-price--discounted" class="akInjected">
			<span class="product-actions-price__discount">
				${merchantCfg.priceDiffText}
			</span>
			<span class="product-actions-price__base-amount _price">
				${DOMPurify.sanitize(offer.merchantPriceText)}
			</span>
			<span class="product-actions-price__final-amount _price naaa">
				${merchantCfg.priceCleaner(offer.bestOffer.price)}
			</span>
		</div>
		<div class="akInjected">
			<a
				href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
				class="button button--big cart-button"
			>
				<span class="cart-button__wrapper">
					<svg class="ic-svg button__icon"><use xlink:href="#in-cart"></use></svg>
					<span class="cart-button__state-default">
						${translates.buyOnAks}
					</span>
				</span>
			</a>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				<button class="button button--big cart-button">
					<span class="cart-button__wrapper">
						<svg class="ic-svg button__icon"><use xlink:href="#heart-empty"></use></svg>
						<span class="cart-button__state-default">
							${translates.seeOtherOffers(offersCount)}
						</span>
					</span>
				</button>
			</a>
		</div>`;
	}
};