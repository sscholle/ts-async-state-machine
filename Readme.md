# Simple Async State Machine

[![NPM](https://nodei.co/npm/ts-async-state-machine.png)](https://npmjs.org/package/ts-async-state-machine)

## Description

the objective is to provide a simple interface to build a finite state machine

## Features
* written in TypeScript and therefore includes a definitions file with full documentation (*.d.ts)
* small package file: 2.8kb (compressed)
* thoroughly tested with good code coverage

## Core Concepts

 * we define a set of `State`s, each with a `name` and `onBeforeEnter` callback
 * we define a set of `Transition`s, each of which define a pair or state names and an optional `condition` callback
 * we call `.transition('newStateName')` to trigger a state change to the specified state
 * we use `Promises` inside the `onBeforeEnter` to resolve/reject the state change
 * we get a `Promise` from calling `transition` allowing us to chain on `then`,`catch`,`finally`,etc...

 ## Example Usage

 ```ts
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
 * see `/examples` folder for a full example in `microwave.js`
 * run example: `npm run example`

## Development
 * build: `npm run build`
 * test: `npm run test`
 * code coverage: `npm run test:coverage`

 ## Credits
 * Inspired by the Js Async State machine lib [https://github.com/robguy21/js-async-state-machine](https://github.com/robguy21/js-async-state-machine)