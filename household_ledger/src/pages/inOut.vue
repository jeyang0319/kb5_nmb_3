<template>
    <div class="row">
        <div class="col p-3">
            <router-link class="btn btn-primary" to="/todos/add"> 내역 추가 </router-link>
            <button class="btn btn-primary ms-1" @click="fetchInoutList">새로 고침</button>
        </div>
    </div>
    <div class="row">
        <div class="col p-3">
            <ul class="list-group">
                <inoutItem v-for="inoutItem in inoutList" :key="inoutItem.id" :inoutItem="inoutItem" />
            </ul>
        </div>
        <span>완료된 할일 </span>
    </div>
</template>

<script setup>
import { computed } from "vue";
import {useInoutListStore} from "../stores/inoutList.js";
import inoutItem from "../pages/inoutItem.vue"
const inoutListStore = useInoutListStore();
const { fetchInoutList } = inoutListStore;
const inoutList = computed(() => inoutListStore.inoutList)
</script>