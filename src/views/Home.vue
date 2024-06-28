<template>
  <div class="home">
    <h1>pinia HMR测试</h1>
    <button @click="accumulate">点击+1</button>
    <p>count值：{{ count }}</p>
    <p>当前时间：{{ new Date() }}</p>
    <p>sm3加密值：{{ sm3Value }}</p>
    <LineGraph />
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useDemoStore } from "@/store";
import { sm3 } from "@/utils/crypto.js";
import LineGraph from "@/views/echarts/line.vue";

export default {
  name: "Home",
  components: {
    LineGraph,
  },
  data() {
    return {
      sm3Value: sm3("123456"),
    };
  },
  computed: {
    ...mapState(useDemoStore, ["count"]),
  },
  created() {
    console.log("created");
  },
  methods: {
    ...mapActions(useDemoStore, ["accumulate"]),
  },
};
</script>

<style>
.home {
  width: 90%;
  margin: 0 auto;
}
</style>
