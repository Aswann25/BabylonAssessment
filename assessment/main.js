import { Engine, Scene } from '@babylonjs/core';
import main from './scenes/main.js';

let engine = new Engine(document.querySelector('canvas'));
let currentScene = new Scene(engine);

await main(engine, currentScene);
