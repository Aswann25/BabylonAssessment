import { Scene } from '@babylonjs/core';
import gameScene from './gameScene.js';

let scene = undefined;

export default async function main(engine, currentScene) {
    scene = await gameScene(engine, currentScene);
    
    engine.runRenderLoop(() => {
        scene.render();
    });
}
