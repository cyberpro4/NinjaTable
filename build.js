
var fs = require( 'fs' );

var minify = require( 'minify' );

var includes = [];

var version = 'no';

var outputDirectory = './bin';

var includes = [
	'src/jquery.ninjaTable.js'
];

var output = '';

packageInfoString = fs.readFileSync( 'package.json' );
packageInfo = JSON.parse( packageInfoString );

version = packageInfo.version;

for( var i = 0; i < includes.length; i++ ){
	
	var include = fs.readFileSync( includes[i] );
	
	output += include;
}

if( !fs.existsSync( outputDirectory ) ){
	fs.mkdirSync( outputDirectory );
}

var out_uncompressed = outputDirectory + '/ninjaTable.' + version + '.uncompressed.js';

fs.writeFileSync( out_uncompressed , output );

minify( out_uncompressed , function(error, data) {
    if (error)
        console.error(error.message);
    else
        fs.writeFileSync( outputDirectory + '/ninjaTable.' + version + '.min.js' , data );
});
