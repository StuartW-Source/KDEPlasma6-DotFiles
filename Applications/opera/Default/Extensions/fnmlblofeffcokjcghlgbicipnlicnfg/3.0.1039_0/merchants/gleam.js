const debug=false;
if(typeof browser==='undefined')
	var browser=chrome;
var rearmed=false;
function rearmGleamIfNeeded()
{
	if(rearmed||!document.querySelector('.entry_details .form-actions .btn-primary:not([disabled])'))return;
	submitWhenAvailable();
}
function submitWhenAvailable(max_retry=50)
{
	const bt=document.querySelector('.entry_details .form-actions .btn-primary');
	if(bt)
	{
		bt.click();
		setTimeout(rearmGleamIfNeeded,300);
	}
	else if(max_retry > 0)
		setTimeout(()=>submitWhenAvailable(max_retry-1),100);
	else if(debug)
		console.error('Fail to foud submit bt');
}
function queryFreeGleam(infos,fromCache=false)
{
	if(!fromCache)
	{
		try
		{
			localStorage.setItem('gleamAKSLastQueryTS',new Date()-0)
			localStorage.setItem('gleamAKSLastQueryValue',infos);
		}
		catch{} // Probably not allowed by browser settings
	}
	infos=JSON.parse(infos);
	if(debug)console.info('queryFreeGleam receive infos:',infos);
	if(location.href.indexOf(infos.url)==-1)return debug?console.info('Not an AKS Gleam fresh url', location.href, '\n', infos['url']):undefined;
	textarea.value=infos['code'];
	setTimeout(()=>textarea.dispatchEvent(new Event('input', {bubbles: true})),100);
	setTimeout(submitWhenAvailable,350);
}
function is_outdated_cache(lastCheck)
{
	const now = new Date();
	if(lastCheck.getHours()!=now.getHours()||lastCheck<now-600000)
		return true;
}
function insertGleam()
{
	var lastCheck=null,lastValue=null;
	try
	{
		lastCheck=localStorage.getItem('gleamAKSLastQueryTS');
		lastValue=localStorage.getItem('gleamAKSLastQueryValue');
	}
	catch{} // Probably not allowed by browser settings
	if(!lastValue||(lastCheck&&is_outdated_cache(new Date(parseInt(lastCheck)))))
		browser.runtime.sendMessage({ query:'queryFreeGleam' });
	else
		queryFreeGleam(lastValue,true);
	browser.runtime.onMessage.addListener(function(msg,sender,sendResponse)
	{
		if(msg.query==='queryFreeGleam')
		{
			if(queryFreeGleam!==null)
				queryFreeGleam(msg.infos);
			else if(debug)
				console.error('queryFreeGleam lost :\'<');
		}
		else if(debug)
			console.info('Message receive from SW: ',msg);
		if(sendResponse)sendResponse({go:'die'});
	});
}
const textarea=document.querySelector('textarea');
if(textarea)
	insertGleam();
else if(debug)
	console.error('Fail to locate Gleam textarea');