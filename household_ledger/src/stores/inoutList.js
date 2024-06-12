import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

export const useInoutListStore = defineStore("inoutList", () => {
  const BASEURI = "/api/budget";
  const BASECAT = "/api/category"
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

  const addInout = async ({date, category_id, amount, memo, id, type, is_income, is_cash}, successCallback) => {
    try {
      const cat = {id, type, is_income, is_cash}
      const payload = {date, category_id, amount, memo};
      // if ((cat.is_cash == true) && (cat.is_income == true)) {
      //   payload.category_id = "5"
      // }

      const category = await axios.get(BASECAT);
      console.log(category)

      const matchedCategory = category.data.find(cat => cat.is_income === is_income && cat.type === type && cat.is_cash === is_cash);
      if (matchedCategory) {
        payload.category_id = matchedCategory.id;
        console.log(payload.category_id)
      }

      const date2 = new Date(date).toISOString();

      payload.date = date2.slice(0,10)
      
      const response = await axios.post(BASEURI, payload);
      if (response.status === 201) {
        state.inoutList.push({...response.data});
        successCallback();
      } else {
        alert("Todo 추가 실패");
      }
    } catch (error) {
      alert("에러 발생: "+ error);
    }
  };

  const updateInout = async ({date, category_id, amount, memo, id, type, is_income, is_cash}, successCallback) => {
    try {
      const payload = {id, date, category_id, amount, memo};

      const category = await axios.get(BASECAT);
      console.log(category)

      const matchedCategory = category.data.find(cat => cat.is_income === is_income && cat.type === type && cat.is_cash === is_cash);
      if (matchedCategory) {
        payload.category_id = matchedCategory.id;
        console.log(payload.category_id)
      }
      
      const cat = {id, type, is_income, is_cash};
      const response = await axios.put(BASEURI + `/${id}`, payload);

      
      if (response.status === 200) {
        let index = state.inoutList.findIndex((inout) => inout.id === id);
        console.log(index)
        state.inoutList[index] = payload;
        successCallback();
      } else {
        alert("Todo 변경 실패")
      }
    } catch (error) {
      alert("에러발생:" + error);
    }
  };

  const deleteInout = async (id) => {
    try {
      const response = await axios.delete(BASEURI + `/${id}`);
      console.log(response)
      if (response.status === 200) {
        let index = state.inoutList.findIndex((inout) => inout.id === id);
        console.log(index)
        state.inoutList.splice(index, 1);
      } else {
        alert("Todo 실패")
      }
    } catch(error) {
      alert("에러 발생 : " + error);
    }
  };

  const inoutList = computed(() => state.inoutList);
  return {inoutList, fetchInoutList, addInout, deleteInout, updateInout};
});
