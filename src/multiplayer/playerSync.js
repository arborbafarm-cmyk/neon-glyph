import { db } from "./firebaseClient";
import { ref, set } from "firebase/database";

export function syncPlayer(player) {
  set(ref(db, "players/" + player.id), player);
}
