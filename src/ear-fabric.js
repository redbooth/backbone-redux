import { bindActionCreators } from 'redux';

/**
 * When model have been added merge it into the big tree
 *
 * @param {Object} actions
 * @param {Backbone.Model} model
 */
function handleAdd(actions, model) {
  actions.add(model);
}

/**
 * When model have been changed merge it into the big tree
 *
 * @param {Object} actions
 * @param {Backbone.Model} model
 */
function handleChange(actions, model) {
  actions.merge(model);
}

/**
 * When collection/model have been synced merge it/its models into the big tree
 *
 * @param {Object} actions
 * @param {(Backbone.Collection | Backbone.Model)} entity
 */
function handleSync(actions, entity) {
  actions.merge(entity.models || entity);
}

/**
 * When collection/model have been errored merge it/its models into the big tree
 *
 * @param {Object} actions
 * @param {(Backbone.Collection | Backbone.Model)} entity
 */
function handleError(actions, entity) {
  actions.merge(entity.models || entity);
}

/**
 * When model have been removed merge it into the big tree
 *
 * @param {Object} actions
 * @param {Backbone.Model} model
 */
function handleRemove(actions, model) {
  actions.remove(model);
}

/**
 * When collection have been reseted merge its models into the big tree
 *
 * @param {Object} actions
 * @param {Backbone.Collection} collection
 */
function handleReset(actions, collection) {
  actions.merge(collection.models);
}

/**
 * Imports all models on the initial load
 *
 * @param {Object} actions
 * @param  {Backbone.Model[]} models
 */
function initialSync(actions, models) {
  actions.add(models);
}

/**
 * Binds actions and partially applies handler events to these actions
 *
 * @param  {Function[]} rawActions
 * @return {Object}
 */
function createHandlersWithActions(rawActions, dispatch) {
  const actions = bindActionCreators(rawActions, dispatch);

  return {
    initialSync: initialSync.bind(this, actions),
    handleAdd: handleAdd.bind(this, actions),
    handleChange: handleChange.bind(this, actions),
    handleSync: handleSync.bind(this, actions),
    handleError: handleError.bind(this, actions),
    handleRemove: handleRemove.bind(this, actions),
    handleReset: handleReset.bind(this, actions),
  };
}

/**
 * The ear itself
 * Listens on any event from the collection and updates The Big Tree
 *
 * @param {Backbone.Collection} collection
 * @param {Object} rawActions object with functions. They are not action cretors yet.
 */
export default function(collection, rawActions, dispatch) {
  const handlers = createHandlersWithActions(rawActions, dispatch);

  handlers.initialSync(collection.models || collection);

  collection.on('add', handlers.handleAdd);
  collection.on('change', handlers.handleChange);
  collection.on('sync', handlers.handleSync);
  collection.on('error', handlers.handleError);
  collection.on('remove', handlers.handleRemove);
  collection.on('reset', handlers.handleReset);
}