const merchantCfg={
	merchantId:'7,700,701,704',
	name:'gamesplanet',
	productNameSelector:'.prod-title',
	priceSelector:'.price_current',
	insertMode:'afterbegin',
	insertAt:'.sales-box',
	needRearm:true,
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
			catch {
				if(merchantCfg.debug)
					console.error('Fail to parse ld+json in search of currency');
			}
		}
	},
	currencySymbolSelector:()=>{
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
    voucherUrl:'https://fr.gamesplanet.com/cart',
	voucherUrlPattern:'https?://[a-zA-Z-]+.gamesplanet.com/cart.*',
	voucherInputSelector:'#order_voucher_token',
	voucherSubmitSelector:'.btn.btn-secondary.btn-sm.mob16',
	voucherFailedSelector:'#voucher_token_bar .field_with_errors',
	voucherSuccessSelector:'#voucher_token_bar .text-success',
	voucherPriceResultSelector:'.prices',
	voucherSubmitReload:false,
	voucherPreviousInsertCallback:()=>document.querySelector('#voucher h3').click(),
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="text-align:center">
		<span class="prices">
			<span class="price_base" style="text-decoration:line-through;"><strike>${DOMPurify.sanitize(offer.merchantPriceText)}</strike></span>
			<span class="price_saving false">${merchantCfg.priceDiffText}</span>
			<span class="price_current">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
		</span>
		<div>
			<a class="btn btn-success font100 w-85 mb-2 mt-2" href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>${translates.buyOnAks}</a>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin:5px 0 25px 0;display:block;text-decoration:underline;">
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};