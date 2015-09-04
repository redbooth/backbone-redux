import {
  addEntities
, removeEntities
, buildIndex
, buildRelation
} from './reducer-tools';

function buildInitialState({fields = {}, relations = {}}) {
  const initIndex = (acc, index) => (acc[index] = {}, acc);

  return {
    entities: [],
    ...Object.keys(fields).reduce(initIndex, {}),
    ...Object.keys(relations).reduce(initIndex, {}),
  };
}

function buildIndexBuilder({fields, relations}) {
  return function(entities) {
    const indexes = {};

    _.each(fields, (field, indexName) => {
      indexes[indexName] = buildIndex(entities, field);
    });

    _.each(relations, (relationField, indexName) => {
      indexes[indexName] = buildRelation(entities, relationField);
    });

    return indexes;
  };
}

export default function({ADD, REMOVE, MERGE}, indexMap = {}) {
  const initialState = buildInitialState(indexMap);
  const indexBuilder = buildIndexBuilder(indexMap);

  return function(state = initialState, action) {
    let entities;
    let indexes;

    switch (action.type) {
    case ADD:
      entities = addEntities(state.entities, action.entities);
      indexes = indexBuilder(entities);

      return {...state, entities, ...indexes};

    case REMOVE:
      entities = removeEntities(state.entities, action.ids);
      indexes = indexBuilder(entities);

      return {...state, entities, ...indexes};

    case MERGE:
      const idsToReplace = action.entities.map(u => [u.id, u.__optimistic_id]);

      entities = removeEntities(state.entities, idsToReplace);
      entities = addEntities(entities, action.entities);
      indexes = indexBuilder(entities);

      return {...state, entities, ...indexes};

    default:
      return state;
    }
  };
}
