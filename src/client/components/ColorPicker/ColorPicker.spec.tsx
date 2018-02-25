import * as React from 'react';
import { ColorPicker } from './ColorPicker';
import * as renderer from 'react-test-renderer';
import { SketchPicker } from 'react-color';
import { Modal } from 'react-bootstrap';

describe('ColorPicker', () => {
  it('returns color', () => {
    const colorPickerRenderer = renderer.create(
      <ColorPicker color="black" onColorSelect={() => {}} />,
    );
    const sketchPickerInstance = colorPickerRenderer.root;

    expect(sketchPickerInstance.findByType(Modal)).not.toEqual(null);
  });
});
