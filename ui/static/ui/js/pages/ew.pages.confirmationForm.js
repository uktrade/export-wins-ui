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

    function setupMarketingOther( marketingInfo ){

        var $inputs = $( 'form input[name='+ marketingInfo.inputName + ']' );
        var $wrapper = $( '.'+ marketingInfo.otherWrapper );
        var $otherInput = $( 'form input[name='+ marketingInfo.otherInputName + ']' );
        var otherValue = $inputs.last().val();

        function checkInputValue(){

            var value = $inputs.filter( ':checked' ).val();
            var isOther = ( value === otherValue );

            if( isOther ){

                $wrapper.show();
                $otherInput.focus();

            } else {

                $wrapper.hide();
                $otherInput.val( '' );
            }
        }

        $inputs.change( checkInputValue );
        checkInputValue();
    }

	function confirmationFormPage( formId, agreeWithWinName, marketingInfo ){

		setupConfirmToggle( agreeWithWinName );
        setupMarketingOther( marketingInfo );

		ew.application.components.stopConfirmationFormSubmit = new ew.components.DisableMultiSubmit( formId );
	}

	return confirmationFormPage;
}());
