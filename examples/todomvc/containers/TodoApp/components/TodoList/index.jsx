import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MarkAll from './components/MarkAll';
import Todo from './components/Todo';
import _ from 'lodash';

export default class TodoList extends React.Component {
  render() {
    const todos = _.sortBy(this.props.filteredTodos, 'id').map(todo => {
      return (
        <Todo
          todo={todo}
          onCompleteToggle={this.props.onCompleteToggle}
          onClear={this.props.onClear}
        />
      )
    });
    const anyTodos = !!this.props.todos.length;

    return (
      <section>
        <Header onEnterPressed={this.props.onCreateTodo} />
        <section className="main">
          {anyTodos && <MarkAll todos={this.props.todos} onToggleAll={this.props.onToggleAll} />}
          <ul className="todo-list">
            {todos}
          </ul>
        </section>
        {anyTodos && <Footer
                       todos={this.props.todos}
                       filter={this.props.taskFilter}
                       onClearCompleted={this.props.onClearCompleted}
                     />
        }
      </section>
    );
  }
}
