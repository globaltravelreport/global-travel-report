import * as React from 'react';
import { ToastAction } from '@/components/ui/toast';

// Define the ToastProps type
export interface ToastProps {
  id: string;
  variant?: 'default' | 'destructive';
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  open?: boolean;
}

// Define the ToastActionElement type
export type ToastActionElement = React.ReactElement<typeof ToastAction>;

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

export type Toast = Partial<ToastProps> & {
  id: string;
  variant?: 'default' | 'destructive';
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  icon?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: Omit<Toast, 'id'>;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<Toast> & Pick<Toast, 'id'>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: Toast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: Toast['id'];
    };

interface State {
  toasts: Toast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [
          { id: genId(), ...action.toast },
          ...state.toasts.slice(0, TOAST_LIMIT - 1),
        ],
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || !toastId
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast({ ...props }: Omit<Toast, 'id'>) {
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: props,
  });
}

toast.update = (toastId: string, props: Partial<Toast>) => {
  dispatch({
    type: actionTypes.UPDATE_TOAST,
    toast: { id: toastId, ...props },
  });
};

toast.dismiss = (toastId?: string) => {
  dispatch({
    type: actionTypes.DISMISS_TOAST,
    toastId,
  });
};

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}