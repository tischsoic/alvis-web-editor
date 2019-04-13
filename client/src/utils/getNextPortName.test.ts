import { getNextPortName } from './getNextPortName';

describe('getNextPortName', () => {
  it('returns proper name', () => {
    const portsNames = ['af_123', 'asd', 'port__123', 'port_011', 'port_9'];

    expect(getNextPortName(portsNames)).toEqual('port_12');
  });
});
