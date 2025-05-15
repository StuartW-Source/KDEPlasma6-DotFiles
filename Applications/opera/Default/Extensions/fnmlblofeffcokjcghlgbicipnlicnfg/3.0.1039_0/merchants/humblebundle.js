const merchantCfg={
	name:'humblebundle',
	productNameSelector:'.js-human-name,.human_name-view',
	priceSelector:'.current-price,.full-price',
	insertAt:'.platform-pricing-grid',
	insertMode:'beforebegin',
	waitPriceBlock: true,
	waitProductName: true,
	getJsonp:()=>{
		if (merchantCfg.jsonp===undefined)
		{
			const el=document.querySelector('script[type="application/ld+json"]');
			if(!el) return;
			merchantCfg.jsonp=JSON.parse(el.innerText);
		}
		return merchantCfg.jsonp;
	},
	currencySelector:()=>{
		const jsonp=merchantCfg.getJsonp();
		if (jsonp&&jsonp.offers&&jsonp.offers.priceCurrency)return jsonp.offers.priceCurrency;
	},
	currencySymbolSelector:()=>{
		const jsonp=merchantCfg.getJsonp();
		if (!jsonp)return;
		const priceElement=document.querySelector(merchantCfg.priceSelector);
		if (!priceElement)return;
		const match=priceElement.innerText.match(/[^ 0-9.,]+/);
		return match&&match.length&&match[0];
	},
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" class="platform-pricing-grid" style="padding-top:25px">
		<div class="pricing-container">
			<div class="pricing-view">
				<div class="price-info">
					<div class="discount-gem-view">
						<div class="discount-gem">
							<div class="discount-amount" style="margin-bottom:5px">
								${merchantCfg.priceDiffText}
							</div>
						</div>
					</div>
					<span class="current-price">
						${merchantCfg.priceCleaner(offer.bestOffer.price)}
					</span>
					<span class="full-price">
						${DOMPurify.sanitize(offer.merchantPriceText)}
					</span>
				</div>
			</div>
		</div>
		<div class="shopping-cart-button-container">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="text-decoration:none">
				<div class="shopping-cart-button">
					<span class="add">
						<i class="hb hb-shopping-cart-solid"></i>${translates.buyOnAks}
					</span>
				</div>
			</a>
		</div>
		<div class="wishlist-button-view" style="margin-top:7px">
			<a class="add-text" href="${seeOnAKSLink}"${merchantCfg.open_mode} style="text-decoration:none">
				<span class="wishlist-button">
					<i class="hb hb-star"></i>
					${translates.seeOtherOffers(offersCount)}
				</span>
			</a>
		</div>
	</div>`
};