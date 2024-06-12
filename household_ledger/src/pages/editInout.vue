<template>
    <div class="row">
        <div class="col p-3">
            <h2>내역 수정</h2>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div class="form-group">
                <label htmlFor="todo">날짜:</label>
                <input type="text" class="form-control" id="date" v-model="inoutItem.date" />
            </div>
            <div class="form-group">
                <label htmlFor="desc"> 카테고리:</label>
                <select class="form-select" v-model="inoutItem.type">
                    <option value="salary">salary</option>
                    <option value="food">food</option>
                    <option value="expense">expense</option>
                    <option value="allowance">allowance</option>
                    <option value="refund">refund</option>
                    <option value="etc">etc</option>
                    <option value="traffic">traffic</option>
                    <option value="utility">utility</option>
                    <option value="housing">housing</option>
                    <option value="entertain">entertain</option>
                    <option value="interest">interest</option>
                    <option value="insurance">insurance</option>
                </select>
            </div>
            <div class="form-group">
                <label htmlFor="done">금액 : </label>
                <input type="text" class="form-control" id="amount" v-model="inoutItem.amount" />
            </div>


            <div class="form-check">
                <input class="form-check-input" type="radio" name="isCash" id="isCashT" v-model="inoutItem.is_cash" :value="true">
                <label class="form-check-label" for="isCashT">
                    현금
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="isCash" id="isCashF" v-model="inoutItem.is_cash" :value="false">
                <label class="form-check-label" for="isCashF">
                    카드
                </label>
            </div>
            <br>

            <div class="form-check">
                <input class="form-check-input" type="radio" name="isIncome" id="isIncomeT" v-model="inoutItem.is_income" :value="true">
                <label class="form-check-label" for="isIncomeT">
                    수입
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="isIncome" id="isIncomeF" v-model="inoutItem.is_income" :value="false">
                <label class="form-check-label" for="isIncomeF">
                    지출
                </label>
            </div>

            <div class="form-group">
                <label for="limited-textarea">메모 (최대 50자):</label><br>
                <textarea v-model="inoutItem.memo" id="limited-textarea" rows="4" cols="50" :maxlength="maxLength"></textarea>
                <div class="char-counter">{{ inoutItem.memo.length }}/{{ maxLength }}</div>
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
const maxLength = 50;
const updateInoutHandler = () => {
    let { date, memo } = inoutItem;
    if (!date || date.trim() === "") {
        alert("할일은 반드시 입력해야 합니다");
        return;
    }
    if (memo.length > maxLength) {
        alert(`메모는 최대 ${maxLength}자까지 입력할 수 있습니다.`);
        return;
    }
    updateInout({ ...inoutItem }, () => {
        router.push("/inout");
    });
};
</script>
