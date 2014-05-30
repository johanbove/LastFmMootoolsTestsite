// @see http://24ways.org/2010/calculating-color-contrast/
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace('#', '');
	var r = parseInt(hexcolor.substr(0,2),16),
	    g = parseInt(hexcolor.substr(2,2),16),
	    b = parseInt(hexcolor.substr(4,2),16),
	    yiq = ((r*299)+(g*587)+(b*114))/1000;
	return yiq; //(yiq >= 128) ? 'black' : 'white';
}

var Track = new Class({
    initialize: function (track) {
        this.data = track;
    }
});

var Nav = new Class({

    Implements: [Options],

    options: {
        'debug': true
    },

    initialize: function (options) {

        var self = this;

        this.setOptions(options);

        this.lastFm = this.options.lastFm;
        this.debug = this.options.debug;
        this.page = 1;
        this.lastPage = 1;

        var pageNrEl = $('pageNr'),
            getPageBtnEl = $('getPageBtn'),
            getPagePrevEl = $('getPagePrev'),
            getPageNextEl = $('getPageNext');

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
        };

        this.isAtEnd = function () {
            var atEnd = (self.page === parseInt(self.lastPage, 10)) ? true : false;
            if (atEnd) {
                self.page = parseInt(self.lastPage, 10);
                getPageNextEl.disabled = true;
            } else {
                getPageNextEl.disabled = false;
            }
        };

        this.getPage = function (e) {
            e.preventDefault();
            self.page = pageNrEl.value;
            if (self.debug) console.info('Clicked getPageBtn', self.page);
            self.lastFm.page = self.page;
            self.lastFm.requests.getRecentTracks.send('page=' + encodeURIComponent(self.page));
        };

        this.getPrevPage = function (e) {
            e.preventDefault();
            self.page = parseInt(pageNrEl.value, 10) - 1;
            pageNrEl.value = self.page;
            if (self.debug) console.info('getPagePrev', self.page);
            self.lastFm.page = self.page;
            self.lastFm.requests.getRecentTracks.send('page=' + encodeURIComponent(self.page));
        };

        this.getNextPage = function (e) {
            e.preventDefault();
            self.page = parseInt(pageNrEl.value, 10) + 1;
            pageNrEl.value = self.page;
            if (self.debug) console.info('getPageNext', self.page);
            self.lastFm.page = self.page;
            self.lastFm.requests.getRecentTracks.send('page=' + encodeURIComponent(self.page));
        };

        pageNrEl.addEvent('blur', self.getPage);
        getPageBtnEl.addEvent('click', self.getPage);
        getPagePrevEl.addEvent('click', self.getPrevPage);
        getPageNextEl.addEvent('click', self.getNextPage);

    }

});

var LastFm = new Class({

    Implements: [Options, Events],

    // Defaults
    options: {
        username: 'joe-1',
        apiKey: '6944bec73e711c56ae9955c77d642c98',
        perPage: 10,
        debug: false
    },

    initialize: function (options) {

        var self = this;

        this.setOptions(options);

        this.username = this.options.username;
        this.apiKey = this.options.apiKey;
        this.perPage = this.options.perPage;
        this.debug = this.options.debug;

        // @see http://mootools.net/docs/core/Element/Element
        this.loadingSpinnerEl = $('loadingSpinner');
        this.recentTracksEl = $('recentTracks');
        this.nrrecentTracksEl = $('nrRecentTracks');
        this.nrTotalTracksEl = $('nrTotalTracks');
        this.totalNrPagesEl = $('totalNrPages');
        this.userIdEl = $('userId');

        // Implements the More plugin Request.Queue
        // @see http://mootools.net/docs/more/Request/Request.Queue
        this.myQueue = new Request.Queue({
            onRequest: function () {
                if (self.debug) console.info('onRequest');
                self.loadingSpinnerEl.set('text', 'Loading...');
            },
            onComplete: function (name, instance, text, xml) {
                self.loadingSpinnerEl.empty();
                //if (self.debug) console.info('onComplete queue: ' + name + ' response: ', text);
            },
            onError: function (text, error) {
                console.error(text, error);
            },
            onFailure: function (xhr) {
                console.error(xhr);
            },
            onEnd: function () {
                if (self.debug) console.info("Generating track html...");
                self.tracks.each(self.generateTrackHTML);
            }
        });

        this.page = 1;
        this.lastPage = 1;
        this.totalTracks = 0;
        this.tracks = [];

        // Creates the HTML code used to display the scrobbled track.
        // @param {object} track
        // @param {integer} index
        this.generateTrackHTML = function (trackData, index) {

            var theTrack = new Track(trackData),
                artist, title, album, thumb,
                el, imgEl, artistEl, nameEl, albumEl, btnsEl, metaEl, dateEl, deezerSearchBtnEl, lastFmBtnEl, googleBtnEl,
                missingImgEl = new Element('img.thumb.missing', { 'src': '', 'alt': 'Missing thumb', 'width': 128, 'height': 128 }),
                missingImgElClone,
                timestamp = 0, timestampFromNow = '', timestampCalendar = '',
                track = theTrack.data,
                durationEl = "",
                genre = "",
                genreEl = "",
                tags = [];

            // gather track data
            artist = track.artist.name;
            title = track.name;
            album = track.album['#text'];

            if (track.date) {
                timestamp = moment.unix(track.date.uts);
                timestampFromNow = timestamp.fromNow();
                timestampCalendar = timestamp.calendar();
            }

            if (track.info) {

                if (track.info.duration && +track.info.duration > 0) {
                    // Using plugin for moment.js to display duration in specific format
                    durationEl = '(' + moment.duration(+track.info.duration).format('m:ss') + ')';
                }

                if (track.info.toptags && track.info.toptags.tag && track.info.toptags.tag.length > 1) {

                    track.info.toptags.tag.each(function (tag, index) {
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
                'events': {
                    'click': function (e) {
                        // unselect previously selected
                        $$('li.selected').each(function (el, index) {
                            el.removeClass('selected');
                        });
                        // select new element
                        this.addClass('selected');
                    }
                }
            });

            if (index === 0) {

                el.addClass('first');

                // first track sets style of the page using the genre tags
                $(document.body).set("class", genre);

                if (track.image && track.image.length) {
                    $$('.background').set("style", "background-image:url(" + track.image[3]['#text'] + ")");
                    window.setTimeout(function () {
                        if (self.debug) console.info("starting getColorTag request", track.image[0]['#text']);
                        //self.requests.getColorTag.send('url=' + track.image[0]['#text']);
                    }, 5000);
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
                        'width': 128, 'height': 128,
                        'events': {
                            'click': function (e) {
                                location.href = track.url;
                            }
                        }
                    }).inject(el);
                } else {
                    imgEl = el.adopt(missingImgElClone);
                }

            }

            metaEl = new Element('div.meta').inject(el);
            btnsEl = new Element('div.btns').inject(el);
            artistEl = new Element('span.artist', { 'html': artist }).inject(metaEl);
            nameEl = new Element('span.name', { 'html': title }).inject(metaEl);
            albumEl = new Element('span.album', { 'html': album }).inject(metaEl);

            if (timestampCalendar.length && timestampFromNow.length) {
                dateEl = new Element('span.date', { 'html': '<span class="tilde">~</span>' + timestampCalendar + '<br /> or ' + timestampFromNow + ' ' + durationEl }).inject(metaEl);
            }

            // Buttons

            // @TODO: Should I create these ones outside of the foreach and then clone and adopt?
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
            lastFmBtnEl = new Element('a', {
                href: track.url,
                text: 'Last.fm',
                'class': 'extBtn lastfmBtn'
            }).inject(btnsEl);

            // @TODO: Should I create these ones outside of the foreach and then clone and adopt?
            googleBtnEl = new Element('a', {
                href: 'https://www.google.com/search?hl=en&q=' + encodeURIComponent(artist),
                text: 'Google',
                'class': 'extBtn googleBtn'
            }).inject(btnsEl);

            if (self.debug) console.info("Rendered Track", track);

            el.inject(self.recentTracksEl);

        };

        // Parses through the colors returns by getColorTag
        this.parseColors = function (jsonObj) {

            var len = jsonObj.tags.length,
            i = len,
            backgrColor = jsonObj.tags[0].label,
            textColor = jsonObj.tags[jsonObj.tags.length - 1].label,
            colors = [];

            while (i) {
                i--;
                colors.push({ 'yiq': getContrastYIQ(jsonObj.tags[i].color), 'hex': jsonObj.tags[i].color });
            }

            colors.sort(function (a, b) {
                return a.yiq - b.yiq;
            });

            backgrColor = colors[0].hex;
            textColor = colors[colors.length - 1].hex;

            $(document.body).set('style', 'background-color:' + backgrColor + ';color:' + textColor); $$("a").set('style', 'color:' + textColor);

        };

        // @param {array} tracks
        this.addRecentTracks = function () {

            self.loadingSpinnerEl.empty();
            
            self.recentTracksEl.empty();

            self.tracks.each(function (track, index) {
                self.requests.getTrackInfo.send('mbid=' + encodeURIComponent(track.mbid) + '&artist=' + encodeURIComponent(track.artist.name) + '&track=' + encodeURIComponent(track.name));
            });
        };

        // Getting the list of recent tracks from Last.fm
        // @returns Request.JSON for queuing
        this.getRecentTracks = function () {

            // @see http://mootools.net/docs/more/Request/Request.Queue
            // @see http://mootools.net/docs/core/Request/Request.JSON
            // @see http://mootools.net/docs/core/Request/Request
            return new Request.JSON({

                url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + encodeURIComponent(self.username) + '&api_key=' + encodeURIComponent(self.apiKey) + '&format=json&extended=1&limit=' + encodeURIComponent(self.perPage),

                onSuccess: function (jsonObj) {

                    //if (self.debug) console.info('onSuccess', jsonObj);

                    if (jsonObj.recenttracks && typeof jsonObj.recenttracks['@attr'] === 'undefined') {
                        console.error('Error retrieving tracks!', jsonObj);
                        return;
                    }

                    var attr = jsonObj.recenttracks['@attr'];

                    self.totalTracks = attr.total;
                    self.lastPage = attr.totalPages;

                    self.totalNrPagesEl.set('text', self.lastPage);
                    self.nrTotalTracksEl.set('text', self.totalTracks);
                    self.nrrecentTracksEl.set('text', self.perPage);

                    self.userIdEl.set('text', attr.user + "'s");

                    self.tracks = jsonObj.recenttracks.track;

                    self.addRecentTracks();

                    self.nav.init(self);

                }

            });

        };

        // @param {object} track
        // @param {function} callback
        this.getTrackInfo = function () {

            // This a Request.Queue so it can be used in the getrecenttracks request
            return new Request.JSON({

                url: 'http://ws.audioscrobbler.com/2.0/?method=track.getInfo&user=' + encodeURIComponent(self.username) + '&api_key=' + encodeURIComponent(self.apiKey) + '&autocorrect=1&format=json',

                onRequest: function (jsonObj) {
                    self.loadingSpinnerEl.set('text', 'Loading track info...');
                },

                onSuccess: function (jsonObj) {

                    //console.info('onSuccess getTrackInfo', jsonObj.track);

                    var info = jsonObj.track;

                    // find the track we just updated and add the meta data
                    self.tracks.each(function (track, index) {
                        if (track.mbid === info.mbid) {
                            self.tracks[index].info = info;
                        }
                    });

                }

            });

        };

        // Returns color codes for the album art
        this.getColorTag = function () {
            return new Request.JSON({
                url: 'https://apicloud-colortag.p.mashape.com/tag-url.json?palette=w3c&sort=weight',
                headers: { 'X-Mashape-Authorization': 'XyzWpKDaet1l1rba7RgboqNPnqjKX6RA' },
                onRequest: function (jsonObj) {
                    self.loadingSpinnerEl.set('text', 'Loading album art colors...');
                },
                onSuccess: self.parseColors,
                onComplete: function (name, instance, text, xml) {
                    self.loadingSpinnerEl.empty();
                    //if (self.debug) console.info('onComplete queue: ' + name + ' response: ', text);
                },
                onError: function (text, error) {
                    console.error(text, error);
                }
            });
        };

        this.getDuckDuckGoInfo = function () {
            return new Request.JSON({
                url: 'https://duckduckgo-duckduckgo-zero-click-info.p.mashape.com/?no_html=1&no_redirect=1&skip_disambig=1&format=json',
                headers: { 'X-Mashape-Authorization': 'XyzWpKDaet1l1rba7RgboqNPnqjKX6RA' },
                method: 'get',
                onRequest: function (jsonObj) {
                    self.loadingSpinnerEl.set('text', 'Searching through DuckDuckGo ...');
                },
                onSuccess: function (jsonObj) {
                    console.info(jsonObj);
                },
                onComplete: function (name, instance, text, xml) {
                    self.loadingSpinnerEl.empty();
                    //if (self.debug) console.info('onComplete queue: ' + name + ' response: ', text);
                },
                onError: function (text, error) {
                    console.error(text, error);
                }
            });
        };

        // Collect all requests here

        this.requests = {
            'getRecentTracks': self.getRecentTracks(),
            'getTrackInfo': self.getTrackInfo(),
            'getColorTag': self.getColorTag(),
            'getDuckDuckGoInfo': self.getDuckDuckGoInfo()
        };

        this.myQueue.addRequest("getRecentTracks", this.requests.getRecentTracks);
        this.myQueue.addRequest("getTrackInfo", this.requests.getTrackInfo);
        //this.myQueue.addRequest("getColorTag", this.requests.getColorTag);

        this.requests.getRecentTracks.send('page=' + encodeURIComponent(self.page));

        var getTracksInterval = setInterval(this.requests.getRecentTracks.send, 1000 * 60 * .5);

        self.nav = new Nav({ 'lastFm': self });

    }

});

// @see http://mootools.net/docs/core/Utilities/DOMReady
window.addEvent('domready', function () {
    lastFm = new LastFm({ 'perPage': 7, 'debug': true });
});