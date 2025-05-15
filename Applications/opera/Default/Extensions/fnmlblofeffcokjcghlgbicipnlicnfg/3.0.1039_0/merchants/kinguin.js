var timerWaitingToSwitch=null;
const merchantCfg={
	merchantId:'47,4777',
	name:'kinguin',
	needRearm:true,
	voucherRearm:true,
	productNameSelector:'.container-fluid > div > div > div:last-child,.container-fluid > div > h1 > span',
	priceSelector:'span[itemprop="priceCurrency"]+span',
	insertAt:'#main-offer-wrapper > div > div',
	insertMode:'beforebegin',
	currencySelector:()=>{
		const currencyElement=document.querySelector('span[itemprop="priceCurrency"]');
		if (currencyElement)
			return currencyElement.getAttribute('content').replace('/','');
	},
	currencySymbolSelector:()=>{
		const priceElement=document.querySelector('span[itemprop="price"]');
		if (!priceElement)return;
		const match=priceElement.innerText.match(/[^ 0-9.,]+/);
		return match&&match.length&&match[0];
	},
	langSelector:()=>{
		const langElem=document.querySelector('svg[data-icon="language"]');
		if(langElem&&langElem.parentNode&&langElem.parentNode.innerText.search(':')==-1)
			return merchantCfg.debug?console.error('Fail to locate lang svg'):undefined;
		return merchantCfg.fullLangToGenericLang(langElem.parentNode.innerText.split(':')[1].trim());
	},
    voucherUrl:'https://www.kinguin.net/new-checkout/review',
	voucherUrlPattern:'https?://www.kinguin.net/new-checkout/review.*',
	voucherInputSelector:'#c-page__content input[placeholder]',
	voucherPreviousSubmitCallback:(()=>{
		if(document.querySelector('#discount-error'))
			document.querySelector('#discount-error').setAttribute('id',false);
		document.querySelector('#c-page__content input[placeholder]').dispatchEvent(new Event('input', { bubbles: true}));
	}).bind(window),
	voucherPreviousInsertCallback:()=>{
		if(document.querySelector(merchantCfg.voucherSubmitSelector))
			document.querySelector(merchantCfg.voucherSubmitSelector).click();
	},
	voucherTimesCfg:{
		voucherTimeBetween:2500
	},
	voucherSubmitSelector:'#c-page__content input[placeholder] + button',
	voucherFailedSelector:'#discount-error',
	voucherSuccessSelector:()=>document.querySelector('body').innerText.indexOf(merchantCfg.voucher)!=-1,
	voucherPriceResultSelector:'div>span:last-of-type>span>span[itemprop="priceCurrency"]+span[content]',
	voucherInitialPriceSelector:'.row.c-checkout span[content]:not([itemprop="priceCurrency"])',
	voucherInitialPriceCurrencySelector:()=>{
		const curr_el=document.querySelector('.row.c-checkout span[content]');
		return curr_el?curr_el.getAttribute('content'):null;
	},
	themeSwitched:()=>{
		if(document.querySelector('#akInjected'))
			document.querySelector('#akInjected').remove();
		if(timerWaitingToSwitch!==null)
		{
			clearTimeout(timerWaitingToSwitch);
			timerWaitingToSwitch = null;
		}
		timerWaitingToSwitch=setTimeout(()=>{
			timerWaitingToSwitch = null;
			merchantCfg.drawRearmCount = 0;
			insertOffers(merchantCfg);
		}, 300);
	},
	exit:()=>{
		if(timerWaitingToSwitch)clearTimeout(timerWaitingToSwitch);
		document.querySelector('svg[data-icon="palette"]').parentNode.removeEventListener('click',merchantCfg.themeSwitched);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		if(document.querySelector('#akInjected'))
			return merchantCfg.debug?console.info('no need to rerender'):null;
		const nativeBT=document.querySelector('div[role="presentation"][style^="display: flex;"] button');
		const nativeSubBT=document.querySelector('div[role="presentation"]:not([style^="display: flex;"]) button');
		const cls=(nativeBT)?nativeBT.getAttribute('class'):'';
		const colorMode='color:'+(document.querySelector('.c-header--dark')?'white':'rgb(73, 73, 73)')+';';
		var clsSubBt=(nativeSubBT)?nativeSubBT.getAttribute('class'):'';
		const themeSwitchBt=document.querySelector('svg[data-icon="palette"]');
		if(themeSwitchBt&&themeSwitchBt.parentNode)
			document.querySelector('svg[data-icon="palette"]').parentNode.addEventListener('click',merchantCfg.themeSwitched);
		return `
		<div id="akInjected" style="margin:auto">
			<h2 style="margin-bottom:0!important;padding-bottom:0;text-align:center;width:100%;margin-top:25px;${colorMode}">
				${(offer.priceDiffPercent<0)?translates.buyOnAksAt+' '+merchantCfg.priceDiffText:translates.buyOnAks}
			</h2>
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="${cls}" style="margin-bottom:1px!important;">
				${translates.buy}
				<span style="text-decoration:line-through;font-size:1.8rem;margin:0rem 2rem 0.5rem 2rem">
					${(offer.merchantPriceText!='0')?DOMPurify.sanitize(offer.merchantPriceText):''}
				</span>
				<span style="font-size:2.8rem;">${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
			</a>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="margin:20px auto 15px auto;cursor:pointer;display:block;text-decoration:underline;${colorMode}" class="${clsSubBt}">
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>`;
	},
	drawRearmCount:0,
	afterInsert:()=>{
		if(merchantCfg.drawRearmCount++<5)
			setTimeout(()=>{
					if(document.querySelector('#akInjected'))
						document.querySelector('#akInjected').remove();
					insertOffers(merchantCfg);
				},
				1000
			);
	}
};