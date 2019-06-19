class Color {
  /**
   * @param {"#123456"|Color} color
   */
  constructor( color=null ) {
    /** @type {Number} */
    this.r = Math.floor( Math.random() * 256 )

    /** @type {Number} */
    this.g = Math.floor( Math.random() * 256 )

    /** @type {Number} */
    this.b = Math.floor( Math.random() * 256 )

    if ( color instanceof Color) {
      this.r = color.r
      this.g = color.g
      this.b = color.b
    }
    else if ( /^\w+$/.test( color ) ) {
      // Maybe later
    }
    // else if ( /^#[0-9a-f]{3}(?:[0-9a-f](?:[0-9a-f]{2}(?:[0-9a-f]{2})?)?)?$/.test( color ) ) {
    else if ( /^#[0-9a-f]{6}$/.test( color ) ) {
      this.r = parseInt( color.slice( 1, 3 ), 16 )
      this.g = parseInt( color.slice( 3, 5 ), 16 )
      this.b = parseInt( color.slice( 5 ), 16 )
    }
    else if ( /^rgb\( * [0-9]{1,3}(?: *, *[0-9]{1,3}){2}\)|^rgba\( * [0-9]{1,3}(?: *, *[0-9]{1,3}){3}\)$/.test( color ) ) {
      // Maybe later
    }

  }

  equal( a, b ) {
    return `${a}` == `${b}`
  }

  [Symbol.toPrimitive]( hint ) {
    switch ( hint ) {
      case `string`: return `${this.r.toString( 16 )}${this.g.toString( 16 )}${this.b.toString( 16 )}`
    }
  }
}

class Logger {
  /**
   * @param {{ align:"left"|"center"|"right", color:String, length?:Number }[]} parts Color is a console color name
   */
  constructor( parts ) {
    let pattern = ``

    for ( const { color=`fgRed` } of parts )
      pattern += ``
        + (Logger.colors[ color ] || ``)
        + `%s`
        + Logger.colors[ `reset` ]

    return (...items) => {
      for ( let i = 0;  i < items.length;  i++ ) {
        const part = parts[ i ]

        if ( !part )
          break

        const { align=`left`, length=10 } = part
        let len = length - items[ i ].length

        if ( len < 0 )
          len = 0

        switch ( align ) {
          case `left`:
            items[ i ] += ` `.repeat( len )
            break

          case `right`:
            items[ i ] = `${` `.repeat( len )}${items[ i ]}`
            break

          case `center`:
            for ( let j = len;  j;  j-- )
              if ( j % 2 )
                items[ i ] += ` `
              else
                items[ i ] = ` ${items[ i ]}`
            break
        }
      }

      console.log( pattern, ...items )
    }
  }
}

Logger.colors = {
  reset: `\x1b[0m`,
  bright: `\x1b[1m`,
  dim: `\x1b[2m`,
  underscore: `\x1b[4m`,
  blink: `\x1b[5m`,
  reverse: `\x1b[7m`,
  hidden: `\x1b[8m`,

  fgBlack: `\x1b[30m`,
  fgRed: `\x1b[31m`,
  fgGreen: `\x1b[32m`,
  fgYellow: `\x1b[33m`,
  fgBlue: `\x1b[34m`,
  fgMagenta: `\x1b[35m`,
  fgCyan: `\x1b[36m`,
  fgWhite: `\x1b[37m`,

  bgBlack: `\x1b[40m`,
  bgRed: `\x1b[41m`,
  bgGreen: `\x1b[42m`,
  bgYellow: `\x1b[43m`,
  bgBlue: `\x1b[44m`,
  bgMagenta: `\x1b[45m`,
  bgCyan: `\x1b[46m`,
  bgWhite: `\x1b[47m`
}


module.exports = {
  Logger
}