var ew = {
	application: {
		components: {}
	}
};
ew.pages = {};
ew.components = {};
ew.components.AddContributors = (function(){
	
	function AddContributorsComponent( opts ){

		if( !opts ){ throw new Error( 'opts are required to create AddContributorsComponent' ); }
		if( !opts.$addButton ){ throw new Error( '$addButton is required for AddContributorsComponent' ); }
		if( !opts.$contributors ){ throw new Error( '$contributors is required for AddContributorsComponent' ); }

		this.$contributors = opts.$contributors;
		this.$addButton = opts.$addButton;

		this.shownContributors = 0;
		this.contributorsLength = this.$contributors.length;

		this.$addButton.on( 'click', $.proxy( this.addContributor, this ) );

		this.hideContributingLines();
	}

	AddContributorsComponent.prototype.hideContributingLines = function(){

		this.$contributors.hide();
		$( this.$contributors[ 0 ] ).show();
	};

	AddContributorsComponent.prototype.addContributor = function( e ){

		var $currentContributor;

		e.preventDefault();

		if( this.shownContributors < this.contributorsLength ){

			this.shownContributors++;
			$currentContributor = $( this.$contributors[ this.shownContributors ] );
			$currentContributor.show();
			$currentContributor.find( '.contributing-officer-name input' ).focus();

			if( this.shownContributors === ( this.contributorsLength - 1 ) ){

				this.$addButton[ 0 ].disabled = true;
			}
		}
	};

	return AddContributorsComponent;
}());
ew.components.ToggleContributors = (function(){
	
	function ToggleContributorsComponent( opts ){

		if( !opts ){ throw new Error( 'opts is required for ToggleContributorsComponent' ); }
		if( !opts.$contributingTeamDetails ){ throw new Error( '$contributingTeamDetails is required for ToggleContributorsComponent' ); }
		if( !opts.$someContributors ){ throw new Error( '$someContributors is required for ToggleContributorsComponent' ); }
		if( !opts.noContributorsSelector ){ throw new Error( 'noContributorsSelector is required for ToggleContributorsComponent' ); }

		this.$contributingTeamDetails = opts.$contributingTeamDetails;
		this.$someContributors = opts.$someContributors;
		this.noContributorsSelector = opts.noContributorsSelector;

		this.checkContributingDetails();
	}

	ToggleContributorsComponent.prototype.toggleContributingDetails = function( e ){

		if( this.$someContributors[ 0 ].checked ){

			this.$contributingTeamDetails.show();

		} else {

			this.$contributingTeamDetails.hide();
		}
	};

	ToggleContributorsComponent.prototype.checkContributingDetails = function(){

		var $noContributors = $( this.noContributorsSelector );
		var proxiedToggle = $.proxy( this.toggleContributingDetails, this );

		if( !this.$someContributors[ 0 ].checked ){

			this.$contributingTeamDetails.hide();
		}

		this.$someContributors.on( 'click', proxiedToggle );
		$noContributors.on( 'click', proxiedToggle );
	};

	return ToggleContributorsComponent;
}());	
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
//# sourceMappingURL=main.js.map