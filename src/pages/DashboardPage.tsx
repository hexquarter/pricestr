
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Auth } from "@/components/Auth";
import { useSubscription } from "@/hooks/use-subscription";
import { ChartLine, Code2Icon, FilesIcon, WebhookIcon } from "lucide-react";

const DashboardPage = () => {
  const [authenticated, setAuthenticated] = useState(false)

  const subscription = useSubscription()

  const disconnect = () => {
    localStorage.removeItem('npub')
    localStorage.removeItem('nsec')
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex gap-10">
        {authenticated &&
          <aside className="bg-black/20 h-screen min-w-[250px] pt-10">
            <header
            >
              <div className="px-6 h-14 flex items-center justify-between">
                <Link to="/" className="font-title uppercase text-base font-[900] tracking-widest">
                  Price<span className="text-violet-400">str</span>
                </Link>
              </div>
            </header>
            <div className="flex flex-col gap-2 mt-[60px]">
              <a href='/dashboard' className={`px-6 ${location.pathname == '/dashboard' ? 'bg-violet-400' : ''} w-full py-3 font-mono uppercase flex items-center gap-3`}><ChartLine />Dashboard</a>
              <a href={subscription.billingUrl} target='_blank' className="px-6 w-full py-3 font-mono uppercase flex items-center gap-3"><FilesIcon />Billing</a>
              <a href='/dashboard/webhooks' className={`px-6 ${location.pathname == '/dashboard/webhooks' ? 'bg-violet-400' : ''} w-full py-3 font-mono uppercase flex items-center gap-3`}><WebhookIcon />Webhooks</a>
              <a href='/dashboard/integration' className={`px-6 ${location.pathname == '/dashboard/integration' ? 'bg-violet-400' : ''} w-full py-3 font-mono uppercase flex items-center gap-3`}><Code2Icon />Integration</a>
            </div>
          </aside>
        }
        <div className="flex-1">
          {!authenticated && <div className="max-w-7xl mx-auto">
            <div className="px-6 h-14 flex items-center justify-between">
              <Link to="/" className="font-title uppercase text-base font-[900] tracking-widest">
                Price<span className="text-violet-400">str</span>
              </Link>
            </div>
            <Auth onSuccess={() => setAuthenticated(true)} />
          </div>}

          {authenticated &&
            <div className="flex flex-col">
              <div className="justify-end mt-10 mr-20 flex lg:flex-row flex-col">
                <div className="bg-black/10 p-2 border text-muted-foreground text-xs flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="">{subscription.npub}</span>
                </div>
                <Button className="text-xs" variant="outline" onClick={() => disconnect()}>Disconnect</Button>
              </div>
              <div className="mt-20 mr-20">
                <Outlet />
              </div>
            </div>
          }
        </div>
      </div>
    </main >
  )
}

export default DashboardPage;