(function () {
	 
	function toDataURL(url, callback) {
	  var xhr = new XMLHttpRequest();
	  xhr.onload = function() {
		  
		var blob = xhr.response;
    
		if (blob.size > (55 * 1024)) {
		  callback(url); // Image size is larger than 25kb.
		  return;
		}

		var reader = new FileReader();
		
		
		reader.onloadend = function() {
		  callback(reader.result);
		}
		reader.readAsDataURL(xhr.response);
	  };
	  xhr.open('GET', url);
	  xhr.responseType = 'blob';
	  xhr.send();
	}
	
	function escapeHtml(unsafe) {
		try {
			if (settings.textonlymode) { // we can escape things later, as needed instead I guess.
				return unsafe;
			}
			return unsafe
				.replace(/&/g, "&amp;") // i guess this counts as html
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;") || "";
		} catch (e) {
			return "";
		}
	}


	function getAllContentNodes(element) { // takes an element.
		var resp = "";

		if (!element) {
			return resp;
		}

		if (!element.childNodes || !element.childNodes.length) {
			if (element.textContent) {
				return escapeHtml(element.textContent) || "";
			} else {
				return "";
			}
		}

		element.childNodes.forEach(node => {
			if (node.childNodes.length) {
				resp += getAllContentNodes(node)
			} else if ((node.nodeType === 3) && node.textContent && (node.textContent.trim().length > 0)) {
				resp += escapeHtml(node.textContent.trim()) + " ";
			} else if (node.nodeType === 1) {
				if (!settings.textonlymode) {
					if (node && node.classList && node.classList.contains("zero-width-emote")) {
						resp += "<span class='zero-width-parent'>" + node.outerHTML + "</span>";
					} else if (node && node.tagName && (node.tagName == "IMG") && node.src) {
						node.src = node.src + "";
						resp += node.outerHTML;
					} else {
						resp += node.outerHTML;
					}
				}
			}
		});
		return resp;
	}



	var lastMessage = "";
	
	
	function processMessage(ele){
		
		var mid = ele.id.split("chat-messages-");
		if (mid.length==2){
			mid = mid[1];
		} else {
			return;;
		}
		
		mid = mid.split("-");
		if (mid.length==2){
			mid = mid[1];
		} else {
			mid = mid[0];
		}
	
		var chatimg = "";
		try{
		   chatimg = ele.querySelector("img[class*='avatar-'],img[class*='avatar_']").src+"";
		} catch(e){
		}
		
		var name="";
		try {
			name = getAllContentNodes(ele.querySelector("#message-username-"+mid)).trim();
		} catch(e){
		}
		
		var msg = "";
		
		try {
			msg = getAllContentNodes(ele.querySelector("#message-content-"+mid)).trim();
		} catch(e){}
		
		var contentimg = "";
		try {
			contentimg = ele.querySelector("div[class^='imageContent-'] img[src]").src+"";
		} catch(e){}
		
		
		if (!name && !chatimg){
			for (var i=0; i<50;i++){
				try {
					ele = ele.previousElementSibling;
				} catch(e){
					break;
				}
				try {
					if (!name){
						name = getAllContentNodes(ele.querySelector("[id^='message-username-']")).trim();
					}
				} catch(e){
				}
				try {
					if (!chatimg){
						chatimg = ele.querySelector("img[class*='avatar-'],img[class*='avatar_']").src +"";
					}
				} catch(e){
				}
				if (name){break;}
			}
		}
		

		var data = {};
		data.chatname = name;
		data.chatbadges = "";
		data.backgroundColor = "";
		data.textColor = "";
		data.chatmessage = msg;
		data.chatimg = chatimg;
		data.hasDonation = "";
		data.membership = "";;
		data.contentimg = contentimg;
		data.textonly = settings.textonlymode || false;
		data.type = "discord";
		
	//	console.log(data);
		
		if (lastMessage === JSON.stringify(data)){ // prevent duplicates, as zoom is prone to it.
			return;
		}
		lastMessage = JSON.stringify(data);
		if (data.contentimg){
			toDataURL(data.contentimg, function(dataUrl) {
				data.contentimg = dataUrl;
				if (data.chatimg){
					toDataURL(data.chatimg, function(dataUrl2) {
						data.chatimg = dataUrl2;
						pushMessage(data);
					});
				} else {
					pushMessage(data);
				}
			});
		} else {
			if (data.chatimg){
				toDataURL(data.chatimg, function(dataUrl) {
					data.chatimg = dataUrl;
					pushMessage(data);
				});
			} else {
				pushMessage(data);
			}
		}
		
	}

	function pushMessage(data){
		try{
			chrome.runtime.sendMessage(chrome.runtime.id, { "message": data }, function(e){});
		} catch(e){
		}
	}
	
	var settings = {};
	// settings.textonlymode
	// settings.captureevents
	
	
	chrome.runtime.sendMessage(chrome.runtime.id, { "getSettings": true }, function(response){  // {"state":isExtensionOn,"streamID":channel, "settings":settings}
		if ("settings" in response){
			settings = response.settings;
		}
	});

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			try{
				if ("focusChat" == request){ // if (prev.querySelector('[id^="message-username-"]')){ //slateTextArea-
					document.querySelector('div[class*="slateTextArea"]').focus();
					sendResponse(true);
					return;
				}
				if (typeof request === "object"){
					if ("settings" in request){
						settings = request.settings;
						sendResponse(true);
						return;
					}
				}
			} catch(e){}
			sendResponse(false);
		}
	);

	var lastURL =  "";
	var lastMessageID = 0;
	var observer = null;
	
	function onElementInserted(containerSelector) {
		if (observer){
			try {
				observer.disconnect();
			} catch(e){}
			observer = null;
		}
		var onMutationsObserved = function(mutations) {
			var highestMessage = 0;
			if (lastURL !== window.location.href){
				lastURL = window.location.href;
				lastMessageID = 0;
			}
			if (!window.location.href.includes("/channels/")){
				if (observer){
					try {
						observer.disconnect();
					} catch(e){}
					observer = null;
				}
				return;
			}
			
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length) {
					for (var i = 0, len = mutation.addedNodes.length; i < len; i++) {
						if (mutation.addedNodes[i].id && !mutation.addedNodes[i].skip){
							var mid = mutation.addedNodes[i].id.split("chat-messages-");
							if (mid.length==2){
								mid = parseInt(mid[1]);
							} else {
								continue;
							}
							if (highestMessage<mid){
								highestMessage = mid;
							} else {
								continue;
							}
							setTimeout(function(id){
								try{
									if (document.getElementById(id).skip){return;}
									document.getElementById(id).skip = true;
									if (!document.getElementById(id).childNodes.length){return;}
									processMessage(document.getElementById(id));
								} catch(e){}
							},500, mutation.addedNodes[i].id);
						}
					}
					if (highestMessage>lastMessageID){
						lastMessageID = highestMessage;
					}
				}
			});
		};
		var target = document.querySelector(containerSelector);
		if (!target){return;}
		var config = { childList: true, subtree: true };
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		
		observer = new MutationObserver(onMutationsObserved);
		observer.observe(target, config);
	}
	
	console.log("social stream injected -- MUST BE ENABLED VIA SETTING TOGGLE AS WELL TO USE!!!");

	setInterval(function(){
		if (!window.location.href.includes("/channels/")){return;}
		if (document.querySelector('[data-list-id="chat-messages"]')){
			if (!document.querySelector('[data-list-id="chat-messages"]').marked){
				document.querySelector('[data-list-id="chat-messages"]').marked=true;
				onElementInserted('[data-list-id="chat-messages"]');
			}
		}
	},1000);

})();