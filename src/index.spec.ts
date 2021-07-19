import { Machine, State, stateFactory } from "./index";

describe("Microwave Sate Machine", () => {
    const states: State[] = [];
    let MicrowaveMachine: Machine;
    let offState: State;
    let onState: State;
    let runningState: State;

    beforeAll(() => {
        offState = stateFactory('off', ['on', 'running'], {
            onBeforeEnter: () => new Promise(resolve => {
                resolve('switched off');
            })
        });
        states.push(offState);
        onState = stateFactory('on', ['off'], {
            onBeforeEnter: () => new Promise(resolve => {
                resolve('ok');
            })
        });
        states.push(onState);
    })

    beforeEach(() => {
        MicrowaveMachine = new Machine('Microwave', states);
    });

    it("'start' returns first valid state - off", () => {
        MicrowaveMachine.start();
        expect(MicrowaveMachine.state.name).toBe('off');
    });

    it("'state' returns current state - off", () => {
        MicrowaveMachine.start();
        expect(MicrowaveMachine.state.name).toBe('off');
    });

    it("Transition to 'on' state from 'off' State", () => {
        MicrowaveMachine.start('off');
        return expect(MicrowaveMachine.transition('on')).resolves.toEqual(onState);
    });

    it("Transition from 'off' to 'running' results in inital State", () => {
        MicrowaveMachine.start(offState.name);
        return expect(MicrowaveMachine.transition('running')).rejects.toBeTruthy();
    });

    it("Transition from 'on' to 'running' will reject when the state transition 'rejects'", () => {
        runningState = stateFactory('running', ['on'], {
            onBeforeEnter: () => new Promise((_, reject) => {
                reject('make this state transisiton fail for some reason using "reject"');
            })
        });
        states.push(runningState);
        MicrowaveMachine.start('on');
        return expect(MicrowaveMachine.transition('running')).rejects.toBeTruthy();
    });
})