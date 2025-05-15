
// https://currency.js.org/#options
const currencyIsoToSymbole={
'EUR':{
	symboles:['€'],
	decimal:',',
	separator:' ',
	pattern: `# !`, // # = amount, ! = currency symbol
},
'USD':{
	symboles:['$'],
	decimal:'.',
	separator:',',
	pattern: `!#`,
},
'GBP':{
	symboles:['£'],
	decimal:',',
	separator:'.',
	pattern: `!#`,
},
'AED':{
	symboles:['د.إ','Dhs','DH','درهم إماراتي'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'AUD':{
	symboles:['AUD$','AU$','$AU','$A'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'ARS':{
	symboles:['ARS$','$ARS','$','pesos','peso'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'AZN':{
	symboles:['₼'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'BAM':{
	symboles:['KM','МК','MK'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'BGN':{
	symboles:['лв.','лева'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'BRL':{
	symboles:['R$'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'BYN':{
	symboles:['Br'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'CAD':{
	symboles:['CAD$','CAN','$CA','$C'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'CHF':{
	symboles:['franc','CH','fr.','fr'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'CLP':{
	symboles:['$','pesos','peso'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'CNY':{
	symboles:['¥'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'COP':{
	symboles:['$','pesos','peso'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'CZK':{
	symboles:['Kč'],
	decimal:',',
	separator:' ',
	pattern: `# !`,
},
'DKK':{
	symboles:['kr.'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'EGP':{
	symboles:['الجنيه المصرى','LE','£E','E£'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'GEL':{
	symboles:['₾','ლარი'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'HKD':{
	symboles:['HK$'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'HRK':{
	symboles:['kn'],
	decimal:',',
	separator:'.',
	pattern: `! #`,
},
'HUF':{
	symboles:['Ft'],
	decimal:'.',
	separator:' ',
	pattern: `# !`,
},
'ILS':{
	symboles:['₪','שקל חדש','ש"ח','shekalim'],
	decimal:'.',
	separator:'',
	pattern: `! #`,
},
'INR':{
	symboles:['rupee','रुपया'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'JOD':{
	symboles:['دينار أردني','JO','JD'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'JPY':{
	symboles:['¥','円','圓'],
	decimal:'.',
	separator:',',
	pattern: `! #`,
},
'KWD':{
	symboles:['KWD'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'KRW':{
	symboles:['₩','￦','원','圓'],
	decimal:'.',
	separator:'',
	pattern: `! #`,
},
'MXN':{
	symboles:['$','Peso'],
	decimal:',',
	separator:'',
	pattern: `! #`,
},
'NOK':{
	symboles:['kr'],
	decimal:'.',
	separator:'',
	pattern: `!#`,
},
'NZD':{
	symboles:['$NZ','tāra'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'PAB':{
	symboles:['฿','B/.'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'PEN':{
	symboles:['S/','soles','sol'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'PHP':{
	symboles:['₱','PhP',' P'],
	decimal:'.',
	separator:'',
	pattern: `! #`,
},
'PLN':{
	symboles:['złoty','zl','zł'],
	decimal:'.',
	separator:'',
	pattern: `!#`,
},
'RON':{
	symboles:['lei','leu'],
	decimal:'.',
	separator:'',
	pattern: `#!`,
},
'RUB':{
	symboles:['₽','рубль', 'p.'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'SEK':{
	symboles:['kr'],
	decimal:'.',
	separator:'',
	pattern: `!#`,
},
'SGD':{
	symboles:['S$'],
	decimal:'.',
	separator:'',
	pattern: `!#`,
},
'THB':{
	symboles:['฿','บาท'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'TRY':{
	symboles:['₺','lira'],
	decimal:'.',
	separator:'',
	pattern: `!#`,
},
'TWD':{
	symboles:['NT$','元'],
	decimal:'.',
	separator:'',
	pattern: `! #`,
},
'UAH':{
	symboles:['₴','грн'],
	decimal:'.',
	separator:'',
	pattern: `!#`,
},
'SAR':{
	symboles:['ريال سعودي','riyāl saʿūdī'],
	decimal:'.',
	separator:'',
	pattern: `! #`,
},
'VND':{
	symboles:['₫','đồng','Đồng Việt Nam'],
	decimal:'.',
	separator:'',
	pattern: `# !`,
},
'ZAR':{
	symboles:['rands','rand','R'],
	decimal:'.',
	separator:'',
	pattern: `! #`,
},
};
function isoToCurrencySymbol(iso,merchantText=null)
{
	if(!currencyIsoToSymbole.hasOwnProperty(iso))return;
	if(merchantText&&currencyIsoToSymbole[iso].symboles.length>1)
	{
		for(symbol of currencyIsoToSymbole[iso].symboles)
		{
			if(merchantText.includes(symbol))
			{
				if(debug)
					debugFun('Match for currency symbol ', symbol);
				return symbol;
			}
			else(debug)
				debugFun('Not match for currency symbol ', symbol, ' in ', merchantText);
		}
	}
	return currencyIsoToSymbole[iso].symboles[0];
}
const ignoredChars=[':','™','-','(',')','[',']',',','©','®'];
var platforms=[
	'PlayStation 4','PlayStation4','PlayStation5','PlayStation 5',
	'pc','psn','ps vita','ps4 e ps5','ps4 et Ps5','ps4 and ps5','ps3','ps4','ps5',
	'xbox series x','xbox live','xbox one','xbox 360','xbox',
	'nintendo switch','switch',
];
const adjectives=['pour','for','por','per','für','voor'];
var platforms_extended=[];
for(platform of platforms)
{
	for(adjectif of adjectives)
		platforms_extended.push(adjectif+' '+platform);
}
const ignoredWords=[
	'buy','compra','kup','kaufen','cd key','bind retail','retail key','oem key','retail – download link',' – online activation','key','clé ',
	' \/ windows 10','green gift','gift','\/ V',
	'bethesda','rocksta','activision ng','activision',
	'precommande de','précommande','pre-order','preorder','pre order',
	'édition complète','complete pack','Special edition',
	'ultimate bundle','complete edition','definitive edition','ultimate edition','deluxe','edição completa','édition standard','standard edition','gold edition','game of the Year','anniversary edition',
	'edition','edizione','add-on','Importación',
	'gog','steam row','steam ww','steam','epic games','microsoft','battle.net','uplay','origin','/ biohazard 4',
	'global','europe','eu','north america','us/ca','us','asia','emea','ru/cis','uk','germany',
	'france','francia','francesa',
	'spain','italy','eng','numérique de luxe',
	...platforms_extended,
	...platforms
];
platforms_extended=platforms=null;
const translatesMapByCurrency={
	'EUR':{
		allkeyshop:'AllKeyShop',
		currencySymbole:'€',
		currencyText:'EUR',
	},
	'USD':{
		allkeyshop: 'CheapDigitalDownload',
		currencySymbole:'$',
		currencyText:'USD',
	},
	'CAD':{
		allkeyshop: 'CheapDigitalDownload',
		currencySymbole:'$',
		currencyText:'CAD',
	},
	'GBP':{
		allkeyshop:'AllKeyShop',
		currencySymbole:'£',
		currencyText:'GBP',
	},
	'RUB':{
		allkeyshop:'AllKeyShop',
		currencySymbole:'₱',
		currencyText:'RUB',
	},
	'BRL':{
		allkeyshop:'AllKeyShop',
		currencySymbole:'R$',
		currencyText:'BRL',
	},
	'PHP':{
		allkeyshop:'AllKeyShop',
		currencyText:'PHP',
	},
};
const translatesMapByLang={
	'dutch':{
		buy:'Koop',
		buyOnAksAt:'Koop op Allkeyshop.com voor',
		buyOnAks:'Koop op Allkeyshop',
		buyAtOnAks:(price)=>`Koop voor ${price} op Allkeyshop`,
		seeOffer:'Zie het aanbod',
		seeOtherOffers:(offersCount)=>`Bekijk ${offersCount} andere aanbiedingen`,
	},
	'english':{
		buy:'buy',
		buyOnAksAt:'Buy on Allkeyshop.com at',
		buyOnAks:'Buy on Allkeyshop',
		buyAtOnAks:(price)=>`Buy at ${price} on Allkeyshop`,
		seeOffer:'See the offer',
		seeOtherOffers:(offersCount)=>`See ${offersCount} other offers`,
	},
	'filipino':{
		buy:'Bumili ng',
		buyOnAksAt:'Bumili sa Allkeyshop.com sa',
		buyOnAks:'Bumili sa Allkeyshop',
		buyAtOnAks:(price)=>`Bumili ng ${price} sa Allkeyshop`,
		seeOffer:'Tingnan ang alok',
		seeOtherOffers:(offersCount)=>`Tingnan ang ${offersCount} iba pang mga alok`,
	},
	'french':{
		buy:'Acheter',
		buyOnAksAt:'Acheter via Allkeyshop.com à',
		buyOnAks:'Acheter via Allkeyshop',
		buyAtOnAks:(price)=>`Acheter à ${price} sur Allkeyshop`,
		seeOffer:'Voir l\'offre',
		seeOtherOffers:(offersCount)=>`Voir ${offersCount} autres offres`,
	},
	'german':{
		buy:'Kaufen Sie',
		buyOnAksAt:'Kaufen Sie bei Allkeyshop.com unter',
		buyOnAks:'Kaufen Sie auf Allkeyshop',
		buyAtOnAks:(price)=>`Kaufen Sie bei Allkeyshop für ${price}`,
		seeOffer:'Siehe das Angebot',
		seeOtherOffers:(offersCount)=>`Siehe ${offersCount} andere Angebote`,
	},
	'italian':{
		buy:'Acquista',
		buyOnAksAt:'Acquista su Allkeyshop.com a',
		buyOnAks:'Acquista su Allkeyshop',
		buyAtOnAks:(price)=>`Acquista a ${price} su Allkeyshop`,
		seeOffer:'Vedi l\'offerta',
		seeOtherOffers:(offersCount)=>`Vedi altre ${offersCount} offerte`,
	},
	'portuguese':{
		buy:'Compre',
		buyOnAksAt:'compre no Allkeyshop.com por',
		buyOnAks:'compre no Allkeyshop',
		buyAtOnAks:(price)=>`compre por ${price} no Allkeyshop`,
		seeOffer:'Veja a oferta',
		seeOtherOffers:(offersCount)=>`Veja ${offersCount} outras ofertas`,
	},
	'polski':{
		buy:'Kupić',
		buyOnAksAt:'Kup na Allkeyshop za',
		buyOnAks:'Kup na Allkeyshop',
		buyAtOnAks:(price)=>`Kup za ${price} na Allkeyshop`,
		seeOffer:'Zobacz ofertę',
		seeOtherOffers:(offersCount)=>`Zobacz ${offersCount} innych ofert`,
	},
	'russian':{
		buy:'Купить',
		buyOnAksAt:'Купить на Allkeyshop.com за',
		buyOnAks:'купить в Allkeyshop',
		buyAtOnAks:(price)=>`Купить по ${price} на Allkeyshop`,
		seeOffer:'Посмотреть предложение',
		seeOtherOffers:(offersCount)=>`Посмотреть ${offersCount} других предложений`,
	},
	'spanish':{
		buy:'Comprar',
		buyOnAksAt:'Compra en Allkeyshop.com en',
		buyOnAks:'Compra en Allkeyshop',
		buyAtOnAks:(price)=>`Compra a ${price} en Allkeyshop`,
		seeOffer:'Ve la oferta',
		seeOtherOffers:(offersCount)=>`Ve ${offersCount} ofertas más`,
	},
};
function isoLangToLang(isoLang)
{
	isoLang=isoLang.toUpperCase();
	if (['DEU','DE'].includes(isoLang))
		return 'german';
	if (['BRA','BR','PRT','PT'].includes(isoLang))
		return 'portuguese';
	if (['ESP','ES'].includes(isoLang))
		return 'spanish';
	if (['BEL','BE','CHE','CH','FRA','FR'].includes(isoLang))
		return 'french';
	if (['ITA','IT'].includes(isoLang))
		return 'italian';
	if (['NLD','NL'].includes(isoLang))
		return 'dutch';
	if (['PHL','PH'].includes(isoLang))
		return 'filipino';
	if (['POL','PL'].includes(isoLang))
		return 'polski';
	if (['RUS','RU','BLR','BY'].includes(isoLang))
		return 'russian';
	return 'english';
}
function fullLangToGenericLang(isoLang)
{
	isoLang=isoLang.toLowerCase();
	if (['dutch'].includes(isoLang))
		return 'dutch';
	if (['español'].includes(isoLang))
		return 'spanish';
	if (['filipino'].includes(isoLang))
		return 'filipino';
	if (['german','deutsch'].includes(isoLang))
		return 'german';
	if (['français'].includes(isoLang))
		return 'french';
	if (['italiano'].includes(isoLang))
		return 'italian';
	if (['polski'].includes(isoLang))
		return 'polski';
	if (['português'].includes(isoLang))
		return 'portuguese';
	if (['russian'].includes(isoLang))
		return 'russian';
	return 'english';
}
var translates={
	...{
		allkeyshop:'AllKeyShop',
		currencySymbole:'€',
		currencyText:'EUR',
	},
	...translatesMapByLang['english']
};
function convertToCurrency(merchantCfg,callback)
{
	convertToCurrencyHook=((merchantCfg,callback)=>(reply)=>{
		if (reply===undefined||isNaN(reply))
			return debug&&debugFun('Failed to obtain currency rate for: ',merchantCfg.currencyDetected);
		if (debug)
			debugFun('Obtain rate convertion for ',merchantCfg.currencyDetected,' = ',reply);
		if (!merchantCfg.alreadyConverted)
		{
			merchantCfg.alreadyConverted=true;
			merchantCfg.bestOffer.price=(merchantCfg.bestOffer.price*parseFloat(reply)).toFixed(2);
		}
		if(merchantCfg.priceSelector!==undefined&&(merchantCfg.merchantPriceText||(!merchantCfg.acceptNoMerchantPriceFound&&merchantCfg.display_always)))
		{
			merchantCfg.priceDiffPercent=getPriceDiffPercent(merchantCfg.merchantPriceText,merchantCfg.bestOffer.price);
			if (!isNaN(merchantCfg.priceDiffPercent)&&merchantCfg.priceDiffPercent<0)
				merchantCfg.priceDiffText=String(merchantCfg.priceDiffPercent)+'%';
			if (merchantCfg.priceNotFound!==true&&(isNaN(merchantCfg.priceDiffPercent)||merchantCfg.priceDiffPercent>=0))
			{
				merchantCfg.priceDiffText='-0%';
				if(debug)
					debugFun(
						'Failed to obtain best price after convertion, best price = ',merchantCfg.bestOffer.price,
						', merchantPrice = ',merchantCfg.merchantPriceText
					);
				if(!merchantCfg.display_always)
					return;
			}
			if (debug)
				debugFun('Obtain best price after convertion, best price = ',merchantCfg.bestOffer.price);
		}
		callback(merchantCfg);
	})(merchantCfg,callback);
	browser.runtime.sendMessage({
		query:'queryCurrencyRate',
		currencyName:merchantCfg.currencyDetected
	});
}
function insertConvertedPrice(merchantCfg)
{
	merchantCfg.currencyDetected=execOrExtract('Merchant currency tag',merchantCfg.currencySelector);
	if(merchantCfg.currencySymbolSelector)
		merchantCfg.currencySymbolDetected=execOrExtract('Merchant currency symbol',merchantCfg.currencySymbolSelector);
	else
		merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
	if (merchantCfg.currencyDetected!=null&&merchantCfg.currencyDetected.toUpperCase()!=merchantCfg.currencySelected)
	{
		if (debug)
			debugFun(
				'Start convert ',merchantCfg.currencySelected,
				' to ',merchantCfg.currencyDetected.toUpperCase()
			);
		if (updateTranslatesFromCurrency(merchantCfg.currencyDetected)===false)
			translates.currencyText=merchantCfg.currencyDetected;
		if (merchantCfg.currencySymbolDetected!=null)
			translates.currencySymbole=merchantCfg.currencySymbolDetected;
		convertToCurrency(merchantCfg,insertOffers);
		return true;
	}
	return false;
}
function updateTranslatesFromCurrency(currency)
{
	if (translatesMapByCurrency[currency] === undefined)
		return false;
	for (const [key,value] of Object.entries(translatesMapByCurrency[currency]))
		translates[key]=value;
	translates['api_url']=api_url.replace('{currency}',translatesMapByCurrency[currency]['currencyText'].toLowerCase());
	if (currency==='USD')
		translates['api_url']=translates['api_url'].replace('locale=en_GB','locale=en_US')
	return true;
}
function updateTranslatesFromLang(lang)
{
	if (debug)
		debugFun('updateTranslatesFromLang ',lang);
	if (translatesMapByLang[lang]===undefined)
	{
		if (debug)
			debugFun('updateTranslatesFromLang ',lang, ' not found');
		return false;
	}
	for (const [key,value] of Object.entries(translatesMapByLang[lang]))
		translates[key]=value;
	return true;
}