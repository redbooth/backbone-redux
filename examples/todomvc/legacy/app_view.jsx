import Backbone from 'backbone';
import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import TodoApp from '../containers/TodoApp';

import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

export default Backbone.View.extend({
  el: '.todoapp',

  initialize() {
    this.listenTo(app.todos, 'filter', _.debounce(this.render, 0));
    app.todos.fetch({reset: true});
  },

  render() {
    const TodoAppContainer = (
      <div>
        <Provider store={store}>
          <TodoApp
            taskFilter={app.TodoFilter}
            onCreateTodo={this.onCreateTodo.bind(this)}
            onCompleteToggle={this.onCompleteToggle.bind(this)}
            onClear={this.onClear.bind(this)}
            onClearCompleted={this.onClearCompleted.bind(this)}
            onToggleAll={this.onToggleAll.bind(this)}
          />
        </Provider>
        <DebugPanel top right bottom>
          <DevTools store={store} monitor={LogMonitor} />
        </DebugPanel>
      </div>
    );

    this.component = ReactDOM.render(
      TodoAppContainer,
      this.el,
      this.onRender
    );
  },

  onClose() {
    ReactDOM.unmountComponentAtNode(this.el);
  },

  onCreateTodo(title) {
    app.todos.create(this.newAttributes(title));
  },

  onCompleteToggle(id) {
    app.todos.get(id).toggle();
  },

  onClear(id) {
    app.todos.get(id).destroy();
  },

  onClearCompleted() {
    _.invoke(app.todos.completed(), 'destroy');
  },

  onToggleAll(completed) {
    app.todos.each(todo => todo.save({completed: completed}));
  },

  newAttributes(title) {
    return {
      title,
      order: app.todos.nextOrder(),
      completed: false
    };
  }
});
