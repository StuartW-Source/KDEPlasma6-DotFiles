const merchantCfg={
	name:'g2a',
	productNameSelector:()=>{const el=document.querySelector('*[data-locator="ppa-summary__title"]');return el?el.innerText.split('(')[0]:null},
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
	priceSelector:()=>{
		const jsonp=merchantCfg.getJsonp();
		if (!jsonp||!jsonp.offers)return;
		if(jsonp.offers.lowPrice)return String(jsonp.offers.lowPrice);
		else if(jsonp.offers.price)return String(jsonp.offers.price);
	},
	outOfStockSelector:'div[data-locator="ppa-sold-out"]',
	currencySelector:()=>{
		const jsonp=merchantCfg.getJsonp();
		if (jsonp&&jsonp.offers&&jsonp.offers.priceCurrency)return jsonp.offers.priceCurrency;
	},
	currencySymbolSelector:()=>{
		if (!merchantCfg.currencyDetected)
			merchantCfg.currencySelector();
		if (merchantCfg.currencyDetected&&!merchantCfg.currencySymbole)
		{
			merchantCfg.currencySymbole=merchantCfg.currencyDetected;
			if (merchantCfg.currencyIsoToSymbole.hasOwnProperty(merchantCfg.currencyDetected))
			{
				var currency_element=document.querySelector('span[data-test-id="currency"]');
				currency_element=currency_element?' class="'+currency_element.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;padding:0;border:0;box-sizing:border-box;font-size:16px;line-height:19px;padding-top:1px;font-weight:bold;"';
				merchantCfg.currencyIsoToSymbole[ merchantCfg.currencyDetected ][ 'pattern' ] = `#<sup${currency_element}>!</sup>`
			}
		}
		return merchantCfg.currencyDetected;
	},
	langSelector:()=>{
		const flag=document.querySelector('.footer-region .flag img');
		if (!flag||!flag.src) return;
		const parts=flag.src.split('/');
		const lang=parts[parts.length-1].split('.')[0];
		return (['englishus','great_britain','australia','canada'].includes(lang))?'english':lang;
	},
	insertAt:'div[data-locator="ppa-payment-info"] > div > div,div[data-locator="ppa-sold-out"]',
	insertMode:'beforebegin',
	acceptNoMerchantPriceFound: true,
	template:(offer,offersCount,seeOnAKSLink,translates)=>{
		var ppp=document.querySelector('div[data-locator="ppa-payment"]'),
			ppp_d=document.querySelector('div[data-locator="ppa-payment"] > div'),
			ppp_d_l=document.querySelector('div[data-locator="ppa-payment"] *[data-locator="ppa-payment-plus__label"]'),
			ppp_d_d=document.querySelector('div[data-locator="ppa-payment"] > div > div'),
			ppp_d_d_price=document.querySelector('div[data-locator="ppa-payment"] > div > div span[data-test-id="price"]'),
			ppp_d_d_discount=document.querySelector('div[data-locator="ppa-payment"] > div > div > div:last-of-type'),
			bt=document.querySelector('button[data-locator="ppa-payment__btn"]'),
			btp=document.querySelector('button[data-locator="ppa-payment-plus__btn"]'),
			ppp_d_d_discount_d=document.querySelector('div[data-locator="ppa-payment"] > div > div > div:last-of-type > div'),
			ppp_d_d_discount_diff=document.querySelector('div[data-locator="ppa-payment"] > div > div > div:last-of-type > span'),
			ppp_d_d_discount_diff_d=document.querySelector('div[data-locator="ppa-payment"] > div > div > div:last-of-type > span > div'),
			ppp_d_d_discount_d_price=document.querySelector('div[data-locator="ppa-payment"] > div > div > div:last-of-type span[data-test-id="price"]'),
			ppp_d_d_discount_d_currency=document.querySelector('div[data-locator="ppa-payment"] > div > div > div:last-of-type  span[data-test-id="currency"]');
		ppp=ppp?' class="'+ppp.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;font-size:14px;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;padding:0;border:0;box-sizing:border-box;display:flex;flex-direction:column;width:100%;margin:0px 0px 15px;"',
		ppp_d=ppp_d?' class="'+ppp_d.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;font-size:14px;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;padding:0;border:0;box-sizing:border-box;"',
		ppp_d_l=ppp_d_l?' class="'+ppp_d_l.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;padding:0;border:0;box-sizing:border-box;display:flex;-webkit-box-align:center;align-items:center;font-size:12px;line-height:14px;margin:0px;text-transform:uppercase;color:var(--zth-color-grey-600,#757575);"',
		ppp_d_d=ppp_d_d?' class="'+ppp_d_d.getAttribute('class')+'" style="display:block!important;"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;font-size:14px;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;padding:0;border:0;box-sizing:border-box;display:flex;"',
		ppp_d_d_price=ppp_d_d_price?' class="'+ppp_d_d_price.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;padding:0;border:0;box-sizing:border-box;font-size:34px;line-height:36px;padding-right:3px;font-weight:bold;"',
		ppp_d_d_discount=ppp_d_d_discount?' class="'+ppp_d_d_discount.getAttribute('class')+'"':' style="display:block;--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;font-size:14px;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;padding:0;border:0;box-sizing:border-box;display:flex;-webkit-box-align:center;align-items:center;position:relative;margin-top:2px;"',
		bt=bt?' class="'+bt.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);margin:0;padding:0;box-sizing:border-box;display:inline-flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;border-radius:3px;font-size:14px;font-family:Roboto,sans-serif;font-weight:bold;line-height:20px;letter-spacing:normal;white-space:nowrap;cursor:pointer;border:1px solid;height:42px;width:100%;padding-left:20px;padding-right:20px;--zth-button-primary-bg-color:var(--zth-color-blue-400,#2F82FB);--zth-button-primary-bg-hover-color:var(--zth-color-blue-500,#0868F3);--zth-button-primary-font-color:#FFFFFF;--zth-button-primary-font-hover-color:#FFFFFF;--zth-button-primary-border-color:var(--zth-color-blue-400,#2F82FB);--zth-button-primary-border-hover-color:var(--zth-color-blue-500,#0868F3);background-color:var(--zth-button-primary-bg-hover-color);color:var(--zth-button-primary-font-hover-color);border-color:var(--zth-button-primary-border-hover-color);"',
		btp=btp?' class="'+btp.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);margin:0;padding:0;box-sizing:border-box;display:inline-flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;border-radius:3px;font-size:14px;font-family:Roboto,sans-serif;font-weight:bold;line-height:20px;letter-spacing:normal;white-space:nowrap;cursor:pointer;border:1px solid;height:42px;width:100%;padding-left:20px;padding-right:20px;--zth-button-primary-bg-color:var(--zth-color-blue-400,#2F82FB);--zth-button-primary-bg-hover-color:var(--zth-color-blue-500,#0868F3);--zth-button-primary-font-color:#FFFFFF;--zth-button-primary-font-hover-color:#FFFFFF;--zth-button-primary-border-color:var(--zth-color-blue-400,#2F82FB);--zth-button-primary-border-hover-color:var(--zth-color-blue-500,#0868F3);--zth-button-primary-colored-bg-color:var(--zth-color-purple-400,#6202EA);--zth-button-primary-colored-bg-hover-color:var(--zth-color-purple-500,#5100C4);--zth-button-primary-colored-font-color:#FFFFFF;--zth-button-primary-colored-font-hover-color:#FFFFFF;--zth-button-primary-colored-border-color:var(--zth-color-purple-400,#6202EA);--zth-button-primary-colored-border-hover-color:var(--zth-color-purple-500,#5100C4);background-color:var(--zth-button-primary-colored-bg-hover-color);color:var(--zth-button-primary-colored-font-hover-color);border-color:var(--zth-button-primary-colored-border-hover-color);opacity:1;"',
		ppp_d_d_discount_d=ppp_d_d_discount_d?' class="'+ppp_d_d_discount_d.getAttribute('class')+'"':' style="text-decoration:line-through;;--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;font-size:14px;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;padding:0;border:0;box-sizing:border-box;position:relative;color:rgb(119,119,119);display:inline-block;"',
		ppp_d_d_discount_diff=ppp_d_d_discount_diff?' class="'+ppp_d_d_discount_diff.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;font-size:14px;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;border:0;box-sizing:border-box;position:relative;padding:0px 0px 0px 5px;"',
		ppp_d_d_discount_diff_d=ppp_d_d_discount_diff_d?' class="'+ppp_d_d_discount_diff_d.getAttribute('class')+'"':' style="padding:0 5px;--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;line-height:normal;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;margin:0;border:0;box-sizing:border-box;padding:0px5px;font-size:11px;height:18px;display:flex;-webkit-box-pack:center;justify-content:center;-webkit-box-align:center;align-items:center;font-weight:bold;color:white;background-color:var(--zth-color-red-400,#DD301C);"',
		ppp_d_d_discount_d_price=ppp_d_d_discount_d_price?' class="'+ppp_d_d_discount_d_price.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;color:rgb(119,119,119);margin:0;padding:0;border:0;box-sizing:border-box;padding-right:1px;font-size:12px;line-height:18px;"',
		ppp_d_d_discount_d_currency=ppp_d_d_discount_d_currency?' class="'+ppp_d_d_discount_d_currency.getAttribute('class')+'"':' style="--swiper-theme-color:#007aff;--swiper-navigation-size:44px;font-family:Roboto,sans-serif;--payment-border-color:var(--zth-color-grey-300,#E0E0E0);text-align:left;color:rgb(119,119,119);margin:0;padding:0;border:0;box-sizing:border-box;font-size:8px;line-height:10px;vertical-align:top;position:relative;top:3px;margin-left:0.2em;"';
		return `
		<div style="width:300px;padding-right:30px;" id="akInjected">
			<div ${ppp}>
				<div ${ppp_d}>
					<div ${ppp_d_d}>
						<span ${ppp_d_d_price}>${merchantCfg.priceCleaner(offer.bestOffer.price)}</span>
						${(merchantCfg.priceDiffText.length>0)?`
						<div ${ppp_d_d_discount}>
							<div ${ppp_d_d_discount_d}>
								<span ${ppp_d_d_discount_d_price}>
									${DOMPurify.sanitize(offer.merchantPriceText)}
								</span>
								${(offer.priceDiffPercent<0)?
								`<span ${ppp_d_d_discount_d_currency}>
									${translates.currencyText}
								</span>`:''}
							</div>
							${(offer.priceDiffPercent<0)?
							`<span ${ppp_d_d_discount_diff}>
								<div ${ppp_d_d_discount_diff_d}>${merchantCfg.priceDiffText}</div>
							</span>`:''}
						</div>`:''}
					</div>
				</div>
			</div>
			<a href="${DOMPurify.sanitize(offer.bestOffer.url)}" style="color:white;text-decoration:none;"${merchantCfg.open_mode}>
				<button ${bt}>${translates.buyOnAks}</button>
			</a>
			<a href="${seeOnAKSLink}" style="display:block;color:white;text-decoration:none;margin:10px 0 20px 0;"${merchantCfg.open_mode}>
				<button ${btp}>
					${translates.seeOtherOffers(offersCount)}
				</button>
			</a>
		</div>`;
	}
};