import { isArray, isObject } from '@vue/shared';
import isJsonResponse from './is-json-response'

function request(endpoint: string, method: string, query: any, data: any, headers: any, withHeaders: boolean) {
  const common = {
    method,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'ru',
      Authorization: 'Bearer ' + localStorage.accessToken,
      ...headers,
    },
  }

  let hasFiles = false
  for (const key in data) {
    if (data[key] instanceof File) {
      hasFiles = true
      break;
    } else if (isArray(data[key])) {
      data[key].forEach((item: any) => {
        if (item instanceof File) {
          hasFiles = true
          return;
        }
      })
      if (hasFiles) {
        break;
      }
    }
  }

  const formData = new FormData()
  if (hasFiles) {
    for (const key in data) {
      let isArrayOfFiles = false;

      if (isArray(data[key])) {
        data[key].forEach((item: any) => {
          if (item instanceof File) {
            formData.append("files[]", item)

            isArrayOfFiles = true;
          }
        })
      }

      if (!isArrayOfFiles) {
        formData.append(key, data[key])
      }
    }
  }

  const body =
    data !== null
      ? {
        headers: hasFiles ? {} : {
          'Content-Type': 'application/json',
        },
        body: hasFiles ? formData : JSON.stringify(data),
      }
      : { headers: {} }

  let url = process.env['VUE_APP_API_URL'] + '/' + endpoint;

  if (query !== null) {
    if (isObject(query)) {
      const params = new URLSearchParams(query);
      const keysForDel: string[] = [];
      params.forEach((v, k) => {
        // if (v === '' || v === undefined || v === null)
        if (v === '')
          keysForDel.push(k);
      });
      keysForDel.forEach(k => {
        params.delete(k)
      })
      url += '?' + params.toString()
    } else {
      url += '?' + query
    }
  }

  return fetch(url, {
    ...common,
    ...body,
    headers: {
      ...common.headers,
      ...body.headers,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response
      }
      throw response
    })
    .then((response) => {
      if (isJsonResponse(response)) {
        if (withHeaders) {
          return {
            data: response.json(),
            headers: response.headers
          }
        } else {
          return response.json()
        }
      }
      return response.text()
    })
}

const api = {
  get: (url: string, query: any = {}, headers = {}) => request(url, 'GET', query, null, headers, false),
  getWithHeaders: (url: string, query: any = {}, headers = {}) => request(url, 'GET', query, null, headers, true),
  post: (url: string, data: any, headers = {}) => request(url, 'POST', null, data, headers, false),
  patch: (url: string, data: any, headers = {}) => request(url, 'PATCH', null, data, headers, false),
  delete: (url: string, headers = {}) => request(url, 'DELETE', null, null, headers, false),
}

export default api
