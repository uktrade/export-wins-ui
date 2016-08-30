ew.controllers.Contributors = (function(){

	function errorMessage( param ){

		return ( param + ' is a required parameter for ContributorsController' );
	}
	
	function ContributorsController( toggleContributors, addContributors ){

		if( !toggleContributors ){ throw new Error( errorMessage( 'toggleContributors' ) ); }
		if( !addContributors ){ throw new Error( errorMessage( 'addContributors' ) ); }

		//when the details are shown tell addContributors to focus on the first element
		//and tell it to update the remove button position
		toggleContributors.events.showDetails.subscribe( function(){

			addContributors.focusOnFirstNameInput();
			addContributors.updateCloseButton();
		} );

		toggleContributors.events.hideDetails.subscribe( function(){

			addContributors.resetAll();
		} );
	}

	return ContributorsController;
	
}());