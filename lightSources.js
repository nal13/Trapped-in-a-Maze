//----------------------------------------------------------------------------
//
//  Light Sources
//


//----------------------------------------------------------------------------
//
//  Constructor
//

function LightSource( ) {
	
	// A new light source is always on
	this.isOn = true;
	
	// And is directional
	this.position = [ 0.0, 0.0, 1.0, 0.0 ];
	
	// White light
	this.intensity = [ 1.0, 1.0, 1.0 ];
	
	// Ambient component
	this.ambientIntensity = [ 0.2, 0.2, 0.2 ];
	
	// Animation controls
	this.rotXXOn = false;
	this.rotYYOn = false;
	this.rotZZOn = false;
	
	// Rotation angles	
	this.rotAngleXX = 0.0;
	this.rotAngleYY = 0.0;
	this.rotAngleZZ = 0.0;	
	
	// Rotation speed factor
	this.rotationSpeed = 1.0;
}


//----------------------------------------------------------------------------
//
//  Methods
//

LightSource.prototype.isOff = function() {
	return this.isOn == false;
}

LightSource.prototype.switchOn = function() {
	this.isOn = true;
}

LightSource.prototype.switchOff = function() {
	this.isOn = false;
}

LightSource.prototype.isDirectional = function() {
	return this.position[3] == 0.0;
}

LightSource.prototype.getPosition = function() {
	return this.position;
}

LightSource.prototype.setPosition = function( x, y, z, w ) {	
	this.position[0] = x;
	this.position[1] = y;
	this.position[2] = z;
	this.position[3] = w;
}

LightSource.prototype.getIntensity = function() {
	return this.intensity;
}

LightSource.prototype.setIntensity = function( r, g, b ) {
	this.intensity[0] = r;
	this.intensity[1] = g;
	this.intensity[2] = b;
}

LightSource.prototype.getAmbIntensity = function() {
	return this.ambientIntensity;
}

LightSource.prototype.setAmbIntensity = function( r, g, b ) {
	this.ambientIntensity[0] = r;
	this.ambientIntensity[1] = g;
	this.ambientIntensity[2] = b;
}

LightSource.prototype.isRotXXOn = function() { return this.rotXXOn; }
LightSource.prototype.isRotYYOn = function() { return this.rotYYOn; }
LightSource.prototype.isRotZZOn = function() { return this.rotZZOn; }

LightSource.prototype.switchRotXXOn = function() { this.rotXXOn = true; }
LightSource.prototype.switchRotYYOn = function() { this.rotYYOn = true; }
LightSource.prototype.switchRotZZOn = function() { this.rotZZOn = true; }

LightSource.prototype.switchRotXXOff = function() { this.rotXXOn = false; }
LightSource.prototype.switchRotYYOff = function() { this.rotYYOn = false; }
LightSource.prototype.switchRotZZOff = function() { this.rotZZOn = false; }

LightSource.prototype.getRotAngleXX = function() { return this.rotAngleXX; }
LightSource.prototype.getRotAngleYY = function() { return this.rotAngleYY; }
LightSource.prototype.getRotAngleZZ = function() { return this.rotAngleZZ; }

LightSource.prototype.setRotAngleXX = function( angle ) { this.rotAngleXX = angle; }
LightSource.prototype.setRotAngleYY = function( angle ) { this.rotAngleYY = angle; }
LightSource.prototype.setRotAngleZZ = function( angle ) { this.rotAngleZZ = angle; }

LightSource.prototype.getRotationSpeed = function() {
	return this.rotationSpeed;
}

LightSource.prototype.setRotationSpeed = function( s ) {
	this.rotationSpeed = s;
}


//----------------------------------------------------------------------------
//
//  Instantiating light sources
//

var lightSources = [];

	// Light source 0
lightSources.push( new LightSource() );		// moving white / blue
lightSources[0].setPosition( 0.0, 2.5, 1.0, 1.0 );
lightSources[0].setIntensity( 1.2, 1.2, 1.2 );
lightSources[0].switchRotYYOn();
lightSources[0].setRotationSpeed( 3 );

	// Light source 1
lightSources.push( new LightSource() );		// white / blue
lightSources[1].setPosition( 0.0, -30.0, 10.0, 0.0 );
lightSources[1].setIntensity( 1.2, 1.2, 1.2 );

	// Light source 2
lightSources.push( new LightSource() );		// green
lightSources[2].setPosition( -1.0, 0.0, 0.0, 0.0 );
lightSources[2].setIntensity( 0.8, 1.0, 0.0 );

	// Light source 3
lightSources.push( new LightSource() );		// red
lightSources[3].setPosition( 1.0, 0.0, 0.0, 0.0 );
lightSources[3].setIntensity( 1.1, 0.4, 0.0 );

	// Light source 4
lightSources.push( new LightSource() );		// red of death 1
lightSources[4].setPosition( 0.0, 0.0, 30.0, 1.0 );
lightSources[4].setIntensity( 1.0, 0.0, 0.0 );
lightSources[4].switchOff();
