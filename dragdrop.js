if (!('bytemind' in window)) window.bytemind = {};

window.bytemind.dragdrop = {};

window.bytemind.dragdrop.currentlyDragged = undefined;		//TODO: should this be an array?
window.bytemind.dragdrop.currentlyAllowedTarget = undefined;

window.bytemind.dragdrop.addMoveHandler = function(dragEle, dragScopeEle, dragHandle){
	//enable drag
	if (!dragHandle) dragHandle = dragEle;
	dragHandle.draggable = true;
	//dragEle.style.position = "relative";		//NOTE: this is required to position the overlay!
		
	//drag events
	function onDragStart(ev){
		//reference to current element and scope
		bytemind.dragdrop.currentlyDragged = dragEle;
		bytemind.dragdrop.currentlyAllowedTarget = dragScopeEle;
		//add class to dragged element
		dragEle.classList.add("bm-dragging");	//NOTE: ev.currentTarget is the handle
		//use 'dataTransfer'?
		ev.dataTransfer.effectAllowed = 'move';
		//ev.dataTransfer.clearData();
		//ev.dataTransfer.setData("text/plain", ev.target.id);
	}
	function onDragEnd(ev){
		//remove class from dragged element
		dragEle.classList.remove("bm-dragging");	//NOTE: ev.target is the handle
		//clear references
		bytemind.dragdrop.currentlyDragged = undefined;
		bytemind.dragdrop.currentlyAllowedTarget = undefined;
	}
	dragHandle.addEventListener("dragstart", onDragStart);
	dragHandle.addEventListener("dragend", onDragEnd);

	//drag-over and drop events
	function onDragEnter(ev){
		ev.preventDefault();
		if (bytemind.dragdrop.currentlyDragged == dragEle){
			//drag and target are the same
			return;
		}
		if (bytemind.dragdrop.currentlyAllowedTarget != dragScopeEle){
			//prevent wrong targets
			ev.dataTransfer.dropEffect = 'none';
			return;
		}
		ev.currentTarget.classList.add("bm-drag-target");
		if (calcDropPosition(ev, dragEle).top){
			ev.currentTarget.classList.add("bm-drag-pos-top");
		}else{
			ev.currentTarget.classList.add("bm-drag-pos-bottom");
		}
		ev.dataTransfer.dropEffect = 'move';
	}
	function onDragLeave(ev){
		ev.preventDefault();
		if (bytemind.dragdrop.currentlyDragged == dragEle){
			//drag and target are the same
			return;
		}
		if (bytemind.dragdrop.currentlyAllowedTarget != dragScopeEle){
			//prevent wrong targets
			ev.dataTransfer.dropEffect = 'none';
			return;
		}
		ev.currentTarget.classList.remove("bm-drag-target", "bm-drag-pos-top", "bm-drag-pos-bottom");
	}
	function onDragOver(ev){
		ev.preventDefault();
		if (bytemind.dragdrop.currentlyAllowedTarget != dragScopeEle){
			ev.dataTransfer.dropEffect = 'none';
		}else{
			ev.dataTransfer.dropEffect = 'move';
		}
		if (bytemind.dragdrop.currentlyDragged == dragEle){
			//drag and target are the same
			return;
		}
		if (calcDropPosition(ev, dragEle).top){
			ev.currentTarget.classList.add("bm-drag-pos-top");
			ev.currentTarget.classList.remove("bm-drag-pos-bottom");
		}else{
			ev.currentTarget.classList.remove("bm-drag-pos-top");
			ev.currentTarget.classList.add("bm-drag-pos-bottom");
		}
	}
	function onDrop(ev){
		ev.preventDefault();
		ev.currentTarget.classList.remove("bm-drag-target", "bm-drag-pos-top", "bm-drag-pos-bottom");
		if (bytemind.dragdrop.currentlyDragged == dragEle){
			//drag and target are the same
			return;
		}
		if (bytemind.dragdrop.currentlyAllowedTarget != dragScopeEle){
			//prevent wrong targets
			return;
		}
		//use 'dataTransfer'?
		//const data = ev.dataTransfer.getData("text");
		//const source = document.getElementById(data);
		//move element
		if (calcDropPosition(ev, dragEle).top){
			dragEle.before(bytemind.dragdrop.currentlyDragged);
		}else{
			dragEle.after(bytemind.dragdrop.currentlyDragged);
		}
		//dragEle.parentNode.insertBefore(bytemind.dragdrop.currentlyDragged, dragEle);
	}
	function calcDropPosition(ev, ele){
		// Retrieve mouse pointer position
		var mx = ev.clientX;
		var my = ev.clientY;
		var rect = ele.getBoundingClientRect();
		var res = {};
		if (mx > rect.left + rect.width/2){
			res.right = true;
		}else{
			res.left = true;
		}
		if (my > rect.top + rect.height/2){
			res.bottom = true;
		}else{
			res.top = true;
		}
		return res;
	}
	dragEle.addEventListener("dragenter", onDragEnter);
	dragEle.addEventListener("dragover", onDragOver);
	dragEle.addEventListener("dragleave", onDragLeave);
	dragEle.addEventListener("drop", onDrop);
}
