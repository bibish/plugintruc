
(function(){
let g = document.createElement('div');
g.innerHTML += document.querySelector("[id^='ligatusframe_']").id
g.className += 'lig_plugin_id';
g.style='position:absolute;top:0;left:0;riight:0;bottom:0;margin:auto;font-size:20px;z-index:10;';
document.querySelector("[id^='ligatusframe_']").parentNode.style.position = 'relative';
document.querySelector("[id^='ligatusframe_']").parentNode.style.border = '10px solid red';
document.querySelector("[id^='ligatusframe_']").parentNode.appendChild(g);
document.querySelector("[id^='ligatusframe_']").style.filter='blur(2px)';
console.clear();
})();
console.clear();


