import test from 'tape';
import {
  buildIndex,
  buildRelation,
  addEntities,
  removeEntities,
} from '../src/reducer-tools';

test('Building index', t => {
  const user1 = {name: 'bob', id: 1};
  const user2 = {name: 'alice', id: 2};
  const user3 = {name: 'jane', id: 3};
  const field = 'id';

  t.test('indexes by field', t => {
    t.plan(1);

    const entities = [user1, user2, user3];
    const index = buildIndex(entities, field);
    t.deepEqual(index, {1: user1, 2: user2, 3: user3});
  });

  t.test('overwrites the duplicates', t => {
    t.plan(1);
    const userWithDupId = {name: 'jane', id: 1};
    const entities = [user1, user2, userWithDupId];

    const index = buildIndex(entities, field);
    t.deepEqual(index, {1: userWithDupId, 2: user2});
  });

  t.end();
});

test('Building relations', t => {
  const user1 = {name: 'bob', id: 1, company_id: 2};
  const user2 = {name: 'alice', id: 2, company_id: 1};
  const user3 = {name: 'jane', id: 3, company_id: 2};
  const field = 'company_id';

  const entities = [user1, user2, user3];
  const index = buildRelation(entities, field);

  t.test('builds valid relation', t => {
    t.plan(1);
    t.deepEqual(index, {1: [user2], 2: [user1, user3]});
  });

  t.test('saves link to initial objects', t => {
    t.plan(1);
    t.equal(index[1][0], user2);
  });

  t.end();
});

test('Adding entities', t => {
  const user1 = {name: 'bob', id: 1};
  const user2 = {name: 'alice', id: 2};
  const user3 = {name: 'jane', id: 3};

  const currentEntities = [user1];
  const newEntities = [user2, user3];

  t.deepEqual(addEntities(currentEntities, newEntities), [user1, user2, user3]);
  t.end();
});

test('Removing entities', t => {
  const user1 = {name: 'bob', id: 1};
  const user2 = {name: 'alice', id: 2};
  const user3 = {name: 'jane', id: 3};

  t.test('removes objects by id', t => {
    t.plan(1);
    const currentEntities = [user2, user3];
    const idsToRemove = [2];
    t.deepEqual(removeEntities(currentEntities, idsToRemove), [user3]);
  });

  t.test('removes objects by __optimistic_id', t => {
    t.plan(1);
    const optimisticUser = {name: 'not saved yet', __optimistic_id: 'c1'};
    const currentEntities = [user2, user3, optimisticUser];
    const idsToRemove = [2, 'c1'];

    t.deepEqual(removeEntities(currentEntities, idsToRemove), [user3]);
  });

  t.test('removes even if passed array is deep and full of undefined', t => {
    t.plan(1);
    const optimisticUser = {name: 'not saved yet', __optimistic_id: 'c1'};
    const currentEntities = [user1, user2, user3, optimisticUser];
    const idsToRemove = [2, [1, 'c1'], undefined, null];

    t.deepEqual(removeEntities(currentEntities, idsToRemove), [user3]);
  });
});


