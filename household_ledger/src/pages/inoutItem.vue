<template>
  <div>
      <nav aria-label="Page navigation" class="pagination-bar">
          <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)"><</a>
              </li>
              <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">></a>
              </li>
          </ul>
      </nav>
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
              <tr v-for="inoutItem in paginatedInoutList" :key="inoutItem.id">
                  <td>{{ inoutItem.date }}</td>
                  <td>{{ getCategoryName(inoutItem.category_id) }}</td>
                  <td :class="changeColor(inoutItem.category_id)">{{ inoutItem.amount }}</td>
                  <td>{{ inoutItem.memo }}</td>
                  <td>
                      <span
                          class="float-end badge bg-secondary pointer m-1"
                          @click="router.push(`/inout/edit/${inoutItem.id}`)"
                      >
                          편집
                      </span>
                      <span
                          class="float-end badge bg-secondary pointer m-1"
                          @click="deleteInout(inoutItem.id)"
                      >
                          삭제
                      </span>
                  </td>
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInoutListStore } from '../stores/inoutList.js';

const router = useRouter();
const inoutListStore = useInoutListStore();
const { deleteInout, inoutList } = inoutListStore;

const itemsPerPage = 10;
const currentPage = ref(1);

const sortedInoutList = computed(() => {
  return inoutList
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const paginatedInoutList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedInoutList.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedInoutList.value.length / itemsPerPage);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
  }
};

// 06.13 카테고리 타입 추가수정본
let categoryData = ref([]);
onMounted(() => {
  fetch('/db.json')
      .then((response) => response.json())
      .then((data) => {
          categoryData.value = data.category;
      });
});
const getCategoryName = (categoryId) => {
  const categoryelement = categoryData.value.find(
      (item) => item.id === categoryId
  );
  return categoryelement ? categoryelement.type : '';
};

const changeColor = (isIncome) => {
  if (isIncome >= 8) {
      return 'outColor';
  } else {
      return 'inColor';
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
.pagination-bar {
  position: fixed;
  bottom: 0;
  width: 50%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 10px 0;
  box-shadow: 0 -0px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  z-index: 1000;
}
.page-link {
color: #000;
background-color: #fff;
border: 1px solid #ccc;
}
.page-item.active .page-link {
z-index: 1;
color: #555;
font-weight:bold;
background-color: #F1F1F1;
border-color: #ccc;
}
.page-link:focus, .page-link:hover {
color: #000;
background-color: #FAFAFA;
border-color: #ccc;
}
</style>
