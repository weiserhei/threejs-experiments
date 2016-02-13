var scene, camera, renderer;
var cube, cube2, cube3, cube4, cube5, cube6;
var stats, stats2, stats3;

var clock = new THREE.Clock();
var fixedStep = 1/60;
var limitedFPS = 30;
var timeBuffer = 0;
var randomBuffer = 0;

var mT = new MersenneTwister();
var variableFrameRate = randomIntFromInterval( 1, 60 );

function randomIntFromInterval(min,max)
{
    return Math.floor( mT.random()*(max-min+1)+min);
    // return Math.floor(Math.random()*(max-min+1)+min);
}

var loader = new THREE.FontLoader();
loader.load( 'fonts/gentilis_regular.typeface.js', function ( font ) {

    init( font );
    animate();

} );


function init( font ) {

	var width  = window.innerWidth;
	var height = window.innerHeight;

    scene = new THREE.Scene();

    // camera = new THREE.PerspectiveCamera(70, width / height, 1, 10);
    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, -500, 500 );
    camera.position.set(0, 3.5, 2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor( 0xffffff );
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style = "position:absolute; bottom:0; left:55%;";
    document.body.appendChild( stats.domElement );

    stats2 = new Stats();
    stats2.domElement.style = "position:absolute; bottom:0; left:45%";
    document.body.appendChild( stats2.domElement );

    stats3 = new Stats();
    stats3.domElement.style = "position:absolute; bottom:0; left:65%";
    document.body.appendChild( stats3.domElement );

    function addLabel( name, location ) {
        var textGeo = new THREE.TextGeometry( name, {

            font: font,

            size: 20,
            height: 1,
            curveSegments: 1

        });

        var textMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        var textMesh = new THREE.Mesh( textGeo, textMaterial );
        textMesh.position.copy( location );
        scene.add( textMesh );
    }

    addLabel( "Fixed Step", new THREE.Vector3( -500, 0, 0 ) );
    addLabel( "Delta Step", new THREE.Vector3( -500, 350, 0 ) );

    var xposition = -300;
    var offset = 300;
    addLabel( "60 FPS", new THREE.Vector3( xposition + offset * 0, 350, 0 ) );
    addLabel( limitedFPS +" FPS", new THREE.Vector3( xposition + offset * 1, 350, 0 ) );
    addLabel( "Random FPS", new THREE.Vector3( xposition + offset * 2, 350, 0 ) );
    addLabel( "60 FPS", new THREE.Vector3( xposition + offset * 0, 0, 0 ) );
    addLabel( limitedFPS + " FPS", new THREE.Vector3( xposition + offset * 1, 0, 0 ) );
    addLabel( "Random FPS", new THREE.Vector3( xposition + offset * 2, 0, 0 ) );

    function createBox( message ) {

	    var box = document.createElement("p");
	    box.style = "display:inline-block; width:33%; text-align:center";
	    container.appendChild( box );
	    box.innerHTML = message;
    }

    var group = new THREE.Group;

    // fixed 30
    cube = spinCube();
    cube.position.set( xposition + offset * 1, -400, 0 )

    // delta 30
    cube2 = spinCube();
    cube2.position.set( xposition + offset * 1, -0, 0 );

    // delta 60
    cube3 = spinCube();
    cube3.position.set( xposition + offset * 0, -0, 0 );

    // fixed 60
    cube4 = spinCube();
    cube4.position.set( xposition + offset * 0, -400, 0 );

    // fixed random
    cube5 = spinCube();
    cube5.position.set( xposition + offset * 2, -400, 0 );

    // delta random
    cube6 = spinCube();
    cube6.position.set( xposition + offset * 2, 0, 0 );

    group.add( cube, cube2, cube3, cube4, cube5, cube6 );
    group.position.set( 50, 200, 0 );
    scene.add( group );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function spinCube( pos ) {

    var mesh = new THREE.Mesh(new THREE.BoxGeometry(150,150,150), new THREE.MeshNormalMaterial());

    mesh.userData.spin = function( dt ) {
        this.rotation.x -= dt * 2;
        this.rotation.y -= dt;
        this.rotation.z -= dt * 3;

    }.bind( mesh );

    return mesh;
}

function animate() {

    var delta = clock.getDelta();
    timeBuffer += delta;
    randomBuffer += delta;

    // call animation with limited framerate
    if ( timeBuffer >= 1 / ( limitedFPS + 1 ) ) {

        cube.userData.spin( fixedStep );
        cube2.userData.spin( timeBuffer );
        stats.update();
        timeBuffer = 0;

    }

    // call animation with random framerate
    if ( randomBuffer > 1 / variableFrameRate ) {

        cube5.userData.spin( fixedStep );
        cube6.userData.spin( randomBuffer );
        stats3.update();
        randomBuffer = 0;
        variableFrameRate = randomIntFromInterval( 1, 60 ) * 3;

    }

    // call animation every frame
    cube3.userData.spin( delta );
    cube4.userData.spin( fixedStep );
	stats2.update();

    renderer.render(scene, camera);
    requestAnimationFrame( animate );
}