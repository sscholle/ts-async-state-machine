# Simple Async State Machine

[![NPM](https://nodei.co/npm/ts-async-state-machine.png)](https://npmjs.org/package/ts-async-state-machine)

## Description

the objective is to provide a simple interface to build a finite state machine

## Features
* thoroughly tested with good code coverage
* small package file: 3.2kb (compressed)
* written in TypeScript and therefore includes a definitions file with full documentation (*.d.ts)

## Core Concepts

 * Define a set of `State`s, each with a `name`, a list of `fromStates` and some optional callbacks
 * Call `.transition('newStateName')` to trigger a state change to the specified state
 * Use `Promises` inside the `onBeforeEnter` callback to resolve/reject the state change (usually via server API)

 ## Example Usage

 ```javascript
import { Machine } from "ts-async-state-machine";

// Create your Machine
const MicrowaveMachine = new Machine('Microwave');

// Add States to the Machine
MicrowaveMachine.addState('off', ['running'], {
    onBeforeEnter: (prevState) => new Promise((resolve, rejection) => {
        // use a server APi request to 'confirm' the state change
        resolve();// resolves the state transition - changes 'MicrowaveMachine's state to 'off'
        // a 'rejection' will fail the internal state transition
    })
});
MicrowaveMachine.addState('on', ['off'], {
    // callbacks are optional and use them as needed: 'onEnter', 'onExit', 'onBeforeEnter' as options
    onExit: () => {
        console.log('Exited ON state')
    }
});
MicrowaveMachine.addState('running', ['on'], {
    onEnter: () => {
        console.log('Entered RUNNING State')
    }
});

// Initialise into your required starting state
MicrowaveMachine.start('off');

// Start Triggering State changes when neccessary
MicrowaveMachine.transition('on').then(newState => {
    console.log('Entered State', newState.name)
}); // omitted 'catch' for brevity

MicrowaveMachine.transition('running').then(newState => {
    console.log('Entered State', newState.name)
});

 ```

## Examples
 * see `/examples` folder for a full examples in `microwave.js`, `traffic-light.js` and `traffic-light-server-stateful.js`
 * run microwave example: `npm run example`
 * other examples: `npm run build && node ./examples/traffic-light.js`
 * other examples: `npm run build && node ./examples/traffic-light-server-stateful.js`

## Development
 * build: `npm run build`
 * test: `npm run test`
 * code coverage: `npm run test:coverage`

 ## Credits
 * Inspired by the Js Async State machine lib [https://github.com/robguy21/js-async-state-machine](https://github.com/robguy21/js-async-state-machine)