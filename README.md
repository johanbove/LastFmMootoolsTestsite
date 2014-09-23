LastFm Mootools Test App
========================

Intro
-----
"Scrobbled" is the code name of this project.

I created it to learn all about [Mootools Core](http://mootools.net/docs/core) and improve my JavaScript project development skills.

The application is using Mootools because that was one of the libraries I hadn't really looked at before. This project also allows me to learn how to apply third-party API's and use tools which are common in modern JS projects.

The app is consuming public API's from [Last.fm API user.getRecentTracks](http://www.last.fm/api/show/user.getRecentTracks), [Deezer API](http://developers.deezer.com/api/) and [DuckDuckGo Zero-click Info API](https://www.mashape.com/duckduckgo/duckduckgo-zero-click-info#!documentation) for artist info lookups.

JavaScript concatenation is done with [UglifyJS2](https://github.com/mishoo/UglifyJS2). It implements [momentjs](http://momentjs.com/) for brilliant time and date parsing. The JavaScript code is also ''linted'' using command-line jsLint.

CSS is being pre-processed using [LESS](http://lesscss.org/).

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Source
------
Check out the [source on Github](https://github.com/johanbove/LastFmMootoolsTestsite).

Demo
----
[Demo site](http://scrobbled.johanbove.info/)

Plans
-----
[GitHub Issues](https://github.com/johanbove/LastFmMootoolsTestsite/issues)
