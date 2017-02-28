module.exports = tarmac.GameEntity.extend({
	ease: 0.42,
	snap: 4,
	scalesnap: 0.04,
	adjust: function(t) {
		if (this.seekx != null) {
			this.x += this.seekx * this.ease - this.x * this.ease;
			if(Math.abs(this.seekx - this.x) < this.snap) {
				this.x = this.seekx;
				this.seekx = null;
				if (!this.seeky) {
					this.onMoveDone && this.onMoveDone();
				}
			}
		}
		if (this.seeky != null) {
			this.y += this.seeky * this.ease - this.y * this.ease;
			if(Math.abs(this.seeky - this.y) < this.snap) {
				this.y = this.seeky;
				this.seeky = null;
				if (!this.seekx) {
					this.onMoveDone && this.onMoveDone();
				}
			}
		}
		if (this.seekscale != null) {
			this.scale += this.seekscale * this.ease - this.scale * this.ease;
			if(Math.abs(this.seekscale - this.scale) < this.scalesnap) {
				this.scale = this.seekscale;
				this.seekscale = null;
				this.onScaleDone && this.onScaleDone();
			}
		}
	}
});
