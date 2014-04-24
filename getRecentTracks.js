// @see http://mootools.net/docs/core/Utilities/DOMReady
window.addEvent('domready', function () {

    //console.info("domReady!");

    var username = 'joe-1',     // lastfm
        apiKey = '6944bec73e711c56ae9955c77d642c98',
        page = 1,
        lastPage = 1,
        totalTracks = 0,
        perPage = 10,

    // @see http://mootools.net/docs/core/Element/Element
        loadingSpinner = $('loadingSpinner'),
        recentTracks = $('recentTracks'),
        pageNr = $('pageNr'),
        getPageBtn = $('getPageBtn'),
        getPagePrev = $('getPagePrev'),
        getPageNext = $('getPageNext'),
        totalNrPages = $('totalNrPages'),
        nrRecentTracks = $('nrRecentTracks'),
        nrTotalTracks = $('nrTotalTracks'),

        addRecentTracks = function (tracks) {

            var el, img, artist, name, album, btns, meta, date, deezerSearchBtn, lastFmBtn, googleBtn,
                missingImg = new Element('img.thumb.missing', { 'src': '', 'alt': 'Missing thumb' });

            // @see http://mootools.net/docs/core/Types/Array
            tracks.each(function (track, index) {

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

                if (track.image && track.image.length && track.image[1] && track.image[1]['#text'].length) {
                    img = new Element('img.thumb', {
                        'src': track.image[1]['#text'],
                        'alt': track.image[1].size,
                        'events': {
                            'click': function (e) {
                                location.href = track.url;
                            }
                        }
                    }).inject(el);
                } else {
                    img = missingImg.inject(el);
                }

                meta = new Element('div.meta').inject(el);
                btns = new Element('div.btns').inject(el);
                
                artist = new Element('span.artist', { 'html': track.artist['#text'] }).inject(meta);
                name = new Element('span.name', { 'html': track.name }).inject(meta);
                album = new Element('span.album', { 'html': track.album['#text'] }).inject(meta);
                date = new Element('span.date', { 'html': track.date['#text'] }).inject(meta);

                // Buttons
                deezerSearchBtn = new Element('a', {
                    href: '#',
                    text: 'Deezer',
                    events: {
                        click: function (e) {
                            e.preventDefault();
                            //deezerSearch('"' + track.artist['#text'] + '" "' + track.name + '"');
                            deezerSearch(track.artist['#text'] + ' ' + track.name);
                        }
                    },
                    'class': 'extBtn deezerBtn'
                }).inject(btns);

                lastFmBtn = new Element('a', {
                    href: track.url,
                    text: 'Last.fm',
                    'class': 'extBtn lastfmBtn'
                }).inject(btns);

                googleBtn = new Element('a', {
                    href: 'https://www.google.com/search?hl=en&q=' + encodeURIComponent(track.artist['#text']),
                    text: 'Google',
                    'class': 'extBtn googleBtn'
                }).inject(btns);

                console.info("Track", track);

                el.inject(recentTracks);

            });

        },

        getRecentTracks = function () {

            // @see http://mootools.net/docs/core/Request/Request.JSON
            // @see http://mootools.net/docs/core/Request/Request
            var request = new Request.JSON({

                url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + '&format=json&page=' + page,

                onRequest: function () {
                    console.info('onRequest');
                    loadingSpinner.set('text', 'Loading...');
                },

                onSuccess: function (jsonObj) {
                    console.info('onSuccess', jsonObj);

                    totalTracks = jsonObj.recenttracks['@attr'].total;
                    lastPage = jsonObj.recenttracks['@attr'].totalPages;
                    perPage = jsonObj.recenttracks['@attr'].perPage;

                    totalNrPages.set('text', lastPage);
                    nrTotalTracks.set('text', totalTracks);
                    nrRecentTracks.set('text', perPage);

                    loadingSpinner.empty();
                    recentTracks.empty();

                    addRecentTracks(jsonObj.recenttracks.track);

                    nav.init(page);

                },

                onComplete: function (jsonObj) {
                    console.info('onComplete', jsonObj);
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

        getDeezerUser = function () {

            var request = new Request.JSON({

                url: 'http://api.deezer.com/user/' + userid + '&output=jsonp',

                onRequest: function () {
                    console.info('onRequest');
                },

                onSuccess: function (jsonObj) {
                    console.info('onSuccess', jsonObj);
                },

                onComplete: function (jsonObj) {
                    console.info('onComplete', jsonObj);
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
                    getPagePrev.disabled = true;
                } else {
                    getPagePrev.disabled = false;
                }
                return page;
            },

            isAtEnd: function (page) {
                var atEnd = (page === parseInt(lastPage, 10)) ? true : false;
                if (atEnd) {
                    page = parseInt(lastPage, 10);
                    getPageNext.disabled = true;
                } else {
                    getPageNext.disabled = false;
                }
                return page;
            },

            getPage: function (e) {
                e.preventDefault();
                page = pageNr.value;
                page = nav.init(page);
                console.info('Clicked getPageBtn', page);
                getRecentTracks();
            },

            getPrevPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNr.value, 10) - 1;
                page = nav.init(page);
                pageNr.value = page;
                console.info('getPagePrev', page);
                getRecentTracks();
            },

            getNextPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNr.value, 10) + 1;
                page = nav.init(page);
                pageNr.value = page;
                console.info('getPageNext', page);
                getRecentTracks();
            }

        };

    pageNr.addEvent('blur', nav.getPage);
    getPageBtn.addEvent('click', nav.getPage);
    getPagePrev.addEvent('click', nav.getPrevPage);
    getPageNext.addEvent('click', nav.getNextPage);

    getRecentTracks();

    var getTracksInterval = setInterval(getRecentTracks, 1000 * 60 * 3);

});