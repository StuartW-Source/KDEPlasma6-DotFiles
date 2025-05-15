const merchantCfg={
	name:'origin',
	needRearm:true,
	waitProductName:true,
	acceptNoMerchantPriceFound:true,
	productNameSelector:()=>document.querySelector('.otkex-product-hero-logo')?document.querySelector('.otkex-product-hero-logo').getAttribute('alt'):null,
	insertAt:'.origin-store-gdp-header-block origin-store-gdp-primarycta',
	insertMode:'beforebegin',
	currencyExtract:()=>{
		if (merchantCfg.currencyAlreadyExtracted===undefined)
		{
			const jsonldElement=document.querySelector('.origin-seo-schema script[type="application/ld+json"]:nth-of-type(2)');
			if(!jsonldElement)return;
			merchantCfg.currencyAlreadyExtracted=true;
			merchantCfg.currencyDetected=JSON.parse(jsonldElement.innerText).offers[0].priceCurrency;
			merchantCfg.currencySymbolDetected=merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected);
		}
	},
	currencySelector:()=>{
		merchantCfg.currencyExtract();
		return merchantCfg.currencyDetected;
	},
	currencySymbolSelector:()=>{
		merchantCfg.currencyExtract();
		return merchantCfg.currencySymbolDetected;
	},
	langSelector:()=>{
		const langElement=document.querySelector('.origin-globalfooter-languageselector option[selected]');
		if(langElement&&langElement.value)
		{
			if(langElement.value.indexOf(':')>-1)
				return merchantCfg.isoLangToLang(langElement.value.split(':')[1].split('-')[0]);
			if (merchantCfg.debug)
				console.error('Lang format as change: ',langElement.value);
		}
		const secondChance=document.querySelector('html');
		if(secondChance.hasAttribute('lang'))return merchantCfg.isoLangToLang(secondChance.getAttribute('lang'));
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		const hold=document.querySelector('#akInjected');
		if(hold)hold.remove();
		return `
		<div id="akInjected">
			<div class="otkex-dropdown-cta">
				<div class="otkbtn">
					<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="otkbtn otkbtn-primary otkbtn-primary-btn">
						${translates.buyOnAksAt} ${merchantCfg.priceCleaner(offer.bestOffer.price)}
					</a>
				</div>
			</div>
			<div class="origin-store-gdp-header-block">
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="otkbtn otkbtn-light" style="margin-bottom:10px">
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
		</div>`;
	}
};