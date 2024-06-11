<template>
    <li>
        <span>
        {{inoutItem.date}}
        {{inoutItem.amount}}
        </span>
        <span class="float-end badge bg-secondary pointer m-1" @click="router.push(`/inout/edit/${inoutItem.id}`)"> 편집</span>
        <span class="float-end badge bg-secondary pointer m-1" @click="deleteInout(inoutItem.id)"> 삭제</span>
        
    </li>
</template>

<script setup>
import {useRouter} from "vue-router";
import {useInoutListStore} from "../stores/inoutList.js"
defineProps({
    inoutItem: {Type:Object, required: true},
});
const router = useRouter()
const inoutListStore = useInoutListStore();
const {deleteInout} = inoutListStore;
</script>