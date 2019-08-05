import Renderer, { mapNum, degToRad } from "./webGlUtils.js"
import Keys from "./keys.js"

/** @type {WebGLRenderingContext} */
const gl = document.querySelector( `.gl` ).getContext( `webgl2` )
const keys = new Keys
let rX = 0
let rY = 0
let rZ = 0
let speed = 5
const mouse = {
  x: null,
  y: null,
  rX: null,
  rY: null,
  clicked: null,
  movingFactor: .35,
}

gl.canvas.height = window.innerHeight
gl.canvas.width = window.innerWidth

const ctx = new Renderer( gl )

~async function setup() {
  await ctx.loadModel( `barrel`, `./models/barrel.obj`, 100 )
  ctx.loadModel( `cube`, `box` )
  ctx.loadModel( `box`, `box`, 50, 100, 150 )
  ctx.loadModel( `plane`, `plane` )
  ctx.loadModel( `sphere`, `sphere`, 100 )

  // await ctx.createTextureImg( `UVMap`, `./models/UVMap.png` )
  // ctx.useTexture( `UVMap` )
  await ctx.createTextureImg( `barrel`, `./models/barrel.png` )
  ctx.createTextureColor( `red`, `red` )
  ctx.createTextureColor( `green`, `green` )
  ctx.createTextureColor( `white`, `white` )
  ctx.createTextureColor( `blue`, `blue` )

  ctx.createMaterial( `mat1`, {
    lightColor: [ 1, 1, 1, 1 ],
    colorMult: [ 1, 1, 1, 1 ],
    specular: [ 1, 1, 1, 1 ],
    specularFactor: 0,
    shininess: 1,
  } )
  ctx.createMaterial( `mat2`, {
    lightColor: [ 1, 1, 1, 1 ],
    colorMult: [ 1, 1, 1, 1 ],
    specular: [ 1, 1, 1, 1 ],
    specularFactor: 1,
    shininess: 500,
  } )

  draw()
}()

function draw() {
  rX += 2 * .75
  rY += 2 * .5
  rZ += 2 * 1

  const xFactor = Math.sin( mouse.rY * mouse.movingFactor * Math.PI / 180 )
  const zFactor = Math.cos( mouse.rY * mouse.movingFactor * Math.PI / 180 )

  if ( keys.get( `left`,  `a` ).triggered ) ctx.moveCamera( -speed * zFactor, 0, -speed * xFactor )
  if ( keys.get( `up`,    `w` ).triggered ) ctx.moveCamera(  speed * xFactor, 0, -speed * zFactor )
  if ( keys.get( `right`, `d` ).triggered ) ctx.moveCamera(  speed * zFactor, 0,  speed * xFactor )
  if ( keys.get( `down`,  `s` ).triggered ) ctx.moveCamera( -speed * xFactor, 0,  speed * zFactor )
  if ( keys.get( `shift` ).triggered ) ctx.moveCamera( 0, -speed, 0 )
  if ( keys.get( `space` ).triggered ) ctx.moveCamera( 0, speed, 0 )

  ctx.useMaterial( `mat2` )

  ctx.useTexture( `red` )
  ctx.draw( `barrel`, { mesh:true, rX:45 } )
  ctx.draw( `barrel`, { x:-200 } )
  ctx.useTexture( `blue` )
  ctx.draw( `sphere`, { y:200, x:(Math.sin( degToRad( rX ) ) * 100) } )

  ctx.useTexture( `green` )
  ctx.draw( `cube`, { x:-500, y:200, rX:(-rX * 2), rY, rZ } )
  ctx.draw( `box`, { y:-200, rX:(-rX * 2), rY:-rY, rZ } )

  ctx.useTexture( `white` )
  ctx.draw( `plane`, { y:-200, x:-400, rX:(-rX / 2) } )
  ctx.draw( `box`, { x:600, z:600, rX:(-rX * 2), rY:-rY, rZ } )
  ctx.draw( `cube`, { x:200, y:-200, rX:(-rZ * 2), rY:-rX, rZ, mesh:true } )

  ctx.useMaterial( `mat1` )

  ctx.useTexture( `barrel` )
  ctx.draw( `barrel`, { x:200, rX, rY, rZ } )
  ctx.draw( `plane`, { y:-200, x:-300, rX:(-rX / 2) } )

  setTimeout( () => requestAnimationFrame( () => draw() ), 1000 / 60 )
}

addEventListener( `keydown`, ({ keyCode }) => keys.get( keyCode ).pressed = true )
addEventListener( `keyup`,   ({ keyCode }) => keys.get( keyCode ).pressed = false )
addEventListener( `mousedown`, ({ clientX, clientY }) => {
  mouse.clicked = true
  mouse.x = clientX
  mouse.y = clientY
} )
addEventListener( `mouseup`, () => mouse.clicked = false )
addEventListener( `mousemove`, ({ clientX, clientY }) => {
  if ( !mouse.clicked ) return
  if ( mouse.x !== null ) {
    mouse.rX -= mouse.y - clientY
    mouse.rY -= mouse.x - clientX

    ctx.rotateCamera( mouse.rX * mouse.movingFactor, mouse.rY * mouse.movingFactor )
  }
  mouse.x = clientX
  mouse.y = clientY
} )