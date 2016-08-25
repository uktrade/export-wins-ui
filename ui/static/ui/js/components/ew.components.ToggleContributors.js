ew.components.ToggleContributors = (function( $ ){

	function errorMessage( field ){
		return ( field + ' is required for ToggleContributorsComponent' );
	}
	
	function ToggleContributorsComponent( opts ){

		if( !opts ){ throw new Error( errorMessage( 'opts' ) ); }
		if( !opts.$contributingTeamDetails ){ throw new Error( errorMessage( 'opts.$contributingTeamDetails' ) ); }
		if( !opts.$someContributors ){ throw new Error( errorMessage( 'opts.$someContributors' ) ); }
		if( !opts.noContributorsSelector ){ throw new Error( errorMessage( 'opts.noContributorsSelector' ) ); }

		this.$contributingTeamDetails = opts.$contributingTeamDetails;
		this.$someContributors = opts.$someContributors;
		this.noContributorsSelector = opts.noContributorsSelector;

		this.events = {
			showDetails: new ew.CustomEvent()
		};

		this.checkContributingDetails();
		this.createListeners();
	}

	ToggleContributorsComponent.prototype.toggleContributingDetails = function( e ){

		if( this.$someContributors[ 0 ].checked ){

			this.$contributingTeamDetails.show();
			this.events.showDetails.publish();

		} else {

			this.$contributingTeamDetails.hide();
		}
	};

	ToggleContributorsComponent.prototype.createListeners = function(){
		
		var $noContributors = $( this.noContributorsSelector );
		var proxiedToggle = $.proxy( this.toggleContributingDetails, this );

		this.$someContributors.on( 'click', proxiedToggle );
		$noContributors.on( 'click', proxiedToggle );
	};

	ToggleContributorsComponent.prototype.checkContributingDetails = function(){

		if( !this.$someContributors[ 0 ].checked ){

			this.$contributingTeamDetails.hide();
		}
	};

	return ToggleContributorsComponent;

}( jQuery ));	