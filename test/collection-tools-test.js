import test from 'tape';
import Backbone from 'backbone';
import {createStore} from 'redux';
import {
  syncCollections,
} from '../src/collection-tools';

test('Syncing collection', t => {
  t.test('default values', t => {
    const collection = new Backbone.Collection();
    const store = createStore(() => {});
    syncCollections({people: collection}, store);

    // initial state
    t.deepEqual(store.getState(), {people: {entities: [], by_id: {}}});

    // adding model
    const jane = new Backbone.Model({id: 1, name: 'Jane'});
    collection.add(jane);

    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 1, name: 'Jane', __optimistic_id: jane.cid},
        ],
        by_id: {
          1: {id: 1, name: 'Jane', __optimistic_id: jane.cid},
        },
      }
    );

    // adding 2 models
    const mark = new Backbone.Model({id: 2, name: 'Mark'});
    const sophy = new Backbone.Model({id: 3, name: 'Sophy'});
    collection.add([mark, sophy]);

    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 1, name: 'Jane', __optimistic_id: jane.cid},
          {id: 2, name: 'Mark', __optimistic_id: mark.cid},
          {id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
        ],
        by_id: {
          1: {id: 1, name: 'Jane', __optimistic_id: jane.cid},
          2: {id: 2, name: 'Mark', __optimistic_id: mark.cid},
          3: {id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
        },
      }
    );

    // changing models
    jane.set('name', 'Jennifer');
    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 2, name: 'Mark', __optimistic_id: mark.cid},
          {id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
          {id: 1, name: 'Jennifer', __optimistic_id: jane.cid},
        ],
        by_id: {
          1: {id: 1, name: 'Jennifer', __optimistic_id: jane.cid},
          2: {id: 2, name: 'Mark', __optimistic_id: mark.cid},
          3: {id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
        },
      }
    );

    // removing models
    collection.remove([mark, sophy]);
    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 1, name: 'Jennifer', __optimistic_id: jane.cid},
        ],
        by_id: {
          1: {id: 1, name: 'Jennifer', __optimistic_id: jane.cid},
        },
      }
    );

    // resetting collection
    const barry = new Backbone.Model({id: 4, name: 'Barry'});
    collection.reset([barry]);

    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 4, name: 'Barry', __optimistic_id: barry.cid},
        ],
        by_id: {
          4: {id: 4, name: 'Barry', __optimistic_id: barry.cid},
        },
      }
    );

    t.end();
  });

  t.test('initial sync', t => {
    const jane = new Backbone.Model({id: 1, name: 'Jane'});
    const collection = new Backbone.Collection([jane]);
    const store = createStore(() => {});
    syncCollections({people: collection}, store);

    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 1, name: 'Jane', __optimistic_id: jane.cid},
        ],
        by_id: {
          1: {id: 1, name: 'Jane', __optimistic_id: jane.cid},
        },
      }
    );

    t.end();
  });


  t.test('custom indexes', t => {
    const jane = new Backbone.Model({id: 1, name: 'Jane', org_id: 1});
    const mark = new Backbone.Model({id: 2, name: 'Mark', org_id: 2});
    const sophy = new Backbone.Model({id: 3, name: 'Sophy', org_id: 1});
    const collection = new Backbone.Collection([jane, mark, sophy]);
    const store = createStore(() => {});

    const indexesMap = {
      relations: {
        by_org_id: 'org_id',
      },
    };

    syncCollections({
      people: {
        collection: collection,
        indexes_map: indexesMap,
      },
    }, store);

    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 1, name: 'Jane', __optimistic_id: jane.cid, org_id: 1},
          {id: 2, name: 'Mark', __optimistic_id: mark.cid, org_id: 2},
          {id: 3, name: 'Sophy', __optimistic_id: sophy.cid, org_id: 1},
        ],
        by_org_id: {
          1: [
            {id: 1, name: 'Jane', __optimistic_id: jane.cid, org_id: 1},
            {id: 3, name: 'Sophy', __optimistic_id: sophy.cid, org_id: 1},
          ],
          2: [
            {id: 2, name: 'Mark', __optimistic_id: mark.cid, org_id: 2},
          ],
        },
      }
    );

    t.end();
  });

  t.test('custom serializers', t => {
    const jane = new Backbone.Model({id: 1, name: 'Jane'});
    const serializer = (model) => ({id: model.id, name: `${model.get('name')} MeatBallovich` });
    const collection = new Backbone.Collection([jane]);
    const store = createStore(() => {});

    syncCollections({
      people: {
        collection: collection,
        serializer,
      },
    }, store);

    t.deepEqual(
      store.getState().people,
      {
        entities: [
          {id: 1, name: 'Jane MeatBallovich'},
        ],
        by_id: {
          1: {id: 1, name: 'Jane MeatBallovich'},
        },
      }
    );

    t.end();
  });

  t.test('extra reducers', t => {
    const collection = new Backbone.Collection();
    const store = createStore(() => {});
    const extraReducer = (state = {}) => state;

    syncCollections({people: collection}, store, {some_extra_branch: extraReducer});

    t.deepEqual(store.getState(), {people: {entities: [], by_id: {}}, some_extra_branch: {}});
    t.end();
  });

  t.end();
});
