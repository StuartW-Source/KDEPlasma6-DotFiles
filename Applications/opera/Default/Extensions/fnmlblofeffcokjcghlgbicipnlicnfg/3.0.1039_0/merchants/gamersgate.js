const merchantCfg={
	merchantId:5,
	name:'gamersgate',
	productNameSelector:'section.product h1',
	priceSelector:'.catalog-item--price span',
	insertMode:'beforebegin',
	insertAt:'.catalog-item--price',
	currencySelector:()=>{
		const jsonps=document.querySelectorAll('script[type="application/ld+json"]');
		var json;
		for (jsonp of jsonps)
		{
			try
			{
				json=JSON.parse(jsonp.innerText)[0];
				if(json['@type'] === 'Product')
					return json['offers'][0]['priceCurrency'];
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
    voucherUrl:'https://www.gamersgate.com/cart/',
	voucherUrlPattern:'https?://www.gamersgate.com/cart/.*',
	voucherInputSelector:'#cart-coupon-form input[type="text"]',
	voucherSubmitSelector:'#cart-coupon-form input[type="button"]',
	voucherFailedSelector:()=>false,
	voucherSuccessSelector:()=>'.has_coupon',
	voucherPreviousInsertCallback:()=>document.querySelector('.has_coupon input[data-action="cancel"]')&&document.querySelector('.has_coupon input[data-action="cancel"]').click(),
	voucherPriceResultSelector:'.cart-total-value span',
	voucherSubmitReload:true,
	voucherRearm:true,
	voucherRearmIf:()=>localStorage.getItem('voucherAKRearm')==null&&document.querySelector('.has_coupon')===null,
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div style="margin:20px 0;" id="akInjected">
		<div class="catalog-item--price">
			<div style="text-decoration:line-through;" class="catalog-item--full-price">${DOMPurify.sanitize(offer.merchantPriceText)}</div>
			<span>
				${merchantCfg.priceCleaner(offer.bestOffer.price)}
			</span>
		</div>
		<div style="text-align:center;">
			<div class="catalog-item--button" style="display:block;">
				<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="display:block;">
					<button type="button" class="catalog-item--button-add-cart cart--add-button item_in_cart">${translates.buyOnAks}</button>
				</a>
			</div>
			<div class="catalog-item--button" style="display:block;">
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="display:block;">
					<button type="button" class="catalog-item--button-add-favorite favorite--button" style="width:100%">${translates.seeOtherOffers(offersCount)}</button>
				</a>
			</div>
		</div>
	</div>`
};