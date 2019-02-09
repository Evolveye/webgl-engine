class Entity {
  constructor( name, models, functionality ) {
  }
}

let _variable_ = /(?:(?<count>\d+)0)?(?<type>\d+)0(?<name>\d+)0(?<variant>\d+)/
let c = dictionary.consts = {
  SOLID_BLOCK: 1
}

dictionary.blocks = new Map( [
  [`yellow`, new Entity( `yellow`, [{ hitbox:c.SOLID_BLOCK, src:`` }] )]
] )
