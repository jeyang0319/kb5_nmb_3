<template>
    <div class="row">
        <div class="col p-3">
            <h2>할일 수정</h2>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div class="form-group">
                <label htmlFor="todo">날짜:</label>
                <input type="text" class="form-control" id="date" v-model="inoutItem.date" />
            </div>
            <div class="form-group">
                <label htmlFor="desc">카테고리:</label>
                <textarea class="form-control" rows="3" id="category_id" v-model="inoutItem.category_id"></textarea>
            </div>
            <div class="form-group">
                <label htmlFor="done">금액 : </label>
                <input type="text" class="form-control" id="amount" v-model="inoutItem.amount" />
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-primary m-1" @click="updateInoutHandler">수 정</button>
                <button type="button" class="btn btn-primary m-1" @click="router.push('/inout')">취 소</button>
            </div>
        </div>
    </div>
</template>


<script setup>
import { reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import {useInoutListStore} from "../stores/inoutList.js";
const router = useRouter();
const currentRoute = useRoute();
const { inoutList, updateInout } = useInoutListStore();
const matchedInoutItem = inoutList.find((item) => item.id === currentRoute.params.id);
if (!matchedInoutItem) {
    router.push("/budget");
}
const inoutItem = reactive({ ...matchedInoutItem });
const updateInoutHandler = () => {
    let { date } = inoutItem;
    if (!date || date.trim() === "") {
        alert("할일은 반드시 입력해야 합니다");
        return;
    }
    updateInout({ ...inoutItem }, () => {
        router.push("/inout");
    });
};
</script>
