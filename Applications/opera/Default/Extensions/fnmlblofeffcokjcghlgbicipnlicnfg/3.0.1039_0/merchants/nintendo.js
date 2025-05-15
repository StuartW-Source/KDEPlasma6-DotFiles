const merchantCfg={
	name:'nintendo',
	productNameSelector:'.gamepage-header-info h1,.product__title',
	waitPriceBlock:true,
	acceptNoMerchantPriceFound:true,
	priceSelector:()=>{
		const priceElement=document.querySelector('*[data-price-box-price="old"],*[data-price-box-price="current"] span,.plm-price__main,.product__main .product__price .value');
		if(!priceElement)return;
		return merchantCfg.getTextOfHTMLElementWithoutChild(priceElement);
	},
	insertAt:['.plo-digital-price-box,.product__main .product__price','.price-box-item'],
	insertMode:'beforebegin',
	localizing:()=>{
		if (merchantCfg.localized===undefined)
		{
			merchantCfg.localized=true;
			const jsonldElement=document.querySelector('script[type="application/ld+json"]');
			if(jsonldElement)
			{
				const jsonldData=JSON.parse(jsonldElement.innerText);
				if(jsonldData.offers&&jsonldData.offers.priceCurrency)
				{
					merchantCfg.currencyDetected=jsonldData.offers.priceCurrency;
					merchantCfg.currencySymbolDetected=merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
					merchantCfg.langDetected=document.querySelector('html').getAttribute('lang');
					return;
				}
			}
			const localSelectedElement=document.querySelector('.locale_selector_current a');
			if(!localSelectedElement||!localSelectedElement.hasAttribute('hreflang')) return;
			const localeStr=localSelectedElement.getAttribute('hreflang');
			merchantCfg.langDetected=merchantCfg.isoLangToLang(localeStr.split('-')[0]);
			if(localeStr==='en-gb')
			{
				merchantCfg.currencyDetected='GBP';
				merchantCfg.currencySymbolDetected='£';
			}
			else if(localeStr==='ru-ru')
			{
				merchantCfg.currencyDetected='RUB';
				merchantCfg.currencySymbolDetected='RUB';
			}
			else if(localeStr==='de-ch'||localeStr==='fr-ch'||localeStr==='it-ch')
			{
				merchantCfg.currencyDetected='CHF';
				merchantCfg.currencySymbolDetected='CHF';
			}
			else if(localeStr==='en-za')
			{
				merchantCfg.currencyDetected='ZAR';
				merchantCfg.currencySymbolDetected='R';
			}
			else
			{
				merchantCfg.currencyDetected='EUR';
				merchantCfg.currencySymbolDetected='€';
			}
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
	template:(offer,offersCount,seeOnAKSLink,translates)=>document.querySelector('.price-box-item,.plo-digital-price-box')?`
	<div id="akInjected" class="plo-digital-price-box">
		<h3 style="margin:0;color:white;font-weight:700;">${translates.allkeyshop}</h3>
		<div class="plm-price plm-price--white">
			<div class="plm-price__main">
				${(offer.priceDiffPercent<0)?merchantCfg.priceDiffText:''} ${merchantCfg.priceCleaner(offer.bestOffer.price)}
			</div>
		</div>
		<div class="purchase-link-content">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="pla-btn pla-btn--white pla-btn--lg pla-btn--block" style="margin-bottom:5px;">
				${translates.buyOnAks}
			</a>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="pla-btn pla-btn--white pla-btn--lg pla-btn--block">
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`:`
	<div id="akInjected" class="product__price">
		<div class="purchase-link-content" style="text-align:center;">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>
				${translates.buyOnAks}
				<span class="sales product__currentprice">
					<data class="value">
						${(offer.priceDiffPercent<0)?merchantCfg.priceDiffText:''}<br>${merchantCfg.priceCleaner(offer.bestOffer.price)}
					</data>
				</span>
			</a><br>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};