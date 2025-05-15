const merchantCfg={
	merchantId:'270,2700',
	name:'allyouplay',
	productNameSelector:'.hero-title',
	priceSelector:'span[itemprop="price"]',
	insertMode:'afterend',
	insertAt:'.product-roof',
	currencySelector:()=>document.querySelector('meta[itemprop="priceCurrency"]').getAttribute('content'),
	currencySymbolSelector:()=>{
		if(!merchantCfg.currencyDetected)merchantCfg.currencyDetected=merchantCfg.currencySelector();
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	voucherSubmitReload:true,
	voucherUrl:'https://www.allyouplay.com/cart',
	voucherUrlPattern:'https://www.allyouplay.com/[a-z]+/cart.*',
	voucherInputSelector:'#discountcouponcode',
	voucherSubmitSelector:'#applydiscountcouponcode',
	voucherFailedSelector:()=>document.querySelector('.box-cart-summary .is-text-small').innerText.indexOf('coupon code can\'t be applied')!=-1,
	voucherSuccessSelector:()=>document.querySelector('.coupon-code-row span span').innerText.indexOf(merchantCfg.voucher)!=-1,
	voucherPriceResultSelector:'.mini-cart-total-row div:last-of-type',
	voucherInitialPriceSelector:'.cart-product-row .checkout span',
	voucherInitialPriceCurrencySelector:()=>{
		for(let s of document.querySelectorAll('script:not([src])'))
		{
			let currency_position=s.innerText.indexOf('"currencyCode": "');
			if(currency_position===-1)
				continue;
			return s.innerText.substr(currency_position+17,3);
		}
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div class="product-roof" style="margin-top:20px;" id="akInjected">
		<div class="container">
			<div class="row flex-hcenter">
				<div class="column slice-12 slice-max-12 slice-xl-12 slice-lg-14 slice-md-14 slice-sm-14 slice-xs-14">
					<div class="row">
						<div class="column slice-3 slice-max-3 slice-xl-3 slice-lg-3 slice-md-3 slice-sm-3 slice-xs-3">
							<div class="is-flex is-flex-direction-column is-full-height">
								<div class="product-price is-mt-auto">
									<span class="is-color-orange" style="text-decoration:line-through;">
									${DOMPurify.sanitize(offer.merchantPriceText)}
									</span>
								</div>
							</div>
						</div>
						<div class="column slice-3 slice-max-3 slice-xl-3 slice-lg-3 slice-md-3 slice-sm-3 slice-xs-3">
							<div class="is-flex is-flex-direction-column is-full-height">
								<ul class="list-plain list-horizontal list-product-os reset-first-last-padding is-mt-auto">
									<li>
									${merchantCfg.priceCleaner(offer.bestOffer.price)}
									</li>
								</ul>
							</div>
						</div>
						<div class="column slice-4 slice-max-4 slice-xl-4 slice-lg-4 slice-md-4 slice-sm-5 slice-xs-5">
							<div class="is-flex is-flex-direction-column is-full-height">
								<ul class="list-plain list-horizontal list-product-platforms reset-first-last-padding is-mt-auto">
									<li>
										<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="color:white;">${translates.seeOtherOffers(offersCount)}</a>
									</li>
								</ul>
							</div>
						</div>
						<div class="column slice-4 slice-max-4 slice-xl-4 hidden--for-tablet hidden--for-lg hidden--for-md hidden--for-sm hidden--for-xs">
							<div class="is-flex flex-vcenter product-roof-atc">
								<div class="is-mt-auto is-flex-grow-1">
									<div class="is-flex">
										<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="text-decoration:none;width:100%;">
											<button type="button" class="btn btn-primary is-full-width is-flex-grow-1">${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}</button>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>`
};