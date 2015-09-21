import test from 'tape';
import {
  buildIndex,
  buildRelation,
  addEntities,
  removeEntities,
} from '../src/reducer-tools';

test('Building index', assert => {
  const user1 = {name: 'bob', id: 1};
  const user2 = {name: 'alice', id: 2};
  const user3 = {name: 'jane', id: 3};
  const field = 'id';

  assert.test('indexes by field', assert => {
    assert.plan(1);

    const entities = [user1, user2, user3];
    const index = buildIndex(entities, field);
    assert.deepEqual(index, {1: user1, 2: user2, 3: user3});
  });

  assert.test('overwrites the duplicates', assert => {
    assert.plan(1);
    const userWithDupId = {name: 'jane', id: 1};
    const entities = [user1, user2, userWithDupId];

    const index = buildIndex(entities, field);
    assert.deepEqual(index, {1: userWithDupId, 2: user2});
  });

  assert.end();
});

test('Building relations', assert => {
  const user1 = {name: 'bob', id: 1, company_id: 2};
  const user2 = {name: 'alice', id: 2, company_id: 1};
  const user3 = {name: 'jane', id: 3, company_id: 2};
  const field = 'company_id';

  const entities = [user1, user2, user3];
  const index = buildRelation(entities, field);

  assert.test('builds valid relation', assert => {
    assert.plan(1);
    assert.deepEqual(index, {1: [user2], 2: [user1, user3]});
  });

  assert.test('saves link to initial objects', assert => {
    assert.plan(1);
    assert.equal(index[1][0], user2);
  });

  assert.end();
});

test('Adding entities', assert => {
  const user1 = {name: 'bob', id: 1};
  const user2 = {name: 'alice', id: 2};
  const user3 = {name: 'jane', id: 3};

  const currentEntities = [user1];
  const newEntities = [user2, user3];

  assert.deepEqual(addEntities(currentEntities, newEntities), [user1, user2, user3]);
  assert.end();
});

test('Removing entities', assert => {
  const user1 = {name: 'bob', id: 1};
  const user2 = {name: 'alice', id: 2};
  const user3 = {name: 'jane', id: 3};

  assert.test('removes objects by id', assert => {
    assert.plan(1);
    const currentEntities = [user2, user3];
    const idsToRemove = [2];
    assert.deepEqual(removeEntities(currentEntities, idsToRemove), [user3]);
  });

  assert.test('removes objects by __optimistic_id', assert => {
    assert.plan(1);
    const optimisticUser = {name: 'not saved yet', __optimistic_id: 'c1'};
    const currentEntities = [user2, user3, optimisticUser];
    const idsToRemove = [2, 'c1'];

    assert.deepEqual(removeEntities(currentEntities, idsToRemove), [user3]);
  });

  assert.test('removes even if passed array is deep and full of undefined', assert => {
    assert.plan(1);
    const optimisticUser = {name: 'not saved yet', __optimistic_id: 'c1'};
    const currentEntities = [user1, user2, user3, optimisticUser];
    const idsToRemove = [2, [1, 'c1'], undefined, null];

    assert.deepEqual(removeEntities(currentEntities, idsToRemove), [user3]);
  });
});


