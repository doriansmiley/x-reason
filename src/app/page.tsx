import Image from 'next/image'
import { interpret } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

import { machineMacro, persistUser, sendRegistrationEvent} from '@/app/actions'; // Adjust the import path
import { AcceptTOS, AgeConfirmation, PartnerPlugins, RegisterUser, SelectPlan, SpecialOffers } from '@/app/components';
import { registration } from '@/app/templates';

import styles from '@/app/page.module.css';

const steps = new Map();
steps.set('AcceptTOS', {id: 'AcceptTOS', component: AcceptTOS, type: 'pause', func: new Promise((resolve) => {
  resolve({AcceptTOS: {
    message: 'Rendering the AcceptTOS components',
  }});
})});
steps.set('AgeConfirmation', {id: 'AgeConfirmation', component: AgeConfirmation, type: 'pause', func: new Promise((resolve) => {
  resolve({AgeConfirmation: {
    message: 'Rendering the AgeConfirmation components',
  }});
})});
steps.set('PartnerPlugins', {id: 'PartnerPlugins', component: PartnerPlugins, type: 'pause', func: new Promise((resolve) => {
  resolve({PartnerPlugins: {
    message: 'Rendering the PartnerPlugins components',
  }});
})});
steps.set('RegisterUser', {id: 'RegisterUser', component: RegisterUser, type: 'pause', func: new Promise((resolve) => {
  resolve({RegisterUser: {
    message: 'Rendering the RegisterUser components',
  }});
})});
steps.set('SelectPlan', {id: 'SelectPlan', component: SelectPlan, type: 'pause', func: new Promise((resolve) => {
  resolve({SelectPlan: {
    message: 'Rendering the SelectPlan components',
  }});
})});
steps.set('SpecialOffers', {id: 'SpecialOffers', component: SpecialOffers, type: 'pause', func: new Promise((resolve) => {
  resolve({SpecialOffers: {
    message: 'Rendering the SpecialOffers components',
  }});
})});
steps.set('PersistUser', {id: 'PersistUser', type: 'async', func: persistUser});
steps.set('SendRegistrationEvent', {id: 'SendRegistrationEvent', type: 'async', func: sendRegistrationEvent});

async function getSteps() {
  const map = new Map();
  const prompt = registration('CA, USA', '30');
  
}


export default function Home() {
  return (
    <main className={styles.main}>
      
    </main>
  )
}
