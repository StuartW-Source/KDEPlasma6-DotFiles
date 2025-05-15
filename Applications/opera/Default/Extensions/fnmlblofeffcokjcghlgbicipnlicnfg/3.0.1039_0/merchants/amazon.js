const merchantCfg={
	name:'amazon',
	productNameSelector:()=>{
		const sectionSelectors=['#wayfinding-breadcrumbs_feature_div a','#nav-progressive-subnav a span'];
		const categoriesAllowed=['videogames','video games','jeux vidéo','videogiochi'];
		for (let sectionSelector of sectionSelectors)
			for (let element of document.querySelectorAll(sectionSelector))
				if (element.innerText&&categoriesAllowed.includes(element.innerText.toLowerCase()))
					return document.querySelector('#productTitle').innerText.split('|')[0].split('-')[0];
	},
	priceSelector:'.priceBlockBuyingPriceString,#corePriceDisplay_desktop_feature_div .a-offscreen,#corePrice_feature_div .a-offscreen',
	insertAt:'#buybox .a-box-inner, #buybox .a-accordion-row-a11y',
	insertMode:'beforebegin',
	currencySelector:()=>{
		return {
			'en-gb': 'GBP',
			'en-us': 'USD',
			'en-ca': 'CAD',
		}[document.querySelector('html').lang]||'EUR'
	},
	currencySymbolSelector:()=>{
		return {
			'en-gb': '£',
			'en-us': '$',
			'en-ca': '$',
		}[document.querySelector('html').lang]||'€'
	},
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso.split('-')[0]);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<div class="a-section a-spacing-small a-text-left" style="margin:20px auto;height:30px;font-size:15px;text-align:center!important;">
			<span class="a-color-price price3P">
				${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}
			</span>
		</div>
		<div class="a-button-stack" style="padding: 0 18px">
			<span class="a-button a-button-icon a-button-primary a-spacing-small">
				<span class="a-button-inner">
					<i class="a-icon a-icon-cart"></i>
					<a href="${DOMPurify.sanitize(offer.bestOffer.url)}" class="a-button-text"${merchantCfg.open_mode}>
						${merchantCfg.priceCleaner(offer.bestOffer.price)} ${translates.seeOffer}
					</a>
				</span>
			</span>
		</div>
		<div class="a-button-stack" style="padding:0 18px;margin-bottom:20px;">
			<span class="a-spacing-base">
				<span class="a-button a-button-icon a-button-oneclick">
					<span class="a-button-inner">
						<i class="a-icon a-icon-buynow" role="img"></i>
						<span class="a-button-text">
							<a href="${seeOnAKSLink}" class="a-button-text"${merchantCfg.open_mode}>${translates.seeOtherOffers(offersCount)}</a>
						</span>
					</span>
				</span>
			</span>
		</div>
	</div>`
};