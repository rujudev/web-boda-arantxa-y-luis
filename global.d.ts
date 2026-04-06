import 'astro/astro-jsx';
import type DataTables from 'datatables.net';
import type Dropzone from 'dropzone';
import type { JQueryStatic } from 'jquery';
import type _ from 'lodash';
import type noUiSlider from 'nouislider';
import type { Calendar } from 'vanilla-calendar-pro';

declare global {
  interface Window {
    $: JQueryStatic;
    jQuery: JQueryStatic;
    _: typeof _;
    Dropzone: typeof Dropzone;
    noUiSlider: typeof noUiSlider;
    DataTable: typeof DataTables;
    VanillaCalendarPro: typeof Calendar;
    HSStaticMethods?: {
      autoInit: (collection?: string[]) => void;
    };
  }

  namespace JSX {
    // type Element = astroHTML.JSX.Element // We want to use this, but it is defined as any.
    type Element = HTMLElement;
  }
}

export {};
