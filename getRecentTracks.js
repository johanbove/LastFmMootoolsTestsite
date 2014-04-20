// @see http://mootools.net/docs/core/Utilities/DOMReady
window.addEvent('domready', function () {

    //console.info("domReady!");

    var username = 'joe-1',
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

            // @see http://mootools.net/docs/core/Types/Array
            tracks.each(function (track) {

                // @see http://mootools.net/docs/core/Element/Element
                var el = new Element('li.track'),
                    a = new Element('a', {
                        href: track.url
                    }).inject(el),
                    date = new Element('span.date', { 'html': track.date['#text'] }).inject(a),
                    artist = new Element('span.artist', { 'html': track.artist['#text'] }).inject(a),
                    name = new Element('span.name', { 'html': track.name }).inject(a), album = new Element('span.album', { 'html': track.album['#text'] }).inject(a);

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

});