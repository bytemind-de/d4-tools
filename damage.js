var addModColor = "color-add-mod";
var addModColorLight = "color-add-mod-light";
var multiModColor = "color-multi-mod";
var multiModColorLight = "color-multi-mod-light";
var reductionModColor = "color-reduction-mod";
var reductionModColorLight = "color-reduction-mod-light";
var vulnerableColor = "color-vulnerable";
var critColor = "color-crit";
var overpowerColor = "color-overpower";
var overpowerCritColor = "color-op-crit";

const TYPE_KEY_CORE = "core";
const TYPE_VULNERABLE = "vulnerable";
const TYPE_CRIT = "crit";
const TYPE_OVERPOWER = "overpower";

var selectableDamageTypes = [
	{name: "Vulnerable Enemy", value: TYPE_VULNERABLE, className: vulnerableColor, color: ""},
	{name: "Critical Strike", value: TYPE_CRIT, className: critColor, color: ""},
	{name: "Overpower Strike", value: TYPE_OVERPOWER, className: overpowerColor, color: ""}
	//{name: "Test", value: "test", className: "", color: "#0f0"}
];

var classSpecificValues = {
	"Barbarian": {mainStatScaling: 5},
	"Druid": {mainStatScaling: 4},
	"Necro": {mainStatScaling: 4},
	"Rogue": {mainStatScaling: 4.5},
	"Sorc": {mainStatScaling: 4},
	"Spiritborn": {mainStatScaling: 4}
}
var defaultMainStatScaling = 5;

function buildCalculator(containerEle, options){
	var Calculator = {
		id: ("calc-" + Date.now() + Math.round(Math.random() * 1000000)),
		container: containerEle,
		restoreData: restoreData,
		getData: getData
	};

	var charClassEle = containerEle.querySelector("[name=char-class]");
	charClassEle?.addEventListener("change", function(){
		updateClassSpecificValues();
		//disableCalculationBox();	//NOTE: done with global change listener now
	});
	var getCharClass = function(){ return charClassEle?.value || ""; };
	
	var baseDamageEle = containerEle.querySelector("[name=base-damage]");
	var attackSpeedEle = containerEle.querySelector("[name=attack-speed]");
	var skillDamageEle = containerEle.querySelector("[name=skill-damage]");
	var mainStatEle = containerEle.querySelector("[name=main-stat]");
	var mainStatDmgEle = containerEle.querySelector("[name=main-stat-dmg]");
	mainStatEle.addEventListener("change", function(){
		updateClassSpecificValues();
	});
	var baseLifeEle = containerEle.querySelector("[name=char-base-life]");
	var maxLifeEle = containerEle.querySelector("[name=char-max-life]");
	var vulnerableDamageEle = containerEle.querySelector("[name=vulnerable-damage]");
	var vulnerableDamageLockEle = containerEle.querySelector("[name=vulnerable-damage-lock]");
	vulnerableDamageLockEle.addEventListener("click", function(){
		toggleDisableCalcItem(vulnerableDamageEle.parentElement, vulnerableDamageEle, vulnerableDamageLockEle, 1);
	});
	setCalcItemToDisabled(vulnerableDamageEle.parentElement, vulnerableDamageEle, vulnerableDamageLockEle, 1);
	var vulnerableDamageAddEle = containerEle.querySelector("[name=vulnerable-damage-add]");
	var overpowerDamageEle = containerEle.querySelector("[name=overpower-damage]");
	var overpowerDamageLockEle = containerEle.querySelector("[name=overpower-damage-lock]");
	overpowerDamageLockEle.addEventListener("click", function(){
		toggleDisableCalcItem(overpowerDamageEle.parentElement, overpowerDamageEle, overpowerDamageLockEle, 1);
	});
	setCalcItemToDisabled(overpowerDamageEle.parentElement, overpowerDamageEle, overpowerDamageLockEle, 1);
	var overpowerDamageAddEle = containerEle.querySelector("[name=overpower-damage-add]");
	var overpowerOnNthAttackEle = containerEle.querySelector("[name=overpower-nth-attack]");
	var isFortified = containerEle.querySelector("[name=char-is-fortified]");
	var critDamageEle = containerEle.querySelector("[name=critical-damage]");
	var critDamageLockEle = containerEle.querySelector("[name=critical-damage-lock]");
	critDamageLockEle.addEventListener("click", function(){
		toggleDisableCalcItem(critDamageEle.parentElement, critDamageEle, critDamageLockEle, 1);
	});
	setCalcItemToDisabled(critDamageEle.parentElement, critDamageEle, critDamageLockEle, 1);
	var critDamageAddEle = containerEle.querySelector("[name=critical-damage-add]");
	var critChanceEle = containerEle.querySelector("[name=critical-hit-chance]");
	
	var addModifiersContainer = containerEle.querySelector("[name=add-modifiers-container]");
	var addModifierBtn = containerEle.querySelector("[name=add-modifier-btn]");
	var multiModifiersContainer = containerEle.querySelector("[name=multi-modifiers-container]");
	var multiModifierBtn = containerEle.querySelector("[name=multi-modifier-btn]");
	var reductionModifiersContainer = containerEle.querySelector("[name=reduction-modifiers-container]");
	var reductionModifierBtn = containerEle.querySelector("[name=reduction-modifier-btn]");
	
	var resultContainer = containerEle.querySelector("[name=result-container]");
	var simulationContainer = containerEle.querySelector("[name=simulation-container]");
	var simulationHitsNumEle = containerEle.querySelector("[name=simulation-hits-num]");
	var calculateBtn = containerEle.querySelector("[name=calculate-data-btn]");
	var simDpsBtn = containerEle.querySelector("[name=simulate-dps-btn]");
	var doCalcCrit = containerEle.querySelector("[name=do-calc-crit]");
	var doCalcVulnerable = containerEle.querySelector("[name=do-calc-vulnerable]");
	var doCalcOverpower = containerEle.querySelector("[name=do-calc-overpower]");
	
	//set refresh listeners
	containerEle.querySelectorAll('[data-refresh-calc="true"]').forEach(function(ele){
		ele.addEventListener("change", function(){
			disableCalculationBox();
		});
	});	
	
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
	
	function addAdditiveMod(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this '+' modifier:");
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this '+' modifier:",
			additiveDamageLabelsList, selectableDamageTypes, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(addModifiersContainer, modName, "add-mod-val", startValue, isDisabled, 1.0,
					selectableDamageTypes, selectedTypes || data.entry?.types, additiveDamageLabelsList, onModUpdate);
			}
		});
	}
	function addMultiplierMod(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this '×' modifier:");
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this '×' modifier:",
			multiplicativeDamageLabelsList, selectableDamageTypes, selectedTypes, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(multiModifiersContainer, modName, "multi-mod-val", startValue, isDisabled, 1.0,
					selectableDamageTypes, selectedTypes || data.entry?.types, multiplicativeDamageLabelsList, onModUpdate);
			}
		});
	}
	function addReductionMod(newName, startValue, isDisabled, selectedTypes){
		//var modName = newName || prompt("Enter a name for this damage reduction modifier:");
		Promise.resolve(newName? {name: newName} : addDynamicModPromptPromise("", "Enter a name for this damage reduction modifier:",
			undefined, undefined, undefined, getCharClass()))
		.then(function(data){
			var modName = data.name;
			if (modName){
				addDynamicMod(reductionModifiersContainer, modName, "reduction-mod-val", startValue, isDisabled, 1.0,
					undefined, selectedTypes || data.entry?.types, undefined, onModUpdate);
			}
		});
	}
	
	function onModUpdate(data){
		disableCalculationBox();
	}
	
	function getAdditiveModPcts(includeHidden){
		var factors = [];
		addModifiersContainer.querySelectorAll(".add-mod-val").forEach(ele => {
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
	function getMultiModPcts(includeHidden){
		var factors = [];
		multiModifiersContainer.querySelectorAll(".multi-mod-val").forEach(ele => {
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
		reductionModifiersContainer.querySelectorAll(".reduction-mod-val").forEach(ele => {
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
	
	function updateClassSpecificValues(){
		var mainStatScaling = (classSpecificValues[getCharClass()] || {}).mainStatScaling || defaultMainStatScaling;
		mainStatDmgEle.value = (mainStatEle.value / mainStatScaling).toFixed(1);
	}
	
	function clearCalculation(){
		resultContainer.innerHTML = "";
		resultContainer.parentElement.style.display = "none";
		simulationContainer.parentElement.style.display = "none";
	}
	function disableCalculationBox(){
		resultContainer.parentElement.style.opacity = 0.50;
		simulationContainer.parentElement.style.display = "none";
	}
	function enableCalculationBox(){
		resultContainer.parentElement.style.removeProperty("display");
		resultContainer.parentElement.style.removeProperty("opacity");
		simulationContainer.parentElement.style.removeProperty('display');
	}
	
	function calculateDamage(){
		clearCalculation();
		enableCalculationBox();
		updateClassSpecificValues();
		
		var charClass = getCharClass();
		
		var totalDamage = 0;
		var storedDamage = {};
		var baseDamage = +baseDamageEle.value || 0;
		var attackSpeed = +attackSpeedEle.value || 1.0;
		var hasModifier = doCalcVulnerable.checked || doCalcCrit.checked || doCalcOverpower.checked;
		
		var skillDamageFactor = (+skillDamageEle.value || 0.0) / 100;
		totalDamage = baseDamage * skillDamageFactor;
		addResult("Skill base damage", totalDamage, skillDamageFactor, undefined,
			"Average base damage done with the given weapon and skill.");
		addCustom("<hr>", "flat");
		
		//var mainStatFactor = 1.0 + (+mainStatEle.value || 0.0) / 1000;	//NOTE: changed in S5
		var mainStatFactor = 1.0 + (+mainStatDmgEle.value || 0.0) / 100;
		totalDamage = totalDamage * mainStatFactor;		//baseDamage * skillDamageFactor * ...
		var coreDamage = totalDamage;
		addResult("Main stat.", totalDamage, mainStatFactor, undefined,
			"Damage including main stat factor.");
		addCustom("<hr>", "flat");
		
		var includedDamage = getIncludedDamageTypesAndKey(doCalcVulnerable.checked, doCalcCrit.checked, doCalcOverpower.checked);
		var includedDamageTypes = includedDamage.types;
		var includedDamageTypesKey = includedDamage.key;
		
		//additive damage:
		var additiveDamageFactorsByTypes = {};		//cache to avoid multiple calculations of same types
		var addModFactor = calculateAdditiveDamageFactor({
			includeTypes: includedDamageTypes,
			showResultDetails: true,
			referenceDamage: coreDamage	//NOTE: only required for 'showResultDetails'
		});
		additiveDamageFactorsByTypes[includedDamageTypesKey] = addModFactor;
		totalDamage *= addModFactor;	//baseDamage * skillDamageFactor * mainStatFactor * ...
		//we also calculate the core additive factor (if not already done in previous step):
		var addModFactorCore = loadOrCalculateAdditiveDamageFactor([], additiveDamageFactorsByTypes);
		var coreDamageWithAdd = coreDamage * addModFactorCore;
		
		//show results after additive damage calc.
		if (hasModifier){
			addResult("Core damage after add. mod.", coreDamageWithAdd, addModFactorCore, addModColor,
				"Core damage (no vulnerable/crit./overpower) after all additive modifiers have been applied.", false, true);
		}
		addResult("Max. damage after add. mod.", totalDamage, addModFactor, addModColor,
			"Max. damage for most powerful hit, after all additive modifiers have been applied.", false, true);
		
		addCustom("<hr>", "flat");
		
		//multiplicative damage:
		var multiplicativeDamageFactorsByTypes = {};		//cache to avoid multiple calculations of same types
		var multiModFactor = calculateMultiplicativeDamageFactor({
			includeTypes: includedDamageTypes,
			showResultDetails: true,
			referenceDamage: totalDamage //NOTE: only required for 'showResultDetails'
		});
		multiplicativeDamageFactorsByTypes[includedDamageTypesKey] = multiModFactor;
		totalDamage *= multiModFactor;	//baseDamage * skillDamageFactor * mainStatFactor * addModFactor * ...
		storedDamage[includedDamageTypesKey] = totalDamage;
		//we also calculate the core additive factor (if not already done in previous step):
		var multiModFactorCore = loadOrCalculateMultiplicativeDamageFactor([], multiplicativeDamageFactorsByTypes);
		var coreDamageWithAddAndMulti = coreDamageWithAdd * multiModFactorCore;
		storedDamage[TYPE_KEY_CORE] = coreDamageWithAddAndMulti;
		
		//show results after multipl. damage calc.
		if (hasModifier){
			addResult("Core damage after multipliers", coreDamageWithAddAndMulti, multiModFactorCore, multiModColor,
				"Core damage (no vulnerable/crit./overpower) after all additive and multiplicative modifiers have been applied.", false, true);
		}
		addResult("Max. damage after multipliers", totalDamage, multiModFactor, multiModColor,
			"Max. damage for most powerful hit, after all additive and multiplicative modifiers have been applied.", false, true);
		
		addCustom("<hr>", "flat");
		
		//combination before reduction:
		var vulnerableDamageFactor = (1.0 + (+vulnerableDamageEle.value || 0.0) / 100);
		var critDamageFactor = (1.0 + (+critDamageEle.value || 0.0) / 100);
		var critChance = (+critChanceEle.value || 0)/100;
		var overpowerDamageFactor = (1.0 + (+overpowerDamageEle.value || 0.0) / 100);
		var everyNthOverpower = +overpowerOnNthAttackEle.value;
		if (doCalcVulnerable.checked){
			totalDamage *= vulnerableDamageFactor;
			storedDamage[includedDamageTypesKey] = totalDamage;
			let includeDamage = getIncludedDamageTypesAndKey(true, false, false);
			let vulnerableBaseDamage = calculateFullDamageForGivenTypes(includeDamage, vulnerableDamageFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			//let addModFactorVulnerable = loadOrCalculateAdditiveDamageFactor([TYPE_VULNERABLE], additiveDamageFactorsByTypes);
			//let multiModFactorVulnerable = loadOrCalculateMultiplicativeDamageFactor([TYPE_VULNERABLE], multiplicativeDamageFactorsByTypes);
			//let vulnerableBaseDamage = coreDamage * addModFactorVulnerable * multiModFactorVulnerable * vulnerableDamageFactor;
			//storedDamage[TYPE_VULNERABLE] = vulnerableBaseDamage;	//NOTE: we might already have this, but we set it again for simplicity
			let effectiveVulnerableDamageFactor = vulnerableBaseDamage/coreDamageWithAddAndMulti;
			addResult("Damage to vulnerable enemies", vulnerableBaseDamage, effectiveVulnerableDamageFactor, vulnerableColor,
				"Damage done to vulnerable enemies (no crit, no overpower) including previous modifiers for type vulnerable. " 
				+ "Base factor: " + Number(vulnerableDamageFactor).toFixed(2) 
				+ ", effective factor: " + Number(effectiveVulnerableDamageFactor).toFixed(2) + ".", false, true);
			addCustom("<hr>", "flat");
		}
		if (doCalcCrit.checked){
			//var critDamageAdditiveAsFactorIncVul = 1.0 + ((+critDamageAddEle.value || 0.0) / (addModFactor * vulnerableDamageAdditiveAsFactor)) / 100;	//it is in add. pool now
			totalDamage *= critDamageFactor;
			storedDamage[includedDamageTypesKey] = totalDamage;
			let includeDamage = getIncludedDamageTypesAndKey(false, true, false);
			let critBaseDamage = calculateFullDamageForGivenTypes(includeDamage, critDamageFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			let effectiveCritDamageFactor = critBaseDamage/coreDamageWithAddAndMulti;
			addResult("Damage with critical hit", critBaseDamage, effectiveCritDamageFactor, critColor,
				"Damage done with critical hits (not vulnerable, no overpower) including previous modifiers for type crit. "
				+ "Base factor: " + Number(critDamageFactor).toFixed(2) 
				+ ", effective factor: " + Number(effectiveCritDamageFactor).toFixed(2) + ".", false, true);
			/*
			let previousBaseDamage = coreDamage * addModFactor * multiModFactor;
			var critChancePct = +critChanceEle.value || 0;
			var averageHitDamageFactoringCritChance = (1.0 - critChancePct/100) * previousBaseDamage + (critChancePct/100 * critBaseDamage);
			var critChanceFactor = averageHitDamageFactoringCritChance / previousBaseDamage;
			addResult("Avg. base dmg. with crit chance", averageHitDamageFactoringCritChance, critChanceFactor, critColor,
				"Average damage of a critical hit (not vulnerable, no overpower), factoring in the critical hit chance, " 
				+ "e.g. 30% crit chance means (70% core damage + 30% crit damge).", false, true);
			*/
			addCustom("<hr>", "flat");
		}
		if (doCalcOverpower.checked){
			totalDamage *= overpowerDamageFactor;
			storedDamage[includedDamageTypesKey] = totalDamage;
			let includeDamage = getIncludedDamageTypesAndKey(false, false, true);
			let overpowerBaseDamage = calculateFullDamageForGivenTypes(includeDamage, overpowerDamageFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			let effectiveOverpowerDamageFactor = overpowerBaseDamage/coreDamageWithAddAndMulti;
			//let overpowerChanceFactor = 1.0/(+overpowerOnNthAttackEle.value || 10000);		//NOTE: we consider every n-th attack as 1/n chance to do add. damage
			addResult("Damage with overpower", overpowerBaseDamage, effectiveOverpowerDamageFactor, overpowerColor,
				"Damage done with overpower hits without modifiers like crit. or vulnerable, but including previous modifiers for type overpower. "
				+ "Base factor: " + Number(overpowerDamageFactor).toFixed(2) 
				+ ", effective factor: " + Number(effectiveOverpowerDamageFactor).toFixed(2) + ".", false, true);
			addCustom("<hr>", "flat");
		}
		if (!hasModifier){
			addResult("Total max. damage per hit", totalDamage, undefined, undefined,
				"Total max. damage possible per hit with all the given modifiers combined, but before any damage reduction penalties.", false, true);
		}else{
			addResult("Total max. damage per hit", totalDamage, undefined, undefined,
				"Total max. damage per hit with all the given modifiers combined, but before any damage reduction penalties.", false, true);
		}
		addCustom("<hr>", "flat");
				
		//monster damage reduction
		var reductionModPcts = getReductionModPcts();
		var reductionModFactor = 1.0;		//NOTE: this is global for all types right now
		if (reductionModPcts.length){
			reductionModPcts.forEach(function(reductMod){
				var thisFactor = 1.0 - (reductMod.pct/100);
				reductionModFactor *= thisFactor;
				addResult(reductMod.info, totalDamage * reductionModFactor, thisFactor, reductionModColor,
					"Max. damage after this and all previous reduction factors have been applied.", false, false);
			});
			totalDamage *= reductionModFactor;	//baseDamage * skillDamageFactor * mainStatFactor * addModFactor * multiModFactor ...
			addCustom("<hr>", "flat");
		}
		//apply to all stored
		Object.keys(storedDamage).forEach(function(key){
			storedDamage[key] *= reductionModFactor;
		});
		
		//final results
		var perHitColor = undefined;
		if (doCalcCrit.checked && doCalcOverpower.checked){
			perHitColor = overpowerCritColor;
		}else if (doCalcOverpower.checked){
			perHitColor = overpowerColor;
		}else if (doCalcCrit.checked){
			perHitColor = critColor;
		}else if (doCalcVulnerable.checked){
			perHitColor = vulnerableColor;
		}
		addResult("Expected damage per hit", totalDamage, undefined, perHitColor,
			"Final result for single (best) hit damage to monsters based on your average weapon damage.\n" 
			+ "Note: Your in-game numbers can be around 25% lower/higher, depending on your min/max damage roll for weapon and skill at cast.", false, true);
		
		//calculate average damage
		var timeAvgDamageBase = storedDamage[TYPE_KEY_CORE];
		if (doCalcVulnerable.checked){
			//vulnerable becomes the new core since we don't give it a "chance"
			let includeDamage = getIncludedDamageTypesAndKey(true, false, false);
			let thisDamage = calculateFullDamageForGivenTypes(includeDamage, vulnerableDamageFactor * reductionModFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			timeAvgDamageBase = thisDamage;
		}
		if (doCalcCrit.checked && !doCalcOverpower.checked){
			//only crit
			let includeDamage = getIncludedDamageTypesAndKey(doCalcVulnerable.checked, true, false);
			let thisDamage = calculateFullDamageForGivenTypes(includeDamage, critDamageFactor * reductionModFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			//factor with crit. chance
			timeAvgDamageBase = calculateAverageDamageBasedOnChance(timeAvgDamageBase, thisDamage, critChance);
		}else if (!doCalcCrit.checked && doCalcOverpower.checked){
			//only overpower
			let includeDamage = getIncludedDamageTypesAndKey(doCalcVulnerable.checked, false, true);
			let thisDamage = calculateFullDamageForGivenTypes(includeDamage, overpowerDamageFactor * reductionModFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			//factor with overpower "chance"
			let overpowerChance = 1/everyNthOverpower;		//NOTE: we treat every n-th hit as a "chance"
			timeAvgDamageBase = calculateAverageDamageBasedOnChance(timeAvgDamageBase, thisDamage, overpowerChance);
		}else if (doCalcCrit.checked && doCalcOverpower.checked){
			//crit and overpower
			let includeDamageCrit = getIncludedDamageTypesAndKey(doCalcVulnerable.checked, true, false);
			let thisDamageCrit = calculateFullDamageForGivenTypes(includeDamageCrit, critDamageFactor * reductionModFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			let includeDamageOp = getIncludedDamageTypesAndKey(doCalcVulnerable.checked, false, true);
			let thisDamageOp = calculateFullDamageForGivenTypes(includeDamageOp, overpowerDamageFactor * reductionModFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			let includeDamageCritOp = getIncludedDamageTypesAndKey(doCalcVulnerable.checked, true, true);
			let thisDamageCritOp = calculateFullDamageForGivenTypes(includeDamageCritOp, critDamageFactor * overpowerDamageFactor * reductionModFactor, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			//get combined chances
			let overpowerChanceRaw = 1/everyNthOverpower;
			let onlyCoreChance = (1.0 - critChance) * (1.0 - overpowerChanceRaw);
			let onlyCritChance = critChance * (1.0 - overpowerChanceRaw);
			let onlyOverpowerChance = (1.0 - critChance) * overpowerChanceRaw;
			let critOpChance = critChance * overpowerChanceRaw;
			//make sure chances are correct
			let testChance = (onlyCoreChance + onlyCritChance + onlyOverpowerChance + critOpChance);
			if (testChance < 0.99 || testChance > 1.01){
				console.error("ERROR in DPS calculation: The combined chances are not 1.0. DPS set to 0.");
				timeAvgDamageBase = 0;
			}else{
				//factor with ALL chances
				timeAvgDamageBase = onlyCoreChance * timeAvgDamageBase 
					+ onlyCritChance * thisDamageCrit 
					+ onlyOverpowerChance * thisDamageOp 
					+ critOpChance * thisDamageCritOp;
			}
		}
		timeAvgDamageBase *= attackSpeed;
		addResult("Average DPS", timeAvgDamageBase, undefined, undefined,
			"Average damage per second, if you cast the skill as fast as possible over a few seconds without resource issues. " 
			+ "Includes critical strike chance and every n-th overpower hit, if check-boxes are selected.", false, true);
		
		//simulate average damage
		runSimulation = function(steps){
			var N = steps || 100000;
			console.log("Starting simulation ...");		//DEBUG
			var loadPop;
			if (N > 1000000) loadPop = showPopUp("Simulating DPS (" + N + " attacks) ...");
			setTimeout(function(){
				damageSimulation(N, coreDamage, storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes,
						reductionModFactor, function(averageDps, simTime, dataPoints){
					console.log("All stored damage:", storedDamage);		//DEBUG
					console.log("Average DPS:", averageDps);				//DEBUG
					console.log("Simulation time (ms):", simTime);			//DEBUG
					addResult("Average DPS (sim.: " + N + ")", averageDps, undefined, undefined,
						"Average damage per second, if you cast the skill as fast as possible over a few seconds without resource issues. " 
						+ "Includes critical strike chance and every n-th overpower hit, if check-boxes are selected.", false, true);
					if (loadPop){
						var uxDelay = (simTime > 1500)? 0 : (1500 - simTime);
						setTimeout(function(){
							loadPop.popUpClose();
						}, uxDelay);
					}
					//show graph
					if (dataPoints?.length){
						var title = "Damage Sim. (" + N + " attacks)";
						showDataGraph(dataPoints, title);
					}
				});
			}, 0);
		}
	}
	function getIncludedDamageTypesAndKey(doVulnerable, doCrit, doOverpower){
		var includedDamageTypes = [];
		if (doVulnerable) includedDamageTypes.push(TYPE_VULNERABLE);
		if (doCrit) includedDamageTypes.push(TYPE_CRIT);
		if (doOverpower) includedDamageTypes.push(TYPE_OVERPOWER);
		//NOTE: 'includedDamageTypesKey' depends on order, so always stick to the same (vul, crit, op)!
		var includedDamageTypesKey = includedDamageTypes.length? includedDamageTypes.join("+") : TYPE_KEY_CORE;
		return {
			types: includedDamageTypes,
			key: includedDamageTypesKey
		}
	}
	function calculateAdditiveDamageFactor(options){
		//options: includeTypes, showResultDetails, referenceDamage
		var additiveDamageFactor = 1.0;
		var addModBaseDamage = options.referenceDamage || 1;
		var includeTypes = options.includeTypes || [];	//e.g.: vulnerable, crit, overpower
		var showResultDetails = options.showResultDetails;
		var addModPcts = getAdditiveModPcts();
		if (addModPcts.length){
			addModPcts.forEach(function(addMod){
				if (!addMod.types?.length || addMod.types.every((t) => includeTypes.includes(t))){
					var thisFactor = (addMod.pct/100);
					var thisDamage = addModBaseDamage * thisFactor;
					additiveDamageFactor += thisFactor;
					if (showResultDetails){
						addResult("+ " + addMod.info, thisDamage, undefined, addModColorLight,
							"Contribution of this add. value alone.", true);
					}
				}
			});
		}
		//calculate extras (vul./crit/op additive damage ...)
		if (includeTypes.includes(TYPE_VULNERABLE) && vulnerableDamageAddEle.value){
			let thisFactor = (+vulnerableDamageAddEle.value/100);
			let thisDamage = addModBaseDamage * thisFactor;
			additiveDamageFactor += thisFactor;
			if (showResultDetails){
				addResult("+ Damage to vulnerable", thisDamage, undefined, vulnerableColor,
					"Contribution of additive vulnerable damage.", true);
			}
		}
		if (includeTypes.includes(TYPE_CRIT) && critDamageAddEle.value){
			let thisFactor = (+critDamageAddEle.value/100);
			let thisDamage = addModBaseDamage * thisFactor;
			additiveDamageFactor += thisFactor;
			if (showResultDetails){
				addResult("+ Critical hit damage", thisDamage, undefined, critColor,
					"Contribution of additive critical hit damage.", true);
			}
		}
		if (includeTypes.includes(TYPE_OVERPOWER) && overpowerDamageAddEle.value){
			let thisFactorAdd = (+overpowerDamageAddEle.value/100);
			//Changes for season 2 (assuming current life = 100%):
			//Overpower attacks gain +2% damage per 1% of your Base Life that you have in bonus life above your Base Life.
			//Overpower attacks gain +2% damage per 1% of your Base Life you have in Fortify.
			//discussion: https://us.forums.blizzard.com/en/d4/t/new-formula-for-overpower-damage-in-120/128302/40
			//Changes for season 3: damage per 1% reduced from 2% to 1% for both bonus and fortified life
			let dmgPer1pct = 1.0;
			let overpowerAddDmgPercentLife = (+maxLifeEle.value - +baseLifeEle.value)/+baseLifeEle.value * 100 * dmgPer1pct;
			let overpowerAddDmgPercentFortify = isFortified.checked? ((+maxLifeEle.value/+baseLifeEle.value) * 100 * dmgPer1pct) : 0.0;
			let bonusLifeFactor = overpowerAddDmgPercentLife/100;
			let fortifyFactor = overpowerAddDmgPercentFortify/100;
			let thisFactorTotal = (thisFactorAdd + bonusLifeFactor + fortifyFactor);
			additiveDamageFactor += thisFactorTotal;
			if (showResultDetails){
				let overpowerAddBaseDamage = addModBaseDamage * thisFactorAdd;
				let overpowerAddLifeAndFfDamage = addModBaseDamage * (bonusLifeFactor + fortifyFactor);
				addResult("+ Overpower dmg. (max. HP)", (overpowerAddBaseDamage + overpowerAddLifeAndFfDamage), undefined, overpowerColor,
					"Contribution of additive overpower damage (" + overpowerDamageAddEle.value + "%), " 
					+ "bonus life (" + Math.round(overpowerAddDmgPercentLife) + "%) and fortify (" + Math.round(overpowerAddDmgPercentFortify) + "%).", true, true);
			}
		}
		return additiveDamageFactor;
	}
	function loadOrCalculateAdditiveDamageFactor(includeTypes, cache){
		var includeTypesKey = includeTypes?.length? includeTypes.join("+") : TYPE_KEY_CORE;
		var addModFactor = cache[includeTypesKey];		//from cache?
		if (addModFactor == undefined){
			//calculate for this type key
			addModFactor = calculateAdditiveDamageFactor({
				includeTypes: includeTypes
			});
			cache[includeTypesKey] = addModFactor;
		}
		return addModFactor;
	}
	function calculateMultiplicativeDamageFactor(options){
		//options: includeTypes, showResultDetails, referenceDamage
		var multiModFactor = 1.0;
		var multiModBaseDamage = options.referenceDamage || 1;
		var includeTypes = options.includeTypes || [];	//e.g.: vulnerable, crit, overpower
		var showResultDetails = options.showResultDetails;
		var multiModPcts = getMultiModPcts();
		if (multiModPcts.length){
			multiModPcts.forEach(function(multiMod){
				if (!multiMod.types?.length || multiMod.types.every((t) => includeTypes.includes(t))){
					var thisFactor = 1.0 + (multiMod.pct/100);
					var thisDamage = multiModBaseDamage * thisFactor;
					multiModFactor *= thisFactor;
					if (showResultDetails){
						addResult("× " + multiMod.info, thisDamage, undefined, multiModColorLight,
							"Damage contribution of this multiplier alone with regard to previous section.", true);
					}
				}
			});
		}
		return multiModFactor;
	}
	function loadOrCalculateMultiplicativeDamageFactor(includeTypes, cache){
		var includeTypesKey = includeTypes?.length? includeTypes.join("+") : TYPE_KEY_CORE;
		var multiModFactor = cache[includeTypesKey];		//from cache?
		if (multiModFactor == undefined){
			//calculate for this type key
			multiModFactor = calculateMultiplicativeDamageFactor({
				includeTypes: includeTypes
			});
			cache[includeTypesKey] = multiModFactor;
		}
		return multiModFactor;
	}
	function calculateFullDamageForGivenTypes(includeDamage, combinedOthersFactor, coreDamage,
			storedDamageCache, additiveDamageFactorsCache, multiplicativeDamageFactorsCache){
		if (storedDamageCache[includeDamage.key]){
			return storedDamageCache[includeDamage.key];
		}
		//additive damage:
		var addModFactor = loadOrCalculateAdditiveDamageFactor(includeDamage.types, additiveDamageFactorsCache);
		//multiplicative damage:
		var multiModFactor = loadOrCalculateMultiplicativeDamageFactor(includeDamage.types, multiplicativeDamageFactorsCache);
		//combined with remaining factors (e.g. crit damage x1.5 or damage reduction x0.25):
		let thisDamage = coreDamage * addModFactor * multiModFactor * combinedOthersFactor;
		//cache new value
		storedDamageCache[includeDamage.key] = thisDamage;
		return thisDamage;
	}
	function calculateAverageDamageBasedOnChance(referenceDamage, modifiedDamage, modChanceFactor){
		return ((1.0 - modChanceFactor) * referenceDamage + (modChanceFactor * modifiedDamage));
	}
	
	//Simulation
	function damageSimulation(steps, coreDamage, storedDamage,
			additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes, reductionModFactor, onFinishCallback){
		
		var vulnerableDamageFactor = (1.0 + (+vulnerableDamageEle.value || 0.0) / 100);
		var critDamageFactor = (1.0 + (+critDamageEle.value || 0.0) / 100);
		var critChance = (+critChanceEle.value || 0)/100;
		var overpowerDamageFactor = (1.0 + (+overpowerDamageEle.value || 0.0) / 100);
		var everyNthOverpower = +overpowerOnNthAttackEle.value || 33;
		var attackSpeed = +attackSpeedEle.value || 1.0;
		
		var timeStepInSeconds = 1.0/attackSpeed;
		var timeAvgDamageSum = 0;
		var elapsedTime = 0.0;
		var simStart = Date.now();
		var dataPoints = [];
		for (let i=0; i<steps; i++){
			let includeVulnerable = false;
			let includeCrit = false;
			let includeOverpower = false;
			let otherDamageFactorsCombined = reductionModFactor;
			if (doCalcVulnerable.checked){
				includeVulnerable = true;
				otherDamageFactorsCombined *= vulnerableDamageFactor;
			}
			if (doCalcCrit.checked){
				if (critChance >= Math.random()){
					includeCrit = true;
					otherDamageFactorsCombined *= critDamageFactor;
				}
			}
			if (doCalcOverpower.checked){
				if (i % everyNthOverpower == 0){
					includeOverpower = true;
					otherDamageFactorsCombined *= overpowerDamageFactor;
				}
			}
			//calculate (or get from cache)
			let includeDamage = getIncludedDamageTypesAndKey(includeVulnerable, includeCrit, includeOverpower);
			let thisDamage = calculateFullDamageForGivenTypes(includeDamage, otherDamageFactorsCombined, coreDamage,
				storedDamage, additiveDamageFactorsByTypes, multiplicativeDamageFactorsByTypes);
			//weapon and skill variance
			let weaponVariance = 0.8333 + Math.random() * 0.3334;
			let skillVariance = 0.9 + Math.random() * 0.2;
			thisDamage = thisDamage * weaponVariance * skillVariance;
			timeAvgDamageSum += thisDamage;
			elapsedTime += timeStepInSeconds;
			if (steps < 100000){
				dataPoints.push(Math.round(thisDamage));
				//dataPoints.push(thisDamage);
			}
		}
		var averageDps = timeAvgDamageSum/elapsedTime;
		var simTime = Date.now() - simStart;
		if (onFinishCallback) onFinishCallback(averageDps, simTime, dataPoints);
	}
	var runSimulation = function(){};	//placeholder
	
	function getData(){
		var data = {
			calculatorName: getTitle(),
			charClass: getCharClass(),
			baseDamage: +baseDamageEle.value,
			attackSpeed: +attackSpeedEle.value,
			skillDamage: +skillDamageEle.value,
			mainStat: +mainStatEle.value,
			baseLife: +baseLifeEle.value,
			maxLife: +maxLifeEle.value,
			isFortified: isFortified.checked,
			vulnerableDamage: +vulnerableDamageEle.value,
			vulnerableDamageAdd: +vulnerableDamageAddEle.value,
			overpowerDamage: +overpowerDamageEle.value,
			overpowerDamageAdd: +overpowerDamageAddEle.value,
			overpowerOnNthAttack: +overpowerOnNthAttackEle.value,
			critDamage: +critDamageEle.value,
			critDamageAdd: +critDamageAddEle.value,
			critChance: +critChanceEle.value,
			additiveModifiers: getAdditiveModPcts(true),
			damageMultipliers: getMultiModPcts(true),
			damageReduction: getReductionModPcts(true)
		}
		return data;
	}
	function restoreData(data, calculatorName){
		clearCalculation();
		
		if (charClassEle) charClassEle.value = data.charClass || "";
		baseDamageEle.value = data.baseDamage || 596;
		attackSpeedEle.value = data.attackSpeed || 1.0;
		skillDamageEle.value = data.skillDamage || 50;
		mainStatEle.value = data.mainStat || 1500;
		baseLifeEle.value = data.baseLife || 400;
		maxLifeEle.value = data.maxLife || 3000;
		isFortified.checked = data.isFortified;
		vulnerableDamageEle.value = data.vulnerableDamage || 20;
		vulnerableDamageAddEle.value = data.vulnerableDamageAdd || 0;
		overpowerDamageEle.value = data.overpowerDamage || 50;
		overpowerDamageAddEle.value = data.overpowerDamageAdd || 0;
		overpowerOnNthAttackEle.value = data.overpowerOnNthAttack || 33;
		critDamageEle.value = data.critDamage || 50;
		critDamageAddEle.value = data.critDamageAdd || 0;
		critChanceEle.value = data.critChance || 5;
		addModifiersContainer.innerHTML = "";
		if (data.additiveModifiers?.length){
			data.additiveModifiers.forEach(function(itm){
				addAdditiveMod(itm.info, itm.pct, itm.disabled, itm.types);
			});
		}
		multiModifiersContainer.innerHTML = "";
		if (data.damageMultipliers?.length){
			data.damageMultipliers.forEach(function(itm){
				addMultiplierMod(itm.info, itm.pct, itm.disabled, itm.types);
			});
		}
		reductionModifiersContainer.innerHTML = "";
		if (data.damageReduction?.length){
			data.damageReduction.forEach(function(itm){
				addReductionMod(itm.info, itm.pct, itm.disabled, itm.types);
			});
		}
		setTitle(calculatorName || data.calculatorName || "Unnamed Calculator");
		
		updateClassSpecificValues();
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
		saveAs("d4-damage-calc-config_" + now + ".json", data);
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
				
	addModifierBtn.addEventListener('click', function(){ addAdditiveMod(); });
	multiModifierBtn.addEventListener('click', function(){ addMultiplierMod(); });
	reductionModifierBtn.addEventListener('click', function(){ addReductionMod(); });
	calculateBtn.addEventListener('click', function(){ calculateDamage(); });
	simDpsBtn.addEventListener('click', function(){ runSimulation(simulationHitsNumEle.value); });
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
		updateClassSpecificValues();
		clearCalculation();
	}
	//Add some DEMO values?
	if (options?.addDemoContent){
		addAdditiveMod("Example: Damage while Healthy", 30);
		addAdditiveMod("Example: Damage on Monday", 69);
		addMultiplierMod("Example: Crit. Bonus", 18, false, ["crit"]);
		addMultiplierMod("Example: Tibaults Will", 40);
		addReductionMod("Character lvl. damage reduction", 97);
	}else if (!options?.cfg && options?.addDemoContent !== false){
		addReductionMod("Character lvl. damage reduction", 97);
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
