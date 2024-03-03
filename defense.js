var armorItemColor = "color-armor";
var armorItemColorAlt = "color-armor-alt";
var lifeItemColor = "color-life";
var lifeItemColorAlt = "color-life-alt";
var reductionModColor = "color-reduction-mod";
var reductionModColorLight = "color-reduction-mod-light";
var elementalResisColor = "color-elemental-resis";
var elementalResisColorAlt = "color-elemental-resis-alt";
	
function buildCalculator(containerEle, options){
	var Calculator = {
		id: ("calc-" + Date.now() + Math.round(Math.random() * 1000000)),
		container: containerEle,
		restoreData: restoreData,
		getData: getData
	};

	var baseLifeEle = containerEle.querySelector("[name=char-base-life]");
	var strengthEle = containerEle.querySelector("[name=char-strength]");
	var elementalResisEle = containerEle.querySelector("[name=elemental-resis-custom]");
	var isFortified = containerEle.querySelector("[name=char-is-fortified]");
	
	var armorItemsContainer = containerEle.querySelector("[name=armor-items-container]");
	var armorItemsBtn = containerEle.querySelector("[name=armor-items-btn]");
	var armorPctContainer = containerEle.querySelector("[name=armor-pct-container]");
	var armorPctBtn = containerEle.querySelector("[name=armor-pct-btn]");
	var maxlifeItemsContainer = containerEle.querySelector("[name=maxlife-items-container]");
	var maxlifeItemsBtn = containerEle.querySelector("[name=maxlife-items-btn]");
	var maxlifePctContainer = containerEle.querySelector("[name=maxlife-pct-container]");
	var maxlifePctBtn = containerEle.querySelector("[name=maxlife-pct-btn]");
	var drValuesContainer = containerEle.querySelector("[name=dr-values-container]");
	var drValuesBtn = containerEle.querySelector("[name=dr-values-btn]");
	
	var enemyLevelEle = containerEle.querySelector("[name=enemy-level]");
	
	var resultContainer = containerEle.querySelector("[name=result-container]");
	var calculateBtn = containerEle.querySelector("[name=calculate-data-btn]");
	//var doCalcFortify = containerEle.querySelector("[name=do-calc-fortify]");
	
	var saveBtn = containerEle.querySelector("[name=save-btn]");
	var loadBtn = containerEle.querySelector("[name=load-btn]");
	var exportBtn = containerEle.querySelector("[name=export-btn]");
	var importDataSelector = containerEle.querySelector(".import-data-selector");
	var closeBtn = containerEle.querySelector("[name=close-btn]");
	
	var titleField = containerEle.querySelector("[name=calc-title]");
	var titleSection = titleField.closest('.section');
	var infoFooter = containerEle.querySelector("[name=info-footer]");
	
	var currentConfigName = "";
	
	function chooseTitle(){
		showFormPopUp([
			{label: "Enter a name for this configuration:", input: true, name: "name", required: true,
				value: currentConfigName, title: "Please use [a-zA-Z0-9\\s_\\-]", pattern: "[a-zA-Z0-9\\s_\\-]+"},
			{submit: true, name: "Set"}
		], function(formData){
			var newTitle = formData.get("name").trim();
			if (newTitle){
				setTitle(newTitle);
			}
		});
	}
	function setTitle(newTitle){
		currentConfigName = newTitle;
		titleField.textContent = newTitle;
	}
	function getTitle(){
		return currentConfigName;
	}
	
	function addArmorItem(newName, startValue, isDisabled, selectedTypes){
		var modName = newName || prompt("Enter a name for this value:");
		if (!modName) return;
		addDynamicMod(armorItemsContainer, modName, "border-col-armor", startValue, isDisabled, 1.0, undefined, selectedTypes);
	}
	function addArmorPctValue(newName, startValue, isDisabled, selectedTypes){
		var modName = newName || prompt("Enter a name for this '%' modifier:");
		if (!modName) return;
		addDynamicMod(armorPctContainer, modName, "border-col-armor", startValue, isDisabled, 0.1, undefined, selectedTypes);
	}
	function addMaxlifeItem(newName, startValue, isDisabled, selectedTypes){
		var modName = newName || prompt("Enter a name for this value:");
		if (!modName) return;
		addDynamicMod(maxlifeItemsContainer, modName, "border-col-life", startValue, isDisabled, 1.0, undefined, selectedTypes);
	}
	function addMaxlifePctValue(newName, startValue, isDisabled, selectedTypes){
		var modName = newName || prompt("Enter a name for this '%' modifier:");
		if (!modName) return;
		addDynamicMod(maxlifePctContainer, modName, "border-col-life", startValue, isDisabled, 0.1, undefined, selectedTypes);
	}
	function addDrPctValue(newName, startValue, isDisabled, selectedTypes){
		var modName = newName || prompt("Enter a name for this damage reduction modifier:");
		if (!modName) return;
		addDynamicMod(drValuesContainer, modName, "reduction-mod-val", startValue, isDisabled, 0.1, undefined, selectedTypes);
	}
	
	function getArmorItems(includeHidden){
		var items = [];
		armorItemsContainer.querySelectorAll(".border-col-armor").forEach(ele => {
			if (ele.value && (includeHidden || !ele.parentElement.classList.contains("hidden"))){
				items.push({
					armor: +ele.value,
					info: ele.parentElement.dataset.info,
					disabled: ele.parentElement.classList.contains("hidden"),
					types: JSON.parse(ele.dataset?.selectedTypes || "[]")
				});
			}
		});
		return items;
	}
	function getArmorModPcts(includeHidden){
		var factors = [];
		armorPctContainer.querySelectorAll(".border-col-armor").forEach(ele => {
			if (ele.value && (includeHidden || !ele.parentElement.classList.contains("hidden"))){
				factors.push({
					pct: +ele.value,
					info: ele.parentElement.dataset.info,
					disabled: ele.parentElement.classList.contains("hidden"),
					types: JSON.parse(ele.dataset?.selectedTypes || "[]")
				});
			}
		});
		return factors;
	}
	function getMaxlifeItems(includeHidden){
		var items = [];
		maxlifeItemsContainer.querySelectorAll(".border-col-life").forEach(ele => {
			if (ele.value && (includeHidden || !ele.parentElement.classList.contains("hidden"))){
				items.push({
					life: +ele.value,
					info: ele.parentElement.dataset.info,
					disabled: ele.parentElement.classList.contains("hidden"),
					types: JSON.parse(ele.dataset?.selectedTypes || "[]")
				});
			}
		});
		return items;
	}
	function getMaxlifeModPcts(includeHidden){
		var factors = [];
		maxlifePctContainer.querySelectorAll(".border-col-life").forEach(ele => {
			if (ele.value && (includeHidden || !ele.parentElement.classList.contains("hidden"))){
				factors.push({
					pct: +ele.value,
					info: ele.parentElement.dataset.info,
					disabled: ele.parentElement.classList.contains("hidden"),
					types: JSON.parse(ele.dataset?.selectedTypes || "[]")
				});
			}
		});
		return factors;
	}
	function getReductionModPcts(includeHidden){
		var factors = [];
		drValuesContainer.querySelectorAll(".reduction-mod-val").forEach(ele => {
			if (ele.value && (includeHidden || !ele.parentElement.classList.contains("hidden"))){
				factors.push({
					pct: +ele.value,
					info: ele.parentElement.dataset.info,
					group: ele.parentElement.dataset.group,
					disabled: ele.parentElement.classList.contains("hidden"),
					types: JSON.parse(ele.dataset?.selectedTypes || "[]")
				});
			}
		});
		return factors;
	}
	
	function addResult(info, val, modFactor, colorClass, tooltip, isDetail, enableTooltipPopup){
		if (!colorClass) colorClass = "";
		var grp = document.createElement("div");
		grp.className = "group flat limit-label-2";
		if (isDetail){
			grp.classList.add("detail");
		}
		var valStr = (typeof val == "string")? val : Math.round(val).toLocaleString();
		grp.innerHTML = (
			"<label>" + info + (modFactor? (" (×" + Number(modFactor).toFixed(2) + ")") : "") 
			+ ":</label><span>" 
			+ "<b class='" + colorClass + "'>" + valStr + "</b></span>"
		);
		if (tooltip){
			grp.title = tooltip;
		}
		if (tooltip && enableTooltipPopup){
			//grp.classList.add("has-info");
			grp.firstChild.classList.add("has-info");
			grp.firstChild.addEventListener("click", () => { showPopUp(tooltip); });
		}
		resultContainer.appendChild(grp);
	}
	function addCustom(str, addClass){
		var div = document.createElement("div");
		div.className = "group";
		if (addClass) div.className += " " + addClass;
		div.innerHTML = str;
		resultContainer.appendChild(div);
	}
	
	function calculateDefense(){
		resultContainer.innerHTML = "";
		resultContainer.parentElement.style.removeProperty('display');
		
		var data = getData();
		
		//armor
		var baseArmor = data.armorItems.reduce(function(totalAr, item){
			if (item.disabled) return totalAr;
			else {
				return (totalAr + item.armor);
			}
		}, 0);
		baseArmor += data.strength;
		addResult("Base armor", baseArmor, undefined, armorItemColor, "Base armor resulting from gear, gems, strength and paragon etc.");
		var totalArmor = data.armorModifiers.reduce(function(totalAr, item){
			if (item.disabled) return totalAr;
			else {
				var addArmor = baseArmor * (item.pct/100);
				addResult("+ " + item.info, addArmor, undefined, armorItemColorAlt,
					"Contribution of this item.", true);
				return (totalAr + addArmor);
			}
		}, baseArmor);
		addResult("Total armor", totalArmor, undefined, armorItemColor, "Total armor including all modifiers.");
		var physicalDrFromArmor = Math.min(0.85, calculateArmorDr(totalArmor, data.enemyLevel));
		addResult("Physical DR vs lvl " + data.enemyLevel + " monsters", Math.round(physicalDrFromArmor * 100).toLocaleString() + "%",
				undefined, armorItemColor, "Physical damage reduction based on total armor and enemy level.");
		var armorDiffToCap = calculateMissingOrExcessArmor(totalArmor, data.enemyLevel);
		addResult("Armor required for 85% cap", "approx. " + Math.round(armorDiffToCap).toLocaleString(),
				undefined, armorItemColorAlt, "Approx. armor required to reach 85% DR cap vs given monster level.\nBased on findings and formula by SkyLineOW.", true);
		addCustom("<hr>", "flat");
		
		//life
		var baseLife = data.baseLife;
		addResult("Base life", baseLife, undefined, lifeItemColorAlt, "Life determined by your character level.", true);
		var maximumLifeBase = data.maxlifeItems.reduce(function(totalHp, item){
			if (item.disabled) return totalHp;
			else {
				return (totalHp + item.life);
			}
		}, baseLife);
		addResult("Base maximum life", maximumLifeBase, undefined, lifeItemColor, "Life after additional flat life boni.");
		var maximumLifeMulti = data.maxlifeModifiers.reduce(function(totalHp, item){
			if (item.disabled) return totalHp;
			else {
				var addLife = totalHp * (item.pct/100);
				addResult("+ " + item.info, addLife, undefined, lifeItemColorAlt,
					"Flat contribution of the modifier at this specific point in the calculation (depends on the order).", true);
				return (totalHp + addLife);
			}
		}, maximumLifeBase);
		addResult("Total maximum life", maximumLifeMulti, undefined, lifeItemColor, "Total life after multiplicative modifiers.");
		addCustom("<hr>", "flat");
		var maximumLife = maximumLifeMulti;
		
		//total DR - TODO: split in groups? (all, close, distant, affected by dots, fortified etc.)
		var dmgLeftPct = data.damageReduction.reduce(function(dmgLeft, item){
			if (item.disabled) return dmgLeft;
			else {
				return (dmgLeft * (1.0 - item.pct/100)); 
			}
		}, 1.0);
		if (data.isFortified){
			dmgLeftPct *= 0.9;
		}
		var totalDr = (1.0 - dmgLeftPct);
		addResult("Total damage reduction", Math.round(totalDr * 100).toLocaleString() + "%", undefined, reductionModColor,
				"Total damage reduction applying all percentages.");
		addCustom("<hr>", "flat");
		
		//effective life for all damage groups
		var effectiveLifeBase = maximumLife/dmgLeftPct;
		var effectiveLifeVsPhysical = effectiveLifeBase/(1.0 - physicalDrFromArmor);
		var effectiveLifeVsElemental = effectiveLifeBase/(1.0 - data.elementalResisSingle/100);
		addResult("Base effective life", effectiveLifeBase, undefined, reductionModColorLight,
			"Effective life with all defense properties applied.", true);
		addResult("Effective life vs elemental", effectiveLifeVsElemental, undefined, elementalResisColor,
			"Effective life vs selected elemental attacks with all defense properties applied.");
		addResult("Effective life vs physical", effectiveLifeVsPhysical, undefined, undefined,
			"Effective life against physical attacks with all defense properties applied.");
	}
	
	function calculateArmorDr(playerArmor, monsterLevel){
		//Reference by SkyLineOW:
		//https://www.reddit.com/r/Diablo/comments/152gd9u/i_mostly_cracked_the_d4_armor_formula_and_made_a/
		var w0 = 24.95675343;
		var w1 = 1.57703526;
		var w2 = 0.1713152031;
		var w3 = 1.202030852;
		var w4 = 49.91077422;
		var w5 = 0.06294813546;
		var w6 = 0.3086344059;
		var diff = Math.max(0, playerArmor - monsterLevel * w0);
		var slope =  w1 / monsterLevel;
		var corr = Math.max(0, (monsterLevel - w4) / w5) ** w6;
		return (((diff * w2) ** w3 * slope) + corr) / 100;
	}
	function calculateMissingOrExcessArmor(initArmor, monsterLevel, lastArmor, searchDir){
		//brute force search for best armor
		if (lastArmor == undefined) lastArmor = initArmor;
		var thisDr = calculateArmorDr(lastArmor, monsterLevel);
		if (thisDr < 0.85){
			if (!searchDir) searchDir = 1;
			else if (searchDir == -1) return lastArmor;
			lastArmor += 5;
			return calculateMissingOrExcessArmor(initArmor, monsterLevel, lastArmor, searchDir);
		}else if (thisDr > 0.85){
			if (!searchDir) searchDir = -1;
			else if (searchDir == 1) return lastArmor;
			lastArmor -= 5;
			return calculateMissingOrExcessArmor(initArmor, monsterLevel, lastArmor, searchDir);
		}else{
			return lastArmor;
		}
	}
	
	function getData(){
		var data = {
			calculatorName: getTitle(),
			baseLife: +baseLifeEle.value,
			strength: +strengthEle.value || 1,
			elementalResisSingle: +elementalResisEle.value || 0,
			isFortified: isFortified.checked,
			enemyLevel: +enemyLevelEle.value || 1,
			armorItems: getArmorItems(true),
			armorModifiers: getArmorModPcts(true),
			maxlifeItems: getMaxlifeItems(true),
			maxlifeModifiers: getMaxlifeModPcts(true),
			damageReduction: getReductionModPcts(true)
		}
		return data;
	}
	function restoreData(data, calculatorName){
		resultContainer.innerHTML = "";
		baseLifeEle.value = data.baseLife || 5000;
		strengthEle.value = data.strength || 1;
		elementalResisEle.value = data.elementalResisSingle || 0;
		isFortified.checked = data.isFortified;
		enemyLevelEle.value = data.enemyLevel || 1;
		armorItemsContainer.innerHTML = "";
		if (data.armorItems?.length){
			data.armorItems.forEach(function(itm){
				addArmorItem(itm.info, itm.armor, itm.disabled, itm.types);
			});
		}
		armorPctContainer.innerHTML = "";
		if (data.armorModifiers?.length){
			data.armorModifiers.forEach(function(itm){
				addArmorPctValue(itm.info, itm.pct, itm.disabled, itm.types);
			});
		}
		maxlifeItemsContainer.innerHTML = "";
		if (data.maxlifeItems?.length){
			data.maxlifeItems.forEach(function(itm){
				addMaxlifeItem(itm.info, itm.life, itm.disabled, itm.types);
			});
		}
		maxlifePctContainer.innerHTML = "";
		if (data.maxlifeModifiers?.length){
			data.maxlifeModifiers.forEach(function(itm){
				addMaxlifePctValue(itm.info, itm.pct, itm.disabled, itm.types);
			});
		}
		drValuesContainer.innerHTML = "";
		if (data.damageReduction?.length){
			data.damageReduction.forEach(function(itm){
				addDrPctValue(itm.info, itm.pct, itm.disabled, itm.types);
			});
		}
		setTitle(calculatorName || data.calculatorName || "Unnamed Calculator");
	}
	
	function saveData(){
		var data = getData();
		showFormPopUp([
			{label: "Enter a name for this configuration:", input: true, name: "name",
				value: currentConfigName, title: "Allowed characters: a-Z,0-9,_,- and space",
				pattern: "[a-zA-Z0-9\\s_\\-]+", required: true},
			{submit: true, name: "Save"}
		], function(formData){
			var name = formData.get("name").trim();
			setTitle(name);
			writeConfigToLocalStorage(name, data);
			showPopUp("Configuration has been saved to browser storage.", [], {easyClose: true});
		});
	}
	function loadData(){
		createStoredCalculatorsPopUp(function(cfg){
			restoreData(cfg.data, cfg.name);
			//showPopUp("Configuration '" + cfg.name + "' restored from browser storage.", [], {easyClose: true});
			//resultContainer.parentElement.style.removeProperty("display");
		});
	}
	
	function exportData(){
		var data = {
			singleConfig: getData()
		};
		var now = (new Date()).toISOString().split(".")[0].replace(/(T|:|\.)/g, "_");
		console.error("exportData", data);	//DEBUG
		saveAs("d4-defense-calc-config_" + now + ".json", data);
	}
	function importData(file){
		importConfigurationFromFile(file, function(fileType, data){
			if (fileType == "singleConfig"){
				//load data from file to this calculator
				restoreData(data);
			}else if (fileType == "configArray"){
				//add all configurations from file to storage
				if (confirm("Warning: This will overwrite existing configurations with the same name! Continue?")){
					var keepOld = true;
					writeAllConfigsToLocalStorage(data, keepOld);
				}
			}
		});
	}
	
	titleSection.addEventListener('click', chooseTitle);
	
	armorItemsBtn.addEventListener('click', function(){ addArmorItem(); });
	armorPctBtn.addEventListener('click', function(){ addArmorPctValue(); });
	maxlifeItemsBtn.addEventListener('click', function(){ addMaxlifeItem(); });
	maxlifePctBtn.addEventListener('click', function(){ addMaxlifePctValue(); });
	drValuesBtn.addEventListener('click', function(){ addDrPctValue(); });
	calculateBtn.addEventListener('click', calculateDefense);
	saveBtn.addEventListener('click', saveData);
	loadBtn.addEventListener('click', loadData);
	exportBtn.addEventListener('click', exportData);
	importDataSelector.addEventListener('change', function(ev){
		const file = ev.target.files[0];
		if (file){
			importData(file);
		}
	});
	closeBtn.addEventListener("click", function(){
		closeCalculator(Calculator.id);
	});
	
	
	//Restore data?
	if (options?.cfg){
		restoreData(cfg.data, cfg.name);
	}
	//Add some DEMO values?
	if (options?.addDemoContent){
		addArmorItem("Chest", 1450);
		addArmorItem("Pants", 850);
		addArmorPctValue("Helm", 24);
		addArmorPctValue("Chest", 28.5);
		addMaxlifeItem("Helm", 1159);
		addMaxlifeItem("Ring", 1310);
		addMaxlifePctValue("Ruby 4%", 4);
		addMaxlifePctValue("Ruby 4%", 4);
		addMaxlifePctValue("Paragon Node 4%", 4);
		addMaxlifePctValue("Paragon Node 2%", 2);
		addDrPctValue("DR vs All", 10);
		addDrPctValue("DR vs Close", 24);
		addDrPctValue("DR vs Distant", 18, true);
	}
	//Show/hide footer?
	if (!options?.showFooter){
		infoFooter.remove();
	}
	
	return Calculator;
}

var calculatorTemplate = document.getElementById("calculator-template").innerHTML;

var activeCalculators = {};
//TODO: properly scope 'contentPage' when common.js is "fixed"
contentPage.querySelectorAll(".content-box").forEach(ele => ele.remove());
contentPage.classList.add("empty");

function addNewContentBox(){
	var c = document.createElement("div");
	c.className = "content-box calculator-instance";
	c.innerHTML = calculatorTemplate;
	contentPage.appendChild(c);
	
	//automatically add info pop-ups
	c.querySelectorAll(".has-info").forEach(function(ele){
		ele.addEventListener("click", function(){
			var text = ele.title || ele.parentElement?.title || ele.parentElement?.parentElement?.title;
			if (text){
				showPopUp(text);
			}
		});
	});
	
	return c;
}
function addNewCalculator(addDemoContent, showFooter){
	var cb = addNewContentBox();
	var calc = buildCalculator(cb, {
		addDemoContent: addDemoContent,
		showFooter: showFooter
	});
	activeCalculators[calc.id] = calc;
	var numOfCalcs = Object.keys(activeCalculators).length;
	if (numOfCalcs == 0){
		contentPage.classList.add("empty");
		contentPage.classList.remove("single-instance");
	}else if (numOfCalcs == 1){
		contentPage.classList.remove("empty");
		contentPage.classList.add("single-instance");
	}else{
		contentPage.classList.remove("single-instance");
		contentPage.classList.remove("empty");
	}
	return calc;
}
function loadStoredCalculator(){
	createStoredCalculatorsPopUp(function(cfg){
		//create a new calculator and restore data
		if (cfg?.data){
			var calc = addNewCalculator(false);
			calc.restoreData(cfg.data, cfg.name);
		}
	});
}
function closeCalculator(calcId){
	var calc = activeCalculators[calcId];
	if (calc){
		calc.container.remove();
		delete activeCalculators[calcId];
	}
	var numOfCalcs = Object.keys(activeCalculators).length;
	if (numOfCalcs == 0){
		contentPage.classList.add("empty");
		contentPage.classList.remove("single-instance");
	}else if (numOfCalcs == 1){
		contentPage.classList.remove("empty");
		contentPage.classList.add("single-instance");
	}else{
		contentPage.classList.remove("single-instance");
		contentPage.classList.remove("empty");
	}
}

var noConImportDataSelector = contentPage.querySelector(".no-content-menu .import-data-selector");
noConImportDataSelector.addEventListener('change', function(ev){
	const file = ev.target.files[0];
	if (file){
		importConfigurationFromFile(file, function(fileType, data){
			if (fileType == "singleConfig"){
				//create new calculator and add data
				if (data){
					var calc = addNewCalculator(false);
					calc.restoreData(data);
				}
			}else if (fileType == "configArray"){
				//add all configurations from file to storage
				if (confirm("Warning: This will overwrite existing configurations with the same name! Continue?")){
					var keepOld = true;
					writeAllConfigsToLocalStorage(data, keepOld);
				}
			}
		});
	}
});

//Show a default calculator at start:
//addNewCalculator(true, true);
