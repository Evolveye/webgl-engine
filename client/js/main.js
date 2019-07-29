import {
  Renderer,
  Model,
  Texture,
  Matrix4,
  Vector3,
  createMatrices,
} from "./webGlUtils.js"

/** @type {WebGLRenderingContext} */
const gl = document.querySelector( `.gl` ).getContext( `webgl2` )

gl.canvas.height = window.innerHeight
gl.canvas.width = window.innerWidth

main()
async function main() {
  const ctx = new Renderer( gl )
  let rX = 0
  let rY = 0
  let rZ = 0

  ctx.setAspect( gl.canvas.clientWidth / gl.canvas.clientHeight )
  ctx.setCameraPos( 0, 2, 5 )
  ctx.setTargetPos( 0, 1, 0 )
  ctx.setPointLightPos( 1.3, 2, 2 )

  await ctx.loadModel( `barrel`, `./models/barrel.obj` )
  await ctx.createTextureImg( `barrel`, `./models/barrel.png` )
  ctx.createTextureColor( `color`, `red` )

  ctx.createMaterial( `mat1`, {
    lightColor: [ 1, 1, 1, 1 ], // tf
    colorMult: [ 1, 1, 1, 1 ],
    specular: [1, 1, 1, 1], // ks
    specularFactor: 0,
    shininess: 1,
  } )
  ctx.createMaterial( `mat2`, {
    lightColor: [ 1, 1, 1, 1 ], // tf
    colorMult: [ 1, 1, 1, 1 ],
    specular: [1, 1, 1, 1], // ks
    specularFactor: 1,
    shininess: 500,
  } )

  setInterval( () => {
    rX += .75
    rY += .5
    rZ += 1

    ctx.useTexture( `color` )
    ctx.useMaterial( `mat2` )
    ctx.draw( `barrel` )
    ctx.draw( `barrel`, { x:-2 } )

    ctx.useTexture( `barrel` ) // set diffuse
    ctx.useMaterial( `mat1` )
    ctx.draw( `barrel`, { x:2, rX, rY, rZ } )
  }, 10 )
}

let camRotateX = 0
let incrementator = .5
let cameraMover = -.01
let translateX = 0
let translateZ = 0

const keys = []
const mouse = { clientX:null, clientY:null, x:null, y:null,}


window.keys = keys

document.addEventListener( `keydown`, e => keys[ e.keyCode ] = true )
document.addEventListener( `keyup`, e => keys[ e.keyCode ] = false )
document.addEventListener( `mousemove`, ({ clientX, clientY }) => { return
  if ( mouse.clientX ) {
    const diffX = ( clientX - mouse.clientX ) * Math.PI / 180
    const diffY = ( mouse.clientY - clientY ) * Math.PI / 180
    let x, y, z

    x = target.data[ 0 ] - camera.data[ 0 ]
    y = target.data[ 1 ] - camera.data[ 1 ]
    z = target.data[ 2 ] - camera.data[ 2 ]

    target.data[ 0 ] = camera.data[ 0 ] + (x * Math.cos( diffX ) - z * Math.sin( diffX ))
    target.data[ 1 ] = camera.data[ 1 ] + (y * Math.cos( diffY ) - z * Math.sin( diffY ))
    target.data[ 2 ] = camera.data[ 2 ] + (z * Math.cos( diffX ) + x * Math.sin( diffX ))
    // target.data[ 2 ] = camera.data[ 2 ] + (z * Math.cos( diffY ) + y * Math.sin( diffY ))
  }

  mouse.clientX = clientX
  mouse.clientY = clientY
  // mouse.x = mouse.clientX
  // mouse.y = mouse.clientY
} )