import * as BABYLON from '@babylonjs/core'

export default async function gameScene(BABYLON, engine, currentScene){    
    const {Vector3, Scene, FreeCamera, StandardMaterial, HemisphericLight, MeshBuilder} = BABYLON
   
    const scene = new BABYLON.Scene(engine); 

    const cam = new FreeCamera("asd", new Vector3(0, 0, -5), scene)
    
    const light = new HemisphericLight("lisada", new Vector3(0, 10, 0), scene)

    const box = MeshBuilder.CreateBox("asdwa", {}, scene)

    const ground = MeshBuilder.CreateGround("ground", {width: 50, height: 50}, scene)

    const camerContainer = MeshBuilder.CreateGround("ground", {width: .5, height: .5}, scene)
    camerContainerm.position = new Vector3(0.15,0)
    cam.parent = camerContainer
    cam.setTarget(new Vector3(0,-1,0))

    let camVertical = 0
    let camHorazontal = 0
    window.addEventListener("keydown", e =>{
        const theKey = e.key.toLowerCase()
        
        if(theKey  === "arrowup") camVertical = 1 
            if(theKey  === "arrowdown") camVertical = -1
                if(theKey  === "arrowleft") camHorazontal = -1
                    if(theKey  === "arrowright") camHorazontal = 1
            
        camerContainer.locallyTranslate(new Vector3(camHorazontal ,0, camVertical ))
    })

    window.addEventListener("keyup", e =>{
        const theKey = e.key.toLowerCase()
        
        if(theKey  === "arrowup") camVertical = 0
            if(theKey  === "arrowdown") camVertical = 0
                if(theKey  === "arrowleft") camHorazontal = 0
                    if(theKey  === "arrowright") camHorazontal = 0
            
    })

    await scene.whenReadyAsync()
    currentScene.dispose()
    return scene 
}