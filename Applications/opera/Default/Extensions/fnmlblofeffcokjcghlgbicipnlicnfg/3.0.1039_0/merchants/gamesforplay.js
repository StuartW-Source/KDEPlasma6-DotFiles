var timerWaitingToSwitch=null;
const merchantCfg={
	name:'gamesforplay',
	needRearm:true,
	voucherRearm:true,
	productNameSelector:'.title,.page-title',
	priceSelector:'.product-price-new',
	insertAt:'.price-wrapper',
	insertMode:'beforebegin',
	currencySelector:'.currency-code',
	langSelector:()=>{
		if(document.querySelector('html').hasAttribute('lang'))
			return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="z-index:2147483647!important;">
		<h3 style="margin:10px 0!important;padding-bottom:3px;width:100%;color:white;font-size:2.1rem;font-weight:bold;">
			<span style="text-decoration:line-through;margin:0rem 2rem 0rem 0rem;color:rgba(79,91,125,1)!important;font-size:16px;">
				${(offer.merchantPriceText!='0')?DOMPurify.sanitize(offer.merchantPriceText):''}
			</span>
			<span style="color:white!important;font-weight:bold;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
			${(offer.priceDiffPercent<0)
			  ?`<div class="product-labels-price" style="display:inline-flex;vertical-align:middle;">
                    <span class="product-label product-label-28 product-label-default product-label-price "><strong>${merchantCfg.priceDiffText}</strong></span>
                </div>`
			  :''
			}
		</h3>
		<a id="button-cart" class="btn" href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="color:#212C46!important;font-size:17px;font-weight:bold;pointer-events:auto;background:rgba(48,230,111,1)!important;font-family:'Avenir Black Bold',helvetica!important;width:100%!important;">
			${translates.buyOnAks}
		</a>
		<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="activatesin" style="font-size:17px;float:none;width:fit-content;pointer-events:auto;display:block;margin:15px auto;">
			${translates.seeOtherOffers(offersCount)}
		</a>
	</div>`
};