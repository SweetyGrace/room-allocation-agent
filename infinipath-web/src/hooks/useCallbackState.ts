import { SetStateAction, useEffect, useRef, useState } from "react";

type Callback<T> = (state: T) => void;

const useCallbackState = <T>(
  initialValue: T,
): [T, (newValue: SetStateAction<T>, callback?: Callback<T>) => void] => {
  const [state, _setState] = useState<T>(initialValue);
  const callbackQueue = useRef<Callback<T>[]>([]);

  useEffect(() => {
    callbackQueue.current.forEach((cb) => cb(state));
    callbackQueue.current = [];
  }, [state]);

  const setState = (newValue: SetStateAction<T>, callback?: Callback<T>) => {
    _setState(newValue);
    if (callback && typeof callback === "function") {
      callbackQueue.current.push(callback);
    }
  };

  return [state, setState];
};

export default useCallbackState;
