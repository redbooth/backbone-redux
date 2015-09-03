import React from 'react';

export default class Footer extends React.Component {
  onChange(event) {
    this.props.onToggleAll(event.target.checked);
  }

  render() {
    const active = this.props.todos.filter(todo => !todo.completed).length;

    return (
      <div>
        <input
          className="toggle-all"
          type="checkbox"
          defaultChecked={!active}
          onChange={this.onChange.bind(this)}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
      </div>
    );
  }
}
