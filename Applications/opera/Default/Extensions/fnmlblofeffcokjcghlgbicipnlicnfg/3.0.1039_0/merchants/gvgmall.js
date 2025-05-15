const merchantCfg={
	merchantId:162,
	name:'gvgmall',
	productNameSelector:'.c_title',
	priceSelector:'.proprice .price',
	insertMode:'beforebegin',
	insertAt:'.proprice',
	currencySelector:()=>{
		const priceElement=document.querySelector(merchantCfg.priceSelector);
		if (priceElement)priceElement.innerText.split(' ',1)[0];
	},
	currencySymbolSelector:()=>{
		if(!merchantCfg.currencyDetected)merchantCfg.currencyDetected=merchantCfg.currencySelector();
		return merchantCfg.currencyDetected;
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	voucherSubmitReload:true,
    voucherUrl:'https://www.gvgmall.com/cart/checkOut',
	voucherUrlPattern:'https://[a-zA-Z0-1]+.gvgmall.com/cart/checkOut.*',
	voucherInputSelector:'.form-control.coupon_code',
	voucherSubmitSelector:'.btn.apply-coupon',
	voucherFailedSelector:()=>document.querySelector('.promotion_code .tips').innerText.indexOf('Error Code')!=-1,
	voucherSuccessSelector:()=>!((new RegExp('Discount: -[A-Z]{3} 0$')).test(document.querySelector('.discount_label').innerText)),
	voucherPriceResultSelector:'#total_amount',
	voucherInitialPriceSelector:'.original',
	voucherInitialPriceCurrencySelector:()=>{
		const priceElement=document.querySelector(merchantCfg.voucherPriceResultSelector);
		if (priceElement)return priceElement.innerText.split(' ',1)[0];
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<li id="akInjected" class="proprice" style="padding-left:0!important;">
		<b style="width:100px;">Price</b><br>
		<div class="price" style="display:inline-block;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
		<div class="old-price" style="display:inline-block;">${DOMPurify.sanitize(offer.merchantPriceText)}</div><br>
		<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="btn add_url" style="width:auto;float:none;">${translates.buyOnAks}</a>
		<div><a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin:5px 0 30px 70px;display:inline-block;text-decoration:underline;">
		${translates.seeOtherOffers(offersCount)}
		</a></div>
	</li>`
};