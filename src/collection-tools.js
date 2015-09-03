import actionFabric from './action-fabric';
import reducerFabric from './reducer-fabric';
import earFabric from './ear-fabric';

import { combineReducers } from 'redux';

function buildConstants(collectionName) {
  const uppercasedCollectionName = collectionName.toUpperCase();

  return {
    ADD: `ADD_${uppercasedCollectionName}`,
    REMOVE: `REMOVE_${uppercasedCollectionName}`,
    MERGE: `MERGE_${uppercasedCollectionName}`,
  };
}

function buildReducers(collectionsMap) {
  const defaultIndexMap = {fields: {byId: 'id'}};
  return Object.keys(collectionsMap).reduce((collector, collectionName) => {
    collector[collectionName] = reducerFabric(buildConstants(collectionName), defaultIndexMap);
    return collector;
  }, {});
}

function buildEars(collectionsMap, {dispatch}) {
  const defaultSerializer = model => ({...model.toJSON(), __optimistic_id: model.cid});

  Object.keys(collectionsMap).forEach(collectionName => {
    const rawActions = actionFabric(buildConstants(collectionName), defaultSerializer);
    earFabric(collectionsMap[collectionName], rawActions, dispatch);
  });
}

export function syncCollection(collectionsMap, store) {
  const reducers = buildReducers(collectionsMap);
  store.replaceReducer(combineReducers(reducers));
  buildEars(collectionsMap, store);
}
