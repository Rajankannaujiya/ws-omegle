import { configureStore } from '@reduxjs/toolkit'
import chatAreaReducer from '../store/slice'

const store =  configureStore({
  reducer: {
    chatArea:chatAreaReducer
  }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;