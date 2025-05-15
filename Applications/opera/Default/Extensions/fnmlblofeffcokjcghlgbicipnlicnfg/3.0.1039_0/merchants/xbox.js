const merchantCfg={
	name:'xbox',
	waitProductName:true,
	productNameSelector:'h1[class*="ProductDetailsHeader-module__productTitle"],#standard.purchase1 h3',
	priceSelector:'.Price-module__moreText___1FNlT,.priceareas>div:last-of-type h4',
	insertAt:'div[class*="ProductActionsPanel-module"],.priceareas h4',
	insertMode:'beforebegin',
	waitInsertBlock: true,
	currencySelector:()=>{
		for(let script of document.querySelectorAll('script:not([src])'))
		{
			let position=script.innerText.indexOf('"currency":"');
			if(position===-1)continue;
			return script.innerText.substr(position+12,3);
		}
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
	templateSpecialPage:(offer,offersCount,seeOnAKSLink,translates)=>{
		const special_button=document.querySelector('.c-call-to-action');
		if(special_button)
			special_button_style='class="'+special_button.classList+'"';
		else
			special_button_style='style="background:#8bd80a;color:#054b16;padding:5px 20px 5px 22px;font-weight:900;font-family:SegoeProBlack,Segoe UI,SegoeUI,Helvetica,Arial,sans-serifvertical-align:middle;margin:10px 0;"';
		return `<div id="akInjected">
			<h4 class="origPrice" style="display:inline-block">${DOMPurify.sanitize(offer.merchantPriceText)}</h4>
			<h4 style="display:inline-block">${merchantCfg.priceCleaner(offer.bestOffer.price)}</h4>
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} ${special_button_style}>
				${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}
			</a><br>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} ${special_button_style}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>`;
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		if(document.querySelector('.priceareas'))
			return merchantCfg.templateSpecialPage(offer,offersCount,seeOnAKSLink,translates)
		var button_style,separator;
		const nativeButton=document.querySelector('button[class*="CommonButtonStyles-module__multilineDesktopButton"],button[class*="CommonButtonStyles-module"],a[class*="CommonButtonStyles-module"]');
		if(nativeButton)
		{
			button_style='class="'+nativeButton.classList+'" style="vertical-align:bottom;';
			button_style+=(nativeButton.getAttribute('aria-disabled')==='true')
							?'background:#008746ff!important;color:#fff!important;display:inline-flex;flex-direction:column;"'
							:'"';
		}
		else
			button_style='style="background:#008746ff;color:white;padding:20px;border-radius:5px;margin:10px;display:inline-block;"';
		const nativeSeparator=document.querySelector('span[class*="ProductActionsPanel-module__orSeparator"]');
		if(nativeSeparator)
			separator='<span class="'+nativeSeparator.classList+'" style="line-height:63px;vertical-align:middle;margin:0 10px;">'+DOMPurify.sanitize(nativeSeparator.innerText)+'</span>';
		else
			separator='<span style="font-family:Bahnschrift Bold;font-size:.9rem;font-weight:700;text-align:center;margin:0 10px;white-space:nowrap;line-height:63px;vertical-align:middle;position:relative;">- OR -</span>'
		return `
		<div style="margin-bottom:15px;position:relative;z-index:9999;display:flex;font-weight:600!important;" id="akInjected">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} ${button_style}>
				<span>${translates.buyOnAks}</span>
				<span>
					<span style="color:gray;text-decoration:line-through;margin:0 10px;">
						${DOMPurify.sanitize(offer.merchantPriceText)}
					</span>
					<span>${merchantCfg.priceDiffText}</span>
					<span>${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
				</span>
			</a>
			${separator}
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} ${button_style}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>`;
	},
	drawRearmCount:0,
	afterInsert:()=>{
		if(merchantCfg.drawRearmCount++<30)
			setTimeout(()=>{
				if(document.querySelector('#akInjected'))
					setTimeout(merchantCfg.afterInsert,300);
				else
					insertOffers(merchantCfg);
			},100);
	}
};