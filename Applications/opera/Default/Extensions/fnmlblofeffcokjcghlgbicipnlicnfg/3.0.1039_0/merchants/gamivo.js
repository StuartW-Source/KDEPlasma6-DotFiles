const merchantCfg={
	name:'gamivo',
	merchantId:'2180,218',
	productNameSelector:'h1 .name__value',
	priceSelector:()=>{
		let el=document.querySelector('.offers-table tbody tr:not(.highlight) .price')||document.querySelector('.low-price');
		return el&&el.innerText;
	},
	needRearm:true,
	waitProductName: true,
	acceptNoMerchantPriceFound:true,
	insertAt:'.buy-container__separator',
	insertMode:'beforebegin',
	currencySelector:'app-currency .ng-value span:last-of-type',
	currencySymbolSelector:'app-currency .ng-value .currency-icon',
	langSelector:()=>{
		const langIso=document.querySelector('.settings__container--languages .ng-value span');
		if(langIso)
			return merchantCfg.isoLangToLang(langIso.innerText);
	},
	voucherRearm:true,
    voucherUrl:'https://www.gamivo.com/cart',
	voucherUrlPattern:'https?://www.gamivo.com/cart.*',
	voucherInputSelector:'input[name="coupon-code"]',
	voucherSubmitSelector:'.form-group.coupon-code button[type="submit"]',
	voucherFailedCSSSelector:'.coupon-alert,.coupon-alert__container--content',
	voucherFailedSelector:(()=>{
		const errorElement=document.querySelector(merchantCfg.voucherFailedCSSSelector);
		if(errorElement)return errorElement;
		document.querySelector(merchantCfg.voucherInputSelector).dispatchEvent(new Event('input', { bubbles: true}));
		const submitElement=execOrExtract('voucherSubmit2',merchantCfg.voucherSubmitSelector,false);
		if(submitElement)
		{
			if(!(merchantCfg.voucherSubmitSelector instanceof Function))
				submitElement.click();
		}
		return errorElement;
	}).bind(window),
	voucherSuccessSelector:()=>document.querySelector('body').innerText.indexOf(merchantCfg.voucher)!=-1,
	voucherPriceResultSelector:'.summary-total__price',
	voucherInitialPriceSelector:()=>{
		const final_price=document.querySelector(merchantCfg.voucherPriceResultSelector);
		if(!final_price)
			return merchantCfg.debug?console.error('Fail to found final_price'):null;
		const voucher_amount=document.querySelector('.alert-info .price,.cart-alert .price');
		if(!voucher_amount)
		{
			if(merchantCfg.debug)
				console.error('Fail to found voucher_amount');
			return final_price.innerText;
		}
		try{return parseFloat(priceSanitize(final_price.innerText))+parseFloat(priceSanitize(voucher_amount.innerText));}
		catch{if(merchantCfg.debug)console.error('Fail to analyze voucher prices \nvoucher_amount=',voucher_amount,' \nfinal_pricevoucher_amount=',final_price);}
	},
	voucherInitialPriceCurrencySelector:()=>execOrExtract('currencySelector',merchantCfg.currencySelector,true),
	voucherPreviousInsertCallback:(try_count=0)=>{
		if(document.querySelector('.alert-dismissible button.close,.cart-alert__btn'))
			return document.querySelector('.alert-dismissible button.close,.cart-alert__btn').click();
		if(document.querySelector('.coupon-container .add-coupon'))
			return document.querySelector('.coupon-container .add-coupon').click();
	},
	voucherPreviousSubmitCallback:(()=>{
		if(document.querySelector(merchantCfg.voucherFailedCSSSelector))
			document.querySelector(merchantCfg.voucherFailedCSSSelector).remove();
		document.querySelector(merchantCfg.voucherInputSelector).dispatchEvent(new Event('input',{bubbles:true}));
	}).bind(window),
/*	voucherTimesCfg:{
		maxRetryBeforeVoucherConsideredInvalid:10,
		voucherTimeBetween:6000,
		defaultWaitForSubmitVoucher:1500
	},*/
	template:(offer,offersCount,seeOnAKSLink,translates,retry=0)=>{
		if(document.querySelector('#akInjected'))return;
		return `
		<div id="akInjected">
			<div style="color:#a7a7a7;font-size:12px;text-transform:uppercase;">AllKeyShop offer:</div>
			<div>
				<div style="font-weight:bold;font-size:28px;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
				<a
					href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
					style="display:block;background-color:#f47b25;padding:12px;width:100%;color:white;font-weight:bold;text-align:center">
					${translates.seeOffer}
				</a><br>
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="btn btn-secondary" style="display:block;text-align:center">
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
		</div>`;
	},
	afterInsert:()=>{
		if(merchantCfg.drawRearmCount++<10)
			setTimeout(()=>{
				if(!document.querySelector('#akInjected'))
				{
					if(merchantCfg.debug)
						console.info('reinject');
					insertOffers(merchantCfg);
				}
				else if(merchantCfg.debug)
					console.info('no need to reinject');
			},1000);
	}
};