// Presentational Component
ko.components.register('preview', {
	template: '<input type="text" data-bind="textInput: task, hasFocus: true" class="todo-input"/>\
                <label>\
                <input type="checkbox" data-bind="checked: completed">Complete\
                </label>'
});

ko.components.register('add-edit', {
	template: ' <h2 data-bind="text: type"></h2>\
            <preview params="task: task, completed: completed"></preview>\
            <button data-bind="click: save" class="button">Save</button>\
            <button data-bind="click: cancel" class="button">Cancel</button>'
});

ko.components.register('content-panel', {
	template: '<div class="content-panel">\
                    <div data-bind="foreach: todoList">\
                        <div class="note" data-bind="click: $parent.todoList.selectItem, css: completed() ? \'complete\' : \'incomplete\'">\
                            <div>\
                                <span data-bind="click: $parent.todoList.deleteItem, clickBubble: false" class="remove">X</span>\
                            </div>\
                            <div data-bind="click: $parent.todoList.selectItem">\
                                <p><span data-bind="text: task"></span></p>\
                                <p data-bind="if: completed"><span>Completed</span></p>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
});

ko.components.register('tasks-list', {
	template: '<div class="content-panel">\
                <table>\
                    <thead>\
                        <tr>\
                            <th>index</th>\
                            <th>_id</th>\
                            <th>Task</th>\
                            <th>Completed</th>\
                            <th>isSelected</th>\
                        </tr>\
                    </thead>\
                    <tbody data-bind="foreach: todoList">\
                        <tr>\
                            <td data-bind="text: $index"></td>\
                            <td data-bind="text: _id"></td>\
                            <td data-bind="text: task"></td>\
                            <td data-bind="text: completed"></td>\
                            <td data-bind="text: _id.isSelected"></td>\
                        </tr>\
                    </tbody>\
                </table>\
            </div>'
});