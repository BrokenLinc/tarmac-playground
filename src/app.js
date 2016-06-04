var QRCode = require('qrcode');
var GameScene = require('./entities/gamescene');

// super basic setup, no sprites or sounds
tarmac.start = function(){
	tarmac.addEntity(new GameScene());
};
tarmac.setup();