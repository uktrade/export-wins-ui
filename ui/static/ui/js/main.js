var ew = {};
ew.pages = {};
ew.pages.confirmationForm = function confirmationFormPage( agreeWithWinName ){
	
	var $infoBox = $( '#confirm-false-info' );
	var $agree = $( 'form input[name='+ agreeWithWinName + ']' );
	var $confirmFalseComments = $( '#confirm-false-details' );

	//hide the comments box on load
	if( !$agree[ 1 ].checked ) {

		$infoBox.hide();
	}

	//Toggle the comments box when the value of the radio changes
	$agree.on( 'change', function( e ){

		if( $agree[ 0 ].checked ){

			$infoBox.hide();

		} else {

			$infoBox.show();
		}
	} );
};
ew.pages.officerForm = (function(){

	var HIDDEN_CLASS = 'hidden';

	var $contributingTeamDetails;
	var $someContributors;
	var $noContributors;

/*
		window.addEventListener( 'beforeunload', function( e ){

			//console.log( formHasChanges( 'win-form' ) );

			if( formHasChanges( 'win-form' ) ){
				console.log( 'changes made' );
				e.returnValue = 'You have unsaved edits, are you sure you want to leave?';
			} else {
				console.log( 'no changes' );
			}

		} );
*/

	function leadOfficerTeamTypeChange(){

		$( '#id_team_type' ).on( 'change', function(){

			var type = $( this ).val();
			var $typeValues = $( '#id_hq_team option[value^=' + type + ']' );

			$( '#id_hq_team option' ).addClass( HIDDEN_CLASS );
			$typeValues.removeClass( HIDDEN_CLASS );
			$( '#id_hq_team' ).val( $typeValues.first().val() );
		});
	}

	function contributingOfficerTeamTypeChange(){

		$( '.contributing-officer-team-group .contributing-team-type select' ).on( 'change', function(){

			var $teamType = $( this );
			var chosenType = $teamType.val();
			var $team = $teamType.closest( '.row' ).find( '.contributing-team select' );
			var $chosenTeam = $team.find( 'option[value^=' + chosenType + ']' );

			$team.val( $chosenTeam.first().val() );
			$team.find( 'option' ).addClass( HIDDEN_CLASS );
			$chosenTeam.removeClass( HIDDEN_CLASS );
		});
	}

	function toggleContributingDetails( e ){

		if( $someContributors[ 0 ].checked ){

			$contributingTeamDetails.show();

		} else {

			$contributingTeamDetails.hide();
		}
	}

	function checkContributingDetails(){

		if( !$someContributors[ 0 ].checked ){

			$contributingTeamDetails.hide();
		}

		$someContributors.on( 'click', toggleContributingDetails );
		$noContributors.on( 'click', toggleContributingDetails );
	}

	return function officeFormPage(){

		$contributingTeamDetails = $( '#contributing-teams-details' );
		$someContributors = $( '#some-contributors' );
		$noContributors = $( '#no-contributors' );

		leadOfficerTeamTypeChange();
		contributingOfficerTeamTypeChange();
		checkContributingDetails();
	};
}());
//# sourceMappingURL=main.js.map