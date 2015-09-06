$(function() {
	
	
	
	function c_info(v){console.info(v);}
	function c_error(v){console.error(v);}
	function c_warn(v){console.warn(v);}
	function c_log(v){console.log(v);}
	
	
	
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		$canvas = $('.frame-render .panel-canvas canvas'),
		$brush = $('.frame-render .panel-canvas .brush'),
		$colorPicker;
	
	var mouse = {
		
		pageX: 0,
		pageY: 0,
		state: 0
		
	};
	
	var TOOLS = {
		
		format: {
			
			preview: {
				scale: 1
			},
			pattern: {
				size: 10,
				scale: 10
			},
			showEditor : true,
			showPreview: true
			
		},
		
		brush : {
			pos : {x: 0, y: 0},
			color: '#000000',
			isDrawing: false,
			size: 1,
			type: 0
		}
	};
	
		var PATTERN = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];
	
	
	
	
	
	
	
	
	
	var Main = {
		
		pattern : undefined,
		pencil: undefined
		
	};
	
	
	
	
	
	
	
	
	var Pixel = function(c, a) {
		this.color = c;
		this.alpha = a;
	}
	
	var Color = function(r, v, b, a) {
		
		this.r = r;
		this.v = v;
		this.b = b;
		this.a = (a !== undefined && a > 0 && a < 1) ? a : 1;
		
		this.getHexa = function () {
			
			return String.concat(r, v, b);
			
		};
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var Pattern = function(c, w, h, s) {
		
		var width = w,
			height = h,
			scale = s,
			canvas = c,
			context = canvas.getContext('2d'),
			$canvas = $(c);
		
		this.active = true;
		this.shown = true;
		
		var layers = [],
			activeLayer;
		
		this.addLayer = function(name, index) {
			
			var l = new Layer(name, index, context);
			
			if(layers[index] instanceof Layer) {
				
				layers.push(l);
				
				layers.sort(function (a,b){
					if(a.index < b.index)
						return -1;
					else if(a.index > b.index)
						return 1;
					return 0;
				});
				
				for(i=0; i<layers.length; i++)
					layers[i].setIndex(i);
				
			} else {
				
				layers[index] = l;
				
			}
			
			refreshLayersList();
			
		};
		
		this.getCurrentLayer = function () { return activeLayer; };
		this.getScale = function () { return scale; };
		this.getCanvas = function () { return $canvas; };
		this.getSize = function () { return {x: width, y: height}; };
		
		this.updateSize = function() {};
		this.updateScale = function() {};
		
		this.isActive = function() {};
		this.isVisible = function() {};
		
		this.previewAll = function () {
			
			for(i=0; i<layers.length; i++) {
				layers[i].preview();
			}
			
		};
		
		function refreshLayersList() {}
		
		this.init = function () {
			
			this.addLayer('Calque 0', 0, context);
			activeLayer = layers[0];
			
			$canvas.on('mouseenter', function(e) {	
				Main.pencil.$.show();
			});
			
			$canvas.on('mouseleave', function(e) {	
				Main.pencil.$.hide();
			});
			
			$canvas.on('mousemove', function(e) {	
				Main.pencil.updatePos(e);
				if( Main.pencil.draw() ) {
					activeLayer.updatePixels();
					activeLayer.updatePreviewLink();
				}
				Main.pencil.display();
			});

			$(document).on('mousedown', function(e) {
				Main.pencil.state = 1;
				Main.pencil.updatePos(e);
				if( Main.pencil.draw() ) {
					activeLayer.updatePixels();
					activeLayer.updatePreviewLink();
				}
				Main.pencil.display();
			});

			$(document).on('mouseup', function(e) {
				Main.pencil.state = -1;
				Main.pattern.previewAll();
			});
			
		}
		
		function Layer(n, i, c) {
			
			
			this.name = n.replace(' ', '_');
			this.lock = false;
			this.visible = true;
			this.index = i;
			this.context = c;
			$('.layer-preview').append('<div class="layer-'+ this.name +'" style="z-index:'+ this.index +';"></div>');
			this.$ = $('.layer-'+ this.name);
			
			var data = c.getImageData(0, 0, width, height),
				previewLink;
			
			this.updatePixels = function () {
				data = c.getImageData(0, 0, width, height);
			};
			
			this.updatePreviewLink = function () {
				previewLink = canvas.toDataURL();
			};
			
			this.preview = function () {
				this.$.css('background-image', 'url('+ previewLink +')');
			};
			
			this.setIndex = function (i) {
				this.index = i;
				this.$.css('z-index', i);
			};
			
			/*this.setPixel = function(i, pix) {
				//	var i = (y * width) + x;
				pixels[i] = pix.color;
			};
			
			this.getPixel = function(i) {
				return pixels[i];};
			
			this.clearPixel = function(i) {
				pixels[i] = undefined;};
			
			this.clearAll = function() {
				pixels = [];};
			
			this.fill = function(color, alpha) {
				for(i=0;i<pixels.length;i++)
					this.setPixel(i, color, alpha);};*/
			
		}
		
		this.init();
		
		
		
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var Brush = function(dr, di, up) {

		this.draw = dr;
		this.display = di;
		this.update = up;

	}
	
	
	
	var Pencil = function (selector) {
		
		this.pos = {x:0, y:0};
		this.color = new Color(0,0,0);
		this.alpha = '1';
		this.size = 1;
		this.brush;
		this.activeBrush;
		
		this.active = true;
		this.state = -1; // -1: released, 1: pressed
		
		var $this;
		this.$ = $this = $(selector);
		
		var brushes = {};
		
		this.draw = function() {
			
			if(!this.active || this.state != 1) return false;
			
			var l = Main.pattern.getCurrentLayer(),
				s = Main.pattern.getSize();
			
			if(!(this.activeBrush instanceof Brush) )
				this.selectBrush('default');
			
			if(this.pos.x >= 0 && this.pos.y >= 0 && this.pos.x < s.x && this.pos.y < s.y) {
				
				this.activeBrush.draw(this, l);
				return true;
				
			}else {
				
				return false;
				
			}
			
		};
		
		this.display = function () {
			
			if(!this.active) return;
			
			var l = Main.pattern.getCurrentLayer();
			
			if(!(this.activeBrush instanceof Brush))
				this.selectBrush('default');
			
			this.activeBrush.display(this, Main.pattern.getScale());
			
		};
		
		this.updatePos = function (e) {
			
			var scale = Main.pattern.getScale(),
				p_pos = Main.pattern.getCanvas().offset(),
				mouse = {x:0, y:0};

			mouse.x = e.pageX - (scale * Main.pencil.size / 2);
			mouse.y = e.pageY - (scale * Main.pencil.size / 2);

			this.pos.x = Math.round((mouse.x - p_pos.left) / scale);
			this.pos.y = Math.round((mouse.y - p_pos.top) / scale);
			
		};
		
		this.setPos = function (x, y) {
			pos.x = x;
			pos.y = y;
		};
		
		this.addBrush = function (name, b) {
			
			if(name === 'default')
				return false;
			
			brushes[name] = b;
			
		};
		
		this.setColor = function (c) {
			this.color = c;
			this.activeBrush.update(this, Main.pattern.getScale());
		};
		
		this.setSize = function (s) {
			this.size = s;
			this.activeBrush.update(this, Main.pattern.getScale());
		};
		
		this.selectBrush = function (name) {
			
			if(brushes.hasOwnProperty(name)) {
				this.activeBrush = brushes[name];
				this.activeBrush.update(this, Main.pattern.getScale());
				return true;
			}else {
				this.activeBrush = brushes['default'];
				this.activeBrush.update(this, Main.pattern.getScale());
				return false;
			}
			
		};
		
		
		
		
		
		brushes['default'] = new Brush(function (pen, layer) {

			var ct = layer.context;

			ct.beginPath();
			ct.rect(pen.pos.x, pen.pos.y, pen.size, pen.size);
			ct.fillStyle = '#' + pen.color.getHexa();
			ct.globalAlpha = pen.color.a;
			ct.fill();

		}, function (pen, scale) {

			pen.$.css('left', pen.pos.x * scale)
				 .css('top',  pen.pos.y * scale);

		}, function (pen, scale) {
			
			var size = pen.size * scale;
			pen.$.css('width', size + 'px').css('height', size + 'px');
			pen.$.css('background-color', '#' + pen.color.getHexa());
			
		});
		
		this.activeBrush = brushes['default'];
		
		this.activeBrush.update(this, Main.pattern.getScale());
		
		
		
		
		
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	Main.pattern = new Pattern(canvas, 10, 10, 10);
	Main.pencil = new Pencil('.brush');
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
//	$canvas.on('mousemove', draw);
//	
//	$canvas.on('mouseleave', function(e) {
//		$brush.hide();
//	});
//	
//	$canvas.on('mouseenter', function(e) {
//		$brush.show();
//	});
//	
//	$('.frame-render').on('mousedown', function(e) {
//		TOOLS.brush.isDrawing = true;
//		draw(e);
//	});
//	
//	$('.frame-render').on('mouseup', function(e) {
//		TOOLS.brush.isDrawing = false;
//		previewPattern(PATTERN);
//	});
	
	$('.frame-tools .parameter input').on('keydown', onChangeParameter);
	$('.frame-tools .parameter input[type=checkbox]').on('mousedown', onChangeParameter);
	
	$colorPicker = $('#colorpicker').farbtastic(function(color) {
		TOOLS.brush.color = color;
		updateBrush();
	});
	
	$('.frame-tools .panel[name=colorPicker] .color-grid .color-cell.new').click(newColorCell);
	$('.frame-tools .panel[name=colorPicker] .color-grid').on('click', '.color-cell:not(.new)', function() {
		
		var color = $(this).attr('color');
		$.farbtastic($colorPicker).setColor(color);
		TOOLS.brush.color = color;
		updateBrush();
		
	});
	
	var button = document.getElementById('btn-download');
	button.addEventListener('click', function (e) {
		var dataURL = canvas.toDataURL('image/png');
		button.href = dataURL;
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/*function draw(e){
		
		var scale = TOOLS.format.pattern.scale,
			size = TOOLS.format.pattern.size,
			b_size = TOOLS.brush.size,
			t_mouse = {
				x: e.pageX - (scale * b_size / 2),
				y: e.pageY - (scale * b_size / 2)
			},
			t_pos_parent = $canvas.offset(),
			ox, oy;
		
		TOOLS.brush.pos.x = ox = Math.round((t_mouse.x - t_pos_parent.left) / scale);
		TOOLS.brush.pos.y = oy = Math.round((t_mouse.y - t_pos_parent.top) / scale);
		
		$brush.css('left', TOOLS.brush.pos.x * scale)
			.css('top', TOOLS.brush.pos.y * scale);
		
		if(TOOLS.brush.isDrawing) {
			
			if(TOOLS.brush.pos.x >= 0 && TOOLS.brush.pos.y >= 0
			   && TOOLS.brush.pos.x < size
			   && TOOLS.brush.pos.y < size) {
				
				for(y=oy; y<oy+b_size;y++) {
					for(x=ox; x<ox+b_size;x++) {
						PATTERN[TOOLS.brush.pos.y][TOOLS.brush.pos.x] = TOOLS.brush.color;
					}
				}
				
				drawBrushInContext(ctx, ox, oy, TOOLS.brush.color);

			}
		}
		
	}*/
	
	function newColorCell() {
		
		var cell = '<div class="color-cell" color="' + TOOLS.brush.color + '" style="background-color:' + TOOLS.brush.color + ';"></div>';
		$('.frame-tools .panel[name=colorPicker] .color-grid').prepend(cell);
		
	}
	
	function hexaToArray(hexa) {
		
		var h = hexa,
			c = {r:0, v:0, b:0, a:0};
		
		if(hexa[0] = "#")
			h = hexa.substr(1);
		
		c.r = h.substr(0, 1);
		c.v = h.substr(2, 3);
		c.b = h.substr(4, 5);
		
		return c;
		
	}
	
	/*function drawBrushInContext(ct, x, y, color) {
		
		var b_s = TOOLS.brush.size;
		
		ct.beginPath();
		ct.rect(x, y, b_s, b_s);
		ct.fillStyle = color;
		ct.fill();
		
	}*/
	
	function previewPattern(pattern) {
		
		if(!TOOLS.format.showPreview) return;
		
		$('.layer-preview').css('background-image', 'url('+ canvas.toDataURL() +')');
		console.info('Preview Updated');
		
	}
	
	function onChangeParameter(e) {
		
		var $this = $(this),
			real_path = $this.parent().attr('name'),
			path = real_path.split('.'),
			value = $this.val(),
			param;
		
		var node = TOOLS;
		
		for(var i=1; i<path.length; i++)
			node = node[path[i]];
		
		
		
		if($this.parent().is('[disabled]'))
			abort();
		
		
		if(e.keyCode === 38) {
			
			value++;
			
		}else if(e.keyCode === 40) {
			
			value--;
			
		}else if($this.attr('type') === "checkbox") {
			
			value = $this.is(':checked');
			
		}else {
			
			setTimeout(function() {
				
				value = $this.val();
				var rtn = modifyParameter(real_path, value);
				if(!rtn) abort();
				$this.val(value);
				
			}, 10);
			
			return;
			
		}
		
		var rtn = modifyParameter(real_path, value);
		
		if(!rtn) abort();
		
		$this.val(value);
		
		function abort() {
			value = node;
			console.log(value)
			e.preventDefault();
			return;
		}
		
	}
	
	function modifyParameter(path, val) {
		
		var path = path.split('.');
		
		if(path[0] === 'tools') {
			
			if(path[1] === 'format') {
				
				if(path[2] === 'pattern') {
					
					switch(path[3]) {
						case 'size':
							if(isNaN(val) || val < 2) return false;
							TOOLS.format.pattern.size = val;
							updateCanvasSize();
							updateCanvasScale();
							updatePreviewScale();
							updateBrush();
							break;
						case 'scale':
							if(isNaN(val) || val < 1) return false;
							TOOLS.format.pattern.scale = val;
							updateCanvasScale();
							updateBrush();
							break;
					}
				
				}else if(path[2] === 'preview') {
					
					switch(path[3]) {
						case 'scale':
							if(isNaN(val) || val < 1) return false;
							TOOLS.format.preview.scale = val;
							updatePreviewScale();
							break;
					}
					
				}else if(path[2] === 'showEditor') {
					
					TOOLS.format.showEditor = val;
					if(val)
						$('.panel-canvas').show();
					else
						$('.panel-canvas').hide();
					
				}else if(path[2] === 'showPreview') {
					
					TOOLS.format.showPreview = val;
					if(val) {
						$('.layer-preview').css('background-image', 'url('+ canvas.toDataURL() +')').show();
					} else
						$('.layer-preview').hide();
					
				}
				
			} else if(path[1] === 'brush') {
				
				
				
				switch(path[2]) {
					case 'size':
						if(isNaN(val) || val < 1) return false;
						TOOLS.brush.size = val;
						updateBrush();
						break;
				}
				
			}
			
		}
		
		return true;
		
	}
	
	function updateCanvasSize() {
		
		var size = TOOLS.format.pattern.size;
		$canvas.attr('width', size).attr('height', size);
		PATTERN = createPatternArray(size, size);
		previewPattern(PATTERN);
		
	}
	
	function updatePreviewScale() {
		
		var s = TOOLS.format.pattern.size * TOOLS.format.preview.scale;
		$('.frame-render .layer-preview').css('background-size', s + 'px');
		
	}
	
	function updateCanvasScale() {
		
		var size = TOOLS.format.pattern.size * TOOLS.format.pattern.scale,
			sc = TOOLS.format.pattern.scale;
		$('.frame-render .panel-canvas').css('width', size + 'px').css('height', size + 'px');
		
	}
	
	function createPatternArray(X, Y) {
		var a = [];
		for(var y=0; y<Y; y++) a[y] = [];
		return a;
	}
	
	function updateBrush() {
		
		var p_sc = TOOLS.format.pattern.scale;
		
		// Update Size
		var size = TOOLS.brush.size * p_sc;
		$('.frame-render .panel-canvas .brush').css('width', size + 'px').css('height', size + 'px');
		
		// Update Color
		var color = TOOLS.brush.color;
		$('.frame-tools .panel[name=colorPicker] .color-preview').css('background-color', color);
		$brush.css('background-color', color);
		
		console.info('Brush updated');
		
	}
	
	
});