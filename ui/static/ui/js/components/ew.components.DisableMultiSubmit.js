ew.components.DisableMultiSubmit = (function( $ ){
	
	function DisableMultiSubmitComponent( formId, savingText ){

		if( !formId ){ throw new Error( 'formId is required for DisableMultiSubmitComponent' ); }

		this.$form = $( '#' + formId );
		this.savingText = ( savingText || 'Saving...' );
		this.$submitButton = this.$form.find( 'input[type=submit]' );

		this.submitInProgress = false;
		this.$form.on( 'submit', $.proxy( this.handleSubmit, this ) );
	}

	DisableMultiSubmitComponent.prototype.handleSubmit = function( e ){
		
		if( this.submitInProgress ){

			e.preventDefault();

		} else {

			this.submitInProgress = true;

			this.$submitButton.attr( 'disabled', true );
			this.$submitButton.val( this.savingText );
		}
	};

	return DisableMultiSubmitComponent;

}( jQuery ));