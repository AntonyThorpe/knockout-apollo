import { Class } from 'meteor/jagi:astronomy';
import { pubsub } from "/server/pubsub";

const TodoListCollection = new Mongo.Collection('todoList');

const TodoList = Class.create({
    name: 'TodoList',
    collection: TodoListCollection,
    fields: {
        _id: {
            type: String,
            optional: true
        },
        task: {
            type: String,
            optional: true
        },
        completed: {
            type: Boolean,
            optional: true
        }
    },
    events: {
        afterInsert(e) {
            pubsub.publish('todoList', {
                status: "added",
                value: e.currentTarget
            });
        },
        afterUpdate(e) {
            pubsub.publish('todoList', {
                status: "updated",
                value: e.currentTarget
            });
        },
        afterRemove(e) {
            pubsub.publish('todoList', {
                status: "deleted",
                value: e.currentTarget
            });
        }
    }
});

export { TodoList };