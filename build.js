
var fs = require( 'fs' );

var minify = require( 'minify' );

var browserify = require( 'browserify' );
browserify = browserify();

var includes = [];

var version = 'no';

var outputDirectory = './bin';

var includes = [
	'src/jquery.ninjaTable.js'
];


packageInfoString = fs.readFileSync( 'package.json' );
packageInfo = JSON.parse( packageInfoString );

version = packageInfo.version;

var output = '';

for( var i = 0; i < includes.length; i++ ){
	
	//var include = fs.readFileSync( includes[i] );
	browserify.add( includes[i] );
	
	//output += include;
}

if( !fs.existsSync( outputDirectory ) ){
	fs.mkdirSync( outputDirectory );
}

var out_uncompressed = outputDirectory + '/ninjaTable.' + version + '.uncompressed.js';

//fs.writeFileSync( out_uncompressed , output );
var out_stream = fs.createWriteStream( out_uncompressed );

var stream = browserify.bundle()//.pipe( fs.createWriteStream( out_uncompressed ) );

stream.pipe( out_stream , {end:false} );
stream.on( 'end' , function(){
	minify( out_uncompressed , function(error, data) {
		if (error)
			console.error(error.message);
		else
			fs.writeFileSync( outputDirectory + '/ninjaTable.' + version + '.min.js' , data );
	});
} );
	

