/* axes.js
	
	Written by John Bell for CS 425, Fall 2020
	Last revised Fall 2021
    
    This file contains code to create and draw a set of unit axes, centered at the origin.
    
*/

// Globals are evil.  We won't use any here. :-)

class Axes{ 

	constructor( gl, program ) {
		
		this.program = program;
		this.gl = gl;
		
		var points = [ ];	// Vertex location data 
		var colors = [ ];	// Vertex color data
		
		// Generate Points and Colors
		
		// First the points and colors for the axes.
		points.push( vec3( 0, 0, 0 ) );
		colors.push( vec3( 1, 0, 0 ) );
		points.push( vec3( 1, 0, 0 ) );
		colors.push( vec3( 1, 0, 0 ) );
		
		points.push( vec3( 0, 0, 0 ) );
		colors.push( vec3( 0, 1, 0 ) );
		points.push( vec3( 0, 1, 0 ) );
		colors.push( vec3( 0, 1, 0 ) );
		
		points.push( vec3( 0, 0, 0 ) );
		colors.push( vec3( 0, 0, 1 ) );
		points.push( vec3( 0, 0, 1 ) );
		colors.push( vec3( 0, 0, 1 ) );
		
		// No need for drawElements here.  drawArrays will suit just fine.
		
		// Okay.  All data calculated.  Time to put it all in GPU buffers
		
		// Push Vertex Location Data to GPU
		// Hold off on connecting the data to the shader variables
		
		this.vbufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vbufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.STATIC_DRAW );
		
		// Push  Vertex Color Data to GPU
		// Hold off on connecting the data to the shader variables
		
		this.cbufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cbufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );
		
		// Unbind the buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
		return;
	
	}
	
	render( ) {
		
		var gl = this.gl;
		
		// Connect the vertex data to the shader variables - First positions
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vbufferID );
		var vPosition = gl.getAttribLocation( this.program, "vPosition" );
		gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		
		// Then the colors
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cbufferID );
		var vColor = gl.getAttribLocation( this.program, "vColor" );
		gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
		
		// Unbind the array buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
		// And finally to draw the axes
		
		gl.drawArrays( gl.LINES, 0, 6 );	
		
	} // render( )

} // class Axes