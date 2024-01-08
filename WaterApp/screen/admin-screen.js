import React from 'react';
import { Platform } from 'react-native';
import Calendar from '../components/calendar';
import CalendarWindows from '../components/calendar-windows';

function Admin() {
  return Platform.OS === 'windows' ? <CalendarWindows /> : <Calendar />;
}

export default Admin;
