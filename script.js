$(function() {
	
	
	
	
	
	
	
	
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		$canvas = $('.frame-render .panel-canvas canvas'),
		$brush = $('.frame-render .panel-canvas .brush'),
		$colorPicker;
	
	var TOOLS = {
		
		format: {
			
			preview: {
				scale: 1
			},
			pattern: {
				size: 10,
				scale: 10
			},
			showEditor : true
			
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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	$canvas.on('mousemove', draw);
	
	$canvas.on('mouseleave', function(e) {
		$brush.hide();
	});
	
	$canvas.on('mouseenter', function(e) {
		$brush.show();
	});
	
	$('.frame-render').on('mousedown', function(e) {
		TOOLS.brush.isDrawing = true;
		draw(e);
	});
	
	$('.frame-render').on('mouseup', function(e) {
		TOOLS.brush.isDrawing = false;
		previewPattern(PATTERN);
	});
	
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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function draw(e){
		
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
		
	}
	
	function newColorCell() {
		
		var cell = '<div class="color-cell" color="' + TOOLS.brush.color + '" style="background-color:' + TOOLS.brush.color + ';"></div>';
		$('.frame-tools .panel[name=colorPicker] .color-grid').prepend(cell);
		
	}
	
	function drawBrushInContext(ct, x, y, color) {
		
		var b_s = TOOLS.brush.size;
		
		ct.beginPath();
		ct.rect(x, y, b_s, b_s);
		ct.fillStyle = color;
		ct.fill();
		
	}
	
	function previewPattern(pattern) {
		
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
	
//	function changeBrushColor(color) {
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