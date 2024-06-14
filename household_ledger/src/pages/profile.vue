<template>
    <div class="mb-3">
      <br />
      <label for="nameInput" class="form-label">이름</label>
      <input
        type="text"
        maxlength="4"
        class="form-control"
        id="nameInput"
        placeholder="고건우"
        v-model="name"
      />
      <br />
      <label for="ageInput" class="form-label">나이</label>
      <input
        type="number"
        class="form-control"
        id="ageInput"
        placeholder="55"
        v-model="age"
      />
      <br />
      <label for="telInput" class="form-label">핸드폰 번호</label>
      <input
        type="tel"
        class="form-control"
        id="telInput"
        placeholder="010-1234-5678"
        v-model="tel"
      />
      <br />
      <label for="emailInput" class="form-label">이메일</label>
      <input
        type="email"
        class="form-control"
        id="emailInput"
        placeholder="name@example.com"
        v-model="email"
      />
    </div>
    <br />
    <div class="d-grid gap-3">
      <button
        :disabled="!isFormValid"
        class="btn-block btn btn-secondary"
        @click="saveData"
      >
        저장
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  
  const name = ref(localStorage.getItem("name") || "");
  const age = ref(localStorage.getItem("age") || "");
  const email = ref(localStorage.getItem("email") || "");
  const tel = ref(localStorage.getItem("tel") || "");
  
  const isFormValid = computed(
    () =>
      name.value !== "" &&
      age.value !== "" &&
      email.value !== "" &&
      tel.value !== ""
  );
  
  const saveData = () => {
    localStorage.setItem("name", name.value);
    localStorage.setItem("age", age.value);
    localStorage.setItem("email", email.value);
    localStorage.setItem("tel", tel.value);
  };
  
  window.addEventListener("load", () => {
    localStorage.removeItem("name");
    localStorage.removeItem("age");
    localStorage.removeItem("email");
    localStorage.removeItem("tel");
  });
  </script>
  