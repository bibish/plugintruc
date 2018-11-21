(function(){
if(document.querySelectorAll('.lig_plugin_id')){
	for (let i =0;i<document.querySelectorAll('.lig_plugin_id').length;i++){
		document.querySelectorAll('.lig_plugin_id')[i].innerHTML ='';
	}
}
document.querySelector("[id^='ligatusframe_']").parentNode.style.border = 'inherit'
document.querySelector("[id^='ligatusframe_']").style.filter='inherit';
console.clear();
})();
console.clear();
