export function getNextPortName(portsNames: string[]): string {
  const defaultPortNumberRegexp = /port_(\d+)/;
  const defaultPortsNumbers = portsNames
    .map((portName) => portName.match(defaultPortNumberRegexp))
    .filter((el) => el !== null)
    .map((match) => parseInt(match[1], 10));
  const portNumber = Math.max(...defaultPortsNumbers) + 1;

  return `port_${portNumber}`;
}
