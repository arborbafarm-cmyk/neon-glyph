import { useState, useRef } from "react";

export default function GameMapScreen(){

const mapRef = useRef(null)

const [zoom,setZoom] = useState(1)
const [touchDistance,setTouchDistance] = useState(null)

const MIN_ZOOM = 0.7
const MAX_ZOOM = 2.2

function zoomIn(){
setZoom((z)=>Math.min(z+0.15,MAX_ZOOM))
}

function zoomOut(){
setZoom((z)=>Math.max(z-0.15,MIN_ZOOM))
}

function handleWheel(e){

e.preventDefault()

let newZoom = zoom - e.deltaY * 0.001

if(newZoom < MIN_ZOOM) newZoom = MIN_ZOOM
if(newZoom > MAX_ZOOM) newZoom = MAX_ZOOM

setZoom(newZoom)

}

function getDistance(t1,t2){

const dx = t1.clientX - t2.clientX
const dy = t1.clientY - t2.clientY

return Math.sqrt(dx*dx + dy*dy)

}

function handleTouchMove(e){

if(e.touches.length !== 2) return

const distance = getDistance(e.touches[0],e.touches[1])

if(!touchDistance){
setTouchDistance(distance)
return
}

const diff = distance - touchDistance

let newZoom = zoom + diff * 0.002

if(newZoom < MIN_ZOOM) newZoom = MIN_ZOOM
if(newZoom > MAX_ZOOM) newZoom = MAX_ZOOM

setZoom(newZoom)
setTouchDistance(distance)

}

function handleTouchEnd(){
setTouchDistance(null)
}

return(

<div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">

{/* CONTAINER 9:16 */}

<div
className="relative"
style={{
width:"100%",
maxWidth:"420px",
aspectRatio:"9/16",
background:"#000",
overflow:"hidden"
}}
>

{/* MAPA */}

<div
ref={mapRef}
onWheel={handleWheel}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
style={{
width:"100%",
height:"100%",
transform:`scale(${zoom})`,
transformOrigin:"center center",
transition:"transform 0.05s linear"
}}
>

<img
src="/mapa-cidade.png"
style={{
width:"100%",
height:"100%",
objectFit:"cover",
pointerEvents:"none"
}}
/>

</div>

{/* BOTÕES ZOOM */}

<div
style={{
position:"absolute",
right:10,
bottom:20,
display:"flex",
flexDirection:"column",
gap:10
}}
>

<button
onClick={zoomIn}
style={{
width:45,
height:45,
fontSize:22,
background:"#111",
color:"white",
border:"1px solid #444",
borderRadius:8
}}
>
+
</button>

<button
onClick={zoomOut}
style={{
width:45,
height:45,
fontSize:22,
background:"#111",
color:"white",
border:"1px solid #444",
borderRadius:8
}}
>
−
</button>

</div>

</div>

</div>

)

}
