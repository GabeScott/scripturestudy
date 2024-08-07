let apiAddress = "https://0vfs3p8qyj.execute-api.us-east-1.amazonaws.com/default";
let sessionUsername = "" ;
let visibleNotes = [];
let ldssSearchCurrentLen = 0
let simpleSearchCurrentLen = 0
let simplesearchColors = []
let dbHost = ''
let ldssOverflow={}
let ldssTerms = []


initializeWindow();

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

document.getElementById("ldssSearchTerms").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("ldssSearchButton").click();
  }
});

document.getElementById("simpleSearchTerms").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    simpleSearch();
  }
});

document.getElementById("langSearchReference").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    langSearch();
  }
});


function openLDSSSearchMenu(){
	document.getElementById("searchLDSSModal").style.display="block"

	window.onclick = function(event) {
	  if (event.target == document.getElementById("searchLDSSModal")) {
	    document.getElementById("searchLDSSModal").style.display = "none";
	  }
	}

	document.getElementsByClassName("close")[2].onclick = function() {
	  document.getElementById("searchLDSSModal").style.display = "none";
	}
}


function ldssSearch(){
	document.getElementById("ldssSearchTextarea").scrollTop = 0;
	ldssSearchCurrentLen = 0;


	if(document.getElementById("ldssSearchTerms").value.trim() == ''){
		alert("Please enter a search term")
		return;
	}

	showLDSSLoader();
	const searchTerms = document.getElementById("ldssSearchTerms").value.split(", ")

	

	ldssTerms = searchTerms;
	ldssOverflow = {}

	data = JSON.stringify({"searchTerms":searchTerms, "action":"searchldss",
							"startingPoint":ldssSearchCurrentLen, "responseSize":20});

	sendRequest(data=data).then(function(response){
		updateLDSSeSearchResults(parseLDSSSearchResults(JSON.parse(response)));
		formatLDSSSearchResults(searchTerms);
		hideLDSSLoader();
	})
}

function showLDSSLoader(){
	document.getElementById("LDSSStatusLoader").style.visibility = "visible";
}

function hideLDSSLoader(){
	document.getElementById("LDSSStatusLoader").style.visibility = "hidden";
}


function formatLDSSSearchResults(searchTerms, isStart = true){
	if(isStart)
		simplesearchColors = [];

	var text = document.getElementById("ldssSearchTextarea").innerHTML//.replace(new RegExp("<.*>", 'gi'), (match) => "");

	
	for(var i = 0; i < searchTerms.length; i++){
		var color = ''
		if(isStart){
			color = '#'+Math.random().toString(16).substr(2,6);
			simplesearchColors.push(color);
		} else {
			color = simplesearchColors[i];
		}
		
		text = text.replace(new RegExp('(?<!id=".*)'+searchTerms[i], 'gi'), 
			(match) => "<span style='color:"+color+"'>"+match+"</span>");
	}
	
	document.getElementById("ldssSearchTextarea").innerHTML = text;
}


function parseLDSSSearchResults(json, isStart = true){
	const hits = json['hits'];
	delete json['hits'];

	var text = ''
	if(isStart)
		text += 'Hits: ' + hits + " <br><br> ";
	var refs = Object.keys(json);

	for(var i = 0; i < refs.length; i++){
		ref = addBookLinks(refs[i])
		var addEndingTag = false
		if(ref == refs[i]){
			ref = '<span>'+ref+'</span><p style="display: inline;">'
			addEndingTag = true
		}

		text += ref + " - " + json[refs[i]].substring(0,100).trim() + '... <a href="#" onclick="seeMoreLdss(this)" id="'+refs[i]+'">More</a><br><br>';
		ldssOverflow[refs[i]] = json[refs[i]].trim();

		if(addEndingTag){
			text += '</p>'
		}
	}

	return text;
}


function seeMoreLdss(element){
	fullText = ldssOverflow[element.id]

	for(var i = 0; i < ldssTerms.length; i++){
		color = simplesearchColors[i];
		fullText = fullText.replace(new RegExp(ldssTerms[i], 'gi'), 
			(match) => "<span style='color:"+color+"'>"+match+"</span>");
	}

	element.parentElement.innerHTML = ' - ' + fullText + '<a href="#" onclick="seeLessLdss(this)" id="'+element.id+'">Less</a><br><br>'

	element.onclick = function(){
		seeLessLdss(this)
	}

}


function seeLessLdss(element){
	fullText = ldssOverflow[element.id].substring(0,100)

	for(var i = 0; i < ldssTerms.length; i++){
		color = simplesearchColors[i];
		fullText = fullText.replace(new RegExp(ldssTerms[i], 'gi'), 
			(match) => "<span style='color:"+color+"'>"+match+"</span>");
	}

	element.parentElement.innerHTML = ' - ' + fullText + '... <a href="#" onclick="seeMoreLdss(this)" id="'+element.id+'">More</a><br><br>'

	element.onclick = function(){
		seeMoreLdss(this)
	}

}



function updateLDSSeSearchResults(response){
	document.getElementById("ldssSearchResults").style.display="block";
	document.getElementById("ldssSearchTextarea").innerHTML = response;
}


function getMoreldssSearchResults(){
	ssdiv = document.getElementById('ldssSearchTextarea');
	if(ssdiv.scrollTop === (ssdiv.scrollHeight - ssdiv.offsetHeight)){
		showLDSSLoader();

		ldssSearchCurrentLen += 20;
		const searchTerms = document.getElementById("ldssSearchTerms").value.split(", ");
		data = JSON.stringify({"searchTerms":searchTerms, "action":"searchldss",
								"startingPoint":ldssSearchCurrentLen, "responseSize":20});

		sendRequest(data=data).then(function(response){
			appendLDSSSearchResults(parseLDSSSearchResults(JSON.parse(response), false));
			formatLDSSSearchResults(searchTerms, false);
			hideLDSSLoader();
		})
	}
}


function appendLDSSSearchResults(text){
	document.getElementById("ldssSearchTextarea").innerHTML += text;
}



function openScriptureSearchMenu(){
	document.getElementById("scriptureSearchModal").style.display="block"

	window.onclick = function(event) {
	  if (event.target == document.getElementById("scriptureSearchModal")) {
	    document.getElementById("scriptureSearchModal").style.display = "none";
	  }
	}

	document.getElementsByClassName("close")[0].onclick = function() {
	  document.getElementById("scriptureSearchModal").style.display = "none";
	}

}


function openLanguageSearchMenu(){
	document.getElementById("languageSearchModal").style.display="block"

	window.onclick = function(event) {
	  if (event.target == document.getElementById("languageSearchModal")) {
	    document.getElementById("languageSearchModal").style.display = "none";
	  }
	}

	document.getElementsByClassName("close")[0].onclick = function() {
	  document.getElementById("languageSearchModal").style.display = "none";
	}

}


function openComeFollowMeMenu(){
	// 
	document.getElementById("comeFollowMeModal").style.display="block"

	window.onclick = function(event) {
	  if (event.target == document.getElementById("comeFollowMeModal")) {
	    document.getElementById("comeFollowMeModal").style.display = "none";
	  }
	}

	document.getElementsByClassName("close")[1].onclick = function() {
	  document.getElementById("comeFollowMeModal").style.display = "none";
	}

}


function searchComeFollowMe(){
	date = document.getElementById("dateSelector").value;
	var weekDays = getWeekRange(date);

	data = JSON.stringify({"week":weekDays, "action":"searchcfm", "user":sessionUsername});
	console.log(weekDays)

	
	sendRequest(data=data).then(function(response){
		response = JSON.parse(response)



		outputHTML = ''
		for(var i=0;i<response.length;i++){
			maxLen = response[i]["body"].length < 300 ? response[i]["body"].length : 300;	
			partialBody = response[i]["body"].substring(0,maxLen)


			outputHTML += '<div class="card" id="'+response[i]["id"]+'"> <div class="container"> <div>'+
			convertMDToHTML(response[i]["id"] + "\n## " + response[i]["title"] + '\n\n' +
			partialBody + '...') + '</div>' +
			'</div></div>';
		}

		document.getElementById("comeFollowMeResultsDiv").innerHTML = addBookLinks(outputHTML);

		for(var i=0;i<response.length;i++){
			document.getElementsByClassName("card")[i].onclick = function(event){
				cardClick(this, event)
			}
		}
		fixInlineParagraphs();
	}, function(rej){
		console.log(rej);
	})

}


async function cardClick(element, event){
	console.log(event.path[0])

	if (event.path[0].tagName.toLowerCase() == 'a')
		return;

	element.innerHTML = '';
	element.classList.add('card-full');
	element.classList.remove('card');

	len = document.getElementsByClassName("card").length

	for(var i=0;i<len;i++){
		document.getElementsByClassName("card")[i].style = 'visibility:hidden; display:none;'
	}

	await getFullCard(element.id);


	document.getElementById('comeFollowMeResultsDiv').style.overflow = 'hidden';
	element.onclick = function(){
		element.innerHTML = '';
		searchComeFollowMe()
		document.getElementById('comeFollowMeResultsDiv').style.overflow = 'scroll';
		element.classList.remove('card-full');
		element.classList.add('card');
	}
}


async function getFullCard(id){
	var data = JSON.stringify({"id": id, "user": sessionUsername, "action":"searchById"});

	await sendRequest(data=data).then(function(response){
		json = JSON.parse(response)

		var html = convertMDToHTML(json["body"] + "\n");
				html = addBookLinks(html);
				var tagText = convertTagsToHTML(json["tags"].split(", "));
				var title = convertMDToHTML("# "+json["title"]);
				var owner = json['owner'];
				var idAndOwner = convertMDToHTML(id +"  (" + owner + ")")

				noteHTML = idAndOwner + "\n\n"+ title + "\n" + html + "\n\nTags: " + tagText;

				element = document.getElementById(id)
				element.innerHTML =  noteHTML;

		fixInlineParagraphs();
	})
}


function getWeekRange(d) {
    d = new Date(d);
    var day = d.getUTCDay(),
        diff = d.getUTCDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    var start = new Date(d.setUTCDate(diff));

    dateRange = []

    for(var i =0; i < 7; i++){
    	dateRange[i] = formatDate(start.getUTCFullYear().toString(),(start.getUTCMonth()+1)+"",start.getUTCDate().toString());
    	start.setUTCDate(start.getUTCDate()+1);
    }
    return dateRange;

}


function formatDate(year, month, day){
	var formattedDate = year;

	if (month.length == 1)
		month = '0'+month;
	if (day.length == 1)
		day = '0'+day;

	return formattedDate+month+day;
}


function simpleSearch(){
	document.getElementById("simpleSearchTextarea").scrollTop = 0;
	simpleSearchCurrentLen = 0;
	showSSLoader();
	const searchTerms = document.getElementById("simpleSearchTerms").value.split(", ")
	const booksToSearch = getBooksToSearch()
	method = '/simplesearch';
	conditional = document.getElementById("OR").checked ? 'OR' : 'AND'
	data = JSON.stringify({"searchTerms":searchTerms, "booksToSearch":booksToSearch,
							"startingPoint":simpleSearchCurrentLen, "responseSize":100, "conditional":conditional});

	sendRequest(data=data, method=method).then(function(response){
		updateSimpleSearchResults(parseSimpleSearchResults(JSON.parse(response)));
		formatSimpleSearchResults(searchTerms);
		hideSSLoader();
	})
}

function langSearch(){
	document.getElementById("langSearchTextarea").scrollTop = 0;
	const reference = document.getElementById("langSearchReference").value
	const langsToSearch = getLangsToSearch()
	method = '/simplesearch';
	data = JSON.stringify({"isLang":true, "languages":langsToSearch,
							"reference":reference});

	sendRequest(data=data, method=method).then(function(response){
		updateLanguageSearchResults(JSON.parse(response));
	})
}


function getLangsToSearch(){
	var langsToSearch = []
	if(document.getElementById("eng").checked)
		langsToSearch.push("eng");

	if(document.getElementById("spa").checked)
		langsToSearch.push("spa");

	if(document.getElementById("fra").checked)
		langsToSearch.push("fra");

	if(document.getElementById("ita").checked)
		langsToSearch.push("ita");

	if(document.getElementById("por").checked)
		langsToSearch.push("por");

	return langsToSearch;

}


function showSSLoader(){
	document.getElementById("SSStatusLoader").style.visibility = "visible";
}

function hideSSLoader(){
	document.getElementById("SSStatusLoader").style.visibility = "hidden";
}


function getBooksToSearch(){
	var booksToSearch = []
	if(document.getElementById("OT").checked)
		booksToSearch.push("OT");

	if(document.getElementById("NT").checked)
		booksToSearch.push("NT");

	if(document.getElementById("BOM").checked)
		booksToSearch.push("BOM");

	if(document.getElementById("D&C").checked)
		booksToSearch.push("D&C");

	if(document.getElementById("POGP").checked)
		booksToSearch.push("POGP");

	return booksToSearch;

}


function parseSimpleSearchResults(json, isStart = true){
	const hits = json['hits'];
	delete json['hits'];

	var text = ''
	if(isStart)
		text += 'Hits: ' + hits + " <br><br> ";
	var refs = Object.keys(json);

	for(var i = 0; i < refs.length; i++){
		text += refs[i] + " - " + json[refs[i]] + "<br><br>";
	}

	return text;
}


function formatSimpleSearchResults(searchTerms, isStart = true){
	if(isStart)
		simplesearchColors = [];

	var text = document.getElementById("simpleSearchTextarea").innerHTML;
	
	for(var i = 0; i < searchTerms.length; i++){
		var color = ''
		if(isStart){
			color = '#'+Math.random().toString(16).substr(2,6);
			simplesearchColors.push(color);
		} else {
			color = simplesearchColors[i];
		}
		
		text = text.replace(new RegExp(searchTerms[i], 'gi'), 
			(match) => "<span style='color:"+color+"'>"+match+"</span>");
	}
	
	document.getElementById("simpleSearchTextarea").innerHTML = text;
}

function updateLanguageSearchResults(response){
	var html = "";

	for (const key in response) {
		lang = "";
		if (key == "eng")
			lang = "English";
		if (key == "fra")
			lang = "French";
		if (key == "spa")
			lang = "Spanish";
		if (key == "ita")
			lang = "Italian";
		if (key == "por")
			lang = "Portuguese";

	  if (response.hasOwnProperty(key)) {
	    html += `<b>${lang}</b> <br> ${response[key]}<br><br>`;
	  }
	}

	document.getElementById("langSearchResults").style.display="block";
	document.getElementById("langSearchTextarea").innerHTML = html;
}

function updateSimpleSearchResults(response){
	document.getElementById("simpleSearchResults").style.display="block";
	document.getElementById("simpleSearchTextarea").innerHTML = addBookLinks(response);
}


function getMoreSimpleSearchResults(){
	ssdiv = document.getElementById('simpleSearchTextarea');
	if(ssdiv.scrollTop === (ssdiv.scrollHeight - ssdiv.offsetHeight)){
		showSSLoader();

		simpleSearchCurrentLen += 100;
		const searchTerms = document.getElementById("simpleSearchTerms").value.split(", ");
		const booksToSearch = getBooksToSearch();
		method = '/simplesearch';

		conditional = document.getElementById("OR").checked ? 'OR' : 'AND'
		data = JSON.stringify({"searchTerms":searchTerms, "booksToSearch":booksToSearch,
							"startingPoint":simpleSearchCurrentLen, "responseSize":100, "conditional":conditional});

		sendRequest(data=data, method=method).then(function(response){

			appendSimpleSearchResults(parseSimpleSearchResults(JSON.parse(response), false));
			formatSimpleSearchResults(searchTerms, false);
			hideSSLoader();
		})
	}
}

function appendSimpleSearchResults(text){
	document.getElementById("simpleSearchTextarea").innerHTML += addBookLinks(text);
}


async function initializeWindow(){
	await checkDBStatus();

	if(document.getElementById("dynamicDBText").innerHTML == "UP"){
		await loginInitialUser();
		setNumNotesText();
		showInitialNote();
	}

	document.getElementById('dateSelector').valueAsDate = new Date();
}


async function checkDBStatus(){
	data = JSON.stringify({"action":"test"})

	await sendRequest(data).then(function(response){
		if (response != "False"){
			document.getElementById("DBStatusLoader").style="visibility:hidden; display:none;";
			document.getElementById("dynamicDBText").style="visibility:visible; display:block; color:green";
			document.getElementById("dynamicDBText").innerHTML="UP";
			document.getElementById("dynamicDBText").onclick=stopDB;
			dbHost = response;
		}
		else{
			document.getElementById("DBStatusLoader").style="visibility:hidden; display:none;";
			document.getElementById("dynamicDBText").style="visibility:visible; display:block; color:red";
			document.getElementById("dynamicDBText").innerHTML="DOWN";
			document.getElementById("dynamicDBText").onclick=startDB;
		}
	})
}

function startDB(){
	if(!confirm("Are you sure you want to start the database? It will incur costs"))
		return;

	document.getElementById("dynamicDBText").style="visibility:hidden; display:none;"
	startLoader();


	data=JSON.stringify({})
	sendRequest(data=data, method="/start-db").then(function(response){
		console.log(response);
	})

	setTimeout(waitForUpStatus, 5000)
}

function stopDB(){
	if(!confirm("Are you sure you want to stop the database?"))
		return;

	document.getElementById("dynamicDBText").style="visibility:hidden; display:none;"
	startLoader();

	data=JSON.stringify({})
	sendRequest(data=data, method="/stop-db").then(function(response){
		console.log(response);
	})

	setTimeout(waitForDownStatus, 5000)
}


function waitForUpStatus(){
	data = JSON.stringify({
		"action":"test"
	})
	sendRequest(data=data).then(function(response){
		if (response != "False"){
			document.getElementById("DBStatusLoader").style="visibility:hidden; display:none;"
			document.getElementById("dynamicDBText").style="visibility:visible; display:block; color:green"
			document.getElementById("dynamicDBText").innerHTML="UP"
			document.getElementById("dynamicDBText").onclick=stopDB
			dbHost = response;
		}
		else{
			setTimeout(waitForUpStatus, 5000)
		}
	})
}


function waitForDownStatus(){
	data = JSON.stringify({
		"action":"test"
	})
	sendRequest(data=data).then(function(response){
		if (response == "False"){
			document.getElementById("DBStatusLoader").style="visibility:hidden; display:none;"
			document.getElementById("dynamicDBText").style="visibility:visible; display:block; color:red"
			document.getElementById("dynamicDBText").innerHTML="DOWN"
			document.getElementById("dynamicDBText").onclick=startDB
		}
		else{
			setTimeout(waitForDownStatus, 5000)
		}
	})
}


function startLoader(){
	document.getElementById("DBStatusLoader").style="visibility:visible; display:block;"
}

function setNumNotesText(){
	data =  JSON.stringify({"action":"count"})

	sendRequest(data).then(function(response){
		document.getElementById("title").innerHTML= "Scripture Notes - "+response+" Notes And Counting!"
	}, function(rej){
		console.log(rej);
	})
}


async function showInitialNote(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	var notes = urlParams.get('note')

	if(notes) {
		if(notes.includes(","))
			notes=notes.split(",");
		else
			notes=[notes];
	}
	else
		notes = []

	for(var i = 0; i < notes.length; i++){
		if(i==1)
			document.getElementById("addNote").checked=true;

		nextNote = notes[i];
		document.getElementById("idToShow").value = nextNote;
		await showNote();
	}	
}


async function loginInitialUser(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const user = urlParams.get('user');

	if (user){
		document.getElementById("usernameInput").value = user;
		await checkUsername();
	}
}


function showLdss(){
	var searchText = document.getElementById("ldssToShow").value;
	var data = JSON.stringify({"action":"showLdss", "searchText":searchText});

	document.getElementById("scripture").innerHTML = searchText

	sendRequest(data).then(function(response){

		if(isJSON(response)){
			var response = JSON.parse(response);
		  	showCommentDiv();	
		  	document.getElementById("ldssArea").innerHTML = response["reference"] + "\n\n"+ response["content"]		
		  	document.getElementById("ldssCommentArea").innerHTML = response["comments"]			

		} 
		else {
			hideCommentDiv();
			document.getElementById("ldssArea").innerHTML = response		
		  	document.getElementById("ldssCommentArea").innerHTML = ""
		}	

		scrollToItem(document.getElementById("ldssArea"));

		
	}, function(rej){
		console.log(rej);
	})
}


function showNextLdss(){
	var searchText = document.getElementById("ldssToShow").value;
	var data = JSON.stringify({"action":"showNextLdss", "searchText":searchText});

	document.getElementById("scripture").innerHTML = searchText

	sendRequest(data).then(function(response){

		if(isJSON(response)){
			var response = JSON.parse(response);
		  	showCommentDiv();	
		  	document.getElementById("ldssArea").innerHTML = response["reference"] + "\n\n"+ response["content"]		
		  	document.getElementById("ldssCommentArea").innerHTML = response["comments"]			
		  	document.getElementById("ldssToShow").value = response['reference'];
		  	document.getElementById("scripture").innerHTML = response['reference']
		} 
		else {
			hideCommentDiv();
			document.getElementById("ldssArea").innerHTML = response		
		  	document.getElementById("ldssCommentArea").innerHTML = ""
		}	

		scrollToItem(document.getElementById("ldssArea"));

		
	}, function(rej){
		console.log(rej);
	})
}


function showPrevLdss(){
	var searchText = document.getElementById("ldssToShow").value;

	var data = JSON.stringify({"action":"showPrevLdss", "searchText":searchText});

	document.getElementById("scripture").innerHTML = searchText

	sendRequest(data).then(function(response){

		if(isJSON(response)){
			var response = JSON.parse(response);
		  	showCommentDiv();	
		  	document.getElementById("ldssArea").innerHTML = response["reference"] + "\n\n"+ response["content"];		
		  	document.getElementById("ldssCommentArea").innerHTML = response["comments"];			
		  	document.getElementById("ldssToShow").value = response['reference'];
		  	document.getElementById("scripture").innerHTML = response['reference']
		} 
		else {
			hideCommentDiv();
			document.getElementById("ldssArea").innerHTML = response;
		  	document.getElementById("ldssCommentArea").innerHTML = "";
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
	var result = json.length + ' Results: <br>';
	
	json.sort(function(a,b){
		if ( a[0] == b[0] ) return 0;
  		    return a[0] < b[0] ? -1 : 1;
	})

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
	var result = json.length + ' Results: <br>';
	var resultDict = {};
	var textDict = {};
	var titleDict = {};
	var ownerDict = {};

	var body_index = 1;
	var title_index = 3;

	for(var i=0; i < json.length; i++){
			var count = (json[i][body_index].toLowerCase().match(new RegExp(text.toLowerCase(), "g")) || []).length + 
						(json[i][title_index].toLowerCase().match(new RegExp(text.toLowerCase(), "g")) || []).length;
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
	console.log("showNoteFromSearchResults")
	document.getElementsByClassName("close")[0].click()
	document.getElementsByClassName("close")[1].click()
	tempadd=false;

	if (window.event.ctrlKey) {
        controlClickEdit(element)
        return;
    }
    else if (window.event.shiftKey){
    	tempadd=true;
    }
	document.getElementById("idToShow").value = element.innerHTML;
	showNote(tempadd);
	resetColumns();
}


function controlClickEdit(element){
	document.getElementsByClassName("close")[0].click()
	document.getElementsByClassName("close")[1].click()
	var id = element.innerHTML;
	document.getElementById("idToEdit").value = id;
	hideSubmitCreateButton();
	editNote();
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


async function showNote(tempadd=false){
	id = document.getElementById("idToShow").value.trim();

	var data = JSON.stringify({"id": id, "user": sessionUsername, "action":"searchById"});

	await sendRequest(data).then(function(response){
	  	if(isJSON(response)){
		  	var json = JSON.parse(response);
		
				var html = convertMDToHTML(json["body"] + "\n");
				html = addBookLinks(html);
				var tagText = convertTagsToHTML(json["tags"].split(", "));
				var title = convertMDToHTML("# "+json["title"]);
				var owner = json['owner'];

				if(document.getElementById('text').checked){
					html = highlightSearchTerms(html);
					title = highlightSearchTerms(title);
		  		}

			if((document.getElementById("onlyShowNote").checked || document.getElementById("noteArea").innerHTML == "") && !tempadd){
				visibleNotes = [];
				var noteHTML = id +" - " + owner + "\n\n"+ title + "\n" + html + "\n\nTags: " + tagText;
				document.getElementById("noteArea").innerHTML = noteHTML
				visibleNotes[0] = {"id":id,"body":noteHTML};
				showEditCurrentNoteButton();
			}
			else{
				visibleNotes.push({"id":id,"body":id +" - " + owner +"\n\n"+ title + "\n" + html + "\n\nTags: " + tagText});
				hideEditCurrentNoteButton()
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


function highlightSearchTerms(html){
	var searchTerm = document.getElementById('searchText').value;

	if (searchTerm.length > 0 && !searchTerm.includes("|") && !searchTerm.includes("<") && !searchTerm.includes(">")){
		html = html.replace(new RegExp(">[^<]*?"+searchTerm+"[^>]*?<", "gi"), 
			(match) => highlightAllWordsInMatch(match, searchTerm));
	}

	return html
}

function highlightAllWordsInMatch(matchedText, searchTerm){
	return matchedText.replace(new RegExp(searchTerm, "gi"), (match) => "<span style='color:yellow'>"+match+"</span>");
}


function addBookLinks(html){
	html = html.replace(/[\n\r]+/g, '');
	html = html.replace(new RegExp(Object.keys(bookDict).join(" [0-9]+:?[0-9]*-?[0-9]*|") + " [0-9]+:?[0-9]*-?[0-9]*", 'gi'), (match) => createDropDownMenu(match));
	return html;
}


function createDropDownMenu(match){
	var scripture = match.trim();
	var parts = scripture.split(" ")

	var book = parts[0];
	for(var i = 1; i < parts.length; i++)
		if(!Object.keys(bookDict).includes(book))
			book += " " + parts[i] ;

	var chapterVersePart = parts[parts.length-1];
	
	var chapter = '';
	if (chapterVersePart.includes(":"))
		chapter = chapterVersePart.split(":")[0];

	else if (Number.isInteger(Number(chapterVersePart)))
		chapter = chapterVersePart;

	else
		chapter='';

	var allverses = chapterVersePart.split(":")[1] ?? '';
	var ldssverse = allverses.split("-")[0] ?? allverses;

	var ldsslink = book;
	var paragraph = 0

	if(chapter != '')
		ldsslink += " " + chapter;

	if(ldssverse != ''){
		ldsslink += ":" + ldssverse;
		paragraph = ldssverse-1;
	}

	url = "https://www.churchofjesuschrist.org"+bookDict[book]+chapter+"."+allverses+"?lang=eng#p"+paragraph;
	var menu = `</p><span class="dropdown">
			<a>${scripture}</a>
		<div class="dropdown-content">
		<a href="#" name="${ldsslink}" onclick="showCommentaryForScripture(this); return false;">Show LDSS</a>
		<a href="${url}" target="_blank">Go To Scripture</a></div></span><p style="display:inline;">`;



	return menu;
}


function fixInlineParagraphs(){
	var allDropdowns = document.getElementsByClassName("dropdown");

	for(var i = 0; i < allDropdowns.length; i++){
		allDropdowns[i].previousSibling.style="display:inline;";
		if((allDropdowns[i].previousSibling.previousSibling) && 
			allDropdowns[i].previousSibling.previousSibling.nodeName == 'P' &&
			allDropdowns[i].previousSibling.previousSibling.style.display == 'inline'){
			allDropdowns[i].previousSibling.innerHTML = "<br><br>"+allDropdowns[i].previousSibling.innerHTML;
		}
	}
}


function showCommentaryForScripture(element){
	document.getElementsByClassName("close")[0].click()
	document.getElementsByClassName("close")[1].click()
	var value = fixOD(element.name);
	document.getElementById("ldssToShow").value = value;

	showLdss();
}


function fixOD(value){
	if(value.includes("Official Declaration 1"))
		return "Official Declaration 1";
	if(value.includes("Official Declaration 2"))
		return "Official Declaration 2";
	return value;
}


function scrollToItem(item) {
    var diff=(item.offsetTop-window.scrollY)/8
    var windowHeight = window.innerHeight;
    if (Math.abs(Math.floor(diff))>1) {
        window.scrollTo(0, (window.scrollY+diff))
        clearTimeout(window._TO)
        if ((window.innerHeight + window.scrollY) < document.body.scrollHeight){
        	window._TO=setTimeout(scrollToItem, 10, item)
    	}
    } else {
        window.scrollTo(0, item.offsetTop)
    }
}


function editSpecificNote(button){
	var id = button.value;
	document.getElementById("idToEdit").value = id;
	hideSubmitCreateButton();
	editNote();
}


function removeNote(button){
	var index = parseInt(button.value);
	visibleNotes.splice(index,1);
	displayVisibleNotes();
	fixInlineParagraphs();
}


function convertMDToHTML(md){
	converter = new showdown.Converter();
	converter.setOption('simpleLineBreaks', true);
	converter.setOption('tables', true);
	html = converter.makeHtml(md+"<br><br>");
	html = addNoteLinks(html);
	return html;
}



function addNoteLinks(text){
	return text.replace(/[0-9]{8}[a-z]+/g, (match) => "<a href=\"#\" onclick=\"showNoteFromSearchResults(this);return false;\">"+match+"</a>");
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
	hideSubmitCreateButton();
	editNote();
	resetColumns();
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
		  		setEditDivTitles();
		  		showPublicPrivateRadioButtons();
		  		if (owner == 'public')
			  		document.getElementById("create_radio").checked=true;
			  	else
			  		document.getElementById("privateRadio").checked=true;
		  	}
		  	else if(permissions == 'a'){
		  		setEditDivTitlesAppend();
		  		hidePublicPrivateRadioButtons();
		  		document.getElementById("create_radio").checked=true;
		  	}

		  	showNoteToEdit(titleEditAreaText, noteEditAreaText, tagEditAreaText);

		} 
		else {
			showEdit()
			showEditResponseText("No results found");
		}
	}, function(rej){
		console.log(rej);
	})
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

			hideEditDiv();
			hideSubmitEditButton();
		  	showEditResponseText(addNoteLinks(responseText));
		  	updateVisibleNotes(editedNoteData);
			displayVisibleNotes();
			fixInlineParagraphs();

		}, function(rej){
			console.log(reg);
		})
		
		hidePublicPrivateRadioButtons();
		resetColumns();

	}
}


function updateVisibleNotes(data){
	var id = data["id"];
	var title = convertMDToHTML("# "+data["title"])
	var body = convertMDToHTML(data["body"] + "\n")
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
			showEditCurrentNoteButton();
			document.getElementById("idToShow").value = id;
		}

	}
	if(document.getElementById('text').checked){
		document.getElementById("noteArea").innerHTML = highlightSearchTerms(document.getElementById("noteArea").innerHTML)
	}
}


function showEdit(){
	hideEditResponseText();
	showEditOptions();
	hideSubmitCreateButton();
	hideEditDiv();
	hidePublicPrivateRadioButtons();
	hideCreateAnotherButton();
}


function showCreate(){
	hideEditResponseText();
	resetEditAreas();
	hideEditOptions();
	hideSubmitEditButton();
	showSubmitCreateButton();
	showEditDiv();
	setEditDivTitles();
	showPublicPrivateRadioButtons()
	hideCreateAnotherButton();
	checkPrivateRadioButton();
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
	hideEditDiv();
	hideSubmitCreateButton();
	showCreateAnotherButton();
	showEditResponseText(text);
	hidePublicPrivateRadioButtons();
}


async function checkUsername(){
	var username = document.getElementById("usernameInput").value;

	var data = JSON.stringify({"user":username, "action":"doesUserExist"});		

	await sendRequest(data).then(function(response){
		if(response == "true"){
			sessionUsername = username.toLowerCase();
			document.getElementById("usernameInput").setAttribute('readonly', true);
			document.getElementById("goodUser").innerHTML = "Log in successful"
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


function sendRequest(data, method="/noteapi"){
	data = JSON.parse(data);
	data['dbHost'] = dbHost;
	data = JSON.stringify(data);
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
	    xhr.open('POST', apiAddress+method, true)
	    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	    xhr.send(data);
	  });
}


function showNoteToEdit(titleEditAreaText, noteEditAreaText, tagEditAreaText){
	hideEditResponseText();	
	showEditDiv();
	showSubmitEditButton();
	document.getElementById("titleEditArea").value = titleEditAreaText;
	document.getElementById("noteEditArea").value = noteEditAreaText;
	document.getElementById("tagEditArea").value = tagEditAreaText;
}


function showEditDiv(){
	document.getElementById("editDiv").style="visibility:visible";
}


function hideEditDiv(){
	document.getElementById("editDiv").style="visibility:hidden";
}


function hideEditResponseText(){
	document.getElementById("editResponse").innerHTML = "";
	document.getElementById("editResponse").style = "display: none";
}


function showEditResponseText(text){
	document.getElementById("editResponse").style="display: block";
	document.getElementById("editResponse").innerHTML=text;
}


function showSubmitEditButton(){
	document.getElementById("submitEdit").style="visibility:visible";
	document.getElementById("submitEdit").style="display:block";
}


function hideSubmitEditButton(){
	document.getElementById("submitEdit").style="visibility:hidden";
	document.getElementById("submitEdit").style="display:none";
}


function showCommentDiv(){
	document.getElementById("commentDiv").style.visibility = "visible";
}


function hideCommentDiv(){
	document.getElementById("commentDiv").style.visibility = "hidden";
}


function showPublicPrivateRadioButtons(){
	document.getElementById("publicPrivate").style="visibility:visible";
}


function hidePublicPrivateRadioButtons(){
	document.getElementById("publicPrivate").style="visibility:hidden";
}


function showEditOptions(){
	document.getElementById("editOptions").style="visibility:visible; display: block;"
}


function hideEditOptions(){
	document.getElementById("editOptions").style="visibility:hidden; display: none"
}


function hideSubmitCreateButton(){
	document.getElementById("submitCreate").style="visibility:hidden; display:none;"
}


function showSubmitCreateButton(){
	document.getElementById("submitCreate").style="visibility:visible; display:block;";
}


function hideCreateAnotherButton(){
	document.getElementById("createAnother").style="visibility:hidden";
}

function showCreateAnotherButton(){
	document.getElementById("createAnother").style="visibility:visible; display: block";
}


function setEditDivTitles(){
	document.getElementById("bodyEditDiv").innerHTML = "Body";
	document.getElementById("tagEditDiv").innerHTML = "Tags";
	document.getElementById("titleHeader").innerHTML = "Title";
}


function setEditDivTitlesAppend(){
	document.getElementById("titleHeader").innerHTML = "Title (you did not create this note, can only append)";
	document.getElementById("bodyEditDiv").innerHTML = "Body (you did not create this note, can only append)";
	document.getElementById("tagEditDiv").innerHTML = "Tags (you did not create this note, can only append)";
}


function resetEditAreas(){
	document.getElementById("titleEditArea").value = "";
	document.getElementById("noteEditArea").value = "";
	document.getElementById("tagEditArea").value = "";
}


function checkPrivateRadioButton(){
	document.getElementById("privateRadio").checked=true;
}


function showEditCurrentNoteButton(){
	document.getElementById("editShownNote").style = "visibility:visible; display:block;";
}


function hideEditCurrentNoteButton(){
	document.getElementById("editShownNote").style = "visibility:hidden;display:none;";
}


function expandSearchDiv(){
	document.getElementById("searchColumn").className = "expandedColumn";
	document.getElementById("editColumn").className = "minimizedColumn";
	document.getElementById("displayColumn").className = "minimizedColumn";

	document.getElementById("expandSearch").onclick = resetColumns
}


function expandEditDiv(){
	document.getElementById("searchColumn").className = "minimizedColumn";
	document.getElementById("editColumn").className = "expandedColumn";
	document.getElementById("displayColumn").className = "minimizedColumn";

	document.getElementById("expandEdit").onclick = resetColumns
}


function expandDisplayDiv(){
	document.getElementById("searchColumn").className = "minimizedColumn";
	document.getElementById("editColumn").className = "minimizedColumn";
	document.getElementById("displayColumn").className = "expandedColumn";

	document.getElementById("expandDisplay").onclick = resetColumns
}


function resetColumns(){
	document.getElementById("searchColumn").className = "column";
	document.getElementById("editColumn").className = "column";
	document.getElementById("displayColumn").className = "column";

	document.getElementById("expandDisplay").onclick = expandDisplayDiv
	document.getElementById("expandEdit").onclick = expandEditDiv
	document.getElementById("expandSearch").onclick = expandSearchDiv
}
