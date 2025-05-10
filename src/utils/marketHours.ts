export const isIndianMarketOpen = (): boolean => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  if (istTime.getUTCDay() === 0 || istTime.getUTCDay() === 6) return false;
  
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  return timeInMinutes >= 555 && timeInMinutes <= 930;
};

export const getNextMarketOpen = (): Date => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  istTime.setUTCHours(3, 45, 0, 0);
  
  if (istTime.getUTCHours() * 60 + istTime.getUTCMinutes() > 930) {
    istTime.setDate(istTime.getDate() + 1);
  }
  
  if (istTime.getUTCDay() === 5 && istTime.getUTCHours() * 60 + istTime.getUTCMinutes() > 930) {
    istTime.setDate(istTime.getDate() + 3);
  }
  else if (istTime.getUTCDay() === 6) {
    istTime.setDate(istTime.getDate() + 2);
  }
  else if (istTime.getUTCDay() === 0) {
    istTime.setDate(istTime.getDate() + 1);
  }
  
  return new Date(istTime.getTime() - istOffset);
}; 