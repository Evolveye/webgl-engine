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

const { makeCheckerTexture } = textureUtils


const vertexShaderSource = `#version 300 es
  uniform mat4 u_worldViewProjection;
  uniform vec3 u_lightWorldPos;
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
    v_surfaceToLight = u_lightWorldPos - (u_world * a_position).xyz;
    v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
    gl_Position = v_position;
  }
`

// u_colorMult: [ 1, 1, 1, 1 ],
// u_diffuse: makeCheckerTexture( gl ),
// u_specular: [1, 1, 1, 1],
// u_shininess: 150,
// u_specularFactor: 0,

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
    vec4 u_lightColor = vec4( 0, 1, 1, 1 ); // - - - - - - - - - - - - - - - - - TO REWRITE

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

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector( `.gl` )
  const gl = canvas.getContext( `webgl2` )

  if ( !gl )
    return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const programInfo = createProgram( gl, vertexShaderSource, fragmentShaderSource )
  const attributes = getActiveAttributes( gl, programInfo )
  const uniforms = getActiveUniforms( gl, programInfo )

  const objects = [
    { // barrel
      programInfo,
      bufferInfo: null,
      vertexArray: null,
      uniforms: null,
      instances: [
        {
          // radius: rand(150),
          // xRotation: rand(Math.PI * 2),
          // yRotation: rand(Math.PI),
          materialUniforms: {
            u_colorMult: [ 1, 1, 1, 1 ],
            u_diffuse: makeCheckerTexture( gl ),
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
  } )

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  let fieldOfViewRadians = degToRad(60);
  let fRotationRadiansX = 0;
  let fRotationRadiansY = 0;
  let shininess = 150;
  let lightRotationX = 0;
  let lightRotationY = 0;
  let lightDirection = [0, 0, 1];  // this is computed in updateScene
  let innerLimit = degToRad(10);
  let outerLimit = degToRad(20);

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#fRotationX",     {value: radToDeg(fRotationRadiansX), slide: updateRotationX, min: -360, max: 360});
  webglLessonsUI.setupSlider("#fRotationY",     {value: radToDeg(fRotationRadiansY), slide: updateRotationY, min: -360, max: 360});
  webglLessonsUI.setupSlider("#lightRotationX", {value: lightRotationX, slide: updatelightRotationX, min: -2, max: 2, precision: 2, step: 0.001});
  webglLessonsUI.setupSlider("#lightRotationY", {value: lightRotationY, slide: updatelightRotationY, min: -2, max: 2, precision: 2, step: 0.001});
  webglLessonsUI.setupSlider("#innerLimit",     {value: radToDeg(innerLimit), slide: updateInnerLimit, min: 0, max: 180});
  webglLessonsUI.setupSlider("#outerLimit",     {value: radToDeg(outerLimit), slide: updateOuterLimit, min: 0, max: 180});

  function updateRotationX(event, ui) {
    fRotationRadiansX = degToRad(ui.value);
    drawScene();
  }
  function updateRotationY(event, ui) {
    fRotationRadiansY = degToRad(ui.value);
    drawScene();
  }
  function updatelightRotationX(event, ui) {
    lightRotationX = ui.value;
    drawScene();
  }
  function updatelightRotationY(event, ui) {
    lightRotationY = ui.value;
    drawScene();
  }
  function updateInnerLimit(event, ui) {
    innerLimit = degToRad(ui.value);
    drawScene();
  }
  function updateOuterLimit(event, ui) {
    outerLimit = degToRad(ui.value);
    drawScene();
  }
  function drawScene() {
    gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height )
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

    gl.enable( gl.CULL_FACE )
    gl.enable( gl.DEPTH_TEST )

    gl.useProgram( programInfo )

    gl.bindVertexArray( vao )

    // const camera = new Vector3( [0, -50, 200] );
    // const target = new Vector3( [0, 35, 0] );
    // const up = new Vector3( [0, 1, 0] );
    const matrices = createMatrices( {
      camera, target, up, fieldOfViewRadians,

      worldRotateX: fRotationRadiansX,
      worldRotateY: fRotationRadiansY,

      aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
      zNear: 1,
      zFar: 1000
    } )

    // Set the matrices
    gl.uniformMatrix4fv( uniforms.u_worldViewProjection, false, matrices.worldViewProjection )
    gl.uniformMatrix4fv( uniforms.u_worldInverseTranspose, false, matrices.worldInverseTranspose )
    gl.uniformMatrix4fv( uniforms.u_world, false, matrices.world )

    // Set the color to use
    gl.uniform4fv( uniforms.u_color, [0.2, 1, 0.2, 1] ) // green

    // set the light position
    const lightPosition = new Vector3( 40, 60, 120 )
    gl.uniform3fv( uniforms.u_lightWorldPosition, lightPosition.data )

    // set the camera/view position
    gl.uniform3fv( uniforms.u_viewWorldPosition, camera.data )

    // set the shininess
    gl.uniform1f( uniforms.u_shininess, shininess )

    // set the spotlight uniforms
    // since we don't have a plane like most spotlight examples
    // let's point the spot light at the F
    {
      const lmat = new Matrix4()
        .lookAt( lightPosition, target, up )
        .rotateX( lightRotationX )
        .rotateY( lightRotationY )
        .data

      // get the zAxis from the matrix
      // negate it because lookAt looks down the -Z axis
      lightDirection = new Vector3( [-lmat[8], -lmat[9], -lmat[10]] );
    }

    gl.uniform3fv( uniforms.u_lightDirection, lightDirection.data )
    gl.uniform1f( uniforms.u_innerLimit, Math.cos( innerLimit ) )
    gl.uniform1f( uniforms.u_outerLimit, Math.cos( outerLimit ) )

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    // var count = 16 * 6
    gl.drawArrays(primitiveType, offset, count);

  }
}

let count = 0
const myData = true
const getGeometry = myData  ?  myGeo  :  notMyGeo
const getNormals = myData  ?  myNormals  :  notMyNormals

const camera = new Vector3( [0, 0, 400] );
const target = new Vector3( [0, 0, 0] );
const up = new Vector3( [0, 1, 0] );

let positions = new Float32Array( [
  0,   0,  0,
  0, 150,  0,
  150,   0,  0,
  0, 150,  0,
  150, 150,  0,
  150,   0,  0,
] )
let normals = new Float32Array( [
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1
] )

const myModels = {
  cube: {
    vertices: [
      -0.5, 1, 0.5,
      -0.5, 0, -0.5,
      -0.5, 0, 0.5,
      -0.5, 1, -0.5,
      -0.5, 0, -0.5,
      -0.5, 1, 0.5,

      0.5, 0, 0.5,
      0.5, 0, -0.5,
      0.5, 1, 0.5,
      0.5, 1, 0.5,
      0.5, 0, -0.5,
      0.5, 1, -0.5,

      0.5, 0, 0.5,
      -0.5, 1, 0.5,
      -0.5, 0, 0.5,
      0.5, 1, 0.5,
      -0.5, 1, 0.5,
      0.5, 0, 0.5,

      // -0.5, 0, 0.5,
      // -0.5, 1, 0.5,
      // 0.5, 0, 0.5,
      // 0.5, 1, 0.5,
    ],
    normals: [
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,

      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,

      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ]
  }
}

loadTheModel( `./barrel.obj` ).then( models => {
  const model = models[ 0 ].glData
  // const model = myModels.cube

  console.log( model )

  positions = new Float32Array( model.vertices )
  normals = new Float32Array( model.normals )

  main()
} )

function myGeo(gl) {
  const copy = positions.slice()
  const matrix = new Matrix4()
    // .rotateX( Math.PI )
    // .translate( -50, -75, -15 )
    .scale( 50 )

  for (var ii = 0; ii < positions.length; ii += 3) {
    const vector = new Vector3( positions[ii + 0], positions[ii + 1], positions[ii + 2] ).transformByMatrix( matrix )
    positions[ii + 0] = vector.data[0];
    positions[ii + 1] = vector.data[1];
    positions[ii + 2] = vector.data[2];
  }
  // for ( let i = 0;  i < positions.length;  i += 3 ) {
  //   console.log( `${i / 3}:`, copy[ i + 0 ], positions[ i + 0 ] )
  //   console.log( `${` `.repeat( `${i}`.length )} `, copy[ i + 1 ], positions[ i + 1 ] )
  //   console.log( `${` `.repeat( `${i}`.length )} `, copy[ i + 2 ], positions[ i + 2 ] )
  // }

  count = positions.length / 3
  return positions
  gl.bufferData( gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW )
}

function myNormals(gl) {
  return normals
  gl.bufferData( gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW )
}




function notMyGeo(gl) {
  var positions = new Float32Array([
          // left column front
          0,    0,  0,
          0,  150,  0,
          30,   0,  0,
          0,  150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0,
      ]);

  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  var matrix = new Matrix4()
    .rotateX( Math.PI )
    .translate( -50, -75, -15 )

  var copy = positions.slice()

  for (var ii = 0; ii < positions.length; ii += 3) {
    // var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    const vector = new Vector3( positions[ii + 0], positions[ii + 1], positions[ii + 2] ).transformByMatrix( matrix )
    positions[ii + 0] = vector.data[0];
    positions[ii + 1] = vector.data[1];
    positions[ii + 2] = vector.data[2];
  }

  for ( let i = 0;  i < positions.length;  i += 3 ) {
    console.log( `${i / 3}:`, copy[ i + 0 ], positions[ i + 0 ] )
    console.log( `${` `.repeat( `${i}`.length )} `, copy[ i + 1 ], positions[ i + 1 ] )
    console.log( `${` `.repeat( `${i}`.length )} `, copy[ i + 2 ], positions[ i + 2 ] )
  }

  count = positions.length / 3
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function notMyNormals(gl) {
  var normals = new Float32Array([
          // left column front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,

          // top rung front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,

          // middle rung front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,

          // left column back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,

          // top rung back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,

          // middle rung back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,

          // top
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          // top rung right
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

          // under top rung
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

          // between top rung and middle
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

          // top of middle rung
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          // right of middle rung
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

          // bottom of middle rung.
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

          // right of bottom
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

          // bottom
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

          // left side
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
      ]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}
