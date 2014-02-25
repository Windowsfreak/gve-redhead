const {Cc,Ci} = require("chrome");
if (typeof gveRedhead == 'undefined') {
	var gveRedhead = {
		init: function() { // called on window load; the right point to manipulate browser.xul
		},
		load: function(options, callbacks) {
			console.log('Called exports.main with loadReason ' + options.loadReason);
			switch (options.loadReason) {
				case 'install': gveRedhead.openNewTab('http://windowsfreak.de/hallo'); break;
				case 'enable': gveRedhead.openNewTab('http://windowsfreak.de/hallo'); break;
				case 'startup': break;
				case 'upgrade': break;
				case 'downgrade': break;
			}
		},
		unload: function(reason) {
			console.log('Called exports.main with reason ' + reason);
			switch (reason) {
				case 'uninstall': break; // Due to bug 627432, your onUnload listener will never be called with uninstall: it will only be called with disable.
				case 'disable': gveRedhead.openNewTab('http://windowsfreak.de/bye'); break;
				case 'shutdown': break;
				case 'upgrade': break;
				case 'downgrade': break;
			}
		},
		openNewTab: function(url) {
			var win = Cc['@mozilla.org/appshell/window-mediator;1']
					.getService(Ci.nsIWindowMediator)
					.getMostRecentWindow('navigator:browser');
			win.gBrowser.selectedTab = win.gBrowser.addTab(url);
		}
	};
	gveRedhead.init();
}
if (typeof window != 'undefined') {
	window.addEventListener('load', function() { gveRedhead.BrowserOverlay.init(); }, false);
}
exports.main = gveRedhead.load;
exports.onUnload = gveRedhead.unload;