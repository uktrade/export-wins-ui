ew.components.ToggleExportValue = (function( $, CustomEvent ){
	
	function errorMessage( label ){
		return ( label + ' is required for ToggleExportValueComponent' );
	}

	function ToggleExportValueComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.fieldId ){ throw new Error( errorMessage( 'opts.fieldId' ) ); }
		if( !opts.contentId ){ throw new Error( errorMessage( 'opts.contentId' ) ); }

		this.events = {
			hide: new CustomEvent()
		};

		this.$content = $( '#' + opts.contentId );
		this.$field = $( '#' + opts.fieldId );

		this.$field.on( 'change', $.proxy( this.showContent, this ) );

		this.showContent();
	}

	ToggleExportValueComponent.prototype.showContent = function(){
		
		if( this.$field[ 0 ].checked ){

			this.$content.show();

		} else {
			
			this.$content.hide();
			this.events.hide.publish();
		}
	};

	return ToggleExportValueComponent;

}( jQuery, ew.CustomEvent ));