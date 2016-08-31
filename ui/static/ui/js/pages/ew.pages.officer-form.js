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
		var $selectElem = $( selectElem );

		$( '#id_team_type' ).on( 'change', function(){

			var type = $( this ).val();
			var $typeValues;
			var $selectOptions = $( selectOptions );

			if( type ){

				$typeValues = $( '#id_hq_team option[value^=' + type + ']' );

				$selectOptions.addClass( HIDDEN_CLASS );
				$typeValues.removeClass( HIDDEN_CLASS );
				$( $selectOptions[ 0 ] ).removeClass( HIDDEN_CLASS );

			} else {

				$selectOptions.removeClass( HIDDEN_CLASS );
			}

			$selectElem[ 0 ].selectedIndex = 0;
		});
	}

	function contributingOfficerTeamTypeChange(){

		$( '.contributing-officer-team-group .contributing-team-type select' ).on( 'change', function(){

			var $teamType = $( this );
			var chosenType = $teamType.val();
			var $team = $teamType.closest( '.row' ).find( '.contributing-team select' );
			var $chosenTeam;
			var $teamOptions = $team.find( 'option' );

			if( chosenType ){

				$chosenTeam = $team.find( 'option[value^=' + chosenType + ']' );
				//$team.val( $chosenTeam.first().val() );
				$teamOptions.addClass( HIDDEN_CLASS );
				$chosenTeam.removeClass( HIDDEN_CLASS );
				$( $teamOptions[ 0 ] ).removeClass( HIDDEN_CLASS );

			} else {

				$teamOptions.removeClass( HIDDEN_CLASS );
			}
			$team[ 0 ].selectedIndex = 0;
		});
	}

	function createNonCompleteComponents( opts, appComponents, appControllers ){

		appComponents.descriptionWordCounter = new ew.components.WordCounter({
			id: opts.descriptionId,
			limit: 50
		});

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

		appControllers.exportValue = new ew.controllers.ExportValue(
			appComponents.exportValues,
			appComponents.calculateExportValue,
			appComponents.calculateNonExportValue
		);
	}

	function createComponents( opts, appComponents, appControllers ){

		appComponents.toggleContributors = new ew.components.ToggleContributors({
			$contributingTeamDetails: $( '#contributing-teams-details' ),
			$someContributors: $( '#some-contributors' ),
			noContributorsSelector: '#no-contributors'
		});

		appComponents.addContributors = new ew.components.AddContributors({
			contributorsSelector: '.contributing-officer-group',
			nameInputSelector: '.contributing-officer-name input'
		});

		//appComponents.toggleHvoProgram = new ew.components.ToggleContentCheckbox( opts.hvoProgram );

		appControllers.contributors = new ew.controllers.Contributors( appComponents.toggleContributors, appComponents.addContributors );

		appComponents.supportSelects = new ew.components.AddSelect( opts.supportGroup );
		appComponents.programmeSelects = new ew.components.AddSelect( opts.programmeGroup );
	}

	function errorMessage( field ){
		return ( field + ' is required for officerFormPage' );
	}

	return function officerFormPage( opts ){

		//alert( 'officer page start' );

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }

		if( typeof opts.isComplete === 'undefined' ){ throw new Error( errorMessage( 'opts.isComplete' ) ); }
		
		if( !opts.supportGroup ){ throw new Error( errorMessage( 'opts.supportGroup' ) ); }
		if( !opts.programmeGroup ){ throw new Error( errorMessage( 'opts.programmeGroup' ) ); }

		if( !opts.isComplete ){

			if( !opts.descriptionId ){ throw new Error( errorMessage( 'opts.descriptionId' ) ); }

			if( !opts.exportType ){ throw new Error( errorMessage( 'opts.exportType' ) ); }
			if( !opts.exportType.name ){ throw new Error( errorMessage( 'opts.exportType.name' ) ); }
			if( !opts.exportType.exportValue ){ throw new Error( errorMessage( 'opts.exportType.exportValue' ) ); }
			if( !opts.exportType.nonExportValue ){ throw new Error( errorMessage( 'opts.exportType.nonExportValue' ) ); }
			if( !opts.exportType.bothValue ){ throw new Error( errorMessage( 'opts.exportType.bothValue' ) ); }

			if( !opts.exportContentId ){ throw new Error( errorMessage( 'opts.exportContentId' ) ); }
			if( !opts.nonExportContentId ){ throw new Error( errorMessage( 'opts.nonExportContentId' ) ); }

			if( !opts.exportValues || !opts.exportValues.length ){ throw new Error( errorMessage( 'opts.exportValue' ) ); }
			if( !opts.exportTotal ){ throw new Error( errorMessage( 'opts.exportTotal' ) ); }

			if( !opts.nonExportValues || !opts.nonExportValues.length ){ throw new Error( errorMessage( 'opts.nonExportValues' ) ); }
			if( !opts.nonExportTotal ){ throw new Error( errorMessage( 'opts.nonExportTotal' ) ); }
		}

		//alert( 'officer page ok' );
		
		var app = ew.application;
		var appComponents = app.components;
		var appControllers = app.controllers;

		leadOfficerTeamTypeChange();
		contributingOfficerTeamTypeChange();
		createComponents( opts, appComponents, appControllers );

		if( !opts.isComplete ){

			createNonCompleteComponents( opts, appComponents, appControllers );
		}
	};
}());