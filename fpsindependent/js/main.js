/**
 * Demo to show the importance of
 * Framerate-Independent animation
 *
 */

var scene, camera, renderer;
var cube, cube2, cube3, cube4, cube5, cube6, cube7, cube8;
var stats, stats2, stats3, stats4;

var clock = new THREE.Clock();
var fixedStep = 1/60;
var limitedFPS = 30;
var timeBuffer = 0;
var randomBuffer = 0;

var workerDelta = 0;
var workerBusy = false; //used to manually sync
var transferBuffer = new Float32Array( 6 );

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

if (window.Worker) {

    var myWorker = new Worker("js/worker.js");

    myWorker.onmessage = function ( e ) { 

        // console.log("e", e );
        if ( e.data instanceof ArrayBuffer ) { 
            // byteLength === 1 is the worker making a SUPPORT_TRANSFERABLE test
            var data = new Float32Array( e.data );
            // console.log( "data", data );
        }

        stats4.update();
        cube7.rotation.set( data[1], data[2], data[3] );
        cube8.userData.spin( data[4] );
        workerBusy = false;
        // console.log("worker finish");

    };

    myWorker.onerror = function( event ) {
        throw event.data;
    };

} else {
    alert("no worker support");
}

function init( font ) {

    // GUI
    var gui = new dat.GUI();
    var folder = gui.addFolder( "Worker Fake Load");
    folder.open();
    var guiOptions = {
        fibonacci: 0,
        fixedStep: 60
    }
    folder.add( guiOptions, "fibonacci" )
        .min( 0 ).max( 50 )
        .onChange( function() { transferBuffer[5] = guiOptions.fibonacci; } );    

    folder.add( guiOptions, "fixedStep" )
        .min( 1 ).max( 144 )
        .onChange( function() { fixedStep = 1 / guiOptions.fixedStep; } );


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
    stats.domElement.style = "position:absolute; bottom:0; left:40%;";
    document.body.appendChild( stats.domElement );

    stats2 = new Stats();
    stats2.domElement.style = "position:absolute; bottom:0; left:55%";
    document.body.appendChild( stats2.domElement );

    stats3 = new Stats();
    stats3.domElement.style = "position:absolute; bottom:0; left:71%";
    document.body.appendChild( stats3.domElement );

    stats4 = new Stats();
    stats4.domElement.style = "position:absolute; bottom:0; left:25%";
    document.body.appendChild( stats4.domElement );

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

    addLabel( "Fixed Step", new THREE.Vector3( -700, 0, 0 ) );
    addLabel( "Delta Step", new THREE.Vector3( -700, 350, 0 ) );

    var xposition = -200;
    var offset = 300;
    addLabel( "Worker", new THREE.Vector3( xposition + offset * -1, 350, 0 ) );
    addLabel( "60 FPS", new THREE.Vector3( xposition + offset * 0, 350, 0 ) );
    addLabel( limitedFPS +" FPS", new THREE.Vector3( xposition + offset * 1, 350, 0 ) );
    addLabel( "Random FPS", new THREE.Vector3( xposition + offset * 2, 350, 0 ) );
    addLabel( "Worker", new THREE.Vector3( xposition + offset * -1, 0, 0 ) );
    addLabel( "60 FPS", new THREE.Vector3( xposition + offset * 0, 0, 0 ) );
    addLabel( limitedFPS + " FPS", new THREE.Vector3( xposition + offset * 1, 0, 0 ) );
    addLabel( "Random FPS", new THREE.Vector3( xposition + offset * 2, 0, 0 ) );

    var group = new THREE.Group;

    // worker delta
    cube7 = spinCube();
    cube7.position.set( xposition + offset * -1, -0, 0 );

    // fixed worker
    cube8 = spinCube();
    cube8.position.set( xposition + offset * -1, -400, 0 );

    // delta 60
    cube1 = spinCube();
    cube1.position.set( xposition + offset * 0, -0, 0 );

    // fixed 60
    cube2 = spinCube();
    cube2.position.set( xposition + offset * 0, -400, 0 );

    // delta 30
    cube3 = spinCube();
    cube3.position.set( xposition + offset * 1, -0, 0 );

    // fixed 30
    cube4 = spinCube();
    cube4.position.set( xposition + offset * 1, -400, 0 )

    // delta random
    cube5 = spinCube();
    cube5.position.set( xposition + offset * 2, 0, 0 );

    // fixed random
    cube6 = spinCube();
    cube6.position.set( xposition + offset * 2, -400, 0 );

    group.add( cube1, cube2, cube3, cube4, cube5, cube6, cube7, cube8 );
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

function fibonacci(n) {
   if (n < 2)
      return 1;
   else
      return fibonacci(n-2) + fibonacci(n-1);
}

function animate() {

    var delta = clock.getDelta();
    timeBuffer += delta;
    randomBuffer += delta;

    // call animation every frame
    cube1.userData.spin( delta );
    cube2.userData.spin( fixedStep );
    stats.update();

    // fibonacci( 35 );
    workerDelta += delta;

    if ( ! workerBusy ) {
        // console.log("workerDelta", workerDelta );

        transferBuffer[0] = workerDelta;
        transferBuffer[1] = cube7.rotation.x;
        transferBuffer[2] = cube7.rotation.y;
        transferBuffer[3] = cube7.rotation.z;

        transferBuffer[4] = fixedStep;

        myWorker.postMessage( transferBuffer.buffer );

        workerBusy = true;
        workerDelta = 0;
    }

    // call animation with limited framerate
    if ( timeBuffer >= 1 / ( limitedFPS + 1 ) ) {

        cube3.userData.spin( timeBuffer );
        cube4.userData.spin( fixedStep );
        stats2.update();
        timeBuffer = 0;

    }

    // call animation with random framerate
    if ( randomBuffer > 1 / variableFrameRate ) {

        cube5.userData.spin( randomBuffer );
        cube6.userData.spin( fixedStep );
        stats3.update();
        randomBuffer = 0;
        variableFrameRate = randomIntFromInterval( 1, 60 ) * 3;

    }

    renderer.render(scene, camera);
    requestAnimationFrame( animate );
}