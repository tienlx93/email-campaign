import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

export const useAppDispatch = () => useDispatch<AppDispatch>();
