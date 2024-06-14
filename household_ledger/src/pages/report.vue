<template>
    <div>
        <h2>Total</h2>
        <canvas id="myChart"></canvas>
    </div>
</template>
<script>
import Chart from 'chart.js/auto';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
export default {
    mounted() {
        const ctx = document.getElementById('myChart');
        const myChart = new Chart(ctx, {
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
                    '12월'
                ], //x축
                datasets: [
                    //y축
                    {
                        label : "수입" ,label: "지출",
                        data: [13333,333313113],
                        borderWidth: 1,
                    },
                ],
                datasets: [
                    //y축
                    {
                        label : "지출",
                        data: [111.222,1111.],
                        borderWidth: 2,
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
    },
};
</script>