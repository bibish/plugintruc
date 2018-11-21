//background js location


//constant http request interceptor 
let cssRequest = [];
let adxRequest = [];
let frameGetter = [];
chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
 cssRequest = [];
 adxRequest = [];
 frameGetter = [];
 console.log('table reset');

});

chrome.webRequest.onResponseStarted.addListener(function(e){

  // intercept adx response ( tag id, tag container list ) 
  if(e.url.match('adx.ligadx.com') && e.method=='POST'){
    let webRequest = e;
    webRequest = e.url;
    let req = new XMLHttpRequest();
    req.open('GET',webRequest,false); 
    req.send(null);
    let response = req.responseText;
    response=JSON.parse(response);
    adxRequest.push(response);
    console.log("ligatus object data ",response);




  }
  // get css file id to match and valide which tag is live
  if(e.url.match('ct.ligatus.com/css') ){
    cssRequest.push(e);
    console.log(e);
    if(e.frameId != 0){
      frameGetter.push(e.frameId)
    }
    
  }

  
},{
  urls:["<all_urls>"],
  types:["xmlhttprequest"]
},
["responseHeaders"] );

chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete') { // send data to the plugin when the page is loaded

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     chrome.tabs.sendMessage(tabs[0].id, {cssRequest,adxRequest});

   });
    
 }
});
chrome.browserAction.onClicked.addListener((tab) => {

  chrome.tabs.executeScript(null, {code:"document.getElementById('easynator3000').style.display='block';"});

      });

chrome.runtime.onMessage.addListener(function(request) {
  console.log(request);
  if (request.msg === "close" || request.msg === "hide"){

    for (let i=0; i<frameGetter.length;i++){
      //console.log('hideiframes', frameGetter)
      chrome.tabs.executeScript(null,{
          //   code:"",
          file:'./js/hideiframes.js',
          frameId:frameGetter[i],
          allFrames:true,
          matchAboutBlank:true

        })
    }
    chrome.tabs.executeScript(null,{
          //   code:"",
          file:'./js/hideiframes.js',
          frameId:0,
          allFrames:true,
          matchAboutBlank:true

        })
    
  }
  if(request.msg === "display"){
    for (let i=0; i<frameGetter.length;i++){
      chrome.tabs.executeScript(null,{
          //   code:"",
          file:'./js/showIframes.js',
          frameId:frameGetter[i],
          allFrames:true,
          matchAboutBlank:true

        })
    }
     chrome.tabs.executeScript(null,{
          //   code:"",
          file:'./js/showIframes.js',
          frameId:0,
          allFrames:true,
          matchAboutBlank:true

        })
  }


});


// });