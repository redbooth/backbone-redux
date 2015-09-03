import { connect } from 'react-redux';
import TodoList from './components/TodoList';
import _ from 'lodash';

const mapStateToProps = state => ({
  todos: state.todos.entities
});

const mergeProps = (stateProps, dispatchActions, ownProps) => {
  const filters = {
    all: (() => true),
    active: (todo => !todo.completed),
    completed: (todo => todo.completed)
  };

  const filter = filters[ownProps.taskFilter] || filters.all;

  return Object.assign({}, stateProps, ownProps, {
    filteredTodos: stateProps.todos.filter(filter)
  });
};

export default connect(mapStateToProps, {}, mergeProps)(TodoList);
