import defer from 'lodash.defer';

/**
 * This class is responsible of batching adds, so when a fetch happens, a
 * single ADD action is triggered, instead of once per model.
 */
export default class ModelAddBatcher {
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
