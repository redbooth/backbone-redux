/*
 This fabric creates actions object skeleton for passed constants and serializer.
 Useful to create all actions for ear just in one line.
 */
function serializeFabric(serializer, payload) {
  return payload.map(serializer);
}

export default function({ADD, REMOVE, MERGE}, serializer) {
  const serialize = serializeFabric.bind(this, serializer);

  return {
    add(payload) {
      const entities = serialize([].concat(payload));
      return {
        type: ADD,
        entities,
      };
    },

    remove(payload) {
      const entities = [].concat(payload);
      const ids = entities.map(m => m.id);

      return {
        type: REMOVE,
        ids,
      };
    },

    merge(payload) {
      const entities = serialize([].concat(payload));
      return {
        type: MERGE,
        entities,
      };
    },
  };
}
