const merchantCfg={
	name:'epicgames',
	getLDJson:()=>{
		if(merchantCfg.LDJson!==undefined)
			return merchantCfg.LDJson;
		const LDJsonElement=document.querySelector('#_schemaOrgMarkup-Product');
		if(!LDJsonElement)
			return;
		try
		{
			merchantCfg.LDJson=JSON.parse(LDJsonElement.innerHTML)
			return merchantCfg.LDJson;
		}
		catch
		{
			if(merchantCfg.debug)console.error('Fail to parse ld+json content in ',LDJsonElement);
		}
	},
	productNameSelector:()=>{
		const ld=merchantCfg.getLDJson();
		if(ld)
			return ld.name;
		return document.querySelector('*[data-component="NavigationList"] > a span')&&document.querySelector('*[data-component="NavigationList"] > a span').innerText;
	},
	priceSelector:()=>{
		const ld=merchantCfg.getLDJson();
		if(ld&&ld.offers&&ld.offers.length&&ld.offers[0].priceSpecification&&ld.offers[0].priceSpecification.price)
			return ld.offers[0].priceSpecification.price;
		return document.querySelector('div[data-component="PriceLayout"] span:last-of-type div:last-of-type span:last-of-type')&&document.querySelector('div[data-component="PriceLayout"] span:last-of-type div:last-of-type span:last-of-type').innerText;
	},
	needRearm:true,
	waitPriceBlock: true,
	waitProductName: true,
	insertAt:()=>{
		const span=document.querySelector(
			'div[data-component="PDPSidebarTagsLayout"],'
			+'main aside a[referrerpolicy="unsafe-url"],'
			+'button[data-testid="purchase-cta-button"],'
			+'#_schemaOrgMarkup-Product+div+div>div+div aside span'
		);
		console.log('insert at', span);
		if(span)return span.parentNode;
	},
	insertMode:'beforebegin',
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if(langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	currencySelector:()=>{
		const ld=merchantCfg.getLDJson();
		if(!ld)
			return;
		if(ld.offers.length&&ld.offers[0].priceSpecification&&ld.offers[0].priceSpecification.priceCurrency)
			return ld.offers[0].priceSpecification.priceCurrency;
	},
	currencySymbolSelector:()=>{
		if(!merchantCfg.currencyDetected)
			merchantCfg.currencyDetected=merchantCfg.currencySelector();
		if(!merchantCfg.currencyDetected)
			return;
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		const freeWords=['Free','Gratis','Gratuito','Gratuit','Bezpłatne','Бесплатно'];
		if(document.querySelector('[data-component="PurchasePrice"] [data-component="Message"]')
		  &&freeWords.includes(document.querySelector('div[data-component="PriceLayout"] span[data-component="Message"]').innerText)
		  )
			return;
		const customButton=document.querySelector('div[data-component="PDPSidebarLayout"] button[data-component="BaseButton"],button[data-testid="purchase-cta-button"]');
		var customColors='color:white;background-color:rgb(154, 0, 1);';
		if(customButton)
		{
			var getCss = window.getComputedStyle(customButton, null);
			customColors = DOMPurify.sanitize(`background-color:${getCss.getPropertyValue("background-color")};color:${getCss.getPropertyValue("color")};`);
		}
		return `
		<div id="akInjected" style="margin-bottom:20px;font-weight:500;width:100%;">
			<div style="background:rgba(0,0,0,0.1);border-radius:5px">
				<div style="margin-bottom:5px;font-size:16px;line-height:20px;">
					<span>
						${(offer.priceDiffPercent<0&&offer.merchantPriceText!='0')?`<span style="text-decoration:line-through;color:rgba(245,245,245,0.6);">${DOMPurify.sanitize(offer.merchantPriceText)+' '+translates.currencySymbole}</span>`:''}
						${merchantCfg.priceCleaner(offer.bestOffer.price)}
					</span>
				</div>
				<a
					href="${DOMPurify.sanitize(offer.bestOffer.url)}"
					style="${customColors}margin-top:1;display:flex;align-items:center;justify-content:center;padding:12px 20px;border-radius:3px;font-size:15px;"
					${merchantCfg.open_mode}
				>
					<span>
						<span>${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}</span>
					</span>
				</a>
				<a href="${seeOnAKSLink}" style="margin-top:10px;color:white;display:block;font-size:13px;"${merchantCfg.open_mode}>
					<div style="border:1px solid rgba(245,245,245,0.6);text-align:center;font-size:14px;letter-spacing:1px;font-weight:500;padding:5px;">
						${translates.seeOtherOffers(offersCount)}
					</div>
				</a>
			</div>
		</div><br>`;
	}
};