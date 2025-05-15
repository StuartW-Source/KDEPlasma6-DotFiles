const is_python_test=false;
function extractBestOffer(data)
{
	if(!data||!data.products||data.products.length<1)
		return;
	return (data.products[0].bestOffer&&data.products[0].bestOffer.available)
			?data.products[0].bestOffer
			:data.products[0].offers.find((offer)=>offer.available);
}
function getApiResult(name,callback)
{
	if(!name||name.length<1)
		return debug?debugFun('Empty name (abort)'):undefined;
	merchantCfg.alreadyConverted=false;
	var xhr=new XMLHttpRequest();
	xhr.onreadystatechange=function()
	{
		if(this.readyState!==4||this.status!==200)
			return;
		var response=JSON.parse(xhr.responseText);
		if(response.status==='success')
			callback(response);
	};
	xhr.open('GET',translates.api_url+encodeURIComponent(name),true);
	xhr.send();
}
function getPriceDiffPercent(merchantPriceText,bestOfferPrice)
{
	const merchantPrice=parseFloat(priceSanitize(merchantPriceText));
	if(debug)
		debugFun('getPriceDiffPercent of merchantPrice',merchantPrice,' bestOfferPrice=',bestOfferPrice);
	if(isNaN(merchantPrice)||merchantPrice<=0)
	{
		merchantCfg.merchantPriceText='';
		return 0;
	}
	if(debug)
		console.info('PriceDiffPercent=',Math.ceil(((bestOfferPrice-merchantPrice)/merchantPrice)*100),'%')
	return Math.ceil(((bestOfferPrice-merchantPrice)/merchantPrice)*100);
}
function priceDiffGenerate(merchantCfg)
{
	if(merchantCfg.currencySelector!==undefined&&insertConvertedPrice(merchantCfg))
		return;
	if(debug)
		debugFun('Start without convert insert of ',DOMPurify.sanitize(merchantCfg.bestOffer.price));
	if(merchantCfg.priceNotFound===true)
		merchantCfg.priceDiffPercent=0;
	else
	{
		merchantCfg.priceDiffPercent=getPriceDiffPercent(merchantCfg.merchantPriceText,DOMPurify.sanitize(merchantCfg.bestOffer.price));
		if(isNaN(merchantCfg.priceDiffPercent)||merchantCfg.priceDiffPercent >= 0)
		{
			if(debug)
				debugFun('Fail to generate best price percent: '+merchantCfg.priceDiffPercent+'%');
			if(!merchantCfg.display_always)
				return;
		}
		else
			merchantCfg.priceDiffText=String(merchantCfg.priceDiffPercent)+'%';
	}
	insertOffers(merchantCfg);
}
function insertOffers(merchantCfg, max_retry = 150)
{
	if(Array.isArray(merchantCfg.insertAt))
	{
		for(insertTarget of merchantCfg.insertAt)
		{
			merchantCfg.insertTarget=execOrExtract('insertTarget',insertTarget,false);
			if(merchantCfg.insertTarget)
				break;
		}
	}
	else
		merchantCfg.insertTarget=execOrExtract('insertAt',merchantCfg.insertAt,false);
	if(!merchantCfg.insertTarget)
	{
		return (merchantCfg.waitInsertBlock&&--max_retry>0)
				?setTimeout(()=>insertOffers(merchantCfg, max_retry = 100),100)
				:(debug?debugFun('Fail to find insertTarget at '+merchantCfg.insertAt):undefined);
	}

	if(merchantCfg.customInsert === true)
		merchantCfg.template(
						merchantCfg,
						DOMPurify.sanitize(merchantCfg.apiResponse.products[0].offers.length),
						DOMPurify.sanitize(merchantCfg.apiResponse.products[0].link),
						translates
					);
	else
	{
		const domFrag=merchantCfg.template(
						merchantCfg,
						DOMPurify.sanitize(merchantCfg.apiResponse.products[0].offers.length),
						DOMPurify.sanitize(merchantCfg.apiResponse.products[0].link),
						translates
					);
		if(domFrag && domFrag.length)
		{
			if(merchantCfg.insertMode instanceof Function)
				merchantCfg.insertTarget.insertAdjacentHTML(merchantCfg.insertMode(),domFrag);
			else
				merchantCfg.insertTarget.insertAdjacentHTML(merchantCfg.insertMode,domFrag);
		}
	}
	if(merchantCfg.afterInsert)
		merchantCfg.afterInsert();
}
function drawer(merchantCfg,retry=0)
{
	merchantCfg.priceDiffPercent=0;
	merchantCfg.priceDiffText='0';
	if(merchantCfg.langSelector!==undefined&&!merchantCfg.translatesMapUpdated)
	{
		merchantCfg.langDetected=execOrExtract('Merchant language',merchantCfg.langSelector);
		if(merchantCfg.langDetected)
		{
			merchantCfg.translatesMapUpdated=true;
			updateTranslatesFromLang(merchantCfg.langDetected);
		}
	}
	if(merchantCfg.priceSelector!==undefined)
	{
		merchantCfg.merchantPriceText=execOrExtract('Merchant price',merchantCfg.priceSelector);
		if(merchantCfg.merchantPriceText)
			return priceDiffGenerate(merchantCfg);
		else if(merchantCfg.outOfStockSelector&&execOrExtract('Merchant isOutOfStock',merchantCfg.outOfStockSelector))
		{
			merchantCfg.priceNotFound=true;
			if(merchantCfg.currencySelector===undefined||!insertConvertedPrice(merchantCfg))
				return insertOffers(merchantCfg);
		}
		else if(debug)
			debugFun('merchantCfg.priceSelector failed')
	}
	if(merchantCfg.waitPriceBlock&&retry<30)
	{
		drawerRearm=setTimeout(()=>drawer(merchantCfg,retry+1),300);
		if(!merchantCfg.insertBeforeWaitPriceBlock||merchantCfg.waitPriceBlockSkipped)
			return;
		merchantCfg.waitPriceBlockSkipped=true;
	}
	if(merchantCfg.acceptNoMerchantPriceFound!==false||merchantCfg.display_always==true)
	{
		merchantCfg.priceNotFound=true;
		if(debug)
			debugFun('inserted');
		if(merchantCfg.currencySelector!==undefined&&insertConvertedPrice(merchantCfg))
			return;
		insertOffers(merchantCfg);
	}
	else if(debug)
		debugFun('Not inserted acceptNoMerchantPriceFound!==true')
}
function execOrExtract(what,selector,content=true)
{
	if(selector instanceof Function)
		return selector();
	const element=document.querySelector(selector);
	if(element)
		return content?element.innerText:element;
	if(debug)
		debugFun(what+' not found at '+selector);
}
function priceSanitize(priceText)
{
	priceText = String(priceText).replace(/[^0-9.,]/g,'');
	var firstComaPosition=priceText.indexOf(',');
	const firstPointPosition=priceText.indexOf('.');
	if(firstComaPosition>-1&&firstPointPosition>firstComaPosition)
		priceText=priceText.replace(',','');
	else if(firstPointPosition>-1&&firstComaPosition>firstPointPosition)
		priceText=priceText.replace('.','');
	while (priceText.indexOf(',')>-1&&priceText.indexOf(',')<priceText.length-3)
		priceText=priceText.replace(',','');
	return priceText.replace(',','.');
}
function useAPIResponse(apiResponse)
{
	merchantCfg.bestOffer=extractBestOffer(apiResponse);
	if(debug)
		debugFun('API result for ',merchantCfg.gameNamePurged,': ',apiResponse,'\nExtracted: ',merchantCfg.bestOffer);
	if(!apiResponse||!merchantCfg.bestOffer)
	{
		if(debug)
			debugFun('Empty response from API');
		return;
	}
	merchantCfg.apiResponse=apiResponse;
	drawer(merchantCfg);
}
function init(currency,retry=0)
{
	updateTranslatesFromCurrency(currency);
	merchantCfg.currencySelected=currency;
	merchantCfg.gameNameText=execOrExtract('Game name',merchantCfg.productNameSelector);
	if(!merchantCfg.gameNameText)
	{
		if(merchantCfg.waitProductName&&retry<100)
			searchNameRearm=setTimeout(()=>init(currency,retry+1),300);
		if(debug)
			debugFun('No name found');
		return;
	}
	if(debug)
		debugFun('Name found:',merchantCfg.gameNameText);
	merchantCfg.gameNamePurged=ignoredWords.reduce(
	    (name_tmp,word)=>name_tmp.replace(new RegExp('\\b'+RegExp.escape(word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""))+'\\b','g'),''),
		ignoredChars.reduce(
			(name_tmp,char)=> name_tmp.replace(new RegExp(RegExp.escape(char.toLowerCase()),'g'),''),
			merchantCfg.gameNameText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
		)
	);
	merchantCfg.gameNamePurged=merchantCfg.gameNamePurged.replace(/\s\s+/g,' ').trim();// Replace multiple following spaces by only one
	getApiResult(merchantCfg.gameNamePurged,useAPIResponse);
}
function getProductsById(products)
{
	var dataById={};
	products.forEach((product)=>{
		dataById[product.id]=product;
	});
	return dataById;
}
function getProductsByPlatform(product,otherProducts)
{
	if(Object.keys(otherProducts[0].availablePlatforms).length===0)
		return {[product.platform]:product};
	let productsByPlatform={};
	let dataById=getProductsById(otherProducts);
	for (let platform in otherProducts[0].availablePlatforms)
	{
		const gameId=otherProducts[0].availablePlatforms[platform].gameId;
		if(dataById[gameId])
			productsByPlatform[platform]=dataById[gameId];
		else if (debug)
			console.info('Platform',platform,'not found in productsByPlatform list:',productsByPlatform,'from otherProducts: ',otherProducts);
	}
	return productsByPlatform;
}
function priceCleaner(price)
{
	if(price===0||price===0.0)
		return '00.00';
	price=parseFloat(price);
	if(merchantCfg.displayCurrencyIsoAsSymbol)
	{
		if(merchantCfg.displayCurrencyIsoAsSymbolInSup)
			return '<var style="font-style:normal;">' + String(price.toFixed(2)) + '<sup style="margin-left:2.5px;font-size:19px;font-weight:600;">' + merchantCfg.currencyDetected + '</sup></var>';
		else
			return merchantCfg.currencyDetected + ' ' + String(price.toFixed(2));
	}
	else if(merchantCfg.currencyDetected&&currencyIsoToSymbole.hasOwnProperty(merchantCfg.currencyDetected))
	{
		if(!merchantCfg.currencySymbole)
			merchantCfg.currencySymbole=merchantCfg.isoToCurrencySymbol(merchantCfg.currencyDetected,merchantCfg.merchantPriceText);
		if(debug)
			debugFun('Parse ',price,' with ',currencyIsoToSymbole[merchantCfg.currencyDetected]);
		return currency(price, {
			decimal: currencyIsoToSymbole[merchantCfg.currencyDetected].decimal,
			separator: currencyIsoToSymbole[merchantCfg.currencyDetected].separator,
			pattern: currencyIsoToSymbole[merchantCfg.currencyDetected].pattern,
			symbol: merchantCfg.currencySymbole
		}).format();
	}
	return String(price.toFixed(2)) + ' ' + translates.currencySymbole;
}
function getTextOfHTMLElementWithoutChild(element)
{
	var i=0,text='';
	for(;i<element.childNodes.length;++i)
	{
		if(element.childNodes[i].nodeType===Node.TEXT_NODE)
			text+=element.childNodes[i].textContent;
	}
	return text;
}
function launchVoucherIfCartPage()
{
	if(!merchantCfg.merchantId||!merchantCfg.voucherUrlPattern)
	{
		sendStatToBg(undefined);
		return debug?console.info('No minimal voucherCfg found, auto voucher disabled.'):null;
	}
	if (merchantCfg.voucherTimesCfg)
	{
		for(const cfgName in merchantCfg.voucherTimesCfg)
			voucherTimesCfg[cfgName]=merchantCfg.voucherTimesCfg[cfgName];
	}
	if(!(new RegExp('^'+merchantCfg.voucherUrlPattern)).exec(location.href))
	{
		if(debug)debugFun('voucherUrlPattern ', merchantCfg.voucherUrlPattern, ' refuse url: ', location.href);
		closeVoucherPurpose();
		var tested=localStorage.getItem('voucherAKResumeTested');
		if(!tested)
		{
			tested=localStorage.getItem('voucherAKCache');
			if(!tested)
			{
				localStorage.setItem('voucherAKCache','[]');
				return setTimeout(()=>browser.runtime.sendMessage({
					query:'queryVoucherCode',
					merchantId:merchantCfg.merchantId
				}), 100);
			}
		}
		try
		{
			tested=JSON.parse(tested);
		}
		catch
		{
			return debug?console.info('Fail to parse as JSON value voucherAKResumeTested from localStorage: ',tested):null;
		}
		return sendStatToBg(tested);
	}
	const lastCheck=localStorage.getItem('voucherAKResumeLastRun');
	if(lastCheck&&new Date(parseInt(lastCheck))<new Date()-voucherTimesCfg.is_not_run_from_long_time_delay)
	{
		if(debug)console.info('Clear hold voucher storage in respect of is_not_run_from_long_time_delay');
		clearVoucherStorage();
	}
	if(debug)debugFun('voucherUrlPattern ', merchantCfg.voucherUrlPattern, ' accept url: ', location.href);
	merchantCfg.isVoucherCartPage=true;
	var resume=localStorage.getItem('voucherAKResume');
	if(resume)
	{
		try
		{
			resume = JSON.parse(resume);
		}
		catch
		{
			if(debug)debugFun('Fail to parse resume');
			resume = [];
		}
		if(resume.length||merchantCfg.auto_voucher)
			return receiveVoucher(merchantCfg.merchantId,resume,true);
	}
	setTimeout(()=>browser.runtime.sendMessage({
		query:'queryVoucherCode',
		merchantId:merchantCfg.merchantId
	}), 200);
}
function autoRearm(currency,state)
{
	if(initierId!==null)
		clearInterval(initierId);

	initierId = setInterval(((currency)=>()=>{
		if(window.location.href===savedUrl)
			return;
		savedUrl=window.location.href;
		if(drawerRearm!==null)
			clearInterval(drawerRearm);
		if(searchNameRearm!==null)
			clearInterval(searchNameRearm);
		if(convertToCurrencyHook!==null)
			convertToCurrencyHook=null;
		if(state===1||state===3)
			init(currency);
		else if(debug)
			console.info('Price displaying disabled by user settings.');
		if(state>1)
			launchVoucherIfCartPage();
	})(currency), 1000);
}
var savedUrl=window.location.href,initierId=null,searchNameRearm=null,drawerRearm=null,convertToCurrencyHook=null;
var debug=false,debugFun=console.info,
api_url=(
	'https://www.allkeyshop.com/api/latest/vaks.php'
	+'?action=products'
	+'&showOffers=1'
	+'&showVouchers=false'
	+'&locale=en_GB'
	+'&currency={currency}'
	+'&apiKey=vaks_extension'
	+'&search='
);
RegExp.escape=(s)=>s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
var browser,is_chrome;
if(typeof browser==='undefined')
{
	is_chrome=true;
	browser=chrome;
}
else
	is_chrome=false;
if(merchantCfg)
{
	merchantCfg.debug=debug;
	// Add multi platforms helpers for merchantCfgs templater
	merchantCfg.insertOffers=insertOffers;
	merchantCfg.priceCleaner=priceCleaner;
	merchantCfg.priceSanitize=priceSanitize;
	merchantCfg.execOrExtract=execOrExtract;
	merchantCfg.isoLangToLang=isoLangToLang;
	merchantCfg.getProductsById=getProductsById;
	merchantCfg.isoToCurrencySymbol=isoToCurrencySymbol;
	merchantCfg.currencyIsoToSymbole=currencyIsoToSymbole;
	merchantCfg.getProductsByPlatform=getProductsByPlatform;
	merchantCfg.fullLangToGenericLang=fullLangToGenericLang;
	merchantCfg.getTextOfHTMLElementWithoutChild=getTextOfHTMLElementWithoutChild;
	// Query to ServiceWorker or background (depending of browser) page merchant state and currency set in popup
	browser.runtime.sendMessage({
		query:'queryTabSettings',
		merchantName:merchantCfg.name
	});
	browser.runtime.onMessage.addListener(function(msg,sender,sendResponse)
	{
		if(msg.debug)
		{
			debug=true;
			merchantCfg.debug=debug;
			console.log('Debug enable');
			console.log('Msg:', msg);
		}
		// Receive from SW the state of merchant set in popup
		if(msg.query==='queryTabSettings')
		{
			if(msg.state>0)
			{
				merchantCfg.open_mode=(msg.open_mode)?' target="_blank"':'';
				merchantCfg.display_always=(msg.display_always)?true:false;
				merchantCfg.auto_voucher=is_python_test?true:msg.auto_voucher;
				if(msg.state===1||msg.state===3)
					init(msg.currency);
				else if(debug)
					console.info('Price displaying disabled by user settings msg.state = ', msg.state);
				if(msg.state>1)
					launchVoucherIfCartPage();
				if(msg.state>0&&merchantCfg.needRearm)
					autoRearm(msg.currency,msg.state);
			}
			else if(debug)
				debugFun('SW say that this merchant is not allowed by user cfg');
		}
		else if(msg.query==='queryCurrencyRate')
		{
			if(convertToCurrencyHook!==null)
				convertToCurrencyHook(msg.rate);
			else if(debug)
				debugFun('convertToCurrencyHook lost :\'<');
		}
		else if(msg.query==='queryVoucherCode')
		{
			const formated_vouchers=Array.from(msg.vouchers,v=>({'code':v,'state':null}));
			localStorage.setItem('voucherAKCache',JSON.stringify(formated_vouchers));
			sendStatToBg(formated_vouchers);
			if(msg.vouchers.length<1)
				return (sendResponse)?sendResponse({go:'die'}):undefined;
			const isFromGouvernor=localStorage.getItem('voucherAKPopUpQueryWaiting');
			if(isFromGouvernor)
				localStorage.removeItem('voucherAKPopUpQueryWaiting');
			if(!(new RegExp(merchantCfg.voucherUrlPattern)).exec(location.href))
				return (sendResponse)?sendResponse({go:'die'}):undefined;
			else if(!merchantCfg.auto_voucher&&!isFromGouvernor)
				voucherPurpose(merchantCfg.merchantId,msg.vouchers);
			else
				receiveVoucher(merchantCfg.merchantId,msg.vouchers);
		}
		else if(msg.query==='queryMerchantIdForVoucherSummary')
			browser.runtime.sendMessage({
				query:'getMerchantIdForVoucherSummary',
				merchantId:merchantCfg.merchantId
			});
		else if(msg.query==='voucherRetryAll')
			voucherRetryAll();
		else if(msg.query==='extractMerchantId')
			browser.runtime.sendMessage({
				query:'setLastMerchantId',
				value:merchantCfg.merchantId?merchantCfg.merchantId:-1
			});
		else if(debug)
			debugFun('Message receive from SW: ',msg);
		if(sendResponse)sendResponse({go:'die'});
	});
}