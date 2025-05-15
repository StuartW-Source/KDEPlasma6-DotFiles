const merchantCfg={
	name:'instantgaming',
	productNameSelector:'.game-title',
	priceSelector:()=>{
		const price=document.querySelector('meta[itemprop="price"]');
		return price&&price.getAttribute('content');
	},
	insertAt:'.panel .amount',
	insertMode:'beforebegin',
	acceptNoMerchantPriceFound:true,
	currencySelector:'.geo-selected .currency',
	currencySymbolSelector:()=>document.querySelector('.currencies .selected')&&document.querySelector('.currencies .selected').innerText.split(' - ')[1].trim(),
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="margin-bottom:20px;width:100%;text-align:center">
		<div style="font-size:19px;">
			<div class="icon-tag icon-xxs" style="display:inline-block!important"></div>
			<span style="text-decoration:line-through;">${DOMPurify.sanitize(offer.merchantPriceText)}${merchantCfg.currencySymbolDetected}</span>
			<span style="color:#ff5400;"> ${merchantCfg.priceDiffText}</span>
			<span style="font-size:40px;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
		</div>
		<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="button buybutton" style="text-align:start;text-indent:10px;">
			<span>${translates.buyOnAks}</span>
		</a>
		<div style="display:flex;justify-content:space-around;margin-top:15px;">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>${translates.seeOtherOffers(offersCount)}</a>
		</div>
	</div>`
};