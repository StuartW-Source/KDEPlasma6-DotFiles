const banner=document.querySelector('.header-announce a');
if (banner)
	banner.setAttribute('style', 'display:none !important;');

if (window.wrappedJSObject)
{
	if (window.wrappedJSObject.confirmExtensionEnabled!=undefined)
		window.wrappedJSObject.confirmExtensionEnabled();
}
else
{
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL('allkeyshop_webkit_inject.js');
	s.onload = function() {
		this.remove();
	};
	(document.head||document.documentElement).appendChild(s);
}