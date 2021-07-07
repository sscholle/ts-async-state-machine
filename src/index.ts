/**
 * Simple Async State Machine
 */

// Machine Interfaces
export interface State {
    name: string,
    onEnter: (previousStateName: string) => Promise<State>,
};

export enum States {
    InvalidState,
    UndefinedState
};

export const InvalidState = {
    name: States.InvalidState.toString(),
    onEnter: (prevStateName: string): Promise<State> => new Promise((resolve, reject) => {
            console.log('Invalid State', 'prev:', prevStateName)
            reject(InvalidState);
        })
};

export interface Transition {
    from: string,
    to: string,
    condition: (prevState: State) => boolean // todo: find a use for using 'condition' (to/from should be condition enough, the rest is external...)
};

export function stateFactory(name: string, onEnter: (previousStateName: string) => Promise<any>): State {
    return {
        name,
        onEnter
    };
}

export function transitionFactory(from: string, to: string, condition: () => boolean = () => true): Transition {
    return {
        from,
        to,
        condition
    };
}

export class Machine {
    states: State[];
    transitions: Transition[];
    currentState: State;
    
    constructor(states: State[], transitions: Transition[]){
        this.states = states;
        this.transitions = transitions;
        this.currentState = InvalidState as State;
    }

    get state(): State {
        return this.currentState;
    }

    /**
     * starts the state machine
     * @param forceStateName starrting state name
     * @returns State the state specified with forStateName or InvalidState
     */
    start (forceStateName: string): State {
        const newState = forceStateName ? this.states.find(state => state.name === forceStateName) || InvalidState : this.states[0] || InvalidState;
        this.currentState = newState;
        return this.currentState;
    }

    /**
     * check all transisitons for matching to/from state names - runs the 'onEnter' callback on the found State
     * @param newStateName the next state to transition to
     * @returns State that matches the newStateName
     */
    transition (newStateName: string): Promise<State> {
        let newState = InvalidState;
        const foundTranstion = this.transitions.find(transition => transition.from === this.currentState?.name && transition.to === newStateName); 
        if(foundTranstion && foundTranstion.condition(this.currentState)) {
            newState = this.states.find(item => item.name === newStateName) || InvalidState;
        }
        return new Promise<State>((resolve, reject) => {
            newState?.onEnter(this.currentState.name).then((result) => {
                this.currentState = newState;
                resolve(newState);
            }).catch(result => {
                this.currentState = InvalidState;
                reject(InvalidState);
            });
        }).catch(result => {
            console.log('caught rejection: for safety -> throwing again', result)
            throw result;
        });
    }
};