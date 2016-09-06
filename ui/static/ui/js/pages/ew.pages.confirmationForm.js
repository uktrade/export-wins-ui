ew.pages.confirmationForm = (function(){

	function setupConfirmToggle( agreeWithWinName ){
	
		var $infoBox = $( '#confirm-false-info' );
		var $agree = $( 'form input[name='+ agreeWithWinName + ']' );

		//hide the box on load
		if( !$agree[ 1 ].checked ) {

			$infoBox.hide();
		}

		//Toggle the box when the value of the radio changes
		$agree.on( 'change', function( e ){

			if( $agree[ 0 ].checked ){

				$infoBox.hide();

			} else {

				$infoBox.show();
			}
		} );
	}
	
	function confirmationFormPage( formId, agreeWithWinName ){

		setupConfirmToggle( agreeWithWinName );

		ew.application.components.stopConfirmationFormSubmit = new ew.components.DisableMultiSubmit( formId );
	}

	return confirmationFormPage;
}());