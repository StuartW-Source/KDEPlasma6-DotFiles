const merchantCfg={
	merchantId:'212,213,12',
	name:'2game',
	productNameSelector:'.product-name h1',
	priceSelector:'.details-info-left .price',
	insertMode:'beforebegin',
	insertAt:'.details-info-left .price-wrap',
	currencySelector:()=>{
		const jsonps=document.querySelectorAll('script[type="application/ld+json"]');
		var json;
		for (jsonp of jsonps)
		{
			try
			{
				json=JSON.parse(jsonp.innerText)[0];
				if(json['@type'] === 'VideoGame')
					return json['offers']['priceCurrency']||json['offers']['priceCurrency'];
			}
			catch {}
		}
	},
	currencySymbolSelector:()=>{
		const priceElement=document.querySelector(merchantCfg.priceSelector);
		if (!priceElement)return;
		const match=priceElement.innerText.match(/[^ 0-9.,]+/);
		return match&&match.length&&match[0];
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
    voucherUrl:'https://2game.com/onepage/',
	voucherUrlPattern:'https?://2game.com/[a-zA-Z-]+/onepage.*',
	voucherInputSelector:'#coupon_code',
	voucherSubmitSelector:'.button.apply-coupon',
	voucherFailedSelector:()=>document.querySelector('.opc-message-container')&&document.querySelector('.opc-message-container').innerText.indexOf('is not valid')!=-1,
	voucherSuccessSelector:()=>document.querySelector('.opc-message-container')&&(document.querySelector('.opc-message-container').innerText.indexOf('was applied')!=-1&&document.querySelector('.grand_total').innerText.indexOf(merchantCfg.voucher)!=-1),
	voucherPriceResultSelector:'.grand_total > div:last-of-type .price',
	voucherInitialPriceSelector:'.grand_total > div .price',
	voucherSubmitReload:false,
	voucherPreviousSubmitCallback:()=>{
		if(document.querySelector('.opc-messages-action button'))
			document.querySelector('.opc-messages-action button').click();
		if(document.querySelector('.opc-message-container'))
			document.querySelector('.opc-message-container').innerText='';
	},
	voucher_end_callback:()=>document.querySelector('.opc-messages-action button').click(),
	// voucherSubmitReload:true,
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<div class="price-wrap" style="margin-top:40px;">
			<div class="price-box">
				<span class="regular-price">
					<span style="text-decoration:line-through;">${DOMPurify.sanitize(offer.merchantPriceText)}</span>
					<span class="price">
					${merchantCfg.priceCleaner(offer.bestOffer.price)}
					</span>
				</span>
			</div>
		</div>
		<button type="button" class="button btn-cart">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="color:#fff!important;">
				<span><span>
					<img class="icon-cart" src="https://2game.com/skin/frontend/v53game/default/images/cart2.png">${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}
				</span></span>
			</a>
		</button>
		<div style="text-align:center">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin:5px auto 30px auto;display:inline-block;text-decoration:underline;">
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};