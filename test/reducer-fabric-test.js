import test from 'tape';
import reducerFabric from '../src/reducer-fabric';

test('Building reducers', t => {
  const ADD = 'ADD';
  const REMOVE = 'REMOVE';
  const MERGE = 'MERGE';
  const RESET = 'RESET';
  const constants = {ADD, REMOVE, MERGE, RESET};

  t.test('with default state ano no index map', t => {
    const reducer = reducerFabric(constants);

    t.test('with null action', t => {
      const action = {type: null};
      t.deepEqual(reducer(undefined, action), {entities: []});
      t.end();
    });

    t.test('with add action', t => {
      const entity = {id: 1};
      const action = {type: ADD, entities: [entity]};
      t.deepEqual(reducer(undefined, action), {entities: [entity]});
      t.end();
    });

    t.test('with remove action', t => {
      const entity = {id: 1};
      const action = {type: REMOVE, entities: [entity]};
      t.deepEqual(reducer(undefined, action), {entities: []});
      t.end();
    });

    t.test('with merge action', t => {
      const entity = {id: 1};
      const action = {type: MERGE, entities: [entity]};
      t.deepEqual(reducer(undefined, action), {entities: [entity]});
      t.end();
    });

    t.test('with reset action', t => {
      const entity = {id: 1};
      const action = {type: RESET, entities: [entity]};
      t.deepEqual(reducer(undefined, action), {entities: [entity]});
      t.end();
    });

    t.end();
  });

  t.test('works with custom index map', t => {
    const indexMap = {
      fields: {
        by_id: 'id',
      },
      relations: {
        by_org_id: 'org_id',
      },
    };
    const reducer = reducerFabric(constants, indexMap);
    const jane = {id: 1, name: 'Jane', org_id: 1};
    const sophie = {id: 2, name: 'Sophie', org_id: 2};
    const mark = {id: 3, name: 'Mark', org_id: 1};

    const currentState = {
      entities: [jane, sophie, mark],
    };

    t.test('with null action', t => {
      const action = {type: null};
      t.deepEqual(reducer(currentState, action), currentState);
      t.end();
    });

    t.test('with add action', t => {
      const jack = {id: 4, name: 'Jack', org_id: 3};
      const action = {type: ADD, entities: [jack]};
      t.deepEqual(
        reducer(currentState, action),
        {
          entities: [jane, sophie, mark, jack],
          by_id: {
            1: jane,
            2: sophie,
            3: mark,
            4: jack,
          },
          by_org_id: {
            1: [jane, mark],
            2: [sophie],
            3: [jack],
          },
        }
      );
      t.end();
    });

    t.test('with remove action', t => {
      const action = {type: REMOVE, entities: [sophie]};
      t.deepEqual(
        reducer(currentState, action),
        {
          entities: [jane, mark],
          by_id: {
            1: jane,
            3: mark,
          },
          by_org_id: {
            1: [jane, mark],
          },
        }
      );
      t.end();
    });

    t.test('with merge action', t => {
      const newSophie = {id: 2, name: 'Sophie', org_id: 1};
      const action = {type: MERGE, entities: [newSophie]};
      t.deepEqual(
        reducer(currentState, action),
        {
          entities: [jane, mark, newSophie],
          by_id: {
            1: jane,
            2: newSophie,
            3: mark,
          },
          by_org_id: {
            1: [jane, mark, newSophie],
          },
        }
      );
      t.end();
    });

    t.test('with reset action', t => {
      const action = {type: RESET, entities: [jane]};
      t.deepEqual(
        reducer(currentState, action),
        {
          entities: [jane],
          by_id: {
            1: jane,
          },
          by_org_id: {
            1: [jane],
          },
        }
      );
      t.end();
    });

    t.end();
  });

  t.end();
});

