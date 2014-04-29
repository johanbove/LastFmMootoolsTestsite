LastFmMootoolsTestsite
======================

Intro
-----
Just a test project to learn about [Mootools Core](http://mootools.net/docs/core).
Using the [Last.fm API user.getRecentTracks](http://www.last.fm/api/show/user.getRecentTracks).
Also using the cool [Deezer API](http://developers.deezer.com/api/).
Uses [momentjs](http://momentjs.com/) for brilliant time and date parsing.
Background image found on [subtlepatterns](http://subtlepatterns.com/tag/dark/).
JavaScript concatenation done with [UglifyJS2](https://github.com/mishoo/UglifyJS2).

Demo
----
[Demo site](http://deezertest.johanbove.info/)

Plans
-----
- [ ] Learn more about [MooTools](http://mootools.net/docs/core/Core/Core).
- [x] Pagination: add in multiple pages to browse through the history of tracks.
- [x] Make it look pretty.
- [x] Split up the files into CSS, JavaScript, HTML, etc.            
- Cross-reference with [Deezer](http://www.deezer.com):
  - [x] Set up a [Test Deezer app](http://developers.deezer.com/myapps/app/136181)
  - [ ] Add number of times played to the track history (requires Deezer authorization)
  - [x] Add scrobbled tracks back to Deezer track pages: look up track on Deezer using data from last.fm.
  - [ ] Add tracks to favourites playlist (requires Deezer authorization)
- [x] Add Google search link for artist.
- [x] Add a timer which reloads the tracks every 3 minutes or so.
- [x] Add moment.js to show the time since the playback.
- [x] Fix the time-zone difference in the played timestamp.
- [x] Highlight currently playing track.
- [ ] Make the history list look better:
  - [ ] Display the tracks in a more modern "cards" display. Or even better, allow the user to display the tracks in either list or cards layout.
  - [x] Show the artist picture in the list.
  - [ ] Fix layout to look better on small screens: less text wrapping.
- [ ] Link with Push Notifications: every time a new song is playing.
- [ ] Every time a song is added, take a picture using the webcam and track location data of the browser where the app currently is opened.
- [ ] Allow to enter any last.fm user id to check what other people are listening to.
- [x] Optimize page loading by keeping all files local and concatenate the JavaScript, using Uglify2