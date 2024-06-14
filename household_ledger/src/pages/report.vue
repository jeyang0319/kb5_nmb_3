<template>
  <div class="charts-container">
    <div class="left-section">
      <div class="controls">
        <button class="btn btn-secondary btn-xs" @click="changeMonth(-1)">
          &lt;
        </button>
        <button class="btn btn-secondary btn-xs" @click="changeMonth(0)">
          {{ formattedYear }} 년
        </button>
        <button class="btn btn-secondary btn-xs" @click="changeMonth(1)">
          &gt;
        </button>
      </div>
      <div class="chart-wrapper pie-wrapper">
        <canvas id="pieChart"></canvas>
      </div>
      <div class="profile-section">
        <div class="profile-image-wrapper">
          <img
            :src="profile.imageUrl"
            alt="Profile Picture"
            class="profile-picture"
          />
          <label
            for="profile-upload"
            class="upload-icon"
            @dblclick="triggerUpload"
          >
            <input
              id="profile-upload"
              type="file"
              @change="onImageChange"
              accept="image/*"
              class="profile-upload"
            />
            <i class="fa fa-camera"></i>
          </label>
        </div>
        <div class="profile-info">
          <p class="profile-name">{{ profile.name }}</p>
          <p class="profile-email">{{ profile.email }}</p>
        </div>
        <div class="notepad-section">
          <textarea
            v-model="profile.note"
            placeholder="상태 메시지..."
            class="notepad"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="right-section">
      <div class="chart-wrapper bar-wrapper">
        <canvas id="barChart"></canvas>
      </div>
      <div class="form-check mt-3">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="showSummary"
          id="showSummaryCheck"
        />
        <label class="form-check-label" for="showSummaryCheck">
          월별 요약 나타내기
        </label>
      </div>
      <div class="summary-section" v-if="showSummary">
        <h2>{{ currentDate.getMonth() + 1 }}월별 요약</h2>
        <table class="summary-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>수입</th>
              <th>지출</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(summary, index) in summaries" :key="index">
              <td>{{ summary.day }} 일</td>
              <td
                :style="{
                  color: summary.income !== 0 ? 'blue' : 'inherit',
                }"
              >
                {{ formatCurrencyWithSign(summary.income, true) }}
              </td>
              <td
                :style="{
                  color: summary.expense !== 0 ? 'red' : 'inherit',
                }"
              >
                {{ formatCurrencyWithSign(summary.expense, false) }}
              </td>
              <td>{{ summary.memo }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>총합</td>
              <td
                :style="{
                  color: totalIncome !== 0 ? 'blue' : 'inherit',
                }"
              >
                {{ formatCurrencyWithSign(totalIncome, true) }}
              </td>
              <td
                :style="{
                  color: totalExpense !== 0 ? 'red' : 'inherit',
                }"
              >
                {{ formatCurrencyWithSign(totalExpense, false) }}
              </td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4">
                총합 합계:
                {{ formatCurrencyWithSign(netTotal, netTotal >= 0) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { Chart as ChartJS, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(...registerables, ChartDataLabels);

const currentDate = ref(new Date());

const formattedYear = computed(() => currentDate.value.getFullYear());
const formattedMonth = computed(() => currentDate.value.getMonth() + 1);

let pieChartInstance = null;
let barChartInstance = null;

const profile = ref({
  imageUrl: "https://via.placeholder.com/280",
  note: "",
});

const summaries = ref([]);
const totalSum = ref(0);
const totalIncome = ref(0);
const totalExpense = ref(0);
const monthlySummaries = ref([]);
const showSummary = ref(true);

const fetchData = async (date) => {
  const response = await fetch("/db.json");
  const data = await response.json();
  const categories = data.category.reduce((acc, category) => {
    acc[category.id] = category.is_income;
    return acc;
  }, {});
  const filteredData = data.budget.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === date.getFullYear() &&
      itemDate.getMonth() === date.getMonth()
    );
  });

  const aggregatedData = filteredData.reduce((acc, item) => {
    const itemDate = new Date(item.date);
    const day = itemDate.getDate();
    if (!acc[day]) {
      acc[day] = { day: day, total: 0, income: 0, expense: 0, memo: [] };
    }
    const amount = parseFloat(item.amount);
    acc[day].total += amount;
    if (categories[item.category_id]) {
      acc[day].income += amount;
    } else {
      acc[day].expense += amount;
    }
    acc[day].memo.push(item.memo);
    return acc;
  }, {});

  summaries.value = Object.values(aggregatedData).map((summary) => ({
    ...summary,
    memo: summary.memo.join(", "),
  }));
  totalSum.value = summaries.value.reduce(
    (acc, summary) => acc + summary.total,
    0
  );
  totalIncome.value = summaries.value.reduce(
    (acc, summary) => acc + summary.income,
    0
  );
  totalExpense.value = summaries.value.reduce(
    (acc, summary) => acc + summary.expense,
    0
  );

  const monthData = data.budget.reduce((acc, item) => {
    const itemDate = new Date(item.date);
    const month = itemDate.getMonth();
    if (!acc[month]) {
      acc[month] = { month: month + 1, income: 0, expense: 0, total: 0 };
    }
    const amount = parseFloat(item.amount);
    if (categories[item.category_id]) {
      acc[month].income += amount;
    } else {
      acc[month].expense += amount;
    }
    acc[month].total = acc[month].income - acc[month].expense;
    return acc;
  }, {});

  monthlySummaries.value = Object.values(monthData).sort(
    (a, b) => a.month - b.month
  );

  return {
    incomeData: totalIncome.value,
    expenseData: totalExpense.value,
    labels: ["수입", "지출"],
    backgroundColors: ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)"],
    borderColors: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
  };
};

const createChart = (
  ctx,
  type,
  labels,
  data,
  backgroundColors,
  borderColors,
  displayLegend = true,
  datasetLabel = ""
) => {
  return new ChartJS(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: datasetLabel,
          data: data,
          borderWidth: 1,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          hoverOffset: type === "pie" ? 50 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales:
        type === "bar"
          ? {
              x: {
                ticks: {
                  callback: function (value, index, values) {
                    return labels[index];
                  },
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return formatCurrency(value);
                  },
                },
              },
            }
          : {},
      plugins: {
        legend: {
          display: displayLegend,
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.raw !== null) {
                label += formatCurrency(context.raw);
              }
              return label;
            },
          },
        },
        datalabels: {
          display: false,
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: false,
        animationDuration: 400,
      },
    },
  });
};

const createMonthlyChart = (ctx, labels, data) => {
  return new ChartJS(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "수입",
          data: data.map((item) => item.income),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "지출",
          data: data.map((item) => item.expense),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "총합",
          data: data.map((item) => item.total),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatCurrency(value);
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.raw !== null) {
                label += formatCurrency(context.raw);
              }
              return label;
            },
          },
        },
        datalabels: {
          display: false,
        },
      },
    },
  });
};

const updateCharts = async (date) => {
  const { incomeData, expenseData, labels, backgroundColors, borderColors } =
    await fetchData(date);
  if (pieChartInstance) {
    pieChartInstance.destroy();
  }
  if (barChartInstance) {
    barChartInstance.destroy();
  }
  const pieCtx = document.getElementById("pieChart").getContext("2d");
  pieChartInstance = createChart(
    pieCtx,
    "pie",
    labels,
    [incomeData, expenseData],
    backgroundColors,
    borderColors,
    true,
    "수입과 지출"
  );

  const barCtx = document.getElementById("barChart").getContext("2d");
  const monthlyLabels = monthlySummaries.value.map((item) => `${item.month}월`);
  barChartInstance = createMonthlyChart(
    barCtx,
    monthlyLabels,
    monthlySummaries.value
  );
};

const changeMonth = (offset) => {
  if (offset === 0) {
    currentDate.value = new Date();
  } else {
    currentDate.value.setMonth(currentDate.value.getMonth() + offset);
  }
  updateCharts(currentDate.value);
};

onMounted(() => {
  updateCharts(currentDate.value);
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(value);
};

const formatCurrencyWithSign = (value, isIncome) => {
  if (value === 0) {
    return formatCurrency(value);
  }
  const sign = isIncome ? "+" : "-";
  if (value < 0) {
    return `${formatCurrency(value)}`;
  }
  return `${sign}${formatCurrency(value)}`;
};

const onImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profile.value.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const triggerUpload = () => {
  document.getElementById("profile-upload").click();
};

const netTotal = computed(() => totalIncome.value - totalExpense.value);
</script>

<style scoped>
.charts-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-top: 20px;
  margin-top: 20px;
  gap: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.controls {
  margin-bottom: 10px;
}
.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
}
.pie-wrapper {
  width: 280px;
  height: 280px;
}
.profile-section {
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.profile-image-wrapper {
  position: relative;
}
.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #0099ff56;
}
.upload-icon {
  position: absolute;
  bottom: 3px;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: #0099ff56;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
}
.upload-icon input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.upload-icon i {
  font-size: 16px;
}
.profile-info {
  margin-top: 10px;
  text-align: center;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: bold;
}
.profile-email {
  font-size: 1rem;
  color: gray;
}
.notepad-section {
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.notepad {
  width: 90%;
  height: 100px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
  font-family: Arial, sans-serif;
}
.bar-wrapper {
  width: 760px;
  height: 400px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
}
.right-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.summary-section {
  width: 100%;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
}
.summary-table th,
.summary-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: right;
}
.summary-table th {
  background-color: #f2f2f2;
}
.summary-table tfoot td {
  font-weight: bold;
}
canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
.btn-xs {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
.mt-3 {
  margin-top: 1rem;
}
.form-check-label {
  cursor: pointer;
}
</style>
