const merchantCfg={
	name:'microsoft',
	productNameSelector:'#DynamicHeading_productTitle',
	priceSelector:()=>document.querySelector('meta[itemprop="price"]')?document.querySelector('meta[itemprop="price"]').getAttribute('content'):null,
	insertAt:'#productPrice',
	insertMode:'beforebegin',
	currencySelector:()=>{
		const currencyElement=document.querySelector('span[itemprop="priceCurrency"]');
		if (currencyElement)
			return currencyElement.getAttribute('content').replace('/','');
	},
	currencySymbolSelector:()=>{
		const priceElement=document.querySelector('meta[itemprop="price"]');
		if (!priceElement)return;
		const match=priceElement.getAttribute('content').match(/[^ 0-9.,]+/);
		return match&&match.length&&match[0];
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<div class="pi-price-text">
				<span style="color:gray;text-decoration:line-through;margin-right:10px;">
					${(offer.priceDiffPercent<0)?DOMPurify.sanitize(offer.merchantPriceText):''}
				</span>
				<span>${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
		</div>
		<div style="margin-bottom:20px">
			<div class="pi-button-panel">
				<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="pi-overflow-ctrl">
					<button class="c-button f-primary cli_defaultFocus">${translates.buyOnAks} ${(offer.priceDiffPercent<0)?merchantCfg.priceDiffText:''}</button>
				</a>
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="pi-overflow-btn c-button" style="width:100%;margin-top:5px;min-height:40px;">
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
		</div>
	</div>`
};