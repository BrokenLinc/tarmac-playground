var QRCode = require('qrcode');
//var GameScene = require('./entities/collectorgamescene');
//var GameScene = require('./entities/twentyfortyeightscene');
var GameScene = require('./entities/hexgamescene');

// super basic setup, no sprites or sounds
tarmac.start = function(){
	tarmac.addEntity(new GameScene());
};
tarmac.setup();