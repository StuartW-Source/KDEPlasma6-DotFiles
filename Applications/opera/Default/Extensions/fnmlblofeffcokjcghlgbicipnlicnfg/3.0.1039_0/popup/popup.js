var debug=false;// Enable verbosity in console
var submitBugStatus=false,globalMerchantChange=false;
if (typeof browser==='undefined')
	var browser=chrome;
if(typeof HTMLDialogElement!=='function')
	document.querySelector('#justAMessageDialog').setAttribute('class','polyfilled');
document.querySelector('#justAMessageDialog button[value="cancel"]').addEventListener('click',()=>{
	document.querySelector('#justAMessageDialog').removeAttribute('open');window.close();
});
if(localStorage.getItem('debug'))
	debug=true;
// Query to save values on each change to the service worker
function updateMerchantState(e)
{
	if(globalMerchantChange)return;
	browser.runtime.sendMessage({
		query:'setMerchantState',
		merchantName:e.target.name.slice(0, -1),
		value:(e.target.nextElementSibling.tagName.toUpperCase()==='INPUT')
				? (e.target.checked?1:0)+(e.target.nextElementSibling.checked?2:0)
				: (e.target.checked?2:0)+(e.target.previousElementSibling.checked?1:0)
	});
	updateOfficialAndkeyShopsGlobalTogglers()
}
function updateCurrency(e)
{
	browser.runtime.sendMessage({
		query:'setCurrency',
		value:e.target.value
	});
}
function updateOpenMode(e)
{
	browser.runtime.sendMessage({
		query:'setOpenMode',
		value:e.target.checked
	});
}
function updateDisplayAlways(e)
{
	browser.runtime.sendMessage({
		query:'setDisplayAlways',
		value:e.target.checked
	});
}
function updateAutoVoucher(e)
{
	browser.runtime.sendMessage({
		query:'setAutoVoucher',
		value:e.target.checked
	});
}
function toggleGlobalShopStates(value,container)
{
	var merchants={};
	const v=value?3:0;
	globalMerchantChange=true;
	for(input of container.querySelectorAll('input'+(value?':not(:checked)':':checked')))
	{
		input.checked=value;
		merchants[input.name.slice(0, -1)]=v;
	}
	globalMerchantChange=false;
	if(debug)console.info('Change stat wih global button for merchants: ',merchants);
	browser.runtime.sendMessage({
		query:'setMerchantStates',
		value:merchants
	});
}
function updateOfficialAndkeyShopsGlobalTogglers()
{
	const offi=document.querySelector('#official_merchants'),keys_shop=document.querySelector('#key_merchants');

	if(offi.hasAttribute('disabled'))offi.removeAttribute('disabled');
	if(keys_shop.hasAttribute('disabled'))keys_shop.removeAttribute('disabled');

	offi.checked=(!document.querySelector('#listContainerOfficial input:not(:checked)'))?true:false;

	keys_shop.checked=(!document.querySelector('#listContainerKeyShop input:not(:checked)'))?true:false;
}
function getMerchantStates(msg)
{
	for([merchant,state] of Object.entries(msg.states))
	{
		let input1=document.querySelector('input[name="'+merchant+'1"]'),
			input2=document.querySelector('input[name="'+merchant+'2"]');
		if(!input1||!input2)
			return debug?console.error('Fail to find ',merchant,' checkbox'):undefined;
		if(state===1)
		{
			input1.checked=true;
			input2.checked=false;
		}
		else if(state===2)
		{
			input1.checked=false;
			input2.checked=true;
		}
		else if(state===3)
		{
			input1.checked=true;
			input2.checked=true;
		}
		else
		{
			if(debug&&state!==0)
				console.error('Receive unexpected state value ',state,' for merchant ', merchant);
			input1.checked=false;
			input2.checked=false;
		}
		input1.addEventListener('change',updateMerchantState);
		input2.addEventListener('change',updateMerchantState);
	}
	document.querySelector('#official_merchants').addEventListener('change',
		(e)=>toggleGlobalShopStates(e.target.checked,document.querySelector('#listContainerOfficial'))
	);
	document.querySelector('#key_merchants').addEventListener('change',
		(e)=>toggleGlobalShopStates(e.target.checked,document.querySelector('#listContainerKeyShop'))
	);
	updateOfficialAndkeyShopsGlobalTogglers();
}
function getSettings(msg)
{
	if(msg.debug)
	{
		debug=true;
		initDevTab();
	}
	getCurrency({currency:msg.currency});
	getOpenMode({open_mode:msg.open_mode});
	getAutoVoucher({auto_voucher:msg.auto_voucher});
	getDisplayAlways({display_always:msg.display_always});
	getVoucherStats({voucher_stats:msg.voucher_stats});
}
function getCurrency(msg)
{
	if(document.querySelector('select[name="currency"] option[selected]'))
		document.querySelector('select[name="currency"] option[selected]').removeAttribute('selected');
	if(document.querySelector('select[name="currency"] option[value="'+msg.currency+'"]'))
		document.querySelector('select[name="currency"] option[value="'+msg.currency+'"]').setAttribute('selected', '');
	document.querySelector('select[name="currency"]').addEventListener('change', updateCurrency);
	document.querySelector('select[name="currency"]').removeAttribute('disabled');
}
function getOpenMode(msg)
{
	if(msg.open_mode)
		document.querySelector('#open_mode').setAttribute('checked', '');
	else
		document.querySelector('#open_mode').removeAttribute('checked');
	document.querySelector('#open_mode').addEventListener('change', updateOpenMode);
	document.querySelector('#open_mode').removeAttribute('disabled');
}
function getDisplayAlways(msg)
{
	if(msg.display_always)
		document.querySelector('#display_always').setAttribute('checked', '');
	else
		document.querySelector('#display_always').removeAttribute('checked');
	document.querySelector('#display_always').addEventListener('change', updateDisplayAlways);
	document.querySelector('#display_always').removeAttribute('disabled');
}
function getVoucherStats(msg,retried=false)
{
		if(!msg.voucher_stats)
			return debug?console.info('Receive getVoucherStats event without voucher_stats value in msg:',msg):null;
		if(debug)
			console.info('Update voucher section to stats: ',msg.voucher_stats);
		const bt=document.querySelector('h2[data-tab-container-id="voucherSelection"]');
		const vl=document.querySelector('#vouchersList');
		if(!bt||!vl)return retried?console.error('Fail to locate expected dom fragments in popup.html'):setTimeout(()=>getVoucherStats(msg,true),100);
		const vs=document.querySelector('#voucherSuccess');
		const ve=document.querySelector('#voucherError');
		bt.classList.remove('dNone');
		if(!msg.voucher_stats.length)
		{
			if(vs)vs.classList.add('dNone');
			if(ve)ve.classList.remove('dNone');
			return;
		}
		if(vs)vs.classList.remove('dNone');
		if(ve)ve.classList.add('dNone');
		bt.click();
		const qtt_text=(msg.voucher_stats.length>1)?'PLENTY OF COUPONS':'ONE COUPON';
		vl.insertAdjacentHTML(
			'beforebegin',
			`<img src="../images/vouchers/success.png" height="400" style="float:left;shape-outside:url('../images/vouchers/success.png');"><br>
			<h2 style="display:inline-block">I FOUND YOU ${qtt_text}<br>GUYS, I'M A BEAST</h2><br><br>`
		);
		for(voucher of msg.voucher_stats)
		{
			vl.insertAdjacentHTML(
				'beforeend',
				`<div class="voucher" style="margin-right:5px;"><span class="akVoucherCode">${DOMPurify.sanitize(voucher['code'])}</span><span style="user-select:none;">📋</span></div>`
			);
		}
		for(el of document.querySelectorAll('div.voucher'))
			el.addEventListener('click',(e)=>{
				if(e.target.nodeName==='DIV'||(!e.target.classList.contains('akVoucherCode')&&e.target.parentNode.classList.contains('voucher')))
					return e.target.parentNode.querySelector('span:first-child').click();
				var selection = window.getSelection();
				var range = document.createRange();
				range.selectNodeContents(e.target);
				selection.removeAllRanges();
				selection.addRange(range);
				document.execCommand('Copy');
				Toastify({
					text:'Copied: '+range,
					duration:3000,
					background:'#52c3f3',
					color:'#fff',
					gravity:'bottom'
				}).showToast();
			});
}
function listen_auto_voucher_change(stat,vc1,vc2)
{
	if(stat)
		vc1.setAttribute('checked','');
	else
		vc1.removeAttribute('checked');
	vc1.addEventListener(
		'change',
		(e)=>{
			vc1.checked=e.target.checked;
			if(vc2)
				vc2.checked=e.target.checked;
			updateAutoVoucher(e);
		}
	);
	vc1.removeAttribute('disabled');
}
function getAutoVoucher(msg)
{
	const voucher_checkbox_1=document.querySelector('#auto_voucher');
	const voucher_checkbox_2=document.querySelector('#auto_voucher2');
	if(voucher_checkbox_1)
	listen_auto_voucher_change(msg.auto_voucher,voucher_checkbox_1,voucher_checkbox_2);
	if(voucher_checkbox_2)
		listen_auto_voucher_change(msg.auto_voucher,voucher_checkbox_2,voucher_checkbox_1);
}
// Receive and set saved values
browser.runtime.onMessage.addListener(function(msg,sender,sendResponse)
{
	if(msg.query==='getMerchantStates')
		getMerchantStates(msg);
	else if(msg.query==='getSettings')
		getSettings(msg);
	else if(msg.query==='getCurrency')
		getCurrency(msg);
	else if(msg.query==='getOpenMode')
		getOpenMode(msg);
	else if(msg.query==='getDisplayAlways')
		getDisplayAlways(msg);
	else if(msg.query==='getAutoVoucher')
		getAutoVoucher(msg);
	else if(msg.query==='getVoucherStats')
		getVoucherStats(msg);
	else if(debug)
		console.info('Unmanaged message receive: ',msg);
	if(sendResponse)sendResponse({go:'die'});
});
function getElementOrParentWithClass(element,className,maxDepth=3)
{
	if (element.className.indexOf(className)!=-1)
		return element;
	while (element.parentElement&&maxDepth>0)
	{
		element=element.parentElement;
		if (element.className.indexOf(className)!=-1)
			return element;
		maxDepth--;
	}
}
function openTab(e)
{
	const bt=getElementOrParentWithClass(e.target,'bt');
	if (bt.className.indexOf('active')!=-1)
		return;
	const actived=document.querySelector('#banner .bt.active');
	if (actived)
		actived.classList.remove('active');
	const opened=document.querySelector('#tabs .tabOpen');
	if (opened)
		opened.classList.remove('tabOpen');
	bt.classList.add('active');
	const containerTargeted=document.querySelector('#tabs .tabContainer#'+bt.getAttribute('data-tab-container-id'));
	if (containerTargeted)
		containerTargeted.classList.add('tabOpen');
}
function submitBug(event)
{
	event.preventDefault();
	if (submitBugStatus==true)
		return;
	submitBugStatus=true;
	const fd = new FormData(event.target);
	if(fd.get('report[email]')==='debugme@allkeyshop.bug')
	{
		debug=!(fd.get('report[subject]')==='off');
		(debug)?localStorage.setItem('debug',1):localStorage.removeItem('debug');
		browser.runtime.sendMessage({
			query:'setDebug',
			value:debug
		});
		document.querySelector('#justAMessageDialog p').innerHTML = '<h2>Dev</h2>Debug mode switched '+((debug)?'on':'off');
		document.querySelector('#justAMessageDialog').setAttribute('open',true);
		if(debug)
			initDevTab();
		else if(document.querySelector('#dev'))
				document.querySelector('#dev').remove();
		return;
	}
	fetch('https://www.allkeyshop.com/scripts/aks-extension/src/create_ticket.php?x='+ Math.random(), {
		method: 'POST',
		body: fd,
	}).then(()=>{
		submitBugStatus=false;
		document.querySelector('#justAMessageDialog p').innerHTML = '<h2>Report sent</h2>';
		document.querySelector('#justAMessageDialog').setAttribute('open',true);
	}).catch((error)=>{
		submitBugStatus=false;
		if(debug)
			console.error('error', error);
		document.querySelector('#justAMessageDialog p').innerHTML = '<h2>Oops ! Something went wrong !</h2>We failed to send your report.<br>Please check your connection<br>if the problem persist please contact us at support@allkeyshop.com or<br>on our website with the help button (at the bottom right)<br>on <a href="https://allkeyshop.com" target="_blank">https://allkeyshop.com</a>';
		document.querySelector('#justAMessageDialog').setAttribute('open',true);
	});
}
const official_merchants=[
	'2game','allyouplay','amazon','epicgames','gamebillet','gamersgate','gamesforplay','gamesplanet','gog','humblebundle',
	'microsoft','nintendo','origin','playstation','steam','twitch','ubisoft','voidu','xbox','youtube'
];
function genDevStats()
{
	browser.storage.sync.getBytesInUse().then((value)=>document.querySelector('#dev #storage_sync_used span').innerText=value);
	browser.storage.sync.get().then(
		(value)=>{
			document.querySelector('#dev #storage_sync_keys_count span').innerText=Object.keys(value).length;
			document.querySelector('#dev #storage_sync_content span').innerHTML='<pre>'+JSON.stringify(value,null,'    ')+'</pre>';
		}
	);
	navigator.serviceWorker.getRegistrations().then((registration)=>document.querySelector('#dev #sw_qtt span').textContent=registration.length);
}
function sendShopStates(container)
{
	var merchants={};
	for(input of container.querySelectorAll('input:first-of-type'))
		merchants[input.name.slice(0, -1)]=(input.checked?1:0)+(input.nextElementSibling.checked?2:0);
	browser.runtime.sendMessage({
		query:'setMerchantStates',
		value:merchants
	});
}
function priceGlobalToggle(e)
{
	const value=e.target.parentNode.parentNode.querySelector('input:first-of-type:not(:checked)')?true:false;
	globalMerchantChange=true;
	for(checkbox of e.target.parentNode.parentNode.querySelectorAll('input:first-of-type'))
		checkbox.checked=value;
	globalMerchantChange=false;
	sendShopStates(e.target.parentNode.parentNode);
	updateOfficialAndkeyShopsGlobalTogglers()
}
function couponGlobalToggle(e)
{
	const value=e.target.parentNode.parentNode.querySelector('input:last-of-type:not(:checked)')?true:false;
	globalMerchantChange=true;
	for(checkbox of e.target.parentNode.parentNode.querySelectorAll('input:last-of-type'))
		checkbox.checked=value;
	globalMerchantChange=false;
	sendShopStates(e.target.parentNode.parentNode);
	updateOfficialAndkeyShopsGlobalTogglers()
}
function initDevTab()
{
	if(document.querySelector('#dev'))return;
	document.querySelector('#banner').insertAdjacentHTML('beforeend',`
		<h2 class="bt noMarge center" data-tab-container-id="dev">
			<img src="../images/log.png">
			<span></span>
			<div class="borderBt"></div>
		</h2>
	`);
	document.querySelector('#tabs').insertAdjacentHTML('beforeend',`
		<div id="dev" class="tabContainer">
			<div id="sw_qtt">SW quantity: <span></span></div>
			<div id="storage_sync_keys_count">Storage.sync keys count: <span></span></div>
			<div id="storage_sync_used">Storage.sync used: <span></span> Bytes</div>
			<div id="storage_sync_used">Storage.sync keys count: <span></span></div>
			<br>
			<div id="storage_sync_content">Storage.sync content:<br><span></span></div>
			<div class="center"><button id="clearStorages">Clear sync storage</button>
		</div>
	`);
	document.querySelector('#clearStorages').addEventListener('click', ()=>{
		browser.storage.sync.clear();
		genDevStats();
	});
	genDevStats();
}
function init()
{
	// Create checkbox and request saved values
	var merchantsQuery=[];
	const merchantsContainerOfficial=document.querySelector('#listContainerOfficial'),
		  merchantsContainerkey=document.querySelector('#listContainerKeyShop');
	for (const [index, merchant] of Object.entries(window.merchants))
	{
		var merchantContainer = document.createElement('div');
		merchantContainer.innerHTML = `<input type="checkbox" name="${index}1" id="${index}1" title="Display AKS's best price"><input type="checkbox" name="${index}2" id="${index}2" title="Show the best discount coupons">`
		+ ` <img src="https://www.google.com/s2/favicons?domain=${merchant.websiteUrl}">`
		+ ` <span>${merchant.name}</span>`
		+ `<a href="${merchant.websiteUrl}" target="_blank" title="Open: ${merchant.websiteUrl}" class="openLink">🔗</a>`;

		let container=(official_merchants.includes(index)?merchantsContainerOfficial:merchantsContainerkey);
		let lines=container.querySelectorAll('div');
		if(lines&&[8,16,24].includes(lines.length))
			container.insertAdjacentHTML(
				'beforeend',
				`<header>
					<img src="../images/store.png" height="15" title="Display AKS's best price" class="priceDisplayGlobalToggler clickable">
					<span title="Show the best discount coupons" class="couponDisplayGlobalToggler clickable">💰</span>
				</header>`
			);
		container.appendChild(merchantContainer);
		merchantsQuery.push(index);
	}
	for(priceGlobalButton of document.querySelectorAll('.listContainer header img'))
		priceGlobalButton.addEventListener('click',priceGlobalToggle);
	for(couponGlobalButton of document.querySelectorAll('.listContainer header span'))
		couponGlobalButton.addEventListener('click',couponGlobalToggle);
	browser.runtime.sendMessage({query:'getSettingsFromPopup',queries:[
		'currency','open_mode','display_always','auto_voucher',merchantsQuery
	]});

	if(debug)
		initDevTab();

	for (tabButton of document.querySelectorAll('#banner .bt'))
		tabButton.addEventListener('click', openTab);

	document.querySelector('form#bug_report').addEventListener('submit',submitBug);
	document.querySelector('form#bug_report input[name="include_screenshot"]').addEventListener('click',()=>{
		browser.tabs.captureVisibleTab(null,{},(imageURI)=>{
			if (document.querySelector('#include_screenshot img'))
				document.querySelector('#include_screenshot img').remove();
			if (document.querySelector('#include_screenshot input[name="screenshot_data"]'))
				document.querySelector('#include_screenshot input[name="screenshot_data"]').remove();
			if (document.querySelector('form#bug_report input[name="include_screenshot"]').checked===false)
				return;
			document.querySelector('#include_screenshot').insertAdjacentHTML(
				'beforeend',
				'<img src="'+imageURI+'" style="max-width:100%;"><input type="hidden" name="screenshot_data" value="'+imageURI+'">'
			);
		});
	});
	browser.tabs.query({ active: true, currentWindow: true }, (tabs)=>{
		document.querySelector('form#bug_report input[name="report[url]"]').value=tabs[0].url;
	});
}
setTimeout(init,0);