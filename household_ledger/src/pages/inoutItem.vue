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
            <tr v-for="inoutItem in inoutList" :key="inoutItem.id">
                <td>{{ inoutItem.date }}</td>
                <td>{{ inoutItem.category_id }}</td>
                <td>{{ inoutItem.amount }}</td>
                <td>{{ inoutItem.memo }}</td>
                
                <td>
                    <span class="float-end badge bg-secondary pointer m-1" @click="router.push(`/inout/edit/${inoutItem.id}`)"> 편집</span>
                    <span class="float-end badge bg-secondary pointer m-1" @click="deleteInout(inoutItem.id)"> 삭제</span>
                </td>
            </tr>
        </tbody>
    </table>


</template>

<script setup>
import {useRouter} from "vue-router";
import {useInoutListStore} from "../stores/inoutList.js"
defineProps({
    inoutItem: {Type:Object, required: true},
});
const router = useRouter()
const inoutListStore = useInoutListStore();
const {deleteInout, inoutList} = inoutListStore;
</script>