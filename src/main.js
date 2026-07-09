// Dig Big - v2.1

// init kaboomJS
import kaboom from "kaboom"

// some variables
let bgColor = [12, 24, 12] // rgb
let textColor = [140, 255, 102]
let accentColor = [255, 68, 68]
let againPlays = 0

kaboom({
  background: bgColor,
  font: "pressStart",
})

// ---

// load fonts
loadFont("pressStart", "fonts/pressStart2p.ttf")

// load sprites
loadSprite("playerSprite", "sprites/pickaxe.svg")
loadSprite("bombSprite", "sprites/bomb.png")
loadSprite("addSprite", "sprites/bitcoin.svg")

// load sounds
loadSound("backgroundMusic", "sounds/surfers.mp3")
loadSound("addMusic", "sounds/coin.mp3")
loadSound("bombMusic", "sounds/explode.mp3")
loadSound("reviveMusic", "sounds/revive.mp3")

// ---

function main() {
  // some more variables
  let score = 0
  let scoreText = undefined
  let speedText = undefined
  let bombSpeed = 2.0
  let bgMusicOn = false
  
  // Track events locally to stop ongoing ghost processes on reset
  let spawnLoop = null
  let musicEvent = null
  let currentBgMusic = null // Handle to store and kill the active music stream
  
  // Mobile check variables (Touch capability combined with viewport threshold)
  const isTouchDevice = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  const isMobile = isTouchDevice && width() < 768;

  displayScore()
  
  // ---

  // loading screen
  onLoading((progress) => {
    // bg
    drawRect({
      width: width(),
      height: height(),
      pos: vec2(0, 0),
      color: rgb(...textColor),
    })
    // progressBar
    drawRect({
      width: width() * progress,
      height: height(),
      pos: vec2(0, 0),
      color: rgb(...bgColor),
    });
  });

  // ---

  // spwan player
  const player = add([
    sprite("playerSprite"),
    pos(rand(0, width() - 32), 30),
    area(),
    "player", // tag
  ])

  // moving player inside the browser window edges
  let speed = 500;

  // desktop
  onKeyDown("left", () => {
    player.move(-speed, 0);
    player.pos.x = Math.max(0, player.pos.x);
  });

  onKeyDown("right", () => {
    player.move(speed, 0);
    player.pos.x = Math.min(width() - player.width, player.pos.x);
  });

  onKeyDown("up", () => {
    player.move(0, -speed);
    player.pos.y = Math.max(0, player.pos.y);
  });

  onKeyDown("down", () => {
    player.move(0, speed);
    player.pos.y = Math.min(height() - player.height, player.pos.y);
  });
  
  // mobile touch drag handling
  onMouseDown(() => {
    if (isMobile && player.exists()) {
      // Direct drag mapping to current mouse/touch pointer layout
      player.moveTo(mousePos().x, mousePos().y);
      
      // Auto start background music on mobile tap if it hasn't fired yet
      if (!bgMusicOn) {
        currentBgMusic = play("backgroundMusic", { loop: true, volume: 0.35 });
        bgMusicOn = true;
      }
    }
  });

  onMouseMove(() => {
    if (isMobile && player.exists() && isMouseDown()) {
      player.moveTo(mousePos().x, mousePos().y);
    }
  });
  
  // ---

  // spwan bomb & addSprite using screen dimensions
  spawnLoop = loop(2, ()=>{
    let dynamicBombCount = 3
    let bitcoinCount = 1

    if (isMobile) {
      // Mobile rules
      dynamicBombCount = 2
      bitcoinCount = 1
    } else {
      if (width() >= 1500) {
        dynamicBombCount = 4
        bitcoinCount = 2
      } // for big desktop screen
    }

    // Spawn the calculated number of bombs
    for (let i = 0; i < dynamicBombCount; i++) {
      let x = rand(0, width() - 32)
      let y = height()
      let z = add([
        sprite("bombSprite"),
        pos(x, y),
        area(),
        "bomb"
      ])
      z.onUpdate(()=>{
        z.moveTo(z.pos.x, z.pos.y - bombSpeed)
        if (z.pos.y < -64) destroy(z) 
      })
    }
    
    // Spawn the calculated number of Bitcoins
    for (let j = 0; j < bitcoinCount; j++) {
      let a = rand(0, width() - 32)
      let b = height()
      let c = add([
        sprite("addSprite"),
        pos(a, b),
        area(),
        "add"
      ])
      c.onUpdate(()=>{
        c.moveTo(c.pos.x, c.pos.y - bombSpeed)
        if (c.pos.y < -64) destroy(c)
      })
    }
  })

  // ---

  // init bg music
  musicEvent = onKeyPress(()=>{
    if (!bgMusicOn) {
      currentBgMusic = play("backgroundMusic", { loop: true, volume: 0.35 })
    }
    bgMusicOn = true
  })

  // ---

  // collision
  player.onCollide("bomb", (bomb)=>{
    destroy(player)
    destroy(bomb)
    gameOver()
  })

  player.onCollide("add", (add)=>{
    score += 10
    displayScore()
    destroy(add)
    play("addMusic", { volume: 1 })
  })

  // ---

  // some functions
  function displayScore() {
    if (!(scoreText === undefined)) {
      destroy(scoreText) // previous scoreText
    }
    
    scoreText = add([
      text(`Score:${score}`, { size: 16 }),
      pos(24, 24),
      color(...textColor),
      z(101)
    ])      
    // increase speed
    if (score > 0) bombSpeed += 0.1
    displaySpeed()
  }

  function displaySpeed() {
    if (!(speedText === undefined)) {
      destroy(speedText) // rm previous scoreText
    }
    
    speedText = add([
      text(`Speed:${bombSpeed.toFixed(1)}`, { size: 16 }),
      pos(width() - 170, 24),
      color(...textColor),
      z(101)
    ])
  }

  function gameOver() {
    play("bombMusic", { volume: 1 })
    addKaboom(player.pos)
    
    wait(1, ()=>{
      volume(0)
      
      // bg
      const gameOverBg = add([
        rect(width(), height()),
        pos(0, 0),
        color(...bgColor),
        z(100)
      ])

      // text
      add([
        text("Game Over"),
        pos(width() / 2, (height() / 2) - 33),
        anchor("center"),
        color(...accentColor),
        z(101)
      ]) 

      // perfectly sharp pixelated container body
      const restartBtn = add([
        rect(240, 56),
        pos(width() / 2, (height() / 2) + 30),
        anchor("center"),
        color(...textColor),
        area(),
        z(101)
      ])

      // play again text labels
      add([
        text("PLAY AGAIN", { size: 16 }),
        pos(width() / 2, (height() / 2) + 30),
        anchor("center"),
        color(...bgColor),
        z(102)
      ])

      // cursor: pointer;
      restartBtn.onHover(()=>{
        setCursor("pointer")
      })
      restartBtn.onHoverEnd(()=>{
        setCursor("default")
      })
      
      // reset everything cleanly and fire the main loop container again
      restartBtn.onClick(() => {
        // Create the background base container matching the loading theme color
        const swipeBg = add([
          rect(width(), height()),
          pos(0, 0),
          color(...textColor),
          opacity(1),
          z(149)
        ])

        // The actual transition bar sliding in from right-to-left using the loading bar's bgColor
        const transitionBar = add([
          rect(0, height()),
          pos(width(), 0),
          color(...bgColor),
          z(150)
        ])

        // Smoothly expand the width while shifting its x position leftward
        tween(
          width(),
          0,
          0.45,
          (val) => {
            transitionBar.pos.x = val
            transitionBar.width = width() - val
          },
          easings.easeOutQuad
        ).then(() => {
          // Stop the active background music stream completely
          if (currentBgMusic) currentBgMusic.stop()
          
          // Explicitly clear background timers & events from the finished main loop execution
          if (spawnLoop) spawnLoop.cancel()
          if (musicEvent) musicEvent.cancel()
          
          destroyAll("*")
          againPlays += 1
          volume(1)
          play("reviveMusic", { volume: 1 })
          main()
        })
      })
    })
  }
}

main()
