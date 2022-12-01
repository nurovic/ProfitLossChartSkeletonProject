import {PropsToolTip} from '../helpers/dataTypes'

const CustomTooltip = (props: PropsToolTip) => {
  const { payload = [], setKar, setUv } = props;
  const total: number[] = payload.map((a: any) => a.payload.sales);
  payload.map((a: any) => setKar(a.payload.profit));
  payload.map((a: any) => setUv(a.payload.uv));
  return (
    <>
      {payload.map((index) => (
        <div
          key={`item-${index}`}
          className="text-bold flex flex-col items-center border"
        >
          <p className="font-bold text-gray-500">Price at EXP</p>
          <p className="font-bold text-l">${total}</p>
        </div>
      ))}
    </>
  );
};

export default CustomTooltip;
