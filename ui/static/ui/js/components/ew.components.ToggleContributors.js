ew.components.ToggleContributors = (function( $ ){
	
	function ToggleContributorsComponent( opts ){

		if( !opts ){ throw new Error( 'opts is required for ToggleContributorsComponent' ); }
		if( !opts.$contributingTeamDetails ){ throw new Error( '$contributingTeamDetails is required for ToggleContributorsComponent' ); }
		if( !opts.$someContributors ){ throw new Error( '$someContributors is required for ToggleContributorsComponent' ); }
		if( !opts.noContributorsSelector ){ throw new Error( 'noContributorsSelector is required for ToggleContributorsComponent' ); }

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