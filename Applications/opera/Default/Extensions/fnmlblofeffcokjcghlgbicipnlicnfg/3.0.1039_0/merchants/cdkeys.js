const merchantCfg={
	merchantId:9,
	name:'cdkeys',
	productNameSelector:()=>{
		if((new RegExp(merchantCfg.voucherUrlPattern)).exec(location.href)===null)
			return document.querySelector('.page-title-wrapper').innerText;
	},
	priceSelector:()=>document.querySelector('meta[property="product:price:amount"]').getAttribute('content')||document.querySelector('.product-info-addto .price').innerText,
	insertMode:'previousbegin',
	insertAt:'.product-info-addto',
	currencySelector:()=>document.querySelector('product:price:currency').getAttribute('content'),
	currencySymbolSelector:()=>{
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	// voucherUrlPattern:'https?://www.cdkeys.com/checkout/cart/.*',
	// voucherInputSelector:'#coupon_code',
	// voucherSubmitSelector:'#discount-coupon-form button',
	// voucherFailedSelector:()=>document.querySelector('div.messages[role="alert"]').innerText.indexOf('not valid')!=-1,
	// voucherSuccessSelector:()=>true,
	// voucherPriceResultSelector:'.prices',
	// voucherSubmitReload:true,
	// voucherInitCallback:()=>document.querySelector('#block-discount .title').click(),
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div class="product-info-addto" id="akInjected">
		<div class="product-info-price">
			<div class="price-box price-final_price">
				<span class="special-price">
					<span class="price-container price-final_price tax weee">
						<span class="price-label">Special Price</span>
						<span id="product-price-12942" class="price-wrapper">
							<span class="price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
						</span>
					</span>
				</span>
				<span class="old-price">
					<span class="price-container price-final_price tax weee">
						<span id="old-price-12942" class="price-wrapper ">
							<span class="price">${DOMPurify.sanitize(offer.merchantPriceText)}</span>
						</span>
					</span>
				</span>
			</div>
		</div>
		<div class="product-info-rewards"><div class="visible">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div></div>
		<div class="actions">
			<a class="button green" href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>
				${translates.buyOnAks}
			</a>
		</div>
	</div>`
};