//TODO: common.js has been split when the 2nd calculator was introduced. It should probably become a module now to clean up the scope.

//URL parameter handling:

const startUrlParams = new URLSearchParams(window.location.search);
const urlParamColorScheme = startUrlParams.get('color');
const urlParamSingleColumn = startUrlParams.get('singleColumn');
const urlParamDetailedInfo = startUrlParams.get('detailedInfo');
const urlParamLoadFile = startUrlParams.get('loadFile');
const urlParamShowFile = startUrlParams.get('showFile');
const urlParamLoadCalc = startUrlParams.get('loadCalc');

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
function loadJSON(url) {
	return fetch(url).then(response => {
		if (response.status != 200){
			var msg = response.statusText || (response.status == 404? "File not found" : "");
			throw {message: msg, code: response.status, response: response};
		}else{
			return response.json();
		}
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
var navMenu = document.body.querySelector(".nav-menu");
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

function toggleNavMenu(){
	if (navMenu.classList.contains("hidden")){
		navMenu.classList.remove("hidden");
		optionsMenu.classList.add("hidden");
	}else{
		navMenu.classList.add("hidden");
	}
}
function toggleOptionsMenu(){
	if (optionsMenu.classList.contains("hidden")){
		optionsMenu.classList.remove("hidden");
		navMenu.classList.add("hidden");
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
	//buttons
	if (buttons && buttons.length){
		//TODO: implement
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
	var formEle = document.createElement("form");
	var customData = {};
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
		
		}else if (field.select){
			let ele = document.createElement("select");
			let optGroups = {};
			field.select.options?.forEach(function(opt){
				var optGrp;
				if (opt.group){
					optGrp = optGroups[opt.group];
					if (!optGrp){
						optGrp = document.createElement("optgroup");
						optGrp.label = opt.group;
						optGroups[opt.group] = optGrp;
						ele.add(optGrp);
					}
				}
				var optEle = document.createElement("option");
				optEle.value = opt.value == undefined? (opt.name || opt.label) : opt.value;
				optEle.text = opt.name || opt.label;
				if (optGrp){
					optGrp.appendChild(optEle);
				}else{
					ele.add(optEle);
				}
			});
			if (field.title){
				ele.title = field.title;
			}
			if (field.select.onChange){
				ele.addEventListener("change", function(){
					field.select.onChange(ele.value);
				});
			}
			ele.value = field.value;
			ele.name = field.name || ("field" + i);
			formSection.appendChild(ele);
		
		}else if (field.customElement){
			formSection.appendChild(field.customElement);
		
		}else if (field.customButton){
			let ele = document.createElement("input");
			ele.type = "button";
			ele.className = "button-style";
			ele.value = field.customButton.name || "Press";
			ele.addEventListener("click", function(){ 
				if (field.customButton.fun) field.customButton.fun();
			});
			formSection.appendChild(ele);
		}
		if (field.submit){
			let ele = document.createElement("input");
			ele.type = "submit";
			ele.className = "button-style";
			ele.value = field.name || "Submit";
			formSection.appendChild(ele);
		}
		formEle.appendChild(formSection);
	});
	formEle.addEventListener("submit", function(ev){
		ev.preventDefault();
		var formData = new FormData(ev.target);
		if (onSubmit) onSubmit(formData, customData);
		popUp.popUpClose();
	});
	var popUp = showPopUp(formEle, [], {easyClose: false});
	return {popUp, form: formEle};
}
function showList(items, options, onSelectCallback){
	var content = document.createElement("div");
	content.style.cssText = "display: flex; flex-direction: column; max-height: 100%;";
	var list = document.createElement("div");
	list.className = "list-container";
	var addedGroupLabels = {};
	items.forEach(function(itm){
		var loadFun = function(ev){
			if (onSelectCallback) onSelectCallback(itm);
			popUp.popUpClose();
		};
		var item = document.createElement("div");
		item.className = "list-item smaller-item button-style";
		item.setAttribute("tabindex", "0");
		item.addEventListener("click", loadFun);
		item.addEventListener('keypress', function(ev){
			if (ev.key === 'Enter' && ev.target == item) {
			  loadFun(ev);
			}
		});
		var itemDesc = document.createElement("div");
		itemDesc.className = "list-item-desc";
		itemDesc.textContent = itm.name || itm.label;
		item.appendChild(itemDesc);
		if (itm.group){
			if (!addedGroupLabels[itm.group]){
				let label = document.createElement("label");
				label.className = "list-label";
				addedGroupLabels[itm.group] = label;
				label.textContent = itm.group;
				list.appendChild(label);
			}
		}
		list.appendChild(item);
	});
	if (options?.infoText){
		var info = document.createElement("p");
		info.textContent = options.infoText;
		content.appendChild(info);
	}
	content.appendChild(list);
	if (options?.footerText){
		var footer = document.createElement("p");
		footer.textContent = options.footerText;
		content.appendChild(footer);
	}
	var popUp = showPopUp(content, [], {easyClose: false});
	return {popUp, list};
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
	var isDark = document.documentElement.classList.contains("dark");
	uPlot.lazy.chartBackground = isDark? "#000" : "#fff";
	uPlot.lazy.chartTextColor = isDark? "#D2C8AE" : "#000";
	var fontSize = 12;
	if (xEnd > 999999) fontSize = 10;
	else if (xEnd > 9999) fontSize = 11;
	return uPlot.lazy.plot({
		targetElement: graphEle,
		title: title,
		drawType: "bars",
		stroke: isDark? "#a50905" : "#4F0100", //"#D2C8AE", //"#E24D42",
		strokeWidth: 1,
		fill: isDark? "#a50905AA" : "#a50905FF", //"#E24D42AA",
		xRange: [xStart, xEnd],
		showPoints: false,
		showLegend: true,
		xLabel: "damage",
		yLabel: "count",
		axisStroke: isDark? "#D2C8AE" : "#000",	//"#c7d0d9"
		axisGridStroke: isDark? "#3A3830" : "#ccc", //"#2c3235",
		axisFont: (fontSize + "px sans-serif"),
		//labelTransform: [function(u, xv, space){ return xv.map(t => t + "s"); }],
		//legendTransform: [function(u, t){ return (t + "s"); }],
		legendTransform: [function(u, t){
			if (t > 999.9) return Number(t).toLocaleString(undefined, {maximumFractionDigits: 0});
			else return Number(t).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1});
		}],
		data: data
	});
}

function addDynamicMod(parentEle, modName, className, value, disabled, stepSize, selectableTypes, preselectedTypes, searchList, onChange){
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
		//edit item by clicking the label
		addDynamicModPromptPromise(newAddModLabelSpan.textContent.replace(/:$/, ""), "", searchList, selectableTypes, selectedTypes)
		.then(function(data){
			var newName = data.name;
			if (newName){
				modName = newName;
				newAddMod.dataset.info = newName;
				newAddModLabelSpan.textContent = newName + ":";
				updateSelectableType(undefined, data.entry?.types);
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
	newAddModInput.addEventListener("change", function(){
		if (onChange) onChange(getData());
	});
	var newAddModRemove = document.createElement("button");
	newAddModRemove.textContent = "─";
	newAddModRemove.title = "remove";
	newAddModRemove.addEventListener("click", function(){
		newAddMod.remove();
		if (onChange) onChange({label: modName, value: null, isDisabled: true});
	});
	var newAddModHide = document.createElement("button");
	newAddModHide.innerHTML = "&#128065;";
	newAddModHide.title = "disable";
	newAddModHide.addEventListener("click", function(){
		toggleDisableCalcItem(newAddMod, newAddModInput, newAddModHide, 0);
		if (onChange) onChange(getData());
	});
	var typeBoxEle;
	var selectedTypes = preselectedTypes || [];
	var updateSelectableType = function(stFormData, stArray){
		var newTypeSet = [];
		selectableTypes?.forEach(function(itm){
			var newType = stFormData? !!stFormData.get(itm.value) : stArray.includes(itm.value);	//check form or array
			if (newType){
				newTypeSet.push(itm.value);
			}
		});
		//add elements
		addSelectableTypes(typeBoxEle, selectableTypes, newTypeSet);
		//set state
		newAddModInput.dataset.selectedTypes = JSON.stringify(newTypeSet);
		selectedTypes = newTypeSet;
		//event
		if (onChange) onChange(getData());
	}
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
			var options = buildSelectableTypeOptions(typeBoxEle.title, selectableTypes, selectedTypes);
			options.push({spacer: true}, {submit: true, name: "Ok"});
			//show popup
			showFormPopUp(options, function(formData){
				updateSelectableType(formData, []);
			});
		});
	}
	var getData = function(){
		return {
			label: modName,
			value: newAddModInput.value,
			isDisabled: newAddMod.classList.contains("hidden"),
			selectedTypes: selectedTypes
		};
	}
	newAddMod.appendChild(newAddModLabel);
	if (typeBoxEle) newAddMod.appendChild(typeBoxEle);
	newAddMod.appendChild(newAddModInput);
	newAddMod.appendChild(newAddModHide);
	newAddMod.appendChild(newAddModRemove);
	parentEle.appendChild(newAddMod);
	bytemind.dragdrop.addMoveHandler(newAddMod, parentEle, newAddModLabel);
}
function addDynamicModPromptPromise(initValue, promptText, searchList, selectableTypes, selectedTypes){
	//Prompt to input name for new item and optionally select types
	return new Promise((resolve) => {
		var formPopUp;
		var selectButton = undefined;
		var selectElement = undefined;
		if (searchList?.length){
			/* selectButton = {
				name: "Search Name (BETA)", fun: function(){
					showList(searchList, {}, function(itm){
						var nameInput = formPopUp.form.elements["name"];
						if (nameInput) nameInput.value = itm.label;
					});
				}
			}; */
			var selectOptions = [{name: "- Select (BETA) -", value: ""}];
			var charClassFilter = ("getCharClass" in window)? getCharClass() : "";
			searchList.forEach(function(itm){
				if (!charClassFilter || !itm.group || itm.group == "All" || itm.group == charClassFilter){
					selectOptions.push({
						name: itm.label, group: itm.group, value: JSON.stringify(itm)
					});
				}
			});
			selectElement = {
				options: selectOptions,
				onChange: function(json){
					var data = JSON.parse(json || "{}");
					var nameInput = formPopUp.form.elements["name"];
					if (nameInput) nameInput.value = data.label || "";
					if (data.label){
						//formPopUp.popUp.popUpClose();
						//resolve({name: data.label, entry: data});
						selectedTypes = data.types;
						selectableTypes?.forEach(function(itm){
							formPopUp.form.elements[itm.value].checked = selectedTypes.includes(itm.value)? true : false;
						});
					}
				}
			};
		}
		var formConfig = [
			{input: true, label: promptText || "Name:", name: "name", required: true, value: initValue, title: "Name for this modifier."}
		];
		if (selectButton) formConfig.push({customButton: selectButton});
		if (selectElement) formConfig.push({select: selectElement, label: "Or select one from the list:", name: "names-selector", value: "", title: "Select a name from this predefined list."});
		if (selectButton || selectElement) formConfig.push({spacer: true});
		if (selectableTypes?.length){
			let typeOptions = buildSelectableTypeOptions("Select required 'types' (optional):", selectableTypes, selectedTypes || []);
			typeOptions.push({spacer: true});
			formConfig.push(...typeOptions);
		}
		formConfig.push({submit: true, name: "Ok"});
		formPopUp = showFormPopUp(formConfig, function(formData){
			var newName = formData.get("name").trim();
			selectedTypes = [];
			selectableTypes?.forEach(function(itm){
				var newType = !!formData.get(itm.value);
				if (newType){
					selectedTypes.push(itm.value);
				}
			});
			resolve({name: newName, entry: {label: newName, types: selectedTypes}});
		});
	});
}
function buildSelectableTypeOptions(label, selectableTypes, selectedTypes){
	var options = [{
		label: label
	}];
	selectableTypes.forEach(function(itm){
		options.push({
			checkbox: true, label: itm.name, name: itm.value,
			value: (selectedTypes.indexOf(itm.value) >= 0),
			title: "Select this value to make '" + itm.value + "' a required property for the item."
		});
	});
	return options;
}
function addSelectableTypes(typeBoxEle, selectableTypes, newTypeSet){
	//add visual type indicators to item element
	if (!typeBoxEle) return;
	typeBoxEle.innerHTML = "";		//clean up
	typeBoxEle.classList.remove("bigger");
	if (!newTypeSet.length){
		//add one empty indicator
		let typeEle = document.createElement("div");
		typeEle.className = "type-element empty";
		typeBoxEle.appendChild(typeEle);
		return;
	}
	selectableTypes?.forEach(function(itm){
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

function toggleDisableCalcItem(calcItem, inputEle, toggleButton, disableStyle){
	//disableStyle: 0=fade whole item, 1=make input look fixed
	if (disableStyle == 1){
		if (inputEle.disabled){
			inputEle.disabled = false;
			return 1;
		}else{
			inputEle.disabled = true;
			return 0;
		}
	}else{
		if (calcItem.classList.contains("hidden")){
			calcItem.classList.remove("hidden");
			return 1;
		}else{
			calcItem.classList.add("hidden");
			return 0;
		}
	}
}
function setCalcItemToDisabled(calcItem, inputEle, toggleButton, disableStyle){
	if (disableStyle == 1){
		inputEle.disabled = true;
	}else{
		calcItem.classList.add("hidden");
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
	console.log("exportAllData result:", data);		//DEBUG
	saveAs("d4-calc-all_" + now + ".json", data);
}
function importConfigurationFromFile(file, onDataCallback){
	const reader = new FileReader();
	reader.onload = () => {
		const content = reader.result;
		if (content){
			var contentJson = JSON.parse(content);
			importConfigurationFromJson(contentJson, onDataCallback);
		}
	};
	reader.readAsText(file);
}
function importConfigurationFromUrl(url, onDataCallback){
	loadJSON(url).then(json => {
		importConfigurationFromJson(json, onDataCallback);
	})
	.catch(err => {
		console.error("importConfigurationFromUrl - Failed to load JSON from URL:", url, "Error:", err);
		if (err?.message && err.code){
			showPopUp("Tried to load calculator(s) from URL but failed.<br>Error: " + err.message + " (" + err.code + ")");
		}else{
			showPopUp("Tried to load calculator(s) from URL but failed.<br>See console for detailed error.");
		}
	});
}
function importConfigurationFromJson(contentJson, onDataCallback){
	if (contentJson?.singleConfig){
		if (onDataCallback) onDataCallback("singleConfig", contentJson.singleConfig);
	}else if (contentJson?.configArray || contentJson.allConfigs){
		if (onDataCallback) onDataCallback("configArray",
			contentJson.configArray || contentJson.allConfigs);
	}else{
		showPopUp("Could not import data.<br>Unknown file format.");
	}
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
		content.style.cssText = "display: flex; flex-direction: column; max-height: 100%;";
		var list = document.createElement("div");
		list.className = "list-container";
		var n = 0;
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
			n++;
		});
		if (n == 0){
			list.innerHTML = "<p>- Found no stored data for this calculator -<br><br></p>";
		}
		var info = document.createElement("div");
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

function checkUrlFileLoad(onLoadFile, onShowFile, onSkip){
	if (urlParamLoadFile){
		updateUrlParameter("loadFile", "", false);
		updateUrlParameter("showFile", "", false);
		importConfigurationFromUrl(urlParamLoadFile, function(fileType, data){
			if (urlParamShowFile == "true" || urlParamShowFile == "1" || urlParamLoadCalc){
				var loadCalcNames = getCalculatorNamesFromUrlParam();
				updateUrlParameter("loadCalc", "", false);
				onShowFile(fileType, data, loadCalcNames);
			}else{
				onLoadFile(fileType, data);
			}
		});
	}else{
		onSkip();
	}
}
function getCalculatorNamesFromUrlParam(){
	var loadCalcNames = undefined;
	if (urlParamLoadCalc){
		if (urlParamLoadCalc.trim().indexOf("[") == 0){
			loadCalcNames = JSON.parse(urlParamLoadCalc);
		}else{
			loadCalcNames = [urlParamLoadCalc.trim()];
		}
	}
	return loadCalcNames;
}
