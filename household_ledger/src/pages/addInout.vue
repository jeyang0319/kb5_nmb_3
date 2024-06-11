<template>
    <div class="row">
        <div class="col p-3">
            <h2>할일 추가</h2>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div class="form-group">
                <label htmlFor="todo">날짜 :</label>
                <input type="text" class="form-control" id="todo" v-model="inoutItem.date" />
            </div>
            <div class="form-group">
                <label htmlFor="desc">금액 :</label>
                <textarea class="form-control" rows="3" id="desc" v-model="inoutItem.amount"></textarea>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-primary m-1" @click="addInoutHandler">추 가</button>
                <button type="button" class="btn btn-primary m-1" @click="router.push('/budget')">취 소</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import {useInoutListStore} from "../stores/inoutList.js"
const router = useRouter();
const { addInout } = useInoutListStore();
const inoutItem = reactive({date: "", category_id: 0, amount: 0, memo: ""})
const addInoutHandler = () => {
    let { date } = inoutItem;
    if (!date || date.trim() === "") {
        alert("할일은 반드시 입력해야 합니다");
        return;
    }
    addInout({ ...inoutItem }, () => {
        router.push("/inout");
    });
};
</script>
