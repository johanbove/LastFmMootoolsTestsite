/* Unit tests go here */

// From the QUnit Cookbook: http://qunitjs.com/cookbook/
QUnit.test("global pollution", function( assert ) {
  window.pollute = true;
  assert.ok( pollute, "nasty pollution" );
});

QUnit.test("Track", function (assert) {	
	// Testing creation of a Track object
	var aTrack = new Track({'title': 'The Test'});	
	assert.ok(aTrack.data.title === 'The Test', "Expecting track with title The Test");	
});

QUnit.test("Nav", function (assert) {
	// Testing navigation Nav object
	var myNav = new Nav();
	// Setting lastPage to 2 because it would be 1
	myNav.lastPage = 2;
	assert.ok(myNav.isAtStart() === true, "Expecting nav to start at the beginning");
	assert.ok(myNav.isAtEnd() === false, "Expecting nav not to be at the end");

});

// TODO: add HTML fixtures
QUnit.test("lastFm basics", function (assert) {
	var mylastFm = new LastFm({ 'perPage': 1 });
	mylastFm.init();
	// Testing LastFm object
	assert.ok(mylastFm.username.length > 0, "Expecting a username");
	assert.ok(mylastFm.nav.page === 1, "Expecting nav of lastfm page to start at page 1");
});

/* TODO: fix this	
QUnit.asyncTest("async1", function(assert) {	
	var mylastFm = new LastFm({ 'perPage': 1 });
	mylastFm.getRecentTrackSuccess = function() {
		assert.ok(mylastFm.tracks.length > 0, "Expecting tracks");
		start();
	}
	mylastFm.init();	
});
*/