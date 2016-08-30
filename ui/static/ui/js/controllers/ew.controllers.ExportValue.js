ew.controllers.ExportValue = (function(){
	
	function errorMessage( param ){

		return ( param  + ' is required for ExportValueController' );
	}

	function ExportValueController( toggleExport, calculateExport, calculateNonExport ){

		if( !toggleExport ){ throw new Error( errorMessage( 'toggleExport' ) ); }
		if( !calculateExport ){ throw new Error( errorMessage( 'calculateExport' ) ); }
		if( !calculateNonExport ){ throw new Error( errorMessage( 'calculateNonExport' ) ); }

		toggleExport.events.hideExport.subscribe( function(){

			calculateExport.resetValues();
		} );

		toggleExport.events.hideNonExport.subscribe( function(){

			calculateNonExport.resetValues();
		} );
	}

	return ExportValueController;

}());