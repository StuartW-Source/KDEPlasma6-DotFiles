const merchantCfg={
	name:'youtube',
	productNameSelector:()=>document.querySelector('ytd-rich-metadata-renderer a[href="/gaming"]')&&document.querySelector('ytd-rich-metadata-renderer #title').innerText,
	insertAt:'ytd-rich-metadata-renderer',
	insertMode:'beforebegin',
	customInsert:true,
	needRearm:true,
	waitProductName:true,
	acceptNoMerchantPriceFound:true,
	langSelector:()=>{
		const langElement=document.querySelector('html');
		if(langElement.hasAttribute('lang'))return merchantCfg.isoLangToLang(langElement.getAttribute('lang').split('-')[0]);
	},
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		document.querySelector('#meta ytd-rich-metadata-renderer #endpoint-link').href=DOMPurify.sanitize(offer.bestOffer.url);
		var jsOfferOpener = (merchantCfg.open_mode.length>0)?`window.open('${DOMPurify.sanitize(offer.bestOffer.url)}')`:`window.location='${DOMPurify.sanitize(offer.bestOffer.url)}';`;
		var jsOffersOpener = (merchantCfg.open_mode.length>0)?`window.open('${seeOnAKSLink}');`:`window.location='${seeOnAKSLink}';`;
		document.querySelector('#meta ytd-rich-metadata-renderer #endpoint-link').setAttribute('onclick','event.preventDefault();event.stopPropagation();'+jsOfferOpener);
		document.querySelector('#meta ytd-rich-metadata-renderer #subtitle').innerText=translates.buyOnAksAt+' '+merchantCfg.priceCleaner(offer.bestOffer.price);
		document.querySelector('#meta ytd-rich-metadata-renderer #subtitle').removeAttribute('hidden');
		const aColor=document.querySelector('html[dark="true"]')?'color:#fff!important;':'color:#000!important;';
		document.querySelector('#meta ytd-rich-metadata-renderer #call-to-action>div').innerHTML=`<a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="${aColor}" onclick="event.preventDefault();event.stopPropagation();${jsOffersOpener}document.querySelector('#meta ytd-rich-metadata-renderer #endpoint-link').removeAttribute('onclick');" class="a-button-text">${translates.seeOtherOffers(offersCount)}</a>`
	}
};