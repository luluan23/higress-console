import Emitter from 'tiny-emitter'
let bus = null
export function getBus(){
  if(bus === null){
    bus = new Emitter()
  }
  return bus;

}