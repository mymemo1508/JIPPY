// src/redux/slices/chatSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { StoreChat, Message } from "@/features/chat/types/chat";

export interface ChatState {
  chatList: StoreChat[];
  messages: { [storeId: number]: Message[] };
  selectedChatRoom: StoreChat | null;
}

const initialState: ChatState = {
  chatList: [],
  messages: {},
  selectedChatRoom: null,
};

export const fetchChatList = createAsyncThunk<StoreChat[], number>(
  "chat/fetchChatList",
  async (userId: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${userId}`);
    if (!response.ok) {
      throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
    }
    const data = await response.json();
    return data.data as StoreChat[];
  }
);

export const fetchMessages = createAsyncThunk<
  { storeId: number; messages: Message[] },
  { userId: number; storeId: number }
>(
  "chat/fetchMessages",
  async ({ userId, storeId }: { userId: number; storeId: number }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${userId}/select/${storeId}`
    );
    if (!response.ok) {
      throw new Error("메시지 목록을 불러오는데 실패했습니다.");
    }
    const data = await response.json();
    return { storeId, messages: data.data as Message[] };
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChatRoom(state, action: PayloadAction<StoreChat>) {
      state.selectedChatRoom = action.payload;
    },
    // messageId를 기준으로 중복 메시지 추가를 방지합니다.
    addReceivedMessage(state, action: PayloadAction<{ storeId: number; message: Message }>) {
      const { storeId, message } = action.payload;
      if (!state.messages[storeId]) {
        state.messages[storeId] = [];
      }
      const exists = state.messages[storeId].some(
        (m) => m.messageId === message.messageId
      );
      if (!exists) {
        state.messages[storeId].push(message);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatList.fulfilled, (state, action: PayloadAction<StoreChat[]>) => {
      state.chatList = action.payload;
    });
    builder.addCase(
      fetchMessages.fulfilled,
      (state, action: PayloadAction<{ storeId: number; messages: Message[] }>) => {
        const { storeId, messages } = action.payload;
        state.messages[storeId] = messages;
      }
    );
  },
});

export const { setSelectedChatRoom, addReceivedMessage } = chatSlice.actions;
export default chatSlice.reducer;
