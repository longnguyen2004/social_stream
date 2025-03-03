var isExtensionOn = false;

if (typeof(chrome.runtime)=='undefined'){
	
	var { ipcRenderer, contextBridge } = require('electron');
	
	console.log("pop up started");
	
	chrome = {};
	chrome.browserAction = {};
	chrome.browserAction.setIcon = function(icon){}
	chrome.runtime = {}
	
	chrome.runtime.sendMessage = async function(data, callback){ // every single response, is either nothing, or update()
		let response = await ipcRenderer.sendSync('fromPopup',data);
		if (typeof(callback) == "function"){
			callback(response);
		}
	};
	chrome.runtime.getManifest = function(){
		return false; // I'll need to add version info eventually
	}
	
	ipcRenderer.on('fromMain', (event, ...args) => {
		
		try {
			update(args[0], false); // do not re-sync with ourself
		} catch(e){
		}
	})
	
	/* ipcRenderer.on('fromBackground', (event, ...args) => {
		console.log("FROM BACKGROUND");
		console.log(args[0]);
	}) */
	
	/* window.addEventListener("message", function(event) {
		console.log(event.origin);
		var messageData = event.data;
		console.log("Received a message from the parent window:", messageData);
	}); */
	
}


var translation = {};

function getTranslation(key, value=false){ 
	if (translation.innerHTML && (key in translation.innerHTML)){ // these are the proper translations
		return translation.innerHTML[key];
	} else if (translation.miscellaneous && (key in translation.miscellaneous)){ 
		return translation.miscellaneous[key];
	} else if (value!==false){
		return value;
	} else {
		return key.replaceAll("-", " "); //
	}
}
function miniTranslate(ele, ident = false, direct=false) {
	
	if (ident){
		if (translation.innerHTML && (ident in translation.innerHTML)){
			if (ele.querySelector('[data-translate]')){
				ele.querySelector('[data-translate]').innerHTML = translation.innerHTML[ident];
				ele.querySelector('[data-translate]').dataset.translate = ident;
			} else {
				ele.innerHTML = translation.innerHTML[ident];
				ele.dataset.translate = ident;
			}
			return;
		} else if (direct){
			if (ele.querySelector('[data-translate]')){
				ele.querySelector('[data-translate]').innerHTML = direct;
				ele.querySelector('[data-translate]').dataset.translate = ident;
			} else {
				ele.dataset.translate = ident;
				ele.innerHTML = direct;
			}
			return;
		} else {
			console.log(ident + ": not found in translation file");
			
			if (!translation.miscellaneous || !(ident in translation.miscellaneous)){ 
				var value = ident.replaceAll("-", " "); // lets use the key as the translation
			} else {
				var value = translation.miscellaneous[ident]; // lets use a miscellaneous translation as backup?
			}
			
			if (ele.querySelector('[data-translate]')){
				ele.querySelector('[data-translate]').innerHTML = value;
				ele.querySelector('[data-translate]').dataset.translate = ident;
			} else {
				ele.innerHTML = value;
				ele.dataset.translate = ident;
			}
			return;
		}
	}
	
	var allItems = ele.querySelectorAll('[data-translate]');
	allItems.forEach(function(ele2) {
		if (translation.innerHTML  && (ele2.dataset.translate in translation.innerHTML)){
			ele2.innerHTML = translation.innerHTML[ele2.dataset.translate];
		} else if (translation.miscellaneous && (ele2.dataset.translate in translation.miscellaneous)){
			ele2.innerHTML = translation.miscellaneous[ele2.dataset.translate];
		}
	});
	if (ele.dataset){
		if (translation.innerHTML && (ele.dataset.translate in translation.innerHTML)){
			ele.innerHTML = translation.innerHTML[ele.dataset.translate];
		} else if (translation.miscellaneous && (ele.dataset.translate in translation.miscellaneous)){
			ele.innerHTML = translation.miscellaneous[ele.dataset.translate];
		}
	}
	if (translation.titles){
		var allTitles = ele.querySelectorAll('[title]');
		allTitles.forEach(function(ele2) {
			var key = ele2.title.toLowerCase().replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/[\n\t\r]/g, '').trim().replaceAll(" ","-");;
			if (key in translation.titles) {
				ele2.title = translation.titles[key];
			}
		});
		if (ele.title){
			var key = ele.title.toLowerCase().replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/[\n\t\r]/g, '').trim().replaceAll(" ","-");;
			if (key in translation.titles) {
				ele.title = translation.titles[key];
			}
		}
	}
	if (translation.placeholders){
		var allPlaceholders = ele.querySelectorAll('[placeholder]');
		allPlaceholders.forEach(function(ele2) {
			var key = ele2.placeholder.toLowerCase().replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/[\n\t\r]/g, '').trim().replaceAll(" ","-");;
			if (key in translation.placeholders) {
				ele2.placeholder = translation.placeholders[key];
			}
		});
		
		if (ele.placeholder){
			var key = ele.placeholder.toLowerCase().replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/[\n\t\r]/g, '').trim().replaceAll(" ","-");;
			if (key in translation.placeholders) {
				ele.placeholder = translation.placeholders[key];
			}
		}
	}
}

function isFontAvailable(fontName) {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    context.font = "72px monospace"; // Use a large font size for better accuracy
    const widthMonospace = context.measureText("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789").width;

    context.font = `72px '${fontName}', monospace`;
    const widthTest = context.measureText("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789").width;

    return widthMonospace !== widthTest;
}

function populateFontDropdown() {
    const fonts = ["Roboto", "Tahoma",  "Arial", "Verdana", "Helvetica", "Serif", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"];
	
    var select = document.querySelector("[data-optionparam1='font']");
    fonts.forEach(font => {
        if (isFontAvailable(font)) {
            let option = document.createElement("option");
            option.value = font;
			option.style="font-family:'"+font+"'";
            option.innerText = font + " abc123XYZ";
            select.appendChild(option);
        }
    });
	
	select = document.querySelector("[data-optionparam2='font']");
    fonts.forEach(font => {
        if (isFontAvailable(font)) {
            let option = document.createElement("option");
            option.value = font;
			option.style="font-family:'"+font+"'";
            option.innerText = font + " abc123XYZ";
            select.appendChild(option);
        }
    });
	
	select = document.querySelector("[data-optionparam4='font']");
    fonts.forEach(font => {
        if (isFontAvailable(font)) {
            let option = document.createElement("option");
            option.value = font;
			option.style="font-family:'"+font+"'";
            option.innerText = font + " abc123XYZ";
            select.appendChild(option);
        }
    });
	
	select = document.querySelector("[data-optionparam5='font']");
    fonts.forEach(font => {
        if (isFontAvailable(font)) {
            let option = document.createElement("option");
            option.value = font;
			option.style="font-family:'"+font+"'";
            option.innerText = font + " abc123XYZ";
            select.appendChild(option);
        }
    });
	
	select = document.querySelector("[data-optionparam1='font']");
    fonts.forEach(font => {
        if (isFontAvailable(font)) {
            let option = document.createElement("option");
            option.value = font;
			option.style="font-family:'"+font+"'";
            option.innerText = font + " abc123XYZ";
            select.appendChild(option);
        }
    });
}

function createUniqueVoiceIdentifiers(voices) {
    let uniqueIdentifiersByLang = {};

    // Group voices by language
    voices.forEach(voiceObj => {
        if (!uniqueIdentifiersByLang[voiceObj.lang]) {
            uniqueIdentifiersByLang[voiceObj.lang] = [];
        }
        uniqueIdentifiersByLang[voiceObj.lang].push(voiceObj);
    });

    // Find unique identifiers within each language group
    for (let lang in uniqueIdentifiersByLang) {
        let voicesInLang = uniqueIdentifiersByLang[lang];

        voicesInLang.forEach(voiceObj => {
            const words = voiceObj.name.split(' ');
            for (let i = 0; i < words.length; i++) {
                let potentialIdentifier = words[i];
                if (voicesInLang.filter(v => v.name.includes(potentialIdentifier)).length === 1) {
                    voiceObj.code = `${lang}&voice=${potentialIdentifier}`;
                    return;
                }
            }
            // Fallback if no unique word is found
            voiceObj.code = lang+"&voice="+`${voiceObj.name.replace(/[^a-zA-Z0-9]/g, '')}`;
        });
    }


	var voicesOutput = [];
	for (var voice in uniqueIdentifiersByLang){
		uniqueIdentifiersByLang[voice].forEach(v=>{
			voicesOutput.push(v);
		});
	}
    return voicesOutput;
}

document.addEventListener("DOMContentLoaded", async function(event) {
	document.getElementById("disableButtonText").innerHTML = "🔌 Extension Disabled";
	document.body.className = "extension-disabled";
	document.getElementById("disableButton").style.display = "";
	chrome.browserAction.setIcon({path: "/icons/off.png"});
	document.getElementById("extensionState").checked = null;
	
	document.getElementById("disableButton").onclick = function(event){
		event.stopPropagation()
		chrome.runtime.sendMessage({cmd: "setOnOffState", data: {value: !isExtensionOn}}, function (response) {
			update(response);
		});
		return false;
	};
	
	populateFontDropdown();
	
	// populate language drop down
	if (speechSynthesis){
		function populateVoices() {
			const voices = createUniqueVoiceIdentifiers(speechSynthesis.getVoices());
			
			voices.sort((a, b) => {
				if (a.default) {
					return -1; // a is the default, move a to the front
				} else if (b.default) {
					return 1; // b is the default, move b to the front
				} else {
					return 0; // neither a nor b is the default, keep original order
				}
			});
			
			var voicesDropdown = document.getElementById('languageSelect1');
			var existingOptions = Array.from(voicesDropdown.options).map(option => option.textContent);

			voices.forEach(voice => {
				const voiceText = voice.name + ' (' + voice.lang + ')';

				if (!existingOptions.includes(voiceText)) {
					const option = document.createElement('option');
					option.textContent = voiceText;
					option.value = voice.code;
					option.setAttribute('data-lang', voice.lang);
					option.setAttribute('data-name', voice.name);
					voicesDropdown.appendChild(option);
				}
			});
			
			var voicesDropdown = document.getElementById('languageSelect2');
			var existingOptions = Array.from(voicesDropdown.options).map(option => option.textContent);

			voices.forEach(voice => {
				const voiceText = voice.name + ' (' + voice.lang + ')';

				if (!existingOptions.includes(voiceText)) {
					const option = document.createElement('option');
					option.textContent = voiceText;
					option.value = voice.code;
					option.setAttribute('data-lang', voice.lang);
					option.setAttribute('data-name', voice.name);
					voicesDropdown.appendChild(option);
				}
			});
		}
		speechSynthesis.onvoiceschanged = populateVoices;
		
		document.getElementById('searchInput').addEventListener('keyup', function() {
			var searchQuery = this.value.toLowerCase();
			
			if (searchQuery){
				document.querySelectorAll('input.collapsible-input').forEach(ele=>{
					ele.checked = true
				});
				document.querySelectorAll('.wrapper').forEach(w=>{
					var menuItems = w.querySelectorAll('.options_group > div');
					var matches = 0;
					menuItems.forEach(function(item) {
						var text = item.textContent.toLowerCase();
						if (item.querySelector("[title]")){
							text += " " + item.querySelector("[title]").title.toLowerCase();
						}
						if (item.querySelector("[title]")){
							text += " " + item.querySelector("[title]").title.toLowerCase();
						}
						if (item.querySelector("input")){
							[...item.querySelector("input").attributes].forEach(att=>{
								if (att.name.startsWith("data-")){
									text += " " + att.value.toLowerCase();
								}
							});
						}
						if (text.includes(searchQuery)) {
							item.style.display = '';
							matches += 1;
						} else {
							item.style.display = 'none';
						}
					});
					if (!matches){
						w.style.display = "none";
					} else {
						w.style.display = "";
					}
				});
			} else {
				document.querySelectorAll('input.collapsible-input').forEach(ele=>{
					ele.checked = null
				});
				document.querySelectorAll('.wrapper').forEach(ele=>{
					ele.style.display = "";
				});
				document.querySelectorAll('.options_group > div').forEach(ele=>{
					ele.style.display = "";
				});
			}
		});

	}
	
	document.getElementById('searchIcon').addEventListener('click', function() {
		var searchInput = document.getElementById('searchInput');
		if (searchInput.style.display === 'none' || searchInput.style.display === '') {
			searchInput.style.display = 'block';
			searchInput.style.width = 'calc(100% - 29px)'; // Match this with your CSS width
			searchInput.focus(); // Optional: Focus on the input field when it's shown
		} else {
			searchInput.style.display = 'none';
			searchInput.style.width = '0';
		}
	});
	
	console.log("pop up asking main for settings");
	chrome.runtime.sendMessage({cmd: "getSettings"}, function (response) {
		console.log("getSettings response",response);
		update(response);
	});

	//chrome.runtime.sendMessage({cmd: "getOnOffState"}, function (response) { //  getSettings will include the state and everything
	//	update(response);
	//});
	
	for (var i=1;i<=20;i++){
		var chat = document.createElement("div");
		chat.innerHTML = '<label class="switch" style="vertical-align: top; margin: 26px 0 0 0">\
				<input type="checkbox" data-setting="chatevent'+ i +'">\
				<span class="slider round"></span>\
			</label>\
			<div style="display:inline-block">\
				<div class="textInputContainer" style="width: 235px">\
					<input type="text" id="chatcommand'+ i +'" class="textInput" autocomplete="off" placeholder="!someevent'+ i +'" data-textsetting="chatcommand'+ i +'">\
					<label for="chatcommand'+ i +'">&gt; Chat Command</label>\
				</div>\
				<div class="textInputContainer" style="width: 235px">\
					<input type="text" id="chatwebhook'+ i +'" class="textInput" autocomplete="off" placeholder="Provide full URL" data-textsetting="chatwebhook'+ i +'">\
					<label for="chatwebhook'+ i +'">&gt; Webhook URL</label>\
				</div>\
			</div>';
		document.getElementById("chatCommands").appendChild(chat);
	}
	
	for (var i=1;i<=10;i++){
		var chat = document.createElement("div");
		chat.innerHTML = '<label class="switch" style="vertical-align: top; margin: 26px 0 0 0">\
				<input type="checkbox" data-setting="timemessageevent'+ i +'">\
				<span class="slider round"></span>\
			</label>\
			<div style="display:inline-block">\
				<div class="textInputContainer" style="width: 235px">\
					<input type="text" id="timemessagecommand'+ i +'" class="textInput" autocomplete="off" placeholder="Message to send to chat at an interval" data-textsetting="timemessagecommand'+ i +'">\
					<label for="timemessagecommand'+ i +'">&gt; Message to broadcast</label>\
				</div>\
				<div class="textInputContainer" style="width: 235px">\
					<input type="number" id="timemessageinterval'+ i +'" class="textInput" value="15" min="0"  autocomplete="off" title="Interval offset in minutes; 0 to issue just once." data-numbersetting="timemessageinterval'+ i +'">\
					<label for="timemessageinterval'+ i +'">&gt; Interval between broadcasts in minutes</label>\
				</div>\
				<div class="textInputContainer" style="width: 235px">\
					<input type="number" id="timemessageoffset'+ i +'" value="0" min="0" class="textInput" autocomplete="off" title="Starting offset in minutes" data-numbersetting="timemessageoffset'+ i +'">\
					<label for="timemessageoffset'+ i +'">&gt; Starting time offset</label>\
				</div>\
			</div>';
		document.getElementById("timedMessages").appendChild(chat);
	}
	
	for (var i=1;i<=10;i++){
		var chat = document.createElement("div");
		chat.innerHTML = '<label class="switch" style="vertical-align: top; margin: 26px 0 0 0">\
				<input type="checkbox" data-setting="botReplyMessageEvent'+ i +'">\
				<span class="slider round"></span>\
			</label>\
			<div style="display:inline-block">\
				<div class="textInputContainer" style="width: 235px">\
					<input type="text" id="botReplyMessageCommand'+ i +'" class="textInput" autocomplete="off" placeholder="Message to send to chat" data-textsetting="botReplyMessageCommand'+ i +'">\
					<label for="botReplyMessageCommand'+ i +'">&gt; Triggering command. eg: !discord</label>\
				</div>\
				<div class="textInputContainer" style="width: 235px">\
					<input type="text" id="botReplyMessageValue'+ i +'" class="textInput" autocomplete="off" placeholder="Message to respond with" data-textsetting="botReplyMessageValue'+ i +'">\
					<label for="botReplyMessageValue'+ i +'">&gt; Message to respond with.</label>\
				</div>\
				<div class="textInputContainer" style="width: 235px">\
					<input type="number" id="botReplyMessageTimeout'+ i +'" class="textInput" min="0" autocomplete="off" placeholder="Timeout needed between responses" data-numbersetting="botReplyMessageTimeout'+ i +'">\
					<label for="botReplyMessageTimeout'+ i +'">&gt; Trigger timeout (ms)</label>\
				</div>\
				<div class="textInputContainer" style="width: 235px" title="If a source is provided, limit the response to this source. Comma-separated" >\
					<input type="text" id="botReplyMessageSource'+ i +'" class="textInput" min="0" autocomplete="off" placeholder="ie: youtube,twitch (comma separated)" data-textsetting="botReplyMessageSource'+ i +'">\
					<label for="botReplyMessageSource'+ i +'">&gt; Limit to specific sites</label>\
				</div>\
			</div>';
		document.getElementById("botReplyMessages").appendChild(chat);
	}
	
	var iii = document.querySelectorAll("input[type='checkbox']");
	for (var i=0;i<iii.length;i++){
		iii[i].onchange = updateSettings;
	}

	var iii = document.querySelectorAll("input[type='text']");
	for (var i=0;i<iii.length;i++){
		iii[i].onchange = updateSettings;
	}
	var iii = document.querySelectorAll("input[type='text'][class*='instant']");
	for (var i=0;i<iii.length;i++){
		iii[i].oninput = updateSettings;
	}
	
	var iii = document.querySelectorAll("input[type='number']");
	for (var i=0;i<iii.length;i++){
		iii[i].onchange = updateSettings;
	}
	var iii = document.querySelectorAll("input[type='password']");
	for (var i=0;i<iii.length;i++){
		iii[i].onchange = updateSettings;
	}
	
	var iii = document.querySelectorAll("select");
	for (var i=0;i<iii.length;i++){
		iii[i].onchange = updateSettings;
	}

	var iii = document.querySelectorAll("button[data-action]");
	for (var i=0;i<iii.length;i++){
		iii[i].onclick = function(){
			var msg = {};
			msg.cmd = this.dataset.action;
			msg.value = this.dataset.value || null;
			if (msg.cmd == "fakemsg"){
				chrome.runtime.sendMessage(msg, function (response) { // actions have callbacks? maybe
				});
			} else if (msg.cmd == "bigwipe"){
				var confirmit = confirm("Are you sure you want to reset all your settings?");
				if (confirmit){
					chrome.runtime.sendMessage(msg, function (response) { // actions have callbacks? maybe
						setTimeout(function(){
							window.location.reload();
						},100);
					});
				}
			} else {
				chrome.runtime.sendMessage(msg, function (response) { // actions have callbacks? maybe
					update(response); 
				});
			}
		};
	}


	document.getElementById("ytcopy").onclick = async function(){
		document.getElementById("ytcopy").innerHTML = "📎";
		var YoutubeChannel = document.querySelector('input[data-textsetting="youtube_username"]').value;
		if (!YoutubeChannel){return;}

		if (!YoutubeChannel.startsWith("@")){
			YoutubeChannel = "@"+YoutubeChannel;
		}

		fetch("https://www.youtube.com/c/"+YoutubeChannel+"/live").then((response) => response.text()).then((data) => {
			document.getElementById("ytcopy").innerHTML = "🔄";
			try{
				var videoID = data.split('{"videoId":"')[1].split('"')[0];
				console.log(videoID);
				if (videoID){
					navigator.clipboard.writeText(videoID).then(() => {
						document.getElementById("ytcopy").innerHTML = "✔️"; // Video ID copied to clipboard
						setTimeout(function(){
							document.getElementById("ytcopy").innerHTML = "📎";
						},1000);
					}, () => {
						document.getElementById("ytcopy").innerHTML = "❌"; // Failed to copy to clipboard
					});
				}
			} catch(e){
				document.getElementById("ytcopy").innerHTML = "❓"; // Video not found
			}
		});
	};

	checkVersion();
});
var streamID = false;
function update(response, sync=true){
	//console.log("update-> response: ",response);
	if (response !== undefined){
		
		
		if (response.streamID){
			streamID = true;
			var password = "";
			if ('password' in response && response.password){
				password = "&password="+response.password;
			}
			
			var baseURL = "https://socialstream.ninja/";
			if (devmode){
				baseURL = "file:///C:/Users/steve/Code/social_stream/";
			}
			
			//document.getElementById("version").innerHTML = "Stream ID is : "+response.streamID;
			document.getElementById("dock").raw = baseURL+"dock.html?session="+response.streamID+password;
			document.getElementById("dock").innerHTML = "<a target='_blank' id='docklink' href='"+baseURL+"dock.html?session="+response.streamID+password+"'>"+baseURL+"dock.html?session="+response.streamID+password+"</a>";

			document.getElementById("overlay").innerHTML = "<a target='_blank' id='overlaylink' href='"+baseURL+"index.html?session="+response.streamID+password+"'>"+baseURL+"index.html?session="+response.streamID+password+"</a>";
			document.getElementById("overlay").raw = baseURL+"index.html?session="+response.streamID+password;

			document.getElementById("emoteswall").innerHTML = "<a target='_blank' id='emoteswalllink' href='"+baseURL+"emotes.html?session="+response.streamID+password+"'>"+baseURL+"emotes.html?session="+response.streamID+password+"</a>";
			document.getElementById("emoteswall").raw = baseURL+"emotes.html?session="+response.streamID+password;
			
			document.getElementById("hypemeter").innerHTML = "<a target='_blank' id='hypemeterlink' href='"+baseURL+"hype.html?session="+response.streamID+password+"'>"+baseURL+"hype.html?session="+response.streamID+password+"</a>";
			document.getElementById("hypemeter").raw = baseURL+"hype.html?session="+response.streamID+password;
			
			document.getElementById("waitlist").innerHTML = "<a target='_blank' id='waitlistlink' href='"+baseURL+"waitlist.html?session="+response.streamID+password+"'>"+baseURL+"waitlist.html?session="+response.streamID+password+"</a>";
			document.getElementById("waitlist").raw = baseURL+"waitlist.html?session="+response.streamID+password;

			document.getElementById("remote_control_url").href = "https://socialstream.ninja/sampleapi.html?session="+response.streamID;
		

			if ('settings' in response){
				for (var key in response.settings){

					if (key === "midiConfig"){
						if (response.settings[key]){
							document.getElementById("midiConfig").classList.add("pressed");
							document.getElementById("midiConfig").innerText = " Config Loaded";
						} else {
							document.getElementById("midiConfig").classList.remove("pressed");
							document.getElementById("midiConfig").innerText = " Load Config";
						}
					}
					if (typeof response.settings[key] == "object"){ // newer method
						if ("param1" in response.settings[key]){
							var ele = document.querySelector("input[data-param1='"+key+"']");
							if (ele){
								ele.checked = response.settings[key].param1;
								updateSettings(ele, sync);
							}
						}
						if ("param2" in response.settings[key]){
							var ele = document.querySelector("input[data-param2='"+key+"']");
							if (ele){
								ele.checked = response.settings[key].param2;
								updateSettings(ele, sync);
							}
						}
						if ("param3" in response.settings[key]){
							var ele = document.querySelector("input[data-param3='"+key+"']");
							if (ele){
								ele.checked = response.settings[key].param3;
								updateSettings(ele, sync);
							}
						}
						if ("param4" in response.settings[key]){
							var ele = document.querySelector("input[data-param4='"+key+"']");
							if (ele){
								ele.checked = response.settings[key].param4;
								updateSettings(ele, sync);
							}
						}
						if ("both" in response.settings[key]){
							var ele = document.querySelector("input[data-both='"+key+"']");
							if (ele){
								ele.checked = response.settings[key].both;
								updateSettings(ele, sync);
							}
						}
						if ("setting" in response.settings[key]){
							var ele = document.querySelector("input[data-setting='"+key+"']");
							if (ele){
								ele.checked = response.settings[key].setting;
								updateSettings(ele, sync);
							}
							
							if (key == "sentiment"){ // i'm deprecating sentiment
								try{
									var ele1 = document.querySelector("input[data-param1='badkarma']");
									if (ele1 && !ele1.checked){
										ele1.checked = true;
										updateSettings(ele1, true);
									}
									chrome.runtime.sendMessage({cmd: "saveSetting", type: "setting", setting: "sentiment", "value": false}, function (response) {}); // delete sentiment
								} catch(e){console.error(e);}
							}
						}
						if ("textsetting" in response.settings[key]){
							var ele = document.querySelector("input[data-textsetting='"+key+"']");
							if (ele){
								ele.value = response.settings[key].textsetting;
								updateSettings(ele, sync);
							}
						}
						if ("optionsetting" in response.settings[key]){
							var ele = document.querySelector("select[data-optionsetting='"+key+"']");
							if (ele){
								ele.value = response.settings[key].optionsetting;
								updateSettings(ele, sync);
							}
						}
						if ("numbersetting" in response.settings[key]){
							var ele = document.querySelector("input[data-numbersetting='"+key+"']");
							if (ele){
								ele.value = response.settings[key].numbersetting;
								updateSettings(ele, sync);
							}
						}
						if ("textparam1" in response.settings[key]){
							var ele = document.querySelector("input[data-textparam1='"+key+"']");
							if (ele){
								ele.value = response.settings[key].textparam1;
								updateSettings(ele, sync);
							}
						}
						if ("textparam2" in response.settings[key]){
							var ele = document.querySelector("input[data-textparam2='"+key+"']");
							if (ele){
								ele.value = response.settings[key].textparam2;
								updateSettings(ele, sync);
							}
						}
						if ("textparam3" in response.settings[key]){
							var ele = document.querySelector("input[data-textparam3='"+key+"']");
							if (ele){
								ele.value = response.settings[key].textparam3;
								updateSettings(ele, sync);
							}
						}
						if ("textparam4" in response.settings[key]){
							var ele = document.querySelector("input[data-textparam4='"+key+"']");
							if (ele){
								ele.value = response.settings[key].textparam4;
								updateSettings(ele, sync);
							}
						}
						if ("textparam5" in response.settings[key]){
							var ele = document.querySelector("input[data-textparam5='"+key+"']");
							if (ele){
								ele.value = response.settings[key].textparam5;
								updateSettings(ele, sync);
							}
						}
						if ("optionparam1" in response.settings[key]){
							var ele = document.querySelector("select[data-optionparam1='"+key+"']");
							if (ele){
								ele.value = response.settings[key].optionparam1;
								updateSettings(ele, sync);
							}
						}
						if ("optionparam2" in response.settings[key]){
							var ele = document.querySelector("select[data-optionparam2='"+key+"']");
							if (ele){
								ele.value = response.settings[key].optionparam2;
								updateSettings(ele, sync);
							}
						}
						if ("optionparam3" in response.settings[key]){
							var ele = document.querySelector("select[data-optionparam3='"+key+"']");
							if (ele){
								ele.value = response.settings[key].optionparam3;
								updateSettings(ele, sync);
							}
						}
						if ("optionparam4" in response.settings[key]){
							var ele = document.querySelector("select[data-optionparam4='"+key+"']");
							if (ele){
								ele.value = response.settings[key].optionparam4;
								updateSettings(ele, sync);
							}
						}
						if ("optionparam5" in response.settings[key]){
							var ele = document.querySelector("select[data-optionparam5='"+key+"']");
							if (ele){
								ele.value = response.settings[key].optionparam5;
								updateSettings(ele, sync);
							}
						}

					} else { // obsolete method
						var ele = document.querySelector("input[data-setting='"+key+"'], input[data-param1='"+key+"'], input[data-param2='"+key+"']");
						if (ele){
							ele.checked = response.settings[key];
							updateSettings(ele, sync);
						}
						var ele = document.querySelector("input[data-textsetting='"+key+"'], input[data-textparam1='"+key+"']");
						if (ele){
							ele.value = response.settings[key];
							updateSettings(ele, sync);
						}
					}
				}
				if ("translation" in response.settings){
					translation = response.settings["translation"];
					miniTranslate(document.body);
				}
			}
		}
		
		if (("state" in response) && streamID){
			isExtensionOn = response.state;
			if (isExtensionOn){
				document.body.className = "extension-enabled";
				document.getElementById("disableButtonText").innerHTML = "⚡ Extension active";
				document.getElementById("disableButton").style.display = "";
				document.getElementById("extensionState").checked = true;
				chrome.browserAction.setIcon({path: "/icons/on.png"});
			} else {
				document.getElementById("disableButtonText").innerHTML = "🔌 Extension Disabled";
				document.body.className = "extension-disabled";
				document.getElementById("disableButton").style.display = "";
				chrome.browserAction.setIcon({path: "/icons/off.png"});
				document.getElementById("extensionState").checked = null;
			}
		}
		
	}
}

function compareVersions(a, b) { // https://stackoverflow.com/a/6832706
    if (a === b) {
       return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");

    var len = Math.min(a_components.length, b_components.length);

    // loop while the components are equal
    for (var i = 0; i < len; i++) {
        // A bigger than B
        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
            return 1;
        }

        // B bigger than A
        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
            return -1;
        }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (a_components.length > b_components.length) {
        return 1;
    }

    if (a_components.length < b_components.length) {
        return -1;
    }

    // Otherwise they are the same.
    return 0;
}
			
function checkVersion(){
	try {
		fetch('https://raw.githubusercontent.com/steveseguin/social_stream/main/manifest.json').then(response => response.json()).then(data => {
			var manifestData = chrome.runtime.getManifest();
			if ("version" in data){
				if (manifestData && (compareVersions(manifestData.version, data.version)==-1)){
					document.getElementById("newVersion").classList.add('show')
					document.getElementById("newVersion").innerHTML = `There's a <a target='_blank' class='downloadLink' title="Download the latest version as a zip" href='https://github.com/steveseguin/social_stream/archive/refs/heads/main.zip'>new version available 💾</a><p class="installed"><span>Installed: ${manifestData.version}</span><span>Available: ${data.version}</span><a title="See the list of recent code changes" href="https://github.com/steveseguin/social_stream/commits/main" target='_blank' style='text-decoration: underline;'>[change log]</a>`;
					
				} else {
					document.getElementById("newVersion").classList.remove('show')
					document.getElementById("newVersion").innerHTML = "";
				}
			}
		});
	} catch(e){}
}


(function (w) {
	w.URLSearchParams = w.URLSearchParams || function (searchString) {
		var self = this;
		self.searchString = searchString;
		self.get = function (name) {
			var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);
			if (results == null) {
				return null;
			} else {
				return decodeURI(results[1]) || 0;
			}
		};
	};

})(window);
var urlParams = new URLSearchParams(window.location.search);

const devmode = urlParams.has("devmode");
	
function updateURL(param, href) {

	href = href.replace("??", "?");
	var arr = href.split('?');
	var newurl;
	if (arr.length > 1 && arr[1] !== '') {
		newurl = href + '&' + param;
	} else {
		newurl = href + '?' + param;
	}
	newurl = newurl.replace("?&", "?");
	return newurl;

}
function removeQueryParamWithValue(url, paramWithValue) {
    let [baseUrl, queryString] = url.split('?');
    if (!queryString) {
        return url;
    }
    let [param, value] = paramWithValue.includes('=') ? paramWithValue.split('=') : [paramWithValue, null];
    let queryParams = queryString.split('&');
    queryParams = queryParams.filter(qp => {
        let [key, val] = qp.split('=');
        return !(key === param && (value === null || val === value));
    });
    let modifiedQueryString = queryParams.join('&');
    let modifiedUrl = baseUrl + (modifiedQueryString ? '?' + modifiedQueryString : '');
    return modifiedUrl;
}

function updateSettings(ele, sync=true){
	
	if (ele.target){
		ele = this;
	}
	if (ele.dataset.param1){
		if (ele.checked){
			
			document.getElementById("dock").raw = updateURL(ele.dataset.param1, document.getElementById("dock").raw);

			if (ele.dataset.param1 == "darkmode"){
				var key = "lightmode";
				var ele1 = document.querySelector("input[data-param1='"+key+"']");
				if (ele1 && ele1.checked){
					ele1.checked = false;
					updateSettings(ele1, sync);
				}

			} else if (ele.dataset.param1 == "lightmode"){
				var key = "darkmode";
				var ele1 = document.querySelector("input[data-param1='"+key+"']");
				if (ele1 && ele1.checked){
					ele1.checked = false;
					updateSettings(ele1, sync);
				}
			}
			
			if (ele.dataset.param1 == "badkarma"){
				var ele1 = document.querySelector("input[data-setting='addkarma']");
				if (ele1 && !ele1.checked){
					ele1.checked = true;
					updateSettings(ele1, sync);
				}
			}
			
			if (ele.dataset.param1 == "onlytwitch"){
				var key = "hidetwitch";
				var ele1 = document.querySelector("input[data-param1='"+key+"']");
				if (ele1 && ele1.checked){
					ele1.checked = false;
					updateSettings(ele1, sync);
				}

			} else if (ele.dataset.param1 == "hidetwitch"){
				var key = "onlytwitch";
				var ele1 = document.querySelector("input[data-param1='"+key+"']");
				if (ele1 && ele1.checked){
					ele1.checked = false;
					updateSettings(ele1, sync);
				}
			}
			
			document.querySelectorAll("input[data-param1^='"+ele.dataset.param1.split("=")[0]+"']:not([data-param1='"+ele.dataset.param1+"'])").forEach(ele1=>{
				if (ele1 && ele1.checked){
					ele1.checked = false;
					updateSettings(ele1, sync);
				}
			});
				
		} else {
			//document.getElementById("dock").raw = document.getElementById("dock").raw.replace(ele.dataset.param1, "");
			document.getElementById("dock").raw = removeQueryParamWithValue(document.getElementById("dock").raw, ele.dataset.param1);
		}
		
		if (ele.dataset.param1 == "compact"){ // duplicate
			var key = "compact";
			document.querySelectorAll("input[data-param1='"+key+"']").forEach(EL=>{ // sync
				EL.checked = ele.checked;
			});
		}

		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("&&", "&");
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("?&", "?");
		
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting",  type: "param1", setting: ele.dataset.param1, "value": ele.checked}, function (response) {});
		}

	} else if (ele.dataset.textparam1){
		
		document.getElementById("dock").raw = removeQueryParamWithValue(document.getElementById("dock").raw, ele.dataset.textparam1);
		
		if (ele.value){
			document.getElementById("dock").raw = updateURL(ele.dataset.textparam1+"="+encodeURIComponent(ele.value), document.getElementById("dock").raw);
		}
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("&&", "&");
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "textparam1", setting: ele.dataset.textparam1, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.textparam2){
		document.getElementById("overlay").raw = removeQueryParamWithValue(document.getElementById("overlay").raw, ele.dataset.textparam2);
		
		if (ele.value){
			document.getElementById("overlay").raw = updateURL(ele.dataset.textparam2+"="+encodeURIComponent(ele.value), document.getElementById("overlay").raw);
		}
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("&&", "&");
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "textparam2", setting: ele.dataset.textparam2, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.textparam3){
		document.getElementById("emoteswall").raw = removeQueryParamWithValue(document.getElementById("emoteswall").raw, ele.dataset.textparam3);
		
		if (ele.value){
			document.getElementById("emoteswall").raw = updateURL(ele.dataset.textparam3+"="+encodeURIComponent(ele.value), document.getElementById("emoteswall").raw);
		}
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("&&", "&");
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "textparam3", setting: ele.dataset.textparam3, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.textparam4){
		document.getElementById("hypemeter").raw = removeQueryParamWithValue(document.getElementById("hypemeter").raw, ele.dataset.textparam4);
		
		if (ele.value){
			document.getElementById("hypemeter").raw = updateURL(ele.dataset.textparam4+"="+encodeURIComponent(ele.value), document.getElementById("hypemeter").raw);
		}
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("&&", "&");
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "textparam4", setting: ele.dataset.textparam4, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.textparam5){
		document.getElementById("waitlist").raw = removeQueryParamWithValue(document.getElementById("waitlist").raw, ele.dataset.textparam5);
		
		if (ele.value){
			document.getElementById("waitlist").raw = updateURL(ele.dataset.textparam5+"="+encodeURIComponent(ele.value), document.getElementById("waitlist").raw);
		}
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("&&", "&");
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "textparam5", setting: ele.dataset.textparam5, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.optionparam1){
		document.getElementById("dock").raw = removeQueryParamWithValue(document.getElementById("dock").raw, ele.dataset.optionparam1);
		
		if (ele.value){
			if (ele.value.includes("&voice=")){
				document.getElementById("dock").raw = removeQueryParamWithValue(document.getElementById("dock").raw, "voice");
				document.getElementById("dock").raw = updateURL(ele.dataset.optionparam1+"="+ele.value, document.getElementById("dock").raw);
			} else {
				document.getElementById("dock").raw = updateURL(ele.dataset.optionparam1+"="+encodeURIComponent(ele.value), document.getElementById("dock").raw);
			}
		}
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("&&", "&");
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "optionparam1", setting: ele.dataset.optionparam1, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.optionparam2){
		document.getElementById("overlay").raw = removeQueryParamWithValue(document.getElementById("overlay").raw, ele.dataset.optionparam2);
		
		if (ele.value){
			if (ele.value.includes("&voice=")){
				document.getElementById("overlay").raw = removeQueryParamWithValue(document.getElementById("overlay").raw, "voice");
				document.getElementById("overlay").raw = updateURL(ele.dataset.optionparam2+"="+ele.value, document.getElementById("overlay").raw);
			} else {
				document.getElementById("overlay").raw = updateURL(ele.dataset.optionparam2+"="+encodeURIComponent(ele.value), document.getElementById("overlay").raw);
			}
		}
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("&&", "&");
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "optionparam2", setting: ele.dataset.optionparam2, "value": ele.value}, function (response) {});
		}
	///
	} else if (ele.dataset.optionparam3){
		document.getElementById("emoteswall").raw = removeQueryParamWithValue(document.getElementById("emoteswall").raw, ele.dataset.optionparam3);
		
		if (ele.value){
			document.getElementById("emoteswall").raw = updateURL(ele.dataset.optionparam3+"="+encodeURIComponent(ele.value), document.getElementById("emoteswall").raw);
		}
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("&&", "&");
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "optionparam3", setting: ele.dataset.optionparam3, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.optionparam4){
		document.getElementById("hypemeter").raw = removeQueryParamWithValue(document.getElementById("hypemeter").raw, ele.dataset.optionparam4);
		
		if (ele.value){
			document.getElementById("hypemeter").raw = updateURL(ele.dataset.optionparam4+"="+encodeURIComponent(ele.value), document.getElementById("hypemeter").raw);
		}
		
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("&&", "&");
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "optionparam4", setting: ele.dataset.optionparam4, "value": ele.value}, function (response) {});
		}
	} else if (ele.dataset.optionparam5){
		document.getElementById("waitlist").raw = removeQueryParamWithValue(document.getElementById("waitlist").raw, ele.dataset.optionparam5);
		
		if (ele.value){
			document.getElementById("waitlist").raw = updateURL(ele.dataset.optionparam5+"="+encodeURIComponent(ele.value), document.getElementById("waitlist").raw);
		}
		
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("&&", "&");
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "optionparam5", setting: ele.dataset.optionparam5, "value": ele.value}, function (response) {});
		}
	//
	} else if (ele.dataset.param2){
		if (ele.checked){
			document.getElementById("overlay").raw = updateURL(ele.dataset.param2, document.getElementById("overlay").raw);
		} else {
			//document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace(ele.dataset.param2, "");
			document.getElementById("overlay").raw = removeQueryParamWithValue(document.getElementById("overlay").raw, ele.dataset.param2);
		}
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("&&", "&");
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "param2", setting: ele.dataset.param2, "value": ele.checked}, function (response) {});
		}
		
		document.querySelectorAll("input[data-param2^='"+ele.dataset.param2.split("=")[0]+"']:not([data-param2='"+ele.dataset.param2+"'])").forEach(ele1=>{
			if (ele1 && ele1.checked){
				ele1.checked = false;
				updateSettings(ele1, sync);
			}
		});

	} else if (ele.dataset.param3){
		if (ele.checked){
			document.getElementById("emoteswall").raw = updateURL(ele.dataset.param3, document.getElementById("emoteswall").raw);
		} else {
			//document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace(ele.dataset.param3, "");
			document.getElementById("emoteswall").raw = removeQueryParamWithValue(document.getElementById("emoteswall").raw, ele.dataset.param3);
		}
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("&&", "&");
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "param3", setting: ele.dataset.param3, "value": ele.checked}, function (response) {});
		}
		
		document.querySelectorAll("input[data-param3^='"+ele.dataset.param3.split("=")[0]+"']:not([data-param3='"+ele.dataset.param3+"'])").forEach(ele1=>{
			if (ele1 && ele1.checked){
				ele1.checked = false;
				updateSettings(ele1, sync);
			}
		});
		
	} else if (ele.dataset.param4){
		if (ele.checked){
			document.getElementById("hypemeter").raw = updateURL(ele.dataset.param4, document.getElementById("hypemeter").raw);
		} else {
			//document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace(ele.dataset.param4, "");
			document.getElementById("hypemeter").raw = removeQueryParamWithValue(document.getElementById("hypemeter").raw, ele.dataset.param4);
		}
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("&&", "&");
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "param4", setting: ele.dataset.param4, "value": ele.checked}, function (response) {});
		}
		
		document.querySelectorAll("input[data-param4^='"+ele.dataset.param4.split("=")[0]+"']:not([data-param4='"+ele.dataset.param4+"'])").forEach(ele1=>{
			if (ele1 && ele1.checked){
				ele1.checked = false;
				updateSettings(ele1, sync);
			}
		});
		
	} else if (ele.dataset.param5){
		if (ele.checked){
			document.getElementById("waitlist").raw = updateURL(ele.dataset.param5, document.getElementById("waitlist").raw);
		} else {
			//document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace(ele.dataset.param5, "");
			document.getElementById("waitlist").raw = removeQueryParamWithValue(document.getElementById("waitlist").raw, ele.dataset.param5);
		}
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("&&", "&");
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "param5", setting: ele.dataset.param5, "value": ele.checked}, function (response) {});
		}
		
		document.querySelectorAll("input[data-param5^='"+ele.dataset.param5.split("=")[0]+"']:not([data-param5='"+ele.dataset.param5+"'])").forEach(ele1=>{
			if (ele1 && ele1.checked){
				ele1.checked = false;
				updateSettings(ele1, sync);
			}
		});
		
		
	} else if (ele.dataset.both){
		if (ele.checked){
			document.getElementById("overlay").raw = updateURL(ele.dataset.both, document.getElementById("overlay").raw);
			document.getElementById("dock").raw = updateURL(ele.dataset.both, document.getElementById("dock").raw);
			document.getElementById("emoteswall").raw = updateURL(ele.dataset.both, document.getElementById("emoteswall").raw);
			document.getElementById("waitlist").raw = updateURL(ele.dataset.both, document.getElementById("waitlist").raw);
			document.getElementById("hypemeter").raw = updateURL(ele.dataset.both, document.getElementById("hypemeter").raw);
		} else {
			document.getElementById("overlay").raw = removeQueryParamWithValue(document.getElementById("overlay").raw, ele.dataset.both);
			document.getElementById("dock").raw = removeQueryParamWithValue(document.getElementById("dock").raw, ele.dataset.both);
			document.getElementById("emoteswall").raw = removeQueryParamWithValue(document.getElementById("emoteswall").raw, ele.dataset.both);
			document.getElementById("waitlist").raw = removeQueryParamWithValue(document.getElementById("waitlist").raw, ele.dataset.both);
			document.getElementById("hypemeter").raw = removeQueryParamWithValue(document.getElementById("hypemeter").raw, ele.dataset.both);
		}
		
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("&&", "&");
		document.getElementById("overlay").raw = document.getElementById("overlay").raw.replace("?&", "?");
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("&&", "&");
		document.getElementById("dock").raw = document.getElementById("dock").raw.replace("?&", "?");
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("&&", "&");
		document.getElementById("emoteswall").raw = document.getElementById("emoteswall").raw.replace("?&", "?");
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("&&", "&");
		document.getElementById("waitlist").raw = document.getElementById("waitlist").raw.replace("?&", "?");
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("&&", "&");
		document.getElementById("hypemeter").raw = document.getElementById("hypemeter").raw.replace("?&", "?");
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting",  type: "both", setting: ele.dataset.both, "value": ele.checked}, function (response) {});
		}

	} else if (ele.dataset.setting){
		if (ele.dataset.setting == "addkarma"){
			if (!ele.checked){ // if unchecked
				var ele1 = document.querySelector("input[data-param1='badkarma']"); // then also uncheck the karma filter
				if (ele1 && ele1.checked){
					ele1.checked = false;
					updateSettings(ele1, sync);
				}
			}
		}
		
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting",  type: "setting", setting: ele.dataset.setting, "value": ele.checked}, function (response) {});
		}
		return;
	} else if (ele.dataset.optionsetting){
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting",  type: "optionsetting", setting: ele.dataset.optionsetting, "value": ele.value}, function (response) {});
		}
		return;
	} else if (ele.dataset.textsetting){
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "textsetting", setting: ele.dataset.textsetting, "value": ele.value}, function (response) {});
		}
		return;
	} else if (ele.dataset.numbersetting){
		if (sync){
			chrome.runtime.sendMessage({cmd: "saveSetting", type: "numbersetting", setting: ele.dataset.numbersetting, "value": ele.value}, function (response) {});
		}
		return;
	}
	

	document.getElementById("docklink").innerText = document.getElementById("dock").raw;
	document.getElementById("docklink").href = document.getElementById("dock").raw;

	document.getElementById("overlaylink").innerText = document.getElementById("overlay").raw;
	document.getElementById("overlaylink").href = document.getElementById("overlay").raw;

	document.getElementById("emoteswalllink").innerText = document.getElementById("emoteswall").raw;
	document.getElementById("emoteswalllink").href = document.getElementById("emoteswall").raw;
	
	document.getElementById("hypemeterlink").innerText = document.getElementById("hypemeter").raw;
	document.getElementById("hypemeterlink").href = document.getElementById("hypemeter").raw;
	
	document.getElementById("waitlistlink").innerText = document.getElementById("waitlist").raw;
	document.getElementById("waitlistlink").href = document.getElementById("waitlist").raw;
}












