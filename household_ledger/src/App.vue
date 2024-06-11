
<template>
  <div class="container">
  <Header />
  <router-view/>
  </div>
</template>


<script setup>
import { computed } from "vue";
import { RouterLink, RouterView } from 'vue-router'
import Header from "@/components/header.vue";
import {useInoutListStore} from "@/stores/inoutList.js";
const inoutListStore = useInoutListStore();
const fetchInoutList = inoutListStore.fetchInoutList;
fetchInoutList();
</script>