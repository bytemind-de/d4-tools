var armorItemColor = "color-armor";
var armorItemColorAlt = "color-armor-alt";
var lifeItemColor = "color-life";
var lifeItemColorAlt = "color-life-alt";
var reductionModColor = "color-reduction-mod";
var reductionModColorLight = "color-reduction-mod-light";
var penaltyModColor = "color-penalty-mod";
var penaltyModColorLight = "color-penalty-mod-light";
var elementalResisColor = "color-elemental-resis";
var elementalResisColorAlt = "color-elemental-resis-alt";

var classSpecificValues = {
	"Barb": {},
	"Druid": {},
	"Necro": {},
	"Rogue": {},
	"Sorc": {},
	"Spiritborn": {}
}
	
function buildCalculator(containerEle, options){
	var Calculator = {
		id: ("calc-" + Date.now() + Math.round(Math.random() * 1000000)),
		container: containerEle,
		restoreData: restoreData,
		getData: getData
	};
	
	var charClassEle = containerEle.querySelector("[name=char-class]");
	charClassEle?.addEventListener("change", function(){
		disableCalculationBox();
	});
	var getCharClass = function(){ return charClassEle?.value || ""; };

	var baseLifeEle = containerEle.querySelector("[name=char-base-life]");
	var strengthEle = containerEle.querySelector("[name=char-strength]");
	var elementalResisEle = containerEle.querySelector("[name=elemental-resis-custom]");
	var isFortified = containerEle.querySelector("[name=char-is-fortified]");
	isFortified.addEventListener("click", function(){
		disableCalculationBox(); });
	
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
	var penaltyValuesContainer = containerEle.querySelector("[name=penalty-values-container]");
	var penaltyValuesBtn = containerEle.querySelector("[name=penalty-values-btn]");
	
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
		//var modName = newName || prompt("Enter a name for this value:");
		//if (!modName) return;
		//addDynamicMod(armorItemsContainer, modName, "border-col-armor", startValue, isDisabled, 1.0, undefined, selectedTypes, flatArmorLabelsList, onModUpdate);
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this value:",
			flatArmorLabelsList, undefined, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(armorItemsContainer, modName, "border-col-armor", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, flatArmorLabelsList, onModUpdate);
			}
		});
	}
	function addArmorPctValue(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this '%' modifier:");
		//if (!modName) return;
		//addDynamicMod(armorPctContainer, modName, "border-col-armor", startValue, isDisabled, 0.1, undefined, selectedTypes, pctArmorLabelsList, onModUpdate);
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this '%' modifier:",
			pctArmorLabelsList, undefined, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(armorPctContainer, modName, "border-col-armor", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, pctArmorLabelsList, onModUpdate);
			}
		});
	}
	function addMaxlifeItem(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this value:");
		//if (!modName) return;
		//addDynamicMod(maxlifeItemsContainer, modName, "border-col-life", startValue, isDisabled, 1.0, undefined, selectedTypes, flatLifeLabelsList, onModUpdate);
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this value:",
			flatLifeLabelsList, undefined, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(maxlifeItemsContainer, modName, "border-col-life", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, flatLifeLabelsList, onModUpdate);
			}
		});
	}
	function addMaxlifePctValue(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this '%' modifier:");
		//if (!modName) return;
		//addDynamicMod(maxlifePctContainer, modName, "border-col-life", startValue, isDisabled, 0.1, undefined, selectedTypes, pctLifeLabelsList, onModUpdate);
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this '%' modifier:",
			pctLifeLabelsList, undefined, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(maxlifePctContainer, modName, "border-col-life", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, pctLifeLabelsList, onModUpdate);
			}
		});
	}
	function addDrPctValue(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this damage reduction modifier:");
		//if (!modName) return;
		//addDynamicMod(drValuesContainer, modName, "reduction-mod-val", startValue, isDisabled, 0.1, undefined, selectedTypes, damageReductionLabelsList, onModUpdate);
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this damage reduction modifier:",
			damageReductionLabelsList, undefined, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(drValuesContainer, modName, "reduction-mod-val", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, damageReductionLabelsList, onModUpdate);
			}
		});
	}
	function addPenaltyPctValue(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this penalty modifier:");
		//if (!modName) return;
		//addDynamicMod(penaltyValuesContainer, modName, "penalty-mod-val", startValue, isDisabled, 0.1, undefined, selectedTypes, pctMoreDamageTakenLabelsList, onModUpdate);
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this penalty modifier:",
			pctMoreDamageTakenLabelsList, undefined, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(penaltyValuesContainer, modName, "penalty-mod-val", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, pctMoreDamageTakenLabelsList, onModUpdate);
			}
		});
	}
	
	function onModUpdate(data){
		disableCalculationBox();
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
	function getPenaltyModPcts(includeHidden){
		var factors = [];
		penaltyValuesContainer.querySelectorAll(".penalty-mod-val").forEach(ele => {
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
	
	function clearCalculation(){
		resultContainer.innerHTML = "";
		resultContainer.parentElement.style.display = "none";
	}
	function disableCalculationBox(){
		resultContainer.parentElement.style.opacity = 0.50;
	}
	function enableCalculationBox(){
		resultContainer.parentElement.style.removeProperty("display");
		resultContainer.parentElement.style.removeProperty("opacity");
	}
	
	function calculateDefense(){
		clearCalculation();
		enableCalculationBox();
		
		var data = getData();
		
		//armor
		var baseArmor = data.armorItems.reduce(function(totalAr, item){
			if (item.disabled) return totalAr;
			else {
				return (totalAr + item.armor);
			}
		}, 0);
		baseArmor += calculateArmorFromStrength(data.strength);
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
		var physicalDrFromArmor = calculateArmorDr(totalArmor, data.enemyLevel);
		addResult("Physical DR from armor (approx.)", Math.round(physicalDrFromArmor * 100).toLocaleString() + "%",
				undefined, armorItemColor, "Physical damage reduction based on total armor and enemy level.");
		var armorDiffToCap = calculateMissingOrExcessArmor(totalArmor, data.enemyLevel);
		addResult("Armor required for 85% cap", "" + Math.round(armorDiffToCap).toLocaleString(),
				undefined, armorItemColorAlt, "Approx. add. armor required to reach 85% DR cap.", true);
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
		addResult("Total life + barrier", maximumLifeMulti, undefined, lifeItemColor, "Total max. life after multiplicative modifiers including barrier.");
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
			dmgLeftPct *= 0.85;		//NOTE: updated for S4 with 15% instead of 10%
		}
		var totalDr = (1.0 - dmgLeftPct);
		addResult("Total damage reduction", Math.round(totalDr * 100).toLocaleString() + "%", undefined, reductionModColor,
				"Total damage reduction applying all percentages.");
		addCustom("<hr>", "flat");
		
		//damage penalties (e.g. glass cannon, etc.)
		var dmgPenaltyPct = data.damagePenalty.reduce(function(dmgPen, item){
			if (item.disabled) return dmgPen;
			else {
				return (dmgPen * (1.0 + item.pct/100));
			}
		}, 1.0);
		if (dmgPenaltyPct > 1.0){
			addResult("Total additional damage taken", Math.round(dmgPenaltyPct * 100 - 100).toLocaleString() + "%", undefined, penaltyModColor,
					"Total damage penalty applying all percentages.");
			addCustom("<hr>", "flat");
		}
		
		//effective life for all damage groups
		var effectiveLifeBase = maximumLife/dmgLeftPct * (1/dmgPenaltyPct);
		var effectiveLifeVsPhysical = effectiveLifeBase/(1.0 - physicalDrFromArmor);
		var effectiveLifeVsElemental = effectiveLifeBase/(1.0 - data.elementalResisSingle/100);
		addResult("Base effective life", effectiveLifeBase, undefined, reductionModColorLight,
			"Effective life with all defense properties applied.", true);
		addResult("Effective life vs elemental", effectiveLifeVsElemental, undefined, elementalResisColor,
			"Effective life vs selected elemental attacks with all defense properties applied.");
		addResult("Effective life vs physical", effectiveLifeVsPhysical, undefined, undefined,
			"Effective life against physical attacks with all defense properties applied.");
	}
	
	function calculateArmorFromStrength(strength){
		return strength/5;
	}
	function calculateArmorDr(playerArmor, playerAndMonsterLevel){
		//season 6 armor cap is 1000 now
		if (playerArmor >= 1000) return 0.85;
		else if (playerArmor <= 0) return 0.0;
		else{
			//New beta version formula (approx.):
			var c1 = (1.599 * Math.exp(playerAndMonsterLevel/8.901 - 8.680) + 1.025);
			var x = playerArmor/(3.13 * playerAndMonsterLevel) - 3.8;
			var dr = 85 * c1 * (Math.exp(x) / (1 + Math.exp(x))) - 3.0;
			return (Math.max(0, Math.min(0.85, dr/100)));
		}
	}
	function calculateMissingOrExcessArmor(initArmor, monsterLevel, lastArmor, searchDir){
		//season 6 is simple:
		return Math.max(0, 1000 - initArmor);
		/*
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
		}*/
	}
	
	function getData(){
		var data = {
			calculatorName: getTitle(),
			charClass: getCharClass(),
			baseLife: +baseLifeEle.value,
			strength: +strengthEle.value || 1,
			elementalResisSingle: +elementalResisEle.value || 0,
			isFortified: isFortified.checked,
			enemyLevel: +enemyLevelEle.value || 1,
			armorItems: getArmorItems(true),
			armorModifiers: getArmorModPcts(true),
			maxlifeItems: getMaxlifeItems(true),
			maxlifeModifiers: getMaxlifeModPcts(true),
			damageReduction: getReductionModPcts(true),
			damagePenalty: getPenaltyModPcts(true)
		}
		return data;
	}
	function restoreData(data, calculatorName){
		clearCalculation();
		
		if (charClassEle) charClassEle.value = data.charClass || "";
		baseLifeEle.value = data.baseLife || 400;
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
		penaltyValuesContainer.innerHTML = "";
		if (data.damagePenalty?.length){
			data.damagePenalty.forEach(function(itm){
				addPenaltyPctValue(itm.info, itm.pct, itm.disabled, itm.types);
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
	penaltyValuesBtn.addEventListener('click', function(){ addPenaltyPctValue(); });
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
	}else{
		clearCalculation();
	}
	//Add some DEMO values?
	if (options?.addDemoContent){
		addArmorItem("Helm", 100);
		addArmorItem("Chest", 140);
		addArmorItem("Gloves", 40);
		addArmorItem("Pants", 80);
		addArmorPctValue("Helm", 15);
		addMaxlifeItem("Helm", 0);
		addMaxlifeItem("Chest", 890);
		addMaxlifeItem("Gloves", 0);
		addMaxlifeItem("Pants", 662);
		addMaxlifeItem("Boots", 0);
		addMaxlifeItem("Amulet", 0);
		addMaxlifeItem("Ring", 662);
		addMaxlifeItem("Ring", 0);
		addMaxlifeItem("Weapons", 0);
		//addMaxlifePctValue("Ruby", 6);
		//addMaxlifePctValue("Ruby", 6);
		//addMaxlifePctValue("Ruby", 6);
		addMaxlifePctValue("Paragon Node", 4);
		addMaxlifePctValue("Paragon Node", 4);
		addMaxlifePctValue("Paragon Node", 2);
		addMaxlifePctValue("Paragon Node", 2);
		addMaxlifePctValue("Paragon Node", 2);
		addDrPctValue("DR vs All", 10);
		addDrPctValue("DR vs Elite", 12);
		addDrPctValue("DR vs Close", 24);
		addDrPctValue("DR vs Distant", 18, true);
		addPenaltyPctValue("Pass.: Class Cannon", 9, true);
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
			openCalculatorsFromData(fileType, data, false);
		});
	}
});
function openCalculatorsFromData(fileType, data, openList, calculatorNames){
	if (fileType == "singleConfig"){
		//create new calculator and add data
		if (data){
			var calc = addNewCalculator(false);
			calc.restoreData(data);
		}
	}else if (fileType == "configArray"){
		//open calculators or import?
		if (openList){
			//open calculators
			if (!calculatorNames?.length){
				//fill up with IDs
				calculatorNames = Object.keys(data);
			}
			calculatorNames.forEach(calcIdOrName => {
				var calcData = data[calcIdOrName];
				if (!calcData){
					calcData = Object.values(data).find(itm => itm?.name == calcIdOrName);
				}
				if (calcData?.calc == d4cType){
					var calc = addNewCalculator(false);
					calc.restoreData(calcData.data);
				}
			});
		}else{
			//add all configurations from file to storage
			if (confirm("Warning: This will overwrite existing configurations with the same name! Continue?")){
				var keepOld = true;
				writeAllConfigsToLocalStorage(data, keepOld);
			}
		}
	}
}

//Load calculators from file and or name?
checkUrlFileLoad(function(fileType, data){
	//on load
	console.log("Got data from file:", fileType, data);
	//what now?
	let promptText = "A file with calculators has been loaded.\nDo you want to open/import the data?";
	if (confirm(promptText) == true){
		//OK
		openCalculatorsFromData(fileType, data, false);
	}
	
}, function(fileType, data, calculatorNames){
	//on load and show selected
	console.log("Got data from file:", fileType, data);
	console.log("Show calculators:", calculatorNames);
	openCalculatorsFromData(fileType, data, true, calculatorNames);
	
}, function(){
	//on skip
	console.log("Ready");
	
	//Show a default calculator at start:
	//addNewCalculator(true, true);
});