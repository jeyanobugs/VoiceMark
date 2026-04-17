export const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

export const gasRequest = async (action: string, payload: any = {}) => {
  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn(`[Mock API] action: ${action}`, payload);
    return { success: true, message: `Mock success for ${action}` };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      // GAS requires simple text body often to avoid CORS preflight issues 
      // when deployed in certain ways, so we send JSON string
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${action}:`, error);
    throw error;
  }
};

export const apiGetFiles = async () => {
  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
     return { success: true, files: [] };
  }
  try {
    const res = await fetch(`${API_URL}?action=getFiles`);
    return await res.json();
  } catch (error) {
    throw error;
  }
};
