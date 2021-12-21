/* Texture.js
	
	Written by Aryann Chodankar for CS 425, Fall 2020
    
    This file contains code to create and draw a unit textured square centered at origin with different texture maps
    
*/

var image;
var image2;
function createTexture( gl) {
    // getting the image in init
    image = document.getElementById( "Sign" );
    image2 = document.getElementById( "background");

	// Accept a color as a second argument.  If invalid, assign colors
	
	var points = [ ];	// Vertex location data
	var colors = [ ];	// Vertex color data
	var normals = [ ];	// Vertex normal data
    var texCoords = [ ];	// Vertex texture coordinate data 

	// If the passed color is valid, use it to make a vec3.  Otherwise use calls to Math.random( ).
	for( var i = 0; i < 4 ; i++ ) {
		colors.push(vec3(0,0,0));
	}

	// Then the vertex locations, starting with the apex
	
	// push ( 0, 1, 0 ) into the points array as a vec3
	points.push(vec3(1, 0, 0));
    normals.push(vec3(1, 0, 0));
    texCoords.push(vec2(1, 0));
    points.push(vec3(0, 0, 0));
    normals.push(vec3(0, 0, 0));
    texCoords.push(vec2(0, 0));
    points.push(vec3(1, 1, 0));
    normals.push(vec3(1, 1, 0));
    texCoords.push(vec2(1, 1));
    points.push(vec3(0, 1, 0));
    normals.push(vec3(0, 1, 0));
    texCoords.push(vec2(0, 1));
	
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

    var tbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, tbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( texCoords ), gl.STATIC_DRAW );



	// Unbind the buffer, for safety sake.
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
	return [ vbufferID, cbufferID, nbufferID, tbufferID];

}

function renderTexture( buffers, gl, program , imageNumber) {
	
	// Okay.  All transformaation matrices sent to uniform variables.
	// Time to attach vertex shader variables to the buffers created in init( )
	
    // File loaded in html code, accessed here.
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	var texture = gl.createTexture( );
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture );
    if(imageNumber == 1){
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    } else {
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2 );
    }
	gl.uniform1i( gl.getUniformLocation( program, "uTextureMap" ), 0 ); // Associate "uTextureMap" with TEXTURE0
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
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

    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 3 ] );
    var vTex = gl.getAttribLocation( program, "vTexCoords" );
	gl.vertexAttribPointer( vTex, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTex );

	// Unbind the array buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );	// Or gl.TRIANGLES, or . . .
	
}