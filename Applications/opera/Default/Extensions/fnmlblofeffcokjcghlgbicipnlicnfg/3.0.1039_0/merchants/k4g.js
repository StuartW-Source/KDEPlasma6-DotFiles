const merchantCfg={
	merchantId:324,
	name:'k4g',
	needRearm:true,
	productNameSelector:'div[class^="Title_productTitle"] h1',
	priceSelector:'div[class^="OfferComp_regular"] span',
	insertMode:'afterbegin',
	insertAt:'div[class^="OfferComp_offerCompContainer"]',
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
	displayCurrencyIsoAsSymbol:true,
	displayCurrencyIsoAsSymbolInSup:true,
	currencySymbolSelector:()=>merchantCfg.currencyDetected,
	langSelector:()=>{
		var settings=localStorage.getItem('settings');
		if(!settings)return;
		try
		{
			settings=JSON.parse(settings).languages;
		}
		catch{return;}
		for(lang of settings)
			if(lang.active)return merchantCfg.isoLangToLang(lang.iso);
	},
	voucherSubmitReload:false,
    voucherUrl:'https://k4g.com/checkout',
	voucherUrlPattern:'https?://k4g.com/checkout.*',
	voucherInputSelector:'input[name="discount"]',
	voucherSubmitSelector:'div[class*="CartFooterComp_containerDiscount"] button',
	voucherFailedSelector:()=>false,
	voucherSuccessSelector:()=>document.querySelector(merchantCfg.voucherInputSelector+'[type="success"]')!==null,
	voucherPreviousInsertCallback:()=>document.querySelector('.btn-outline')&&document.querySelector('.btn-outline').click(),
	voucherPreviousSubmitCallback:(()=>{
		var input = document.querySelector(merchantCfg.voucherInputSelector);
		Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, merchantCfg.voucher);
		input.dispatchEvent(new Event('input', { bubbles: true}));
	}).bind(window),
	voucherInitialPriceSelector:()=>{
		const final_price=document.querySelector(merchantCfg.voucherPriceResultSelector);
		if(!final_price)
			return merchantCfg.debug?console.error('Fail to found final_price'):null;
		const voucher_amount=document.querySelector('div[class*="CartFooterComp_cartSummaryFooter"] div[class*="CartFooterComp_section"]:nth-child(2) div[class*="CartFooterComp_container"]:last-of-type div:last-of-type');
		if(!voucher_amount)
		{
			if(merchantCfg.debug)
				console.error('Fail to found voucher_amount');
			return final_price.innerText;
		}
		try{return parseFloat(priceSanitize(final_price.innerText))+parseFloat(priceSanitize(voucher_amount.innerText));}
		catch{if(merchantCfg.debug)console.error('Fail to analyze voucher prices \nvoucher_amount=',voucher_amount,' \nfinal_pricevoucher_amount=',final_price);}
	},
	voucherPriceResultSelector:'span[class*="CartFooterComp_finalPrice"]',
	voucherInitialPriceCurrencySelector:()=>execOrExtract('currencySelector',merchantCfg.currencySelector,true),
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		const hold=document.querySelector('#akInjected');
		if(hold)hold.remove();
		return `
		<div style="margin:10px 0;" id="akInjected">
			<div>
				<div style="text-decoration:line-through;color:rgba(255,255,255,.3);">${(offer.merchantPriceText)?DOMPurify.sanitize(offer.merchantPriceText)+' '+DOMPurify.sanitize(merchantCfg.currencyDetected):''}</div>
				<div>
					<div style="display:inline-block;font-size:46px!important;font-weight:700!important;">
						${merchantCfg.priceCleaner(offer.bestOffer.price)}
					</div>
					${(offer.priceDiffPercent<0)?'<div style="display:inline-block;background:#5ac13c;border-radius:15px;padding:0 .4rem;font-size:11px;vertical-align:super;font-weight:600;height:23px;line-height:22px;">'+merchantCfg.priceDiffText+'</div>':''}
				</div>
			</div>
			<div style="margin:15px auto;text-align:center;display:block;">
				<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="display:block;width:100%;">
					<button class="btn btn-primary btn-large" style="display:block;width:100%;min-width:137px;min-height:52px;border-radius:9px;border:0;color:#fff;background-color:#f73030;font-size:16px;font-weight:600;font-family:Poppins;line-height:16px;">
						<div class="label">
							<span class="label-icon">
								<svg viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg" style="width:1.5em;height:1.5em;fill:white;">
									<path d="M17.171 14.769c1.379 0 2.5 1.121 2.5 2.5 0 1.378-1.121 2.5-2.5 2.5a2.503 2.503 0 01-2.5-2.5c0-1.379 1.122-2.5 2.5-2.5zm-10 0c1.379 0 2.5 1.121 2.5 2.5 0 1.378-1.121 2.5-2.5 2.5a2.503 2.503 0 01-2.5-2.5c0-1.379 1.122-2.5 2.5-2.5zm10 1.5a1.001 1.001 0 000 2 1.001 1.001 0 000-2zm-10 0a1.001 1.001 0 000 2 1.001 1.001 0 000-2zM3.855.602c.361 0 .675.243.758.587l.702 2.876h15.244c.24 0 .466.108.613.293.148.185.2.426.143.654l-1.896 7.51a.776.776 0 01-.757.58H6.532a.776.776 0 01-.759-.586L3.24 2.13H1.284a.772.772 0 01-.78-.764c0-.422.35-.764.78-.764zm15.708 4.99H5.687l1.46 5.983h10.906l1.51-5.983z" fill-rule="nonzero"></path>
								</svg>
							</span>
							<span class="label-title" style="vertical-align:super;">${translates.buyOnAks}</span>
						</div>
					</button>
				</a>
			</div>
			<div style="text-align:center;">
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
		</div>`;
	}
};