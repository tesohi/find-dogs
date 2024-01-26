import Phaser from "phaser";

const OUTLINE_ANIMATION_FRAMES_COUNT = 8;
const DOGS_COUNT = 5;

const START_GAME_TIMEOUT = 3000;

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.isGameInProgress = false;
    this.dogsFound = 0;

    this.bgImage = null;
    this.coverBackground = null;

    this.doggies = [];

    this.playButtonContainer = null;

    this.logo = null;
    this.endScreenTitle = null;
    this.endScreenSubtitle = null;
    this.charImage = null;

    this.startScreenTitle = null;
    this.startScreenSubtitle = null;
    this.startScreenDoggy = null;
    this.startScreenContainer = null;

    this.startScreenGroup = null;
    this.gameScreenGroup = null;
    this.endScreenGroup = null;
  }

  preload() {
    this.load.image("bg", "assets/back_five_dogs.jpg");
    this.load.image("doggy", "assets/doggy.png");
    this.load.image("circle", "assets/circle.png");

    for (let i = 1; i <= OUTLINE_ANIMATION_FRAMES_COUNT; i++) {
      this.load.image(`circle${i}`, `assets/circle_${i}.png`);
    }

    this.load.image("button", "assets/btn.png");
    this.load.image("char", "assets/char.png");
    this.load.image("logo", "assets/logo.png");
    this.load.image("sparkle", "assets/sparkle.png");
  }

  createBackgrounds() {
    this.bgImage = this.add.image(0, 0, "bg").setOrigin(0, 0);
    this.coverBackground = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.9)
      .setOrigin(0, 0)
      .setAlpha(0);

    this.gameScreenGroup.add(this.bgImage);
  }

  createOutlineAnimation() {
    this.anims.create({
      key: "outlineAnimation",
      frames: (() => {
        const frames = [];
        for (let i = 1; i <= OUTLINE_ANIMATION_FRAMES_COUNT; i++) {
          frames.push({ key: `circle${i}` });
        }
        return frames;
      })(),
      frameRate: 24,
      repeat: 0,
    });
  }

  createDogs() {
    for (let i = 0; i < DOGS_COUNT; i++) {
      const doggy = this.add.image(0, 0, "doggy").setInteractive();
      const container = this.add.container(0, 0, [doggy]);
      container.isOutlined = false;
      container.doggy = doggy;

      this.doggies.push(container);

      this.gameScreenGroup.add(container);
    }
  }

  createPlayButton() {
    const button = this.add.image(0, 0, "button").setInteractive();

    const buttonText = this.add
      .text(button.x, button.y, "Play Now", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.playButtonContainer = this.add.container(0, 0, [button, buttonText]);

    this.playButtonContainer.setDepth(2);

    button.on("pointerdown", () => {
      window.location.href = "https://www.g5.com/";
    });
  }

  createStartScreenElements() {
    this.startScreenTitle = this.add
      .text(0, 0, "5 hidden dogs", {
        font: "bold 50px Arial",
        color: "#ffffff",
        align: "center",
        shadow: {
          blur: 10,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.startScreenDoggy = this.add
      .image(0, 0, "doggy")
      .setOrigin(0.5)
      .setFlipX(true);

    this.startScreenSubtitle = this.add
      .text(0, 0, "Can you spot them?", {
        font: "bold 60px Arial",
        color: "#ffffff",
        align: "center",
        shadow: {
          blur: 10,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.startScreenTitle.setPosition(-45, -60);
    this.startScreenDoggy.setPosition(170, -60);
    this.startScreenSubtitle.setPosition(0, 60);

    this.startScreenContainer = this.add.container(0, 0);
    this.startScreenContainer.add(this.startScreenTitle);
    this.startScreenContainer.add(this.startScreenDoggy);
    this.startScreenContainer.add(this.startScreenSubtitle);

    this.startScreenGroup.add(this.startScreenContainer);
  }

  createEndScreenElements() {
    this.logo = this.add.image(0, 0, "logo").setOrigin(0.5);

    this.charImage = this.add.image(0, 0, "char").setOrigin(0.5);

    this.endScreenTitle = this.add
      .text(0, 0, "Great Job", {
        font: "bold 75px Arial",
        color: "#ffffff",
        align: "center",
        shadow: {
          blur: 10,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setTint(0xf9dc71, 0xf9dc71, 0xe7aa38, 0xe7aa38);

    this.endScreenSubtitle = this.add
      .text(0, 0, "Can you solve\nevery mystery?", {
        font: "bold 40px Arial",
        color: "#ffffff",
        align: "center",
        shadow: {
          blur: 10,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.endScreenGroup.addMultiple([
      this.logo,
      this.endScreenTitle,
      this.endScreenSubtitle,
      this.charImage,
    ]);
  }

  create() {
    this.startScreenGroup = this.add.group();
    this.gameScreenGroup = this.add.group();
    this.endScreenGroup = this.add.group();

    this.createBackgrounds();
    this.resizeBackground(this.bgImage);

    this.createOutlineAnimation();

    this.createDogs();
    this.placeDogs();

    this.createPlayButton();
    this.placeElementRelativeToScreen(this.playButtonContainer, 0.5, 0.9);

    this.scale.on("resize", this.handleResize, this);
    this.scale.on("orientationchange", this.handleResize, this);
    this.input.on("pointerdown", this.handlePointerClick, this);

    this.showStartScreen();
  }

  handlePointerClick(pointer) {
    if (!pointer.isDown) {
      return;
    }

    const clickedDog = this.doggies.find((dog) =>
      dog.getBounds().contains(pointer.x, pointer.y)
    );

    if (clickedDog) {
      if (!clickedDog.isOutlined && this.isGameInProgress) {
        this.outlineDog(clickedDog);
        return;
      }
    }

    this.handleParticles(pointer);
  }

  outlineDog(container) {
    const doggy = container.doggy;
    if (!doggy) {
      return;
    }

    const outline = this.add.sprite(0, 0, "circle").setVisible(true);
    outline.setScale(doggy.scaleX, doggy.scaleY);
    outline.play("outlineAnimation");

    container.add(outline);
    container.isOutlined = true;

    this.dogsFound++;

    outline.on("animationcomplete", () => {
      doggy.disableInteractive();

      if (this.dogsFound === DOGS_COUNT) {
        this.finishGame();
      }
    });
  }

  handleParticles(pointer) {
    this.add.particles(pointer.x, pointer.y, "sparkle", {
      speed: 50,
      gravityY: 150,
      scale: 1,
      duration: 100,
    });
  }

  handleResize() {
    this.resizeBackground(this.bgImage);
    this.placeDogs();
    this.placeElementRelativeToScreen(this.playButtonContainer, 0.5, 0.9, 1);

    if (this.startScreenGroup.children.size > 0) {
      this.placeStartScreenElements();
    }

    if (this.endScreenGroup.children.size > 0) {
      this.placeEndScreenElements();
    }

    if (!this.isGameInProgress) {
      this.resizeBackground(this.coverBackground);
    }
  }

  resizeBackground(backgroundImage) {
    const canvas = this.sys.game.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const windowRatio = width / height;
    const imageRatio = backgroundImage.width / backgroundImage.height;

    let scale;

    if (windowRatio < imageRatio) {
      scale = height / backgroundImage.height;
      backgroundImage.setScale(scale).setScrollFactor(0);
      backgroundImage.setPosition(
        (width - backgroundImage.width * scale) / 2,
        0
      );
    } else {
      scale = width / backgroundImage.width;
      backgroundImage.setScale(scale).setScrollFactor(0);
      backgroundImage.setPosition(
        0,
        (height - backgroundImage.height * scale) / 2
      );
    }
  }

  placeDogs() {
    const isLandscape = this.scale.isLandscape;

    if (isLandscape) {
      this.placeDogsLandscape();
    } else {
      this.placeDogsPortrait();
    }
  }

  placeDogsLandscape() {
    this.placeElementRelativeToBackground(this.doggies[0], 0.156, 0.347, 0.66);
    this.placeElementRelativeToBackground(this.doggies[1], 0.569, 0.391, 0.46);
    this.placeElementRelativeToBackground(this.doggies[2], 0.68, 0.74);
    this.placeElementRelativeToBackground(this.doggies[3], 0.9, 0.57, 0.6);
    this.placeElementRelativeToBackground(this.doggies[4], 0.66, 0.5, 0.37);
  }

  placeDogsPortrait() {
    this.placeElementRelativeToBackground(this.doggies[0], 0.505, 0.448, 0.45);
    this.placeElementRelativeToBackground(this.doggies[1], 0.652, 0.512, 0.35);
    this.placeElementRelativeToBackground(this.doggies[2], 0.665, 0.75, 0.9);
    this.placeElementRelativeToBackground(this.doggies[3], 0.365, 0.388, 0.6);
    this.placeElementRelativeToBackground(this.doggies[4], 0.59, 0.05, 0.5);
  }

  startGame() {
    this.tweens.add({
      targets: [this.coverBackground, this.startScreenContainer],
      alpha: { from: 1, to: 0 },
      duration: 500,
      onComplete: () => {
        this.startScreenContainer.destroy();
        this.isGameInProgress = true;

        this.coverBackground.setDepth(-1);
        this.gameScreenGroup.setDepth(0);
      },
    });
  }

  finishGame() {
    this.isGameInProgress = false;

    this.time.delayedCall(200, () => this.showEndScreen());
  }

  placeElementRelativeToBackground(
    element,
    relativeX,
    relativeY,
    initialScale = 1
  ) {
    const elementX = this.bgImage.x + this.bgImage.displayWidth * relativeX;
    const elementY = this.bgImage.y + this.bgImage.displayHeight * relativeY;
    element.setPosition(elementX, elementY);

    const scaleRatio =
      Math.max(this.bgImage.scaleX, this.bgImage.scaleY) * initialScale;

    element.list.forEach((child) => {
      child.setScale(scaleRatio);
    });
  }

  placeElementRelativeToScreen(
    element,
    relativeX,
    relativeY,
    initialScale = 1
  ) {
    const canvas = this.sys.game.canvas;
    const width = canvas.width;
    const height = canvas.height;

    const x = width * relativeX;
    const y = height * relativeY;

    const scale =
      Math.max(this.bgImage.scaleX, this.bgImage.scaleY) * initialScale;

    element.setPosition(x, y);
    element.setScale(scale);
  }

  placeStartScreenElements() {
    const isLandscape = this.scale.isLandscape;

    if (isLandscape) {
      this.placeElementRelativeToScreen(
        this.startScreenContainer,
        0.5,
        0.48,
        1
      );
    } else {
      this.placeElementRelativeToScreen(
        this.startScreenContainer,
        0.5,
        0.48,
        0.5
      );
    }

    this.tweens.add({
      targets: this.startScreenContainer,
      scale: {
        from: this.startScreenContainer.scale,
        to: this.startScreenContainer.scale + 0.05,
      },
      duration: START_GAME_TIMEOUT + 500,
    });
  }

  placeEndScreenElements() {
    const isLandscape = this.scale.isLandscape;

    if (isLandscape) {
      this.placeEndScreenElementsLandscape();
    } else {
      this.placeEndScreenElementsPortrait();
    }
  }

  placeEndScreenElementsLandscape() {
    this.placeElementRelativeToScreen(this.logo, 0.5, 0.2);

    this.placeElementRelativeToScreen(this.charImage, 0, 1, 0.6);
    this.charImage.setFlipX(false).setOrigin(0, 1).clearTint();

    this.placeElementRelativeToScreen(this.endScreenTitle, 0.5, 0.47);
    this.placeElementRelativeToScreen(this.endScreenSubtitle, 0.5, 0.65);
  }

  placeEndScreenElementsPortrait() {
    this.placeElementRelativeToScreen(this.charImage, 0.5, 0.6, 0.5);
    this.charImage.setFlipX(true).setOrigin(0.5);
    this.charImage.tintBottomLeft = 0x000000;
    this.charImage.tintBottomRight = 0x000000;

    this.placeElementRelativeToScreen(this.logo, 0.5, 0.17, 0.8);

    this.placeElementRelativeToScreen(this.endScreenTitle, 0.5, 0.63);
    this.placeElementRelativeToScreen(this.endScreenSubtitle, 0.5, 0.75);
  }

  showStartScreen() {
    this.resizeBackground(this.coverBackground);
    this.createStartScreenElements();
    this.placeStartScreenElements();

    this.coverBackground.setDepth(0);
    this.gameScreenGroup.setDepth(-1);

    this.tweens.add({
      targets: [this.coverBackground],
      alpha: { from: 0, to: 1 },
      duration: 800,
    });

    this.time.delayedCall(START_GAME_TIMEOUT, () => {
      this.startGame();
    });
  }

  showEndScreen() {
    this.resizeBackground(this.coverBackground);
    this.createEndScreenElements();
    this.placeEndScreenElements();

    this.coverBackground.setDepth(0);
    this.gameScreenGroup.setDepth(-1);

    this.tweens.add({
      targets: [this.coverBackground, ...this.endScreenGroup.getChildren()],
      alpha: { from: 0, to: 1 },
      duration: 1000,
    });

    this.tweens.add({
      targets: [...this.playButtonContainer.list],
      scale: { from: 1, to: 1.1 },
      ease: "Linear",
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}
