import { adapterFactory as baseAdapterFactory } from 'calendar-utils/date-adapters/date-fns';
import {subWeeks, getYear,getDate,setYear,addWeeks,addMonths,setDate,setMonth,subDays ,subMonths, getISOWeek} from 'date-fns'


import { DateAdapter } from '../date-adapter';

export function adapterFactory(): DateAdapter {
  return {
    ...baseAdapterFactory(),
    addWeeks,
    addMonths,
    subDays,
    subWeeks,
    subMonths,
    getISOWeek,
    setDate,
    setMonth,
    setYear,
    getDate,
    getYear
  };
}
