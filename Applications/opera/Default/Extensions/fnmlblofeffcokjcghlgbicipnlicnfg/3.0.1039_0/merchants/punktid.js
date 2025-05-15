const merchantCfg={
	merchantId:307,
	name:'punktid',
	productNameSelector:'.field-name-title h1',
	priceSelector:'.field-type-commerce-price .field-item',
	insertMode:'beforebegin',
	insertAt:'.punktid-product-prices',
	currencySelector:()=>'EUR',
	currencySymbolSelector:()=>'€',
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
    voucherUrl:'https://punktid.com/cart',
	voucherUrlPattern:'https?://punktid\.(com|ee|fi|lv|lt|ru)/checkout/.*',
	voucherInputSelector:'#edit-commerce-coupon-coupon-code',
	voucherSubmitSelector:()=>{
		document.querySelector(merchantCfg.voucherInputSelector).dispatchEvent(new Event('keyup',{bubbles:true}));
		return true;
	},
	voucherFailedSelector:'#edit-commerce-coupon-coupon-code.error',
	voucherSuccessSelector:'.commerce-checkout-coupon.is-valid .form-text',
	voucherApplyIf:()=>{
		if(document.querySelector('.content.is-valid #checkout-user-login #edit-email,#edit-customer-profile-billing-field-email-und-0-email,#commerce-checkout-form-review')===null)
			return false;
		if(merchantCfg.waitRedirect)
			return false;
		const rmA=document.querySelector('a[href^="/commerce/coupons/order/remove/"]');
		if(rmA)
		{
			merchantCfg.waitRedirect=true;
			return rmA.click();
		}
		return true;
	},
	voucherGoBack:()=>{
		if(!document.querySelector('#commerce-checkout-form-review'))
			return;
		const goBack=document.querySelector('#edit-back');
		if(goBack)
		{
			merchantCfg.waitRedirect=true;
			return goBack.click();
		}
	},
	voucherPreviousInsertCallback:()=>{
		if(!document.querySelector('tr:last-of-type td.views-field.views-field-commerce-coupon-code')&&document.querySelector('#btn-insert-coupon'))
			return document.querySelector('#btn-insert-coupon').click();
	},
	voucherPriceResultSelector:()=>0.01,
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div style="display:flex;" id="akInjected">
		<div class="punktid-product-prices" style="display:flex;flex-direction:column;">
			<div class="field field-name-commerce-price field-type-commerce-price field-label-hidden">
				<div class="field-items">
					<div class="field-item even">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
				</div>
			</div>
			<div class="field-name-field-old-price ua-small-price">${DOMPurify.sanitize(offer.merchantPriceText)}</div>
		</div>
		<div style="text-align:center;">
			<div class="commerce-add-to-cart" style="margin-top:15px;">
				<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="display:block;">
					<button type="button" class="buy btn-warning btn form-submit">${translates.buyOnAks}</button>
				</a>
			</div>
			<div style="margin-top:10px;">
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="display:block;">
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
		</div>
	</div>`
};