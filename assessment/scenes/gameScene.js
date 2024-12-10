import "@babylonjs/loaders";
import { 
    Vector3, 
    Scene, 
    FreeCamera, 
    StandardMaterial, 
    HemisphericLight, 
    MeshBuilder, 
    Texture,
    Color3,
    ActionManager,
    ExecuteCodeAction,
    SceneLoader,
    Scalar,
    Layer
} from '@babylonjs/core';


function createGround(scene) {
    const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    ground.position.y = 0;

let timer = 5 * 60; 

function updateTimer() {
    timer--;
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('timer').innerText = `Time Left: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

    if (timer <= 0) {
        clearInterval(timerInterval);
        
        alert("Time's up! Game Over."); 
        scene.dispose();
        document.getElementById('scoreboard').innerText = 'Game Over';
    }
}

const timerInterval = setInterval(updateTimer, 1000);
document.body.insertAdjacentHTML('beforeend', `<div id="timer" style="position:absolute; top:10px; left:10px; font-size:24px; color:white;">Time Left: 5:00</div>`);



    const groundMat = new StandardMaterial("groundMat", scene);
    const diffuseTex = new Texture("./textures/groundTexDiffuse.jpg", scene);
    const normalTex = new Texture("./textures/groundTexNormal.jpg", scene);
    groundMat.diffuseTexture = diffuseTex;
    groundMat.normalTexture = normalTex;

    diffuseTex.uScale = 10;
    diffuseTex.vScale = 10;
    normalTex.uScale = 10;
    normalTex.vScale = 10;

    groundMat.specularColor = new Color3(0, 0, 0);
    ground.material = groundMat;

    return ground;
}

export default async function gameScene(engine, currentScene) {    
    const scene = new Scene(engine); 

    const backgroundLayer = new Layer("backgroundLayer", "./models/bground.jpg", scene, true);
    backgroundLayer.isBackground = true; 

    let score = 0;
    document.body.insertAdjacentHTML('beforeend', `<div id="scoreboard" style="position:absolute; top:50px; left:10px; font-size:24px; color:white;">Score: 0</div>`);

    
    const cam = new FreeCamera("camera1", new Vector3(45, 13, 0), scene); 
    cam.setTarget(new Vector3(0, 0, 0));

    
    const light = new HemisphericLight("light1", new Vector3(0, 10, 0), scene);

    const ground = createGround(scene);
    const groundSize = 50; 
    createInvisibleWalls(scene, groundSize);

    scene.collisionsEnabled = true;

    function createInvisibleWalls(scene, groundSize) {
        const wallThickness = 1;
        const wallHeight = 10;
    
        
        const leftWall = MeshBuilder.CreateBox("leftWall", { width: wallThickness, height: wallHeight, depth: groundSize }, scene);
        leftWall.position.set(-groundSize / 2, wallHeight / 2, 0);
        leftWall.isVisible = false; 
        leftWall.checkCollisions = true;
    
        
        const rightWall = MeshBuilder.CreateBox("rightWall", { width: wallThickness, height: wallHeight, depth: groundSize }, scene);
        rightWall.position.set(groundSize / 2, wallHeight / 2, 0);
        rightWall.isVisible = false; 
        rightWall.checkCollisions = true;
    
        
        const topWall = MeshBuilder.CreateBox("topWall", { width: groundSize, height: wallHeight, depth: wallThickness }, scene);
        topWall.position.set(0, wallHeight / 2, -groundSize / 2);
        topWall.isVisible = false; 
        topWall.checkCollisions = true;
    
        
        const bottomWall = MeshBuilder.CreateBox("bottomWall", { width: groundSize, height: wallHeight, depth: wallThickness }, scene);
        bottomWall.position.set(0, wallHeight / 2, groundSize / 2);
        bottomWall.isVisible = false; 
        bottomWall.checkCollisions = true;
    
        return [leftWall, rightWall, topWall, bottomWall];
    }

    
    const treeMain = await SceneLoader.ImportMeshAsync("", "./models/", "tree.glb", scene);
    const tree = treeMain.meshes[1];
    tree.parent = null;
    treeMain.meshes[0].dispose();
    tree.scaling = new Vector3(0.5, 0.5, 0.5);

    const tree2Main = await SceneLoader.ImportMeshAsync("", "./models/", "Christmas_Tree_Mimic.glb", scene);
    const tree2 = tree2Main.meshes[1];
    tree2.parent = null;
    tree2Main.meshes[0].dispose();
    tree2.scaling = new Vector3(0.05, 0.05, 0.05); 

    const tree3Main = await SceneLoader.ImportMeshAsync("", "./models/", "lowpoly tree.glb", scene);
    const tree3 = tree3Main.meshes[1];
    tree3.parent = null;
    tree3Main.meshes[0].dispose();
    tree3.scaling = new Vector3(0.5, 0.5, 0.5);

    const treeLength = 30;
    const radius = 25;
    const groundYPosition = ground.position.y; 

    const trees = [tree, tree2, tree3];
    trees.forEach((tree, index) => {
        const treeBaseOffset = Math.abs(tree.getBoundingInfo().boundingBox.minimum.y) * tree.scaling.y;
        for (let i = 0; i < treeLength; i++) {
            const randomX = Scalar.RandomRange(-radius, radius);
            const randomZ = Scalar.RandomRange(-radius, radius);
            const treeClone = tree.clone(`tree_${index}_${i}`);
            treeClone.position = new Vector3(randomX, groundYPosition + treeBaseOffset, randomZ);
        }
    });

    
    const model = await SceneLoader.ImportMeshAsync("", "./models/", "Character.glb", scene);
    const anims = model.animationGroups;
    const rootMesh = model.meshes[0];
    const characterBox = MeshBuilder.CreateBox("characterBox", { size: 1, height: 2 }, scene);
    rootMesh.parent = characterBox;
    characterBox.visibility = 0; 
    rootMesh.position.y = -1;
    characterBox.position.y += 1;
    characterBox.checkCollisions = true;

    let characterSpeed = 4;
    let movementDirection = new Vector3(0, 0, 0);
    let keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

    window.addEventListener("keydown", (event) => keys[event.key] = true);
    window.addEventListener("keyup", (event) => keys[event.key] = false);

    scene.registerAfterRender(() => {
        const deltaTime = engine.getDeltaTime() / 1000; 
        updateCharacterMovement(deltaTime);
        updateFoxesMovement(deltaTime);
    });

    function updateCharacterMovement(deltaTime) {
        movementDirection.set(0, 0, 0);
        if (keys.w || keys.ArrowUp) movementDirection.x = -1;
        if (keys.s || keys.ArrowDown) movementDirection.x = 1;
        if (keys.a || keys.ArrowLeft) movementDirection.z = -1;
        if (keys.d || keys.ArrowRight) movementDirection.z = 1;

        if (!movementDirection.equals(Vector3.Zero())) {
            movementDirection.normalize();
            characterBox.moveWithCollisions(movementDirection.scale(characterSpeed * deltaTime));
            characterBox.lookAt(characterBox.position.add(movementDirection));
        }
    }

    let foxes = [];
    const foxSpeed = 1.5; 

    async function spawnFoxes() {
        for (let i = 0; i < 2; i++) {
            const foxData = await SceneLoader.ImportMeshAsync("", "./models/", "Fox.glb", scene);
            const fox = foxData.meshes[0];
            fox.scaling = new Vector3(0.2, 0.2, 0.2);
            fox.position = new Vector3(
                Scalar.RandomRange(-radius, radius), 
                ground.position.y, 
                Scalar.RandomRange(-radius, radius)
            );
            
            foxes.push({
                mesh: fox,
                direction: new Vector3(
                    Scalar.RandomRange(-1, 1),
                    0,
                    Scalar.RandomRange(-1, 1)
                ).normalize(),
                changeDirectionTime: Math.random() * 3 + 2 
            });
    
        fox.actionManager = new ActionManager(scene);
        fox.actionManager.registerAction(new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: characterBox
            },
            () => {
                fox.dispose(); 
                score++; 
                document.getElementById('scoreboard').innerText = `Score: ${score}`; 
            }
        ));
        }
    }

    setInterval(() => {
        spawnFoxes();
    }, 10000); 

    function updateFoxesMovement(deltaTime) {
        foxes.forEach(foxData => {
            foxData.changeDirectionTime -= deltaTime;
            
            
            if (foxData.changeDirectionTime <= 0) {
                foxData.direction = new Vector3(
                    Scalar.RandomRange(-1, 1),
                    0,
                    Scalar.RandomRange(-1, 1)
                ).normalize();
                foxData.changeDirectionTime = Math.random() * 3 + 2; 
            }

            const fox = foxData.mesh;
            fox.moveWithCollisions(foxData.direction.scale(foxSpeed * deltaTime));
            fox.lookAt(fox.position.add(foxData.direction));
        });
    }

    characterBox.actionManager = new ActionManager(scene);
    scene.meshes.forEach(mesh => {
        if (mesh.name.includes("tree")) {
            characterBox.actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: mesh
                },
                () => handleCollision(mesh)
            ));
        }
    });

    function handleCollision(objectHit) {
        const knockbackDirection = characterBox.position.subtract(objectHit.position).normalize();
        knockbackDirection.y = 0;
        characterBox.moveWithCollisions(knockbackDirection);
    }

    await scene.whenReadyAsync();
    if (currentScene) currentScene.dispose();
    return scene;
}
