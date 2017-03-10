ew.controllers.ExportValue = (function(){
	
	function errorMessage( param ){

		return ( param  + ' is required for ExportValueController' );
	}

	function ExportValueController( fields ){

		if( !fields.exportValue ){ throw new Error( errorMessage( 'fields.exportValue' ) ); }
		if( !fields.nonExportValue ){ throw new Error( errorMessage( 'fields.nonExportValue' ) ); }
		if( !fields.odiValue ){ throw new Error( errorMessage( 'fields.odiValue' ) ); }

		fields.exportValue.toggler.events.hide.subscribe( function(){

			fields.exportValue.calculator.resetValues();
		} );

		fields.nonExportValue.toggler.events.hide.subscribe( function(){

			fields.nonExportValue.calculator.resetValues();
		} );

		fields.odiValue.toggler.events.hide.subscribe( function(){

			fields.odiValue.calculator.resetValues();
		} );
	}

	return ExportValueController;
}());