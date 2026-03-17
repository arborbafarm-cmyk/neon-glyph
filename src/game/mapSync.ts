import { syncPlayers } from "./playerSync";

export function startMapSync(){
  setInterval(()=>{
    syncPlayers();
  },3000);
}
