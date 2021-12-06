import { assign, createMachine, forwardTo, sendParent, spawn } from "xstate";
import { respond } from "xstate/lib/actions";

const dataMachine = createMachine(
  {
    id: "data",
    initial: "idle",

    context: {
      value: 0,
    },

    states: {
      idle: {
        invoke: {
          src: "incrementValueEverySecond",
        },

        on: {
          QUERY_UPDATED_DATA: {
            actions: ["respondWithData"],
          },
          INCREMENT: {
            actions: ["incrementValue"],
          },
        },
      },
      final: {},
    },
  },

  {
    actions: {
      respondWithData: respond((ctx) => ({
        type: "QUERY_RESPONSE",
        value: ctx.value,
      })),
      incrementValue: assign((ctx) => ({
        value: ctx.value + 1,
      })),
    },

    services: {
      incrementValueEverySecond: () => (callback) => {
        const intervalId = window.setInterval(
          () => callback("INCREMENT"),
          1_000
        );

        return () => {
          window.clearInterval(intervalId);
        };
      },
    },
  }
);

const anotherMachine = createMachine(
  {
    id: "another",
    initial: "idle",

    context: {
      valueTimesTwo: 0,
    },

    states: {
      idle: {
        on: {
          LOAD: "loading",
        },
      },
      loading: {
        entry: ["refreshData"],
        on: {
          QUERY_RESPONSE: {
            actions: ["calculateTimesTwo"],
            target: "idle",
          },
        },
      },
    },
  },

  {
    actions: {
      refreshData: sendParent("QUERY_UPDATED_DATA"),
      calculateTimesTwo: assign((_, event: any) => ({
        valueTimesTwo: event.value * 2,
      })),
    },
  }
);

export const parentMachine = createMachine(
  {
    id: "parent",

    context: () => ({
      dataActor: spawn(dataMachine),
      anotherActor: spawn(anotherMachine),
    }),

    on: {
      QUERY_UPDATED_DATA: {
        actions: ["forwardQuery"],
      },
      QUERY_RESPONSE: {
        actions: ["forwardQueryResponse"],
      },
    },
  },

  {
    actions: {
      forwardQuery: forwardTo((ctx) => ctx.dataActor),
      // TODO: Why do we need to forward the reponse back?
      forwardQueryResponse: forwardTo((ctx) => ctx.anotherActor),
    },
  }
);

export const counterMachine = createMachine(
  {
    id: "counter",
    initial: "idle",

    context: {
      count: 0,
    },

    states: {
      idle: {
        on: {
          INCREMENT: {
            actions: ["incrementCount"],
          },
        },
      },
      final: {},
    },
  },

  {
    actions: {
      incrementCount: assign((ctx) => ({
        count: ctx.count + 1,
      })),
    },
  }
);
