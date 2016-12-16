ew.components.CleanPastedInput = (function(){
	
	function CleanPastedInput( $elem ){

		this.$elem = $elem;
		this.elem = $elem[ 0 ];
		this.$elem.on( 'paste', $.proxy( this.handlePaste, this ) );
	}

	CleanPastedInput.prototype.cleanValue = function(){
		
		this.elem.value = this.elem.value.replace( /^\s+|\s+$/g, '' );
	};

	CleanPastedInput.prototype.handlePaste = function( e ){
		
		setTimeout( $.proxy( this.cleanValue, this ), 1 );
	};

	return CleanPastedInput;
}());