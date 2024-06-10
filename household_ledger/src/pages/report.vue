<template>
    <div>
        <h2>전체</h2>
        <canvas id="myChart"></canvas>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);
onMounted(() => {
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new ChartJS(ctx, {
        type: 'bar',
        data: {
            labels: [
                '1월',
                '2월',
                '3월',
                '4월',
                '5월',
                '6월',
                '7월',
                '8월',
                '9월',
                '10월',
                '11월',
                '12월',
            ], // x축
            datasets: [
                // y축
                {
                    label: '월말 결산',
                    data: [20, 100, 100000, 2999999, 500000000],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
});
</script>