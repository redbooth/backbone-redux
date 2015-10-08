/*
 This fabric creates actions object skeleton for passed constants and serializer.
 Useful to create all actions for ear just in one line.
 */
function serializeFabric(serializer, payload) {
  return [].concat(payload).map(serializer);
}

export default function({ADD, REMOVE, MERGE, RESET}, serializer) {
  const serialize = serializeFabric.bind(this, serializer);

  return {
    add(payload) {
      return {
        type: ADD,
        entities: serialize(payload),
      };
    },

    remove(payload) {
      return {
        type: REMOVE,
        entities: serialize(payload),
      };
    },

    merge(payload) {
      return {
        type: MERGE,
        entities: serialize(payload),
      };
    },

    reset(payload) {
      return {
        type: RESET,
        entities: serialize(payload),
      };
    },
  };
}
