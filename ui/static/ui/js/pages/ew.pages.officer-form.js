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
		
		var app = ew.application;
		var appComponents = app.components;

		leadOfficerTeamTypeChange();
		contributingOfficerTeamTypeChange();
		
		appComponents.toggleContributors = new ew.components.ToggleContributors({
			$contributingTeamDetails: $( '#contributing-teams-details' ),
			$someContributors: $( '#some-contributors' ),
			noContributorsSelector: '#no-contributors'
		});

		appComponents.addContributors = new ew.components.AddContributors({
			contributorsSelector: '.contributing-officer-group',
			nameInputSelector: '.contributing-officer-name input'
		});

		appComponents.descriptionWordCounter = new ew.components.WordCounter({
			id: 'id_description',
			limit: 600
		});

		//when the details are shown tell addContributors to focus on the first element
		//and tell it to update the remove button position
		appComponents.toggleContributors.events.showDetails.subscribe( function(){

			appComponents.addContributors.focusOnFirstNameInput();
			appComponents.addContributors.updateCloseButton();
		} );
	};
}());