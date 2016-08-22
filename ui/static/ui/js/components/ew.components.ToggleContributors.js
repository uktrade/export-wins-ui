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