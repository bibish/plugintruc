// this script is the incontent --> it is automaticly injected in the page
let data = {};
let close = true;
// create my Html popup on the page
let injectEasynatorBox = function(){
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", chrome.extension.getURL ("./assets/box.html"), false );
	xmlHttp.send( null );

	let inject  = document.createElement("div");
	inject.id ="easynator3000";
	inject.innerHTML = xmlHttp.responseText
	document.body.insertBefore (inject, document.body.firstChild);
	console.log('the easynator container is injected on the publisher page');
}();

//close button to remove my popup
document.getElementById('LigCloseBtn').addEventListener('click',function(){
	document.getElementById('easynator3000').style.display='none';
	chrome.runtime.sendMessage({msg: "close"}, function(request) {

	});
	console.log(data);
	let pluginBoxChanges = document.getElementsByClassName('lig_plugin_info');
	Array.from(pluginBoxChanges).forEach(function(element) {
		element.style.filter = 'inherit';
		element.style.border='inherit';
		element.style.position = "inherit";
		element.style.display='none';
	});

});
// button to display hide tags in the page
document.getElementById('lig_plugin_show').addEventListener('click',function(){
	if(close){
		chrome.runtime.sendMessage({msg: "display"}, function(request) {})
		close = !close
		this.innerHTML = 'hide tags'
	}else{
		chrome.runtime.sendMessage({msg: "hide"}, function(request) {})
		close = !close;
		this.innerHTML = 'show tags'

	}
	
});



// thanks Internet for this copy paste function which allow the user to move the popup
let moveBox = function(){
	var contextmenu = document.getElementById('easynator3000');
	var initX, initY, mousePressX, mousePressY;

	contextmenu.addEventListener('mousedown', function(event) {

		initX = this.offsetLeft;
		initY = this.offsetTop;
		mousePressX = event.clientX;
		mousePressY = event.clientY;

		this.addEventListener('mousemove', repositionElement, false);

		window.addEventListener('mouseup', function() {
			contextmenu.removeEventListener('mousemove', repositionElement, false);
		}, false);

	}, false);

	function repositionElement(event) {
		this.style.left = initX + event.clientX - mousePressX + 'px';
		this.style.top = initY + event.clientY - mousePressY + 'px';
	}
}();






//////////////////////////////////////////
//// now the fun begin we'll listen messages passing from the background
//// to display informations in the popup 
/////////////////////////////////////////////


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		document.getElementById('ligListId').innerHTML = '';
		document.getElementById('loader').style.display='none';
		let adxRequest = request.adxRequest;
		let cssRequest = request.cssRequest;

		//console.log('adxRequest',adxRequest);
		console.log('cssRequest',cssRequest);


		// verry cool explanations 

		// the following fckup js is because of iframe .. in fact with a side+smartbox on
		// the same id we should only have one adx object which contains 2 tags objects but 
		// with iframe integration we have multiple call to adx .. 
		// and to be more funny when i intercept the adx call from the page i can't acces the response body
		// so i have to do a xhtml request but in this case the adx response contain all tags containter the tag have ..
		// and i have after to filter with my 12563 adx objects the duplicates and trigger which tags are really live or not 

		// crappy method but i don't care because it works ><((((°>



		//////////////////////////////////////////
		/////////// let's filter data
		let filterPromise = new Promise(function(resolve, reject){




		//  here those variale can be totally false because of iframe duplication call but we'll delete duplicate data
		let listId = [];
		let listTags = [];
		let listTagsLive =[];
		let listCssLoaded = []; // css called in the adx Object
		let listCssLoadedIntercepted = []; // css intercepted during the page load
		for (elem of cssRequest){
			listCssLoadedIntercepted.push(elem.url)
		}
		for (elem of adxRequest){
			listId.push(elem['tag-container-id']);
		}
		for (elem of adxRequest){
			let tags = elem.tags
			for(elem of tags){
				listCssLoaded.push(elem['css-url']);
				listTags.push(elem);
				listTags.multitag = false;
			}
			
		}
		//console.log(listTagsLive);

		// remove duplicate tags objects by filtring with the tagId_containerId
		listTags = listTags.filter((listTags, index, self) => self.findIndex(t => t.id === listTags.id ) === index)

		// remove duplicate css in my listCssLoaded object
		listCssLoaded = [ ...new Set(listCssLoaded)];
		//exactly the same as above
		listId = [ ...new Set(listId)];	


		// compare all css get in the adx object with all css intercepted to find which is live or not
		let noCss = listCssLoaded.filter(e => !listCssLoadedIntercepted.find(a => e == a));

		// noCss return a list of the css which are not on the page 
		//console.log('css not live', noCss);

		// remove css which are not loaded 
		for (let i =0;i<listCssLoaded.length;i++){
			for(let u =0;u<noCss.length;u++){
				if(listCssLoaded[i] === noCss[u]){
					listCssLoaded.splice(i,1);
				}
			}
		}
		// damn now we have a list of tag and a list of css we just have to compare it to knwo which div is live ..
		// FIOUUUUUU
		//console.log('css loaded',listCssLoaded);

		// push in listTagLive all tag which have a css url live
		//console.log("listTags", listTags);
		for (let i=0; i<listTags.length;i++){
			
			
			for(let u=0;u<listTags.length;u++){
				if(listTags[u].id != listTags[i].id){
					let a = listTags[u].id;
					let smartId = a.replace(/(^\d+)(.+$)/i,'$1');
					//console.log(smartId, listTags[i].id, listTags[i]);
					//console.log(listTags[i].id.includes(smartId));
					if(listTags[i].id.includes(smartId) ===true){

						listTags[i].multitag = true;
					}
					else{
						listTags[i].multitag = false;
					}
				}
				
			}

			for(let u=0;u<listCssLoaded.length;u++){
				if (listTags[i]['css-url'] === listCssLoaded[u]) {

					listTagsLive.push(listTags[i])

				}
			}



			
		}
		resolve(listTagsLive)
	});
		filterPromise.then((result) =>{
			let cssArray = {};
			for (elem of cssRequest){
				if (elem.frameId){
					cssArray[elem.url] = 'true';
				}else{
					cssArray[elem.url] = 'false';
				}	

			}
			
			for (let i=0;i<result.length;i++){
		 	//console.log(result[i]);
		 	data.id = result[i].id;
		 	data.div = result[i]['target-id'];
		 	data.multitag = result[i].multitag;
		 	data.iframe = cssArray[result[i]['css-url']];
		 	data.simpleID = data.id.replace(/(^\d+)(.+$)/i,'$1');
		 	writeLigData(data);
		 }	
		 let ligIdList = document.getElementsByClassName('ligId');

		 Array.from(ligIdList).forEach(function(element) {
		 	element.addEventListener('click', function(){
		 		let id = element.id.match(/\d/g);
		 		id = id.join("");
		 		console.log('element',element,'id',id);
		 		window.open('https://tagmanager.ligatus.com/#!/tag/edit/'+id, '_blank');
		 	});
		 });
		 function scrollToElement(element) {
		 			var el = document.getElementById(element);
		 			var yPos = el.getClientRects()[0].top;
		 			var yScroll = window.scrollY;
		 			var interval = setInterval(function() {
		 				yScroll -= 10;
		 				window.scroll(0, yScroll);
		 				if (el.getClientRects()[0].top >= 0) {
		 					clearInterval(interval);
		 				}
		 			}, 5);
		 		}
		 let arrows = document.getElementsByClassName('ligMoreArrow');
		 Array.from(arrows).forEach(function(element) {
		 	element.addEventListener('click', function(){
		 		scrollToElement('ligatusframe_'+ data.id);
		 	});
		 });

		})
		


		////////////////////////////////////////////////
		///////////// lets write data //////////////////
		
		
		let writeLigData = function(data){
			//console.log('write data', data);
			let ligHtmlLine = false;
			if (data.iframe === 'true'){
				ligHtmlLine = `
				<div class="ligFirstLine" id="${data.id}">
				<div class="ligVisibleData">
				<div class="ligId" id="ligId_${data.simpleID}">${data.id}</div>
				<div class="ligMultitag" id="multitag_${data.simpleID}">${data.multitag}</div>
				<div class="ligIframe">${data.iframe}</div>
				</div>	
				</div>

				`;	
			}else{
				ligHtmlLine = `
				<div class="ligFirstLine" id="${data.id}">
				<div class="ligVisibleData">
				<div class="ligId" id="ligId_${data.simpleID}">${data.id}</div>
				<div class="ligMultitag" id="multitag_${data.simpleID}">${data.multitag}</div>
				<div class="ligIframe">${data.iframe}</div>
				<span class="ligMoreArrow" id="arrow_${data.id}"></span>
				</div>	
				</div>

				`;	
			}
			

		 	// inject new data in the easynator box	
		 	let tokenHtml = document.createElement('div');
		 	tokenHtml.innerHTML = ligHtmlLine; 		
		 	document.getElementById('ligListId').appendChild(tokenHtml);


		 }



		});




