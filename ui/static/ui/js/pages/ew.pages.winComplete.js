ew.pages.winComplete = function winComplete( formId ){

	ew.application.components.stopWinCompleteForm = new ew.components.DisableMultiSubmit( formId, 'Sending win...' );
};