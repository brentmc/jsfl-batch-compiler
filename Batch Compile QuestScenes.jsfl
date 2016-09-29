
// log file...
var logURI = "";
var errorsURI = "";
var successLog = "";
var failedURI = "";

//If all FLAs were published correctly
var success = true; 
var proceed = true;

//We won't process anything inside a folder if its name can be found in the following blacklist Array
var blacklistedFolderNamesAr 	= [];
blacklistedFolderNamesAr.push("as");
blacklistedFolderNamesAr.push("assets");
blacklistedFolderNamesAr.push("fonts");
blacklistedFolderNamesAr.push("html-tests");
blacklistedFolderNamesAr.push("lp-compile-jsfl");
blacklistedFolderNamesAr.push("sfx");
blacklistedFolderNamesAr.push("targets");
blacklistedFolderNamesAr.push("thirdparty");
blacklistedFolderNamesAr.push("raw");
blacklistedFolderNamesAr.push("template");
blacklistedFolderNamesAr.push("wordflip");
blacklistedFolderNamesAr.push("wordmania");
blacklistedFolderNamesAr.push("bookpages");
blacklistedFolderNamesAr.push("quest");
blacklistedFolderNamesAr.push("questcards");
//blacklistedFolderNamesAr.push("questscenes");
blacklistedFolderNamesAr.push("compreextracts");
blacklistedFolderNamesAr.push("thumbs");



//We won't publish any files if its name can be found in the following blacklist Array
var blacklistedFileNamesAr		= [];
blacklistedFileNamesAr.push("AuthortimeSharedAssets.fla");
blacklistedFileNamesAr.push("penpenlevelguide.fla");
blacklistedFileNamesAr.push("turtleknockguide.fla");
blacklistedFileNamesAr.push("koalalaunch.fla");

 
if(proceed){  	
		
	//Prompts the user to select the folder to process then opens all the files in that folder
	var folderURI = fl.browseForFolderURL("Select your project's parent directory:");
	 
	// external logs...
	logURI 		= folderURI + "batchPublishLog.txt";		//This is where the publish og will be saved
	errorsURI 	= folderURI + "errors.txt";					//This is where the error log will be saved
 
	createLog();
	createErrorCheck();
 
	//Processes all of the FLAs and subfolders of this folder. Returns true if successful.
	var allSuccessful = publishFilesInThisFolder(folderURI);
 
	fl.trace("----------------------\n------ Results -------\n----------------------\n");
	fl.trace(successLog);

	if(allSuccessful){				
		fl.trace("-------------------------\n--- Publish Succeeded ---\n-------------------------");
		alert("Batch Publish Succeeded!");
	}else{
		fl.trace("FAILED AT : " + failedURI + "!");
		fl.trace("\n----------------------\n--- PUBLISH FAILED ---\n----------------------");
		alert("BATCH PUBLISH FAILED!");
	}
}

/**
 * Publishes all FLAs in the given folder and all of its subfolders.
 */
function publishFilesInThisFolder(folderURI)
{	
	var indexOfLastBackslash = folderURI.lastIndexOf("/");
	
	if(indexOfLastBackslash != -1){
		var shortFolderName = folderURI.substring(indexOfLastBackslash + 1, folderURI.length);

		//Don't process this folder if it is a hidden folder
		if(shortFolderName.charAt(0) != "."){
			
			//don't process this folder if it is in the folder blacklist
			if(blacklistedFolderNamesAr.indexOf(shortFolderName) == -1){
				var fileURI;
				var shortFileName;																	// e.g. arena-lobby.fla						
				var fileExtension;																	// e.g. arena-lobby.fla -> .fla
				var fileMask = "*.fla";																//Only files that contain this mask will be considered
				var filesInThisFolderAr = FLfile.listFolder(folderURI + "/" + fileMask, "files");	
				var numFilesinThisFolder = filesInThisFolderAr.length;

				for(var i = 0; i < numFilesinThisFolder; i++){
		 			shortFileName = filesInThisFolderAr[i]; 
					
					//If this file is not a hidden file and is not a blacklisted files
					if(shortFileName.charAt(0) != "." && blacklistedFileNamesAr.indexOf(shortFileName) == -1){
					
						fileURI = folderURI + "/" + shortFileName;

						fl.openDocument(fileURI);
						var DOM = fl.getDocumentDOM();
						var publishSuccess = publish(DOM, logURI);

						if(!publishSuccess){
							alert("Failed to publish " + shortFileName + "!");
							fl.trace("Failed to publish " + shortFileName + "!\n  Checking the errors.txt log for more details...\n\n" + FLfile.read(errorsURI) + "\n-------------------------------------------------------------------\n");
							failedURI = fileURI;
							return false;
							break;
						}
						successLog += ("published : " + shortFileName + "\n");
						DOM.close(false);	//false tells it to not prompt the user to save changes
					}
				} 

				var foldersInThisFolderAr = FLfile.listFolder(folderURI, "directories");
				var numOfFoldersInThisFolder = foldersInThisFolderAr.length;
				var allSubfoldersSuccess = true;
				for(var j = 0; j < numOfFoldersInThisFolder; j++){
					allSubfoldersSuccess = publishFilesInThisFolder(folderURI + "/" + foldersInThisFolderAr[j]);
					if(! allSubfoldersSuccess){
						return false;
					}
				}
			}
		}
	}
	return true;
}
 
function publish(DOM, logURI){
	var success = true;
	if(DOM){
		DOM.publish();
		log(DOM.docClass+" results :\n\t");
		fl.outputPanel.save(logURI,true);
		fl.compilerErrors.save(logURI,true);
		logCompileErrors();
		log("\n");
	}else{
		fl.trace("publish() dom does NOT exist");
		success = false;
	}
 
 	var errorLog = FLfile.read(errorsURI);
 	if(errorLog != "" && errorLog.indexOf("0 Error(s)") == -1){ 
		fl.trace("publish() found some errors");	
		success = false;
	} 

	return success;
}
 
function createErrorCheck(){
	FLfile.write(errorsURI, "");
}
function logCompileErrors(){
	fl.compilerErrors.save(errorsURI);
}
 
function createLog(){
	FLfile.write(logURI, "Compile Log...\n");
}
 
function log(message){
	FLfile.write(logURI, message, "append");
}