import kaboom from "kaboom"

// init kaboom
const k = kaboom({
  font: "Google Sans",
  background: [0, 0, 255],
})

// lets load the sprits
loadSprite("beam", "sprites/bean.png")
loadSprite("bug", "sprites/bug.svg")
loadSprite("coffee", "sprites/coffee.svg")

// lets load the music
loadSound("background", "sounds/background.mp3")
loadSound("collide_with_bug", "sounds/fah.mp3")
loadSound("collide_with_coffee", "sounds/bite.mp3")

// lets define game variables
let bgMusicOn = false
let SPEED = 600
let BugSPEED = 2
let SCORE = 0
let scoreText;

function displayScore() {

  if (!(scoreText === undefined)) { 
    destroy(scoreText)
  }
  
  scoreText = add([
    text("Score: " + SCORE),
    pos(width() - 150, 25),
  ])
}

// lets add player
const player = add([
    sprite("beam"), 
    pos(120, 80),
    area(),
    scale(1.25),
])

// adding player events
onKeyDown("left", () => {
    player.move(-SPEED, 0)
})

onKeyDown("right", () => {
    player.move(SPEED, 0)
})

onKeyDown("up", () => {
    player.move(0, -SPEED)
})

onKeyDown("down", () => {
    player.move(0, SPEED)
})

// adding bugs & coffee on loop
loop(2.3, ()=>{
  for(let i=0; i<4; i++) {

    // spwaning bug
    let x = rand(0, width())
    let y = height()
    let z = add([
      sprite("bug"),
      pos(x, y),
      area(),
      scale(0.1),
      "bug" // tag
    ])
    // moving bug
    z.onUpdate(()=>{
      z.moveTo(z.pos.x, z.pos.y - BugSPEED)
    })
  }
   // spwaning coffee
    let a = rand(0, width())
    let b = height()
    let c = add([
      sprite("coffee"),
      pos(a, b),
      area(),
      scale(0.1),
      "coffee"
    ])
    // moving coffee
    c.onUpdate(()=>{
      c.moveTo(c.pos.x, c.pos.y - BugSPEED)
    })
}) // run after every 4 seconds

// init bg music
onKeyPress(()=>{
  if (!bgMusicOn) {
    play("background", { loop: true, volume: 0.3 })
    bgMusicOn = true
  }
})

// when collide
player.onCollide("bug", () => {
  play("collide_with_bug", { volume: 0.5 })
  addKaboom(player.pos)
  destroy(player)
})

player.onCollide("coffee", (coffee) => {
  play("collide_with_coffee", { volumn: 0.7 })
  destroy(coffee)
  SCORE += 1
  if (BugSPEED < 9) {
    BugSPEED += 0.3
  }
  displayScore()
})
