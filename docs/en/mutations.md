# Mutations

## Getting Started in Knockout
```javascript
// Initialise via a Custom Function (same as with queries)
var self = this;
self.todoList = ko.observableArray().launchApollo(apolloClient, defaultErrorCallback);  // A todo list because we are very busy

// Now we are ready to make a mutation
self.todoList.apollo({object for Apollo}, {object of callbacks});
```

## Server
On the server add the corresponding schema and resolver:
```javascript
// Schema
export const schema = `
type TodoList {
  _id: ID
  task: String
  completed: Boolean
}

type Mutation {
  createTodo(task: String!, completed: Boolean!): TodoList
  updateTodo(_id: ID!, task: String!, completed: Boolean!): TodoList
  removeTodo(_id: ID!): TodoList
}

schema {
  mutation: Mutation
}
`;

// Resolver
import { TodoList } from "/imports/models/TodoList.js";

export const resolvers = {
    Mutation: {
        createTodo(root, args, context) {
            let todo = new TodoList(args);
            let _id = todo.save();
            if (_id) {
                return {_id: _id};
            }
        },
        updateTodo(root, args, context) {
            let result = TodoList.update({
                _id: args._id
            }, {
                task: args.task,
                completed: args.completed
            });
            if (result) {
                return args;
            }
        },
        removeTodo(root, args, context) {
            let toRemove = TodoList.findOne({ _id: args._id});
            let result = toRemove.remove();
            if (result) {
                return args;
            }
        }
    }
};
```
## Client
On the client within a viewModel:
```javascript
// Create the GraphQL documents
var createTodoMutation = gql`
    mutation ($task: String!, $completed: Boolean!) {
      createTodo(task: $task, completed: $completed) {
        _id
      }
    }
`;
var updateTodoMutation = gql`
    mutation ($_id: ID!, $task: String!, $completed: Boolean!) {
        updateTodo(_id: $_id, task: $task, completed: $completed) {
          _id
          task
          completed
        }
    }
`;
var removeTodoMutation = gql`
    mutation removeTodo($_id: ID!) {
        removeTodo(_id: $_id) {
            _id
        }
    }
`;

// Place the below mutations within your functions

// Create
self.todoList.apollo({
    mutation: createTodoMutation,
    variables: {
        task: item.task.peek(),
        completed: item.completed.peek()
    }
},
{
    resolve: function(data) {
        console.log(data.data.createTodo);
        // create an instance
    }
});

// Update
self.todoList.apollo({
    mutation: updateTodoMutation,
    variables: {
        _id: item._id.peek(),
        task: item.task.peek(),
        completed: item.completed.peek()
    }
},
{
    resolve: function(data) {
        if (data.data.updateTodo) {
            // update the instance
        }
    }
});

// Remove
self.todoList.apollo({
    mutation: removeTodoMutation,
    variables: {
        _id: item._id.peek()
    }
},
{
    resolve: function(data){
        self.todoList.remove(data.data.removeTodo);
    }
});
```

## Index
[Link](index.md)
