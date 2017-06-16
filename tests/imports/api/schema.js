export const typeDefs = `

type TodoList {
  _id: ID
  task: String
  completed: Boolean
}

type Result {
  status: String
  value: TodoList
}

type Query {
  todoList(_id: ID): [TodoList]
}

type Mutation {
  removeTodo(_id: ID!): TodoList
  createTodo(task: String!, completed: Boolean!): TodoList
  updateTodo(_id: ID!, task: String!, completed: Boolean!): TodoList
}

type Subscription {
  ticks: Int
  todoList: Result
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;
