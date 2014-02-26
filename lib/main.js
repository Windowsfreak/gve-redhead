const {Cc,Ci} = require('chrome');
if (typeof gveRedhead == 'undefined') {
	var gveRedhead = {
		init: function() { // called on window load; the right point to manipulate browser.xul
		},
		load: function(options, callbacks) { // https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Listening_for_load_and_unload
			console.log('Called exports.main with loadReason ' + options.loadReason);
			switch (options.loadReason) {
				case 'install': gveRedhead.openNewTab('http://windowsfreak.de/hello'); break;
				case 'enable': gveRedhead.openNewTab('http://windowsfreak.de/hello'); break;
				case 'startup': console.log(gveRedhead.getOSString()); break;
				case 'upgrade': break;
				case 'downgrade': break;
			}
			console.log('Current OS: ' + gveRedhead.getOSString());
			gveRedhead.injectCSS();
			gveRedhead.setTimer();
		},
		unload: function(reason) { // https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Listening_for_load_and_unload
			console.log('Called exports.main with reason ' + reason);
			switch (reason) {
				case 'uninstall': break; // Due to bug 627432, your onUnload listener will never be called with uninstall: it will only be called with disable.
				case 'disable': gveRedhead.openNewTab('http://windowsfreak.de/bye'); break;
				case 'shutdown': break;
				case 'upgrade': break;
				case 'downgrade': break;
			}
			gveRedhead.unsetTimer();
		},
		setTimer: function() { // http://stackoverflow.com/questions/6256669/how-to-use-nsitimer-in-a-firefox-extension
			if (!gveRedhead.timer) {
				gveRedhead.timer = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer);
			}
			gveRedhead.timer.initWithCallback(gveRedhead.onTimer, 10000, Ci.nsITimer.TYPE_REPEATING_SLACK);
		},
		unsetTimer: function() { // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsITimer
			if (gveRedhead.timer) {
				gveRedhead.timer.cancel();
			}
		},
		onTimer: function() { // http://stackoverflow.com/questions/6256669/how-to-use-nsitimer-in-a-firefox-extension
			console.log('Currently open tabs:\n' + gveRedhead.getOpenTabs().join('\n'));
		},
		getWm: function() {
			return Cc['@mozilla.org/appshell/window-mediator;1']
					.getService(Ci.nsIWindowMediator);
		},
		getWin: function() {
			return gveRedhead.getWm().getMostRecentWindow('navigator:browser');
		},
		openNewTab: function(url) { // http://stackoverflow.com/questions/6701258/javascript-firefox-addon-open-new-tab
			var win = gveRedhead.getWin();
			win.gBrowser.selectedTab = win.gBrowser.addTab(url);
			// may consider using gveRedhead.getWin().delayedOpenTab instead: https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Tabbed_browser#Reusing_tabs
		},
		getOSString: function() { // http://stackoverflow.com/questions/1418896/detect-operating-system-from-firefox-extension
			var osString = Cc['@mozilla.org/xre/app-info;1']  
					.getService(Ci.nsIXULRuntime).OS;
			switch (osString) {
				case 'WINNT': return 'Windows';
				case 'Linux': return 'Linux';
			}
			return osString;
		},
		/*injectCSS: function() { // http://stackoverflow.com/questions/2731736/how-can-a-firefox-extension-inject-a-local-css-file-into-a-webpage
			var fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", "resource://gve-redhead/content/skin/style.css");
			document.getElementsByTagName("head")[0].appendChild(fileref);
		},*/
		injectCSS: function() { // https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
			var data = require('sdk/self').data;
			var pageMod = require('sdk/page-mod');
			pageMod.PageMod({
			  include: '*',
			  contentStyleFile: data.url('my-style.css'),
			  attachTo: ['existing', 'top', 'frame']
			});
		},
		injectJS: function() { // https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
			var data = require('sdk/self').data;
			var pageMod = require('sdk/page-mod');
			pageMod.PageMod({
			  include: 'http://windowsfreak.de',
			  contentScriptWhen: 'ready',
			  contentScriptFile: data.url('my-script.js'),
			  onAttach: function onAttach(worker) {
				console.log('Attached to ' + worker.tab.title);
			  }
			});
		},
		getOpenTabs: function() { // https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Tabbed_browser#Reusing_tabs
			// http://stackoverflow.com/questions/1754417/accessing-tabs-on-firefox-with-a-c-xpcom-extension
			// var browser = gveRedhead.getWin().gBrowser;
			/*
			browser.tabContainer.addEventListener('TabOpen', tabOpened, false);
			browser.tabContainer.addEventListener('TabClose', tabClosed, false);
			browser.tabContainer.addEventListener('TabSelect', tabSelected, false);
			*/
			var wm = gveRedhead.getWm();
			var browserEnumerator = wm.getEnumerator('navigator:browser');
			var results = [];
			while (browserEnumerator.hasMoreElements()) {
				var browserWin = browserEnumerator.getNext();
				var tabbrowser = browserWin.gBrowser;
				
				var numTabs = tabbrowser.browsers.length;
				for (var index = 0; index < numTabs; index++) {
					var currentBrowser = tabbrowser.getBrowserAtIndex(index);
					results.push(currentBrowser.currentURI.spec);
					// yield might work as well
				}
			}
			return results;
		}
	};
	gveRedhead.init();
}
/*
if (typeof window != 'undefined') {
	window.addEventListener('load', function() { gveRedhead.BrowserOverlay.init(); }, false);
}
*/
exports.main = gveRedhead.load;
exports.onUnload = gveRedhead.unload;