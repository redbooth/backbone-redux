backbone-redux
===============

The easy way to keep your backbone collections and redux store in sync.

[![npm](https://img.shields.io/npm/v/backbone-redux.svg?style=flat-square)](https://www.npmjs.com/package/backbone-redux)
[![npm](https://img.shields.io/npm/dm/backbone-redux.svg?style=flat-square)](https://www.npmjs.com/package/backbone-redux)
[![Travis](https://img.shields.io/travis/redbooth/backbone-redux.svg?style=flat-square)](https://travis-ci.org/redbooth/backbone-redux)

```
npm install backbone-redux --save
```

Creates reducers and listeners for your backbone collections and fires action
creators on every collection change.

**Documentation is a work-in-progress**. Feedback is welcome and encouraged.

* [Why?](#why)
* [How to use](#how-to-use)
  * [Auto way](#auto-way)
  * [Manual artesanal way](#manual-artesanal-way)
* [Documentation](#documentation)
  * [Configuration options](#configuration)
    * [collectionMap](#collection-map)
    * [indexesMap](#indexes-map)
    * [serializer](#serializer)
  * [API reference](#api-reference)
    * [syncCollections](#sync-collections)
    * [buildReducers](#build-reducers)
    * [buildEars](#build-ears)
    * [actionFabric](#action-fabric)
    * [reducerFabric](#reducer-fabric)
* [Examples](#examples)


### Why?

* You can start migrating your apps from backbone to react+redux in no time.
* No need to worry about migrated/legacy parts of your app being out of sync,
  because both are using the single source of truth.
* No boilerplate.
* You can hide all new concepts like `reducers`, `stores`, `action creators`,
  `actions` and `purity` from other developers in your team to avoid brain
  overloading.
* You have REST-adapter to your server out-of-the-box. Most React projects end
  up implementing an ad hoc, bug-ridden implementation of Backbone.Collection
  not only once, but for each store.
* You have separation between server-data and UI-data. The later is flat, so
  working with it is a pleasure in React.

### How to use?
#### Auto way


```javascript
import { createStore, compose } from 'redux';
import { devTools } from 'redux-devtools';
import { syncCollections } from 'backbone-redux';

//  Create your redux-store, include all middlewares you want.
const finalCreateStore = compose(devTools())(createStore);
const store = finalCreateStore(() => {}); // Store with an empty object as a reducer

// Now just call auto-syncer from backbone-redux
// Assuming you have Todos Backbone collection globally available
syncCollections({todos: Todos}, store);
```

What will happen?

* `syncCollections` will create a reducer under the hood especially for your
  collection.
* `action creator` will be constructed with 4 possible actions: `add`, `merge`,
  `remove`, and `reset`.
* Special `ear` object will be set up to listen to all collection events and
  trigger right actions depending on the event type.
* Reducer will be registered in the store under `todos` key.
* All previous reducers in your store will be replaced.

You are done. Now any change to `Todos` collection  will be reflected in the
redux store.

Models will be serialized before saving into the redux-tree: a result of
calling `toJSON` on the model + field called `__optimistic_id` which is equal
to model's `cid`;

Resulting tree will look like this:

```javascript
{
  todos: {
    entities: [{id: 1, ...}, {id: 2, ...}],
    by_id: {
      1: {id: 1, ...},
      2: {id: 2, ...}
    }
  }
}
```

`entities` array is just an array of serialized models. `by_id` — default index
which is created for you. It simplifies object retrieval, i.e.:
`store.getState().todos.by_id[2]`

So, what is happening when you change `Todos`?

```
something (your legacy/new UI or anything really) changes Todos
  -> Todos collection emits an event
    -> ear catches it
      -> ActionCreator emits an action
        -> Reducer creates a new state based on this action
          -> New State is stored and listeners are notified
            -> React doing its magic
```

#### Manual Artesanal Way

Sometimes defaults that are provided by `syncCollections` are not enough.

Reasons could vary:
* your collection could not be globally available
* you need some custom rules when adding/removing/resetting collection
* your collection have any dependency that should be processed too
* etc

In all these cases you can't use `syncCollections`, but you can create your own
ears to mimic `syncCollections` behavior.

Any `ear` should look something like this:

```javascript
import { bindActionCreators } from 'redux';

export default function(collection, rawActions, dispatch) {
  // binding action creators to the dispatch function
  const actions = bindActionCreators(rawActions, dispatch);

  actions.add(collection.models); // initial sync

  // adding listeners
  collection.on('add', actions.add);
  collection.on('change', actions.merge);
  collection.on('remove', actions.remove);
  collection.on('reset', ({models}) => actions.reset(models));
}
```

As you can see, `ear` requires 3 attributes. `collection` and `dispatch`(this
is just `store.dispatch`) you normally should already have, but how we can
generate `rawActions`? You can use `actionFabric` that `backbone-redux`
provides:

```javascript
import {actionFabric} from 'backbone-redux';

// create some constants that will be used as action types
const constants = {
  ADD: 'ADD_MY_MODEL',
  REMOVE: 'REMOVE_MY_MODEL',
  MERGE: 'MERGE_MY_MODEL',
  RESET: 'RESET_MY_MODEL'
};

// you need some serializer to prepare models to be stored in the store.
// This is the default one that is used in backbone-redux,
// but you can create totally your own, just don't forget about __optimistic_id
const defaultSerializer = model => ({...model.toJSON(), __optimistic_id: model.cid});

export default actionFabric(constants, defaultSerializer);
```

Don't forget that `actionFabric` is just an object with a couple of methods,
you can extend it as you want.

Time to generate a reducer:

```javascript
import {reducerFabric} from 'backbone-redux';

// the same constants, this is important
const constants = {
  ADD: 'ADD_MY_MODEL',
  REMOVE: 'REMOVE_MY_MODEL',
  MERGE: 'MERGE_MY_MODEL',
  RESET: 'RESET_MY_MODEL'
};

// any indexes that you want to be created for you
const index_map = {
  fields: {
    by_id: 'id'
  },
  relations: {
    by_channel_id: 'channel_id'
  }
};

export default reducerFabric(constants, index_map);
```


And now we are ready to combine everything together:

```javascript
import { syncCollections } from 'backbone-redux';
import store from './redux-store';
import customReducer from './reducer';
import customEar from './ear';
import customActions from './actions';

export default function() {
  // start with syncing normal collections
  const collectionsMap = {
    collection_that_does_not_need_customization: someCollection
  };

  // we need to pass our prepared reducers into the store
  // if you don't use syncCollections at all, you just need
  // to create store normally with these reducers via
  // combineReducers from redux
  const extraReducers = {
    custom_collection: customReducer
  };

  syncCollections(collectionsMap, store, extraReducers);

  // now let's call the ear
  customEar(customCollection, customActions, store.dispatch);
}
```

Done, you have your custom ear placed and working.

## Documentation

### Configuration options

#### collectionMap <a id="collection-map"></a>

A collection map is a plain object passed to `backbone-redux` functions to set
up reducers for you.

If you don't need a custom serializer you can use:

```javascript
// keys are reducer names, and values are backbone collections
const collectionMap = {
  reducer_name: collection
}
```

If you want, you can add change configuration by specifying `serializer` and `indexes_map` keys.

```javascript
// keys are reducer names, and values are objects defining collection and serializer
const collectionMap = {
  reducer_name: {
    collection: collection,
    serializer: serializer,
    indexes_map: indexes_map
  }
}
```

#### indexesMap <a id="indexes-map"></a>

With `indexesMap` you can specify the way your entities are indexed in the tree.

`fields` lets you access a *single* entity by a field (for example `id`, `email`, etc).

`relation` groups entities by a field value (for example `parent_id`).

Example:

I have a `people` collection of models with 4 fields: `name`,
`id`, `token`, and `org_id`. And I want to have indexes for all fields except
`name`.

```javascript
const jane = new Backbone.Model({id: 1, name: 'Jane', org_id: 1, token: '001'});
const mark = new Backbone.Model({id: 2, name: 'Mark', org_id: 2, token: '002'});
const sophy = new Backbone.Model({id: 3, name: 'Sophy', org_id: 1, token: '003'});
const people = new Backbone.Collection([jane, mark, sophy]);

const indexesMap = {
  fields: {
    by_id: 'id',
    by_token: 'token'
  },
  relations: {
    by_org_id: 'org_id'
  }
};

syncCollections({
  people: {
    collection: people,
    indexes_map: indexesMap
  }
}, store);

/**
  store.getState().people =>

  {
    entities: [
      {id: 1, name: 'Jane', org_id: 1, token: '001', __optimistic_id: 'c01'},
      {id: 2, name: 'Mark', org_id: 2, token: '002', __optimistic_id: 'c02'},
      {id: 3, name: 'Sophy', org_id: 1, token: '003', __optimistic_id: 'c03'}
    ],
    by_id: {
      1: {id: 1, name: 'Jane', org_id: 1, token: '001', __optimistic_id: 'c01'},
      2: {id: 2, name: 'Mark', org_id: 2, token: '002', __optimistic_id: 'c02'},
      3: {id: 3, name: 'Sophy', org_id: 1, token: '003', __optimistic_id: 'c03'}
    },
    by_token: {
      '001': {id: 1, name: 'Jane', org_id: 1, token: '001', __optimistic_id: 'c01'},
      '002': {id: 2, name: 'Mark', org_id: 2, token: '002', __optimistic_id: 'c02'},
      '003': {id: 3, name: 'Sophy', org_id: 1, token: '003', __optimistic_id: 'c03'}
    },
    by_org_id: {
      1: [
        {id: 1, name: 'Jane', org_id: 1, token: '001', __optimistic_id: 'c01'},
        {id: 3, name: 'Sophy', org_id: 1, token: '003', __optimistic_id: 'c03'}
      ],
      2: [
        {id: 2, name: 'Mark', org_id: 2, token: '002', __optimistic_id: 'c02'}
      ]
    }
  }
  */
```

And to remove indexes at all, just pass an empty object as `indexes_map` for `syncCollections`.

#### serializer <a id="serializer"></a>

By default models are stored in the tree by calling `model.toJSON` and adding
an extra `__optimistic_id` which is the `model.cid`. You can serialize extra stuff by defining your own serializer function


##### Arguments

`model` *(Backbone.Model)*: Model to be serialized.

##### Returns

`serialized_model` *(Object)*: Plain object serialization of the model.


### API Reference

#### syncCollections(collectionMap, store, [extraReducers]) <a id="sync-collections"></a>

Builds reducers and setups listeners in collections that dispatch actions to
the store. **syncCollections** will replace existing reducers in your store, but
you can still provide more reducers using the optional **extraReducers**
argument.

##### Arguments
`collectionMap` *(CollectionMap)*: See [collectionMap](#collection-map).

`store` *(Store)*: A Redux store.

[`extraReducers`] *(Object)*: Optionally specify additional reducers in an
object whose values are reducer functions.  These reducers will be merged and combined
together with the ones defined in the collectionMap.

---

#### buildReducers(collectionsMap) <a id="build-reducers"></a>

Creates reducers based on a
[collectionMap](#collection-map),
basically calling [reducerFabric](#reducer-fabric) on each defined reducer.

##### Arguments
`collectionMap` *(CollectionMap)*: See [collectionMap](#collection-map).

##### Returns
`reducers` *(Object)*: An object whose keys are the collection names defined in
the input collectionMap, and values are generated reducer functions.

---

#### buildEars(collectionsMap, store) <a id="build-ears"></a>

Creates the basic action creators using [actionFabric](#action-fabric), and binds them to the
appropriate Backbone.Collection events.

When a collection event happens, the equivalent action will be dispatched.

##### Arguments

`collectionMap` *(CollectionMap)*: See [collectionMap](#collection-map).

`store` *(Store)*: A Redux store.

##### Arguments
`collectionMap` *(CollectionMap)*: See [collectionMap](#collection-map).

---

#### actionFabric(actionTypesMap, serializer) <a id="action-fabric"></a>

Returns an object of action creators functions. This functions can be hooked to
Backbone collections events `add`, `remove`, `change`, and `reset`.

The actions returned by this functions contain an `entities` field with the
serialized models.

##### Arguments

`actionTypesMap` *(Object)*: Object to map from Backbone collection event to
action constant type. Keys must be `ADD`, `REMOVE`, `MERGE` ( for the change
events ) and `RESET`.

`serializer` *(Function)*: Model serializer function.

##### Returns

`actionCreators` *(Object)*: Returns an object whose keys are `add`, `remove`,
`merge` and `reset`, and values are action creator functions.

---

#### reducerFabric(actionTypesMap, [indexesMap]) <a id="reducer-fabric"></a>

`actionTypesMap` *(Object)*: Object to map from Backbone collection event to
action constant type. Keys must be `ADD`, `REMOVE`, `MERGE` ( for the change
events ) and `RESET`.

[`indexesMap`] *(Object)*: Optionally define indices passing an [indexesMap](#indexes-map).

---


### Examples

* [TodoMVC](https://github.com/redbooth/backbone-redux/tree/master/examples/todomvc)

### Licence
MIT
