import mxgraph = require('mxgraph');
import { publicStaticBase } from '../serverApi';

export const mx: mxgraph.allClasses = mxgraph({
  mxImageBasePath: publicStaticBase + 'mxgraph/images',
  mxBasePath: publicStaticBase + 'mxgraph',
});
