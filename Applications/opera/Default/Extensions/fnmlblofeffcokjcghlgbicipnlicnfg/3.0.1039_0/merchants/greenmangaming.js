const merchantCfg={
	name:'greenmangaming',
	productNameSelector:'#pdp-title h1',
	priceSelector:'.current-price.pdp-price',
	insertAt:'.hidden-xs #pdp-purchase .prices',
	insertMode:'beforebegin',
	currencySelector:()=>{
		const jsonLdELement=document.querySelector('script[type="application/ld+json"]');
		if(!jsonLdELement)return;
		const data=JSON.parse(jsonLdELement.innerText);
		return (!data||!data.offers)?null:data.offers.priceCurrency;
	},
	currencySymbolSelector:()=>{
		const priceElement=document.querySelector(merchantCfg.priceSelector);
		if (!priceElement)return;
		const match=priceElement.innerText.match(/[^ 0-9.,]+/);
		return match&&match.length&&match[0];
	},
	langSelector:()=>{
		const langElement=document.querySelector('.language-setting-dropdown span');
		if (langElement)
			return merchantCfg.isoLangToLang(langElement.innerText);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div class="col-xs-12 prices akInjected" style="margin-bottom:100px;">
		<div class="col-xs-12 prices-info prices-discount">
			<div class="discount">
				<div class="confetti-container-discount discount">
					<gmgprice>${merchantCfg.priceDiffText}</gmgprice>
				</div>
			</div>
			<div class="prices-details">
				<div>
					<price class="prev-price">
						<span>
							${DOMPurify.sanitize(offer.merchantPriceText)}
						</span>
					</price>
				</div>
			<div>
			<price class="current-price">
				<span>
					${merchantCfg.priceCleaner(offer.bestOffer.price)}
				</span>
			</price>
		</div>
	</div>
	<div class="akInjected">
		<a
			href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
			class="btn btn-block btn-primary"
			style="margin-top: 10px;"
		>
			<span class="glyphicon glyphicon-shopping-cart"></span>
			<span>${translates.buyOnAks}</span>
		</a>
	</div>
	<div class="akInjected">
		<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="btn btn-secondary btn-m btn-white btn-block">
			<span>
				<span class="glyphicon glyphicon-heart-empty"></span>
				${translates.seeOtherOffers(offersCount)}
			</span>
		</a>
	</div>`
};