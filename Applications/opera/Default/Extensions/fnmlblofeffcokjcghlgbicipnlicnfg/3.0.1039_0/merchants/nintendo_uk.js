const merchantCfg={
	name:'nintendo',
	productNameSelector:'.gamepage-header-info h1,.product__title',
	waitPriceBlock:true,
	insertBeforeWaitPriceBlock:true,
	acceptNoMerchantPriceFound:true,
	priceSelector:()=>{
		const priceElement=document.querySelector('.product__main .product__price .value');
		if(!priceElement)return;
		return merchantCfg.getTextOfHTMLElementWithoutChild(priceElement);
	},
	insertAt:['.plo-mns-price-box','.plo-digital-price-box,.product__main .product__price','.price-box-item'],
	insertMode:document.querySelector('.product__main .product__price')?'afterend':'beforebegin',
	currencySelector:()=>'GBP',
	currencySymbolSelector:()=>'£',
	langSelector:()=>'english',
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		const hold=document.querySelector('#akInjected');
		if(hold)hold.remove();
		return document.querySelector('.price-box-item,.plo-digital-price-box')?`
		<div id="akInjected" class="plo-digital-price-box">
			<h3 style="margin:0;color:white;font-weight:700;">${translates.allkeyshop}</h3>
			<div class="plm-price plm-price--white">
				<div class="plm-price__main">
					${(offer.priceDiffPercent<0)?merchantCfg.priceDiffText:''} ${merchantCfg.priceCleaner(offer.bestOffer.price)}
				</div>
			</div>
			<div class="purchase-link-content">
				<a href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} class="pla-btn pla-btn--white pla-btn--lg pla-btn--block" style="margin-bottom:5px;">
					${translates.buyOnAks}
				</a>
				<a href="${seeOnAKSLink}"${merchantCfg.open_mode} class="pla-btn pla-btn--white pla-btn--lg pla-btn--block">
					${translates.seeOtherOffers(offersCount)}
				</a>
			</div>
		</div>`:`
		<a class="akInjected" href="${DOMPurify.sanitize(offer.bestOffer.url)}"${merchantCfg.open_mode} style="color:white;display:block;margin-top:10px;max-width:330px;text-align:center;">
			<div class="product__price product__currentprice" style="color:var(--primary);text-align:center;display:block;">${merchantCfg.priceDiffText}</div>
			<div class="add-to-cart btn btn-primary btn--primary" id="akInjected" style="line-height:46px;">
				${translates.buyOnAksAt} ${merchantCfg.priceCleaner(offer.bestOffer.price)}
			</div>
		</a>
		<div class="akInjected" style="max-width:330px;text-align:center;">
			<a href="${seeOnAKSLink}"${merchantCfg.open_mode}>
				${translates.seeOtherOffers(offersCount)}
			</a>
		</div>`;
	}
};