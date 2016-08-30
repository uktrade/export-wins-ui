/*
ew.components.ToggleContentCheckbox = (function( $ ){

	function errorMessage( field ){
		return ( field + ' is required for ToggleContentCheckboxComponent' );
	}

	function ToggleContentCheckboxComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.checkboxId ){ throw new Error( errorMessage( 'opts.checkboxId' ) ); }
		if( !opts.contentId ){ throw new Error( errorMessage( 'opts.contentId' ) ); }

		this.$checkbox = $( opts.checkboxId );
		this.$content = $( opts.contentId );

		this.$checkbox.on( 'change', $.proxy( this.checkState, this ) );
		this.checkState();
	}

	ToggleContentCheckboxComponent.prototype.checkState = function(){
		
		if( this.$checkbox[ 0 ].checked ){

			this.$content.show();

		} else {

			this.$content.hide();
		}
	};

	return ToggleContentCheckboxComponent;
	
}( jQuery ));
*/