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
        loadingSpinnerEl = $('loadingSpinner'),
        recentTracksEl = $('recentTracks'),
        pageNrEl = $('pageNr'),
        getPageBtnEl = $('getPageBtn'),
        getPagePrevEl = $('getPagePrev'),
        getPageNextEl = $('getPageNext'),
        totalNrPagesEl = $('totalNrPages'),
        nrrecentTracksEl = $('nrRecentTracks'),
        nrTotalTracksEl = $('nrTotalTracks'),
        userIdEl = $('userId'),


        addRecentTracks = function (tracks) {

            var artist, title, album,
                el, imgEl, artistEl, nameEl, albumEl, btnsEl, metaEl, dateEl, deezerSearchBtnEl, lastFmBtnEl, googleBtnEl,
                missingImgEl = new Element('img.thumb.missing', { 'src': '', 'alt': 'Missing thumb' }),
                missingImgElClone,
                timestamp, timestampFromNow, timestampCalendar;

            // @see http://mootools.net/docs/core/Types/Array
            tracks.each(function (track, index) {

                artist = track.artist.name;
                title = track.name;
                album = track.album['#text'];

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

                timestamp = moment.unix(track.date.uts);
                timestampFromNow = timestamp.fromNow();
                timestampCalendar = timestamp.calendar();

                dateEl = new Element('span.date', { 'html': '~ ' + timestampCalendar + ' or ' + timestampFromNow }).inject(metaEl);

                // Buttons
                deezerSearchBtnEl = new Element('a', {
                    href: '#',
                    text: 'Deezer',
                    events: {
                        click: function (e) {
                            e.preventDefault();
                            deezerSearch(artist + ' ' + title);
                        }
                    },
                    'class': 'extBtn deezerBtn'
                }).inject(btnsEl);

                lastFmBtnEl = new Element('a', {
                    href: track.url,
                    text: 'Last.fm',
                    'class': 'extBtn lastfmBtn'
                }).inject(btnsEl);

                googleBtnEl = new Element('a', {
                    href: 'https://www.google.com/search?hl=en&q=' + encodeURIComponent(artist),
                    text: 'Google',
                    'class': 'extBtn googleBtn'
                }).inject(btnsEl);

                console.info("Track", track);

                el.inject(recentTracksEl);

            });

        },

        getRecentTracks = function () {

            // @see http://mootools.net/docs/core/Request/Request.JSON
            // @see http://mootools.net/docs/core/Request/Request
            var request = new Request.JSON({

                url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + '&format=json&page=' + page + '&extended=1',

                onRequest: function () {
                    console.info('onRequest');
                    loadingSpinnerEl.set('text', 'Loading...');
                },

                onSuccess: function (jsonObj) {
                    console.info('onSuccess', jsonObj);

                    totalTracks = jsonObj.recenttracks['@attr'].total;
                    lastPage = jsonObj.recenttracks['@attr'].totalPages;
                    perPage = jsonObj.recenttracks['@attr'].perPage;

                    totalNrPagesEl.set('text', lastPage);
                    nrTotalTracksEl.set('text', totalTracks);
                    nrrecentTracksEl.set('text', perPage);
                    userIdEl.set('text', jsonObj.recenttracks['@attr'].user + "'s");

                    loadingSpinnerEl.empty();
                    recentTracksEl.empty();

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
                console.info('Clicked getPageBtn', page);
                getRecentTracks();
            },

            getPrevPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNrEl.value, 10) - 1;
                page = nav.init(page);
                pageNrEl.value = page;
                console.info('getPagePrev', page);
                getRecentTracks();
            },

            getNextPage: function (e) {
                e.preventDefault();
                page = parseInt(pageNrEl.value, 10) + 1;
                page = nav.init(page);
                pageNrEl.value = page;
                console.info('getPageNext', page);
                getRecentTracks();
            }

        };

    pageNrEl.addEvent('blur', nav.getPage);
    getPageBtnEl.addEvent('click', nav.getPage);
    getPagePrevEl.addEvent('click', nav.getPrevPage);
    getPageNextEl.addEvent('click', nav.getNextPage);

    getRecentTracks();

    var getTracksInterval = setInterval(getRecentTracks, 1000 * 60 * 3);

});