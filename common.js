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

function loadScript(url) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = url;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}
async function loadScripts(urls) {
	for (const url of urls) {
		await loadScript(url);
	}
}
function loadCSS(url) {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = url;
	document.head.appendChild(link);
}
var isVisLibLoaded = false;
function loadVisLib(finishedCallback, errorCallback){
	if (isVisLibLoaded) finishedCallback();
	else {
		isVisLibLoaded = true;
		loadCSS("visualization/uPlot.min.css");
		loadScripts([
			"visualization/uPlot.iife.min.js",
			"visualization/uPlot-lazy.min.js",
			"visualization/uPlot-lazy-histogram.min.js"
			//visualization/uPlot-lazy-heatmap.min.js
		]).then(function(){
			finishedCallback();
		}).catch(function(err){
			if (errorCallback) errorCallback();
			else showPopUp("Failed to load visualization library!");
		});
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
	if (options?.width){
		popUpBox.style.width = options.width;
	}
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
	var isClosed = false;
	popUpOverlay.popUpClose = function(){
		if (isClosed) return;
		mainView.inert = false;	//release main
		document.body.classList.remove("disable-interaction");
		popUpOverlay.remove();
		isClosed = true;
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
		}else if (field.spacer){
			let ele = document.createElement("div");
			formSection.appendChild(ele);
		}
		if (field.input || field.checkbox){
			let ele = document.createElement("input");
			if (field.input){
				if (field.pattern){
					ele.pattern = field.pattern;
				}
				ele.value = field.value;
			}else if (field.checkbox){
				ele.type = "checkbox";
				formSection.classList.add("row");
				ele.checked = field.value;
			}
			if (field.required){
				ele.required = true;
			}
			if (field.title){
				ele.title = field.title;
			}
			ele.name = field.name || ("field" + i);
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
function showDataGraph(dataPoints, title){
	//prep. visualization
	var c = document.createElement("div");
	c.innerHTML = "Loading ...";
	var popup = showPopUp(c, [], {
		width: "auto"
	});
	loadVisLib(function(){
		var minDamage = Math.min(...dataPoints);
		var maxDamage = Math.max(...dataPoints);
		var avg1 = getAverage(dataPoints);
		var histResolution = 25;
		var hist = makeHistogram(dataPoints, minDamage, maxDamage, histResolution);
		var delta = hist[0][1] - hist[0][0];
		//console.error("hist", hist);	//DEBUG
		var g = document.createElement("div");
		g.className = "graph";
		c.innerHTML = "";
		c.appendChild(g);
		var plot = plotBarChart(g, minDamage - delta, maxDamage + delta, hist, title || "Histogram");
		const resizeObserver = new ResizeObserver((entries) => {
			//some (overly complicated) auto-scaling for the graph
			var popupOverlayRect = popup.getBoundingClientRect();
			var maxW = popupOverlayRect.width * 0.9 - 34;
			var maxH = popupOverlayRect.height - 78;
			var isLandscape = (maxW > maxH);
			if (!isLandscape) maxH = maxW;
			if (maxW > 640 && isLandscape){
				maxW = 640;
				maxH = (maxH > 512)? 512 : maxH;
			}
			g.style.width = maxW + "px";
			g.style.height = maxH + "px";
			uPlot.lazy.resizePlot(plot);
		});
		resizeObserver.observe(popup);
	}, function(){
		c.innerHTML = "ERROR - Failed to load visualization!";
	});
}
function getAverage(arr){
	var sum = arr.reduce((a, b) => a + b, 0);
	var avg = (sum / arr.length) || 0;
	return avg;
}
function makeHistogram(data, start, end, n){
	var hist = uPlot.lazy.histogram({
		data: data,
		//custom array or object:
		bins: {
			start: start, 
			end: end, 
			n: n
		}
	});
	return [hist.x, hist.y];
}
function plotBarChart(graphEle, xStart, xEnd, data, title){
	uPlot.lazy.chartBackground = "#000";
	uPlot.lazy.chartTextColor = "#D2C8AE";
	return uPlot.lazy.plot({
		targetElement: graphEle,
		title: title,
		drawType: "bars",
		stroke: "#a50905", //"#D2C8AE", //"#E24D42",
		strokeWidth: 1,
		fill: "#a50905AA", //"#E24D42AA",
		xRange: [xStart, xEnd],
		showPoints: false,
		showLegend: true,
		xLabel: "damage",
		yLabel: "count",
		//labelTransform: [function(u, xv, space){ return xv.map(t => t + "s"); }],
		//legendTransform: [function(u, t){ return (t + "s"); }],
		data: data
	});
}

function addDynamicMod(parentEle, modName, className, value, disabled, stepSize, selectableTypes, preselectedTypes){
	var newAddMod = document.createElement("div");
	newAddMod.className = "group limit-label calc-item";
	if (disabled){
		newAddMod.classList.add("hidden");
	}
	newAddMod.dataset.info = modName;
	var newAddModLabel = document.createElement("label");
	var newAddModLabelSpan = document.createElement("span");
	newAddModLabel.appendChild(newAddModLabelSpan);
	newAddModLabelSpan.style.cursor = "pointer";
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
	var typeBoxEle;
	var selectedTypes = preselectedTypes || [];
	if (selectableTypes){
		newAddModInput.dataset.selectedTypes = JSON.stringify(selectedTypes);
		typeBoxEle = document.createElement("div");
		typeBoxEle.className = "type-box";
		typeBoxEle.title = "Select one or more required 'types' for this item to in-/exclude it in certain calculations. No 'type' means it applies to all calculations.";
		//restore?
		addSelectableTypes(typeBoxEle, selectableTypes, selectedTypes);
		//type select UI
		typeBoxEle.addEventListener("click", function(){
			//create options
			var options = [{
				label: typeBoxEle.title
			}];
			selectableTypes.forEach(function(itm){
				options.push({
					checkbox: true, label: itm.name, name: itm.value,
					value: (selectedTypes.indexOf(itm.value) >= 0),
					title: "Select this value to assign the item the type '" + itm.value + "'."
				});
			});
			options.push({spacer: true}, {submit: true, name: "Ok"});
			//show popup
			showFormPopUp(options, function(formData){
				var newTypeSet = [];
				selectableTypes.forEach(function(itm){
					var newType = !!formData.get(itm.value);
					if (newType){
						newTypeSet.push(itm.value);
					}
				});
				//add elements
				addSelectableTypes(typeBoxEle, selectableTypes, newTypeSet);
				//set state
				newAddModInput.dataset.selectedTypes = JSON.stringify(newTypeSet);
				selectedTypes = newTypeSet;
			});
		});
	}
	newAddMod.appendChild(newAddModLabel);
	if (typeBoxEle) newAddMod.appendChild(typeBoxEle);
	newAddMod.appendChild(newAddModInput);
	newAddMod.appendChild(newAddModHide);
	newAddMod.appendChild(newAddModRemove);
	parentEle.appendChild(newAddMod);
	bytemind.dragdrop.addMoveHandler(newAddMod, parentEle, newAddModLabel);
}
function addSelectableTypes(typeBoxEle, selectableTypes, newTypeSet){
	typeBoxEle.innerHTML = "";		//clean up
	typeBoxEle.classList.remove("bigger");
	if (!newTypeSet.length){
		//add one empty indicator
		let typeEle = document.createElement("div");
		typeEle.className = "type-element empty";
		typeBoxEle.appendChild(typeEle);
		return;
	}
	selectableTypes.forEach(function(itm){
		if (newTypeSet.indexOf(itm.value) >= 0){
			let typeEle = document.createElement("div");
			typeEle.className = "type-element";
			if (itm.className) typeEle.classList.add(itm.className);
			if (itm.color) typeEle.style.background = itm.color;
			typeBoxEle.appendChild(typeEle);
		}
	});
	if (newTypeSet.length > 3){
		typeBoxEle.classList.add("bigger");
	}
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
			//filter calc. type
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
		storedData.configurations[key] = {name: name, calc: d4cType, version: d4cVersion, data: config};
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

