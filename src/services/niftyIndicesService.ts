import axios from 'axios';

interface NiftyIndexData {
  name: string;
  currentValue: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

export const fetchNiftyIndices = async (): Promise<NiftyIndexData[]> => {
  try {
    const response = await axios.get('http://localhost:3001/api/nifty-indices');
    return response.data;
  } catch (error) {
    console.error('Error fetching NIFTY indices:', error);
    // Return mock data in case of error
    return [
      {
        name: 'NIFTY 50',
        currentValue: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0
      },
      {
        name: 'SENSEX',
        currentValue: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0
      },
      {
        name: 'NIFTY NEXT 50',
        currentValue: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0
      },
      {
        name: 'NIFTY BANK',
        currentValue: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0
      },
      {
        name: 'NIFTY MIDCAP 100',
        currentValue: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0
      }
    ];
  }
}; 