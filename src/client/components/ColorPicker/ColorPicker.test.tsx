import * as React from 'react';
import { ColorPicker } from './ColorPicker';
import * as renderer from 'react-test-renderer';

describe('ColorPicker', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<ColorPicker color="black" onColorSelect={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
