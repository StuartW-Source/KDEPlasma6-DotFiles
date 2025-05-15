const merchantCfg={
	name:'gamespot',
	productNameSelector:'.wiki-title',
	insertAt:'.reviewObject',
	insertMode:'beforebegin',
	acceptNoMerchantPriceFound: true,
	template:(offer,offersCount,seeOnAKSLink,translates)=>`
	<div id="akInjected">
		<div class="gameObject__description" style="text-align: center">
			<ul class="buy-offer__buynow">
				<a
					href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode}
					class="bg-primary button-large border-round--small"
					style="box-shadow:0 0 2px #000 inset;float:left;width:max-content;"
				>
					${translates.buyOnAksAt} ${merchantCfg.priceCleaner(offer.bestOffer.price)}
				</a>
			</ul>
			<br/>
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>
	</div>`
};