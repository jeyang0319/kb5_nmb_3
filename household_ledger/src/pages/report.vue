<template>
    <!-- 전체 차트 컨테이너 -->
    <div class="charts-container">
      <!-- 파이 차트와 컨트롤 버튼이 있는 섹션 -->
      <div class="left-section">
        <!-- 월 변경을 위한 컨트롤 버튼들 -->
        <div class="controls">
          <!-- 이전 월 버튼 -->
          <button class="btn btn-secondary btn-xs" @click="changeMonth(-1)">
            &lt;
          </button>
          <!-- 현재 연도를 표시하는 버튼 -->
          <button class="btn btn-secondary btn-xs" @click="changeMonth(0)">
            {{ formattedYear }} 년
          </button>
          <!-- 다음 월 버튼 -->
          <button class="btn btn-secondary btn-xs" @click="changeMonth(1)">
            &gt;
          </button>
        </div>
        <!-- 파이 차트를 위한 캔버스 -->
        <div class="chart-wrapper pie-wrapper">
          <canvas id="pieChart"></canvas>
        </div>
        <!-- 프로필 섹션 -->
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
          <!-- 메모장 섹션 -->
          <div class="notepad-section">
            <textarea
              v-model="profile.note"
              placeholder="상태 메시지..."
              class="notepad"
            ></textarea>
          </div>
        </div>
      </div>
      <!-- 바 차트를 위한 섹션 -->
      <div class="right-section">
        <div class="chart-wrapper bar-wrapper">
          <canvas id="barChart"></canvas>
        </div>
        <!-- 월별 요약 숨기기/나타내기 체크박스 -->
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
        <!-- 요약표 -->
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
  import { onMounted, ref, computed } from "vue"; // Vue.js에서 필요한 함수들 가져오기
  import { Chart as ChartJS, registerables } from "chart.js"; // Chart.js 가져오기
  import ChartDataLabels from "chartjs-plugin-datalabels"; // Chart.js 데이터 라벨 플러그인 가져오기
  import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS 가져오기
  
  // Chart.js와 플러그인 등록
  ChartJS.register(...registerables, ChartDataLabels);
  
  // 현재 날짜를 저장하는 반응형 변수
  const currentDate = ref(new Date());
  
  // 현재 연도와 월을 표시하는 반응형 계산된 변수
  const formattedYear = computed(() => currentDate.value.getFullYear());
  const formattedMonth = computed(() => currentDate.value.getMonth() + 1);
  
  // 파이 차트와 바 차트 인스턴스를 저장할 변수
  let pieChartInstance = null;
  let barChartInstance = null;
  
  // 프로필 데이터를 저장할 변수
  const profile = ref({
    imageUrl: "https://via.placeholder.com/280", // 초기 프로필 이미지 URL
    note: "", // 메모 데이터를 저장할 변수
  });
  
  // 요약 데이터를 저장할 변수
  const summaries = ref([]);
  const totalSum = ref(0);
  const totalIncome = ref(0);
  const totalExpense = ref(0);
  const monthlySummaries = ref([]);
  const showSummary = ref(true); // 요약표 표시 여부를 저장하는 변수
  
  // 데이터를 가져오는 함수
  const fetchData = async (date) => {
    const response = await fetch("/db.json"); // db.json 파일에서 데이터 가져오기
    const data = await response.json();
    const categories = data.category.reduce((acc, category) => {
      acc[category.id] = category.is_income;
      return acc;
    }, {});
  
    // 필터링해서 해당 월 데이터만 추출
    const filteredData = data.budget.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth()
      );
    });
  
    // 동일한 날짜 데이터 합치기
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
  
    // 요약 데이터 배열 생성
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
  
    // 월별 요약 데이터 생성
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
      // acc[month].total += amount;
      acc[month].total = acc[month].income - acc[month].expense;
      return acc;
    }, {});
  
    monthlySummaries.value = Object.values(monthData).sort(
      (a, b) => a.month - b.month
    );
  
    // 데이터 및 색상 설정
    return {
      incomeData: totalIncome.value, // 수입 데이터 값
      expenseData: totalExpense.value, // 지출 데이터 값
      labels: ["수입", "지출"], // 수입과 지출 라벨
      backgroundColors: ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)"], // 색상 설정
      borderColors: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"], // 테두리 색상 설정
    };
  };
  
  // 차트를 생성하는 함수
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
      type: type, // 차트 타입 (파이 또는 바 차트)
      data: {
        labels: labels, // 차트 라벨
        datasets: [
          {
            label: datasetLabel, // 데이터셋 라벨
            data: data, // 차트 데이터
            borderWidth: 1, // 테두리 두께
            backgroundColor: backgroundColors, // 배경색
            borderColor: borderColors, // 테두리 색상
            hoverOffset: type === "pie" ? 50 : 0, // 확대 효과는 파이 차트에만 적용
          },
        ],
      },
      options: {
        responsive: true, // 반응형 설정
        maintainAspectRatio: false, // Aspect ratio 설정 해제
        scales:
          type === "bar"
            ? {
                x: {
                  ticks: {
                    callback: function (value, index, values) {
                      return labels[index]; // "DD일" 형식으로 표시
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return formatCurrency(value); // 천 단위 쉼표와 원 단위 표시
                    },
                  },
                },
              }
            : {},
        plugins: {
          legend: {
            display: displayLegend, // 범례 표시
          },
          title: {
            display: false, // 제목 숨기기
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || ""; // 라벨 설정
                if (label) {
                  label += ": ";
                }
                if (context.raw !== null) {
                  label += formatCurrency(context.raw); // 원화 포맷
                }
                return label;
              },
            },
          },
          datalabels: {
            display: false, // 데이터 라벨 숨기기
          },
        },
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: false,
          animationDuration: 400, // 확대 효과의 애니메이션 지속 시간
        },
      },
    });
  };
  
  // 월별 총합 차트를 생성하는 함수
  const createMonthlyChart = (ctx, labels, data) => {
    return new ChartJS(ctx, {
      type: "bar", // 바 차트
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
                return formatCurrency(value); // 천 단위 쉼표와 원 단위 표시
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
  
  // 차트를 업데이트하는 함수
  const updateCharts = async (date) => {
    const { incomeData, expenseData, labels, backgroundColors, borderColors } =
      await fetchData(date);
    // 기존 파이 차트 인스턴스 제거
    if (pieChartInstance) {
      pieChartInstance.destroy();
    }
    // 기존 바 차트 인스턴스 제거
    if (barChartInstance) {
      barChartInstance.destroy();
    }
    // 새로운 파이 차트 생성
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
  
    // 새로운 월별 총합 바 차트 생성
    const barCtx = document.getElementById("barChart").getContext("2d");
    const monthlyLabels = monthlySummaries.value.map((item) => `${item.month}월`);
    barChartInstance = createMonthlyChart(
      barCtx,
      monthlyLabels,
      monthlySummaries.value
    );
  };
  
  // 월을 변경하는 함수
  const changeMonth = (offset) => {
    if (offset === 0) {
      currentDate.value = new Date(); // 현재 날짜로 설정
    } else {
      currentDate.value.setMonth(currentDate.value.getMonth() + offset); // 월을 변경
    }
    updateCharts(currentDate.value); // 차트 업데이트
  };
  
  // 컴포넌트가 마운트될 때 초기 차트를 생성
  onMounted(() => {
    updateCharts(currentDate.value);
  });
  
  // 통화 형식으로 포맷하는 함수
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };
  
  // + 또는 - 기호를 추가하여 통화 형식으로 포맷하는 함수
  const formatCurrencyWithSign = (value, isIncome) => {
    if (value === 0) {
      return formatCurrency(value); // 0일 경우 부호 없이 표시
    }
    const sign = isIncome ? "+" : "-";
    if (value < 0) {
      return `${formatCurrency(value)}`;
    }
    return `${sign}${formatCurrency(value)}`;
  };
  
  // 프로필 이미지 변경 함수
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
  
  // 업로드 트리거 함수
  const triggerUpload = () => {
    document.getElementById("profile-upload").click();
  };
  
  // 총합 합계를 계산하는 반응형 변수
  const netTotal = computed(() => totalIncome.value - totalExpense.value);
  </script>
  
  <style scoped>
  .charts-container {
    display: flex;
    justify-content: space-between; /* 파이 차트와 바 차트를 좌우로 배치 */
    width: 100%;
    padding-top: 20px;
    gap: 20px; /* 차트 섹션 간의 간격 추가 */
    background-color: #f9f9f9; /* 배경 색상 추가 */
    border-radius: 10px; /* 둥근 모서리 추가 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    padding: 20px; /* 패딩 추가 */
  }
  .left-section {
    display: flex;
    flex-direction: column; /* 컨트롤과 파이 차트를 세로로 배치 */
    align-items: center; /* 가운데 정렬 */
    gap: 20px; /* 섹션 간의 간격 추가 */
  }
  .controls {
    margin-bottom: 10px;
  }
  .chart-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff; /* 배경색 추가 */
    border-radius: 10px; /* 둥근 모서리 추가 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    padding: 10px; /* 패딩 추가 */
  }
  .pie-wrapper {
    width: 280px;
    height: 280px; /* 높이 조정 */
  }
  .profile-section {
    margin-top: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    background-color: #fff; /* 배경색 추가 */
    border-radius: 10px; /* 둥근 모서리 추가 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    padding: 20px; /* 패딩 추가 */
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
    width: 20px; /* 크기 조정 */
    height: 20px; /* 크기 조정 */
    background-color: #0099ff56;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px; /* 둥근 모서리 제거 */
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
    height: 400px; /* 높이 조정 */
    background-color: #fff; /* 배경색 추가 */
    border-radius: 10px; /* 둥근 모서리 추가 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    padding: 10px; /* 패딩 추가 */
  }
  .right-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px; /* 섹션 간의 간격 추가 */
  }
  .summary-section {
    width: 100%;
    margin-top: 20px;
    background-color: #fff; /* 배경색 추가 */
    border-radius: 10px; /* 둥근 모서리 추가 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    padding: 20px; /* 패딩 추가 */
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
  