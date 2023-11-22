const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

// Импортируем локальные модули
const db = require('./db');
const models = require('./models');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
app.get('/', (req, res) => res.send('Hello Web Server!!!'));

db.connect(DB_HOST);

// Настройка Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models };
  }
});

server.applyMiddleware({ app, path: '/api' });
app.listen(port, () => {
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  );
});
