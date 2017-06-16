function TodoViewModel() {
	var self = this;
	var data = [{
		_id: "123",
		task: "start engines",
		completed: true
	}, {
		_id: "124",
		task: "check wings",
		completed: false
	}, {
		_id: "125",
		task: "test flaps",
		completed: false
	}];

	self.todoList = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	});


	//initialise with a few Todos
	self.todoList.insert(data);

	self.prepareCollectionEdit = function(data) {
		self.todoList.beforeEdit(ko.toJS(self.todoList()));
	};

	self.addTask = function() {
		var toSave = {};
		// save new items
		var newInstance = self.todoList.insert(toSave);
		self.todoList.justAdded.push(newInstance);

		var index = self.todoList.indexOf(newInstance);
		self.todoList()[index]._id.isSelected(true);
	};

	self.save = function() {
		self.todoList.justRemoved.removeAll(); // empty the parked removed 
		self.todoList.justAdded.removeAll(); // empty the parked adds
		self.todoList.beforeEdit(null);
	};

	self.cancel = function() {
		// return model to cache version
		self.todoList.cancelEdit();
		self.todoList.beforeEdit(null);
	};

	self.editItem = function(item) {
		item._id.isSelected(true);
		self.todoList.selectItem(item);
	};


	// Second example
	self.todoList2 = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	});

	//initialise with a few Todos
	self.todoList2.insert(data);

	self.prepareCollectionEdit2 = function(data) {
		self.todoList2.beforeEdit(ko.toJS(self.todoList()));
	};

	self.addTask2 = function() {
		var toSave = {};
		// save new items
		var newInstance = self.todoList2.insert(toSave);
		self.todoList2.justAdded.push(newInstance);

		var index = self.todoList2.indexOf(newInstance);
		self.todoList2()[index]._id.isSelected(true);
	};

	self.save2 = function() {
		self.todoList2.justRemoved.removeAll(); // empty the parked removed 
		self.todoList2.justAdded.removeAll(); // empty the parked adds
		self.todoList2.beforeEdit(null);
	};

	self.cancel2 = function() {
		// return model to cache version
		self.todoList2.cancelEdit();
		self.todoList2.beforeEdit(null);
	};


	// Third example
	self.todoList3 = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	});

	//initialise with a few Todos
	self.todoList3.insert(data);

	self.addTask3 = function() {
		self.todoList3.itemForAdding(new TodoList({}));
	};

	self.saveAdd = function(data) {
		self.todoList3.insert(ko.toJS(data));
		self.todoList3.itemForAdding(null);
	};

	self.cancelAdd = function() {
		self.todoList3.itemForAdding(null);
	};

	self.todoList4 = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	});

	//initialise with a few Todos
	self.todoList4.insert(data);

	self.addTask4 = function() {
		self.todoList4.itemForAdding(new TodoList({}));
	};

	self.saveAdd4 = function(data) {
		self.todoList4.insert(ko.toJS(data));
		self.todoList4.itemForAdding(null);
	};

	self.cancelAdd4 = function() {
		self.todoList4.itemForAdding(null);
	};

};


ko.applyBindings(new TodoViewModel());