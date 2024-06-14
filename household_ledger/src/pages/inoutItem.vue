<template>
  <table class="table">
    <thead>
      <tr>
        <th scope="col">날짜</th>
        <th scope="col">카테고리</th>
        <th scope="col">금액</th>
        <th scope="col">메모</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="inoutItem in sortedInoutList" :key="inoutItem.id">
        <td>
          {{ inoutItem.date }}
        </td>
        <td>
          {{ getCategoryName(inoutItem.category_id) }}
        </td>
        <td :class="changeColor(inoutItem.category_id)">
          {{ inoutItem.amount }}
        </td>
        <td>
          {{ inoutItem.memo }}
        </td>
        <td>
          <span
            class="float-end badge bg-secondary pointer m-1"
            @click="router.push(`/inout/edit/${inoutItem.id}`)"
          >
            편집</span
          >
          <span
            class="float-end badge bg-secondary pointer m-1"
            @click="deleteInout(inoutItem.id)"
          >
            삭제</span
          >
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useInoutListStore } from "../stores/inoutList.js";
defineProps({
  inoutItem: { Type: Object, required: true },
});
const router = useRouter();
const inoutListStore = useInoutListStore();
const { deleteInout, inoutList } = inoutListStore;

const sortedInoutList = computed(() => {
  return inoutList.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
});

let categoryData = ref([]);
onMounted(() => {
  fetch("/db.json")
    .then((response) => response.json())
    .then((data) => {
      categoryData.value = data.category;
    });
});
const getCategoryName = (categoryId) => {
  const categoryelement = categoryData.value.find(
    (item) => item.id === categoryId
  );
  return categoryelement ? categoryelement.type : "";
};

const changeColor = (isIncome) => {
  if (isIncome >= 8) {
    return "outColor";
  } else {
    return "inColor";
  }
};
</script>

<style scoped>
.inColor {
  color: blue;
}
.outColor {
  color: red;
}
</style>
