import loadTheModel from "./OBJModel"
import {
  createProgram,
  Matrix4,
  Vector3,
  getActiveUniforms,
  getActiveAttributes,
  createVAOAndSetAttributes,
  createMatrices,
  textureUtils
} from "./webGlUtils"

const { makeCheckerTexture, makeImgTexture } = textureUtils


const vertexShaderSource = `#version 300 es
  uniform mat4 u_worldViewProjection;
  uniform vec3 u_lightWorldPosition;
  uniform mat4 u_world;
  uniform mat4 u_viewInverse;
  uniform mat4 u_worldInverseTranspose;

  in vec4 a_position;
  in vec3 a_normal;
  in vec2 a_texcoord;

  out vec4 v_position;
  out vec2 v_texCoord;
  out vec3 v_normal;
  out vec3 v_surfaceToLight;
  out vec3 v_surfaceToView;

  void main() {
    v_texCoord = a_texcoord;
    v_position = (u_worldViewProjection * a_position);
    v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;
    v_surfaceToLight = u_lightWorldPosition - (u_world * a_position).xyz;
    v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
    gl_Position = v_position;
  }
`

const fragmentShaderSource = `#version 300 es
  precision mediump float;

  in vec4 v_position;
  in vec2 v_texCoord;
  in vec3 v_normal;
  in vec3 v_surfaceToLight;
  in vec3 v_surfaceToView;

  // uniform vec4 u_lightColor;
  uniform vec4 u_colorMult;
  uniform sampler2D u_diffuse;
  uniform vec4 u_specular;
  uniform float u_shininess;
  uniform float u_specularFactor;

  out vec4 outColor;

  vec4 lit( float l ,float h, float m ) {
    return vec4(
      1.0,
      abs( l ),
      l > 0.0  ?  pow( max( 0.0, h ), m )  :  0.0,
      1.0
    );
  }

  void main() {
    vec4 u_lightColor = vec4( 1, 1, 1, 1 ); // - - - - - - - - - - - - - - - - - - TO REWRITE

    vec4 diffuseColor = texture( u_diffuse, v_texCoord );
    vec3 a_normal = normalize( v_normal);
    vec3 surfaceToLight = normalize( v_surfaceToLight );
    vec3 surfaceToView = normalize( v_surfaceToView );
    vec3 halfVector = normalize( surfaceToLight + surfaceToView );

    vec4 litR = lit(
      dot( a_normal, surfaceToLight ),
      dot( a_normal, halfVector ),
      u_shininess
    );

    outColor = vec4(
      ( u_lightColor * (
        diffuseColor * litR.y * u_colorMult + u_specular * litR.z * u_specularFactor
      ) ).rgb,
      diffuseColor.a
    );
  }
`

async function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector( `.gl` )
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext( `webgl2` )

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const program = createProgram( gl, vertexShaderSource, fragmentShaderSource )
  const attributes = getActiveAttributes( gl, program )
  const uniforms = getActiveUniforms( gl, program )

  const objects = [
    { // barrel
      program,
      bufferInfo: null,
      vertexArray: null,
      uniforms: null,
      instances: [
        {
          translateY: -75,
          translateZ: -200,
          materialUniforms: {
            u_colorMult: [ 1, 1, 1, 1 ],
            // u_diffuse: makeCheckerTexture( gl, `#ff00ff`, `#0000ff` ),
            u_diffuse: await makeImgTexture( gl, `./models/barrel.png` ),
            u_specular: [1, 1, 1, 1],
            u_shininess: 150,
            u_specularFactor: 0,
          }
        },
        {
          translateY: 75,
          translateZ: -200,
          materialUniforms: {
            u_colorMult: [ 1, 1, 1, 1 ],
            // u_diffuse: makeCheckerTexture( gl, `#ff0000`, `#00ff00` ),
            u_diffuse: await makeImgTexture( gl, `./models/barrel.png` ),
            u_specular: [1, 1, 1, 1],
            u_shininess: 150,
            u_specularFactor: 0,
          }
        }
      ]
    }
  ]

  const vao = createVAOAndSetAttributes( gl, attributes, {
    a_position: { numComponents:3, data:getGeometry() },
    a_normal:   { numComponents:3, data:getNormals() },
    a_texcoord: { numComponents:2, data:getTexcoords() }
  } )

  objects[ 0 ].vertexArray = vao

  function radToDeg( r ) {
    return r * 180 / Math.PI;
  }

  function degToRad( d ) {
    return d * Math.PI / 180;
  }

  let fieldOfViewRadians = degToRad( 60 )
  let fRotationRadiansX = 0
  let fRotationRadiansY = 0
  let shininess = 150
  let lightRotationX = 0
  let lightRotationY = 0
  let lightDirection = [ 0, 0, 1 ]  // this is computed in updateScene
  let innerLimit = degToRad( 10 )
  let outerLimit = degToRad( 20 )

  draw()

  function draw() {
    gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height )
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    gl.enable( gl.CULL_FACE )
    gl.enable( gl.DEPTH_TEST )

    const matrices = createMatrices( {
      camera, target, up, fieldOfViewRadians,

      worldRotateX: fRotationRadiansX,
      worldRotateY: fRotationRadiansY,

      aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
      zNear: 1,
      zFar: 1000
    } )

    for ( const object of objects ) {
      const { program, vertexArray, instances } = object

      gl.useProgram( program )

      gl.bindVertexArray( vertexArray )

      gl.uniform4fv( uniforms.u_color, [ 0.2, 1, 0.2, 1 ] ) // green

      const lightPosition = new Vector3( lightRotationX, lightRotationY, 300 )
      gl.uniform3fv( uniforms.u_lightWorldPosition, lightPosition.data )
      gl.uniform3fv( uniforms.u_viewWorldPosition, camera.data )

      for ( const { materialUniforms, translateX:x=0, translateY:y=0, translateZ:z=0 } of instances ) {
        const world = new Matrix4( matrices.world )
          .translate( x + translateX, y, z )
          .rotateX( degToRad( rotateX ) )
        const worldViewProjection = new Matrix4( matrices.worldViewProjection ).multiply( world )
        const worldInverseTranspose = new Matrix4( new Matrix4( world ).inverse() ).transpose()

        gl.uniformMatrix4fv( uniforms.u_worldViewProjection, false, worldViewProjection.data )
        gl.uniformMatrix4fv( uniforms.u_worldInverseTranspose, false, worldInverseTranspose.data )
        gl.uniformMatrix4fv( uniforms.u_world, false, world.data )

        gl.uniform1f( uniforms.u_shininess, materialUniforms.u_shininess )
        gl.uniform4fv( uniforms.u_colorMult, materialUniforms.u_colorMult )
        gl.uniform4fv( uniforms.u_specular, materialUniforms.u_specular )
        gl.uniform1f( uniforms.u_specularFactor, materialUniforms.u_specularFactor )

        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, materialUniforms.u_diffuse );
        gl.uniform1i( uniforms.u_diffuse, 0 );

        gl.drawArrays( gl.TRIANGLES, 0, count )
      }
    }
  }

  setInterval( () => {
    // translateX += incrementator
    // rotateX += incrementator * 1

    // if ( Math.abs( translateX ) > 250 )
    //   incrementator *= -1

    if ( keys[ 37 ] )
      camera.data[ 0 ] += -1
    if ( keys[ 39 ] )
      camera.data[ 0 ] += 1

    if ( keys[ 38 ] )
      camera.data[ 2 ] += -1
    if ( keys[ 40 ] )
      camera.data[ 2 ] += 1

    target.data[ 0 ] = camera.data[ 0 ]
    target.data[ 1 ] = camera.data[ 1 ]
    target.data[ 2 ] = camera.data[ 2 ] - 100

    draw()
  }, 10 )
}

let incrementator = .5
let translateX = 0
let rotateX = 0
let count = 0

const keys = []
const mouse = { clientX:null, clientY:null, x:null, y:null,}

const camera = new Vector3( [0, 0, 100] )
const target = new Vector3( [0, 0, 0] )
const up = new Vector3( [0, 1, 0] )

let positions
let normals
let texCoords

loadTheModel( `./models/barrel.obj` ).then( models => {
  const model = models[ 0 ].data
  // const model = myModels.cube

  console.log( models[ 0 ] )

  positions = new Float32Array( model.vertices )
  normals = new Float32Array( model.normals )
  texCoords = new Float32Array( model.textureCoords )

  main()
} )

function getGeometry() {
  const matrix = new Matrix4()
    // .rotateX( Math.PI )
    // .translate( -50, -75, -15 )
    .scale( 50 )

  for ( let i = 0; i < positions.length; i += 3 ) {
    const vector = new Vector3( positions[ i + 0 ], positions[ i + 1 ], positions[ i + 2 ] ).transformByMatrix( matrix )

    positions[ i + 0 ] = vector.data[ 0 ];
    positions[ i + 1 ] = vector.data[ 1 ];
    positions[ i + 2 ] = vector.data[ 2 ];
  }

  count = positions.length / 3
  return positions
}
function getNormals() {
  return normals
}
function getTexcoords() {
  return texCoords
}

window.keys = keys

document.addEventListener( `keydown`, e => keys[ e.keyCode ] = true )
document.addEventListener( `keyup`, e => keys[ e.keyCode ] = false )
document.addEventListener( `mousemove`, ({ clientX, clientY }) => {
  mouse.clientX = clientX
  mouse.clientY = clientY
} )