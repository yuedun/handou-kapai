function update(activeAnchor) {
          var group = activeAnchor.getParent();

          var topLeft = group.find('.topLeft')[0];
          var topRight = group.find('.topRight')[0];
          var bottomRight = group.find('.bottomRight')[0];
          var bottomLeft = group.find('.bottomLeft')[0];
          var image = group.find('.image')[0];

          var anchorX = activeAnchor.x();
          var anchorY = activeAnchor.y();

          // update anchor positions
          switch (activeAnchor.name()) {
            case 'topLeft':
              topRight.y(anchorY);
              bottomLeft.x(anchorX);
              break;
            case 'topRight':
              topLeft.y(anchorY);
              bottomRight.x(anchorX);
              break;
            case 'bottomRight':
              bottomLeft.y(anchorY);
              topRight.x(anchorX); 
              break;
            case 'bottomLeft':
              bottomRight.y(anchorY);
              topLeft.x(anchorX); 
              break;
          }

          image.setPosition(topLeft.getPosition());

          var width = topRight.x() - topLeft.x();
          var height = bottomLeft.y() - topLeft.y();
          if(width && height) {
            image.setSize({width:width, height: height});
          }
        }
        function addAnchor(group, x, y, name) {
          var stage = group.getStage();
          var layer = group.getLayer();

          var anchor = new Kinetic.Circle({
            x: x,
            y: y,
            stroke: '#666',
            fill: '#ddd',
            strokeWidth: 5,
            radius: 8,
            name: name,
            draggable: true,
            dragOnTop: false
          });

          anchor.on('dragmove', function() {
            update(this);
            layer.draw();
          });
          anchor.on('mousedown touchstart', function() {
            group.setDraggable(false);
            this.moveToTop();
          });
          anchor.on('dragend', function() {
            group.setDraggable(true);
            layer.draw();
          });
          // add hover styling
          anchor.on('mouseover', function() {
            var layer = this.getLayer();
            document.body.style.cursor = 'pointer';
            this.setStrokeWidth(4);
            layer.draw();
          });
          anchor.on('mouseout', function() {
            var layer = this.getLayer();
            document.body.style.cursor = 'default';
            this.strokeWidth(2);
            layer.draw();
          });

          group.add(anchor);
        }
        function loadImages(sources, callback) {
          var images = {};
          var loadedImages = 0;
          var numImages = 0;
          for(var src in sources) {
            numImages++;
          }
          for(var src in sources) {
            images[src] = new Image();
            images[src].crossOrigin = 'anonymous';
            images[src].onload = function() {
              if(++loadedImages >= numImages) {
                callback(images);
              }
            };
            images[src].src = sources[src];
          }
        }
        function initStage(images) {
        	var avaiWidth = $(document).width();//window.screen.width;
        	var avaiHeight = window.screen.height;
        	var canvasWidth = avaiWidth > 0 ? avaiWidth : 500;
        	var canvasHeight = avaiHeight > 300 ? 300 : avaiHeight;
            var stage = new Kinetic.Stage({
              container: 'canvasContainer',
              width: canvasWidth,
              height: canvasHeight
            });
          var darthVaderGroup = new Kinetic.Group({
            x: 0,
            y: 0,
            opacity: 1,
            draggable: false
          });
          var yodaGroup = new Kinetic.Group({
            x: 100,
            y: 110,
            opacity: 0.5,
            draggable: true
          });
          var layer = new Kinetic.Layer();

          /*
           * go ahead and add the groups
           * to the layer and the layer to the
           * stage so that the groups have knowledge
           * of its layer and stage
           */
          //layer.add(yodaGroup);
          layer.add(darthVaderGroup);
          window._layer = layer;
          stage.add(layer);

          //var widthTmp = images.darthVader.width > canvasWidth ? 0 : (canvasWidth / 2) - (images.darthVader.width / 2);
          
          // darth vader
          var darthVaderImg = new Kinetic.Image({
            x: 0,
            y: 0,
            image: images.darthVader,
            height: canvasHeight,
            name: 'image'
          });

          darthVaderGroup.add(darthVaderImg);
          /* addAnchor(darthVaderGroup, 0, 0, 'topLeft');
          addAnchor(darthVaderGroup, 200, 0, 'topRight');
          addAnchor(darthVaderGroup, 200, 138, 'bottomRight');
          addAnchor(darthVaderGroup, 0, 138, 'bottomLeft'); */

          darthVaderGroup.on('dragstart', function() {
            this.moveToTop();
          });
          // yoda
          var yodaImg = new Kinetic.Image({
            x: 0,
            y: 0,
            image: images.yoda,
            width: 100,
            height: 80,
            name: 'image'
          });

//          yodaGroup.add(yodaImg);
//          addAnchor(yodaGroup, 0, 0, 'topLeft');
//          addAnchor(yodaGroup, 93, 0, 'topRight');
//          addAnchor(yodaGroup, 93, 104, 'bottomRight');
//          addAnchor(yodaGroup, 0, 104, 'bottomLeft');
//
//          yodaGroup.on('dragstart', function() {
//            this.moveToTop();
//          });
          
          window._yodaGroup = yodaGroup;

          createText(layer);

          stage.draw();
          

          window._stage = stage;
        }
        
        
        window.ImageGroup = [];
        
window.addPicture = function(path) {
	var _image = new Image();
	_image.src = path;
	var yodaGroup = new Kinetic.Group({
        x: 200,
        y: 110,
        opacity: 0.5,
        draggable: true
      });
	var yodaImg = new Kinetic.Image({
        x: 0,
        y: 0,
        image: _image,
        width: 100,
        height: 100,
        name: 'image'
      });
	 yodaGroup.add(yodaImg);
	 addAnchor(yodaGroup, 0, 0, 'topLeft');
     addAnchor(yodaGroup, 100, 0, 'topRight');
     addAnchor(yodaGroup, 100, 100, 'bottomRight');
     addAnchor(yodaGroup, 0, 100, 'bottomLeft');
     yodaGroup.on('dragstart', function() {
        this.moveToTop();
     });
     window._layer.add(yodaGroup);
     window.ImageGroup.push(yodaGroup);
	 window._stage.draw();
	 yodaGroup.moveToTop();
	 window._layer.draw();
	 
}        