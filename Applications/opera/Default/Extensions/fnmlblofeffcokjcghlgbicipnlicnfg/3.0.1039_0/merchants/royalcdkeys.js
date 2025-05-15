const merchantCfg={
	merchantId:321,
	name:'royalcdkeys',
	productNameSelector:'.product-single__title',
	outOfStockSelector:'.title-404',
	priceSelector:'#ProductPrice-product-template .money',
	currencySelector:'.currency-wrapper .dropdown-toggle',
	currencySymbolSelector:()=>merchantCfg.currencyDetected,
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	insertAt:'.product-single__meta',
	insertMode:'afterbegin',
	voucherUrl:'https://royalcdkeys.com/checkout',
	voucherUrlPattern:'https://royalcdkeys.com/[a-zA-Z0-9]+/checkouts/[a-zA-Z0-9]+.*',
	voucherInputSelector:'#checkout_reduction_code',
	voucherSubmitSelector:'.order-summary__section--discount button',
	voucherFailedSelector:'.edit_checkout .notice--warning',
	voucherSuccessSelector:'#checkout_clear_discount',
	voucherPriceResultSelector:'del.order-summary__small-text + br + span.order-summary__emphasis',
	voucherInitialPriceSelector:'del.order-summary__small-text,.total-line__price span',
	voucherInitialPriceCurrencySelector:'.payment-due__currency',
	voucherRearm:true,
	voucherRearmIf:()=>{
		return localStorage.getItem('voucherAKRearm')==null&&document.querySelector('#checkout_clear_discount')===null
	},
	voucherPreviousInsertCallback:()=>{
		const voucher_delete=document.querySelector('#checkout_clear_discount');
		const notice_delete=document.querySelector('button[aria-label="Remove discount"]');
		if(voucher_delete)voucher_delete.click();
		if(notice_delete)notice_delete.click();
	},
	voucherPreviousSubmitCallback:(()=>{
		var input = document.querySelector(merchantCfg.voucherInputSelector);
		Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, merchantCfg.voucher);
		input.dispatchEvent(new Event('input', { bubbles: true}));
	}).bind(window),
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="margin-bottom:20px;display:flex;">
		<div style="font-size:33px;color:#fff;line-height:53px;font-weight: 700;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
		${(offer.priceDiffPercent!==0)?`<div style="text-decoration:line-through">${DOMPurify.sanitize(offer.merchantPriceText)}</div>`:''}
		<div class="shopify-payment-button">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>
				<button class="shopify-payment-button__button" style="padding:5px 10px;max-width:none;">${translates.buyAtOnAks((offer.priceDiffPercent!==0)?merchantCfg.priceDiffText:merchantCfg.priceCleaner(offer.bestOffer.price))}</button>
			</a>
		</div>
		<div class="shopify-payment-button" style="max-width:240px;">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				<button class="shopify-payment-button__button" style="max-width:240px;">${translates.seeOtherOffers(offersCount)}</button>
			</a>
		</div>
	</div>`
};