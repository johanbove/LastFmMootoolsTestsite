var Deezer = new Class({

    Implements: Options,

    options: {
        username: 'Johan Bové',
        appId: '136181',
        channelUrl: 'http://deezertest.johanbove.info/channel.html'
    },

    initialize: function (options) {

        this.setOptions(options);

        var self = this,
            username = this.options.username,
            appId = this.options.appId,
            channelUrl = this.options.channelUrl;

        // @see: http://developers.deezer.com/sdk/javascript/init
        window.dzAsyncInit = function () {

            DZ.init({
                appId: appId,
                channelUrl: channelUrl
            });

            // @TODO: this doesn't seem to trigger...
            DZ.ready(function (sdk_options) {
                console.log('DZ SDK is ready', sdk_options);
                user(username);
            });

            user(username);

        };

    },

    // @param {string} userName
    user: function (username) {
        // Gets public information for a Deezer user
        DZ.api('search/user?q=' + encodeURIComponent(username), function (response) {
            console.info('getDeezerInfo', response.data[0]);
        });
    },

    // @param {string} q
    search: function (q) {

        console.info('deezerSearch', q);

        DZ.api('search?q=' + encodeURIComponent(q), function (response) {

            console.info('deezerSearch', response);

            var total = response.total,
                firstResult = null,
                i18n = {
                    hit: 'hit',
                    hits: 'hits'
                }

            if (total === undefined || total === 0) {

                if (confirm('Sorry! Nothing found on Deezer for:\n' + q + '\n\nTry again?')) {
                    window.open('http://www.deezer.com/search/' + q.replace(/"/g, ""));
                };

            } else {

                firstResult = response.data[0];

                var txtNrHits = (total === 1) ? i18n.hit : i18n.hits,
                    openLinkTxt = "Open first Deezer track page?",
                    txtHitsConfirm = 'Found ' + total + ' ' + txtNrHits + '!\n"' + firstResult.title + '" by ' + firstResult.artist.name + '\n\n',
                    linkToOpen = firstResult.link;

                if (total > 1) {
                    openLinkTxt = "%s tracks were found. Open Deezer results page?".replace('%s', total);
                    linkToOpen = 'http://www.deezer.com/search/' + q.replace(/"/g, "");
                }

                txtHitsConfirm += openLinkTxt;

                if (confirm(txtHitsConfirm)) {
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

var deezer = new Deezer();