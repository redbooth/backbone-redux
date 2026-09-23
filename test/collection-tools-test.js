import test from 'tape';
import Backbone from 'backbone';
import defer from 'lodash.defer';
import {createStore} from 'redux';
import {syncCollections} from '../src/collection-tools';
import {series} from 'async';

let collection;
let store;
let jane;
let mark;
let sophy;
let barry;

const processTest = t => next => defer(() => {t(); next(null);});

test('Syncing collection', t => {
  t.test('default values', t => {
    collection = new Backbone.Collection();
    store = createStore(() => {});
    syncCollections({people: collection}, store);

    // initial state
    t.deepEqual(store.getState(), {people: {entities: [], by_id: {}}});

    // adding model
    jane = new Backbone.Model({id: 1, name: 'Jane'});
    collection.add(jane);

    // adding 2 models
    mark = new Backbone.Model({id: 2, name: 'Mark'});
    sophy = new Backbone.Model({id: 3, name: 'Sophy'});
    collection.add([mark, sophy]);

    series([
      // Batches adds and handles them when the stack is cleared
      processTest(() => {
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
      }),
      // Batches changes and handles them when the stack is cleared
      processTest(() => {
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
      }),
      // Batches removes and handles them when the stack is cleared
      processTest(() => {
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
        barry = new Backbone.Model({id: 4, name: 'Barry'});
        collection.reset([barry]);
      }),
      processTest(() => {
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
      }),
      processTest(() => t.end()),
    ]);
  });

  t.test('changing a model many times in the same tick', t => {
    const collection = new Backbone.Collection();
    const store = createStore(() => {});
    syncCollections({people: collection}, store);

    const jane = new Backbone.Model({id: 1, name: 'Jane'});
    collection.add(jane);

    series([
      processTest(() => {
        jane.set('name', 'Jennifer');
        jane.set('name', 'Jenny');
        jane.set('name', 'Jen');
      }),
      // All changes are batched into a single merge and the model is not duplicated
      processTest(() => {
        t.deepEqual(
          store.getState().people,
          {
            entities: [
              {id: 1, name: 'Jen', __optimistic_id: jane.cid},
            ],
            by_id: {
              1: {id: 1, name: 'Jen', __optimistic_id: jane.cid},
            },
          }
        );
      }),
      processTest(() => t.end()),
    ]);
  });

  t.test('adding many models without an id in the same tick', t => {
    const collection = new Backbone.Collection();
    const store = createStore(() => {});
    syncCollections({people: collection}, store);

    const jane = new Backbone.Model({name: 'Jane'});
    const mark = new Backbone.Model({name: 'Mark'});
    collection.add([jane, mark]);

    series([
      // Unsaved models are told apart by their cid and all end up in the store
      processTest(() => {
        t.deepEqual(
          store.getState().people.entities,
          [
            {name: 'Jane', __optimistic_id: jane.cid},
            {name: 'Mark', __optimistic_id: mark.cid},
          ]
        );
      }),
      processTest(() => t.end()),
    ]);
  });

  t.test('with a custom idAttribute', t => {
    const Person = Backbone.Model.extend({idAttribute: '_id'});
    const collection = new Backbone.Collection([], {model: Person});
    const store = createStore(() => {});
    const indexesMap = {fields: {by_id: '_id'}};

    syncCollections({people: {collection, indexes_map: indexesMap}}, store);

    const jane = new Person({_id: 1, name: 'Jane'});
    const mark = new Person({_id: 2, name: 'Mark'});
    const sophy = new Person({_id: 3, name: 'Sophy'});
    let barry;

    collection.add(jane);
    collection.add([mark, sophy]);

    series([
      // Batches adds
      processTest(() => {
        t.deepEqual(
          store.getState().people,
          {
            entities: [
              {_id: 1, name: 'Jane', __optimistic_id: jane.cid},
              {_id: 2, name: 'Mark', __optimistic_id: mark.cid},
              {_id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
            ],
            by_id: {
              1: {_id: 1, name: 'Jane', __optimistic_id: jane.cid},
              2: {_id: 2, name: 'Mark', __optimistic_id: mark.cid},
              3: {_id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
            },
          },
          'adds models'
        );

        jane.set('name', 'Jennifer');
      }),
      // Batches changes
      processTest(() => {
        t.deepEqual(
          store.getState().people,
          {
            entities: [
              {_id: 2, name: 'Mark', __optimistic_id: mark.cid},
              {_id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
              {_id: 1, name: 'Jennifer', __optimistic_id: jane.cid},
            ],
            by_id: {
              1: {_id: 1, name: 'Jennifer', __optimistic_id: jane.cid},
              2: {_id: 2, name: 'Mark', __optimistic_id: mark.cid},
              3: {_id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
            },
          },
          'merges a changed model'
        );

        jane.set('name', 'Jenny');
        jane.set('name', 'Jen');
      }),
      // Batches many changes to the same model without duplicating it
      processTest(() => {
        t.deepEqual(
          store.getState().people,
          {
            entities: [
              {_id: 2, name: 'Mark', __optimistic_id: mark.cid},
              {_id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
              {_id: 1, name: 'Jen', __optimistic_id: jane.cid},
            ],
            by_id: {
              1: {_id: 1, name: 'Jen', __optimistic_id: jane.cid},
              2: {_id: 2, name: 'Mark', __optimistic_id: mark.cid},
              3: {_id: 3, name: 'Sophy', __optimistic_id: sophy.cid},
            },
          },
          'merges a model changed many times without duplicating it'
        );

        collection.remove([mark, sophy]);
      }),
      // Batches removes
      processTest(() => {
        t.deepEqual(
          store.getState().people,
          {
            entities: [
              {_id: 1, name: 'Jen', __optimistic_id: jane.cid},
            ],
            by_id: {
              1: {_id: 1, name: 'Jen', __optimistic_id: jane.cid},
            },
          },
          'removes models'
        );

        barry = new Person({_id: 4, name: 'Barry'});
        collection.reset([barry]);
      }),
      // Resets
      processTest(() => {
        t.deepEqual(
          store.getState().people,
          {
            entities: [
              {_id: 4, name: 'Barry', __optimistic_id: barry.cid},
            ],
            by_id: {
              4: {_id: 4, name: 'Barry', __optimistic_id: barry.cid},
            },
          },
          'resets the collection'
        );
      }),
      processTest(() => t.end()),
    ]);
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
});
