const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/user', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const regex = /(\d{4})\-?.?\/?(\d{2})\-?.?\/?(\d{2})/;
  var date = deadline.match(regex);

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(date[1],date[2]-1,date[3]),
    created_at: new Date()
  } 

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(400).json({ error: 'To-do not found' });
  }

  const regex = /(\d{4})\-?.?\/?(\d{2})\-?.?\/?(\d{2})/;
  const date = deadline.match(regex);

  const newDeadline = new Date(date[1],date[2]-1,date[3]);

  todo.title = title;
  todo.deadline = newDeadline;

  return response.status(202).json(todo);
});

app.patch('/todos/:id/done', (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(400).json({ error: 'To-do not found' });
  }

  todo.done = !todo.done;

  return response.status(204).send();
});

app.delete('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  const index = user.todos.lastIndexOf(todo);

  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app