export const textureUtils = ( () => {
  const canvas = document.createElement( `canvas` )
  const ctx = canvas.getContext( `2d` )

  /** Set canvas width and height
   * @param {Number} width
   * @param {Number} [height] By default height = width
   */
  function resizeCanvas( width, height=width ) {
    canvas.width = width
    canvas.height = height
  }

  /** Create and load texture to WebGL
   * @deprecated Not rewrited code
   * @param {WebGLRenderingContext} gl
   */
  function createTexture( gl ) {
    const tex = gl.createTexture()

    gl.bindTexture( gl.TEXTURE_2D, tex )

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas )
    gl.generateMipmap( gl.TEXTURE_2D )

    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST )

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)

    // gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
    // gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

    return tex
  }

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {String} color1
   * @param {String} color2
   */
  function makeCheckerTexture( gl, color1=`#ffffff`, color2=`#000000` ) {
    resizeCanvas( 2 )

    ctx.fillStyle = color1
    ctx.fillRect( 0, 0, 2, 2 )

    ctx.fillStyle = color2
    ctx.fillRect( 0, 0, 1, 1 )
    ctx.fillRect( 1, 1, 1, 1 )

    return createTexture( gl )
  }

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {String} src
   */
  async function makeImgTexture( gl, src ) {
    const img = new Image
    img.src = src

    await new Promise( res => {
      img.onload = () => {
        resizeCanvas( img.width, img.height )

        ctx.drawImage( img, 0, 0 )
        res()
      }
    } )

    return createTexture( gl )
  }

  return {
    makeCheckerTexture,
    makeImgTexture
  }
} )()

/** Class of 4x4 matrix - X Y Z W
 */
export class Matrix4 {
  /** Constructor of the matrix
   * @param {Number[]|Float32Array|Matrix4} [nums]
   */
  constructor( nums ) {
    if (nums) {
      if (nums instanceof Matrix4)
        this.data = nums.data.slice()
      else if (nums.length == 16) {
        if (nums instanceof Float32Array)
          this.data = nums
        else
          this.data = new Float32Array( nums )
      }
      else
        this.data = new Float32Array( [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ] )
    }
    else {
      this.data = new Float32Array( [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ] )
    }
  }
  /** Multiply two matrices and return a new matrix
   * @param {Number[]|Float32Array|Matrix4} matrixA
   * @param {Number[]|Float32Array|Matrix4} matrixB
   */
  static multiply( matrixA, matrixB ) {
    let a = matrixA instanceof this ? matrixA.data.slice() : matrixA
    let b = matrixB instanceof this ? matrixB.data.slice() : matrixB

    let a00 = a[ 0]
    let a01 = a[ 1]
    let a02 = a[ 2]
    let a03 = a[ 3]
    let a10 = a[ 4]
    let a11 = a[ 5]
    let a12 = a[ 6]
    let a13 = a[ 7]
    let a20 = a[ 8]
    let a21 = a[ 9]
    let a22 = a[10]
    let a23 = a[11]
    let a30 = a[12]
    let a31 = a[13]
    let a32 = a[14]
    let a33 = a[15]

    let b00 = b[ 0]
    let b01 = b[ 1]
    let b02 = b[ 2]
    let b03 = b[ 3]
    let b10 = b[ 4]
    let b11 = b[ 5]
    let b12 = b[ 6]
    let b13 = b[ 7]
    let b20 = b[ 8]
    let b21 = b[ 9]
    let b22 = b[10]
    let b23 = b[11]
    let b30 = b[12]
    let b31 = b[13]
    let b32 = b[14]
    let b33 = b[15]

    return new this( [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
    ] )
  }
  /** Multiply the matrix data by another matrix
   * @param {Matrix4} matrix
   */
  multiply( matrix ) {
    this.data = this.constructor.multiply( this, matrix ).data

    return this
  }
  /**
   * @param {Number} fudgeFactor
   */
  makeZToWMatrix( fudgeFactor ) {
    this.data = this.multiply( [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, fudgeFactor,
      0, 0, 0, 1
    ] ).data

    return this
  }
  /**
   * @param {Number} fieldOfViewInRadians field of view
   * @param {Number} aspect aspect of viewport (width / height)
   * @param {Number} near near Z clipping plane
   * @param {Number} far far Z clipping plane
   */
  setPerspective( fieldOfViewInRadians, aspect, near, far ) {
    let f = Math.tan( Math.PI * .5 - .5 * fieldOfViewInRadians )
    let rangeInv = 1 / (near - far)

    this.data = this.multiply( [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ] ).data

    return this
  }
  /**
   * @param {Number} width
   * @param {Number} height
   * @param {Number} depth
   */
  setProjection( width, height, depth ) {
    this.data = this.multiply( [
      2 / width,   0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth,   0,
      -1, 1, 0, 1
    ] ).data

    return this
  }
  /** Move the object
   * @param {Number} tx X translation
   * @param {Number} ty Y translation
   * @param {Number} tz Z translation
   */
  translate( tx, ty, tz ) {
    this.data = this.multiply( [
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1
    ] ).data

    return this
  }
  /** Rotate object around the X axis
   * @param {Number} angleInRadians amount to rotate
   */
  rotateX( angleInRadians ) {
    let c = Math.cos( angleInRadians )
    let s = Math.sin( angleInRadians )

    this.data = this.multiply( [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ] ).data

    return this
  }
  /** Rotate object around the Y axis
   * @param {Number} angleInRadians amount to rotate
   */
  rotateY( angleInRadians ) {
    let c = Math.cos( angleInRadians )
    let s = Math.sin( angleInRadians )

    this.data = this.multiply( [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ] ).data

    return this
  }
  /** Rotate object around the Z axis
   * @param {Number} angleInRadians amount to rotate
   */
  rotateZ( angleInRadians ) {
    let c = Math.cos( angleInRadians )
    let s = Math.sin( angleInRadians )

    this.data = this.multiply( [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ] ).data

    return this
  }
  /** Zoom in or zoom out the object
   * @param {Number} sx_scale X scale or scale for every axis
   * @param {Number} [sy] Y scale
   * @param {Number} [sz] Z scale
   */
  scale( sx_scale, sy=sx_scale, sz=sx_scale ) {
    this.data = this.multiply( [
      sx_scale, 0,  0,  0,
             0, sy, 0,  0,
             0, 0,  sz, 0,
             0, 0,  0,  1
    ] ).data

    return this
  }
  /** Creates a lookAt matrix for camera
   * @param {Vector3} cameraPosition
   * @param {Vector3} target
   * @param {Vector3} up
   */
  lookAt( cameraPosition, target, up ) {
    let axisZ = Vector3.subtract( cameraPosition, target ).normalize()
    let axisX = Vector3.cross( up, axisZ ).normalize()
    let axisY = Vector3.cross( axisZ, axisX ).normalize()

    this.data = new Float32Array( [
      axisX.data[0], axisX.data[1], axisX.data[2], 0,
      axisY.data[0], axisY.data[1], axisY.data[2], 0,
      axisZ.data[0], axisZ.data[1], axisZ.data[2], 0,
      cameraPosition.data[0], cameraPosition.data[1], cameraPosition.data[2], 1
    ] )

    return this
  }
  /** Computes the inverse of a matrix
   */
  inverse() {
    let m = this.data.slice()

    let m00 = m[ 0]
    let m01 = m[ 1]
    let m02 = m[ 2]
    let m03 = m[ 3]
    let m10 = m[ 4]
    let m11 = m[ 5]
    let m12 = m[ 6]
    let m13 = m[ 7]
    let m20 = m[ 8]
    let m21 = m[ 9]
    let m22 = m[10]
    let m23 = m[11]
    let m30 = m[12]
    let m31 = m[13]
    let m32 = m[14]
    let m33 = m[15]

    // let tmp = [
    //   m22 * m33,  m32 * m23,  m12 * m33,  m32 * m13,
    //   m12 * m23,  m22 * m13,  m02 * m33,  m32 * m03,
    //   m02 * m23,  m22 * m03,  m02 * m13,  m12 * m03,
    //   m20 * m31,  m30 * m21,  m10 * m31,  m30 * m11,
    //   m10 * m21,  m20 * m11,  m00 * m31,  m30 * m01,
    //   m00 * m21,  m20 * m01,  m00 * m11,  m10 * m01
    // ]

    let tmp_0  = m22 * m33
    let tmp_1  = m32 * m23
    let tmp_2  = m12 * m33
    let tmp_3  = m32 * m13
    let tmp_4  = m12 * m23
    let tmp_5  = m22 * m13
    let tmp_6  = m02 * m33
    let tmp_7  = m32 * m03
    let tmp_8  = m02 * m23
    let tmp_9  = m22 * m03
    let tmp_10 = m02 * m13
    let tmp_11 = m12 * m03
    let tmp_12 = m20 * m31
    let tmp_13 = m30 * m21
    let tmp_14 = m10 * m31
    let tmp_15 = m30 * m11
    let tmp_16 = m10 * m21
    let tmp_17 = m20 * m11
    let tmp_18 = m00 * m31
    let tmp_19 = m30 * m01
    let tmp_20 = m00 * m21
    let tmp_21 = m20 * m01
    let tmp_22 = m00 * m11
    let tmp_23 = m10 * m01

    let t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4  * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5  * m31)
    let t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9  * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8  * m31)
    let t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31)
    let t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21)

    let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)

    this.data[ 0] = d * t0;
    this.data[ 1] = d * t1;
    this.data[ 2] = d * t2;
    this.data[ 3] = d * t3;
    this.data[ 4] = d * ((tmp_1  * m10 + tmp_2  * m20 + tmp_5  * m30) - (tmp_0  * m10 + tmp_3  * m20 + tmp_4  * m30))
    this.data[ 5] = d * ((tmp_0  * m00 + tmp_7  * m20 + tmp_8  * m30) - (tmp_1  * m00 + tmp_6  * m20 + tmp_9  * m30))
    this.data[ 6] = d * ((tmp_3  * m00 + tmp_6  * m10 + tmp_11 * m30) - (tmp_2  * m00 + tmp_7  * m10 + tmp_10 * m30))
    this.data[ 7] = d * ((tmp_4  * m00 + tmp_9  * m10 + tmp_10 * m20) - (tmp_5  * m00 + tmp_8  * m10 + tmp_11 * m20))
    this.data[ 8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33))
    this.data[ 9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33))
    this.data[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33))
    this.data[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23))
    this.data[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22))
    this.data[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02))
    this.data[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12))
    this.data[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))

    return this
  }
  /** Transposes a matrix
   */
  transpose( matrix ) {
    let m = matrix ? matrix.data.slice() : this.data.slice()

    this.data = new Float32Array( [
      m[0], m[4], m[8],  m[12],
      m[1], m[5], m[9],  m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15]
    ] )

    return this
  }
}
/** Class of vector with 3 coordinates - X Y Z
 */
export class Vector3 {
  /**
   * @param {Number|Number[]|Float32Array} [xOrVectorArray] Vector X value or all vector data
   * @param {Number} [y] Y vector value
   * @param {Number} [z] Z vector value
   */
  constructor( xOrVectorArray=0, y=0, z=0 ) {
    if (xOrVectorArray.length === 3)
      this.data = new Float32Array( xOrVectorArray )
    else
      this.data = new Float32Array( [xOrVectorArray, y, z] )
  }
  /** Substract two vectors
   * @param {Vector3} vectorA First vector
   * @param {Vector3} vectorB Second vector
   */
  static subtract( vectorA, vectorB ) {
    let a = vectorA.data
    let b = vectorB.data

    return new this(
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    )
  }
  /** Computes the cross product of 2 vectors
   * @param {Vector3} vectorA First vector
   * @param {Vector3} vectorB Second vector
   */
  static cross( vectorA, vectorB ) {
    let a = vectorA.data
    let b = vectorB.data

    return new this(
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    )
  }
  /** Normalize a vector
   * @param {Vector3} [vector] Vector
   */
  normalize() {
    let d = this.data.slice()
    let length = Math.sqrt( d[0] ** 2 + d[1] ** 2 + d[2] ** 2 )

    if (length > 0) {
      this.data[0] = d[0] / length
      this.data[1] = d[1] / length
      this.data[2] = d[2] / length
    }

    return this
  }
  /** Transforms vector interpreted as a point by the matrix
   * @param {Matrix4} matrix
   */
  transformByMatrix( matrix ) {
    let [x, y, z] = this.data.slice()
    let m = matrix.data
    let d = x * m[0 * 4 + 3]  +  y * m[1 * 4 + 3]  +  z * m[2 * 4 + 3]  +  m[3 * 4 + 3]

    this.data = new Float32Array( [
      (x * m[0 * 4 + 0]  +  y * m[1 * 4 + 0]  +  z * m[2 * 4 + 0]  +  m[3 * 4 + 0])  /  d,
      (x * m[0 * 4 + 1]  +  y * m[1 * 4 + 1]  +  z * m[2 * 4 + 1]  +  m[3 * 4 + 1])  /  d,
      (x * m[0 * 4 + 2]  +  y * m[1 * 4 + 2]  +  z * m[2 * 4 + 2]  +  m[3 * 4 + 2])  /  d
    ] )

    return this
  }
}
/** Create WebGL shader from source
 * @param {WebGLRenderingContext} gl
 * @param {WebGLRenderingContextBase} type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {String} source
 */
export function createShader( gl, type, source ) {
  const shader = gl.createShader( type )

  gl.shaderSource( shader, source )
  gl.compileShader( shader )

  return shader
}
/** Create WebGL program from shaders
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader|String} vertexShader Shader or source code
 * @param {WebGLShader|String} fragmentShader Shader or source code
 */
export function createProgram( gl, vertexShader, fragmentShader ) {
  const program = gl.createProgram()

  vertexShader   = typeof vertexShader   == `string`  ?  createShader( gl, gl.VERTEX_SHADER, vertexShader )      :  vertexShader
  fragmentShader = typeof fragmentShader == `string`  ?  createShader( gl, gl.FRAGMENT_SHADER, fragmentShader )  :  fragmentShader

  gl.attachShader( program, vertexShader )
  gl.attachShader( program, fragmentShader )

  gl.linkProgram( program )

  if( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
    throw `Could not compile WebGL program.\n  ${gl.getProgramInfoLog( program )}`

  return program
}
/** Get webgl program uniforms
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
export function getActiveUniforms( gl, program ) {
  const numUniforms = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS )
  const uniforms = {}

  for ( let i = 0;  i < numUniforms;  ++i ) {
    const info = gl.getActiveUniform( program, i );

    uniforms[ info.name ] = gl.getUniformLocation( program, info.name )
  }

  return uniforms
}
/** Get webgl program attributes
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
export function getActiveAttributes( gl, program ) {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES )
  const attributes = {}

  for ( let i = 0;  i < numUniforms;  ++i ) {
    const info = gl.getActiveAttrib( program, i );

    attributes[ info.name ] = gl.getAttribLocation( program, info.name )
  }

  return attributes
}
/** Create vertex attributes object and set attributes data in buffers
 * @param {WebGLRenderingContext} gl
 * @param {*} attributesPos WebGl attributes positions
 * @param {{ numComponents:Number, data:Number[] }} attributes
 */
export function createVAOAndSetAttributes( gl, attributesPos, attributes ) {
  const vao = gl.createVertexArray()

  gl.bindVertexArray( vao )

  for ( const attribute in attributes ) {
    const attr = attributes[ attribute ]
    const attrPos = attributesPos[ attribute ]
    const buffer = gl.createBuffer()

    gl.enableVertexAttribArray( attrPos )
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer )
    gl.bufferData( gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW )

    const type = gl.FLOAT   // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0        // start at the beginning of the buffer
    gl.vertexAttribPointer( attrPos, attr.numComponents, type, normalize, stride, offset)
  }

  return vao
}
/** Create matrices
 * @param {Object} param0
 * @param {Vector3} param0.camera
 * @param {Vector3} param0.target
 * @param {Vector3} param0.up
 * @param {Number} param0.fieldOfViewRadians
 * @param {Number} param0.aspect
 * @param {Number} param0.zNear
 * @param {Number} param0.zFar
 */
export function createMatrices( {
  camera: cam,
  target,
  up,
  fieldOfViewRadians,
  aspect,
  zNear,
  zFar,
  worldRotateX,
  worldRotateY
} ) {
  const projection = new Matrix4().setPerspective( fieldOfViewRadians, aspect, zNear, zFar )
  const camera = new Matrix4().lookAt( cam, target, up )
  const view = new Matrix4( camera ).inverse()
  const viewProjection = new Matrix4( projection ).multiply( view )

  const world = new Matrix4().rotateX( worldRotateX ).rotateY( worldRotateY )
  const worldInverse = new Matrix4( world ).inverse()
  const worldInverseTranspose = new Matrix4( worldInverse ).transpose()
  const worldViewProjection = new Matrix4( viewProjection ).multiply( world )

  return {
    camera,

    view,
    viewProjection,

    world,
    worldInverse,
    worldInverseTranspose,
    worldViewProjection
  }
}
