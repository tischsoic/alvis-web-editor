import { List } from 'immutable';
import { separateBy } from './separateBy';

describe('separateBy', () => {
  it('separates by isEven predicate', () => {
    function isEven(number: number): boolean {
      return number % 2 === 0;
    }

    const mixedNumbers = List([1, 2, 4, 67, 12, 56, 9, 1]);
    const [evenNumbers, notEvenNumbers] = separateBy(mixedNumbers, isEven);

    expect(evenNumbers).toEqual(List([2, 4, 12, 56]));
    expect(notEvenNumbers).toEqual(List([1, 67, 9, 1]));
  });
});
