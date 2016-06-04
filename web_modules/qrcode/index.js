var $qrcode = $('<div class="qrcode mod--hidden"/>')
	.appendTo('body')
	.qrcode(window.location.href);
jwerty.key('esc', function() {
	$qrcode.toggleClass('mod--hidden')
});

module.exports = $qrcode;