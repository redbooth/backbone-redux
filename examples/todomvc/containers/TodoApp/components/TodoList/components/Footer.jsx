import React from 'react';

export default class Footer extends React.Component {
  render() {
    const active = this.props.todos.filter(todo => !todo.completed).length;
    const completed = this.props.todos.filter(todo => todo.completed).length;

    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{active} </strong>{active === 1 ? 'item' : 'items'} left
        </span>
        <ul className="filters">
          <li>
            <a className={this.props.filter == '' ? 'selected': ''} href="#/">All</a>
          </li>
          <li>
            <a className={this.props.filter == 'active' ? 'selected': ''} href="#/active">Active</a>
          </li>
          <li>
            <a className={this.props.filter == 'completed' ? 'selected': ''} href="#/completed">Completed</a>
          </li>
        </ul>
        {!!completed &&
          <button className="clear-completed" onClick={this.props.onClearCompleted}>
            Clear completed
          </button>
        }
      </footer>
    );
  }
}
