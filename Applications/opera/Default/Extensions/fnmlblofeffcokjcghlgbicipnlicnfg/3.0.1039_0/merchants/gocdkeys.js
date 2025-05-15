const merchantCfg={
	name:'gocdkeys',
	productNameSelector:'[itemprop="name"]',
	priceSelector:'[itemprop="price"]',
	insertAt:'.p-store-list tbody',
	insertMode:'beforebegin',
	currencySelector:()=>{
		const currencyElement=document.querySelector('[itemprop="priceCurrency"]');
		if(!currencyElement)
			return (merchantCfg.debug)?console.error('currencyElement not found'):null;
		return currencyElement.getAttribute('content');
	},
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		if (document.querySelector('.p-store-cheapest'))
		{
			titleTxt=document.querySelector('.p-store-cheapest').innerText;
			document.querySelector('.p-store-cheapest').remove();
		}
		else
			titleTxt='Best price';
		return `
		<thead id="akInjected" style="width:100%;display:block;">
			<tr></tr>
			<tr class="recommended">
				<td class="p-store-img">
					<div class="p-store-cheapest">${DOMPurify.sanitize(titleTxt)}</div>
					<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
						Allkeyshop.com
					</a>
				</td>
				<td style="min-width:50%;text-align:center;margin-top:30px;cursor:pointer;">
					<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>${translates.seeOtherOffers(offersCount)}</a>
				</td>
				<td class="p-store-price">
					<div class="strike">${DOMPurify.sanitize(offer.merchantPriceText)}</div>
					<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="btn fuchsia">
						<b itemprop="price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</b>
					</a>
					<span></span>
				</td>
			</tr>
		</thead>`;
	}
};