
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
</script>