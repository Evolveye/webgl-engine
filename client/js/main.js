import {
  Program,
  Model,
  Texture,
  Matrix4,
  Vector3,
  createMatrices,
} from "./webGlUtils"

function radToDeg( r ) {
  return r * 180 / Math.PI;
}
function degToRad( d ) {
  return d * Math.PI / 180;
}

main()
async function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector( `.gl` )
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext( `webgl2` )

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const programs = new Program( gl )
  const barrel = await Model.create( `./models/barrel.obj` )
  const prism = Model.createPrism( 1, 1, 1 )

  // programs.loadModel( `barrel`, barrel )
  programs.loadModel( `prism`, prism )
  // programs.addInstances( `barrel`, [
  //   new Model.Instance( {
  //     translate: [ -2, -2, 0 ],
  //     lightColor: [ 1, 1, 1, 1 ],
  //     colorMult: [ 1, 1, 1, 1 ],
  //     diffuse: await Texture.createFromImg( gl, `./models/barrel.png` ),
  //     specular: [1, 1, 1, 1],
  //     shininess: 1,
  //     specularFactor: 0,
  //   } ),
  //   new Model.Instance( {
  //     // translate: [ 2, 0, 0 ],
  //     rotate: [ 0, degToRad( -90 ), 0 ],
  //     lightColor: [ 1, 1, 1, 1 ],
  //     colorMult: [ 1, 1, 1, 1 ],
  //     diffuse: await Texture.createFromImg( gl, `./models/barrel.png` ),
  //     specular: [1, 1, 1, 1],
  //     shininess: 200,
  //     specularFactor: 0,
  //   } )
  // ] )
  programs.addInstances( `prism`, [
    new Model.Instance( {
      // translate: [ -2, -2, 0 ],
      rotate: [ -45, 0, 0 ],
      lightColor: [ 1, 1, 1, 1 ],
      colorMult: [ 1, 1, 1, 1 ],
      // diffuse: await Texture.createFromImg( gl, `./models/barrel.png` ),
      diffuse: Texture.createChecker( gl, `red`, `green` ),
      specular: [1, 1, 1, 1],
      shininess: 1,
      specularFactor: 0,
    } ),
  ] )


  const lightPosition = new Vector3( 0, 10, 15 )
  const cameraPosition = new Vector3( 0, 0, 5 )
  const targetPosition = new Vector3( 0, 0, 0 )

  const draw = () => programs.draw( lightPosition, cameraPosition, createMatrices( {
    cameraPosition, targetPosition,
    fieldOfViewRadians: degToRad( 60 ),
    up: new Vector3( 0, 1, 0 ),

    worldRotateX: 0,
    worldRotateY: 0,

    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
    zNear: 1,
    zFar: 1000
  } ) )

  // setTimeout( () => {
  setInterval( () => {
    programs.models.get( `prism` ).instances[ 0 ].rotateY += 1
    // translateX += incrementator
    // rotateX += incrementator * 1

    // if ( Math.abs( translateX ) > 250 )
    //   incrementator *= -1

    if ( keys[ 37 ] ) {
      camera.data[ 0 ] += -1
      target.data[ 0 ] += -1
    }
    if ( keys[ 39 ] ) {
      camera.data[ 0 ] += 1
      target.data[ 0 ] += 1
    }

    if ( keys[ 38 ] ) {
      camera.data[ 2 ] += -1
      target.data[ 2 ] += -1
    }
    if ( keys[ 40 ] ) {
      camera.data[ 2 ] += 1
      target.data[ 2 ] += 1
    }

    // cameraPosition.data[ 2 ] += cameraMover

    draw()
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
    const diffX = degToRad( clientX - mouse.clientX )
    const diffY = degToRad( mouse.clientY - clientY )
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