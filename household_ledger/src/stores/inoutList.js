import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

export const useInoutListStore = defineStore("inoutList", () => {
  const BASEURI = "/api/budget";
  const state = reactive({ inoutList: [] });
  // InoutList 목록을 조회합니다.
  const fetchInoutList = async () => {
    try {
      const response = await axios.get(BASEURI);
      if (response.status === 200) {
        state.inoutList = response.data;
      } else {
        alert("데이터 조회 실패");
      }
    } catch (error) {
      alert("에러발생 : " + error);
    }
  };

  const inoutList = computed(() => state.inoutList);
  return {inoutList, fetchInoutList};
});
