
export type DataSchema = {
    sales: number | String;
    profit: number;
    uv: number;
  };

  export type PriceNumber = {
    sales: number;
    profit: number;
    uv: number;
  };
  
  export type ProfitLoss = {
    strikePrice: number;
    optionPrice: number;
    currentFloorPrice: number;
  };
  
 export type PropsDot = {
    uv: DataSchema[];
    minNum: {
      sales?: number;
      profit?: number;
      uv?: number;
    };
    r?: number;
    type?: string;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
    points?: [];
    width?: number;
    height?: number;
    dataKey?: String;
    cx: any;
    cy: any;
    index?: number;
    value: number[];
    payload?: {};
  };

type Payload = { uv: number; satis: number; kar: number, index?: number };

export type PropsToolTip = {
  payload: Payload[];
  setKar: (kar: number) => void;
  setUv: (uv: number) => void;
};