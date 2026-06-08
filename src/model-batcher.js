import defer from 'lodash.defer';

/**
 * This class is responsible of batching events of a given type, so when many
 * happen at once (e.g. during a fetch), a single action is triggered with all
 * the models, instead of once per model.
 */
export default class ModelBatcher {
  constructor({ handle }) {
    this.models = [];
    this.handle = handle;
  }

  add(model) {
    this.flushAfter();
    this.models.push(model);
  }

  flushAfter() {
    if (this.models.length > 0) {
      return;
    }

    defer(() => this.flush());
  }

  flush() {
    this.handle(this.models);
    this.models = [];
  }
}
