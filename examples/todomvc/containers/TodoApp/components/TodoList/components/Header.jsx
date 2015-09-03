import React from 'react';
import ReactDOM from 'react-dom';

const ENTER_KEY = 13;

export default class Header extends React.Component {
  componentDidMount(){
    ReactDOM.findDOMNode(this.refs.input).focus();
  }

  onPossibleTask({keyCode}) {
    if (keyCode != ENTER_KEY) {
      return;
    }

    const input = ReactDOM.findDOMNode(this.refs.input);
    const input_val = input.value.trim();

    if (input_val) {
      this.props.onEnterPressed(input_val);
      input.value = '';
    }
  }

  render() {
    return (
      <header className="header">
        <h1>todos</h1>
        <input
          ref="input"
          className="new-todo"
          placeholder="What needs to be done?"
          onKeyDown={this.onPossibleTask.bind(this)}  />
      </header>
    );
  }
}
