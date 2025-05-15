const merchantCfg={
	merchantId:'136,6111',
	name:'buygames',
	productNameSelector:'h1[itemprop="name"]',
	priceSelector:'#our_price_display',
	insertAt:'.content_prices div',
	insertMode:'afterbegin',
	currencySelector:'#setCurrency strong',
	langSelector:()=>{
		const langElement=document.querySelector('#languages-block-top .current span');
		if (langElement)
			return merchantCfg.fullLangToGenericLang(langElement.innerText);
	},
    voucherUrl:'#buy_block .box-cart-bottom button',
	voucherUrlPattern:'https://www\.buygames\.ps/fr/quick\-order.*',
	voucherInputSelector:'#discount_name',
	voucherSubmitSelector:'.button[name="submitAddDiscount"]',
	voucherFailedSelector:()=>document.querySelector('#center_column .alert.alert-danger')&&document.querySelector('#center_column .alert.alert-danger').innerText.length>0,
	voucherSuccessSelector:()=>true,
	voucherPriceResultSelector:'#total_price',
	voucherInitialPriceSelector:()=>{
		const final_price=document.querySelector(merchantCfg.voucherPriceResultSelector);
		if(!final_price)
			return merchantCfg.debug?console.error('Fail to found final_price'):null;
		const voucher_amount=document.querySelector('.cart_total_voucher .price-discount.price');
		if(!voucher_amount)
		{
			if(merchantCfg.debug)
				console.error('Fail to found voucher_amount');
			return final_price.innerText;
		}
		try{return parseFloat(priceSanitize(final_price.innerText))+parseFloat(priceSanitize(voucher_amount.innerText));}
		catch{if(merchantCfg.debug)console.error('Fail to analyze voucher prices \nvoucher_amount=',voucher_amount,' \nfinal_pricevoucher_amount=',final_price);}
	},
	voucherInitialPriceCurrencySelector:()=>execOrExtract('InitialPriceCurrencySelector',merchantCfg.currencySelector,true),
	voucherSubmitReload:true,
	voucherPreviousInsertCallback:()=>{
		const price_delete=document.querySelector('.price_discount_delete');
		if(!price_delete)return;
		merchantCfg.voucherTestStat=-1;
		price_delete.click();
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<p class="our_price_display">
			<span id="our_price_display" class="price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span> tax incl.<meta itemprop="priceCurrency" content="EUR">
		</p>
		${(offer.priceDiffPercent<0)?`
		<p id="reduction_percent">
			<span id="reduction_percent_display">${merchantCfg.priceDiffText}</span>
		</p>
		<p id="old_price" style="padding-bottom:0px!important;">
			<span id="old_price_display"><span class="price">${DOMPurify.sanitize(offer.merchantPriceText)}</span> tax incl.</span>
		</p>`:''}
		<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>
			<button type="submit" name="Submit" class="exclusive"> <span>${translates.buyOnAks}</span> </button>
		</a>
		<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin:10px 0 20px 50px;display:inline-block;">
			${translates.seeOtherOffers(offersCount)}
		</a>
	</div>`
};