var voucherTimesCfg = {
	defaultWaitForSubmitVoucher:100,
	voucherTimeBetween:100,
	waitBeforeVoucherPreviousSubmitCallback:90,
	additionalWaitForSubmitVoucherIfvoucherPreviousInsertCallback:100,
	additionalWaitForSubmitVoucherIfvoucherPreviousSubmitCallback:300,
	maxRetryOnNoVoucherInputFound:4,
	maxVoucherRearmIf:9,
	delayOfVoucherRearm:300,
	maxVoucherInputRetryInRearm:9,
	delayOfVoucherInputRetryInRearm:100,
	delayOfSetInputVoucherValueInRearm:100,
	delayOfSubmitVoucherInRearm:10,
	maxRetryToSearchFinalPrice:10,
	delayOfRetryToSearchFinalPrice:100,
	maxRetryOfVoucherApplyIf:9,
	delayOfRetryOfVoucherApplyIf:100,
	maxRetryBeforeVoucherConsideredInvalid:10,
	delayOfRetryBeforeVoucherConsideredInvalid:100,
	maxRetryToSearchReducedPrice:10,
	delayOfRetryToSearchReducedPrice:100,
	is_not_run_from_long_time_delay:120000 /* 2mn in milisecondes, reset pending operations started when last activity is most of this value */
};
function sendStatToBg(tested)
{
	browser.runtime.sendMessage({
		query:'voucherSubmitCompleted',
		merchantId:merchantCfg.merchantId,
		value:tested
	});
}
function voucherRetryAll()
{
	clearVoucherStorage();
	localStorage.setItem('voucherAKPopUpQueryWaiting',true);
	if((new RegExp(merchantCfg.voucherUrlPattern)).exec(location.href))
		window.location.reload();
	else
		window.open(merchantCfg.voucherUrl,merchantCfg.open_mode.length?'_blank':undefined).focus();
}
function saveVoucherState(code,price=0,stat=false)
{
	if(debug)
		debugFun('Voucher stat save: \ncode=',code,' \nprice=',price,' \nstat=',stat);
	var tested=localStorage.getItem('voucherAKResumeTested');
	if(!tested)
	{
		tested=[{'code':code,'price':price,'stat':stat}];
		/*sendStatToBg(tested);*/
		return localStorage.setItem('voucherAKResumeTested',JSON.stringify(tested));
	}
	try
	{
		tested=JSON.parse(tested)
	}
	catch
	{
		tested=[];
		if(debug)
			console.error('Fail to parse content of localstorage key: voucherAKResumeTested (erased)');
	}
	tested.push({'code':code,'price':price,'stat':stat});
	/*sendStatToBg(tested);*/
	localStorage.setItem('voucherAKResumeTested',JSON.stringify(tested));
}
function testVoucher(merchantCfg,voucher,inputElement,submitElement,retry=0)
{
	if(inputElement&&inputElement.value===voucher)
		return debug?console.info('Already set (abort).'):null;
	merchantCfg.voucher=voucher;
	merchantCfg.voucherTestStat=0;
	var delay=0;
	if(merchantCfg.voucherPreviousInsertCallback)
	{
		delay+=voucherTimesCfg.additionalWaitForSubmitVoucherIfvoucherPreviousInsertCallback;
		merchantCfg.voucherPreviousInsertCallback();
		if(merchantCfg.waitRedirect)
			return debug?console.info('Abort test voucher for waitRedirect.'):null;
	}
	if(merchantCfg.voucherPreviousSubmitCallback)
	{
		setTimeout(()=>{
			if(merchantCfg.voucherTestStat===0)
				merchantCfg.voucherPreviousSubmitCallback();
		},voucherTimesCfg.waitBeforeVoucherPreviousSubmitCallback);
		delay+=voucherTimesCfg.additionalWaitForSubmitVoucherIfvoucherPreviousSubmitCallback;
	}
	delay+=voucherTimesCfg.defaultWaitForSubmitVoucher;
	setTimeout(()=>{
		if(!inputElement)
			inputElement=execOrExtract('voucherInput2',merchantCfg.voucherInputSelector,false);
		if(inputElement)
		{
			if(debug)
				console.info('testVoucher set ',inputElement,' value at ',voucher);
			inputElement.value=voucher;
		}
		else
		{
			if(debug)
				console.warn('testVoucher fail to get valide inputElement (abort)');
			merchantCfg.voucherTestStat=-1;
		}
	},voucherTimesCfg.defaultWaitForSubmitVoucher);
	setTimeout(()=>{
		if(merchantCfg.voucherTestStat!==0)
		{
			if(retry<voucherTimesCfg.maxRetryOnNoVoucherInputFound)
				return setTimeout(()=>testVoucher(merchantCfg,voucher,inputElement,submitElement,retry+1),voucherTimesCfg.defaultWaitForSubmitVoucher);
			modalError('YU789LM4');
			return debug?console.info('Abort scheduled submit for previous schedule input not found.'):null;
		}
		if(!submitElement)
			submitElement=execOrExtract('voucherSubmit2',merchantCfg.voucherSubmitSelector,false);
		if(submitElement)
		{
			if(!(merchantCfg.voucherSubmitSelector instanceof Function))
				submitElement.click();
		}
		else
		{
			if(debug)
				console.info('testVoucher fail to get valide voucherSubmit (abort)');
			merchantCfg.voucherTestStat=-1;
		}
	},delay);
}
function voucherRearm(retry=0)
{
	if(!(new RegExp('^'+merchantCfg.voucherUrlPattern)).exec(location.href))
		return debug?console.info('Not anymore on voucher page, rearm aborted'):null;
	if(merchantCfg.voucherRearmIf&&merchantCfg.voucherRearmIf())
	{
		if(++retry>voucherTimesCfg.maxVoucherRearmIf)
			return debug?console.info('Abort for respect voucherRearmIf after 10 try.'):null;
		if(debug)
			console.info('Wait for voucherRearmIf...');
		return setTimeout(()=>voucherRearm(retry),voucherTimesCfg.delayOfVoucherRearm);
	}
	else if(debug)
		console.log('\n\nvoucher REALM\n\n');
	const best=localStorage.getItem('voucherAKResumeBest');
	if(!best)
		return;
	const best_code=best.substring(localStorage.getItem('voucherAKResumeBest').indexOf(';')+1);
	const voucherInput=document.querySelector(merchantCfg.voucherInputSelector);
	if(!voucherInput)
	{
		if(++retry>voucherTimesCfg.maxVoucherInputRetryInRearm)
			return debug?console.info('Fail to found voucher input after exausting max retry.'):null;
		return setTimeout(()=>voucherRearm(retry),voucherTimesCfg.delayOfVoucherInputRetryInRearm);
	}
	if(voucherInput.value==best_code)
		return;
	if(merchantCfg.voucherInitCallback)
		merchantCfg.voucherInitCallback();
	const voucherSubmitElement=document.querySelector(merchantCfg.voucherSubmitSelector);
	if(voucherSubmitElement)
	{
		setTimeout(()=>{
			voucherInput.value=best_code;
			setTimeout(()=>{
				voucherSubmitElement.click();
				localStorage.setItem('voucherAKRearm',1);
			},voucherTimesCfg.delayOfSubmitVoucherInRearm);
		},voucherTimesCfg.delayOfSetInputVoucherValueInRearm);
	}
	else if(debug)
		console.info('Fail to found voucherSubmiElement');
}
var currentDragElement=null;
function closeVoucherPurpose()
{
	if(document.querySelector('#akVoucherPurpose'))
		document.querySelector('#akVoucherPurpose').remove();
	if(document.querySelector('#akVoucherPurposeCSS'))
		document.querySelector('#akVoucherPurposeCSS').remove();
}
function reduceVoucherPurpose()
{
	console.info('reduceVoucherPurpose clicked');
	const accordion=document.querySelector('#akVoucherPurpose div[data-action="accordion"]');
	if(!accordion)
		return debug?console.error('reduceVoucherPurpose does not found accordion'):null;
	accordion.classList.toggle('akHidden')
}
function dragMouseDown(e)
{
	e=e||window.event;
	e.preventDefault();
	document.addEventListener('mouseup',closeDragElement);
	document.addEventListener('mouseleave',closeDragElement);
	document.addEventListener('mousemove',elementDragThrottled);
}
function elementDrag(e)
{
	e.preventDefault();
	currentDragElement.style.top=(currentDragElement.offsetTop+e.movementY)+'px';
	currentDragElement.style.left=(currentDragElement.offsetLeft+e.movementX)+'px';
	currentDragElement.style.right='auto';
	currentDragElement.style.bottom='auto';
}
const elementDragThrottled=throttle(elementDrag);
function closeDragElement()
{
	document.removeEventListener('mouseup',closeDragElement);
	document.removeEventListener('mousemove',elementDragThrottled);
	document.removeEventListener('mouseleave',closeDragElement);
}
function dragMe(target)
{
	if (!target)
		return debug?console.error('dragMe receive empty target'):null;
	currentDragElement=target;
	const header=document.getElementById(target.id + "Header");
	if (!header)
		return debug?console.error('Fail to find drageable header at #',target.id):null;
	header.addEventListener('mousedown',dragMouseDown);
}
function throttle(func,wait=1,leading=true,trailing=true,context=this)
{
	var ctx,args,result;
	var timeout=null;
	var previous=0;
	var later=function()
	{
		previous=new Date;
		timeout=null;
		result=func.apply(ctx,args);
	};
	return function()
	{
		var now=new Date;
		if(!previous&&!leading)previous=now;
		var remaining=wait-(now-previous);
		ctx=context||this;
		args=arguments;
		if(remaining<=0)
		{
			clearTimeout(timeout);
			timeout=null;
			previous=now;
			result=func.apply(ctx,args);
		}
		else if(!timeout&&trailing)
			timeout=setTimeout(later,remaining);
		return result;
	};
};
function voucherPurpose(merchantId,vouchers)
{
	closeVoucherPurpose();
	var vouchersStr='';
	for(voucher of vouchers)
		vouchersStr+='<div class="paperButton voucher" title="Copy to clipboard"><span class="akVoucherCode">'+DOMPurify.sanitize(voucher)+'</span><span style="user-select:none;">📋</span></div>';
	document.querySelector('head').insertAdjacentHTML('beforeend',`<style id="akVoucherPurposeCSS">
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
html .paperButton
{
	box-sizing:border-box;
	padding:10px;
	cursor:pointer;
	background:#171a21;
	width:max-content;
	margin:10px auto;
	border-radius:3px;
	transition:all 0.1s linear 0s;
	box-shadow:0 2px 2px 0 rgb(0 0 0 / 14%),0 1px 5px 0 rgb(0 0 0 / 12%),0 3px 1px -2px rgb(0 0 0 / 20%);
}
html .paperButton:hover
{
	background:#52c3f3;
	box-shadow:0 2px 2px 0 rgb(255 255 255 / 14%),0 1px 5px 0 rgb(255 255 255 / 12%),0 3px 1px -2px rgb(255 255 255 / 20%);
}
html div#akVoucherPurpose div .voucher
{
	width:100%;
	display:flex;
	margin:5px 0;
	border-radius:0;
	background:#2e3035;
}
html div#akVoucherPurpose div .voucher span:first-child
{
	flex:1 1 auto;
}
html div#akVoucherPurpose div .voucher:hover
{
	background:#52c3f3;
}
html div#akVoucherPurpose h3
{
	color:white!important;
	font-weight:500;
	line-height:1.1;
	font-family:'Bebas Neue',roboto,monospace;
}
html div#akVoucherPurpose
{
	position:fixed;
	overflow-y:auto;
	overflow-x:hidden;
	max-height:100%;
	top:15px;
	right:15px;
	background:#22374e;
	color:white!important;
	z-index:2147483647!important;
	display:block!important;
	font-weight:500;
	line-height:1.1;
	min-width:300px;
	font-size:15px;
	font-family:'Bebas Neue',roboto,monospace;
	box-shadow:0 2px 2px 0 rgb(0 0 0 / 14%),0 1px 5px 0 rgb(0 0 0 / 12%),0 3px 1px -2px rgb(0 0 0 / 20%);
}
html div#akVoucherPurpose img
{
	display:block;
	max-width:100%;
	max-height:300px;
	margin:10px auto 0 auto;
}
html div#akVoucherPurpose .akHidden
{
	height:0;
	overflow:hidden;
}
html div#akVoucherPurpose .accordion_container
{
	text-align:center;
	padding:20px 0 10px 0;
}
</style>`);
	var showMoreStyle=showMoreHtml='';
	if(vouchers.length>4)
	{
		showMoreStyle=' style="max-height:147px;overflow:hidden;"';
		showMoreHtml=`<div
			class="paperButton"
			style="width:80%;text-align:center;background:rgba(0,0,0,0.3);"
			onclick="document.querySelector('div#akVoucherPurpose .accordion_container').removeAttribute('style');this.remove();"
		>Show more...</div>`;
	}
	document.querySelector('html').insertAdjacentHTML('beforeend',`
<div id="akVoucherPurpose">
	<div data-action="reduce" title="Reduce" style="position:absolute;top:5px;right:25px;font-size:12px;cursor:pointer;">➖</div>
	<div data-action="close" title="Close" style="position:absolute;top:5px;right:5px;font-size:12px;transform:rotate(45deg);cursor:pointer;">➕</div>
	<h3 id="akVoucherPurposeHeader" style="cursor:move;user-select:none;background:#171a21!important;margin:0!important;padding:15px 10px 15px 10px!important;font-size:1.75rem!important;">We have found ${vouchers.length} coupon${vouchers.length>1?'s':''}</h3>
	<div style="background:linear-gradient(to right,#52c3f3,#0f141c);height:2px;"></div>
	<div data-action="accordion">
		<img src="${browser.runtime.getURL('images/vouchers/hello.png')}" height="300">
		<div class="accordion_container"${showMoreStyle}>${vouchersStr}</div>
		${showMoreHtml}
		<label for="auto_voucher" style="text-align:center;width:fit-content;padding:10px 5px;cursor:pointer;margin:5px auto;display:block;">
			Automatically apply best coupons <input type="checkbox" id="auto_voucher" style="vertical-align:middle;margin:0 0 0 5px;cursor:pointer">
		</label>
		<div class="paperButton" data-action="apply">Apply best coupon</div>
	</div>
</div>`);
	document.querySelector('div#akVoucherPurpose div[data-action="accordion"]>.paperButton[data-action="apply"]').addEventListener('click',()=>{
		closeVoucherPurpose();
		receiveVoucher(merchantCfg.merchantId,vouchers);
	});
	document.querySelector('div#akVoucherPurpose #auto_voucher').addEventListener('change',(e)=>{
		closeVoucherPurpose();
		browser.runtime.sendMessage({
					query:'setAutoVoucher',
					value:e.target.checked
				});
		receiveVoucher(merchantCfg.merchantId,vouchers);
	});
	document.querySelector('div#akVoucherPurpose div[data-action="reduce"]').addEventListener('click',reduceVoucherPurpose);
	document.querySelector('div#akVoucherPurpose div[data-action="close"]').addEventListener('click',closeVoucherPurpose);
	dragMe(document.querySelector('div#akVoucherPurpose'));
	for(el of document.querySelectorAll('div#akVoucherPurpose div.voucher'))
		el.addEventListener('click',(e)=>{
			if(e.target.nodeName!=='DIV'&&!e.target.classList.contains('akVoucherCode')&&e.target.parentNode.classList.contains('voucher'))
				return e.target.parentNode.querySelector('span:first-child').click();
			var selection=window.getSelection();
			var range=document.createRange();
			range.selectNodeContents(e.target);
			selection.removeAllRanges();
			selection.addRange(range);
			document.execCommand('Copy');
			// Toastify({
			// 	text:'Copied: ' + e.target.innerText,
			// 	duration:3000,
			// 	background:'#52c3f3',
			// 	color:'#fff',
			// 	gravity:'bottom'
			// }).showToast();
		});
	var keepAtTopOfTheGameIterationCount=0;
	const keepAtTopOfTheGame=setInterval(()=>{
		const voucherPresentContainer=document.querySelector('div#akVoucherPurpose');
		if(!voucherPresentContainer)
			return clearInterval(keepAtTopOfTheGame);
		if(document.querySelector('div#akVoucherPurpose').nextSibling!=null)
			document.querySelector('html').appendChild(document.querySelector('div#akVoucherPurpose'));
		if(++keepAtTopOfTheGameIterationCount>40)
			clearInterval(keepAtTopOfTheGame);
	},500);
}
function clearVoucherStorage()
{
	if(debug)
		console.info('clearVoucherStorage called');
	localStorage.removeItem('voucherAKRearm');
	localStorage.removeItem('voucherAKCache');
	localStorage.removeItem('voucherAKResume');
	localStorage.removeItem('voucherAKResumeLast');
	localStorage.removeItem('voucherAKResumeBest');
	localStorage.removeItem('voucherAKResumeDone');
	localStorage.removeItem('voucherAKInitialPrice');
	localStorage.removeItem('voucherAKResumeTested');
	localStorage.removeItem('voucherAKResumeLastRun');
	localStorage.removeItem('voucherAKResumeFlashStop');
	localStorage.removeItem('voucherAKPopUpQueryWaiting');
	localStorage.removeItem('voucherAKResumeFlashRedirect');
}
function endOfVoucherTests(error=null,retry=0)
{
	if(debug)
		console.info('End of voucher tests');
	if(error!=null)
		return modalError(error);
	const best=localStorage.getItem('voucherAKResumeBest');
	if (!best)
	{
		if(debug)
			console.info('Not one coupon success from voucherAKResumeBest localStorage value');
		return modalError(undefined,'Not one coupon success','line-height:190px;');
	}
	if(!merchantCfg.voucherInitialPriceSelector)
		return modalSuccess('Check the page to see what you have won');
	var initialPrice=execOrExtract('voucherInitialPriceSelector',merchantCfg.voucherInitialPriceSelector,true);
	if(!initialPrice)
	{
		if(retry<voucherTimesCfg.maxRetryToSearchFinalPrice)
			return setTimeout(()=>endOfVoucherTests(error,retry+1),voucherTimesCfg.delayOfRetryToSearchFinalPrice);
		if(localStorage.getItem('voucherAKResumeBest'))
			return modalSuccess('Check the page for see what you have win');
		else
			return modalError('ZX321C');
	}
	modalClose();
	initialPrice=priceSanitize(initialPrice);
	var bestPrice=best.split(';',1)[0];
	try
	{
		initialPrice=parseFloat(initialPrice);
		bestPrice=parseFloat(bestPrice);
	}
	catch
	{
		if(debug)console.error('Fail to parse float prices in endOfVoucherTests: \ninitialPrice=',initialPrice,' \nbestPrice=',bestPrice);
		return modalError('ZX322M');
	}
	if(isNaN(bestPrice)||isNaN(initialPrice)||!bestPrice||bestPrice>=initialPrice)
	{
		modalError('ZZ341E');
		if(debug)
			console.info('Not a great price: \nbestprice=',bestPrice,' \ninitialPrice=',initialPrice);
	}
	else
	{
		merchantCfg.merchantPriceText=initialPrice;
		if(merchantCfg.voucherInitialPriceCurrencySelector)
		{
			merchantCfg.currencyDetected=execOrExtract('voucherInitialPriceCurrency',merchantCfg.voucherInitialPriceCurrencySelector,true);
			if(!merchantCfg.currencyDetected)
				merchantCfg.currencyDetected=' 💰';
		}
		else
			merchantCfg.currencyDetected=' 💰';
		modalSuccess('You just saved '+priceCleaner(initialPrice-bestPrice));
	}
}
function receiveVoucher(merchantId,vouchers,resume=false,retry=0)
{
	if(localStorage.getItem('voucherAKResumeFlashStop'))
		return localStorage.removeItem('voucherAKResumeFlashStop');
	var tested=localStorage.getItem('voucherAKResumeTested');
	if(tested)
	{
		try
		{
			tested=JSON.parse(tested);
			/*sendStatToBg(tested);*/
		}
		catch
		{
			localStorage.removeItem('voucherAKResumeTested');
			return debug?console.info('Fail to parse as JSON last voucherAKResumeTested:',tested):null;
		}
	}
	if(merchantCfg.voucherApplyIf&&!merchantCfg.voucherApplyIf())
	{
		if(++retry>voucherTimesCfg.maxRetryOfVoucherApplyIf)
			return debug?console.info('Abort by respect of voucherApplyIf after 10 try.'):null;
		return setTimeout(()=>receiveVoucher(merchantId,vouchers,resume,retry),voucherTimesCfg.delayOfRetryOfVoucherApplyIf);
	}
	const remainingTestCount=vouchers.length,
		  totalTestCount=remainingTestCount+(tested?tested.length:0)+(resume?1:0);
	if (remainingTestCount>0)
		modalProgress('I\'ll find you coupons<br>Guys, trust me !',remainingTestCount-1,totalTestCount,()=>{
			merchantCfg.voucherTestStat=-1;
			localStorage.removeItem('voucherAKResume');
			localStorage.setItem('voucherAKResumeDone',1);
			localStorage.setItem('voucherAKResumeFlashStop',1);
			localStorage.setItem('voucherAKResumeLastRun',new Date()-0);
		});
	if(retry==0&&merchantCfg.voucherSubmitReload&&merchantCfg.voucherInitCallback&&!localStorage.getItem('voucherAKResumeDone'))
	{
		if(debug)
			debugFun('Call merchantCfg.voucherInitCallback()')
		merchantCfg.voucherInitCallback();
	}
	const lastCheck=localStorage.getItem('voucherAKResumeLastRun');
	const is_not_run_from_long_time=!lastCheck||(new Date(parseInt(lastCheck))<new Date()-voucherTimesCfg.is_not_run_from_long_time_delay);
	if(!resume||is_not_run_from_long_time)
	{
		if(!merchantCfg.voucherSubmitReload&&merchantCfg.voucherInitCallback)
			merchantCfg.voucherInitCallback();
		clearVoucherStorage();
	}
	else
	{
		if(localStorage.getItem('voucherAKResumeFlashRedirect'))
		{
			if(merchantCfg.voucher_end_callback)
				merchantCfg.voucher_end_callback();
			if(merchantCfg.voucherRearm)
				setTimeout(voucherRearm,voucherTimesCfg.delayOfVoucherRearm);
			localStorage.removeItem('voucherAKResumeFlashRedirect');
			if(debug)
				debugFun('remove FlashRedirect');
			return endOfVoucherTests();
		}
		if(localStorage.getItem('voucherAKResumeDone'))
		{
			if(debug)
				debugFun('I\'m done');
			if(merchantCfg.voucherRearm)
				setTimeout(voucherRearm,voucherTimesCfg.delayOfVoucherRearm);
			return;
		}
		const last=localStorage.getItem('voucherAKResumeLast');
		if(!last)
		{
			if (remainingTestCount>0)
				endOfVoucherTests('EX32786Z');
			return debug?console.warn('Fail to retrieve voucherAKResumeLast in localstorage after start in resume mode (abort).'):null;
		}
		merchantCfg.voucher=last;
		const voucherSuccess=execOrExtract('voucherSuccess',merchantCfg.voucherSuccessSelector,false);
		const voucherError=execOrExtract('voucherFailed',merchantCfg.voucherFailedSelector,false);
		if(voucherError||!voucherSuccess)
		{
			if(debug)
			{
				const voucher_error_stat=voucherError?'failed':'not a success';
				debugFun('Voucher',voucher_error_stat,'for',last);
			}
			if((!voucherError||merchantCfg.waitSuccessAfterError)&&!merchantCfg.voucherSubmitReload&&retry<voucherTimesCfg.maxRetryBeforeVoucherConsideredInvalid)
			{
				if(debug)
					debugFun('voucherNotYetFailed, wait a minute...');
				return setTimeout(()=>receiveVoucher(merchantId,vouchers,resume,retry+1),voucherTimesCfg.delayOfRetryBeforeVoucherConsideredInvalid);
			}
			saveVoucherState(last);
		}
		else
		{
			var priceResult=execOrExtract('Voucher price result',merchantCfg.voucherPriceResultSelector);
			if(!priceResult)
			{
				if(retry<voucherTimesCfg.maxRetryToSearchReducedPrice)
					return setTimeout(()=>receiveVoucher(merchantId,vouchers,resume,retry+1),voucherTimesCfg.delayOfRetryToSearchReducedPrice);
				else
				{
					if(debug)
						debugFun('No voucher price result extracted at ', merchantCfg.voucherPriceResultSelector);
					saveVoucherState(last);
				}
			}
			else
			{
				if(debug)
					debugFun('Voucher price result extracted at ',merchantCfg.voucherPriceResultSelector,'=',priceResult);
				if(merchantCfg.voucher_end_callback)
					merchantCfg.voucher_end_callback();
				if(merchantCfg.voucherRearm)
					setTimeout(voucherRearm,voucherTimesCfg.delayOfVoucherRearm);
				if(debug)
					debugFun('First success intercepted');
				localStorage.setItem('voucherAKResume','[]');
				localStorage.setItem('voucherAKResumeDone',1);
				priceResult=parseFloat(priceSanitize(priceResult));
				const best=localStorage.getItem('voucherAKResumeBest');
				if(!best||priceResult<parseFloat(best.split(';',1)[0]))
					localStorage.setItem('voucherAKResumeBest',String(priceResult)+';'+last);
				saveVoucherState(last,priceResult,true);
				endOfVoucherTests();
				return;
			}
		}
	}
	localStorage.setItem('voucherAKResumeLastRun',new Date()-0);
	if(!vouchers||vouchers.length<1)
	{
		if(debug)
			debugFun(
				'Empty waiting list of vouchers, lastCheck:',lastCheck,
				' \nis_not_run_from_long_time:',is_not_run_from_long_time,
				' \nrestart:',(resume&&(!lastCheck||is_not_run_from_long_time))
			);
		if(resume&&(!lastCheck||is_not_run_from_long_time))
			return browser.runtime.sendMessage({
					query:'queryVoucherCode',
					merchantId:merchantCfg.merchantId
				});
		else
		{
			const last=localStorage.getItem('voucherAKResumeLast');
			const best=localStorage.getItem('voucherAKResumeBest');
			localStorage.setItem('voucherAKResumeDone',1);
			if(last&&best)
			{
				const best_code=best.substring(best.indexOf(';')+1);
				merchantCfg.voucher=best_code;
				if(best_code!==last)
				{
					if(debug)
						debugFun('Ending not on best code, redirect...');
					localStorage.setItem('voucherAKResumeLast',best_code);
					if(merchantCfg.voucherSubmitReload)
					{
						localStorage.setItem('voucherAKResumeFlashRedirect',1);
						setTimeout(()=>localStorage.removeItem('voucherAKResumeFlashRedirect'),1000);
					}
					setTimeout(()=>testVoucher(merchantCfg,best_code,execOrExtract('voucherInput1',merchantCfg.voucherInputSelector,false),null),voucherTimesCfg.voucherTimeBetween);
				}
				if(!merchantCfg.voucherSubmitReload)
				{
					if(merchantCfg.voucher_end_callback)
						merchantCfg.voucher_end_callback();
					if(merchantCfg.voucherRearm)
						setTimeout(voucherRearm,voucherTimesCfg.delayOfVoucherRearm);
				}
			}
		}
		return endOfVoucherTests();
	}
	else if(debug)
		debugFun('Not yet finished');
	const voucher=vouchers.shift();
	localStorage.setItem('voucherAKResume',JSON.stringify(vouchers));
	localStorage.setItem('voucherAKResumeLast',voucher);
	if(debug)
		debugFun('Test voucher: ',voucher);
	testVoucher(merchantCfg,voucher,execOrExtract('voucherInput1',merchantCfg.voucherInputSelector,false),null);
	if(!merchantCfg.voucherSubmitReload)
		setTimeout((()=>receiveVoucher(merchantId,vouchers,true)),voucherTimesCfg.voucherTimeBetween);
}