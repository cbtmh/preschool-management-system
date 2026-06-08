import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  unreadCount: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setUnreadCount, decrementUnread, resetUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
