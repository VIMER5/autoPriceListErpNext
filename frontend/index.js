const { createApp, ref, onMounted, watch } = Vue;

createApp({
  setup() {
    const data = ref({});
    const info = ref("");
    const selectVFor = ref({
      brand: "",
      PriceList: "",
      currency: 0,
    });
    onMounted(async () => {
      try {
        const brends = await axios.get("http://localhost:3000/getBrands");
        const allPriceList = await axios.get("http://localhost:3000/getPrice");
        data.value = {
          brends: brends.data,
          PriceList: allPriceList.data,
        };
      } catch (err) {
        info.value = err;
        console.log(err);
      }
    });
    watch(selectVFor, (old) => {
      console.log(old);
    });
    async function send() {
      try {
        const res = await axios.post("http://localhost:3000/addAllBrands", {
          brand: selectVFor.value.brand,
          PriceList: selectVFor.value.PriceList,
          currency: selectVFor.value.currency,
        });
        info.value = res.data;
      } catch (err) {
        info.value = err + " см. console";
        console.log(err);
      }
    }
    return {
      data,
      info,
      selectVFor,
      send,
    };
  },
}).mount("#app");
