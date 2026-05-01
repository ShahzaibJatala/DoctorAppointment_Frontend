'use server'
import { cookies } from 'next/headers';

export const getToken = async (): Promise<string | undefined> => {

const Cookies = await cookies();
const Token = Cookies.get('accessToken')?.value;
return Token;
}

export async function removeToken() {
    // If your cookie is named something else (like 'access_token' or 'jwt'), 
    // make sure to change 'token' to match it perfectly.
    const Cookies = await cookies();
    Cookies.delete('accessToken');
  }