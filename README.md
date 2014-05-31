LastFm Mootools Test App
========================

Intro
-----
Just a test project to learn about [Mootools Core](http://mootools.net/docs/core).
Using the [Last.fm API user.getRecentTracks](http://www.last.fm/api/show/user.getRecentTracks).
Also using the cool [Deezer API](http://developers.deezer.com/api/).
Uses [momentjs](http://momentjs.com/) for brilliant time and date parsing.
Background image found on [subtlepatterns](http://subtlepatterns.com/tag/dark/).
JavaScript concatenation done with [UglifyJS2](https://github.com/mishoo/UglifyJS2).

Current version: 0.3.2

Source
------
Check out the [source on Github](https://github.com/johanbove/LastFmMootoolsTestsite).

Demo
----
[Demo site](http://scrobbled.johanbove.info/)

Plans
-----
- [x] Learn more about [MooTools](http://mootools.net/docs/core/Core/Core).
- [ ] Use a templating engine, like [used in sammyjs](http://sammyjs.org/docs/tutorials/json_store_1). This would replace having to create DOM elements on the fly.
- [ ] Create a Sammy application doing the same thing.
- [ ] Create a Knockoutjs + jQuery version of this application.
- [x] Pagination: add in multiple pages to browse through the history of tracks.
- [x] Make it look pretty.
- [x] Split up the files into CSS, JavaScript, HTML, etc.            
- [ ] Cross-reference with [Deezer](http://www.deezer.com):
  - [x] Set up a [Test Deezer app](http://developers.deezer.com/myapps/app/136181)
  - [ ] Add number of times played to the track history (requires Deezer authorization).
  - [x] Add scrobbled tracks back to Deezer track pages: look up track on Deezer using data from last.fm.
  - [ ] Add tracks to favourites playlist (requires Deezer authorization).
- [x] Add Google search link for artist.
- [x] Add a timer which reloads the tracks every 3 minutes or so.
- [x] Add moment.js to show the time since the playback.
- [x] Fix the time-zone difference in the played timestamp.
- [x] Highlight currently playing track.
- [x] Make the history list look better:
  - [x] Display the tracks in a more modern "cards" display.
  - [x] ~~Or even better, allow the user to display the tracks in either list or cards layout.~~
  - [x] Show the artist picture in the list.
  - [x] Fix layout to look better on small screens: less text wrapping and general mobile viewport optimization.
- [ ] Link with Push Notifications: every time a new song is playing.
- [ ] Every time a song is added, take a picture using the webcam and track location data of the browser where the app currently is opened.
- [ ] Allow to enter any last.fm user id to check what other people are listening to.
- [x] Optimize page loading by keeping all files local and concatenate the JavaScript, using Uglify2.
- [ ] Move the Deezer JavaScript alert to a custom dialog element inside the page since it's not working in IE with high security settings active.
- [ ] Add browser history for pagination and URL hash tags for bookmarking (?)
- [x] Add currently playing status for the first song in the list if start time + duration is before now. Challenge: Last.fm is not returning the duration of the track in the original request.
- [ ] Add SoundCloud artist lookup!
- [ ] i18n fun: add NL, FR, etc.
- [x] ~~Make it possible to toggle the long introduction out of the way.~~
- [x] Moved the text section to the bottom of the page.
- [x] Used bigger images for more flexibility.
- [x] Removed background styling of the section and tracks. Looks better!
- [x] Implemented Mootools More plugin "Request.Queue" and change requests with the queue to prevent callback hell.
- [x] Add song duration from Last.fm if available.
- [ ] Add nice "loading spinner".
- [x] Renamed the domain to "scrobbled".
- [x] Change the background image of the page using the genre / album cover of the current active song.
- [x] Link up with DuckDuckGo to get more information about the artists.
- [x] Move nav to separate Class.
- [ ] Make sure only new tracks are added to the initial page. Avoid page refreshes.
- [x] ~~Try out Brackets as an IDE.~~
- [ ] Instead of keeping todo's in this list, use GitHub "issues".
- [x] Use JSHint for JS code quality checks.
- [ ] Add JS unit testing framework.