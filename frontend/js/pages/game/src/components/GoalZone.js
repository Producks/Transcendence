import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { Layers } from '../systems/Layers.js';
import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { World } from '../World.js';
import { ParticleSystem } from './ParticleSystem.js';

const bg = new BoxGeometry( 0.8, 0.8, 0.8 );
const blue = new MeshStandardMaterial({ color: 'magenta' });
const parameters = {
	duration: 0.6,
	position: new Vector3( 0, 0, 0 ),
	positionRandomRange: new Vector3( 0.2, 0.2, 0.2 ),
	direction: new Vector3( 0, 0, 0 ),
	directionRandomRange: new Vector3( 0, 0, 0 ),
	speed: 20,
	speedOverTime: 0,
	eulerRotation: new Vector3( 0, 0, 0 ),
	eulerRotationRandomRange: new Vector3( Math.PI, Math.PI, Math.PI ),
	scale: new Vector3( 1, 1, 1 ),
	scaleRandomRange: new Vector3( 2, 2, 2 ),
	scaleOverTime: new Vector3( 0, 0, 0 )
}

class GoalZone extends Mesh {
	constructor( geometry, material, paddle ) {
		super( geometry, material );

		this.collider = new Collider( this );
		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Goal );

		this.paddle = paddle;
	}

	onCollision( hit ) {		
		try {
			const msg = {
				ballInst: hit,
				scored: true,
				goalScoredId: this.position.x < 0 ? 2 : 1
			};

			World._instance.socket.send( JSON.stringify( msg ) );
			this.goal( hit );
		} catch (error) {
			console.error('Error when goal:', error);
		}
	}

	goal( hit ) {
		parameters.position.copy( hit.pos );
		this.particles = new ParticleSystem( bg, blue, 100, parameters );

		World._instance.score.increment( this.position.x < 0 ? 2 : 1 );
		World._instance.balls.initInst( World._instance.balls.ballInst[ hit.id ] );
	}

	delete() {
		this.collider.delete();
		this.renderer.delete();
	}
}

export { GoalZone };
