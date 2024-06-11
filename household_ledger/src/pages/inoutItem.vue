<template>
    <li>
        {{inoutItem.date}}
        {{inoutItem.amount}}
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

</script>