import { useCallback, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  YAxis,
  CartesianGrid,
  Tooltip,
  CartesianAxis,
} from "recharts";
import axios from "axios";
import CustomTooltip from "./CustomToolTip";
import CustomDot from "./CustomDot";
import { DataSchema, PriceNumber, ProfitLoss } from "../helpers/dataTypes";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import swal from "sweetalert";

const fetchData = async () => {
  const url = "https://mqcmmn3bpx.us-east-1.awsapprunner.com/pnldata";
  const response = await axios.get<ProfitLoss>(url);
  return response.data;
};

const generateSchema = (profitLoss: ProfitLoss | undefined) => {
  if (!profitLoss) {
    return undefined;
  }
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
  const dataLoopDataSchema: DataSchema[] = [];
  const dataLoopSchema: DataSchema[] = [];
  for (let i = 0; i < 30; i++) {
    const dataUv = (dataCount.id += 1);
    const schemeUv = (dataCount.mid += 1);
    const sales = (profitLoss.currentFloorPrice += acc);
    const profit = sales - (profitLoss.optionPrice + profitLoss.strikePrice);
    dataLoopDataSchema.push({
      sales: Number(sales.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      uv: dataUv,
    });
    dataLoopSchema.push({
      uv: schemeUv,
      sales: 0,
      profit: 0,
    });
  }
  return { dataLoopDataSchema, dataLoopSchema };
};
function mergeSchema(schema?: DataSchema[], dataSchema?: DataSchema[]) {
  if (!schema || !dataSchema) return null;
  const mergedSchema = schema.slice()
  for (let i = 0; i < schema.length; i++) {
    for (let j = 0; j < dataSchema.length; j++) {
      const a = schema[i].uv == dataSchema[j].uv;
      if (a) {
        mergedSchema[i].sales = dataSchema[j].sales;
        mergedSchema[i].profit = dataSchema[j].profit;
      }
    }
  }
  console.log(mergedSchema)
  return mergedSchema ;
}
function updateSchema(schema?: DataSchema[]) {
  if (!schema) return null;

  const minNum: DataSchema | any = schema.find((sch: any) => sch.sales > 0);
  console.log("sales",minNum.sales)
  const maxUv = Math.max(...schema.map((num: any) => num.uv));

const schemaMaxVal = schema.map((item) => {
  if(item.uv !== maxUv) return item
  return {
    ...item,
    sales: "Unlimited"
  }
})

  const updatedSchema = schemaMaxVal.map((item) => {
    
    if (item.sales !== 0) {
      return item;
    }
    return {
      ...item,
      sales: minNum.sales,
      uv: minNum.uv,
      profit: minNum.profit,
    };
  });
  return { minNum, maxUv,updatedSchema };
}
const gradientOffset = (schema?: DataSchema[]) => {
  if (!schema) {
    return null;
  }
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

const ChartSkeleton = () => {

  const [dotUv, setDotUv] = useState(0);
  const [kar, setKar] = useState(0);


  const { isError, isSuccess, isLoading, data, error } = useQuery(
    ["SchemaData"],
    fetchData
  );
  const schemaData = generateSchema(data);
  const schema = schemaData?.dataLoopSchema;
  const dataSchema = schemaData?.dataLoopDataSchema;
  const mergedSchema = mergeSchema(schema, dataSchema);
  const schemaResult = updateSchema(mergedSchema || null || undefined);


  const { minNum, maxUv, updatedSchema } = schemaResult || {};
console.log(updatedSchema)
  const off = gradientOffset(updatedSchema);

  if (isLoading || !off || !schema || !updatedSchema)
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-5xl font-medium">Loading...</h1>
      </div>
    );

  if (isError) {
    const name = (error as Error).name;
    const message = (error as Error).message;
    swal(name, message).then(() => {
      window.location.reload();
    });
  }
  return (
    <>
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
          data={updatedSchema}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianAxis />
          <CartesianGrid x={100} vertical={false} />
          <YAxis tickCount={3} />
          <Tooltip
            // content={
            //  <CustomTooltip setKar={setKar} setUv={setDotUv}   />
            // }
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
                uv={updatedSchema}
                cx={undefined}
                cy={undefined}
                value={[]}
                minNum={minNum}
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
    </>
  );
};

export default ChartSkeleton;
