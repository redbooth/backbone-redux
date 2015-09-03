import Backbone from 'backbone';
import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import TodoApp from '../containers/TodoApp';

import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

const ENTER_KEY = 13;
const ESC_KEY = 27;

export default Backbone.View.extend({
  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: '.todoapp',

  // At initialization we bind to the relevant events on the `Todos`
  // collection, when items are added or changed. Kick things off by
  // loading any preexisting todos that might be saved in *localStorage*.
  initialize() {
    app.todos.fetch({reset: true});
  },

  // Re-rendering the App just means refreshing the statistics -- the rest
  // of the app doesn't change.
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

  // Generate the attributes for a new Todo item.
  newAttributes(title) {
    return {
      title,
      order: app.todos.nextOrder(),
      completed: false
    };
  }
});
