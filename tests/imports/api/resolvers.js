// Resolvers
import { TodoList } from "/imports/models/TodoList.js";
import { pubsub } from "/server/pubsub";

export const resolvers = {
    Query: {
        todoList(root, args) {
            return TodoList.find().fetch();
        }
    },
    Mutation: {
        removeTodo(root, args, context) {
            let toRemove = TodoList.findOne({ _id: args._id });
            let result = toRemove.remove();
            if (result) {
                return args;
            }
        },
        createTodo(root, args, context) {
            let todo = new TodoList(args);
            let _id = todo.save({
                simulation: false // Insert only on the server
            });
            let result = Object.assign({_id: _id}, args);
            pubsub.publish("todoAdded", { todoAdded: result });
            return result;
        },
        updateTodo(root, args, context) {
            let result = TodoList.update(
                {
                    _id: args._id
                },
                {
                    task: args.task,
                    completed: args.completed
                }
            );
            if (result) {
                return args;
            }
        }
    },
    Subscription: {
        todoList: {
            resolve: (data, args, context, info) => {
                // Manipulate and return the new value
                //console.log("got to todoList resolver");
                //console.log(data);
                //console.log(args);
                //console.log(context);
                //console.log(info);
                return data;
            },
            subscribe: () => pubsub.asyncIterator("todoList")
        }
    }
};
