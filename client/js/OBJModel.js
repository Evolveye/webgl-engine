/*

geometria
materiały

*/


class OBJModel {
  /** Constructor
   * @param {String} url
   */
  constructor( url ) {
    this.name = url

    this.data = {
      texture: new Image,
      /** @type {Number[]} */
      textureCoords: [],
      /** @type {Number[]} */
      vertices: [],
      /** @type {Number[]} */
      normals: [],
      /** @type {Number[]} */
      indices: [],
      /** @type {Number[]} */
      colors: []
    }
    this.info = {
      textureCoords: 0,
      multiplier: 0,
      vertices: 0,
      normals: 0,
      faces: 0
    }
  }

  /** Asynchronous OBJModel constructor
   */
  static async create( url ) {
    const model = new OBJModel( url )
    const canvas = document.createElement( `canvas` )
    const ctx = canvas.getContext( `2d` )
    const pathToOBJ = model.name
    const readTheFile = OBJModel.readTheFile
    const pathToOBJFolder = pathToOBJ.match( /(.*\/)/ )[ 1 ]

    const materials = new Map
    const textureCoords = []
    const vertices = []
    const normals = []
    const facesElements = []
    const faces = []

    let activeMaterial
    let biggestVert = 0
    let currentMtl

    for await ( let [ prefix, value ] of readTheFile( pathToOBJ ) )
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
              .set( `undefined`, new Material )
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
          for await ( let [ mtlPrefix, mtlValue ] of readTheFile( `${pathToOBJFolder}${value}` ) ) {
            switch ( mtlPrefix ) {
              case `newmtl`: {
                currentMtl = materials
                  .set( mtlValue, new Material )
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

    return model
  }

  /** `.obj` and `.mtl` files reader
   * @param {String} path
   */
  static async * readTheFile( path ) {
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

  /** Public `OBJModel` constructor
   * @param {String[]} listOfURLs
   */
  static async parse( ...listOfURLs ) {
    if ( !Array.isArray( listOfURLs ) )
      listOfURLs = [ listOfURLs ]

    /** @type {OBJModel[]} */
    const models = []

    for ( const url of listOfURLs )
      models.push( await OBJModel.create( url ) )

    return models
  }
}

// it is not working at the moment
class Material {
  constructor( name ) {
    this.name = name
    this.faces = []
    this.kd = []
    this.kdMap = { width:0, height:0, data:[] }
  }
}

OBJModel.Material = Material

export default OBJModel.parse