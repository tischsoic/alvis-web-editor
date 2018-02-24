import { Store } from 'redux';
import { RootState } from '../reducers';

export default function loggerMiddleware(store: Store<RootState>) {
  return (next: any) => (action: any) => {
    console.log(action);
    return next(action);
  };
}
