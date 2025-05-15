const merchantCfg={
	merchantId:308,
	name:'premiumcdkeys',
	productNameSelector:()=>{
		return (document.querySelector('.prd-block_title,.product_title'))?document.querySelector('.prd-block_title,.product_title').innerText.replace('Product Key',''):null;
	},
	priceSelector:'.prd-block_price--actual .money,.price_range span',
	insertMode:'beforebegin',
	insertAt:'.price-review',
	currencySelector:()=>{
		const jsonps=document.querySelectorAll('script[type="application/ld+json"]');
		var json;
		for (jsonp of jsonps)
		{
			try
			{
				json=JSON.parse(jsonp.innerText);
				if(json['@type'] === 'Product')
					return json['offers']['priceCurrency']||json['offers'][0]['priceCurrency'];
			}
			catch {}
		}
	},
	currencySymbolSelector:()=>{
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	voucherSubmitReload:false,
    voucherUrl:'https://www.premiumcdkeys.com/cart',
	voucherUrlPattern:'https?://www.premiumcdkeys.com/[a-zA-Z0-9]+/checkouts.*',
	voucherInputSelector:'#checkout_reduction_code',
	voucherSubmitSelector:'.edit_checkout .field__input-btn',
	voucherFailedSelector:()=>false,
	voucherSuccessSelector:()=>{
		for(const voucherElement of document.querySelectorAll('.reduction-code__text'))
		{
			if(voucherElement.innerText.indexOf(merchantCfg.voucher)!=-1)
				return true;
		}
	},
	keyboardImpulse:()=>{
		document.querySelector(merchantCfg.voucherInputSelector).dispatchEvent(new Event('input',{bubbles:true}));
	},
	voucherPreviousSubmitCallback:()=>{
		setTimeout(merchantCfg.keyboardImpulse.bind(window),1);
		setTimeout(merchantCfg.keyboardImpulse.bind(window),10);
	},
	voucherTimesCfg:{
		maxRetryBeforeVoucherConsideredInvalid:25
	},
	voucherPriceResultSelector:'.payment-due__price',
	voucherInitialPriceSelector:'.total-line__price',
	voucherInitialPriceCurrencySelector:'.payment-due__currency',
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<div style="margin:20px 0 10px 0;">
			<div style="flex:1 1 auto!important;font-size:22px;">
				<span style="text-decoration:line-through;">${DOMPurify.sanitize(offer.merchantPriceText)}</span>
				<span class="prd-block_price--actual">
					${merchantCfg.priceCleaner(offer.bestOffer.price)}
				</span>
			</div>
			<div>
				<button type="button" class="btn single_add_to_cart_button">
					<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="color:#fff!important;">
						${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}
					</a>
				</button>
			</div>
		</div>
		<div>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin-left:20px;">
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};