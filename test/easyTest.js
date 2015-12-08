/**
 * Created by admin on 2015/10/14.
 */
Promise.prototype.then = function(resolve, reject) {
	var next = this._next || (this._next = Promise());
	var status = this.status;
	var x;
	if ('pending' === status) {
		isFn(resolve) && this._resolves.push(resolve);
		isFn(reject) && this._rejects.push(reject);
		return next;
	}
	if ('resolved' === status) {
		if (!isFn(resolve)) {
			next.resolve(resolve);
		} else {
			try {
				x = resolve(this.value);
				resolveX(next, x);
			} catch (e) {
				this.reject(e);
			}
		}
		return next;
	}
	if ('rejected' === status) {
		if (!isFn(reject)) {
			next.reject(reject);
		} else {
			try {
				x = reject(this.reason);
				resolveX(next, x);
			} catch (e) {
				this.reject(e);
			}
		}
		return next;
	}
};