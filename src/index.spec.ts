import { InvalidState, Machine, State, stateFactory, Transition, transitionFactory } from "./index";

describe("microwave", () => {
    const states: State[] = [];
    const transitions: Transition[] = [];
    let onState: State;

    beforeEach(() => {
        transitions.push(transitionFactory('off', 'on'));
        transitions.push(transitionFactory('on', 'running'));
        transitions.push(transitionFactory('running', 'on'));
        transitions.push(transitionFactory('on', 'off'));
        states.push(stateFactory('off', (prevState) => new Promise((resolve) => {
                resolve('ok');
            })));
        onState = stateFactory('on', (prevState) => new Promise(resolve => {
                // ideally we only want to enter a state if this promise resolves
                resolve('ok');
            }));
        states.push(onState);
    })

    it("starts in off state", () => {
        const MicrowaveMachine = new Machine(states, transitions);
        expect(MicrowaveMachine.start().name).toBe('off');
    })

    it("transitions to on state from off state", () => {
        const MicrowaveMachine = new Machine(states, transitions);
        MicrowaveMachine.start('off');
        expect(MicrowaveMachine.transition('on')).resolves.toBe(onState);
    })

    it("invalid transition will result in InvalidState", () => {
        const MicrowaveMachine = new Machine(states, transitions);
        MicrowaveMachine.start('off');
        expect(MicrowaveMachine.transition('running')).rejects.toBe(InvalidState);
    })
})