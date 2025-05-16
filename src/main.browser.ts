import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppBrowserModule } from './app/app.browser.module';
import { registerLicense } from '@syncfusion/ej2-base';

 registerLicense('ORg4AjUWIQA/Gnt2VVhkQlFac11JXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxQdkZgWX9fcX1XRGVZU00=');
//registerLicense('Mgo+DSMBaFt+QHFqVkNrXVNbdV5dVGpAd0N3RGlcdlR1fUUmHVdTRHRcQl5gSX5Sd0BhWH5Yd3w=;Mgo+DSMBPh8sVXJ1S0d+X1RPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSX1QdkViWHpccXVdRGg=;ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5QdUVjWH5bcnVUT2ZU;MTU1MjM0NEAzMjMxMmUzMTJlMzMzNW12YVp0U1Y2RUxIOGVQREQxMVJ6aXM4R1VuODhzOFdmd0pyUXEzWW0rSmM9;MTU1MjM0NUAzMjMxMmUzMTJlMzMzNWpFMG1TNEVEUlZ4Y2V1cjR3ZGRnOFQ0Ky9WTW5sOE4wUVFjbkhOYkw5blk9;NRAiBiAaIQQuGjN/V0d+XU9Hc1RDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS31TdUZjWX5fdXZURGdcWQ==;MTU1MjM0N0AzMjMxMmUzMTJlMzMzNUhOOTkrL1NzU1oraUQ4c1NEQnZUUWw1aFc3Zk5qL0Uya1drK2R0QXBBMGs9;MTU1MjM0OEAzMjMxMmUzMTJlMzMzNVl5RTdpNXV6QzNtL2NpZityZTd0dGRaMzlRUS9pYitnWWxJb1Ezc0IyQ2M9;Mgo+DSMBMAY9C3t2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5QdUVjWH5bcnVWRWlU;MTU1MjM1MEAzMjMxMmUzMTJlMzMzNWs4Rjc0cEw2ckpYbXFKa0gxYXE5amhIQ1ltbnMyRXZOMVhPS2t3Tk8xK009;MTU1MjM1MUAzMjMxMmUzMTJlMzMzNW5TZVJHSEU3L2RhdmtJdFN2RGYydzlIRGZGS29yM2p6VThSQmF0MXZvVjg9;MTU1MjM1MkAzMjMxMmUzMTJlMzMzNUhOOTkrL1NzU1oraUQ4c1NEQnZUUWw1aFc3Zk5qL0Uya1drK2R0QXBBMGs9');
if (environment.production) {
  enableProdMode();
  window.console.log = function () { };
  window.console.warn = function () { };

}


document.addEventListener('DOMContentLoaded', () => {

  platformBrowserDynamic().bootstrapModule(AppBrowserModule).catch(err => console.log(err));
  
});
