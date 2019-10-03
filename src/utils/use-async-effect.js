import { useEffect } from 'react';

export default (effect, deps) => {
  useEffect(() => {
    effect();
  }, deps);
};
