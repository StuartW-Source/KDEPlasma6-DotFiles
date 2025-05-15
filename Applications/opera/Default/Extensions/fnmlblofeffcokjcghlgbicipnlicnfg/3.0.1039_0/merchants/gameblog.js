function getNormalizedPlatformName(platform)
{
	return {
		PC:'pc',
		PS5:'playstation5',
		PS4:'playstation4',
		PS3:'playstation3',
		XBS:'xboxseriesx',
		X360:'xbox360',
		XB1:'xboxone',
		WiiU:'wiiu',
		'3DS':'3ds',
		SWITCH:'switch',
	}[platform]||null;
}
function createPlatforms(offer,offersCount,seeOnAKSLink,translates)
{
	const productsByPlatform=merchantCfg.getProductsByPlatform(offer.bestOffer,offer.apiResponse.products);
	var str_dom='';
	for(let [platform,product] of Object.entries(productsByPlatform))
	{
		if(merchantCfg.debug)
			console.info('merchantCfg.translates=',merchantCfg);
		str_dom+=`
		<div>
			<a href="${DOMPurify.sanitize(product.bestOffer.url)}"${merchantCfg.open_mode} style="text-decoration:none!important;color:#f47920;display:block;">
				<span style="margin:0px;text-align:right;width:45%;display:inline-block;">${platform}</span>
				<span class="product_price" style="margin:0px;width:45%;display:inline-block;text-align:center;">
					${merchantCfg.priceCleaner(product.bestOffer.price)}
				</span>
			</a>
		</div>`;
	}
	if(str_dom.length<1)
		return merchantCfg.debug?console.warning('No platform to insert'):null;
	document.querySelector('.game-list,.game-social-buttons').insertAdjacentHTML(
		'beforeend',
		`<div style="font-size:15px;background:rgba(0,0,0,0.1);padding:10px 0;" class="akInjected">
			<h2 style="text-align:center;"><a href="${seeOnAKSLink}"${merchantCfg.open_mode} style="text-decoration:none!important;color:white;">${translates.buyOnAks}</a></h2>
			${str_dom}
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				<button style="width:266px;color:white!important;">
					${translates.seeOtherOffers(offersCount)}
				</button>
			</a>
		</div>`
	);
}
const merchantCfg={
	name:'gameblog',
	productNameSelector:'.game-details-title,h3.title a',
	insertAt:'.game-list,.game-social-buttons',
	needRearm:true,
	customInsert:true,
	acceptNoMerchantPriceFound: true,
	template:createPlatforms
};