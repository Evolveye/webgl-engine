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
    rX += 2 * .75
    rY += 2 * .5
    rZ += 2 * 1

    ctx.useTexture( `color` ) // set diffuse
    ctx.useMaterial( `mat2` )
    ctx.draw( `barrel` )
    ctx.draw( `barrel`, { x:-2 } )

    ctx.useTexture( `barrel` ) // set diffuse
    ctx.useMaterial( `mat1` )
    ctx.draw( `barrel`, { x:2, rX, rY, rZ } )
  }, 1000 / 60 )
}()