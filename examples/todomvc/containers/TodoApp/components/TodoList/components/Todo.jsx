import React from 'react';

export default class Todo extends React.Component {
  onCheckboxToggle() {
    this.props.onCompleteToggle(this.props.todo.id);
  }

  onRemove() {
    this.props.onClear(this.props.todo.id);
  }

  render() {
    return (
      <li className={this.props.todo.completed ? 'completed' : ''}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.onCheckboxToggle.bind(this)}
          />
          <label>{this.props.todo.title}</label>
          <button
            className="destroy"
            onClick={this.onRemove.bind(this)}
          />
        </div>
      </li>
    );
  }
}
