const merchantCfg={
	merchantId:'22,222,2222',
	name:'voidu',
	needRearm:true,
	waitProductName:true,
	productNameSelector:'.product-name,.product__detail__card h1',
	priceSelector:'.price',
	insertMode:'afterbegin',
	insertAt:'.prices',
	currencySelector:()=>{
		const currencyOption=document.querySelector('#customerCurrency option[selected]');
		if(!currencyOption)return;
		const currencyOptionParts=currencyOption.innerText.split(' - ',2);
		if(currencyOptionParts.length<2)
			return(merchantCfg.debug)?console.error('Invalide currency syntax'):null;
		return currencyOptionParts[0];
	},
	currencySymbolSelector:()=>{
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
    voucherUrl:'https://www.voidu.com/fr/cart',
	voucherSubmitReload:true,
	voucherUrlPattern:'https?://www.voidu.com/[a-zA-Z-]+/cart.*',
	voucherInputSelector:'#discountcouponcode',
	voucherSubmitSelector:'#applydiscountcouponcode',
	voucherFailedSelector:'#discountMessage.message-failure',
	voucherSuccessSelector:'#discountMessage.message-success',
	voucherPriceResultSelector:'.discount-total',
	voucherClearHtmlStat:()=>{
		if(document.querySelector('#discountMessage.message-failure'))
			for(msg of document.querySelectorAll('#discountMessage.message-failure'))
				msg.classList.remove('message-failure');
		if(document.querySelector('#discountMessage.message-success'))
			for(msg of document.querySelectorAll('#discountMessage.message-success'))
				msg.classList.remove('message-success');
	},
	voucherPreviousInsertCallback:(try_count=0)=>{
		if(document.querySelector('.remove-discount-button'))
		{
			merchantCfg.voucherClearHtmlStat();
			return document.querySelector('.remove-discount-button').click();
		}
		if(++try_count>9) return;
		setTimeout(()=>merchantCfg.voucherPreviousInsertCallback(try_count),100);
	},
	voucherInitCallback:()=>merchantCfg.voucherClearHtmlStat(),
	voucherRearm:true,
	template:(offer,offersCount,seeOnAKSLink,translates)=>`<div class="price-column mt-3" style="color:white;text-align:center;">
		<div style="text-align:left;font-weight:500;margin-bottom:10px;">
			<span style="text-decoration:line-through;">${DOMPurify.sanitize(offer.merchantPriceText)}</span>
			<span>${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
		</div>
		<a
			class="voidu-button voidu-button--primary voidu-button--link voidu-button--bg-progress product__purchase w-100"
			href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
			style="padding:17px;width:100%;background-color:#f58331;margin-bottom:0px;"
		>${(offer.priceDiffPercent<0)?translates.buyAtOnAks(merchantCfg.priceDiffText):translates.buyOnAks}</a>
		<div style="text-align:center;margin-bottom:30px;"><a href="${seeOnAKSLink}"${merchantCfg.open_mode}>${translates.seeOtherOffers(offersCount)}</a></div>
	</div>`
};