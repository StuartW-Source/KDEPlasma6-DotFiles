const merchantCfg={
	merchantId:122,
	name:'scdkey',
	productNameSelector:'.web-entry-title',
	priceSelector:'.price',
	insertMode:'afterbegin',
	insertAt:'.web-price',
	currencySelector:'.dropdown.s-state i',
	displayCurrencyIsoAsSymbol:true,
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	voucherSubmitReload:true,
    voucherUrl:'https://www.scdkey.com/cart/checkOut',
	voucherUrlPattern:'https?://www.scdkey.com/cart/checkOut.*',
	voucherInputSelector:'.coupon_code',
	voucherSubmitSelector:'.apply-coupon',
	voucherPreviousSubmitCallback:()=>{
		document.querySelector('.tips').innerText.innerText='';
	},
	voucherFailedSelector:()=>!(document.querySelector('.tips')&&document.querySelector('.tips').innerText.indexOf('Error Code')==-1),
	voucherSuccessSelector:()=>document.querySelector('.use-state')&&document.querySelector('.use-state').innerText.indexOf('Promotion code been used successfully')!=-1,
	voucherPriceResultSelector:'#total_amount',
	voucherInitialPriceSelector:()=>{
		const coupon_elements=document.querySelectorAll('.coupon_area'),total_price_element=document.querySelector('#total_amount');
		if(!coupon_elements||!total_price_element)return debug?console.info('Fail to locate vouchers elements or total_amount'):undefined;
		var coupon_total_amount=0;
		for(let coupon of coupon_elements)
			coupon_total_amount+=parseFloat(merchantCfg.priceSanitize(coupon.innerText));
		if(debug)
			console.log('Initialeprice computed=',String(parseFloat(merchantCfg.priceSanitize(total_price_element.innerText))+coupon_total_amount));
		return String(parseFloat(merchantCfg.priceSanitize(total_price_element.innerText))+coupon_total_amount);
	},
	voucherInitialPriceCurrencySelector:()=>execOrExtract('currencySelector',merchantCfg.currencySelector,true),
	template:(offer,offersCount,seeOnAKSLink,translates)=>`<div id="akInjected">
		<div style="text-indent:20px;">
			<p class="special-price" style="float:none;display:inline-block;"><span class="price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span></p>
			<p class="old-price" style="float:none;display:inline-block;"><span class="price">${DOMPurify.sanitize(offer.merchantPriceText)}</span></p>
		</div>
		<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>
			<span class="btn web-but-yellow web-but-yellowtop" style="text-transform:none;margin-left:5px;">${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}</span>
		</a>
		<div style="text-indent:100px;font-size:15px;margin-top:7px;">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};