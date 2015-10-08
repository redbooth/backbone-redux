import 'todomvc-app-css/index.css';

import Backbone from 'backbone';
import $ from 'jquery';

import Todos from './legacy/todos';
import AppView from './legacy/app_view';
import Router from './legacy/router';

import { syncCollections } from 'backbone-redux';
import { createStore, compose } from 'redux';

import { devTools } from 'redux-devtools';

function createReduxStore() {
  const finalCreateStore = compose(devTools())(createStore);
  return finalCreateStore(() => {});
}

$(() => {
  const app = {};
  window.app = app;

  app.todos = new Todos();
  app.TodoRouter = new Router();
  app.appView = new AppView();
  Backbone.history.start();

  window.store = createReduxStore();
  syncCollections({todos: app.todos}, window.store);

  app.appView.render();
});
