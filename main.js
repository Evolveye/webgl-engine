import Drawer from "./JS/drawerData.js"
import parseOBJ from "./JS/OBJModel.js"
import Ui from "./JS/uiBuilder.js"
import ImprovedWorker from "./js/ImprovedWorker.js"

const drawer = new Drawer
const ui = new Ui( {style:`right:0`} )
const worker = new ImprovedWorker( `./JS/worker.mjs` )

parseOBJ( `../modele/obj/voxel.obj` )
.then( models => {
  let model = models[0].glData

  model.vertices = model.vertices.map( vertice => ++vertice/2 * 100 )

  return model
} )
.then( model => {
  // let worldTransform = (type, value, index=NaN) => {
  //   if (!isNaN( index ))
  //     drawer.worldSetup[type][index] = value
  //   else
  //     drawer.worldSetup[type] = value

  //   drawer.updateMatrices()
  // }

  // // ui.addRange( `fov`, 130, 0, 180, value => matrixData.fov = Math.PI * value / 180 )
  // ui.addRange( `transX`, 0, -100, 100, value => worldTransform( `translate`, value, 0 ) )
  // ui.addRange( `transY`, 0, -100, 100, value => worldTransform( `translate`, value, 1 ) )
  // ui.addRange( `transZ`, 0, -100, 100, value => worldTransform( `translate`, value, 2 ) )
  // ui.addRange( `rotateX`, 0, 0, 360, value => worldTransform( `rotate`, Math.PI * value / 180, 0 ) )
  // ui.addRange( `rotateY`, 0, 0, 360, value => worldTransform( `rotate`, Math.PI * value / 180, 1 ) )
  // ui.addRange( `rotateZ`, 0, 0, 360, value => worldTransform( `rotate`, Math.PI * value / 180, 2 ) )

  
  // ui.addRange( `fov`, 130, 0, 180, value => matrixData.fov = Math.PI * value / 180 )
  ui.addRange( `transX`, 0, -100, 100, value => drawer.matrix.translate( value, 0, 0 ) )
  ui.addRange( `transY`, 0, -100, 100, value => drawer.matrix.translate( 0, value, 0 )  )
  ui.addRange( `transZ`, 0, -100, 100, value => drawer.matrix.translate( 0, 0, value )  )
  ui.addRange( `rotateX`, 0, 0, 360, value => drawer.matrix.rotateX( Math.PI * value / 180 ) )
  ui.addRange( `rotateY`, 0, 0, 360, value => drawer.matrix.rotateY( Math.PI * value / 180 ) )
  ui.addRange( `rotateZ`, 0, 0, 360, value => drawer.matrix.rotateZ( Math.PI * value / 180 ) )
  
  let {vertices, colors, indices, normals} = model

  // drawer.vertices = vertices
  // drawer.colors = colors
  // drawer.indices = indices
  // drawer.normals = normals
  // drawer.animate()

  console.log(vertices, colors, indices, normals)
  drawer.setData( indices, vertices, colors, normals )
  drawer.start()
} )


// vertices = setGeometry()
// normals = setNormals()

// vertices = [
//   .5,  .5,  .5,
//   .5,  .5, -.5,
//  -.5,  .5, -.5,
//  -.5,  .5,  .5,

//   .5, -.5,  .5,
//   .5, -.5, -.5,
//  -.5, -.5, -.5,
//  -.5, -.5,  .5,
// ]
// colors = [0,1,0,  1,0,0,  1,0,1,  0,0,1,  1,1,0,  1,1,1,  0,0,0,  0,1,1]
// indices = [
//   0,3,4,  3,4,7,
//   1,2,6,  1,6,5,
//   0,1,4,  4,5,1,
//   2,3,6,  3,6,7
// ]
// vertices = [
//   0,   0,   -100,
//   100, 0,   -100,
//   0,   100, -100,
//   100, 100, -100
// ]
// indices = [
//    0,1,2,
//    1,2,3
// ]


// let vertices = [
//   // front wall
//   0, 0, 0,   20,0, 0,   0, 20,0,
//   20,0, 0,   0, 20,0,   20,20,0,

//   // back wall
//   0, 0, 20,  20,0, 20,  0, 20,20,
//   20,0, 20,  0, 20,20,  20,20,20,

//   // right wall
//   20,0, 20,  20,0, 0,   20,20,20,
//   20,0, 0,   20,20,20,  20,20,0,
  
//   // left wall
//   0, 0, 20,  0, 0, 0,   0, 20,20,
//   0, 0, 0,   0, 20,20,  0, 20,0,

//   // top wall
//   0, 0, 0,   20,0 ,0,   0, 0, 20,
//   20,0 ,0,   0, 0, 20,  20,0, 20,

//   // bottom wall
//   0, 20,0,   20,20,0,   0, 20,20,
//   20,20,0,   0, 20,20,  20,20,20
// ]
// let colors = [
//     /* * Colors
//      * red: 1,0,0
//      * green: 0,1,0
//      * blue: 0,0,1
//      * yellow: 1,1,0
//      * cyan: 0,1,1
//      * purple: .66, .13, .66
//      */
//     .66, .13, .66,
//     1,   1,   0,

//     1,   0,   0,
//     0,   1,   0,

//     0,   0,   0,
//     .1,  0,   1,
//   ]
// let indices = [
//   0,1,2,
//   1,2,3,
// ]
// let normals = []