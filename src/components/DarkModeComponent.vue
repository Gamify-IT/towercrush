<template>
  <div>
    <input
      @change="toggleTheme"
      id="checkbox"
      type="checkbox"
      class="switch-checkbox"
    />
    <label for="checkbox" class="switch-label">
      <span id="light">L</span>
      <span id="dark">D</span>

      <div
        class="switch-toggle"
        :class="{ 'switch-toggle-checked': userTheme === 'dark-theme' }"
      ></div>
    </label>
  </div>
</template>

<script>
export default {
  mounted() {
    this.setTheme(localStorage.getItem("user-theme"));
  },

  data() {
    return {
      userTheme: localStorage.getItem("user-theme"),
    };
  },

  methods: {
    toggleTheme() {
      const activeTheme = localStorage.getItem("user-theme");
      if (activeTheme === "light-theme") {
        this.setTheme("dark-theme");
      } else {
        this.setTheme("light-theme");
      }
    },

    setTheme(theme) {
      localStorage.setItem("user-theme", theme);
      this.userTheme = theme;
      document.documentElement.className = theme;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.switch-checkbox {
  display: none;
}

#dark {
  color: var(--button-main);
  margin-right: 3px;
}

#light {
  color: white;
  margin-left: 3px;
}

.switch-label {
  align-items: center;
  background: var(--background-sub);
  border: 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  font-size: 22px;
  height: 34px;
  position: relative;
  padding: 6px;
  transition: background 0.5s ease;
  justify-content: space-between;
  width: 68px;
  z-index: 1;
}

.switch-toggle {
  position: absolute;
  background-color: var(--button-main);
  border-radius: 10px;
  top: 3px;
  left: 2px;
  height: 28px;
  width: 30px;
  transform: translateX(0);
  transition: transform 0.3s ease, background-color 0.5s ease;
}

.switch-toggle-checked {
  transform: translateX(32px) !important;
}
</style>
