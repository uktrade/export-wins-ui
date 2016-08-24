ew.components.ToggleExportValue = (function( $ ){
	
	function errorMessage( label ){
		return ( label + ' is required for ToggleExportValueComponent' );
	}

	function ToggleExportValueComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.fieldName ){ throw new Error( errorMessage( 'opts.fieldName' ) ); }
		if( !opts.exportValue ){ throw new Error( errorMessage( 'opts.exportValue' ) ); }
		if( !opts.nonExportValue ){ throw new Error( errorMessage( 'opts.nonExportValue' ) ); }
		if( !opts.bothValue ){ throw new Error( errorMessage( 'opts.bothValue' ) ); }
		if( !opts.exportId ){ throw new Error( errorMessage( 'opts.exportId' ) ); }
		if( !opts.nonExportId ){ throw new Error( errorMessage( 'opts.nonExportId' ) ); }

		this.fieldName = opts.fieldName;
		this.exportValue = opts.exportValue;
		this.nonExportValue = opts.nonExportValue;
		this.bothValue = opts.bothValue;

		this.$exportContent = $( '#' + opts.exportId );
		this.$nonExportContent = $( '#' + opts.nonExportId );
		this.$field = $( 'input[ name=' + this.fieldName + ']' );

		this.$field.on( 'change', $.proxy( this.showContent, this ) );

		this.showContent();
	}

	ToggleExportValueComponent.prototype.showContent = function(){
		
		var currentVal = $( 'input[ name=' + this.fieldName + ']:checked' ).val();

		switch( currentVal ){
			case this.exportValue:
				this.$exportContent.show();
				this.$nonExportContent.hide();
			break;

			case this.nonExportValue:
				this.$exportContent.hide();
				this.$nonExportContent.show();
			break;

			case this.bothValue:
				this.$exportContent.show();
				this.$nonExportContent.show();
			break;

			default:
				this.$exportContent.hide();
				this.$nonExportContent.hide();
		}
	};

	return ToggleExportValueComponent;

}( jQuery ));