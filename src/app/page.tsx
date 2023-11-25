"use client"

import Image from 'next/image'
import { Interpreter, interpret } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

import { IContext, IEvent, machineMacro, persistUser, sendRegistrationEvent } from '@/app/actions'; // Adjust the import path
import { AcceptTOS, AgeConfirmation, PartnerPlugins, RegisterUser, SelectPlan, SpecialOffers, Error, Success } from '@/app/components';
import { registration } from '@/app/templates';
import { openAiRequests } from '@/app/actions';

import styles from '@/app/page.module.css';
import { MouseEventHandler, ReactComponentElement, ReactNode, useState, useEffect, useMemo, useCallback, MouseEvent } from 'react';


export default function Home() {
  type State = {
    id: string,
    component?: (props: { onClick: MouseEventHandler<HTMLButtonElement> }) => JSX.Element,
    type: 'pause' | 'async',
    func: Promise<any>,
  }
  const steps = useMemo(() => {
    const steps = new Map();
    steps.set('AcceptTOS', {
      id: 'AcceptTOS', component: AcceptTOS, type: 'pause', func: new Promise((resolve) => {
        resolve({
          AcceptTOS: {
            message: 'Rendering the AcceptTOS components',
          }
        });
      })
    });
    steps.set('AgeConfirmation', {
      id: 'AgeConfirmation', component: AgeConfirmation, type: 'pause', func: new Promise((resolve) => {
        resolve({
          AgeConfirmation: {
            message: 'Rendering the AgeConfirmation components',
          }
        });
      })
    });
    steps.set('PartnerPlugins', {
      id: 'PartnerPlugins', component: PartnerPlugins, type: 'pause', func: new Promise((resolve) => {
        resolve({
          PartnerPlugins: {
            message: 'Rendering the PartnerPlugins components',
          }
        });
      })
    });
    steps.set('RegisterUser', {
      id: 'RegisterUser', component: RegisterUser, type: 'pause', func: new Promise((resolve) => {
        resolve({
          RegisterUser: {
            message: 'Rendering the RegisterUser components',
          }
        });
      })
    });
    steps.set('SelectPlan', {
      id: 'SelectPlan', component: SelectPlan, type: 'pause', func: new Promise((resolve) => {
        resolve({
          SelectPlan: {
            message: 'Rendering the SelectPlan components',
          }
        });
      })
    });
    steps.set('SpecialOffers', {
      id: 'SpecialOffers', component: SpecialOffers, type: 'pause', func: new Promise((resolve) => {
        resolve({
          SpecialOffers: {
            message: 'Rendering the SpecialOffers components',
          }
        });
      })
    });
    steps.set('PersistUser', { id: 'PersistUser', type: 'async', func: persistUser });
    steps.set('SendRegistrationEvent', { id: 'SendRegistrationEvent', type: 'async', func: sendRegistrationEvent });
    return steps;
  }, []);

  const [state, setState] = useState<State>();
  // this simulates pulling cookies and request headers with geo coding
  const [user, setUser] = useState<{ location: string, visits: string }>({ location: 'CA, USA', visits: '30' });
  const [machine, setMachine] = useState<Interpreter<IContext, any, IEvent>>();

  const getSteps = useCallback(async (user: { location: string, visits: string }) => {
    const map = new Map();
    const prompt = registration(user.location, user.visits);
    const result = await openAiRequests(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ]
    );
    const taskList = JSON.parse(result || '') as string[];
    // TODO iterate over the tasks, look up in the steps map, then add to the local map
    taskList.forEach((state) => {
      map.set(state, steps.get(state));
    });
    // manually add these
    map.set('Success', {
      id: 'Success', component: Success, type: 'pause', func: new Promise((resolve) => {
        resolve({
          Success: {
            message: 'Rendering the Success components',
          }
        });
      })
    });
    map.set('Error', {
      id: 'Error', component: Error, type: 'Error', func: new Promise((resolve) => {
        resolve({
          Error: {
            message: 'Rendering the Success components',
          }
        }); Error
      })
    });
    //setup the machine
    const testMachine = machineMacro(map);

    const id = uuidv4();
    const withContext = testMachine.withContext({
      status: 0,
      requestId: id,
      stack: [],
    });

    const machineExecution = interpret(withContext).onTransition((state) => {
      const type = machineExecution.machine.states[state.value as string]?.meta?.type;
      console.log(`onTransition state.value: ${state.value}`);
      // console.log(`onTransition state.meta.type: ${type}`);
      state.context.stack?.push(state.value as string);
      setState(map.get(state.value));
    });
    //@ts-ignore
    setMachine(machineExecution);

    machineExecution.start();

  }, [steps]);

  useEffect(() => {
    getSteps(user);
  }, [user, getSteps]); // Empty dependency array means this runs once on mount

  const onClick = useCallback((event: MouseEvent) => machine?.send('RESUME_EXECUTION'), [machine])

  function renderComponent(state: State | undefined) {
    if (state?.type === 'pause' && state?.component) {
      const Component = state.component;
      return (
        <Component onClick={onClick} />
      );
    }
  }

  return (
    <main className={styles.main}>
      {renderComponent(state)}
    </main>
  )
}
