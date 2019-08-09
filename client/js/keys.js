export class KeyInfo {
  constructor( keyCode, interval=0, onlyPressing=false ) {
    this.keyCode = keyCode
    this.interval = interval
    this.onlyPressing = onlyPressing

    this.active = true
    this.pressed = false
  }

  /** Get pressed state, and set interval when it's true
   */
  get triggered() {
    if ( !this.canBeUsed ) return false
    if ( this.interval ) {
      this.active = false
      setTimeout( () => this.active = true, this.interval * 1000 )
    }

    return true
  }
  get canBeUsed() {
    return this.pressed && this.active
  }
}
export default class Keys {
  constructor() {
    /** @type {KeyInfo[]} */
    this.storage = []

    for ( let i = 0; i < 256; i++ ) this.storage[ i ] = new KeyInfo( i )
  }

  /**
   *
   * @param {KeyInfo[]} storage
   * @param {...number|string} codesOrNames
   * @return {KeyInfo}
   */
  get( ...codesOrNames ) {
    let info = null

    if ( codesOrNames.length == 1 ) info = this.storage[ Keys.translateCode( codesOrNames[ 0 ] ) ]
    else for ( const code of codesOrNames ) {
      info = this.storage[ Keys.translateCode( code ) ]

      if ( info && info.canBeUsed ) return info
    }

    return info || {}
  }

  /**
   * @param {number|string} code
   */
  static translateCode( code ) {
    return !isNaN( code ) ? code : (() => { switch ( code ) {
      case `left`: return 37
      case `up`: return 38
      case `right`: return 39
      case `down`: return 40

      case `a`: return 65
      case `d`: return 68
      case `s`: return 83
      case `w`: return 87

      case `shift`: return 16
      case `ctrl`: return 17
      case `space`: return 32

      default: return null
    } })()
  }
}