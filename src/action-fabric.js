/*
 This fabric creates actions object skeleton for passed constants and serializer.
 Useful to create all actions for ear just in one line.
 */
function serializeFabric(serializer, payload) {
  return payload.map(serializer);
}

export default function({ADD, REMOVE, MERGE, RESET}, serializer) {
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

      return {
        type: REMOVE,
        entities,
      };
    },

    merge(payload) {
      const entities = serialize([].concat(payload));
      return {
        type: MERGE,
        entities,
      };
    },

    reset(payload) {
      const entities = serialize([].concat(payload));
      return {
        type: RESET,
        entities,
      };
    },
  };
}
