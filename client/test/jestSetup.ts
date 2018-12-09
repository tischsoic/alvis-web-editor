import { List, Set } from 'immutable';
import diff = require('jest-diff');

function compareInternalId(a, b): -1 | 0 | 1 {
  if (a.internalId < b.internalId) {
    return -1;
  }
  if (a.internalId > b.internalId) {
    return 1;
  }
  return 0;
}

function orderByInternalId(records: List<any> | any[]) {
  return (records as any).sort(compareInternalId);
}

// TODO: try to split it into smaller functions
expect.extend({
  toMatchModel(state, model): { message(): string; pass: boolean } {
    for (const elementsKey of ['pages', 'agents', 'ports', 'connections']) {
      if (model[elementsKey] === undefined) {
        // if model has no defined elements for given key we assume there should be no elements
        if (state.alvisProject[elementsKey].size === 0) {
          continue;
        } else {
          return {
            message: () => `
              There should be no elements under '${elementsKey}' key
              ${this.utils.matcherHint('.toMatchModel')}


              Expected value to be:
                ${this.utils.printExpected(List())}
              Received:
                ${this.utils.printReceived(state.alvisProject[elementsKey])}
            `,
            pass: false,
          };
        }
      }

      const stateRecords: List<any> = orderByInternalId(
        state.alvisProject[elementsKey],
      );
      const modelRecords: any[] = orderByInternalId(model[elementsKey]);

      if (stateRecords.size !== modelRecords.length) {
        return {
          message: () =>
            `The number of items in ${elementsKey} in is not equal to number of elements in model`,
          pass: false,
        };
      }

      for (let i = 0; i < stateRecords.size; i += 1) {
        const stateRecord = stateRecords.get(i);
        const modelRecord = modelRecords[i];

        for (const key in modelRecord) {
          const modelValue = modelRecord[key];
          const stateValue = stateRecord[key];
          const valueIsArray = modelValue instanceof Array;
          const valuesAreEqual = valueIsArray
            ? Set(stateValue).equals(Set(modelValue))
            : stateValue === modelValue;

          if (!valuesAreEqual) {
            // TODO: First find all differences and then fail showing them all
            return {
              message: () => {
                let diffString;

                if (valueIsArray) {
                  diffString = diff(Set(modelValue), Set(stateValue), {
                    expand: (this as any).expand, // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/29578
                  });
                }

                // TODO: use stripIndent: http://2ality.com/2016/05/template-literal-whitespace.html#dedenting-content
                return `
                    ${this.utils.matcherHint('.toMatchModel')}


                    Expected value to be:
                      ${this.utils.printExpected(modelValue)}
                    Received:
                      ${this.utils.printReceived(stateValue)}
                    ${diffString ? `\n\nDifference:\n\n${diffString}` : ''}
                  `;
              },
              pass: false,
            };
          }
        }
      }
    }

    return {
      message: () => `State should not match the model`,
      pass: true,
    };
  },
});
