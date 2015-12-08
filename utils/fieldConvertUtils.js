module.exports = {
	convert: function(obj) {
		
		if(typeof obj !== 'array' || typeof obj !== 'object') {
			return;
		}
		
		if(typeof obj === 'array') {
			for(var i = 0; i < obj.length; i++) {
				this.convert(obj[i]);
			}
		}
		
		for(var attr in obj) {
			var attrs = attr.split('_');
			var tmpAttr = null;
			for(var j = 0; j < attrs.length; j++) {
				if(attrs[j] != null && attrs[j] !== '') {
					if(j === 0) {
						tmpAttr = attrs[j];
					} else {
						tmpAttr = tmpAttr + attrs[j].substr(0, 1).toUpperCase() + attrs[j].substr(1);
					}
				}
			}
			obj[tmpAttr] = obj.attr;
			delete obj.attr;
		}
		return obj;
	}
};