'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoonIcon, 
  SunIcon, 
  BellIcon, 
  Cog6ToothIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { BitcoinPrice } from "@/components/bitcoin-price";

export function Navbar() {
  const { setTheme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="CYPHER ORDI FUTURE" 
              width={32} 
              height={32} 
              className="h-8 w-8" 
            />
            <span className="hidden font-bold sm:inline-block">
              CYPHER ORDI FUTURE
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <BitcoinPrice />
          </div>
          
          <nav className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    3
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                  <span className="font-medium">Notifications</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                    Mark all as read
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="text-sm font-medium">New Ordinal Inscription</div>
                    <div className="text-xs text-zinc-400">Bitcoin Frogs #1234 was just inscribed</div>
                    <div className="mt-1 text-xs text-zinc-500">2 minutes ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="text-sm font-medium">Price Alert</div>
                    <div className="text-xs text-zinc-400">Bitcoin just crossed $60,000</div>
                    <div className="mt-1 text-xs text-zinc-500">15 minutes ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="text-sm font-medium">New Block Mined</div>
                    <div className="text-xs text-zinc-400">Block #800,000 was just mined</div>
                    <div className="mt-1 text-xs text-zinc-500">1 hour ago</div>
                  </DropdownMenuItem>
                </div>
                <div className="border-t border-zinc-800 p-2">
                  <Button variant="outline" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <SunIcon className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <MoonIcon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Cog6ToothIcon className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsConnected(false)}>
                    <span>Disconnect Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsConnected(true)}
                className="ml-2"
              >
                Connect Wallet
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}