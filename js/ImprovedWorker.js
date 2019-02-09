export default class ImprovedWorker {
  constructor( pathToWorker, modularized ) {
    this.cache = []

    fetch( pathToWorker )
    .then( data => data.text() )
    .then( script => /^(?<imports>(?: *import.*|\r?\n)+)(?<rest>[\s\S]*)/m.exec( script ).groups )
    // .then( scriptParts => {
    //   console.log(scriptParts.imports); return scriptParts
    // } )
    .then( scriptParts => new Blob( [`${scriptParts.imports} \n;( ${
      function( worker ) {
        worker.onmessageCallbacks = {}
        worker.onmessage = e => {
          let { eventName, eventData } = e.data
          if (typeof worker.onmessageCallbacks[eventName] === `function`)
            worker.onmessageCallbacks[eventName]( eventData )
        }
        worker.emit = ( eventName, eventData ) => {
          if( typeof eventName != `string` )
            throw new Error( `Type of "eventName" have to be a string` )
      
          worker.postMessage( { eventName,  eventData } )
      
          return worker
        }
        worker.on = ( eventName, eventFunction ) => {
          if( typeof eventName != `string` )
            throw new Error( `Type of "eventName" have to be a string` )
      
          worker.onmessageCallbacks[eventName] = eventFunction
        }
      }.toString().replace( `\${document.location.href}`, document.location.href )
    }\n)( this );\n\n\n${scriptParts.rest}`] ) )
    .then( blob => window.URL.createObjectURL( blob ))
    .then( url => {
      this.worker = new Worker( url, { type:`module` } )
      this.worker.onmessageCallbacks = {}
      this.emit( `worker start`, { mainScriptHref:document.location.href } )
      this.worker.onmessage = e => {
        let { eventName, eventData } = e.data
        if (typeof this.worker.onmessageCallbacks[eventName] === `function`)
          this.worker.onmessageCallbacks[eventName]( eventData )
      }

      for (let { type, eventName, eventData, eventFunction } of this.cache)
        if (type === `on`)
          this.on( eventName, eventFunction )

        else
          this.worker.postMessage( { eventName,  eventData } )
    } )
  }

  on( eventName, eventFunction ) {
    if (typeof eventName != `string`)
      throw new Error( `Type of "eventName" have to be a string` )
    if (this.worker)
      this.worker.onmessageCallbacks[eventName] = eventFunction
    else
      this.cache.push( { type:`on`, eventName, eventFunction } )
    return this
  }

  emit( eventName, eventData ) {
    if (typeof eventName != `string`)
      throw new Error( `Type of "eventName" have to be a string` )
    if (this.worker)
      this.worker.postMessage( { eventName,  eventData } )
    else
      this.cache.push( { type:`emit`,eventName, eventData } )
    return this
  }

  // loadScripts( ...urls ) {
  //   if (this.worker)
  //     this.worker.postMessage( {
  //       eventName: `ImprovedWorkerEvent: load scripts`,
  //       eventData: { baseUrl:document.location.href, urls }
  //     } )

  //   else
  //     this.cache.push( {
  //       type:`emit`,
  //       eventName: `ImprovedWorkerEvent: load scripts`,
  //       eventData: { baseUrl:document.location.href, urls }
  //     } )

  //   return this
  // }
}