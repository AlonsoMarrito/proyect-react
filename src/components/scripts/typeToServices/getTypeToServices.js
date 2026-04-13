const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getAllTypeToServices(){
    let typeService = []
    try {
        const response = await fetch(`${API_URL}/type-services`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        typeService = await response.json();
    return typeService
    } catch (err) {
        return err
    }
  }
