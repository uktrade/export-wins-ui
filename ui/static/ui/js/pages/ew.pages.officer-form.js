ew.pages.officerForm = (function(){

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

	function createContributingTeams(){

		var teams = [];

		$( '.contributing-officer-team-group' ).each( function(){

			var $group = $( this );

			teams.push( new ew.components.UpdateSelect({
				firstSelect: $group.find( '.contributing-team-type select' )[ 0 ],
				secondSelect: $group.find( '.contributing-team select' )[ 0 ]
			}) );
		} );

		return teams;
	}

	function createNonCompleteComponents( opts, appComponents, appControllers ){

		function createExportId( val ){
			return ( opts.exportType.name + '-' + val );
		}

		appComponents.descriptionWordCounter = new ew.components.WordCounter({
			id: opts.descriptionId,
			limit: 50
		});

		appComponents.exportValue = new ew.components.ToggleExportValue({
			fieldId: createExportId( opts.exportType.exportValue ),
			contentId: opts.exportContentId
		});

		appComponents.nonExportValue = new ew.components.ToggleExportValue({
			fieldId: createExportId( opts.exportType.nonExportValue ),
			contentId: opts.nonExportContentId
		});

		appComponents.odiValue = new ew.components.ToggleExportValue({
			fieldId: createExportId( opts.exportType.odiValue ),
			contentId: opts.odiContentId
		});

		appComponents.calculateExportValue = new ew.components.CalculateExportValue({
			values: opts.exportValues,
			total: opts.exportTotal
		});

		appComponents.calculateNonExportValue = new ew.components.CalculateExportValue({
			values: opts.nonExportValues,
			total: opts.nonExportTotal
		});

		appComponents.calculateOdiValue = new ew.components.CalculateExportValue({
			values: opts.odiValues,
			total: opts.odiTotal
		});

		appControllers.exportValue = new ew.controllers.ExportValue({
			exportValue: {
				toggler: appComponents.exportValue,
				calculator: appComponents.calculateExportValue
			},
			nonExportValue: {
				toggler: appComponents.nonExportValue,
				calculator: appComponents.calculateNonExportValue
			},
			odiValue: {
				toggler: appComponents.odiValue,
				calculator: appComponents.calculateOdiValue
			}			
		});
	}

	function createComponents( opts, appComponents, appControllers ){

		appComponents.leadOfficerTeam = new ew.components.UpdateSelect({
			firstSelect: '#id_team_type',
			secondSelect: '#id_hq_team'
		});

		appComponents.contributingOfficerTeams = createContributingTeams();

		appComponents.toggleContributors = new ew.components.ToggleContributors({
			$contributingTeamDetails: $( '#contributing-teams-details' ),
			$someContributors: $( '#some-contributors' ),
			noContributorsSelector: '#no-contributors'
		});

		appComponents.addContributors = new ew.components.AddContributors({
			contributorsSelector: '.contributing-officer-group',
			nameInputSelector: '.contributing-officer-name input'
		});

		appComponents.stopWinFormSubmit = new ew.components.DisableMultiSubmit( opts.formId );

		//appComponents.toggleHvoProgram = new ew.components.ToggleContentCheckbox( opts.hvoProgram );

		appControllers.contributors = new ew.controllers.Contributors( appComponents.toggleContributors, appComponents.addContributors );

		appComponents.supportSelects = new ew.components.AddSelect( opts.supportGroup );
		appComponents.programmeSelects = new ew.components.AddSelect( opts.programmeGroup );

		appComponents.contactEmailCleaner = new ew.components.CleanPastedInput( $( '#id_customer_email_address' ) );
		appComponents.leadOfficerEmailCleaner = new ew.components.CleanPastedInput( $( '#id_lead_officer_email_address' ) );
		appComponents.secondaryEmailCleaner = new ew.components.CleanPastedInput( $( '#id_other_official_email_address' ) );
	}

	function errorMessage( field ){
		return ( field + ' is required for officerFormPage' );
	}

	function removeCountry( opts ){

		var $options;

		if( opts.value !== opts.remove ){

			$options = $( '#' + opts.id + ' option' );
			$options.each( function( i, option ){

				if( option.value === opts.remove ){

					$( option ).remove();
					return false;
				}
			} );
		}
	}

	return function officerFormPage( opts ){

		//alert( 'officer page start' );

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }

		if( typeof opts.isComplete === 'undefined' ){ throw new Error( errorMessage( 'opts.isComplete' ) ); }
		
		if( !opts.formId ){ throw new Error( errorMessage( 'opts.formId' ) ); }
		if( !opts.supportGroup ){ throw new Error( errorMessage( 'opts.supportGroup' ) ); }
		if( !opts.programmeGroup ){ throw new Error( errorMessage( 'opts.programmeGroup' ) ); }

		if( !opts.isComplete ){

			if( !opts.descriptionId ){ throw new Error( errorMessage( 'opts.descriptionId' ) ); }

			if( !opts.exportType ){ throw new Error( errorMessage( 'opts.exportType' ) ); }
			if( !opts.exportType.name ){ throw new Error( errorMessage( 'opts.exportType.name' ) ); }
			if( !opts.exportType.exportValue ){ throw new Error( errorMessage( 'opts.exportType.exportValue' ) ); }
			if( !opts.exportType.nonExportValue ){ throw new Error( errorMessage( 'opts.exportType.nonExportValue' ) ); }
			if( !opts.exportType.odiValue ){ throw new Error( errorMessage( 'opts.exportType.odiValue' ) ); }

			if( !opts.exportContentId ){ throw new Error( errorMessage( 'opts.exportContentId' ) ); }
			if( !opts.nonExportContentId ){ throw new Error( errorMessage( 'opts.nonExportContentId' ) ); }

			if( !opts.exportValues || !opts.exportValues.length ){ throw new Error( errorMessage( 'opts.exportValue' ) ); }
			if( !opts.exportTotal ){ throw new Error( errorMessage( 'opts.exportTotal' ) ); }

			if( !opts.nonExportValues || !opts.nonExportValues.length ){ throw new Error( errorMessage( 'opts.nonExportValues' ) ); }
			if( !opts.nonExportTotal ){ throw new Error( errorMessage( 'opts.nonExportTotal' ) ); }

			if( opts.country ){
				removeCountry( opts.country );
			}
		}

		//alert( 'officer page ok' );
		
		var app = ew.application;
		var appComponents = app.components;
		var appControllers = app.controllers;

		createComponents( opts, appComponents, appControllers );

		if( !opts.isComplete ){

			createNonCompleteComponents( opts, appComponents, appControllers );
		}
	};
}());