function getPlatformLabel(platform)
{
	return {
		pc:"pc",
		playstation3:"PS3",
		playstation4:"PS4",
		playstation5:"PS5",
		xboxone:"ONE",
		xbox360:"X360",
		xboxseriesx:"xbox-series",
		switch:"Switch",
		"3ds":"3DS",
		wiiu:"WiiU",
	}[platform]||platform;
}
function genElementsForEachPlatform(offer,offersCount,seeOnAKSLink,translates)
{
	offersContainer=document.querySelector('#affli-ligne-blocs');
	var mainOfferElements='',sideOfferElements='';
	const productsByPlatform=merchantCfg.getProductsByPlatform(offer.bestOffer,offer.apiResponse.products);
	for (let platform in productsByPlatform)
	{
		product=productsByPlatform[platform];
		if(!product||!product.bestOffer)
			continue;
		if (offersContainer)
			mainOfferElements+=`
			<div class="col-xs-12 col-sm-6 akInjected">
				<a
					class="xXx affli-ligne-bloc datalayer-push"
					href="${DOMPurify.sanitize(product.bestOffer.url)}"${merchantCfg.open_mode}
				>
					<div class="cell-affli-ligne cell-machine">
						<span class="label-tag label-tag--${getPlatformLabel(product.platform).toLowerCase()}">${getPlatformLabel(product.platform).toUpperCase()}</span>
					</div>
					<div class="cell-affli-ligne cell-boutique">
						<span class="gameAffiliate__logoContainer">
							<span class="gameAffiliate__logo" style="background:url(${aksIconDark});background-size:16px;background-repeat:no-repeat;"></span>
							<span class="gameAffiliate__logoText">Allkeyshop</span>
						</span>
					</div>
					<div class="cell-affli-ligne cell-prix">
						<div class="prix-neuf">${merchantCfg.priceCleaner(product.bestOffer.price||offer.bestOffer.price).replace(' ','')}</div>
					</div>
				</a>
			</div>`;
		sideOfferElements+=`
		<a
			href="${DOMPurify.sanitize(product.bestOffer.url)}"${merchantCfg.open_mode}
			class="gameAffiliate__tr gameAffiliate__tr--affilOffers affiliation-ga-send akInjected"
		>
			<span class="gameAffiliate__td">
				<span class="gameAffiliate__logoContainer">
					<span class="gameAffiliate__logo" style="background:url(${aksIconDark});background-size:16px;background-repeat:no-repeat;"></span>
					<span class="gameAffiliate__logoText">Allkeyshop</span>
				</span>
			</span>
			<span class="gameAffiliate__td">
				${getPlatformLabel(product.platform).toUpperCase()}
			</span>
			<span class="gameAffiliate__td">
				${merchantCfg.priceCleaner(product.bestOffer.price||offer.bestOffer.price).replace(' ','')}
			</span>
		</a>`;
	}
	if (mainOfferElements.length>0)
	{
		mainOfferElements+=`
		<div class="col-xs-12 col-sm-6 akInjected">
			<a
				class="xXx affli-ligne-bloc datalayer-push"
				href="${seeOnAKSLink}"${merchantCfg.open_mode}
			>
				<div class="cell-affli-ligne cell-toutes">
					<span class="affli-plus"></span>
					<span>${translates.seeOtherOffers(offersCount)}</span>
				</div>
			</a>
		</div>
		<br class="akInjected" style="clear:both;">
		<hr class="akInjected" style="border-color:rgba(0,0,0,0.1);width:90%;">`;
		offersContainer.insertAdjacentHTML('afterbegin',mainOfferElements);
	}
	return sideOfferElements;
}
const merchantCfg={
	name:'jeuxvideocom',
	productNameSelector:'.gameHeaderBanner__title',
	insertAt:'.gameAffiliate__table',
	insertMode:'afterbegin',
	acceptNoMerchantPriceFound:true,
	template:(offer,offersCount,seeOnAKSLink,translates)=>genElementsForEachPlatform(offer,offersCount,seeOnAKSLink,translates)+`
	<a
		href="${seeOnAKSLink}"${merchantCfg.open_mode}
		class="gameAffiliate__tr gameAffiliate__tr--affilOffers affiliation-ga-send akInjected"
		style="color:#ff572e;height:25px;text-align:center;"
	>
		${translates.seeOtherOffers(offersCount)}
	</a>`
};