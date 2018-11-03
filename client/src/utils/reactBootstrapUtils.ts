export function getValidationState(state: boolean | null) {
  if (state === null) {
    return null;
  }

  return state ? 'success' : 'error';
}
