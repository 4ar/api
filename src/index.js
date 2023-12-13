const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
require('dotenv').config();

// Импортируем локальные модули
const db = require('./db');
const models = require('./models');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');

// Запускаем сервер на порте, указанном в файле .env, или на порте 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
app.use(helmet());
app.use(cors());
app.get('/', (req, res) => res.send('Hello Web Server!!!'));

db.connect(DB_HOST);

// Настройка Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: async ({ req }) => {
    // Получаем токен пользователя из заголовков
    const token = await req.headers.authorization;
    // Пытаемся извлечь пользователя с помощью токена
    const user = await getUser(token);

    console.log(user);
    return { models, user };
  }
});

// Получаем информацию пользователя из JWT

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.error(e);
      // Если с токеном возникла проблема, выбрасываем ошибку
      new Error('Session Error');
    }
  }
};

server.applyMiddleware({ app, path: '/api' });
app.listen(port, () => {
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  );
});
