const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getAllUser(){
  let user = []
  try {
      
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      user = await response.json();
  return user
  } catch (err) {
      return err
  }
}

export async function getUserById(numberUser){
    let user = []
    try {
        
        const response = await fetch(`${API_URL}/users/${numberUser}`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        user = await response.json();
    return user
    } catch (err) {
        return err
    }
}

export async function getUserByEmployeeNumber(numberUser) {
  try {
    const response = await fetch(
      `${API_URL}/users/employee-number/${numberUser}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const user = await response.json();
    return user;
  } catch (err) {
    console.error('Error en getUserByEmployeeNumber:', err);
    return null;
  }
}

  export async function whoIam() {
    let user = [];
    try {
      const response = await fetch(
        `${API_URL}/auth/user-by-token`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }  
      user = await response.json();
      return user;
    } catch (err) {
      return err;
    }
  }

  export async function getAllUserByType(param){
    let user = []
    try {
        
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        user = await response.json();
    return user.filter(tu => tu.type_user === param)
    } catch (err) {
        return err
    }
  }
  

  