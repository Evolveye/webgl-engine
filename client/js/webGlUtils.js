/** transform values in degrees to radians
 * @param {number} v
 */
export function degToRad( v ) {
  return v * Math.PI / 180
}
/** Class of 4x4 matrix - X Y Z W
 */
export class Matrix4 {
  /** Constructor of the matrix
   * @param {number[]|Float32Array|Matrix4} [nums]
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
   * @param {number[]|Float32Array|Matrix4} matrixA
   * @param {number[]|Float32Array|Matrix4} matrixB
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
   * @param {number} fudgeFactor
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
   * @param {number} fieldOfViewInRadians field of view
   * @param {number} aspect aspect of viewport (width / height)
   * @param {number} near near Z clipping plane
   * @param {number} far far Z clipping plane
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
   * @param {number} width
   * @param {number} height
   * @param {number} depth
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
   * @param {number} tx X translation
   * @param {number} ty Y translation
   * @param {number} tz Z translation
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
   * @param {number} angleInRadians amount to rotate
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
   * @param {number} angleInRadians amount to rotate
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
   * @param {number} angleInRadians amount to rotate
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
   * @param {number} sx_scale X scale or scale for every axis
   * @param {number} [sy] Y scale
   * @param {number} [sz] Z scale
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
   * @param {number|number[]|Float32Array} [xOrVectorArray] Vector X value or all vector data
   * @param {number} [y] Y vector value
   * @param {number} [z] Z vector value
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
/** Create matrices
 * @param {Object} param0
 * @param {Vector3} param0.camera
 * @param {Vector3} param0.target
 * @param {Vector3} param0.up
 * @param {number} param0.fieldOfViewRadians In degress
 * @param {number} param0.aspect
 * @param {number} param0.zNear
 * @param {number} param0.zFar
 */
export function createMatrices( {
  cameraPosition,
  targetPosition,
  up,
  fieldOfViewRadians,
  aspect,
  zNear,
  zFar,
  worldRotateX = 0,
  worldRotateY = 0,
  worldRotateZ = 0
} ) {
  const projection = new Matrix4().setPerspective( degToRad( fieldOfViewRadians ), aspect, zNear, zFar )
  const camera = new Matrix4().lookAt( cameraPosition, targetPosition, up )
  const view = new Matrix4( camera ).inverse()
  const viewProjection = new Matrix4( projection ).multiply( view )

  const world = new Matrix4()
    .rotateX( degToRad( worldRotateX ) )
    .rotateY( degToRad( worldRotateY ) )
    .rotateY( degToRad( worldRotateZ ) )
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
/** Namespace for textures functions
 */
export class Texture {
  static _canvas = document.createElement( `canvas` )
  static _ctx = Texture._canvas.getContext( `2d` )

  /** Set canvas width and height
   * @param {number} width
   * @param {number} [height] By default height = width
   */
  static _resizeCanvas( width, height=width ) {
    this._canvas.width = width
    this._canvas.height = height
  }

  /** Create and load texture to WebGL
   * @param {WebGLRenderingContext} gl
   */
  static _createTexture( gl ) {
    const tex = gl.createTexture()

    gl.bindTexture( gl.TEXTURE_2D, tex )

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._canvas )
    gl.generateMipmap( gl.TEXTURE_2D )

    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST )

    gl.bindTexture( gl.TEXTURE_2D, null )

    return tex
  }

  /** Create texture from 1 color
   * @param {WebGLRenderingContext} gl
   * @param {string} color
   */
  static createColor( gl, color ) {
    const ctx = this._ctx

    this._resizeCanvas( 1 )

    ctx.fillStyle = color
    ctx.fillRect( 0, 0, 1, 1 )

    return this._createTexture( gl )
  }

  /** Create checker texture
   * @param {WebGLRenderingContext} gl
   * @param {string} color1
   * @param {string} color2
   */
  static createChecker( gl, color1=`#ffffff`, color2=`#000000` ) {
    const ctx = this._ctx

    this._resizeCanvas( 2 )

    ctx.fillStyle = color1
    ctx.fillRect( 0, 0, 2, 2 )

    ctx.fillStyle = color2
    ctx.fillRect( 0, 0, 1, 1 )
    ctx.fillRect( 1, 1, 1, 1 )

    return this._createTexture( gl )
  }

  /** Create texture from image
   * @param {WebGLRenderingContext} gl
   * @param {string} src
   */
  static async createFromImg( gl, src ) {
    const img = new Image
    img.src = src

    await new Promise( res => {
      img.onload = () => {
        this._resizeCanvas( img.width, img.height )
        this._ctx.drawImage( img, 0, 0 )

        res()
      }
    } )

    return this._createTexture( gl )
  }
}
/** Namespace for .obj models loader and for its instances class and for primitives
 */
export class Model {
  static Material = class Material {
    constructor( name ) {
      this.name = name
      this.faces = []
      this.kd = []
      this.kdMap = { width:0, height:0, data:[] }
    }
  }
  static Instance = class ModelInstance {
    /** Create classical model for predefined shaders
     * @param {Object} param0
     * @param {number[]} param0.rotate Array with 3 elements (x, y, z)
     * @param {number[]} param0.translate Array with 3 elements (rotate by x, y, z axes)
     * @param {number[]} param0.lightColor Array with 4 elements (r, g, b, a)
     * @param {number[]} param0.colorMult Array with 4 elements (r, g, b, a)
     * @param {number[]} param0.specular Array with 4 elements (r, g, b, a)
     * @param {number} param0.specularFactor
     * @param {WebGLTexture} param0.diffuse
     */
    constructor( {
      rotate = [ 0, 0, 0 ],
      translate = [ 0, 0, 0 ],
      lightColor = [ 1, 1, 1, 1 ],
      colorMult = [ 1, 1, 1, 1 ],
      specular = [1, 1, 1, 1],
      specularFactor = 0,
      shininess = 1,
      diffuse
    } ) {
      this.x = translate[ 0 ]
      this.y = translate[ 1 ]
      this.z = translate[ 2 ]

      this.rotateX = rotate[ 0 ]
      this.rotateY = rotate[ 1 ]
      this.rotateZ = rotate[ 2 ]

      this.materialUniforms = {
        u_lightColor: lightColor,
        u_colorMult: colorMult,
        u_diffuse: diffuse,
        u_shininess: shininess,
        u_specular: specular,
        u_specularFactor: specularFactor
      }
    }
  }

  /** Constructor
   * @param {string} url
   */
  constructor( name ) {
    this.name = name

    this.data = {
      texture: new Image,
      /** @type {Float32Array} */
      textureCoords: [],
      /** @type {Float32Array} */
      vertices: [],
      /** @type {Float32Array} */
      normals: [],
      /** @type {Float32Array} */
      indices: [],
      /** @type {Float32Array} */
      colors: []
    }
    this.info = {
      textureCoords: 0,
      multiplier: 0,
      vertices: 0,
      normals: 0,
      faces: 0,
      indices: 0
    }
  }

  /** Asynchronous model constructor
   */
  static async create( src ) {
    const model = new Model( src.match( /.*\/(.*)\.\w+/ )[ 1 ] )
    const canvas = document.createElement( `canvas` )
    const ctx = canvas.getContext( `2d` )
    const pathToOBJ = src
    const readTheFile = this.readTheFile
    const pathToOBJFolder = src.match( /(.*\/)/ )[ 1 ]

    const materials = new Map
    const textureCoords = []
    const vertices = []
    const normals = []
    const facesElements = []
    const faces = []

    let activeMaterial
    let biggestVert = 0
    let currentMtl

    for await ( let [ prefix, value ] of this.readFile( pathToOBJ ) )
      switch ( prefix ) {
        case `v`: { // vertice
          vertices.push( value
            .split( / /g )
            .map( coord => {
              coord = +coord

              if ( coord > biggestVert )
                biggestVert = coord

              return coord
            } )
          )
        } break
        case `vn`: { // vertice normal
          normals.push( value
            .split( / /g )
            .map( coord => +coord )
          )
        } break
        case `vt`: { // vertice texture cords
          textureCoords.push( value
            .split( / /g )
            .map( coord => +coord )
          )
        } break
        case `f`: { // face
          if ( !activeMaterial ) {
            activeMaterial = materials
              .set( `undefined`, new this.Material )
              .get( `undefined` )
          }

          let texWidth = activeMaterial.kdMap.width  ||  1
          let texHeight = activeMaterial.kdMap.height  ||  1
          let texColors = activeMaterial.kdMap.data.length  ?  activeMaterial.kdMap.data  : [ activeMaterial.kd ]
          let faceElements = value.split( / /g )

          faces.push( faceElements )

          faceElements
          .reduce( (faceElements, element, index, array) => {
            if ( index > 2 ) {
              faceElements.push( array[ 0 ] )
              faceElements.push( array[ index - 1 ] )
            }

            faceElements.push( element )

            return faceElements
          }, [] )
          .forEach( element => {
            if ( !faces.includes( element ) ) {
              facesElements.push( element )
              let nums = element.match( /(?<vertex>\d+)\/(?:(?<texture>\d+))?\/?(?<normal>\d+)/ ).groups

              nums.color = [
                textureCoords[ nums.texture - 1 ][ 0 ] * texWidth,
                textureCoords[ nums.texture - 1 ][ 1 ] * texHeight
              ].map( pos => {
                let i = 1

                while ( pos > i )
                  i++

                return i - 1
              } ).reduce( (x, y) => x + y * texWidth )

              model.data.textureCoords.push( ...textureCoords[ nums.texture - 1 ] )
              model.data.vertices.push( ...vertices[ nums.vertex - 1 ].map( coord => coord / biggestVert ) )
              model.data.normals.push( ...normals[ nums.normal - 1 ] )
              model.data.colors.push( ...texColors[ nums.color ] )
            }

            model.data.indices.push( facesElements.indexOf( element ) )
          } )
        } break
        case `usemtl`: { // use material
          activeMaterial = materials.get( value )
        } break
        case `mtllib`: { // fetch .mtl file
          for await ( let [ mtlPrefix, mtlValue ] of this.readFile( `${pathToOBJFolder}${value}` ) ) {
            switch ( mtlPrefix ) {
              case `newmtl`: {
                currentMtl = materials
                  .set( mtlValue, new this.Material )
                  .get( mtlValue )
              } break
              case 'Kd': {
                currentMtl.kd = mtlValue
                  .split( / /g )
                  .map( coord => +coord )
              } break
              case 'map_Kd': {
                const image = await new Promise( resolve => {
                  const image = new Image

                  image.src = `${pathToOBJFolder}${mtlValue}`
                  image.onload = () => resolve( image )
                } )

                canvas.width = currentMtl.mapKd.width = image.width
                canvas.height = currentMtl.mapKd.height = image.height

                ctx.drawImage( image, 0, 0 )

                const imageData = ctx.getImageData( 0, 0, image.width, image.height )

                for ( const pixels = imageData.data, i = 0;  i < pixels.length;  i += 4 )
                  currentMtl.mapKd.data.push( [
                    pixels[ i + 0 ] / 255 * currentMtl.kd[ 0 ],
                    pixels[ i + 1 ] / 255 * currentMtl.kd[ 1 ],
                    pixels[ i + 2 ] / 255 * currentMtl.kd[ 2 ],
                  ] )
              } break
            }
          }
        } break
      }

    model.info.multiplier = biggestVert
    model.info.textureCoords = textureCoords.length
    model.info.vertices = vertices.length
    model.info.normals = normals.length
    model.info.faces = faces.length
    model.info.indices = model.data.indices.length

    model.data.textureCoords = new Float32Array( model.data.textureCoords )
    model.data.vertices = new Float32Array( model.data.vertices )
    model.data.normals = new Float32Array( model.data.normals )
    model.data.indices = new Float32Array( model.data.indices )

    const matrix = new Matrix4().translate( .5, .5, 0 ).rotateX( Math.PI ).translate( -.5, -.5, 0 )
    const texCoords = model.data.textureCoords
    for ( let i = 0; i < texCoords.length; i += 2 ) {
      const vector = new Vector3( texCoords[ i + 0 ], texCoords[ i + 1 ], 0 ).transformByMatrix( matrix )

      texCoords[ i + 0 ] = vector.data[ 0 ]
      texCoords[ i + 1 ] = vector.data[ 1 ]
    }

    return model
  }

  static createPrimitive( name ) {
    const model = new Model( `Primitive-${name}` )

    /** @type {Float32Array} */
    let vertices
    /** @type {Float32Array} */
    let normals
    /** @type {Float32Array} */
    let textureCoords

    switch ( name ) {
      case `plane`:
        vertices = new Float32Array( [
          // back
          -1, -1, 0,   -1,  1, 0,    1,  1, 0,
          -1, -1, 0,    1,  1, 0,    1, -1, 0,

          // front0
           1,  1, 0,   -1,  1, 0,   -1, -1, 0,
           1, -1, 0,    1,  1, 0,   -1, -1, 0,
        ] )
        normals = new Float32Array( [
          // back
           0,  0, -1,   0,  0, -1,   0,  0, -1,
           0,  0, -1,   0,  0, -1,   0,  0, -1,

          // front
           0,  0,  1,   0,  0,  1,   0,  0,  1,
           0,  0,  1,   0,  0,  1,   0,  0,  1,
        ] )
        textureCoords = new Float32Array( [
          // back
          0, 0,  0, 1,  1, 1,
          0, 0,  1, 1,  1, 0,

          // front
          1, 1,  0, 1,  0, 0,
          1, 0,  1, 1,  0, 0,
        ] )
        break

      case `box`:
        vertices = new Float32Array( [
          // back
          -1, -1, -1,   -1,  1, -1,    1,  1, -1,
          -1, -1, -1,    1,  1, -1,    1, -1, -1,

          // front
           1,  1,  1,   -1,  1,  1,   -1, -1,  1,
           1, -1,  1,    1,  1,  1,   -1, -1,  1,

          // left
          -1,  1, -1,   -1, -1, -1,   -1, -1,  1,
          -1,  1,  1,   -1,  1, -1,   -1, -1,  1,

          // right
           1, -1,  1,    1, -1, -1,    1,  1, -1,
           1, -1,  1,    1,  1, -1,    1,  1,  1,

          // top
           1,  1, -1,   -1,  1, -1,   -1,  1,  1,
           1,  1,  1,    1,  1, -1,   -1,  1,  1,

          // bottom
          -1, -1, -1,    1, -1, -1,   -1, -1,  1,
           1, -1, -1,    1, -1,  1,   -1, -1,  1,
        ] )
        normals = new Float32Array( [
          // back
           0,  0, -1,   0,  0, -1,   0,  0, -1,
           0,  0, -1,   0,  0, -1,   0,  0, -1,

          // front
           0,  0,  1,   0,  0,  1,   0,  0,  1,
           0,  0,  1,   0,  0,  1,   0,  0,  1,

          // left
          -1,  0,  0,   -1,  0,  0,   -1,  0,  0,
          -1,  0,  0,   -1,  0,  0,   -1,  0,  0,

          // right
           1,  0,  0,   1,  0,  0,   1,  0,  0,
           1,  0,  0,   1,  0,  0,   1,  0,  0,

          // top
           0,  1,  0,   0,  1,  0,   0,  1,  0,
           0,  1,  0,   0,  1,  0,   0,  1,  0,

          // bottom
           0, -1,  0,   0, -1,  0,   0, -1,  0,
           0, -1,  0,   0, -1,  0,   0, -1,  0,
        ] )
        textureCoords = new Float32Array( [
          // back
          0, 0,  0, 1,  1, 1,
          0, 0,  1, 1,  1, 0,

          // front
          1, 1,  0, 1,  0, 0,
          1, 0,  1, 1,  0, 0,

          // left
          0, 1,  0, 0,  1, 0,
          1, 1,  0, 1,  1, 0,

          // right
          1, 0,  0, 0,  0, 1,
          1, 0,  0, 1,  1, 1,

          // top
          1, 0,  0, 0,  0, 1,
          1, 1,  1, 0,  0, 1,

          // bottom
          0, 0,  1, 0,  0, 1,
          1, 0,  1, 1,  0, 1,
        ] )
        break
    }

    model.info.multiplier = -1
    model.info.textureCoords = -1
    model.info.vertices = vertices.length
    model.info.normals = normals.length
    model.info.faces = -1
    model.info.indices = vertices.length / 3

    model.data.textureCoords = textureCoords
    model.data.vertices = vertices
    model.data.normals = normals
    model.data.indices = new Float32Array( new Array( vertices.length / 3 ) )

    return model
  }

  /** `.obj` and `.mtl` files reader
   * @param {string} path
   */
  static async * readFile( path ) {
    const rawObj = await fetch( path ).then( file => file.text() )
    const lines = rawObj
      .split( /\r?\n/g )
      .filter( element => element )
      .map( element => element.trim() )

    for ( const line of lines ) {
      const { prefix, value } = line.match( /^(?<prefix>\S+) +(?<value>.+)$/ ).groups

      yield [ prefix, value ]
    }
  }
}
/** Namespace for WebGl program and shaders creators and activators
 */
export class Program {
  /** Create WebGl program
   * @param {WebGLRenderingContext} gl
   * @param {"camera|"shadow"|WebGLShader} typeOrVertexShader Type of program or vertex shader or its code
   * @param {string|WebGLShader} [fragmentShader] Fragment shader or its code
   */
  static create( gl, typeOrVertexShader=`camera`, fragmentShader=null ) {
    const program = gl.createProgram()

    let vShader
    let fShader

    if ( /camera|shadow/.test( typeOrVertexShader )) {
      vShader = this.createShader( gl, gl.VERTEX_SHADER, Program.shaders[ typeOrVertexShader ].vertex )
      fShader = this.createShader( gl, gl.FRAGMENT_SHADER, Program.shaders[ typeOrVertexShader ].fragment )
    }
    else if ( typeOrVertexShader && fragmentShader ) {
      vShader = typeof vertexShader   == `string`  ?  createShader( gl, gl.VERTEX_SHADER, vertexShader )      :  vertexShader
      fShader = typeof fragmentShader == `string`  ?  createShader( gl, gl.FRAGMENT_SHADER, fragmentShader )  :  fragmentShader
    }

    gl.attachShader( program, vShader )
    gl.attachShader( program, fShader )

    gl.linkProgram( program )

    if( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
      throw `Could not compile WebGL program.\n  ${gl.getProgramInfoLog( program )}`

    return program
  }
  /** Create WebGL shader from source
   * @param {WebGLRenderingContext} gl
   * @param {WebGLRenderingContextBase} type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param {string} source
   */
  static createShader( gl, type, source ) {
    const shader = gl.createShader( type )

    gl.shaderSource( shader, source )
    gl.compileShader( shader )

    return shader
  }
  /** Get webgl program attributes
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   */
  static getActiveAttributes( gl, program ) {
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES )
    const attributes = {}

    for ( let i = 0;  i < numUniforms;  ++i ) {
      const info = gl.getActiveAttrib( program, i );

      attributes[ info.name ] = gl.getAttribLocation( program, info.name )
    }

    return attributes
  }
  /** Get webgl program uniforms
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   */
  static getActiveUniforms( gl, program ) {
    const numUniforms = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS )
    const uniforms = {}

    for ( let i = 0;  i < numUniforms;  ++i ) {
      const info = gl.getActiveUniform( program, i );

      uniforms[ info.name ] = gl.getUniformLocation( program, info.name )
    }

    return uniforms
  }
  /** Create vertex attributes object and set attributes data in buffers
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   * @param {{ numComponents:number, data:number[] }} attributes
   */
  static createVAOAndSetAttributes( gl, program, attributes ) {
    const attributesPos = this.getActiveAttributes( gl, program )
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
  static shaders = {
    camera: {
      vertex: `#version 300 es
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
          v_normal = (u_worldInverseTranspose * vec4( a_normal, 0 )).xyz;

          v_surfaceToLight = u_lightWorldPosition - (u_world * a_position).xyz;
          v_surfaceToView = (u_viewInverse[ 3 ] - (u_world * a_position)).xyz;
          gl_Position = v_position;
        }
      `,
      fragment: `#version 300 es
        precision mediump float;

        in vec4 v_position;
        in vec2 v_texCoord;
        in vec3 v_normal;
        in vec3 v_surfaceToLight;
        in vec3 v_surfaceToView;

        uniform vec4 u_lightColor;
        uniform vec4 u_colorMult;
        uniform sampler2D u_diffuse;
        uniform vec4 u_specular;
        uniform float u_shininess;
        uniform float u_specularFactor;

        out vec4 outColor;

        vec4 lit( float l, float h, float m ) {
          return vec4(
            1.0,
            max( l, 0.0 ),
            (l > 0.0)  ?  pow( max( 0.0, h ), m )  :  0.0,
            1.0
          );
        }

        void main() {
          vec4 diffuseColor = texture( u_diffuse, v_texCoord );
          vec3 a_normal = normalize( v_normal );
          vec3 surfaceToLight = normalize( v_surfaceToLight );
          vec3 surfaceToView = normalize( v_surfaceToView );
          vec3 halfVector = normalize( surfaceToLight + surfaceToView );

          vec4 litR = lit(
            dot( a_normal, surfaceToLight ),
            dot( a_normal, halfVector ),
            u_shininess
          );

          outColor = vec4(
            (u_lightColor * (
              diffuseColor * litR.y * u_colorMult +
              u_specular * litR.z * u_specularFactor
            ) ).rgb,
            diffuseColor.a
          );

          // outColor = vec4( .2, .8, .2, 1 );
        }
      `
    },
    shadow: { vertex:``, fragment:`` }
  }
}
/** WebGL Library renderer (main, and general class)
 */
export default class Renderer {
  static Material = class Material {
    /**
     * @param {string} name
     * @param {object} param1
     * @param {number[]} param1.lightColor
     * @param {number[]} param1.colorMult
     * @param {number[]} param1.specular
     * @param {number} param1.specularFactor
     * @param {number} param1.shininess
     */
    constructor( name, { lightColor, colorMult, specular, specularFactor, shininess } ) {
      this.name = name
      this.lightColor = lightColor
      this.colorMult = colorMult
      this.specular = specular
      this.specularFactor = specularFactor
      this.shininess = shininess
    }
  }

  /** Create WebGl program
   * @param {WebGLRenderingContext} gl
   * @param {string|WebGLShader} [vertexShader] Vertex shader or its source
   * @param {string|WebGLShader} [fragmentShader] Fragment shader or its code
   */
  constructor( gl, vertexShader=null, fragmentShader=null ) {
    this.cameraProgram = Program.create( gl, `camera` )
    this.uniforms = Program.getActiveUniforms( gl, this.cameraProgram )
    this.gl = gl

    gl.enable( gl.CULL_FACE )
    gl.enable( gl.DEPTH_TEST )
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )
    gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height )

    const defaultPosZ = (gl.canvas.clientHeight / 2) / Math.tan( Math.PI / 6 )

    this._fov = 60
    this._upVector = new Vector3( 0, 1, 0 )
    this._cameraPos = new Vector3( 0, 0, defaultPosZ )
    this._targetPos = new Vector3( 0, 0, 0 )
    this._pointLightPos = new Vector3( 0, 0, defaultPosZ )
    this._aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

    /** @type {Map<string,{modelInfo:Any instances:Model.Instance[] vao:Any }> */
    this.models = new Map
    /** @type {Map<string,Renderer.Material} */
    this.materials = new Map
    /** @type {Map<string,WebGLTexture} */
    this.textures = new Map

    this._matrices = null

    gl.useProgram( this.cameraProgram )
    gl.uniform3fv( this.uniforms.u_viewWorldPosition, this._cameraPos.data )
    gl.uniform3fv( this.uniforms.u_lightWorldPosition, this._pointLightPos.data )

    this._rebuildMatrices()
  }

  /** Rebuild matrices
   */
  _rebuildMatrices() {
    this._matrices = createMatrices( {
      cameraPosition: this._cameraPos,
      targetPosition: this._targetPos,
      fieldOfViewRadians: this._fov,
      up: this._upVector,

      aspect: this._aspect,
      zNear: 1,
      zFar: 1000
    } )
  }
  /** Load model to renderer storage */
  _loadModel( name, model ) {
    this.models.set( name, {
      modelInfo: model.info,
      instances: [],
      vao: Program.createVAOAndSetAttributes( this.gl, this.cameraProgram, {
        a_texcoord: { numComponents:2, data:model.data.textureCoords },
        a_position: { numComponents:3, data:model.data.vertices },
        a_normal:   { numComponents:3, data:model.data.normals }
      } )
    } )
  }

  /** Create model, create its VAO, and load it to renderer storage
   * @param {string} name
   * @param {string} primitiveOrPath primitive name or path to .obj file
   */
  async loadModel( name, primitiveOrPath, x=50, y=x, z=x ) {
    const matrix = new Matrix4().scale( x / 2, y / 2, z / 2 )
    const model =/\.obj$/.test( primitiveOrPath )
      ? await Model.create( primitiveOrPath )
      : Model.createPrimitive( primitiveOrPath )

    const { vertices } = model.data

    for ( let i = 0; i < vertices.length; i += 3 ) {
      const vector = new Vector3( vertices[ i + 0 ], vertices[ i + 1 ], vertices[ i + 2 ] ).transformByMatrix( matrix )

      vertices[ i + 0 ] = vector.data[ 0 ]
      vertices[ i + 1 ] = vector.data[ 1 ]
      vertices[ i + 2 ] = vector.data[ 2 ]
    }

    this._loadModel( name, model )
  }
  /** Create texture from image and load it to renderer storage
   * @param {string} name
   * @param {string} urlToImage
   */
  async createTextureImg( name, urlToImage ) {
    this.textures.set( name, await Texture.createFromImg( this.gl, urlToImage ) )
  }
  /** Create texture from color and load it to renderer storage
   * @param {string} name
   * @param {string} color
   */
  createTextureColor( name, color ) {
    this.textures.set( name, Texture.createColor( this.gl, color ) )
  }
  /** Create checker texture and load it to renderer storage
   * @param {string} name
   * @param {string} color1
   * @param {string} color2
   */
  createTextureChecker( name, color1, color2 ) {
    this.textures.set( name, Texture.createChecker( this.gl, color1, color2 ) )
  }
  /** Create new material and load it to renderer storage
   * @param {string} name
   * @param {object} param1
   * @param {number[]} param1.lightColor
   * @param {number[]} param1.colorMult
   * @param {number[]} param1.specular
   * @param {number} param1.specularFactor
   * @param {number} param1.shininess
   */
  createMaterial( name, materialInfo ) {
    this.materials.set( name, new Renderer.Material( name, materialInfo ) )
  }

  /** Set the camera position
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setCameraPos( x, y, z ) {
    const { gl, uniforms, cameraProgram } = this

    this._cameraPos = new Vector3( x, y, z )
    this._rebuildMatrices()

    gl.useProgram( cameraProgram )
    gl.uniform3fv( uniforms.u_viewWorldPosition, this._cameraPos.data )
  }
  /** Set the target position
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setTargetPos( x, y, z ) {
    this._targetPos = new Vector3( x, y, z )
    this._rebuildMatrices()
  }
  /** Set the camera position
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setPointLightPos( x, y, z ) {
    const { gl, uniforms, cameraProgram } = this

    this._pointLightPos = new Vector3( x, y, z )
    this._rebuildMatrices()

    gl.useProgram( cameraProgram )
    gl.uniform3fv( uniforms.u_lightWorldPosition, this._pointLightPos.data )
  }
  /** Set the "up" vector
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setUpVector( x, y, z ) {
    this._upVector = new Vector3( x, y, z )
    this._rebuildMatrices()
  }
  /** Set the "up" vector
   * @param {number} value
   */
  setAspect( value ) {
    this._aspect = value
    this._rebuildMatrices()
  }
  /** Set the field of view (FoV)
   * @param {number} value
   */
  setFieldOfView( value ) {
    this._fieldOfView = value
    this._rebuildMatrices()
  }

  /** Active the texture
   * @param {string} name
   */
  useTexture( name ) {
    const { gl, uniforms, cameraProgram, textures } = this

    gl.useProgram( cameraProgram )

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, textures.get( name ) );
    gl.uniform1i( uniforms.u_diffuse, 0 );
  }
  /** Active the material
   * @param {string} name
   */
  useMaterial( name ) {
    const { gl, uniforms, cameraProgram, materials } = this
    const material = materials.get( name )

    gl.useProgram( cameraProgram )

    gl.uniform1f( uniforms.u_shininess, material.shininess )
    gl.uniform4fv( uniforms.u_lightColor, material.lightColor )
    gl.uniform4fv( uniforms.u_colorMult, material.colorMult )
    gl.uniform4fv( uniforms.u_specular, material.specular )
    gl.uniform1f( uniforms.u_specularFactor, material.specularFactor )
  }

  draw( modelName, { x=0, y=0, z=0, rX=0, rY=0, rZ=0 }={} ) {
    const { gl, _matrices, models, cameraProgram, uniforms } = this
    const { vao, modelInfo } = models.get( modelName )
    const world = new Matrix4( _matrices.world )
      .translate( x, y, z )
      .rotateX( degToRad( rX ) )
      .rotateY( degToRad( rY ) )
      .rotateZ( degToRad( rZ ) )
    const worldViewProjection = new Matrix4( _matrices.worldViewProjection ).multiply( world )
    const worldInverseTranspose = new Matrix4( new Matrix4( world ).inverse() ).transpose()

    gl.useProgram( cameraProgram )
    gl.bindVertexArray( vao )

    gl.uniformMatrix4fv( uniforms.u_worldViewProjection, false, worldViewProjection.data )
    gl.uniformMatrix4fv( uniforms.u_worldInverseTranspose, false, worldInverseTranspose.data )
    gl.uniformMatrix4fv( uniforms.u_world, false, world.data )

    gl.drawArrays( gl.TRIANGLES, 0, modelInfo.indices )
  }
}