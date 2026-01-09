import { Appointment } from '../App';

export const cleanOldAppointments = () => {
  const saved = localStorage.getItem('nail_appointments');
  if (!saved) return;

  const appointments: Appointment[] = JSON.parse(saved);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Keep only appointments from today onwards
  const filtered = appointments.filter(apt => apt.date > yesterdayStr);
  
  localStorage.setItem('nail_appointments', JSON.stringify(filtered));
  
  console.log(`Cleaned ${appointments.length - filtered.length} old appointments`);
};