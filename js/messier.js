/*!
	Messier Bingo - Javascript Version
	(c) Stuart Lowe/LCOGT
*/
/*
	TODO:
	Add a hand to the pantograph

	USAGE:
		<script src="js/jquery-1.10.0.min.js" type="text/javascript"></script>
		<script src="js/messier.min.js" type="text/javascript"></script>
		<script type="text/javascript">
		<!--
			$(document).ready(function(){
				bingo = $.messierbingo({id:'starmapper'});
			});
		// -->
		</script>

	OPTIONS (default values in brackets):
*/

// plugin
(function() {
	// For some reason IE 8 has a bug in using .attr('transform') to get the transform.
	// As a work-around we make a function that stores the transform in .data('transform')
	Raphael.fn.transformer = function(el,t){
		return el.transform(t).data('transform',t);
	}
	/**
	 * Prints, but aligns text in a similar way to text(...)
	 */
	Raphael.fn.print_center = function(x, y, string, font, size, letter_spacing) {
		var path = this.print(x, y, string, font, size, 'baseline', letter_spacing);
		var bb = path.getBBox();
		var dx = (x - bb.x) - bb.width / 2;
		var dy = (y - bb.y) - bb.height / 2;
		return this.transformer(path,['t',(-bb.width/2),(bb.height/2)]);
	}

    /** print letter by letter, and return the set of letters (paths), just like the old raphael print() method did. */
    Raphael.fn.printArcLabel = function(ctx, str, font, size, letter_spacing, line_height, ox, oy, r, a, makebackground) {

		var upright = true;
		var text = this.set();
		var clockwise = (upright) ? ((a > 0 && a < 180) ? false : true) : true;

		var x_=0, y_=0, j, t;
		var bb = new Array();
		// Build up a set of paths for each letter
		for (var i = 0; i < str.length; i++) {
			x_ = 0;
			j = i;
			t = this.print(x_,y_,str.charAt(j),font,size,"middle");
			bb.push(t.getBBox());
			t.remove();
			if(str.charAt(j)!='\n') text.push(this.print(x_-bb[i].width/2,y_-line_height/2,str.charAt(j),font,size,"middle"));
			else y_ += line_height;
		}


		var toang = 360/(2*Math.PI*r);
		var d2r = Math.PI/180;

		if(r && a){

			var arclength = (line_height-size)*toang;
			var angs = new Array();
			// Find total length
			var da = 0;
			for(var i = 0; i < text.length; i++) {
				da = (text[i].getBBox().width+letter_spacing)*toang;
				arclength += da;
				angs.push(da);
			}
			arclength += (line_height-size)*toang;
			if(makebackground){
				var c = [ctx.makeSector(ox,oy,a,arclength/2,r+line_height),ctx.makeSector(ox,oy,a,(arclength/2 + 2*toang),r+line_height*1.05)];
				ctx.shadows.push(this.path(c[1]).attr({'fill':ctx.colours.deepshadow,'stroke':0,'cursor':'pointer','opacity':0.8}));
				ctx.arc.push(this.path(c[1]).attr({'fill':ctx.colours.frame,'stroke':0,'cursor':'pointer'}));
				ctx.arc.push(this.path(c[0]).attr({'fill':ctx.colours.white,'stroke':0,'cursor':'pointer'}));
			}
			var ang = clockwise ? a - arclength/2 + (line_height-size)*toang: a + arclength/2 - (line_height-size)*toang;

			var w2,h2,rr;
			var f = clockwise;
			for(var i = 0; i < text.length; i++) {
				w2 = text[i].getBBox().width/2;
				h2 = line_height/2;
				text[i].toFront();
				rr = r+(clockwise ? -(line_height-size)/2 : line_height);
				ang += (clockwise ? 1 : -1)*angs[i]/2;
				this.transformer(text[i],["R",(ang+90+(clockwise ? 0 : -180)),0,0,"T",(ox+rr*Math.cos(ang*d2r)),(oy+rr*Math.sin(ang*d2r))]);
				ang += (clockwise ? 1 : -1)*angs[i]/2;
			}
		}

		return text;
    };
})();
(function ($) {


	/*@cc_on
	// Fix for IE's inability to handle arguments to setTimeout/setInterval
	// From http://webreflection.blogspot.com/2007/06/simple-settimeout-setinterval-extra.html
	(function(f){
		window.setTimeout =f(window.setTimeout);
		window.setInterval =f(window.setInterval);
	})(function(f){return function(c,t){var a=[].slice.call(arguments,2);return f(function(){c.apply(this,a)},t)}});
	@*/
	// Define a shortcut for checking variable types
	function is(a,b){ return (typeof a == b) ? true : false; }

	$.extend($.fn.addTouch = function(){
		// Adapted from http://code.google.com/p/rsslounge/source/browse/trunk/public/javascript/addtouch.js?spec=svn115&r=115
		this.each(function(i,el){
			// Pass the original event object because the jQuery event object
			// is normalized to w3c specs and does not provide the TouchList.
			$(el).bind('touchstart touchmove touchend touchcancel touchdbltap',function(){ handleTouch(event); });
		});
		var handleTouch = function(event){
			event.preventDefault();

			var simulatedEvent;
			var touches = event.changedTouches,
			first = touches[0],
			type = '';
			switch(event.type){
				case 'touchstart':
					type = ['mousedown','click'];
					break;
				case 'touchmove':
					type = ['mousemove'];
					break;
				case 'touchend':
					type = ['mouseup'];
					break;
				case 'touchdbltap':
					type = ['dblclick'];
					break;
				default:
					return;
			}
			for(var i = 0; i < type.length; i++){
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type[i], true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
				first.target.dispatchEvent(simulatedEvent);
			}
		};
	});

	function checkBorders() {
		var div = document.createElement('div');
		div.setAttribute('style', '-moz-border-radius: 8px; -webkit-border-radius: 8px; border-radius: 8px;');
		for ( stylenr=0; stylenr<div.style.length; stylenr++ ) {
			if ( /border.*?-radius/i.test(div.style[stylenr]) ) {
				return true;
			};
		}
		return false;
	};
	jQuery.support.borderRadius = checkBorders();
	jQuery.support.transparency = true;


	// Get the URL query string and parse it
	$.query = function() {
		var r = {length:0};
		var q = location.search;
		if(q && q != '#'){
			// remove the leading ? and trailing &
			q = q.replace(/^\?/,'').replace(/\&$/,'');
			jQuery.each(q.split('&'), function(){
				var key = this.split('=')[0];
				var val = this.split('=')[1];
				if(/^[0-9\.]+$/.test(val)) val = parseFloat(val);	// convert floats
				r[key] = val;
			});
		}
		return r;
	};


	/*! Messier Bingo */
	function MessierBingo(inp){

		this.version = "0.2";

		// Set some variables
		this.q = $.query();    // Query string
		this.urlprefix = inp['urlprefix'];
		this.id = 'paper';
		this.container = $('#'+this.id);
		this.outer = $('#outer');
		this.wide = 1024;
		this.tall = 768;
		this.width = 1024;
		this.height = 768;
		this.aspect = 1024/768;	// The aspect ratio
		this.dialang = 25;
		this.el = {};	// Holder for SVG elements
		// Language support
		// Set the user's language using the browser settings. Over-ride with query string set value
		this.lang = (typeof this.q.lang==="string") ? this.q.lang : (navigator) ? (navigator.userLanguage||navigator.systemLanguage||navigator.language||browser.language) : "";
		this.langshort = (this.lang.indexOf('-') > 0 ? this.lang.substring(0,this.lang.indexOf('-')) : this.lang.substring(0,2));
		this.langs = (inp && inp.langs) ? inp.langs : { 'en': 'English', 'cy':'Cymraeg' };
		this.langurl = this.urlprefix +"/lang/%LANG%.json";

		// Log whether user is authenticated
		this.authenticated = typeof inp.user_auth == "undefined" ? false : inp.user_auth;

		// Process the input parameters/query string
		this.init(inp);

		this.loadLanguage();

		$(window).resize({me:this},function(e){ e.data.me.resize(); });

		return this;
	}

	MessierBingo.prototype.init = function(){

		// Country codes at http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		this.language = (navigator.language) ? navigator.language : navigator.userLanguage;			// Set the user language
		this.langcode = this.language.substring(0,2);

		var el = $('#panel-info');
		this.phrasebook = {
			"language": { "code": "en", "name": "English", "alignment": "left", "translator": "Stuart Lowe" },
			"title": "The Messier Bingo",
			"information": {
				"label": "INFORMATION",
				"on": "ON",
				"off": "OFF",
				"type": { "label": "Type:" },
				"distance": { "label": "Distance:", "lyr": "lyr" },
				"telescope": { "label": "Telescope:" },
				"image": { "label": "Image by:" },
				"original": "Original image"
			},
			"instructions": "<h3>Instructions</h3><p>Get your <a href=\"https://lco.global/education/messierbingo\">bingo card</a> and mark it each time one of your objects appears.</p><p>When you have marked all the objects on your card shout 'Bingo', 'House' or even 'Messier' to win.</p><p>To select a new Messier object press the arrow in the bottom right.</p>",
			"messier": {
				"name": "Charles Messier",
				"bio": "<p><a href=\"https://en.wikipedia.org/wiki/Charles_Messier\" target=\"messier\">Charles Messier</a> was born in 1730 and his interest in astronomy was sparked by a spectacular, six-tailed comet when he was 14.</p><p>He moved to Paris and wanted to become famous by discovering comets. When he looked through his telescope he often re-discovered objects which were already known and were not comets. To make sure he didn't waste time, each time he found an object that did not move in the sky he catalogued it. His famous list contains 110 objects.</p>"
			},
			"next": { "label": "NEXT IMAGE" },
			"power": "Powered by LCOGT"
		};

		this.keys = new Array();

		this.colours = {
			'deepshadow': '#2a2521',
			'shadow': '#534741',
			'framedark': '#766a5c',
			'frame': '#8b796b',
			'frameinlay': '#534741-#5c5048:25-#766a5c:66-#857968:87-#857968:100',
			'portal': '270-#d8cda9:0-#cfc4a2:15-#b7ab8f:41-#8f8470:52-#857968:60-#817565:66-#74685b:71-#5f534a:80-#534741:82',
			'portalover':'90-#d8cda9:0-#cfc4a2:1-#b7ab8f:5-#8f8470:15-#857968:20-#817565:30-#74685b:51-#5f534a:85-#534741',
			'white': '#f8f7f6',
			'brass': '#ddbc83',
			'brassmed': '#be9c67',
			'brassdark': '#ad8a57',
			'screw': '#d1a974',
			'screwdark': '#bc8550',
			'nut': '#fff-#EDD089:46-#E0B96D:68-#BF8329'
		}

		this.colours = {
			'deepshadow': '#4c3328',
			'shadow': '#534741',
			'framedark': '#906a53',
			'frame': '#ad8064',
			'frameinlay': '#593d2a-#6a3616:25-#785441:66-#8f6252:87-#90694c:100',
			'portal': '270-#fccda9:0-#f9c4a2:15-#ebab8f:41-#cf8470:52-#c77968:60-#c37565:66-#b6685b:71-#9f534a:80-#954741:82',
			'portalover':'90-#fccda9:0-#f9c4a2:1-#ebab8f:5-#cf8470:15-#c77968:20-#c37565:30-#b6685b:51-#9f534a:85-#954741',
			'white': '#f8f7f6',
			'brass': '#eeb478',
			'brassmed': '#c88653',
			'brassdark': '#9d683f',
			'screw': '#efa46a',
			'screwdark': '#cd8147',
			'nut': '#fff-#e29f67:46-#eb9c5c:68-#b7733f'
		}

		this.chrome = {
			'frame':{x:0,y:0,w:this.wide,h:this.tall},
			'shadow':{dx:1.8,dy:1.4},
			'clock':{ox:912,oy:222,r:71},
			'title':{ox:660,oy:100},
			'portal':{ox:660,oy:448,r:[276,276*0.96,276*0.85,276*0.825,276*0.81]},
			'dial': {ox:333,oy:100,r:41,dr:30,fontsize:22},
			'button':{ox:925,oy:660,r:50,dr:24,fontsize:18},
			'pipe':{w:14},
			'iris':{'src':this.urlprefix+'/images/iris.png'}
		}

		// Move clock if portal is square
		if(!$.support.borderRadius){
			this.chrome.iris.src = this.urlprefix+'/images/iris_square.png';
			this.chrome.frame = {x:-1.5,y:-1.5,w:this.wide+1,h:this.tall+1};
			this.chrome.portal = {ox:660,oy:448,r:[272,272*0.96,272*0.85,272*0.825,272*0.81]},
			this.chrome.clock = {ox:940,oy:100,r:71};
			this.chrome.button.ox = 935;
			$('#sky img').attr('src',this.chrome.iris.src);
			$('#sky').css({'border-radius':'0'});
			$('#glass').hide();
		}

		this.catalogue = [
			{ 'm': 'M1', 'ngc': 'NGC 1952', 'name': 'Crab Nebula', 'type':'Supernova remnant', 'distance': 6.3, 'constellation': 'Taurus', 'mag': 8.2 , 'avm_icon':'4.1.4-supernova_remnant.png'},
			{ 'm': 'M2', 'ngc': 'NGC 7089', 'name': '', 'type':'Globular cluster', 'distance': 36, 'constellation': 'Aquarius', 'mag': 6.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M3', 'ngc': 'NGC 5272', 'name': '', 'type':'Globular cluster', 'distance': 31, 'constellation': 'Canes Venatici', 'mag': 6.4 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M4', 'ngc': 'NGC 6121', 'name': '', 'type':'Globular cluster', 'distance': 7, 'constellation': 'Scorpius', 'mag': 5.9 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M5', 'ngc': 'NGC 5904', 'name': '', 'type':'Globular cluster', 'distance': 23, 'constellation': 'Serpens', 'mag': 7.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M6', 'ngc': 'NGC 6405', 'name': 'Butterfly Cluster', 'type':'Open cluster', 'distance': 2, 'constellation': 'Scorpius', 'mag': 4.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M7', 'ngc': 'NGC 6475', 'name': 'Ptolemy Cluster', 'type':'Open cluster', 'distance': 1, 'constellation': 'Scorpius', 'mag': 3.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M8', 'ngc': 'NGC 6523', 'name': 'Lagoon Nebula', 'type':'Nebula with cluster', 'distance': 6.5, 'constellation': 'Sagittarius', 'mag': 6.0 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M9', 'ngc': 'NGC 6333', 'name': '', 'type':'Globular cluster', 'distance': 26, 'constellation': 'Ophiuchus', 'mag': 9.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M10', 'ngc': 'NGC 6254', 'name': '', 'type':'Globular cluster', 'distance': 13, 'constellation': 'Ophiuchus', 'mag': 7.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M11', 'ngc': 'NGC 6705', 'name': 'Wild Duck Cluster', 'type':'Open cluster', 'distance': 6, 'constellation': 'Scutum', 'mag': 7.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M12', 'ngc': 'NGC 6218', 'name': '', 'type':'Globular cluster', 'distance': 18, 'constellation': 'Ophiuchus', 'mag': 8.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M13', 'ngc': 'NGC 6205', 'name': 'Great Globular Cluster in Hercules', 'type':'Globular cluster', 'distance': 22, 'constellation': 'Hercules', 'mag': 5.8 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M14', 'ngc': 'NGC 6402', 'name': '', 'type':'Globular cluster', 'distance': 27, 'constellation': 'Ophiuchus', 'mag': 9.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M15', 'ngc': 'NGC 7078', 'name': '', 'type':'Globular cluster', 'distance': 33, 'constellation': 'Pegasus', 'mag': 6.2 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M16', 'ngc': 'NGC 6611', 'name': 'Eagle Nebula', 'type':'Nebula/H II region with cluster', 'distance': 7, 'constellation': 'Serpens', 'mag': 6.5 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M17', 'ngc': 'NGC 6618', 'name': 'Swan Nebula', 'type':'Nebula/H II region with cluster', 'distance': 5, 'constellation': 'Sagittarius', 'mag': 6.0 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M18', 'ngc': 'NGC 6613', 'name': '', 'type':'Open cluster', 'distance': 6, 'constellation': 'Sagittarius', 'mag': 8.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M19', 'ngc': 'NGC 6273', 'name': '', 'type':'Globular cluster', 'distance': 27, 'constellation': 'Ophiuchus', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M20', 'ngc': 'NGC 6514', 'name': 'Trifid Nebula', 'type':'Nebula/H II region with cluster', 'distance': 5.2, 'constellation': 'Sagittarius', 'mag': 6.3 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M21', 'ngc': 'NGC 6531', 'name': '', 'type':'Open cluster', 'distance': 3, 'constellation': 'Sagittarius', 'mag': 7.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M22', 'ngc': 'NGC 6656', 'name': 'Sagittarius Cluster', 'type':'Globular cluster', 'distance': 10, 'constellation': 'Sagittarius', 'mag': 5.1 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M23', 'ngc': 'NGC 6494', 'name': '', 'type':'Open cluster', 'distance': 4.5, 'constellation': 'Sagittarius', 'mag': 6.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M24', 'ngc': 'IC 4715', 'name': 'Sagittarius Star Cloud', 'type':'Milky Way star cloud', 'distance': 10.0, 'constellation': 'Sagittarius', 'mag': 4.6 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M25', 'ngc': 'IC 4725', 'name': '', 'type':'Open cluster', 'distance': 2, 'constellation': 'Sagittarius', 'mag': 4.9 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M26', 'ngc': 'NGC 6694', 'name': '', 'type':'Open cluster', 'distance': 5, 'constellation': 'Scutum', 'mag': 9.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M27', 'ngc': 'NGC 6853', 'name': 'Dumbbell Nebula', 'type':'Planetary nebula', 'distance': 1.25, 'constellation': 'Vulpecula', 'mag': 7.5 , 'avm_icon':'4.1.3-planetary_nebula.png'},
			{ 'm': 'M28', 'ngc': 'NGC 6626', 'name': '', 'type':'Globular cluster', 'distance': 18, 'constellation': 'Sagittarius', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M29', 'ngc': 'NGC 6913', 'name': '', 'type':'Open cluster', 'distance': 7.2, 'constellation': 'Cygnus', 'mag': 9.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M30', 'ngc': 'NGC 7099', 'name': '', 'type':'Globular cluster', 'distance': 25, 'constellation': 'Capricornus', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M31', 'ngc': 'NGC 224', 'name': 'Andromeda Galaxy', 'type':'Spiral galaxy', 'distance': 2500, 'constellation': 'Andromeda', 'mag': 3.4 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M32', 'ngc': 'NGC 221', 'name': '', 'type':'Elliptical galaxy', 'distance': 2900, 'constellation': 'Andromeda', 'mag': 8.1 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M33', 'ngc': 'NGC 598', 'name': 'Triangulum Galaxy', 'type':'Spiral galaxy', 'distance': 2810, 'constellation': 'Triangulum', 'mag': 5.7 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M34', 'ngc': 'NGC 1039', 'name': '', 'type':'Open cluster', 'distance': 1.4, 'constellation': 'Perseus', 'mag': 6.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M35', 'ngc': 'NGC 2168', 'name': '', 'type':'Open cluster', 'distance': 2.8, 'constellation': 'Gemini', 'mag': 5.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M36', 'ngc': 'NGC 1960', 'name': '', 'type':'Open cluster', 'distance': 4.1, 'constellation': 'Auriga', 'mag': 6.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M37', 'ngc': 'NGC 2099', 'name': '', 'type':'Open cluster', 'distance': 4.6, 'constellation': 'Auriga', 'mag': 6.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M38', 'ngc': 'NGC 1912', 'name': '', 'type':'Open cluster', 'distance': 4.2, 'constellation': 'Auriga', 'mag': 7.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M39', 'ngc': 'NGC 7092', 'name': '', 'type':'Open cluster', 'distance': 0.8, 'constellation': 'Cygnus', 'mag': 5.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M40', 'ngc': '', 'name': 'Winnecke 4', 'type':'Double star', 'distance': 0.5, 'constellation': 'Ursa Major', 'mag': 9.0 , 'avm_icon':'3-star.png'},
			{ 'm': 'M41', 'ngc': 'NGC 2287', 'name': '', 'type':'Open cluster', 'distance': 2.3, 'constellation': 'Canis Major', 'mag': 4.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M42', 'ngc': 'NGC 1976', 'name': 'Orion Nebula', 'type':'Nebula/H II region', 'distance': 1.6, 'constellation': 'Orion', 'mag': 4.0 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M43', 'ngc': 'NGC 1982', 'name': 'De Mairan\'s Nebula', 'type':'Nebula (part of the Orion Nebula)', 'distance': 1.6, 'constellation': 'Orion', 'mag': 7.0 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M44', 'ngc': 'NGC 2632', 'name': 'Beehive Cluster', 'type':'Open cluster', 'distance': 0.6, 'constellation': 'Cancer', 'mag': 3.7 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M45', 'ngc': '', 'name': 'Pleiades', 'type':'Open cluster', 'distance': 0.4, 'constellation': 'Taurus', 'mag': 1.6 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M46', 'ngc': 'NGC 2437', 'name': '', 'type':'Open cluster', 'distance': 5.4, 'constellation': 'Puppis', 'mag': 6.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M47', 'ngc': 'NGC 2422', 'name': '', 'type':'Open cluster', 'distance': 1.6, 'constellation': 'Puppis', 'mag': 4.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M48', 'ngc': 'NGC 2548', 'name': '', 'type':'Open cluster', 'distance': 1.5, 'constellation': 'Hydra', 'mag': 5.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M49', 'ngc': 'NGC 4472', 'name': '', 'type':'Elliptical galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 10.0 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M50', 'ngc': 'NGC 2323', 'name': '', 'type':'Open cluster', 'distance': 3, 'constellation': 'Monoceros', 'mag': 7.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M51', 'ngc': 'NGC 5194, NGC 5195', 'name': 'Whirlpool Galaxy', 'type':'Spiral galaxy', 'distance': 37000, 'constellation': 'Canes Venatici', 'mag': 8.4 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M52', 'ngc': 'NGC 7654', 'name': '', 'type':'Open cluster', 'distance': 7, 'constellation': 'Cassiopeia', 'mag': 8.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M53', 'ngc': 'NGC 5024', 'name': '', 'type':'Globular cluster', 'distance': 56, 'constellation': 'Coma Berenices', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M54', 'ngc': 'NGC 6715', 'name': '', 'type':'Globular cluster', 'distance': 83, 'constellation': 'Sagittarius', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M55', 'ngc': 'NGC 6809', 'name': '', 'type':'Globular cluster', 'distance': 17, 'constellation': 'Sagittarius', 'mag': 7.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M56', 'ngc': 'NGC 6779', 'name': '', 'type':'Globular cluster', 'distance': 32, 'constellation': 'Lyra', 'mag': 9.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M57', 'ngc': 'NGC 6720', 'name': 'Ring Nebula', 'type':'Planetary nebula', 'distance': 2.3, 'constellation': 'Lyra', 'mag': 8.8 , 'avm_icon':'4.1.3-planetary_nebula.png'},
			{ 'm': 'M58', 'ngc': 'NGC 4579', 'name': '', 'type':'Barred spiral galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M59', 'ngc': 'NGC 4621', 'name': '', 'type':'Elliptical galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.5 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M60', 'ngc': 'NGC 4649', 'name': '', 'type':'Elliptical galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 10.5 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M61', 'ngc': 'NGC 4303', 'name': '', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M62', 'ngc': 'NGC 6266', 'name': '', 'type':'Globular cluster', 'distance': 22, 'constellation': 'Ophiuchus', 'mag': 8.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M63', 'ngc': 'NGC 5055', 'name': 'Sunflower Galaxy', 'type':'Spiral galaxy', 'distance': 37000, 'constellation': 'Canes Venatici', 'mag': 8.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M64', 'ngc': 'NGC 4826', 'name': 'Black Eye Galaxy', 'type':'Spiral galaxy', 'distance': 12000, 'constellation': 'Coma Berenices', 'mag': 9.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M65', 'ngc': 'NGC 3623', 'name': 'Leo Triplet', 'type':'Barred spiral galaxy', 'distance': 35000, 'constellation': 'Leo', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M66', 'ngc': 'NGC 3627', 'name': 'Leo Triplet', 'type':'Barred spiral galaxy', 'distance': 35000, 'constellation': 'Leo', 'mag': 10.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M67', 'ngc': 'NGC 2682', 'name': '', 'type':'Open cluster', 'distance': 2.25, 'constellation': 'Cancer', 'mag': 7.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M68', 'ngc': 'NGC 4590', 'name': '', 'type':'Globular cluster', 'distance': 32, 'constellation': 'Hydra', 'mag': 9.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M69', 'ngc': 'NGC 6637', 'name': '', 'type':'Globular cluster', 'distance': 25, 'constellation': 'Sagittarius', 'mag': 9.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M70', 'ngc': 'NGC 6681', 'name': '', 'type':'Globular cluster', 'distance': 28, 'constellation': 'Sagittarius', 'mag': 9.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M71', 'ngc': 'NGC 6838', 'name': '', 'type':'Globular cluster', 'distance': 12, 'constellation': 'Sagitta', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M72', 'ngc': 'NGC 6981', 'name': '', 'type':'Globular cluster', 'distance': 53, 'constellation': 'Aquarius', 'mag': 10.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M73', 'ngc': 'NGC 6994', 'name': '', 'type':'Asterism', 'distance': -1, 'constellation': 'Aquarius', 'mag': 9.0 , 'avm_icon':'3-star.png'},
			{ 'm': 'M74', 'ngc': 'NGC 628', 'name': '', 'type':'Spiral galaxy', 'distance': 35000, 'constellation': 'Pisces', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M75', 'ngc': 'NGC 6864', 'name': '', 'type':'Globular cluster', 'distance': 58, 'constellation': 'Sagittarius', 'mag': 9.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M76', 'ngc': 'NGC 650, NGC 651', 'name': 'Little Dumbbell Nebula', 'type':'Planetary nebula', 'distance': 3.4, 'constellation': 'Perseus', 'mag': 10.1 , 'avm_icon':'4.1.3-planetary_nebula.png'},
			{ 'm': 'M77', 'ngc': 'NGC 1068', 'name': 'Cetus A', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Cetus', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M78', 'ngc': 'NGC 2068', 'name': '', 'type':'Nebula, diffuse', 'distance': 1.6, 'constellation': 'Orion', 'mag': 8.0 , 'avm_icon':'4-nebula.png'},
			{ 'm': 'M79', 'ngc': 'NGC 1904', 'name': '', 'type':'Globular cluster', 'distance': 40, 'constellation': 'Lepus', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M80', 'ngc': 'NGC 6093', 'name': '', 'type':'Globular cluster', 'distance': 27, 'constellation': 'Scorpius', 'mag': 8.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M81', 'ngc': 'NGC 3031', 'name': 'Bode\'s Galaxy', 'type':'Spiral galaxy', 'distance': 12000, 'constellation': 'Ursa Major', 'mag': 6.9 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M82', 'ngc': 'NGC 3034', 'name': 'Cigar Galaxy', 'type':'Starburst galaxy', 'distance': 11000, 'constellation': 'Ursa Major', 'mag': 9.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M83', 'ngc': 'NGC 5236', 'name': 'Southern Pinwheel Galaxy', 'type':'Barred spiral galaxy', 'distance': 10000, 'constellation': 'Hydra', 'mag': 8.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M84', 'ngc': 'NGC 4374', 'name': '', 'type':'Lenticular galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M85', 'ngc': 'NGC 4382', 'name': '', 'type':'Lenticular galaxy', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 10.5 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M86', 'ngc': 'NGC 4406', 'name': '', 'type':'Lenticular galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M87', 'ngc': 'NGC 4486', 'name': 'Virgo A', 'type':'Elliptical galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M88', 'ngc': 'NGC 4501', 'name': '', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M89', 'ngc': 'NGC 4552', 'name': '', 'type':'Elliptical galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.5 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M90', 'ngc': 'NGC 4569', 'name': '', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M91', 'ngc': 'NGC 4548', 'name': '', 'type':'Barred spiral galaxy', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M92', 'ngc': 'NGC 6341', 'name': '', 'type':'Globular cluster', 'distance': 26, 'constellation': 'Hercules', 'mag': 7.5 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M93', 'ngc': 'NGC 2447', 'name': '', 'type':'Open cluster', 'distance': 4.5, 'constellation': 'Puppis', 'mag': 6.5 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M94', 'ngc': 'NGC 4736', 'name': '', 'type':'Spiral galaxy', 'distance': 14500, 'constellation': 'Canes Venatici', 'mag': 9.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M95', 'ngc': 'NGC 3351', 'name': '', 'type':'Barred spiral galaxy', 'distance': 38000, 'constellation': 'Leo', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M96', 'ngc': 'NGC 3368', 'name': '', 'type':'Spiral galaxy', 'distance': 38000, 'constellation': 'Leo', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M97', 'ngc': 'NGC 3587', 'name': 'Owl Nebula', 'type':'Planetary nebula', 'distance': 2.6, 'constellation': 'Ursa Major', 'mag': 9.9 , 'avm_icon':'4.1.3-planetary_nebula.png'},
			{ 'm': 'M98', 'ngc': 'NGC 4192', 'name': '', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M99', 'ngc': 'NGC 4254', 'name': '', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M100', 'ngc': 'NGC 4321', 'name': '', 'type':'Spiral galaxy', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 10.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M101', 'ngc': 'NGC 5457', 'name': 'Pinwheel Galaxy', 'type':'Spiral galaxy', 'distance': 27000, 'constellation': 'Ursa Major', 'mag': 7.9 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M102', 'ngc': '(Not conclusively identified)', 'name': '', 'type':' ', 'distance': -1, 'constellation': '', 'mag': -30 , 'avm_icon':''},
			{ 'm': 'M103', 'ngc': 'NGC 581', 'name': '', 'type':'Open cluster', 'distance': 8, 'constellation': 'Cassiopeia', 'mag': 7.0 , 'avm_icon':'3.6.4.1-open_cluster.png'},
			{ 'm': 'M104', 'ngc': 'NGC 4594', 'name': 'Sombrero Galaxy', 'type':'Spiral galaxy', 'distance': 50000, 'constellation': 'Virgo', 'mag': 9.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M105', 'ngc': 'NGC 3379', 'name': '', 'type':'Elliptical galaxy', 'distance': 38000, 'constellation': 'Leo', 'mag': 11.0 , 'avm_icon':'5.1.4-elliptical_galaxy.png'},
			{ 'm': 'M106', 'ngc': 'NGC 4258', 'name': '', 'type':'Spiral galaxy', 'distance': 25000, 'constellation': 'Canes Venatici', 'mag': 9.5 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M107', 'ngc': 'NGC 6171', 'name': '', 'type':'Globular cluster', 'distance': 20, 'constellation': 'Ophiuchus', 'mag': 10.0 , 'avm_icon':'3.6.4.2-globular_cluster.png'},
			{ 'm': 'M108', 'ngc': 'NGC 3556', 'name': '', 'type':'Barred spiral galaxy', 'distance': 45000, 'constellation': 'Ursa Major', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M109', 'ngc': 'NGC 3992', 'name': '', 'type':'Barred spiral galaxy', 'distance': 55000, 'constellation': 'Ursa Major', 'mag': 11.0 , 'avm_icon':'5.1.1-spiral_galaxy.png'},
			{ 'm': 'M110', 'ngc': 'NGC 205', 'name': '', 'type':'Dwarf elliptical galaxy', 'distance': 2200, 'constellation': 'Andromeda', 'mag': 10.0, 'avm_icon':'5.1.4-elliptical_galaxy.png' }
]

		this.avm_logos = [
			{'code':'3', 'image' : '3-star.png'},
			{'code':'3.6.4.1', 'image' : '3.6.4.1-open_cluster.png'},
			{'code':'3.6.4.2', 'image' : '3.6.4.2-globular_cluster.png'},
			{'code':'4', 'image' : 'objects/4-nebula.png'},
			{'code':'4.1.3', 'image' : '4.1.3-planetary_nebula.png'},
			{'code':'4.1.4', 'image' : '4.1.4-supernova_remnant.png'},
			{'code':'5.1.1', 'image' : '5.1.1-spiral_galaxy.png'},
			{'code':'5.1.4', 'image' : '5.1.4-elliptical_galaxy.png'},
			{'code':'5.1.6', 'image' : '5.1.6-interacting_galaxy.png'}
		]

		this.setWindows();
		this.observable_objects(this.startstamp, this.endstamp);

		this.resize();

		if($.support.transparency){
			$(document).on('mousemove',{mb:this},function(e){
				var now = new Date();
				mb.moveEyes(e.clientX,e.clientY);
			});
		}

		// Temporarily stopping this because it is messing up at login
		// $(document).on('keypress',{mb:this},function(e){
		// 	if(!e) e = window.event;
		// 	var code = e.keyCode || e.charCode || e.which || 0;
		// 	e.data.mb.keypress(code,e);
		// });

		this.registerKey('r',function(){ this.reset(); });
		this.registerKey('i',function(){ this.toggleDial(); });
		this.registerKey('1',function(){ this.loadMessierObject(1); });
		this.registerKey('2',function(){ this.loadMessierObject(2); });
		this.registerKey('3',function(){ this.loadMessierObject(3); });
		this.registerKey('4',function(){ this.loadMessierObject(4); });
		this.registerKey('5',function(){ this.loadMessierObject(5); });
		this.registerKey('6',function(){ this.loadMessierObject(6); });
		this.registerKey('7',function(){ this.loadMessierObject(7); });
		this.registerKey('8',function(){ this.loadMessierObject(48); });
		this.registerKey('n',function(){ this.next(); });
		this.registerKey(39,function(){ this.next(); });
		this.registerKey('e',function(){ this.loadLanguage('en'); });
		this.registerKey('w',function(){ this.loadLanguage('cy'); });

		this.dialon = true;
		this.setDial(this.dialon);

		// Make the clock tick
		this.tick();

		this.reset();

		return this;
	}

	// Function to reset the bingo
	MessierBingo.prototype.reset = function(){

		// Rebuild the TODO array
		this.todo = new Array(110);
		for(var i = 0; i < this.todo.length; i++){ this.todo[i] = i+1; }

		// Hide the Messier bio panel if showing
		if(this.pantograph[1].on) this.pantograph[1].toggle();

		// Show the information text
		var _obj = this;
		var _ins = '<div class="content"><div class="inner"><div class="padded">'+this.phrasebook.instructions+'</div></div></div>';
		var _i = -1;
		if(!this.pantograph[0].on){
			this.updateInfo(_i,_ins);
			this.pantograph[0].toggle();
		}else{
			this.pantograph[0].updateInfo(300,function(){ _obj.updateInfo(_i,_ins); });
		}

		// Set the info dial button
		this.dialon = true;
		this.setDial(this.dialon);

		return this;
	}

	MessierBingo.prototype.observable_objects = function(startstamp, endstamp){
	// Get list of currently visible Messier Objects from WhatsUP
	// Provides default observing parameters which are used to modify this.catalogue
		var url = 'https://whatsup.lco.global/range/?start='+startstamp+'&aperture=0m4&end='+endstamp+'&full=messier&format=jsonp';
		$.ajax({
			url: url,
			method: 'GET',
			cache: false,
			dataType: 'jsonp',
			context: this,
			error: function(){
				this.log('Error loading data from '+url);
			},
			success: function(data){
				this.update_catalogue(data);
			}
		});
	}

	MessierBingo.prototype.submit_schedule = function(token, portal_token, proposal){
	// Get list of currently visible Messier Objects from WhatsUP
	// Provides default observing parameters which are used to modify this.catalogue
		var html = ''
		var url = '/schedule/';
		var mobject = $('#make-request').attr('data-objectid')
		var obs_vals = $.grep(this.catalogue, function(e){ return e.m == mobject; });
    submit_to_serol(obs_vals[0], this.startstamp, this.endstamp)
	}

	// Update the hardwired catalogue with latest observing info from WhatsUP API call
	MessierBingo.prototype.update_catalogue = function(data){
		var m;
		var current;
		for (i=0;i < this.catalogue.length;i++){
			m = this.catalogue[i]
			current = $.grep(data['targets'], function(e){ return e.name == m['m']; });
			if (current[0]) {
				m['aperture'] = '0m4';
				m['ra'] = current[0].ra ;
				m['dec'] = current[0].dec ;
				m['filters'] = current[0].filters ;
			} else {
				m['exp'] = 0 ;
				m['aperture'] = 'none' ;
				m['ra'] = 0 ;
				m['dec'] = 0 ;
				m['filters'] = 'rp' ;
			}
		}
	}


	// Update the clock every n seconds
	MessierBingo.prototype.tick = function(n){
		this.setTime();
		if(!n) n = 10;
		var _obj = this;
		this.eAnim = setTimeout(function () { _obj.tick(n); }, n*1000);
	}

	MessierBingo.prototype.resize = function(w,h){
		// Set the width and height (taking into account the borders/padding of the container)
		if(typeof w!=="number") w = $(window).width()-(this.outer.outerWidth() - this.outer.width());
		if(typeof h!=="number") h = $(window).height()-(this.outer.outerHeight() - this.outer.height());
		if(w/h != this.aspect) w = h*this.aspect;
		if(w > $(window).width()){
			w = $(window).width();
			h = parseInt(w/this.aspect);
		}
		this.wide = Math.round(w);
		this.tall = Math.round(h);

		this.outer.css({'width':w+'px','height':h+'px'});
		$('body').css({'font-size':Math.round(h/30)+'px'});

		var attr = {'left':(100*(this.chrome.portal.ox-this.chrome.portal.r[this.chrome.portal.r.length-1])/this.width)+'%','width':(100*this.chrome.portal.r[this.chrome.portal.r.length-1]*2/this.width)+'%','top':(100*(this.chrome.portal.oy-this.chrome.portal.r[this.chrome.portal.r.length-1])/this.height)+'%','height':(100*this.chrome.portal.r[this.chrome.portal.r.length-1]*2/this.height)+'%'};
		$('#sky').css(attr);
		$('#glass').css(attr);
		$('#glass-small').css({'left':Math.round(0.054*this.wide)+'px','width':Math.round(0.156*this.wide)+'px','top':Math.round(0.074*this.tall)+'px','height':Math.round(0.208*this.tall)+'px'});
		if(this.pantograph) this.pantograph[0].resize();
		if(this.pantograph) this.pantograph[1].resize();

		this.drawBox();

		return this;
	}

	// Load the specified language
	// If it fails and this was the long variation of the language (e.g. "en-gb" or "zh-yue"), try the short version (e.g. "en" or "zh")
	MessierBingo.prototype.loadLanguage = function(l,fn){
		if(!l) l = this.langshort;
		var url = this.langurl.replace('%LANG%',l);
		if(!this.langs[l]) return this;
		$.ajax({
			url: url,
			method: 'GET',
			cache: false,
			dataType: 'json',
			context: this,
			error: function(){
				this.log('Error loading '+l+' from '+url);
				if(this.lang.length == 2){
					this.log('Attempting to load default (en) instead');
					this.loadLanguage('en',fn);
				}else{
					if(url.indexOf(this.lang) > 0){
						this.log('Attempting to load '+this.langshort+' instead');
						this.loadLanguage(this.langshort,fn);
					}
				}
			},
			success: function(data){
				this.langshort = l;
				this.lang = l;
				// Store the data
				this.phrasebook = data;
				this.updateText();
			}
		});
		return this;
	}

	MessierBingo.prototype.updateText = function(){

		// Replace the SVG elements
		this.clear();
		this.box.remove();
		this.box = undefined;
		this.drawBox();

		// Update HTML elements
		$('#nametoggle a').text(this.phrasebook.messier.name);
		$('#messier .inner .padded').html(this.phrasebook.messier.bio);
		$('#panel-info').html(this.phrasebook.instructions);
		return this;
	}

	MessierBingo.prototype.getScale = function(){
		return this.wide/1024;
	}

	MessierBingo.prototype.scaleBox = function(){

		var scale = this.getScale();
		var attr = {'transform':'s '+scale+','+scale+',0,0'};

		this.texture.attr(attr);
		this.pipes.attr(attr);
		this.portal.attr(attr);
		this.nuts.attr(attr);
		this.screws.attr(attr);
		this.dial.attr(attr);
		this.nextbutton.attr(attr);
		this.resetbutton.attr(attr);

		// We need to be careful scaling things that have a rotation applied
		var todo = new Array();
		for(var p = 0; p < this.pantograph.length ; p++){
			for(var h = 0 ; h < this.pantograph[p].group.length ; h++) todo.push(this.pantograph[p].group[h]);
		}
		for(var h = 0 ; h < this.shadows.length ; h++) todo.push(this.shadows[h]);
		for(var h = 0 ; h < this.messier.length ; h++) todo.push(this.messier[h]);
		for(var h = 0 ; h < this.clock.length ; h++) todo.push(this.clock[h]);
		for(var h = 0 ; h < this.texts.length ; h++) todo.push(this.texts[h]);
		for(var h = 0 ; h < this.overlay.length ; h++) todo.push(this.overlay[h]);
		for(var h = 0 ; h < this.frame.length ; h++) todo.push(this.frame[h]);
		for(var h = 0 ; h < this.arc.length ; h++) todo.push(this.arc[h]);
		for(var h = 0 ; h < this.hands.length ; h++) todo.push(this.hands[h]);
		for(var h = 0 ; h < this.dialhandle.length ; h++) todo.push(this.dialhandle[h]);
		for(var h = 0 ; h < this.dialtext.length ; h++) todo.push(this.dialtext[h]);
		for(var h = 0 ; h < this.dialtexton.length ; h++) todo.push(this.dialtexton[h]);
		for(var h = 0 ; h < this.dialtextoff.length ; h++) todo.push(this.dialtextoff[h]);
		for(var h = 0 ; h < this.nexttext.length ; h++) todo.push(this.nexttext[h]);
		for(var h = 0 ; h < this.poweredby.length ; h++) todo.push(this.poweredby[h]);
		for(var h = 0 ; h < this.dialbg.length ; h++) todo.push(this.dialbg[h]);

		var h, m, i, t;
		for(var h = 0 ; h < todo.length ; h++){
			t = todo[h].data('transform');
			if(typeof t==="undefined") t = todo[h].attr('transform');
			if(typeof t!=="object") t = [];

			m = false;
			for(i = 0; i < t.length ; i++){
				if(t[i][0] == 's' || t[i][0] == 'S'){
					t[i] = ['S',scale,scale,0,0];
					m = true;
				}
			}
			if(!m) t.push(['S',scale,scale,0,0]);
			// Re-apply the transform
			todo[h].transform(t)
		}

		return this;
	}

	MessierBingo.prototype.drawText = function(el,x,y,txt,fs){
		// Hide the existing content
		//el.wrapInner("<div class='hidden'></div>&nbsp;");
		el.css({'opacity':0.01});
		// Replace title text
		var id = el.attr('id');
		if(!this.texts) this.texts = this.box.set();
		return this.texts.push(this.box.print_center(x,y,txt,this.box.getFont("Birch Std"),fs));
	}

	MessierBingo.prototype.clear = function(){

		for(var i = 0; i < this.pantograph.length; i++) this.pantograph[i].remove();
		for(var h = 0 ; h < this.shadows.length ; h++) this.shadows[h].remove();
		for(var h = 0 ; h < this.messier.length ; h++) this.messier[h].remove();
		for(var h = 0 ; h < this.clock.length ; h++) this.clock[h].remove();
		for(var h = 0 ; h < this.texts.length ; h++) this.texts[h].remove();
		for(var h = 0 ; h < this.overlay.length ; h++) this.overlay[h].remove();
		for(var h = 0 ; h < this.frame.length ; h++) this.frame[h].remove();
		for(var h = 0 ; h < this.arc.length ; h++) this.arc[h].remove();
		for(var h = 0 ; h < this.hands.length ; h++) this.hands[h].remove();
		for(var h = 0 ; h < this.dialhandle.length ; h++) this.dialhandle[h].remove();
		for(var h = 0 ; h < this.dialtext.length ; h++) this.dialtext[h].remove();
		for(var h = 0 ; h < this.dialtexton.length ; h++) this.dialtexton[h].remove();
		for(var h = 0 ; h < this.dialtextoff.length ; h++) this.dialtextoff[h].remove();
		for(var h = 0 ; h < this.nexttext.length ; h++) this.nexttext[h].remove();
		for(var h = 0 ; h < this.poweredby.length ; h++) this.poweredby[h].remove();
		for(var h = 0 ; h < this.dialbg.length ; h++) this.dialbg[h].remove();

	}

	MessierBingo.prototype.drawBox = function(){

		if(typeof this.box!=="undefined"){
			this.box.setSize(this.wide,this.tall)
			this.scaleBox();
			return this;
		}

		var path,ox,oy,r;

		// Create a canvas to draw on
		this.box = Raphael(this.id, this.wide, this.tall);

		this.shadows = this.box.set();

		// Add the portal shadow
		if($.support.borderRadius) this.shadows.push(this.box.circle(this.chrome.portal.ox,this.chrome.portal.oy,this.chrome.portal.r[0]).attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.8}));
		else this.shadows.push(this.box.rect(this.chrome.portal.ox-this.chrome.portal.r[0],this.chrome.portal.oy-this.chrome.portal.r[0],this.chrome.portal.r[0]*2,this.chrome.portal.r[0]*2).attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.8}));

		// Add the shadow behind the clock
		this.shadows.push(this.box.circle(this.chrome.clock.ox,this.chrome.clock.oy,this.chrome.clock.r).attr({'fill':this.colours.deepshadow,'opacity':0.8,'stroke':0}));

		// Add patina to textured background
		this.texture = this.box.rect(0,0,this.width,this.height).attr({'fill':'#536814','opacity':0.1});

		// Make the scissor/pantograph mechanism
		this.pantograph = new Array()
		this.pantograph.push(new Pantograph(this,410,450,432,200,100,4,$('#panel')));
		this.pantograph.push(new Pantograph(this,138,260,145,515,75,6,$('#messier'),true));
		this.pantograph[0].toggle();

		// Update border colour
		$('#messier, #panel').css({'border-color':this.colours.framedark});

		// pipes
		this.pipes = this.box.set();
		this.makePipe(this.chrome.portal.ox,this.chrome.portal.oy+this.chrome.portal.r[0]/2 - this.chrome.pipe.w*2,(this.chrome.button.ox+(this.chrome.pipe.w*1.5)-this.chrome.portal.ox),(this.chrome.button.oy-this.chrome.portal.oy-this.chrome.portal.r[0]/2+this.chrome.pipe.w*2),this.chrome.pipe.w);
		this.makePipe(this.chrome.portal.ox,this.chrome.portal.oy+this.chrome.portal.r[0]/2,(this.chrome.button.ox-(this.chrome.pipe.w*0.5)-this.chrome.portal.ox),(this.chrome.button.oy-this.chrome.portal.oy-this.chrome.portal.r[0]/2),this.chrome.pipe.w);

		this.path = {
			'frame': 'm 0,0 0,768 1024,0 0,-768 z m 50,20 56,0 c 10,0 10,6 10,12 0,10 -0.0865,13.880818 -8.03121,16.249997 l 0.3125,0 c -28.8429,8.998584 -51.6852,31.523995 -61.0625,60.093753 -3.218795,5.65626 -3.218795,5.65626 -17.218796,5.65626 -6,0 -10,-2 -10,-10 l 0,-54.000003 c 16,0 30,-14 30.000006,-30.000007 z m 116.04,0 810,0 c 0,16 12,30 28,30 l 0,24 c 0,10 0,10 -10,10 L 870.16498,83.75 c -0.5869,-0.06762 -2.7706,-0.395606 -4.125,-1.75 -1.5625,-1.5625 -0.50054,-5.187503 -4.18804,-9.250003 -3.6875,-4.0625 -6.9271,-6.36815 -10.1875,-7.8125 -3.2603,-1.44435 -6.855,-1.79097 -8.0625,-3.375 -1.2074,-1.58403 -1,-2.625 -1,-2.625 l -0.062,-5.1875 c -0.36651,-3.884268 -1.82185,-6.185705 -6.4375,-6.3125 l -354.563,0.437501 c 0,0 -0.2157,-0.01727 -0.5625,0 -3.68705,0.579275 -6.00516,2.192098 -5.875,6.3125 l -0.062,5.1875 c 0,0 0.2075,1.04097 -1,2.625 -1.2074,1.58403 -4.8021,1.93065 -8.0625,3.375 -3.2603,1.44435 -6.5,3.75 -10.1875,7.8125 -3.6875,4.0625 -3.74956,9.687494 -5.31206,11.249994 -1.3544,1.354394 -3.538,1.682377 -4.125,1.75 L 374.03992,86 c -3.25042,-0.837489 -5.38858,-4.096134 -6.74904,-7.250009 0,0 -10,-19.25 -34.5,-19.25 -24.5,0 -34.1875,19.53125 -34.1875,19.53125 -1.56295,3.160672 -3.06893,6.302591 -6.56347,6.968759 l -74,0 c -0.9252,-0.10884 -2.3382,-0.310124 -3.2188,-0.6875 -0.378,-0.162031 -0.7228,-0.434325 -1.0312,-0.71875 C 202.01783,68.039553 184.2533,54.441643 164.4073,48.24996 l 0.25,0 c -8.65728,-2.249995 -8.65728,-10.249996 -8.65728,-16.249997 0,-6 0,-12 10,-12 z m 64.00051,94 62,0 c 3.54485,0.48929 4.77546,3.20312 6.56247,6.34374 0,0 9.6875,19.5625 34.1875,19.5625 24.5,0 34.5,-19.25 34.5,-19.25 1.88451,-2.76658 3.19132,-5.97772 6.75004,-6.65624 l 72,0 c 1.5785,-0.0626 4,0 4.37495,2.24999 1.5625,1.5625 1.1875,2.375 4.875,6.4375 3.6875,4.0625 6.9272,6.36815 10.1875,7.8125 3.2604,1.44435 6.8551,1.79097 8.0625,3.375 1.2075,1.58403 1,2.625 1,2.625 l 0.062,5.1875 c 0.36654,3.88425 0.82246,6.18572 5.43806,6.31252 l 126,0 c 9.96927,2e-5 14,6 14,16 -0.0405,7.99997 -2.04046,11.99997 -8.04046,11.99997 0,45 2,536.50013 2,544.00007 6,2 6,4 6.04046,11.99996 0,10 -4,16 -14,16 -202.62855,-0.36021 -374.31059,0 -556,0 0,-16 -14,-30 -30,-30 l 0,-550 c 0,-8 4,-10 10,-10 14,0 14,0 16,6 9.217,32.0417 35.424995,56.09009 68.1246,64 0.7229,0.21187 1.8781,0.63578 2.375,1.5 0.7361,1.28033 0.5,2 0.5,3 0,1 0.033,1.95521 -0.6875,2.75 -0.7202,0.79479 -4.0625,0.78125 -4.0625,0.78125 l -38.750105,-0.0312 c 0,0 -2.7754,-0.27189 -4.6562,1.53125 -1.8809,1.80314 -1.5313,5.125 -1.5313,5.125 0,0 -13.2812,0.39958 -13.2812,13.8125 0,13.41291 12.4062,14.5 12.4062,14.5 0,0 -0.5732,3.98391 1,5.96875 1.5733,1.98483 4.0938,2.03125 4.0938,2.03125 l 129.093705,0 c 0,0 2.5206,-0.0464 4.0938,-2.03125 1.5732,-1.98484 1,-5.96875 1,-5.96875 0,0 13.1045,-0.57636 13.2812,-13.8125 0.1768,-13.23615 -14.1875,-14.5 -14.1875,-14.5 0,0 0.3496,-3.32186 -1.5312,-5.125 -1.8809,-1.80314 -4.625,-1.53125 -4.625,-1.53125 l -36.75,0.0312 c 0,0 -3.3736,0.0135 -4.0938,-0.78125 -0.7201,-0.79479 -0.6562,-1.75 -0.6562,-2.75 0,-1 -0.2362,-1.71967 0.5,-3 0.5179,-0.9008 1.803,-1.54796 2.5312,-1.875 40.2316,-10.49383 69.9063,-46.93466 69.9063,-90.28125 0,-7.17018 0.10293,-15.16693 -1.43697,-21.87499 -0.01,-0.0199 0,-0.0426 0,-0.0625 0.033,-0.24031 0.1174,-0.49778 0.25,-0.71875 0.2143,-0.35714 0.6392,-0.56066 1.0937,-0.6875 z m 640,-2 124,0 c 9.99999,0 9.99999,0 9.99999,10 l 0,596 c -15.99999,0 -29.99999,14 -29.99999,30 l -260,0 c -10,0 -14,-6 -14,-16 -0.0404,-7.99995 -0.0404,-9.99995 5.95957,-11.99995 1.71848,-92.56242 1.906,-445.09385 2,-544.00007 -6,0 -8,-4 -7.95957,-11.99998 0,-10 4,-16 14,-16 l 121,0 c 5,0 7.0868,-1.59644 6.93768,-6.31252 l 0.062,-5.1875 c 0,0 -0.2074,-1.04097 1,-2.625 1.2075,-1.58403 4.8022,-1.93065 8.0625,-3.375 3.2604,-1.44435 6.5,-3.75 10.1875,-7.8125 3.6875,-4.0625 3.0626,-6.87499 4.6251,-8.43749 1.46309,-1.04212 2.12522,-2.25 4.12522,-2.24999 z',
			'title': 'M 858.801,99 c 0,-12.957 -11.542,-22.51 -26.424,-23.836 v -6.494 c 0,-2.465 -3.014,-4.67 -5.935,-4.67 h -335.572 c -2.923,0 -6.494,2.205 -6.494,4.67 v 6.511 c -14.797,1.384 -26.25,10.913 -26.25,23.819 0,12.906 11.453,24.139 26.25,25.785 v 6.986 c 0,2.465 3.571,4.229 6.494,4.229 h 335.572 c 2.921,0 5.935,-1.764 5.935,-4.229 v -6.966 c 14.881,-1.577 26.423,-12.848 26.423,-25.805',
			'namelabel': 'M 80.46875 244 C 76.49275 244 74.125 245.705 74 248.875 L 74 249 L 72.15625 249 C 67.892251 249 62.46875 250.81925 62.46875 257.15625 C 62.46875 263.49625 67.892251 265 72.15625 265 L 74 265 L 74 266.625 C 74 269.597 77.44475 272 80.46875 272 L 191.53125 272 C 194.55525 272 198 269.597 198 266.625 L 198 265 L 199.84375 265 C 204.10675 265 209.53125 263.095 209.53125 257 C 209.53125 250.905 204.10675 249 199.84375 249 L 198 249 L 198 248.875 C 198 245.903 195.13225 244 191.53125 244 L 80.46875 244 z'
		};

		this.shadows.push(this.box.path(this.path.frame).attr({'fill':this.colours.deepshadow,'opacity':0.8,'stroke':0}));

		// Draw background for on/off dial
		this.dialbg = this.box.set();
		this.shadows.push(this.box.path(this.makeSector(this.chrome.dial.ox,this.chrome.dial.oy,270,55,70)).attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.8}));
		this.shadows.push(this.box.path(this.makeSector(this.chrome.dial.ox,this.chrome.dial.oy,90,47,68)).attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.8}));
		this.dialbg.push(
			this.box.path(this.makeSector(this.chrome.dial.ox,this.chrome.dial.oy,270,55,70)).attr({'fill':this.colours.frame,'stroke':0}),
			this.box.path(this.makeSector(this.chrome.dial.ox,this.chrome.dial.oy,270,53,67)).attr({'fill':this.colours.white,'stroke':0}),
			this.box.path(this.makeSector(this.chrome.dial.ox,this.chrome.dial.oy,90,47,68)).attr({'fill':this.colours.frame,'stroke':0}),
			this.box.path(this.makeSector(this.chrome.dial.ox,this.chrome.dial.oy,90,44,65)).attr({'fill':this.colours.white,'stroke':0})
		)

		// LCOGT Branding
		this.arc = this.box.set();
		var fs = 16;
		var lh = 1.2*fs;
		if($.support.borderRadius){
			this.poweredby = this.box.printArcLabel(this,this.phrasebook.power,this.box.getFont("Birch Std"),fs,1.2,lh,this.chrome.portal.ox,this.chrome.portal.oy,this.chrome.portal.r[0],125,true);
		}else{
			this.poweredby = this.box.set();
			this.poweredby.push(this.box.print_center(this.chrome.portal.ox-this.chrome.portal.r[0]*0.5,this.chrome.portal.oy+this.chrome.portal.r[0]+lh/2,this.phrasebook.power,this.box.getFont("Birch Std"),fs).attr({'fill':this.colours.deepshadow,'stroke':0,'cursor':'pointer'}));
			var bb = this.poweredby.getBBox();
			this.shadows.push(this.box.rect((bb.x-(lh-fs)-1),(this.chrome.portal.oy+this.chrome.portal.r[0]),bb.width+(lh-fs)*2+2,lh+2).attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.8}));
			this.arc.push(this.box.rect((bb.x-(lh-fs)-1),(this.chrome.portal.oy+this.chrome.portal.r[0]),bb.width+(lh-fs)*2+2,lh+2).attr({'fill':this.colours.frame,'stroke':0}));
			this.arc.push(this.box.rect((bb.x-(lh-fs)),(this.chrome.portal.oy+this.chrome.portal.r[0]),bb.width+(lh-fs)*2,lh).attr({'fill':this.colours.white,'stroke':0,'cursor':'pointer'}));
			this.poweredby.toFront();
		}
		this.arc[this.arc.length-1].click(function(e){ window.location.href = "https://lco.global/education/messierbingo"; });
		this.poweredby.click(function(e){ window.location.href = "https://lco.global/education/messierbingo"; });
		this.dialtext = this.box.printArcLabel(this,this.phrasebook.information.label,this.box.getFont("Birch Std"),this.chrome.dial.fontsize,this.chrome.dial.fontsize*0.01,this.chrome.dial.dr,this.chrome.dial.ox,this.chrome.dial.oy,this.chrome.dial.r,270,false).attr({'fill':this.colours.deepshadow,'stroke':0});
		this.dialtexton = this.box.printArcLabel(this,this.phrasebook.information.on,this.box.getFont("Birch Std"),this.chrome.dial.fontsize,this.chrome.dial.fontsize*0.1,this.chrome.dial.dr,this.chrome.dial.ox,this.chrome.dial.oy,this.chrome.dial.r,90+this.dialang,false).attr({'fill':this.colours.deepshadow,'stroke':0});
		this.dialtextoff = this.box.printArcLabel(this,this.phrasebook.information.off,this.box.getFont("Birch Std"),this.chrome.dial.fontsize,this.chrome.dial.fontsize*0.1,this.chrome.dial.dr,this.chrome.dial.ox,this.chrome.dial.oy,this.chrome.dial.r,90-this.dialang+4,false).attr({'fill':this.colours.deepshadow,'stroke':0});

		this.frame = this.box.set();
		this.frame.push(this.box.path(this.path.frame).attr({'fill':this.colours.frame,'stroke':0}));
		this.box.transformer(this.frame[0],['t',this.chrome.frame.x,this.chrome.frame.y]);


		// White banners
		this.overlay = this.box.set();
		// Main title
		this.overlay.push(
			this.box.path(this.path.title).attr({'fill':this.colours.shadow,'stroke':0}),
			this.box.path(this.path.title).attr({'fill':this.colours.white,'stroke':0})
		);
		if(!this.phrasebook.title && $('h1').length==1) this.phrasebook.title = $('h1').html();
		this.el.title = this.drawText($('#title'),this.chrome.title.ox,this.chrome.title.oy,this.phrasebook.title.toUpperCase(),64);
		this.box.transformer(this.overlay[0],['t',-1,-1.5])

		// Messier Name label
		this.overlay.push(
			this.box.path(this.path.namelabel).attr({'fill':this.colours.shadow,'stroke':0}),
			this.box.path(this.path.namelabel).attr({'fill':this.colours.white,'stroke':0})
		);
		this.box.transformer(this.overlay[0],['t',-1,-1]);
		this.drawText($('#nametoggle'),136,258,$('#nametoggle').text(),24);
		var _obj = this;
		$('#nametoggle a').on('click',{me:this},function(e){
			e.preventDefault();
			if(!e.data.me.pantograph[1].on && e.data.me.pantograph[0].on) e.data.me.toggleDial();
			e.data.me.pantograph[1].toggle();
		});

		// Messier portrait background
		this.overlay.push(
			this.box.circle(137,137,82).attr({'fill':'90-#534741-#5c5048:29-#766a5c:76-#857968','stroke':0}),
			this.box.circle(137,137,78).attr({'fill':"r#ffffff:0-#ffffff:30-#404040:100",'stroke':0})
		);

		this.messier = this.box.set();

		if($.support.transparency){
			this.messier.push(this.box.image(this.urlprefix+'/images/messier_eyes.png',130,121,28,6));
			this.messier.push(this.box.image(this.urlprefix+'/images/messier_noeyes.png',85,80,90,110));
		}else{
			this.messier.push(this.box.image(this.urlprefix+'/images/messier.png',85,80,90,110));
		}

		this.portal = this.box.set();
		this.nuts = this.box.set();
		this.screws = this.box.set();

		x = this.chrome.portal.ox;
		y = this.chrome.portal.oy;
		r = this.chrome.portal.r[2]+(this.chrome.portal.r[1]-this.chrome.portal.r[2])/2
		if($.support.borderRadius){
			this.portal.push(
				this.box.circle(x,y,this.chrome.portal.r[0]).attr({'fill':this.colours.frame,'stroke':0}),
				this.box.circle(x,y,this.chrome.portal.r[1]).attr({'fill':this.colours.portal,'stroke':0}),
				this.box.circle(x,y,this.chrome.portal.r[2]).attr({'fill':this.colours.deepshadow,'stroke':0}),
				this.box.circle(x,y,this.chrome.portal.r[3]).attr({'fill':this.colours.portalover,'stroke':0}),
				this.box.circle(x,y,this.chrome.portal.r[1]*1.003).attr({'fill':this.colours.shadow,'stroke':0,'opacity':0.76})
			);
			// Portal surround
			var ang = 2*Math.PI/8;
			for(var a = 0; a < 8 ; a++) this.makeScrew(this.chrome.portal.ox+r*Math.cos(ang*(a+0.5)),this.chrome.portal.oy+r*Math.sin(ang*(a+0.5)),8);
		}else{
			this.portal.push(
				this.box.rect(this.chrome.portal.ox-this.chrome.portal.r[0],this.chrome.portal.oy-this.chrome.portal.r[0],this.chrome.portal.r[0]*2,this.chrome.portal.r[0]*2).attr({'fill':this.colours.frame,'stroke':0}),
				this.box.rect(this.chrome.portal.ox-this.chrome.portal.r[1],this.chrome.portal.oy-this.chrome.portal.r[1],this.chrome.portal.r[1]*2,this.chrome.portal.r[1]*2).attr({'fill':'270-#d8cda9:0-#cfc4a2:15-#b7ab8f:41-#8f8470:52-#857968:60-#817565:66-#74685b:71-#5f534a:80-'+this.colours.shadow+':82','stroke':0}),
				this.box.rect(this.chrome.portal.ox-this.chrome.portal.r[2],this.chrome.portal.oy-this.chrome.portal.r[2],this.chrome.portal.r[2]*2,this.chrome.portal.r[2]*2).attr({'fill':this.colours.deepshadow,'stroke':0}),
				this.box.rect(this.chrome.portal.ox-this.chrome.portal.r[3],this.chrome.portal.oy-this.chrome.portal.r[3],this.chrome.portal.r[3]*2,this.chrome.portal.r[3]*2).attr({'fill':'90-#d8cda9:0-#cfc4a2:1-#b7ab8f:5-#8f8470:15-#857968:20-#817565:30-#74685b:51-#5f534a:85-'+this.colours.shadow,'stroke':0}),
				this.box.rect(this.chrome.portal.ox-this.chrome.portal.r[1]*1.003,this.chrome.portal.oy-this.chrome.portal.r[1]*1.003,this.chrome.portal.r[1]*1.003*2,this.chrome.portal.r[1]*1.003*2).attr({'fill':this.colours.shadow,'stroke':0,'opacity':0.76})
			);
			var dx = [r,r,r*0.5,r*0.5,-r,-r,-r*0.5,-r*0.5];
			var dy = [-r*0.5,r*0.5,-r,r,-r*0.5,r*0.5,-r,r];
			// Portal surround
			for(var i = 0; i < dx.length ;i++) this.makeScrew(this.chrome.portal.ox+dx[i],this.chrome.portal.oy+dy[i],8);
		}

		this.makeNut(21.25,23,15);
		this.makeNut(1001,25,15);
		this.makeNut(21.25,742,15);
		this.makeNut(1001,742,15);
		this.makeNut(660,741,12);
		this.makeNut(660,164,12);

		this.makeScrew(34,136,10);
		this.makeScrew(136,32,10);

		// Title bar
		this.makeScrew(481,99,10);
		this.makeScrew(834,99,10);

		// Messier label
		this.makeScrew(70,257,4);
		this.makeScrew(202,257,4);


		this.clock = this.box.set();
		this.clock.push(
			this.box.circle(this.chrome.clock.ox,this.chrome.clock.oy,this.chrome.clock.r).attr({'fill':this.colours.frame,'stroke':0}),
			this.box.circle(this.chrome.clock.ox,this.chrome.clock.oy,this.chrome.clock.r*0.89).attr({'fill':'270-'+this.colours.frameinlay,'stroke':0}),
			this.box.circle(this.chrome.clock.ox,this.chrome.clock.oy,this.chrome.clock.r*0.83).attr({'fill':this.colours.shadow,'stroke':0}),
			this.box.circle(this.chrome.clock.ox,this.chrome.clock.oy,this.chrome.clock.r*0.803).attr({'fill':'90-'+this.colours.brassdark+'-'+this.colours.brassmed+':34-'+this.colours.brass+':100','stroke':0}),
			this.box.circle(this.chrome.clock.ox,this.chrome.clock.oy,this.chrome.clock.r*0.775).attr({'fill':this.colours.white,'stroke':0}),
			this.box.path('M '+this.chrome.clock.ox+' '+(this.chrome.clock.oy-4)+' c -1.787,0 -3.21875,1.464 -3.21875,3.25 0,1.786 1.43175,3.21875 3.21875,3.21875 1.788,0 3.25,-1.43275 3.25,-3.21875 0,-1.786 -1.463,-3.25 -3.25,-3.25 z m 0,0.71875 c 1.5453,-0.006 2.42885,1.51866 2.40625,2.53125 -0.023,1.01259 -0.85705,2.37204 -2.40625,2.34375 -1.5492,-0.0283 -2.368,-1.2134 -2.375,-2.34375 -0.01,-1.13035 0.8297,-2.52487 2.375,-2.53125 z m 0.0625,0.78125 c -1.1367,-0.003 -1.7336,0.80411 -1.75,1.75 -0.016,0.94589 0.7019,1.68411 1.75,1.6875 1.0482,0.003 1.64325,-0.88654 1.65625,-1.6875 0.013,-0.80096 -0.51945,-1.747 -1.65625,-1.75 z m -0.05,29.21754 c -15.147,0 -27.47,-12.321 -27.47,-27.467 0,-15.148 12.322,-27.47 27.47,-27.47 15.148,0 27.468,12.322 27.468,27.47 0,15.146 -12.32,27.467 -27.468,27.467 m 0,-52.609 c -13.863,0 -25.141,11.279 -25.141,25.142 0,13.863 11.277,25.141 25.141,25.141 13.861,0 25.139,-11.278 25.139,-25.141 0,-13.864 -11.278,-25.142 -25.139,-25.142 m 3.44,-4.753 0,-0.523 c 0.81277,-0.20933 0.80537,-0.78105 0.864,-1.48 l 0,-11.925 c 0.0728,-0.88124 -0.13319,-1.54269 -0.866,-1.661 l 0,-0.539 2.267,0 0,0.522 c -0.78122,0.28325 -0.80986,0.83712 -0.865,1.562 l 0,11.913 c -0.0597,0.88279 0.26888,1.18641 0.864,1.608 l 0,0.523 z m -3.239,0 0,-0.523 c 0.8809,-0.16173 0.8089,-0.81162 0.865,-1.48 l 0,-11.925 c -0.0236,-0.86022 -0.1633,-1.50884 -0.866,-1.661 l 0,-0.539 2.263,0 0,0.522 c -0.77886,0.28427 -0.80896,0.83842 -0.864,1.562 l 0,11.913 c -0.056,0.88045 0.2133,1.45294 0.862,1.608 l 0,0.523 z m -3.007,0 0,-0.511 c 0.5572,-0.0806 0.7215,-0.36152 0.744,-0.807 -0.3867,-1.88275 -0.7359,-3.80014 -1.167,-5.645 l -0.319,-0.004 c -0.5104,1.98256 -0.9197,3.50519 -1.274,5.522 -0.01,0.6404 0.2101,0.813 0.671,0.93 l 0,0.515 -1.821,0 0,-0.531 c 0.4984,-0.0362 0.6641,-0.63852 0.871,-1.076 0.348,-1.15426 0.6564,-2.43535 0.927,-3.447 0.2638,-0.98198 0.52,-1.97926 0.719,-2.859 -0.5909,-2.34422 -1.038,-4.49705 -1.661,-6.785 -0.1086,-0.51607 -0.2814,-0.78233 -0.799,-0.895 l 0,-0.535 2.338,0 0,0.519 c -0.5033,0.0599 -0.5592,0.48538 -0.743,0.755 0.2282,1.74624 0.6926,3.58856 1.089,5.249 l 0.322,0.001 c 0.303,-1.178 0.569,-2.257 0.791,-3.207 0.227,-0.973 0.336,-1.592 0.336,-1.893 0.004,-0.61723 -0.31248,-0.63866 -0.663,-0.904 l 0,-0.52 1.814,0 0,0.528 c -0.50084,0.16292 -0.64066,0.60231 -0.846,1.01 -0.5741,2.00916 -1.0776,3.95067 -1.539,5.872 0.6409,2.43889 1.1124,4.96404 1.783,7.216 0.083,0.61499 0.3493,0.88434 0.792,0.985 l 0,0.517 z m -10.008,1.687 c 0.5987,-0.59068 0.3025,-1.07889 10e-4,-1.714 l -5.998,-10.305 c -0.3686,-0.79847 -0.973,-1.19126 -1.582,-1 l -0.273,-0.466 1.956,-1.139 0.265,0.451 c -0.5334,0.63889 -0.2781,1.1328 0.04,1.785 l 5.993,10.295 c 0.3801,0.80477 0.9006,1.1317 1.558,0.953 l 0.264,0.454 -1.956,1.139 z m -5.34,3.101 c 0.3526,-0.39804 0.2314,-0.92772 0.211,-1.368 -0.5487,-2.12297 -1.1425,-4.22533 -1.713,-6.209 l -0.01,-0.038 -0.029,-0.03 c -1.6436,-1.68913 -3.3325,-3.53297 -4.847,-5.029 -0.3695,-0.42978 -0.7043,-0.3192 -1.141,-0.37 l -0.27,-0.463 2.02,-1.177 0.261,0.449 c -0.4061,0.30572 -0.2368,0.70039 -0.259,1.024 1.0704,1.39645 2.4033,2.75341 3.58,3.989 l 0.277,-0.16 c -0.5028,-1.7662 -0.9128,-3.29785 -1.591,-4.974 -0.3455,-0.57982 -0.5625,-0.39028 -1.031,-0.447 l -0.262,-0.449 1.573,-0.914 0.264,0.455 c -0.3484,0.39354 -0.2507,0.84313 -0.223,1.3 0.055,0.229 0.136,0.553 0.253,0.987 0.215,0.8 0.42,1.549 0.614,2.245 0.194,0.699 0.435,1.548 0.72,2.547 1.7485,1.81992 3.5369,3.83652 5.209,5.408 0.3968,0.5321 0.7269,0.40853 1.184,0.453 l 0.261,0.448 -2.046,1.189 -0.259,-0.441 c 0.4419,-0.35049 0.2497,-0.6854 0.237,-1.072 -1.1289,-1.47455 -2.6304,-3.00277 -3.848,-4.292 l -0.28,0.157 c 0.248,0.894 0.562,1.975 0.934,3.217 0.382,1.269 0.626,1.987 0.749,2.195 0.3562,0.60118 0.5437,0.43944 1.045,0.469 l 0.262,0.444 -1.577,0.918 -0.266,-0.461 z m -10.089,12.264 c 0.2579,-0.53866 -0.2381,-0.89466 -0.516,-1.284 -1.553,-1.55306 -3.0789,-3.00641 -4.633,-4.474 l -0.03,-0.027 -0.037,-0.012 c -2.2763,-0.61377 -4.6667,-1.34723 -6.735,-1.861 -0.5045,-0.1498 -0.7687,0.0799 -1.169,0.262 l -0.47,-0.261 1.144,-2.04 0.453,0.253 c -0.1934,0.46648 0.1502,0.72197 0.296,1.014 1.6351,0.65431 3.4716,1.14611 5.113,1.61 l 0.158,-0.279 c -1.333,-1.26396 -2.4651,-2.37245 -3.902,-3.471 -0.5874,-0.29718 -0.7511,-0.1952 -1.112,0.139 l -0.455,-0.255 0.886,-1.585 0.46,0.257 c -0.1,0.51677 0.2156,0.85469 0.471,1.233 1.4672,1.46555 2.9977,2.92943 4.336,4.197 2.3976,0.69256 5.0063,1.46993 7.207,1.976 0.64,0.22185 0.7865,-0.005 1.249,-0.213 l 0.451,0.251 -1.154,2.067 -0.446,-0.251 c 0.2003,-0.52659 -0.1358,-0.71795 -0.342,-1.042 -1.7636,-0.70143 -3.6768,-1.21363 -5.495,-1.736 l -0.16,0.276 c 1.4817,1.4132 2.6148,2.51008 4.201,3.806 0.635,0.31886 0.723,0.3238 1.14,-0.132 l 0.45,0.253 -0.889,1.59 z m -2.333,14.764 c -0.1858,-0.51819 -0.6519,-0.6705 -1.075,-0.869 -0.255,-0.087 -0.558,-0.175 -0.901,-0.262 -0.682,-0.175 -1.54,-0.397 -2.544,-0.665 -0.9677,-0.25468 -1.954,-0.5128 -2.82,-0.727 -2.3828,0.61416 -4.8278,1.12598 -6.824,1.668 -0.495,0.12398 -0.7265,0.42245 -0.893,0.798 l -0.538,0 0,-2.337 0.521,0 c 0.058,0.50058 0.4815,0.55783 0.751,0.742 1.747,-0.22477 3.5888,-0.69358 5.251,-1.089 l 0,-0.32 c -1.7787,-0.45277 -3.3135,-0.86758 -5.102,-1.129 -0.6189,-0.003 -0.639,0.31589 -0.903,0.667 l -0.521,0 0,-1.818 0.528,0 c 0.1638,0.50105 0.6026,0.64232 1.011,0.848 1.9892,0.56537 4.0323,1.08714 5.832,1.548 l 0.037,-0.01 c 2.4699,-0.65367 4.8634,-1.07223 7.216,-1.782 0.329,-0.114 0.55,-0.203 0.677,-0.278 0.148,-0.089 0.242,-0.211 0.279,-0.364 0.015,-0.054 0.023,-0.105 0.034,-0.153 l 0.517,0 0,2.365 -0.514,0 c -0.03,-0.185 -0.097,-0.345 -0.193,-0.472 -0.136,-0.179 -0.344,-0.268 -0.614,-0.268 -1.8815,0.24594 -3.8002,0.73293 -5.644,1.163 l 0,0.321 c 0.893,0.236 1.986,0.51 3.248,0.813 1.289,0.309 2.034,0.459 2.272,0.459 0.6396,0.007 0.6812,-0.29136 0.931,-0.67 l 0.517,0 0,1.821 -0.535,0 z m 0.01,2.972 c -0.2085,-0.8112 -0.7789,-0.80437 -1.478,-0.864 l -11.924,0 c -0.8786,-0.077 -1.2028,0.28668 -1.663,0.864 l -0.54,0 0,-2.263 0.521,0 c 0.2878,0.77983 0.8438,0.80821 1.565,0.864 l 11.913,0 c 0.8833,0.0585 1.186,-0.268 1.606,-0.864 l 0.525,0 0,2.263 z m -12.103,13.479 0.448,-0.267 c 0.115,0.121 0.24,0.22 0.366,0.287 0.085,0.044 0.173,0.067 0.265,0.067 0.128,0 0.257,-0.041 0.392,-0.122 0.08,-0.047 0.169,-0.107 0.265,-0.175 0.099,-0.071 0.172,-0.127 0.229,-0.17 0.603,-0.474 1.583,-1.245 2.942,-2.311 1.36,-1.069 3.296,-2.589 5.807,-4.561 l -0.166,-0.281 c -1.367,0.567 -2.96,1.232 -4.725,1.977 -1.809,0.763 -3.063,1.296 -3.73,1.585 -0.653,0.283 -1.105,0.492 -1.35,0.618 -0.9131,0.36839 -1.0946,0.80221 -1.139,1.643 l -0.457,0.272 -0.925,-1.558 0.462,-0.275 c 0.7753,0.36006 1.4976,-0.0132 2.219,-0.286 1.164,-0.475 2.964,-1.227 5.362,-2.23 2.381,-0.998 4.882,-2.052 7.438,-3.133 l 0.025,0.041 c -2.336,1.829 -4.584,3.596 -6.754,5.297 -2.199,1.728 -3.69,2.896 -4.462,3.505 -0.193,0.155 -0.362,0.307 -0.495,0.453 -0.137,0.147 -0.257,0.308 -0.355,0.476 -0.087,0.151 -0.139,0.294 -0.152,0.428 -0.01,0.076 -0.01,0.147 0,0.209 l -0.465,0.277 z m 1.303,2.197 0.448,-0.267 c 0.666,0.53013 1.0922,0.28808 1.785,-0.053 l 10.247,-6.078 c 0.7855,-0.40192 0.8807,-0.83784 0.939,-1.564 l 0.452,-0.268 1.154,1.948 -0.452,0.267 c -0.622,-0.58742 -1.0243,-0.32137 -1.712,0.011 l -10.257,6.084 c -0.7935,0.38789 -0.8856,0.85888 -0.984,1.592 l -0.463,0.275 -1.154,-1.947 z m 1.653,2.786 0.449,-0.267 c 0.6646,0.53113 1.089,0.28983 1.782,-0.054 l 10.246,-6.077 c 0.7866,-0.40087 0.8837,-0.83617 0.943,-1.563 l 0.451,-0.268 1.153,1.947 -0.451,0.267 c -0.6242,-0.58701 -1.0267,-0.32116 -1.713,0.011 l -10.255,6.083 c -0.795,0.38346 -0.887,0.86164 -0.986,1.593 l -0.466,0.276 z m 1.651,2.786 0.45,-0.267 c 0.6665,0.5306 1.089,0.29186 1.785,-0.054 l 10.245,-6.077 c 0.7897,-0.4016 0.8819,-0.83685 0.94,-1.564 l 0.453,-0.268 1.155,1.948 -0.452,0.268 c -0.6228,-0.588 -1.026,-0.32103 -1.713,0.01 l -10.254,6.085 c -0.7951,0.3865 -0.8883,0.85946 -0.987,1.592 l -0.466,0.275 z m 64.424,-40.511 0.461,-0.248 c 0.6043,0.6094 1.0091,0.36441 1.712,0.06 l 10.501,-5.647 c 0.8127,-0.34913 0.9239,-0.82411 1.052,-1.55 l 0.476,-0.256 1.071,1.995 -0.456,0.248 c -0.6502,-0.55379 -1.0747,-0.33836 -1.788,-0.021 l -10.491,5.644 c -0.8063,0.36507 -0.9172,0.79735 -1.004,1.52 l -0.465,0.248 -1.072,-1.993 z m -1.538,-2.852 0.466,-0.249 c 0.6022,0.61094 1.0095,0.36291 1.71,0.061 l 10.503,-5.648 c 0.8096,-0.35381 0.921,-0.82262 1.05,-1.55 l 0.474,-0.255 1.07,1.995 -0.458,0.247 c -0.6473,-0.55575 -1.0718,-0.33682 -1.784,-0.021 l -10.49,5.642 c -0.8073,0.36744 -0.92,0.79895 -1.006,1.524 l -0.464,0.247 -1.075,-1.993 z m -11.222,-9.702 0.253,-0.456 c 0.8498,0.29582 1.15581,-0.15141 1.608,-0.804 l 5.789,-10.426 c 0.49525,-0.77878 0.5062,-1.49394 -0.075,-1.952 l 0.258,-0.465 2.38,1.321 -0.254,0.452 c -0.84849,-0.20899 -1.20072,0.21676 -1.647,0.878 l -5.783,10.414 c -0.47158,0.7936 -0.3314,1.25212 0.109,1.904 l -0.255,0.453 -2.379,-1.319 z m -38.094,65.989 0.271,-0.445 c 0.16,0.053 0.314,0.08 0.459,0.08 0.155,0 0.375,-0.063 0.554,-0.358 0.049,-0.077 0.099,-0.172 0.152,-0.28 0.053,-0.105 0.092,-0.192 0.118,-0.257 0.311,-0.701 0.816,-1.842 1.513,-3.423 0.698,-1.582 1.69,-3.833 2.981,-6.753 l -0.279,-0.171 c -0.934,1.136 -2.025,2.47 -3.24,3.967 -1.235,1.517 -2.09,2.577 -2.549,3.155 -0.444,0.552 -0.743,0.95 -0.899,1.177 -0.159,0.231 -0.278,0.414 -0.367,0.561 -0.3431,0.60093 -0.1039,0.91249 0.137,1.424 l -0.28,0.457 -1.547,-0.943 0.278,-0.458 c 0.5182,0.0268 0.8637,-0.31948 1.209,-0.601 0.184,-0.194 0.392,-0.427 0.616,-0.695 0.806,-0.972 2.044,-2.482 3.683,-4.492 1.634,-2.001 3.331,-4.089 5.096,-6.261 l 0.038,0.025 c -1.2,2.712 -2.357,5.328 -3.467,7.849 -1.134,2.561 -1.896,4.292 -2.29,5.192 -0.104,0.229 -0.178,0.441 -0.228,0.633 -0.051,0.194 -0.08,0.392 -0.09,0.588 -0.01,0.173 0.017,0.324 0.067,0.448 0.03,0.071 0.062,0.134 0.1,0.186 l -0.281,0.462 z m 2.183,1.326 0.271,-0.447 c 0.79,0.16755 1.1266,-0.28991 1.552,-0.885 l 6.185,-10.183 c 0.5075,-0.72385 0.3839,-1.1537 0.095,-1.822 l 0.271,-0.448 1.936,1.175 -0.272,0.449 c -0.7881,-0.2495 -1.0796,0.22926 -1.507,0.814 l -6.189,10.193 c -0.5181,0.71242 -0.3807,1.17227 -0.125,1.868 l -0.276,0.462 z m 2.77,1.682 0.27,-0.446 c 0.793,0.16651 1.1254,-0.29484 1.552,-0.887 l 6.183,-10.182 c 0.5067,-0.72349 0.3856,-1.15302 0.096,-1.821 l 0.275,-0.45 1.932,1.176 -0.271,0.449 c -0.788,-0.25016 -1.0809,0.22981 -1.507,0.815 l -6.19,10.192 c -0.5203,0.71556 -0.3795,1.17538 -0.121,1.869 l -0.281,0.461 z m 18.716,4.09 0,-0.522 c 0.7674,-0.27404 0.7094,-0.6718 0.677,-1.363 -0.101,-0.76 -0.262,-1.997 -0.487,-3.71 l -0.957,-7.319 -0.327,-0.003 c -0.209,1.447 -0.446,3.153 -0.71,5.074 -0.268,1.943 -0.449,3.294 -0.541,4.019 -0.089,0.704 -0.143,1.199 -0.158,1.473 -0.1499,0.97642 0.1339,1.35113 0.837,1.816 l 0,0.535 -1.814,0 0,-0.538 c 0.7028,-0.48105 0.7554,-1.31343 0.887,-2.056 0.183,-1.233 0.456,-3.168 0.816,-5.751 0.355,-2.555 0.725,-5.244 1.102,-7.994 l 0.047,0 c 0.383,2.943 0.753,5.776 1.11,8.51 0.362,2.776 0.608,4.651 0.738,5.625 0.028,0.76023 0.394,1.18197 0.836,1.663 l 0,0.541 z m 2.554,0 0,-0.522 c 0.7809,-0.28516 0.8129,-0.83863 0.867,-1.563 l 0,-11.914 c 0.057,-0.88348 -0.2706,-1.18674 -0.866,-1.606 l 0,-0.526 2.266,0 0,0.526 c -0.814,0.20778 -0.8054,0.77902 -0.865,1.479 l 0,11.924 c -0.072,0.8788 0.287,1.20278 0.865,1.663 l 0,0.539 z m 39.374,-25.891 c 0.2209,-0.80755 -0.2787,-1.08453 -0.857,-1.482 l -10.358,-5.907 c -0.7588,-0.49567 -1.154,-0.38138 -1.874,-0.073 l -0.467,-0.267 1.122,-1.967 0.452,0.259 c -0.1377,0.81928 0.3281,1.11971 0.931,1.526 l 10.349,5.901 c 0.7733,0.47757 1.139,0.39707 1.825,0.044 l 0.455,0.26 -1.121,1.968 z m -1.606,2.815 c 0.2242,-0.80811 -0.2762,-1.08452 -0.856,-1.483 l -10.359,-5.907 c -0.7583,-0.49674 -1.1538,-0.38082 -1.872,-0.073 l -0.469,-0.266 1.122,-1.967 0.454,0.258 c -0.1418,0.81864 0.3279,1.11995 0.93,1.526 l 10.349,5.9 c 0.7724,0.4799 1.1354,0.39882 1.822,0.045 l 0.458,0.26 -1.122,1.967 z m -1.604,2.814 c 0.2225,-0.80639 -0.2788,-1.08391 -0.855,-1.483 l -10.36,-5.907 c -0.7569,-0.49644 -1.1556,-0.37942 -1.874,-0.073 l -0.466,-0.266 1.12,-1.967 0.454,0.259 c -0.1404,0.81937 0.3302,1.11912 0.931,1.525 l 10.349,5.902 c 0.7734,0.47932 1.1374,0.39597 1.822,0.043 l 0.459,0.261 -1.123,1.967 z m -1.605,2.816 c 0.2214,-0.8101 -0.2805,-1.08568 -0.857,-1.485 l -10.358,-5.907 c -0.7594,-0.49461 -1.1536,-0.38114 -1.872,-0.072 l -0.469,-0.266 1.121,-1.967 0.454,0.259 c -0.1402,0.81817 0.3283,1.11756 0.93,1.524 l 10.349,5.901 c 0.7757,0.48295 1.1349,0.39444 1.822,0.045 l 0.457,0.26 -1.122,1.968 z m 9.34,-25.008 c -0.2826,-0.78016 -0.8384,-0.8108 -1.563,-0.867 l -11.911,0 c -0.8844,-0.0553 -1.1864,0.27129 -1.607,0.867 l -0.525,0 0,-2.266 0.525,0 c 0.2084,0.81315 0.7777,0.80627 1.478,0.867 l 11.925,0 c 0.8792,0.0763 1.2058,-0.2901 1.662,-0.867 l 0.541,0 0,2.266 z m 0,-3.24 c -0.2822,-0.7797 -0.8369,-0.80992 -1.563,-0.865 l -11.911,0 c -0.8846,-0.0572 -1.1861,0.26903 -1.607,0.865 l -0.525,0 0,-2.265 0.525,0 c 0.2091,0.81266 0.7789,0.80537 1.478,0.866 l 11.925,0 c 0.879,0.0765 1.2045,-0.28726 1.662,-0.866 l 0.541,0 0,2.265 z m 0,-3.24 c -0.2825,-0.77977 -0.8372,-0.80894 -1.563,-0.864 l -11.911,0 c -0.8844,-0.0575 -1.1861,0.2697 -1.607,0.865 l -0.525,0 0,-2.264 0.525,0 c 0.2089,0.81264 0.7783,0.80432 1.478,0.865 l 11.925,0 c 0.8783,0.077 1.2036,-0.28642 1.662,-0.865 l 0.541,0 0,2.264 -0.525,0 z m -27.307,44.523 c 0.4946,-0.75509 0.1803,-1.54703 -0.04,-2.309 -0.388,-1.183 -0.993,-2.993 -1.85,-5.528 -0.814,-2.418 -1.691,-4.997 -2.607,-7.673 l 0.102,-0.053 c 1.777,2.387 3.493,4.691 5.146,6.909 1.677,2.252 2.812,3.771 3.405,4.562 0.4303,0.66957 0.9732,0.87315 1.649,1.011 l 0.25,0.471 -2.186,1.16 -0.242,-0.457 c 0.6474,-0.60539 0.4456,-0.94891 0.061,-1.584 -0.462,-0.616 -1.208,-1.617 -2.246,-3.009 l -4.428,-5.936 -0.287,0.15 c 0.461,1.391 1.014,3.03 1.64,4.874 0.634,1.86 1.08,3.154 1.322,3.849 0.243,0.681 0.415,1.134 0.531,1.388 0.3317,1.00113 0.8459,1.16917 1.72,1.152 l 0.246,0.465 -1.933,1.028 z m 20.311,-80.386 c -10.318,-10.318 -24.038,-16.002 -38.633,-16.002 -14.592,0 -28.314,5.684 -38.634,16.002 -10.318,10.32 -16.001,24.039 -16.001,38.634 0,14.593 5.683,28.313 16.001,38.633 10.319,10.319 24.042,16.003 38.634,16.003 14.595,0 28.314,-5.684 38.633,-16.003 10.322,-10.32 16.005,-24.04 16.005,-38.633 0,-14.595 -5.683,-28.315 -16.005,-38.634 m -68.079,78.987 -2.516,3.449 c -1.42,-1.039 -2.788,-2.145 -4.097,-3.314 l 2.838,-3.188 c 1.216,1.085 2.476,2.102 3.775,3.053 m 0.306,0.223 c 1.204,0.869 2.443,1.684 3.712,2.437 l -2.111,3.705 c -1.409,-0.833 -2.776,-1.725 -4.097,-2.679 z m 4.721,3.02 c 1.302,0.732 2.639,1.405 3.999,2.014 l -1.748,3.898 c -1.492,-0.672 -2.946,-1.411 -4.363,-2.207 z m 4.339,2.166 c 1.482,0.652 2.998,1.229 4.535,1.731 l -1.325,4.064 c -1.68,-0.549 -3.32,-1.179 -4.924,-1.885 z m 4.897,1.846 c 1.539,0.488 3.102,0.903 4.689,1.239 l -0.892,4.195 c -1.732,-0.371 -3.434,-0.826 -5.101,-1.36 z m 5.054,1.317 c 1.582,0.323 3.181,0.572 4.797,0.742 l -0.454,4.271 c -1.763,-0.187 -3.5,-0.459 -5.209,-0.812 z m 5.168,0.781 c 1.446,0.142 2.908,0.219 4.379,0.234 l 0,4.3 c -1.616,-0.018 -3.218,-0.103 -4.799,-0.261 z m 5.545,0.235 c 1.52,-0.016 3.029,-0.098 4.525,-0.25 l 0.439,4.276 c -1.635,0.166 -3.291,0.256 -4.965,0.274 l 0,-4.3 z m 4.901,-0.292 c 1.617,-0.175 3.215,-0.427 4.793,-0.754 l 0.88,4.197 c -1.708,0.358 -3.447,0.635 -5.209,0.828 z m 5.158,-0.832 c 1.585,-0.344 3.15,-0.762 4.688,-1.256 l 1.313,4.072 c -1.663,0.538 -3.361,0.996 -5.091,1.372 z m 5.045,-1.369 c 1.54,-0.507 3.049,-1.09 4.528,-1.744 l 1.729,3.901 c -1.601,0.711 -3.239,1.346 -4.919,1.903 z m 4.866,-1.896 c 1.369,-0.621 2.712,-1.298 4.021,-2.041 l 2.045,3.741 c -1.396,0.791 -2.832,1.524 -4.305,2.191 z m 5.029,-2.627 c 1.256,-0.752 2.482,-1.566 3.675,-2.431 l 2.508,3.452 c -1.336,0.967 -2.715,1.876 -4.139,2.722 z m 3.981,-2.653 c 1.297,-0.955 2.551,-1.98 3.762,-3.067 l 2.853,3.18 c -1.307,1.173 -2.673,2.283 -4.087,3.325 z m -29.564,9.288 c -27.328,0 -49.562,-22.232 -49.562,-49.561 0,-27.329 22.234,-49.562 49.562,-49.562 27.33,0 49.563,22.233 49.563,49.562 10e-4,27.329 -22.233,49.561 -49.563,49.561 m -40.373,-78.986 -3.448,-2.513 c 1.038,-1.421 2.143,-2.789 3.313,-4.1 l 3.19,2.841 c -1.083,1.213 -2.104,2.473 -3.055,3.772 m -0.22,0.306 c -0.857,1.189 -1.66,2.412 -2.405,3.666 l -3.705,-2.113 c 0.824,-1.389 1.705,-2.739 2.645,-4.045 z m -6.692,2.56 3.702,2.112 c -0.742,1.321 -1.423,2.673 -2.04,4.052 l -3.896,-1.747 c 0.678,-1.511 1.424,-2.984 2.234,-4.417 m 1.511,6.507 c -0.65,1.482 -1.228,2.995 -1.728,4.535 l -4.065,-1.327 c 0.55,-1.677 1.18,-3.321 1.886,-4.925 z m -1.84,4.892 c -0.489,1.54 -0.902,3.105 -1.239,4.694 l -4.193,-0.897 c 0.37,-1.729 0.823,-3.427 1.355,-5.092 z m -1.317,5.059 c -0.323,1.578 -0.567,3.18 -0.739,4.795 l -4.272,-0.449 c 0.188,-1.764 0.457,-3.501 0.809,-5.21 z m -0.777,5.167 c -0.139,1.411 -0.214,2.834 -0.234,4.267 l -4.298,0 c 0.02,-1.578 0.105,-3.142 0.256,-4.685 z m -0.235,5.431 c 0.015,1.559 0.1,3.108 0.257,4.643 l -4.276,0.434 c -0.169,-1.671 -0.263,-3.365 -0.279,-5.077 z m 0.295,5.013 c 0.175,1.618 0.432,3.217 0.761,4.796 l -4.198,0.877 c -0.358,-1.708 -0.637,-3.443 -0.828,-5.203 z m 0.84,5.161 c 0.342,1.585 0.761,3.149 1.255,4.685 l -4.069,1.313 c -0.539,-1.663 -0.998,-3.361 -1.375,-5.089 z m 1.369,5.042 c 0.508,1.538 1.091,3.05 1.748,4.529 l -3.903,1.729 c -0.711,-1.599 -1.348,-3.239 -1.903,-4.915 z m 1.9,4.866 c 0.599,1.324 1.257,2.625 1.975,3.894 l -3.743,2.045 c -0.765,-1.358 -1.478,-2.751 -2.122,-4.178 z m 2.559,4.904 c 0.772,1.299 1.611,2.568 2.507,3.8 l -3.458,2.503 c -0.994,-1.373 -1.93,-2.793 -2.793,-4.257 z m 2.723,4.1 c 0.958,1.298 1.979,2.553 3.069,3.763 l -3.178,2.852 c -1.174,-1.305 -2.283,-2.668 -3.328,-4.084 z m 69.658,-69.971 2.513,-3.449 c 1.422,1.037 2.79,2.141 4.103,3.308 l -2.839,3.192 c -1.215,-1.083 -2.475,-2.102 -3.777,-3.051 m -0.301,-0.221 c -1.178,-0.846 -2.387,-1.641 -3.622,-2.378 l 2.108,-3.705 c 1.375,0.816 2.71,1.687 4.002,2.615 z m -4.631,-2.962 c -1.335,-0.752 -2.703,-1.44 -4.097,-2.065 l 1.742,-3.896 c 1.528,0.684 3.018,1.439 4.467,2.256 z m -4.441,-2.213 c -1.48,-0.649 -2.996,-1.226 -4.535,-1.726 l 1.324,-4.066 c 1.676,0.548 3.32,1.176 4.923,1.881 z m -4.896,-1.84 c -1.537,-0.489 -3.102,-0.9 -4.69,-1.236 l 0.892,-4.194 c 1.73,0.368 3.431,0.821 5.096,1.351 z m -5.056,-1.312 c -1.581,-0.322 -3.181,-0.568 -4.796,-0.736 l 0.448,-4.273 c 1.762,0.186 3.499,0.455 5.208,0.805 z m -5.167,-0.777 c -1.431,-0.138 -2.874,-0.214 -4.325,-0.23 l 0,-4.298 c 1.596,0.017 3.177,0.101 4.737,0.253 z m -5.491,-0.23 c -1.541,0.017 -3.068,0.103 -4.582,0.257 l -0.441,-4.274 c 1.654,-0.171 3.331,-0.263 5.023,-0.281 z m -4.955,0.299 c -1.617,0.177 -3.216,0.432 -4.795,0.761 l -0.878,-4.197 c 1.706,-0.36 3.44,-0.638 5.204,-0.833 z m -5.156,0.839 c -1.588,0.344 -3.151,0.765 -4.687,1.26 l -1.317,-4.07 c 1.664,-0.539 3.359,-0.999 5.088,-1.378 z m -5.046,1.374 c -1.536,0.508 -3.046,1.092 -4.525,1.749 l -1.735,-3.899 c 1.602,-0.713 3.242,-1.352 4.918,-1.907 z m -4.862,1.903 c -1.33,0.601 -2.632,1.259 -3.901,1.977 l -2.046,-3.742 c 1.359,-0.766 2.753,-1.478 4.182,-2.126 z m -4.909,2.563 c -1.299,0.773 -2.564,1.61 -3.796,2.506 l -2.504,-3.455 c 1.372,-0.995 2.789,-1.93 4.251,-2.796 z m -4.097,2.726 c -1.292,0.956 -2.549,1.98 -3.758,3.07 l -2.857,-3.176 c 1.306,-1.173 2.669,-2.285 4.085,-3.33 z m 79.549,39.462 c -0.023,-1.483 -0.108,-2.956 -0.259,-4.416 l 4.273,-0.444 c 0.166,1.602 0.261,3.223 0.281,4.86 z m -0.302,-4.788 c -0.177,-1.617 -0.433,-3.216 -0.763,-4.793 l 4.197,-0.883 c 0.36,1.705 0.639,3.442 0.837,5.204 z m -0.84,-5.158 c -0.345,-1.585 -0.768,-3.147 -1.264,-4.684 l 4.068,-1.318 c 0.543,1.662 1.004,3.36 1.383,5.088 z m -1.377,-5.041 c -0.508,-1.537 -1.094,-3.047 -1.75,-4.524 l 3.897,-1.739 c 0.714,1.6 1.353,3.24 1.912,4.915 z m -1.905,-4.866 c -0.593,-1.307 -1.244,-2.589 -1.949,-3.844 l 3.742,-2.045 c 0.753,1.341 1.453,2.716 2.096,4.124 z m -2.534,-4.851 c -0.782,-1.315 -1.629,-2.597 -2.539,-3.845 l 3.451,-2.51 c 1.01,1.388 1.956,2.826 2.831,4.308 z m -2.758,-4.149 c -0.959,-1.294 -1.983,-2.548 -3.074,-3.758 l 3.176,-2.856 c 1.177,1.304 2.286,2.669 3.333,4.082 z m 0.115,59.099 3.443,2.519 c -1.037,1.418 -2.145,2.785 -3.313,4.096 l -3.188,-2.844 c 1.084,-1.214 2.105,-2.475 3.058,-3.771 m 0.221,-0.304 c 0.871,-1.205 1.685,-2.445 2.44,-3.713 l 3.705,2.11 c -0.834,1.407 -1.729,2.776 -2.683,4.097 z m 3.021,-4.72 c 0.735,-1.305 1.407,-2.639 2.02,-4.001 l 3.893,1.753 c -0.669,1.49 -1.409,2.943 -2.208,4.359 z m 2.169,-4.341 c 0.652,-1.482 1.23,-2.994 1.733,-4.534 l 4.065,1.33 c -0.553,1.677 -1.184,3.319 -1.892,4.921 z m 1.848,-4.891 c 0.49,-1.539 0.902,-3.105 1.242,-4.692 l 4.194,0.898 c -0.375,1.73 -0.827,3.43 -1.36,5.093 z m 1.32,-5.057 c 0.323,-1.578 0.573,-3.18 0.743,-4.795 l 4.273,0.453 c -0.189,1.763 -0.459,3.502 -0.814,5.209 z m 0.785,-5.168 c 0.151,-1.519 0.228,-3.055 0.24,-4.6 l 4.299,0 c -0.013,1.695 -0.102,3.373 -0.266,5.025 z m -9.647,-41.533 -3.156,2.881 c -0.515,-0.562 -1.039,-1.115 -1.583,-1.657 -0.607,-0.606 -1.228,-1.195 -1.859,-1.767 l 2.86,-3.174 c 1.304,1.178 2.55,2.42 3.738,3.717 m -76.582,-3.531 2.881,3.158 c -0.569,0.519 -1.128,1.052 -1.675,1.598 -0.602,0.602 -1.186,1.216 -1.752,1.842 l -3.17,-2.862 c 1.18,-1.304 2.419,-2.552 3.716,-3.736 m -3.573,76.577 3.16,-2.877 c 0.525,0.574 1.063,1.14 1.618,1.696 0.594,0.594 1.2,1.172 1.82,1.732 l -2.864,3.168 c -1.303,-1.178 -2.551,-2.418 -3.734,-3.719 m 76.579,3.615 -2.876,-3.159 c 0.582,-0.531 1.153,-1.076 1.713,-1.636 0.59,-0.59 1.161,-1.189 1.718,-1.801 l 3.165,2.867 c -1.18,1.3 -2.421,2.544 -3.72,3.729 z').attr({'fill':'rgb(83,71,65)','stroke':0})
		);

		this.hands = this.box.set();
		this.hands.push(this.box.path('m '+(this.chrome.clock.ox)+','+(this.chrome.clock.oy-this.chrome.clock.r*0.45)+' c -0.47751,1.8318 -0.93459,3.35179 -0.93103,6.07418 0.0272,2.19329 0.51826,5.10581 0.51826,5.10581 0,0 -0.066,-0.0785 -0.58054,-0.26794 -0.51447,-0.18954 -1.22189,0.0946 -1.38435,0.44657 -0.16247,0.352 0.10117,0.70358 0.66985,0.89313 0.56863,0.18954 1.11641,-0.17863 1.11641,-0.17863 0,0 -0.63994,1.08941 -0.93779,1.11642 -0.29786,0.027 -0.58435,-0.37866 -1.07175,-0.89314 -0.4874,-0.51448 -0.6427,-1.0675 -0.66985,-1.47366 -0.027,-0.40616 0.0893,-0.49123 0.0893,-0.49123 l -1.20573,0.40191 c 0,0 -0.43842,0.0946 -0.35725,0.44657 0.0813,0.35202 0.95777,1.13924 1.60764,1.51832 0.64987,0.37909 1.51832,0.80382 1.51832,0.80382 0,0 0.11404,0.065 -0.53588,-0.17862 -0.64986,-0.24369 -3.12979,-0.093 -3.61718,1.96489 -0.48741,2.0579 1.09032,2.98916 1.87557,3.25993 0.78526,0.27084 1.6523,0 1.6523,0 0,0 -0.71025,0.44372 -1.11642,0.7145 -0.40616,0.27077 -1.28553,1.02428 -1.33969,1.29504 -0.0542,0.27084 0.17862,0.35726 0.17862,0.35726 l 1.38436,0.49122 c 0,0 -0.1339,-0.30026 -0.1339,-0.62519 0,-0.32493 0.27461,-0.77391 0.49122,-1.07176 0.21662,-0.29786 1.06084,-1.18808 1.25039,-1.16107 0.18954,0.027 0.39099,0.17578 0.58053,0.44656 0.18955,0.27079 0.35725,0.71451 0.35725,0.71451 0,0 -0.36249,-0.18677 -0.7145,-0.26794 -0.35201,-0.0812 -1.06226,0.12832 -1.11642,0.66985 -0.0542,0.54155 0.49647,0.67799 0.84848,0.75916 0.35201,0.0812 1.11641,-0.26794 1.11641,-0.26794 0,0 -0.35589,1.58679 -0.49122,2.72405 -0.13533,1.13727 -0.10557,3.26731 -0.0514,4.72951 0.15374,1.25786 0.31832,3.18276 0.85523,6.0277 0.44364,-2.8217 0.50914,-4.27428 0.70364,-6.1035 0.0542,-1.4622 0.23549,-3.51644 0.10019,-4.65371 -0.13533,-1.13726 -0.49122,-2.72405 -0.49122,-2.72405 0,0 0.7644,0.34911 1.11641,0.26794 0.35201,-0.0812 0.90264,-0.21761 0.84848,-0.75916 -0.0542,-0.54153 -0.76441,-0.75102 -1.11642,-0.66985 -0.35201,0.0812 -0.7145,0.26794 -0.7145,0.26794 0,0 0.1677,-0.44372 0.35725,-0.71451 0.18954,-0.27078 0.39099,-0.41955 0.58053,-0.44656 0.18955,-0.027 1.03377,0.86321 1.25039,1.16107 0.21661,0.29785 0.49122,0.74683 0.49122,1.07176 0,0.32493 -0.1339,0.62519 -0.1339,0.62519 l 1.38436,-0.49122 c 0,0 0.23278,-0.0865 0.17862,-0.35726 -0.0542,-0.27076 -0.93353,-1.02427 -1.33969,-1.29504 -0.40617,-0.27078 -1.11642,-0.7145 -1.11642,-0.7145 0,0 0.86704,0.27084 1.6523,0 0.78525,-0.27077 2.36298,-1.20203 1.87557,-3.25993 -0.48739,-2.05792 -2.96732,-2.20858 -3.61718,-1.96489 -0.64992,0.24364 -0.53588,0.17862 -0.53588,0.17862 0,0 0.86845,-0.42473 1.51832,-0.80382 0.64987,-0.37908 1.52633,-1.1663 1.60764,-1.51832 0.0812,-0.35197 -0.35725,-0.44657 -0.35725,-0.44657 l -1.20573,-0.40191 c 0,0 0.11632,0.085 0.0893,0.49123 -0.0271,0.40616 -0.18245,0.95918 -0.66985,1.47366 -0.4874,0.51448 -0.77389,0.92014 -1.07175,0.89314 -0.29785,-0.027 -0.93779,-1.11642 -0.93779,-1.11642 0,0 0.54778,0.36817 1.11641,0.17863 0.56868,-0.18955 0.83232,-0.54113 0.66985,-0.89313 -0.16246,-0.35197 -0.86988,-0.63611 -1.38435,-0.44657 -0.51452,0.18949 -0.54264,0.30584 -0.54264,0.30584 0,0 0.71849,-3.06411 0.74564,-5.2574 -0.12991,-2.63861 -0.31502,-4.01329 -0.90679,-5.96049 z m -0.14489,11.89449 0.0893,0.0446 c 0,0 0.12304,0.50454 0.3126,0.93779 0.18954,0.43323 0.31124,0.74966 0.44656,0.80382 0.13533,0.0542 0.35726,0 0.35726,0 0,0 -0.34634,0.33683 -0.53588,0.58053 -0.18955,0.24369 -0.54524,0.76877 -0.58054,1.38436 -0.0353,0.61559 -0.14033,1.36659 0.35725,2.0542 0.22221,0.22178 0.43692,0.33353 0.49123,0.35725 -0.0304,-0.003 -0.0662,-0.023 -0.1339,0.0446 -0.13533,0.13533 -0.57104,0.9891 -0.6252,1.20573 -0.0542,0.21661 -0.17862,0.58053 -0.17862,0.58053 0,0 -0.12447,-0.36392 -0.17863,-0.58053 -0.0542,-0.21663 -0.48986,-1.0704 -0.62519,-1.20573 -0.0677,-0.0676 -0.1036,-0.048 -0.1339,-0.0446 0.0543,-0.0237 0.26901,-0.13547 0.49122,-0.35725 0.49766,-0.68761 0.39252,-1.43861 0.35726,-2.0542 -0.0353,-0.61559 -0.39099,-1.14067 -0.58054,-1.38436 -0.18954,-0.2437 -0.53588,-0.58053 -0.53588,-0.58053 0,0 0.22193,0.0542 0.35725,0 0.13533,-0.0542 0.25703,-0.37059 0.44657,-0.80382 0.1896,-0.43325 0.3126,-0.93779 0.3126,-0.93779 l 0.0893,-0.0446 z m -2.90268,1.78627 c 0.275,-0.0146 0.50312,0.0687 1.07176,0.53588 0.75816,0.62279 0.46167,1.8699 -0.1339,2.41145 -0.59571,0.54157 -1.61954,0.2817 -2.18817,-0.17862 -0.56865,-0.46032 -0.50357,-1.45849 -0.17863,-2.05421 0.32493,-0.59578 1.11641,-0.66984 1.11641,-0.66984 0.11432,-0.01 0.22093,-0.04 0.3126,-0.0446 z m 5.80536,0 c 0.0917,0.004 0.19827,0.0346 0.31259,0.0446 0,0 0.79149,0.074 1.11642,0.66985 0.32494,0.59571 0.39002,1.59389 -0.17863,2.05421 -0.56863,0.46032 -1.59246,0.72019 -2.18817,0.17862 -0.59564,-0.54155 -0.89213,-1.78866 -0.1339,-2.41145 0.56863,-0.46715 0.79676,-0.55046 1.07176,-0.53588 z').attr({'fill':this.colours.shadow,'stroke':0}))
		this.hands.push(this.box.path('m '+(this.chrome.clock.ox)+','+(this.chrome.clock.oy-this.chrome.clock.r*0.7)+' c -0.13259,0 -0.1875,0.125 -0.1875,0.125 l 0,2.21875 c 0,0 -0.4565,2.21516 -0.4375,3.75 0.019,1.53483 0.46875,3.28125 0.46875,3.28125 0,0 -0.0462,-0.0549 -0.40625,-0.1875 -0.36002,-0.13264 -0.85506,0.0662 -0.96875,0.3125 -0.11369,0.24633 0.0708,0.49236 0.46875,0.625 0.39792,0.13264 0.78125,-0.125 0.78125,-0.125 0,0 -0.44782,0.76235 -0.65625,0.78125 -0.20844,0.0189 -0.40892,-0.26498 -0.75,-0.625 -0.34107,-0.36003 -0.44975,-0.74702 -0.46875,-1.03125 -0.0189,-0.28422 0.0625,-0.34375 0.0625,-0.34375 l -0.84375,0.28125 c 0,0 -0.3068,0.0662 -0.25,0.3125 0.0569,0.24634 0.67023,0.79722 1.125,1.0625 0.45477,0.26528 1.0625,0.5625 1.0625,0.5625 0,0 0.0798,0.0455 -0.375,-0.125 -0.45476,-0.17053 -2.19018,-0.0651 -2.53125,1.375 -0.34108,1.44009 0.76299,2.09177 1.3125,2.28125 0.54951,0.18953 1.15625,0 1.15625,0 0,0 -0.49702,0.31051 -0.78125,0.5 -0.28423,0.18948 -0.8996,0.71677 -0.9375,0.90625 -0.0379,0.18953 0.125,0.25 0.125,0.25 l 0.96875,0.34375 c 0,0 -0.0937,-0.21012 -0.0937,-0.4375 0,-0.22738 0.19217,-0.54157 0.34375,-0.75 0.15159,-0.20844 0.74236,-0.8314 0.875,-0.8125 0.13264,0.0189 0.27361,0.12301 0.40625,0.3125 0.13264,0.18949 0.25,0.5 0.25,0.5 0,0 -0.25367,-0.1307 -0.5,-0.1875 -0.24633,-0.0568 -0.74335,0.0898 -0.78125,0.46875 -0.0379,0.37897 0.34742,0.47445 0.59375,0.53125 0.24633,0.0568 0.78125,-0.1875 0.78125,-0.1875 0,0 -0.24905,1.11041 -0.34375,1.90625 -0.0947,0.79584 -0.1004,2.44553 -0.0625,3.46875 0.0379,1.02323 0.20745,4.39882 0.21875,5.25 0.0113,0.85118 -0.21315,13.50978 -0.15625,16.75 0,2.04644 0.1917,6.67245 0.34375,9.375 0.0383,0.0687 -0.0784,0.2392 0.21875,0.25 0.29715,-0.0108 0.18045,-0.1813 0.21875,-0.25 0.15205,-2.70255 0.34375,-7.32856 0.34375,-9.375 0.0569,-3.24022 -0.16755,-15.89882 -0.15625,-16.75 0.0113,-0.85118 0.18085,-4.22677 0.21875,-5.25 0.0379,-1.02322 0.0322,-2.67291 -0.0625,-3.46875 -0.0947,-0.79584 -0.34375,-1.90625 -0.34375,-1.90625 0,0 0.53492,0.2443 0.78125,0.1875 0.24633,-0.0568 0.63165,-0.15228 0.59375,-0.53125 -0.0379,-0.37895 -0.53492,-0.52555 -0.78125,-0.46875 -0.24633,0.0568 -0.5,0.1875 -0.5,0.1875 0,0 0.11736,-0.31051 0.25,-0.5 0.13264,-0.18949 0.27361,-0.2936 0.40625,-0.3125 0.13264,-0.0189 0.72341,0.60406 0.875,0.8125 0.15158,0.20843 0.34375,0.52262 0.34375,0.75 0,0.22738 -0.0937,0.4375 -0.0937,0.4375 l 0.96875,-0.34375 c 0,0 0.1629,-0.0605 0.125,-0.25 -0.0379,-0.18948 -0.65327,-0.71677 -0.9375,-0.90625 -0.28423,-0.18949 -0.78125,-0.5 -0.78125,-0.5 0,0 0.60674,0.18953 1.15625,0 0.54951,-0.18948 1.65358,-0.84116 1.3125,-2.28125 -0.34107,-1.4401 -2.07649,-1.54553 -2.53125,-1.375 -0.4548,0.1705 -0.375,0.125 -0.375,0.125 0,0 0.60773,-0.29722 1.0625,-0.5625 0.45477,-0.26528 1.0681,-0.81616 1.125,-1.0625 0.0568,-0.2463 -0.25,-0.3125 -0.25,-0.3125 l -0.84375,-0.28125 c 0,0 0.0814,0.0595 0.0625,0.34375 -0.019,0.28423 -0.12768,0.67122 -0.46875,1.03125 -0.34108,0.36002 -0.54156,0.6439 -0.75,0.625 -0.20843,-0.0189 -0.65625,-0.78125 -0.65625,-0.78125 0,0 0.38333,0.25764 0.78125,0.125 0.39795,-0.13264 0.58244,-0.37867 0.46875,-0.625 -0.11369,-0.2463 -0.60873,-0.44514 -0.96875,-0.3125 -0.36005,0.1326 -0.40625,0.1875 -0.40625,0.1875 0,0 0.44975,-1.74642 0.46875,-3.28125 0.019,-1.53484 -0.4375,-3.75 -0.4375,-3.75 l 0,-2.21875 c 0,0 -0.0549,-0.125 -0.1875,-0.125 -0.0156,0 -0.0178,0.0274 -0.0312,0.0312 -0.0135,-0.004 -0.0156,-0.0312 -0.0312,-0.0312 z m 0.0312,9.875 0.0625,0.0312 c 0,0 0.0861,0.35307 0.21875,0.65625 0.13264,0.30317 0.2178,0.5246 0.3125,0.5625 0.0947,0.0379 0.25,0 0.25,0 0,0 -0.24236,0.23571 -0.375,0.40625 -0.13264,0.17053 -0.38155,0.53797 -0.40625,0.96875 -0.0247,0.43078 -0.0982,0.95632 0.25,1.4375 0.1555,0.1552 0.30575,0.2334 0.34375,0.25 -0.0213,-0.002 -0.0463,-0.0161 -0.0937,0.0312 -0.0947,0.0947 -0.3996,0.69216 -0.4375,0.84375 -0.0379,0.15158 -0.125,0.40625 -0.125,0.40625 0,0 -0.0871,-0.25467 -0.125,-0.40625 -0.0379,-0.15159 -0.3428,-0.74905 -0.4375,-0.84375 -0.0474,-0.0473 -0.0725,-0.0336 -0.0937,-0.0312 0.038,-0.0166 0.18825,-0.0948 0.34375,-0.25 0.34825,-0.48118 0.27468,-1.00672 0.25,-1.4375 -0.0247,-0.43078 -0.27361,-0.79822 -0.40625,-0.96875 -0.13264,-0.17054 -0.375,-0.40625 -0.375,-0.40625 0,0 0.1553,0.0379 0.25,0 0.0947,-0.0379 0.17986,-0.25933 0.3125,-0.5625 0.13268,-0.30318 0.21875,-0.65625 0.21875,-0.65625 l 0.0625,-0.0312 z m -2.03125,1.25 c 0.19244,-0.0102 0.35208,0.0481 0.75,0.375 0.53055,0.43582 0.32307,1.30853 -0.0937,1.6875 -0.41687,0.37898 -1.13333,0.19713 -1.53125,-0.125 -0.39793,-0.32212 -0.35239,-1.02063 -0.125,-1.4375 0.22738,-0.41692 0.78125,-0.46875 0.78125,-0.46875 0.08,-0.007 0.1546,-0.028 0.21875,-0.0312 z m 4.0625,0 c 0.0642,0.003 0.13875,0.0242 0.21875,0.0312 0,0 0.55387,0.0518 0.78125,0.46875 0.22739,0.41687 0.27293,1.11538 -0.125,1.4375 -0.39792,0.32213 -1.11438,0.50398 -1.53125,0.125 -0.41682,-0.37897 -0.6243,-1.25168 -0.0937,-1.6875 0.39792,-0.3269 0.55756,-0.3852 0.75,-0.375 z').attr({'fill':this.colours.shadow,'stroke':0}));
		//this.hands.push(this.box.path('m '+(this.chrome.clock.ox)+','+(this.chrome.clock.oy)+' m -1,10 l 2 0 l -1 -64 z').attr({'fill':this.colours.shadow,'stroke':0}));
		this.box.transformer(this.hands[0],['R',0,(this.chrome.clock.ox),(this.chrome.clock.oy)]);
		this.box.transformer(this.hands[1],['R',0,(this.chrome.clock.ox),(this.chrome.clock.oy)]);
		//this.box.transformer(this.hands[2],['R',0,(this.chrome.clock.ox),(this.chrome.clock.oy)]);

		// Dial
		this.dial = this.box.set();
		this.dial.push(
			this.box.circle(this.chrome.dial.ox,this.chrome.dial.oy+0.5,26).attr({'fill':this.colours.deepshadow,'stroke':0}),
			this.box.circle(this.chrome.dial.ox,this.chrome.dial.oy,25).attr({'fill':'270-'+this.colours.brass+'-'+this.colours.brassmed+':66-'+this.colours.brassdark,'stroke':0}),
			this.box.circle(this.chrome.dial.ox,this.chrome.dial.oy,20).attr({'fill':this.colours.brass,'stroke':0,'cursor':'pointer'})
		)
		this.dialhandle = this.box.set();
		this.dialhandle.push(
			this.box.path("M "+(this.chrome.dial.ox+0.5)+" "+(this.chrome.dial.oy-6+0.5)+" l 5 10 t -5 30 l 0 0 t -5 -30 z").attr({'fill':this.colours.deepshadow,'stroke':0,'cursor':'pointer'}),
			this.box.path("M "+(this.chrome.dial.ox)+" "+(this.chrome.dial.oy-6)+" l 5 10 t -5 27 l 0 0 t -5 -27 z").attr({'fill':'0-'+this.colours.deepshadow+'-'+this.colours.brass+'-'+this.colours.deepshadow,'stroke':0,'cursor':'pointer'})
		);
		this.box.transformer(this.dialhandle[0],['R',0,this.chrome.dial.ox,this.chrome.dial.oy])
		this.box.transformer(this.dialhandle[1],['R',0,this.chrome.dial.ox,this.chrome.dial.oy])

		this.dial.data('mb',this).click(function(e){ this.data('mb').toggleDial(); });
		this.dialhandle.data('mb',this).click(function(e){ this.data('mb').toggleDial(); });


		this.nextbutton = this.box.set();
		r = this.chrome.button.r;
		this.shadows.push(this.box.circle(this.chrome.button.ox,this.chrome.button.oy,this.chrome.button.r).attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.8}));
		this.nexttext = this.box.printArcLabel(this,this.phrasebook.next.label,this.box.getFont("Birch Std"),this.chrome.button.fontsize,this.chrome.button.fontsize*0.1,this.chrome.button.dr,this.chrome.button.ox,this.chrome.button.oy,this.chrome.button.r,90,true).attr({'fill':this.colours.deepshadow,'stroke':0});
		this.nextbutton.push(
			this.box.circle(this.chrome.button.ox,this.chrome.button.oy,r).attr({'fill':this.colours.frame,'stroke':0}),
			this.box.circle(this.chrome.button.ox,this.chrome.button.oy,r*0.81).attr({'fill':'270-'+this.colours.frameinlay,'stroke':0}),
			this.box.circle(this.chrome.button.ox,this.chrome.button.oy,r*0.76).attr({'fill':this.colours.white,'stroke':0,'cursor':'pointer'}),
			this.box.path('M'+this.chrome.button.ox+','+this.chrome.button.oy+'m'+(-r*0.5)+','+(-r*0.2)+' l'+(r*0.5)+',0 l0,'+(-r*0.2)+' l'+(r*0.5)+','+(r*0.4)+' l'+(-r*0.5)+','+(r*0.4)+' l0,'+(-r*0.2)+'l'+(-r*0.5)+',0 z').attr({'fill':this.colours.shadow,'stroke':0,'cursor':'pointer'})
		);
		this.nextbutton.data('mb',this).click(function(e){ this.data('mb').next(); }).mouseover(function(){ this.data('mb').nextbutton[3].attr({'fill':this.data('mb').colours.deepshadow}); }).mouseout(function(){ this.data('mb').nextbutton[3].attr({'fill':this.data('mb').colours.shadow}); });

		this.resetbutton = this.box.set();
		this.resetbutton.push(
			this.nextbutton[0].clone(), this.nextbutton[1].clone(), this.nextbutton[2].clone(),
			this.box.path('M'+this.chrome.button.ox+','+this.chrome.button.oy+'m '+(-r*0.2)+','+(r*0.4)+' c '+(r*0.6)+',0 '+(r*0.4)+','+(-r*0.4)+' '+(r*0.1)+','+(-r*0.3)+' l 0,'+(r*0.2)+' '+(-r*0.4)+','+(-r*0.4)+' '+(r*0.4)+','+(-r*0.4)+' 0,'+(r*0.2)+' c '+(r*0.1)+',0 '+(r*0.5)+',0 '+(r*0.5)+','+(r*0.4)+' 0,'+(r*0.4)+' '+(-r*0.5)+','+(r*0.4)+' '+(-r*0.5)+','+(r*0.3)+' z').attr({'fill':this.colours.shadow,'stroke':0,'cursor':'pointer','opacity':1})
		);
		this.resetbutton.data('mb',this).click(function(e){ this.data('mb').reset(); }).mouseover(function(){ this.data('mb').resetbutton[4].attr({'fill':this.data('mb').colours.deepshadow}); }).mouseout(function(){ this.data('mb').resetbutton[4].attr({'fill':this.data('mb').colours.shadow}); }).hide();

		// Offset all shadows
		for(var i = 0 ; i < this.shadows.length ; i++) this.box.transformer(this.shadows[i],['t',2.2,2.5]);

		this.scaleBox();
	}

	MessierBingo.prototype.next = function(){
		if(this.todo.length == 0) return this;
		if(this.todo.length == 1) this.resetbutton.show();
		var i;
		if(this.todo.length > 1) i = Math.round((this.todo.length-1)*Math.random());
		else if(this.todo.length == 1) i = 0;
		this.loadMessierObject(this.todo[i]);
		this.todo.splice(i,1);
		return this;
	}

	MessierBingo.prototype.loadMessierObject = function(i){
		$.ajax({
			url: 'db/M'+i+'.json',
			method: 'GET',
			dataType: 'json',
			context: this,
			error: function(e){
				var _obj = this;
				var _i = i;
        this.log(e);
				this.pantograph[0].updateInfo(300,function(){ _obj.updateInfo(_i,{'error':e}); });
			},
			success: function(data){
				var _obj = this;
				var _data = data;
				var _i = i;
				this.pantograph[0].updateInfo(300,function(){ _obj.updateInfo(_i,_data); });
			}
		});
		return this;
	}

	MessierBingo.prototype.updateInfo = function(i,data){
		$('#sky img').attr('src',this.chrome.iris.src);

		if(i >= 0){
			var m = this.catalogue[i-1];
			var avm_name = (this.phrasebook.catalogue ? this.phrasebook.catalogue[m.m].type : m.type)
			var object_type_text = '<strong>'+this.phrasebook.information.type.label+'</strong><br/> '+avm_name;
			$('#make-request').attr('data-objectid', m.m);
			if (m['aperture'] == 'none' || localStorage.getItem("token") == null) {
				$('#observe_button').hide();
			}else{
				$('#observe_button').show();
			}
			if(data && data.image) $('#sky img').attr('src',data.image_thumb);
			if($('#panel-info .messier').length == 0){
				$('#panel-info').html('<div class="padded"><div class="info-header"><div class="info-header-item"><h3 class="messier"></h3></div><div class="info-header-item" style="float:right;"><img src="" alt=""></div></div><p class="altname"></p><p class="type"></p><p class="distance"></p><p class="telescope"></p><p class="credit"></p><p class="date"></p><p class="download"></p></div>');
			}
			$('#panel-info .messier').html(m.m);
			$('#panel-info .info-header-item img').attr('src', this.urlprefix+"/images/"+m.avm_icon);
			$('#panel-info .info-header img').attr('alt', avm_name);
			$('#panel-info .altname').html((this.phrasebook.catalogue && this.phrasebook.catalogue[m.m].name) ? '('+this.phrasebook.catalogue[m.m].name+')' : (m.name) ? '('+m.name+')' : '');
			//$('#panel-info .distance').html('<strong>'+this.phrasebook.information.distance.label+'</strong> '+(m.distance >= 60000 ? '>' : '')+(m.distance*1000)+' '+this.phrasebook.information.distance.lyr);
			$('#panel-info .type').html(object_type_text);
		}
		if(typeof data==="object"){
			if(data){
				$('#sky img').attr('src',data.image_thumb);
				cache = new Image();
				var fn = function(){
					$('#sky img').attr('src',cache.src);
				}
				cache.onload = fn;
				cache.src = data.image;
				if(cache.complete) fn();

				$('#panel-info .telescope').html('<strong>'+this.phrasebook.information.telescope.label+'</strong><br/>'+data.telescope.name);
				$('#panel-info .credit').html('<strong>'+this.phrasebook.information.image.label+'</strong><br/>'+data.observer_name);
				$('#panel-info .download').html('<a href="'+data.image+'" target="observation">&raquo; '+this.phrasebook.information.original+'</a>');
			}else{
				$('#sky img').attr('src','images/missing.png');
				$('#panel-info .credit').html('');
				$('#panel-info .download').html('');
			}
		}else if(typeof data==="string"){
			$('#panel-info').html(data);
		}
	}

	MessierBingo.prototype.toggleDial = function(){
		this.setDial(!this.dialon);
		if(!this.pantograph[0].on && this.pantograph[1].on) this.pantograph[1].toggle();
		this.pantograph[0].toggle();
		return this;
	}

	MessierBingo.prototype.setDial = function(on){
		this.dialon = on;
		var ang = (on) ? this.dialang : -this.dialang;
		var d,i;
		// We have to update it twice for some reason - bug
		for(d = 0 ; d < this.dialhandle.length; d++){
			this.updateRotation(this.dialhandle[d],ang,333,100);
			this.updateRotation(this.dialhandle[d],ang,333,100);
		}
		return this;
	}

	MessierBingo.prototype.updateRotation = function(el,ang,ox,oy){
		var t,m,i;
		t = el.transform();
		m = false;
		for(i = 0; i < t.length ; i++){
			if(t[i][0] == 'r' || t[i][0] == 'R'){
				t[i][1] = ang;
				m = true;
			}
		}
		if(!m) t.push(['R',ang,ox,oy]);
		el.transform(t);
		return this;
	}

	MessierBingo.prototype.setTime = function(){
		var now = new Date();
		var h = (((now.getUTCHours()+now.getUTCMinutes()/60) % 12)*360/12);
		var m = ((now.getUTCMinutes() % 60)*360/60);
		var s = (((now.getUTCSeconds()+now.getUTCMilliseconds()/1000) % 60)*360/60);
		var angs = [h,m,s];
		for(var h = 0 ; h < this.hands.length ; h++) this.updateRotation(this.hands[h],angs[h],(this.chrome.clock.ox),(this.chrome.clock.oy));
		return this;
	}

	MessierBingo.prototype.setWindows = function(){
		var start = new Date();
		var end = new Date();
		this.startstamp = start.toISOString().substring(0,19);
		end.setDate( end.getDate() + 7 );
		this.endstamp = end.toISOString().substring(0,19);
	}

	MessierBingo.prototype.moveEyes = function(x,y){
		var eye = { x:132, y: 121, dx: 2, dy: 2 };
		var dx = x-eye.x;
		var dy = y-eye.y;
		this.messier[0].attr({x:eye.x+eye.dx*((dx < 0) ? dx/eye.x : dx/(this.wide-eye.x)),y:eye.y+eye.dy*((dy < 0) ? dy/eye.y : dy/(this.tall-eye.y))})
		return this;
	}

	MessierBingo.prototype.makePipe = function(x,y,dx,dy,t){
		var r = t;
		this.pipes.push(
			this.box.path('M '+x+','+y+' h '+(dx-r)+' c '+(r/2)+',0 '+r+','+(r/3)+' '+r+','+r+' v '+(dy-r)+' h -'+t+' v -'+(dy-r-t)+' c 0,-'+(t*0.75)+' 0,-'+t+' -'+t+',-'+t+' h -78.139 z').attr({'fill':this.colours.shadow,'stroke':0}),
			this.box.path('M '+x+','+(y+t*0.15)+' h '+(dx-r*1.05)+' c '+(r/2)+',0 '+r+','+(r/3)+' '+(r*0.9)+','+(r*0.9)+' v '+(dy-r-(t*0.1))+' h -'+(t*0.75)+' v -'+(dy-r-t*0.9)+' c 0,-'+(t*0.75)+' 0,-'+t+' -'+t+',-'+t+' h -72.139 z').attr({'fill':this.colours.brassdark,'stroke':0}),
			this.box.path('M '+x+','+(y+t*0.3)+' h '+(dx-r*1.3)+' c '+(r/2)+',0 '+r+','+(r/3)+' '+(r*0.85)+','+(r*0.85)+' v '+(dy-r-t*0.3)+' h -'+(t/7)+' v -'+(dy-r-t*0.5)+' c 0,-'+(t*0.75)+' 0,-'+t+' -'+(t*0.95)+',-'+(t*0.95)+' h -73.139 z').attr({'fill':this.colours.brass,'stroke':0})
		);
		return this;
	}

	MessierBingo.prototype.makeScrew = function(ox,oy,r,ang){
		var rad = r*1.0
		if(typeof ang!=="number") ang = Math.random()*180;
		var a = 12;
		var d2r = Math.PI/180;
		var dx = r/10;
		var dy = r/7;
		var x1,y1,x2,y2,x3,y3,x4,y4;
		x1 = ox + r*Math.cos((ang+a)*d2r);
		y1 = oy + r*Math.sin((ang+a)*d2r);
		x2 = ox + r*Math.cos((ang+180-a)*d2r);
		y2 = oy + r*Math.sin((ang+180-a)*d2r);
		x3 = ox + r*Math.cos((ang-a)*d2r);
		y3 = oy + r*Math.sin((ang-a)*d2r);
		x4 = ox + r*Math.cos((ang+180+a)*d2r);
		y4 = oy + r*Math.sin((ang+180+a)*d2r);
		var path = 'M '+x1+','+y1+' a'+rad+','+rad+' 0 0,1 '+(x2-x1)+','+(y2-y1)+' M '+x3+','+y3+' a'+rad+','+rad+' 0 0,0 '+(x4-x3)+','+(y4-y3)+' z';
		var path2 = 'M '+(x1+dx)+','+(y1+dy)+' a'+rad+','+rad+' 0 0,1 '+(x2-x1)+','+(y2-y1)+' M '+(x3+dx)+','+(y3+dy)+' a'+rad+','+rad+' 0 0,0 '+(x4-x3)+','+(y4-y3)+' z';
		this.screws.push(
			this.box.circle(ox+dx,oy+dy,r).attr({'fill':this.colours.screwdark,'stroke':0,'opacity':0.7}),
			this.box.path(path2).attr({'fill':this.colours.shadow,'stroke':0}),
			this.box.path('M '+x1+' '+y1+' L '+(x1+dx)+' '+(y1+dy)+' L '+(x2+dx)+' '+(y2+dy)+' L '+(x2)+' '+(y2)+' z M '+x3+' '+y3+' L '+(x3+dx)+' '+(y3+dy)+' L '+(x4+dx)+' '+(y4+dy)+' L '+(x4)+' '+(y4)+' z').attr({'fill':this.colours.shadow,'stroke':0	}),
			this.box.path(path).attr({'fill':this.colours.screw,'stroke':0})
		)
		return this;
	}

	MessierBingo.prototype.makeNut = function(ox,oy,r,ang){
		var path = "";
		var path2 = "";
		var a = Math.PI/3;
		var da = a/20;
		var xf,yf,xb,yb;
		if(typeof ang!=="number") ang = Math.random()*a;
		for(var i = 0; i < 6 ; i++){
			xb = r*Math.cos((i*a)-da+ang);
			yb = r*Math.sin((i*a)-da+ang);
			path += (i==0 ? 'M ' : 'L')+(xb+ox)+' '+(yb+oy);
			path2 += (i==0 ? 'M ' : 'L')+(xb+ox+r/12)+' '+(yb+oy+r/7);
			xf = r*Math.cos((i*a)+da+ang);
			yf = r*Math.sin((i*a)+da+ang);
			path += ' '+(xf+ox)+' '+(yf+oy)+' '
			path2 += ' '+(xf+ox+r/12)+' '+(yf+oy+r/7)+' '
		}
		this.nuts.push(
			this.box.path(path2+'z').attr({'fill':this.colours.deepshadow,'stroke':0,'opacity':0.7}),
			this.box.path(path+'z').attr({'fill':'315-'+this.colours.nut,'stroke':0}),
			this.box.circle(ox,oy,r*0.7,r*0.7).attr({'fill':this.colours.screw,'stroke':0})
		)
		return this;
	}

	MessierBingo.prototype.keypress = function(charCode,event){
		if(!event) event = { altKey: false };
		for(var i = 0 ; i < this.keys.length ; i++){
			if(this.keys[i].charCode == charCode && event.altKey == this.keys[i].altKey){
				this.keys[i].fn.call(this,{event:event});
				break;
			}
		}
	}

	// Register keyboard commands and associated functions
	MessierBingo.prototype.registerKey = function(charCode,fn,txt){
		if(typeof fn!="function") return this;
		if(typeof charCode!="object") charCode = [charCode];
		var aok, ch, c, i, alt, str;
		for(c = 0 ; c < charCode.length ; c++){
			alt = false;
			if(typeof charCode[c]=="string"){
				if(charCode[c].indexOf('alt')==0){
					str = charCode[c];
					alt = true;
					charCode[c] = charCode[c].substring(4);
				}else str = charCode[c];
				ch = charCode[c].charCodeAt(0);
			}else{
				ch = charCode[c];
				if(ch==37) str = "&larr;";
				else if(ch==32) str = "space";
				else if(ch==38) str = "up";
				else if(ch==39) str = "&rarr;";
				else if(ch==40) str = "down";
				else str = String.fromCharCode(ch);
			}
			aok = true;
			for(i = 0 ; i < this.keys.length ; i++){ if(this.keys.charCode == ch && this.keys.altKey == alt) aok = false; }
			if(aok) this.keys.push({'str':str,'charCode':ch,'char':String.fromCharCode(ch),'fn':fn,'txt':txt,'altKey':alt});
		}
		return this;
	}

	MessierBingo.prototype.makeSector = function(ox,oy,a,da,r){
		var path = "M "+ox+" "+oy+"";
		var rad;
		for(var i = 0; i <= da*2 ; i+=0.5){
			ang = (a-da+i)*Math.PI/180;
			rad = (ang==a-da || ang==a+da) ? 0.95*r : r;
			path += ((i==0 || i==da*2) ? "L" : "L")+(ox + rad*Math.cos(ang))+" "+(oy + rad*Math.sin(ang))
		}
		return path+"z";
	}
	// Log a message
	MessierBingo.prototype.log = function(){
		var args = Array.prototype.slice.call(arguments, 0);
		if(console && typeof console.log==="function") console.log('LOG',args);
		return this;
	}


	function Pantograph(me,ox,oy,w,h,w2,n,p,vert){

		if(typeof vert!=="boolean") vert = false;
		this.vert = vert;

		this.ox = ox;
		this.oy = oy;
		this.n = (typeof n==="number" ? n : 4);
		this.woff = (this.vert) ? w : 0;
		this.hoff = (this.vert) ? 0 : h;

		this.panel = p;

		if(this.vert){
			this.hout = h;
			this.wout = this.woff*Math.sin((Math.PI/2)-Math.acos(Math.min(1,this.hout/(this.n*this.woff)))); // The width when extended
			this.hon = w2;	// The width when compact
			this.won = this.woff*(1 - this.hon/this.hout);
		}else{
			this.wout = w; // The width when extended
			this.hout = this.hoff*Math.sin((Math.PI/2)-Math.acos(this.wout/(this.n*this.hoff)));
			this.won = w2;	// The width when compact
			this.hon = this.hoff*(1 - this.won/this.wout);
		}
		var offx = 2;
		var offy = 3;

		if(this.vert){
			this.pathoff = 'M'+ox+','+oy+' l '+(this.woff/2)+',0 ';
			this.pathout = 'M'+ox+','+oy+' l '+(this.wout/2)+',0 ';
			this.pathon = 'M'+ox+','+oy+' l '+(this.won/2)+',0 ';
		}else{
			this.pathoff = 'M'+ox+','+oy+' l 0,'+(this.hoff/2)+' ';
			this.pathout = 'M'+ox+','+oy+' l 0,'+(this.hout/2)+' ';
			this.pathon = 'M'+ox+','+oy+' l 0,'+(this.hon/2)+' ';
		}
		this.me = me;
		this.box = me.box;

		var d,don,dout,doff;

		if(this.vert){
			don = this.hon/this.n;
			dout = this.hout/this.n;
			doff = this.hoff/this.n;
		}else{
			don = this.won/this.n;
			dout = this.wout/this.n;
			doff = this.woff/this.n;
		}

		d = -1;
		for(var i = 0 ; i < this.n*2 ; i++){
			if(i == this.n){
				d = -d;
				if(this.vert){
					this.pathoff += 'l '+(-this.woff)+',0 ';
					this.pathon += 'l '+(-this.won)+',0 ';
					this.pathout += 'l '+(-this.wout)+',0 ';
				}else{
					this.pathoff += 'l 0,'+(-this.hoff)+' ';
					this.pathon += 'l 0,'+(-this.hon)+' ';
					this.pathout += 'l 0,'+(-this.hout)+' ';
				}
			}
			if(this.vert){
				this.pathoff += 'l '+((i%2==0 ? 1 : -1)*d*this.woff)+','+((i < this.n ? 1 : -1)*doff)+' ';
				this.pathon += 'l '+((i%2==0 ? 1 : -1)*d*this.won)+','+((i < this.n ? 1 : -1)*don)+' ';
				this.pathout += 'l '+((i%2==0 ? 1 : -1)*d*this.wout)+','+((i < this.n ? 1 : -1)*dout)+' ';
			}else{
				this.pathoff += 'l '+((i < this.n ? -1 : 1)*doff)+','+((i%2==0 ? 1 : -1)*d*this.hoff)+' ';
				this.pathon += 'l '+((i < this.n ? -1 : 1)*don)+','+((i%2==0 ? 1 : -1)*d*this.hon)+' ';
				this.pathout += 'l '+((i < this.n ? -1 : 1)*dout)+','+((i%2==0 ? 1 : -1)*d*this.hout)+' ';
			}
		}
		this.pathon += 'z';
		this.pathout += 'z';
		this.pathoff += 'z';

		this.group = this.box.set();
		this.group.push(this.box.path(this.pathoff).attr({'stroke':this.me.colours.deepshadow,'opacity':0.8,'stroke-width':3}));
		this.group.push(this.box.path(this.pathoff).attr({'stroke':this.me.colours.framedark,'stroke-width':4}));
		this.box.transformer(this.group[0],['t',1.5,2.5]);

		this.on = false;
		return this;
	}

	Pantograph.prototype.remove = function(){
		this.group.remove();
	}

	Pantograph.prototype.attr = function(attr){
		this.group.attr(attr);
		return this;
	}

	Pantograph.prototype.toggle = function(t,fn){
		if(typeof t!=="number") t = 300;
		var _obj = this;
		var attr = {};
		if(this.on){
			attr = (this.vert ? {'height':(0)+'px'} : {'width':(0)+'px'});
			this.panel.animate(attr,t,function(){ _obj.panel.hide(); });
			this.group.animate({'path':this.pathout},t,function(){
				if(typeof fn==="function") fn.call(this.me);
				_obj.group.animate({'path':_obj.pathoff},t);
				_obj.on = false;
			});
		}else{
			this.group.animate({'path':this.pathout},t,function(){
				if(typeof fn==="function") fn.call(this.me);
				_obj.group.animate({'path':_obj.pathon},t);
				var attr;
				attr = (_obj.vert ? {'height':(100*_obj.me.getScale()*(_obj.hout-_obj.hon)/_obj.me.tall)+'%'} : {'width':(100*_obj.me.getScale()*(_obj.wout-_obj.won)/_obj.me.wide)+'%'});
				_obj.panel.show().animate(attr,t);
				attr = (_obj.vert ? {'height':_obj.me.getScale()*(_obj.hout-_obj.hon)+'px'} : {'width':_obj.me.getScale()*(_obj.wout-_obj.won)+'px'});
				_obj.panel.find('.inner').css(attr);
				_obj.on = true;
			});
		}
		return this;
	}

	Pantograph.prototype.updateInfo = function(t,fn){
		if(typeof t!=="number") t = 300;
		var _obj = this;
		if(this.me.dialon){
			_obj.panel.animate({'width':(0)+'px'},t);
			_obj.group.animate({'path':_obj.pathout},t,function(){
				if(typeof fn==="function") fn.call(this.me);
				_obj.group.animate({'path':_obj.pathon},t);
				_obj.panel.animate({'width':(100*_obj.me.getScale()*(_obj.wout-_obj.won)/_obj.me.wide)+'%'},t);
				_obj.panel.find('.inner').css({'width':_obj.me.getScale()*(_obj.wout-_obj.won)+'px'});
			});
		}else{
			if(typeof fn==="function") fn.call(this.me);
		}
		return this;
	}

	Pantograph.prototype.resize = function(){
		var s = this.me.getScale();
		var attr = (this.vert ? {'height':(s*(this.hout-this.hon))+'px'} : {'width':(s*(this.wout-this.won))+'px'});
		this.panel.find('.inner').css(attr);

		return this;
	}

	/*!
	 * The following copyright notice may not be removed under any circumstances.
	 *
	 * Copyright:
	 * Copyright 1990, 1991, 1993, 2001 Adobe Systems Incorporated.  All Rights
	 * Reserved.
	 *
	 * Trademark:
	 * Birch is either a registered trademark or a trademark of Adobe Systems
	 * Incorporated in the United States and/or other countries.
	 *
	 * Full name:
	 * BirchStd
	 *
	 * Designer:
	 * Kim Buker Chansler
	 *
	 * Vendor URL:
	 * http://www.adobe.com/type
	 *
	 * License information:
	 * http://www.adobe.com/type/legal.html
	 */
	Raphael.registerFont({"w":110,"face":{"font-family":"Birch Std","font-weight":400,"font-stretch":"normal","units-per-em":"360","panose-1":"0 0 5 0 0 0 0 0 0 0","ascent":"270","descent":"-90","bbox":"-27 -274 275 90","underline-thickness":"18","underline-position":"-18","stemh":"14","stemv":"25","unicode-range":"U+0020-U+007E"},"glyphs":{" ":{"w":43},"!":{"d":"22,-71r-10,-176v-1,-15,2,-23,14,-23v12,0,16,8,15,23r-11,176v0,3,-1,6,-4,6v-3,0,-4,-3,-4,-6xm26,-36v18,0,18,36,0,36v-9,0,-13,-9,-13,-18v0,-9,4,-18,13,-18","w":52},"\"":{"d":"24,-177v-11,-13,-9,-74,-11,-82v0,-8,4,-15,11,-15v7,0,11,7,11,15v-2,8,-1,68,-11,82xm68,-177v-11,-12,-8,-74,-10,-82v0,-8,3,-15,10,-15v7,0,11,7,11,15v-2,8,-1,68,-11,82","w":92},"#":{"d":"185,-98r2,16r-40,0r-12,82r-18,0r12,-82r-51,0r-11,82r-18,0r11,-82r-39,0r-2,-16r43,0r8,-56r-39,0r-2,-16r43,0r12,-82r18,0r-12,82r51,0r12,-82r18,0r-12,82r36,0r2,16r-40,0r-8,56r36,0xm139,-154r-51,0r-8,56r51,0","w":216},"$":{"d":"46,-179v3,-17,0,-42,1,-61v-21,10,-11,38,-1,61xm63,-98v-3,19,0,44,-1,65v23,-7,12,-53,1,-65xm62,-240r0,91v12,26,32,50,33,86v0,34,-21,45,-33,46r2,17r-18,0r1,-17v-17,1,-38,-40,-29,-67v2,0,4,2,4,4v0,20,12,46,25,47r0,-96v-23,-34,-53,-111,0,-127r-1,-14r18,0r-2,14v15,-1,38,35,31,64v-2,0,-4,-1,-4,-3v0,-17,-15,-44,-27,-45"},"%":{"d":"125,-120v-6,0,-15,9,-15,55v0,46,9,55,15,55v6,0,15,-9,15,-55v0,-46,-9,-55,-15,-55xm127,-266r-73,266r-15,-4r72,-266xm41,-260v-6,0,-15,9,-15,55v0,46,9,55,15,55v6,0,15,-9,15,-55v0,-46,-9,-55,-15,-55xm125,-130v15,0,37,13,37,65v0,52,-22,65,-37,65v-15,0,-36,-13,-36,-65v0,-52,21,-65,36,-65xm41,-270v15,0,36,13,36,65v0,52,-21,65,-36,65v-15,0,-37,-13,-37,-65v0,-52,22,-65,37,-65","w":165},"&":{"d":"107,-24v8,19,22,-8,27,-4v4,19,-30,39,-45,20v-36,23,-82,-8,-82,-55v0,-39,18,-61,35,-83v-11,-36,-25,-124,25,-124v55,0,22,108,0,122r29,103v7,-11,14,-65,2,-75v-3,-4,-16,-8,-11,-13v17,1,39,-3,52,2r-14,14v0,54,-5,77,-18,93xm79,-23v-12,-27,-23,-66,-30,-97v-30,23,-14,131,30,97xm55,-194v2,7,3,29,9,18v7,-13,16,-32,16,-52v0,-13,-2,-25,-13,-25v-17,0,-21,28,-12,59","w":138},"(":{"d":"13,-138v0,-91,41,-130,62,-135v3,-1,4,5,1,6v-13,6,-35,45,-35,129v0,89,22,129,35,135v3,1,2,7,-1,6v-21,-5,-62,-45,-62,-141","w":81},")":{"d":"68,-138v0,96,-41,136,-62,141v-3,1,-4,-5,-1,-6v13,-6,35,-46,35,-135v0,-84,-22,-123,-35,-129v-3,-1,-2,-7,1,-6v21,5,62,44,62,135","w":81},"*":{"d":"41,-231r7,-37v0,-3,4,-3,4,0r7,37r30,-4v3,9,-21,13,-28,20r20,38v1,2,-1,4,-3,3r-28,-26r-28,26v-2,1,-4,-1,-3,-3r20,-38r-29,-16v-2,-1,-1,-4,1,-4","w":100},"+":{"d":"99,-100r0,-82r18,0r0,82r82,0r0,18r-82,0r0,82r-18,0r0,-82r-82,0r0,-18r82,0","w":216},",":{"d":"17,-36v10,0,14,9,14,24v2,44,-37,69,-23,47v10,-15,12,-30,9,-35v-8,-1,-13,-8,-13,-19v0,-10,5,-17,13,-17","w":34},"-":{"d":"10,-122r49,0r0,15r-49,0r0,-15","w":69},".":{"d":"17,-36v19,0,19,36,0,36v-9,0,-13,-9,-13,-18v0,-9,4,-18,13,-18","w":34},"\/":{"d":"81,-266r-62,266r-19,-4r63,-266","w":81},"0":{"d":"55,-270v36,0,45,63,45,121v0,87,-9,149,-45,149v-36,0,-45,-62,-45,-149v0,-58,9,-121,45,-121xm55,-18v13,0,19,-25,19,-132v0,-76,-6,-102,-19,-102v-14,0,-18,26,-18,102v0,107,4,132,18,132"},"1":{"d":"1,-242v15,-8,34,-17,41,-28v14,1,5,22,5,41r0,203v-2,14,19,17,15,26v-18,-1,-42,3,-57,-2v6,-7,17,-11,17,-24r0,-200v-2,-9,-16,-9,-21,-16","w":69},"2":{"d":"87,-211v0,81,-45,111,-52,170v0,8,0,14,4,18v11,-2,29,5,33,-5v4,-11,7,-25,14,-34v3,15,1,48,-5,62r-73,0v-3,-10,11,-19,5,-37v2,-56,47,-103,47,-176v0,-29,-3,-39,-16,-39v-23,0,-29,40,-38,44v-6,-30,23,-62,45,-62v22,0,36,20,36,59","w":96},"3":{"d":"44,-252v-23,0,-29,39,-37,44v-6,-30,22,-62,44,-62v22,0,39,22,39,62v0,42,-18,62,-32,67v14,5,32,21,32,71v0,43,-13,70,-46,70v-31,1,-44,-43,-38,-73v3,0,4,1,4,4v0,15,13,51,32,51v13,0,21,-11,21,-57v0,-45,-18,-59,-35,-63v0,-4,-1,-8,3,-8v14,0,32,-12,32,-53v0,-36,-5,-53,-19,-53","w":99},"4":{"d":"41,-2v22,-13,17,-47,17,-78v-19,-1,-43,3,-58,-2r65,-184v1,-6,16,-6,18,-1r0,169v11,1,13,-18,20,-14v-1,10,1,23,-1,32r-19,0v2,28,-7,64,14,75v1,1,4,5,0,5v-18,-1,-42,3,-56,-2xm58,-98r-1,-100r-34,98v7,5,24,0,35,2","w":104},"5":{"d":"82,-250v-10,16,-36,12,-48,14r-3,69v34,-27,61,15,60,70v0,59,-12,97,-44,97v-25,0,-42,-43,-35,-73v3,0,4,1,4,4v0,15,13,51,27,51v14,0,21,-18,21,-78v0,-41,-4,-62,-18,-62v-12,-1,-22,24,-34,31v-3,0,-3,-2,-3,-5r6,-133v8,-11,26,8,39,4v14,1,27,-6,36,-9v3,0,-1,9,-8,20","w":101},"6":{"d":"55,-270v29,-1,45,48,36,72v-6,-9,-13,-52,-36,-54v-14,0,-18,25,-18,88v32,-32,63,6,63,63v0,40,-12,101,-45,101v-26,0,-45,-27,-45,-149v0,-67,11,-121,45,-121xm55,-18v13,0,19,-25,19,-83v0,-36,-4,-57,-19,-57v-15,0,-18,22,-18,43v0,72,4,97,18,97"},"7":{"d":"27,-81v0,-53,34,-102,40,-153v0,-8,-8,-14,-18,-14v-16,0,-30,13,-39,45v-1,5,-6,6,-6,0v2,-21,-3,-49,2,-67v4,0,10,10,13,10v9,-9,39,-14,53,-4v5,2,15,-12,15,-2v8,64,-33,113,-33,176v-1,41,6,76,8,90v-10,-2,-26,4,-31,-3v-2,-10,-4,-37,-4,-78","w":92},"8":{"d":"55,-270v53,0,58,105,18,132v14,8,26,29,26,64v0,45,-15,74,-44,74v-29,0,-45,-29,-45,-74v0,-35,12,-56,26,-64v-40,-28,-34,-132,19,-132xm55,-129v-12,0,-18,20,-18,55v0,39,6,56,18,56v11,0,18,-17,18,-56v0,-35,-7,-55,-18,-55xm55,-146v13,0,18,-29,18,-57v0,-28,-5,-49,-18,-49v-13,0,-18,21,-18,49v0,28,5,57,18,57","w":109},"9":{"d":"19,-72v12,16,12,54,36,54v16,0,21,-44,18,-88v-5,6,-12,12,-20,12v-27,0,-43,-35,-43,-87v0,-43,12,-89,45,-89v32,0,45,36,45,132v0,86,-8,138,-43,138v-35,0,-44,-49,-38,-72xm55,-252v-13,0,-18,25,-18,69v0,45,3,71,18,71v15,0,19,-25,19,-60v0,-55,-5,-80,-19,-80"},":":{"d":"17,-36v19,0,19,36,0,36v-9,0,-13,-9,-13,-18v0,-9,4,-18,13,-18xm17,-172v19,0,19,36,0,36v-18,0,-17,-36,0,-36","w":34},";":{"d":"17,-36v10,0,14,9,14,24v2,44,-37,69,-23,47v10,-15,12,-30,9,-35v-8,-1,-13,-8,-13,-19v0,-10,5,-17,13,-17xm17,-172v19,0,19,36,0,36v-18,0,-17,-36,0,-36","w":34},"<":{"d":"199,-17r0,20r-182,-84r0,-20r182,-84r0,20r-160,74","w":216},"=":{"d":"199,-135r0,18r-182,0r0,-18r182,0xm199,-65r0,18r-182,0r0,-18r182,0","w":216},">":{"d":"17,-17r160,-74r-160,-74r0,-20r182,84r0,20r-182,84r0,-20","w":216},"?":{"d":"59,-131v-10,13,-4,41,-6,62v0,3,0,4,-3,4v-9,-18,-20,-54,-10,-76v24,-29,28,-52,28,-76v0,-17,-6,-35,-19,-35v-23,1,-29,37,-37,49v-10,-19,8,-67,40,-67v29,0,41,25,41,54v0,27,-6,48,-34,85xm51,-36v18,0,17,36,0,36v-10,0,-12,-9,-12,-18v0,-9,2,-18,12,-18","w":101},"@":{"d":"187,-153v0,-16,-6,-25,-17,-25v-19,0,-55,28,-55,77v0,23,11,32,26,32v15,0,46,-29,46,-84xm192,-172r4,-16r25,0r-25,99v-1,4,-4,23,15,23v35,0,53,-46,53,-79v0,-44,-40,-104,-113,-104v-63,0,-112,49,-112,133v0,54,43,110,115,110v33,0,53,-8,75,-18r5,7v-26,13,-49,21,-79,21v-99,0,-142,-73,-142,-124v0,-81,63,-136,138,-136v70,0,124,47,124,111v0,39,-25,90,-70,90v-26,0,-32,-23,-35,-27v-15,20,-80,59,-80,-20v0,-25,24,-90,75,-90v18,0,22,11,27,20","w":288},"A":{"d":"62,-2v18,-9,15,-43,6,-61v-9,1,-23,-3,-29,2v-4,22,-11,49,8,59v-10,4,-35,4,-46,0v3,-9,13,-11,15,-23r33,-242v1,-5,18,-6,19,1r35,242v-1,12,19,15,14,24v-18,-1,-41,3,-55,-2xm42,-85v2,6,22,5,25,0r-13,-88","w":119,"k":{"v":22,"w":22,"y":19,":":-4,",":-4,".":-4,";":-4,"a":4,"b":3,"c":12,"C":12,"d":9,"e":12,"g":12,"G":9,"j":2,"o":12,"O":12,"p":4,"q":12,"Q":12,"t":9,"T":19,"u":12,"U":12,"V":30,"W":28,"Y":19,"-":9}},"B":{"d":"21,-26r0,-218v2,-14,-19,-17,-15,-26v61,-4,102,3,102,67v0,41,-12,55,-26,64v14,7,27,22,27,62v0,81,-41,84,-105,75v6,-7,17,-11,17,-24xm49,-252r0,106v25,1,30,-11,30,-57v0,-40,-6,-50,-30,-49xm49,-128r0,110v31,2,30,-6,30,-62v0,-38,-6,-49,-30,-48","w":119,"k":{":":6,",":12,".":12,";":6,"a":3,"b":2,"e":6,"o":6,"U":3,"V":9,"Y":9,"A":6,"h":2,"k":2,"l":2}},"C":{"d":"80,-260v4,1,16,-20,16,-4v0,29,3,64,-2,89v-10,-25,-14,-77,-36,-77v-16,0,-18,34,-18,110v0,108,8,124,24,124v26,0,21,-81,32,-69v0,53,-7,87,-39,87v-42,0,-47,-82,-47,-142v0,-53,13,-161,70,-118","w":105,"k":{":":6,",":6,".":6,";":6,"a":3,"e":4,"o":4,"A":4,"z":2}},"D":{"d":"21,-26r0,-218v2,-14,-19,-17,-15,-26v87,-6,106,7,106,128v0,147,-20,149,-108,140v6,-7,17,-11,17,-24xm49,-252r0,234v28,1,33,-9,33,-124v0,-100,-7,-111,-33,-110","w":122,"k":{",":12,".":12,"a":3,"U":4,"V":12,"W":12,"Y":12,"A":9,"h":2}},"E":{"d":"49,-252r0,105v19,6,16,-29,28,-27v-2,25,3,57,-2,78v-9,-10,-6,-32,-26,-31r0,109v11,-1,27,3,30,-6v8,-23,10,-53,22,-72v6,25,0,64,2,93v0,2,-1,3,-3,3v-31,-2,-69,4,-96,-2v6,-7,17,-11,17,-24r0,-218v2,-14,-19,-17,-15,-26r94,0v1,0,3,1,3,3v-2,30,4,66,-2,92v-13,-18,-14,-48,-23,-70v-2,-11,-18,-6,-29,-7","w":111,"k":{"a":3,"c":3,"d":3,"e":3,"g":3,"o":3,"q":3}},"F":{"d":"49,-252r0,105v19,6,14,-30,28,-27v-2,25,3,57,-2,78v-9,-10,-6,-32,-26,-31v2,36,-4,80,3,111v4,5,17,10,14,16v-20,-2,-46,3,-62,-2v6,-7,17,-11,17,-24r0,-218v2,-14,-19,-17,-15,-26r94,0v7,23,4,70,1,95v-13,-18,-14,-48,-23,-70v-2,-11,-18,-6,-29,-7","w":111,"k":{":":3,",":22,".":22,";":3,"a":3,"e":12,"o":12,"A":22}},"G":{"d":"101,-175v-12,-23,-24,-78,-42,-77v-15,0,-19,34,-19,110v0,104,4,124,17,124v23,0,18,-65,19,-97v0,-12,-22,-13,-13,-22v18,1,42,-3,56,2v-2,9,-16,9,-16,20v-2,37,4,82,-2,115v-8,-2,-10,-11,-18,-13v-8,6,-17,13,-26,13v-45,0,-47,-82,-47,-142v0,-44,2,-128,46,-128v16,0,19,7,28,10v5,2,19,-20,19,-4v0,29,4,64,-2,89","w":118,"k":{"y":2,"a":4,"e":4,"o":4,"T":5,"u":2,"h":3,"l":3,"i":3,"n":3,"r":2}},"H":{"d":"49,-147r36,0v-2,-35,4,-77,-3,-107v-3,-5,-16,-11,-11,-16v19,1,44,-3,59,2v-6,7,-17,11,-17,24r0,218v-3,14,21,18,14,26v-19,-1,-43,3,-58,-2v4,-8,17,-11,16,-24r0,-102r-36,0v2,37,-4,80,3,112v3,5,16,11,11,16v-19,-1,-44,3,-59,-2v6,-7,17,-11,17,-24r0,-218v2,-14,-19,-17,-15,-26v19,1,44,-3,59,2v-4,8,-17,11,-16,24r0,97","w":133,"k":{"y":4,"a":3,"e":6,"o":6,"u":2}},"I":{"d":"21,-26r0,-218v2,-14,-19,-17,-15,-26v19,1,44,-3,59,2v-4,8,-17,11,-16,24r0,218v-3,13,19,17,14,26v-19,-1,-44,3,-59,-2v6,-7,17,-11,17,-24","w":69,"k":{"v":4,"w":4,"y":3,"a":3,"c":3,"d":3,"e":3,"g":3,"o":9,"p":3,"t":2,"u":4,"s":3}},"J":{"d":"50,-244v3,-13,-19,-17,-14,-26v19,1,43,-3,58,2v-4,8,-17,11,-16,24r0,185v0,53,-20,59,-40,59v-31,0,-38,-40,-38,-75v-1,-5,6,-5,6,-1v6,43,17,58,27,58v10,0,17,-8,17,-26r0,-200","w":98,"k":{"y":2,":":4,",":12,".":12,";":4,"a":6,"e":6,"o":6,"u":4,"i":4,"r":4}},"K":{"d":"21,-26r0,-218v3,-14,-20,-17,-15,-26v19,1,44,-3,59,2v-3,9,-16,11,-16,24r0,105r36,-106v4,-13,-20,-15,-14,-25v18,1,41,-3,55,2v-30,25,-35,76,-50,115v13,44,18,95,36,135v3,6,15,10,13,18v-18,-1,-42,3,-56,-2v4,-8,15,-13,13,-26r-21,-83v-9,24,-18,62,-9,95v3,5,16,10,11,16v-19,-1,-44,3,-59,-2v3,-10,17,-10,17,-24","w":127,"k":{"v":19,"w":19,"y":15,":":-3,",":-3,".":-3,";":-3,"a":4,"C":9,"e":13,"G":12,"o":13,"O":12,"Q":12,"u":12}},"L":{"d":"21,-26r0,-218v2,-14,-19,-17,-15,-26v19,1,44,-3,59,2v-4,8,-17,11,-16,24r0,226v9,-1,21,3,23,-5r25,-73v6,25,0,62,2,91v0,3,-1,5,-4,5v-29,-2,-66,4,-91,-2v6,-7,17,-11,17,-24","w":107,"k":{"w":12,"y":9,"a":2,"C":3,"e":2,"G":3,"j":2,"o":2,"O":3,"Q":3,"T":16,"u":2,"U":4,"V":22,"W":22,"Y":19}},"M":{"d":"4,-268v11,-5,32,0,46,-2v3,0,5,2,5,6r25,156r22,-156v0,-4,1,-6,4,-6v15,1,36,-3,47,2v-5,7,-15,11,-14,24r2,228v2,5,14,11,10,16v-17,-1,-40,3,-53,-2v5,-7,13,-12,13,-24r-1,-174r-27,197v0,5,-7,2,-11,3v-16,-61,-17,-137,-32,-200v2,61,-5,130,3,185v2,5,12,11,8,15v-15,-1,-36,3,-47,-2v5,-8,15,-12,15,-24r0,-218v-1,-12,-10,-17,-15,-24","w":157,"k":{"a":2,"c":2,"d":2,"e":2,"o":3,"u":3}},"N":{"d":"16,-16v9,-68,-1,-154,3,-228v1,-13,-16,-18,-13,-26r44,0v3,0,3,2,4,6r34,155v-2,-47,4,-103,-3,-145v-3,-5,-15,-11,-11,-16v16,1,38,-3,50,2v-5,8,-15,12,-15,24r0,240v-2,7,-23,7,-26,-5r-43,-196r0,179v-1,12,19,17,14,26v-16,-1,-38,3,-50,-2","w":128,"k":{"y":4,",":9,".":9,"a":6,"e":6,"o":6,"u":4}},"O":{"d":"58,-270v44,0,48,76,48,128v0,68,-4,142,-48,142v-43,0,-48,-74,-48,-142v0,-52,5,-128,48,-128xm58,-252v-10,0,-18,30,-18,110v0,94,8,124,18,124v11,0,19,-30,19,-124v0,-80,-8,-110,-19,-110","w":116,"k":{",":12,".":12,"a":2,"b":3,"c":2,"V":12,"W":12,"Y":12,"A":9,"x":3,"s":2,"X":15}},"P":{"d":"21,-26r0,-218v2,-14,-19,-17,-15,-26v64,1,103,-13,102,70v-1,51,-15,78,-59,74v2,36,-4,79,3,110v4,5,17,10,14,16v-20,-2,-46,3,-62,-2v6,-7,17,-11,17,-24xm49,-252r0,108v28,3,30,-10,30,-56v0,-46,-3,-54,-30,-52","w":117,"k":{":":6,",":22,".":22,";":6,"a":3,"e":6,"o":6,"U":4,"A":24,"s":3,"E":6,"H":6,"I":6,"R":6}},"Q":{"d":"58,-252v-10,0,-18,30,-18,110v0,37,1,65,3,89v8,-8,21,-8,29,1v3,-18,5,-48,5,-90v0,-80,-8,-110,-19,-110xm58,-270v44,0,48,76,48,128v0,42,-1,88,-13,115v9,11,23,-3,24,-17v0,-2,4,-2,4,0v2,32,-20,56,-43,37v-61,30,-68,-58,-68,-135v0,-52,5,-128,48,-128xm46,-36v1,14,14,28,20,9v0,-16,-16,-26,-20,-9","w":120,"k":{":":-4,",":-4,".":-4,";":-4,"U":2}},"R":{"d":"49,-128v2,37,-4,80,3,112v3,5,16,11,11,16v-19,-1,-44,3,-59,-2v6,-7,17,-11,17,-24r0,-218v2,-14,-19,-17,-15,-26v61,-3,102,0,102,67v0,40,-13,56,-26,64v36,12,16,82,26,122v4,5,11,9,14,16v-18,5,-49,-1,-45,-22v-5,-38,18,-106,-28,-105xm49,-252r0,106v25,1,30,-11,30,-57v0,-40,-6,-50,-30,-49","w":122,"k":{":":-4,",":-4,".":-4,";":-4,"a":3,"C":3,"d":3,"e":3,"G":3,"o":3,"O":3,"Q":3,"U":4,"V":9,"W":9,"Y":9}},"S":{"d":"67,-260v5,2,17,-18,19,-6v-2,29,4,66,-2,91v-12,-23,-22,-79,-42,-77v-9,0,-10,8,-10,17v-11,20,72,156,59,185v-1,55,-35,57,-60,40v-6,2,-13,12,-18,8v2,-30,-4,-67,2,-93v10,25,18,78,41,77v7,0,11,-8,11,-19v0,-39,-58,-142,-58,-188v0,-49,33,-52,58,-35","w":100,"k":{"a":3,"e":3,"o":3,"q":3,"V":3,"W":3,"Y":3,"A":3,"X":3}},"T":{"d":"45,-26r0,-227v-7,1,-16,-2,-17,4v-8,24,-10,54,-22,74v-4,-25,-4,-70,0,-95r107,1r-1,94v-15,-20,-11,-59,-26,-78r-13,0r0,227v-2,13,18,18,14,26v-19,-1,-43,3,-58,-2v4,-8,17,-11,16,-24","w":117,"k":{",":12,".":12,"a":2,"e":3,"o":3,"-":12,"A":12,"s":3,"J":15}},"U":{"d":"17,-39r0,-205v2,-14,-20,-18,-13,-26v18,1,42,-3,57,2v-4,9,-16,11,-16,24r0,196v0,16,1,30,18,30v13,0,17,-14,17,-30r0,-196v2,-14,-20,-18,-13,-26v16,1,38,-3,51,2v-4,9,-16,11,-16,24r0,205v0,22,-18,39,-42,39v-28,0,-43,-17,-43,-39","w":119,"k":{"y":3,",":12,".":12,"a":6,"c":4,"d":4,"g":4,"A":13,"z":3,"x":4,"s":6}},"V":{"d":"54,-3r-34,-240v-3,-11,-15,-16,-19,-26v18,-2,44,-2,62,0v-3,9,-18,12,-16,23r19,126r15,-126v2,-10,-20,-18,-12,-24v17,1,36,-2,51,1v-2,11,-17,14,-18,26r-29,239v0,8,-10,3,-16,4v-2,0,-3,-1,-3,-3","w":121,"k":{"y":9,":":17,",":22,".":22,";":17,"a":17,"C":9,"e":19,"G":9,"o":19,"O":9,"Q":9,"u":12,"-":12,"A":26,"i":3,"r":9}},"W":{"d":"1,-269v16,-2,41,-2,58,0v-3,9,-15,11,-13,22r17,127r13,-134v-4,-5,-11,-8,-14,-15v14,-2,37,-2,51,0v-2,9,-16,10,-14,22r18,127r13,-134v-3,-5,-17,-12,-10,-16v16,1,34,-2,48,1v-2,11,-15,13,-16,25r-27,242v-1,3,-14,3,-16,0r-24,-169r-19,169v-2,3,-14,3,-17,0r-31,-242v-2,-10,-13,-16,-17,-25","w":169,"k":{"y":4,":":17,",":22,".":22,"a":17,"C":12,"d":15,"e":19,"G":12,"o":19,"O":12,"Q":12,"t":4,"u":4,"-":12,"A":26,"i":4,"r":4,"m":4}},"X":{"d":"51,-130v-15,-47,-18,-107,-49,-139v17,-2,44,-2,62,0v-1,10,-18,11,-16,22r18,67r20,-67v1,-10,-15,-13,-18,-22v16,-2,41,-2,58,0v-4,10,-15,14,-18,25r-31,105v16,47,19,107,50,138v-18,2,-47,3,-63,-1v3,-9,16,-13,16,-24r-18,-64v-5,24,-18,47,-17,71v4,6,18,12,13,19v-19,-1,-40,2,-57,-1v5,-10,17,-16,21,-29","w":128,"k":{"y":9,":":-3,",":-3,".":-3,";":-3,"a":6,"C":12,"e":15,"G":12,"o":15,"O":12,"Q":12,"u":4,"-":12}},"Y":{"d":"28,-2v27,-19,13,-71,16,-110v-14,-52,-12,-121,-43,-157v16,-2,42,-3,57,1v-3,8,-16,9,-14,21r16,79v5,-29,16,-58,16,-86v-3,-5,-19,-11,-11,-16v17,1,36,-2,51,1v-6,8,-16,13,-18,25r-26,121v2,35,-4,77,3,107v3,5,18,12,11,16v-19,-1,-43,3,-58,-2","w":117,"k":{"v":10,":":17,",":19,".":19,";":17,"a":19,"C":12,"d":19,"e":22,"G":12,"o":24,"O":12,"q":24,"Q":12,"t":6,"u":12,"-":17,"A":15,"i":2}},"Z":{"d":"14,-175v-9,-23,0,-64,-3,-93v25,-4,67,-3,92,0r-64,250v12,-2,32,5,36,-4v11,-24,14,-53,27,-74v6,26,0,63,2,93v-23,8,-68,2,-95,2r64,-252v-11,1,-30,-4,-33,5v-9,24,-14,52,-26,73","w":112,"k":{"w":4,"y":4,"C":3,"e":3,"G":3,"o":3,"O":3,"Q":3,"u":3}},"[":{"d":"38,-251r0,232v6,8,16,12,20,22r-45,0r0,-276v14,2,35,-4,45,2","w":61},"\\":{"d":"-27,-265r20,0r134,265r-20,0","w":100},"]":{"d":"23,-19r0,-232v-6,-8,-15,-12,-19,-22r44,0r0,276r-44,0v4,-10,13,-14,19,-22","w":61},"^":{"d":"53,-121r-20,0r67,-131r16,0r67,131r-20,0r-55,-108","w":216},"_":{"d":"0,27r180,0r0,18r-180,0r0,-18","w":180},"a":{"d":"62,-165v1,-37,-39,-14,-50,-4v-1,0,-2,-1,-2,-2v0,-4,21,-29,41,-29v13,0,36,8,36,45r0,131v0,20,14,-1,18,3v-1,24,-33,26,-40,7v-25,23,-55,23,-56,-44v0,-40,5,-51,45,-83v7,-6,8,-9,8,-24xm62,-37r-1,-94v-20,17,-26,29,-26,66v0,63,19,60,27,28","w":104},"b":{"d":"17,0v-8,-79,3,-177,-3,-258v-3,-3,-15,-7,-10,-12v12,1,28,-3,36,2v1,26,-2,56,1,80v6,-7,14,-12,24,-12v15,0,33,9,33,89v0,102,-17,111,-33,111v-13,1,-20,-8,-29,-14v-6,5,-11,11,-19,14xm40,-158r0,118v0,15,8,25,17,25v9,0,12,-10,12,-96v0,-67,-4,-74,-13,-74v-5,0,-16,9,-16,27","w":106,"k":{"v":4,"w":4,"y":4,",":9,".":9}},"c":{"d":"37,-108v-1,104,12,109,45,71v4,15,-13,37,-30,37v-29,0,-43,-32,-43,-108v0,-60,16,-92,43,-92v18,0,31,21,30,39v-10,-12,-18,-24,-28,-24v-13,0,-17,15,-17,77","w":90},"d":{"d":"66,-188v2,-27,7,-70,-13,-81v10,-2,30,-3,39,1r0,251v3,5,14,13,11,17v-12,-1,-26,1,-36,-1v-1,-4,2,-11,-1,-13v-6,7,-12,14,-24,14v-16,0,-33,-9,-33,-111v0,-80,18,-89,33,-89v10,0,18,5,24,12xm67,-44r0,-114v0,-18,-11,-27,-16,-27v-9,0,-14,7,-14,74v0,87,4,96,13,96v9,0,17,-11,17,-29","w":106},"e":{"d":"37,-78v-4,70,26,76,51,44v1,17,-15,35,-32,34v-33,0,-47,-32,-47,-113v0,-55,16,-87,41,-87v26,-7,43,39,39,90v0,3,0,4,-3,4r-49,0r0,28xm37,-120r27,0v0,-22,4,-65,-14,-65v-18,0,-12,44,-13,65","w":98,"k":{"v":3,"w":3,"y":3,"x":3}},"f":{"d":"75,-239v-8,5,-17,-19,-26,-16v-15,5,-7,35,-9,52v-2,8,19,-2,14,7v-5,6,-12,10,-14,18r1,161v3,5,17,11,12,17v-17,-1,-36,2,-51,-1v2,-8,11,-11,13,-19v-2,-54,5,-117,-3,-165v-3,-5,-13,-9,-11,-15v5,-1,14,2,14,-3v-3,-34,3,-67,32,-67v17,0,28,17,28,31","w":59,"k":{"}":-15,"]":-15,")":-15,"\"":-22,"'":-22}},"g":{"d":"14,13v8,9,17,19,32,19v12,0,23,-15,20,-46v-6,8,-12,14,-24,14v-16,0,-33,-9,-33,-111v0,-81,18,-89,35,-89v11,-1,18,8,25,14v7,-3,16,-16,23,-12r0,156v0,76,-18,90,-42,90v-28,0,-40,-25,-36,-35xm67,-44r0,-107v0,-23,-9,-34,-17,-34v-9,0,-13,8,-13,74v0,87,4,96,13,96v9,0,17,-11,17,-29","w":106,"k":{",":4,".":4,"a":4}},"h":{"d":"38,-270v7,21,-2,59,3,82v17,-22,55,-13,55,25r0,146v3,5,16,11,11,17v-16,-1,-36,2,-50,-1v5,-6,11,-11,14,-19r0,-144v0,-14,-5,-21,-13,-21v-9,0,-18,13,-18,32r1,136v3,5,16,14,10,17v-16,-1,-35,2,-49,-1v2,-8,11,-11,13,-19r-1,-236v-3,-4,-15,-9,-10,-14r34,0","k":{"y":3}},"i":{"d":"14,-17r0,-169v-3,-4,-15,-9,-10,-14v11,1,28,-3,36,2r1,181v3,5,16,14,10,17v-16,-1,-35,2,-49,-1v2,-7,8,-10,12,-16xm27,-270v7,0,13,9,13,19v0,9,-6,19,-13,19v-17,0,-17,-38,0,-38","w":55},"j":{"d":"2,-199v9,-1,30,-3,38,1r0,192v7,60,-53,70,-57,24v6,-7,10,19,20,14v9,0,12,-6,12,-36r-1,-182v-4,-4,-10,-7,-12,-13xm27,-270v7,0,13,9,13,19v0,9,-6,19,-13,19v-17,0,-17,-38,0,-38","w":55,"k":{",":4,".":4}},"k":{"d":"39,-270v5,46,-3,105,2,151v6,-26,36,-57,16,-80v10,-2,29,-2,40,0v-19,21,-25,54,-38,80r37,105v3,4,15,9,10,14v-13,-1,-30,2,-41,-1v0,-6,8,-9,6,-15r-25,-71v-9,20,-13,74,6,86v-14,2,-36,2,-50,0v1,-7,13,-7,13,-14r-1,-243v-3,-3,-15,-7,-10,-12r35,0","w":108,"k":{"a":6,"e":12,"o":12}},"l":{"d":"39,-270r2,253v3,5,16,14,10,17v-16,-1,-35,2,-49,-1v2,-8,11,-11,13,-19r-1,-236v-3,-4,-15,-9,-10,-14r35,0","w":55},"m":{"d":"14,-17r0,-169v-3,-4,-15,-9,-10,-14v14,2,38,-8,37,12v9,-15,40,-16,48,0v18,-21,56,-14,56,25r0,146v3,5,16,11,11,17v-16,-1,-36,2,-50,-1v5,-6,11,-11,14,-19r0,-144v0,-14,-4,-21,-11,-21v-8,0,-16,13,-16,32r0,136v2,5,13,12,8,17v-14,-1,-32,2,-44,-1v1,-8,10,-11,10,-19r0,-144v0,-14,-3,-21,-10,-21v-8,0,-17,13,-17,32r1,136v3,5,16,14,10,17v-16,-1,-35,2,-49,-1v2,-7,8,-10,12,-16","w":159,"k":{"y":4}},"n":{"d":"39,-200v3,2,-1,10,2,12v17,-22,55,-13,55,25r0,146v3,5,16,11,11,17v-16,-1,-36,2,-50,-1v5,-6,11,-11,14,-19r0,-144v0,-14,-5,-21,-13,-21v-9,0,-18,13,-18,32r1,136v3,5,16,14,10,17v-16,-1,-35,2,-49,-1v2,-8,11,-11,13,-19r-1,-166v-3,-4,-15,-9,-10,-14r35,0","k":{"v":4,"y":4}},"o":{"d":"52,-200v23,0,43,20,43,91v0,89,-20,109,-43,109v-23,0,-43,-20,-43,-109v0,-71,20,-91,43,-91xm52,-15v10,0,15,-13,15,-94v0,-63,-5,-76,-15,-76v-9,0,-15,13,-15,76v0,81,6,94,15,94","w":104,"k":{"v":6,"w":6,"y":6,",":9,".":9,"x":9}},"p":{"d":"14,31r0,-219v-3,-3,-15,-7,-10,-12v14,2,38,-8,37,12v6,-7,14,-12,24,-12v15,0,33,9,33,89v0,102,-18,111,-34,111v-13,1,-17,-9,-24,-14v-1,25,-3,51,14,60v-12,4,-39,4,-52,0xm40,-158r0,116v0,15,10,27,18,27v8,0,11,-9,11,-96v0,-67,-4,-74,-13,-74v-5,0,-16,9,-16,27","w":106,"k":{"w":4,"y":3,",":9,".":9}},"q":{"d":"54,46v16,-9,14,-35,13,-60v-7,8,-14,14,-25,14v-16,0,-33,-9,-33,-111v0,-102,23,-99,62,-77v7,-3,16,-13,22,-10r0,229v2,5,17,13,10,17v-16,-1,-37,3,-49,-2xm67,-44r0,-107v0,-22,-7,-34,-16,-34v-10,0,-14,10,-14,74v0,87,5,96,13,96v9,0,17,-14,17,-29","w":107},"r":{"d":"79,-166v-5,-7,-12,-19,-22,-17v-10,0,-17,15,-17,33r1,133v3,5,16,11,11,17v-16,-1,-36,2,-50,-1v2,-8,11,-11,13,-19r-1,-166v-3,-4,-15,-9,-10,-14v15,2,39,-8,37,14v13,-25,41,-10,40,16v0,2,-1,4,-2,4","w":79,"k":{",":12,".":12,"o":3}},"s":{"d":"53,-31v1,-45,-46,-85,-44,-131v1,-34,31,-50,49,-27v4,-2,12,-15,14,-8v-1,23,3,52,-2,71v-7,-13,-10,-57,-29,-59v-8,0,-9,9,-9,20v-1,35,45,87,45,129v0,34,-37,48,-53,24v-4,3,-10,16,-14,9v2,-23,-3,-52,2,-71v9,24,14,59,29,59v8,0,12,-7,12,-16","w":86,"k":{"w":4,"y":3}},"t":{"d":"40,-28v0,19,16,13,22,4v2,10,-9,24,-23,24v-15,0,-24,-6,-24,-36r-1,-151v-2,-5,-19,-13,-7,-15v19,-4,13,-37,20,-47v4,1,12,-2,13,2v4,15,-11,46,11,45v3,7,-11,11,-11,20r0,154","w":63},"u":{"d":"94,-200v7,55,-1,124,2,183v3,5,14,13,11,17v-12,-1,-26,1,-36,-1v-1,-4,2,-11,-1,-13v-15,24,-55,16,-55,-23r-1,-149v-3,-4,-15,-9,-10,-14v11,1,28,-3,36,2r0,162v0,14,5,21,14,21v9,0,17,-11,17,-29v-2,-46,4,-100,-2,-142v-3,-4,-14,-10,-10,-14r35,0"},"v":{"d":"83,-187v-14,55,-15,122,-25,181v1,8,-7,6,-14,6v-3,0,-5,-3,-5,-5r-26,-176v0,-8,-16,-15,-9,-19v14,1,31,-2,43,1v-2,8,-11,9,-12,19r16,100v3,-35,14,-73,11,-106v-2,-4,-15,-12,-8,-14v13,1,28,-2,39,1","w":94,"k":{",":16,".":16,"a":9,"c":9,"d":9,"e":9,"o":9,"q":9,"s":6}},"w":{"d":"39,-4r-26,-177v0,-8,-16,-15,-9,-19v14,1,30,-2,42,1v-2,8,-12,10,-11,19r16,100v2,-40,23,-91,0,-119v11,-2,30,-2,42,0v-3,9,-15,12,-13,24r15,95v3,-36,12,-72,12,-108v-2,-3,-12,-9,-7,-12v12,1,27,-1,37,1v-3,9,-13,10,-14,21r-21,173v0,6,-6,5,-12,5v-3,0,-3,-3,-3,-4r-18,-114v-7,38,-7,83,-18,118v-5,0,-11,0,-12,-4","w":138,"k":{",":16,".":16,"a":9,"c":9,"d":9,"e":9,"o":9,"q":9}},"x":{"d":"1,-1v24,-22,29,-63,41,-97r-25,-87v-3,-5,-15,-11,-11,-15v16,1,34,-2,48,1v-1,9,-13,8,-10,20v5,13,6,30,12,42v4,-20,22,-47,3,-59v-1,-1,-2,-4,1,-4v13,1,28,-2,39,1v-20,21,-25,57,-37,86v13,38,17,86,42,112v-14,2,-36,1,-51,0v19,-16,2,-47,-3,-71v-5,23,-27,54,-2,68v2,2,3,4,-1,4v-15,-1,-33,1,-46,-1","w":105,"k":{"a":4,"c":9,"d":9,"e":9,"o":9,"q":9,"s":2}},"y":{"d":"5,13v7,-4,12,23,21,19v17,-2,12,-33,9,-52r-24,-166v-1,-4,-14,-12,-7,-14v14,1,30,-2,42,1v-2,8,-11,10,-10,19r14,104v2,-37,10,-75,9,-111v-2,-4,-12,-10,-8,-13v13,1,30,-2,41,1v-3,7,-13,9,-14,18r-24,195v-3,23,-13,34,-24,34v-18,0,-25,-24,-25,-35","w":93,"k":{",":16,".":16,"a":3,"c":9,"d":9,"e":9,"o":4,"q":4,"s":3}},"z":{"d":"12,-130v-6,-17,0,-46,-2,-67v16,-6,53,-4,72,-1r-44,186v9,-1,23,3,26,-5v6,-18,10,-39,20,-54v3,20,0,46,1,68v-17,7,-55,2,-76,2r47,-187v-9,1,-21,-4,-24,5v-7,17,-11,38,-20,53","w":94,"k":{"c":3,"d":3,"e":3,"o":3}},"{":{"d":"26,-159v3,-48,-17,-107,42,-114v3,-1,5,5,2,6v-26,10,-23,23,-18,60v5,40,0,65,-15,72v15,7,20,32,15,72v-5,37,-8,50,18,60v3,1,1,7,-2,6v-59,-7,-39,-65,-42,-114v0,-10,-4,-21,-12,-23v0,-5,15,-13,12,-25","w":74},"|":{"d":"31,90r0,-360r18,0r0,360r-18,0","w":79},"}":{"d":"6,-273v59,7,40,64,43,114v0,9,3,20,11,22v2,1,2,3,0,3v-19,14,-12,46,-10,79v2,30,-9,50,-44,58v-3,1,-4,-5,-1,-6v26,-10,23,-23,18,-60v-5,-40,0,-65,15,-72v-15,-7,-20,-32,-15,-72v5,-37,8,-50,-18,-60v-3,-1,-2,-7,1,-6","w":74},"~":{"d":"70,-112v24,0,56,23,77,24v14,0,23,-13,31,-26r13,13v-11,15,-23,31,-45,31v-36,0,-90,-50,-108,2r-13,-13v8,-15,21,-31,45,-31","w":216},"'":{"d":"24,-177v-11,-13,-9,-74,-11,-82v0,-8,4,-15,11,-15v7,0,11,7,11,15v-2,8,-1,68,-11,82","w":48},"`":{"d":"65,-235r-2,4v-17,-8,-40,-12,-53,-22v5,-5,6,-22,15,-14","w":75},"\u00a0":{"w":43}}})

	$.messierbingo = function(placeholder,input) {
		if(typeof input=="object") input.container = placeholder;
		else {
			if(placeholder){
				if(typeof placeholder=="string") input = { container: placeholder };
				else input = placeholder;
			}else{
				input = {};
			}
		}
		input.plugins = $.messierbingo.plugins;
		return new MessierBingo(input);
	};

	$.messierbingo.plugins = [];

})(jQuery);
