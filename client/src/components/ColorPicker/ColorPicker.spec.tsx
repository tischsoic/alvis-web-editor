import * as React from 'react';
import { ColorPicker } from './ColorPicker';
import * as renderer from 'react-test-renderer';
import { SketchPicker } from 'react-color';
import { Button } from 'react-bootstrap';

describe('ColorPicker', () => {
  it('displays button', () => {
    const colorPickerRenderer = renderer.create(
      <ColorPicker color="black" onColorSelect={() => {}} />,
    );
    const sketchPickerInstance = colorPickerRenderer.root;

    expect(sketchPickerInstance.findByType(Button)).toBeDefined();
  });
});
