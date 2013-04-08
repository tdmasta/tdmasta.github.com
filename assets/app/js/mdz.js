Modernizr.load({
	test : Modernizr.websockets && window.JSON,
	nope: 'functional-polyfills.js',
	complete: function() {
		e = document.getElementById('fixed');
//		console.log('element', e);
		scope = angular.element(e).scope();
//		console.log('scope', scope);
	}
});