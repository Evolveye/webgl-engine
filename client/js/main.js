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

  ctx.setAspect( gl.canvas.clientWidth / gl.canvas.clientHeight )
  ctx.setCameraPos( 0, 4, 10 )
  ctx.setTargetPos( 0, 0, 0 )
  ctx.setPointLightPos( 1.3, 2, 3 )

  await ctx.loadModel( `barrel`, `./models/barrel.obj` )
  await ctx.createTextureImg( `barrel`, `./models/barrel.png` )
  ctx.loadBox( `box1`, 1, 1, 1 )
  ctx.loadBox( `box2`, 1, 2, 3 )
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
    ctx.draw( `barrel` )
    ctx.draw( `barrel`, { x:-2 } )

    ctx.useTexture( `green` ) // set diffuse
    ctx.draw( `box1`, { x:-5, y:3, rX:(-rX * 2), rY, rZ } )
    ctx.draw( `box2`, { y:-3, rX:(-rX * 2), rY:-rY, rZ } )

    ctx.useTexture( `barrel` ) // set diffuse
    ctx.useMaterial( `mat1` )
    ctx.draw( `barrel`, { x:2, rX, rY, rZ } )
  }, 1000 / 60 )
}()