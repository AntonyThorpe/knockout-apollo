describe("Adding and retrieving items from Todo List: ", function() {
	var todoList = ko.observableArray().crud({
		constructor: TodoList
	});

	beforeEach(function() {
		todoList.removeAll();
	});

	it("Adding a single item to list should have length of one", function() {
		todoList.insert({
			task: "blastoff",
			completed: true
		});
		expect(todoList().length).toEqual(1);
	});

	it("Adding a single item in an array to list should have length of one", function() {
		todoList.insert([{
			task: "blastoff",
			completed: true
		}]);
		expect(todoList().length).toEqual(1);
	});

	it("Adding two items to list should have a length of two", function() {
		todoList.insert([{
			task: "counting down",
			completed: true
		}, {
			task: "blastoff"
		}]);
		expect(todoList().length).toEqual(2);
	});
});


describe("Removing Item from Todo List: ", function() {
	var todoList = ko.observableArray().crud({
		constructor: TodoList
	});
	var todoListOther = ko.observableArray().crud({
		constructor: TodoList
	});

	beforeEach(function() {
		todoList.removeAll();
		todoListOther.removeAll();
		todoList.insert([{
			task: "start your engines",
			completed: true
		}, {
			task: "counting down"
		}, {
			task: "blastoff"
		}]);
	});


	it("Removing item from list should reduce its size", function() {
		var instance = todoList()[1];
		todoList.deleteItem(instance);
		expect(todoList().length).toEqual(2);
	});

	it("Removing an item that doesn't exist from a todo should not change list length", function() {
		var unrelatedInstance = todoListOther.insert({
			task: "Crash"
		});
		todoList.deleteItem(unrelatedInstance);
		expect(todoList().length).toEqual(3);
	});
});


describe("Upserting items: ", function() {
	var todoList = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	});

	beforeEach(function() {
		todoList.removeAll();
		todoList.insert([{
			
			task: "start your engines",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			task: "blastoff"
		}]);
	});

	it("Adding a new items should increase TodoList length", function() {
		todoList.upsert({
			task: "we have lift off"
		});
		expect(todoList().length).toEqual(4);
		var findInstance = ko.utils.arrayFilter(todoList(), function(item) {
			return item.task() === "we have lift off";
		});
		expect(findInstance).not.toBeNull();
		expect(findInstance[0].task()).toBe("we have lift off");
	});

	it("Editing an item should not increase todoList length and update an item", function() {
		todoList.upsert({
			_id: "123",
			task: "counting down 123"
		});
		expect(todoList()[1].task()).toBe("counting down 123");
		expect(todoList().length).toEqual(3);
	});

	it("Editing an item, by passing in an array, should not increase todoList length and update an item", function() {
		todoList.upsert([{
			_id: "123",
			task: "counting down 123"
		}]);
		expect(todoList()[1].task()).toBe("counting down 123");
		expect(todoList().length).toEqual(3);
	});

	it("Adding an item, with a new id, should increase todoList length and create an item", function() {
		todoList.upsert({
			_id: "777",
			task: "Brand new id"
		});
		expect(todoList()[3].task()).toBe("Brand new id");
		expect(todoList().length).toEqual(4);
	});

	it("Adding an item, with a new id and passed in through an array, should increase todoList length and create a new item", function() {
		todoList.upsert([{
			_id: "777",
			task: "Brand new id"
		}]);
		expect(todoList()[3].task()).toBe("Brand new id");
		expect(todoList().length).toEqual(4);
	});

	it("Adding one item and editing another item should increase todoList length and update an item", function() {
		todoList.upsert([{
			task: "we have lift off"
		}, {
			_id: "123",
			task: "counting down 123"
		}]);
		expect(todoList().length).toEqual(4);
		expect(todoList()[1].task()).toBe("counting down 123");
	});
});

describe("justUpdated: ", function(){
	it("Changes to an observableArray with return a previous and current value", function(){
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		
		todoList.insert([{
			_id: "123",
			task: "start your engines",
			completed: true
		}, {
			_id: "456",
			task: "counting down"
		}, {
			_id: "789",
			task: "blastoff"
		}]);

		// Setup for editing
		todoList.beforeEdit(ko.toJS(todoList()));

		// Add an item
		var newItem = todoList.insert([{
			_id: "678",
			task: "counting where ever"
		}]);
		todoList.justAdded(newItem);

		// Make two changes
		todoList()[0].completed(false);
		todoList()[2].task("blastoff and away");

		// Remove an item
		todoList.deleteItem(todoList()[1]);

		var justUpdated = todoList.justUpdated();
		expect(justUpdated.length).toEqual(2);
		expect(justUpdated[0].previous).toEqual({
			_id: "123",
			task: "start your engines",
			completed: true
		});
		expect(justUpdated[0].value).toEqual({
			_id: "123",
			task: "start your engines",
			completed: false
		});
		expect(justUpdated[1].previous).toEqual(
			{
				_id: "789",
				task: "blastoff",
				completed: false
			}
		);
		expect(justUpdated[1].value).toEqual(
			{
				_id: "789",
				task: "blastoff and away",
				completed: false
			}
		);
	});
});

describe("Publication of updates: ", function() {

	it("Upsert that changes an ites are published", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "123",
			task: "counting down"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "123",
			task: "counting down 123"
		});
		expect(changes[0].value.task).toBe("counting down 123");
	});

	it("Where no changes in an object, nothing is published", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "1234",
			task: "ignition"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "1234",
			task: "ignition"
		});
		expect(changes).toBeUndefined();
	});

	it("Upsert changes within an array return the correct index number and the previous object", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		}]);
		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "123",
			task: "counting down 123"
		});
		expect(changes[0].index).toEqual(1);
		expect(changes[0].previous.task).toBe("counting down");
	});

	it("Where no changes in an array, nothing is published", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "111",
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "111",
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		});
		expect(changes).toBeUndefined();
	});

	it("Where an edit to an item is accepted, the change is published", function(){
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "111",
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.selectItem(todoList()[1]);
		todoList.itemForEditing().task("counting up");
		todoList.itemForEditing().completed(true);

		todoList.acceptItem();
		expect(changes[0].index).toEqual(1);
		expect(changes[0].previous.task).toBe("counting down");
		expect(changes[0].previous.completed).toBe(false);
		expect(changes[0].value.task()).toBe("counting up");
		expect(changes[0].value.completed()).toBe(true);
	});

	it("Where an edit to an item is accepted and nothing is altered, then nothing is published", function(){
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "111",
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.selectItem(todoList()[1]);
		todoList.itemForEditing().task("counting down");
		todoList.itemForEditing().completed(false);

		todoList.acceptItem();
		expect(changes).toBeUndefined();
	});
});