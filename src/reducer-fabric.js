import {
  addEntities,
  removeEntities,
  buildIndex,
  buildRelation,
} from './reducer-tools';

function buildInitialState({fields = {}, relations = {}}) {
  const initIndex = (acc, index) => (acc[index] = {}, acc);

  return {
    entities: [],
    ...Object.keys(fields).reduce(initIndex, {}),
    ...Object.keys(relations).reduce(initIndex, {}),
  };
}

function buildIndexBuilder({fields = {}, relations = {}}) {
  return function(entities) {
    const fieldBuilder = (acc, indexName) => {
      acc[indexName] = buildIndex(entities, fields[indexName]);
      return acc;
    };

    const relationBuilder = (acc, indexName) => {
      acc[indexName] = buildRelation(entities, relations[indexName]);
      return acc;
    };

    return {
      ...Object.keys(fields).reduce(fieldBuilder, {}),
      ...Object.keys(relations).reduce(relationBuilder, {}),
    };
  };
}

function collectIds(entity) {
  return [entity.id, entity.__optimistic_id];
}

export default function({ADD, REMOVE, MERGE, RESET}, indexMap = {}) {
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
      const idsToRemove = action.entities.map(collectIds);

      entities = removeEntities(state.entities, idsToRemove);
      indexes = indexBuilder(entities);

      return {...state, entities, ...indexes};

    case MERGE:
      const idsToReplace = action.entities.map(collectIds);

      entities = removeEntities(state.entities, idsToReplace);
      entities = addEntities(entities, action.entities);
      indexes = indexBuilder(entities);

      return {...state, entities, ...indexes};

    case RESET:
      entities = addEntities({...initialState}.entities, action.entities);
      indexes = indexBuilder(entities);

      return {...initialState, entities, ...indexes};

    default:
      return state;
    }
  };
}
