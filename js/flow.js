var Flow = function(option) {
				
	// default value
	var defaultConfig = {
		widthGap:12,
		heightGap:12
	}

	var config = $.extend({}, defaultConfig, option); 
	
	config.container = config.container;
	config.unitWidth = config.unitWidth;

	// defined the gap offset
	config.widthGap = config.widthGap;
	config.heightGap = config.heightGap;
			
	// get config
	this.getConfig = function() {
		return config;;
	}
	// init 
	this.init();

};
Flow.prototype = {
	constructor:Flow,
	init: function() {
		var config = this.getConfig();
		this.ctn = config.container;
		this.cells  = [];		
		this.colHeightArray = [];		
		this.reflow();
	},
	loadData: function(data) {
		var cells = this.createCells(data);
		this.addCells(cells);
	},
	reLoadData: function(data) {
		var cells = this.createCells(data);
		this.ctn.innerHTML = "";
		this.cells = [];
		this.reflow();
		this.addCells(cells);
	},
	reflow: function() {
		var config = this.getConfig();
		this.contWidth = this.ctn.offsetWidth;
		this.colNum = Math.floor(this.contWidth / (config.unitWidth + config.widthGap));
		
		// resetHeightArray
		this.colHeightArray = [];
		for(var i=0;i < this.colNum; i++) {
			this.colHeightArray[i] = 0;
		}

	},
	createCells: function(arData) {
		var i = 0, l = arData.length, unit = {}, cell = null, tmpHtml = [], cells = [];
		
		for(i;i < l;i++) {
			cell = document.createElement("div");
			tmpHtml = [];
			unit = arData[i];
			tmpHtml.push('<div class="flowunit">');
			tmpHtml.push('<div class="flowunit-imgbox">');
			tmpHtml.push('<img src="'+unit.src+'" width='+unit.width+' height='+unit.height+'/>');
			tmpHtml.push('<div class="flowunit-tipheader">');	
			tmpHtml.push('</div>');
			tmpHtml.push('</div>');
			tmpHtml.push('<div class="flowunit-title">'+unit.title+'</div></div>');
			
			cell.innerHTML = tmpHtml.join("");	
			cells.push(cell)
		}
		
		return cells;
	},
	addCells: function(arCells) {	
		this.adjustCells(arCells);
		// store this htmlnode cells in a place
		this.cells = Array.prototype.concat.call(this.cells, arCells);
	},
	adjustCells: function(arCells) {
	
		var _getMinKey = this._getMinKey, len = arCells.length,insertColIdx = 0, cell,  config = this.getConfig(), crtH, clientHeight, docFrag = document.createDocumentFragment();
		
		for(var i=0;i < len; i++) {	
			cell = arCells[i];	
			
			// append to body first
			// append to document fragment
			docFrag.appendChild(cell);	
			// set to be invisible before append to body
			cell.style.opacity = "0";
		}
		
		this.ctn.appendChild(docFrag);
		// hide container ao void reflow frequently 

		
		for(var i=0;i < len; i++) {	
			cell = arCells[i];
			
			insertColIdx = _getMinKey(this.colHeightArray);
			crtH = this.colHeightArray[insertColIdx];
			
			cell.style.position = "absolute";

			// deal with top
			cell.style.top = crtH + "px";	
			
	        	// store the clientHeight into an attribute of its owner element
			if(cell.getAttribute("data-clientHeight") == null) {
			   cell.setAttribute("data-clientHeight", clientHeight = cell.clientHeight)
			} else {
				clientHeight = cell.getAttribute("data-clientHeight");
			}
			
			this.colHeightArray[insertColIdx]  = crtH + Number(clientHeight) + config.heightGap;
			
			// deal with left
			var leftTp = insertColIdx *( config.unitWidth + config.widthGap) + config.widthGap;
			cell.style.left = leftTp +"px";
	
			// set to be visible
			cell.style.opacity = "1";
			
		}

		this.ctn.style.height = this.getMaxColHeight() + "px";
	},
	adjustCol: function() {
		// check whether perform a reajust
		if(this.contWidth == this.ctn.clientWidth) {
			// no need to ajust
			return;
		}
	
		this.reflow();
		this.adjustCells(this.cells);
	},
	getMinColHeight: function() {
		return this._getMinVal(this.colHeightArray);
	},
	getMaxColHeight: function() {
		return this._getMaxVal(this.colHeightArray);
	},
	_getMinVal: function(arNum) {
		return Math.min.apply(null, arNum);
	},
	_getMaxVal: function(arNum) {
		return Math.max.apply(null, arNum);
	},
	_getMinKey: function(arNum) {
		var i=0;l = arNum.length, min = 0;
	 
		for(;i < l;i++) {
			if(arNum[i] == Math.min.apply(null, arNum)){
				return i;
			}
		}
	}
};
