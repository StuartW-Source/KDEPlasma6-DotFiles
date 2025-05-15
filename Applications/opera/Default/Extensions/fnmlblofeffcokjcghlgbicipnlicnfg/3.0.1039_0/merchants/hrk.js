const merchantCfg={
	merchantId:94,
	name:'hrk',
	productNameSelector:'.main_title',
	outOfStockSelector:'.product_container .reminder_item',
	priceSelector:()=>document.querySelector("[itemprop='price']")?document.querySelector("[itemprop='price']").getAttribute("content"):null,
	beforeOpenDialog:()=>{if (document.querySelector('body.blurring'))document.querySelector('body.blurring').classList.remove('blurring');},
	currencySelector:()=>document.querySelector('.ui.currency')&&document.querySelector('.ui.currency').innerText.split('\n')[1].trim(),
	currencySymbolSelector:'.ui.currency .symbole',
	langSelector:()=>{
		const langIso=document.querySelector('html').lang;
		if (langIso)
			return merchantCfg.isoLangToLang(langIso);
	},
	insertAt:'.bw_button_wrapper,.product_container .reminder_item',
	insertMode:'beforebegin',
	voucherSubmitReload:true,
	voucherApplyIf:()=>{
		const login=document.querySelector('a[href*="/account/login/?"]');
		if(!login)return true;
		login.click();
		return false;
	},
	voucherUrl:'https://www.hrkgame.com/randomkeyshop/basket/',
	voucherUrlPattern:'https://www.hrkgame.com/[a-z]+/randomkeyshop/basket/.*',
	voucherInputSelector:'input[name="voucher_code"]',
	voucherSubmitSelector:'#t_add_voucher',
	voucherFailedSelector:()=>document.querySelector('#basketFrom .ui.negative.message'),
	voucherSuccessSelector:()=>document.querySelector('#t_remove_voucher'),
	voucherPriceResultSelector:'.horizontal.statistic .value',
	voucherInitialPriceSelector:'#total_price_big',
	voucherInitialPriceCurrencySelector:()=>merchantCfg.currencySelector(),
	voucherPreviousInsertCallback:()=>{
		const voucher_delete=document.querySelector('#t_remove_voucher');
		if(!voucher_delete)return;
		merchantCfg.voucherTestStat=-1;
		voucher_delete.click();
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="margin-bottom:20px;" class="huge bw_button_wrapper">
		${(offer.priceDiffPercent!==0)?
		`<div class="bw_price_block">
			<div class="price_block">
				<div class="off">${merchantCfg.priceDiffText}</div>
				<div class="price_list">
					<div class="rt_price">${merchantCfg.priceCleaner(offer.merchantPriceText)}</div>
					<div class="price">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
				</div>
			</div>
		</div>`:''}
		<div class="bw_button_block">
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="ui labeled icon green button fluid button" style="padding-left:0!important;padding-right:0!important;">
				<i class="cart arrow down icon"></i>
				<span class="text" style="margin-left:45px;">${(offer.priceDiffPercent!==0)?translates.buyOnAks:translates.buyAtOnAks(merchantCfg.priceCleaner(offer.bestOffer.price))}</span>
			</a>
		</div>
		<div class="bw_button_block">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="ui labeled icon green button fluid button">
				<i class="rocket icon"></i>
				<span class="text">${translates.seeOtherOffers(offersCount)}</span>
			</a>
		</div>
		<div style="clear:both"></div>
	</div>`
};