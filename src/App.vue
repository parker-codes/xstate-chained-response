<script setup lang="ts">
import { useMachine, useInterpret, useActor } from "@xstate/vue";
import { counterMachine, parentMachine } from "./machines";

const counter = useMachine(counterMachine, {
  // devTools: true,
});

const parent = useInterpret(parentMachine, {
  devTools: true,
});

const { state: dataState } = useActor(parent.state.context.dataActor);

const { state: anotherState, send: sendAnother } = useActor(
  parent.state.context.anotherActor
);
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />

  <button @click="counter.send('INCREMENT')">
    {{ counter.state.value.context.count }}
  </button>

  <div>
    State: {{ dataState.toStrings() }} | Value: {{ dataState.context.value }}
  </div>
  <div>
    State: {{ anotherState.toStrings() }} | Value:
    {{ anotherState.context.valueTimesTwo }}
  </div>
  <button @click="sendAnother('LOAD')">LOAD</button>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
