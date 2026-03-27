import { useSelector } from 'react-redux';
import type { RootState } from './index';

export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
