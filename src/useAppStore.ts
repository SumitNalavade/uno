import { create } from "zustand";
import { v4 as uuid} from "uuid";

interface AppState {
}

const useAppStore = create<AppState>()(() => ({
}));

export default useAppStore;
