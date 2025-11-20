import kernel from "./index";
import helloWorldAdapter from "@aibos/helloworld";
import listenerDemoAdapter from "@aibos/listener-demo";

kernel.boot({
  mode: "dev",
  adapters: [helloWorldAdapter, listenerDemoAdapter]
});
