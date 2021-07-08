import { Machine, State, stateFactory, Transition, transitionFactory } from "./index";

describe("Microwave Sate Machine", () => {
    const states: State[] = [];
    const transitions: Transition[] = [];
    let MicrowaveMachine: Machine;
    let offState: State;
    let onState: State;

    beforeAll(() => {
        transitions.push(transitionFactory('off', 'on'));
        transitions.push(transitionFactory('on', 'running'));
        transitions.push(transitionFactory('running', 'on'));
        transitions.push(transitionFactory('on', 'off'));
        offState = stateFactory('off', (prevState) => new Promise(resolve => {
            resolve('ok');
        }));
        states.push(offState);
        onState = stateFactory('on', (prevState) => new Promise(resolve => {
                resolve('ok');
            }));
        states.push(onState);
    })

    beforeEach(() => {
        MicrowaveMachine = new Machine(states, transitions);
    });

    it("'start' returns first valid state - off", () => {
        expect(MicrowaveMachine.start().name).toBe('off');
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
        expect(MicrowaveMachine.transition('running')).rejects.toEqual(offState);
    });
})