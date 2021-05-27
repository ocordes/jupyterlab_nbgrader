import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {},
  search: any = undefined
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();

  // construct the Url from different part including the search extension ...
  let requestUrl = '';
  if (search !== undefined) {
    requestUrl = URLExt.join(
      settings.baseUrl,
      endPoint,
      URLExt.objectToQueryString(search)
    );
  } else {
    requestUrl = URLExt.join(settings.baseUrl, endPoint);
  }

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message);
  }

  return data;
}
