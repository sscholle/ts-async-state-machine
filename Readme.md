# Simple Async State Machine

## Description

the objective is to provide a simple interface to build a finite state machine

## Core Concepts

 * we define a set of `State`s, each with a `name` and `onEnter` callback
 * we define a set of `Transition`s, each of which define a pair or state names
 * we call `.transition('newStateName')` to trigger the new state change
 * we use `Promises` inside the `onEnter` callbacks to resolve/reject the state change
 * we get a `Promise` from calling `transition` allowing us to chain on `then`,`catch`,`finally`,etc...

 ## Example Usage

 ```javascript
import { Machine, State, stateFactory, Transition, transitionFactory } from "ts-async-state-machine";

    // Declare states
    const states: State[] = [];
    states.push(stateFactory('off', (prevState) => new Promise((resolve) => {
        // always call 'resolve' after your asynchronours process completes sucessfully
        resolve('ok');
    })));
    states.push(stateFactory('on', (prevState) => new Promise(resolve => {
        // add code here that runs asynchronously (example server request)
        resolve('ok');
        // otherwise call 'reject()'
    })));
    // add more states and state callbacks...

    // Declare your transitions
    const transitions: Transition[] = [];
    transitions.push(transitionFactory('off', 'on'));
    transitions.push(transitionFactory('on', 'running'));
    transitions.push(transitionFactory('running', 'off'));

    // Create your Machine
    const MicrowaveMachine = new Machine(states, transitions);

    // Initialise into your required starting state
    MicrowaveMachine.start('off');

    // Call your transitions when you neeed to
    MicrowaveMachine.transition('on').then(newState => {
        // do whatever you need to here AFTER the state transitioned
    });

 ```

 ## More
  * see `examples` folder for a full example in `microwave.js`

## Development
 * test: `npm run test`
 * run example: `node ./examples/microwave.js`