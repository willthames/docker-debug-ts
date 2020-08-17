// https://stackoverflow.com/a/46899760/3538079

declare module 'zipkin-instrumentation-axiosjs' {
  import { Tracer } from 'zipkin';
  import { AxiosStatic, AxiosInstance } from 'axios';

  function wrapAxios(
    axios: AxiosInstance | AxiosStatic,
    options: { tracer: Tracer; serviceName: string; port: number },
  ): AxiosInstance;
  export = wrapAxios;
}
