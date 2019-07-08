const http = require( `http` )
const fs = require( `fs` )
const { Logger } = require( `./controller-console` )

const mimeTypes = {
  html: `text/html`,
  css: `text/css`,
  js: `text/javascript`,
  mjs: `application/javascript`,
  json: `application/json`,
  woff: `application/font-woff`,
  ttf: `application/font-ttf`,
  eot: `application/vnd.ms-fontobject`,
  otf: `application/font-otf`,
  svg: `application/image/svg+xml`,
  ico: `image/x-icon`,
  png: `image/png`,
  jpg: `image/jpg`,
  gif: `image/gif`,
  wav: `audio/wav`,
  mp4: `video/mp4`
}


class Server {
  /** Constructor
   * @param {String} clientFolder Folder with files which may be send to the client
   * @param {Number} port Server port
   * @param {Function} initialFunction Function which will be executed after server start
   */
  constructor( clientFolder=`./`, port=80, initialFunction=Server.initialFunction ) {
    this.clientFolder = clientFolder.slice( -1 ) == `/`  ?  clientFolder.slice( 0, -1 )  :  clientFolder
    this.route = {
      GET: new Map(),
      POST: new Map()
    }

    this.log = new Logger( [
      { color:`fgBlue`, align:`right`, length:6 },
      { color:`bright`, length:2 },
      { color:`fgGreen` },
      { color:`fgWhite`, length:30 },
      { color:`fgBlue`, align:`center` },
      { color:`fgGreen` },
      { color:`fgWhite` }
    ] )

    this.instance = http
      .createServer( (req, res) => {
        const partedUrl = req.url.split( `?` )
        const address = partedUrl[ 0 ]
        const path = this.buildPath( req, address )
        const mimeType = mimeTypes[ path.split( /.*\./ )[ 1 ] ] || `text/plain`

        this.log( req.method, `:: `, `URL addr: `, address, `->`, `Real path: `, path || `STATE 404` )

        if ( !path )
          return this.page404( res )

        res.writeHead( 200, { "Content-Type":mimeType } )
        res.end( fs.readFileSync( path ) )
      } )
      .listen( port, () => initialFunction( port ) )
  }

  /** Static route setter
   * @param {String} method HTTP request method
   * @param {String} url Route address
   * @param {String} path Path to the file
   */
  setRoute( method, url, path ) {
    this.route[ method.toUpperCase() ].set( url, path.replace( `$client`, this.clientFolder ) )

    return this
  }

  /** Build real path to file which is wanted by client
   * @param {http.IncomingMessage} request HTTP request
   * @param {String} address Website address
   */
  buildPath( request, address ) {
    const staticRoute = this.route[ request.method ].get( address )

    if ( staticRoute )
      return staticRoute

    let path = this.clientFolder

    if ( [ ``, `/` ].includes( address ) && fs.existsSync( `${path}/index.html` ))
      path += `/index.html`
    else {
      path += address

      // console.log( address, request.headers.referer )

      if ( !/^.*\.\w+$/.test( address ) && !fs.existsSync( path ) )
        switch ( request.headers.referer.match( /^.*\.(\w+)$/ )[ 1 ] ) {
          case `js`:
          case `mjs`:
            path += `.${fs.existsSync( `${path}.js` )  ?  ``  :  `m`}js`
            break
        }
    }

    return fs.existsSync( path )  ?  path  :  ``
  }

  /** Send 404 page
   * @param {http.ServerResponse} res HTTP response
   */
  page404( res ) {
    res.writeHead( 404 )
    res.end()
  }

  /** Set static route for GET HTTP method
   * @param {String} url Route address
   * @param {String} path Path to the file
   */
  get( url, path ) {
    return this.setRoute( `GET`, url, path )
  }

  /** Set static route for POST HTTP method
   * @param {String} url Route address
   * @param {String} path Path to the file
   */
  post( url, path ) {
    return this.setRoute( `POST`, url, path )
  }
}

Server.initialFunction = port => console.log( `Server has been started at port ${port}` )

class WsServer {
  constructor() {
    this.defaultScope = defaultScope
    this.scopes = new Map

    this.wsFunctions = {
      onconnection: null,
      onmessage: null,
      onclose: null
    }

    this.ws = new WebSocket.Server( { server:this.http } )
      .on( `connection`, socket => {
        socket.scope = this.defaultScope
        socket.rooms = []

        let { onconnection, onmessage, onclose } = this.wsFunctions

        if ( typeof onconnection === `function` )
          onconnection( socket )

        socket.onmessage = e => {
          if ( !socket.scope || socket.readyState !== 1 )
            return

          const { event, data } = JSON.parse(e.data)

          if ( typeof onmessage === `function` )
            onmessage( socket, event, data )

          switch ( event ) {
            case `$(change scope)`:
              if ( this.scopes.has( data ) )
                socket.scope = data
              break

            case `$(set room)`:
              socket.rooms = [ data ]
              break

            case `$(join to the room)`:
              if ( !socket.rooms.includes( data ) )
                socket.rooms.push( data )
              break

            case `$(leave the room)`:
              if ( socket.rooms.includes( data ) )
                socket.rooms.splice( socket.rooms.indexOf( data ), 1 )
              break

            default:
              if ( this.scopes.has( socket.scope ) )
                this.scopes.get( socket.scope )( socket, event, data )
          }
        }

        socket.onclose = () => {
          if ( typeof onclose === `function` )
            onclose( socket )
        }
      } )
  }

  /** Web socket events setter
   * @param {String} event Event name
   * @param {Function} func Function to execute
   */
  setWebSocketEvent( event, func ) {
    this.wsFunctions[ `on${event}` ] = func

    return this
  }

  /** Web socket `onconnection` event function setter
   * @param {Function} func Function to execute
   */
  onconnection( func ) {
    return this.setWebSocketEvent( `connection`, func )
  }

  /** Web socket `onmessage` event function setter
   * @param {Function} func Function to execute
   */
  onmessage( func ) {
    return this.setWebSocketEvent( `message`, func )
  }

  /** Web socket `onclose` event function setter
   * @param {Function} func Function to execute
   */
  onclose( func ) {
    return this.setWebSocketEvent( `close`, func )
  }

  setScope( roomName, func ) {
    this.scopes.set( roomName, func )
  }

  /** Send message to everybody
   * @param {String} event Event name
   * @param data Event data
   * @param {String} [room] Room inside which message need to be broadcasted
   */
  broadcast( event, data, room=`` ) {
    this.ws.clients.forEach( socket => {
      if ( (!room || socket.rooms.includes( room )) && socket.readyState === 1 )
        socket.send( JSON.stringify( { event, data } ) )
    } )
  }

  /** Get server clients */
  get clients() {
    return this.ws.clients
  }
}


module.exports = {
  Server
}