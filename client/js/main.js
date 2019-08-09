import Renderer, { degToRad } from "./webGlUtils.js"
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
const lines = []

gl.canvas.height = window.innerHeight
gl.canvas.width = window.innerWidth

const ctx = new Renderer( gl )

~async function setup() {
  await ctx.loadModel( `barrel`, `./models/barrel.obj`, 100 )
  // await ctx.loadModel( `mapa`, `./models/mapa.obj`, 100 )
  ctx.loadModel( `cube`, `box` )
  ctx.loadModel( `box`, `box`, 50, 100, 150 )
  ctx.loadModel( `plane`, `plane` )
  ctx.loadModel( `sphere`, `sphere`, 100 )
  ctx.loadModel( `cylinder`, `cylinder` )
  ctx.loadModel( `wheel`, `wheel` )

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
  rX += 1.5 * .75
  rY += 1.5 * .5
  rZ += 1.5 * 1

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

  ctx.useMaterial( `mat2` )
  ctx.useTexture( `green` )
  ctx.draw( `cube`, { x:-500, y:200, rX:(-rX * 2), rY, rZ } )
  ctx.draw( `box`, { y:-200, rX:(-rX * 2), rY:-rY, rZ } )

  ctx.useTexture( `white` )
  lines.forEach( line => {
    const lineLength = line.length
    for ( let i = 1; i < lineLength; i++ ) {
      const p1 = line[ i - 1 ]
      const p2 = line[ i ]

      ctx.drawLine( 15, p1, p2 )
    }
  } )
  ctx.draw( `plane`, { y:-200, x:-400, rX:(-rX / 2) } )
  ctx.draw( `box`, { x:600, z:600, rX:(-rX * 2), rY:-rY, rZ } )
  ctx.draw( `cube`, { x:200, y:-200, rX:(-rZ * 2), rY:-rX, rZ, mesh:true } )
  ctx.draw( `cylinder`, { x:350, y:-100, rX } )

  ctx.useMaterial( `mat1` )

  ctx.useTexture( `barrel` )
  ctx.draw( `barrel`, { x:200, rX, rY, rZ } )
  ctx.draw( `plane`, { y:-200, x:-300, rX:(-rX / 2) } )

  setTimeout( () => requestAnimationFrame( () => draw() ), 1000 / 60 )
}

addEventListener( `keydown`, ({ keyCode }) => keys.get( keyCode ).pressed = true )
addEventListener( `keyup`,   ({ keyCode }) => keys.get( keyCode ).pressed = false )
addEventListener( `mousedown`, ({ clientX, clientY }) => {
  lines.push( [] )
  mouse.clicked = true
  mouse.x = clientX
  mouse.y = clientY
} )
addEventListener( `mouseup`, () => mouse.clicked = false )
addEventListener( `mousemove`, ({ clientX, clientY }) => {
  if ( !mouse.clicked ) return
  if ( mouse.x !== null ) {
    if ( !keys.get( `ctrl` ).triggered ) {
      mouse.rX -= mouse.y - clientY
      mouse.rY -= mouse.x - clientX

      ctx.rotateCamera( mouse.rX * mouse.movingFactor, mouse.rY * mouse.movingFactor )
    }
    else lines[ lines.length - 1].push( { x:(clientX - ctx.gl.canvas.width / 2), y:(-clientY + ctx.gl.canvas.height / 2) } )
  }
  mouse.x = clientX
  mouse.y = clientY
} )


// /** @type {CanvasRenderingContext2D} */
// const ctx2d = document.querySelector( `.gl` ).getContext( `2d` )
// ctx2d.canvas.height = window.innerHeight
// ctx2d.canvas.width = window.innerWidth

// let jump = .1
// const points = [
//   { x:500, y:300 },
//   { x:500, y:300 },
//   { x:500, y:400 },
//   // { x:600, y:600 },
//   { x:700, y:400 },
//   { x:700, y:300 },
// ]

// ctx2d.moveTo( points[ 0 ].x, points[ 0 ].y )

// for ( let t = jump, pts = points.length - 1; t <= 1; t += jump ) {
//   let x = 0
//   let y = 0

//   points.forEach( (p, i) => {
//     let num = (1 - t)**(pts - i) * t**i * (i == 0 || i == pts ? 1 : pts)

//     x += p.x * num
//     y += p.y * num
//   } )

//   ctx2d.lineTo( x, y )
// }

// ctx2d.lineWidth = 3
// ctx2d.strokeStyle = `red`
// ctx2d.stroke()