import {configureStore} from '@reduxjs/toolkit';
import jobsReducer from "./slices/jobSlice"
import userReducer from "./slices/userSlice"
import applicationReducer from "./slices/applicationSlice"
import updateProfileReducer from "./slices/updateProfileSlice"

const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    user: userReducer,
    applications: applicationReducer,
    updateProfile: updateProfileReducer, 
  },
});

export default store;