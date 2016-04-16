/**
* Item class
* 
*/

define([
	"three",
	"../libs/state-machine.min",
	"debugGUI",
	"physics",
	"scene",
	"listener"
], function ( THREE, StateMachine, debugGUI, physics, scene, listener ) {

	'use strict';

	// SOUNDS
	var sound1 = new THREE.Audio( listener );
	sound1.load( 'assets/sounds/wusch.ogg' );
	// sound1.autoplay = true;
	// sound1.setLoop( true );
	sound1.setVolume( 0.5 );

	//pickableObject

	function Item( mesh ) {

		mesh.userData = this;
		this.mesh = mesh;

		// function computeRaycastMesh( mesh ) {
		// }

		this.name;
		this.hud = {};
		this.hud.action = "pickup the";

		// var proxymesh = this.physic( 5 );
		this.raycastMesh = this.computeRaycastMesh();

	}

	Item.prototype.computeRaycastMesh = function() {

		// bounding box for raycasting
		// scale up for easy access
		this.mesh.scale.multiplyScalar( 1.5 );
		var bbox = new THREE.BoundingBoxHelper( this.mesh );
		bbox.update();
		this.mesh.scale.multiplyScalar( 2/3 );
		// bbox.scale.set( 1.5, 1.5, 1.5 );
		// bbox.position.set( - 0.02, 0.40, -0.54 );
		// bbox.material.visible = false;
		// bbox.rotation.copy( safeGroup.rotation );
		// scene.add ( bbox );
		this.mesh.add ( bbox );
		bbox.userData = this.mesh.userData;

		return bbox;
	}

	Item.prototype.physic = function( scale ) {

		this.mesh.scale.set( scale, scale, scale );
		// CALCULATE BOUNDING BOX BEFORE ROTATION!
		var helper = new THREE.BoundingBoxHelper( this.mesh, 0xff0000 );
		helper.update();

		var bbox = new THREE.Box3().setFromObject( this.mesh );
		var boundingBoxSize = bbox.max.sub( bbox.min );

		// var boundingBoxSize = helper.box.max.sub( helper.box.min );
		var geometry = new THREE.BoxGeometry( boundingBoxSize.x , boundingBoxSize.y, boundingBoxSize.z );

		var material = new THREE.MeshBasicMaterial( { visible: false, wireframe: true } );
		var compundMesh = new THREE.Mesh( geometry, material );

		// object.geometry.translate( 0, - boundingBoxSize.y / 2, 0 );
		compundMesh.position.copy( this.mesh.getWorldPosition() );
		compundMesh.add( this.mesh );
		// !important: reset mesh position
		this.mesh.position.set( 0, 0, 0 );

		compundMesh.userData = this.mesh.userData;

		// mesh.position.set( 0, mesh.geometry.parameters.height / 2 + 1.5, 0 );
		// mesh.rotation.z = Math.PI / 1.5;
		scene.add( compundMesh );
		var rigidBody = physics.meshToBody( compundMesh, 20 );
		this.mesh.goblin = rigidBody;
		return compundMesh;

	};

	Item.prototype.highlight = function() {

		var material = this.mesh.material;
		if ( material instanceof THREE.MultiMaterial ) {
			for ( var i = 0; i < material.materials.length; i ++ ) {
				material.materials[ i ].emissive.setHex( 0xFF0000 );
			}
		} else {
			material.emissive.setHex( 0xFF0000 );
		}
		// material.wireframe = true;
	};

	Item.prototype.reset = function() {
		// console.log( "reset", this );
		var material = this.mesh.material;
		if ( material instanceof THREE.MultiMaterial ) {
			for ( var i = 0; i < material.materials.length; i ++ ) {
				material.materials[ i ].emissive.setHex( 0x000000 );
			}
		} else {
			material.emissive.setHex( 0x000000 );
		}
		// material.wireframe = false;

	};

	Item.prototype.interact = function() {
		// pickup Item - hide it
		// console.log("pickup", this );

		// allow overlapping for multiple fast pickups
		sound1.isPlaying = false; 
		sound1.play();

		this.mesh.visible = false;
		// hide raycast mesh
		// visible = false affecting children in terms of rendering
		// but raycaster still intersects!
		this.raycastMesh.visible = false;

		if ( this.mesh.goblin !== undefined ) {
			// well hello there, physic item here

			// remove physic body
			physics.getWorld().removeRigidBody( this.mesh.goblin );

			// hide compound mesh
			// this.mesh.parent.visible = false;
		}

	};

	Item.prototype.getRaycastMesh = function() {
		return this.raycastMesh;
	};


	return Item;

});