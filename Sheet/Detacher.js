(function(Sheet) {
	var u = undefined;

	/**
	 * Detaches DOM elements from a parent to keep the DOM fast. Can be used with hundreds of thousands r even millions of
	 * DOM elements to simulate a scrolling like behaviour.
	 * @param {HTMLElement} parent
	 * @param {Number} maximumVisible
	 * @property {Array} detachedAbove
	 * @property {Array} detachedBelow
	 * @property {HTMLElement} parent
	 * @property {Boolean} aboveChanged
	 * @property {Boolean} belowChanged
	 * @constructor
	 * @memberOf Sheet
	 */
	function Detacher(parent, maximumVisible) {
		this.parent = parent;
		this.maximumVisible = maximumVisible;

		this.detachedAbove = [];
		this.detachedBelow = [];
		this.aboveChanged = false;
		this.belowChanged = false;
		this.hasInitialDetach = false;
	}

	/**
	 *
	 * @param {Detacher} _this
	 * @param {Number} maxIndex
	 */
	function initialDetach(_this, maxIndex) {
		var parent = _this.parent,
			children = parent.children,
			aboveCount = _this.detachedAbove.length,
			i;

		//if there are too many in above count, return
		if (maxIndex < aboveCount) return;

		while ((i = (aboveCount + (children.length - 1))) > maxIndex) {
			_this.detachedBelow.unshift(parent.lastChild);
			parent.removeChild(parent.lastChild);
		}
	}

	Detacher.prototype = {
		/**
		 * Ideally used when scrolling down.  Detaches anything before a given index at the above of the parent
		 * @param maxIndex
		 * @returns {Detacher}
		 */
		detachAboveBefore: function(maxIndex) {
			var detachable,
				parent = this.parent,
				detachables = parent.children,
				detachedAbove = this.detachedAbove;

			this.aboveChanged = false;

			while (detachedAbove.length - 1 < maxIndex) {
				//we will always detach the first element
				detachable = detachables[1];

				//if the first element doesn't exist, then stop detaching
				if (detachable === u) {
					break;
				}

				detachedAbove.push(detachable);
				parent.removeChild(detachable);

				this.aboveChanged = true;
			}

			return this;
		},

		/**
		 * Ideally used when scrolling up.  Detaches anything after a given index virtually below the parent
		 * @param minIndex
		 * @returns {Detacher}
		 */
		detachBelowAfter: function(minIndex) {
			if (!this.hasInitialDetach) {
				this.hasInitialDetach = true;
				initialDetach(this, minIndex);
			}

			var detachable,
				parent = this.parent,
				detachedAboveCount = this.detachedAbove.length,
				children = parent.children;

			this.belowChanged = false;


			while (detachedAboveCount + children.length > minIndex) {
				this.detachedBelow.unshift(detachable = parent.lastChild);
				parent.removeChild(detachable);
				this.belowChanged = true;
			}

			return this;
		},


		/**
		 * Ideally used when scrolling up.  Attaches anything detached after a given index at the above of the parent
		 * @param minIndex
		 * @returns {Detacher}
		 */
		attachAboveAfter: function(minIndex) {
			var parent = this.parent,
				frag = document.createDocumentFragment(),
				detached,
				detachedAbove = this.detachedAbove,
				i;

			this.aboveChanged = false;

			while ((i = detachedAbove.length - 1) >= minIndex) {
				//attach it
				detached = detachedAbove.pop();
				frag.insertBefore(detached, frag.firstChild);

				this.aboveChanged = true;
			}

			if (this.aboveChanged) {
				parent.insertBefore(frag, parent.children[1]);
			}

			return this;
		},

		/**
		 * Ideally used when scrolling down.  Attaches anything detached before a given index virtually below the parent
		 * @param maxIndex
		 * @returns {Detacher}
		 */
		attachBelowBefore: function(maxIndex) {
			if (!this.hasInitialDetach) {
				this.hasInitialDetach = true;
				initialDetach(this, maxIndex);
			}

			var detached,
				parent = this.parent,
				detachedBelow = this.detachedBelow,
				frag = document.createDocumentFragment(),
				fragChildren = frag.children,
				offset = this.detachedAbove.length + parent.children.length,
				i;

			this.belowChanged = false;
			while ((i = offset + (fragChildren.length - 1)) < maxIndex && this.detachedBelow.length > 0) {
				if (detachedBelow.length < 1) break;
				//attach it
				detached = detachedBelow.shift();
				frag.appendChild(detached);
				this.belowChanged = true;
			}

			//attach point is going to be at the end of the parent
			if (this.belowChanged) {
				parent.appendChild(frag);
			}

			return this;
		},
		isAboveActive: function() {
			return this.detachedAbove.length > 0
		},
		isBelowActive: function() {
			return this.detachedBelow.length > 0
		}
	};

	Sheet.Detacher = Detacher;
})(Sheet);