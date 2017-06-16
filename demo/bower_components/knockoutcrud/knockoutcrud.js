/**
 * knockoutcrud
 *
 * A knockoutjs extension to crud items in Observables and Observable Arrays
 * Inspired by "A Simple Editor Pattern for Knockout.js" by Ryan Niemeyer (http://www.knockmeout.net/2013/01/simple-editor-pattern-knockout-js.html).  
 * Thank you Ryan :)
 */
;
(function(factory) {
	//CommonJS
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		factory(require("knockout"), exports);
		//AMD
	} else if (typeof define === "function" && define.amd) {
		define(["knockout", "exports"], factory);
		//normal script tag
	} else {
		factory(ko);
	}
}(function(ko) {
	/**
	 * ko.observable.fn.focusable
	 *
	 * A Knockout extension for programatically focusing an input
	 * @example var example = ko.observable().focusable(true);  
	 *          then later example.focused(false);
	 * @see Ryan Niemeyer devLink 2013 Knockout Tips and Tricks (section on extensions - setting focus to an element)
	 *      http://www.knockmeout.net/2013/09/devlink-2013-ko-tips.html
	 * @param {booleen}
	 * @return {this} for chainability
	 */
	ko.observable.fn.focusable = function(value) {
		"use strict";
		this.focused = ko.observable(value);
		return this;
	};

	/**
	 * Knockout Crud 
	 *
	 * A Knockout extension to crud items in a Observables and Observable Arrays
	 * @param {object} params.uniqueIdentifier is the key that stores a unique value to identify the instance
	 *                 params.constructor The constructor for the Observable Array
	 * @return {this} for chainability
	 */
	ko.observableArray.fn.crud = function(params) {
		"use strict";
		// Definitions
		if (!params) {
			console.log("'{ constructor: ConstructorName}' required when calling crud()");
		}
		if (!params.nameOfUpdateFunction) {
			params.nameOfUpdateFunction = "update";
		}

		// Helper Methods
		var cleanItem = function(item) {
			item = ko.toJS(item);
			delete item[params.nameOfUpdateFunction]; // remove method
			return item;
		};

		// hold a copy of the original collection for running through upon cancel
		this.beforeEdit = ko.observable();

		// park changes in temporary files for cancelling an edit of a collection 
		this.justRemoved = ko.observableArray();
		this.justAdded = ko.observableArray();

		/**
		 * Compare to the beforeEdit to obtain the difference with the current observableArray.  Useful for updating the server following completion of edits to an observableArray.
		 * @return {array} two keys of 'previous' and 'value'
		 */
		this.justUpdated = function(){
			var originalItems = ko.toJS(this.beforeEdit.peek());
			if (originalItems) {
				var edited = ko.observableArray(this.slice(0));
				edited.removeAll(this.justAdded.peek());
				var editedClean = ko.toJS(edited);

				if (editedClean.length) {
					var toReturn = [];
					ko.utils.arrayForEach(editedClean, function(item){
						// get original item
						var originalItem = ko.utils.arrayFirst(originalItems, function(original){
							return original[params.uniqueIdentifier] === item[params.uniqueIdentifier];
						});

						// record if different
						if (ko.toJSON(item) !== ko.toJSON(originalItem)) {
							delete originalItem[params.nameOfUpdateFunction];
							delete item[params.nameOfUpdateFunction];
							toReturn.push({
								previous: originalItem,
								value: item
							});
						}
					});
					return toReturn;
				}
			}
			return null;
		};


		// Add new data to an Observable Array with an array or object
		// Based upon Knockout.js Performance Gotcha #2 - Manipulating observableArrays
		// Reference: http://www.knockmeout.net/2012/04/knockoutjs-performance-gotcha.html
		this.insert = function(valuesToPush, Constructor) {

			// Definitions
			var newItems;
			if (!Constructor) {
				var Constructor = params.constructor;
			}

			if (Object.prototype.toString.call(valuesToPush) === "[object Array]") { // if an array
				newItems = ko.utils.arrayMap(valuesToPush, function(item) {
					return new Constructor(item);
				});
				this.push.apply(this, newItems); // push all in at once 
			} else {
				// assume an object
				newItems = new Constructor(valuesToPush);
				this.push(newItems);
			}
			return newItems; // return a copy for further modification of the new item
		};


		/**
		 * upsert
		 *
		 * Add or Update an Observable Array.  Used when you do not know if data received is a new instance or update of an existing item.  This method requires an update function on each instance of an Observable Array to save.
		 * @uses params.uniqueIdentifier for discovering if the object already exists, otherwise new items are created using the insert method
		 *        Note that 'this()' refers to the Observable Array
		 * @param {object|array} valuesToPushOrUpdate 
		 */
		this.upsert = function(valuesToPushOrUpdate) {
			// Definitions
			var cleanValues = ko.toJS(valuesToPushOrUpdate);

			if (Object.prototype.toString.call(cleanValues) === "[object Array]") { // if an array
				var self = this;
				ko.utils.arrayForEach(cleanValues, function(cleanValue) {
					var id = cleanValue[params.uniqueIdentifier];
					var index;

					var exists = ko.utils.arrayFirst(self.peek(), function(item, i) {
						index = i;
						return item[params.uniqueIdentifier].peek() === id;
					});

					// update
					if (exists) {
						var old = ko.toJS(exists);
						exists[params.nameOfUpdateFunction](cleanValue);
						if (ko.toJSON(old) !== ko.toJSON(exists)) {
							self.notifySubscribers([{
								index: index,
								previous: cleanItem(old),
								status: "updated",
								value: exists
							}], "arrayChange");
						}

					} else {
						// add new
						self.insert(cleanValue);
					}

				});

			} else { // assume an object
				var id = cleanValues[params.uniqueIdentifier];
				var index;

				var exists = ko.utils.arrayFirst(this.peek(), function(item, i) {
					index = i;
					return item[params.uniqueIdentifier].peek() === id;
				});

				// update
				if (exists) {
					var old = ko.toJS(exists);
					exists[params.nameOfUpdateFunction](cleanValues);
					if (ko.toJSON(old) !== ko.toJSON(exists)) {
						this.notifySubscribers([{
							index: index,
							previous: cleanItem(old),
							status: "updated",
							value: cleanItem(exists)
						}], "arrayChange");
					}
				} else {
					// add new
					this.insert(cleanValues);
				}

			}
		};


		/**
		 * deleteItem
		 *
		 * Remove an item from an edited collection
		 * @param {object}
		 */
		this.deleteItem = function(item) {
			this.remove(item);

			// Definitions
			var removedItem = ko.toJS(item);
			var toRemove;

			// Remove from justAdded if it exists there to keep justAdded useful for cancelling a collection edit
			if (this.justAdded().length) {

				// if unique identifier specified as an option
				if (params.uniqueIdentifier) {
					toRemove = ko.utils.arrayFilter(this.justAdded(), function(justAddedItem) {
						// compare the values of justAdded to that of Removed Item.  If same we need to delete the removedItem from justAdded
						if (justAddedItem[params.uniqueIdentifier] === removedItem[params.uniqueIdentifier]) {
							return removedItem;
						}
					});
				} else {

					// check the property value of each property
					toRemove = ko.utils.arrayFilter(this.justAdded(), function(justAddedItem) {
						// compare the values of justAdded to that of Removed Item.  If same we need to delete the removedItem from justAdded
						var current = ko.unwrap(justAddedItem);
						var identicalObjects = true;

						for (var property in current) {
							if (current[property] !== removedItem[property]) {
								identicalObjects = false;
							}
						}
						if (identicalObjects) {
							return removedItem;
						}
					});
				}

				if (toRemove.length) {
					this.justAdded.removeAll(toRemove);
				} else {

					// add item to park for unwind upon Cancel
					this.justRemoved.push(item);
				}
			} else {

				// add item to park for unwind upon Cancel
				this.justRemoved.push(item);
			}

		}.bind(this);


		/**
		 * Cancel the editing of a collection
		 * 
		 * Revert the collection back to the way it was when editing started 
		 */
		this.cancelEdit = function() {
			// To revert the collection back to its original: 
			// 1) remove what was added
			// 2) add back the deleted items
			// 3) replace the edited items with the original

			// Definitions
			var originalItems = this.beforeEdit.peek();

			if (originalItems) { // don't process an empty array

				// 1) remove recently added
				if (this.justAdded().length) {
					this.removeAll(this.justAdded());
					this.justAdded.removeAll(); // empty the parked adds
				}

				// 2) add recently deleted items 
				// Note: do this because there is no access to the constructor 
				if (this.justRemoved().length) {
					for (var i = 0, len = this.justRemoved().length; i < len; i++) {
						var current = this.justRemoved()[i];
						this.unshift(current); // don't worry about order as we will overwrite in the next step
					}
					this.justRemoved.removeAll(); // empty the parked removes
				}

				// 3) replace each object with its original
				for (var j = 0; j < originalItems.length; j++) {
					var currentItem = originalItems[j]; // pre edited object

					// update collection
					this()[j][params.nameOfUpdateFunction](currentItem);
				}
			}
		};


		/**
		 * Provide a separate observable for adding an item to an array
		 * @type {observable}
		 */
		this.itemForAdding = ko.observable();


		/**
		 * Editing an object within an array of objects
		 *
		 * hold the currently selected item when editing (keeps a record of what "this" is).
		When finished editing, use the update function.
		 * @example yourCollection.selectedItem.update(newData)
		 * @link http://jsfiddle.net/rniemeyer/MQVr3/
		 */

		// retain a copy of 'this' for accessing the update method later
		this.selectedItem = ko.observable();

		// Edit copy
		this.itemForEditing = ko.observable();

		//populate the selected item and make a copy for editing
		this.selectItem = function(item) {
			this.selectedItem(item);
			this.itemForEditing(new params.constructor(ko.toJS(item)));
		}.bind(this);

		this.acceptItem = function() {
			var selected = this.selectedItem(); // obtain "this"
			var originalItem = cleanItem(this.selectedItem.peek());
			var edited = cleanItem(this.itemForEditing.peek()); //clean copy of edited item

			//apply updates from the edited item to the selected item
			selected[params.nameOfUpdateFunction](edited);

			// Publish change
			if (ko.toJSON(originalItem) !== ko.toJSON(edited)) {
				this.notifySubscribers([{
					index: this.indexOf(selected),
					previous: originalItem,
					status: "updated",
					value: selected
				}], "arrayChange");
			}

			//clear
			this.selectedItem(null);
			this.itemForEditing(null);
		}.bind(this);

		// throw away the edited item and clear the selected observables
		this.revertItem = function() {
			this.selectedItem(null);
			this.itemForEditing(null);
		}.bind(this);

		this.removeItem = function() {
			var selected = this.selectedItem(); // obtain "this"
			var id = ko.unwrap(selected[params.uniqueIdentifier]);
			var exists = ko.utils.arrayFirst(this.peek(), function(item) {
				return ko.unwrap(item[params.uniqueIdentifier]) === id;
			});
			this.remove(exists);

			//clear selected item
			this.selectedItem(null);
			this.itemForEditing(null);
		}.bind(this);

		return this;
	};

})); // close module loader