/* Sphere.js

   Written by John Bell (edited by Aryann) for CS 425 Fall 2020.  Last modified Fall 2021
   
   This program draws a sphere, using triangle fans at top and bottom and triangle strips in the middle.
   
   Inspired by Section 2.4.3 in "Interactive Computer Graphics" by Edward R. Angel
*/


// The following parameters are passed in to the constructor:

//var gl;			// A WebGLRenderingContext
//var program;		// The shaders program
//var nLong;		// Number of longitudinal sections ( points around equator )
//var nLat;			// Number of latitudinal sections ( top to bottom, including two fans and nLat - 2 strips
//var color;		// A solid colored sphere if this color is valid.  Otherwise random colors for each vertex. 

function createCylinder( gl, nLong, color ) {
	
	var points = [ ];	// Vertex location data 
	var colors = [ ];	// Vertex color data
    var normals = [ ];  // Vertex normal data
	
	var validColor = false;
	
	if ( Array.isArray( color ) && color.length == 3 
		&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
		&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {
			validColor = true;
	}
	
	// All the colors can be calculated in a single loop
	// Top and bottom fans require 2 * ( ( nLong + 1 ) + 1 )
	// Strips require ( nLat - 2 ) * ( 2 * ( nLong + 1 ) )
	for( var i = 0; i < 4 * ( nLong + 1 ) ; i++ ) {
		if( validColor )
			colors.push( vec3( color ) );
		else
			colors.push( vec3( Math.random( ), Math.random( ), Math.random( ) ) );
	}

	// Now to generate the vertex coordinates

	var R = 1.0;			// Radius of the sphere
    var H = 1.0;            // 1/2 Height of Cyclinder
	var theta = 0.0;		// "horizontal" angle, circular around the "equator"
	
	var dTheta = 2.0 * Math.PI / nLong;		// Increment around circle for each point

	for( var i = 0; i < nLong + 1; i++ ) {	// Loop around the circle
		theta = i * dTheta;
		points.push( vec3(  Math.cos( theta ), H, Math.sin( theta ) ) );
        normals.push( vec3(  Math.cos( theta ), H, Math.sin( theta ) ));
	} // Loop for top triangle fan.
	

	for( var i = 0; i < nLong + 1; i++ ) {	// Loop around the circle
		theta = i * dTheta;
		points.push( vec3(  Math.cos( theta ), -H, Math.sin( theta ) ) );
        normals.push( vec3(  Math.cos( theta ), -H, Math.sin( theta ) ) );
	} // Loop for bottom triangle fan.

	// Now for the center strips
	// To use triangle strips, two rows of points need to be interleaved.
    for( var j = 0; j < nLong + 1; j++ ) {	// Loop around circles
    
        theta = j * dTheta;
        
        // First a point on the top edge of the strip
        points.push( vec3( Math.cos( theta ), H, Math.sin( theta ) ) );
        normals.push( vec3( Math.cos( theta ), 0, Math.sin( theta ) ));
        // Then a corresponding point on the bottom edge of the strip
        points.push( vec3( Math.cos( theta ), -H, Math.sin( theta ) ) );
        normals.push( vec3( Math.cos( theta ), 0, Math.sin( theta ) ) );
        
    } // Loop for points on a single strip

	// Push Vertex Location Data to GPU
	
	vbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.STATIC_DRAW );
	
	// Push Vertex Color Data to GPU
	
	cbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );
	
    // Push Normal Data to GPU

	nbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, nbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.STATIC_DRAW );

	// Unbind the buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	return [ vbufferID, cbufferID, nbufferID];

} //End of Function

function renderCyclinder(buffers, gl, program, nLong) {	
	// Attach the data in the buffers to the variables in the shaders
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[0] );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[1] );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[2] );
	var vNormal = gl.getAttribLocation( program, "vNormal" );
	gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormal );
	
	// Draw points and lines for diagnostic and explanatory purposes
	//gl.drawArrays( gl.POINTS, 0, nPoints );
	//gl.drawArrays( gl.LINE_LOOP, 0, nPoints );

	// Now draw the top and bottom fans.
	// Last two arguments are the index of the first data point to use, and the number of points to draw
	// Note that the last point in the "circle" is the same as the first, hence nLong + 1 points / circle.
	
	gl.drawArrays( gl.TRIANGLE_FAN, 0, nLong + 1 );
	gl.drawArrays( gl.TRIANGLE_FAN, nLong + 1, nLong + 1 );
	
	// And finally to draw the middle strips
	// For each strip, skip over the vertices for the two fans, plus preceding strips
	// Each strip has nLong + 1 vertices per circle, times two circles per strip
	var firstIndex = 2 * ( nLong + 1 );
	gl.drawArrays( gl.TRIANGLE_STRIP, firstIndex, 2 * ( nLong + 1 ) );

	
} // render Function
	