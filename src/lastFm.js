/*jshint undef: true, unused: true, browser: true */
/*global Class, Options, console, $, $$, Events, Request, Element, moment, deezer */

//var DEBUG = true;

// @see: http://stackoverflow.com/questions/1403888/get-escaped-url-parameter
function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

/* i18n */
var i18n_en = {
	'Loading...': 'Loading...',
	'An error occurred': 'An error occurred',
	'Failed to connect at': 'Failed to connect at',
	'A timeout occurred connecting to the remote source!': 'A timeout occurred connecting to the remote source!',
	'Missing image': 'Missing image',
	'or': 'or',
	'Loading track info...': 'Loading track info...',
	'Loading album art colors...': 'Loading album art colors...',
	'Searching through DuckDuckGo...': 'Searching through DuckDuckGo...',
	'Source': 'Source',
	'Invalid user session!': 'Invalid user session!'
};

// Replaces string with language variant. Returns the given string when no translation is found.
// @param {string} str
var i18n = function (str) {
	var lang = i18n_en;
	return lang[str] || str;
};

/**
 * Mootools Class for Track
 */
var Track = new Class({
	initialize: function (track) {
		"use strict";
		this.data = track;
		return this;
	}
});

/**
 * Mootools Class for Nav
 */
var Nav = new Class({

	Implements: [Options],

	options: {},

	initialize: function (options) {

		"use strict";

		var self = this,
			pageNrEl = $('pageNr'),
			getPageBtnEl = $('getPageBtn'),
			getPagePrevEl = $('getPagePrev'),
			getPageNextEl = $('getPageNext');

		this.setOptions(options);

		this.lastFm = this.options.lastFm;
		this.page = this.options.page || 1;
		this.lastPage = this.options.lastPage || 1;

		this.init = function (lastFm) {
			self.lastFm = lastFm;
			self.page = self.lastFm.page;
			self.lastPage = self.lastFm.lastPage;
			self.isAtStart();
			self.isAtEnd();
		};

		this.isAtStart = function () {
			var atStart = (self.page === 1) ? true : false;
			if (atStart) {
				self.page = 1;
				getPagePrevEl.disabled = true;
			} else {
				getPagePrevEl.disabled = false;
			}
			return atStart;
		};

		this.isAtEnd = function () {
			var atEnd = (self.page === parseInt(self.lastPage, 10)) ? true : false;
			if (atEnd) {
				self.page = parseInt(self.lastPage, 10);
				getPageNextEl.disabled = true;
			} else {
				getPageNextEl.disabled = false;
			}
			return atEnd;
		};

		this.getPage = function (e) {
			e.preventDefault();
			self.page = pageNrEl.value;
			if (DEBUG) {
				console.info('Clicked getPageBtn', self.page);
			}
			self.lastFm.page = self.page;
			self.lastFm.requests.getRecentTracks.send('user=' + encodeURIComponent(self.lastFm.username) + '&page=' + encodeURIComponent(self.page));
			return self.page;
		};

		this.getPrevPage = function (e) {
			e.preventDefault();
			self.page = parseInt(pageNrEl.value, 10) - 1;
			pageNrEl.value = self.page;
			if (DEBUG) {
				console.info('getPagePrev', self.page);
			}
			self.lastFm.page = self.page;
			self.lastFm.requests.getRecentTracks.send('user=' + encodeURIComponent(self.lastFm.username) + '&page=' + encodeURIComponent(self.page));
			return self.page;
		};

		this.getNextPage = function (e) {
			e.preventDefault();
			self.page = parseInt(pageNrEl.value, 10) + 1;
			pageNrEl.value = self.page;
			if (DEBUG) {
				console.info('getPageNext', self.page);
			}
			self.lastFm.page = self.page;
			self.lastFm.requests.getRecentTracks.send('user=' + encodeURIComponent(self.lastFm.username) + '&page=' + encodeURIComponent(self.page));
			return self.page;
		};

		pageNrEl.addEvent('blur', self.getPage);
		getPageBtnEl.addEvent('click', self.getPage);
		getPagePrevEl.addEvent('click', self.getPrevPage);
		getPageNextEl.addEvent('click', self.getNextPage);

	}

});

/**
 *  Mootools Class for LastFM
 */
var LastFm = new Class({

	Implements: [Options, Events],

	// Defaults
	options: {
		username: '',
		apiKey: 'APIKEYHERE',
		mashapeKey: 'APIKEYHERE',
		secret: 'SECRETHERE',
		perPage: 10,
		colorTag: true,
		duckduckGo: true,
		getTracksUpdateDelay: 3 // minutes
	},

	initialize: function (options) {

		"use strict";

		var self = this;

		this.setOptions(options);

		this.username = this.options.username;
		this.apiKey = this.options.apiKey;
		this.secret = this.options.secret;
		this.perPage = this.options.perPage;

		// @see http://mootools.net/docs/core/Element/Element
		this.loadingSpinnerEl = $('loadingSpinner');
		this.recentTracksEl = $('recentTracks');
		this.nrrecentTracksEl = $('nrRecentTracks');
		this.nrTotalTracksEl = $('nrTotalTracks');
		this.totalNrPagesEl = $('totalNrPages');
		this.userIdEl = $('userId');

		// Test if the elements are available
		if(!self.loadingSpinnerEl || !self.recentTracksEl || !self.nrrecentTracksEl || !self.nrTotalTracksEl || !self.totalNrPagesEl || !self.userIdEl) {
			console.error("Expecting DOM elements!");
			return;
		}
		
		// Implements the More plugin Request.Queue
		// @see http://mootools.net/docs/more/Request/Request.Queue
		this.myQueue = new Request.Queue({
			onRequest: function () {
				if (DEBUG) {
					console.info('onRequest');
				}
				self.loadingSpinnerEl.set('text', i18n('Loading...'));
			},
			onComplete: function (name, instance, text, xml) {
				self.loadingSpinnerEl.empty();
				if (DEBUG) {
					console.info('onComplete queue: ' + name + ' response: ', text, xml);
				}
			},
			onError: function (code, error) {
				self.loadingSpinnerEl.set('text', i18n('An error occurred') + ': (' + code + ') ' + error);
				console.error(code, error);
			},
			onFailure: function (xhr) {
				self.loadingSpinnerEl.set('text', i18n('Failed to connect at') + ' ' + xhr);
				console.error(xhr);
			},
			onEnd: function () {
				if (DEBUG) {
					console.info("Generating track html...");
				}
				if (self.tracks.length) {
					self.tracks.each(self.generateTrackHTML);
				} else {
					self.generateTrackHTML(self.tracks, 0);
				}
			},
			onTimeout: function () {
				self.loadingSpinnerEl.set('text', i18n('A timeout occurred connecting to the remote source!'));
			}
		});

		this.page = 1;
		this.lastPage = 1;
		this.totalTracks = 0;
		this.tracks = [];
		this.lastScrobble = {};		
		this.signature = "";
		this.token = "";
		this.usersession = {};

		// Creates the HTML code used to display the scrobbled track.
		// @param {object} track
		// @param {integer} index
		this.generateTrackHTML = function (trackData, index) {

			var theTrack = new Track(trackData),
				artist,
				title,
				album,
				thumb,
				el,
				imgEl,
				artistEl,
				nameEl,
				albumEl,
				btnsEl,
				metaEl,
				dateEl,
				deezerSearchBtnEl,
				lastFmTrackBtnEl,
				googleArtistBtnEl,
				mbid,
				infoEl,
				missingImgEl = new Element('img.thumb.missing', { 'src': '', 'alt': i18n('Missing image'), 'width': 128, 'height': 128 }),
				missingImgElClone,
				timestamp = 0,
				timestampFromNow = '',
				timestampCalendar = '',
				track = (theTrack.data.length) ? undefined : theTrack.data,
				durationEl = "",
				genre = "",
				genreEl = "",
				tags = [],
				refreshDelay = 1000 * 60 * self.options.getTracksUpdateDelay;

			if (track === undefined || !track.artist || !track.name) {
				if(DEBUG) {
					console.log("Expecting valid track!", track);
				}
				return;
			}

			// gather track data
			artist = track.artist.name;
			title = track.name;
			album = track.album['#text'];
			mbid = track.mbid || "";

			if (track.date) {
				timestamp = moment.unix(track.date.uts);
				timestampFromNow = timestamp.fromNow();
				timestampCalendar = timestamp.calendar();
			}

			if (track.info) {

				if (track.info.duration && +track.info.duration > 0) {
					
					refreshDelay = +track.info.duration;
				
					// Using plugin for moment.js to display duration in specific format
					durationEl = '(' + moment.duration(+track.info.duration).format('m:ss') + ')';
				}

				if (track.info.toptags && track.info.toptags.tag && track.info.toptags.tag.length > 1) {

					track.info.toptags.tag.each(function (tag) {
						tags.push(tag.name);
					});

					genre = tags.join("-");
					genreEl = tags.join(' / ');
				}

			}

			// Creates a distinct missingImg for every track
			missingImgElClone = missingImgEl.clone();

			// @see http://mootools.net/docs/core/Element/Element
			el = new Element('div.track', {
				'id': 'track-' + index,
				'data-mbid': mbid,
				'events': {
					'click': function (e) {
						e.preventDefault();
						// unselect previously selected
						$$('li.selected').each(function (el) {
							el.removeClass('selected');
						});
						// select new element
						this.addClass('selected');
					}
				}
			});

			// First track is last track scrobbled
			if (index === 0) {

				el.addClass('first');

				// first track sets style of the page using the genre tags
				$(document.body).set("class", genre);

				if (track.image && track.image.length) {

					$$('.background').set("style", "background-image:url(" + track.image[3]['#text'] + ")");

					if (self.options.colorTag) {
						window.setTimeout(function () {
							if (DEBUG) {
								console.info("starting getColorTag request", track.image[0]['#text']);
							}
							self.requests.getColorTag.send('url=' + track.image[0]['#text']);
						}, 3000); // 3 seconds delay
					}

				}
				
				// Get next song automatically or when current song is done.
				// TODO: calculate remaining time from current time, start of playing and duration of the song
				
				if (self.page === 1) {
				
					if(DEBUG) {
						console.info("track refresh in", refreshDelay);
					}
				
					window.setTimeout(function() {
						self.requests.getRecentTracks.send('user=' + encodeURIComponent(self.username));
					}, refreshDelay);
					
				}
				
				if (self.options.duckduckGo && self.lastScrobble && self.lastScrobble.artist) {
					if (DEBUG) {
						console.info("Searching DuckDuckGo for", self.lastScrobble.artist.name);
					}
					self.requests.getDuckDuckGoInfo.send("q=" + encodeURIComponent(self.lastScrobble.artist.name));
				}

			}

			// Gathering track elements

			if (!track.image || !track.image.length) {

				// @see: http://mootools.net/docs/core/Element/Element#Element:adopt
				imgEl = el.adopt(missingImgElClone);

			} else {

				thumb = track.image[3]; // extralarge

				if (thumb && thumb['#text'].length > 1) {
					imgEl = new Element('img.thumb', {
						'src': thumb['#text'],
						'alt': thumb.size,
						'width': 128,
						'height': 128,
						'events': {
							'click': function (e) {
								e.preventDefault();
								location.href = track.url;
							}
						}
					}).inject(el);
				} else {
					imgEl = el.adopt(missingImgElClone);
				}

			}

			// Create DOM elements
			metaEl = new Element('div.meta').inject(el);
			btnsEl = new Element('div.btns').inject(el);
			artistEl = new Element('span.artist', { 'html': artist }).inject(metaEl);
			nameEl = new Element('span.name', { 'html': title }).inject(metaEl);
			albumEl = new Element('span.album', { 'html': album }).inject(metaEl);
			infoEl = new Element('div.info', { 'html': '' }).inject(el);

			if (timestampCalendar.length && timestampFromNow.length) {
				dateEl = new Element('span.date', { 'html': '<span class="tilde">~</span>' + timestampCalendar + '<br /> ' + i18n('or') + ' ' + timestampFromNow + ' ' + durationEl }).inject(metaEl);
			}

			// Buttons

			// @TODO: Question: Should I create these outside of the foreach and clone and adopt?
			deezerSearchBtnEl = new Element('a', {
				href: '#',
				text: 'Deezer',
				events: {
					click: function (e) {
						e.preventDefault();
						deezer.search(track.artist.name + ' ' + track.name);
					}
				},
				'class': 'extBtn deezerBtn'
			}).inject(btnsEl);

			// @TODO: Should I create these ones outside of the foreach and then clone and adopt?
			lastFmTrackBtnEl = new Element('a', {
				href: track.url,
				text: 'Last.fm',
				'class': 'extBtn lastfmBtn',
				'events': {
					'click': function (e) {
						if (DEBUG) {
							console.info('lastFm clicked!', track.url);
						}
						e.preventDefault();
						location.href = track.url;
					}
				}
			}).inject(btnsEl);

			// @TODO: Should I create these ones outside of the foreach and then clone and adopt?
			googleArtistBtnEl = new Element('a', {
				href: 'https://www.google.com/search?hl=en&q=' + encodeURIComponent(artist),
				text: 'Google: ' + artist,
				'class': 'extBtn googleBtn',
				'events': {
					'click': function (e) {
						if (DEBUG) {
							console.info('Google clicked!', 'https://www.google.com/search?hl=en&q=' + encodeURIComponent(artist));
						}
						e.preventDefault();
						location.href = 'https://www.google.com/search?hl=en&q=' + encodeURIComponent(artist);
					}
				}
			}).inject(btnsEl);

			if (DEBUG) {
				console.info("Rendered Track", track);
			}

			el.inject(self.recentTracksEl);
			

		};

		// Parses through the colors returns by getColorTag
		// @see https://www.mashape.com/apicloud/colortag#!documentation
		// @param {object} jsonObj
		this.parseColors = function (jsonObj) {

			var tags = jsonObj.tags || [],
				len = tags.length,
				i = len,
				backgrColor = "",
				textColor = "",
				colors = [],
			// @see http://24ways.org/2010/calculating-color-contrast/
			// @param {string} hexcolor
				getContrastYIQ = function (hexcolor) {
					hexcolor = hexcolor.replace('#', '');
					var r = parseInt(hexcolor.substr(0, 2), 16),
						g = parseInt(hexcolor.substr(2, 2), 16),
						b = parseInt(hexcolor.substr(4, 2), 16),
						yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
					return yiq; //(yiq >= 128) ? 'black' : 'white';
				};

			// Calculate contrast value for the colors
			while (i) {
				i = i - 1;
				colors.push({ 'yiq': getContrastYIQ(jsonObj.tags[i].color), 'hex': jsonObj.tags[i].color });
			}

			if (colors.length) {

				// Sort based upon contrast
				colors.sort(function (a, b) {
					return a.yiq - b.yiq;
				});

				backgrColor = colors[0].hex;    // could also use "label"
				textColor = colors[colors.length - 1].hex;

				// We want to use the color values on the body and link tags
				if (backgrColor && textColor) {
					$(document.body).set('style', 'background-color:' + backgrColor + ';color:' + textColor);
					$$("a").set('style', 'color:' + textColor);
				}

			}

		};

		// Prepares rendering of the track data.
		this.addRecentTracks = function () {

			var track = {};

			self.loadingSpinnerEl.empty();

			self.recentTracksEl.empty();

			if (self.tracks.length) {
				self.tracks.each(function (track) {
					self.requests.getTrackInfo.send('user=' + encodeURIComponent(self.username) + '&mbid=' + encodeURIComponent(track.mbid) + '&artist=' + encodeURIComponent(track.artist.name) + '&track=' + encodeURIComponent(track.name));
				});
			} else {
				track = self.tracks;
				self.requests.getTrackInfo.send('user=' + encodeURIComponent(self.username) + '&mbid=' + encodeURIComponent(track.mbid) + '&artist=' + encodeURIComponent(track.artist.name) + '&track=' + encodeURIComponent(track.name));
			}

		};

		// Executes whenever the json request is okay
		// @param {object} jsonObj
		this.getRecentTrackSuccess = function(jsonObj) {
		
			//if (DEBUG) console.info('onSuccess', jsonObj);

			var attr;

			if (jsonObj.recenttracks && typeof jsonObj.recenttracks['@attr'] === 'undefined') {
				console.error('Error retrieving tracks!', jsonObj);
				return;
			}

			if (typeof jsonObj.recenttracks === "undefined") {
				console.log("Error with jsonObj.recentracks");
				return;
			}

			attr = jsonObj.recenttracks['@attr'];

			self.totalTracks = attr.total;
			self.lastPage = attr.totalPages;

			self.totalNrPagesEl.set('text', self.lastPage);
			self.nrTotalTracksEl.set('text', self.totalTracks);
			self.nrrecentTracksEl.set('text', self.perPage);

			self.userIdEl.set('text', attr.user + "'s");

			self.tracks = jsonObj.recenttracks.track;

			self.lastScrobble = self.tracks[0];

			self.addRecentTracks();

			self.nav.init(self);			
		
		};
		
		// Getting the list of recent tracks from Last.fm
		// @returns Request.JSON for queuing
		this.getRecentTracks = function () {

			// @see http://mootools.net/docs/more/Request/Request.Queue
			// @see http://mootools.net/docs/core/Request/Request.JSON
			// @see http://mootools.net/docs/core/Request/Request
			return new Request.JSON({
				url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&api_key=' + encodeURIComponent(self.apiKey) + '&format=json&extended=1&limit=' + encodeURIComponent(self.perPage),
				onSuccess: self.getRecentTrackSuccess
			});

		};

		// Handles track info from remote
		// @param {object} jsonObj
		this.getTrackInfoSuccess = function(jsonObj) {
		
			//console.info('onSuccess getTrackInfo', jsonObj.track);

			var info = jsonObj.track;

			// Check if we actually have tracks to update
			if (self.tracks.length) {

				// find the track we just updated and add the meta data
				self.tracks.each(function (track, index) {
					if (track.mbid === info.mbid) {
						self.tracks[index].info = info;
					}
				});
				// Single track found, but check it's okay.
			} else {
				if (self.tracks.mbid && self.tracks.mbid === info.mbid) {
					self.tracks.info = info;
				}
			}
		
			return self.tracks;
		
		};
		
		// @param {object} track
		// @param {function} callback
		this.getTrackInfo = function () {

			// This a Request.Queue so it can be used in the getrecenttracks request
			return new Request.JSON({

				url: 'http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=' + encodeURIComponent(self.apiKey) + '&autocorrect=1&format=json',

				onRequest: function () {
					self.loadingSpinnerEl.set('text', i18n('Loading track info...'));
				},

				onSuccess: self.getTrackInfoSuccess

			});

		};
		
		// Authenticates using LastFM
		this.getSession = function() {
			
			return new Request({
			
				url: 'http://ws.audioscrobbler.com/2.0/?method=auth.getsession&format=json&api_key=' + encodeURIComponent(self.apiKey),

				onRequest: function () {
					self.loadingSpinnerEl.set('text', i18n('Getting session...'));
				},

				onSuccess: function(jsonObj) {
				
					self.usersession = JSON.parse(jsonObj).session;
				
					if(DEBUG) {
						console.info("self.usersession", self.usersession);
					}
					
					if(!self.usersession || !self.usersession.name) {
						throw i18n("Invalid user session!");
					}
					
					$$('.login').toggleClass('hidden');
					$$('.app').toggleClass('hidden');
					
					self.username = self.usersession.name;
					
					// Start initial tracks request
					self.requests.getRecentTracks.send('user=' + encodeURIComponent(self.username) + '&page=' + encodeURIComponent(self.page));
					self.nav = new Nav({ 'lastFm': self });
					
				},
				
				'method': 'get'
			
			});
		};

		// Returns color codes for the album art
		this.getColorTag = function () {
			return new Request.JSON({
				url: 'https://apicloud-colortag.p.mashape.com/tag-url.json?palette=w3c&sort=weight',
				headers: { 'X-Mashape-Authorization': self.options.mashapeKey },
				noCache: true,
				onRequest: function () {
					self.loadingSpinnerEl.set('text', i18n('Loading album art colors...'));
				},
				onSuccess: self.parseColors,
				onComplete: function (name, instance, text, xml) {
					self.loadingSpinnerEl.empty();
					if (DEBUG) {
						console.info('onComplete queue: ' + name + ' response: ', text, xml);
					}
				},
				onError: function (code, error) {
					console.error(code, error);
				}
			});
		};

		this.clearInfoEl = function () {
			$$('#track-0 .info').set('html');
		};

		// Returns search queries from DuckDuckGo
		this.getDuckDuckGoInfo = function () {
			return new Request.JSON({
				url: 'https://duckduckgo-duckduckgo-zero-click-info.p.mashape.com/?no_html=1&no_redirect=1&skip_disambig=1&format=json',
				headers: { 'X-Mashape-Authorization': self.options.mashapeKey },
				method: 'get',
				noCache: true,
				onRequest: function () {
					self.loadingSpinnerEl.set('text', i18n('Searching through DuckDuckGo...'));
					// Reset initially
					self.clearInfoEl();
				},
				onSuccess: function (jsonObj) {

					var htmlOut = "";

					if (DEBUG) {
						//console.info(jsonObj);
						if (typeof self.lastScrobble.artist.name !== "undefined" && jsonObj.AbstractText) {
							console.log("lastScrobble", self.lastScrobble, jsonObj.AbstractText.indexOf(self.lastScrobble.artist.name));
						} else {
							console.log("lastScrobble", self.lastScrobble, jsonObj);
						}
					}

					self.clearInfoEl();

					// Making sure the info returned at least contains the current artist name, if it's not, we don't show anything.
					if (jsonObj.AbstractText && jsonObj.AbstractText.length && self.lastScrobble.artist && jsonObj.AbstractText.indexOf(self.lastScrobble.artist.name) !== -1) {

						if (jsonObj.Image && jsonObj.Image.length) {
							htmlOut += '<img src="' + jsonObj.Image + '" alt="' + jsonObj.Heading + '" />';
						}

						htmlOut += '<p>' + jsonObj.AbstractText + '</p>' + '<p>' + i18n('Source') + ': <a href="' + jsonObj.AbstractURL + '">' + jsonObj.AbstractSource + '</a></p>';

						$$('#track-0 .info').set('html', htmlOut);

					}

				},
				onComplete: function (name, instance, text, xml) {
					self.loadingSpinnerEl.empty();
					if (DEBUG) {
						console.info('onComplete queue: ' + name + ' response: ', text, xml);
					}
				},
				onError: function (code, error) {
					self.clearInfoEl();
					console.error(code, error);
				}
			});
		};

		// Collect all requests here

		this.requests = {
			'getSession': self.getSession(),
			'getRecentTracks': self.getRecentTracks(),
			'getTrackInfo': self.getTrackInfo(),
			'getColorTag': self.getColorTag(),
			'getDuckDuckGoInfo': self.getDuckDuckGoInfo()
		};

		this.myQueue.addRequest("getSession", this.requests.getSession);
		this.myQueue.addRequest("getRecentTracks", this.requests.getRecentTracks);
		this.myQueue.addRequest("getTrackInfo", this.requests.getTrackInfo);

		this.token = getURLParameter('token').replace('/','');
		
		// @see: http://www.last.fm/api/webauth
		this.webauth = function () {
			location.href = 'http://www.last.fm/api/auth/?api_key=' + self.apiKey + '&cb=' + location.origin + location.pathname;
		};
		
		this.init = function () {
		
			setTimeout(function(){
		
				if(self.token !== "null" && self.token.length > 1) {
				
					// Start a LastFm session
					self.signature = hex_md5('api_key' + self.apiKey + 'methodauth.getsessiontoken' + self.token + self.secret);
				
					self.requests.getSession.send('token=' + encodeURIComponent(self.token) + '&api_sig=' + self.signature);			
					
					if(DEBUG) {
						console.log('token', self.token);
						console.log('signature', self.signature);
					}
				
				} else {
				
					self.webauth();
				
				}
			
			}, 2000);			
			
			return self;
			
		};		

		return this;
		
	}

});

// Start the application
// @see http://mootools.net/docs/core/Utilities/DOMReady
window.addEvent('domready', function () {
	"use strict";
	if(typeof LastFm !== "undefined") {
		window.lastFm = new LastFm({ 'perPage': 3 });
		window.lastFm.init();
	}
});
