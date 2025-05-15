function getPlatformLabel(platform)
{
	return {
		pc:"PC",
		playstation3:"PS3",
		playstation4:"PS4",
		playstation5:"PS5",
		xboxone:"Xbox One",
		xbox360:"Xbox 360",
		xboxseriesx:"Xbox Series X",
		switch:"Switch",
		"3ds":"3DS",
		wiiu:"WiiU",
	}[platform]||platform;
}
function genElementsForEachPlatform(merchantCfg,offer)
{
	var offerElements='',product;
	const productsByPlatform=merchantCfg.getProductsByPlatform(offer.bestOffer,offer.apiResponse.products);
	for (let platform in productsByPlatform)
	{
		product=productsByPlatform[platform];
		if(!product||!product.bestOffer)
		{
			if(merchantCfg.debug)
				console.info('Skip empty platform (',platform,') structure: ',product);
			continue;
		}
		offerElements+=`<a
							style="font-size:12px;font-weight:bold;color:#ff572e;padding:2px 6px;margin:2px;text-decoration:none!important;white-space:nowrap!important;"
							class="tw-border-radius-medium tw-interactable--alt tw-interactable--border"
							href="${DOMPurify.sanitize(product.bestOffer.url)}"${merchantCfg.open_mode}
						>
							<span style="color:darkgrey;font-weight:900;margin-right:8px;">
								${DOMPurify.sanitize(getPlatformLabel(platform))}
							</span>
							${merchantCfg.priceCleaner(product.bestOffer.price||offer.bestOffer.price)}
						</a>`;
	}
	return offerElements;
}
const merchantCfg={
	name:'twitch',
	needRearm:true,
	waitProductName:true,
	acceptNoMerchantPriceFound:true,
	langSelector:()=>{
		const langElement=document.querySelector('html');
		if(langElement.hasAttribute('lang'))return merchantCfg.isoLangToLang(langElement.getAttribute('lang').split('-')[0]);
	},
	productNameSelector:()=>{
		if (document.querySelector('#akInjected'))
			document.querySelector('#akInjected').remove();
		const nameElement=document.querySelector('a[data-a-target="stream-game-link"],a[data-a-target="video-info-game-boxart-link"] p');
		if (nameElement)
			return nameElement.innerText;
	},
	insertAt:'a[data-a-target="video-info-game-boxart-link"],a[data-a-target="stream-game-link"]',
	insertMode:'afterend',
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div style="display:flex;align-items:center;margin-left:5px;" id="akInjected">
			<div style="display:flex;margin-right:10px;">
				<img alt="Buy on Allkeyshop.com" src="${aksLogoDark}" style="height:14px;"/>
			</div>
			<div style="margin-right:10px;display:flex;flexGrow:1;">
				${genElementsForEachPlatform(merchantCfg,offer)}
				<a
					href="${seeOnAKSLink}"${merchantCfg.open_mode}
					class="tw-border-radius-medium tw-interactable--alt tw-interactable--border"
					style="font-size:12px;font-weight:bold;color:#ff572e;padding:2px 6px;margin:2px;text-decoration:none!important;white-space:nowrap!important;"
				>
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
	</div>`
};