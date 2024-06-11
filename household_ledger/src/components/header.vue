<template>
    <nav class="navbar navbar-expand-sm bg-dark navbar-dark">
        <span class="navbar-brand ps-2">HOUSERHOLD</span>
        <button class="navbar-toggler" type="button" @click="isNavShow = !isNavShow">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div :class="isNavShow ? 'collapse navbar-collapse show' : 'collapse navbar-collapse'">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <router-link class="nav-link" to="/">Calender</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/inout">InOut</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/report">Report</router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script setup>
import { ref } from "vue";

const isNavShow = ref(false);
</script>
