/*!
 * jQuery ImgPos v1.1.1
 * 
 * Copyright 2015 Fuwei Chin
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function($){
	"use strict";

	/*~~~~~~~~ Features detect ~~~~~~~~*/
	var testImage=new Image();
	var testStyle=testImage.style;
	var support={
		ELEMENT_DATASET: typeof document.documentElement.dataset==="object",
		IMAGE_NATURALWIDTH: typeof testImage.naturalWidth==="number",
		MSIE: document.documentMode
	};

	/*~~~~~~~~ DOM Utilities ~~~~~~~~*/
	var replaces=[
		/-([a-z])/g, function(a,b){return b.toUpperCase();},
		/([A-Z])/g, function(a,b){return "-"+b.toLowerCase();},
		/^data-/, null,
		/[a-z]-/, null
	];
	var util={
		on: function(target,type,handler){
			target.addEventListener(type,handler);
		},
		off: function(target,type,handler){
			target.removeEventListener(type,handler);
		},
		$: function(selector,context){
			return (context&&context.querySelector?context:document).querySelector(selector);
		},
		$$: function(selector,context){
			return (context&&context.querySelectorAll?context:document).querySelectorAll(selector);
		},
		getNaturalBoxRect: function(img){
			return new BoxRect(0,0,img.naturalWidth,img.naturalHeight,1);
		},
		toDOMStringMapKey: function(name){
			//if(!replaces[4].test(name)){return replaces[5];}
			return name.slice(5).replace(replaces[0],replaces[1]);
		},
		toDataAttrName: function(name){
			//if(replaces[6].test(name)){return replaces[7];}
			return "data-"+name.replace(replaces[2],replaces[3]);
		},
		keys: function(o){
			var k,f,a;
			a=[];
			f=Object.prototype.hasOwnProperty;
			for(k in o){
				if(f.call(o,k)){
					a.push(k);
				}
			}
			return a;
		},
		assign: Object.assign||function assign(object,source){
			var to,from,l,i,k;
			if(object==null)
				throw new TypeError("Object.assign called on null or undefiend");
			to=Object(object);
			l=arguments.length;
			if(l<2)return o;
			for(i=1;i<l;i++){
				from=arguments[i];
				if(from==null)
					continue;
				from=Object(from);
				for(k in from)
					if(Object.prototype.hasOwnProperty.call(from,k))
						to[k]=from[k];
			}
			return to;
		},
		now: Date.now||function(){
			new Date().getTime();
		},
		exchangeValue:function(o1,p1,o2,p2){
			var v1=o1[p1];
			var v2=o2[p2];
			if(v2!==undefined||p2 in o2)o1[p1]=v2;
			if(v1!==undefined||p1 in o1)o2[p2]=v1;
		}
	};
	if(!window.addEventListener){
		util.on=function(target,type,handler){
			target.attachEvent("on"+type,handler);
		};
		util.off=function(target,type,handler){
			target.detachEvent("on"+type,handler);
		};
	}
	if(!document.querySelector){
		util.$=function(selector,context){
			return $(selector,context)[0];
		};
		util.$$=function(selector,context){
			return $(selector,context);
		};
	}
	if(!support.IMAGE_NATURALWIDTH){
		util.getNaturalBoxRect=function(img){
			var natural;
			natural=img.naturalImage;
			if(!natural){
				natural=new Image();
				img.naturalImage=natural;
			}
			natural.src=img.src;
			switch(natural.readyState){
			case "uninitialized":
			default:
				return new BoxRect(0,0,0,0,1);
			case "loading":
			case "complete":
				return new BoxRect(0,0,natural.width,natural.height,1);
			}
		};
	}
	util.getData=function(element){
		var data,i,nodeMap,strMap,key;
		data={};
		if(support.ELEMENT_DATASET){
			strMap=element.dataset;
			for(key in strMap){
				data[key]=strMap[key];
			}
			return data;
		}
		nodeMap=element.attributes;
		for(i=nodeMap.length-1;i>=0;i--){
			attr=nodeMap.item(i);
			if(attr!==null&&attr.name.substring(0,5)==="data-"){
				key=util.toDOMStringMapKey(attr.name);
				data[key]=attr.value;
			}
		}
		return data;
	};
	util.getBoudingBoxRect=function(element,boxSizing){
		var width,height,elem;
		elem=$(element);
		elem=$(element);
		switch(boxSizing){
		case "content-box":
		default:
			width=elem.width();
			height=elem.height();
			break;
		case "padding-box":
			width=elem.innerWidth();
			height=elem.innerHeight();
			break;
		case "border-box":
			width=elem.outerWidth();
			height=elem.outerHeight();
			break;
		case "margin-box":
			width=elem.outerWidth(true);
			height=elem.outerHeight(true);
			break;
		}
		return new BoxRect(0,0,width,height,1);
	};
	util.parseNamedPosition=function(name){
		if(name instanceof NamedPosition)
			return name;
		var pos,values,x,y;
		x="left";
		y="top";
		pos=$.trim(name);
		if(pos!==""){
			values=pos.split(/\s+/,2);
			if(values.length==1){
				x=values[0];
				if(x==="center"){
					this.x=x;
					this.y=x;
				}else if(x==="top"||x==="bottom"){
					this.x="center";
					this.y=x;
				}else if(x==="left"||x==="right"){
					this.x=x;
					this.y="center";
				}
			}else{
				x=values[0];
				y=values[1];
				if((x==="left"||x==="center"||x==="right")&&
						(y==="top"||y==="center"||y==="bottom")){
					this.x=x;
					this.y=y;
				}
			}
		}
		return new NamedPosition(x,y);
	};
	util.toCssText=function(style){
		testStyle.cssText="";
		util.assign(testStyle,style);
		return testStyle.cssText;
	};
	util.bindProxyInterval=function(callable,delay){
		var lock=false;
		var last=null;
		var timer=0;
		var unlock=function(){
			lock=false;
			if(!last){return;}
			var offset=util.now()-last[0];
			if(offset>=delay){
				proxy.apply(last[1],last[2]);
			}else{
				timer=setTimeout(function(){
					proxy.apply(last[1],last[2]);
				},delay-offset);
			}
		};
		var proxy=function(e){
			if(lock){
				if(!last){
					last=[util.now(),this,arguments];
				}
				return;
			}
			lock=true;
			last=null;
			clearInterval(timer);
			callable.apply(this,arguments);
			setTimeout(unlock,delay);
		};
		return proxy;
	};

	/*~~~~~~~~ OO Models ~~~~~~~~*/
	/**
	 * @class BoxRect
	 * @constructor
	 * @param {Number} top
	 * @param {Number} left
	 * @param {Number} width
	 * @param {Number} height
	 * @param {Number} zoom
	 */
	function BoxRect(left,top,width,height,zoom){
		this.left=left;
		this.top=top;
		this.width=width;
		this.height=height;
		this.zoom=zoom;
		this.extras={};
	}
	/**
	 * @method getRatio
	 * @return {Number}
	 */
	function getRatio(){
		return this.width/this.height;
	}
	/**
	 * @method alignWith
	 * @param {BoxRect} that
	 * @param {NamedPosition} pos
	 */
	function alignWith(that,pos){
		switch(pos.x){
		case "left":
			this.left=0;
			break;
		case "center":
			this.extras.marginLeft="50%";
			this.left=(-this.width*this.zoom)/2;
			break;
		case "right":
			this.extras.right=0;
			this.left=(that.width-this.width*this.zoom);
			break;
		}
		switch(pos.y){
		case "top":
			this.top=0;
			break;
		case "center":
			this.extras.marginTop="50%";
			this.top=(-this.height*this.zoom)/2;
			break;
		case "bottom":
			this.extras.bottom=0;
			this.top=(that.height-this.height*this.zoom);
			break;
		}
	}
	/**
	 * @method toStyle
	 * @return {Object}
	 */
	function toStyle(){
		var style={
			left:this.left+"px",
			top:this.top+"px",
			width:(this.width*this.zoom)+"px",
			height:(this.height*this.zoom)+"px"
		};
		if(this.extras.right!==undefined){
			delete style.left;
		}
		if(this.extras.bottom!==undefined){
			delete style.top;
		}
		return util.assign(style,this.extras);
	}
	BoxRect.prototype.getRatio=getRatio;
	BoxRect.prototype.alignWith=alignWith;
	BoxRect.prototype.toStyle=toStyle;

	/**
	 * @class NamedPosition
	 * @constructor
	 * @param {String} x - "left" "center" or "right"
	 * @param {String} y - "top" "center" or "bottom"
	 */
	function NamedPosition(x,y){
		this.x=x;
		this.y=y;
	}

	/*~~~~~~~~ jQuery ImgPos Plug-in ~~~~~~~~*/
	/**
	 * @class ImgPosOptions
	 */
	var defaults={
		/**
		 * @property imageScale - "none" | "fill" | "fit"
		 * @type String
		 * @example "none"
		 */
		imageScale:"fit",
		/**
		 * position-x: "left" | "center" | "right"
		 * position-y: "top" | "center" | "bottom"
		 * position-x-or-y: <position-x> | <position-y>
		 * @property position - <position-x> <position-y> | <position-x-or-y>
		 * @type String
		 * @example "left top"
		 */
		imagePosition:"center center",
		/**
		 * callback to specify offsetParent of each <img /> to be.
		 * return value of the callback will be used as offset parent
		 * @property offsetParentFunction
		 * @type Function - contextual `this` stands for an <img />
		 * @return {HTMLElement}
		 * @example function(){return this.offsetParent;}
		 */
		offsetParentFunction:function(){return this.parentElement;},
		/**
		 * callback to ensure that the offset parent is positioned(non-static, e.g. relative, absolute or fixed)
		 * @property ensureParentPositioned
		 * @type Function - contextual `this` stands for the offset parent of an <img />
		 * @example function(){this.style.position="relative";}
		 */
		ensureParentPositioned:function(){},
		/**
		 * whether adjust img size and offset on window resize
		 * @property listenWindowResize
		 * @type Boolean
		 * @example false
		 */
		listenWindowResize: false
	};
	/**
	 * @for jQuery
	 * @method imgpos
	 * @param {ImgPosOptions} [options]
	 * @chained
	 */
	$.fn.imgpos=function(options){
		var settings=$.extend({},defaults,options);
		var imgs=this.slice(0);
		var img_completeHandler=function(event){
			var img,vpt,imgRect,vptRect,firstRun,style;
			img=event.target||event.srcElement;
			vpt=settings.offsetParentFunction.call(img);
			if(!vpt||vpt.nodeType!==1){
				setTimeout(function(){throw new Error("offset parent not found");},0);
				return;
			}
			firstRun=img.getAttribute("data-zoom")===null;
			imgRect=firstRun?util.getBoudingBoxRect(img,"content-box"):util.getNaturalBoxRect(img);
			vptRect=util.getBoudingBoxRect(vpt,"padding-box");
			style=imgRect.extras;
			switch(settings.imageScale){
			case "fill":
				if(!(imgRect.width&&imgRect.height)){
					imgRect.zoom=1;
				}else if(imgRect.getRatio()<vptRect.getRatio()){
					imgRect.zoom=vptRect.width/imgRect.width;
					style.width="100%";
					style.height="auto";
				}else{
					imgRect.zoom=vptRect.height/imgRect.height;
					style.width="auto";
					style.height="100%";
				}
				break;
			case "fit":
				if(!(imgRect.width&&imgRect.height)){
					imgRect.zoom=1;
				}else if(imgRect.getRatio()<vptRect.getRatio()){
					imgRect.zoom=vptRect.height/imgRect.height;
					style.width="auto";
					style.height="100%";
				}else{
					imgRect.zoom=vptRect.width/imgRect.width;
					style.width="100%";
					style.height="auto";
				}
				break;
			case "none":
			default:
				imgRect.zoom=1;
				break;
			}
			imgRect.alignWith(vptRect,settings.namedPosition);
			if(firstRun){
				settings.ensureParentPositioned();
			}
			style=imgRect.toStyle();
			util.exchangeValue(style,"left",style,"marginLeft");
			util.exchangeValue(style,"top",style,"marginTop");
			img.style.cssText="position: absolute; "+util.toCssText(style);
			img.setAttribute("data-zoom",imgRect.zoom);
		};
		var img_propertychangeHandler=function(event){
			var img;
			if(event.propertyName==="src"){
				img=event.srcElement;
				setTimeout(function(){ //if 4s later the img is still uninitialized, trigger abort handler
					if(img.readyState==="uninitialized")
						img_completeHandler.call(img,{srcElement:img});
				},400);
			}
		};
		var window_resizeHandler=util.bindProxyInterval(function(e){
			imgs.each(support.MSIE<9?function(index,img){
				img_completeHandler({srcElement:img});
			}:function(index,img){
				img_completeHandler.call(img,{target:img});
			});
		},200);
		if(settings.listenWindowResize){
			$(window).on("resize",window_resizeHandler);
		}
		settings.imgs=imgs;
		settings.namedPosition=util.parseNamedPosition(settings.imagePosition);
		settings.img_completeHandler=img_completeHandler;
		settings.img_propertychangeHandler=img_propertychangeHandler;
		return this.each(function(index,img){
			var $img;
			if(!img||
					img.tagName!=="IMG"||
					($img=$(img)).data("imgpos")){
				return;
			}
			$img.data("imgpos",settings);
			util.on(img,"load",img_completeHandler);
			util.on(img,"abort",img_completeHandler);
			util.on(img,"error",img_completeHandler);
			if(support.MSIE<9){
				util.on(img,"propertychange",img_propertychangeHandler);
				if(img.readyState==="uninitialized")
					img_propertychangeHandler({srcElement:img,propertyName:"src"});
				else if(img.complete)
					img_completeHandler({srcElement:img});
			}else{
				if(img.complete)
					img_completeHandler.call(img,{target:img});
			}
		});
	};
	/**
	 * @for jQuery
	 * @method removeImgpos
	 * @chained
	 */
	$.fn.removeImgpos=function(){
		return this.each(function(index,img){
			var $img,settings,imgs;
			if(!img||
					img.tagName!=="IMG"||
					!(settings=($img=$(img)).data("imgpos"))){
				return;
			}
			imgs=settings.imgs;
			util.off(img,"load",settings.img_completeHandler);
			util.off(img,"abort",settings.img_completeHandler);
			util.off(img,"error",settings.img_completeHandler);
			if(support.MSIE<9){
				util.off(img,"propertychange",settings.img_propertychangeHandler);
			}
			var index=$.inArray(img,imgs);
			if(index!==-1)
				Array.prototype.splice.call(imgs,index,1);
			img.style.cssText="";
			img.removeAttribute("data-zoom");
			$img.removeData("imgpos");
		});
	};

	/*~~~~~~~~ declarative boot support ~~~~~~~~*/
	function main(script,selector,options){
		//use util.$$() instead of window.jQuery(), it may be faster
		$(util.$$(selector)).imgpos(options);
	}
	function boot(){
		var script,selector,options;
		script=document.currentScript;
		//XXX
		// if current browser has no feature `document.currentScript`,
		// the "boot" feature will not work when current script is loaded asynchronously/deferred.
		// A reliable `document.currentScript` polyfill is needed to FIXME
		if(!script&&document.readyState!=="complete"){
			script=document.scripts.item(document.scripts.length-1);
		}
		//read data-query from current script as selector
		if(!script||!(selector=script.getAttribute("data-query")))
			return;
		//read data-* attributes from current script as options-to-be
		options=util.getData(script);
		if(options.offsetParentFunction)
			//make the callback string a callback function
			options.offsetParentFunction=new Function(options.offsetParentFunction);
		if(options.listenWindowResize)
			options.listenWindowResize=options.listenWindowResize==="true";
		if(document.body){
			main(script,selector,options);
		}else{
			$(function(){main(script,selector,options);});
		}
	}
	boot();

}(jQuery));