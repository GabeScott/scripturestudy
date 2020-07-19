let apiAddress = "https://0vfs3p8qyj.execute-api.us-east-1.amazonaws.com/default/noteapi";
let sessionUsername = "" ;
let visibleNotes = [];



document.getElementById("searchText").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    searchForNote();
  }
});

document.getElementById("idToShow").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    showNote();
  }
});

document.getElementById("idToEdit").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    editNote();
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
			document.getElementById("commentDiv").style.visibility = "hidden";
			document.getElementById("ldssArea").innerHTML = response		
		  	document.getElementById("ldssCommentArea").innerHTML = ""
		}	

		scrollToItem(document.getElementById("ldssArea"));

		
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


function getSearchByTagResults(json){
	var result = 'Results: <br>';

	for(var i=0; i < json.length; i++){
		var title = json[i][3];
		var color = 'style=\"color:blue;\"';
		if(json[i][4] == 'private')
			color='style=\"color:red;\"';
	  	result += "<b><a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\" " + color + ">"+json[i][0] + "</a>: " + " "+title+"</b><br><i>&nbsp;&nbsp;&nbsp;" + 
		json[i][1].substring(0, 100) + "</i><br>";

	}
	return result;
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


function getSearchByTextResults(json, text){
	var result = 'Results: <br>';
	var resultDict = {};
	var textDict = {};
	var titleDict = {};
	var ownerDict = {};

	for(var i=0; i < json.length; i++){
			var count = (json[i][1].toLowerCase().match(new RegExp(text.toLowerCase(), "g")) || []).length;
			resultDict[json[i][0]]=count;			
			textDict[json[i][0]] = json[i][1].replace(new RegExp(text, 'gi'), (match) => "<b>"+match+"</b>"); 
			titleDict[json[i][0]] = json[i][3];
			ownerDict[json[i][0]] = json[i][4];
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

		var color = 'style=\"color:blue;\"';
		if(ownerDict[items[i][0]] == 'private')
			color = 'style=\"color:red;\"';

	  	var nextResult = "<b><a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\" "+color+">"+items[i][0] + "</a>: " + titleDict[items[i][0]] + " "
	  	 + " ("+items[i][1] + " hits)</b><br><i>&nbsp;&nbsp;&nbsp;"
	  	 + textDict[items[i][0]].substring(Math.max(index-50, 0), Math.min(index+50, textSize)) + "</i><br>";		

	  	if((nextResult.match(/<b>/g) || []).length != (nextResult.match(/<\/b>/g) || []).length)
			nextResult += "</b>";

		nextResult = nextResult.replace("<<", "<")

		result += nextResult;		  	 
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
				html = addBookLinks(html);
				var tagText = convertTagsToHTML(json["tags"].split(", "));
				var title = convertMDToHTML("# "+json["title"]);
				var owner = json['owner'];

			if(document.getElementById("onlyShowNote").checked || document.getElementById("noteArea").innerHTML == ""){
				visibleNotes = [];
				var noteHTML = id +" - " + owner + "\n\n"+ title + "\n" + html + "\n\nTags: " + tagText;
				document.getElementById("noteArea").innerHTML = noteHTML
				visibleNotes[0] = {"id":id,"body":noteHTML};
				document.getElementById("editShownNote").style = "visibility:visible;"
			}
			else{
				visibleNotes.push({"id":id,"body":id +" - " + owner +"\n\n"+ title + "\n" + html + "\n\nTags: " + tagText});
				document.getElementById("editShownNote").style = "visibility:hidden;"
				displayVisibleNotes();
			}

			fixInlineParagraphs();

			
		} 
		else {
			document.getElementById("noteArea").innerHTML = "No results found";
		}
	}, function(rej){
		console.log(rej);
	})
}


function addBookLinks(html){
	html = html.replace(/[\n\r]+/g, '');
	html = html.replace(new RegExp(Object.keys(bookDict).join(" [0-9]+:?[0-9]*|"), 'gi'), (match) => createDropDownMenu(match));
	return html;

}


function createDropDownMenu(scripture){
	var parts = scripture.split(" ")
	var book = ''
	var chapter = ''
	var verse = ''
	if(parts.length == 3){
		book = parts[0] + " " + parts[1];
		chapter = parts[2].split(":")[0]
		verse = parts[2].split(":")[1] ?? ''
	}
	else{
		book = parts[0]
		chapter = parts[1].split(":")[0]
		verse = parts[1].split(":")[1] ?? ''
	}
	url = "https://www.churchofjesuschrist.org/"+bookDict[book]+chapter+"."+verse
	var menu = `</p><div class="dropdown">
		  <a>${scripture}</a>
		  <div class="dropdown-content">
		    <a href="#" name="${scripture}" onclick="showCommentaryForScripture(this); return false;">Show LDSS</a>
		    <a href="${url}" target="_blank">Go To Scripture</a>
		  </div>
		</div>
		<p style="display:inline">`



	return menu;
}


function fixInlineParagraphs(){
	var allDropdowns = document.getElementsByClassName("dropdown");

	for(var i = 0; i < allDropdowns.length; i++){
		allDropdowns[i].previousSibling.style="display:inline";
	}
}


function showCommentaryForScripture(element){
	document.getElementById("ldssToShow").value = element.name;
	showLdss();
}


function scrollToItem(item) {
    var diff=(item.offsetTop-window.scrollY)/8
    var windowHeight = window.innerHeight;
    if (Math.abs(diff)>1) {
        window.scrollTo(0, (window.scrollY+diff))
        clearTimeout(window._TO)
        if ((window.innerHeight + window.scrollY) < document.body.scrollHeight){
        	window._TO=setTimeout(scrollToItem, 30, item)
    	}
    } else {
        window.scrollTo(0, item.offsetTop)
    }
}


function editSpecificNote(button){
	var id = button.value;
	document.getElementById("idToEdit").value = id;
	document.getElementById("submitCreate").style = "visibility: hidden";
	editNote();
}


function removeNote(button){
	var index = parseInt(button.value);
	visibleNotes.splice(index,1);
	displayVisibleNotes();
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

		  	var owner = json['owner'];
		  	

		  	if(permissions == 'e'){
		  		noteEditAreaText = json["body"];
		  		tagEditAreaText = json["tags"];
		  		titleEditAreaText = json["title"];
		  		document.getElementById("titleHeader").innerHTML = "Title";
		  		document.getElementById("bodyEditDiv").innerHTML = "Body";
		  		document.getElementById("tagEditDiv").innerHTML = "Tags";
		  		document.getElementById("publicPrivate").style="visibility:visible";
		  		document.getElementById("create_radio").checked=(owner == 'public');
		  	}
		  	else if(permissions == 'a'){
		  		document.getElementById("titleHeader").innerHTML = "Title (you did not create this note, can only append)";
		  		document.getElementById("bodyEditDiv").innerHTML = "Body (you did not create this note, can only append)";
		  		document.getElementById("tagEditDiv").innerHTML = "Tags (you did not create this note, can only append)";
		  		document.getElementById("publicPrivate").style="visibility:hidden";
		  		document.getElementById("create_radio").checked=true;
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
}


function submitEdit(){
	if(confirm("Are you sure you want to submit this edit?")){
		newText = document.getElementById("noteEditArea").value;
		newTags = document.getElementById("tagEditArea").value;
		newTitle = document.getElementById("titleEditArea").value;
		id = document.getElementById("idToEdit").value.trim();

		var owner = 'public';
		if(document.getElementById('privateRadio').checked)
			owner = 'private';

		if(newText.length == 0 || newTags.length == 0 || newTitle.length == 0){
			if(!confirm("Are you sure you want to submit with empty text?"))
				return;
		}

		var data = JSON.stringify({"id": id, "title":newTitle, "body":newText, "tags":newTags, "owner":owner, "user": sessionUsername, "action":"edit"});
		var editedNoteData = {}

		sendRequest(data).then(function(response){
			var json = JSON.parse(response);
			responseText = json['response']
			editedNoteData['title'] = json['new_title'];
			editedNoteData['body'] = json['new_body'];
			editedNoteData['tags'] = json['new_tags'];
			editedNoteData['id']=id;
			editedNoteData['owner']='public';
			if(document.getElementById("privateRadio").checked)
				editedNoteData['owner'] ='private';

			document.getElementById("editDiv").style="visibility:hidden";
			document.getElementById("submitEdit").style="visibility:hidden";
		  	document.getElementById("editResponse").style="display: block";
		  	document.getElementById("editResponse").innerHTML=responseText;

		  	updateVisibleNotes(editedNoteData);
			displayVisibleNotes();
			fixInlineParagraphs();
		}, function(rej){
			console.log(reg);
		})
		
		document.getElementById("publicPrivate").style="visibility:hidden";

	}
}


function updateVisibleNotes(data){
	var id = data["id"];
	var title = convertMDToHTML("# "+data["title"])
	var body = convertMDToHTML(data["body"])
	body = addBookLinks(body);
	var owner = data['owner']

	for(var i=0; i<visibleNotes.length; i++)
		if(id == visibleNotes[i]["id"])
			visibleNotes[i]["body"] = id + " - " + owner + "\n\n"+ title + "\n" + body + "\n\nTags: " + convertTagsToHTML(data["tags"].split(", "));
}


function displayVisibleNotes(){

	document.getElementById("noteArea").innerHTML = "";
	var addExtraButtons = false;
	if(visibleNotes.length > 1)
		addExtraButtons = true;

	for(var i=0; i<visibleNotes.length; i++){
		var id = visibleNotes[i]["id"];

		document.getElementById("noteArea").innerHTML += visibleNotes[i]["body"];

		if(addExtraButtons){
			document.getElementById("noteArea").innerHTML += "<br><br><button value=" + i +
			" onclick=\"removeNote(this)\">Remove</button>&emsp;"+
			"<button value=" + id + 
			" onclick=editSpecificNote(this)>Edit</button>" + 
			"<br><br><br><hr><br><br>";
		}
		else{
			document.getElementById("editShownNote").style = "visibility:visible;"
			document.getElementById("idToShow").value = id;
		}

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