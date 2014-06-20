/*jshint undef: true, unused: true, browser: true */
/*global Class, Options, console, DZ */

/**
*   Sets up Deezer
*/
var Deezer = new Class({

	Implements: Options,

	options: {
		username: 'Johan Bové',
		appId: '136181',
		channelUrl: 'http://deezertest.johanbove.info/channel.html'
	},

	initialize: function (options) {

		"use strict";

		this.setOptions(options);

		var self = this,
			username = this.options.username,
			appId = this.options.appId,
			channelUrl = this.options.channelUrl;

		// @param {string} userName
		this.user = function (username) {

			// Gets public information for a Deezer user
			DZ.api('search/user?q=' + encodeURIComponent(username), function (response) {
				console.info('getDeezerInfo', response.data[0]);
			});

		};

		// @see: http://developers.deezer.com/sdk/javascript/init
		window.dzAsyncInit = function () {

			DZ.init({
				appId: appId,
				channelUrl: channelUrl
			});

			// @TODO: this doesn't seem to trigger...
			DZ.ready(function (sdk_options) {
				console.log('DZ SDK is ready', sdk_options);
				self.user(username);
			});

			self.user(username);

		};

	},

	// @param {string} q
	search: function (q) {

		"use strict";

		console.info('deezerSearch', q);

		DZ.api('search?q=' + encodeURIComponent(q), function (response) {

			console.info('deezerSearch', response);

			var total = response.total,
				firstResult = null,
				i18n = {
					hit: 'hit',
					hits: 'hits'
				},
				txtNrHits,
				openLinkTxt = "Open first Deezer track page?",
				txtHitsConfirm,
				linkToOpen;

			if (total === undefined || total === 0) {

				if (window.confirm('Sorry! Nothing found on Deezer for:\n' + q + '\n\nTry again?')) {
					window.open('http://www.deezer.com/search/' + q.replace(/"/g, ""));
				}

			} else {

				firstResult = response.data[0];

				txtNrHits = (total === 1) ? i18n.hit : i18n.hits;
				txtHitsConfirm = 'Found ' + total + ' ' + txtNrHits + '!\n"' + firstResult.title + '" by ' + firstResult.artist.name + '\n\n';
				linkToOpen = firstResult.link;

				if (total > 1) {
					openLinkTxt = "%s tracks were found. Open Deezer results page?".replace('%s', total);
					linkToOpen = 'http://www.deezer.com/search/' + q.replace(/"/g, "");
				}

				txtHitsConfirm += openLinkTxt;

				if (window.confirm(txtHitsConfirm)) {
					window.open(linkToOpen);
				}

			}

		});
	}

	// commented out since this code is being included in the build
	//(function () {
	//var e = document.createElement('script');
	//e.src = 'http://cdn-files.deezer.com/js/min/dz.js';
	//e.async = true;
	//document.getElementById('dz-root').appendChild(e);
	//} ());

});

window.deezer = new Deezer();