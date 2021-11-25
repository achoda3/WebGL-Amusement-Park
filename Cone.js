/* Cone.js
	
	Written by Aryann Chodankar for CS 425, Fall 2020
    
    This file contains code to create and draw a unit cone, centered at the origin.
    
*/

// Globals are evil.  We won't use any here. :-)

function createCone( nSectors, gl, color ) {
	
	// Accept a color as a second argument.  If invalid, assign colors
	
	var points = [ ];	// Vertex location data
	var colors = [ ];	// Vertex color data
	var normals = [ ];	// Vertex normal data
	// Generate Points and Colors
	
	// Colors first.  Use passed color if it is value
	
	var validColor = false;
	
	if ( Array.isArray( color ) && color.length == 3 
		&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
		&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {
        
		validColor = true;
															 
    }

	// If the passed color is valid, use it to make a vec3.  Otherwise use calls to Math.random( ).
	for( var i = 0; i < (3* nSectors) + 2 ; i++ ) {
		if( validColor )
			colors.push(vec3(color));
		else
			colors.push(vec3(Math.random(), Math.random(), Math.random()));
	}

	// Then the vertex locations, starting with the apex
	
	// push ( 0, 1, 0 ) into the points array as a vec3
	
	let cone_x = 1/Math.sqrt(2);
	let cone_y = -1/Math.sqrt(2);
	// Then the base points
	var dTheta = radians( 360 / nSectors );
	for( i = 0; i < nSectors; i++ ) {
		var theta = i * dTheta;
		// push a vertex here, using Math.cos( theta ) for X and Math.sin( theta ) for Z
		// ( Preceding line was corrected to terminate in "Z", not "Y". )
		points.push(vec3(Math.cos(theta), 0, Math.sin(theta)));
		normals.push(vec3(-1*cone_y*Math.cos(theta), cone_x, -cone_y*Math.sin(theta)));
		points.push(vec3(0,1,0));
		normals.push(vec3(-1*cone_y*Math.cos(theta), cone_x, -cone_y*Math.sin(theta)));
	}	
	for( i = 0; i < nSectors; i++ ) { 
		var theta = i * dTheta;
		// push a vertex here, using Math.cos( theta ) for X and Math.sin( theta ) for Z
		// ( Preceding line was corrected to terminate in "Z", not "Y". )
		points.push(vec3(Math.cos(theta), 0, Math.sin(theta)));
		normals.push(vec3(-1*cone_y*Math.cos(theta), cone_x, -cone_y*Math.sin(theta)));
	}	


	
	// Push Vertex Location Data to GPU
	// Hold off on connecting the data to the shader variables
	
	vbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.STATIC_DRAW );
	
	// Push Vertex Color Data to GPU
	// Hold off on connecting the data to the shader variables
	
	cbufferID = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );
	
	// Push Normal Location Data to GPU
	// Hold off on connecting data to the shader variables

	nbufferID = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nbufferID);
	gl.bufferData( gl.ARRAY_BUFFER, flatten( normals ), gl.STATIC_DRAW );

	// Unbind the buffer, for safety sake.
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
	return [ vbufferID, cbufferID, nbufferID];

}

function renderCone( buffers, nSectors, gl, program ) {
	
	// Okay.  All transformaation matrices sent to uniform variables.
	// Time to attach vertex shader variables to the buffers created in init( )
	
	// Connect the vertex data to the shader variables - First positions
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 0 ] );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	// Then the colors
	// using bindBuffer, getAttribLocation, vertexAttribPointer, and enableVertexAttribArray
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 1 ] );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 2 ] );
	var vNormal = gl.getAttribLocation( program, "vNormal" );
	gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormal );

	// Unbind the array buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	for( var i=0; i<2*nSectors; i+=2){
		gl.drawArrays(gl.TRIANGLES, i, 3);
	}
	gl.drawArrays(gl.TRIANGLE_FAN, 2*nSectors, nSectors);
	// And finally to draw the cone	
	//gl.drawArrays(gl.TRIANGLE_FAN, 0, nSectors + 2);	// Sides
	//gl.drawArrays(gl.TRIANGLE_FAN, 1, nSectors + 1);	// Bottom
	
	
}