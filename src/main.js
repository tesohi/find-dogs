import Phaser from 'phaser'

import MainScene from './scenes/MainScene'

const config = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.RESIZE, 
		parent: 'app',
		autoCenter: Phaser.Scale.CENTER_BOTH 
	},
	scene: [MainScene],
};

export default new Phaser.Game(config);
