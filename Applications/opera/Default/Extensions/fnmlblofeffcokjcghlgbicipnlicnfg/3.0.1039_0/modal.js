dialogStyle=`<style id="styleDialogAK177">
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
#dialogAK177
{
	border-radius:18px;
	padding:0!important;
	font-family:'Bebas Neue',roboto,monospace;
	font-size:16px!important;
	line-height:16px!important;
	margin:auto!important;
	min-height:300px!important;
	border:0!important;
	background:white!important;
	color:#222!important;
	overflow:visible;
	position:fixed!important;
	z-index:2147483647!important;
	top:50%;
	transform:translate(0, -50%);
	box-shadow:0 0 1vw 100vw rgba(0,0,0,0.9);
}
dialog::backdrop
{
	background:rgba(250,0,0,0.9) !important;
}
#dialogAK177 *
{
	font-family:'Bebas Neue',roboto,monospace!important;
}
#dialogAK177 header
{
	z-index:-1;
	width:100%;
	height:100px;
	margin-top: -5px;
	border-radius:18px 18px 0 0;
	position: absolute;
	box-sizing: border-box;
	background:linear-gradient(to bottom,#232c39 0%,#1b222c 100%);
}
#dialogAK177 section
{
	color:white;
	padding:19px 15px 20px 20px;
	line-height:35px;
	font-size:29px!important;
}
#dialogAK177 p
{
	clear:left;
	color:#7fc3ff;
	padding: 0 20px 0 20px;
	font-size: 17px;
}
#dialogAK177 label
{
	color:gray!important;
	cursor:pointer!important;
	display:inline-block!important;
	padding:5px 10px!important;
	border-radius:3px!important;
	margin-bottom:20px!important;
	background:rgba(0,0,0,0.1)!important;
}
#dialogAK177 label input
{
	margin:-2px 5px 0 5px!important;
	vertical-align:middle!important;
}
progress
{
	background-color:#7fc3ff;
	color:#7fc3ff;
	width:100%;
}
progress::-webkit-progress-value
{
	background-color:#7fc3ff;
	color:#7fc3ff;
}
progress::-webkit-progress-bar
{
	background-color:#f3f4f4;
	color:#f3f4f4;
}
progress::-moz-progress-bar
{
	background-color:#7fc3ff;
	color:#7fc3ff;
}
#dialogAK177 button
{
	cursor:pointer!important;
	border:0!important;
	border-radius:2px!important;
	padding:10px!important;
	background:rgba(0,0,0,0.1)!important;
	transition:all 0.2s linear 0s;
	box-shadow:0 0 2px transparent,0 0 2px transparent inset;
}
#dialogAK177 button:hover
{
	box-shadow:0 0 2px #f3f4f4,0 0 2px #f3f4f4 inset!important;
	background:rgba(0,0,0,0.3)!important;
}
#dialogAK177 button[value="cancel"]
{
	color:#ef4124!important;
}
#dialogAK177 button[value="default"]
{
	color:#42b983!important;
	box-shadow:0 0 5px #42b983!important;
	margin-left:20px!important;
}
#dialogAK177 button[title="Abort"],#dialogAK177 button[title="Close"]
{
	position:absolute;
	top:-1px;
	right:5px;
	font-size:12px;
	transform:rotate(45deg);
	padding:4px!important;
	border-radius:50%!important;
}
img[src$="/wait.png"]
{
	transform-origin:center;
}
@keyframes rotate
{
	100%
	{
		transform:rotate(360deg);
	}
}
dialog#dialogAK177[open]
{
	animation:show 0.4s ease normal;
}
@-webkit-keyframes show
{
	from
	{
		opacity:.5;
		transform:translateX(-30%) scale(0.7);
	}
	to
	{
		opacity:1;
		transform:translateX(0%) scale(1);
	}
}
dialog.hideDialogAK177
{
	animation:hideDialogAK177 0.4s ease normal;
}
@-webkit-keyframes hideDialogAK177
{
	to
	{
		opacity:.5;
		transform:translateX(30%) scale(0.7);
	}
}
dialog.polyfilled:not([open])
{
	display:none;
}
dialog.polyfilled
{
	left:0; right:0;
	width:-moz-fit-content;
	width:-webkit-fit-content;
	width:fit-content;
	height:-moz-fit-content;
	height:-webkit-fit-content;
	height:fit-content;
	margin:auto;
	border:solid;
	padding:1em;
	background:white;
	color:black;
	display:block;
}
</style>`;
const is_dialog_capable=typeof HTMLDialogElement==='function';
var noAnimation=!is_dialog_capable;
function modalClose(e=null)
{
	const modal=document.querySelector('#dialogAK177');
	if (!modal)return;
	if(noAnimation===true)
	{
		noAnimation=!is_dialog_capable;
		modal.remove();
		return;
	}
	modal.removeAttribute('id');
	modal.classList.add('hideDialogAK177');
	modal.addEventListener(
		'animationend',
		function()
		{
			modal.classList.remove('hideDialogAK177');
			modal.close();
			modal.removeEventListener('animationend',arguments.callee,false);
			modal.remove();
		}, false
	);
}
function modalInit(content,style=null)
{
	modalClose();
	if (!document.querySelector('#styleDialogAK177'))
		document.querySelector('head').insertAdjacentHTML('beforeend',dialogStyle);
	style=(style!=null)?' style="'+style.replace('"','\"')+'"':'';
	if(!is_dialog_capable)
		style+=' class="polyfilled"';
	document.querySelector('body').insertAdjacentHTML(is_dialog_capable?'afterbegin':'beforebegin',`<dialog id="dialogAK177"${style} open>${content}</dialog>`);
	const modal=document.querySelector('#dialogAK177');
	if (!modal)
		return console.info('Fail to insert modal');
}
function modalError(msg,title='No coupons here guys sorry.<br>A... AHEM... IM STUCK.<br>Can you help me ?<br><br>HE.. HEEEEEEELP..!!',css='')
{
	modalInit(
		`<header style="height:200px;"></header>
		<button value="cancel" title="Close">➕</button>
		<section style="text-align:center;${css}">
			<img src="${browser.runtime.getURL('images/vouchers/fail.png')}" width="400" style="float:left;margin:-205px 0 -116px -15px;shape-outside:url('${browser.runtime.getURL('images/vouchers/fail.png')}');shape-margin:50px;">
			${title}
			${(msg!==undefined)?`<br><br><span style="color:black">ERROR_CODE:${msg}</span>`:''}
		</section>`,
		'width:482px;'
	);
	document.querySelector('#dialogAK177 button[value="cancel"]').addEventListener('click',modalClose);
	document.querySelector('#dialogAK177 input,#dialogAK177 button').blur();
}
function modalSuccess(msg,title='GUYS, I\'M A BEAST!')
{
	modalInit(
		`<header style="height:72px;"></header>
		<button value="cancel" title="Close">➕</button>
		<section>
			<img src="${browser.runtime.getURL('images/vouchers/success.png')}" width="400" style="float:left;margin:-150px 0 -116px -123px;shape-outside:url('${browser.runtime.getURL('images/vouchers/success.png')}');shape-margin:95px;">
			${title}
		</section>
		<p style="clear:none!important;text-align:center;">${msg}</p>`,
		'min-width:500px;height:130px;min-height:100px!important;'
	);
	document.querySelector('#dialogAK177 button[value="cancel"]').addEventListener('click',modalClose);
	document.querySelector('#dialogAK177 input,#dialogAK177 button').blur();
}
function modalProgress(title,actual,maximal,cancel=null)
{
	const old_progress=document.querySelector('#dialogAK177 .updatable_voucher_progression');
	if (old_progress)
	{
		old_progress.innerHTML=`<progress max="${maximal}" value="${maximal-actual}"></progress><br>${maximal-actual} / ${maximal}`;
		return;
	}
	modalInit(
		`<header></header>
		<button value="cancel" title="Abort">➕</button>
		<section>
			<img src="${browser.runtime.getURL('images/vouchers/search.png')}" width="400" style="float:left;margin:-54px 0 0 -63px;shape-outside:url('${browser.runtime.getURL('images/vouchers/search.png')}');shape-margin:41px;">
			${title}
		</section>
		<img src="${browser.runtime.getURL('images/vouchers/wait.png')}" width="86" style="margin-left:30px;animation:rotate 4s linear infinite;">
		<p>
			Searching...<br>
			<div class="updatable_voucher_progression" style="text-align:center;">
				<progress max="${maximal}" value="${maximal-actual}"></progress><br>${maximal-actual} / ${maximal}
			</div>
		</p>
		`,
		'width:510px;min-height:266px!important;animation:unset!important;'
	);
	noAnimation=true;
	if (cancel!=null)
		document.querySelector('#dialogAK177 button[value="cancel"]').addEventListener('click',(e)=>{cancel();modalClose(e);});
	else
		document.querySelector('#dialogAK177 button[value="cancel"]').addEventListener('click',modalClose);
	document.querySelector('#dialogAK177 input,#dialogAK177 button').blur();
}