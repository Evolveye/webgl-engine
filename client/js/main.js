import Renderer from "./webGlUtils.js"

/** @type {WebGLRenderingContext} */
const gl = document.querySelector( `.gl` ).getContext( `webgl2` )

gl.canvas.height = window.innerHeight
gl.canvas.width = window.innerWidth

~async function main() {
  const ctx = new Renderer( gl )
  let rX = 0
  let rY = 0
  let rZ = 0

  // await ctx.loadModel( `barrel`, `./models/barrel.obj` )
  // await ctx.createTextureImg( `barrel`, `./models/barrel.png` )
  ctx.loadBox( `plane`, 100, 100, 0 )
  ctx.loadBox( `box1`, 100 )
  ctx.loadBox( `box2`, 100, 200, 300 )
  ctx.createTextureColor( `red`, `red` )
  ctx.createTextureColor( `green`, `green` )

  ctx.createMaterial( `mat1`, {
    lightColor: [ 1, 1, 1, 1 ], // tf
    colorMult: [ 1, 1, 1, 1 ],
    specular: [ 1, 1, 1, 1 ], // ks
    specularFactor: 0,
    shininess: 1,
  } )
  ctx.createMaterial( `mat2`, {
    lightColor: [ 1, 1, 1, 1 ], // tf
    colorMult: [ 1, 1, 1, 1 ],
    specular: [ 1, 1, 1, 1 ], // ks
    specularFactor: 1,
    shininess: 500,
  } )

  setInterval( () => {
    rX += 2 * .75
    rY += 2 * .5
    rZ += 2 * 1

    ctx.useTexture( `red` ) // set diffuse
    ctx.useMaterial( `mat2` )
    // ctx.draw( `barrel` )
    // ctx.draw( `barrel`, { x:-200 } )
    ctx.draw( `plane`, { x:50, rX } )

    ctx.useTexture( `green` ) // set diffuse
    // ctx.draw( `box1`, { x:-500, y:300, rX:(-rX * 2), rY, rZ } )
    // ctx.draw( `box2`, { y:-300, rX:(-rX * 2), rY:-rY, rZ } )
    ctx.draw( `plane`, { x:-50 } )

    // ctx.useTexture( `barrel` ) // set diffuse
    // ctx.useMaterial( `mat1` )
    // ctx.draw( `barrel`, { x:200, rX, rY, rZ } )
  }, 1000 / 60 )
}()