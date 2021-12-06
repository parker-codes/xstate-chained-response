import { createApp } from "vue";
import App from "./App.vue";
import { inspect } from "@xstate/inspect";

inspect({ iframe: false, url: "https://stately.ai/viz?inspect=true" });

createApp(App).mount("#app");
