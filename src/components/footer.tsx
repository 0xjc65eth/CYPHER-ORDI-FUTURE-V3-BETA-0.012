'use client'

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

// Navigation links for the footer
const footerNavigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Trading', href: '/trading' },
  { name: 'Market', href: '/market' },
  { name: 'Ordinals', href: '/ordinals' },
  { name: 'Runes', href: '/runes' },
  { name: 'Miners', href: '/miners' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Settings', href: '/settings' },
  { name: 'Resources', href: '/resources' },
]

// Legal links
const legalLinks = [
  { name: 'Legal', href: '/legal' },
  { name: 'Status', href: '/status' },
  { name: 'Sitemap', href: '/sitemap' },
]

// NFT collections for premium access
const premiumCollections = [
  'OCM GENESIS',
  'OCM KATOSHI PRIME',
  'OCM KATOSHI CLASSIC',
  'MULTIVERSO PASS',
  'SEIZE CTRL',
  'N0 0RDINARY KIND',
  'BITCOIN PUPPETS',
  'THE WIZARDS OF LORD',
  'YIELD HACKER PASS',
  'STACK SATS'
]

export function Footer() {
  const pathname = usePathname()

  return (
    <footer className="bg-[#0F0F0F] border-t border-[#1A1A1A]">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <span className="font-bold text-xl text-white">CYPHER ORDI FUTURE</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Bitcoin data analysis platform for Ordinals and Runes with neural learning capabilities.
            </p>
            <div className="flex items-center">
              <ThemeToggle />
              <span className="ml-2 text-sm text-gray-500">Toggle theme</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm ${
                      pathname === item.href ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
                    } transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium access */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Premium Access</h3>
            <p className="text-sm text-gray-400 mb-2">
              Holders of these collections receive unlimited premium access:
            </p>
            <ul className="space-y-1">
              {premiumCollections.map((collection, index) => (
                <li key={index} className="text-xs text-purple-400">
                  {collection}
                </li>
              ))}
            </ul>
          </div>

          {/* Donation and legal */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support & Legal</h3>
            <div className="p-3 bg-[#1A1A1A] rounded-md mb-4">
              <p className="text-xs text-gray-400 mb-1">DONATION ADDRESS:</p>
              <p className="font-mono text-xs text-blue-400 break-all">
                bc1q3ghzvpp0l74q3ntu8actyt0qcvl2u273flg5rs
              </p>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Donations are incentives that drive project evolution.
            </p>
            <ul className="flex flex-wrap gap-4">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-[#1A1A1A] py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © 2024 CYPHER ORDI FUTURE. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2 md:mt-0">
            Thank you for being part of our community!
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer