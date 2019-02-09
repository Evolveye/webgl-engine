export default class Ui {
  constructor( setup ) {
    this.box = document.createElement( `div` )

    if (`style` in setup)
      this.box.style = setup.style
      
    this.box.style.position = `fixed`
    this.box.style.backgroundColor = `white`

    document.body.appendChild( this.box )
  }

  addRange( name, value=0, min=0, max=100, update=null ) {
    let field = document.createElement( `label` )
    let spanName = document.createElement( `span` )
    let spanVal = document.createElement( `span` )
    let input = document.createElement( `input` )
    
    let oninput = () => {
      spanVal.textContent = input.value
      update( +input.value )
    } 

    input.type = `range`
    input.min = min
    input.max = max
    input.value = value
    input.addEventListener( `input`, oninput )

    spanVal.style.minWidth = `30px`
    spanVal.style.float = `left`

    spanName.textContent = name
    spanName.style.float = `left`

    field.appendChild( spanName )
    field.appendChild( spanVal )
    field.appendChild( input )
    field.style.display = `block`

    oninput( value )

    this.box.appendChild( field )
  }
}