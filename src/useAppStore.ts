import { create } from "zustand";



interface AppState {
  broadcastChannel: BroadcastChannel | null
  setBroadcastChannel: (broadcastChannel: BroadcastChannel) => void
}

const useAppStore = create<AppState>()((set) => ({
  broadcastChannel: null,
  setBroadcastChannel: (broadcastChannel) => set({ broadcastChannel })
}));

export default useAppStore;
