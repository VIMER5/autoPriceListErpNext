const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const message = ref("Hello vue!");
    const brends = ref([]);
    onMounted(async () => {
      const data = await axios.get("http://localhost:3000/getBrands");
      brends.value = data.data;
    });
    return {
      message,
      brends,
    };
  },
}).mount("#app");
