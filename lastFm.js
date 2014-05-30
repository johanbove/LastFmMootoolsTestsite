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
                tracks.each(generateTrackHTML);
            }
        });

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
                artist, title, album, thumb,
                el, imgEl, artistEl, nameEl, albumEl, btnsEl, metaEl, dateEl, deezerSearchBtnEl, lastFmBtnEl, googleBtnEl,
                missingImgEl = new Element('img.thumb.missing', { 'src': '', 'alt': 'Missing thumb', 'width': 128, 'height': 128 }),
                missingImgElClone,
                timestamp = 0, timestampFromNow = '', timestampCalendar = '',
                track = theTrack.data,
                durationEl = "";

            // gather track data
            artist = track.artist.name;
            title = track.name;
            album = track.album['#text'];

            if (track.date) {
                timestamp = moment.unix(track.date.uts);
                timestampFromNow = timestamp.fromNow();
                timestampCalendar = timestamp.calendar();
            }

            if (track.info && track.info.duration && +track.info.duration > 0) {
                durationEl = '(' + moment.duration(+track.info.duration).format('m:ss') + ')';
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

            el.inject(recentTracksEl);

        },

        // @param {array} tracks
        addRecentTracks = function () {
            tracks.each(function (track, index) {
                self.requests.getTrackInfo.send('mbid=' + encodeURIComponent(track.mbid) + '&artist=' + encodeURIComponent(track.artist.name) + '&track=' + encodeURIComponent(track.name));
            });
        },

        // Getting the list of recent tracks from Last.fm
        // @returns Request.JSON for queuing
        getRecentTracks = function () {

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

                }

            });

        },

        // @param {object} track
        // @param {function} callback
        getTrackInfo = function () {

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
                    tracks.each(function (track, index) {
                        if (track.mbid === info.mbid) {
                            tracks[index].info = info;
                        }
                    });

                }

            });

        },

        // @TODO: should probably be it's own Class
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
                self.requests.getRecentTracks.send('page=' + encodeURIComponent(page));
            },

            getPrevPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNrEl.value, 10) - 1;
                page = nav.init(page);
                pageNrEl.value = page;
                if (self.debug) console.info('getPagePrev', page);
                self.requests.getRecentTracks.send('page=' + encodeURIComponent(page));
            },

            getNextPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNrEl.value, 10) + 1;
                page = nav.init(page);
                pageNrEl.value = page;
                if (self.debug) console.info('getPageNext', page);
                self.requests.getRecentTracks.send('page=' + encodeURIComponent(page));
            }

        };

        pageNrEl.addEvent('blur', nav.getPage);
        getPageBtnEl.addEvent('click', nav.getPage);
        getPagePrevEl.addEvent('click', nav.getPrevPage);
        getPageNextEl.addEvent('click', nav.getNextPage);

        // Collect all requests here

        this.requests = {
            'getRecentTracks': getRecentTracks(),
            'getTrackInfo': getTrackInfo()
        };

        this.myQueue.addRequest("getRecentTracks", this.requests.getRecentTracks);
        this.myQueue.addRequest("getTrackInfo", this.requests.getTrackInfo);

        this.requests.getRecentTracks.send('page=' + encodeURIComponent(page));

        var getTracksInterval = setInterval(this.requests.getRecentTracks.send, 1000 * 60 * 3);

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