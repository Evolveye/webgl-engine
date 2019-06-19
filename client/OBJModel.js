class OBJModel {
  constructor( url ) {
    this.name = url

    this.textureCoords = 0
    this.vertices = 0
    this.normals = 0
    this.faces = 0

    this.glData = {
      vertices: [],
      normals: [],
      indices: [],
      colors: [],
      vertices2: []
    }
  }

  /** Asynchronous OBJModel constructor
   * @param {OBJModel} model
   */
  static async creatorTheModel( model ) {
    const canvas = document.createElement( `canvas` )
    const ctx = canvas.getContext( `2d` )

    let activeMaterial
    let biggestVert = 0
    const pathToOBJ = model.name
    const readTheFile = OBJModel.readTheFile
    const pathToOBJFolder = pathToOBJ.match( /(.*\/)/ )[  1 ]

    const materials = new Map
    const textureCoords = []
    const vertices = []
    const normals = []
    const facesElements = []
    const faces = []

    for await ( let [ prefix, value ] of readTheFile( pathToOBJ ) )
      switch ( prefix ) {
        case `v`: { // vertice
          vertices.push(
            value
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
          normals.push(
            value
            .split( / /g )
            .map( coord => +coord )
          )
        } break
        case `vt`: { // vertice normal
          textureCoords.push(
            value
            .split( / /g )
            .map( coord => +coord )
          )
        } break
        case `f`: { // face
          if ( !activeMaterial ) {
            materials.set( 'undefined', {
              faces: [],
              kd: [.3,.3,.3],
              mapKd: {
                width: 0,
                height: 0,
                data: []
              }
            } )
            activeMaterial = materials.get( 'undefined' )
          }

          let texWidth = activeMaterial.mapKd.width  ||  1
          let texHeight = activeMaterial.mapKd.height  ||  1
          let texColors = activeMaterial.mapKd.data.length  ?  activeMaterial.mapKd.data  : [activeMaterial.kd]
          let faceElements = value.split( / /g )

          faces.push( faceElements )

          faceElements
          .reduce( (faceElements, element, index, array) => {
            if ( index > 2 ) {
              faceElements.push( array[0] )
              faceElements.push( array[index - 1] )
            }

            faceElements.push( element )

            return faceElements
          }, [] )
          .forEach( (element, index) => {
            if( !faces.includes( element ) ) {
              facesElements.push( element )
              let nums = element.match( /(?<vertex>\d+)\/(?:(?<texture>\d+))?\/?(?<normal>\d+)/ ).groups

              nums.color = [
                textureCoords[+nums.texture - 1][0] * texWidth,
                textureCoords[+nums.texture - 1][1] * texHeight
              ].map( pos => {
                let i = 1
                while( pos > i ) i++
                return i - 1
              } ).reduce( (x, y) => x + y * texWidth )

              model.glData.vertices.push( ...vertices[nums.vertex - 1].map( coord => coord / biggestVert ) )
              model.glData.colors.push( ...texColors[nums.color] )
              model.glData.normals.push( ...normals[nums.normal - 1] )
            }

            model.glData.indices.push( facesElements.indexOf( element ) )
          } )
        } break
        case `usemtl`: { // use material
          activeMaterial = materials.get( value )
        } break
        case `mtllib`: { // fetch .mtl file
          let newMtl
          for await( let [ mtlPrefix, mtlValue ] of readTheFile( `${pathToOBJFolder}${value}` ) ) {
            if( mtlPrefix === `newmtl` ) {
              materials.set( mtlValue, {
                faces: [],
                kd: [],
                mapKd: {
                  width: 0,
                  height: 0,
                  data: []
                }
              } )
              newMtl = materials.get( mtlValue )
            } else if( !newMtl )
              continue

            switch( mtlPrefix ) {
              case 'Kd': {
                newMtl.kd = mtlValue
                  .split( / /g )
                  .map( coord => +coord )
              } break
              case 'map_Kd': {
                const image = await new Promise( resolve => {
                  let image = new Image
                  image.src = `${pathToOBJFolder}${mtlValue}`
                  image.onload = () => resolve( image )
                } )
                canvas.width = newMtl.mapKd.width = image.width
                canvas.height = newMtl.mapKd.height = image.height

                ctx.drawImage( image, 0, 0 )

                let imageData = ctx.getImageData( 0, 0, image.width, image.height )
                for( let pixels = imageData.data, i = 0;  i < pixels.length;  i += 4 )
                  newMtl.mapKd.data.push( [
                    pixels[i + 0] / 255 * newMtl.kd[0],
                    pixels[i + 1] / 255 * newMtl.kd[1],
                    pixels[i + 2] / 255 * newMtl.kd[2],
                  ] )
              } break
            }
          }
        } break
      }

    model.textureCoords = textureCoords.length
    model.vertices = vertices.length
    model.normals = normals.length
    model.faces = faces.length
    model.multiplier = biggestVert

    return model
  }

  /** `.obj` and `.mtl` files reader
   * @param {String} path
   */
  static async * readTheFile( path ) {
    const rawObj = await fetch( path )
      .then( file => file.text() )

    const lines = rawObj
      .split( /\r?\n/g )
      .filter( element => element )
      .map( element => element.trim() )

    for( let line of lines ) {
      let { prefix, value } = line
        .match( /^(?<prefix>\S+) +(?<value>.+)$/ ).groups

      yield [ prefix, value ]
    }
  }

  /** Public `OBJModel` constructor
   * @param {String[]} listOfURLs
   */
  static async parse( ...listOfURLs ) {
    if( !Array.isArray( listOfURLs ) )
      listOfURLs = [listOfURLs]

    let models = []
    for( let url of listOfURLs )
      models.push( await OBJModel.creatorTheModel( new OBJModel( url ) ) )

    return models
  }
}

export default OBJModel.parse