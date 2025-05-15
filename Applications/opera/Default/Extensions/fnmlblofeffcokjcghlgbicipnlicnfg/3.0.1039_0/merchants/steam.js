const merchantCfg={
	name:'steam',
	productNameSelector:'.apphub_AppName,#game_area_purchase h1',
	priceSelector:'.game_area_purchase_game_wrapper .price, .game_purchase_action .discount_final_price',
	insertAt:'.game_area_purchase_game_wrapper,#game_area_purchase',
	insertMode:'beforebegin',
	currencyExtract:()=>{
		if (merchantCfg.currencyAlreadyExtracted===undefined)
		{
			merchantCfg.currencyAlreadyExtracted=true;
			const propElement=document.querySelector('div[itemprop="offers"] meta[itemprop="priceCurrency"]');
			if(!propElement)return;
			merchantCfg.currencyDetected=propElement.getAttribute('content');
			merchantCfg.currencySymbolDetected=merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.execOrExtract(merchantCfg.priceSelector));
		}
	},
	currencySelector:()=>{
		merchantCfg.currencyExtract();
		return merchantCfg.currencyDetected;
	},
	currencySymbolSelector:()=>{
		merchantCfg.currencyExtract();
		return merchantCfg.currencySymbolDetected;
	},
	langSelector:()=>{
		const langElement=document.querySelector('html');
		if(langElement.hasAttribute('lang'))return merchantCfg.isoLangToLang(langElement.getAttribute('lang'));
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`<div id="akInjected" class="game_area_purchase_game_wrapper">
		<div class="game_area_purchase_game">
			<h1>${translates.buyOnAks}</h1>
			<div class="game_purchase_action">
				<div class="game_purchase_action_bg">
					<div class="game_purchase_discount">
					${(merchantCfg.priceDiffText<0)?`<div class="discount_pct">${merchantCfg.priceDiffText}</div>`:''}
						<div class="discount_prices">
							<div class="discount_original_price">${DOMPurify.sanitize(offer.merchantPriceText)}</div>
							<div class="discount_final_price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
						</div>
					</div>
					<div class="btn_addtocart">
						<a
							class="btnv6_green_white_innerfade btn_medium" =
							href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
						>
							<span>${translates.seeOffer}</span>
						</a>
					</div>
					<div class="btn_addtocart">
						<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="btnv6_blue_blue_innerfade btn_medium">
							<span>${translates.seeOtherOffers(offersCount)}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>`
};