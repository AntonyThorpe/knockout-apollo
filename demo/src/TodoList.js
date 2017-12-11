var TodoList = function(data) {
	data = data || {}; // not null check
	this._id = ko.observable();
	this.task = ko.observable();
	this.completed = ko.observable();

	//populate our model with the initial data
	this.update(data);

	// hide behind an existing observable to remove from later analysis
	this._id.isSelected = ko.observable(false);
};

ko.utils.extend(TodoList.prototype, {
	update: function(data) {
		this._id(data._id || (Math.random()).toString());
		this.task(data.task || "Task");
		this.completed(data.completed || false);
	}
});