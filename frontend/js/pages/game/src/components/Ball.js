import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import {
	InstancedMesh,
	Matrix4,
	Quaternion,
	Raycaster,
	Vector3
} from 'three';

class Ball extends InstancedMesh {
	constructor( geometry, material, count ) {
		super( geometry, material, count );

		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Default, Layers.Ball );
		this.updatable = new Updatable( this );

		this.radius = this.geometry.parameters.radius;

		this.ballInst = [];
		for (let i = 0; i < this.count; i++) {
			this.ballInst[i] = { id: i, pos: new Vector3(), dir: new Vector3(), speed: 0, colliding: undefined };
			this.reset( this.ballInst[i] );
		}
		
		
		this.ray = new Raycaster();
		this.ray.layers.enable( Layers.Goal );
		this.ray.layers.enable( Layers.Solid );

		this.matrix = new Matrix4();
	}

	calcCollision( ballInst, dist, maxRecursion ) {
		// Generate Rays
		let closerHit = undefined;
		let offset = undefined;
		for (let i = 0; i < 8; i++) {
			const origin = new Vector3( Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0 );
			origin.add( ballInst.pos );
			this.ray.set( origin, ballInst.dir );
			this.ray.far = dist;
			const hits = this.ray.intersectObjects( Collider.getSolids() );
			if ( hits.length > 0 ) {
				if (closerHit == undefined || hits[0].distance < closerHit.distance ) {
					closerHit = hits[0];
					offset = new Vector3( Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0 );
					continue;
				}
			}
		}

		// Process collision on closerHit
		if ( closerHit != undefined && ballInst.colliding != closerHit.object ) {
			ballInst.colliding = closerHit.object;
			if ( closerHit.object.layers.isEnabled( Layers.Goal ) ) {
				if ( typeof closerHit.object.onCollision === "function" )
				closerHit.object.onCollision( ballInst );
				this.reset( ballInst );
				return;
			}
			closerHit.normal.setZ( 0 );
			
			ballInst.dir.reflect( closerHit.normal );
			if ( closerHit.object.layers.isEnabled( Layers.Player ) ) {
				if ( ballInst.dir.dot( closerHit.object.dir ) < 0 ) {
					ballInst.speed *= 1.2;
					ballInst.dir.y += closerHit.point.y - closerHit.object.position.y;
				}
			}
			ballInst.dir.normalize();
			ballInst.pos.copy( closerHit.point.clone().sub(offset) );

			if ( typeof closerHit.object.onCollision === "function" )
				closerHit.object.onCollision( ballInst );

			return this.calcCollision( ballInst, dist - closerHit.distance, maxRecursion - 1 );
		}

		//No Collision
		ballInst.colliding = undefined;
		ballInst.pos.add( ballInst.dir.clone().multiplyScalar( dist ) );
	}

	update( dt ) {
		for (let i = 0; i < this.count; i++) {
			this.calcCollision( this.ballInst[i], this.ballInst[i].speed * dt, 5 );
			// Rotate toward movement
			let rot = new Quaternion().setFromUnitVectors( new Vector3( 1, 0, 0 ), this.ballInst[i].dir );
			this.matrix.compose(
				this.ballInst[i].pos,
				rot,
				new Vector3( 1 + this.ballInst[i].speed * dt, 1, 1 )
			);
			this.setMatrixAt( i, this.matrix );
			this.instanceMatrix.needsUpdate = true;
	
			// Reset if OOB
			if ( Math.abs( this.ballInst[i].pos.x ) > 8 || Math.abs( this.ballInst[i].pos.y ) > 5 ) {
				console.error( "OOB" );
				this.reset( i );
			}
		}
	}

	reset( ballInst ) {
		// ballInst.pos.set(MathUtils.randFloat( -2, 2 ), MathUtils.randFloat( -1, 1 ), 0);
		ballInst.pos.set( 0, 0, 0 );
		// ballInst.dir.set(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
		ballInst.dir.set( 1, 1, 0 );
		ballInst.dir.normalize();
		ballInst.speed = 5;
		ballInst.colliding = undefined;
	}

	overwriteInst( inst ) {
		this.ballInst[inst.id].pos.copy( inst.pos );
		this.ballInst[inst.id].dir.copy( inst.dir );
		this.ballInst[inst.id].speed = inst.speed;
	}

	delete() {
		this.renderer.delete();
		this.updatable.delete();
	}

}

export { Ball };
