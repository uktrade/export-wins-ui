ew.pages.officerForm = (function(){

	var HIDDEN_CLASS = 'hidden';
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

	return function officeFormPage(){
		
		leadOfficerTeamTypeChange();
		contributingOfficerTeamTypeChange();
		
		ew.application.components.toggleContributors = new ew.components.ToggleContributors({
			$contributingTeamDetails: $( '#contributing-teams-details' ),
			$someContributors: $( '#some-contributors' ),
			noContributorsSelector: '#no-contributors'
		});

		ew.application.components.addContributors = new ew.components.AddContributors({
			$addButton: $( '#add-contributor' ),
			$contributors: $( '.contributing-officer-form-group' )
		});
	};
}());