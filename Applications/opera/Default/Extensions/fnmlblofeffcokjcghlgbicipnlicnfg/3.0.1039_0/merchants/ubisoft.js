function getTextOfHTMLElementWithoutChildContent(selector=null,element=null)
{
	if (!element||!element.childNodes)
	{
		if (!selector)
			return;
		element = document.getElementById(selector);
	}
	var text = '';
	for (var i = 0; i < element.childNodes.length; ++i)
	{
		if (element.childNodes[i].nodeType === Node.TEXT_NODE)
			text += element.childNodes[i].textContent;
	}
	return text;
}
const merchantCfg={
	name:'ubisoft',
	productNameSelector:()=>{
		const gameElement=document.querySelector('[itemprop="name"]');
		if (!gameElement)
			return;
		const dlcElement=document.querySelector('.product-header-edition');
		const dlcText=getTextOfHTMLElementWithoutChildContent(null,dlcElement);
		return (!dlcElement||gameElement.innerText.toLowerCase().endsWith(dlcText.toLowerCase()))
				?gameElement.innerText
				:gameElement.innerText+' '+dlcText
				;
	},
	priceSelector:'.pdp-cta .product-price .price-sales.standard-price',
	insertAt:'.price-box',
	insertMode:'beforebegin',
	afterInsert:()=>{
		var targetNode = document.querySelector('.ak.price-box');
		var observer = new MutationObserver((mutationsList)=>{
			clearTimeout(oid);
			observer.disconnect;
			if (document.querySelector('.pdp-buttons-wrapper'))
				document.querySelector('.pdp-buttons-wrapper').remove();
			setTimeout(()=>merchantCfg.insertOffers(merchantCfg), 100);
		});
		observer.observe(targetNode, { attributes: true, childList: true });
		var oid=setTimeout(observer.disconnect, 5000);
	},
	langSelector:()=>{
		const langElement=document.querySelector('html');
		if(langElement.hasAttribute('lang'))return merchantCfg.isoLangToLang(langElement.getAttribute('lang'));
	},
	currencySelector:()=>{
		try{
			return document.querySelector('.navigation-offer-section script[type="text/javascript"]').innerText.split('"currency":')[1].split(',',1)[0].replace(/[^A-Za-z]/g,'');
		}
		catch{}
	},
	currencySymbolSelector:()=>{
		try{
			if(merchantCfg.currencyDetected&&merchantCfg.merchantPriceText)
				return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
			else if(merchantCfg.debug)
				console.error('No currency already detected');
			return document.querySelector('#footer+script[type="text/javascript"]').innerText.split('"STOREFRONT_CURRENCY_SYMBOL":')[1].split('}',1)[0].replace('\"','').replace('"','');
		}
		catch{}
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`<div id="akInjected" style="margin-top:-20px;">
		<div class="ak price-box pdp-badge-only">
			<div class="card-additional-details card-labels-wrapper show-timer-oncard">
				<div class="discount_timer_section deal">
					<div class="product-price price deal discount-shown ">
						<div class="price-wrapper">
							<div class="deal-percentage card-label card-deal">${merchantCfg.priceDiffText}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="pdp-buttons-wrapper" style="margin-bottom:21px;">
			<div class="product-add-to-cart price-box">
				<div class="pdp-cta">
					<div class="flex-reverse-order">
						<div class="product-price price deal discount-shown ">
							<div class="price-wrapper">
								<span class="price-sales standard-price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
								<span class="price-standard"><span class="price-item">${DOMPurify.sanitize(offer.merchantPriceText)}</span></span>
							</div>
						</div>
					</div>
					<div class="pdp-cta-wrap ownership-reminder-wrap wishlist-pdp">
						<div class="button-wrapper btn-lg" style="width:100%;margin:0;">
							<a
								href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
								class="button check-for-tagging-click shop-now" style="margin: 10px auto;width:250px;"
								data-alt-text="${translates.buyOnAks}"
							>
								<span>
									${translates.buyOnAks}
								</span>
							</a>
							<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="color:black">
								${translates.seeOtherOffers(offersCount)}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>`
};