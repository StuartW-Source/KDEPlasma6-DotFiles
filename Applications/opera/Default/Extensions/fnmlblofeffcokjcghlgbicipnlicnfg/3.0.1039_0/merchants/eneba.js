const merchantCfg={
	merchantId:272,
	name:'eneba',
	needRearm:true,
	productNameSelector:'main h1',
	priceSelector:()=>document.querySelector('meta[property="product:price:amount"]').getAttribute('content'),
	insertMode:'afterbegin',
	insertAt:'ul + div > div > div:nth-of-type(4)',
	currencySelector:()=> document.querySelector('meta[property="product:price:currency"]').getAttribute('content'),
	currencySymbolSelector:()=>{
		if(!merchantCfg.currencyDetected)merchantCfg.currencyDetected=merchantCfg.currencySelector();
		return merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected);
	},
	langSelector:()=>{
		return merchantCfg.isoLangToLang(document.querySelector('html').getAttribute('lang').split('-')[0]);
	},
	voucherUrl:'https://www.eneba.com/checkout/payment',
	voucherUrlPattern:'https?://www.eneba.com/checkout/payment.*',
	voucherInputSelector:'#discountCode',
	voucherPreviousInsertCallback:()=>{
		if(document.querySelector('button.link'))
			document.querySelector('button.link').click();
		const voucher_amount=document.querySelector('form>div>div>div:nth-of-type(2)>div:last-of-type span');
		if(voucher_amount)
			voucher_amount.innerText='';
	},
	voucherApplyIf:()=>{
		var date=new Date();
		date.setTime(date.getTime()+31536000000);
		document.cookie='af_id=allkeyshop; expires='+date.toUTCString();
		return true;
	},
	voucherSubmitSelector:'.ReactModalPortal button[type="submit"]',
	voucherFailedSelector:()=>document.querySelector('body').innerText.indexOf('Code not working')!=-1,
	voucherSuccessSelector:()=>{
		const voucher_amount=document.querySelector('form>div>div>div:nth-of-type(2)>div:last-of-type span');
		return (voucher_amount&&voucher_amount.innerText.length>0)?true:false;
	},
	voucherPriceResultSelector:'form>div>div>div>span',
	voucherInitialPriceSelector:()=>{
		const final_price=document.querySelector(merchantCfg.voucherPriceResultSelector);
		if(!final_price)
			return merchantCfg.debug?console.error('Fail to found final_price'):null;
		const voucher_amount=document.querySelector('form>div>div>div:nth-of-type(2)>div:last-of-type span');
		if(!voucher_amount)
		{
			if(merchantCfg.debug)
				console.error('Fail to found voucher_amount');
			return final_price.innerText;
		}
		try{return parseFloat(priceSanitize(final_price.innerText))+parseFloat(priceSanitize(voucher_amount.innerText));}
		catch{if(merchantCfg.debug)console.error('Fail to analyze voucher prices \nvoucher_amount=',voucher_amount,' \nfinal_pricevoucher_amount=',final_price);}
	},
	voucherInitialPriceCurrencySelector:'#app main button span:last-of-type',
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected" style="margin-bottom:30px;box-shadow:0 3px 9px 0 rgb(0 0 0 / 26%);padding:20px 20px 15px;background:#5825CC;">
		<div style="display:flex;">
			<div style="font-weight:700;font-size:5rem;line-height:1;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</div>
			<div style="margin-left:5px;">
				${(offer.priceDiffPercent<0)?`<div style="font-weight:700;font-size:1.2rem;line-height:1;color:#7ED321;margin-bottom:5px;">Save ${merchantCfg.priceDiffText}</div>`:''}
				<div style="color:#ADA1C8;font-weight:500;font-size:2.4rem;line-height:1;text-decoration:line-through;">${DOMPurify.sanitize(offer.merchantPriceText)}</div>
			</div>
		</div>
		<div><a style="display:block;padding:10px;width:100%;background-color:#FAD318;color:#000;text-align:center;font-weight:700;font-size:1.5rem;line-height:1.5rem;margin-top:10px;" href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}>${translates.buyOnAks}</a></div>
		<div style="text-align:center;margin-top:10px;"><a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="font-size:1.6rem;">${translates.seeOtherOffers(offersCount)}</a></div>
	</div>`
};