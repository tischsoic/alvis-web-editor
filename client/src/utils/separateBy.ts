import { List } from 'immutable';

export function separateBy<T>(
  list: List<T>,
  predicateFn: (el: T) => boolean,
): [List<T>, List<T>] {
  return list.reduce<[List<T>, List<T>]>(
    ([satisfying, notSatisfying], element) =>
      predicateFn(element)
        ? [satisfying.push(element), notSatisfying]
        : [satisfying, notSatisfying.push(element)],
    [List(), List()],
  );
}
