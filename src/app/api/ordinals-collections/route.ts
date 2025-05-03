import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.ordiscan.com/v1/collections', {
      headers: {
        Authorization: 'Bearer e227a764-b31b-43cf-a60c-be5daa50cd2c'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let collections = data.data || [];

    // Dados de marketplaces para coleções populares
    const COLLECTION_MARKETPLACES = {
      'Ordinal Maxi Biz': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'Taproot Wizards': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'Quantum Cats': ['magiceden.io', 'gamma.io'],
      'Bitcoin Frogs': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'Ordinal Punks': ['magiceden.io', 'gamma.io'],
      'Bitcoin Puppets': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'OCM GENESIS': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'SEIZE CTRL': ['magiceden.io', 'gamma.io'],
      'N0 0RDINARY KIND': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'THE WIZARDS OF LORDS': ['magiceden.io', 'gamma.io'],
      'YIELD HACKER PASS': ['magiceden.io', 'ordswap.io'],
      'STACK SATS': ['magiceden.io', 'gamma.io'],
      'OCM KATOSHI PRIME': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'OCM KATOSHI CLASSIC': ['magiceden.io', 'gamma.io'],
      'MULTIVERSO PASS': ['magiceden.io', 'ordswap.io']
    };

    // Garantir que as coleções populares estejam incluídas
    const popularCollections = [
      {
        name: "Ordinal Maxi Biz (OMB)",
        slug: "ordinal-maxi-biz",
        description: "Ordinal Maxi Biz is a collection of 10,000 unique Bitcoin Ordinals",
        twitter_link: "https://twitter.com/OrdinalMaxiBiz",
        discord_link: "https://discord.gg/ordinalmaxibiz",
        website_link: "https://ordinalmaxibiz.com",
        item_count: 10000,
        volume_24h: 125.5,
        floor_price: 0.0325,
        market_cap: 325000
      },
      {
        name: "Taproot Wizards (TW)",
        slug: "taproot-wizards",
        description: "Magic internet jpegs",
        twitter_link: "https://twitter.com/TaprootWizards",
        discord_link: "https://discord.gg/taprootwizards",
        website_link: "https://taprootwizards.com",
        item_count: 2121,
        volume_24h: 98.3,
        floor_price: 0.85,
        market_cap: 1802850
      },
      {
        name: "Quantum Cats (QC)",
        slug: "quantum-cats",
        description: "Quantum Cats is a collection of 10,000 unique Bitcoin Ordinals",
        twitter_link: "https://twitter.com/QuantumCats",
        discord_link: "https://discord.gg/quantumcats",
        website_link: "https://quantumcats.io",
        item_count: 10000,
        volume_24h: 75.2,
        floor_price: 0.0215,
        market_cap: 215000
      },
      {
        name: "Bitcoin Frogs",
        slug: "bitcoin-frogs",
        description: "10,000 generative frogs on Bitcoin minted by the Lightning Network",
        twitter_link: "https://twitter.com/BitcoinFrogs",
        discord_link: "https://discord.gg/bitcoinfrogs",
        website_link: "https://bitcoinfrogs.com",
        item_count: 10000,
        volume_24h: 62.8,
        floor_price: 0.0185,
        market_cap: 185000
      },
      {
        name: "Ordinal Punks",
        slug: "ordinal-punks",
        description: "100 unique punks on Bitcoin",
        twitter_link: "https://twitter.com/OrdinalPunks",
        discord_link: "https://discord.gg/ordinalpunks",
        website_link: "https://ordinalpunks.com",
        item_count: 100,
        volume_24h: 45.6,
        floor_price: 2.5,
        market_cap: 250000
      }
    ];

    // Verificar se as coleções populares já existem na lista
    const existingSlugs = new Set(collections.map((c: any) => c.slug));

    // Adicionar coleções populares que não existem na lista
    popularCollections.forEach(collection => {
      if (!existingSlugs.has(collection.slug)) {
        collections.push(collection);
      } else {
        // Atualizar coleções existentes com dados adicionais
        const index = collections.findIndex((c: any) => c.slug === collection.slug);
        if (index !== -1) {
          collections[index] = {
            ...collections[index],
            volume_24h: collection.volume_24h,
            floor_price: collection.floor_price,
            market_cap: collection.market_cap
          };
        }
      }
    });

    // Adicionar dados de mercado simulados para todas as coleções
    collections = collections.map((collection: any) => {
      if (!collection.volume_24h) {
        collection.volume_24h = Math.floor(Math.random() * 100) + 10;
      }
      if (!collection.floor_price) {
        collection.floor_price = (Math.random() * 0.1).toFixed(4);
      }
      if (!collection.market_cap) {
        collection.market_cap = collection.item_count * parseFloat(collection.floor_price) * 65000;
      }

      const collectionName = collection.name.split(' (')[0]; // Remove any suffix in parentheses
      const marketplaces = COLLECTION_MARKETPLACES[collectionName] || ['magiceden.io', 'gamma.io'];
      const slug = collection.slug || collectionName.toLowerCase().replace(/\s+/g, '-');

      // Adicionar marketplaces
      collection.marketplaces = marketplaces.map(marketplace => ({
        name: marketplace,
        url: `https://${marketplace}/ordinals/collection/${slug}`
      }));

      // Adicionar links
      collection.links = {
        buy: `https://${marketplaces[0]}/ordinals/collection/${slug}`,
        info: `https://ordiscan.com/collection/${slug}`
      };

      // Adicionar dados de exchanges
      collection.exchanges = [
        { 
          name: "Magic Eden", 
          url: `https://magiceden.io/ordinals/collection/${slug}`, 
          price: parseFloat(collection.floor_price) * 1.02,
          buyUrl: `https://magiceden.io/ordinals/collection/${slug}?listed=true&sort=price-asc`,
          sellUrl: `https://magiceden.io/ordinals/collection/${slug}?action=sell`
        },
        { 
          name: "Gamma.io", 
          url: `https://gamma.io/ordinals/collections/${slug}`, 
          price: parseFloat(collection.floor_price) * 0.98,
          buyUrl: `https://gamma.io/ordinals/collections/${slug}?listed=true&sort=price-asc`,
          sellUrl: `https://gamma.io/ordinals/collections/${slug}?action=sell`
        }
      ];

      return collection;
    });

    // Ordenar por volume
    collections.sort((a: any, b: any) => b.volume_24h - a.volume_24h);

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching ordinals collections:', error);

    // Dados de marketplaces para coleções populares
    const COLLECTION_MARKETPLACES = {
      'Ordinal Maxi Biz': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'Taproot Wizards': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'Quantum Cats': ['magiceden.io', 'gamma.io'],
      'Bitcoin Frogs': ['magiceden.io', 'gamma.io', 'ordswap.io'],
      'Ordinal Punks': ['magiceden.io', 'gamma.io']
    };

    // Dados de fallback em caso de erro
    const fallbackCollections = [
      {
        name: "Ordinal Maxi Biz (OMB)",
        slug: "ordinal-maxi-biz",
        description: "Ordinal Maxi Biz is a collection of 10,000 unique Bitcoin Ordinals",
        twitter_link: "https://twitter.com/OrdinalMaxiBiz",
        discord_link: "https://discord.gg/ordinalmaxibiz",
        website_link: "https://ordinalmaxibiz.com",
        item_count: 10000,
        volume_24h: 125.5,
        floor_price: 0.0325,
        market_cap: 325000,
        marketplaces: COLLECTION_MARKETPLACES['Ordinal Maxi Biz'].map(marketplace => ({
          name: marketplace,
          url: `https://${marketplace}/ordinals/collection/ordinal-maxi-biz`
        })),
        links: {
          buy: `https://${COLLECTION_MARKETPLACES['Ordinal Maxi Biz'][0]}/ordinals/collection/ordinal-maxi-biz`,
          info: `https://ordiscan.com/collection/ordinal-maxi-biz`
        },
        exchanges: [
          { 
            name: "Magic Eden", 
            url: "https://magiceden.io/ordinals/collection/ordinal-maxi-biz", 
            price: 0.0332,
            buyUrl: "https://magiceden.io/ordinals/collection/ordinal-maxi-biz?listed=true&sort=price-asc",
            sellUrl: "https://magiceden.io/ordinals/collection/ordinal-maxi-biz?action=sell"
          },
          { 
            name: "Gamma.io", 
            url: "https://gamma.io/ordinals/collections/ordinal-maxi-biz", 
            price: 0.0319,
            buyUrl: "https://gamma.io/ordinals/collections/ordinal-maxi-biz?listed=true&sort=price-asc",
            sellUrl: "https://gamma.io/ordinals/collections/ordinal-maxi-biz?action=sell"
          }
        ]
      },
      {
        name: "Taproot Wizards (TW)",
        slug: "taproot-wizards",
        description: "Magic internet jpegs",
        twitter_link: "https://twitter.com/TaprootWizards",
        discord_link: "https://discord.gg/taprootwizards",
        website_link: "https://taprootwizards.com",
        item_count: 2121,
        volume_24h: 98.3,
        floor_price: 0.85,
        market_cap: 1802850,
        marketplaces: COLLECTION_MARKETPLACES['Taproot Wizards'].map(marketplace => ({
          name: marketplace,
          url: `https://${marketplace}/ordinals/collection/taproot-wizards`
        })),
        links: {
          buy: `https://${COLLECTION_MARKETPLACES['Taproot Wizards'][0]}/ordinals/collection/taproot-wizards`,
          info: `https://ordiscan.com/collection/taproot-wizards`
        },
        exchanges: [
          { 
            name: "Magic Eden", 
            url: "https://magiceden.io/ordinals/collection/taproot-wizards", 
            price: 0.867,
            buyUrl: "https://magiceden.io/ordinals/collection/taproot-wizards?listed=true&sort=price-asc",
            sellUrl: "https://magiceden.io/ordinals/collection/taproot-wizards?action=sell"
          },
          { 
            name: "Gamma.io", 
            url: "https://gamma.io/ordinals/collections/taproot-wizards", 
            price: 0.833,
            buyUrl: "https://gamma.io/ordinals/collections/taproot-wizards?listed=true&sort=price-asc",
            sellUrl: "https://gamma.io/ordinals/collections/taproot-wizards?action=sell"
          }
        ]
      },
      {
        name: "Quantum Cats (QC)",
        slug: "quantum-cats",
        description: "Quantum Cats is a collection of 10,000 unique Bitcoin Ordinals",
        twitter_link: "https://twitter.com/QuantumCats",
        discord_link: "https://discord.gg/quantumcats",
        website_link: "https://quantumcats.io",
        item_count: 10000,
        volume_24h: 75.2,
        floor_price: 0.0215,
        market_cap: 215000,
        marketplaces: COLLECTION_MARKETPLACES['Quantum Cats'].map(marketplace => ({
          name: marketplace,
          url: `https://${marketplace}/ordinals/collection/quantum-cats`
        })),
        links: {
          buy: `https://${COLLECTION_MARKETPLACES['Quantum Cats'][0]}/ordinals/collection/quantum-cats`,
          info: `https://ordiscan.com/collection/quantum-cats`
        },
        exchanges: [
          { 
            name: "Magic Eden", 
            url: "https://magiceden.io/ordinals/collection/quantum-cats", 
            price: 0.0219,
            buyUrl: "https://magiceden.io/ordinals/collection/quantum-cats?listed=true&sort=price-asc",
            sellUrl: "https://magiceden.io/ordinals/collection/quantum-cats?action=sell"
          },
          { 
            name: "Gamma.io", 
            url: "https://gamma.io/ordinals/collections/quantum-cats", 
            price: 0.0211,
            buyUrl: "https://gamma.io/ordinals/collections/quantum-cats?listed=true&sort=price-asc",
            sellUrl: "https://gamma.io/ordinals/collections/quantum-cats?action=sell"
          }
        ]
      },
      {
        name: "Bitcoin Frogs",
        slug: "bitcoin-frogs",
        description: "10,000 generative frogs on Bitcoin minted by the Lightning Network",
        twitter_link: "https://twitter.com/BitcoinFrogs",
        discord_link: "https://discord.gg/bitcoinfrogs",
        website_link: "https://bitcoinfrogs.com",
        item_count: 10000,
        volume_24h: 62.8,
        floor_price: 0.0185,
        market_cap: 185000,
        marketplaces: COLLECTION_MARKETPLACES['Bitcoin Frogs'].map(marketplace => ({
          name: marketplace,
          url: `https://${marketplace}/ordinals/collection/bitcoin-frogs`
        })),
        links: {
          buy: `https://${COLLECTION_MARKETPLACES['Bitcoin Frogs'][0]}/ordinals/collection/bitcoin-frogs`,
          info: `https://ordiscan.com/collection/bitcoin-frogs`
        },
        exchanges: [
          { 
            name: "Magic Eden", 
            url: "https://magiceden.io/ordinals/collection/bitcoin-frogs", 
            price: 0.0189,
            buyUrl: "https://magiceden.io/ordinals/collection/bitcoin-frogs?listed=true&sort=price-asc",
            sellUrl: "https://magiceden.io/ordinals/collection/bitcoin-frogs?action=sell"
          },
          { 
            name: "Gamma.io", 
            url: "https://gamma.io/ordinals/collections/bitcoin-frogs", 
            price: 0.0181,
            buyUrl: "https://gamma.io/ordinals/collections/bitcoin-frogs?listed=true&sort=price-asc",
            sellUrl: "https://gamma.io/ordinals/collections/bitcoin-frogs?action=sell"
          }
        ]
      },
      {
        name: "Ordinal Punks",
        slug: "ordinal-punks",
        description: "100 unique punks on Bitcoin",
        twitter_link: "https://twitter.com/OrdinalPunks",
        discord_link: "https://discord.gg/ordinalpunks",
        website_link: "https://ordinalpunks.com",
        item_count: 100,
        volume_24h: 45.6,
        floor_price: 2.5,
        market_cap: 250000,
        marketplaces: COLLECTION_MARKETPLACES['Ordinal Punks'].map(marketplace => ({
          name: marketplace,
          url: `https://${marketplace}/ordinals/collection/ordinal-punks`
        })),
        links: {
          buy: `https://${COLLECTION_MARKETPLACES['Ordinal Punks'][0]}/ordinals/collection/ordinal-punks`,
          info: `https://ordiscan.com/collection/ordinal-punks`
        },
        exchanges: [
          { 
            name: "Magic Eden", 
            url: "https://magiceden.io/ordinals/collection/ordinal-punks", 
            price: 2.55,
            buyUrl: "https://magiceden.io/ordinals/collection/ordinal-punks?listed=true&sort=price-asc",
            sellUrl: "https://magiceden.io/ordinals/collection/ordinal-punks?action=sell"
          },
          { 
            name: "Gamma.io", 
            url: "https://gamma.io/ordinals/collections/ordinal-punks", 
            price: 2.45,
            buyUrl: "https://gamma.io/ordinals/collections/ordinal-punks?listed=true&sort=price-asc",
            sellUrl: "https://gamma.io/ordinals/collections/ordinal-punks?action=sell"
          }
        ]
      }
    ];

    return NextResponse.json(fallbackCollections);
  }
}
