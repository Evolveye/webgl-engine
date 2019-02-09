import {Matrix4, Vector3, createShader, createProgram} from "./webGlUtils.js"

class Drawer {
  constructor( vShaderCode, fShaderCode ) {
    /** @type {HTMLCanvasElement} */
    this.canvas = document.querySelector( `canvas` )
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientHeight
    let gl = this.gl = this.canvas.getContext( `webgl` )

    this.vShader = createShader( gl, gl.VERTEX_SHADER, `
      attribute vec4 a_position;
      uniform mat4 u_matrix;

      attribute vec3 a_normal;
      varying vec3 v_normal;

      attribute vec3 a_color;
      varying vec3 v_color;

      void main() {
        v_color = a_color;
        v_normal = a_normal;
        gl_Position = a_position * u_matrix;
      }
    ` )
    this.fShader = createShader( gl, gl.FRAGMENT_SHADER, `
      precision mediump float;

      uniform vec3 u_reverseLightDirection;
      uniform vec3 u_color;

      varying vec3 v_normal;
      varying vec3 v_color;

      void main() {
        vec3 normal = normalize( v_normal );

        float light = dot( normal, u_reverseLightDirection );

        gl_FragColor = vec4( v_color, 1 );
        // gl_FragColor = vec4( v_color * light, 1 );
      }
    ` )
    this.program = createProgram( gl, this.vShader, this.fShader )

    this.vBuffer = gl.createBuffer()
    this.cBuffer = gl.createBuffer()
    this.nBuffer = gl.createBuffer()
    this.iBuffer = gl.createBuffer()
    this.indicesCount = 0

    this.matrix = new Matrix4()
    // .makeZToWMatrix( .5 )
    // .setProjection( gl.canvas.clientWidth, gl.canvas.clientHeight, 40 )
    // .rotateY( Math.PI * 0 / 180 )
    .setPerspective( 50, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000 )
    // .translate( 0, 0, -100 )
    // .scale( .5, .5, .5 )

    let a_position = gl.getAttribLocation( this.program, 'a_position' )
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer )
    gl.enableVertexAttribArray( a_position )
    gl.vertexAttribPointer( a_position, 3, gl.FLOAT, false, 0, 0 )

    let a_color = gl.getAttribLocation( this.program, 'a_color' )
    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer )
    gl.enableVertexAttribArray( a_color )
    gl.vertexAttribPointer( a_color, 3, gl.FLOAT, false, 0, 0 )

    let a_normal = gl.getAttribLocation( this.program, 'a_normal' )
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer )
    gl.enableVertexAttribArray( a_normal )
    gl.vertexAttribPointer( a_normal, 3, gl.FLOAT, false, 0, 0 )

    gl.bindBuffer( gl.ARRAY_BUFFER, null )
  }

  setData( indices, vertices, colors, normals ) {
    let gl = this.gl
    // console.log( indices )
    // console.log(
    //   vertices.slice( 0, 3 ),
    //   vertices.slice( 3, 6 ),
    //   vertices.slice( 6, 9 ),
    //   vertices.slice( 9, 12 ),
    //   vertices.slice( 12, 15 ),
    //   vertices.slice( 15, 18 ),
    // )

    vertices = [
      // front wall
      0, 0, 0,   20,0, 0,   0, 20,0,
      20,0, 0,   0, 20,0,   20,20,0,
  
      // back wall
      0, 0, 20,  20,0, 20,  0, 20,20,
      20,0, 20,  0, 20,20,  20,20,20,
  
      // right wall
      20,0, 20,  20,0, 0,   20,20,20,
      20,0, 0,   20,20,20,  20,20,0,
      
      // left wall
      0, 0, 20,  0, 0, 0,   0, 20,20,
      0, 0, 0,   0, 20,20,  0, 20,0,
  
      // top wall
      0, 0, 0,   20,0 ,0,   0, 0, 20,
      20,0 ,0,   0, 0, 20,  20,0, 20,
  
      // bottom wall
      0, 20,0,   20,20,0,   0, 20,20,
      20,20,0,   0, 20,20,  20,20,20
    ]
    colors = [
      /* * Colors
       * red: 1,0,0
       * green: 0,1,0
       * blue: 0,0,1
       * yellow: 1,1,0
       * cyan: 0,1,1
       * purple: .66, .13, .66
       */
  
      .66, .13, .66,
      1,   1,   0,
      1,   0,   0,
      0,   1,   0,
      0,   0,   0,
      .1,  0,   1,
    ]
    indices = [
      0,1,2,
      1,2,3
    ]

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer )
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW )
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null )
    this.indicesCount = indices.length
    
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW )
    gl.bindBuffer( gl.ARRAY_BUFFER, null )
    
    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW )
    gl.bindBuffer( gl.ARRAY_BUFFER, null )
    
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer )
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW )
    gl.bindBuffer( gl.ARRAY_BUFFER, null )
  }

  start() {
    let gl = this.gl
    let u_reverseLightDirection = gl.getUniformLocation( this.program, `u_reverseLightDirection` )
    let u_color = gl.getUniformLocation( this.program, `u_color` )
    
    gl.useProgram( this.program )
    
    gl.uniform3fv( u_reverseLightDirection, new Vector3( [5, 5, 5] ).normalize().data )
    gl.uniform3fv( u_color, new Float32Array( [0.2, 1, 0.2] ) )
    
    gl.enable( gl.DEPTH_TEST )
    gl.depthFunc( gl.LEQUAL )
    gl.viewport( 0, 0, this.canvas.width, this.canvas.height )
    
    gl.clearDepth( 1 )
    gl.clearColor( 0, 0, 0, 0 )

    this.animationId = requestAnimationFrame( timestamp => this.animate( timestamp, 0, gl ) )
  }

  animate( time, lastFrameTime, gl ) {
    let delay = time - lastFrameTime

    let u_matrix = gl.getUniformLocation( this.program, `u_matrix` )
    this.matrix.rotateX( Math.PI * 1 / 180 )
    gl.uniformMatrix4fv( u_matrix, false, this.matrix.data )

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer )
    // gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( data.indices ), gl.STATIC_DRAW )

    // gl.clear( gl.COLOR_BUFFER_BIT )
    gl.drawElements( gl.TRIANGLES, this.indicesCount, gl.UNSIGNED_SHORT, 0 )

    this.animationId = requestAnimationFrame( timestamp => this.animate( timestamp, time, gl ) )
  }
}
export default Drawer