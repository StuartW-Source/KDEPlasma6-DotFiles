const merchantCfg={
	merchantId:180,
	name:'pixelcodes',
	productNameSelector:'.product_title',
	outOfStockSelector:'.entry-summary .out-of-stock',
	priceSelector:'.price .woocommerce-Price-amount',
	getJsonp:()=>{
		if (merchantCfg.jsonp===undefined)
		{
			const els=document.querySelectorAll('script[type="application/ld+json"]');
			if(!els) return;
			var data=null;
			for (const el of els)
			{
				try
				{
					data=JSON.parse(el.innerText);
				}
				catch
				{
					if(merchantCfg.debug)
						console.error('Fail to parse JSON of ', el);
					continue;
				}
				if (!data.hasOwnProperty('@context')||data['@context']!=='https://schema.org/')
					continue;
				merchantCfg.jsonp=data;
				break;
			}
		}
		return merchantCfg.jsonp;
	},
	currencySelector:()=>{
		merchantCfg.getJsonp();
		return merchantCfg.jsonp&&merchantCfg.jsonp['@graph']&&merchantCfg.jsonp['@graph'][1]&&merchantCfg.jsonp['@graph'][1]['offers']&&merchantCfg.jsonp['@graph'][1]['offers'][0]&&merchantCfg.jsonp['@graph'][1]['offers'][0]['priceCurrency'];
	},
	currencySymbolSelector:'.woocommerce-Price-currencySymbol',
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	insertAt:'.price',
	insertMode:'afterbegin',
	voucherUrl:'https://pixelcodes.com/cart/',
	voucherUrlPattern:'https://pixelcodes.com/cart/.*',
	voucherInputSelector:'#coupon_code',
	voucherSubmitSelector:'button[name="apply_coupon"]',
	voucherFailedSelector:'.woocommerce-error',
	voucherSuccessSelector:'.woocommerce-remove-coupon',
	voucherPriceResultSelector:'td[data-title="Total"] .woocommerce-Price-amount',
	voucherInitialPriceSelector:()=>{
		var initial_price=document.querySelector('td[data-title="Subtotal"] .woocommerce-Price-amount');
		if(!initial_price)return;
		initial_price=parseFloat(merchantCfg.priceSanitize(initial_price.innerText));
		var initial_fee=document.querySelector('td[data-title="Processing Fee"] .woocommerce-Price-amount');
		if(initial_fee)
		{
			initial_fee=parseFloat(merchantCfg.priceSanitize(initial_fee.innerText));
			initial_price+=initial_fee;
		}
		return String(initial_price)
	},
	voucherInitialPriceCurrencySelector:()=>{
		if(window.wrappedJSObject)
			return window.wrappedJSObject.wc_aelia_currency_switcher_params.selected_currency;
		const els=document.querySelectorAll('script[type="text/javascript"]');
		if(!els) return;
		var data=null,position;
		for (const el of els)
		{
			position=el.innerText.search('"currencyCode":"');
			if(position!=-1)
				return el.innerText.substr(position+16,3);
		}
	},
	voucherPreviousInsertCallback:()=>{
		const voucher_delete=document.querySelector('.woocommerce-remove-coupon');
		if(!voucher_delete)return;
		voucher_delete.click();
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<span class="electro-price">
			<span class="woocommerce-Price-amount amount">
				<bdi style="text-decoration:line-through">${DOMPurify.sanitize(offer.merchantPriceText)}</bdi>
				<bdi>${merchantCfg.priceCleaner(offer.bestOffer.price)}</bdi>
			</span>
		</span><br>
		<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>
			<button class="single_add_to_cart_button alt" style="color:white;font-weight:700;">
				${translates.buyAtOnAks((offer.priceDiffPercent!==0)?merchantCfg.priceDiffText:merchantCfg.priceCleaner(offer.bestOffer.price))}
			</button>
		</a>
		<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
			<button class="single_add_to_cart_button alt" style="color:white;font-weight:700;">${translates.seeOtherOffers(offersCount)}</button>
		</a><br><br>
	</div>`
};