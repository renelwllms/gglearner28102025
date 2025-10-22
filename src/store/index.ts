import defaultSettings from '../settings.json';
import { createStore } from 'redux';
export interface GlobalState {
  settings?: typeof defaultSettings;
  userInfo?: {
    name?: string;
    avatar?: string;
    job?: string;
    organization?: string;
    location?: string;
    email?: string;
    permissions: Record<string, string[]>;
    role:string;
  };
  userLoading?: boolean;
  token?: string;
  isAdmin?: boolean;
  tutorOption?: any[];
  courseOption?: any[];
}

const initialState: GlobalState = {
  settings: defaultSettings,
  userInfo: {
    permissions: {},
    role:'',
  },
  token: '',
  isAdmin: false,
  tutorOption: [],
  courseOption: [],
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'tutorOption': {
      const { tutorOption } = action.payload;
      return {
        ...state,
        tutorOption,
      };
    }

    case 'courseOption': {
      const { courseOption } = action.payload;
      return {
        ...state,
        courseOption,
      };
    }

    case 'update-settings': {
      const { settings } = action.payload;
      return {
        ...state,
        settings,
      };
    }
    case 'update-userInfo': {
      const {
        userInfo = initialState.userInfo,
        userLoading,
        token,
        isAdmin,
      } = action.payload;
      return {
        ...state,
        userLoading,
        userInfo,
        token,
        isAdmin,
      };
    }

    default:
      return state;
  }
}

const store = createStore(rootReducer);

export default store;
