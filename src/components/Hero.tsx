import { useEffect, useState } from "react";
import { Button } from "./ui/button";
// import { lastPrices, PriceData, subscribePrice } from "@/lib/nostr";

import { Line, LineChart, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Link } from "react-router-dom";
import { useRelay, PriceData } from "@/hooks/use-relay";

const Hero = () => {
  const { relay } = useRelay()

  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [changePrices, setChangePrices] = useState([])
  const chartConfig = {} satisfies ChartConfig

  useEffect(() => {
    if (relay) {
      relay.subscribePrice('free', (data) => {
        setChartData(prev => [...prev, data]);
        setChangePrices(prev => {
          if (prev.length == 0) return [data.aggregate]
          if (prev.length == 1) return [data.aggregate, prev]
          return [data.aggregate, prev[0]]
        })
      })
    }

  }, [relay]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between w-full p-5 md:px-60 gap-20">
        <div className="relative z-10 flex flex-col gap-5 md:w-1/3">

          <h1 className="text-6xl md:text-8xl tracking-tight mb-6 font-[900] font-title uppercase">
            <span className="text-white">Price<span className="text-violet-500">Str</span></span>
          </h1>
          <h2 className="text-2xl">Signed. Relayed. Verified.</h2>
          <div className="border-l border-violet-400 pl-5 flex flex-col gap-1 text-left text-lg">
            <p>The first verifiable Bitcoin price feed built natively for Nostr.</p>
            <p>No API keys. No database.</p>
            <p>Just a signature and a relay.</p>
          </div>
          <div className="flex gap-5 mt-10">
            <Button className="bg-white" asChild>
              <Link to='#get-started'>View pubkey</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to='#how-it-works'>Discover how it works</Link>
            </Button>
          </div>
          <div className="flex gap-5">
            <span className="py-2 px-4 text-xs rounded-full border text-center items-center border text-muted-foreground uppercase hover:text-white/80 hover:bg-white/10 hover:border-white/20">Open-source</span>
            <span className="py-2 px-4 text-xs rounded-full border text-center items-center border-primary/20 text-primary/60 uppercase hover:text-primary/80 hover:bg-primary/10 hover:border-primary/20">Lightning payment</span>
          </div>
        </div>

        <div className="flex flex-col font-mono text-xs md:w-2/3">
          <div className="border border-white/10 flex justify-between p-3 uppercase">
            <span>Price signal</span>
            <span className="text-primary flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
              </span>
              Live
            </span>
            <span>60s interval</span>
          </div>
          <div className="border border-t-0 border-white/10">
            {/* <canvas height={251} width={899} id="price-chart"></canvas> */}
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
              >
                <ChartTooltip
                  cursor={true}
                  content={<ChartTooltipContent className="w-[200px]" indicator='line' />}
                />
                <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide={true} />
                {Object.entries(chartData[0]?.sources || {}).map(([source, _]) => (
                  <Line
                    key={source}
                    dataKey={`sources.${source}`}
                    type="natural"
                    stroke={source === 'binance' ? '#ffdd00' : source === 'coinbase' ? '#0059ff' : '#6532b7'}
                    dot={false}
                    opacity={0.2}
                    strokeWidth={1}
                    name={source}
                  />
                ))}
                <Line
                  dataKey="aggregate"
                  type="natural"
                  stroke="#ff9d00"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="border border-t-0 border-white/10 flex justify-between">
            <div className="flex-1 flex flex-col p-5 gap-2 border-r border-white/10">
              <div className="flex justify-between ">
                <span className="">BTC / USD</span>
                {changePrices.length > 1 && (changePrices[0] - changePrices[1]) != 0 && <span className={`${changePrices[0] - changePrices[1] < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(changePrices[0] - changePrices[1])}
                </span>}
              </div>
              {chartData.length > 0 &&
                <p className="font-title text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(changePrices[0])}</p>
              }
              <p className="text-xs text-gray-500">median</p>
            </div>
            <div className="flex-1 flex flex-col p-5 gap-2">
              <div className="flex justify-between uppercase">
                <span className="">Sources</span>
              </div>
              <div className="flex flex-col mt-2">
                {chartData.length > 0 && Object.entries(chartData[chartData.length - 1].sources).map(([source, price]) => (
                  <div key={source} className="text-sm font-mono uppercase tracking-tight flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${source === 'binance' ? 'bg-yellow-400/40' : source === 'coinbase' ? 'bg-blue-600/40' : 'bg-violet-800/40'}`}></div>
                    {source}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
