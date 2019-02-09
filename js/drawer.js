import {Matrix4, Vector3, createShader, createProgram} from "./webGlUtils.js"

export default class Drawer {
  constructor() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector( 'canvas' )
    const gl = this.gl = canvas.getContext( 'experimental-webgl' )

    canvas.width  = canvas.clientWidth
    canvas.height = canvas.clientHeight

    let shaders = {
      vertex: createShader( gl, gl.VERTEX_SHADER, `
        attribute vec4 a_position;
        attribute vec3 a_normal;
    
        uniform mat4 u_worldViewProjection;
        uniform mat4 u_worldInverseTranspose;
    
        varying vec3 v_normal;
    
        void main() {
          v_normal = mat3(u_worldInverseTranspose) * a_normal;
    
          gl_Position = a_position * u_worldViewProjection;
        }
      ` ),
      fragment: createShader( gl, gl.FRAGMENT_SHADER, `
        precision mediump float;
    
        uniform vec3 u_reverseLightDirection;
        uniform vec4 u_color;
    
        varying vec3 v_normal;
    
        void main() {
          vec3 normal = normalize( v_normal );
    
          float light = dot( normal, u_reverseLightDirection );
    
          gl_FragColor = u_color;
          gl_FragColor.rgb *= light;
        }
      ` )
    }
    let shaderProgram = createProgram( gl, shaders.vertex, shaders.fragment )
    
    gl.useProgram( shaderProgram )

    let l = this.locations = {
      a_position: gl.getAttribLocation( shaderProgram, 'a_position' ),
      a_normal: gl.getAttribLocation( shaderProgram, 'a_normal' ),
      // a_color: gl.getAttribLocation( shaderProgram, 'a_color' ),
      u_color: gl.getUniformLocation( shaderProgram, 'u_color' ),
      u_worldViewProjection: gl.getUniformLocation( shaderProgram, 'u_worldViewProjection' ),
      u_worldInverseTranspose: gl.getUniformLocation( shaderProgram, 'u_worldInverseTranspose' ),
      u_reverseLightDirection: gl.getUniformLocation( shaderProgram, 'u_reverseLightDirection' )
    }
    let b = this.buffers = {
      indices: gl.createBuffer(),
      vertices: gl.createBuffer(),
      // colors: gl.createBuffer(),
      normals: gl.createBuffer()
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, b.vertices )
    gl.enableVertexAttribArray( l.a_coordinatesPos )
    gl.vertexAttribPointer( l.a_coordinatesPos, 3, gl.FLOAT, false, 0, 0 )

    // gl.bindBuffer( gl.ARRAY_BUFFER, b.colors )
    // gl.enableVertexAttribArray( a_colorPos )
    // gl.vertexAttribPointer( a_colorPos, 3, gl.FLOAT, false, 0, 0 )

    gl.bindBuffer( gl.ARRAY_BUFFER, b.normals )
    gl.enableVertexAttribArray( l.a_normal )
    gl.vertexAttribPointer( l.a_normal, 3, gl.FLOAT, false, 0, 0 )
   
    gl.bindBuffer( gl.ARRAY_BUFFER, null )

    this.matrices = {}
    this.worldSetup = {
      translate: [0,0,0],
      rotate: [0,0,0]
    }

    this.updateMatrices()

    gl.uniform4fv( l.u_color, [0.2, 1, 0.2, 1] ) // green

    gl.uniform3fv( l.u_reverseLightDirection, new Vector3( 0.5, 0.7, 1 ).normalize().data )

    gl.enable( gl.DEPTH_TEST )
    gl.depthFunc( gl.LEQUAL )
    gl.viewport( 0, 0, canvas.width, canvas.height )
   
    gl.clearDepth( 1 )
    gl.clearColor( 0, 0, 0, 0 )

    this.animateId = 0
  }
  /**
   * @param {Number[]} vertices
   */
  set vertices( vertices ) {
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffers.vertices )
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.STATIC_DRAW )
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null )
  }
  /**
   * @param {Number[]} indices
   */
  set indices( indices ) {
    this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices )
    this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), this.gl.STATIC_DRAW )
    this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null )

    this.indicesCount = indices.length
  }
  /**
   * @param {Number[]} colors
   */
  set colors( colors ) {
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffers.colors )
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( colors ), this.gl.STATIC_DRAW )
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null )
  }
  /**
   * @param {Number[]} normals
   */
  set normals( normals ) {
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffers.normals )
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( normals ), this.gl.STATIC_DRAW )
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null )
  }
  /** abc
   * 
   */
  updateMatrices() {
    let worldSetup = this.worldSetup
    let m = this.matrices
    let gl = this.gl

    let fov = 60
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    let zNear = 1
    let zFar = 2000

    let camera = new Vector3( 100, 150, 200 )
    let target = new Vector3( 0, 35, 0 )
    let up = new Vector3( 0, 1, 0 )

    m.camera = new Matrix4().lookAt( camera, target, up )
    m.view = new Matrix4( m.camera ).inverse()
    m.projection = new Matrix4().setPerspective( fov, aspect, zNear, zFar )
    m.viewProjection = Matrix4.multiply( m.projection, m.view )

    m.world = new Matrix4()
    .translate( worldSetup.translate[0], worldSetup.translate[1], worldSetup.translate[2] )
    .rotateX( worldSetup.rotate[0] )
    .rotateY( worldSetup.rotate[1] )
    .rotateZ( worldSetup.rotate[2] )

    m.worldViewProjection = Matrix4.multiply( m.viewProjection, m.world )
    m.worldInverse = new Matrix4( m.world ).inverse()
    m.worldInverseTranspose = new Matrix4( m.worldInverse ).transpose()

    gl.uniformMatrix4fv( this.locations.u_worldViewProjection, false, m.worldViewProjection.data )
    gl.uniformMatrix4fv( this.locations.u_worldInverseTranspose, false, m.worldInverseTranspose.data )
  }
  /**
   * @param {Number} time Current frame time
   * @param {Number} lastFrameTime Last frame time
   */
  animate( time=0, lastFrameTime=0 ) {
    let gl = this.gl
    let delay = time - lastFrameTime
    lastFrameTime = time
 
    gl.clear( gl.COLOR_BUFFER_BIT )
 
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices )
    gl.drawElements( gl.TRIANGLES, 0, gl.UNSIGNED_SHORT, 0)
 
    this.animationId = requestAnimationFrame( timestamp => this.animate( timestamp, time ) )
  }
}