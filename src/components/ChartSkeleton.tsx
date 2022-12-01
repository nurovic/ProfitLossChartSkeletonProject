import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  YAxis,
  CartesianGrid,
  Tooltip,
  CartesianAxis,
} from "recharts";
import axios from "axios";
import SweetAlert2 from "react-sweetalert2";
import CustomTooltip from "./CustomToolTip";
import CustomDot from "./CustomDot";
import {DataSchema, PriceNumber, ProfitLoss} from '../helpers/dataTypes'

const ChartSkeleton = () => {
  const [dataSchema, setDataSchema] = useState<DataSchema[]>([]);
  const [schema, setSchema] = useState<DataSchema[]>([]);
  const [min, setMin] = useState<{} | PriceNumber>({
    sales: 0,
    profit: 0,
    uv: 0,
  });
  const [maxUv, setMaxUv] = useState(Number);
  const [dotUv, setDotUv] = useState(Number);
  const [swalProps, setSwalProps] = useState({});
  const [loading, setLoading] = useState(false);
  const [kar, setKar] = useState(Number);
  console.log();
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const url = "https://mqcmmn3bpx.us-east-1.awsapprunner.com/pnldata";
      const response = await axios.get<ProfitLoss>(url);
      await createSchema(response.data);
      mergeSchema();
      updateSchema();
      setLoading(true);
    } catch (err) {
      const name = (err as Error).name;
      const message = (err as Error).message;
      setSwalProps({
        show: true,
        title: name,
        text: message,
      });
    }
  }

  const createSchema = (profitLoss: ProfitLoss) => {
    const times = {
      from: 1,
      to: 30,
    };
    const acc = Number(
      (
        (profitLoss.strikePrice +
          profitLoss.optionPrice -
          profitLoss.currentFloorPrice) /
        2
      ).toFixed(2)
    );

    let dataCount = {
      id: -2,
      count: 0,
      mid: times.to / -2,
    };
    for (let i = 0; i < 30; i++) {
      const dataUv = (dataCount.id += 1);
      const schemeUv = (dataCount.mid += 1);
      const sales = (profitLoss.currentFloorPrice += acc);
      const profit = sales - (profitLoss.optionPrice + profitLoss.strikePrice);
      dataSchema.push({
        sales: Number(sales.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        uv: dataUv,
      });
      schema.push({
        uv: schemeUv,
        sales: 0,
        profit: 0,
      });
    }
  };
  function mergeSchema() {
    for (let i = 0; i < schema.length; i++) {
      for (let j = 0; j < dataSchema.length; j++) {
        const a = schema[i].uv == dataSchema[j].uv;
        if (a) {
          schema[i].sales = dataSchema[j].sales;
          schema[i].profit = dataSchema[j].profit;
        }
      }
    }
  }
  function updateSchema() {
    const minNum: DataSchema | any = schema.find((sch) => sch.sales > 0);
    setMin(minNum);

    const maxUv = Math.max(...schema.map((num) => num.uv));
    setMaxUv(maxUv);
    schema.forEach((update) =>
      update.uv === maxUv ? (update.sales = "Unlimited") : update
    );
    
    schema.forEach((update) =>
      update.sales === 0
        ? ((update.sales = minNum.sales),
          (update.uv = minNum.uv),
          (update.profit = minNum.profit))
        : update
    );
  }
  const gradientOffset = () => {
    const dataMax = Math.max(...schema.map((i) => i.uv));
    const dataMin = Math.min(...schema.map((i) => i.uv));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };
  const off = gradientOffset();

  return (
    <>
      {loading ? (
        <div className="h-screen flex flex-col justify-center items-center ">
          <p className="text-xl font-medium text-gray-400">
            Expected Profit & Loss
          </p>
          {dotUv == 0 ? (
            <h2 className="mb-8 text-3xl font-bold"> {kar} </h2>
          ) : maxUv == dotUv ? (
            <h2 className="mb-8 text-3xl text-green-600 font-bold">
              {" "}
              Unlimited{" "}
            </h2>
          ) : dotUv > 0 ? (
            <h2 className="mb-8 text-3xl text-green-500 font-bold"> {kar} </h2>
          ) : dotUv < 0 ? (
            <h2 className="mb-8 text-3xl text-red-600 font-bold"> {kar} </h2>
          ) : null}

          <AreaChart
            width={500}
            height={400}
            data={schema}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianAxis />
            <CartesianGrid
              x={100}
              vertical={false}
            />
            <YAxis tickCount={3} />
            <Tooltip
              content={<CustomTooltip setKar={setKar} setUv={setDotUv} payload={[]} />}
            />
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset={off}
                  stopColor=" #07d32f80"
                  stopOpacity={1}
                  stroke="none"
                />
                <stop
                  offset={off}
                  stopColor="#ff393980"
                  stopOpacity={1}
                  stroke="none"
                />
              </linearGradient>
              <linearGradient id="splitColors" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset={off}
                  stopColor="#33de04"
                  stopOpacity={1}
                  stroke="none"
                />
                <stop
                  offset={off}
                  stopColor="#de0404"
                  stopOpacity={1}
                  stroke="none"
                />
              </linearGradient>
            </defs>
            <Area
              type="linear"
              dataKey="uv"
              stroke="url(#splitColors)"
              fill="url(#splitColor)"
              dot={
                <CustomDot
                  uv={schema}
                  cx={undefined}
                  cy={undefined}
                  value={[]}
                  minNum={min}
                />
              }
            />
          </AreaChart>
          <div className="flex flex-row items-center mt-14">
            {-1 === dotUv ? (
              <p className="mr-20 flex flex-row items-center text-xl font-bold">
                <span className="flex rounded-full h-4 w-4 bg-red-600 mr-4" />
                Max Loss
              </p>
            ) : (
              <p className="mr-20 flex flex-row items-center ">
                <span className="flex rounded-full h-2 w-2 bg-gray-600 mr-4" />
                Max Loss
              </p>
            )}
            {0 === dotUv ? (
              <p className="mr-20 flex flex-row items-center text-xl font-bold">
                <span className="flex rounded-full h-4 w-4 bg-black mr-4 " />
                Breakeven
              </p>
            ) : (
              <p className="mr-20 flex flex-row items-center">
                <span className="flex rounded-full h-2 w-2 bg-gray-600 mr-4 " />
                Breakeven
              </p>
            )}

            {15 === dotUv ? (
              <p className="flex flex-row items-center text-xl font-bold">
                <span className="flex rounded-full h-4 w-4 bg-lime-500 mr-4" />
                Max Profit
              </p>
            ) : (
              <p className="flex flex-row items-center ">
                <span className="flex rounded-full h-2 w-2 bg-gray-500 mr-4" />
                Max Profit
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-5xl font-medium">Loading...</h1>
        </div>
      )}
      <SweetAlert2
        {...swalProps}
        didClose={() => {
          window.location.reload();
        }}
      />
    </>
  );
};

export default ChartSkeleton;
