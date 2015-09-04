import groupBy from 'lodash.groupby';
import compact from 'lodash.compact';
import flatten from 'lodash.flatten';

export function buildIndex(entities, field) {
  return entities.reduce((acc, entity) => (acc[entity[field]] = entity, acc), {});
}

export function buildRelation(entities, field) {
  return groupBy(entities, field);
}

export function addEntities(currentEntities, newEntities) {
  return [...currentEntities, ...newEntities];
}

export function removeEntities(currentEntities, removedIds) {
  const ids = compact(flatten(removedIds));
  return currentEntities.filter(entity => {
    return (ids.indexOf(entity.id) < 0) && (ids.indexOf(entity.__optimistic_id) < 0);
  });
}
