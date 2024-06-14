<template>
  <div class="container">
    <Header />
    <router-view />
  </div>
  <div>
    <button class="fixed-button badge rounded-pill bg-dark" @click="addHandler">
      추가
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, RouterView } from "vue-router";
import Header from "@/components/header.vue";
import { useInoutListStore } from "@/stores/inoutList.js";
const inoutListStore = useInoutListStore();
const fetchInoutList = inoutListStore.fetchInoutList;
fetchInoutList();

import { useRouter } from "vue-router";
const router = useRouter();

const addHandler = () => {
  router.push("/inout/add");
};
</script>

<style>
.fixed-button {
  position: fixed;
  bottom: 100px;
  right: 100px;
}
</style>
