ew.tools.toLocaleString = function localeString( number, separator, grouping ){

    separator = ( separator || ',' );
    grouping = ( grouping === 0 ? grouping : 3);

    var numberParts = ( '' + number ).split( '.' );
    var i = numberParts[0].length;
    var s = '';
    var j;

    while( i > grouping ){
        j = i - grouping;
        s = separator + numberParts[ 0 ].slice( j, i ) + s;
        i = j;
    }

    s = numberParts[ 0 ].slice( 0, i ) + s;
    numberParts[ 0 ] = s;
    
    return numberParts.join( '.' );
};