let apiAddress = "https://0vfs3p8qyj.execute-api.us-east-1.amazonaws.com/default/noteapi"
		let sessionUsername = "" 


		document.getElementById("searchText").addEventListener("keyup", function(event) {
		  // Number 13 is the "Enter" key on the keyboard
		  if (event.keyCode === 13) {
		    // Cancel the default action, if needed
		    event.preventDefault();
		    // Trigger the button element with a click
		    document.getElementById("searchTextButton").click();
		  }
		});

		document.getElementById("idToShow").addEventListener("keyup", function(event) {
		  // Number 13 is the "Enter" key on the keyboard
		  if (event.keyCode === 13) {
		    // Cancel the default action, if needed
		    event.preventDefault();
		    // Trigger the button element with a click
		    document.getElementById("idToShowButton").click();
		  }
		});

		document.getElementById("idToEdit").addEventListener("keyup", function(event) {
		  // Number 13 is the "Enter" key on the keyboard
		  if (event.keyCode === 13) {
		    // Cancel the default action, if needed
		    event.preventDefault();
		    // Trigger the button element with a click
		    document.getElementById("idToEditButton").click();
		  }
		});		

		document.getElementById("usernameInput").addEventListener("keyup", function(event) {
		  // Number 13 is the "Enter" key on the keyboard
		  if (event.keyCode === 13) {
		    // Cancel the default action, if needed
		    event.preventDefault();
		    // Trigger the button element with a click
		    document.getElementById("usernameButton").click();
		  }
		});

		document.getElementById("ldssToShow").addEventListener("keyup", function(event) {
		  // Number 13 is the "Enter" key on the keyboard
		  if (event.keyCode === 13) {
		    // Cancel the default action, if needed
		    event.preventDefault();
		    // Trigger the button element with a click
		    document.getElementById("showLdss").click();
		  }
		});


		function showLdss(){
			var searchText = document.getElementById("ldssToShow").value;
			var data = JSON.stringify({"action":"showLdss", "searchText":searchText});

			document.getElementById("scripture").innerHTML = searchText

			sendRequest(data).then(function(response){

				if(isJSON(response)){
					var response = JSON.parse(response);
				  	document.getElementById("commentDiv").style.visibility = "visible";	
				  	document.getElementById("ldssArea").innerHTML = response["name"] + "\n\n"+ response["content"]		
				  	document.getElementById("ldssCommentArea").innerHTML = response["comments"]			

				} 
				else {
					var response = JSON.parse(response);
					document.getElementById("commentDiv").style.visibility = "hidden";
					document.getElementById("ldssArea").innerHTML = response		
				  	document.getElementById("ldssCommentArea").innerHTML = ""
				}	
				
			}, function(rej){
				console.log(rej);
			})
		}


		function commentOnLdss(){
			let scripture = document.getElementById("scripture").innerHTML
			let comment = document.getElementById("ldssComment").value
			var data = JSON.stringify({"action":"commentOnLdss", "scripture":scripture, "comment":comment, "user":sessionUsername})

			if(sessionUsername == ""){
				alert("Must be logged in to create notes");
				return;
			}

			if(comment == ""){
				alert("Please enter a comment");
				return;
			}


			sendRequest(data).then(function(response){
				alert(response);
				document.getElementById("ldssComment").value = "";
				document.getElementById("ldssToShow").value = document.getElementById("scripture").innerHTML;
				showLdss();
			}, function(rej){
				console.log(rej);
			})
		}



		function showAllTags(){
			document.getElementById("tag").checked=true;

			var data = JSON.stringify({"user": sessionUsername, "action":"getTags"});

			sendRequest(data).then(function(response){
			  	if(isJSON(response)){
				  	var json = JSON.parse(response);
				  	var searchResults = getShowAllTagResults(json);
				
					document.getElementById("searchResults").innerHTML = searchResults;
				} 
				else {
					document.getElementById("searchResults").innerHTML = "No results found";
				}				
			}, function(rej){
				console.log(rej);
			})
		}		

		function searchForNote(){
			var searchText = document.getElementById("searchText").value.trim();

			if(document.getElementById("tag").checked)
				searchByTag(searchText);
			else 
				searchByText(searchText);
		}

		function searchByTag(text){
			var data = JSON.stringify({"tag": text, "user": sessionUsername, "action":"searchByTag"});

			sendRequest(data).then(function(response){
			  	if(isJSON(response)){

				  	var json = JSON.parse(response);
				  	var searchResults = getSearchByTagResults(json);
				  	
					document.getElementById("searchResults").innerHTML = searchResults;
				}
				else{
					document.getElementById("searchResults").innerHTML = "No results found";
				}				
			}, function(rej){
				console.log(rej);
			})
		}

		function searchByText(text){
			var data = JSON.stringify({"text": text, "user": sessionUsername, "action":"searchByText"});

			sendRequest(data).then(function(response){
			  	if(isJSON(response)){

				  	var json = JSON.parse(response);
				  	var searchResults = getSearchByTextResults(json, text);
				  	
					document.getElementById("searchResults").innerHTML = searchResults;
				}
				else{
					document.getElementById("searchResults").innerHTML = "No results found";
				}				
			}, function(rej){
				console.log(rej);
			})
		}

		function getSearchByTagResults(json){
			var result = 'Results: <br>';

			for(var i=0; i < json.length; i++){
				var title = json[i][3];
			  	result += "<b><a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\">"+json[i][0] + "</a>: " + " "+title+"</b><br><i>&nbsp;&nbsp;&nbsp;" + 
				json[i][1].substring(0, 100) + "</i><br>";

			}
			return result;
		}

		function getShowAllTagResults(json){
			var result = 'Results: <br>';
			var keys = Object.keys(json).sort()
			for(var i=0; i < keys.length; i++){
			  	result += "<a href=\"#\" onclick=\"showTagFromSearchResults(this);return false;\">"+keys[i] + "</a> " + " ("+json[keys[i]]+")<br>";
			}
			return result;
		}


		function getSearchByTextResults(json, text){
			var result = 'Results: <br>';
			var resultDict = {};
			var textDict = {};
			var titleDict = {};

			for(var i=0; i < json.length; i++){
					var count = (json[i][1].toLowerCase().match(new RegExp(text.toLowerCase(), "g")) || []).length;
					resultDict[json[i][0]]=count;			
					textDict[json[i][0]] = json[i][1].replace(new RegExp(text, 'gi'), (match) => "<b>"+match+"</b>"); 
					titleDict[json[i][0]] = json[i][3].replace();	 
			}

			var items = Object.keys(resultDict).map(function(key) {
			  return [key, resultDict[key]];
			});
			items.sort(function(first, second) {
			  return second[1] - first[1];
			});

			for(var i=0; i < items.length; i++){
				let index=textDict[items[i][0]].toLowerCase().indexOf(text.toLowerCase())
				textSize = textDict[items[i][0]].length

			  	var nextResult = "<b><a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\">"+items[i][0] + "</a>: " + titleDict[items[i][0]] + " "
			  	 + " ("+items[i][1] + " hits)</b><br><i>&nbsp;&nbsp;&nbsp;"
			  	 + textDict[items[i][0]].substring(Math.max(index-50, 0), Math.min(index+50, textSize)) + "</i><br>";		

			  	if((nextResult.match(/<b>/g) || []).length != (nextResult.match(/<\/b>/g) || []).length)
					nextResult += "</b>";
				if((nextResult.match(/<</g) || []).length > 0)
					console.log("HERE")
				nextResult = nextResult.replace("<<", "<")

				result += nextResult;		  	 
			}


			return result;
		}


		function showTagFromSearchResults(element){
			const tag = element.innerHTML;
			document.getElementById("searchText").value = tag
			document.getElementById("tag").checked=true;
			searchByTag(tag);
		}


		function showNoteFromSearchResults(element){
			document.getElementById("idToShow").value = element.innerHTML;
			showNote();

		}


		function isJSON(text){
			if (typeof text !== "string") { 
                return false; 
            } 
            try { 
                JSON.parse(text); 
                return true; 
            } catch (error) { 
                return false; 
            } 
		}

		function showNote(){
			id = document.getElementById("idToShow").value.trim();

			var data = JSON.stringify({"id": id, "user": sessionUsername, "action":"searchById"});

			sendRequest(data).then(function(response){
			  	if(isJSON(response)){
				  	var json = JSON.parse(response);
				
     				var html = convertMDToHTML(json["body"]);
     				var tagText = convertTagsToHTML(json["tags"].split(", "));
     				var title = convertMDToHTML(json["title"]);

					if(document.getElementById("onlyShowNote").checked || document.getElementById("noteArea").innerHTML == ""){
						document.getElementById("noteArea").innerHTML = id + "\n\n"+ title + "\n" + html + "\n\nTags: " + tagText;
						document.getElementById("editShownNote").style = "visibility:visible;"
					}
					else{
						document.getElementById("noteArea").innerHTML += "<br><br><br><hr><br><br>" + id + "\n\n" + html + "\n\nTags: " + tagText;
						document.getElementById("editShownNote").style = "visibility:hidden;"
					}
				} 
				else {
					document.getElementById("noteArea").innerHTML = "No results found";
				}
			}, function(rej){
				console.log(rej);
			})
		}


		function convertMDToHTML(md){
			converter = new showdown.Converter({extensions: ['table']});
     		html = converter.makeHtml(md);
     		html = html.replace(/[0-9]{8}[a-z]+/g, (match) => "<a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\">"+match+"</a>");
     		return html;
		}


		function convertTagsToHTML(tags){
     		var tagText = "";
     		for(var i=0; i<tags.length; i++){
     			var trailingText = "</a>, ";
     			if(i == tags.length-1)
     				trailingText = "</a>";
     				tagText += "<a href=\"#\" onclick=\"searchByShownTag(this);return false;\">" + tags[i] + trailingText;
     			}			
     		return tagText;
		}


		function editShownNote(){
			document.getElementById("idToEdit").value = document.getElementById("idToShow").value;
			document.getElementById("submitCreate").style = "visibility: hidden";
			editNote();
		}


		function searchByShownTag(element){
			document.getElementById("tag").checked = true;
			document.getElementById("searchText").value = element.innerHTML;
			searchForNote();
		}

		async function editNote(){
			document.getElementById("editRadio").checked=true;
			id = document.getElementById("idToEdit").value.trim();

			var data = JSON.stringify({"id": id, "user": sessionUsername, "action":"searchById"});
			var data_permissions = JSON.stringify({"id": id, "user": sessionUsername, "action":"getPermissions"});
			var permissions = await sendRequest(data_permissions);

			sendRequest(data).then(function(response){
				if(isJSON(response)){
				  	var json = JSON.parse(response);
				  	var noteEditAreaText = "";
				  	var tagEditAreaText = "";
				  	var titleEditAreaText = "";
				  	

				  	if(permissions == 'e'){
				  		noteEditAreaText = json["body"];
				  		tagEditAreaText = json["tags"];
				  		titleEditAreaText = json["title"];
				  		document.getElementById("bodyEditDiv").innerHTML = "Body";
				  		document.getElementById("tagEditDiv").innerHTML = "Tags";
				  	}
				  	else if(permissions == 'a'){
				  		document.getElementById("bodyEditDiv").innerHTML = "Body (you did not create this note, can only append)";
				  		document.getElementById("tagEditDiv").innerHTML = "Tags (you did not create this note, can only append)";
				  	}

				  	showNoteToEdit(titleEditAreaText, noteEditAreaText, tagEditAreaText);

				} 
				else {
					showEdit()
					document.getElementById("editResponse").style = "display: block";
					document.getElementById("editResponse").innerHTML = "No results found";
				}
			}, function(rej){
				console.log(rej);
			})
		}


		function showNoteToEdit(titleEditAreaText, noteEditAreaText, tagEditAreaText){
			document.getElementById("editResponse").innerHTML = "";
			document.getElementById("editResponse").style = "display: none";
			document.getElementById("editDiv").style="visibility:visible";
			document.getElementById("submitEdit").style="visibility:visible"
			document.getElementById("titleEditArea").value = titleEditAreaText;
			document.getElementById("noteEditArea").value = noteEditAreaText;
			document.getElementById("tagEditArea").value = tagEditAreaText;
			document.getElementById("publicPrivate").style="visibility:hidden";

		}


		function submitEdit(){
			if(confirm("Are you sure you want to submit this edit?")){
				newText = document.getElementById("noteEditArea").value;
				newTags = document.getElementById("tagEditArea").value;
				id = document.getElementById("idToEdit").value.trim();

				if(newText.length == 0 || newTags.length == 0){
					if(!confirm("Are you sure you want to submit with empty text?"))
						return;
				}

				var data = JSON.stringify({"id": id, "body":newText, "tags":newTags, "user": sessionUsername, "action":"edit"});

				sendRequest(data).then(function(response){
					document.getElementById("editDiv").style="visibility:hidden";
					document.getElementById("submitEdit").style="visibility:hidden";
				  	document.getElementById("editResponse").style="display: block";
				  	document.getElementById("editResponse").innerHTML=response;
				}, function(rej){
					console.log(reg);
				})

			}
		}

		function showEdit(){
			document.getElementById("editResponse").style="display: none"
			document.getElementById("editResponse").innerHTML=""
			document.getElementById("editOptions").style="visibility:visible; display: block;"
			document.getElementById("submitCreate").style="visibility:hidden"
			document.getElementById("editDiv").style="visibility:hidden"
			document.getElementById("publicPrivate").style="visibility:hidden";
			document.getElementById("createAnother").style="visibility:hidden";
		}

		function showCreate(){
			document.getElementById("editResponse").style="display: none"
			document.getElementById("editResponse").innerHTML=""
			document.getElementById("titleEditArea").value = "";
			document.getElementById("noteEditArea").value = "";
			document.getElementById("tagEditArea").value = "";
			document.getElementById("editOptions").style="visibility:hidden; display: none"
			document.getElementById("submitEdit").style="visibility:hidden"
			document.getElementById("submitCreate").style="visibility:visible"
			document.getElementById("editDiv").style="visibility:visible"
			document.getElementById("bodyEditDiv").innerHTML = "Body";
			document.getElementById("tagEditDiv").innerHTML = "Tags";
			document.getElementById("publicPrivate").style="visibility:visible";
			document.getElementById("createAnother").style="visibility:hidden; display: none";
			document.getElementById("privateRadio").checked=true;
		}

		function submitCreate(){
			if(sessionUsername == ""){
				alert("Must be logged in to create notes");
				return;
			}

			if(confirm("Are you sure you want to create this note?")){
				newText = document.getElementById("noteEditArea").value;
				newTitle = document.getElementById("titleEditArea").value
				newTags = document.getElementById("tagEditArea").value;

				if(newText.length == 0 || newTags.length == 0 || newTitle.length == 0){
					alert("Will not submit with empty tag, body, or title");
					return;
				}


				if(document.getElementById("privateRadio").checked)
					var data = JSON.stringify({"body":newText, "tags":newTags, "title":newTitle, "owner": "private", "creator":sessionUsername, "action":"create"});
				else
					var data = JSON.stringify({"body":newText, "tags":newTags, "title":newTitle, "owner": 'public',  "creator":sessionUsername, "action":"create"});

				sendRequest(data).then(function(response){
					updateEditResponse("Successfully Created Note With ID <a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\">" 
						+ JSON.parse(response)["id"] + "</a>");
				}, function(rej){
					updateEditResponse("Unable to create note");
				});

			}
		}

		function updateEditResponse(text){
			document.getElementById("editDiv").style="visibility:hidden";
			document.getElementById("submitCreate").style="visibility:hidden";
			document.getElementById("createAnother").style="visibility:visible";
			document.getElementById("editResponse").style="display: block"
			document.getElementById("editResponse").innerHTML=text;
			document.getElementById("publicPrivate").style="visibility:hidden";
		}

		function checkUsername(){
			var username = document.getElementById("usernameInput").value;

			var data = JSON.stringify({"user":username, "action":"doesUserExist"});		

			sendRequest(data).then(function(response){
				if(response == "true"){
					sessionUsername = username.toLowerCase();
					document.getElementById("usernameInput").setAttribute('readonly', true);
					document.getElementById("goodUser").innerHTML = "Successfully logged in as user '" + sessionUsername + "'"
				}
				else{
					alert("Username not found. Please try again.");
					document.getElementById("usernameInput").value = "";
				}
			}, function(rej){
				alert("Username not found. Please try again.");
				console.log(rej);
			});	
		}


		function sendRequest(data){
			  var xhr = new XMLHttpRequest();
			  return new Promise(function(resolve, reject) {
			   xhr.onreadystatechange = function() {
			      if (xhr.readyState == 4) {
			        if (xhr.status >= 300) {
			          reject("Error, status code = " + xhr.status)
			        } else {
			          resolve(xhr.responseText);
			        }
			      }
			    }
			    xhr.open('POST', apiAddress, true)
			    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			    xhr.send(data);
			  });

		}