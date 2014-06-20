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
	
	QUnit.test("Nav properties", function(assert) {
		assert.ok(myNav.page === 1, "Expecting current page to be 1");
		assert.ok(myNav.lastPage === 2, "Expecting last page to be 2");
	});
	
});