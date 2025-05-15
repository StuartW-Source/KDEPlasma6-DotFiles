const merchantCfg={
	name:'playstation',
	productNameSelector:'h1[data-qa="mfe-game-title#name"]',
	priceSelector:'span[data-qa="mfeCtaMain#offer0#finalPrice"],[data-flip-key] span span span',
	insertAt:'.psw-c-bg-card-1 > div',
	insertMode:'afterend',
	localizing:()=>{
		if (merchantCfg.localized===undefined)
		{
			merchantCfg.localized=true;
			const localSelectedElement=document.querySelector('html');
			if(!localSelectedElement||!localSelectedElement.hasAttribute('lang')) return;
			const localeStr=localSelectedElement.getAttribute('lang');
			merchantCfg.langDetected=merchantCfg.isoLangToLang(localeStr.split('-')[0]);
			merchantCfg.currencyDetected=JSON.parse(document.querySelector('script#mfe-jsonld-tags[type="application/ld+json"]').innerText).offers.priceCurrency;
			merchantCfg.currencySymbolDetected=merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.execOrExtract(merchantCfg.priceSelector));
		}
	},
	currencySelector:()=>{
		merchantCfg.localizing();
		return merchantCfg.currencyDetected;
	},
	currencySymbolSelector:()=>{
		merchantCfg.localizing();
		return merchantCfg.currencySymbolDetected;
	},
	langSelector:()=>{
		merchantCfg.localizing();
		return merchantCfg.langDetected;
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		if (document.querySelector('.cta-container-bg.psw-bg-1-t-fade'))document.querySelector('.cta-container-bg.psw-bg-1-t-fade').remove();
		return `
		<div id="akInjected" class="cta-container-bg psw-bg-1-t-fade" style="text-align:center;position:relative;padding:25px;z-index:1;min-height:175px;">
			${(offer.priceDiffPercent<0)?`<h3>${merchantCfg.priceDiffText}</h3>`:''}
			<a
				href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
				style="margin-bottom:5px"
				class="psw-fill-x dtm-track psw-button psw-l-line-center psw-button-sizing psw-button-sizing--medium psw-purchase-button psw-solid-button"
			>${translates.buyOnAksAt} ${merchantCfg.priceCleaner(offer.bestOffer.price)}</a>
			<br/><br/>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="color:white;">${translates.seeOtherOffers(offersCount)}</a>
		</div>`;
	}
};