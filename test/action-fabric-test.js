import test from 'tape';
import actionFabric from '../src/action-fabric';

test('Building action creators', t => {
  const serializer = ({id}) => ({id});
  const ADD = 'ADD';
  const REMOVE = 'REMOVE';
  const MERGE = 'MERGE';
  const RESET = 'RESET';
  const constants = {ADD, REMOVE, MERGE, RESET};
  const actionCreator = actionFabric(constants, serializer);

  t.test('returns action creator that works with single entities', t => {
    const entity = {id: 1};

    t.deepEqual(actionCreator.add(entity), {type: ADD, entities: [entity]});
    t.deepEqual(actionCreator.remove(entity), {type: REMOVE, entities: [entity]});
    t.deepEqual(actionCreator.merge(entity), {type: MERGE, entities: [entity]});
    t.deepEqual(actionCreator.reset(entity), {type: RESET, entities: [entity]});

    t.end();
  });

  t.test('returns action creator that works with multiple entities', t => {
    const entities = [{id: 1}, {id: 2}];

    t.deepEqual(actionCreator.add(entities), {type: ADD, entities: [...entities]});
    t.deepEqual(actionCreator.remove(entities), {type: REMOVE, entities: [...entities]});
    t.deepEqual(actionCreator.merge(entities), {type: MERGE, entities: [...entities]});
    t.deepEqual(actionCreator.reset(entities), {type: RESET, entities: [...entities]});

    t.end();
  });

  t.end();
});

