// Import the environment variable for the API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://xpressdine-backend.vercel.app';

// Make sure API_BASE_URL doesn't end with a slash, but we'll add one in the request function
const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

interface RequestOptions extends RequestInit {
  // You can add any custom options here if needed in the future
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  // Add any other default headers here, e.g., an API key if not handled by cookies
};

async function request<T>(endpoint: string, options: RequestOptions = {}, body?: any): Promise<T> {
  // Ensure endpoint starts with '/api/' if not already
  const apiPath = endpoint.startsWith('/api/') ? endpoint : endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;
  const url = `${baseUrl}${apiPath}`;
  
  console.log(`[ApiClient] Constructed URL: ${url}`);
  
  // Set redirect mode to manual to prevent redirect loops
  const redirectMode: RequestRedirect = options.redirect || 'follow';

  let requestBody = body;
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  if (body instanceof FormData) {
    // Let the browser set the Content-Type for FormData
    delete headers['Content-Type']; 
  } else if (body && typeof body === 'object') {
    requestBody = JSON.stringify(body);
  } else {
    // Body is already a string or undefined, or some other primitive
    requestBody = body;
  }

  const config: RequestOptions = {
    ...options,
    headers,
    body: requestBody,
    credentials: 'include', // Crucial for sending cookies
    redirect: redirectMode, // Use our redirect setting
  };

  console.log(`[ApiClient] Making ${options.method || 'GET'} request to ${url} with headers:`, config.headers, `and body (type): ${typeof config.body}`);

  try {
    const response = await fetch(url, config);
    console.log(`[ApiClient] Response from ${url}:`, response);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error(`[ApiClient] Error response data from ${url}:`, errorData);
      } catch (e) {
        // If response is not JSON, use text
        const errorText = await response.text();
        console.error(`[ApiClient] Error response text from ${url}:`, errorText);
        errorData = { message: errorText || `HTTP error! status: ${response.status}` };
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
      return null as T; // Or an appropriate empty value
    }

    const data: T = await response.json();
    console.log(`[ApiClient] Parsed data from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`[ApiClient] Network or other error for ${url}:`, error);
    // Re-throw the error so it can be caught by the calling function
    // This allows for specific error handling in components
    throw error;
  }
}

export const ApiClient = {
  get: <T>(endpoint: string, options: Omit<RequestOptions, 'body' | 'method'> = {}) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body: any, options: Omit<RequestOptions, 'body' | 'method'> = {}) => 
    request<T>(endpoint, { ...options, method: 'POST' }, body),
  
  put: <T>(endpoint: string, body: any, options: Omit<RequestOptions, 'body' | 'method'> = {}) => 
    request<T>(endpoint, { ...options, method: 'PUT' }, body),
  
  delete: <T>(endpoint: string, options: Omit<RequestOptions, 'body' | 'method'> = {}) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
  
  // You can add a patch method if needed
  // patch: <T>(endpoint: string, body: any, options: Omit<RequestOptions, 'body' | 'method'> = {}) => 
  //   request<T>(endpoint, { ...options, method: 'PATCH' }, body),
};

// Example Usage (can be removed or kept for reference):
/*
async function fetchSomeData() {
  try {
    const data = await ApiClient.get<{ id: number; name: string }[]>('/some-endpoint');
    console.log('Fetched data:', data);
  } catch (error) {
    console.error('Failed to fetch data:', error.message);
  }
}

async function createSomething(payload: { name: string }) {
  try {
    const newItem = await ApiClient.post<{ id: number; name: string }>('/some-endpoint', payload);
    console.log('Created item:', newItem);
  } catch (error) {
    console.error('Failed to create item:', error.message);
  }
}
*/
