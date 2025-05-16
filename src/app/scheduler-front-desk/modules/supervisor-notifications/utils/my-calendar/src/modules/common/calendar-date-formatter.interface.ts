/**
 * The parameter type passed to the date formatter methods.
 */
export interface DateFormatterParams {
  /**
   * The date to format.
   */
  date: Date;

  /**
   * The users preferred locale.
   */
  locale?: string;

  /**
   * The start day number of the week
   */
  weekStartsOn?: number;

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
   */
  excludeDays?: number[];

  /**
   * The number of days in a week. Can be used to create a shorter or longer week view.
   * The first day of the week will always be the `viewDate`
   */
  daysInWeek?: number;
}

/**
 * If using a completely custom date formatter then it should implement this interface.
 */
export interface CalendarDateFormatterInterface {
  /**
   * The month view header week day labels
   */
  monthViewColumnHeader(date): any;

  /**
   * The month view cell day number
   */
  monthViewDayNumber(date): any;

  /**
   * The month view title
   */
  monthViewTitle(date): any;

  /**
   * The week view header week day labels
   */
  weekViewColumnHeader(date): any;

  /**
   * The week view sub header day and month labels
   */
  weekViewColumnSubHeader(date): any;

  /**
   * The week view title
   */
  weekViewTitle(date): any;

  /**
   * The time formatting down the left hand side of the day view
   */
  weekViewHour(date): any;

  /**
   * The time formatting down the left hand side of the day view
   */
  dayViewHour(date): any;

  /**
   * The day view title
   */
  dayViewTitle(date): any;
}
