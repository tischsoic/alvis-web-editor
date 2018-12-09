declare namespace jest {
    interface Matchers<R> {
      toMatchModel(value: object): R;
    }
  }
  