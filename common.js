//TODO: common.js has been split when the 2nd calculator was introduced. It should probably become a module now to clean up the scope.

//URL parameter handling:

const startUrlParams = new URLSearchParams(window.location.search);
const urlParamColorScheme = startUrlParams.get('color');
const urlParamSingleColumn = startUrlParams.get('singleColumn');
const urlParamDetailedInfo = startUrlParams.get('detailedInfo');

function updateUrlParameter(key, value, reloadPage){
	var currentUrl = new URL(window.location.href);
	var currentUrlParams = new URLSearchParams(currentUrl.search);
	currentUrlParams.set(key, value);
	currentUrl.search = currentUrlParams.toString();
	if (reloadPage){
		window.location.search = currentUrlParams.toString();
	}else{
		window.history.replaceState(null, "", currentUrl.toString());
	}
}

//Common UI:

var mainView = document.body.querySelector(".main-view");
var mainHeadline = document.getElementById("main-headline");
var d4IconSvg = document.getElementById("d4-icon");
var optionsMenu = document.body.querySelector(".options-menu");
var contentPage = mainView.querySelector(".content-page");		//TODO: I think this is actually the only global var used outside

var colorStyle = "light";		
var optionDarkMode = optionsMenu.querySelector("[name=option-dark-mode]");
optionDarkMode.onchange = function(){ toggleColorStyle(true); };
optionDarkMode.checked = false;
var optionSingleColumn = optionsMenu.querySelector("[name=option-single-column]");
optionSingleColumn.onchange = function(){ toggleSingleColum(true); };
optionSingleColumn.checked = (urlParamSingleColumn && urlParamSingleColumn == "true");
if (optionSingleColumn.checked){
	contentPage.classList.add("force-one-column");
}
var optionDetailedInfo = optionsMenu.querySelector("[name=option-detailed-info]");
optionDetailedInfo.onchange = function(){ toggleDetailedInfo(true); };
optionDetailedInfo.checked = (!urlParamDetailedInfo || urlParamDetailedInfo == "true");
if (optionDetailedInfo.checked){
	contentPage.classList.remove("hide-damage-details");
}else{
	contentPage.classList.add("hide-damage-details");
}

function toggleOptionsMenu(){
	if (optionsMenu.classList.contains("hidden")){
		optionsMenu.classList.remove("hidden");
	}else{
		optionsMenu.classList.add("hidden");
	}
}
function toggleSingleColum(writeUrlParam){
	if (optionSingleColumn.checked){
		contentPage.classList.add("force-one-column");
		if (writeUrlParam){
			updateUrlParameter("singleColumn", "true");
		}
	}else{
		contentPage.classList.remove("force-one-column");
		if (writeUrlParam){
			updateUrlParameter("singleColumn", "false");
		}
	}
}
function toggleDetailedInfo(writeUrlParam){
	if (optionDetailedInfo.checked){
		contentPage.classList.remove("hide-damage-details");
		if (writeUrlParam){
			updateUrlParameter("detailedInfo", "true");
		}
	}else{
		contentPage.classList.add("hide-damage-details");
		if (writeUrlParam){
			updateUrlParameter("detailedInfo", "false");
		}
	}
}
function setColorStyle(style, writeUrlParam){
	if (style == "light"){
		colorStyle = "light";
		optionDarkMode.checked = false;
		document.documentElement.classList.remove("dark");
		//d4IconSvg.querySelectorAll("path")[1].style.fill = "#000";
		if (writeUrlParam){
			updateUrlParameter("color", "light");
		}
	}else{
		colorStyle = "dark";
		optionDarkMode.checked = true;
		document.documentElement.classList.add("dark");
		//d4IconSvg.querySelectorAll("path")[1].style.fill = "#EBE9E8";
		if (writeUrlParam){
			updateUrlParameter("color", "dark");
		}
	}
}
function toggleColorStyle(writeUrlParam){
	if (colorStyle == "light") setColorStyle("dark", writeUrlParam);
	else setColorStyle("light", writeUrlParam);
}
if (urlParamColorScheme){
	setColorStyle(urlParamColorScheme);
}else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
	setColorStyle("dark");
}else{
	setColorStyle("light");
}
d4IconSvg.addEventListener("click", toggleColorStyle);

//UI components:

function showPopUp(content, buttons, options){
	mainView.inert = true;	//lock main
	document.body.classList.add("disable-interaction");
	var popUpOverlay = document.createElement("div");
	popUpOverlay.className = "pop-up-overlay";
	var popUpBox = document.createElement("div");
	popUpBox.className = "pop-up-message-box";
	var popUpCloseBtn = document.createElement("button");
	popUpCloseBtn.className = "pop-up-message-box-close";
	//popUpCloseBtn.innerHTML = "<span>×</span>";
	popUpBox.appendChild(popUpCloseBtn);
	var contentDiv = document.createElement("div");
	contentDiv.className = "pop-up-content";
	popUpBox.appendChild(contentDiv);
	if (typeof content == "string"){
		contentDiv.innerHTML = content;
	}else{
		contentDiv.appendChild(content);
	}
	//close function
	popUpOverlay.popUpClose = function(){
		mainView.inert = false;	//release main
		document.body.classList.remove("disable-interaction");
		popUpOverlay.remove();
	}
	popUpCloseBtn.addEventListener("click", function(ev){
		popUpOverlay.popUpClose();
	});
	if (options?.easyClose){
		popUpOverlay.addEventListener("click", function(ev){
			ev.stopPropagation();
			if (ev.target != this) return;	//ignore bubble events
			popUpOverlay.popUpClose();
		});
	}
	//append and open
	popUpOverlay.appendChild(popUpBox);
	document.body.appendChild(popUpOverlay);			
	return popUpOverlay;
}
function showFormPopUp(formFields, onSubmit){
	var form = document.createElement("form");
	formFields.forEach(function(field, i){
		var formSection = document.createElement("div");
		formSection.className = "form-section";
		if (field.label){
			let ele = document.createElement("label");
			ele.textContent = field.label;
			formSection.appendChild(ele);
		}
		if (field.input){
			let ele = document.createElement("input");
			if (field.pattern){
				ele.pattern = field.pattern;
			}
			if (field.required){
				ele.required = true;
			}
			if (field.title){
				ele.title = field.title;
			}
			ele.name = field.name || ("field" + i);
			ele.value = field.value;
			formSection.appendChild(ele);
		}
		if (field.submit){
			let ele = document.createElement("input");
			ele.type = "submit";
			ele.className = "button-style";
			ele.value = field.name || "Submit";
			formSection.appendChild(ele);
		}
		form.appendChild(formSection);
	});
	form.addEventListener("submit", function(ev){
		ev.preventDefault();
		var formData = new FormData(ev.target);
		if (onSubmit) onSubmit(formData);
		popUp.popUpClose();
	});
	var popUp = showPopUp(form, [], {easyClose: false});
}

function addDynamicMod(parentEle, modName, className, value, disabled, stepSize){
	var newAddMod = document.createElement("div");
	newAddMod.className = "group limit-label calc-item";
	if (disabled){
		newAddMod.classList.add("hidden");
	}
	newAddMod.dataset.info = modName;
	var newAddModLabel = document.createElement("label");
	var newAddModLabelSpan = document.createElement("span");
	newAddModLabel.appendChild(newAddModLabelSpan);
	newAddModLabelSpan.textContent = modName + ":";
	newAddModLabelSpan.addEventListener("click", function(){
		showFormPopUp([
			{input: true, label: "Name:", name: "name", required: true,
				value: newAddModLabelSpan.textContent.replace(/:$/, ""), title: "Name for this modifier."},
			{submit: true, name: "Ok"}
		], function(formData){
			var newName = formData.get("name").trim();
			if (newName){
				newAddMod.dataset.info = newName;
				newAddModLabelSpan.textContent = newName + ":";
			}
		});
	});
	var newAddModInput = document.createElement("input");
	newAddModInput.type = "number";
	if (stepSize){
		newAddModInput.step = stepSize;
	}
	newAddModInput.className = ("highlight " + className).trim();
	newAddModInput.value = value || 0;
	var newAddModRemove = document.createElement("button");
	newAddModRemove.textContent = "─";
	newAddModRemove.title = "remove";
	newAddModRemove.addEventListener("click", function(){
		newAddMod.remove();
	});
	var newAddModHide = document.createElement("button");
	newAddModHide.innerHTML = "&#128065;";
	newAddModHide.title = "disable";
	newAddModHide.addEventListener("click", function(){
		if (newAddMod.classList.contains("hidden")){
			newAddMod.classList.remove("hidden");
		}else{
			newAddMod.classList.add("hidden");
		}
	});
	newAddMod.appendChild(newAddModLabel);
	newAddMod.appendChild(newAddModInput);
	newAddMod.appendChild(newAddModHide);
	newAddMod.appendChild(newAddModRemove);
	parentEle.appendChild(newAddMod);
	bytemind.dragdrop.addMoveHandler(newAddMod, parentEle, newAddModLabel);
}

//Store/load/delete/export etc.:

var localStorageSupported = ("localStorage" in window && typeof localStorage.getItem == "function");

function saveAs(filename, dataObj, parentViewEle){
	if (!filename || !dataObj) return;
	var blob = new Blob([JSON.stringify(dataObj)], {
		type: 'text/plain'
	});
	if (navigator.msSaveBlob) return navigator.msSaveBlob(blob, filename);
	var dummyEle = parentViewEle || document.body;
	var a = document.createElement('a');
	a.style.cssText = "max-width: 0px; max-height: 0px; margin: 0; padding: 0;";
	dummyEle.appendChild(a);
	var url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(function(){
		window.URL.revokeObjectURL(url);
		dummyEle.removeChild(a);
	}, 0);
}

function exportAllData(){
	var data = {
		configArray: readConfigsFromLocalStorage()
	};
	var now = (new Date()).toISOString().split(".")[0].replace(/(T|:|\.)/g, "_");
	console.error("exportAllData", data);	//DEBUG
	saveAs("d4-calc-all_" + now + ".json", data);
}
function importConfigurationFromFile(file, onDataCallback){
	const reader = new FileReader();
	reader.onload = () => {
		const content = reader.result;
		if (content){
			var contentJson = JSON.parse(content);
			if (contentJson.singleConfig){
				if (onDataCallback) onDataCallback("singleConfig", contentJson.singleConfig);
			}else if (contentJson.configArray || contentJson.allConfigs){
				if (onDataCallback) onDataCallback("configArray",
					contentJson.configArray || contentJson.allConfigs);
			}else{
				showPopUp("Could not import data.<br>Unknown file format.");
			}
		}
	};
	reader.readAsText(file);
}
function createStoredCalculatorsPopUp(onSelectCallback){
	var storedConfigs = readConfigsFromLocalStorage();
	var keys = Object.keys(storedConfigs);
	if (!keys.length){
		showPopUp("No data found in browser storage.<br>Please import a backup file or save a new configuration.", [], {easyClose: true});
	}else{
		keys = keys.sort();
		//console.error("storedConfigs", storedConfigs);		//DEBUG
		var content = document.createElement("div");
		var list = document.createElement("div");
		list.className = "list-container";
		keys.forEach(function(k){
			var cfg = storedConfigs[k];
			if (cfg.calc && cfg.calc != d4cType){
				return;
			}
			var loadFun = function(ev){
				if (onSelectCallback) onSelectCallback(cfg);
				popUp.popUpClose();
			};
			var item = document.createElement("div");
			item.className = "list-item button-style";
			item.setAttribute("tabindex", "0");
			item.addEventListener("click", loadFun);
			item.addEventListener('keypress', function(ev){
				if (ev.key === 'Enter' && ev.target == item) {
				  loadFun(ev);
				}
			});
			var itemDesc = document.createElement("div");
			itemDesc.className = "list-item-desc";
			itemDesc.textContent = cfg.name;
			item.appendChild(itemDesc);
			var delButton = document.createElement("button");
			delButton.textContent = "─";
			delButton.addEventListener("click", function(ev){
				ev.stopPropagation();
				if (confirm("Delete this entry from browser storage?")){
					deleteConfigFromLocalStorage(cfg.name);
					item.remove();
				}
			});
			item.appendChild(delButton);
			list.appendChild(item);
		});
		var info = document.createElement("p");
		info.innerHTML = "<p>Choose a configuration:</p>";
		var footer = document.createElement("div");
		var btnBox = document.createElement("div");
		btnBox.className = "group center buttons-box";
		var btnClearAll = document.createElement("button");
		btnClearAll.textContent = "CLEAR ALL";
		btnClearAll.addEventListener("click", function(){
			clearData();
			popUp.popUpClose();
		});
		var btnExportAll = document.createElement("button");
		btnExportAll.textContent = "EXPORT ALL";
		btnExportAll.addEventListener("click", function(){
			exportAllData();
			popUp.popUpClose();
		});
		btnBox.appendChild(btnClearAll);
		btnBox.appendChild(btnExportAll);
		footer.appendChild(btnBox);
		content.appendChild(info);
		content.appendChild(list);
		content.appendChild(footer);
		var popUp = showPopUp(content, [], {easyClose: true});
		return popUp;
	}
}

function readConfigsFromLocalStorage(){
	try {
		var storedDataStr = localStorage.getItem("d4-calc-data") || "{}";
		var storedData = JSON.parse(storedDataStr);
		return storedData.configurations || {};
	}catch(err){
		showPopUp("Failed to read from localStorage. Error: " + (err.message || err.name || err));
	}
}
function writeAllConfigsToLocalStorage(configs, keepOld){
	try {
		var storedDataStr = localStorage.getItem("d4-calc-data") || "{}";
		var storedData = JSON.parse(storedDataStr);
		if (keepOld){
			if (!storedData.configurations) storedData.configurations = {};
			Object.keys(configs).forEach(function(key){
				storedData.configurations[key] = configs[key];
			})
		}else{
			storedData.configurations = configs;
		}
		localStorage.setItem("d4-calc-data", JSON.stringify(storedData));
		showPopUp("All configurations restored from file.", [], {easyClose: true});
	}catch(err){
		showPopUp("Failed to write to localStorage. Error: " + (err.message || err.name || err));
	}
}
function writeConfigToLocalStorage(name, config){
	try {
		var storedDataStr = localStorage.getItem("d4-calc-data") || "{}";
		var storedData = JSON.parse(storedDataStr);
		if (!storedData.configurations) storedData.configurations = {};
		if (!name) name = "Unnamed";
		var key = name.replace(/\s+/g, "_").trim().toLowerCase();
		key += ("__" + d4cType);
		storedData.configurations[key] = {name: name, calc: d4cType, data: config};
		localStorage.setItem("d4-calc-data", JSON.stringify(storedData));
	}catch(err){
		showPopUp("Failed to write to localStorage. Error: " + (err.message || err.name || err));
	}
}
function deleteConfigFromLocalStorage(name){
	try {
		if (!name) return true;
		var storedDataStr = localStorage.getItem("d4-calc-data");
		if (!storedDataStr) return true;
		var storedData = JSON.parse(storedDataStr);
		if (!storedData.configurations) return true;
		Object.entries(storedData.configurations).forEach(([key, conf]) => {
			if (conf.name == name && (!conf.calc || conf.calc == d4cType)) delete storedData.configurations[key];
		});
		localStorage.setItem("d4-calc-data", JSON.stringify(storedData));
		return true;
	}catch(err){
		showPopUp("Failed to edit localStorage. Error: " + (err.message || err.name || err));
	}
}
function clearData(){
	if (!confirm("Are you sure you want to remove ALL cached data for ALL calculators?")){
		return;
	}
	localStorage.removeItem("d4-calc-data");
}

