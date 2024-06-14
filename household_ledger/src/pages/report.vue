<template>
    <!-- 전체 차트 컨테이너 -->
    <div class="charts-container">
      <!-- 도넛 차트와 컨트롤 버튼이 있는 섹션 -->
      <div class="chart-section">
        <!-- 월 변경을 위한 컨트롤 버튼들 -->
        <div class="controls">
          <!-- 이전 월 버튼 -->
          <button class="btn btn-primary btn-xs" @click="changeMonth(-1)">&lt;</button>
          <!-- 현재 연도를 표시하는 버튼 -->
          <button class="btn btn-secondary btn-xs" @click="changeMonth(0)">{{ formattedYear }}</button>
          <!-- 다음 월 버튼 -->
          <button class="btn btn-primary btn-xs" @click="changeMonth(1)">&gt;</button>
        </div>
        <!-- 도넛 차트를 위한 캔버스 -->
        <div class="chart-wrapper doughnut-wrapper">
          <canvas id="doughnutChart"></canvas>
        </div>
      </div>
      <!-- 바 차트를 위한 캔버스 -->
      <div class="chart-wrapper bar-wrapper">
        <canvas id="barChart"></canvas>
      </div>
    </div>
  </template>
  <script setup>
  import { onMounted, ref, computed } from "vue"; // Vue.js에서 필요한 함수들 가져오기
  import { Chart as ChartJS, registerables } from "chart.js"; // Chart.js 가져오기
  import ChartDataLabels from 'chartjs-plugin-datalabels'; // Chart.js 데이터 라벨 플러그인 가져오기
  import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS 가져오기
  // Chart.js와 플러그인 등록
  ChartJS.register(...registerables, ChartDataLabels);
  // 현재 날짜를 저장하는 반응형 변수
  const currentDate = ref(new Date());
  // 현재 연도를 표시하는 반응형 계산된 변수
  const formattedYear = computed(() => currentDate.value.getFullYear());
  // 도넛 차트와 바 차트 인스턴스를 저장할 변수
  let doughnutChartInstance = null;
  let barChartInstance = null;
  // 데이터를 가져오는 함수
  const fetchData = async (date) => {
    const response = await fetch("/db.json"); // db.json 파일에서 데이터 가져오기
    const data = await response.json();
    // 필터링해서 해당 월 데이터만 추출
    const filteredData = data.budget.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth();
    });
    // 데이터 및 색상 설정
    return {
      budgetData: filteredData.map(item => item.amount), // 데이터 값
      labels: filteredData.map(item => {
        const itemDate = new Date(item.date);
        return `${itemDate.getMonth() + 1}월-${itemDate.getDate()}일`; // 라벨 형식: "MM월-DD일"
      }),
      backgroundColors: filteredData.map(item => {
        return [1, 2, 5, 6, 9, 10].includes(item.category_id) ? 'rgba(54, 162, 235, 0.2)' : 'rgba(255, 99, 132, 0.2)'; // 카테고리 ID에 따른 색상 설정
      }),
      borderColors: filteredData.map(item => {
        return [1, 2, 5, 6, 9, 10].includes(item.category_id) ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)'; // 카테고리 ID에 따른 테두리 색상 설정
      }),
    };
  };
  // 차트를 생성하는 함수
  const createChart = (ctx, type, labels, data, backgroundColors, borderColors, displayLegend = true, datasetLabel = '') => {
    return new ChartJS(ctx, {
      type: type, // 차트 타입 (도넛 또는 바 차트)
      data: {
        labels: labels, // 차트 라벨
        datasets: [
          {
            label: datasetLabel, // 데이터셋 라벨
            data: data, // 차트 데이터
            borderWidth: 1, // 테두리 두께
            backgroundColor: backgroundColors, // 배경색
            borderColor: borderColors, // 테두리 색상
            hoverOffset: type === "doughnut" ? 50 : 0, // 확대 효과는 도넛 차트에만 적용
          },
        ],
      },
      options: {
        responsive: true, // 반응형 설정
        maintainAspectRatio: false, // Aspect ratio 설정 해제
        scales: type === "bar" ? {
          x: {
            ticks: {
              callback: function(value, index, values) {
                return labels[index]; // "MM월-DD일" 형식으로 표시
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 50000,
            },
          },
        } : {},
        plugins: {
          legend: {
            display: false, // 범례 숨기기
          },
          title: {
            display: false, // 제목 숨기기
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || ''; // 라벨 설정
                if (label) {
                  label += ': ';
                }
                if (context.raw !== null) {
                  label += new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(context.raw); // 원화 포맷
                }
                return label;
              }
            }
          },
          datalabels: {
            display: false, // 데이터 라벨 숨기기
          },
        },
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: false,
          animationDuration: 400, // 확대 효과의 애니메이션 지속 시간
        },
      },
    });
  };
  // 차트를 업데이트하는 함수
  const updateCharts = async (date) => {
    const { budgetData, labels, backgroundColors, borderColors } = await fetchData(date);
    // 기존 차트 인스턴스 제거
    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }
    if (barChartInstance) {
      barChartInstance.destroy();
    }
    // 새로운 도넛 차트 생성
    const doughnutCtx = document.getElementById("doughnutChart").getContext("2d");
    doughnutChartInstance = createChart(doughnutCtx, "doughnut", labels, budgetData, backgroundColors, borderColors, false);
    // 새로운 바 차트 생성
    const barCtx = document.getElementById("barChart").getContext("2d");
    barChartInstance = createChart(barCtx, "bar", labels, budgetData, backgroundColors, borderColors, false);
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
  </script>
  <style scoped>
  .charts-container {
    display: flex;
    justify-content: space-between; /* 도넛 차트와 바 차트를 좌우로 배치 */
    width: 100%;
    padding-top: 20px;
  }
  .chart-section {
    display: flex;
    flex-direction: column; /* 컨트롤과 도넛 차트를 세로로 배치 */
    align-items: center; /* 가운데 정렬 */
  }
  .controls {
    margin-bottom: 10px;
  }
  .chart-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .doughnut-wrapper {
    width: 280px;
    height: 400px; /* 높이 조정 */
  }
  .bar-wrapper {
    width: 760px;
    height: 400px; /* 높이 조정 */
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
  </style>