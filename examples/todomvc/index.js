import 'todomvc-app-css/index.css';

import Backbone from 'backbone';
import $ from 'jquery';

import Todos from './legacy/todos';
import AppView from './legacy/app_view';
import Router from './legacy/router';

import { syncCollection } from 'backbone-redux';
import { createStore, compose } from 'redux';

import { devTools } from 'redux-devtools';

function createReduxStore() {
  const finalCreateStore = compose(devTools())(createStore);
  return finalCreateStore(() => {});
}

$(() => {
  window.app = {};

  app.todos = new Todos();
  app.TodoRouter = new Router();
  app.appView = new AppView();
  Backbone.history.start();

  window.store = createReduxStore();
  syncCollection({todos: app.todos}, store);

  app.appView.render();
});
