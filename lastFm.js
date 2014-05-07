var Track = new Class({

    initialize: function (track) {
        this.data = track;
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

        this.loadingSpinnerEl = $('loadingSpinner');

        var page = 1,
            lastPage = 1,
            totalTracks = 0,
            tracks = [],

        // @see http://mootools.net/docs/core/Element/Element
            recentTracksEl = $('recentTracks'),
            pageNrEl = $('pageNr'),
            getPageBtnEl = $('getPageBtn'),
            getPagePrevEl = $('getPagePrev'),
            getPageNextEl = $('getPageNext'),
            totalNrPagesEl = $('totalNrPages'),
            nrrecentTracksEl = $('nrRecentTracks'),
            nrTotalTracksEl = $('nrTotalTracks'),
            userIdEl = $('userId'),

        // @param {object} track
        // @param {integer} index
        generateTrackHTML = function (trackData, index) {

            var theTrack = new Track(trackData),
                artist, title, album,
                el, imgEl, artistEl, nameEl, albumEl, btnsEl, metaEl, dateEl, deezerSearchBtnEl, lastFmBtnEl, googleBtnEl,
                missingImgEl = new Element('img.thumb.missing', { 'src': '', 'alt': 'Missing thumb', 'width': 64, 'height': 64 }),
                missingImgElClone,
                timestamp = 0, timestampFromNow = '', timestampCalendar = '',
                track = theTrack.data;

            // gather track data
            artist = track.artist.name;
            title = track.name;
            album = track.album['#text'];

            if (track.date) {
                timestamp = moment.unix(track.date.uts);
                timestampFromNow = timestamp.fromNow();
                timestampCalendar = timestamp.calendar();
            }

            // Creates a distinct missingImg for every track
            missingImgElClone = missingImgEl.clone();

            // @see http://mootools.net/docs/core/Element/Element
            el = new Element('li.track', {
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
            }

            // Gathering track elements

            if (track.image && track.image.length > 1 && track.image[1] && track.image[1]['#text'].length > 1) {
                imgEl = new Element('img.thumb', {
                    'src': track.image[1]['#text'],
                    'alt': track.image[1].size,
                    'width': 64, 'height': 64,
                    'events': {
                        'click': function (e) {
                            location.href = track.url;
                        }
                    }
                }).inject(el);
            } else {
                // @see: http://mootools.net/docs/core/Element/Element#Element:adopt
                imgEl = el.adopt(missingImgElClone);
            }

            metaEl = new Element('div.meta').inject(el);
            btnsEl = new Element('div.btns').inject(el);
            artistEl = new Element('span.artist', { 'html': artist }).inject(metaEl);
            nameEl = new Element('span.name', { 'html': title }).inject(metaEl);
            albumEl = new Element('span.album', { 'html': album }).inject(metaEl);

            if (timestampCalendar.length && timestampFromNow.length) {
                dateEl = new Element('span.date', { 'html': '<span class="tilde">~</span>' + timestampCalendar + ' or ' + timestampFromNow }).inject(metaEl);
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

            if (self.debug) console.info("Track", track);

            el.inject(recentTracksEl);

        },

        // @param {array} tracks
        addRecentTracks = function () {
            tracks.each(generateTrackHTML);
        },

        getRecentTracks = function () {

            // @see http://mootools.net/docs/core/Request/Request.JSON
            // @see http://mootools.net/docs/core/Request/Request
            var request = new Request.JSON({

                url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + encodeURIComponent(self.username) + '&api_key=' + encodeURIComponent(self.apiKey) + '&format=json&page=' + encodeURIComponent(page) + '&extended=1&limit=' + encodeURIComponent(self.perPage),

                onRequest: function () {
                    if (self.debug) console.info('onRequest');
                    self.loadingSpinnerEl.set('text', 'Loading...');
                },

                onSuccess: function (jsonObj) {
                    if (self.debug) console.info('onSuccess', jsonObj);

                    if (jsonObj.recenttracks && typeof jsonObj.recenttracks['@attr'] === 'undefined') {
                        console.error('Error retrieving tracks!', jsonObj);
                        setTimeout(function () {
                            getRecentTracks();
                        }, 2000);
                        return;
                    }

                    var attr = jsonObj.recenttracks['@attr'];

                    totalTracks = attr.total;
                    lastPage = attr.totalPages;

                    totalNrPagesEl.set('text', lastPage);
                    nrTotalTracksEl.set('text', totalTracks);
                    nrrecentTracksEl.set('text', self.perPage);
                    userIdEl.set('text', attr.user + "'s");

                    self.loadingSpinnerEl.empty();
                    recentTracksEl.empty();

                    tracks = jsonObj.recenttracks.track;

                    addRecentTracks();

                    nav.init(page);

                },

                onComplete: function (jsonObj) {
                    if (self.debug) console.info('onComplete', jsonObj);
                },

                onError: function (text, error) {
                    console.error(text, error);
                },

                onFailure: function (xhr) {
                    console.error(xhr);
                }

                /* For testing
                , data: {
                json: JSON.encode(data)
                }
                */

            }).send();

        },

        nav = {

            init: function (page) {
                page = nav.isAtStart(page);
                page = nav.isAtEnd(page);
                return page;
            },

            isAtStart: function (page) {
                var atStart = (page === 1) ? true : false;
                if (atStart) {
                    page = 1;
                    getPagePrevEl.disabled = true;
                } else {
                    getPagePrevEl.disabled = false;
                }
                return page;
            },

            isAtEnd: function (page) {
                var atEnd = (page === parseInt(lastPage, 10)) ? true : false;
                if (atEnd) {
                    page = parseInt(lastPage, 10);
                    getPageNextEl.disabled = true;
                } else {
                    getPageNextEl.disabled = false;
                }
                return page;
            },

            getPage: function (e) {
                e.preventDefault();
                page = pageNrEl.value;
                page = nav.init(page);
                if (self.debug) console.info('Clicked getPageBtn', page);
                getRecentTracks();
            },

            getPrevPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNrEl.value, 10) - 1;
                page = nav.init(page);
                pageNrEl.value = page;
                if (self.debug) console.info('getPagePrev', page);
                getRecentTracks();
            },

            getNextPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNrEl.value, 10) + 1;
                page = nav.init(page);
                pageNrEl.value = page;
                if (self.debug) console.info('getPageNext', page);
                getRecentTracks();
            }

        };

        pageNrEl.addEvent('blur', nav.getPage);
        getPageBtnEl.addEvent('click', nav.getPage);
        getPagePrevEl.addEvent('click', nav.getPrevPage);
        getPageNextEl.addEvent('click', nav.getNextPage);

        getRecentTracks();

        var getTracksInterval = setInterval(getRecentTracks, 1000 * 60 * 3);

    },

    // @param {object} track
    // @param {function} callback
    getTrackInfo: function (track) {

        var self = this,
            track = (typeof track !== "undefined") ? track : { 'artist': '', 'name': '', 'mbid': '' },

            artist = track.artist.name || '',
            name = track.name || '',
            mbid = track.mbid || '',

            request = new Request.JSON({

                url: 'http://ws.audioscrobbler.com/2.0/?method=track.getInfo&user=' + encodeURIComponent(self.username) + '&api_key=' + encodeURIComponent(self.apiKey) + '&mbid=' + encodeURIComponent(mbid) + '&artist=' + encodeURIComponent(artist) + '&track=' + encodeURIComponent(name) + '&autocorrect=1&format=json',

                onRequest: function (jsonObj) {
                    self.loadingSpinnerEl.set('text', 'Loading track info...');
                },

                onSuccess: function (jsonObj) {
                    self.loadingSpinnerEl.empty();
                    console.info('onSuccess', jsonObj);
                    return jsonObj.track;
                },

                onComplete: function (jsonObj) {
                    if (self.debug) console.info('onComplete', jsonObj);
                },

                onError: function (text, error) {
                    console.error(text, error);
                },

                onFailure: function (xhr) {
                    console.error(xhr);
                }

            }).send();

    },

    getDeezerUser: function (userid) {

        var request = new Request.JSON({

            url: 'http://api.deezer.com/user/' + encodeURIComponent(userid) + '&output=jsonp',

            onRequest: function () {
                if (self.debug) console.info('onRequest');
            },

            onSuccess: function (jsonObj) {
                console.info('onSuccess', jsonObj);
            },

            onComplete: function (jsonObj) {
                if (self.debug) console.info('onComplete', jsonObj);
            },

            onError: function (text, error) {
                console.error(text, error);
            },

            onFailure: function (xhr) {
                console.error(xhr);
            }

            /* For testing
            , data: {
            json: JSON.encode(data)
            }
            */

        }).send();

    }

});

// @see http://mootools.net/docs/core/Utilities/DOMReady
window.addEvent('domready', function () {
    lastFm = new LastFm({ 'perPage': 15 });
});