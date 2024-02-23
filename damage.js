var addModColor = "color-add-mod";
var addModColorLight = "color-add-mod-light";
var multiModColor = "color-multi-mod";
var multiModColorLight = "color-multi-mod-light";
var reductionModColor = "color-reduction-mod";
var reductionModColorLight = "color-reduction-mod-light";
var vulnerableColor = "color-vulnerable";
var critColor = "color-crit";
var overpowerColor = "color-overpower";
	
function buildCalculator(containerEle, options){
	var Calculator = {
		id: ("calc-" + Date.now() + Math.round(Math.random() * 1000000)),
		container: containerEle,
		restoreData: restoreData,
		getData: getData
	};

	var baseDamageEle = containerEle.querySelector("[name=base-damage]");
	var attackSpeedEle = containerEle.querySelector("[name=attack-speed]");
	var skillDamageEle = containerEle.querySelector("[name=skill-damage]");
	var mainStatEle = containerEle.querySelector("[name=main-stat]");
	var baseLifeEle = containerEle.querySelector("[name=char-base-life]");
	var maxLifeEle = containerEle.querySelector("[name=char-max-life]");
	var vulnerableDamageEle = containerEle.querySelector("[name=vulnerable-damage]");
	var vulnerableDamageAddEle = containerEle.querySelector("[name=vulnerable-damage-add]");
	var overpowerDamageEle = containerEle.querySelector("[name=overpower-damage]");
	var overpowerDamageAddEle = containerEle.querySelector("[name=overpower-damage-add]");
	var isFortified = containerEle.querySelector("[name=char-is-fortified]");
	var critDamageEle = containerEle.querySelector("[name=critical-damage]");
	var critDamageAddEle = containerEle.querySelector("[name=critical-damage-add]");
	var critChanceEle = containerEle.querySelector("[name=critical-hit-chance]");
	
	var addModifiersContainer = containerEle.querySelector("[name=add-modifiers-container]");
	var addModifierBtn = containerEle.querySelector("[name=add-modifier-btn]");
	var multiModifiersContainer = containerEle.querySelector("[name=multi-modifiers-container]");
	var multiModifierBtn = containerEle.querySelector("[name=multi-modifier-btn]");
	var reductionModifiersContainer = containerEle.querySelector("[name=reduction-modifiers-container]");
	var reductionModifierBtn = containerEle.querySelector("[name=reduction-modifier-btn]");
	
	var resultContainer = containerEle.querySelector("[name=result-container]");
	var calculateBtn = containerEle.querySelector("[name=calculate-data-btn]");
	var doCalcCrit = containerEle.querySelector("[name=do-calc-crit]");
	var doCalcVulnerable = containerEle.querySelector("[name=do-calc-vulnerable]");
	var doCalcOverpower = containerEle.querySelector("[name=do-calc-overpower]");
	
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
	
	function addAdditiveMod(newName, startValue, isDisabled){
		var modName = newName || prompt("Enter a name for this '+' modifier:");
		if (!modName) return;
		addDynamicMod(addModifiersContainer, modName, "add-mod-val", startValue, isDisabled);
	}
	function addMultiplierMod(newName, startValue, isDisabled){
		var modName = newName || prompt("Enter a name for this '×' modifier:");
		if (!modName) return;
		addDynamicMod(multiModifiersContainer, modName, "multi-mod-val", startValue, isDisabled);
	}
	function addReductionMod(newName, startValue, isDisabled){
		var modName = newName || prompt("Enter a name for this damage reduction modifier:");
		if (!modName) return;
		addDynamicMod(reductionModifiersContainer, modName, "reduction-mod-val", startValue, isDisabled);
	}
	
	function getAdditiveModPcts(includeHidden){
		var factors = [];
		addModifiersContainer.querySelectorAll(".add-mod-val").forEach(ele => {
			if (ele.value && (includeHidden || !ele.parentElement.classList.contains("hidden"))){
				factors.push({
					pct: +ele.value,
					info: ele.parentElement.dataset.info,
					disabled: ele.parentElement.classList.contains("hidden")
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
					disabled: ele.parentElement.classList.contains("hidden")
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
					disabled: ele.parentElement.classList.contains("hidden")
				});
			}
		});
		return factors;
	}
	
	function addResult(info, val, modFactor, colorClass, tooltip, isDetail){
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
		resultContainer.appendChild(grp);
	}
	function addCustom(str, addClass){
		var div = document.createElement("div");
		div.className = "group";
		if (addClass) div.className += " " + addClass;
		div.innerHTML = str;
		resultContainer.appendChild(div);
	}
	
	function calculateDamage(){
		resultContainer.innerHTML = "";
		resultContainer.parentElement.style.removeProperty('display');
		
		var totalDamage = 0;
		var baseDamage = baseDamageEle.value || 0;
		var attackSpeed = attackSpeedEle.value || 1.0;
		var hasModifier = doCalcVulnerable.checked || doCalcCrit.checked || doCalcOverpower.checked;
		
		var skillDamageFactor = (skillDamageEle.value || 0.0) / 100;
		totalDamage = baseDamage * skillDamageFactor;
		addResult("Skill base damage", totalDamage, skillDamageFactor, undefined,
			"Average base damage done with the given weapon and skill.");
		addCustom("<hr>", "flat");
		
		var mainStatFactor = 1.0 + (mainStatEle.value || 0.0) / 1000;
		totalDamage = totalDamage * mainStatFactor;		//baseDamage * skillDamageFactor * ...
		addResult("Main stat.", totalDamage, mainStatFactor, undefined,
			"Damage including main stat factor.");
		addCustom("<hr>", "flat");
			
		var addModFactor = 1.0;
		var addModFactorVulnerable = 1.0;
		var addModFactorCrit = 1.0;
		var addModFactorOverpower = 1.0;
		var addModFactorMax = 1.0;
		var addModPcts = getAdditiveModPcts();
		var addModBaseDamage = totalDamage;
		if (addModPcts.length){
			addModPcts.forEach(function(addMod){
				var thisFactor = (addMod.pct/100);
				var thisDamage = addModBaseDamage * thisFactor;
				addModFactor += thisFactor;
				addResult("+ " + addMod.info, thisDamage, undefined, addModColorLight,
					"Contribution of this add. value alone.", true);
			});
			addModFactorMax = addModFactor;
		}
		let newBaseDamage = baseDamage * skillDamageFactor * mainStatFactor * addModFactor;
		if (hasModifier){
			addResult("Base damage after add. mod.", newBaseDamage, addModFactor, addModColor,
				"Base damage for hits after all additive modifiers have been applied.");
		}
		//calculate extra
		var vulnerableAddBaseDamage;
		var critAddBaseDamage;
		var overpowerAddBaseDamage;
		var overpowerAddLifeAndFfDamage;
		var overpowerAddDmgPercentLife;
		var overpowerAddDmgPercentFortify;
		if (doCalcVulnerable.checked && vulnerableDamageAddEle.value){
			let thisFactor = (vulnerableDamageAddEle.value/100);
			vulnerableAddBaseDamage = addModBaseDamage * thisFactor;
			addModFactorVulnerable = thisFactor;
			addModFactorMax += thisFactor;
		}
		if (doCalcCrit.checked && critDamageAddEle.value){
			let thisFactor = (critDamageAddEle.value/100);
			critAddBaseDamage = addModBaseDamage * thisFactor;
			addModFactorCrit = thisFactor;
			addModFactorMax += thisFactor;
		}
		if (doCalcOverpower.checked && overpowerDamageAddEle.value){
			let thisFactorAdd = (overpowerDamageAddEle.value/100);
			//Changes for season 2 (assuming current life = 100%):
			//Overpower attacks gain +2% damage per 1% of your Base Life that you have in bonus life above your Base Life.
			//Overpower attacks gain +2% damage per 1% of your Base Life you have in Fortify.
			//discussion: https://us.forums.blizzard.com/en/d4/t/new-formula-for-overpower-damage-in-120/128302/40
			//Changes for season 3: damage per 1% reduced from 2% to 1% for both bonus and fortified life
			let dmgPer1pct = 1.0;
			overpowerAddDmgPercentLife = (maxLifeEle.value - baseLifeEle.value)/baseLifeEle.value * 100 * dmgPer1pct;
			overpowerAddDmgPercentFortify = isFortified.checked? ((maxLifeEle.value/baseLifeEle.value) * 100 * dmgPer1pct) : 0.0;
			let bonusLifeFactor = overpowerAddDmgPercentLife/100;
			let fortifyFactor = overpowerAddDmgPercentFortify/100;
			overpowerAddBaseDamage = addModBaseDamage * thisFactorAdd;
			overpowerAddLifeAndFfDamage = addModBaseDamage * (bonusLifeFactor + fortifyFactor);
			addModFactorOverpower = (thisFactorAdd + bonusLifeFactor + fortifyFactor);
			addModFactorMax += addModFactorOverpower;
		}
		//display extra
		if (doCalcVulnerable.checked && vulnerableDamageAddEle.value){
			let thisFactor = addModFactorMax/(addModFactorMax - addModFactorVulnerable);
			addResult("+ Damage to vulnerable", vulnerableAddBaseDamage, thisFactor, vulnerableColor,
				"Contribution of additive vulnerable damage. Value [x] is the damage as rescaled factor.", true);
		}
		if (doCalcCrit.checked && critDamageAddEle.value){
			let thisFactor = addModFactorMax/(addModFactorMax - addModFactorCrit);
			addResult("+ Critical hit damage", critAddBaseDamage, thisFactor, critColor,
				"Contribution of additive critical hit damage. Value [x] is the damage as rescaled factor.", true);
		}
		if (doCalcOverpower.checked && overpowerDamageAddEle.value){
			let thisFactor = addModFactorMax/(addModFactorMax - addModFactorOverpower);
			addResult("+ Overpower dmg. (max. HP)", (overpowerAddBaseDamage + overpowerAddLifeAndFfDamage), thisFactor, overpowerColor,
				"Contribution of additive overpower damage (" + overpowerDamageAddEle.value + "%), " 
				+ "bonus life (" + Math.round(overpowerAddDmgPercentLife) + "%) and fortify (" + Math.round(overpowerAddDmgPercentFortify) + "%). " 
				+ "Value [x] at the end is the sum as rescaled factor.", true);
		}
		totalDamage *= addModFactorMax;	//baseDamage * skillDamageFactor * mainStatFactor * ...
		addResult("Max. damage after add. mod.", totalDamage, addModFactorMax, addModColor,
			"Max. damage for most powerful hit after all additive modifiers have been applied.");
		
		addCustom("<hr>", "flat");
		
		var multiModPcts = getMultiModPcts();
		var multiModFactor = 1.0;
		var multiModBaseDamage = totalDamage;
		if (multiModPcts.length){
			multiModPcts.forEach(function(multiMod){
				var thisFactor = 1.0 + (multiMod.pct/100);
				var thisDamage = multiModBaseDamage * thisFactor;
				multiModFactor *= thisFactor;
				addResult("× " + multiMod.info, thisDamage, undefined, multiModColorLight,
					"Contribution to base dmg. of this multiplier alone with regard to previous section.", true);
			});
			let newBaseDamage = baseDamage * skillDamageFactor * mainStatFactor * addModFactor * multiModFactor;
			if (hasModifier){
				addResult("Base damage after multipliers", newBaseDamage, multiModFactor, multiModColor,
					"Base damage after all additive modifiers have been applied.");
			}
			totalDamage *= multiModFactor;
			addResult("Max. damage after multipliers", totalDamage, multiModFactor, multiModColor,
				"Max. damage after all additive modifiers have been applied.");
			addCustom("<hr>", "flat");
		}
		
		var timeAvgDamageBase = totalDamage;
		if (doCalcVulnerable.checked){
			//var vulnerableDamageAdditiveAsFactor = 1.0 + ((vulnerableDamageAddEle.value || 0.0) / addModFactor) / 100;	//it is in add. pool now
			var vulnerableDamageFactor = (1.0 + (vulnerableDamageEle.value || 0.0) / 100);
			let vulnerableBaseDamage = baseDamage * skillDamageFactor * mainStatFactor * (addModFactor + addModFactorVulnerable)
				* multiModFactor * vulnerableDamageFactor;
			totalDamage *= vulnerableDamageFactor;
			timeAvgDamageBase *= vulnerableDamageFactor;
			addResult("Base dmg. to vulnerable enemy", vulnerableBaseDamage, vulnerableDamageFactor, vulnerableColor,
				"Base damage done to vulnerable enemies (no crit, no overpower) including previous modifiers.");
			addCustom("<hr>", "flat");
		}
		if (doCalcCrit.checked){
			//var critDamageAdditiveAsFactorIncVul = 1.0 + ((critDamageAddEle.value || 0.0) / (addModFactor * vulnerableDamageAdditiveAsFactor)) / 100;	//it is in add. pool now
			var critDamageFactor = (1.0 + (critDamageEle.value || 0.0) / 100);
			let previousBaseDamage = baseDamage * skillDamageFactor * mainStatFactor * addModFactor * multiModFactor;
			let critBaseDamage = baseDamage * skillDamageFactor * mainStatFactor * (addModFactor + addModFactorCrit) * multiModFactor * critDamageFactor;
			totalDamage *= critDamageFactor;
			addResult("Base dmg. with critical hit", critBaseDamage, critDamageFactor, critColor,
				"Base damage done with critical hits (no vulnerable, no overpower) including previous modifiers.");
			var critChancePct = critChanceEle.value || 0;
			//var critChanceFactor = (1.0 - critChancePct/100) + (critChancePct/100 * critDamageFactor);
			//var averageHitDamageFactoringCritChance = critChanceFactor * critBaseDamage;
			var averageHitDamageFactoringCritChance = (1.0 - critChancePct/100) * previousBaseDamage + (critChancePct/100 * critBaseDamage);
			var critChanceFactor = averageHitDamageFactoringCritChance / previousBaseDamage;
			timeAvgDamageBase *= critChanceFactor;
			addResult("Avg. base dmg. with crit chance", averageHitDamageFactoringCritChance, critChanceFactor, critColor,
				"Average damage of a critical hit (no vulnerable, no overpower), factoring in the critical hit chance, e.g. 30% crit chance means (70% base damage + 30% crit damge).");
			addCustom("<hr>", "flat");
		}
		if (doCalcOverpower.checked){
			var overpowerDamageFactor = (1.0 + (overpowerDamageEle.value || 0.0) / 100);
			let overpowerBaseDamage = baseDamage * skillDamageFactor * mainStatFactor * (addModFactor + addModFactorOverpower)
				* multiModFactor * overpowerDamageFactor;
			totalDamage *= overpowerDamageFactor;
			timeAvgDamageBase *= overpowerDamageFactor;
			addResult("Base dmg. with overpower", overpowerBaseDamage, overpowerDamageFactor, overpowerColor,
				"Base damage done with overpower hits without modifiers like crit. or vulnerable.");
			addCustom("<hr>", "flat");
		}
		if (!hasModifier){
			addResult("Total max. damage per hit", totalDamage, undefined, undefined,
				"Total max. damage possible per hit with the given modifiers");
		}else{
			addResult("Total max. damage per hit", totalDamage, undefined, undefined,
				"Total max. damage per hit with the given modifiers");
		}
		addCustom("<hr>", "flat");
				
		var reductionModPcts = getReductionModPcts();
		var reductionModFactor = 1.0;
		if (reductionModPcts.length){
			reductionModPcts.forEach(function(reductMod){
				var thisFactor = 1.0 - (reductMod.pct/100);
				reductionModFactor *= thisFactor;
				addResult(reductMod.info, totalDamage * reductionModFactor, thisFactor, reductionModColor,
					"Max. damage after this and all previous reduction factors have been applied.");
			});
			totalDamage *= reductionModFactor;	//baseDamage * skillDamageFactor * mainStatFactor * addModFactorMax * multiModFactor ...
			timeAvgDamageBase *= reductionModFactor;
			addCustom("<hr>", "flat");
		}
		
		addResult("Expected damage per hit", totalDamage, undefined, undefined, "Final result for single hit damage to monsters based on your average weapon damage.\n" 
			+ "Note: Your in-game numbers can be around 25-30% lower/higher, depending on your min/max damage roll for weapon and skill at cast.");
		addResult("Average damage per second (DPS)", timeAvgDamageBase * attackSpeed, undefined, undefined, "Average damage per second, " 
			+ "if you cast the skill as fast as possible over a few seconds without resource issues.");
	}
	
	function getData(){
		var data = {
			calculatorName: getTitle(),
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
		resultContainer.innerHTML = "";
		baseDamageEle.value = data.baseDamage || 100;
		attackSpeedEle.value = data.attackSpeed || 1.0;
		skillDamageEle.value = data.skillDamage || 50;
		mainStatEle.value = data.mainStat || 100;
		baseLifeEle.value = data.baseLife || 100;
		maxLifeEle.value = data.maxLife || 150;
		isFortified.checked = data.isFortified;
		vulnerableDamageEle.value = data.vulnerableDamage || 20;
		vulnerableDamageAddEle.value = data.vulnerableDamageAdd || 0;
		overpowerDamageEle.value = data.overpowerDamage || 50;
		overpowerDamageAddEle.value = data.overpowerDamageAdd || 0;
		critDamageEle.value = data.critDamage || 50;
		critDamageAddEle.value = data.critDamageAdd || 0;
		critChanceEle.value = data.critChance || 5;
		addModifiersContainer.innerHTML = "";
		if (data.additiveModifiers?.length){
			data.additiveModifiers.forEach(function(itm){
				addAdditiveMod(itm.info, itm.pct, itm.disabled);
			});
		}
		multiModifiersContainer.innerHTML = "";
		if (data.damageMultipliers?.length){
			data.damageMultipliers.forEach(function(itm){
				addMultiplierMod(itm.info, itm.pct, itm.disabled);
			});
		}
		reductionModifiersContainer.innerHTML = "";
		if (data.damageReduction?.length){
			data.damageReduction.forEach(function(itm){
				addReductionMod(itm.info, itm.pct, itm.disabled);
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
	calculateBtn.addEventListener('click', calculateDamage);
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
		addAdditiveMod("Example: Damage vs Distant", 30);
		addAdditiveMod("Example: Damage on Monday", 69);
		addMultiplierMod("Example: Glass Cannon", 18);
		addMultiplierMod("Example: Tibaults Will", 40);
		addReductionMod("Global damage reduction", 75);
	}else{
		addReductionMod("Global damage reduction", 75);
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
			var calc = addNewCalculator();
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
					var calc = addNewCalculator();
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
