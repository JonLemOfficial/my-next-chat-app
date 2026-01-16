import { useEffect } from 'react';
import axios from 'axios';
// import useAuth from './useAuth';

export function useApi(enablePrivateConfig = false) {

  //   const { authData, refreshAuth } =  useAuth();

  const publicApiClient = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_APP_DEV_URL : process.env.NEXT_PUBLIC_APP_PROD_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const privateApiClient = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_APP_DEV_URL : process.env.NEXT_PUBLIC_APP_PROD_URL,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${authData?.accessToken}`
    },
    withCredentials: true
  });

  useEffect(() => {

    const requestIntercept = privateApiClient.interceptors.request.use(
      config => {
        // if ( !config.headers['Authorization'] ) {
        //   // console.log(`Sending request to url: '${config.url}', using method: '${config.method}', with aT: ${authData?.accessToken}`, );
        //   config.headers['Authorization'] = `Bearer ${authData?.accessToken}`;
        // }

        return config;
      },
      err => Promise.reject(err)
    );

    const responseIntercept = privateApiClient.interceptors.response.use(
      response => response,
      async err => {
        const previousRequest = err?.config;
        if ( ( err?.response?.status === 403 || err?.response?.status === 401 ) && !previousRequest?.sent ) {
            previousRequest.sent = true;
            // console.log('Refreshing token');
            // previousRequest.headers['Authorization'] = `Bearer ${await refreshAuth()}`;
            return privateApiClient(previousRequest);
        }

        return Promise.reject(err);
      }
    );

    return () => {
      privateApiClient.interceptors.request.eject(requestIntercept);
      privateApiClient.interceptors.response.eject(responseIntercept);
    };

  }, [
    // authData,
    // refreshAuth,
    privateApiClient
]);

  return enablePrivateConfig ? privateApiClient : publicApiClient;
}