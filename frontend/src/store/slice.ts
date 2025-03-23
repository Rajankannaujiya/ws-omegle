import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const chatAreaSlice = createSlice({
  name: 'chatArea',
  initialState: {
    showChat: false,
  },
  reducers: {
    // Toggle showChat state
    toggleShowChat: (state) => {
      state.showChat = !state.showChat
    },
    // Set showChat to a specific value
    setShowChat: (state, action:PayloadAction<boolean>) => {
        console.log(action.payload)
      state.showChat = action.payload
    },
  },
})

// Exporting the action creators
export const { toggleShowChat, setShowChat } = chatAreaSlice.actions

// Exporting the reducer
export default chatAreaSlice.reducer
