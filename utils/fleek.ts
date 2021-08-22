// THIS FILE SHOULD ONLY BE RUN SERVER-SIDE IN API ROUTES

export const getFleekAPIKey = () => {
  if (!process.env.FLEEK_API_KEY) {
    throw new Error('FLEEK_API_KEY environment variable not set!');
  }
  return process.env.FLEEK_API_KEY;
}

export const getFleekAPISecret = () => {
  if (!process.env.FLEEK_API_SECRET) {
    throw new Error('FLEEK_API_SECRET environment variable not set!');
  }
  return process.env.FLEEK_API_SECRET;
}
