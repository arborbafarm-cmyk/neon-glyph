import { db } from "../multiplayer/firebaseClient";
import { ref, set } from "firebase/database";

export function saveHouse(playerId, tiles){
  set(ref(db,"houses/"+playerId),{
    owner: playerId,
    tiles: tiles
  });
}
