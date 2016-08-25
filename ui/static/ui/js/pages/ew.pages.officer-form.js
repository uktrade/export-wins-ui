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

		var selectElem = '#id_hq_team';
		var selectOptions = selectElem + ' option';

		$( '#id_team_type' ).on( 'change', function(){

			var type = $( this ).val();
			var $typeValues;

			if( type ){

				$typeValues = $( '#id_hq_team option[value^=' + type + ']' );

				$( selectOptions ).addClass( HIDDEN_CLASS );
				$typeValues.removeClass( HIDDEN_CLASS );
				$( selectElem ).val( $typeValues.first().val() );

			} else {

				$( selectOptions ).removeClass( HIDDEN_CLASS );
				$( selectElem )[ 0 ].selectedIndex = 0;
			}
		});
	}

	function contributingOfficerTeamTypeChange(){

		$( '.contributing-officer-team-group .contributing-team-type select' ).on( 'change', function(){

			var $teamType = $( this );
			var chosenType = $teamType.val();
			var $team = $teamType.closest( '.row' ).find( '.contributing-team select' );
			var $chosenTeam;

			if( chosenType ){

				$chosenTeam = $team.find( 'option[value^=' + chosenType + ']' );
				$team.val( $chosenTeam.first().val() );
				$team.find( 'option' ).addClass( HIDDEN_CLASS );
				$chosenTeam.removeClass( HIDDEN_CLASS );

			} else {

				$team.find( 'option' ).removeClass( HIDDEN_CLASS );
				$team[ 0 ].selectedIndex = 0;
			}
		});
	}

	function errorMesage( field ){
		return ( field + ' is required for officerFormPage' );
	}

	function createNonCompleteComponents( opts, appComponents ){

		//appComponents.descriptionWordCounter = new ew.components.WordCounter({
		//	id: opts.descriptionId,
		//	limit: 600
		//});

		appComponents.exportValues = new ew.components.ToggleExportValue({
			fieldName: opts.exportType.name,
			exportValue: opts.exportType.exportValue,
			nonExportValue: opts.exportType.nonExportValue,
			bothValue: opts.exportType.bothValue,
			exportId: opts.exportContentId,
			nonExportId: opts.nonExportContentId
		});

		appComponents.calculateExportValue = new ew.components.CalculateExportValue({
			values: opts.exportValues,
			total: opts.exportTotal
		});

		appComponents.calculateNonExportValue = new ew.components.CalculateExportValue({
			values: opts.nonExportValues,
			total: opts.nonExportTotal
		});
	}

	function createComponents( opts, appComponents ){

		appComponents.toggleContributors = new ew.components.ToggleContributors({
			$contributingTeamDetails: $( '#contributing-teams-details' ),
			$someContributors: $( '#some-contributors' ),
			noContributorsSelector: '#no-contributors'
		});

		appComponents.addContributors = new ew.components.AddContributors({
			contributorsSelector: '.contributing-officer-group',
			nameInputSelector: '.contributing-officer-name input'
		});

		//when the details are shown tell addContributors to focus on the first element
		//and tell it to update the remove button position
		appComponents.toggleContributors.events.showDetails.subscribe( function(){

			appComponents.addContributors.focusOnFirstNameInput();
			appComponents.addContributors.updateCloseButton();
		} );
	}

	return function officerFormPage( opts ){

		if( !opts ){ throw new Error( errorMesage( 'opts' ) ); }

		if( typeof opts.complete === 'undefined' ){ throw new Error( errorMesage( 'opts.complete' ) ); }

		if( !opts.complete ){

			if( !opts.descriptionId ){ throw new Error( errorMesage( 'opts.descriptionId' ) ); }

			if( !opts.exportType ){ throw new Error( errorMesage( 'opts.exportType' ) ); }
			if( !opts.exportType.name ){ throw new Error( errorMesage( 'opts.exportType.name' ) ); }
			if( !opts.exportType.exportValue ){ throw new Error( errorMesage( 'opts.exportType.exportValue' ) ); }
			if( !opts.exportType.nonExportValue ){ throw new Error( errorMesage( 'opts.exportType.nonExportValue' ) ); }
			if( !opts.exportType.bothValue ){ throw new Error( errorMesage( 'opts.exportType.bothValue' ) ); }

			if( !opts.exportContentId ){ throw new Error( errorMesage( 'opts.exportContentId' ) ); }
			if( !opts.nonExportContentId ){ throw new Error( errorMesage( 'opts.nonExportContentId' ) ); }

			if( !opts.exportValues || !opts.exportValues.length ){ throw new Error( errorMesage( 'opts.exportValue' ) ); }
			if( !opts.exportTotal ){ throw new Error( errorMesage( 'opts.exportTotal' ) ); }

			if( !opts.nonExportValues || !opts.nonExportValues.length ){ throw new Error( errorMesage( 'opts.nonExportValues' ) ); }
			if( !opts.nonExportTotal ){ throw new Error( errorMesage( 'opts.nonExportTotal' ) ); }
		}
		
		var app = ew.application;
		var appComponents = app.components;

		leadOfficerTeamTypeChange();
		contributingOfficerTeamTypeChange();
		createComponents( opts, appComponents );

		if( !opts.complete ){

			createNonCompleteComponents( opts, appComponents );
		}
	};
}());