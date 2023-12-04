import { createRenderer } from './systems/renderer.js';
import { MainCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { InputManager } from './systems/InputManager.js';

import { Terrain } from './components/Terrain.js';
import { Ball } from './components/Ball.js';
import { Player } from './components/Player.js';
import { Opponent } from './components/Opponent.js';
import { Score3D } from './components/3DScore.js';
import { airHockeyTable } from './systems/Loader.js';

import {
	CapsuleGeometry,
	Color,
	DodecahedronGeometry,
	InstancedMesh,
	MathUtils,
	Matrix4,
	MeshStandardMaterial,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';

let scene;
let camera;
let renderer;
let loop;
let score;
let resizer;
let input;

class World {
	constructor( container ) {
		if (World._instance) {
			World._instance.deleteGame();
			World._instance.createContainer( container );
			World._instance.createGame();
			return World._instance;
		}
		this.createInstance();

		this.createContainer( container );
		this.createGame();

		this.render = function() { renderer.render(scene, camera); }
		this.start = function() { loop.start();	}
		this.stop = function() { loop.stop(); }

		/// DEBUG TEMP
		document.addEventListener('keydown', (event) => {
			if ( event.code == "KeyR" ) {
				console.warn("-- DELETION! --");
				World._instance.deleteGame();
			}
			if ( event.code == "KeyE" ) {
				console.warn("-- RESUME! --");
				World._instance.deleteGame();
				World._instance.createGame();
			}
			if ( event.code == "KeyA" && this.players.length == 0 )
				this.createSocket( '/ws/pong/UserA', -7.2 );
			if ( event.code == "KeyB" && this.players.length == 0 )
				this.createSocket( '/ws/pong/UserB', 7.2 );
		}, false);
	}

	createSocket( path, xpos ) {
		console.log("-- Socket Created! --");

		this.socket = new WebSocket('wss://' + window.location.host + path);

		this.players.push( new Player( this.g_caps, new MeshStandardMaterial(), new Vector3(  xpos, 0, 0 ), this.socket ) );

		this.socket.addEventListener("message", (event) => {
			if ( event.data === "Joined" && this.players.length < 2 ) {
				this.balls.updatable.setEnabled(true);
				this.players.push( new Opponent( this.g_caps, new MeshStandardMaterial(), new Vector3( -xpos, 0, 0 ), this.socket ) );
				this.socket.send("Joined");
			}
		});
	}

	createInstance() {
		World._instance = this;

		camera = new MainCamera();
		scene = createScene();
		renderer = createRenderer();
		loop = new Loop(camera, scene, renderer);
		score = new Score3D();
		input = new InputManager();


		const { ambientLight, mainLight } = createLights();

		scene.add( ambientLight, mainLight );
	}
	
	createContainer( container ) {
		container.append( renderer.domElement );
		resizer = new Resizer(container, camera, renderer);
	}
	
	createGame() {
		scene.add( airHockeyTable.scene );
		airHockeyTable.scene.scale.set( 0.07, 0.07, 0.07 );
		airHockeyTable.scene.rotation.set( Math.PI / 2, 0, 0 );
		airHockeyTable.scene.position.set( 3, 26, -5.5 );

		this.terrain = new Terrain( new Vector2(18, 11), 0.5, 0.4 );

		this.g_caps = new CapsuleGeometry( 0.2, 2.4 );
		this.g_sphere = new SphereGeometry( 0.2 );
		this.m_white = new MeshStandardMaterial({ color: 'white' });

		this.players = [];

		this.balls = new Ball( this.g_sphere, this.m_white, 1 );
		this.balls.updatable.setEnabled(false);

		// this.particles = new InstancedMesh( new DodecahedronGeometry( 0.2, 0 ), this.m_white, 10000 );
		// const matrix = new Matrix4();
		// for (let i = 0; i < 10000; i++) {
		// 	matrix.setPosition( MathUtils.randFloat( -16, 16 ), MathUtils.randFloat( -10, 10 ), MathUtils.randFloat( -10, 0 ) );
		// 	this.particles.setMatrixAt( i, matrix );
		// }
		// World.add( this.particles );
		
		// const { ambientLight, mainLight } = createLights();

		// scene.add( ambientLight, mainLight );
		camera.viewLarge( 0 );
		camera.viewTable( 1 );
		loop.start();
	}

	deleteGame() {
		scene.remove( airHockeyTable.scene );
		this.balls.delete();
		for (let i = 0; i < this.players.length; i++)
			this.players[i].delete();
		score.reset();
		this.terrain.delete();
		renderer.renderLists.dispose();
		resizer.delete();
		camera.viewLarge( 0 );
		loop.stop();

		if ( this.socket != undefined)
			this.socket.close();
	}

	static add( mesh ) {
		scene.add( mesh )
	}

	static remove( mesh ) {
		scene.remove( mesh );
	}

	static scoreAdd( playerId ) {
		score.add( playerId );
	}
}

export { World };
