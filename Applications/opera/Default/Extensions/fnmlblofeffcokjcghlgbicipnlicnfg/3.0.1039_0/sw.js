var debug=false;
const is_test=false;
var currency_fetch_retry=0,free_gleam_fetch_retry=0,voucher_fetch_retry=0;
var currency_fetch_timer_id=null,free_gleam_fetch_timer_id=null,voucher_fetch_timer_id=null;
var browser,is_chrome;
var tabs_inited=null;
if(typeof browser==='undefined')
{
	is_chrome=true;
	browser=chrome;
}
else
	is_chrome=false;
function tab_exit()
{
	var garbage;
	for(garbage of document.querySelectorAll('#akVoucherPurposeCSS,#akVoucherPurpose,#akInjected,.akInjected,#dialogAK177,#styleDialogAK177'))
		garbage.remove();
	if(typeof merchantCfg!=='undefined'&&merchantCfg.exit)merchantCfg.exit();
}
async function init_tabs() // Insert or update content_script on concerned tabs already open
{
	if(typeof browser.scripting==='undefined')return debug?console.warn('Scripting API not managed'):undefined;
	if(tabs_inited)return debug?console.warn('Avoid to spam tab_exit'):undefined;
	tabs_inited=setTimeout(()=>tabs_inited=null,10000);
	var delay=10;
	for(const cs of browser.runtime.getManifest().content_scripts)
	{
		for(const tab of await browser.tabs.query({url:cs.matches}).catch((e)=>debug?console.warn('Fail to access to a zombie tab'):null))
		{
			if(is_chrome)
				browser.scripting.executeScript({
					target:{tabId:tab.id},
					func:tab_exit,
				})
				.then(
					()=>null,
					(e)=>debug?console.warn('Fail to access to a zombie tab'):null
				);
			setTimeout(()=>{
					browser.scripting.executeScript({
						target:{tabId:tab.id},
						files:cs.js,
					})
					.then(
						()=>null,
						(e)=>debug?console.warn('Fail to access to a zombie tab'):null
					);
				},
				delay
			);
			delay+=100;
		}
		if(delay%1000===0)
			delay+=3000;
	}
}
self.addEventListener('install',(event)=>{ self.skipWaiting(); });
browser.runtime.onInstalled.addListener((details)=>{
	browser.storage.local.set({['last_merchant_id']:undefined});
	if(details.reason==='install')
		browser.runtime.openOptionsPage();
	else if(details.reason==='update')
	{
		if(debug)
			console.log( 'Extension updated from ', details.previousVersion, ' to ', chrome.runtime.getManifest().version, ' version.');
		/*if(details.previousVersion!==chrome.runtime.getManifest().version)
			browser.tabs.create({active:true,url:'release_notes.html'});
		else if(debug)
			console.log('Shame on u ! This is not a real update !');*/
	}
	browser.storage.sync.get(['debug'],(data)=>{
		if(data['debug'])
			debug=true;
	});
	if(debug)console.info('@@@ onInstalled call init_tabs @@@ ', Math.random());
	init_tabs();
});
browser.runtime.onUpdateAvailable.addListener((details) =>
	browser.runtime.reload()
);
const official_merchants=[
	'2game','allyouplay','amazon','epicgames','gamebillet','gamersgate','gamesforplay','gamesplanet','gog','humblebundle',
	'microsoft','nintendo','origin','playstation','steam','twitch','ubisoft','voidu','xbox','youtube'
];
function parseMerchantState(merchant,value)
{
	if(value===undefined||![true,false,0,1,2,3].includes(value))
	{
		if(debug&&value!==undefined)
			console.error('Unexpected value in stat of marchant ',merchant,': ',value);
		return(official_merchants.includes(merchant.toLowerCase())||is_test)?3:2;
	}
	else if(value===true)
		return 3;
	else if(value===false)
		return 0;
	return value;
}
function settingsHydrate(s)
{
	return {
		currency:s['currency']===undefined?'EUR':s['currency'],
		open_mode:s['open_mode']===undefined?true:s['open_mode'],
		display_always:s['display_always']===undefined?true:s['display_always'],
		auto_voucher:s['auto_voucher']===undefined?false:s['auto_voucher'],
		debug:s['debug']===undefined?false:s['debug'],
	}
}
function sendSettingsToPopup(queries)
{
	const merchants=queries.pop();
	browser.storage.sync.get(
		merchants,
		(data)=>{
			for(merchant of merchants)
				data[merchant]=parseMerchantState(merchant,data[merchant]);
			browser.runtime.sendMessage({
				query:'getMerchantStates',
				states:data
			});
		}
	);
	browser.storage.sync.get(
		['currency','open_mode','display_always','auto_voucher','debug'],
		(data)=>{
			data['query']='getSettings';
			browser.runtime.sendMessage({query:'getSettings',...settingsHydrate(data)});
		}
	);
	sendVoucherStatsToPopup();
}
function queryTabSettings(merchant,tabId)
{
	browser.storage.sync.get(
		[merchant,'currency','open_mode','display_always','auto_voucher','debug'],
		(data)=>browser.tabs.query({active:true,currentWindow:true},(tabs)=>{
			if(debug)
				console.info('Send: ',data,' for ',merchant,);
			if(data['debug'])
				debug=data['debug'];
			browser.tabs.sendMessage(
				tabId,
				{
					query:'queryTabSettings',
					state:parseMerchantState(merchant,data[merchant]),
					...settingsHydrate(data)
				}
			)
		})
	);
}
function queryCurrencyRateRetry(currencyName,tabId,errorMsg)
{
	if(currency_fetch_retry>11)
	{
		currency_fetch_retry=0;
		if(currency_fetch_timer_id!=null)
			clearTimeout(currency_fetch_timer_id);
		return;
	}
	currency_fetch_retry++;
	if(debug)
		console.log('Try '+String(currency_fetch_retry)+' of queryCurrencyRate failed in sw:'+errorMsg);
	setTimeout(()=>queryCurrencyRate(currencyName,tabId),(2**currency_fetch_retry)*1000);
}
function queryCurrencyRate(currencyName,tabId)
{
	browser.storage.sync.get(
		['currency'],
		(data)=>{browser.tabs.query({active:true,currentWindow:true},(tabs)=>{
			const currency=data['currency']===undefined?'EUR':data['currency'];
			fetch('https://www.allkeyshop.com/api/currency_converter.php?q='+currency+'_'+currencyName)
			.then(function(response)
			{
				if(response.ok)
				{
					currency_fetch_retry=0;
					response.text().then((responseText)=>{
					browser.tabs.sendMessage(
						tabId,
						{
							query:'queryCurrencyRate',
							rate:responseText
						}
					)});
				}
				else
					queryCurrencyRateRetry(currencyName,tabId,'HTTP status='+String(response.status));
			})
			.catch(function(error)
			{
				queryCurrencyRateRetry(currencyName,tabId,'Network problem='+error.message);
			});
		})}
	);
}
function sendVoucherStatsToPopup()
{
	browser.storage.local.get(
		['last_merchant_id'],
		(data)=>{
			if(data===undefined||data['last_merchant_id']===undefined||data['last_merchant_id']===-1)
				return browser.runtime.sendMessage({
					query:'getVoucherStats',
					voucher_stats:[]
				});
			if(debug)
				console.info('sendVoucherStatsToPopup for merchant_id=',data['last_merchant_id']);
			browser.storage.local.get(
				['voucher_stats_'+data['last_merchant_id'],'voucher_tab_id'],
				(data2)=>{
					if(debug)
						console.info('sendVoucherStatsToPopup for voucher_stats=',data2['voucher_stats_'+data['last_merchant_id']]===undefined?null:data2['voucher_stats_'+data['last_merchant_id']]);
					browser.runtime.sendMessage({
						query:'getVoucherStats',
						merchant_id:data['last_merchant_id'],
						voucher_stats:data2['voucher_stats_'+data['last_merchant_id']]===undefined?[]:data2['voucher_stats_'+data['last_merchant_id']],
						voucher_tab_id:data2['voucher_tab_id']===undefined?null:data2['voucher_tab_id']
					});
				}
			);
		}
	);
}
function queryFreeGleamRetry(tabId,errorMsg)
{
	if(free_gleam_fetch_retry>2)
	{
		free_gleam_fetch_retry=0;
		if(free_gleam_fetch_timer_id!=null)
			clearTimeout(free_gleam_fetch_timer_id);
		return;
	}
	free_gleam_fetch_retry++;
	if(debug)
		console.log('Try '+String(free_gleam_fetch_retry)+' of queryFreeGleam failed in sw:'+errorMsg);
	setTimeout(()=>queryFreeGleam(tabId),(2**free_gleam_fetch_retry)*1000);
}
function queryFreeGleam(tabId)
{
	browser.tabs.query(
		{active:true,currentWindow:true},
		(tabs)=>{
			fetch(
				'https://www.allkeyshop.com/api/free_gleam.php',
				{
					method: 'POST',
					headers: {'Content-type':'application/x-www-form-urlencoded; charset=UTF-8'},
					body: 's=2fctFyrqp6EDSCaMU6kdCtJM4TB3hvx3eoRHUcRKNSSR'
				}
			)
			.then(function(response)
			{
				if(response.ok)
				{
					free_gleam_fetch_retry=0;
					response.text().then((responseText)=>{
					browser.tabs.sendMessage(
						tabId,
						{
							query:'queryFreeGleam',
							infos:responseText
						}
					)});
				}
				else
					queryFreeGleamRetry(tabId,'HTTP status='+String(response.status));
			})
			.catch(function(error)
			{
				queryFreeGleamRetry(tabId,'Network problem='+error.message);
			});
		}
	)
}
function queryVoucherCodeRetry(merchantId,tabId,errorMsg)
{
	if(voucher_fetch_retry>11)
	{
		voucher_fetch_retry=0;
		if(voucher_fetch_timer_id!=null)
			clearTimeout(voucher_fetch_timer_id);
		return;
	}
	voucher_fetch_retry++;
	if(debug)
		console.log('Try '+String(voucher_fetch_retry)+' of queryVoucherCode failed in sw:'+errorMsg);
	setTimeout(()=>queryVoucherCode(merchantId,tabId),(2**voucher_fetch_retry)*1000);
}
function queryVoucherCode(merchantId,tabId)
{
	browser.tabs.query({active:true,currentWindow:true},(tabs)=>{
		fetch('https://www.allkeyshop.com/api/vouchers.php?m='+merchantId)
		.then(function(response)
		{
			if(response.ok)
			{
				voucher_fetch_retry=0;
				response.text().then((responseText)=>{
					try
					{
						responseText=JSON.parse(responseText);
					}
					catch
					{
						responseText=null;
					}
					browser.tabs.sendMessage(
						tabId,
						{
							query:'queryVoucherCode',
							vouchers:responseText
						}
					)
				});
			}
			else
				queryVoucherCodeRetry(merchantId,tabId,'HTTP status='+String(response.status));
		})
		.catch(function(error)
		{
			queryVoucherCodeRetry(merchantId,tabId,'Network problem='+error.message);
		});
	});
}
function sendVersion()
{
	browser.tabs.query({active:true,currentWindow:true},(tabs)=>{
		const manifest = browser.runtime.getManifest();
		if(debug)
			console.info('Send version number: ',manifest.version);
		browser.tabs.sendMessage(
			tabId,
			{
				query:'getVersion',
				version:manifest.version
			}
		)
	});
}
function iconUpdate(tabId,count)
{
	if(actionObj===undefined)return debug?console.warn('Not action or browserAction capable.'):undefined;
	actionObj.setBadgeText({text:String(count),tabId});
	actionObj.setBadgeBackgroundColor({color:'#000'});
	actionObj.setIcon({path:'../images/icon48.jpg',tabId:tabId});
}
function voucherSubmitCompleted(sender,merchantId,tested)
{
	if(merchantId==undefined)
		return iconUpdate(sender.tab.id,0);
	if(debug)console.info('Save voucher_stats_'+merchantId+':', tested);
	browser.storage.local.set({['voucher_stats_'+merchantId]:tested,'voucher_tab_id':sender.tab.id});
	iconUpdate(sender.tab.id,tested?tested.length:0);
}
// Router
browser.runtime.onMessage.addListener((request,sender,sendResponse)=>{
	if(debug)console.info('Request: ',request,'\nFrom: ',sender);
	if(request.query==='queryTabSettings')
		queryTabSettings(request.merchantName,sender.tab.id);
	else if(request.query==='getSettingsFromPopup')
		sendSettingsToPopup(request.queries);
	else if(request.query==='setMerchantState')
		browser.storage.sync.set({[request.merchantName]:request.value});
	else if(request.query==='setMerchantStates')
		browser.storage.sync.set(request.value);
	else if(request.query==='setCurrency')
		browser.storage.sync.set({currency:request.value});
	else if(request.query==='setOpenMode')
		browser.storage.sync.set({'open_mode':request.value});
	else if(request.query==='setDebug')
	{
		console.log('Debug mode set to: ', request.value?true:false);
		browser.storage.sync.set({'debug':request.value?true:false});
	}
	else if(request.query==='setDisplayAlways')
		browser.storage.sync.set({'display_always':request.value});
	else if(request.query==='setAutoVoucher')
		browser.storage.sync.set({'auto_voucher':request.value});
	else if(request.query==='setLastMerchantId')
		browser.storage.local.set({'last_merchant_id':request.value});
	else if(request.query==='getVersion')
		sendVersion();
	else if(request.query==='getVoucherStats')
		sendVoucherStatsToPopup();
	else if(request.query==='voucherSubmitCompleted')
		voucherSubmitCompleted(sender,request.merchantId,request.value);
	else if(request.query==='voucherRetryAll')
		browser.tabs.sendMessage(parseInt(request.tab_id),{query:'voucherRetryAll'});
	else if(request.query==='queryCurrencyRate')
	{
		if(currency_fetch_timer_id!=null)
			clearTimeout(currency_fetch_timer_id);
		currency_fetch_retry=0;
		queryCurrencyRate(request.currencyName,sender.tab.id);
	}
	else if(request.query==='queryFreeGleam')
	{
		if(free_gleam_fetch_timer_id!=null)
			clearTimeout(free_gleam_fetch_timer_id);
		free_gleam_fetch_retry=0;
		queryFreeGleam(sender.tab.id);
	}
	else if(request.query==='queryVoucherCode')
	{
		if(voucher_fetch_timer_id!=null)
			clearTimeout(voucher_fetch_timer_id);
		voucher_fetch_retry=0;
		queryVoucherCode(request.merchantId,sender.tab.id);
	}
	if(sendResponse)sendResponse({go:'die'});
});
var actionObj=undefined;
if(browser.action!==undefined)
	actionObj=browser.action;
else if(browser.browserAction!==undefined)
	actionObj=browser.browserAction;
else if(debug)
	console.error('No action api found for update icon.');
if(actionObj!==undefined)
{
	browser.tabs.onActivated.addListener(function(info)
	{
		if(debug)
			console.info('activated');
		browser.storage.local.set({'voucher_tab_id':info.tabId});
		try{
			browser.tabs.sendMessage(info.tabId,{query:'extractMerchantId'})
				.then(response=>debug?console.info('Reply:',response):undefined)
				.catch(response=>{
					iconUpdate(info.tabId,0);
					browser.storage.local.set({'last_merchant_id':-1});
					if(debug)
						browser.tabs.query({active:true,currentWindow:true},(tabs)=>{
							console.info('Reply error of extractMerchantId=',response,' \ninfos=',info,' \nurl=',tabs[0].url);
						});
				});
		}catch{}
	});
	browser.tabs.onUpdated.addListener(function(tabId,change,tab)
	{
		if(!tab||!tab.url||!tab.url.startsWith('http'))
			return;
		if(debug)
			console.info('updated change=',change,' \ntab=',tab,' \nurl=',tab.url);
		browser.storage.local.set({'voucher_tab_id':tabId});
		try{
			browser.tabs.sendMessage(tabId,{query:'extractMerchantId'})
				.then(response=>debug?console.info('Reply:',response):undefined)
				.catch(response=>{
					iconUpdate(tabId,0);
					browser.storage.local.set({'last_merchant_id':-1});
					if(debug)
						console.info('Reply error of extractMerchantId:',response,' at url ',tab.url);
				});
		}catch{}
	});
}
else if(debug)
	console.error('actionObj cannot be initialized');