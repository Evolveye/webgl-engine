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

  await ctx.loadModel( `barrel`, `./models/barrel.obj`, 100 )
  ctx.loadModel( `box1`, `box` )
  ctx.loadModel( `box2`, `box`, 50, 100, 150 )
  ctx.loadModel( `plane1`, `plane` )

  await ctx.createTextureImg( `barrel`, `./models/barrel.png` )
  ctx.createTextureColor( `red`, `red` )
  ctx.createTextureColor( `green`, `green` )
  ctx.createTextureColor( `white`, `white` )

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

  setInterval( () => {
    rX += 2 * .75
    rY += 2 * .5
    rZ += 2 * 1

    ctx.useMaterial( `mat2` )
    ctx.useTexture( `red` )
    ctx.draw( `barrel` )
    ctx.draw( `barrel`, { x:-200 } )
    // ctx.draw( `plane`, { x:50, rX } )

    ctx.useTexture( `green` )
    ctx.draw( `box1`, { x:-500, y:200, rX:(-rX * 2), rY, rZ } )
    ctx.draw( `box2`, { y:-200, rX:(-rX * 2), rY:-rY, rZ } )

    ctx.useTexture( `white` )
    ctx.draw( `plane1`, { y:-200, x:-400, rX:(-rX / 2) } )

    ctx.useMaterial( `mat1` )
    ctx.useTexture( `barrel` )
    ctx.draw( `barrel`, { x:200, rX, rY, rZ } )
  }, 1000 / 60 )
}()