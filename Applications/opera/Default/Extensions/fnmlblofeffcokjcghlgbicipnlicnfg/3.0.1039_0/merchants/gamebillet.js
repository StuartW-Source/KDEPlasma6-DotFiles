const merchantCfg={
	merchantId:81,
	name:'gamebillet',
	productNameSelector:'.product-title-big',
	priceSelector:'.buy-actions span:last-of-type',
	insertMode:'afterbegin',
	insertAt:'.product-card__footer',
	currencySelector:'.header-bottom .dropdown-result span',
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
    voucherUrl:'https://www.gamebillet.com/cart',
	voucherUrlPattern:'https?://www.gamebillet.com/cart.*',
	voucherInputSelector:'#discountcouponcode',
	voucherSubmitSelector:'a[onclick="applydiscountcouponcode();return false;"]',
	voucherFailedSelector:()=>false,
	voucherSuccessSelector:()=>document.querySelector('#bar-notification .content')&&document.querySelector('#bar-notification .content').innerText.indexOf('The coupon code was applied')!=-1,
	voucherPriceResultSelector:'.cart-pay-amount td:last-of-type',
	voucherSubmitReload:false,
	voucherPreviousInsertCallback:()=>{
		const remove_purpose=document.querySelector('.js-coupon-ddl-wrapper .btn-danger');
		if(!remove_purpose)return;
		merchantCfg.voucherTestStat=-1;
		remove_purpose.click();
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="text-align:right;">
		<div class="col-lg-9"><div class="buy-block is-timer is-timer-sm"><div class="buy-wrapper"><div class="buy-wrapper-timer"><div class="buy-actions">
			<a class="btn btn-success" href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}</a>
			<span>${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
		</div></div></div></div></div>
		<div>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin:5px 0 30px 0px;display:inline-block;text-decoration:underline;">
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};