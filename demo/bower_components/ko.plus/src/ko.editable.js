﻿/*global ko:false*/

function toEditable(observable, getRollbackValue) {
	var rollbackValues = [],
		cancelledValue;

	getRollbackValue = getRollbackValue || function (observable) { return observable(); };

	function canEdit() {
		return !observable.isEditing() && (!observable.isEditable || ko.unwrap(observable.isEditable()));
	}

	//a flag to indicate if the field is being edited
	observable.isEditing = ko.observable(false);

	//start an edit
	observable.beginEdit = function () {
		if (!canEdit()) { return; }
		cancelledValue = undefined;

		rollbackValues.push(getRollbackValue(observable));

		observable.isEditing(true);
	};

	//end (commit) an edit
	observable.endEdit = function () {
		if (!observable.isEditing()) { return; }

		observable.isEditing(false);
	};

	//cancel and roll-back an edit
	observable.cancelEdit = function () {
		if (!observable.isEditing() || !rollbackValues.length) { return; }

		cancelledValue = getRollbackValue(observable);

		observable(rollbackValues.pop());

		observable.isEditing(false);
	};

	//undo a set of cancelled changes
	observable.undoCancel = function () {
		if (cancelledValue === undefined) { return; }

		var value = cancelledValue; //grab value here as beginEdit will clear it
		observable.beginEdit();
		observable(value);
		cancelledValue = undefined;
	};

	//roll-back to historical committed values
	observable.rollback = function () {
		if (rollbackValues.length) {
			cancelledValue = undefined;
			observable(rollbackValues.pop());
		}
	};

	observable.isDirty = ko.computed(function () {
		return observable.isEditing() &&
			JSON.stringify(rollbackValues[rollbackValues.length-1]) !== JSON.stringify(ko.unwrap(observable));
	}).extend({ throttle: 1});

	return observable;
}

ko.editable = function (initial) {
	return toEditable(ko.observable(initial));
};

ko.editableArray = function (initial) {
	return toEditable(ko.observableArray(initial || []), function (observable) {
		return observable.slice();
	});
};

var ignoredProperties = {
	isDirty: true,
	beginEdit: true,
	cancelEdit: true,
	undoCancel: true,
	endEdit: true,
	rollback: true,
	isEditing: true
};

var forEachEditableProperty = function (target, action) {
	for (var prop in target) {
		if (!target.hasOwnProperty(prop) || ignoredProperties[prop]) {
			continue;
		}
		var value = target[prop];

		//direct editables
		if (value && value.isEditing) {
			action(value);
		}

		var unwrappedValue = ko.unwrap(value);

		//editables in arrays
		if (unwrappedValue && unwrappedValue.length && typeof unwrappedValue !== 'string') {
			for (var i = 0; i < unwrappedValue.length; i++) {
				if (unwrappedValue[i] && unwrappedValue[i].isEditing) {
					action(unwrappedValue[i]);
				}
			}
		}
	}
};

ko.editable.makeEditable = function (target) {
	if (!target) {
		throw 'Target must be specified';
	}

	target.isEditing = ko.observable(false);

	target.beginEdit = function () {
		if (!target.isEditable || target.isEditable()) {
			forEachEditableProperty(target, function (prop) { prop.beginEdit(); });
			target.isEditing(true);
		}
	};

	target.endEdit = function () {
		forEachEditableProperty(target, function (prop) { prop.endEdit(); });
		target.isEditing(false);
	};

	target.cancelEdit = function () {
		forEachEditableProperty(target, function (prop) { prop.cancelEdit(); });
		target.isEditing(false);
	};

	target.rollback = function () {
		forEachEditableProperty(target, function (prop) { prop.rollback(); });
	};

	target.undoCancel = function () {
		forEachEditableProperty(target, function (prop) { prop.undoCancel(); });
		target.beginEdit();
	};

	target.isDirty = ko.computed(function () {
		var isDirty = false;
		forEachEditableProperty(target, function (property) {
			isDirty = ko.unwrap(property.isDirty) || isDirty;
		});
		return isDirty;
	}).extend({ throttle: 1 });

	return target;
};

ko.extenders.editable = function(observable) {
	return toEditable(observable);
};