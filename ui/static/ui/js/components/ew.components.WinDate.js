
ew.components.WinDate = (function( $, CustomEvent ){

	var isDate = /^[0-9]{2}\/[0-9]{4}/;

	function errorMessage( field ){
		return ( field + 'is required for WinDateComponent' );
	}
	
	function WinDateComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.id ){ throw new Error( errorMessage( 'opts.id' ) ); }

		this.events = {
			yearChange: new CustomEvent()
		};

		this.$input = $( '#' + opts.id );
		this.val = this.$input.val();

		this.$input.on( 'keyup', $.proxy( this.handleInput, this ) );
		this.$input.on( 'change', $.proxy( this.handleInput, this ) );
	}

	WinDateComponent.prototype.handleInput = function( e ){

		var oldVal = this.val;
		var newVal = this.$input.val();
		
		if( newVal !== oldVal && isDate.test( newVal ) ){

			this.val = newVal;
			this.checkYear( oldVal, newVal );
		}
	};

	WinDateComponent.prototype.checkYear = function( oldDate, newDate ){
	
		var oldYear = oldDate.substr( -4 );
		var newYear = newDate.substr( -4 );

		if( oldYear !== newYear ){

			this.events.yearChange.publish( newYear );
		}		
	};

	return WinDateComponent;

}( jQuery, ew.CustomEvent ));
