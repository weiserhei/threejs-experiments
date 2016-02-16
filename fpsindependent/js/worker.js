/**
 * WebWorker
 */

function fibonacci(n) {
   if (n < 2)
      return 1;
   else
      return fibonacci(n-2) + fibonacci(n-1);
}

onmessage = function( e ) {
  // console.log('Message received from main script');
  // console.log( e.data );

	if ( e.data instanceof ArrayBuffer ) { 
		// byteLength === 1 is the worker making a SUPPORT_TRANSFERABLE test
		var data = new Float32Array( e.data );
		// console.log( data );
	}

	// fake some load
	fibonacci( data[5] );

	// calculate Rotations
	data[1] -= data[0] * 2;
	data[2] -= data[0];
	data[3] -= data[0] * 3;

	// console.log( "worker processed, posting message back to main", data );
	postMessage(data.buffer, [data.buffer]);

}